import { Positions } from 'enums/market';
import { SpeedMarket } from './market';

// TODO: remove
export type UserProfilePosition = {
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

// TODO: remove
export type UserProfileData = {
    profit: number;
    volume: number;
    numberOfTrades: number;
    gain: number;
    investment: number;
};

// TODO: remove
export type TradeWithMarket = {
    user: string;
    payout: number;
    paid: number;
    sides: Positions[];
    marketItem: SpeedMarket;
};
