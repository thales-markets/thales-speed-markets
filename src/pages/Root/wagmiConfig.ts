import { connectorsForWallets } from '@rainbow-me/rainbowkit';
import { RPC_LIST } from 'constants/network';
import { NetworkId } from 'thales-utils';
import { createConfig, fallback, http } from 'wagmi';
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
    connectors: connectorsForWallets(
        [
            {
                groupName: 'Recommended',
                wallets: [
                    metaMaskWallet,
                    walletConnectWallet,
                    rabbyWallet,
                    braveWallet,
                    ledgerWallet,
                    trustWallet,
                    injectedWallet,
                    coinbaseWallet,
                    rainbowWallet,
                    imTokenWallet,
                ],
            },
        ],
        {
            appName: 'Speed Markets',
            projectId: import.meta.env.VITE_APP_WALLET_CONNECT_PROJECT_ID || '',
        }
    ),
    transports: {
        [optimism.id]: fallback([
            http(RPC_LIST.CHAINNODE[NetworkId.OptimismMainnet]),
            http(RPC_LIST.INFURA[NetworkId.OptimismMainnet]),
            http(),
        ]),
        [arbitrum.id]: fallback([
            http(RPC_LIST.CHAINNODE[NetworkId.Arbitrum]),
            http(RPC_LIST.INFURA[NetworkId.Arbitrum]),
            http(),
        ]),
        [base.id]: fallback([http(RPC_LIST.CHAINNODE[NetworkId.Base]), http(RPC_LIST.ANKR[NetworkId.Base]), http()]),
        [polygon.id]: fallback([http(RPC_LIST.INFURA[NetworkId.PolygonMainnet]), http()]),
        [zkSync.id]: fallback([http()]),
        [zkSyncSepoliaTestnet.id]: fallback([http()]),
        [blastSepolia.id]: fallback([http()]),
        [optimismSepolia.id]: fallback([http()]),
        [optimismGoerli.id]: fallback([http()]),
    },
});

declare module 'wagmi' {
    interface Register {
        config: typeof wagmiConfig;
    }
}
