import {useReactiveVar} from '@apollo/client';
import {IDaoQueryParams} from '@aragon/sdk-client';
import {
  InfiniteData,
  useInfiniteQuery,
  useQuery,
  UseQueryResult,
} from '@tanstack/react-query';

import {favoriteDaosVar, NavigationDao} from 'context/apolloClient';
import {getFavoritedDaosFromCache} from 'services/cache';
import {resolveDaoAvatarIpfsCid} from 'utils/library';

const DEFAULT_QUERY_PARAMS = {
  skip: 0,
  limit: 4,
};

/**
 * This hook retrieves a list of cached DAOs with optional pagination.
 * @param skip The number of DAOs to skip before starting to fetch the result set.
 * (defaults to 0)
 * @param limit The maximum number of DAOs to return. Fetches all available DAOs by default.
 * @returns result object containing an array of NavigationDao objects with added avatar information.
 */
export const useCachedDaosQuery = (
  skip = 0,
  limit = -1
): UseQueryResult<NavigationDao[]> => {
  const cachedDaos = useReactiveVar(favoriteDaosVar);

  return useQuery<NavigationDao[]>({
    queryKey: ['cachedDaos'],
    queryFn: () => getFavoritedDaosFromCache(cachedDaos, {skip, limit}),
    select: addAvatarToDaos,
    refetchOnWindowFocus: false,
  });
};

/**
 * This hook manages the pagination of cached DAOs.
 * @param enabled boolean value that indicates whether the query should be enabled or not
 * @param options.limit maximum number of DAOs to be fetched per page.
 * @returns an infinite query object that can be used to fetch and
 * display the cached DAOs.
 */
export const useCachedDaosInfiniteQuery = (
  enabled = true,
  {
    limit = DEFAULT_QUERY_PARAMS.limit,
  }: Partial<Pick<IDaoQueryParams, 'limit'>> = {}
) => {
  const cachedDaos = useReactiveVar(favoriteDaosVar);

  return useInfiniteQuery({
    queryKey: ['infiniteCachedDaos'],

    queryFn: ({pageParam = 0}) => {
      return getFavoritedDaosFromCache(cachedDaos, {
        skip: limit * pageParam,
        limit,
      });
    },

    getNextPageParam: (
      lastPage: NavigationDao[],
      allPages: NavigationDao[][]
    ) => (lastPage.length === limit ? allPages.length : undefined),

    select: augmentCachedDaos,
    enabled,
    refetchOnWindowFocus: false,
  });
};

/**
 * Augment DAOs by resolving the IPFS CID for each DAO's avatar.
 * @param data raw fetched data for the cached DAOs.
 * @returns list of DAOs augmented with the resolved IPFS CID avatars
 */
function augmentCachedDaos(data: InfiniteData<NavigationDao[]>) {
  return {
    pageParams: data.pageParams,
    pages: data.pages.flatMap(page => addAvatarToDaos(page)),
  };
}

/**
 * Add resolved IPFS CID for each DAO's avatar to the metadata.
 * @param daos array of `NavigationDao` objects representing the DAOs to be processed.
 * @returns array of augmented NavigationDao objects with resolved avatar IPFS CIDs.
 */
function addAvatarToDaos<T extends NavigationDao>(daos: T[]): T[] {
  return daos.map(dao => {
    const {metadata} = dao;
    return {
      ...dao,
      metadata: {...metadata, avatar: resolveDaoAvatarIpfsCid(metadata.avatar)},
    } as T;
  });
}
