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

window.Buffer = window.Buffer || buffer;

interface RootProps {
    store: Store;
}

const theme = getDefaultTheme();
const customTheme = merge(darkTheme(), { colors: { modalBackground: ThemeMap[theme].background.primary } });
queryConnector.setQueryClient();

const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();
    return (
        <ErrorBoundary fallback={<UnexpectedError theme={ThemeMap[theme]} />} onError={() => {}}>
            <QueryClientProvider client={queryConnector.queryClient}>
                <Provider store={store}>
                    <AuthCoreContextProvider
                        options={{
                            projectId: '2b8c8b75-cc7a-4111-923f-0043b9fa908b',
                            clientKey: 'cS3khABdBgfK4m8CzYcL1xcgVM6cuflmNY6dFxdY',
                            appId: 'aab773d8-c4e9-43ae-aa57-0d898f3dbf46',
                            language: 'en',
                            wallet: {
                                visible: false,
                            },
                        }}
                    >
                        <WagmiProvider config={wagmiConfig}>
                            <RainbowKitProvider
                                theme={customTheme}
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
