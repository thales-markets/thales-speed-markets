import { Positions } from 'enums/options';
import { SpeedMarket } from './market';

export type UserPosition = {
    positionAddress: string;
    currencyKey: string;
    strikePrice: number;
    finalPrice: number;
    amount: number;
    maturityDate: number;
    expiryDate: number;
    market: string;
    side: Positions;
    paid: number;
    value: number;
    claimable: boolean;
    claimed: boolean;
    isChained?: boolean;
};

export type UserProfileData = {
    profit: number;
    volume: number;
    numberOfTrades: number;
    gain: number;
    investment: number;
};

export type TradeWithMarket = {
    timestamp: number;
    user: string;
    payout: number;
    paid: number;
    market: string;
    side: number;
    marketItem: SpeedMarket;
};
