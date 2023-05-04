import { Address } from '@aragon/ui-components/dist/utils/addresses';
import { withTransaction } from '@elastic/apm-rum-react';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FullScreenStepper, Step } from 'components/fullScreenStepper';
import { Loading } from 'components/temporary';
import { ActionsProvider } from 'context/actions';
import { CreateProposalProvider } from 'context/createProposal';
import { useNetwork } from 'context/network';
import { useDaoDetails } from 'hooks/useDaoDetails';
import { useDaoParam } from 'hooks/useDaoParam';
import { PluginTypes } from 'hooks/usePluginClient';
import { usePluginSettings } from 'hooks/usePluginSettings';
import { generatePath } from 'react-router-dom';
import { trackEvent } from 'services/analytics';
import { Finance } from 'utils/paths';
import ConfigureSwapForm from 'containers/configureSwap';
import ReviewSwap from 'containers/reviewSwap';
import SwapModal from 'containers/transactionModals/SwapModal';
import { TransactionState } from 'utils/constants';
import { useSwapPlugin } from 'hooks/useSwapPlugin';

export type TokenFormData = {
  tokenName: string;
  tokenSymbol: string;
  tokenImgUrl: string;
  tokenAddress: Address;
  tokenDecimals: number;
  tokenBalance: string;
  tokenPrice?: number;
  isCustomToken: boolean;
};

export type WithdrawAction = TokenFormData & {
  to: Address;
  from: Address;
  amount: string;
  name: string; // This indicates the type of action; Deposit is NOT an action
  initialAllocation: string;
  admin: string;
  delegate: string;
  groupName: string;
};

type WithdrawFormData = {
  actions: WithdrawAction[];

  // Proposal data
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  duration: number;
  startUtc: string;
  endUtc: string;
  durationSwitch: string;
  proposalTitle: string;
  proposalSummary: string;
  proposal: unknown;
  links: unknown;
};

export const defaultValues = {
  links: [{ name: '', url: '' }],
  startSwitch: 'now',
  durationSwitch: 'duration',
  actions: [
    {
      name: 'swap_token',
      to: '',
      from: '',
      amount: '',
      tokenAddress: '',
      tokenDecimals: 6,
      tokenSymbol: '',
      tokenName: '',
      tokenImgUrl: '',
    }
  ],
};

const SwapTokens: React.FC = () => {
  const { t } = useTranslation();
  const { network } = useNetwork();
  const [showTxModal, setShowTxModal] = useState(false);

  const { data: dao } = useDaoParam();
  const { data: daoDetails, isLoading: detailsLoading } = useDaoDetails(dao);
  const { isLoading: settingsLoading } = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const {currentStep, handleApproval, handleSwap, state} = useSwapPlugin('')

  const formMethods = useForm<WithdrawFormData>({
    defaultValues,
    mode: 'onChange',
  });

  const enableTxModal = () => {
    setShowTxModal(true);
  };


  /*************************************************
   *                    Render                     *
   *************************************************/

  if (detailsLoading || settingsLoading) {
    return <Loading />;
  }

  return (
    <>
      <FormProvider {...formMethods}>
        <ActionsProvider daoId={dao}>
          <CreateProposalProvider
            showTxModal={showTxModal}
            setShowTxModal={setShowTxModal}
          >
            <FullScreenStepper
              wizardProcessName={t('TransferModal.item2Title')}
              navLabel={t('allTransfer.newTransfer')}
              returnPath={generatePath(Finance, { network, dao })}
            >
              <Step
                wizardTitle={'Swap tokens'}
                wizardDescription={'Swap tokens from your group treasury using Uniswap'}
                isNextButtonDisabled={false}
                onNextButtonClicked={next => {
                  trackEvent('newWithdraw_continueBtn_clicked', {
                    step: '1_configure_withdraw',
                    settings: {
                      to: formMethods.getValues('actions.0.to'),
                      token_address: formMethods.getValues(
                        'actions.0.tokenAddress'
                      ),
                      amount: formMethods.getValues('actions.0.amount'),
                    },
                  });
                  next();
                }}
              >
                <ConfigureSwapForm actionIndex={0} groupActionIndex={1} />
              </Step>
              <Step
                wizardTitle={"Swap tokens"}
                wizardDescription={'Swap tokens from your group treasury using Uniswap'}
                isNextButtonDisabled={false}
                onNextButtonClicked={enableTxModal}
              >
                <ReviewSwap />
              </Step>
            </FullScreenStepper>
          </CreateProposalProvider>
        </ActionsProvider>
      </FormProvider>
      <SwapModal
        currentStep={currentStep}
        handleSwap={handleSwap}
        handleApproval={handleApproval}
        isOpen={showTxModal}
        onClose={() => {}}
        closeOnDrag={false}
        includeApproval={true}
        tokenAddress=''
        handleOpenModal={() => {}}
        tokenDecimals={18}
        state={state}
      />
    </>
  );
};

export default withTransaction('SwapTokens', 'component')(SwapTokens);
