import { ethers } from "hardhat";
import metadata from '../contracts/plugins/GroupVotingPlugin/build-metadata.json';
import { pluginSetupProcessorABI } from './abis'
import { DAO_ADDRESS, PLUGIN_SETUP_PROCESSOR_ADDRESS } from "./config";
import {
  pctToRatio,
  VotingMode,
  ONE_HOUR,
} from '../test/utils/voting';
const abiCoder = ethers.utils.defaultAbiCoder;

async function main() {

  const PLUGIN_REPO_ADDRESS = '0xb6c8528a695375a3cd65be41bf07e8346d46615f'

  const defaultVotingSettings = {
    votingMode: VotingMode.EarlyExecution,
    supportThreshold: pctToRatio(50),
    minParticipation: pctToRatio(20),
    minDuration: ONE_HOUR,
    minProposerVotingPower: 0,
  };

  const data = abiCoder.encode(metadata.pluginSetupABI.prepareInstallation, [
    Object.values(defaultVotingSettings)
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


//Prepare installation tx 0x886acbc87e63eee806bad50922f1204ab54a382fcd0225944a21c9d52ad8c604