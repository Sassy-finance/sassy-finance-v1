import {ApolloProvider} from '@apollo/client';
import {loadConnectKit} from '@ledgerhq/connect-kit-loader';
import {QueryClient, QueryClientProvider} from '@tanstack/react-query';
import {ReactQueryDevtools} from '@tanstack/react-query-devtools';
import WalletConnectProvider from '@walletconnect/web3-provider/dist/umd/index.min.js';
import React from 'react';
import ReactDOM from 'react-dom';
import {HashRouter as Router} from 'react-router-dom';
import 'tailwindcss/tailwind.css';
import {IProviderOptions} from 'web3modal';

import {AlertProvider} from 'context/alert';
import {client, goerliClient} from 'context/apolloClient';
import {APMProvider} from 'context/elasticAPM';
import {GlobalModalsProvider} from 'context/globalModals';
import {NetworkProvider} from 'context/network';
import {PrivacyContextProvider} from 'context/privacyContext';
import {ProvidersProvider} from 'context/providers';
import {UseSignerProvider} from 'context/signer';
import {TransactionDetailProvider} from 'context/transactionDetail';
import {WalletMenuProvider} from 'context/walletMenu';
import {UseCacheProvider} from 'hooks/useCache';
import {UseClientProvider} from 'hooks/useClient';
import {infuraApiKey} from 'utils/constants';
import App from './app';

const providerOptions: IProviderOptions = {
  walletconnect: {
    package: WalletConnectProvider,
    options: {
      infuraId: infuraApiKey,
    },
  },
  ledger: {
    package: loadConnectKit, // required
    options: {
      infuraId: infuraApiKey,
    },
  },
};
// React-Query client
const queryClient = new QueryClient();

const CACHE_VERSION = 1;
const onLoad = () => {
  // Wipe local storage cache if its structure is out of date and clashes
  // with this version of the app.
  const cacheVersion = localStorage.getItem('AragonCacheVersion');
  const retainKeys = ['privacy-policy-preferences', 'favoriteDaos'];
  if (!cacheVersion || parseInt(cacheVersion) < CACHE_VERSION) {
    for (let i = 0; i < localStorage.length; i++) {
      if (!retainKeys.includes(localStorage.key(i)!)) {
        localStorage.removeItem(localStorage.key(i)!);
      }
    }
    localStorage.setItem('AragonCacheVersion', CACHE_VERSION.toString());
  }
};
onLoad();

ReactDOM.render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <PrivacyContextProvider>
        <APMProvider>
          <Router>
            <AlertProvider>
              <UseSignerProvider providerOptions={providerOptions}>
                <NetworkProvider>
                  <UseClientProvider>
                    <UseCacheProvider>
                      <ProvidersProvider>
                        <TransactionDetailProvider>
                          <WalletMenuProvider>
                            <GlobalModalsProvider>
                              {/* By default, goerli client is chosen, each useQuery needs to pass the network client it needs as argument
                      For REST queries using apollo, there's no need to pass a different client to useQuery  */}
                              <ApolloProvider
                                client={client['goerli'] || goerliClient} //TODO remove fallback when all clients are defined
                              >
                                <App />
                                <ReactQueryDevtools initialIsOpen={false} />
                              </ApolloProvider>
                            </GlobalModalsProvider>
                          </WalletMenuProvider>
                        </TransactionDetailProvider>
                      </ProvidersProvider>
                    </UseCacheProvider>
                  </UseClientProvider>
                </NetworkProvider>
              </UseSignerProvider>
            </AlertProvider>
          </Router>
        </APMProvider>
      </PrivacyContextProvider>
    </QueryClientProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
