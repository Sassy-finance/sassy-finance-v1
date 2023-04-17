// This file is a placeholder for the eventual emergence
// of a caching service provided by separate server
// For now most of these methods will be passed the reactive
// variables from Apollo-client
import {NavigationDao} from 'context/apolloClient';
import {sleepFor} from 'utils/library';

/**
 * Fetch a list of favorited DAOs
 * @param cache favorited DAOs cache (to be replaced when migrating to server)
 * @param options query options
 * @returns list of favorited DAOs based on given options
 */
export async function getFavoritedDaosFromCache(
  cache: Array<NavigationDao>,
  options: {skip: number; limit: number}
): Promise<NavigationDao[]> {
  const {skip, limit} = options;

  // sleeping for 600 ms because the immediate apparition of DAOS creates a flickering issue
  await sleepFor(600);
  return Promise.resolve(cache.slice(skip, skip + limit));
}
