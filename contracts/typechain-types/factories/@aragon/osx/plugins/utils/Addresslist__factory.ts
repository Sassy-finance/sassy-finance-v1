/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  Addresslist,
  AddresslistInterface,
} from "../../../../../@aragon/osx/plugins/utils/Addresslist";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "member",
        type: "address",
      },
    ],
    name: "InvalidAddresslistUpdate",
    type: "error",
  },
  {
    inputs: [],
    name: "addresslistLength",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "_blockNumber",
        type: "uint256",
      },
    ],
    name: "addresslistLengthAtBlock",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
    ],
    name: "isListed",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "_account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "_blockNumber",
        type: "uint256",
      },
    ],
    name: "isListedAtBlock",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class Addresslist__factory {
  static readonly abi = _abi;
  static createInterface(): AddresslistInterface {
    return new utils.Interface(_abi) as AddresslistInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): Addresslist {
    return new Contract(address, _abi, signerOrProvider) as Addresslist;
  }
}