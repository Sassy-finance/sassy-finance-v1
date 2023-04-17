import {
  DaoDepositSteps,
  DepositParams,
  TokenType,
  TransferType,
  UpdateAllowanceParams,
} from '@aragon/sdk-client';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {useFormContext} from 'react-hook-form';
import {generatePath, useNavigate, useParams} from 'react-router-dom';

import {useReactiveVar} from '@apollo/client';
import DepositModal from 'containers/transactionModals/DepositModal';
import {BigNumber, constants} from 'ethers';
import {useClient} from 'hooks/useClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useStepper} from 'hooks/useStepper';
import {useWallet} from 'hooks/useWallet';
import {DepositFormData} from 'pages/newDeposit';
import {trackEvent} from 'services/analytics';
import {
  CHAIN_METADATA,
  MAX_TOKEN_DECIMALS,
  PENDING_DEPOSITS_KEY,
  TransactionState,
} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {Finance} from 'utils/paths';
import {isNativeToken} from 'utils/tokens';
import {pendingDeposits} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';

interface IDepositContextType {
  handleOpenModal: () => void;
}

const DepositContext = createContext<IDepositContextType | null>(null);

const DepositProvider = ({children}: {children: ReactNode}) => {
  const {dao} = useParams();
  const navigate = useNavigate();
  const {network} = useNetwork();
  const {isOnWrongNetwork, provider} = useWallet();

  const [showModal, setShowModal] = useState<boolean>(false);
  const {open, close, isNetworkOpen} = useGlobalModalContext();
  const [includeApproval, setIncludeApproval] = useState<boolean>(true);

  const {getValues} = useFormContext<DepositFormData>();
  const [depositState, setDepositState] = useState<TransactionState>();
  const [depositParams, setDepositParams] = useState<DepositParams>();
  const pendingDepositsTxs = useReactiveVar(pendingDeposits);

  const {client} = useClient();
  const {setStep: setModalStep, currentStep} = useStepper(2);

  const [tokenSymbol, tokenDecimals] = getValues([
    'tokenSymbol',
    'tokenDecimals',
  ]);

  const shouldPoll = useMemo(
    () =>
      depositParams !== undefined && depositState === TransactionState.WAITING,
    [depositParams, depositState]
  );

  const depositIterator = useMemo(() => {
    if (client && depositParams) return client.methods.deposit(depositParams);
  }, [client, depositParams]);

  const estimateDepositFees = useCallback(async () => {
    if (client && depositParams) {
      if (currentStep === 2 || depositParams.type === 'native') {
        return client?.estimation.deposit(depositParams as DepositParams);
      } else
        return client?.estimation.updateAllowance(
          depositParams as UpdateAllowanceParams
        );
    }
  }, [client, currentStep, depositParams]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateDepositFees, shouldPoll);

  const handleOpenModal = useCallback(async () => {
    // get deposit data from form
    const {amount, tokenAddress, to, tokenDecimals} = getValues();
    const tokenAmount = BigInt(
      Number(amount) * Math.pow(10, tokenDecimals || MAX_TOKEN_DECIMALS)
    );

    // validate and set deposit data
    if (!to) {
      setDepositState(TransactionState.ERROR);
      return;
    }

    setDepositParams(
      tokenAddress === constants.AddressZero
        ? {
            type: TokenType.NATIVE,
            daoAddressOrEns: to,
            amount: tokenAmount,
          }
        : {
            type: TokenType.ERC20,
            tokenAddress,
            daoAddressOrEns: to,
            amount: tokenAmount,
          }
    );

    // determine whether to include approval step and show modal
    if (isNativeToken(tokenAddress)) {
      setIncludeApproval(false);
      setModalStep(2);
    } else {
      /**
       * This method will return a generator to iterate the allowance process,
       * According to the current deposit context, I defined this to get
       * user allowance before showing the modal and skip the allowance if needed,
       * It might not be perfect and needs some refactors later but for now will
       * solve the token allowance history issue completely
       */
      const allowanceSteps = client?.methods.updateAllowance({
        daoAddressOrEns: to,
        amount: tokenAmount,
        tokenAddress,
      });

      if (allowanceSteps) {
        for await (const step of allowanceSteps) {
          try {
            switch (step.key) {
              case DaoDepositSteps.CHECKED_ALLOWANCE:
                if (BigNumber.from(step.allowance).lt(tokenAmount)) {
                  setIncludeApproval(true);
                  setModalStep(1);
                } else {
                  setIncludeApproval(false);
                  setModalStep(2);
                }
                break;
            }
            break;
          } catch (error) {
            console.log(error);
          }
        }
      }
    }

    setDepositState(TransactionState.WAITING);
    setShowModal(true);
  }, [client?.methods, getValues, setModalStep]);

  // Handler for modal close; don't close modal if transaction is still running
  const handleCloseModal = useCallback(() => {
    switch (depositState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(generatePath(Finance, {network, dao}), {
          state: {refetch: true},
        });
        break;
      default: {
        setShowModal(false);
        stopPolling();
        setDepositState(TransactionState.WAITING);
      }
    }
  }, [dao, depositState, navigate, network, stopPolling]);

  /*************************************************
   *               Lifecycle hooks                 *
   *************************************************/
  useEffect(() => {
    // resolve network mismatch when transaction is
    // ready to execute or loading. Why user would change
    // network while loading is anyone's guess really.
    // Also, should probably extract into a hook for other flows
    if (
      isOnWrongNetwork &&
      (depositState === TransactionState.WAITING ||
        depositState === TransactionState.LOADING)
    ) {
      open('network');
      handleCloseModal();
      return;
    }

    // close switch network modal and continue with flow
    if (!isOnWrongNetwork && isNetworkOpen) {
      close('network');
      handleOpenModal();
    }
  }, [
    close,
    depositState,
    handleCloseModal,
    handleOpenModal,
    isNetworkOpen,
    isOnWrongNetwork,
    open,
  ]);

  const handleApproval = async () => {
    // Check if SDK initialized properly
    if (!client) {
      throw new Error('SDK client is not initialized correctly');
    }

    // Check if deposit function is initialized
    if (!depositIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      setDepositState(TransactionState.LOADING);

      // run approval steps
      for (let step = 0; step < 3; step++) {
        await depositIterator.next();
      }

      // update modal button and transaction state
      setModalStep(2);
      setDepositState(TransactionState.WAITING);
    } catch (error) {
      console.error(error);
      setDepositState(TransactionState.ERROR);
    }
  };

  const handleDeposit = async () => {
    const {
      from,
      reference,
      tokenAddress,
      tokenName,
      tokenSymbol,
      tokenDecimals,
    } = getValues();

    let transactionHash = '';

    // Check if SDK initialized properly
    if (!client) {
      throw new Error('SDK client is not initialized correctly');
    }

    // Check if deposit function is initialized
    if (!depositIterator) {
      throw new Error('deposit function is not initialized correctly');
    }

    try {
      setDepositState(TransactionState.LOADING);

      for await (const step of depositIterator) {
        if (step.key === DaoDepositSteps.DEPOSITING) {
          transactionHash = step.txHash;
          const depositTxs = [
            ...pendingDepositsTxs,
            isNativeToken(tokenAddress)
              ? {
                  transactionId: transactionHash,
                  from,
                  amount: depositParams?.amount,
                  reference,
                  type: TransferType.DEPOSIT,
                  tokenType: 'native',
                  address: tokenAddress,
                  name: tokenName,
                  symbol: tokenSymbol,
                  decimals:
                    CHAIN_METADATA[network].nativeCurrency.decimals.toString(),
                }
              : {
                  transactionId: transactionHash,
                  from,
                  amount: depositParams?.amount,
                  reference,
                  type: TransferType.DEPOSIT,
                  tokenType: 'erc20',
                  token: {
                    name: tokenName,
                    address: tokenAddress,
                    symbol: tokenSymbol,
                    decimals: tokenDecimals,
                  },
                },
          ];

          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          pendingDeposits(depositTxs);
          localStorage.setItem(
            PENDING_DEPOSITS_KEY,
            JSON.stringify(depositTxs, customJSONReplacer)
          );
          trackEvent('newDeposit_transaction_signed', {
            network,
            wallet_provider: provider?.connection.url,
          });
        }
      }

      setDepositState(TransactionState.SUCCESS);
      console.log(transactionHash);
      trackEvent('newDeposit_transaction_success', {
        network,
        wallet_provider: provider?.connection.url,
      });
    } catch (error) {
      console.error(error);
      setDepositState(TransactionState.ERROR);
      trackEvent('newDeposit_transaction_failed', {
        network,
        error,
        wallet_provider: provider?.connection.url,
      });
    }
  };

  /*************************************************
   *                   Render                      *
   *************************************************/
  return (
    <DepositContext.Provider value={{handleOpenModal}}>
      {children}
      <DepositModal
        {...{
          currentStep,
          includeApproval,
          handleDeposit,
          handleApproval,
          maxFee,
          averageFee,
          tokenDecimals,
          tokenSymbol,
          handleOpenModal,
        }}
        state={depositState || TransactionState.WAITING}
        isOpen={showModal}
        onClose={handleCloseModal}
        handleDeposit={handleDeposit}
        handleApproval={handleApproval}
        gasEstimationError={gasEstimationError}
        closeOnDrag={depositState !== TransactionState.LOADING}
        depositAmount={depositParams?.amount as bigint}
        tokenAddress={
          depositParams?.type === TokenType.NATIVE
            ? constants.AddressZero
            : (depositParams?.tokenAddress as string)
        }
        ethPrice={tokenPrice}
      />
    </DepositContext.Provider>
  );
};

function useDepositDao(): IDepositContextType {
  return useContext(DepositContext) as IDepositContextType;
}

export {useDepositDao, DepositProvider};
