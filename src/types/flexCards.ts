import { Positions } from 'enums/market';

export type SharePositionType = 'resolved-speed' | 'potential-speed' | 'chained-speed-won' | 'chained-speed-lost';

export type SharePositionData = {
    type: SharePositionType;
    positions: Positions[];
    currencyKey: string;
    strikePrices?: number[];
    finalPrices?: number[];
    strikeDate: number;
    buyIn: number;
    payout: number;
    payoutMultiplier?: number;
};
