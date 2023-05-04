import { ethers } from "hardhat";

async function main() {

    const SwapToken = await ethers.getContractFactory("SwapToken");
    const swapToken = SwapToken.attach('0x50CD6d2efe83E821E3a832199647A31cBB0B5Aa3')

    const WMATIC_ADDRESS: string = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'
    const WETHER_ADDRESS: string = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'
    const VAULT_ADDRESS: string = '0x3aaAe3C60F5a8DBD2C38E82C78958a46075F6830'

    const txSwap = await swapToken.swapTokens(
        WMATIC_ADDRESS,
        ethers.utils.parseEther('0.5'),
        WETHER_ADDRESS,
        VAULT_ADDRESS)

    await txSwap.wait()

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


