import { countDecimals, formatCurrency, formatCurrencyWithPrecision, roundNumberToDecimals } from 'thales-utils';

export const formatNumberShort = (value: number, trim = true, negativeFactors = false) => {
    // Nine Zeroes for Billions
    return value >= 1.0e9
        ? formatCurrency(value / 1.0e9, 2, trim) + 'b'
        : // Six Zeroes for Millions
        value >= 1.0e6
        ? formatCurrency(value / 1.0e6, 2, trim) + 'm'
        : // Three Zeroes for Thousands
        value >= 1.0e3
        ? formatCurrency(value / 1.0e3, 2, trim) + 'k'
        : negativeFactors && value <= 1.0e-6
        ? formatCurrency(value * 1.0e6, 2, trim) + 'e-6'
        : formatCurrencyWithPrecision(value, trim);
};

export const decimalToPercentage = (value: number) => roundNumberToDecimals(value * 100, countDecimals(value) - 2);

export const percentageToDecimal = (value: number) => roundNumberToDecimals(value / 100, countDecimals(value) + 2);
