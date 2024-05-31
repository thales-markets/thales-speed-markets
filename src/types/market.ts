import { Positions } from 'enums/market';

export type UserPosition = {
    user: string;
    market: string;
    currencyKey: string;
    side: Positions;
    strikePrice: number;
    maturityDate: number;
    paid: number;
    payout: number;
    currentPrice: number;
    finalPrice: number;
    isClaimable: boolean;
    isResolved: boolean;
    createdAt?: number; // TODO: change to mandatory
};

export type UserChainedPosition = {
    user: string;
    market: string;
    currencyKey: string;
    sides: Positions[];
    strikePrices: number[];
    strikeTimes: number[];
    maturityDate: number;
    paid: number;
    payout: number;
    payoutMultiplier: number;
    currentPrice: number;
    finalPrices: number[];
    canResolve: boolean;
    resolveIndex?: number;
    isMatured: boolean;
    isClaimable: boolean;
    isUserWinner: boolean;
    isResolved: boolean;
    createdAt: number;
};

export type Risk = { current: number; max: number };
export type RiskPerAsset = { currency: string; current: number; max: number };
export type RiskPerAssetAndPosition = RiskPerAsset & { position: Positions };

export type AmmSpeedMarketsLimits = {
    maxBuyinAmount: number;
    minBuyinAmount: number;
    minimalTimeToMaturity: number;
    maximalTimeToMaturity: number;
    maxPriceDelaySec: number;
    maxPriceDelayForResolvingSec: number;
    risksPerAsset: RiskPerAsset[];
    risksPerAssetAndDirection: RiskPerAssetAndPosition[];
    timeThresholdsForFees: number[];
    lpFees: number[];
    defaultLPFee: number;
    maxSkewImpact: number;
    safeBoxImpact: number;
    whitelistedAddress: boolean;
};

export type AmmChainedSpeedMarketsLimits = {
    minChainedMarkets: number;
    maxChainedMarkets: number;
    minBuyinAmount: number;
    maxBuyinAmount: number;
    maxProfitPerIndividualMarket: number;
    minTimeFrame: number;
    maxTimeFrame: number;
    risk: Risk;
    payoutMultipliers: number[];
    maxPriceDelayForResolvingSec: number;
    whitelistedAddress: boolean;
};

// TODO: remove
export type SpeedMarket = {
    address: string;
    timestamp: number;
    currencyKey: string;
    strikePrice: number;
    maturityDate: number;
    isOpen: boolean;
    isChained: boolean;
    finalPrice?: number;
};

// TODO: remove
export type ChainedSpeedMarket = {
    address: string;
    timestamp: number;
    currencyKey: string;
    sides: (Positions.UP | Positions.DOWN)[];
    strikePrices: number[];
    strikeTimes: number[];
    maturityDate: number;
    payout: number;
    paid: number;
    payoutMultiplier: number;
    finalPrices: number[];
    isOpen: boolean;
    isMatured: boolean;
    canResolve: boolean;
    isClaimable: boolean;
    isUserWinner: boolean;
    user: string;
};
