import { CardText } from '@aragon/ui-components';
import { AccordionMethod } from 'components/accordionMethod';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

export const BuyNFTCard: React.FC<{
  action: any
}> = ({ action }) => {
  const { t } = useTranslation();

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={'Buy NFT'}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={'Buy NFT'}
    >
      <Container>
        <CardText title='Token collection' content={action.collection} type='label' />
        <CardText title='price' content={action.price} type='label' />
        <NFTImage src={action.url} />
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 rounded-b-xl border border-t-0 border-ui-100 space-y-3 p-3',
})``;


const NFTImage = styled.img.attrs(({src}) => ({
  className: '',
  src,
}))``;