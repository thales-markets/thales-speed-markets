import Plausible from 'plausible-tracker';

export const PLAUSIBLE = Plausible({
    domain: 'speedmarkets.xyz',
    trackLocalhost: true,
    apiHost: 'https://analytics-v2.thalesmarket.io',
});

export const PLAUSIBLE_KEYS = {
    speedMarketsBuy: 'speed-markets-buy',
    chainedSpeedMarketsBuy: 'chained-speed-markets-buy',
};
