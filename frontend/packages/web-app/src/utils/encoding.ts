import { DaoAction } from '@aragon/sdk-client';
import {GroupVoting__factory} from '../../typings/factories/contracts/plugins/GroupVotingPlugin'
import {
  hexToBytes,
} from "@aragon/sdk-common";

export const encodeCreateGroupAction = async (
  groupName: string,
  addresses: string[],
  tokenAddress: string,
  withdrawAmount: number,
  pluginAddresses: string,
  decimals: number
): Promise<DaoAction> => {
  const votingInterface = GroupVoting__factory.createInterface();

  console.log({
    groupName,
    addresses,
    tokenAddress,
    withdrawAmount,
    pluginAddresses
  })

  console.log(withdrawAmount * 10 ** decimals)

  const hexBytes = votingInterface.encodeFunctionData(
    "createGroup",
    [
      groupName,
      addresses,
      tokenAddress,
      withdrawAmount * 10 ** decimals
    ],
  );

  return {
    to: pluginAddresses,
    value: BigInt(0),
    data: hexToBytes(hexBytes),
  }
}
