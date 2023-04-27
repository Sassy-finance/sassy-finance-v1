import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

import {GroupVotingSetup} from '../../typechain-types';
import { deployNewDAO } from "../utils/dao"
import {
  VotingSettings,
  VotingMode,
  pctToRatio,
  ONE_HOUR,
} from '../utils/voting';
import metadata from '../../contracts/plugins/GroupVotingPlugin/build-metadata.json';

let defaultData: any;
let defaultVotingSettings: VotingSettings;
let defaultMembers: string[];

const abiCoder = ethers.utils.defaultAbiCoder;

describe('GroupVotingSetup', function () {
  let signers: SignerWithAddress[];
  let grouptVotingSetup: GroupVotingSetup;
  let implementationAddress: string;
  let targetDao: any;

  before(async () => {
    signers = await ethers.getSigners();
    targetDao = await deployNewDAO(signers[0].address);

    defaultVotingSettings = {
      votingMode: VotingMode.EarlyExecution,
      supportThreshold: pctToRatio(50),
      minParticipation: pctToRatio(20),
      minDuration: ONE_HOUR,
      minProposerVotingPower: 0,
    };

    const GroupVotingSetup = await ethers.getContractFactory(
      'GroupVotingSetup'
    );
    grouptVotingSetup = await GroupVotingSetup.deploy();

    implementationAddress = await grouptVotingSetup.implementation();

    defaultData = abiCoder.encode(metadata.pluginSetupABI.prepareInstallation, [
      Object.values(defaultVotingSettings)
    ]);
  });


  describe('prepareInstallation', async () => {
    it('fails if data is empty, or not of minimum length', async () => {
      await expect(
        grouptVotingSetup.prepareInstallation(
          targetDao.address,
          defaultData
        )
      ).not.to.be.reverted;
    });

    it('correctly returns plugin, helpers and permissions', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        grouptVotingSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: grouptVotingSetup.address,
        nonce,
      });

      const {
        plugin,
        preparedSetupData: {helpers, permissions},
      } = await grouptVotingSetup.callStatic.prepareInstallation(
        targetDao.address,
        defaultData
      );

      expect(plugin).to.be.equal(anticipatedPluginAddress);
      expect(helpers.length).to.be.equal(0);
      expect(permissions.length).to.be.equal(4);
    });

    it('correctly sets up the plugin', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        grouptVotingSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: grouptVotingSetup.address,
        nonce,
      });

      await grouptVotingSetup.prepareInstallation(
        targetDao.address,
        defaultData
      );

      const factory = await ethers.getContractFactory('GroupVoting');
      const groupVotingContract = factory.attach(
        anticipatedPluginAddress
      );

      expect(await groupVotingContract.dao()).to.be.equal(
        targetDao.address
      );
      expect(await groupVotingContract.minParticipation()).to.be.equal(
        defaultVotingSettings.minParticipation
      );
      expect(await groupVotingContract.supportThreshold()).to.be.equal(
        defaultVotingSettings.supportThreshold
      );

      expect(await groupVotingContract.minDuration()).to.be.equal(
        defaultVotingSettings.minDuration
      );
      expect(
        await groupVotingContract.minProposerVotingPower()
      ).to.be.equal(defaultVotingSettings.minProposerVotingPower);

      await ethers.provider.send('evm_mine', []);
    });
  });
});