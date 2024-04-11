import { createSmartAccountClient } from '@biconomy/account';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Loader from 'components/Loader';
import UnsupportedNetwork from 'components/UnsupportedNetwork';
import ROUTES from 'constants/routes';
import DappLayout from 'layouts/DappLayout';
import ThemeProvider from 'layouts/Theme';
import Profile from 'pages/Profile';
import SpeedMarkets from 'pages/SpeedMarkets';
import SpeedMarketsOverview from 'pages/SpeedMarketsOverview';
import { Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady } from 'redux/modules/app';
import { setIsMobile } from 'redux/modules/ui';
import { createGlobalStyle } from 'styled-components';
import { SupportedNetwork } from 'types/network';
import { isMobile } from 'utils/device';
import { getSupportedNetworksByRoute, isNetworkSupported } from 'utils/network';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import { useChainId, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import enTranslation from '../../i18n/en.json';
import biconomyConnector from 'utils/biconomyWallet';
import { setIsBiconomy } from 'redux/modules/wallet';

import Deposit from 'pages/AARelatedPages/Deposit';
import Withdraw from 'pages/AARelatedPages/Withdraw';

const App = () => {
    const dispatch = useDispatch();
    const networkId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();

    // particle context provider is overriding our i18n configuration and languages, so we need to add our localization after the initialization of particle context
    // initialization of particle context is happening in Root
    const { i18n } = useTranslation();
    i18n.addResourceBundle('en', 'translation', enTranslation, true);

    queryConnector.setQueryClient();

    useEffect(() => {
        dispatch(setAppReady());
    }, [dispatch]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainIdParam: string) => {
                const ethereumChainId = Number.isInteger(chainIdParam)
                    ? Number(chainIdParam)
                    : parseInt(chainIdParam, 16);

                if (!isNetworkSupported(ethereumChainId)) {
                    // when network changed from browser wallet disconnect wallet otherwise wallet is unusable (e.g. wallet options doesn't react)
                    disconnect();
                }
                switchChain({ chainId: ethereumChainId as SupportedNetwork });
            });
        }
        if (walletClient) {
            const bundlerUrl = `https://bundler.biconomy.io/api/v2/${networkId}/${
                import.meta.env.VITE_APP_BICONOMY_BUNDLE_KEY
            }`;

            const createSmartAccount = async () => {
                const PAYMASTER_API_KEY = import.meta.env['VITE_APP_PAYMASTER_KEY_' + networkId];
                console.log(PAYMASTER_API_KEY);
                const smartAccount = await createSmartAccountClient({
                    signer: walletClient,
                    bundlerUrl: bundlerUrl,
                    biconomyPaymasterApiKey: PAYMASTER_API_KEY,
                });
                const smartAddress = await smartAccount.getAccountAddress();
                console.log(smartAddress);
                biconomyConnector.setWallet(smartAccount, smartAddress);
                dispatch(setIsBiconomy(true));
            };
            createSmartAccount();
        }
    }, [dispatch, switchChain, networkId, disconnect, walletClient]);

    useEffect(() => {
        const handlePageResized = () => {
            dispatch(setIsMobile(isMobile()));
        };

        handlePageResized();

        if (typeof window !== 'undefined') {
            window.addEventListener('resize', handlePageResized);
            window.addEventListener('orientationchange', handlePageResized);
            window.addEventListener('load', handlePageResized);
            window.addEventListener('reload', handlePageResized);
        }

        return () => {
            if (typeof window !== 'undefined') {
                window.removeEventListener('resize', handlePageResized);
                window.removeEventListener('orientationchange', handlePageResized);
                window.removeEventListener('load', handlePageResized);
                window.removeEventListener('reload', handlePageResized);
            }
        };
    }, [dispatch]);

    return (
        <ThemeProvider>
            <Router history={history}>
                <Switch>
                    {getSupportedNetworksByRoute(ROUTES.Markets.SpeedMarkets).includes(networkId) && (
                        <Route exact path={ROUTES.Markets.SpeedMarkets}>
                            <Suspense fallback={<Loader />}>
                                <DappLayout>
                                    <SpeedMarkets />
                                </DappLayout>
                            </Suspense>
                        </Route>
                    )}

                    {getSupportedNetworksByRoute(ROUTES.Markets.SpeedMarketsOverview).includes(networkId) && (
                        <Route exact path={ROUTES.Markets.SpeedMarketsOverview}>
                            <Suspense fallback={<Loader />}>
                                <DappLayout>
                                    <SpeedMarketsOverview />
                                </DappLayout>
                            </Suspense>
                        </Route>
                    )}

                    {getSupportedNetworksByRoute(ROUTES.Markets.Profile).includes(networkId) && (
                        <Route exact path={ROUTES.Markets.Profile}>
                            <Suspense fallback={<Loader />}>
                                <DappLayout>
                                    <Profile />
                                </DappLayout>
                            </Suspense>
                        </Route>
                    )}

                    {getSupportedNetworksByRoute(ROUTES.Home).includes(networkId) && (
                        <Route exact path={ROUTES.Home}>
                            <Suspense fallback={<Loader />}>
                                <DappLayout>
                                    <SpeedMarkets />
                                </DappLayout>
                            </Suspense>
                        </Route>
                    )}

                    <Route exact path={ROUTES.Deposit}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Deposit />
                            </DappLayout>
                        </Suspense>
                    </Route>

                    <Route exact path={ROUTES.Withdraw}>
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                <Withdraw />
                            </DappLayout>
                        </Suspense>
                    </Route>

                    <Route>
                        <Redirect to={ROUTES.Markets.SpeedMarkets} />
                        <Suspense fallback={<Loader />}>
                            <DappLayout>
                                {getSupportedNetworksByRoute(ROUTES.Markets.SpeedMarkets).includes(networkId) ? (
                                    <SpeedMarkets />
                                ) : (
                                    <UnsupportedNetwork
                                        supportedNetworks={getSupportedNetworksByRoute(ROUTES.Markets.SpeedMarkets)}
                                    />
                                )}
                            </DappLayout>
                        </Suspense>
                    </Route>
                </Switch>
            </Router>
            <ReactQueryDevtools initialIsOpen={false} buttonPosition={'bottom-left'} />

            <GlobalStyle />
        </ThemeProvider>
    );
};

const GlobalStyle = createGlobalStyle`
    * {
        font-family: ${(props) => props.theme.fontFamily.primary};
        font-style: normal !important;
    }
    *::-webkit-scrollbar-track {
        background: ${(props) => props.theme.background.secondary};
    }
    *::-webkit-scrollbar-thumb {
        background: ${(props) => props.theme.background.tertiary};
    }
    html {
        scroll-behavior: smooth;
        scrollbar-color: ${(props) => props.theme.background.tertiary} transparent;
    }
    body {
        background: ${(props) => props.theme.background.primary};
    }
    body #root {
        background: ${(props) => props.theme.background.primary};
    }
`;

export default App;
