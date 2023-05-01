import { CardTransfer, CardToken, CardText } from '@aragon/ui-components';
import { AccordionMethod } from 'components/accordionMethod';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { ActionCreateGroup } from 'utils/types';

export const CreateGroupCard: React.FC<{
  action: ActionCreateGroup;
  daoName: string;
}> = ({ action, daoName }) => {
  const { t } = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={'Create a group'}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={'Create a group to manage the assets with the following addresses'}
    >
      <Container>
        <CardText title='Admin address' content={action.admin} type='label' />
        <CardText title='Delegate address' content={action.delegate} type='label' />
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;
