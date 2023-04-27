import {expect} from 'chai';
import {ethers} from 'hardhat';
import {SignerWithAddress} from '@nomiclabs/hardhat-ethers/signers';

import {GroupVotingSetup} from '../../typechain-types';
import { deployNewDAO } from "../utils/dao"
import metadata from '../../contracts/plugins/SwapTokenPlugin/build-metadata.json';

let defaultData: any;
const UNISWAP_ROUTER_ADDRESS: string = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

const abiCoder = ethers.utils.defaultAbiCoder;

describe('SwapTokenSetup', function () {
  let signers: SignerWithAddress[];
  let swapTokenSetup: GroupVotingSetup;
  let targetDao: any;
  let implementationAddress: any

  before(async () => {
    signers = await ethers.getSigners();
    targetDao = await deployNewDAO(signers[0].address);

    const SwapTokenSetup = await ethers.getContractFactory(
      'SwapTokenSetup'
    );
    swapTokenSetup = await SwapTokenSetup.deploy();

    implementationAddress = await swapTokenSetup.implementation();

    defaultData = abiCoder.encode(metadata.pluginSetupABI.prepareInstallation, [
      UNISWAP_ROUTER_ADDRESS
    ]);
  });


  describe('prepareInstallation', async () => {
    it('fails if data is empty, or not of minimum length', async () => {
      await expect(
        swapTokenSetup.prepareInstallation(
          targetDao.address,
          defaultData
        )
      ).not.to.be.reverted;
    });

    it('correctly returns plugin, helpers and permissions', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        swapTokenSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: swapTokenSetup.address,
        nonce,
      });

      const {
        plugin,
        preparedSetupData: {helpers, permissions},
      } = await swapTokenSetup.callStatic.prepareInstallation(
        targetDao.address,
        defaultData
      );

      expect(plugin).to.be.equal(anticipatedPluginAddress);
      expect(helpers.length).to.be.equal(0);
      expect(permissions.length).to.be.equal(4);
    });

    it('correctly sets up the plugin', async () => {
      const nonce = await ethers.provider.getTransactionCount(
        swapTokenSetup.address
      );
      const anticipatedPluginAddress = ethers.utils.getContractAddress({
        from: swapTokenSetup.address,
        nonce,
      });

      await swapTokenSetup.prepareInstallation(
        targetDao.address,
        defaultData
      );

      const factory = await ethers.getContractFactory('SwapToken');
      const swapVotingContract = factory.attach(
        anticipatedPluginAddress
      );

      expect(await swapVotingContract.dao()).to.be.equal(
        targetDao.address
      );
      expect(await swapVotingContract.swapRouter()).to.be.equal(
        UNISWAP_ROUTER_ADDRESS
      );
    });
  });
});