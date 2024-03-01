import { Positions } from 'enums/options';
import { BigNumber } from 'ethers';

type Phase = 'trading' | 'maturity' | 'expiry';

type OptionType = 'up' | 'down';

export type HistoricalOptionsMarketInfo = {
    address: string;
    timestamp: number;
    creator: string;
    currencyKey: string;
    strikePrice: number;
    maturityDate: number;
    expiryDate: number;
    isOpen: boolean;
    longPrice: number;
    shortPrice: number;
    poolSize: number;
    asset: string;
    phase: Phase;
    phaseNum: number;
    timeRemaining: number;
    openOrders: number;
    orders: Array<any>;
    longAddress: string;
    shortAddress: string;
    customMarket: boolean;
    customOracle: string;
    result: number;
    availableLongs: number;
    availableShorts: number;
    discountedSide?: string;
    discount?: number;
    country?: string;
    eventName?: string;
    outcome?: string;
    finalPrice?: number;
    ammLiquidity?: number;
};

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

export type RangedMarketPerPosition = {
    currencyKey: string;
    address: string;
    liquidity: number;
    price: number;
    roi: number;
    leftPrice: number;
    rightPrice: number;
    discount: number;
    positionType: Positions;
    url?: string;
};

export type RangedMarket = {
    address: string;
    timestamp: number;
    currencyKey: string;
    maturityDate: number;
    expiryDate: number;
    leftPrice: number;
    rightPrice: number;
    inAddress: string;
    outAddress: string;
    leftMarket: {
        id: string;
        creator: string;
        longAddress: string;
        shortAddress: string;
    };
    rightMarket: {
        id: string;
        creator: string;
        longAddress: string;
        shortAddress: string;
    };
    isOpen: boolean;
    result: OptionType;
    finalPrice: number;
};

type OrderSide = 'buy' | 'sell';
export type Trade = {
    id: string;
    transactionHash: string;
    timestamp: number;
    orderHash: string;
    maker: string;
    taker: string;
    makerToken: string;
    takerToken: string;
    makerAmount: number;
    takerAmount: number;
    blockNumber: number;
    market: string;
    orderSide: OrderSide;
    optionSide: number;
};

export type UserLivePositions = {
    positionAddress: string;
    currencyKey: string;
    strikePrice: string;
    strikePriceNum?: number;
    amount: number;
    amountBigNumber: BigNumber;
    maturityDate: number;
    market: string;
    side: Positions;
    paid: number;
    value: number;
    isSpeedMarket: boolean;
    claimable?: boolean;
    finalPrice?: number;
    currentPrice?: number;
    user?: string;
};

export type UserClosedPositions = {
    currencyKey: string;
    strikePrice: string;
    strikePriceNum: number;
    amount: number;
    amountBigNumber: BigNumber;
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
    result: number;
    finalPrice?: number;
    isSpeedMarket: boolean;
    isChainedSpeedMarket?: boolean;
};

export type ChainedSpeedMarket = {
    address: string;
    timestamp: number;
    currencyKey: string;
    sides: (Positions.UP | Positions.DOWN)[];
    strikePrices: number[];
    strikeTimes: number[];
    maturityDate: number;
    amount: number;
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
