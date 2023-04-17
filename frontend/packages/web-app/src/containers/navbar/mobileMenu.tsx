import {useReactiveVar} from '@apollo/client';
import React from 'react';
import styled from 'styled-components';
import {useTranslation} from 'react-i18next';

import BottomSheet from 'components/bottomSheet';
import {DaoSelector} from 'components/daoSelector';
import NavLinks from 'components/navLinks';
import {selectedDaoVar} from 'context/apolloClient';
import {useGlobalModalContext} from 'context/globalModals';
import {usePrivacyContext} from 'context/privacyContext';
import {ButtonText, IconFeedback} from '@aragon/ui-components';

type MobileNavMenuProps = {
  onFeedbackClick: () => void;
};

const MobileNavMenu = (props: MobileNavMenuProps) => {
  const currentDao = useReactiveVar(selectedDaoVar);
  const {open, close, isMobileMenuOpen} = useGlobalModalContext();
  const {t} = useTranslation();

  const {handleWithFunctionalPreferenceMenu} = usePrivacyContext();

  return (
    <BottomSheet isOpen={isMobileMenuOpen} onClose={() => close('mobileMenu')}>
      <div className="tablet:w-50">
        <CardWrapper className="rounded-xl">
          <DaoSelector
            daoAddress={currentDao.ensDomain}
            daoName={currentDao?.metadata?.name || currentDao?.ensDomain}
            src={currentDao.metadata.avatar}
            onClick={() => {
              close('mobileMenu');
              handleWithFunctionalPreferenceMenu(() => open('selectDao'));
            }}
          />
        </CardWrapper>
        <div className="py-3 px-2 space-y-3">
          <NavLinks onItemClick={() => close('mobileMenu')} />

          <ButtonText
            className="w-full"
            size="large"
            label={t('navButtons.giveFeedback')}
            mode="secondary"
            iconRight={<IconFeedback />}
            onClick={props.onFeedbackClick}
          />
        </div>
      </div>
    </BottomSheet>
  );
};

export default MobileNavMenu;

const CardWrapper = styled.div`
  box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
    0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
`;
