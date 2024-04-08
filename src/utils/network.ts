import ArbitrumLogo from 'assets/images/arbitrum-circle-logo.svg?react';
import BaseLogo from 'assets/images/base-circle-logo.svg?react';
import OpLogo from 'assets/images/optimism-circle-logo.svg?react';
import PolygonLogo from 'assets/images/polygon-circle-logo.svg?react';
import ZkSyncLogo from 'assets/images/zksync-circle-logo.svg?react';
import { SUPPORTED_NETWORKS, SUPPORTED_NETWORKS_PARAMS } from 'constants/network';
import ROUTES from 'constants/routes';
import { FunctionComponent, SVGProps } from 'react';
import { NetworkId } from 'thales-utils';
import { NetworkParams, SupportedNetwork } from '../types/network';
import { getCollaterals } from './currency';

export const isNetworkSupported = (networkId: SupportedNetwork): boolean => {
    return !!SUPPORTED_NETWORKS[networkId];
};

export const getIsMultiCollateralSupported = (networkId: SupportedNetwork): boolean =>
    getCollaterals(networkId).length > 1;

export const checkAllowance = async (amount: bigint, token: any, walletAddress: string, spender: string) => {
    try {
        const allowedAmount = await token.read.allowance([walletAddress, spender]);
        return allowedAmount >= amount;
    } catch (err: any) {
        console.log(err);
        return false;
    }
};

const hasEthereumInjected = () => !!window.ethereum;

const changeNetwork = async (network: NetworkParams, callback: VoidFunction): Promise<void> => {
    if (hasEthereumInjected()) {
        try {
            callback();
        } catch (switchError: any) {
            if (network && switchError.code === 4902) {
                try {
                    await (window.ethereum as any).request({
                        method: 'wallet_addEthereumChain',
                        params: [network],
                    });

                    callback();
                } catch (addError) {
                    console.log(addError);
                }
            } else {
                console.log(switchError);
            }
        }
    } else {
        callback();
    }
};

type DropdownNetwork = {
    name: string;
    icon: FunctionComponent<SVGProps<SVGSVGElement>>;
    changeNetwork: (networkId: number, callback: VoidFunction) => Promise<void>;
    order: number;
};

export const SUPPORTED_NETWORK_IDS_MAP: Record<number, DropdownNetwork> = {
    [NetworkId.OptimismMainnet]: {
        name: 'Optimism',
        icon: OpLogo,
        changeNetwork: async (networkId: number, callback: VoidFunction) => {
            await changeNetwork(SUPPORTED_NETWORKS_PARAMS[networkId], callback);
        },
        order: 1,
    },
    [NetworkId.PolygonMainnet]: {
        name: 'Polygon',
        icon: PolygonLogo,
        changeNetwork: async (networkId: number, callback: VoidFunction) => {
            await changeNetwork(SUPPORTED_NETWORKS_PARAMS[networkId], callback);
        },
        order: 4,
    },
    [NetworkId.Arbitrum]: {
        name: 'Arbitrum',
        icon: ArbitrumLogo,
        changeNetwork: async (networkId: number, callback: VoidFunction) => {
            await changeNetwork(SUPPORTED_NETWORKS_PARAMS[networkId], callback);
        },
        order: 2,
    },
    [NetworkId.Base]: {
        name: 'Base',
        icon: BaseLogo,
        changeNetwork: async (networkId: number, callback: VoidFunction) => {
            await changeNetwork(SUPPORTED_NETWORKS_PARAMS[networkId], callback);
        },
        order: 3,
    },
    [NetworkId.ZkSync]: {
        name: 'ZkSync',
        icon: ZkSyncLogo,
        changeNetwork: async (networkId: number, callback: VoidFunction) => {
            await changeNetwork(SUPPORTED_NETWORKS_PARAMS[networkId], callback);
        },
        order: 5,
    },
};

export const getSupportedNetworksByRoute = (route: string): NetworkId[] => {
    switch (route) {
        case ROUTES.Markets.Home:
        case ROUTES.Markets.SpeedMarkets:
        case ROUTES.Markets.SpeedMarketsOverview:
        case ROUTES.Markets.Profile:
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
        case ROUTES.Markets.ChainedSpeedMarkets:
        case ROUTES.Markets.ChainedSpeedMarketsOverview:
            return [
                NetworkId.OptimismMainnet,
                NetworkId.OptimismGoerli,
                NetworkId.Arbitrum,
                NetworkId.Base,
                NetworkId.PolygonMainnet,
            ];
        default:
            return Object.keys(SUPPORTED_NETWORKS).map((network) => Number(network) as NetworkId);
    }
};

export const isOnlySpeedMarketsSupported = (networkId: NetworkId): boolean =>
    [NetworkId.ZkSync, NetworkId.ZkSyncSepolia, NetworkId.BlastSepolia].includes(networkId);

export const getNetworkNameByNetworkId = (networkId: NetworkId, shortName = false): string | undefined => {
    const network = SUPPORTED_NETWORKS_PARAMS[networkId];
    return shortName ? network?.chainName : network?.chainName;
};
