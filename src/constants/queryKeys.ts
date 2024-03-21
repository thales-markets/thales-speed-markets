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
        MultipleCollateral: (walletAddress: string, queryConfig: QueryConfig) => [
            'multipleCollateral',
            'balance',
            walletAddress,
            queryConfig,
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
        SpeedMarketsLimits: (queryConfig: QueryConfig, walletAddress?: string) => [
            'speedMarketsLimits',
            queryConfig,
            walletAddress,
        ],
        ChainedSpeedMarketsLimits: (queryConfig: QueryConfig, walletAddress?: string) => [
            'chainedSpeedMarketsLimits',
            queryConfig,
            walletAddress,
        ],
        ActiveSpeedMarkets: (queryConfig: QueryConfig) => ['activeSpeedMarkets', queryConfig],
        ActiveChainedSpeedMarkets: (queryConfig: QueryConfig) => ['activeChainedSpeedMarkets', queryConfig],
    },
    User: {
        SpeedMarkets: (queryConfig: QueryConfig, walletAddress: string) => [
            'userSpeedMarkets',
            queryConfig,
            walletAddress,
        ],
        ChainedSpeedMarkets: (queryConfig: QueryConfig, walletAddress: string) => [
            'userChainedSpeedMarkets',
            queryConfig,
            walletAddress,
        ],
        SpeedMarketsTransactions: (queryConfig: QueryConfig, walletAddress: string) => [
            'userSpeedMarketsTransactions',
            queryConfig,
            walletAddress,
        ],
        ChainedSpeedMarketsTransactions: (queryConfig: QueryConfig, walletAddress: string) => [
            'userChainedSpeedMarketsTransactions',
            queryConfig,
            walletAddress,
        ],
        ResolvedSpeedMarkets: (queryConfig: QueryConfig, walletAddress: string) => [
            'userResolvedSpeedMarkets',
            queryConfig,
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
