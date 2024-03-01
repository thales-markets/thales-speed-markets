import { RainbowKitProvider, connectorsForWallets, darkTheme } from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/dist/index.css';
import {
    braveWallet,
    coinbaseWallet,
    imTokenWallet,
    injectedWallet,
    ledgerWallet,
    metaMaskWallet,
    rabbyWallet,
    rainbowWallet,
    trustWallet,
    walletConnectWallet,
} from '@rainbow-me/rainbowkit/wallets';
import UnexpectedError from 'components/UnexpectedError';
import WalletDisclaimer from 'components/WalletDisclaimer';
import { PLAUSIBLE } from 'constants/analytics';
import { BlastSepolia, base, optimismSepolia, zkSyncSepolia } from 'constants/network';
import { ThemeMap } from 'constants/ui';
import dotenv from 'dotenv';
import { merge } from 'lodash';
import React from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Provider } from 'react-redux';
import { Store } from 'redux';
import { NetworkId } from 'thales-utils';
import { getDefaultTheme } from 'utils/style';
import { WagmiConfig, configureChains, createClient } from 'wagmi';
import { arbitrum, optimism, optimismGoerli, polygon, zkSync } from 'wagmi/chains';
import { infuraProvider } from 'wagmi/providers/infura';
import { jsonRpcProvider } from 'wagmi/providers/jsonRpc';
import { publicProvider } from 'wagmi/providers/public';
import App from './App';
dotenv.config();

type RpcProvider = {
    ankr: string;
    chainnode: string;
    blast: string;
};

const CHAIN_TO_RPC_PROVIDER_NETWORK_NAME: Record<number, RpcProvider> = {
    [NetworkId.OptimismMainnet]: {
        ankr: 'optimism',
        chainnode: 'optimism-mainnet',
        blast: 'optimism-mainnet',
    },
    [NetworkId.PolygonMainnet]: {
        ankr: '',
        chainnode: 'polygon-mainnet',
        blast: 'polygon-mainnet',
    },
    [NetworkId.OptimismGoerli]: { ankr: 'optimism_testnet', chainnode: 'optimism-goerli', blast: 'optimism-goerli' },
    [NetworkId.OptimismSepolia]: { ankr: '', chainnode: '', blast: '' },
    [NetworkId.Arbitrum]: { ankr: 'arbitrum', chainnode: 'arbitrum-one', blast: 'arbitrum-one' },
    [NetworkId.Base]: { ankr: 'base', chainnode: 'base-mainnet', blast: '' },
    [NetworkId.ZkSync]: { ankr: '', chainnode: '', blast: '' },
    [NetworkId.ZkSyncSepolia]: { ankr: '', chainnode: '', blast: '' },
    [NetworkId.BlastSepolia]: { ankr: '', chainnode: '', blast: '' },
};

const STALL_TIMEOUT = 2000;

const { chains, provider } = configureChains(
    [optimism, optimismGoerli, optimismSepolia, polygon, arbitrum, base, zkSync, zkSyncSepolia, BlastSepolia],
    [
        jsonRpcProvider({
            rpc: (chain) => {
                const chainnodeNetworkName = CHAIN_TO_RPC_PROVIDER_NETWORK_NAME[chain.id]?.chainnode;
                return {
                    http:
                        process.env.REACT_APP_PRIMARY_PROVIDER_ID === 'INFURA' && chain.id === NetworkId.Base
                            ? // For Base use Ankr when Infura is primary as Infura doesn't support it
                              `https://rpc.ankr.com/base/${process.env.REACT_APP_ANKR_PROJECT_ID}`
                            : chain.id === NetworkId.PolygonMainnet
                            ? // For Polygon always use Infura as Chainnode is having issues
                              `https://polygon-mainnet.infura.io/v3/${process.env.REACT_APP_INFURA_PROJECT_ID}`
                            : !!chainnodeNetworkName
                            ? `https://${chainnodeNetworkName}.chainnodes.org/${process.env.REACT_APP_CHAINNODE_PROJECT_ID}`
                            : chain.rpcUrls.default.http[0],
                };
            },
            stallTimeout: STALL_TIMEOUT,
            priority: 1,
        }),
        infuraProvider({
            apiKey: process.env.REACT_APP_INFURA_PROJECT_ID || '',
            stallTimeout: STALL_TIMEOUT,
            priority: process.env.REACT_APP_PRIMARY_PROVIDER_ID === 'INFURA' ? 0 : 2,
        }),
        publicProvider({ stallTimeout: STALL_TIMEOUT, priority: 5 }),
    ]
);

const projectId = process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '';
const connectors = connectorsForWallets([
    {
        groupName: 'Recommended',
        wallets: [
            metaMaskWallet({ projectId, chains }),
            walletConnectWallet({ projectId, chains }), // ensure all WalletConnect-based wallets are supported
            rabbyWallet({ chains }),
            braveWallet({ chains }),
            ledgerWallet({ projectId, chains }),
            trustWallet({ projectId, chains }),
            injectedWallet({ chains }), //  ensure all injected wallets are supported
            coinbaseWallet({ appName: 'Thales', chains }),
            rainbowWallet({ projectId, chains }),
            imTokenWallet({ projectId, chains }),
        ],
    },
]);

const wagmiClient = createClient({
    autoConnect: true,
    connectors,
    provider,
});

interface RootProps {
    store: Store;
}

const theme = getDefaultTheme();
const customTheme = merge(darkTheme(), { colors: { modalBackground: ThemeMap[theme].background.primary } });

const Root: React.FC<RootProps> = ({ store }) => {
    PLAUSIBLE.enableAutoPageviews();
    return (
        <ErrorBoundary fallback={<UnexpectedError theme={ThemeMap[theme]} />} onError={() => {}}>
            <Provider store={store}>
                <WagmiConfig client={wagmiClient}>
                    <RainbowKitProvider
                        chains={chains}
                        theme={customTheme}
                        appInfo={{
                            appName: 'Overtime',
                            disclaimer: WalletDisclaimer,
                        }}
                    >
                        <App />
                    </RainbowKitProvider>
                </WagmiConfig>
            </Provider>
        </ErrorBoundary>
    );
};

export default Root;
