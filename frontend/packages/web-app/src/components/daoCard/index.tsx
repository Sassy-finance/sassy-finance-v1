import {AvatarDao, IconBlock, IconCommunity} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import useScreen from 'hooks/useScreen';
import {getSupportedNetworkByChainId} from 'utils/constants';

export interface IDaoCardProps {
  name: string;
  ensName: string;
  logo?: string;
  description: string;
  chainId: number;
  daoType: DaoType;
  onClick?: () => void;
}

export type DaoType = 'wallet-based' | 'token-based';

const useGetDaoType = (daoType?: DaoType) => {
  const {t} = useTranslation();
  switch (daoType) {
    case 'token-based':
      return t('explore.explorer.tokenBased');
    case 'wallet-based':
      return t('explore.explorer.walletBased');
  }
};

// this is needed for line-clamp
type DescriptionProps = {
  isDesktop?: boolean;
};

export const DaoCard = (props: IDaoCardProps) => {
  const {isDesktop} = useScreen();
  const daoType = useGetDaoType(props.daoType);

  return (
    <Container data-testid="daoCard" onClick={props.onClick}>
      <DaoDataWrapper>
        <HeaderContainer>
          <AvatarDao daoName={props.name} src={props.logo} />
          <div className="space-y-0.25 desktop:space-y-0.5 text-left">
            <Title>{props.name}</Title>
            <p className="font-semibold text-ui-500 ft-text-sm">
              {props.ensName}
            </p>
          </div>
        </HeaderContainer>
        <Description isDesktop={isDesktop}>{props.description}</Description>
      </DaoDataWrapper>
      <DaoMetadataWrapper>
        <IconWrapper>
          <StyledIconBlock />
          <IconLabel>{getSupportedNetworkByChainId(props.chainId)}</IconLabel>
        </IconWrapper>
        <IconWrapper>
          <StyledIconCommunity />
          <IconLabel>{daoType}</IconLabel>
        </IconWrapper>
      </DaoMetadataWrapper>
    </Container>
  );
};

const Container = styled.button.attrs({
  className: `p-2 desktop:p-3 w-full flex flex-col space-y-3
    box-border border border-transparent
    focus:outline-none focus:ring-2 focus:ring-primary-500
    hover:border-ui-100 active:border-200
    bg-white rounded-xl
    `,
})`
  :hover {
    box-shadow: 0px 4px 8px rgba(31, 41, 51, 0.04),
      0px 0px 2px rgba(31, 41, 51, 0.06), 0px 0px 1px rgba(31, 41, 51, 0.04);
  }
  :focus {
    box-shadow: 0px 0px 0px 2px #003bf5;
  }
`;

const HeaderContainer = styled.div.attrs({
  className: 'flex flex-row space-x-2 items-center',
})``;

const Title = styled.p.attrs({
  className: 'font-bold text-ui-800 ft-text-xl',
})``;

// The line desktop breakpoint does not work with
// the tailwind line clamp plugin so the same effect
// is achieved using styled components
const Description = styled.p.attrs({
  className: `
  font-medium text-ui-600 ft-text-base flex text-left
  `,
})<DescriptionProps>`
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: ${props => (props.isDesktop ? 2 : 3)};
`;

const DaoMetadataWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-3',
})``;
const IconLabel = styled.p.attrs({
  className: 'text-ui-600 ft-text-sm capitalize',
})``;
const IconWrapper = styled.div.attrs({
  className: 'flex flex-row space-x-1',
})``;

const DaoDataWrapper = styled.div.attrs({
  className: 'flex flex-col grow space-y-1.5 flex-1',
})``;

const StyledIconBlock = styled(IconBlock).attrs({
  className: 'text-ui-600',
})``;

const StyledIconCommunity = styled(IconCommunity).attrs({
  className: 'text-ui-600',
})``;
