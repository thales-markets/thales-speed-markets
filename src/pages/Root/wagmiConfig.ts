import { createConfig, http } from 'wagmi';
import {
    arbitrum,
    base,
    blastSepolia,
    optimism,
    optimismGoerli,
    optimismSepolia,
    polygon,
    zkSync,
    zkSyncSepoliaTestnet,
} from 'wagmi/chains';
import { coinbaseWallet, walletConnect } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
    chains: [
        optimism,
        arbitrum,
        base,
        polygon,
        zkSync,
        zkSyncSepoliaTestnet,
        blastSepolia,
        optimismSepolia,
        optimismGoerli,
    ],
    connectors: [
        coinbaseWallet({ appName: 'Speedmarkets' }),
        walletConnect({ projectId: import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID || '' }),
    ],
    transports: {
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
        [polygon.id]: http(),
        [zkSync.id]: http(),
        [zkSyncSepoliaTestnet.id]: http(),
        [blastSepolia.id]: http(),
        [optimismSepolia.id]: http(),
        [optimismGoerli.id]: http(),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiConfig;
    }
}
