import keyBy from 'lodash/keyBy';

import ARBIcon from 'assets/currencies/crypto/ARB.svg?react';
import BNBIcon from 'assets/currencies/crypto/BNB.svg?react';
import BTCIcon from 'assets/currencies/crypto/BTC.svg?react';
import BUSDIcon from 'assets/currencies/crypto/BUSD.svg?react';
import DAIIcon from 'assets/currencies/crypto/DAI.svg?react';
import ETHIcon from 'assets/currencies/crypto/ETH.svg?react';
import MATICIcon from 'assets/currencies/crypto/MATIC.svg?react';
import OPIcon from 'assets/currencies/crypto/OP.svg?react';
import USDCIcon from 'assets/currencies/crypto/USDC.svg?react';
import USDTIcon from 'assets/currencies/crypto/USDT.svg?react';
import sUSDIcon from 'assets/currencies/crypto/sUSD.svg?react';
import sBNBIcon from 'assets/synths/sBNB.svg?react';
import sBTCIcon from 'assets/synths/sBTC.svg?react';
import sETHIcon from 'assets/synths/sETH.svg?react';
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
    'BUSD',
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
    CRYPTO_CURRENCY_MAP.BUSD,
];

const FIAT_CURRENCY = ['USD'];
export const FIAT_CURRENCY_MAP = keyBy(FIAT_CURRENCY);
const FIAT_CURRENCY_SIGN = {
    [FIAT_CURRENCY_MAP.USD]: '$',
};
export const USD_SIGN = FIAT_CURRENCY_SIGN[FIAT_CURRENCY_MAP.USD];

export const currencyKeyToAssetIconMap = {
    [SYNTHS_MAP.sBTC]: sBTCIcon,
    [SYNTHS_MAP.sETH]: sETHIcon,
    [SYNTHS_MAP.sBNB]: sBNBIcon,
    [SYNTHS_MAP.sUSD]: sUSDIcon,
    [CRYPTO_CURRENCY_MAP.ETH]: ETHIcon,
    [CRYPTO_CURRENCY_MAP.WETH]: sETHIcon,
    [CRYPTO_CURRENCY_MAP.MATIC]: MATICIcon,
    [CRYPTO_CURRENCY_MAP.DAI]: DAIIcon,
    [CRYPTO_CURRENCY_MAP.USDC]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDCe]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDbC]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDT]: USDTIcon,
    [CRYPTO_CURRENCY_MAP.OP]: OPIcon,
    [CRYPTO_CURRENCY_MAP.ARB]: ARBIcon,
    [CRYPTO_CURRENCY_MAP.BNB]: BNBIcon,
    [CRYPTO_CURRENCY_MAP.BUSD]: BUSDIcon,
    [CRYPTO_CURRENCY_MAP.BTC]: BTCIcon,
};

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
    [NetworkId.OptimismGoerli]: [
        SYNTHS_MAP.sUSD as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
    ],
    [NetworkId.OptimismSepolia]: [
        SYNTHS_MAP.sUSD as Coins,
        CRYPTO_CURRENCY_MAP.DAI as Coins,
        CRYPTO_CURRENCY_MAP.USDC as Coins,
        CRYPTO_CURRENCY_MAP.USDT as Coins,
    ],
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
