import { NetworkId } from 'thales-utils';

const QUERY_KEYS = {
    Banners: (networkId: NetworkId) => ['banners', networkId],
    WalletBalances: {
        StableCoinBalance: (walletAddress: string, networkId: NetworkId) => [
            'walletBalances',
            'stableCoin',
            walletAddress,
            networkId,
        ],
        MultipleCollateral: (walletAddress: string, networkId: NetworkId) => [
            'multipleCollateral',
            'balance',
            walletAddress,
            networkId,
        ],
    },
    Rates: {
        ExchangeRates: (networkId: NetworkId) => ['rates', 'exchangeRates', networkId],
    },
    Prices: {
        PythPrices: (priceId: string, publishTime: number) => ['prices', 'pythPrices', priceId, publishTime],
        PythCandlestickData: (asset: string, dateRange: number, resolution: string) => [
            'asset',
            'dateRange',
            'resolution',
            asset,
            dateRange,
            resolution,
        ],
    },
    Markets: {
        SpeedMarketsLimits: (networkId: NetworkId, walletAddress?: string) => [
            'speedMarketsLimits',
            networkId,
            walletAddress,
        ],
        ChainedSpeedMarketsLimits: (networkId: NetworkId, walletAddress?: string) => [
            'chainedSpeedMarketsLimits',
            networkId,
            walletAddress,
        ],
        ActiveSpeedMarkets: (networkId: NetworkId) => ['activeSpeedMarkets', networkId],
        ActiveChainedSpeedMarkets: (networkId: NetworkId) => ['activeChainedSpeedMarkets', networkId],
    },
    User: {
        SpeedMarkets: (networkId: NetworkId, walletAddress: string) => ['userSpeedMarkets', networkId, walletAddress],
        ChainedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userChainedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        ResolvedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userResolvedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        ResolvedChainedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userResolvedChainedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        Notifications: (walletAddress: string, networkId: NetworkId) => [
            'user',
            'notifications',
            walletAddress,
            networkId,
        ],
    },
    Profile: {
        Data: (walletAddress: string, networkId: NetworkId) => ['profile', 'data', walletAddress, networkId],
    },
    Referral: {
        ReferrerID: (walletAddress: string) => ['referrerId', walletAddress],
    },
};

export default QUERY_KEYS;
