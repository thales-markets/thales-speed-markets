import { Positions } from 'enums/options';

export const POSITIONS_TO_SIDE_MAP: Record<Positions, number> = {
    UP: 0,
    DOWN: 1,
};

export const SIDE_TO_POSITION_MAP: Record<number, Positions> = {
    0: Positions.UP,
    1: Positions.DOWN,
};

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
// show history for 90 days in the past
export const MIN_MATURITY = Math.round(
    new Date(new Date().setDate(TODAY.getDate() - MARKET_DURATION_IN_DAYS)).getTime() / 1000
);
