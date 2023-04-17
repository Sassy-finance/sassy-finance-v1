import {useReactiveVar} from '@apollo/client';
import {
  ExecuteProposalStep,
  IVoteProposalParams,
  MultisigClient,
  TokenVotingClient,
  VoteProposalStep,
  VoteValues,
} from '@aragon/sdk-client';
import {BigNumber} from 'ethers';
import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import {useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';

import PublishModal from 'containers/transactionModals/publishModal';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useWallet} from 'hooks/useWallet';
import {
  CHAIN_METADATA,
  PENDING_EXECUTION_KEY,
  PENDING_MULTISIG_EXECUTION_KEY,
  PENDING_MULTISIG_VOTES_KEY,
  PENDING_VOTES_KEY,
  TransactionState,
} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';
import {fetchBalance} from 'utils/tokens';
import {
  pendingTokenBasedExecutionVar,
  pendingMultisigApprovalsVar,
  pendingTokenBasedVotesVar,
  pendingMultisigExecutionVar,
} from './apolloClient';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';
import {useProviders} from './providers';
import {ProposalId} from 'utils/types';

//TODO: currently a context, but considering there might only ever be one child,
// might need to turn it into a wrapper that passes props to proposal page
type ProposalTransactionContextType = {
  /** handles voting on proposal */
  handleSubmitVote: (vote: VoteValues, token?: string) => void;
  handleExecuteProposal: () => void;
  pluginAddress: string;
  pluginType: PluginTypes;
  isLoading: boolean;
  voteSubmitted: boolean;
  executeSubmitted: boolean;
  executionFailed: boolean;
  transactionHash: string;
};

type Props = Record<'children', ReactNode>;

/**
 * This context serves as a transaction manager for proposal
 * voting and action execution
 */
const ProposalTransactionContext =
  createContext<ProposalTransactionContextType | null>(null);

const ProposalTransactionProvider: React.FC<Props> = ({children}) => {
  const {t} = useTranslation();
  const {id: urlId} = useParams();

  const {address, isConnected} = useWallet();
  const {network} = useNetwork();
  const {infura: provider} = useProviders();

  const [tokenAddress, setTokenAddress] = useState<string>();
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showExecuteModal, setShowExecuteModal] = useState(false);

  const cachedTokenBasedVotes = useReactiveVar(pendingTokenBasedVotesVar);
  const cachedMultisigApprovals = useReactiveVar(pendingMultisigApprovalsVar);

  const cachedTokenBaseExecution = useReactiveVar(
    pendingTokenBasedExecutionVar
  );
  const cachedMultisigExecution = useReactiveVar(pendingMultisigExecutionVar);

  const [voteParams, setVoteParams] = useState<IVoteProposalParams>();
  const [voteSubmitted, setVoteSubmitted] = useState(false);
  const [voteProcessState, setVoteProcessState] = useState<TransactionState>();

  const [executeProposalId, setExecuteProposalId] = useState<ProposalId>();
  const [executeSubmitted, setExecuteSubmitted] = useState(false);
  const [executionFailed, setExecutionFailed] = useState(false);
  const [executeProcessState, setExecuteProcessState] =
    useState<TransactionState>();
  const [transactionHash, setTransactionHash] = useState<string>('');

  const {data: daoAddress, isLoading: paramIsLoading} = useDaoParam();
  const {data: daoDetails, isLoading: detailsAreLoading} = useDaoDetails(
    daoAddress || ''
  );

  const {pluginAddress, pluginType} = useMemo(() => {
    return {
      pluginAddress: daoDetails?.plugins[0].instanceAddress || '',
      pluginType: daoDetails?.plugins[0].id as PluginTypes,
    };
  }, [daoDetails?.plugins]);

  const pluginClient = usePluginClient(
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {preferences} = usePrivacyContext();

  const shouldPollVoteFees = useMemo(
    () =>
      (voteParams !== undefined &&
        voteProcessState === TransactionState.WAITING) ||
      (executeProposalId !== undefined &&
        executeProcessState === TransactionState.WAITING),
    [executeProposalId, executeProcessState, voteParams, voteProcessState]
  );

  const shouldDisableCallback = useMemo(() => {
    if (
      voteProcessState === TransactionState.SUCCESS ||
      executeProcessState === TransactionState.SUCCESS
    )
      return false;

    return !(voteParams || executeProposalId);
  }, [executeProcessState, executeProposalId, voteParams, voteProcessState]);

  /*************************************************
   *                    Helpers                    *
   *************************************************/
  const handleSubmitVote = useCallback(
    (vote: VoteValues, tokenAddress?: string) => {
      // id should never be null as it is required to navigate to this page
      // Also, the proposal details page (child) navigates back to not-found
      // if the id is invalid
      setVoteParams({
        proposalId: new ProposalId(urlId!).export(),
        vote,
      });

      setTokenAddress(tokenAddress);
      setShowVoteModal(true);
      setVoteProcessState(TransactionState.WAITING);
    },
    [urlId]
  );

  // estimate voting fees
  const estimateVotingFees = useCallback(async () => {
    if (voteParams) {
      if (tokenAddress) {
        return (pluginClient as TokenVotingClient)?.estimation.voteProposal({
          ...voteParams,
          proposalId: voteParams.proposalId,
        });
      }

      return (pluginClient as MultisigClient)?.estimation.approveProposal({
        proposalId: voteParams.proposalId,
        tryExecution: false,
      });
    }
  }, [pluginClient, tokenAddress, voteParams]);

  const handleExecuteProposal = useCallback(() => {
    setExecuteProposalId(new ProposalId(urlId!));
    setShowExecuteModal(true);
    setExecuteProcessState(TransactionState.WAITING);
  }, [urlId]);

  // estimate proposal execution fees
  const estimateExecuteFees = useCallback(async () => {
    if (executeProposalId) {
      if (tokenAddress) {
        return (pluginClient as TokenVotingClient)?.estimation.executeProposal(
          executeProposalId.export()
        );
      }
      return (pluginClient as MultisigClient)?.estimation.executeProposal(
        executeProposalId.export()
      );
    }
  }, [executeProposalId, pluginClient, tokenAddress]);

  // estimation fees for voting on proposal/executing proposal
  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(
    showExecuteModal ? estimateExecuteFees : estimateVotingFees,
    shouldPollVoteFees
  );

  // handles closing vote modal
  const handleCloseVoteModal = useCallback(() => {
    switch (voteProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        setShowVoteModal(false);
        break;
      default: {
        setShowVoteModal(false);
        stopPolling();
      }
    }
  }, [stopPolling, voteProcessState]);

  // set proper state and cache vote when transaction is successful
  const onVoteSubmitted = useCallback(
    async (proposalId: ProposalId, vote: VoteValues) => {
      setVoteParams(undefined);
      setVoteSubmitted(true);
      setVoteProcessState(TransactionState.SUCCESS);

      if (!address) return;

      let newCache;
      let cacheKey = '';
      const cachedProposalId = proposalId.makeGloballyUnique(daoAddress);

      // cache multisig vote
      if (pluginType === 'multisig.plugin.dao.eth') {
        newCache = {
          ...cachedMultisigApprovals,
          [cachedProposalId]: address,
        };
        cacheKey = PENDING_MULTISIG_VOTES_KEY;
        pendingMultisigApprovalsVar(newCache);
      }

      // cache token voting vote
      if (pluginType === 'token-voting.plugin.dao.eth' && tokenAddress) {
        // fetch token user balance, ie vote weight
        const weight: BigNumber = await fetchBalance(
          tokenAddress,
          address!,
          provider,
          CHAIN_METADATA[network].nativeCurrency,
          false
        );

        newCache = {
          ...cachedTokenBasedVotes,
          [cachedProposalId]: {address, vote, weight: weight.toBigInt()},
        };
        cacheKey = PENDING_VOTES_KEY;
        pendingTokenBasedVotesVar(newCache);
      }

      // add to local storage
      if (preferences?.functional) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedMultisigApprovals,
      cachedTokenBasedVotes,
      daoAddress,
      network,
      pluginType,
      preferences?.functional,
      provider,
      tokenAddress,
    ]
  );

  // set proper state and cache proposal execution when transaction is successful
  const onExecutionSubmitted = useCallback(
    async (proposalId: ProposalId) => {
      if (!address) return;

      let newCache;
      let cacheKey = '';
      const cachedProposalId = proposalId.makeGloballyUnique(daoAddress);

      // cache token based execution
      if (pluginType === 'token-voting.plugin.dao.eth') {
        newCache = {
          ...cachedTokenBaseExecution,
          [cachedProposalId]: true,
        };
        cacheKey = PENDING_EXECUTION_KEY;
        pendingTokenBasedExecutionVar(newCache);
      }

      // cache multisig execution
      if (pluginType === 'multisig.plugin.dao.eth') {
        newCache = {
          ...cachedMultisigExecution,
          [cachedProposalId]: true,
        };
        cacheKey = PENDING_MULTISIG_EXECUTION_KEY;
        pendingMultisigExecutionVar(newCache);
      }

      // add to local storage
      if (preferences?.functional) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedMultisigExecution,
      cachedTokenBaseExecution,
      daoAddress,
      pluginType,
      preferences?.functional,
    ]
  );

  // handles vote submission/execution
  const handleVoteExecution = useCallback(async () => {
    if (voteProcessState === TransactionState.SUCCESS) {
      handleCloseVoteModal();
      return;
    }

    if (!voteParams || voteProcessState === TransactionState.LOADING) {
      console.log('Transaction is running');
      return;
    }

    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }

    setVoteProcessState(TransactionState.LOADING);

    let voteSteps;

    if (!tokenAddress) {
      voteSteps = (pluginClient as MultisigClient)?.methods.approveProposal({
        proposalId: voteParams.proposalId,
        tryExecution: false,
      });
    } else {
      voteSteps = (pluginClient as TokenVotingClient)?.methods.voteProposal({
        ...voteParams,
        proposalId: voteParams.proposalId,
      });
    }

    if (!voteSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    // clear up previous submission state
    setVoteSubmitted(false);

    try {
      for await (const step of voteSteps) {
        switch (step.key) {
          case VoteProposalStep.VOTING:
            console.log(step.txHash);
            break;
          case VoteProposalStep.DONE:
            onVoteSubmitted(
              new ProposalId(voteParams.proposalId),
              voteParams.vote
            );
            break;
        }
      }
    } catch (err) {
      console.error(err);
      setVoteProcessState(TransactionState.ERROR);
    }
  }, [
    handleCloseVoteModal,
    onVoteSubmitted,
    pluginAddress,
    pluginClient,
    tokenAddress,
    voteParams,
    voteProcessState,
  ]);

  // handles closing execute modal
  const handleCloseExecuteModal = useCallback(() => {
    switch (executeProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        {
          setShowExecuteModal(false);
          setExecuteSubmitted(true);
        }
        break; // TODO: reload and cache
      default: {
        setShowExecuteModal(false);
        stopPolling();
      }
    }
  }, [executeProcessState, stopPolling]);

  // handles proposal execution
  const handleProposalExecution = useCallback(async () => {
    if (executeProcessState === TransactionState.SUCCESS) {
      handleCloseExecuteModal();
      return;
    }
    if (
      !executeProposalId ||
      executeProcessState === TransactionState.LOADING
    ) {
      console.log('Transaction is running');
      return;
    }
    if (!pluginAddress) {
      console.error('Plugin address is required');
      return;
    }
    if (!isConnected) {
      open('wallet');
      return;
    }

    setExecuteProcessState(TransactionState.LOADING);

    let executeSteps;
    if (tokenAddress) {
      executeSteps = (
        pluginClient as TokenVotingClient
      )?.methods.executeProposal(executeProposalId.export());
    } else {
      executeSteps = (pluginClient as MultisigClient)?.methods.executeProposal(
        executeProposalId.export()
      );
    }

    if (!executeSteps) {
      throw new Error('Voting function is not initialized correctly');
    }

    try {
      for await (const step of executeSteps) {
        switch (step.key) {
          case ExecuteProposalStep.EXECUTING:
            setTransactionHash(step.txHash);
            break;
          case ExecuteProposalStep.DONE:
            setExecuteProposalId(undefined);
            setExecutionFailed(false);
            setExecuteProcessState(TransactionState.SUCCESS);
            onExecutionSubmitted(executeProposalId);
            break;
        }
      }
    } catch (err) {
      console.error(err);
      setExecutionFailed(true);
      setExecuteProcessState(TransactionState.ERROR);
    }
  }, [
    executeProposalId,
    executeProcessState,
    handleCloseExecuteModal,
    isConnected,
    onExecutionSubmitted,
    pluginAddress,
    pluginClient,
    tokenAddress,
  ]);

  const value = useMemo(
    () => ({
      handleSubmitVote,
      handleExecuteProposal,
      isLoading: paramIsLoading || detailsAreLoading,
      pluginAddress,
      pluginType,
      voteSubmitted,
      executeSubmitted,
      executionFailed,
      transactionHash,
    }),
    [
      detailsAreLoading,
      executeSubmitted,
      executionFailed,
      handleExecuteProposal,
      handleSubmitVote,
      paramIsLoading,
      pluginAddress,
      pluginType,
      transactionHash,
      voteSubmitted,
    ]
  );

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <ProposalTransactionContext.Provider value={value}>
      {children}
      <PublishModal
        title={
          showExecuteModal
            ? t('labels.signExecuteProposal')
            : t('labels.signVote')
        }
        buttonLabel={
          showExecuteModal
            ? t('governance.proposals.buttons.execute')
            : t('governance.proposals.buttons.vote')
        }
        state={
          (showExecuteModal ? executeProcessState : voteProcessState) ||
          TransactionState.WAITING
        }
        isOpen={showVoteModal || showExecuteModal}
        onClose={
          showExecuteModal ? handleCloseExecuteModal : handleCloseVoteModal
        }
        callback={
          showExecuteModal ? handleProposalExecution : handleVoteExecution
        }
        closeOnDrag={
          showExecuteModal
            ? executeProcessState !== TransactionState.LOADING
            : voteProcessState !== TransactionState.LOADING
        }
        maxFee={maxFee}
        averageFee={averageFee}
        tokenPrice={tokenPrice}
        gasEstimationError={gasEstimationError}
        disabledCallback={shouldDisableCallback}
      />
    </ProposalTransactionContext.Provider>
  );
};

function useProposalTransactionContext(): ProposalTransactionContextType {
  const context = useContext(ProposalTransactionContext);

  if (context === null) {
    throw new Error(
      'useProposalTransactionContext() can only be used on the descendants of <UseProposalTransactionProvider />'
    );
  }
  return context;
}

export {ProposalTransactionProvider, useProposalTransactionContext};
