import React from 'react';
import {Controller, useFormContext} from 'react-hook-form';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {Dd, DescriptionListContainer, Dl, Dt} from 'components/descriptionList';
import {useFormStep} from 'components/fullScreenStepper';
import {CHAIN_METADATA} from 'utils/constants';
import {useNetwork} from 'context/network';

const Blockchain: React.FC = () => {
  const {control, getValues} = useFormContext();
  const {setStep} = useFormStep();
  const {network} = useNetwork();
  const {blockchain, reviewCheckError} = getValues();
  const {t} = useTranslation();

  const networkInfo = CHAIN_METADATA[network];
  const networkType = networkInfo.testnet
    ? t('labels.testNet')
    : t('labels.mainNet');

  return (
    <Controller
      name="reviewCheck.blockchain"
      control={control}
      defaultValue={false}
      rules={{
        required: t('errors.required.recipient'),
      }}
      render={({field: {onChange, value}}) => (
        <DescriptionListContainer
          title={t('labels.review.blockchain')}
          onEditClick={() => setStep(2)}
          checkBoxErrorMessage={t('createDAO.review.acceptContent')}
          checkedState={
            value ? 'active' : reviewCheckError ? 'error' : 'default'
          }
          tagLabel={t('labels.notChangeable')}
          onChecked={() => onChange(!value)}
        >
          <Dl>
            <Dt>{t('labels.review.network')}</Dt>
            <Dd>{networkType}</Dd>
          </Dl>
          <Dl>
            <Dt>{t('labels.review.blockchain')}</Dt>
            <Dd>{blockchain.label}</Dd>
          </Dl>
        </DescriptionListContainer>
      )}
    />
  );
};

export default Blockchain;

export const Card = styled.div.attrs({
  className: 'bg-ui-0 rounded-xl p-3 w-full mb-5',
})``;

export const Header = styled.div.attrs({
  className: 'flex pb-3',
})``;

export const Title = styled.h2.attrs({
  className: 'font-bold text-lg',
})``;

export const Body = styled.div.attrs({
  className: 'pb-1',
})``;

export const Row = styled.div.attrs({
  className: 'block tablet:flex mb-2 w-full',
})``;

export const Label = styled.h3.attrs({
  className: 'text-ui-800 font-bold pb-0.5 tablet:pb-0',
})``;

export const LabelWrapper = styled.div.attrs({
  className: 'w-full tablet:w-3/12',
})``;

export const TextContent = styled.span.attrs({
  className: 'text-base text-ui-500 font-normal capitalize',
})``;

export const Footer = styled.div.attrs({
  className:
    'flex flex-row-reverse tablet:flex-row justify-between tablet:justify-start',
})``;

export const ActionWrapper = styled.div.attrs({
  className: 'order-first tablet:md:order-last w-fit tablet:w-3/12',
})``;
