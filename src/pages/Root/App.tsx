import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import Loader from 'components/Loader';
import UnsupportedNetwork from 'components/UnsupportedNetwork';
import ROUTES from 'constants/routes';
import DappLayout from 'layouts/DappLayout';
import MainLayout from 'layouts/MainLayout';
import ThemeProvider from 'layouts/Theme';
import LandingPage from 'pages/LandingPage';
import Profile from 'pages/Profile';
import SpeedMarkets from 'pages/SpeedMarkets';
import SpeedMarketsOverview from 'pages/SpeedMarketsOverview';
import { Suspense, useEffect } from 'react';
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
import { useAccount, useChainId, useDisconnect, useSwitchChain } from 'wagmi';

const App = () => {
    const dispatch = useDispatch();

    const networkId = useChainId();
    const { switchChain } = useSwitchChain();
    const { address } = useAccount();
    const { disconnect } = useDisconnect();

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
    }, [dispatch, address, switchChain, disconnect]);

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
                                <MainLayout>
                                    <LandingPage />
                                </MainLayout>
                            </Suspense>
                        </Route>
                    )}

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
