import { ethers } from "hardhat";
import { TOKEN_VOTING_PLUGIN_ABI } from "./abis"
import { TOKEN_PLUGIN_ADDRESS } from "./config";

async function main() {

  const signers = await ethers.getSigners();

  const TokenPlugin = new ethers.Contract(
    TOKEN_PLUGIN_ADDRESS,
    TOKEN_VOTING_PLUGIN_ABI.abi,
    signers[0]
  )

  const tokenPluginContract = TokenPlugin.attach(TOKEN_PLUGIN_ADDRESS)
  await tokenPluginContract.execute(9);

}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


