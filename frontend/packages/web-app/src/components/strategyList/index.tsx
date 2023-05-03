import React from 'react';
import { CardToken } from '@aragon/ui-components';
import { Strategy } from 'utils/paths';
import { useNetwork } from 'context/network';

import {
  generatePath,
  useNavigate,
} from 'react-router-dom';

type StrategyListProps = {
  groups: any[];
  dao: string
};

// TODO: Pass in current locale to usd value
const StrategyList: React.FC<StrategyListProps> = ({ groups, dao }) => {

  const navigate = useNavigate();
  const { network } = useNetwork();


  if (groups?.length === 0)
    return <p data-testid="StrategyList">{"No strategies"}</p>;


  const handleOnClick = (e: any) => {
    const id = e.currentTarget.id
    navigate(generatePath(Strategy, { network, dao, id }));
  };

  return (
    <div className="space-y-1.5" data-testid="StrategyList">
      {groups?.map(groups => (
        <div
          onClick={(e) => handleOnClick(e)}
          className='cursor-pointer'
          id={groups.vault}
          >
          <CardToken
            key={groups.vault}
            tokenName={groups.name}
            tokenSymbol={''}
            tokenImageUrl={''}
            tokenCount={""}
            treasuryShare={`$ ${groups.balance}`}
          />
        </div>
      ))}
    </div>
  );
};

export default StrategyList;
