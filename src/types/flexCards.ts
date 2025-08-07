import { Positions } from 'enums/market';
import { Coins } from 'thales-utils';

export type SharePositionType =
    | 'speed-potential'
    | 'speed-won'
    | 'speed-loss'
    | 'chained-speed-won'
    | 'chained-speed-loss';

export type SharePositionData = {
    type: SharePositionType;
    positions: Positions[];
    currencyKey: string;
    strikePrices?: number[];
    finalPrices?: number[];
    buyIn: number;
    payout: number;
    collateral: Coins;
    marketDuration?: string;
};
