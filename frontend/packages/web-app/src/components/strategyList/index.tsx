import React from 'react';
import {CardToken} from '@aragon/ui-components';
import {useTranslation} from 'react-i18next';

type StrategyListProps = {
  groups: any[];
};

// TODO: Pass in current locale to usd value
const StrategyList: React.FC<StrategyListProps> = ({groups}) => {
  const {t} = useTranslation();

  if (groups?.length === 0)
    return <p data-testid="StrategyList">{"No strategies"}</p>;

  return (
    <div className="space-y-1.5" data-testid="StrategyList">
      {groups?.map(groups => (
        <CardToken
          key={groups.vault}
          tokenName={groups.name}
          tokenSymbol={''}
          tokenImageUrl={''}
          tokenCount={""}
          treasuryShare={`$ ${groups.balance}`}
        />
      ))}
    </div>
  );
};

export default StrategyList;
