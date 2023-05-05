import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

import {GroupVotingSetup} from '../../typechain-types';
import { deployNewDAO } from "../utils/dao"
import metadata from '../../contracts/plugins/SwapTokenPlugin/build-metadata.json';

let defaultData: any;
const SEAPORT_ADDRESS: string = '0x00000000000001ad428e4906aE43D8F9852d0dD6';

const abiCoder = ethers.utils.defaultAbiCoder;

describe('NFTCollectorSetup', function () {
  let signers: SignerWithAddress[];
  let nftCollectorSetup: GroupVotingSetup;
  let targetDao: any;
  let implementationAddress: any

  before(async () => {
    signers = await ethers.getSigners();
    targetDao = await deployNewDAO(signers[0].address);

    const NFTCollectorSetup = await ethers.getContractFactory(
      'NFTCollectorSetup'
    );
    nftCollectorSetup = await NFTCollectorSetup.deploy();

    implementationAddress = await nftCollectorSetup.implementation();

    defaultData = abiCoder.encode(metadata.pluginSetupABI.prepareInstallation, [
      SEAPORT_ADDRESS
    ]);
  });


  describe('prepareInstallation', async () => {
    it('fails if data is empty, or not of minimum length', async () => {
      await expect(
        nftCollectorSetup.prepareInstallation(
          targetDao.address,
          defaultData
        )
      ).not.to.be.reverted;
    });

    it('correctly returns plugin, helpers and permissions', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        nftCollectorSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: nftCollectorSetup.address,
        nonce,
      });

      const {
        plugin,
        preparedSetupData: {helpers, permissions},
      } = await nftCollectorSetup.callStatic.prepareInstallation(
        targetDao.address,
        defaultData
      );

      expect(plugin).to.be.equal(anticipatedPluginAddress);
      expect(helpers.length).to.be.equal(0);
      expect(permissions.length).to.be.equal(4);
    });

    it('correctly sets up the plugin', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        nftCollectorSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: nftCollectorSetup.address,
        nonce,
      });

      await nftCollectorSetup.prepareInstallation(
        targetDao.address,
        defaultData
      );

      const factory = await ethers.getContractFactory('NFTCollector');
      const nftCollectorContract = factory.attach(
        anticipatedPluginAddress
      );

      expect(await nftCollectorContract.dao()).to.be.equal(
        targetDao.address
      );
      expect(await nftCollectorContract.seaport()).to.be.equal(
        SEAPORT_ADDRESS
      );
    });
  });
});