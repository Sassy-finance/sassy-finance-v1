/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../../common";
import type {
  PluginUUPSUpgradeableV2Mock,
  PluginUUPSUpgradeableV2MockInterface,
} from "../../../../contracts/test/PluginUUPSUpgradeableV1Mock.sol/PluginUUPSUpgradeableV2Mock";

const _abi = [
  {
    inputs: [
      {
        internalType: "address",
        name: "dao",
        type: "address",
      },
      {
        internalType: "address",
        name: "where",
        type: "address",
      },
      {
        internalType: "address",
        name: "who",
        type: "address",
      },
      {
        internalType: "bytes32",
        name: "permissionId",
        type: "bytes32",
      },
    ],
    name: "DaoUnauthorized",
    type: "error",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "address",
        name: "previousAdmin",
        type: "address",
      },
      {
        indexed: false,
        internalType: "address",
        name: "newAdmin",
        type: "address",
      },
    ],
    name: "AdminChanged",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "beacon",
        type: "address",
      },
    ],
    name: "BeaconUpgraded",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: false,
        internalType: "uint8",
        name: "version",
        type: "uint8",
      },
    ],
    name: "Initialized",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "implementation",
        type: "address",
      },
    ],
    name: "Upgraded",
    type: "event",
  },
  {
    inputs: [],
    name: "UPGRADE_PLUGIN_PERMISSION_ID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "dao",
    outputs: [
      {
        internalType: "contract IDAO",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "implementation",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "contract IDAO",
        name: "_dao",
        type: "address",
      },
    ],
    name: "initialize",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "initializeV1toV2",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "pluginType",
    outputs: [
      {
        internalType: "enum IPlugin.PluginType",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [],
    name: "proxiableUUID",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "state1",
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
    inputs: [],
    name: "state2",
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
        internalType: "bytes4",
        name: "_interfaceId",
        type: "bytes4",
      },
    ],
    name: "supportsInterface",
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
        name: "newImplementation",
        type: "address",
      },
    ],
    name: "upgradeTo",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newImplementation",
        type: "address",
      },
      {
        internalType: "bytes",
        name: "data",
        type: "bytes",
      },
    ],
    name: "upgradeToAndCall",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
] as const;

const _bytecode =
  "0x60a06040523060805234801561001457600080fd5b5061001d610022565b6100e2565b600054610100900460ff161561008e5760405162461bcd60e51b815260206004820152602760248201527f496e697469616c697a61626c653a20636f6e747261637420697320696e697469604482015266616c697a696e6760c81b606482015260840160405180910390fd5b60005460ff90811610156100e0576000805460ff191660ff9081179091556040519081527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15b565b6080516112fd61011960003960008181610342015281816103dd015281816104e40152818161057a015261067501526112fd6000f3fe6080604052600436106100c75760003560e01c80635c60da1b11610074578063c9c4bfca1161004e578063c9c4bfca146101f3578063e27e9a4e14610227578063efe51cca1461023c57600080fd5b80635c60da1b146101a75780636accab8c146101bc578063c4d66de8146101d357600080fd5b806341de6830116100a557806341de6830146101555780634f1ef2861461017157806352d1902d1461018457600080fd5b806301ffc9a7146100cc5780633659cfe6146101015780634162169f14610123575b600080fd5b3480156100d857600080fd5b506100ec6100e7366004610ff6565b610253565b60405190151581526020015b60405180910390f35b34801561010d57600080fd5b5061012161011c36600461104d565b610338565b005b34801561012f57600080fd5b5060c9546001600160a01b03165b6040516001600160a01b0390911681526020016100f8565b34801561016157600080fd5b5060006040516100f8919061106a565b61012161017f3660046110da565b6104da565b34801561019057600080fd5b50610199610668565b6040519081526020016100f8565b3480156101b357600080fd5b5061013d61072d565b3480156101c857600080fd5b5061019961012d5481565b3480156101df57600080fd5b506101216101ee36600461104d565b610765565b3480156101ff57600080fd5b506101997f821b6e3a557148015a918c89e5d092e878a69854a2d1a410635f771bd5a8a3f581565b34801561023357600080fd5b50610121610867565b34801561024857600080fd5b5061019961012e5481565b60007fffffffff0000000000000000000000000000000000000000000000000000000082167f41de68300000000000000000000000000000000000000000000000000000000014806102e657507fffffffff0000000000000000000000000000000000000000000000000000000082167f52d1902d00000000000000000000000000000000000000000000000000000000145b8061033257507f01ffc9a7000000000000000000000000000000000000000000000000000000007fffffffff000000000000000000000000000000000000000000000000000000008316145b92915050565b6001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001630036103db5760405162461bcd60e51b815260206004820152602c60248201527f46756e6374696f6e206d7573742062652063616c6c6564207468726f7567682060448201527f64656c656761746563616c6c000000000000000000000000000000000000000060648201526084015b60405180910390fd5b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166104367f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546001600160a01b031690565b6001600160a01b0316146104b25760405162461bcd60e51b815260206004820152602c60248201527f46756e6374696f6e206d7573742062652063616c6c6564207468726f7567682060448201527f6163746976652070726f7879000000000000000000000000000000000000000060648201526084016103d2565b6104bb81610953565b604080516000808252602082019092526104d791839190610990565b50565b6001600160a01b037f00000000000000000000000000000000000000000000000000000000000000001630036105785760405162461bcd60e51b815260206004820152602c60248201527f46756e6374696f6e206d7573742062652063616c6c6564207468726f7567682060448201527f64656c656761746563616c6c000000000000000000000000000000000000000060648201526084016103d2565b7f00000000000000000000000000000000000000000000000000000000000000006001600160a01b03166105d37f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546001600160a01b031690565b6001600160a01b03161461064f5760405162461bcd60e51b815260206004820152602c60248201527f46756e6374696f6e206d7573742062652063616c6c6564207468726f7567682060448201527f6163746976652070726f7879000000000000000000000000000000000000000060648201526084016103d2565b61065882610953565b61066482826001610990565b5050565b6000306001600160a01b037f000000000000000000000000000000000000000000000000000000000000000016146107085760405162461bcd60e51b815260206004820152603860248201527f555550535570677261646561626c653a206d757374206e6f742062652063616c60448201527f6c6564207468726f7567682064656c656761746563616c6c000000000000000060648201526084016103d2565b507f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc90565b60006107607f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc546001600160a01b031690565b905090565b600054600290610100900460ff16158015610787575060005460ff8083169116105b6107f95760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201527f647920696e697469616c697a656400000000000000000000000000000000000060648201526084016103d2565b6000805461ffff191660ff83161761010017905561081682610b35565b600161012d55600261012e556000805461ff001916905560405160ff821681527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a15050565b600054600290610100900460ff16158015610889575060005460ff8083169116105b6108fb5760405162461bcd60e51b815260206004820152602e60248201527f496e697469616c697a61626c653a20636f6e747261637420697320616c72656160448201527f647920696e697469616c697a656400000000000000000000000000000000000060648201526084016103d2565b60008054600261012e5561ffff191660ff83169081176101001761ff0019169091556040519081527f7f26b83ff96e1f2b6a682f133852f6798a09c465da95921460cefb38474024989060200160405180910390a150565b60c9547f821b6e3a557148015a918c89e5d092e878a69854a2d1a410635f771bd5a8a3f590610664906001600160a01b0316303384600036610bbb565b7f4910fdfa16fed3260ed0e7147f7cc6da11a60208b5b9406d12a635614ffd91435460ff16156109c8576109c383610ca9565b505050565b826001600160a01b03166352d1902d6040518163ffffffff1660e01b8152600401602060405180830381865afa925050508015610a22575060408051601f3d908101601f19168201909252610a1f9181019061119e565b60015b610a945760405162461bcd60e51b815260206004820152602e60248201527f45524331393637557067726164653a206e657720696d706c656d656e7461746960448201527f6f6e206973206e6f74205555505300000000000000000000000000000000000060648201526084016103d2565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc8114610b295760405162461bcd60e51b815260206004820152602960248201527f45524331393637557067726164653a20756e737570706f727465642070726f7860448201527f6961626c6555554944000000000000000000000000000000000000000000000060648201526084016103d2565b506109c3838383610d7f565b600054610100900460ff16610bb25760405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201527f6e697469616c697a696e6700000000000000000000000000000000000000000060648201526084016103d2565b6104d781610daa565b6040517ffdef91060000000000000000000000000000000000000000000000000000000081526001600160a01b0387169063fdef910690610c0890889088908890889088906004016111b7565b602060405180830381865afa158015610c25573d6000803e3d6000fd5b505050506040513d601f19601f82011682018060405250810190610c49919061120b565b610ca1576040517f32dbe3b40000000000000000000000000000000000000000000000000000000081526001600160a01b038088166004830152808716602483015285166044820152606481018490526084016103d2565b505050505050565b6001600160a01b0381163b610d265760405162461bcd60e51b815260206004820152602d60248201527f455243313936373a206e657720696d706c656d656e746174696f6e206973206e60448201527f6f74206120636f6e74726163740000000000000000000000000000000000000060648201526084016103d2565b7f360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc80547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b610d8883610e61565b600082511180610d955750805b156109c357610da48383610ea1565b50505050565b600054610100900460ff16610e275760405162461bcd60e51b815260206004820152602b60248201527f496e697469616c697a61626c653a20636f6e7472616374206973206e6f74206960448201527f6e697469616c697a696e6700000000000000000000000000000000000000000060648201526084016103d2565b60c980547fffffffffffffffffffffffff0000000000000000000000000000000000000000166001600160a01b0392909216919091179055565b610e6a81610ca9565b6040516001600160a01b038216907fbc7cd75a20ee27fd9adebab32041f755214dbc6bffa90cc0225b39da2e5c2d3b90600090a250565b60606001600160a01b0383163b610f205760405162461bcd60e51b815260206004820152602660248201527f416464726573733a2064656c65676174652063616c6c20746f206e6f6e2d636f60448201527f6e7472616374000000000000000000000000000000000000000000000000000060648201526084016103d2565b600080846001600160a01b031684604051610f3b9190611251565b600060405180830381855af49150503d8060008114610f76576040519150601f19603f3d011682016040523d82523d6000602084013e610f7b565b606091505b5091509150610fa382826040518060600160405280602781526020016112a160279139610fac565b95945050505050565b60608315610fbb575081610fc5565b610fc58383610fcc565b9392505050565b815115610fdc5781518083602001fd5b8060405162461bcd60e51b81526004016103d2919061126d565b60006020828403121561100857600080fd5b81357fffffffff0000000000000000000000000000000000000000000000000000000081168114610fc557600080fd5b6001600160a01b03811681146104d757600080fd5b60006020828403121561105f57600080fd5b8135610fc581611038565b60208101600383106110a5577f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b91905290565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052604160045260246000fd5b600080604083850312156110ed57600080fd5b82356110f881611038565b9150602083013567ffffffffffffffff8082111561111557600080fd5b818501915085601f83011261112957600080fd5b81358181111561113b5761113b6110ab565b604051601f8201601f19908116603f01168101908382118183101715611163576111636110ab565b8160405282815288602084870101111561117c57600080fd5b8260208601602083013760006020848301015280955050505050509250929050565b6000602082840312156111b057600080fd5b5051919050565b60006001600160a01b03808816835280871660208401525084604083015260806060830152826080830152828460a0840137600060a0848401015260a0601f19601f85011683010190509695505050505050565b60006020828403121561121d57600080fd5b81518015158114610fc557600080fd5b60005b83811015611248578181015183820152602001611230565b50506000910152565b6000825161126381846020870161122d565b9190910192915050565b602081526000825180602084015261128c81604085016020870161122d565b601f01601f1916919091016040019291505056fe416464726573733a206c6f772d6c6576656c2064656c65676174652063616c6c206661696c6564a26469706673582212200a7fef3dfb076caaa3a91e901691dc252df70c09189fe024f23567ea9af60d7864736f6c63430008110033";

type PluginUUPSUpgradeableV2MockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PluginUUPSUpgradeableV2MockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PluginUUPSUpgradeableV2Mock__factory extends ContractFactory {
  constructor(...args: PluginUUPSUpgradeableV2MockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<PluginUUPSUpgradeableV2Mock> {
    return super.deploy(
      overrides || {}
    ) as Promise<PluginUUPSUpgradeableV2Mock>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PluginUUPSUpgradeableV2Mock {
    return super.attach(address) as PluginUUPSUpgradeableV2Mock;
  }
  override connect(signer: Signer): PluginUUPSUpgradeableV2Mock__factory {
    return super.connect(signer) as PluginUUPSUpgradeableV2Mock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PluginUUPSUpgradeableV2MockInterface {
    return new utils.Interface(_abi) as PluginUUPSUpgradeableV2MockInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): PluginUUPSUpgradeableV2Mock {
    return new Contract(
      address,
      _abi,
      signerOrProvider
    ) as PluginUUPSUpgradeableV2Mock;
  }
}