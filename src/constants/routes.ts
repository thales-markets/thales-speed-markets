const ROUTES = {
    Home: '/',
    Article: {
        Token: '/article/token',
        Governance: '/article/governance',
        Whitepaper: '/article/whitepaper',
    },
    Options: {
        Home: '/markets',
        RangeMarkets: '/ranged-markets',
        SpeedMarkets: '/speed-markets',
        SpeedMarketsOverview: '/speed-markets/overview',
        ChainedSpeedMarkets: '/speed-markets?isChained=true',
        ChainedSpeedMarketsOverview: '/speed-markets/overview?isChained=true',
        HotMarkets: '/markets?anchor=hot-markets',
        CustomMarkets: '/markets?userFilter2=custom',
        CompetitionMarkets: '/markets?userFilter2=competition',
        Overview: '/markets?anchor=overview',
        CreateMarket: '/markets/create-market',
        MarketMatch: '/markets/:marketAddress',
        RangeMarketMatch: '/ranged-markets/:marketAddress',
        Leaderboard: '/markets/leaderboard',
        TradeHistory: '/markets/trade-history',
        Token: '/token',
        StakingLeaderboard: '/token/leaderboard',
        Royal: '/royale',
        Game: '/tale-of-thales',
        TokenMigration: '/token?tab=migration&action=migrate',
        Profile: '/profile',
        Referral: '/referral',
        Wizard: '/wizard',
        OPRewards: '/op-rewards',
        Vaults: '/vaults',
        Vault: '/vaults/:vaultId',
        LiquidityPool: '/liquidity-pool',
    },
    Governance: {
        Home: '/governance',
        Space: '/governance/:space',
        Proposal: '/governance/:space/:id',
    },
};
export default ROUTES;
