import { ethers } from "hardhat";
import metadata from '../contracts/plugins/SwapTokenPlugin/build-metadata.json'
import { pluginSetupProcessorABI } from './abis'
import { DAO_ADDRESS, PLUGIN_SETUP_PROCESSOR_ADDRESS } from "./config";
const abiCoder = ethers.utils.defaultAbiCoder;

async function main() {

  const PLUGIN_REPO_ADDRESS = '0x8230232087928e56b7d8bb86ff00e729cf28c8af'
  const UNISWAP_ROUTER_ADDRESS: string = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

  const data = abiCoder.encode(metadata.pluginSetupABI.prepareInstallation, [
    UNISWAP_ROUTER_ADDRESS
  ]);

  const signers = await ethers.getSigners();

  const PluginSetupProcessor = new ethers.Contract(
    PLUGIN_SETUP_PROCESSOR_ADDRESS,
    pluginSetupProcessorABI,
    signers[0]
  )
  const pluginSetupProcessor = PluginSetupProcessor.attach(PLUGIN_SETUP_PROCESSOR_ADDRESS)

  const tx = await pluginSetupProcessor.prepareInstallation(
    DAO_ADDRESS,
    {
      pluginSetupRef: {
        pluginSetupRepo: PLUGIN_REPO_ADDRESS,
        versionTag: {
          release: 1,
          build: 1,
        },
      },
      data: data,
    });

  console.log(
    `Prepare installating tx ${tx.hash}`
  );
  await tx.wait();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


//Prepare installation tx 0xa81ccc1f290edb1373c635a9d7b64e2c33c74c7aa6e518f1a227e623817c0799