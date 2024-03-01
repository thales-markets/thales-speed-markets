import { NetworkId } from 'thales-utils';
import { BigNumber } from 'ethers';

const QUERY_KEYS = {
    WalletBalances: {
        StableCoinBalance: (walletAddress: string, networkId: NetworkId) => [
            'walletBalances',
            'stableCoin',
            walletAddress,
            networkId,
        ],
        Eth: (walletAddress: string) => ['walletBalances', 'eth', walletAddress],
        Thales: (walletAddress: string, networkId: NetworkId) => ['walletBalances', 'thales', walletAddress, networkId],
        OpThales: (walletAddress: string, networkId: NetworkId) => [
            'walletBalances',
            'opThales',
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
        ExchangeRatesMarketData: (networkId: NetworkId) => ['rates', 'exchangeRatesMarketData', networkId],
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
    Medium: {
        Posts: ['medium', 'posts'],
    },
    BinaryOptions: {
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
        UserSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userSpeedMarkets',
            networkId,
            walletAddress,
        ],
        UserChainedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userChainedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        UserSpeedMarketsTransactions: (networkId: NetworkId, walletAddress: string) => [
            'userSpeedMarketsTransactions',
            networkId,
            walletAddress,
        ],
        UserChainedSpeedMarketsTransactions: (networkId: NetworkId, walletAddress: string) => [
            'userChainedSpeedMarketsTransactions',
            networkId,
            walletAddress,
        ],
        UserResolvedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userResolvedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        UserResolvedChainedSpeedMarkets: (networkId: NetworkId, walletAddress: string) => [
            'userResolvedChainedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        ActiveSpeedMarkets: (networkId: NetworkId) => ['activeSpeedMarkets', networkId],
        ActiveChainedSpeedMarkets: (networkId: NetworkId) => ['activeChainedSpeedMarkets', networkId],
    },
    User: {
        OpenPositions: (walletAddress: string, networkId: NetworkId) => [
            'user',
            'userOpenPositions',
            walletAddress,
            networkId,
        ],
        Notifications: (walletAddress: string, networkId: NetworkId) => [
            'user',
            'notifications',
            walletAddress,
            networkId,
        ],
        VaultsAndLpTransactions: (networkId: NetworkId, walletAddress: string) => [
            'user',
            'vaultsAndLpTransactions',
            networkId,
            walletAddress,
        ],
        UsersAmmBuyVolume: (networkId: NetworkId, period: number) => ['user', 'ammBuyVolume', networkId, period],
    },
    Profile: {
        Data: (walletAddress: string, networkId: NetworkId) => ['profile', 'data', walletAddress, networkId],
        OpenPositions: (walletAddress: string, networkId: NetworkId) => [
            'profile',
            'openPositions',
            walletAddress,
            networkId,
        ],
        ClaimablePositions: (walletAddress: string, networkId: NetworkId) => [
            'profile',
            'claimablePositions',
            walletAddress,
            networkId,
        ],
        ClosedPositions: (walletAddress: string, networkId: NetworkId) => [
            'profile',
            'closedPositions',
            walletAddress,
            networkId,
        ],
        Trades: (walletAddress: string, networkId: NetworkId) => ['profile', 'trades', walletAddress, networkId],
    },
    Swap: {
        Tokens: (networkId: NetworkId) => ['swap', 'tokens', networkId],
        Quote: (networkId: NetworkId, amount: BigNumber) => ['swap', 'quote', networkId, amount],
        Approve: (networkId: NetworkId) => ['swap', 'approve', networkId],
        Swap: (networkId: NetworkId) => ['swap', 'swap', networkId],
    },
    Referral: {
        ReferrerID: (walletAddress: string) => ['referrerId', walletAddress],
    },
    Banners: (networkId: NetworkId) => ['banners', networkId],
};

export default QUERY_KEYS;
