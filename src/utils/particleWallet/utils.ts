import { PARTICAL_LOGINS_CLASSNAMES } from 'constants/wallet';
import { SupportedNetwork } from 'types/network';
import { ParticalTypes } from 'types/wallet';
import { getNetworkNameByNetworkId } from 'utils/network';
import { Connector } from 'wagmi';
import { isSocialAuthType } from '@particle-network/auth-core';
import { NetworkId } from 'thales-utils';

export const getClassNameForParticalLogin = (socialId: ParticalTypes) => {
    const label = PARTICAL_LOGINS_CLASSNAMES.find((item) => item.socialId == socialId)?.className;
    return label ? label : '';
};

export const getSpecificConnectorFromConnectorsArray = (
    connectors: readonly Connector[],
    name: string,
    particle?: boolean
): Connector | undefined => {
    if (particle) {
        return connectors.find((connector: any) => connector?.type == name);
    }
    return connectors.find((connector: any) => connector.id == name);
};

export const isSocialLogin = (authType: any) => isSocialAuthType(authType) || (authType as any) === 'twitterv1';

export const getOnRamperUrl = (apiKey: string, walletAddress: string, networkId: SupportedNetwork) => {
    return `https://buy.onramper.com?apiKey=${apiKey}&mode=buy&onlyCryptos=${supportedOnramperTokens(
        networkId
    )}&networkWallets=${getNetworkNameByNetworkId(networkId, true)}:${walletAddress}&${ONRAMPER_STYLE}`;
};

const supportedOnramperTokens = (networkId: SupportedNetwork) => {
    switch (networkId) {
        case NetworkId.OptimismMainnet:
            return 'usdc_optimism,usdt_optimism,dai_optimism,op_optimism,eth_optimism';
        case NetworkId.Arbitrum:
            return 'usdc_arbitrum,usdt_arbitrum,dai_arbitrum,arb_arbitrum,eth_arbitrum';
        case NetworkId.Base:
            return 'usdc_base,eth_base';
        case NetworkId.PolygonMainnet:
            return 'usdc_polygon';
        case NetworkId.ZkSync:
            return 'usdc_zksync';
        default:
            return 'usdc_optimism, usdt_optimism, dai_optimism, op_optimism, eth_optimism, usdc_arbitrum, usdt_arbitrum, dai_arbitrum, arb_arbitrum, eth_arbitrum, usdc_base, eth_base, usdc_polygon, usdc_zksync';
    }
};

const ONRAMPER_STYLE =
    'themeName=dark&containerColor=000000ff&primaryColor=c294f5ff&secondaryColor=000000ff&cardColor=1a1a1a&primaryTextColor=ffffff&secondaryTextColor=ffffff&borderRadius=0.5&wgBorderRadius=1';
