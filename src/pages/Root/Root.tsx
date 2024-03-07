import { RainbowKitProvider, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import UnexpectedError from 'components/UnexpectedError';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import { ThemeMap } from 'constants/ui';
import { merge } from 'lodash';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { getDefaultTheme } from 'utils/style';
import { WagmiProvider } from 'wagmi';
import App from './App';
import { wagmiConfig } from './wagmi-config';
import { QueryClientProvider } from '@tanstack/react-query';
import queryConnector from 'utils/queryConnector';
import { Buffer as buffer } from 'buffer';
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
                </Provider>
            </QueryClientProvider>
        </ErrorBoundary>
    );
};

export default Root;
