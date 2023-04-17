import React, {useEffect, useMemo} from 'react';
import {withTransaction} from '@elastic/apm-rum-react';
import {useTranslation} from 'react-i18next';
import {FormProvider, useForm, useFormState, useWatch} from 'react-hook-form';

import {FullScreenStepper, Step} from 'components/fullScreenStepper';
import {OverviewDAOHeader, OverviewDAOStep} from 'containers/daoOverview';
import SelectChain from 'containers/selectChainForm';
import DefineMetadata from 'containers/defineMetadata';
import ConfigureCommunity from 'containers/configureCommunity';
import SetupCommunity from 'containers/setupCommunity';
import GoLive, {GoLiveHeader, GoLiveFooter} from 'containers/goLive';
import {WalletField} from '../components/addWallets/row';
import {Landing} from 'utils/paths';
import {CreateDaoProvider} from 'context/createDao';
import {CHAIN_METADATA, getSupportedNetworkByChainId} from 'utils/constants';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {htmlIn} from 'utils/htmlIn';

export type WalletItem = {
  id: string;
  address: string;
};

export type CreateDaoFormData = {
  blockchain: {
    id: number;
    label: string;
    network: string;
  };
  daoLogo: Blob;
  daoName: string;
  daoEnsName: string;
  daoSummary: string;
  tokenName: string;
  tokenSymbol: string;
  tokenTotalSupply: number;
  isCustomToken: boolean;
  links: {name: string; url: string}[];
  wallets: WalletField[];
  tokenAddress: string;
  durationMinutes: string;
  durationHours: string;
  durationDays: string;
  minimumApproval: string;
  minimumParticipation: string;
  eligibilityType: 'token' | 'anyone' | 'multisig';
  eligibilityTokenAmount: number | string;
  support: string;
  membership: string;
  earlyExecution: boolean;
  voteReplacement: boolean;
  multisigWallets: WalletItem[];
  multisigMinimumApprovals: number;
};

const defaultValues = {
  tokenName: '',
  tokenAddress: '',
  tokenSymbol: '',
  tokenTotalSupply: 0,
  links: [{name: '', url: ''}],

  // Uncomment when DAO Treasury minting is supported
  // wallets: [{address: constants.AddressZero, amount: '0'}],
  earlyExecution: true,
  voteReplacement: false,
  membership: 'token',
  eligibilityType: 'token' as CreateDaoFormData['eligibilityType'],
  eligibilityTokenAmount: 0,
  isCustomToken: true,
  durationDays: '1',
  durationHours: '0',
  durationMinutes: '0',
};

const CreateDAO: React.FC = () => {
  const {t} = useTranslation();
  const {chainId} = useWallet();
  const {setNetwork, isL2Network} = useNetwork();
  const formMethods = useForm<CreateDaoFormData>({
    mode: 'onChange',
    defaultValues,
  });
  const {errors, dirtyFields} = useFormState({control: formMethods.control});
  const [
    multisigWallets,
    isCustomToken,
    tokenTotalSupply,
    membership,
    daoName,
    daoEnsName,
    eligibilityType,
  ] = useWatch({
    control: formMethods.control,
    name: [
      'multisigWallets',
      'isCustomToken',
      'tokenTotalSupply',
      'membership',
      'daoName',
      'daoEnsName',
      'eligibilityType',
    ],
  });

  // Note: The wallet network determines the expected network when entering
  // the flow so that the process is more convenient for already logged in
  // users and so that the process doesn't start with a warning. Afterwards,
  // the select blockchain form dictates the expected network
  useEffect(() => {
    // get the default expected network using the connected wallet, use ethereum
    // mainnet in case user accesses the flow without wallet connection. Ideally,
    // this should not happen
    const defaultNetwork = getSupportedNetworkByChainId(chainId) || 'ethereum';

    // update the network context
    setNetwork(defaultNetwork);

    // set the default value in the form
    formMethods.setValue('blockchain', {
      id: CHAIN_METADATA[defaultNetwork].id,
      label: CHAIN_METADATA[defaultNetwork].name,
      network: CHAIN_METADATA[defaultNetwork].testnet ? 'test' : 'main',
    });

    // intentionally disabling this next line so that changing the
    // wallet network doesn't cause effect to run
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /*************************************************
   *             Step Validation States            *
   *************************************************/
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const daoMetadataIsValid = useMemo(() => {
    // required fields not dirty
    if (!isL2Network && !daoEnsName) return false;
    if (!daoName || !dirtyFields.daoSummary) return false;

    return errors.daoEnsName ||
      errors.daoName ||
      errors.links ||
      errors.daoSummary
      ? false
      : true;
  }, [
    daoEnsName,
    daoName,
    dirtyFields.daoSummary,
    errors.daoEnsName,
    errors.daoName,
    errors.daoSummary,
    errors.links,
    isL2Network,
  ]);

  const daoSetupCommunityIsValid = useMemo(() => {
    // required fields not dirty
    // if multisig
    if (membership === 'multisig') {
      if (
        !multisigWallets ||
        errors.multisigWallets ||
        multisigWallets?.length === 0
      ) {
        return false;
      }
      if (!['multisig', 'anyone'].includes(eligibilityType)) {
        return false;
      }
      return true;
      // if token based dao
    } else {
      if (isCustomToken === true) {
        if (
          !dirtyFields.tokenName ||
          !dirtyFields.wallets ||
          !dirtyFields.tokenSymbol ||
          errors.wallets ||
          errors.eligibilityTokenAmount ||
          tokenTotalSupply === 0
          ///////// !(eligibilityType === 'token' && eligibilityTokenAmount !== 0)
        )
          return false;
        return errors.tokenName || errors.tokenSymbol || errors.wallets
          ? false
          : true;
      } else {
        if (!dirtyFields.tokenAddress || errors.tokenAddress) return false;
        return true;
      }
    }
  }, [
    membership,
    multisigWallets,
    errors.multisigWallets,
    errors.wallets,
    errors.eligibilityTokenAmount,
    errors.tokenName,
    errors.tokenSymbol,
    errors.tokenAddress,
    isCustomToken,
    dirtyFields.tokenName,
    dirtyFields.wallets,
    dirtyFields.tokenSymbol,
    dirtyFields.tokenAddress,
    tokenTotalSupply,
    eligibilityType,
  ]);

  const daoConfigureCommunity = useMemo(() => {
    if (
      errors.minimumApproval ||
      errors.minimumParticipation ||
      errors.support ||
      errors.durationDays ||
      errors.durationHours ||
      errors.durationMinutes ||
      errors.multisigMinimumApprovals
    )
      return false;
    return true;
  }, [
    errors.durationDays,
    errors.durationHours,
    errors.durationMinutes,
    errors.minimumApproval,
    errors.minimumParticipation,
    errors.support,
    errors.multisigMinimumApprovals,
  ]);

  const handleNextButtonTracking = (
    next: () => void,
    stepName: string,
    properties: Record<string, unknown>
  ) => {
    trackEvent('daoCreation_continueBtn', {
      step: stepName,
      settings: properties,
    });
    next();
  };

  /*************************************************
   *                    Render                     *
   *************************************************/
  return (
    <FormProvider {...formMethods}>
      <CreateDaoProvider>
        <FullScreenStepper
          wizardProcessName={t('createDAO.title')}
          navLabel={t('createDAO.title')}
          returnPath={Landing}
        >
          <Step
            fullWidth
            hideWizard
            customHeader={
              <OverviewDAOHeader
                navLabel={t('createDAO.title')}
                returnPath={Landing}
              />
            }
            customFooter={<></>}
          >
            <OverviewDAOStep />
          </Step>
          <Step
            wizardTitle={t('createDAO.step1.title')}
            wizardDescription={htmlIn(t)('createDAO.step1.description')}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '1_select_blockchain', {
                network: formMethods.getValues('blockchain')?.network,
              })
            }
          >
            <SelectChain />
          </Step>
          <Step
            wizardTitle={t('createDAO.step2.title')}
            wizardDescription={htmlIn(t)('createDAO.step2.description')}
            isNextButtonDisabled={!daoMetadataIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '2_define_metadata', {
                dao_name: formMethods.getValues('daoName'),
                links: formMethods.getValues('links'),
              })
            }
          >
            <DefineMetadata />
          </Step>
          <Step
            wizardTitle={t('createDAO.step3.title')}
            wizardDescription={htmlIn(t)('createDAO.step3.description')}
            isNextButtonDisabled={!daoSetupCommunityIsValid}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '3_setup_community', {
                governance_type: formMethods.getValues('membership'),
                token_name: formMethods.getValues('tokenName'),
                symbol: formMethods.getValues('tokenSymbol'),
                token_address: formMethods.getValues('tokenAddress'),
                multisigWallets: formMethods.getValues('multisigWallets'),
              })
            }
          >
            <SetupCommunity />
          </Step>
          <Step
            wizardTitle={t('createDAO.step4.title')}
            wizardDescription={htmlIn(t)('createDAO.step4.description')}
            isNextButtonDisabled={!daoConfigureCommunity}
            onNextButtonClicked={next =>
              handleNextButtonTracking(next, '4_configure_governance', {
                minimum_approval: formMethods.getValues('minimumApproval'),
                support: formMethods.getValues('support'),
                duration_days: formMethods.getValues('durationDays'),
                duration_hours: formMethods.getValues('durationHours'),
                duration_minutes: formMethods.getValues('durationMinutes'),
                governance_type: formMethods.getValues('membership'),
              })
            }
          >
            <ConfigureCommunity />
          </Step>
          <Step
            hideWizard
            fullWidth
            customHeader={<GoLiveHeader />}
            customFooter={<GoLiveFooter />}
          >
            <GoLive />
          </Step>
        </FullScreenStepper>
      </CreateDaoProvider>
    </FormProvider>
  );
};

export default withTransaction('CreateDAO', 'component')(CreateDAO);
