import { Address } from '@aragon/ui-components/dist/utils/addresses';
import { withTransaction } from '@elastic/apm-rum-react';
import React, { useState } from 'react';
import { FormProvider, useForm, useFormState, useWatch } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import { FullScreenStepper, Step } from 'components/fullScreenStepper';
import { Loading } from 'components/temporary';
import ConfigureStrategyForm, {
  isValid as configureStrategyScreenIsValid,
} from 'containers/configureStrategy';
import DefineProposal, {
  isValid as defineProposalIsValid,
} from 'containers/defineProposal';
import ReviewProposal from 'containers/reviewProposal';
import SetupVotingForm, {
  isValid as setupVotingIsValid,
} from 'containers/setupVotingForm';
import TokenMenu from 'containers/tokenMenu';
import { ActionsProvider } from 'context/actions';
import { CreateProposalProvider } from 'context/createProposal';
import { useNetwork } from 'context/network';
import { useDaoBalances } from 'hooks/useDaoBalances';
import { useDaoDetails } from 'hooks/useDaoDetails';
import { useDaoParam } from 'hooks/useDaoParam';
import { PluginTypes } from 'hooks/usePluginClient';
import { usePluginSettings } from 'hooks/usePluginSettings';
import { useWallet } from 'hooks/useWallet';
import { generatePath } from 'react-router-dom';
import { trackEvent } from 'services/analytics';
import { fetchTokenPrice } from 'services/prices';
import { MAX_TOKEN_DECIMALS } from 'utils/constants';
import { getCanonicalUtcOffset } from 'utils/date';
import { formatUnits } from 'utils/library';
import { Finance } from 'utils/paths';
import { BaseTokenInfo } from 'utils/types';
import ConfigureSwapForm from 'containers/configureSwap';
import ReviewSwap from 'containers/reviewSwap';
import ConfigureNFTBuyForm from 'containers/configureNFTBuy';
import ReviewNFTBuy from 'containers/reviewNFTBuy';
import { getOpenSeaOrder } from 'utils/api';

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
  url: string,
  collection: string,
  tokenId: string,
  image: string,
  price: string
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
      name: 'buy_nft',
      to: '',
      from: '',
      amount: '',
      tokenAddress: '',
      tokenDecimals: 6,
      tokenSymbol: '',
      tokenName: '',
      tokenImgUrl: '',
      url: '',
      collection: '',
      tokenId: '',
      image: '',
      price: ''
    }
  ],
};

const BuyNFT: React.FC = () => {
  const { t } = useTranslation();
  const { network } = useNetwork();
  const [showTxModal, setShowTxModal] = useState(false);

  const { data: dao } = useDaoParam();
  const { data: daoDetails, isLoading: detailsLoading } = useDaoDetails(dao);
  const { isLoading: settingsLoading } = usePluginSettings(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const formMethods = useForm<WithdrawFormData>({
    defaultValues,
    mode: 'onChange',
  });


  const getNFTAttributes = async (url: string) => {

    const pathTokens = url.split('/')

    const collection = pathTokens.slice(-2)[0]
    const tokenId = pathTokens.slice(-1)[0]

    const nftData = await getOpenSeaOrder(collection, tokenId)

    return {
      collection,
      tokenId,
      price: nftData.orders[0].current_price / 10 ** 18,
      imageUrl: nftData.orders[0].maker_asset_bundle.assets[0].image_preview_url,
    }
  }

  https://testnets.opensea.io/assets/mumbai/0x2953399124f0cbb46d2cbacd8a89cf0599974963/56259533828090815660555817868011621635748864731018174146661012094178369208321
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
                wizardTitle={'Buy NFT'}
                wizardDescription={'Buy NFT from Opensea using your group treasury'}
                isNextButtonDisabled={false}
                onNextButtonClicked={next => {
                  const url = formMethods.getValues('actions.0.url')
                  getNFTAttributes(url).then(nftMetadata => {
                    formMethods.setValue('actions.0.collection', nftMetadata.collection);
                    formMethods.setValue('actions.0.tokenId', nftMetadata.tokenId);
                    formMethods.setValue('actions.0.price', nftMetadata.price.toString());
                    formMethods.setValue('actions.0.url', nftMetadata.imageUrl);
                  })
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
                <ConfigureNFTBuyForm actionIndex={0} groupActionIndex={1} />
              </Step>
              <Step
                wizardTitle={"Buy NFT"}
                wizardDescription={'Buy NFT at opensea using group treasury'}
                isNextButtonDisabled={false}
                onNextButtonClicked={next => {
                  trackEvent('newWithdraw_continueBtn_clicked', {
                    step: '1_configure_withdraw',
                    settings: {
                      to: formMethods.getValues('actions.0.to'),
                      token_address: formMethods.getValues(
                        'actions.0.to'
                      ),
                      amount: formMethods.getValues('actions.0.amount'),
                    },
                  });
                  next();
                }}
              >
                <ReviewNFTBuy />
              </Step>
            </FullScreenStepper>
          </CreateProposalProvider>
        </ActionsProvider>
      </FormProvider>
    </>
  );
};

export default withTransaction('BuyNFT', 'component')(BuyNFT);
