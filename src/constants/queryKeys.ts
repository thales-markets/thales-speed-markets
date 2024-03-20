import { NetworkId } from 'thales-utils';
import { QueryConfig } from 'types/network';

const QUERY_KEYS = {
    WalletBalances: {
        StableCoinBalance: (walletAddress: string, queryConfig: QueryConfig) => [
            'walletBalances',
            'stableCoin',
            walletAddress,
            queryConfig,
        ],
        MultipleCollateral: (walletAddress: string, networkId: NetworkId) => [
            'multipleCollateral',
            'balance',
            walletAddress,
            networkId,
        ],
    },
    Rates: {
        ExchangeRates: (queryConfig: QueryConfig) => ['rates', 'exchangeRates', queryConfig],
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
        SpeedMarkets: (queryConfig: QueryConfig, walletAddress: string) => [
            'userSpeedMarkets',
            queryConfig,
            walletAddress,
        ],
        ChainedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userChainedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        SpeedMarketsTransactions: (networkId: NetworkId, walletAddress: string) => [
            'userSpeedMarketsTransactions',
            networkId,
            walletAddress,
        ],
        ChainedSpeedMarketsTransactions: (networkId: NetworkId, walletAddress: string) => [
            'userChainedSpeedMarketsTransactions',
            networkId,
            walletAddress,
        ],
        ResolvedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userResolvedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        ResolvedChainedSpeedMarkets: (queryConfig: QueryConfig, walletAddress: string) => [
            'userResolvedChainedSpeedMarkets',
            queryConfig,
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
        Data: (walletAddress: string, queryConfig: QueryConfig) => ['profile', 'data', walletAddress, queryConfig],
    },
    Referral: {
        ReferrerID: (walletAddress: string) => ['referrerId', walletAddress],
    },
};

export default QUERY_KEYS;
