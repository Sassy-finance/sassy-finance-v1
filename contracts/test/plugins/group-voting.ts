import { expect } from "chai";
import { ethers } from 'hardhat';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';
import { deployNewDAO } from "../utils/dao"
import { getMergedABI } from '../utils/abi';
import { deployWithProxy } from '../utils/proxy';
import { shouldUpgradeCorrectly } from '../utils/uups-upgradeable';
import { UPGRADE_PERMISSIONS } from '../utils/permissions';
import { OZ_ERRORS } from '../utils/error';
import { GroupVoting__factory } from '../../typechain-types/factories/contracts/plugins/GroupVotingPlugin/GroupVoting__factory'
import {
    Client, TokenType, WithdrawParams
} from "@aragon/sdk-client";
import {
    pctToRatio,
    getTime,
    VotingMode,
    ONE_HOUR,
    VoteOption,
    advanceIntoVoteTime,
    voteWithSigners,
    advanceAfterVoteEnd
} from '../utils/voting';

import {
    hexToBytes,
  } from "@aragon/sdk-common";

import { createContext } from "../../scripts/helpers";


describe('Group voting plugin', function () {
    let signers: SignerWithAddress[];
    let dao: any;
    let ownerAddress: string;
    let groupVotingFactoryBytecode: any;
    let mergedAbi: any;
    let votingSettings: any;
    let voting: any;
    let startDate: number;
    const startOffset = 10;
    let dummyActions: any;
    let dummyMetadata: string;
    let mockToken: any;
    let endDate: any;
    const id = 0;
    const withdrawAmount = 1000000


    before(async () => {
        signers = await ethers.getSigners();
        ownerAddress = await signers[0].getAddress();

        ({ abi: mergedAbi, bytecode: groupVotingFactoryBytecode } = await getMergedABI(
            // @ts-ignore
            hre,
            'GroupVoting',
            ['DAO']
        ));

        dao = await deployNewDAO(ownerAddress);

        const MockToken = await ethers.getContractFactory("MockToken");
        mockToken = await MockToken.deploy("Test Token", "TESTUSD", 100000000);

        dummyActions = [
            {
                to: signers[0].address,
                data: '0x00000000',
                value: 0,
            },
        ];
        dummyMetadata = ethers.utils.hexlify(
            ethers.utils.toUtf8Bytes('0x123456789')
        );
    });

    beforeEach(async function () {
        votingSettings = {
            votingMode: VotingMode.EarlyExecution,
            supportThreshold: pctToRatio(50),
            minParticipation: pctToRatio(20),
            minDuration: ONE_HOUR,
            minProposerVotingPower: 0,
        };

        const GrouplistVotingFactory = new ethers.ContractFactory(
            mergedAbi,
            groupVotingFactoryBytecode,
            signers[0]
        );

        voting = await deployWithProxy(GrouplistVotingFactory);

        startDate = (await getTime()) + startOffset;
        endDate = startDate + votingSettings.minDuration;

        await dao.grant(
            dao.address,
            voting.address,
            ethers.utils.id('EXECUTE_PERMISSION')
        );
        await dao.grant(
            voting.address,
            signers[0].address,
            ethers.utils.id('UPDATE_ADDRESSES_PERMISSION')
        );

        await dao.grant(
            voting.address,
            signers[0].address,
            ethers.utils.id('CREATE_GROUP_PERMISSION')
        );

        this.upgrade = {
            contract: voting,
            dao: dao,
            user: signers[8],
        };
    });

    describe('Upgrade', () => {
        beforeEach(async function () {
            this.upgrade = {
                contract: voting,
                dao: dao,
                user: signers[8],
            };
            await voting.initialize(dao.address, votingSettings);
        });

        shouldUpgradeCorrectly(
            UPGRADE_PERMISSIONS.UPGRADE_PLUGIN_PERMISSION_ID,
            'DaoUnauthorized'
        );
    });

    describe('initialize: ', async () => {
        it('reverts if trying to re-initialize', async () => {
            await voting.initialize(dao.address, votingSettings);

            await expect(
                voting.initialize(dao.address, votingSettings)
            ).to.be.revertedWith(OZ_ERRORS.ALREADY_INITIALIZED);
        });
    });

    describe('Group members: ', async () => {
        beforeEach(async () => {
            await voting.initialize(dao.address, votingSettings);
            await voting.createGroup(
                "NFT collectors",
                [],
                mockToken.address,
                0
            )
        });

        it('should return false, if user is not listed', async () => {
            const block1 = await ethers.provider.getBlock('latest');
            await ethers.provider.send('evm_mine', []);
            expect(await voting.isListedAtBlock(signers[0].address, 0, block1.number)).to
                .be.false;
        });

        it('should add new users in the group list and emit the `MembersAdded` event', async () => {
            const addresses = [signers[0].address, signers[1].address];
            await expect(voting.addAddresses(addresses, 0))
                .to.emit(voting, 'MembersAdded')
                .withArgs(addresses);

            const block = await ethers.provider.getBlock('latest');
            await ethers.provider.send('evm_mine', []);

            expect(await voting.isListedAtBlock(signers[0].address, 0, block.number)).to
                .be.true;
        });

        it('should remove users from the address list and emit the `MembersRemoved` event', async () => {
            await voting.addAddresses([signers[0].address], 0);

            const block1 = await ethers.provider.getBlock('latest');
            await ethers.provider.send('evm_mine', []);
            expect(await voting.isListedAtBlock(signers[0].address, 0, block1.number)).to
                .be.true;

            await expect(voting.removeAddresses([signers[0].address], 0))
                .to.emit(voting, 'MembersRemoved')
                .withArgs([signers[0].address]);

            const block2 = await ethers.provider.getBlock('latest');
            await ethers.provider.send('evm_mine', []);
            expect(await voting.isListedAtBlock(signers[0].address, 0, block2.number)).to
                .be.false;
        });

        it('Should deposit assets in vault on group creation', async () => {

            const allowedAddressNFT = await signers[0].getAddress()
            const initialAmount = 1000000
            await mockToken.transfer(voting.address, initialAmount)

            await voting.createGroup(
                "ERC20 Traders",
                [allowedAddressNFT],
                mockToken.address,
                initialAmount
            )

            const vault = await voting.getGroupVault(1)
            const vaultBalance = await mockToken.balanceOf(vault)

            expect(vaultBalance).to.be.equal(initialAmount)

        });
    });


    describe('Proposal creation', async () => {
        it('reverts if the user is not allowed to create a proposal', async () => {
            votingSettings.minProposerVotingPower = 1;

            await voting.initialize(
                dao.address,
                votingSettings,
            );

            const allowedAddressNFT = await signers[0].getAddress()
            const allowedAddressToken = await signers[1].getAddress()

            await voting.createGroup(
                "NFT collectors",
                [allowedAddressNFT],
                mockToken.address,
                0
            )
            await voting.createGroup(
                "Token collectors",
                [allowedAddressToken],
                mockToken.address,
                0
            )

            await expect(
                voting
                    .connect(signers[1])
                    .createProposal(dummyMetadata, [], 0, 0, 0, VoteOption.None, false, 0)
            )
                .to.be.revertedWithCustomError(voting, 'ProposalCreationForbidden')
                .withArgs(signers[1].address);

            await expect(
                voting
                    .connect(signers[0])
                    .createProposal(dummyMetadata, [], 0, 0, 0, VoteOption.None, false, 1)
            )
                .to.be.revertedWithCustomError(voting, 'ProposalCreationForbidden')
                .withArgs(signers[0].address);

            await expect(
                voting
                    .connect(signers[0])
                    .createProposal(dummyMetadata, [], 0, 0, 0, VoteOption.None, false, 0)
            ).not.to.be.reverted;

            await expect(
                voting
                    .connect(signers[1])
                    .createProposal(dummyMetadata, [], 0, 0, 0, VoteOption.None, false, 1)
            ).not.to.be.reverted;
        });


        it('should create a proposal successfully, but not vote', async () => {
            await voting.initialize(
                dao.address,
                votingSettings
            );

            const allowedAddressNFT = await signers[0].getAddress()

            await voting.createGroup(
                "NFT collectors",
                [allowedAddressNFT],
                mockToken.address,
                0
            )

            const allowFailureMap = 1;

            let tx = await voting.createProposal(
                dummyMetadata,
                dummyActions,
                allowFailureMap,
                0,
                0,
                VoteOption.None,
                false,
                0
            );

            await expect(tx)
                .to.emit(voting, 'ProposalCreated')
                .to.not.emit(voting, 'VoteCast');

            const block = await ethers.provider.getBlock('latest');

            const proposal = await voting.getProposal(0);
            expect(proposal.open).to.be.true;
            expect(proposal.executed).to.be.false;
            expect(proposal.allowFailureMap).to.equal(allowFailureMap);
            expect(proposal.parameters.snapshotBlock).to.equal(block.number - 1);
            expect(proposal.parameters.supportThreshold).to.equal(
                votingSettings.supportThreshold
            );
            expect(proposal.parameters.minVotingPower).to.equal(
                (await voting.totalVotingPower(proposal.parameters.snapshotBlock))
                    .mul(votingSettings.minParticipation)
                    .div(pctToRatio(100))
            );
            expect(
                proposal.parameters.startDate.add(votingSettings.minDuration)
            ).to.equal(proposal.parameters.endDate);

            expect(proposal.tally.yes).to.equal(0);
            expect(proposal.tally.no).to.equal(0);

            expect(await voting.canVote(0, signers[0].address, VoteOption.Yes)).to.be
                .true;
            expect(await voting.canVote(0, signers[10].address, VoteOption.Yes)).to
                .be.false;
            expect(await voting.canVote(1, signers[0].address, VoteOption.Yes)).to.be
                .false;

            expect(proposal.actions.length).to.equal(1);
            expect(proposal.actions[0].to).to.equal(dummyActions[0].to);
            expect(proposal.actions[0].value).to.equal(dummyActions[0].value);
            expect(proposal.actions[0].data).to.equal(dummyActions[0].data);
        });


        it('should create a proposal successfully, and vote', async () => {

            await voting.initialize(
                dao.address,
                votingSettings
            );

            const allowedAddressNFT = await signers[0].getAddress()
            const allowedAddressToken = await signers[1].getAddress()

            await voting.createGroup(
                "NFT collectors",
                [allowedAddressNFT],
                mockToken.address,
                0
            )
            await voting.createGroup(
                "Token collectors",
                [allowedAddressToken],
                mockToken.address,
                0
            )


            let txNFT = await voting.createProposal(
                dummyMetadata,
                dummyActions,
                0,
                0,
                0,
                VoteOption.Yes,
                false,
                0
            );

            await expect(txNFT)
                .to.emit(voting, 'ProposalCreated')
                .to.emit(voting, 'VoteCast');

            await expect(voting.connect(signers[1]).vote(0, VoteOption.Yes, false))
                .to.be.revertedWithCustomError(voting, 'VoteCastForbidden')

            let txToken = await voting.connect(signers[1]).createProposal(
                dummyMetadata,
                dummyActions,
                0,
                0,
                0,
                VoteOption.Yes,
                false,
                1
            );

            await expect(txToken)
                .to.emit(voting, 'ProposalCreated')
                .to.emit(voting, 'VoteCast');

            await expect(voting.connect(signers[0]).vote(1, VoteOption.Yes, false))
                .to.be.revertedWithCustomError(voting, 'VoteCastForbidden')

        })

        it('should create a proposal successfully, vote and execute', async () => {

            await voting.initialize(
                dao.address,
                votingSettings
            );

            const allowedAddressNFT = await signers[0].getAddress()

            const client: Client = new Client(createContext(signers[0]));

            const withdrawParams: WithdrawParams = {
                amount: BigInt(withdrawAmount),
                recipientAddressOrEns: voting.address,
                tokenAddress: mockToken.address,
                type: TokenType.ERC20
            }

            const withdrawAction = await client.encoding.withdrawAction(
                withdrawParams
            )

            const votingInterface = GroupVoting__factory.createInterface();

            const hexBytes = votingInterface.encodeFunctionData(
                "createGroup",
                [
                    "NFT collectors",
                    [allowedAddressNFT],
                    mockToken.address,
                    withdrawAmount
                ],
            );

            const createGroupAction =  {
                to: voting.address,
                value: BigInt(0),
                data: hexToBytes(hexBytes),
            }

            const balanceBefore = await mockToken.balanceOf(voting.address)
            await mockToken.transfer(dao.address, withdrawAmount)

            expect(
                (
                    await voting.createProposal(
                        dummyMetadata,
                        [
                            withdrawAction,
                            createGroupAction
                        ],
                        0,
                        startDate,
                        endDate,
                        VoteOption.None,
                        false,
                        0
                    )
                ).value
            ).to.equal(id);
        });

        await advanceIntoVoteTime(startDate, endDate);

        await voteWithSigners(voting, id, signers, {
            yes: [0, 1, 2], // 3 votes
            no: [3, 4], // 2 votes
            abstain: [5, 6], // 2 votes
        });

        await advanceAfterVoteEnd(endDate);
        expect(await voting.canExecute(id)).to.be.true;
        await voting.execute(id)

        const balanceAfter = await mockToken.balanceOf(voting.address)

        expect(Number(balanceBefore)).to.be.equals(0)
        expect(Number(balanceAfter)).to.be.equals(withdrawAmount)

    })


    describe('Funds managemenet', async () => {
        it('Shoul allow only members to withdraw', async () => {
            votingSettings.minProposerVotingPower = 1;

            await voting.initialize(
                dao.address,
                votingSettings,
            );

            const allowedAddress = await signers[0].getAddress()
            const destinationAddress = await signers[2].getAddress()

            await voting.createGroup(
                "NFT collectors",
                [allowedAddress],
                mockToken.address,
                0
            )

            const groupVaultAddress = await voting.getGroupVault(0)

            await mockToken.transfer(groupVaultAddress, 1000000)

            await dao.grant(
                groupVaultAddress,
                voting.address,
                ethers.utils.id('WITHDRAW_ERC20_PERMISSION')
            );

            await dao.grant(
                groupVaultAddress,
                signers[0].address,
                ethers.utils.id('WITHDRAW_ERC20_PERMISSION')
            );

            await expect(
                voting
                    .connect(signers[1])
                    .withdrawERC20(mockToken.address, 100, destinationAddress, 0)
            )
                .to.be.revertedWith('Not a group member')

            await voting
                .connect(signers[0])
                .withdrawERC20(mockToken.address, 100, destinationAddress, 0)

            expect(
                await mockToken.balanceOf(destinationAddress)
            ).to.be.equals(100)

        });
    })
})