import { NetworkId } from 'thales-utils';
import { NetworkParams, SupportedNetwork } from 'types/network';
import { Chain } from 'viem';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';

export const SUPPORTED_NETWORKS: Record<SupportedNetwork, string> = {
    [NetworkId.OptimismMainnet]: 'OPTIMISTIC',
    [NetworkId.PolygonMainnet]: 'POLYGON-MAINNET',
    [NetworkId.OptimismGoerli]: 'GOERLI-OPTIMISM',
    [NetworkId.OptimismSepolia]: 'SEPOLIA-OPTIMISM',
    [NetworkId.Arbitrum]: 'ARBITRUM-ONE',
    [NetworkId.Base]: 'BASE',
    [NetworkId.ZkSync]: 'ZKSYNC',
    [NetworkId.ZkSyncSepolia]: 'ZKSYNC-SEPOLIA',
    [NetworkId.BlastSepolia]: 'BLAST-SEPOLIA',
};

export const SUPPORTED_NETWORKS_NAMES: Record<SupportedNetwork, string> = {
    [NetworkId.OptimismMainnet]: 'OPTIMISM MAINNET',
    [NetworkId.PolygonMainnet]: 'POLYGON',
    [NetworkId.OptimismGoerli]: 'OPTIMISM GOERLI',
    [NetworkId.OptimismSepolia]: 'OPTIMISM SEPOLIA',
    [NetworkId.Arbitrum]: 'ARBITRUM ONE',
    [NetworkId.Base]: 'BASE',
    [NetworkId.ZkSync]: 'ZKSYNC',
    [NetworkId.ZkSyncSepolia]: 'ZKSYNC SEPOLIA',
    [NetworkId.BlastSepolia]: 'BLAST SEPOLIA',
};

export const TEST_NETWORKS = [
    NetworkId.OptimismGoerli,
    NetworkId.OptimismSepolia,
    NetworkId.ZkSyncSepolia,
    NetworkId.BlastSepolia,
];

export const DEFAULT_NETWORK: { name: string; networkId: SupportedNetwork } = {
    name: SUPPORTED_NETWORKS_NAMES[NetworkId.OptimismMainnet],
    networkId: NetworkId.OptimismMainnet,
};

type NetworkMapper = Record<number, number>;

export const L1_TO_L2_NETWORK_MAPPER: NetworkMapper = {
    1: 10,
    42: 69,
};

export const SUPPORTED_NETWORKS_PARAMS: Record<number, NetworkParams> = {
    [NetworkId.OptimismMainnet]: {
        chainId: '0xA',
        chainName: 'Optimism',
        rpcUrls: ['https://mainnet.optimism.io'],
        blockExplorerUrls: ['https://optimistic.etherscan.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
    },
    [NetworkId.PolygonMainnet]: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://explorer.matic.network/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'MATIC',
            decimals: 18,
        },
    },
    [NetworkId.Arbitrum]: {
        chainId: '0xA4B1',
        chainName: 'Arbitrum One',
        rpcUrls: ['https://arb1.arbitrum.io/rpc'],
        blockExplorerUrls: ['https://arbiscan.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
    },
    [NetworkId.Base]: {
        chainId: '0x2105',
        chainName: 'BASE',
        rpcUrls: ['https://mainnet.base.org'],
        blockExplorerUrls: ['https://basescan.org/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
    },
    [NetworkId.ZkSync]: {
        chainId: '0x144',
        chainName: 'zkSync',
        rpcUrls: ['https://mainnet.era.zksync.io'],
        blockExplorerUrls: ['https://explorer.zksync.io/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'ETH',
            decimals: 18,
        },
    },
};

// configuration for wagmi (https://github.com/wevm/viem/tree/main/src/chains/definitions)
export const base = {
    id: 8453,
    network: 'base',
    name: 'Base',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://mainnet.base.org'],
        },
        public: {
            http: ['https://mainnet.base.org'],
        },
    },
    blockExplorers: {
        blockscout: {
            name: 'Basescout',
            url: 'https://base.blockscout.com',
        },
        default: {
            name: 'Basescan',
            url: 'https://basescan.org',
        },
        etherscan: {
            name: 'Basescan',
            url: 'https://basescan.org',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 5022,
        },
    },
} as Chain;
export const optimismSepolia = {
    id: 11155420,
    network: 'optimism-sepolia',
    name: 'Optimism Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://sepolia.optimism.io'],
        },
        public: {
            http: ['https://sepolia.optimism.io'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blockscout',
            url: 'https://optimism-sepolia.blockscout.com',
            apiUrl: 'https://optimism-sepolia.blockscout.com/api',
        },
    },
    contracts: {
        multicall3: {
            address: '0xca11bde05977b3631167028862be2a173976ca11',
            blockCreated: 1620204,
        },
    },
    testnet: true,
} as Chain;
export const zkSyncSepolia = {
    id: 300,
    network: 'zksync-sepolia-testnet',
    name: 'zkSync Sepolia Testnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://sepolia.era.zksync.dev'],
            webSocket: ['wss://sepolia.era.zksync.dev/ws'],
        },
        public: {
            http: ['https://sepolia.era.zksync.dev'],
            webSocket: ['wss://sepolia.era.zksync.dev/ws'],
        },
    },
    blockExplorers: {
        default: {
            name: 'zkExplorer',
            url: 'https://sepolia.explorer.zksync.io/',
        },
    },
    contracts: {
        multicall3: {
            address: '0xF9cda624FBC7e059355ce98a31693d299FACd963',
        },
    },
    testnet: true,
} as Chain;
export const BlastSepolia = {
    id: 168587773,
    network: 'blast-sepolia',
    name: 'Blast Sepolia',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: {
        default: {
            http: ['https://blast-sepolia.blockpi.network/v1/rpc/public'],
            webSocket: ['wss://sepolia.blast.io/ws'],
        },
        public: {
            http: ['https://sepolia.blast.io'],
            webSocket: ['wss://sepolia.blast.io/ws'],
        },
    },
    blockExplorers: {
        default: {
            name: 'Blastscan',
            url: 'https://testnet.blastscan.io/',
        },
    },
    testnet: true,
} as Chain;
