import {IconLinkExternal, Link, ListItemAddress} from '@aragon/ui-components';
import React from 'react';
import {useTranslation} from 'react-i18next';
import styled from 'styled-components';

import {AccordionMethod} from 'components/accordionMethod';
import {useNetwork} from 'context/network';
import {CHAIN_METADATA} from 'utils/constants';
import {ActionMintToken} from 'utils/types';
import {useDaoMembers} from 'hooks/useDaoMembers';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';

export const MintTokenCard: React.FC<{
  action: ActionMintToken;
}> = ({action}) => {
  const {t} = useTranslation();
  const {network} = useNetwork();

  const newTotalSupply = action.summary.newTokens + action.summary.tokenSupply;
  const {data: dao} = useDaoParam();
  const {data: daoDetails} = useDaoDetails(dao);

  const {
    data: {members},
  } = useDaoMembers(
    daoDetails?.plugins[0].instanceAddress as string,
    daoDetails?.plugins[0].id as PluginTypes
  );

  const newHolders = action.inputs.mintTokensToWallets.filter(({address}) => {
    return members.find(
      (addr: {address: string}) =>
        addr.address.toUpperCase() !== address.toUpperCase()
    );
  });

  return (
    <AccordionMethod
      type="execution-widget"
      methodName={t('labels.mintTokens')}
      smartContractName={t('labels.aragonOSx')}
      verified
      methodDescription={t('newProposal.mintTokens.methodDescription')}
      additionalInfo={t('newProposal.mintTokens.additionalInfo')}
    >
      <Container>
        <div className="p-2 tablet:p-3 space-y-2 bg-ui-50">
          {action.inputs.mintTokensToWallets.map((wallet, index) => {
            const percentage = (Number(wallet.amount) / newTotalSupply) * 100;

            return wallet.address ? (
              <ListItemAddress
                key={index}
                label={wallet.address}
                src={wallet.address}
                onClick={() =>
                  window.open(
                    `${CHAIN_METADATA[network].explorer}address/${wallet.address}`,
                    '_blank'
                  )
                }
                tokenInfo={{
                  amount: parseFloat(Number(wallet.amount).toFixed(2)),
                  symbol: action.summary.daoTokenSymbol || '',
                  percentage: parseFloat(percentage.toFixed(2)),
                }}
              />
            ) : null;
          })}
        </div>

        <SummaryContainer>
          <p className="font-bold text-ui-800">{t('labels.summary')}</p>
          <HStack>
            <Label>{t('labels.newTokens')}</Label>
            <p>
              +{action.summary.newTokens} {action.summary.daoTokenSymbol}
            </p>
          </HStack>
          <HStack>
            <Label>{t('labels.newHolders')}</Label>
            <p>+{newHolders?.length}</p>
          </HStack>
          <HStack>
            <Label>{t('labels.totalTokens')}</Label>
            <p>
              {newTotalSupply} {action.summary.daoTokenSymbol}
            </p>
          </HStack>
          <HStack>
            <Label>{t('labels.totalHolders')}</Label>
            <p>
              {newHolders?.length +
                (action.summary.totalMembers || members?.length)}{' '}
            </p>
          </HStack>
          {/* TODO add total amount of token holders here. */}
          <Link
            label={t('labels.seeCommunity')}
            href={`${CHAIN_METADATA[network].explorer}/token/tokenholderchart/${action.summary.daoTokenAddress}`}
            iconRight={<IconLinkExternal />}
          />
        </SummaryContainer>
      </Container>
    </AccordionMethod>
  );
};

const Container = styled.div.attrs({
  className:
    'bg-ui-50 border divide-y border-ui-100 divide-ui-100 rounded-b-xl border-t-0',
})``;

const SummaryContainer = styled.div.attrs({
  className: 'p-2 tablet:p-3 space-y-1.5 font-bold text-ui-800',
})``;

const HStack = styled.div.attrs({
  className: 'flex justify-between',
})``;

const Label = styled.p.attrs({
  className: 'font-normal text-ui-500',
})``;
