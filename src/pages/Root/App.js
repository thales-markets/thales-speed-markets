import Loader from 'components/Loader';
import UnsupportedNetwork from 'components/UnsupportedNetwork';
import { SUPPORTED_NETWORKS_NAMES } from 'constants/network';
import ROUTES from 'constants/routes';
import ThemeProvider from 'layouts/Theme';
import { Suspense, lazy, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Redirect, Route, Router, Switch } from 'react-router-dom';
import { setAppReady } from 'redux/modules/app';
import { setIsMobile } from 'redux/modules/ui';
import { getSwitchToNetworkId, switchToNetworkId, updateNetworkSettings, updateWallet } from 'redux/modules/wallet';
import { createGlobalStyle } from 'styled-components';
import { isMobile } from 'utils/device';
import { getSupportedNetworksByRoute, isNetworkSupported } from 'utils/network';
import queryConnector from 'utils/queryConnector';
import { history } from 'utils/routes';
import snxJSConnector from 'utils/snxJSConnector';
import { useAccount, useChainId, useConnectorClient, useDisconnect, useWalletClient } from 'wagmi';

const DappLayout = lazy(() => import(/* webpackChunkName: "DappLayout" */ 'layouts/DappLayout'));

const SpeedMarkets = lazy(() => import(/* webpackChunkName: "SpeedMarkets" */ '../SpeedMarkets'));
const SpeedMarketsOverview = lazy(() =>
    import(/* webpackChunkName: "SpeedMarketsOverview" */ '../SpeedMarketsOverview')
);
const Profile = lazy(() => import(/* webpackChunkName: "Profile" */ '../Profile'));

const App = () => {
    const dispatch = useDispatch();

    const networkId = useChainId();
    const switchedToNetworkId = useSelector((state) => getSwitchToNetworkId(state));

    const { address } = useAccount();
    const provider = useConnectorClient(!address && { chainId: switchedToNetworkId }); // when wallet not connected force chain
    const { data: signer } = useWalletClient();
    const { disconnect } = useDisconnect();

    queryConnector.setQueryClient();

    useEffect(() => {
        const init = async () => {
            try {
                const chainIdFromProvider = (await provider.getNetwork()).chainId;
                const providerNetworkId = !!address ? chainIdFromProvider : switchedToNetworkId;

                snxJSConnector.setContractSettings({
                    networkId: providerNetworkId,
                    provider,
                    signer,
                });

                dispatch(
                    updateNetworkSettings({
                        networkId: providerNetworkId,
                        networkName: SUPPORTED_NETWORKS_NAMES[providerNetworkId]?.toLowerCase(),
                    })
                );
                dispatch(setAppReady());
            } catch (e) {
                if (!e.toString().includes('Error: underlying network changed')) {
                    dispatch(setAppReady());
                    console.log(e);
                }
            }
        };
        init();
    }, [dispatch, provider, signer, switchedToNetworkId, address]);

    useEffect(() => {
        dispatch(updateWallet({ walletAddress: address }));
    }, [address, dispatch]);

    useEffect(() => {
        if (window.ethereum) {
            window.ethereum.on('chainChanged', (chainIdParam) => {
                const chainId = Number.isInteger(chainIdParam) ? chainIdParam : parseInt(chainIdParam, 16);

                if (!address && isNetworkSupported(chainId)) {
                    // when wallet disconnected reflect network change from browser wallet to dApp
                    dispatch(switchToNetworkId({ networkId: chainId }));
                }
            });
        }
    }, [dispatch, address]);

    useEffect(() => {
        if (isNetworkSupported(networkId)) {
            disconnect();
        }
    }, [disconnect, networkId]);

    useEffect(() => {
        const handlePageResized = () => {
            dispatch(setIsMobile(isMobile()));
        };

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
            {/* <ReactQueryDevtools initialIsOpen={false} /> */}

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
