import { countDecimals, roundNumberToDecimals } from 'thales-utils';

export const decimalToPercentage = (value: number) => roundNumberToDecimals(value * 100, countDecimals(value) - 2);

export const percentageToDecimal = (value: number) => roundNumberToDecimals(value / 100, countDecimals(value) + 2);
