import { http, createConfig } from 'wagmi';
import { arbitrum, base, blastSepolia, optimism, polygon, zkSync } from 'wagmi/chains';
import { coinbaseWallet, walletConnect } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
    chains: [optimism, arbitrum, base, polygon, zkSync, blastSepolia],
    connectors: [
        coinbaseWallet({ appName: 'Speedmarkets' }),
        walletConnect({ projectId: process.env.REACT_APP_WALLET_CONNECT_PROJECT_ID || '' }),
    ],
    transports: {
        [optimism.id]: http(),
        [arbitrum.id]: http(),
        [base.id]: http(),
        [polygon.id]: http(),
        [zkSync.id]: http(),
        [blastSepolia.id]: http(),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiConfig;
    }
}
