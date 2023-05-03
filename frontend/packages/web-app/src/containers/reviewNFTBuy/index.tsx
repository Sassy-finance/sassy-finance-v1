import {Erc20TokenDetails, InstalledPluginListItem} from '@aragon/sdk-client';
import {Link, VoterType} from '@aragon/ui-components';
import TipTapLink from '@tiptap/extension-link';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {format} from 'date-fns';
import React, {useEffect, useMemo} from 'react';
import {useFormContext} from 'react-hook-form';
import {TFunction, useTranslation} from 'react-i18next';
import {useParams} from 'react-router-dom';
import styled from 'styled-components';

import {ExecutionWidget} from 'components/executionWidget';
import {useFormStep} from 'components/fullScreenStepper';
import ResourceList from 'components/resourceList';
import {Loading} from 'components/temporary';
import {VotingTerminal} from 'containers/votingTerminal';
import {useDaoDetails} from 'hooks/useDaoDetails';
import {MultisigMember, useDaoMembers} from 'hooks/useDaoMembers';
import {PluginTypes} from 'hooks/usePluginClient';
import {
  isMultisigVotingSettings,
  isTokenVotingSettings,
  usePluginSettings,
} from 'hooks/usePluginSettings';
import {useTokenSupply} from 'hooks/useTokenSupply';
import {
  getCanonicalDate,
  getCanonicalTime,
  getCanonicalUtcOffset,
  getFormattedUtcOffset,
  KNOWN_FORMATS,
  minutesToMills,
} from 'utils/date';
import {getErc20VotingParticipation, getNonEmptyActions} from 'utils/proposals';
import {ProposalResource, SupportedVotingSettings} from 'utils/types';
import { SwapTokensCard } from 'components/executionWidget/actions/swapTokensCard';
import { BuyNFTCard } from 'components/executionWidget/actions/buyNFTCard';

type ReviewProposalProps = {
};

const ReviewNFTBuy: React.FC<ReviewProposalProps> = ({
}) => {
  const {t} = useTranslation();
  const {setStep} = useFormStep();

  const {dao} = useParams();
  const {data: daoDetails} = useDaoDetails(dao!);
  const {id: pluginType, instanceAddress: pluginAddress} =
    daoDetails?.plugins[0] || ({} as InstalledPluginListItem);

  const {data: daoSettings} = usePluginSettings(
    pluginAddress,
    pluginType as PluginTypes
  );

  const {
    data: {members, daoToken},
  } = useDaoMembers(pluginAddress, pluginType as PluginTypes);

  const {data: totalSupply} = useTokenSupply(daoToken?.address as string);

  const {getValues, setValue} = useFormContext();
  const values = getValues();

  console.log(values)

  const editor = useEditor({
    editable: false,
    content: values.proposal,
    extensions: [
      StarterKit,
      TipTapLink.configure({
        openOnClick: false,
      }),
    ],
  });

  const terminalProps = useMemo(
    () =>
      getReviewProposalTerminalProps(
        t,
        daoSettings,
        members,
        daoToken,
        totalSupply?.raw
      ),
    [daoSettings, daoToken, members, t, totalSupply?.raw]
  );

  /*************************************************
   *                    Effects                    *
   *************************************************/
  useEffect(() => {
    if (values.proposal === '<p></p>') {
      setValue('proposal', '');
    }
  }, [setValue, values.proposal]);

  /*************************************************
   *                    Render                     *
   *************************************************/
  if (!editor) {
    return null;
  }

  if (!terminalProps) return <Loading />;

  return (
    <>
      <SummaryText>{values.proposalSummary}</SummaryText>
      <ContentContainer>
        <BuyNFTCard 
        action={values.actions[0]}
        />
      </ContentContainer>
    </>
  );
};

export default ReviewNFTBuy;

const Header = styled.p.attrs({className: 'font-bold text-ui-800 text-3xl'})``;

const BadgeContainer = styled.div.attrs({
  className: 'tablet:flex items-baseline mt-3 tablet:space-x-3',
})``;

const ProposerLink = styled.p.attrs({
  className: 'mt-1.5 tablet:mt-0 text-ui-500',
})``;

const SummaryText = styled.p.attrs({
  className: 'text-lg text-ui-600 mt-3',
})``;

const ProposalContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-3/5',
})``;

const AdditionalInfoContainer = styled.div.attrs({
  className: 'space-y-3 tablet:w-2/5',
})``;

const ContentContainer = styled.div.attrs({
  className: 'mt-3 tablet:flex tablet:space-x-3 space-y-3 tablet:space-y-0',
})``;

export const StyledEditorContent = styled(EditorContent)`
  flex: 1;

  .ProseMirror {
    :focus {
      outline: none;
    }

    ul {
      list-style-type: decimal;
      padding: 0 1rem;
    }

    ol {
      list-style-type: disc;
      padding: 0 1rem;
    }

    a {
      color: #003bf5;
      cursor: pointer;
      font-weight: 700;

      :hover {
        color: #0031ad;
      }
    }
  }
`;

// this is slightly different from
function getReviewProposalTerminalProps(
  t: TFunction,
  daoSettings: SupportedVotingSettings,
  daoMembers: Array<MultisigMember> | undefined,
  daoToken: Erc20TokenDetails | undefined,
  totalSupply: bigint | undefined
) {
  if (isMultisigVotingSettings(daoSettings)) {
    return {
      minApproval: daoSettings.minApprovals,
      strategy: t('votingTerminal.multisig'),
      voteOptions: t('votingTerminal.approve'),
      approvals: [],
      voters:
        daoMembers?.map(
          m => ({wallet: m.address, option: 'none'} as VoterType)
        ) || [],
    };
  }

  if (isTokenVotingSettings(daoSettings) && daoToken && totalSupply) {
    // calculate participation
    const {currentPart, currentPercentage, minPart, missingPart, totalWeight} =
      getErc20VotingParticipation(
        daoSettings.minParticipation,
        BigInt(0),
        totalSupply,
        daoToken.decimals
      );

    return {
      currentParticipation: t('votingTerminal.participationErc20', {
        participation: currentPart,
        totalWeight,
        tokenSymbol: daoToken.symbol,
        percentage: currentPercentage,
      }),

      minParticipation: t('votingTerminal.participationErc20', {
        participation: minPart,
        totalWeight,
        tokenSymbol: daoToken.symbol,
        percentage: Math.round(daoSettings.minParticipation * 100),
      }),

      missingParticipation: missingPart,

      strategy: t('votingTerminal.tokenVoting'),
      voteOptions: t('votingTerminal.yes+no'),
      supportThreshold: Math.round(daoSettings.supportThreshold * 100),
    };
  }
}
