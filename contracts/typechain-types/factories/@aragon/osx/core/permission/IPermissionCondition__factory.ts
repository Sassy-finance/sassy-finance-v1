/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */

import { Contract, Signer, utils } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type {
  IPermissionCondition,
  IPermissionConditionInterface,
} from "../../../../../@aragon/osx/core/permission/IPermissionCondition";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "_where",
        type: "address",
      },
      {
        internalType: "address",
        name: "_who",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "_permissionId",
        type: "bytes32",
      },
      {
        internalType: "bytes",
        name: "_data",
        type: "bytes",
      },
    ],
    name: "isGranted",
    outputs: [
      {
        internalType: "bool",
        name: "allowed",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
] as const;

export class IPermissionCondition__factory {
  static readonly abi = _abi;
  static createInterface(): IPermissionConditionInterface {
    return new utils.Interface(_abi) as IPermissionConditionInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): IPermissionCondition {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as IPermissionCondition;
  }
}