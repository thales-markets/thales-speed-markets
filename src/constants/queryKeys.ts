import { Network } from 'enums/network';
import { BigNumber } from 'ethers';

const QUERY_KEYS = {
    WalletBalances: {
        StableCoinBalance: (walletAddress: string, networkId: Network) => [
            'walletBalances',
            'stableCoin',
            walletAddress,
            networkId,
        ],
        Eth: (walletAddress: string) => ['walletBalances', 'eth', walletAddress],
        Thales: (walletAddress: string, networkId: Network) => ['walletBalances', 'thales', walletAddress, networkId],
        OpThales: (walletAddress: string, networkId: Network) => [
            'walletBalances',
            'opThales',
            walletAddress,
            networkId,
        ],
        MultipleCollateral: (walletAddress: string, networkId: Network) => [
            'multipleCollateral',
            'balance',
            walletAddress,
            networkId,
        ],
    },
    Rates: {
        ExchangeRates: (networkId: Network) => ['rates', 'exchangeRates', networkId],
        ExchangeRatesMarketData: (networkId: Network) => ['rates', 'exchangeRatesMarketData', networkId],
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
        SpeedMarketsLimits: (networkId: Network, walletAddress?: string) => [
            'speedMarketsLimits',
            networkId,
            walletAddress,
        ],
        ChainedSpeedMarketsLimits: (networkId: Network, walletAddress?: string) => [
            'chainedSpeedMarketsLimits',
            networkId,
            walletAddress,
        ],
        UserSpeedMarkets: (networkId: Network, walletAddress: string) => ['userSpeedMarkets', networkId, walletAddress],
        UserChainedSpeedMarkets: (networkId: Network, walletAddress: string) => [
            'userChainedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        UserSpeedMarketsTransactions: (networkId: Network, walletAddress: string) => [
            'userSpeedMarketsTransactions',
            networkId,
            walletAddress,
        ],
        UserChainedSpeedMarketsTransactions: (networkId: Network, walletAddress: string) => [
            'userChainedSpeedMarketsTransactions',
            networkId,
            walletAddress,
        ],
        UserResolvedSpeedMarkets: (networkId: Network, walletAddress: string) => [
            'userResolvedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        UserResolvedChainedSpeedMarkets: (networkId: Network, walletAddress: string) => [
            'userResolvedChainedSpeedMarkets',
            networkId,
            walletAddress,
        ],
        ActiveSpeedMarkets: (networkId: Network) => ['activeSpeedMarkets', networkId],
        ActiveChainedSpeedMarkets: (networkId: Network) => ['activeChainedSpeedMarkets', networkId],
    },
    User: {
        OpenPositions: (walletAddress: string, networkId: Network) => [
            'user',
            'userOpenPositions',
            walletAddress,
            networkId,
        ],
        Notifications: (walletAddress: string, networkId: Network) => [
            'user',
            'notifications',
            walletAddress,
            networkId,
        ],
        VaultsAndLpTransactions: (networkId: Network, walletAddress: string) => [
            'user',
            'vaultsAndLpTransactions',
            networkId,
            walletAddress,
        ],
        UsersAmmBuyVolume: (networkId: Network, period: number) => ['user', 'ammBuyVolume', networkId, period],
    },
    Profile: {
        Data: (walletAddress: string, networkId: Network) => ['profile', 'data', walletAddress, networkId],
        OpenPositions: (walletAddress: string, networkId: Network) => [
            'profile',
            'openPositions',
            walletAddress,
            networkId,
        ],
        ClaimablePositions: (walletAddress: string, networkId: Network) => [
            'profile',
            'claimablePositions',
            walletAddress,
            networkId,
        ],
        ClosedPositions: (walletAddress: string, networkId: Network) => [
            'profile',
            'closedPositions',
            walletAddress,
            networkId,
        ],
        Trades: (walletAddress: string, networkId: Network) => ['profile', 'trades', walletAddress, networkId],
    },
    Swap: {
        Tokens: (networkId: Network) => ['swap', 'tokens', networkId],
        Quote: (networkId: Network, amount: BigNumber) => ['swap', 'quote', networkId, amount],
        Approve: (networkId: Network) => ['swap', 'approve', networkId],
        Swap: (networkId: Network) => ['swap', 'swap', networkId],
    },
    Referral: {
        ReferrerID: (walletAddress: string) => ['referrerId', walletAddress],
    },
    Banners: (networkId: Network) => ['banners', networkId],
};

export default QUERY_KEYS;
