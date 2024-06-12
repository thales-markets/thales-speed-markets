import { PARTICAL_LOGINS_CLASSNAMES } from 'constants/wallet';
import { SupportedNetwork } from 'types/network';
import { ParticalTypes } from 'types/wallet';
import { getNetworkNameByNetworkId } from 'utils/network';
import { Connector } from 'wagmi';
import { isSocialAuthType } from '@particle-network/auth-core';

export const getClassNameForParticalLogin = (socialId: ParticalTypes) => {
    const label = PARTICAL_LOGINS_CLASSNAMES.find((item) => item.socialId == socialId)?.className;
    return label ? label : '';
};

export const getOnRamperUrl = (apiKey: string, walletAddress: string, networkId: SupportedNetwork) => {
    return `https://buy.onramper.com?apiKey=${apiKey}&mode=buy&onlyCryptos=usdc_arbitrum,usdt_arbitrum,usdc_base,usdc_optimism,usdt_optimism&networkWallets=${getNetworkNameByNetworkId(
        networkId,
        true
    )}:${walletAddress}'&themeName=dark&containerColor=181a20&primaryColor=1D976C&secondaryColor=2b3139&cardColor=2b3139&primaryTextColor=ffffff&secondaryTextColor=848e9c&borderRadius=0.5&wgBorderRadius=1'`;
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
