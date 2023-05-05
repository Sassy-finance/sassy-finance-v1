import { expect } from "chai";
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { deployNewDAO } from "../utils/dao"
import { getMergedABI } from '../utils/abi';
import { deployWithProxy } from '../utils/proxy';
import { shouldUpgradeCorrectly } from '../utils/uups-upgradeable';
import { UPGRADE_PERMISSIONS } from '../utils/permissions';
import { OZ_ERRORS } from '../utils/error';
import { getOrderData } from "../utils/api";


describe('NFT Collector plugin', function () {
    let signers: SignerWithAddress[];
    let dao: any;
    let ownerAddress: string;
    let nftCollectorFactoryBytecode: any;
    let mergedAbi: any;
    let nftCollector: any;
    let impersonatedSigner: SignerWithAddress;
    const SEAPORT_ADDRESS: string = '0x00000000000000adc04c56bf30ac9d3c0aaf14dc';
    const ORDER_HASH: string = '0x90f1fe34c22a87647883ed428b5eb737dd6122b8f00e586c23cf10ba08d21052'
    const CHAIN: string = 'mumbai'
    const PROTOCOL_ADDRESS: string = '0x00000000000000adc04c56bf30ac9d3c0aaf14dc'


    before(async () => {
        signers = await ethers.getSigners();
        ownerAddress = await signers[0].getAddress();
        impersonatedSigner = await ethers.getImpersonatedSigner(process.env.IMPERSONATE_SIGNER || "");

        ({ abi: mergedAbi, bytecode: nftCollectorFactoryBytecode } = await getMergedABI(
            // @ts-ignore
            hre,
            'NFTCollector',
            ['DAO']
        ));

        dao = await deployNewDAO(ownerAddress);
    });

    beforeEach(async function () {
        const NFTCollectorFactory = new ethers.ContractFactory(
            mergedAbi,
            nftCollectorFactoryBytecode,
            signers[0]
        );

        nftCollector = await deployWithProxy(NFTCollectorFactory);

        await dao.grant(
            dao.address,
            nftCollector.address,
            ethers.utils.id('EXECUTE_PERMISSION')
        );

        await dao.grant(
            nftCollector.address,
            signers[1].address,
            ethers.utils.id('NFT_COLLECTOR_PERMISSION')
        );

        this.upgrade = {
            contract: nftCollector,
            dao: dao,
            user: signers[8],
        };
    });

    describe('Upgrade', () => {
        beforeEach(async function () {
            this.upgrade = {
                contract: nftCollector,
                dao: dao,
                user: signers[8],
            };
            await nftCollector.initialize(dao.address, SEAPORT_ADDRESS);
        });

        shouldUpgradeCorrectly(
            UPGRADE_PERMISSIONS.UPGRADE_PLUGIN_PERMISSION_ID,
            'DaoUnauthorized'
        );
    });

    describe('initialize: ', async () => {
        it('reverts if trying to re-initialize', async () => {
            await nftCollector.initialize(dao.address, SEAPORT_ADDRESS);

            await expect(
                nftCollector.initialize(dao.address, SEAPORT_ADDRESS)
            ).to.be.revertedWith(OZ_ERRORS.ALREADY_INITIALIZED);
        });
    });


    describe('Buy NFTs: ', async () => {
        it('reverts if user is not authorize', async () => {

            await nftCollector.initialize(dao.address, SEAPORT_ADDRESS);

            const orderData = await getOrderData(
                ORDER_HASH,
                CHAIN,
                PROTOCOL_ADDRESS,
                nftCollector.address
            )

            const {
                considerationToken,
                considerationIdentifier,
                considerationAmount,
                offerer,
                zone,
                offerToken,
                offerIdentifier,
                offerAmount,
                basicOrderType,
                startTime,
                endTime,
                zoneHash,
                salt,
                offererConduitKey,
                fulfillerConduitKey,
                totalOriginalAdditionalRecipients,
                additionalRecipients,
                signature
            } =  orderData.fulfillment_data.transaction.input_data.parameters

            const orderParams = {
                considerationToken,
                considerationIdentifier,
                considerationAmount,
                offerer,
                zone,
                offerToken,
                offerIdentifier,
                offerAmount,
                basicOrderType,
                startTime,
                endTime,
                zoneHash,
                salt,
                offererConduitKey,
                fulfillerConduitKey,
                totalOriginalAdditionalRecipients,
                additionalRecipients,
                signature
            }

            await nftCollector.fulfillBasicOrder(
                orderParams,
                ethers.utils.parseEther("1"),
                { value: ethers.utils.parseEther("1") }
            )

        });

        it('Allowed user should buy a NFT', async () => {
            await nftCollector.initialize(dao.address, SEAPORT_ADDRESS);
        });

    });

});