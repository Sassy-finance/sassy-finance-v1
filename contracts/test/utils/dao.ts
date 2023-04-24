import { ethers } from "hardhat";
import {deployWithProxy} from "./proxy"
export const daoExampleURI = 'https://example.com';

export async function deployNewDAO(ownerAddress: string): Promise<unknown> {
    const DAO = await ethers.getContractFactory('DAO');
    let dao = await deployWithProxy(DAO);
  
    await dao.initialize(
      '0x00',
      ownerAddress,
      ethers.constants.AddressZero,
      daoExampleURI
    );
  
    return dao;
  }