import React, {useEffect, useMemo} from 'react';
import {matchRoutes, useLocation, useParams} from 'react-router-dom';
import styled from 'styled-components';

import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {usePrivacyContext} from 'context/privacyContext';
import {useDaoDetails} from 'hooks/useDaoDetails';
import useScreen from 'hooks/useScreen';
import {useWallet} from 'hooks/useWallet';
import {CHAIN_METADATA, FEEDBACK_FORM} from 'utils/constants';
import {
  Community,
  CreateDAO,
  EditSettings,
  Finance,
  Governance,
  Landing,
  ManageMembersProposal,
  MintTokensProposal,
  NewDeposit,
  NewProposal,
  NewWithDraw,
  ProposeNewSettings,
} from 'utils/paths';
import {i18n} from '../../../i18n.config';
import DesktopNav from './desktop';
import MobileNav from './mobile';

type StringIndexed = {[key: string]: {processLabel: string; returnURL: string}};

const processPaths = [
  {path: NewDeposit},
  {path: NewWithDraw},
  {path: CreateDAO},
  {path: NewProposal},
  {path: ProposeNewSettings},
  {path: MintTokensProposal},
  {path: ManageMembersProposal},
];

const processes: StringIndexed = {
  [CreateDAO]: {processLabel: i18n.t('createDAO.title'), returnURL: Landing},
  [NewDeposit]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewWithDraw]: {
    processLabel: i18n.t('allTransfer.newTransfer'),
    returnURL: Finance,
  },
  [NewProposal]: {
    processLabel: i18n.t('newProposal.title'),
    returnURL: Governance,
  },
  [ProposeNewSettings]: {
    processLabel: i18n.t('settings.proposeSettings'),
    returnURL: EditSettings,
  },
  [MintTokensProposal]: {
    processLabel: i18n.t('labels.addMember'),
    returnURL: Community,
  },
  [ManageMembersProposal]: {
    processLabel: i18n.t('labels.manageMember'),
    returnURL: Community,
  },
};

const Navbar: React.FC = () => {
  const {open} = useGlobalModalContext();
  const {pathname} = useLocation();
  const {isDesktop} = useScreen();
  const {network} = useNetwork();
  const {methods, isConnected} = useWallet();
  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  const {dao} = useParams();
  const {data: daoDetails} = useDaoDetails(dao || '');

  // set current dao as selected dao
  useEffect(() => {
    if (daoDetails) {
      selectedDaoVar({
        address: daoDetails.address,
        ensDomain: daoDetails.ensDomain,
        metadata: {
          name: daoDetails.metadata.name,
          avatar: daoDetails.metadata.avatar,
        },
        chain: CHAIN_METADATA[network].id,
        plugins: daoDetails.plugins,
      });
    }
  }, [daoDetails, network]);

  const processName = useMemo(() => {
    const results = matchRoutes(processPaths, pathname);
    if (results) return results[0].route.path;
  }, [pathname]);

  /*************************************************
   *                   Handlers                    *
   *************************************************/
  const handleOnDaoSelect = () => {
    handleWithFunctionalPreferenceMenu(() => open('selectDao'));
  };

  const handleWalletButtonClick = () => {
    if (isConnected) {
      open('wallet');
      return;
    }
    methods.selectWallet().catch((err: Error) => {
      // To be implemented: maybe add an error message when
      // the error is different from closing the window
      console.error(err);
    });
  };

  const handleFeedbackButtonClick = () => {
    window.open(FEEDBACK_FORM, '_blank');
  };

  if (isDesktop) {
    return (
      <DesktopNav
        {...(processName ? {...processes[processName]} : {})}
        onDaoSelect={handleOnDaoSelect}
        onWalletClick={handleWalletButtonClick}
        onFeedbackClick={handleFeedbackButtonClick}
      />
    );
  }
  return (
    <MobileNav
      isProcess={processName !== undefined}
      onDaoSelect={handleOnDaoSelect}
      onWalletClick={handleWalletButtonClick}
      onFeedbackClick={handleFeedbackButtonClick}
    />
  );
};

export default Navbar;

export const NavigationBar = styled.nav.attrs({
  className: `flex tablet:order-1 h-12 justify-between items-center px-2 pb-2 pt-1.5
    tablet:py-2 tablet:px-3 desktop:py-3 desktop:px-5 wide:px-25 text-ui-600`,
})``;
