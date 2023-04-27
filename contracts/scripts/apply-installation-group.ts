import { ethers } from "hardhat";
import { pluginSetupProcessorABI, TOKEN_VOTING_PLUGIN_ABI } from "./abis"
import {
  ApplyInstallationParams,
  Client,
  DaoAction
} from "@aragon/sdk-client";

import {
  DAO_ADDRESS,
  ONE_DAY,
  PLUGIN_SETUP_PROCESSOR_ADDRESS,
  START_OFFSET,
  TOKEN_PLUGIN_ADDRESS
} from "./config"
import { createContext, getTime } from "./helpers";

async function main() {

  const signers = await ethers.getSigners();

  const PluginSetupProcessor = new ethers.Contract(
    PLUGIN_SETUP_PROCESSOR_ADDRESS,
    pluginSetupProcessorABI,
    signers[0]
  )

  const TokenPlugin = new ethers.Contract(
    TOKEN_PLUGIN_ADDRESS,
    TOKEN_VOTING_PLUGIN_ABI.abi,
    signers[0]
  )

  const prepareTx = "0x886acbc87e63eee806bad50922f1204ab54a382fcd0225944a21c9d52ad8c604"
  const txApply = await ethers.provider.getTransactionReceipt(prepareTx)
  const logs = txApply.logs
    .filter(log => log.address == PLUGIN_SETUP_PROCESSOR_ADDRESS)
    .map((log) => PluginSetupProcessor.interface.parseLog(log))

  const permissions = logs[0].args.preparedSetupData.permissions
  const plugin = logs[0].args.plugin
  const pluginSetupRepo = logs[0].args.pluginSetupRepo

  console.log(plugin)
  console.log(pluginSetupRepo)

  const client: Client = new Client(createContext(signers[0]));
  const metadata = ethers.utils.toUtf8Bytes("ipfs://bafybeihm5uheiqbxpawvk2arucmymipj74jyxtsodzykwnp4keoylsymiu");

  const applyInstallationParams: ApplyInstallationParams = {
    helpers: [],
    permissions: permissions,
    versionTag: {
      build: 1,
      release: 1,
    },
    pluginRepo: pluginSetupRepo,
    pluginAddress: plugin,
  };

  const grantPluginSetup = client.encoding.grantAction(
    DAO_ADDRESS,
    {
      where: DAO_ADDRESS,
      who: PLUGIN_SETUP_PROCESSOR_ADDRESS,
      permission: "ROOT_PERMISSION"
    })

  const applyInstallationAction: DaoAction = client.encoding.applyInstallationAction(
    DAO_ADDRESS,
    applyInstallationParams
  );

  const fixedApplyInstallationAction: DaoAction = {
    ...applyInstallationAction,
    to: PLUGIN_SETUP_PROCESSOR_ADDRESS
  }

  const tokenPluginContract = TokenPlugin.attach(TOKEN_PLUGIN_ADDRESS)

  const startDate = (await getTime()) + START_OFFSET;
  const endDate = startDate + ONE_DAY;

  const tx = await tokenPluginContract.createProposal(
    metadata,
    [
      grantPluginSetup,
      fixedApplyInstallationAction
    ],
    0,
    startDate,
    endDate,
    0,
    true
  );

  tx.wait()
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


