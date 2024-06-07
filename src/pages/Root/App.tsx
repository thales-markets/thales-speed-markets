import { createSmartAccountClient } from '@biconomy/account';
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
import { useChainId, useConnect, useDisconnect, useSwitchChain, useWalletClient } from 'wagmi';
import enTranslation from '../../i18n/en.json';
import biconomyConnector from 'utils/biconomyWallet';
import { setIsBiconomy } from 'redux/modules/wallet';
import { particleWagmiWallet } from 'utils/particleWallet/particleWagmiWallet';
import { useConnect as useParticleConnect } from '@particle-network/auth-core-modal';
import { AuthCoreEvent, getLatestAuthType, particleAuth, SocialAuthType } from '@particle-network/auth-core';
import { isSocialLogin } from 'utils/particleWallet/utils';

const App = () => {
    const dispatch = useDispatch();
    const networkId = useChainId();
    const { data: walletClient } = useWalletClient();
    const { switchChain } = useSwitchChain();
    const { disconnect } = useDisconnect();
    const { connect } = useConnect();
    const { connectionStatus } = useParticleConnect();

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

        if (walletClient && isSocialLogin(getLatestAuthType())) {
            const bundlerUrl = `https://bundler.biconomy.io/api/v2/${networkId}/${
                import.meta.env.VITE_APP_BICONOMY_BUNDLE_KEY
            }`;

            const createSmartAccount = async () => {
                const PAYMASTER_API_KEY = import.meta.env['VITE_APP_PAYMASTER_KEY_' + networkId];
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
        if (connectionStatus === 'connected' && isSocialLogin(getLatestAuthType())) {
            connect({
                connector: particleWagmiWallet({
                    socialType: getLatestAuthType() as SocialAuthType,
                    id: 'adqd',
                }) as any,
                chainId: networkId,
            });
        }
        const onDisconnect = () => {
            dispatch(setIsBiconomy(false));
            disconnect();
        };
        particleAuth.on(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
        return () => {
            particleAuth.off(AuthCoreEvent.ParticleAuthDisconnect, onDisconnect);
        };
    }, [connect, connectionStatus, disconnect, networkId, dispatch]);

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
    html {
        scroll-behavior: smooth;
        scrollbar-color: ${(props) => props.theme.background.quinary} transparent;
    }
    body {
        background: ${(props) => props.theme.background.primary};
    }
    body #root {
        background: ${(props) => props.theme.background.primary};
    }

    .rc-tooltip-placement-top .rc-tooltip-arrow,
    .rc-tooltip-placement-topLeft .rc-tooltip-arrow,
    .rc-tooltip-placement-topRight .rc-tooltip-arrow {
        border-top-color: ${(props) => props.theme.borderColor.quaternary};
    }
    .rc-tooltip-placement-right .rc-tooltip-arrow,
    .rc-tooltip-placement-rightTop .rc-tooltip-arrow,
    .rc-tooltip-placement-rightBottom .rc-tooltip-arrow {
        border-right-color: ${(props) => props.theme.borderColor.quaternary};
    }
    .rc-tooltip-placement-left .rc-tooltip-arrow,
    .rc-tooltip-placement-leftTop .rc-tooltip-arrow,
    .rc-tooltip-placement-leftBottom .rc-tooltip-arrow {
        border-left-color: ${(props) => props.theme.borderColor.quaternary};
    }
    .rc-tooltip-placement-bottom .rc-tooltip-arrow,
    .rc-tooltip-placement-bottomLeft .rc-tooltip-arrow,
    .rc-tooltip-placement-bottomRight .rc-tooltip-arrow {
        border-bottom-color: ${(props) => props.theme.borderColor.quaternary};
    }
`;

export default App;
