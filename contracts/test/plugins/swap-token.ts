import { expect } from "chai";
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { deployNewDAO } from "../utils/dao"
import { getMergedABI } from '../utils/abi';
import { deployWithProxy } from '../utils/proxy';
import { shouldUpgradeCorrectly } from '../utils/uups-upgradeable';
import { UPGRADE_PERMISSIONS } from '../utils/permissions';
import { OZ_ERRORS } from '../utils/error';


describe('Swap tokens plugin', function () {
    let signers: SignerWithAddress[];
    let dao: any;
    let ownerAddress: string;
    let swapTokenFactoryBytecode: any;
    let mergedAbi: any;
    let swapToken: any;
    let impersonatedSigner: SignerWithAddress;
    const UNISWAP_ROUTER_ADDRESS: string = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
    const WMATIC_ADDRESS: string = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'
    const WETHER_ADDRESS: string = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'

    before(async () => {
        signers = await ethers.getSigners();
        ownerAddress = await signers[0].getAddress();
        impersonatedSigner = await ethers.getImpersonatedSigner(process.env.IMPERSONATE_SIGNER || "");

        ({ abi: mergedAbi, bytecode: swapTokenFactoryBytecode } = await getMergedABI(
            // @ts-ignore
            hre,
            'SwapToken',
            ['DAO']
        ));

        dao = await deployNewDAO(ownerAddress);
    });

    beforeEach(async function () {
        const SwapTokenFactory = new ethers.ContractFactory(
            mergedAbi,
            swapTokenFactoryBytecode,
            signers[0]
        );

        swapToken = await deployWithProxy(SwapTokenFactory);

        await dao.grant(
            dao.address,
            swapToken.address,
            ethers.utils.id('EXECUTE_PERMISSION')
        );

        await dao.grant(
            swapToken.address,
            signers[1].address,
            ethers.utils.id('SWAP_TOKENS_PERMISSION')
        );

        await dao.grant(
            swapToken.address,
            signers[1].address,
            ethers.utils.id('WITHDRAW_PERMISSION')
        );

        this.upgrade = {
            contract: swapToken,
            dao: dao,
            user: signers[8],
        };
    });

    describe('Upgrade', () => {
        beforeEach(async function () {
            this.upgrade = {
                contract: swapToken,
                dao: dao,
                user: signers[8],
            };
            await swapToken.initialize(dao.address, UNISWAP_ROUTER_ADDRESS);
        });

        shouldUpgradeCorrectly(
            UPGRADE_PERMISSIONS.UPGRADE_PLUGIN_PERMISSION_ID,
            'DaoUnauthorized'
        );
    });

    describe('initialize: ', async () => {
        it('reverts if trying to re-initialize', async () => {
            await swapToken.initialize(dao.address, UNISWAP_ROUTER_ADDRESS);

            await expect(
                swapToken.initialize(dao.address, UNISWAP_ROUTER_ADDRESS)
            ).to.be.revertedWith(OZ_ERRORS.ALREADY_INITIALIZED);
        });
    });


    describe('Swap tokens: ', async () => {
        it('reverts if user is not authorize', async () => {

            await swapToken.initialize(dao.address, UNISWAP_ROUTER_ADDRESS);

            await expect(
                swapToken.connect(signers[8]).swapTokens(
                    WMATIC_ADDRESS,
                    ethers.utils.parseEther('0.5'),
                    WETHER_ADDRESS,
                    signers[8].address)
            ).to.be.revertedWithCustomError(swapToken, 'DaoUnauthorized')
        });

        it('Allowed user should do a swap', async () => {
            await swapToken.initialize(dao.address, UNISWAP_ROUTER_ADDRESS);

            const ERC20 = await ethers.getContractFactory("ERC20");

            const wmatic = ERC20.attach(WMATIC_ADDRESS)
            const wether = ERC20.attach(WETHER_ADDRESS)

            await wmatic.connect(impersonatedSigner).transfer(
                swapToken.address, ethers.utils.parseEther('0.5')
            )

            const balanceBefore = await wether.balanceOf(signers[1].address)

            await swapToken.connect(signers[1]).swapTokens(
                WMATIC_ADDRESS,
                ethers.utils.parseEther('0.5'),
                WETHER_ADDRESS,
                signers[1].address)

            const balanceAfter = await wether.balanceOf(signers[1].address)

            expect(balanceBefore.toNumber()).to.be.equals(0)
            expect(balanceAfter.toNumber()).to.be.greaterThan(0)

        });


        it('Allowed user should do a swap from treasury assets', async () => {
            await swapToken.initialize(dao.address, UNISWAP_ROUTER_ADDRESS);

            const ERC20 = await ethers.getContractFactory("ERC20");

            const wmatic = ERC20.attach(WMATIC_ADDRESS)
            const wether = ERC20.attach(WETHER_ADDRESS)

            await wmatic.connect(impersonatedSigner).transfer(
                dao.address, ethers.utils.parseEther('0.5')
            )

            await swapToken.connect(signers[1]).withdrawFromTreasury(
                WMATIC_ADDRESS,
                ethers.utils.parseEther('0.5')
            )

            const balanceBefore = await wether.balanceOf(dao.address)

            await swapToken.connect(signers[1]).swapTokens(
                WMATIC_ADDRESS,
                ethers.utils.parseEther('0.5'),
                WETHER_ADDRESS,
                dao.address)

            const balanceAfter = await wether.balanceOf(dao.address)

            expect(balanceBefore.toNumber()).to.be.equals(0)
            expect(balanceAfter.toNumber()).to.be.greaterThan(0)

        });

    });

});