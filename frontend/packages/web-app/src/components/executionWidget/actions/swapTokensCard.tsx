import { CardText } from '@aragon/ui-components';
import { AccordionMethod } from 'components/accordionMethod';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export const SwapTokensCard: React.FC<{
  from: string;
  to: string;
  amount: string;
}> = ({ from, to, amount }) => {
  const { t } = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={'Swap tokens'}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={'Swap tokens using Uniswap'}
    >
      <Container>
        <CardText title='From token' content={from} type='label' />
        <CardText title='Amount from token' content={amount} type='label' />
        <CardText title='To token' content={to} type='label' />
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;
