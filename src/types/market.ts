import { Positions } from 'enums/market';

export type MarketInfo = {
    currencyKey: string;
    address: string;
    liquidity: number;
    price: number;
    roi: number;
    strikePrice: number;
    discount: number;
    positionType: Positions;
    url?: string;
};

// TODO: rename to UserPosition
export type UserOpenPositions = {
    user?: string; // TODO: change to mandatory
    market: string;
    currencyKey: string;
    side: Positions;
    strikePrice: number;
    maturityDate: number;
    paid: number;
    payout: number;
    value: number; // TODO: remove
    currentPrice?: number; // TODO: change to mandatory
    finalPrice: number;
    claimable?: boolean; // TODO: change to mandatory and rename to isClaimable
    isResolved?: boolean; // TODO: change to mandatory
};

// TODO: remove
export type UserClosedPositions = {
    currencyKey: string;
    strikePrice: number;
    payout: number;
    maturityDate: number;
    market: string;
    side: Positions;
    paid: number;
    value: number;
    finalPrice: number;
    isUserWinner: boolean;
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
    claimable: boolean;
    isUserWinner: boolean;
    user: string;
};
