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


  try {
    const tx = await  tokenPluginContract.execute(20);
    const receipt = await tx.wait();
    console.log(receipt);
  } catch (error) {
    if (error.code === 'TRANSACTION_REVERTED') {
      console.error(`Transaction reverted with reason: ${error.receipt.transactionRevertReason}`);
    } else {
      console.error(error);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});


