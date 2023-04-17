import {ProposalStatus} from '@aragon/sdk-client';
import {
  ButtonGroup,
  ButtonText,
  IconAdd,
  IconChevronDown,
  Option,
  Spinner,
} from '@aragon/ui-components';
import {withTransaction} from '@elastic/apm-rum-react';
import React, {useEffect, useState} from 'react';
import {useTranslation} from 'react-i18next';
import {useNavigate} from 'react-router-dom';
import styled from 'styled-components';

import ProposalList from 'components/proposalList';
import {Loading} from 'components/temporary';
import {PageWrapper} from 'components/wrappers';
import {useDaoParam} from 'hooks/useDaoParam';
import {PluginTypes} from 'hooks/usePluginClient';
import {useProposals} from 'hooks/useProposals';
import NoProposals from 'public/noProposals.svg';
import {erc20VotingProposals_erc20VotingProposals} from 'queries/__generated__/erc20VotingProposals';
import {trackEvent} from 'services/analytics';
import {ProposalListItem} from 'utils/types';
import {htmlIn} from 'utils/htmlIn';

const Governance: React.FC = () => {
  const {
    data: dao,
    daoDetails: daoDetails,
    isLoading: isDaoLoading,
  } = useDaoParam();

  // The number of proposals displayed on each page
  const PROPOSALS_PER_PAGE = 6;
  const [skip, setSkip] = useState(0);
  const [endReached, setEndReached] = useState(false);
  const [filterValue, setFilterValue] = useState<ProposalStatus | 'All'>('All');

  const {
    data: proposals,
    isInitialLoading,
    isLoading,
    isLoadingMore,
  } = useProposals(
    daoDetails?.address as string,
    daoDetails?.plugins[0].id as PluginTypes,
    PROPOSALS_PER_PAGE,
    skip,
    filterValue !== 'All' ? filterValue : undefined
  );

  const [displayedProposals, setDisplayedProposals] = useState<
    ProposalListItem[]
  >([]);

  useEffect(() => {
    if (!isInitialLoading) {
      if (!proposals.length) {
        setEndReached(true);
      }

      setDisplayedProposals(prev => [...(prev || []), ...proposals]);
    }
  }, [isInitialLoading, proposals]);

  const {t} = useTranslation();
  const navigate = useNavigate();

  const handleShowMoreClick = () => {
    if (!isDaoLoading) setSkip(prev => prev + PROPOSALS_PER_PAGE);
  };

  if (isInitialLoading) {
    return <Loading />;
  }

  if (
    !isInitialLoading &&
    !isLoading &&
    !displayedProposals?.length &&
    filterValue === 'All'
  ) {
    return (
      <>
        <Container>
          <EmptyStateContainer>
            <ImageContainer src={NoProposals} />
            <EmptyStateHeading>
              {t('governance.emptyState.title')}
            </EmptyStateHeading>
            <span
              className="mt-1.5 lg:w-1/2 text-center"
              dangerouslySetInnerHTML={{
                __html: htmlIn(t)('governance.emptyState.subtitle'),
              }}
            ></span>
            <ButtonText
              size="large"
              label="New Proposal"
              iconLeft={<IconAdd />}
              className="mt-4"
              onClick={() => {
                trackEvent('governance_newProposalBtn_clicked', {
                  dao_address: dao,
                });
                navigate('new-proposal');
              }}
            />
          </EmptyStateContainer>
        </Container>
      </>
    );
  }
  return (
    <>
      <PageWrapper
        title={'Proposals'}
        primaryBtnProps={{
          label: t('governance.action'),
          iconLeft: <IconAdd />,
          onClick: () => {
            trackEvent('governance_newProposalBtn_clicked', {
              dao_address: dao,
            });
            navigate('new-proposal');
          },
        }}
      >
        <ButtonGroupContainer>
          <ButtonGroup
            bgWhite
            defaultValue={filterValue}
            onChange={(selected: string) => {
              setFilterValue(selected as ProposalStatus | 'All');
              setDisplayedProposals([]);
              setSkip(0);
              setEndReached(false);
            }}
          >
            <Option value="All" label="All" />
            <Option value="Pending" label="Pending" />
            <Option value="Active" label="Active" />
            <Option value="Succeeded" label="Succeeded" />
            <Option value="Executed" label="Executed" />
            <Option value="Defeated" label="Defeated" />
          </ButtonGroup>
        </ButtonGroupContainer>
        <ListWrapper>
          <ProposalList
            proposals={displayedProposals}
            pluginAddress={daoDetails?.plugins[0].instanceAddress as string}
            pluginType={daoDetails?.plugins[0].id as PluginTypes}
            isLoading={isLoading}
          />
        </ListWrapper>

        {!endReached && displayedProposals?.length > 0 && (
          <div className="mt-3">
            <ButtonText
              label={t('explore.explorer.showMore')}
              iconRight={
                isLoadingMore ? <Spinner size="xs" /> : <IconChevronDown />
              }
              bgWhite
              mode="ghost"
              onClick={handleShowMoreClick}
            />
          </div>
        )}
      </PageWrapper>
    </>
  );
};

export default withTransaction('Governance', 'component')(Governance);

export const Container = styled.div.attrs({
  className: 'col-span-full desktop:col-start-3 desktop:col-end-11',
})``;

const ButtonGroupContainer = styled.div.attrs({
  className: 'flex overflow-auto mt-3 desktop:mt-8',
})`
  scrollbar-width: none;

  ::-webkit-scrollbar {
    width: 0px;
    background: transparent;
  }
`;

const ListWrapper = styled.div.attrs({
  className: 'mt-3',
})``;

export const EmptyStateContainer = styled.div.attrs({
  className:
    'flex flex-col w-full items-center py-4 px-3 tablet:py-12 tablet:px-6 mx-auto mt-3 tablet:mt-5 text-lg bg-white rounded-xl text-ui-500',
})``;

const ImageContainer = styled.img.attrs({
  className: 'object-cover w-1/2',
})``;

export const EmptyStateHeading = styled.h1.attrs({
  className: 'mt-4 text-2xl font-bold text-ui-800 text-center',
})``;

export interface CategorizedProposal
  extends erc20VotingProposals_erc20VotingProposals {
  type: 'draft' | 'pending' | 'active' | 'succeeded' | 'executed' | 'defeated';
}

/**
 * Takes and uncategorized proposal and categorizes it according to definitions.
 * @param uncategorizedProposal
 * @returns categorized proposal (i.e., uncategorizedProposal with additional
 * type field)
 */
export function categorizeProposal(
  uncategorizedProposal: erc20VotingProposals_erc20VotingProposals
): CategorizedProposal {
  const now = Date.now();
  //onchain data coming in as seconds. Convert to milliseconds to compare with now.
  const start =
    Number.parseInt(uncategorizedProposal.startDate as string) * 1000;
  const end = Number.parseInt(uncategorizedProposal.endDate as string) * 1000;

  if (start >= now) {
    return {
      ...uncategorizedProposal,
      type: 'pending',
    };
  } else if (end >= now) {
    return {
      ...uncategorizedProposal,
      type: 'active',
    };
  } else if (uncategorizedProposal.executed) {
    return {
      ...uncategorizedProposal,
      type: 'executed',
    };
  } else if (uncategorizedProposal.yea > uncategorizedProposal.nay) {
    return {
      ...uncategorizedProposal,
      type: 'succeeded',
    };
  } else {
    return {
      ...uncategorizedProposal,
      type: 'defeated',
    };
  }
}
