import {useQuery} from '@apollo/client';

import {DAO_METADATA} from 'queries/dao';

export function useDaoMetadata(daoId: string) {
  const {
    data,
    error,
    loading: isLoading,
  } = useQuery(DAO_METADATA, {
    variables: {id: daoId},
  });

  return {data: data?.dao, error, isLoading};
}
