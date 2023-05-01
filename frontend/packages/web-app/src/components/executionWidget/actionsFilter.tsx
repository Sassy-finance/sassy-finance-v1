import React from 'react';

import {useDaoDetails} from 'hooks/useDaoDetails';
import {useDaoParam} from 'hooks/useDaoParam';
import {Action} from 'utils/types';
import {AddAddressCard} from './actions/addAddressCard';
import {MintTokenCard} from './actions/mintTokenCard';
import {ModifyMetadataCard} from './actions/modifyMetadataCard';
import {ModifyMultisigSettingsCard} from './actions/modifyMultisigSettingsCard';
import {ModifyMvSettingsCard} from './actions/modifySettingsCard';
import {RemoveAddressCard} from './actions/removeAddressCard';
import {WithdrawCard} from './actions/withdrawCard';
import {CreateGroupCard} from './actions/createGroupCard';

type ActionsFilterProps = {
  action: Action;
};

export const ActionsFilter: React.FC<ActionsFilterProps> = ({action}) => {
  const {data: daoId} = useDaoParam();
  const {data: dao} = useDaoDetails(daoId);

  // all actions have names
  switch (action.name) {
    case 'withdraw_assets':
      return (
        <WithdrawCard action={action} daoName={dao?.metadata?.name || ''} />
      );
    case 'add_address':
      return <AddAddressCard action={action} />;
    case 'remove_address':
      return <RemoveAddressCard action={action} />;
    case 'mint_tokens':
      return <MintTokenCard action={action} />;
    case 'modify_metadata':
      return <ModifyMetadataCard action={action} />;
    case 'modify_token_voting_settings':
      return <ModifyMvSettingsCard action={action} />;
    case 'modify_multisig_voting_settings':
      return <ModifyMultisigSettingsCard action={action} />;
    case 'create_group':
        return <CreateGroupCard action={action} daoName={dao?.metadata?.name || ''} />;
    default:
      return <></>;
  }
};
