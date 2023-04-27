import { ethers } from "hardhat";

async function main() {

    // { plugin: '0x71808a731cEe30F4bF4B0B46E55d0545f6df40E2' }
    // { pluginSetupRepo: '0x8230232087928E56b7d8Bb86fF00E729Cf28c8aF' }


    const SwapToken = await ethers.getContractFactory("SwapToken");
    const swapToken = SwapToken.attach('0x71808a731cEe30F4bF4B0B46E55d0545f6df40E2')

    const DAO_ADDRESS = '0x81f8acd5d8b5b0ec5ebc0615b60e3b5e40b8a662'
    const WMATIC_ADDRESS: string = '0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889'
    const WETHER_ADDRESS: string = '0xA6FA4fB5f76172d178d61B04b0ecd319C5d1C0aa'

    const txSwap = await swapToken.swapTokens(
        WMATIC_ADDRESS,
        ethers.utils.parseEther('0.5'),
        WETHER_ADDRESS,
        DAO_ADDRESS)

    await txSwap.wait()

}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});


