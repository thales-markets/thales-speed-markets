import detectEthereumProvider from '@metamask/detect-provider';
import { ReactComponent as ArbitrumLogo } from 'assets/images/arbitrum-circle-logo.svg';
import { ReactComponent as BaseLogo } from 'assets/images/base-circle-logo.svg';
import { ReactComponent as BlastSepoliaLogo } from 'assets/images/blast-sepolia-circle-logo.svg';
import { ReactComponent as OpLogo } from 'assets/images/optimism-circle-logo.svg';
import { ReactComponent as PolygonLogo } from 'assets/images/polygon-circle-logo.svg';
import { ReactComponent as ZkSyncLogo } from 'assets/images/zksync-circle-logo.svg';
import {
    DEFAULT_NETWORK,
    L1_TO_L2_NETWORK_MAPPER,
    SUPPORTED_NETWORKS,
    SUPPORTED_NETWORKS_NAMES,
    SUPPORTED_NETWORKS_PARAMS,
} from 'constants/network';
import ROUTES from 'constants/routes';
import { BigNumber } from 'ethers';
import { FunctionComponent, SVGProps } from 'react';
import { NetworkId } from 'thales-utils';
import { NetworkParams, SupportedNetwork } from '../types/network';
import { getCollaterals } from './currency';

type EthereumProvider = {
    isMetaMask: boolean;
    networkVersion: string;
};

const hasEthereumInjected = () => !!window.ethereum;

// Not in use anymore as detectEthereumProvider() doesn't always return value.
// On page reload returns undefined and on hard reload returns good value from Metamask (e.g. 69)
export async function getEthereumNetwork() {
    try {
        if (hasEthereumInjected()) {
            const provider = (await detectEthereumProvider()) as EthereumProvider;
            if (provider && provider.networkVersion != null) {
                const networkId = Number(provider.networkVersion) as SupportedNetwork;
                return { name: SUPPORTED_NETWORKS_NAMES[networkId], networkId };
            }
        }
        return DEFAULT_NETWORK;
    } catch (e) {
        console.log(e);
        return DEFAULT_NETWORK;
    }
}

export const isNetworkSupported = (networkId: SupportedNetwork): boolean => {
    return !!SUPPORTED_NETWORKS[networkId];
};

export const getIsMultiCollateralSupported = (networkId: SupportedNetwork): boolean =>
    getCollaterals(networkId).length > 1;

export const checkAllowance = async (amount: BigNumber, token: any, walletAddress: string, spender: string) => {
    try {
        const approved = await token.allowance(walletAddress, spender);
        return approved.gte(amount);
    } catch (err: any) {
        console.log(err);
        return false;
    }
};

const changeNetwork = async (network?: NetworkParams, callback?: VoidFunction, chainId?: string): Promise<void> => {
    if (hasEthereumInjected()) {
        try {
            await (window.ethereum as any).request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: network?.chainId || chainId }],
            });
            callback && callback();
        } catch (switchError: any) {
            if (network && switchError.code === 4902) {
                try {
                    await (window.ethereum as any).request({
                        method: 'wallet_addEthereumChain',
                        params: [network],
                    });
                    await (window.ethereum as any).request({
                        method: 'wallet_switchEthereumChain',
                        params: [{ chainId: network.chainId }],
                    });
                    callback && callback();
                } catch (addError) {
                    console.log(addError);
                }
            } else {
                console.log(switchError);
            }
        }
    } else {
        callback && callback();
    }
};

type DropdownNetwork = {
    name: string;
    icon: FunctionComponent<SVGProps<SVGSVGElement>>;
    changeNetwork: (networkId: number, callback?: VoidFunction) => Promise<void>;
    order: number;
};

export const SUPPORTED_NETWORK_IDS_MAP: Record<number, DropdownNetwork> = {
    [NetworkId.OptimismMainnet]: {
        name: 'Optimism',
        icon: OpLogo,
        changeNetwork: async (networkId: number, callback?: VoidFunction) => {
            const switchTo = L1_TO_L2_NETWORK_MAPPER[networkId] ?? 10;
            const optimismNetworkParms = SUPPORTED_NETWORKS_PARAMS[switchTo];
            await changeNetwork(optimismNetworkParms, callback);
        },
        order: 1,
    },
    [NetworkId.PolygonMainnet]: {
        name: 'Polygon',
        icon: PolygonLogo,
        changeNetwork: async (networkId: number, callback?: VoidFunction) => {
            const polygonNetworkParams = SUPPORTED_NETWORKS_PARAMS[networkId];
            await changeNetwork(polygonNetworkParams, callback);
        },
        order: 4,
    },
    [NetworkId.Arbitrum]: {
        name: 'Arbitrum',
        icon: ArbitrumLogo,
        changeNetwork: async (networkId: number, callback?: VoidFunction) => {
            const arbNetworkParams = SUPPORTED_NETWORKS_PARAMS[networkId];
            await changeNetwork(arbNetworkParams, callback);
        },
        order: 2,
    },
    [NetworkId.Base]: {
        name: 'Base',
        icon: BaseLogo,
        changeNetwork: async (networkId: number, callback?: VoidFunction) => {
            const baseNetworkParams = SUPPORTED_NETWORKS_PARAMS[networkId];
            await changeNetwork(baseNetworkParams, callback);
        },
        order: 3,
    },
    [NetworkId.ZkSync]: {
        name: 'ZkSync',
        icon: ZkSyncLogo,
        changeNetwork: async (networkId: number, callback?: VoidFunction) => {
            const baseNetworkParams = SUPPORTED_NETWORKS_PARAMS[networkId];
            await changeNetwork(baseNetworkParams, callback);
        },
        order: 5,
    },
    [NetworkId.BlastSepolia]: {
        name: 'Blast Sepolia',
        icon: BlastSepoliaLogo,
        changeNetwork: async (networkId: number, callback?: VoidFunction) => {
            const baseNetworkParams = SUPPORTED_NETWORKS_PARAMS[networkId];
            await changeNetwork(baseNetworkParams, callback);
        },
        order: 5,
    },
};

export const getSupportedNetworksByRoute = (route: string): NetworkId[] => {
    switch (route) {
        case ROUTES.Options.Home:
        case ROUTES.Options.ChainedSpeedMarkets:
        case ROUTES.Options.ChainedSpeedMarketsOverview:
            return [
                NetworkId.OptimismMainnet,
                NetworkId.OptimismGoerli,
                NetworkId.Arbitrum,
                NetworkId.Base,
                NetworkId.PolygonMainnet,
            ];
        case ROUTES.Options.SpeedMarkets:
        case ROUTES.Options.SpeedMarketsOverview:
        case ROUTES.Options.Profile:
            return [
                NetworkId.OptimismMainnet,
                NetworkId.OptimismGoerli,
                NetworkId.Arbitrum,
                NetworkId.Base,
                NetworkId.PolygonMainnet,
                NetworkId.ZkSync,
                NetworkId.ZkSyncSepolia,
                NetworkId.BlastSepolia,
            ];
        default:
            return Object.keys(SUPPORTED_NETWORKS).map((network) => Number(network) as NetworkId);
    }
};

export const isOnlySpeedMarketsSupported = (networkId: NetworkId): boolean =>
    [NetworkId.ZkSync, NetworkId.ZkSyncSepolia, NetworkId.BlastSepolia].includes(networkId);
