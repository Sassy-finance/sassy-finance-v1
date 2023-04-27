import { keccak256 } from 'ethers/lib/utils';
import { defaultAbiCoder } from "@ethersproject/abi";
import { ethers } from "hardhat";
import {
    Context
} from "@aragon/sdk-client";
import { Signer } from 'ethers';
import { IPFS_KEY, IPFS_URL, NETWORK, GRAPH_NODES_URL } from './config';


export function hashHelpers(helpers: string[]) {
    return keccak256(defaultAbiCoder.encode(['address[]'], [helpers]));
}

export async function getTime(): Promise<number> {
    return (await ethers.provider.getBlock('latest')).timestamp;
}

export function createContext(signer: Signer): Context {
    return new Context({
        network: NETWORK,
        signer: signer,
        web3Providers: ethers.provider,
        ipfsNodes: [
            {
                url: IPFS_URL,
                headers: { "X-API-KEY": IPFS_KEY }
            },
        ],
        graphqlNodes: [
            {
                url: GRAPH_NODES_URL
            }
        ]
    })
}