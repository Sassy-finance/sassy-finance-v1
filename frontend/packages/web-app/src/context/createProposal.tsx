import {useReactiveVar} from '@apollo/client';
import {
  DaoAction,
  CreateMajorityVotingProposalParams,
  InstalledPluginListItem,
  MultisigClient,
  MultisigVotingSettings,
  ProposalCreationSteps,
  ProposalMetadata,
  TokenType,
  TokenVotingClient,
  VotingSettings,
  WithdrawParams,
} from '@aragon/sdk-client';
import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {Loading} from 'components/temporary';
import PublishModal from 'containers/transactionModals/publishModal';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {PluginTypes, usePluginClient} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  usePluginSettings,
} from 'hooks/usePluginSettings';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {
  PENDING_MULTISIG_PROPOSALS_KEY,
  PENDING_PROPOSALS_KEY,
  TransactionState,
} from 'utils/constants';
import {
  daysToMills,
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getDHMFromSeconds,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from 'utils/date';
import {customJSONReplacer} from 'utils/library';
import {Proposal} from 'utils/paths';
import {
  CacheProposalParams,
  getNonEmptyActions,
  mapToCacheProposal,
} from 'utils/proposals';
import {isNativeToken} from 'utils/tokens';
import {Action, ProposalId, ProposalResource} from 'utils/types';
import {
  pendingMultisigProposalsVar,
  pendingTokenBasedProposalsVar,
} from './apolloClient';
import {useGlobalModalContext} from './globalModals';
import {useNetwork} from './network';
import {usePrivacyContext} from './privacyContext';

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

const CreateProposalProvider: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const {preferences} = usePrivacyContext();

  const navigate = useNavigate();
  const {getValues} = useFormContext();

  const {network} = useNetwork();
  const {isOnWrongNetwork, provider, address} = useWallet();

  const {data: dao, isLoading} = useDaoParam();
  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetails(dao);
  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply} = useTokenSupply(daoToken?.address || '');
  const {data: pluginSettings} = usePluginSettings(
    pluginAddress,
    pluginType as PluginTypes
  );

  const {client} = useClient();
  const pluginClient = usePluginClient(pluginType as PluginTypes);
  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds((pluginSettings as VotingSettings).minDuration);

  const [proposalId, setProposalId] = useState<string>();
  const [proposalCreationData, setProposalCreationData] =
    useState<CreateMajorityVotingProposalParams>();
  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const cachedMultisigProposals = useReactiveVar(pendingMultisigProposalsVar);
  const cachedTokenBasedProposals = useReactiveVar(
    pendingTokenBasedProposalsVar
  );

  const shouldPoll = useMemo(
    () =>
      creationProcessState === TransactionState.WAITING &&
      proposalCreationData !== undefined,
    [creationProcessState, proposalCreationData]
  );

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
  const encodeActions = useCallback(async () => {
    const actionsFromForm = getValues('actions');
    const actions: Array<Promise<DaoAction>> = [];

    // return an empty array for undefined clients
    if (!pluginClient || !client) return Promise.resolve([] as DaoAction[]);

    getNonEmptyActions(actionsFromForm).forEach((action: Action) => {
      switch (action.name) {
        case 'withdraw_assets': {
          actions.push(
            client.encoding.withdrawAction({
              amount: BigInt(
                Number(action.amount) * Math.pow(10, action.tokenDecimals)
              ),
              recipientAddressOrEns: action.to,
              ...(isNativeToken(action.tokenAddress)
                ? {type: TokenType.NATIVE}
                : {type: TokenType.ERC20, tokenAddress: action.tokenAddress}),
            } as WithdrawParams)
          );
          break;
        }
        case 'mint_tokens': {
          action.inputs.mintTokensToWallets.forEach(mint => {
            actions.push(
              Promise.resolve(
                (pluginClient as TokenVotingClient).encoding.mintTokenAction(
                  action.summary.daoTokenAddress as string,
                  {
                    address: mint.address,
                    amount: BigInt(Number(mint.amount) * Math.pow(10, 18)),
                  }
                )
              )
            );
          });
          break;
        }
        case 'add_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          actions.push(
            Promise.resolve(
              (pluginClient as MultisigClient).encoding.addAddressesAction({
                pluginAddress: pluginAddress,
                members: wallets,
              })
            )
          );
          break;
        }
        case 'remove_address': {
          const wallets = action.inputs.memberWallets.map(
            wallet => wallet.address
          );
          if (wallets.length > 0)
            actions.push(
              Promise.resolve(
                (pluginClient as MultisigClient).encoding.removeAddressesAction(
                  {
                    pluginAddress: pluginAddress,
                    members: wallets,
                  }
                )
              )
            );
          break;
        }
        case 'modify_multisig_voting_settings': {
          actions.push(
            Promise.resolve(
              (
                pluginClient as MultisigClient
              ).encoding.updateMultisigVotingSettings({
                pluginAddress: pluginAddress,
                votingSettings: {
                  minApprovals: action.inputs.minApprovals,
                  onlyListed: (pluginSettings as MultisigVotingSettings)
                    .onlyListed,
                },
              })
            )
          );
          break;
        }
      }
    });

    return Promise.all(actions);
  }, [client, getValues, pluginClient, pluginSettings, pluginAddress]);

  // Because getValues does NOT get updated on each render, leaving this as
  // a function to be called when data is needed instead of a memoized value
  const getProposalCreationParams =
    useCallback(async (): Promise<CreateMajorityVotingProposalParams> => {
      const [
        title,
        summary,
        description,
        resources,
        startDate,
        startTime,
        startUtc,
        endDate,
        endTime,
        endUtc,
        durationSwitch,
        startSwitch,
      ] = getValues([
        'proposalTitle',
        'proposalSummary',
        'proposal',
        'links',
        'startDate',
        'startTime',
        'startUtc',
        'endDate',
        'endTime',
        'endUtc',
        'durationSwitch',
        'startSwitch',
      ]);

      const actions = await encodeActions();

      const metadata: ProposalMetadata = {
        title,
        summary,
        description,
        resources: resources.filter((r: ProposalResource) => r.name && r.url),
      };

      const ipfsUri = await pluginClient?.methods.pinMetadata(metadata);

      // getting dates
      let startDateTime =
        startSwitch === 'now'
          ? new Date(
              `${getCanonicalDate()}T${getCanonicalTime({
                minutes: 10,
              })}:00${getCanonicalUtcOffset()}`
            )
          : new Date(
              `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
            );

      // End date
      let endDateTime;
      if (durationSwitch === 'duration') {
        const [days, hours, minutes] = getValues([
          'durationDays',
          'durationHours',
          'durationMinutes',
        ]);

        // Calculate the end date using duration
        const endDateTimeMill =
          startDateTime.valueOf() + offsetToMills({days, hours, minutes});

        endDateTime = new Date(endDateTimeMill);
      } else {
        endDateTime = new Date(
          `${endDate}T${endTime}:00${getCanonicalUtcOffset(endUtc)}`
        );
      }

      if (startSwitch === 'now') {
        endDateTime = new Date(endDateTime.getTime() + minutesToMills(10));
      } else {
        if (startDateTime.valueOf() < new Date().valueOf()) {
          startDateTime = new Date(
            `${getCanonicalDate()}T${getCanonicalTime({
              minutes: 10,
            })}:00${getCanonicalUtcOffset()}`
          );
        }

        const minEndDateTimeMills =
          startDateTime.valueOf() +
          daysToMills(minDays || 0) +
          hoursToMills(minHours || 0) +
          minutesToMills(minMinutes || 0);

        if (endDateTime.valueOf() < minEndDateTimeMills) {
          const legacyStartDate = new Date(
            `${startDate}T${startTime}:00${getCanonicalUtcOffset(startUtc)}`
          );
          const endMills =
            endDateTime.valueOf() +
            (startDateTime.valueOf() - legacyStartDate.valueOf());

          endDateTime = new Date(endMills);
        }
      }

      // Ignore encoding if the proposal had no actions
      return {
        pluginAddress,
        metadataUri: ipfsUri || '',
        startDate: startDateTime,
        endDate: endDateTime,
        actions,
      };
    }, [
      encodeActions,
      getValues,
      minDays,
      minHours,
      minMinutes,
      pluginAddress,
      pluginClient?.methods,
    ]);

  const estimateCreationFees = useCallback(async () => {
    if (!pluginClient) {
      return Promise.reject(
        new Error('ERC20 SDK client is not initialized correctly')
      );
    }
    if (!proposalCreationData) return;

    return pluginClient?.estimation.createProposal(proposalCreationData);
  }, [pluginClient, proposalCreationData]);

  const {
    tokenPrice,
    maxFee,
    averageFee,
    stopPolling,
    error: gasEstimationError,
  } = usePollGasFee(estimateCreationFees, shouldPoll);

  const handleCloseModal = useCallback(() => {
    switch (creationProcessState) {
      case TransactionState.LOADING:
        break;
      case TransactionState.SUCCESS:
        navigate(generatePath(Proposal, {network, dao, id: proposalId}));
        break;
      default: {
        setCreationProcessState(TransactionState.WAITING);
        setShowTxModal(false);
        stopPolling();
      }
    }
  }, [
    creationProcessState,
    dao,
    navigate,
    network,
    proposalId,
    setShowTxModal,
    stopPolling,
  ]);

  const handleCacheProposal = useCallback(
    (proposalGuid: string) => {
      if (!address || !daoDetails || !pluginSettings || !proposalCreationData)
        return;

      const [title, summary, description, resources] = getValues([
        'proposalTitle',
        'proposalSummary',
        'proposal',
        'links',
      ]);

      let cacheKey = '';
      let newCache;
      let proposalToCache;

      let proposalData: CacheProposalParams = {
        creatorAddress: address,
        daoAddress: daoDetails?.address,
        daoName: daoDetails?.metadata.name,
        proposalGuid,
        proposalParams: proposalCreationData,
        metadata: {
          title,
          summary,
          description,
          resources: resources.filter((r: ProposalResource) => r.name && r.url),
        },
      };

      if (isTokenVotingSettings(pluginSettings)) {
        proposalData = {
          ...proposalData,
          daoToken,
          pluginSettings,
          totalVotingWeight: tokenSupply?.raw,
        };

        cacheKey = PENDING_PROPOSALS_KEY;
        proposalToCache = mapToCacheProposal(proposalData);
        newCache = {
          ...cachedTokenBasedProposals,
          [daoDetails.address]: {
            ...cachedTokenBasedProposals[daoDetails.address],
            [proposalGuid]: {...proposalToCache},
          },
        };
        pendingTokenBasedProposalsVar(newCache);
      } else if (isMultisigVotingSettings(pluginSettings)) {
        proposalData.minApprovals = pluginSettings.minApprovals;
        proposalData.onlyListed = pluginSettings.onlyListed;
        cacheKey = PENDING_MULTISIG_PROPOSALS_KEY;
        proposalToCache = mapToCacheProposal(proposalData);
        newCache = {
          ...cachedMultisigProposals,
          [daoDetails.address]: {
            ...cachedMultisigProposals[daoDetails.address],
            [proposalGuid]: {...proposalToCache},
          },
        };
        pendingMultisigProposalsVar(newCache);
      }

      // persist new cache if functional cookies enabled
      if (preferences?.functional) {
        localStorage.setItem(
          cacheKey,
          JSON.stringify(newCache, customJSONReplacer)
        );
      }
    },
    [
      address,
      cachedMultisigProposals,
      cachedTokenBasedProposals,
      daoDetails,
      daoToken,
      getValues,
      pluginSettings,
      preferences?.functional,
      proposalCreationData,
      tokenSupply?.raw,
    ]
  );

  const handlePublishProposal = useCallback(async () => {
    if (!pluginClient) {
      return new Error('ERC20 SDK client is not initialized correctly');
    }

    // if no creation data is set, or transaction already running, do nothing.
    if (
      !proposalCreationData ||
      creationProcessState === TransactionState.LOADING
    ) {
      console.log('Transaction is running');
      return;
    }

    trackEvent('newProposal_createNowBtn_clicked', {
      dao_address: dao,
      estimated_gwei_fee: averageFee,
      total_usd_cost: averageFee ? tokenPrice * Number(averageFee) : 0,
    });

    const proposalIterator =
      pluginClient.methods.createProposal(proposalCreationData);

    trackEvent('newProposal_transaction_signed', {
      dao_address: dao,
      network: network,
      wallet_provider: provider?.connection.url,
    });

    if (creationProcessState === TransactionState.SUCCESS) {
      handleCloseModal();
      return;
    }

    if (isOnWrongNetwork) {
      open('network');
      handleCloseModal();
      return;
    }

    setCreationProcessState(TransactionState.LOADING);

    // NOTE: quite weird, I've had to wrap the entirety of the generator
    // in a try-catch because when the user rejects the transaction,
    // the try-catch block inside the for loop would not catch the error
    // FF - 11/21/2020
    try {
      for await (const step of proposalIterator) {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case ProposalCreationSteps.DONE: {
            //TODO: replace with step.proposal id when SDK returns proper format
            const prefixedId = new ProposalId(
              step.proposalId
            ).makeGloballyUnique(pluginAddress);

            setProposalId(prefixedId);
            setCreationProcessState(TransactionState.SUCCESS);
            trackEvent('newProposal_transaction_success', {
              dao_address: dao,
              network: network,
              wallet_provider: provider?.connection.url,
              proposalId: prefixedId,
            });

            // cache proposal
            handleCacheProposal(prefixedId);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
      trackEvent('newProposal_transaction_failed', {
        dao_address: dao,
        network: network,
        wallet_provider: provider?.connection.url,
        error,
      });
    }
  }, [
    averageFee,
    creationProcessState,
    dao,
    handleCacheProposal,
    handleCloseModal,
    isOnWrongNetwork,
    network,
    open,
    pluginAddress,
    pluginClient,
    proposalCreationData,
    provider?.connection.url,
    tokenPrice,
  ]);

  /*************************************************
   *                     Effects                   *
   *************************************************/
  useEffect(() => {
    // set proposal creation data
    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
    }

    setProposalData();
  }, [creationProcessState, getProposalCreationParams, showTxModal]);

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading || daoDetailsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
      <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishProposal}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposal')}
        buttonLabelSuccess={t('TransactionModal.goToProposal')}
        disabledCallback={disableActionButton}
      />
    </>
  );
};

export {CreateProposalProvider};
