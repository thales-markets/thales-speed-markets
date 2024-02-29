import { Positions } from 'enums/options';
import { OptionSide } from '../types/options';

export const POSITIONS_TO_SIDE_MAP: Record<Positions, number> = {
    UP: 0,
    DOWN: 1,
    IN: 0,
    OUT: 1,
};

export const SIDE: Record<OptionSide | number, number | OptionSide> = {
    long: 0,
    short: 1,
    0: 'long',
    1: 'short',
};

export const OPTIONS_POSITIONS_MAP = {
    long: 'UP',
    short: 'DOWN',
    in: 'IN',
    out: 'OUT',
};

export const POSITION_BALANCE_THRESHOLD = 0.01;

export const MARKET_DURATION_IN_DAYS = 90;

export const ONE_HUNDRED_AND_THREE_PERCENT = 1.03;

export const SPEED_MARKETS_QUOTE = 2;
export const MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH = 3000;
export const BATCH_NUMBER_OF_SPEED_MARKETS = 1000;
export const SPEED_MARKETS_OVERVIEW_SECTIONS = {
    userWinner: 'userWinner',
    ammWinner: 'ammWinner',
    unknownPrice: 'unknownPrice',
    openPositions: 'openPositions',
};

export const ALTCOIN_CONVERSION_BUFFER_PERCENTAGE = 0.01; // 1%
export const STABLECOIN_CONVERSION_BUFFER_PERCENTAGE = 0.005; // 0.5%

const TODAY = new Date();
export const MIN_MATURITY = Math.round(
    new Date(new Date().setDate(TODAY.getDate() - MARKET_DURATION_IN_DAYS)).getTime() / 1000
); // show history for 90 days in the past
export const MAX_MATURITY = Math.round(Number(TODAY.getTime() / 1000)); // show history until today
