import {IconChevronRight, ListItemAction} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import {generatePath, useNavigate, useParams} from 'react-router-dom';
import styled from 'styled-components';

import ModalBottomSheetSwitcher from 'components/modalBottomSheetSwitcher';
import {useGlobalModalContext} from 'context/globalModals';
import {useNetwork} from 'context/network';
import {useWallet} from 'hooks/useWallet';
import {trackEvent} from 'services/analytics';
import {NewStrategy, NewWithDraw} from 'utils/paths';

type Action = 'manual_strategy' | 'nft_strategy';

const strategyMenu: React.FC = () => {
  const {isStrategyOpen, close, open} = useGlobalModalContext();
  const {t} = useTranslation();
  const {network} = useNetwork();
  const {dao} = useParams();
  const navigate = useNavigate();
  const {isConnected} = useWallet();

  const handleClick = (action: Action) => {
    if (!isConnected) {
      open('wallet');
    } else if (action === 'manual_strategy') {
      navigate(generatePath(NewStrategy, {network: network, dao: dao}));
    } else {
      navigate(generatePath(NewStrategy, {network: network, dao: dao}));
    }
    close('strategy');
  };

  return (
    <ModalBottomSheetSwitcher
      isOpen={isStrategyOpen}
      onClose={() => close('strategy')}
      title={t('StrategyModal.createStrategy') as string}
    >
      <Container>
        <ListItemAction
          title={t('StrategyModal.item1Title') as string}
          subtitle={t('StrategyModal.item1Subtitle') as string}
          iconRight={<IconChevronRight />}
          onClick={() => handleClick('manual_strategy')}
        />
        <ListItemAction
          title={t('StrategyModal.item2Title') as string}
          subtitle={t('StrategyModal.item2Subtitle') as string}
          iconRight={<IconChevronRight />}
          onClick={() => handleClick('manual_strategy')}
        />
      </Container>
    </ModalBottomSheetSwitcher> 
  );
};

export default strategyMenu;

const Container = styled.div.attrs({
  className: 'space-y-1.5 p-3',
})``;
