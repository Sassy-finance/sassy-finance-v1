import React from 'react';
import { CardToken } from '@aragon/ui-components';
import { Strategy, StrategyNFT } from 'utils/paths';
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

    const vault = id.split("-")[0]
    const key = id.split("-")[1]

    if(key == '1'){
      console.log('si voy')
      navigate(generatePath(StrategyNFT, { network, dao, id: vault }));
    }else {
      navigate(generatePath(Strategy, { network, dao, id: vault }));
    }
  };

  return (
    <div className="space-y-1.5" data-testid="StrategyList">
      {groups?.map((groups, index) => (
        <div
          onClick={(e) => handleOnClick(e)}
          className='cursor-pointer'
          id={`${groups.vault}-${index}`}
          key={index}
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
