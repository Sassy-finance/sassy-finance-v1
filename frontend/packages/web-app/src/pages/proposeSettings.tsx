import {useReactiveVar} from '@apollo/client';
import {
  DaoAction,
  CreateMajorityVotingProposalParams,
  InstalledPluginListItem,
  ProposalCreationSteps,
  ProposalMetadata,
  VotingMode,
  VotingSettings,
} from '@aragon/sdk-client';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useCallback, useEffect, useState} from 'react';
import {useFormContext, useFormState} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate} from 'react-router-dom';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {Loading} from 'components/temporary';
import CompareSettings from 'containers/compareSettings';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm from 'containers/setupVotingForm';
import PublishModal from 'containers/transactionModals/publishModal';
import {
  pendingMultisigProposalsVar,
  pendingTokenBasedProposalsVar,
} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useClient} from 'hooks/useClient';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {useDaoToken} from 'hooks/useDaoToken';
import {
  isMultisigClient,
  isTokenVotingClient,
  PluginTypes,
  usePluginClient,
} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  usePluginSettings,
} from 'hooks/usePluginSettings';
import {usePollGasFee} from 'hooks/usePollGasfee';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {useWallet} from 'hooks/useWallet';
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
  getSecondsFromDHM,
  hoursToMills,
  minutesToMills,
  offsetToMills,
} from 'utils/date';
import {customJSONReplacer, readFile} from 'utils/library';
import {EditSettings, Proposal} from 'utils/paths';
import {CacheProposalParams, mapToCacheProposal} from 'utils/proposals';
import {
  Action,
  ActionUpdateMetadata,
  ActionUpdateMultisigPluginSettings,
  ActionUpdatePluginSettings,
  ProposalId,
  ProposalResource,
} from 'utils/types';

const ProposeSettings: React.FC = () => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const {getValues, setValue, control} = useFormContext();
  const [showTxModal, setShowTxModal] = useState(false);
  const {errors, dirtyFields} = useFormState({
    control,
  });

  const {data: daoId} = useDaoParam();
  const {data: daoDetails, isLoading} = useDaoDetails(daoId);
  const {data: pluginSettings, isLoading: settingsLoading} = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const enableTxModal = () => {
    setShowTxModal(true);
  };

  // filter actions making sure unchanged information is not bundled
  // into the list of actions
  const filterActions = useCallback(() => {
    const [formActions, settingsChanged, metadataChanged] = getValues([
      'actions',
      'areSettingsChanged',
      'isMetadataChanged',
    ]);

    // ignore every action that is not modifying the metadata and voting settings
    const filteredActions = (formActions as Array<Action>).filter(action => {
      if (action.name === 'modify_metadata' && metadataChanged) {
        return action;
      } else if (
        (action.name === 'modify_token_voting_settings' ||
          action.name === 'modify_multisig_voting_settings') &&
        settingsChanged
      ) {
        return action;
      }
    });

    setValue('actions', filteredActions);
  }, [getValues, setValue]);

  if (isLoading || settingsLoading) {
    return <Loading />;
  }

  return (
    <ProposeSettingWrapper
      showTxModal={showTxModal}
      setShowTxModal={setShowTxModal}
    >
      <FullScreenStepper
        wizardProcessName={t('newProposal.title')}
        navLabel={t('navLinks.settings')}
        returnPath={generatePath(EditSettings, {network, dao: daoId})}
      >
        <Step
          wizardTitle={t('settings.proposeSettings')}
          wizardDescription={t('settings.proposeSettingsSubtitle')}
          onNextButtonClicked={next => {
            filterActions();
            next();
          }}
        >
          <CompareSettings />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.defineProposal.heading')}
          wizardDescription={t('newWithdraw.defineProposal.description')}
          isNextButtonDisabled={!defineProposalIsValid(dirtyFields, errors)}
        >
          <DefineProposal />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.setupVoting.title')}
          wizardDescription={t('newWithdraw.setupVoting.description')}
        >
          <SetupVotingForm pluginSettings={pluginSettings} />
        </Step>
        <Step
          wizardTitle={t('newWithdraw.reviewProposal.heading')}
          wizardDescription={t('newWithdraw.reviewProposal.description')}
          nextButtonLabel={t('labels.submitProposal')}
          onNextButtonClicked={enableTxModal}
          fullWidth
        >
          <ReviewProposal defineProposalStepNumber={2} />
        </Step>
      </FullScreenStepper>
    </ProposeSettingWrapper>
  );
};

export default withTransaction('ProposeSettings', 'component')(ProposeSettings);

type Props = {
  showTxModal: boolean;
  setShowTxModal: (value: boolean) => void;
};

// TODO: this is almost identical to CreateProposal wrapper, please merge if possible
const ProposeSettingWrapper: React.FC<Props> = ({
  showTxModal,
  setShowTxModal,
  children,
}) => {
  const {t} = useTranslation();
  const {open} = useGlobalModalContext();
  const navigate = useNavigate();
  const {getValues, setValue} = useFormContext();

  const {preferences} = usePrivacyContext();
  const {network} = useNetwork();
  const {address, isOnWrongNetwork} = useWallet();

  const {data: dao, isLoading} = useDaoParam();
  const {data: daoDetails, isLoading: daoDetailsLoading} = useDaoDetails(dao);

  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const {data: pluginSettings} = usePluginSettings(
    pluginAddress,
    pluginType as PluginTypes
  );
  const {
    days: minDays,
    hours: minHours,
    minutes: minMinutes,
  } = getDHMFromSeconds((pluginSettings as VotingSettings).minDuration);

  const {data: daoToken} = useDaoToken(pluginAddress);
  const {data: tokenSupply, isLoading: tokenSupplyIsLoading} = useTokenSupply(
    daoToken?.address || ''
  );

  const {client} = useClient();

  const pluginClient = usePluginClient(pluginType as PluginTypes);

  const [proposalCreationData, setProposalCreationData] =
    useState<CreateMajorityVotingProposalParams>();

  const [creationProcessState, setCreationProcessState] =
    useState<TransactionState>(TransactionState.WAITING);

  const [proposalId, setProposalId] = useState<string>();

  const cachedMultisigProposals = useReactiveVar(pendingMultisigProposalsVar);
  const cachedTokenBasedProposals = useReactiveVar(
    pendingTokenBasedProposalsVar
  );

  const shouldPoll =
    creationProcessState === TransactionState.WAITING &&
    proposalCreationData !== undefined;

  const disableActionButton =
    !proposalCreationData && creationProcessState !== TransactionState.SUCCESS;

  /*************************************************
   *                     Effects                   *
   *************************************************/
  // Not a fan, but this sets the actions on the form context so that the Action
  // Widget can read them
  useEffect(() => {
    {
      const [
        daoName,
        daoSummary,
        daoLogo,
        minimumApproval,
        multisigMinimumApprovals,
        minimumParticipation,
        eligibilityType,
        eligibilityTokenAmount,
        earlyExecution,
        voteReplacement,
        durationDays,
        durationHours,
        durationMinutes,
        resourceLinks,
      ] = getValues([
        'daoName',
        'daoSummary',
        'daoLogo',
        'minimumApproval',
        'multisigMinimumApprovals',
        'minimumParticipation',
        'eligibilityType',
        'eligibilityTokenAmount',
        'earlyExecution',
        'voteReplacement',
        'durationDays',
        'durationHours',
        'durationMinutes',
        'daoLinks',
      ]);

      const metadataAction: ActionUpdateMetadata = {
        name: 'modify_metadata',
        inputs: {
          name: daoName,
          description: daoSummary,
          avatar: daoLogo,
          links: resourceLinks,
        },
      };

      if (isTokenVotingSettings(pluginSettings)) {
        const voteSettingsAction: ActionUpdatePluginSettings = {
          name: 'modify_token_voting_settings',
          inputs: {
            token: daoToken,
            totalVotingWeight: tokenSupply?.raw || BigInt(0),

            minDuration: getSecondsFromDHM(
              durationDays,
              durationHours,
              durationMinutes
            ),
            supportThreshold: Number(minimumApproval) / 100,
            minParticipation: Number(minimumParticipation) / 100,
            minProposerVotingPower:
              eligibilityType === 'token'
                ? BigInt(eligibilityTokenAmount)
                : undefined,
            votingMode: earlyExecution
              ? VotingMode.EARLY_EXECUTION
              : voteReplacement
              ? VotingMode.VOTE_REPLACEMENT
              : VotingMode.STANDARD,
          },
        };
        setValue('actions', [metadataAction, voteSettingsAction]);
      } else {
        const multisigSettingsAction: ActionUpdateMultisigPluginSettings = {
          name: 'modify_multisig_voting_settings',
          inputs: {
            minApprovals: multisigMinimumApprovals,
            onlyListed: pluginSettings.onlyListed,
          },
        };

        setValue('actions', [metadataAction, multisigSettingsAction]);
      }
    }
  }, [daoToken, pluginSettings, getValues, setValue, tokenSupply?.raw]);

  useEffect(() => {
    // encoding actions
    const encodeActions = async (): Promise<DaoAction[]> => {
      // return an empty array for undefined clients
      const actions: Array<Promise<DaoAction>> = [];
      if (!pluginClient || !client) return Promise.all(actions);

      for (const action of getValues('actions') as Array<Action>) {
        if (action.name === 'modify_metadata') {
          const preparedAction = {...action};

          if (
            preparedAction.inputs.avatar &&
            typeof preparedAction.inputs.avatar !== 'string'
          ) {
            try {
              const daoLogoBuffer = await readFile(
                preparedAction.inputs.avatar as unknown as Blob
              );

              const logoCID = await client?.ipfs.add(
                new Uint8Array(daoLogoBuffer)
              );
              await client?.ipfs.pin(logoCID!);
              preparedAction.inputs.avatar = `ipfs://${logoCID}`;
            } catch (e) {
              preparedAction.inputs.avatar = undefined;
            }
          }

          try {
            const ipfsUri = await client.methods.pinMetadata(
              preparedAction.inputs
            );

            actions.push(client.encoding.updateDaoMetadataAction(dao, ipfsUri));
          } catch (error) {
            throw Error('Could not pin metadata on IPFS');
          }
        } else if (
          action.name === 'modify_token_voting_settings' &&
          isTokenVotingClient(pluginClient)
        ) {
          actions.push(
            Promise.resolve(
              pluginClient.encoding.updatePluginSettingsAction(
                pluginAddress,
                action.inputs
              )
            )
          );
        } else if (
          action.name === 'modify_multisig_voting_settings' &&
          isMultisigClient(pluginClient)
        ) {
          actions.push(
            Promise.resolve(
              pluginClient.encoding.updateMultisigVotingSettings({
                pluginAddress,
                votingSettings: {
                  minApprovals: action.inputs.minApprovals,
                  onlyListed: action.inputs.onlyListed,
                },
              })
            )
          );
        }
      }
      return Promise.all(actions);
    };

    const getProposalCreationParams =
      async (): Promise<CreateMajorityVotingProposalParams> => {
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
      };

    async function setProposalData() {
      if (showTxModal && creationProcessState === TransactionState.WAITING)
        setProposalCreationData(await getProposalCreationParams());
    }

    setProposalData();
  }, [
    creationProcessState,
    showTxModal,
    getValues,
    minDays,
    minHours,
    minMinutes,
    dao,
    pluginAddress,
    pluginClient,
    client,
  ]);

  /*************************************************
   *             Callbacks and Handlers            *
   *************************************************/
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

  const handleCloseModal = () => {
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
  };

  const handlePublishSettings = async () => {
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

    const proposalIterator =
      pluginClient.methods.createProposal(proposalCreationData);

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
    try {
      for await (const step of proposalIterator) {
        switch (step.key) {
          case ProposalCreationSteps.CREATING:
            console.log(step.txHash);
            break;
          case ProposalCreationSteps.DONE: {
            //TODO: replace with step.proposal id when SDK returns proper format
            const proposalGuid = new ProposalId(
              step.proposalId
            ).makeGloballyUnique(pluginAddress);

            setProposalId(proposalGuid);
            setCreationProcessState(TransactionState.SUCCESS);

            // cache proposal
            handleCacheProposal(proposalGuid);
            break;
          }
        }
      }
    } catch (error) {
      console.error(error);
      setCreationProcessState(TransactionState.ERROR);
    }
  };

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

  /*************************************************
   *                    Render                     *
   *************************************************/

  if (isLoading || daoDetailsLoading || tokenSupplyIsLoading) {
    return <Loading />;
  }

  return (
    <>
      {children}
      <PublishModal
        state={creationProcessState || TransactionState.WAITING}
        isOpen={showTxModal}
        onClose={handleCloseModal}
        callback={handlePublishSettings}
        closeOnDrag={creationProcessState !== TransactionState.LOADING}
        maxFee={maxFee}
        averageFee={averageFee}
        gasEstimationError={gasEstimationError}
        tokenPrice={tokenPrice}
        title={t('TransactionModal.createProposal')}
        buttonLabel={t('TransactionModal.createProposalNow')}
        buttonLabelSuccess={t('TransactionModal.launchGovernancePage')}
        disabledCallback={disableActionButton}
      />
    </>
  );
};
