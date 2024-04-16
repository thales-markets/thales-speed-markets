import { Positions } from 'enums/market';
import { SpeedMarket } from './market';

export type UserPosition = {
    currencyKey: string;
    strikePrice: number;
    finalPrice: number;
    payout: number;
    maturityDate: number;
    expiryDate: number;
    market: string;
    sides: Positions[];
    paid: number;
    value: number;
    claimable: boolean;
    claimed: boolean;
    isChained: boolean;
};

export type UserProfileData = {
    profit: number;
    volume: number;
    numberOfTrades: number;
    gain: number;
    investment: number;
};

export type TradeWithMarket = {
    user: string;
    payout: number;
    paid: number;
    sides: Positions[];
    marketItem: SpeedMarket;
};
