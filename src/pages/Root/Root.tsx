import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { QueryClientProvider } from '@tanstack/react-query';
import { Buffer as buffer } from 'buffer';
import UnexpectedError from 'components/UnexpectedError';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import { ThemeMap } from 'constants/ui';
import { merge } from 'lodash';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import queryConnector from 'utils/queryConnector';
import { getDefaultTheme } from 'utils/style';
import { WagmiProvider } from 'wagmi';
import App from './App';
import { wagmiConfig } from './wagmiConfig';
import { AuthCoreContextProvider } from '@particle-network/auth-core-modal';
import { PARTICLE_STYLE } from 'utils/particleWallet/utils';

window.Buffer = window.Buffer || buffer;

interface RootProps {
    store: Store;
}

const theme = getDefaultTheme();
const rainbowCustomTheme = merge(darkTheme(), {
    colors: {
        accentColor: ThemeMap[theme].textColor.primary,
        accentColorForeground: ThemeMap[theme].button.textColor.secondary,
        modalBackground: ThemeMap[theme].background.primary,
        modalBorder: ThemeMap[theme].borderColor.primary,
        profileForeground: ThemeMap[theme].background.primary,
        closeButton: ThemeMap[theme].button.textColor.tertiary,
        closeButtonBackground: ThemeMap[theme].button.background.primary,
        actionButtonBorder: 'transparent',
    },
    shadows: { dialog: ThemeMap[theme].borderColor.primary },
    radii: { menuButton: '8px' },
});

queryConnector.setQueryClient();

const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();
    return (
        <ErrorBoundary fallback={<UnexpectedError theme={ThemeMap[theme]} />} onError={() => {}}>
            <QueryClientProvider client={queryConnector.queryClient}>
                <Provider store={store}>
                    <AuthCoreContextProvider
                        options={{
                            projectId: import.meta.env.VITE_APP_PARTICLE_PROJECT_ID,
                            clientKey: import.meta.env.VITE_APP_PARTICLE_CLIENT_KEY,
                            appId: import.meta.env.VITE_APP_PARTICLE_API_ID,
                            language: 'en',
                            wallet: {
                                visible: false,
                            },
                            themeType: 'dark',
                            customStyle: PARTICLE_STYLE,
                        }}
                    >
                        <WagmiProvider config={wagmiConfig}>
                            <RainbowKitProvider
                                theme={rainbowCustomTheme}
                                appInfo={{
                                    appName: 'SpeedMarkets',
                                    disclaimer: WalletDisclaimer,
                                }}
                            >
                                <App />
                            </RainbowKitProvider>
                        </WagmiProvider>
                    </AuthCoreContextProvider>
                </Provider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default Root;
