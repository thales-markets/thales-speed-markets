import { Positions } from 'enums/market';

export type UserHistoryPosition = {
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
