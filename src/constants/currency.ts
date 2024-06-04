import keyBy from 'lodash/keyBy';
import { Coins, NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';

const SYNTHS = ['sBTC', 'sETH', 'sBNB', 'sUSD'];
export const SYNTHS_MAP = keyBy(SYNTHS);

const CRYPTO_CURRENCY = [
    'BTC',
    'ETH',
    'ARB',
    'OP',
    'MATIC',
    'BNB',
    'DAI',
    'USDCe',
    'USDbC',
    'USDC',
    'USDT',
    'THALES',
    'ETC',
    'WETH',
];
export const CRYPTO_CURRENCY_MAP = keyBy(CRYPTO_CURRENCY);

export const STABLE_COINS = [
    SYNTHS_MAP.sUSD,
    CRYPTO_CURRENCY_MAP.DAI,
    CRYPTO_CURRENCY_MAP.USDCe,
    CRYPTO_CURRENCY_MAP.USDbC,
    CRYPTO_CURRENCY_MAP.USDC,
    CRYPTO_CURRENCY_MAP.USDT,
];

const FIAT_CURRENCY = ['USD'];
export const FIAT_CURRENCY_MAP = keyBy(FIAT_CURRENCY);
const FIAT_CURRENCY_SIGN = {
    [FIAT_CURRENCY_MAP.USD]: '$',
};
export const USD_SIGN = FIAT_CURRENCY_SIGN[FIAT_CURRENCY_MAP.USD];

export const currencyKeyToNameMap = {
    [SYNTHS_MAP.sBTC]: 'Bitcoin',
    [SYNTHS_MAP.sETH]: 'Ethereum',
    [SYNTHS_MAP.sBNB]: 'Binance Coin',
    [SYNTHS_MAP.sETC]: 'Ethereum Classic',
    [SYNTHS_MAP.sBCH]: 'Bitcoin Cash',
    [CRYPTO_CURRENCY_MAP.SNX]: 'Synthetix',
    [CRYPTO_CURRENCY_MAP.KNC]: 'Kyber Network',
    [CRYPTO_CURRENCY_MAP.LEND]: 'LEND',
    [CRYPTO_CURRENCY_MAP.DAI]: 'Dai',
    [CRYPTO_CURRENCY_MAP.USDCe]: 'Bridged USDC',
    [CRYPTO_CURRENCY_MAP.USDbC]: 'USD Base Coin',
    [CRYPTO_CURRENCY_MAP.USDC]: 'USD Coin',
    [CRYPTO_CURRENCY_MAP.USDT]: 'Tether',
    [CRYPTO_CURRENCY_MAP.ARB]: 'Arbitrum',
    [CRYPTO_CURRENCY_MAP.OP]: 'Optimism',
    [CRYPTO_CURRENCY_MAP.ETC]: 'Ethereum Classic',
    [CRYPTO_CURRENCY_MAP.BNB]: 'Binance Coin',
};

export const COLLATERALS: Record<SupportedNetwork, Coins[]> = {
    [NetworkId.OptimismMainnet]: [
        SYNTHS_MAP.sUSD as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.OP as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [NetworkId.OptimismSepolia]: [SYNTHS_MAP.sUSD as Coins, CRYPTO_CURRENCY_MAP.DAI as Coins],
    [NetworkId.PolygonMainnet]: [CRYPTO_CURRENCY_MAP.USDCe as Coins],
    [NetworkId.Base]: [
        CRYPTO_CURRENCY_MAP.USDbC as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [NetworkId.Arbitrum]: [
        CRYPTO_CURRENCY_MAP.USDCe as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
        CRYPTO_CURRENCY_MAP.ARB as Coins,
        CRYPTO_CURRENCY_MAP.WETH as Coins,
        CRYPTO_CURRENCY_MAP.ETH as Coins,
    ],
    [NetworkId.ZkSync]: [CRYPTO_CURRENCY_MAP.USDC as Coins],
    [NetworkId.ZkSyncSepolia]: [SYNTHS_MAP.sUSD as Coins],
    [NetworkId.BlastSepolia]: [SYNTHS_MAP.sUSD as Coins],
};
