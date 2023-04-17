import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {NotFound} from 'utils/paths';
import {useDaoDetails} from './useDaoDetails';

/**
 * This hook queries the current URL for a the DAO address and validates that a
 * DAO with this address exists. This is done querying subgraph for a dao with
 * the id parsed from the URL. If the dao exists, the id is simply returned. If
 * it does not exist, the user is redirected to the 404 page.
 *
 * @returns A DAO id from SDK.
 */
export function useDaoParam() {
  const {dao} = useParams();

  // NOTE At this point, daoParam will always be defined.
  const {data, error, isLoading, waitingForSubgraph} = useDaoDetails(
    dao! as string
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoading) {
      return;
    } else if (error || data === null) {
      navigate(NotFound, {replace: true, state: {incorrectDao: dao}});
    }
  }, [dao, data, error, isLoading, navigate]);

  return {
    daoDetails: data,
    data: (dao as string).toLowerCase(),
    error,
    isLoading,
    waitingForSubgraph,
  };
}
