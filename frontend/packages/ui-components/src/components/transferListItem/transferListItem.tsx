import React from 'react';
import styled from 'styled-components';

import {
  IconDeposit,
  IconSpinner,
  IconWithdraw,
  IconChevronRight,
} from '../icons';

export type TransferListItemProps = {
  isPending?: boolean;
  /**
   * Transfer title corresponding to the transfer reference or transfer type
   */
  title: string;
  /**
   * Number of tokens transferred
   */
  tokenAmount: string | number;
  tokenSymbol: string;
  /**
   * Date transfer was executed or a loading indication if transfer is still pending
   */
  transferDate: string;
  transferType: 'VaultDeposit' | 'VaultWithdraw';
  usdValue: string;
  onClick?: () => void;
};

const Icons: {[key: string]: JSX.Element} = {
  VaultDeposit: (
    <IconDeposit className="w-1.5 desktop:w-2 h-1.5 desktop:h-2 text-success-600" />
  ),
  Pending: (
    <IconSpinner className="w-1.5 desktop:w-2 h-1.5 desktop:h-2 text-primary-500 animate-spin" />
  ),
  VaultWithdraw: (
    <IconWithdraw className="w-1.5 desktop:w-2 h-1.5 desktop:h-2 text-warning-600" />
  ),
};

const bgColors: {[key: string]: string} = {
  VaultDeposit: 'bg-success-100',
  Pending: 'bg-primary-50',
  VaultWithdraw: 'bg-warning-100',
};

export const TransferListItem: React.FC<TransferListItemProps> = ({
  isPending = false,
  title,
  tokenAmount,
  tokenSymbol,
  transferDate,
  transferType,
  usdValue,
  onClick,
}) => {
  return (
    <Container data-testid="transferListItem" onClick={onClick}>
      <AvatarContainer
        bgColor={isPending ? bgColors.Pending : bgColors[transferType]}
      >
        {isPending ? Icons.Pending : Icons[transferType]}
      </AvatarContainer>
      <Content>
        <Title>{title}</Title>
        <Date>{transferDate}</Date>
      </Content>
      <Value>
        <USDValue>{`${
          transferType === 'VaultDeposit' ? '+' : '-'
        } ${tokenAmount} ${tokenSymbol}`}</USDValue>
        <TokenAmount>{usdValue}</TokenAmount>
      </Value>
      <IconChevronRight className="text-ui-300 group-hover:text-primary-500" />
    </Container>
  );
};

const Container = styled.button.attrs({
  className: `group w-full px-2 desktop:px-3 py-1.5 desktop:py-2.5 bg-ui-0 rounded-xl 
  flex items-center space-x-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 active:bg-ui-100`,
})``;

const AvatarContainer = styled.div.attrs(({bgColor}: {bgColor: string}) => ({
  className: `flex items-center justify-center w-3 h-3 ${bgColor} rounded desktop:w-5 desktop:h-5 desktop:rounded-xl`,
}))<{bgColor: string}>``;

const Content = styled.div.attrs({
  className: 'flex-1 text-left min-w-0',
})``;

const Title = styled.p.attrs({
  className: 'font-bold text-ui-800 group-hover:text-primary-500 truncate',
})``;

const Date = styled.p.attrs({
  className: 'ft-text-sm text-ui-500',
})``;

const Value = styled.div.attrs({
  className: 'text-right',
})``;

const USDValue = styled.p.attrs({
  className: 'font-bold text-ui-800',
})``;

const TokenAmount = styled.p.attrs({
  className: 'ft-text-sm text-ui-500',
})``;
