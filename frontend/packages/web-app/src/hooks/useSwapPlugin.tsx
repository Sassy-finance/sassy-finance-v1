import { useEffect, useState } from 'react';
import { useSigner } from 'context/signer';
import { ethers, Contract } from 'ethers'

import { abi } from 'abis/groupPluginABI'
import { erc20TokenABI } from 'abis/erc20TokenABI'
import { TransactionState } from 'utils/constants';


export interface IUseGroupPlugin {
  currentStep: number;
  handleSwap: () => void;
  handleApproval: () => void;
  state: TransactionState
}


export const useSwapPlugin = (vaultAddress: string): IUseGroupPlugin => {
  const pluginAddress = '0x4451b68aA935DBA54Fa98Ba618456d41F2915F3f'

  const {
    provider: signerProvider,
  } = useSigner();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const [state, setTransactionState] = useState<TransactionState>(TransactionState.WAITING)


  const handleSwap = () => {

  }

  const handleApproval = () => {
    
  }



  // Update balance
  useEffect(() => {
    if (signerProvider) {
      try {
        const pluginContract = new ethers.Contract(
          pluginAddress,
          abi,
          signerProvider);

        const vault = new ethers.Contract(
          vaultAddress,
          erc20TokenABI,
          signerProvider);

      } catch (error) {
        console.log(error)
      }
    }

  }, [signerProvider]);

  return {
    currentStep,
    handleSwap,
    handleApproval,
    state
  };
};
