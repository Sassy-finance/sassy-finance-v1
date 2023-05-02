import { useEffect, useState } from 'react';
import { useSigner } from 'context/signer';
import { ethers, Contract } from 'ethers'

import { abi } from 'abis/groupPluginABI'
import { erc20TokenABI } from 'abis/erc20TokenABI'


export interface IUseGroupPlugin {
  groups: any | null;
}


export const useGroupPlugin = (): IUseGroupPlugin => {
  const pluginAddress = '0xB231162ab49971EB44bfC8245b1Bf68ad6e333dF'
  const tokenAddress = '0xe9DcE89B076BA6107Bb64EF30678efec11939234'

  const {
    provider: signerProvider,
  } = useSigner();
  const [groups, setGroups] = useState<any | null>(null);


  const loadGroups = async (pluginContract: Contract, tokenContract: Contract) => {

    const counter = (await pluginContract._groupIdCounter()).toNumber()
    let groups = []

    for (let i = 0; i < counter; i++) {
      const name = await pluginContract.groupsNames(i)
      const vault = await pluginContract.groupVault(i)
      const balance = (await tokenContract.balanceOf(vault)).toNumber() / 10 ** 6
      groups.push({ name, vault, balance })
    }

    setGroups(groups)
  }

  // Update balance
  useEffect(() => {
    if (signerProvider) {
      try {
        const pluginContract = new ethers.Contract(
          pluginAddress,
          abi,
          signerProvider);

        const tokenContract = new ethers.Contract(
          tokenAddress,
          erc20TokenABI,
          signerProvider);

        loadGroups(pluginContract, tokenContract)

      } catch (error) {
        console.log(error)
      }
    }

  }, [signerProvider]);

  return {
    groups
  };
};
