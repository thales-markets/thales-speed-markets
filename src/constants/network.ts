import { NetworkId } from 'thales-utils';
import { NetworkParams, SupportedNetwork } from 'types/network';
import { Address } from 'viem';

export const ZERO_ADDRESS = '0x0000000000000000000000000000000000000000' as Address;
export const TBD_ADDRESS = '0xTBD' as Address;

export const SUPPORTED_NETWORKS: Record<SupportedNetwork, string> = {
    [NetworkId.OptimismMainnet]: 'OPTIMISTIC',
    [NetworkId.Arbitrum]: 'ARBITRUM-ONE',
    [NetworkId.Base]: 'BASE',
    [NetworkId.PolygonMainnet]: 'POLYGON-MAINNET',
    [NetworkId.OptimismSepolia]: 'SEPOLIA-OPTIMISM',
};

export const TEST_NETWORKS = [NetworkId.OptimismSepolia];

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
    [NetworkId.PolygonMainnet]: {
        chainId: '0x89',
        chainName: 'Polygon Mainnet',
        rpcUrls: ['https://polygon-rpc.com'],
        blockExplorerUrls: ['https://polygonscan.com/'],
        iconUrls: ['https://optimism.io/images/metamask_icon.svg', 'https://optimism.io/images/metamask_icon.png'],
        nativeCurrency: {
            symbol: 'POL',
            decimals: 18,
        },
    },
};

const INFURA_PROJECT_ID = import.meta.env.VITE_APP_INFURA_PROJECT_ID;

export const RPC_LIST = {
    INFURA: {
        [NetworkId.OptimismMainnet]: `https://optimism-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.Arbitrum]: `https://arbitrum-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.Base]: `https://base-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.PolygonMainnet]: `https://polygon-mainnet.infura.io/v3/${INFURA_PROJECT_ID}`,
        [NetworkId.OptimismSepolia]: `https://optimism-sepolia.infura.io/v3/${INFURA_PROJECT_ID}`,
    },
};
