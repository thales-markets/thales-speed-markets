import { NetworkId } from 'thales-utils';
import { NetworkParams, SupportedNetwork } from 'types/network';
import { Address } from 'viem';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
export const TBD_ADDRESS = '0xTBD' as Address;

export const SUPPORTED_NETWORKS: Record<SupportedNetwork, string> = {
    [NetworkId.OptimismMainnet]: 'OPTIMISTIC',
    [NetworkId.PolygonMainnet]: 'POLYGON-MAINNET',
    [NetworkId.OptimismSepolia]: 'SEPOLIA-OPTIMISM',
    [NetworkId.Arbitrum]: 'ARBITRUM-ONE',
    [NetworkId.Base]: 'BASE',
    [NetworkId.ZkSync]: 'ZKSYNC',
    [NetworkId.ZkSyncSepolia]: 'ZKSYNC-SEPOLIA',
    [NetworkId.BlastSepolia]: 'BLAST-SEPOLIA',
};

const SUPPORTED_NETWORKS_NAMES: Record<SupportedNetwork, string> = {
    [NetworkId.OptimismMainnet]: 'OPTIMISM MAINNET',
    [NetworkId.PolygonMainnet]: 'POLYGON',
    [NetworkId.OptimismSepolia]: 'OPTIMISM SEPOLIA',
    [NetworkId.Arbitrum]: 'ARBITRUM ONE',
    [NetworkId.Base]: 'BASE',
    [NetworkId.ZkSync]: 'ZKSYNC',
    [NetworkId.ZkSyncSepolia]: 'ZKSYNC SEPOLIA',
    [NetworkId.BlastSepolia]: 'BLAST SEPOLIA',
};

export const TEST_NETWORKS = [NetworkId.OptimismSepolia, NetworkId.ZkSyncSepolia, NetworkId.BlastSepolia];

export const DEFAULT_NETWORK: { name: string; networkId: SupportedNetwork } = {
    name: SUPPORTED_NETWORKS_NAMES[NetworkId.OptimismMainnet],
    networkId: NetworkId.OptimismMainnet,
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

const INFURA_PROJECT_ID = import.meta.env.VITE_APP_INFURA_PROJECT_ID;
const CHAINNODE_PROJECT_ID = import.meta.env.VITE_APP_CHAINNODE_PROJECT_ID;
const ANKR_PROJECT_ID = import.meta.env.VITE_APP_ANKR_PROJECT_ID;

export const RPC_LIST = {
    INFURA: {
        [NetworkId.OptimismMainnet]: `https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.Arbitrum]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.PolygonMainnet]: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.OptimismSepolia]: `https://optimism-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
    },
    CHAINNODE: {
        [NetworkId.OptimismMainnet]: `https://optimism-mainnet.chainnodes.org/${CHAINNODE_PROJECT_ID}`,
        [NetworkId.Arbitrum]: `https://arbitrum-one.chainnodes.org/${CHAINNODE_PROJECT_ID}`,
        [NetworkId.PolygonMainnet]: `https://polygon-mainnet.chainnodes.org/${CHAINNODE_PROJECT_ID}`,
        [NetworkId.Base]: `https://base-mainnet.chainnodes.org/${CHAINNODE_PROJECT_ID}`,
        [NetworkId.ZkSync]: 'TODO',
        [NetworkId.ZkSyncSepolia]: 'TODO',
        [NetworkId.BlastSepolia]: 'TODO',
        [NetworkId.OptimismSepolia]: 'TODO',
    },
    ANKR: {
        [NetworkId.OptimismMainnet]: `https://rpc.ankr.com/optimism/${ANKR_PROJECT_ID}`,
        [NetworkId.Arbitrum]: `https://rpc.ankr.com/arbitrum/${ANKR_PROJECT_ID}`,
        [NetworkId.Base]: `https://rpc.ankr.com/base/${ANKR_PROJECT_ID}`,
    },
};
