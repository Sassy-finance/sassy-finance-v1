import {useReactiveVar} from '@apollo/client';
import {
  SortDirection,
  Transfer,
  TransferSortBy,
  TransferType,
} from '@aragon/sdk-client';
import {Address} from '@aragon/ui-components/dist/utils/addresses';
import {useEffect, useState} from 'react';

import {pendingDeposits} from 'context/apolloClient';
import {HookData} from 'utils/types';
import {useClient} from './useClient';
import {PENDING_DEPOSITS_KEY} from 'utils/constants';
import {customJSONReplacer} from 'utils/library';

export type IAssetTransfers = Transfer[];

export const useDaoTransfers = (
  daoAddressOrEns: Address
): HookData<Transfer[]> => {
  const {client} = useClient();

  const [data, setData] = useState<Transfer[]>([]);
  const [error, setError] = useState<Error>();
  const [isLoading, setIsLoading] = useState(false);
  const pendingDepositsTxs = useReactiveVar(pendingDeposits);

  useEffect(() => {
    async function getTransfers() {
      try {
        setIsLoading(true);

        const transfers = await client?.methods.getDaoTransfers({
          sortBy: TransferSortBy.CREATED_AT,
          daoAddressOrEns,
          direction: SortDirection.DESC,
        });

        if (transfers?.length) {
          const deposits = transfers.filter(
            t => t.type === TransferType.DEPOSIT
          );

          for (let i = 0; i < pendingDepositsTxs.length; ) {
            const tx = pendingDepositsTxs[i];

            for (let j = 0; j < deposits.length; j++) {
              const deposit = deposits[j];
              if (deposit.transactionId === tx.transactionId) {
                pendingDepositsTxs.splice(i, 1);
                break;
              }
              if (j === deposits.length - 1) {
                i++;
              }
            }
          }

          localStorage.setItem(
            PENDING_DEPOSITS_KEY,
            JSON.stringify(pendingDepositsTxs, customJSONReplacer)
          );

          setData([...pendingDepositsTxs, ...transfers]);
        }
      } catch (error) {
        console.error(error);
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    getTransfers();
  }, [client?.methods, daoAddressOrEns, pendingDepositsTxs]);

  return {data, error, isLoading};
};
