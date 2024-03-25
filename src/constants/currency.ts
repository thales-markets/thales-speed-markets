import keyBy from 'lodash/keyBy';

import APEIcon from 'assets/currencies/crypto/APE.svg?react';
import ARBIcon from 'assets/currencies/crypto/ARB.svg?react';
import BCHIcon from 'assets/currencies/crypto/BCH.svg?react';
import BUSDIcon from 'assets/currencies/crypto/BUSD.svg?react';
import CAKEIcon from 'assets/currencies/crypto/CAKE.svg?react';
import CVXIcon from 'assets/currencies/crypto/CVX.svg?react';
import DAIIcon from 'assets/currencies/crypto/DAI.svg?react';
import DPXIcon from 'assets/currencies/crypto/DOPEX.svg?react';
import DYDXIcon from 'assets/currencies/crypto/DYDX.svg?react';
import ETCIcon from 'assets/currencies/crypto/ETC.svg?react';
import GMXIcon from 'assets/currencies/crypto/GMX.svg?react';
import KNCIcon from 'assets/currencies/crypto/KNC.svg?react';
import LOOKSIcon from 'assets/currencies/crypto/LOOKS.svg?react';
import LUNAIcon from 'assets/currencies/crypto/LUNA.svg?react';
import LYRAIcon from 'assets/currencies/crypto/LYRA.svg?react';
import MAGICIcon from 'assets/currencies/crypto/MAGIC.svg?react';
import MATICIcon from 'assets/currencies/crypto/MATIC.svg?react';
import OHMIcon from 'assets/currencies/crypto/OHM.svg?react';
import OPIcon from 'assets/currencies/crypto/OP.svg?react';
import PERPIcon from 'assets/currencies/crypto/PERP.svg?react';
import SNXIcon from 'assets/currencies/crypto/SNX.svg?react';
import USDCIcon from 'assets/currencies/crypto/USDC.svg?react';
import USDTIcon from 'assets/currencies/crypto/USDT.svg?react';
import sUSDIcon from 'assets/currencies/crypto/sUSD.svg?react';
import s1INCHIcon from 'assets/synths/s1INCH.svg?react';
import sAAPLIcon from 'assets/synths/sAAPL.svg?react';
import sAAVEIcon from 'assets/synths/sAAVE.svg?react';
import sADAIcon from 'assets/synths/sADA.svg?react';
import sAMZNIcon from 'assets/synths/sAMZN.svg?react';
import sAUDIcon from 'assets/synths/sAUD.svg?react';
import sBNBIcon from 'assets/synths/sBNB.svg?react';
import sBTCIcon from 'assets/synths/sBTC.svg?react';
import sCEXIcon from 'assets/synths/sCEX.svg?react';
import sCHFIcon from 'assets/synths/sCHF.svg?react';
import sCOMPIcon from 'assets/synths/sCOMP.svg?react';
import sCRVIcon from 'assets/synths/sCRV.svg?react';
import sDASHIcon from 'assets/synths/sDASH.svg?react';
import sDEFIIcon from 'assets/synths/sDEFI.svg?react';
import sDOTIcon from 'assets/synths/sDOT.svg?react';
import sEOSIcon from 'assets/synths/sEOS.svg?react';
import sETCIcon from 'assets/synths/sETC.svg?react';
import sETHIcon from 'assets/synths/sETH.svg?react';
import sEURIcon from 'assets/synths/sEUR.svg?react';
import sFBIcon from 'assets/synths/sFB.svg?react';
import sFTSEIcon from 'assets/synths/sFTSE.svg?react';
import sGBPIcon from 'assets/synths/sGBP.svg?react';
import sGOOGIcon from 'assets/synths/sGOOG.svg?react';
import sJPYIcon from 'assets/synths/sJPY.svg?react';
import sKRWIcon from 'assets/synths/sKRW.svg?react';
import sLINKIcon from 'assets/synths/sLINK.svg?react';
import sLTCIcon from 'assets/synths/sLTC.svg?react';
import sNFLXIcon from 'assets/synths/sNFLX.svg?react';
import sNIKKEIIcon from 'assets/synths/sNIKKEI.svg?react';
import sOILIcon from 'assets/synths/sOIL.svg?react';
import sRENIcon from 'assets/synths/sREN.svg?react';
import sRUNEIcon from 'assets/synths/sRUNE.svg?react';
import sSOLIcon from 'assets/synths/sSOL.svg?react';
import sTRXIcon from 'assets/synths/sTRX.svg?react';
import sTSLAIcon from 'assets/synths/sTSLA.svg?react';
import sUNIIcon from 'assets/synths/sUNI.svg?react';
import sXMRIcon from 'assets/synths/sXMR.svg?react';
import sXRPIcon from 'assets/synths/sXRP.svg?react';
import sXTZIcon from 'assets/synths/sXTZ.svg?react';
import sYFIIcon from 'assets/synths/sYFI.svg?react';
import { Coins, NetworkId } from 'thales-utils';
import { SupportedNetwork } from 'types/network';

const SYNTHS = [
    'sBTC',
    'sBCH',
    'sETH',
    'sEUR',
    'sDEFI',
    'sAAPL',
    'sFB',
    'sGOOG',
    'sNFLX',
    'sLINK',
    'sAAVE',
    'sUNI',
    'sAUD',
    'sGBP',
    'sCHF',
    'sKRW',
    'sXAU',
    'sOIL',
    'sBNB',
    'sTRX',
    'sXTZ',
    'sXRP',
    'sLTC',
    'sEOS',
    'sETC',
    'sDASH',
    'sXMR',
    'sADA',
    'sYFI',
    'sDOT',
    'sREN',
    'sCOMP',
    's1INCH',
    'sRUNE',
    'sFTSE',
    'sNIKKEI',
    'sTSLA',
    'sCRV',
    'sAMZN',
    'sCEX',
    'sXAG',
    'sJPY',
    'sUSD',
    'sLONG',
    'sSHORT',
    'sSOL',
];
export const SYNTHS_MAP = keyBy(SYNTHS);

const CRYPTO_CURRENCY = [
    'BTC',
    'ETH',
    'SNX',
    'ARB',
    'OP',
    'GMX',
    'LINK',
    'MAGIC',
    'DPX',
    'MATIC',
    'KNC',
    'COMP',
    'REN',
    'LEND',
    'XRP',
    'BCH',
    'LTC',
    'EOS',
    'BNB',
    'XTZ',
    'XMR',
    'ADA',
    'TRX',
    'DASH',
    'ETC',
    'BAT',
    'DAI',
    'PHP',
    'REP',
    'USDCe',
    'USDbC',
    'USDC',
    'USDT',
    'VELO',
    'ZRX',
    'THALES',
    'SOL',
    'UNI',
    'CRV',
    'AAVE',
    'LYRA',
    'LUNA',
    'PERP',
    'APE',
    'CVX',
    'OHM',
    'LOOKS',
    'DYDX',
    'ETC',
    'BUSD',
    'CAKE',
    'PEPE',
    'WLD',
    'WETH',
    'TIA',
    'BONK',
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
    [SYNTHS_MAP.sEUR]: sEURIcon,
    [SYNTHS_MAP.sDEFI]: sDEFIIcon,
    [SYNTHS_MAP.sAAPL]: sAAPLIcon,
    [SYNTHS_MAP.sFB]: sFBIcon,
    [SYNTHS_MAP.sGOOG]: sGOOGIcon,
    [SYNTHS_MAP.sNFLX]: sNFLXIcon,
    [SYNTHS_MAP.sLINK]: sLINKIcon,
    [SYNTHS_MAP.sAAVE]: sAAVEIcon,
    [SYNTHS_MAP.sUNI]: sUNIIcon,
    [SYNTHS_MAP.sAUD]: sAUDIcon,
    [SYNTHS_MAP.sGBP]: sGBPIcon,
    [SYNTHS_MAP.sCHF]: sCHFIcon,
    [SYNTHS_MAP.sKRW]: sKRWIcon,
    [SYNTHS_MAP.sOIL]: sOILIcon,
    [SYNTHS_MAP.sBNB]: sBNBIcon,
    [SYNTHS_MAP.sTRX]: sTRXIcon,
    [SYNTHS_MAP.sXTZ]: sXTZIcon,
    [SYNTHS_MAP.sXRP]: sXRPIcon,
    [SYNTHS_MAP.sLTC]: sLTCIcon,
    [SYNTHS_MAP.sEOS]: sEOSIcon,
    [SYNTHS_MAP.sETC]: sETCIcon,
    [SYNTHS_MAP.sDASH]: sDASHIcon,
    [SYNTHS_MAP.sXMR]: sXMRIcon,
    [SYNTHS_MAP.sADA]: sADAIcon,
    [SYNTHS_MAP.sYFI]: sYFIIcon,
    [SYNTHS_MAP.sDOT]: sDOTIcon,
    [SYNTHS_MAP.sCOMP]: sCOMPIcon,
    [SYNTHS_MAP.s1INCH]: s1INCHIcon,
    [SYNTHS_MAP.sRUNE]: sRUNEIcon,
    [SYNTHS_MAP.sNIKKEI]: sNIKKEIIcon,
    [SYNTHS_MAP.sTSLA]: sTSLAIcon,
    [SYNTHS_MAP.sCRV]: sCRVIcon,
    [SYNTHS_MAP.sAMZN]: sAMZNIcon,
    [SYNTHS_MAP.sCEX]: sCEXIcon,
    [SYNTHS_MAP.sJPY]: sJPYIcon,
    [SYNTHS_MAP.sUSD]: sUSDIcon,
    [SYNTHS_MAP.sFTSE]: sFTSEIcon,
    [SYNTHS_MAP.sREN]: sRENIcon,
    [SYNTHS_MAP.sBCH]: BCHIcon,
    [SYNTHS_MAP.sSOL]: sSOLIcon,
    [CRYPTO_CURRENCY_MAP.ETH]: sETHIcon,
    [CRYPTO_CURRENCY_MAP.WETH]: sETHIcon,
    [CRYPTO_CURRENCY_MAP.SNX]: SNXIcon,
    [CRYPTO_CURRENCY_MAP.KNC]: KNCIcon,
    [CRYPTO_CURRENCY_MAP.LEND]: sAAVEIcon,
    [CRYPTO_CURRENCY_MAP.LYRA]: LYRAIcon,
    [CRYPTO_CURRENCY_MAP.LUNA]: LUNAIcon,
    [CRYPTO_CURRENCY_MAP.MATIC]: MATICIcon,
    [CRYPTO_CURRENCY_MAP.PERP]: PERPIcon,
    [CRYPTO_CURRENCY_MAP.APE]: APEIcon,
    [CRYPTO_CURRENCY_MAP.CVX]: CVXIcon,
    [CRYPTO_CURRENCY_MAP.OHM]: OHMIcon,
    [CRYPTO_CURRENCY_MAP.DAI]: DAIIcon,
    [CRYPTO_CURRENCY_MAP.USDC]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDCe]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDbC]: USDCIcon,
    [CRYPTO_CURRENCY_MAP.USDT]: USDTIcon,
    [CRYPTO_CURRENCY_MAP.OP]: OPIcon,
    [CRYPTO_CURRENCY_MAP.ARB]: ARBIcon,
    [CRYPTO_CURRENCY_MAP.LOOKS]: LOOKSIcon,
    [CRYPTO_CURRENCY_MAP.DYDX]: DYDXIcon,
    [CRYPTO_CURRENCY_MAP.ETC]: ETCIcon,
    [CRYPTO_CURRENCY_MAP.BUSD]: BUSDIcon,
    [CRYPTO_CURRENCY_MAP.MAGIC]: MAGICIcon,
    [CRYPTO_CURRENCY_MAP.DPX]: DPXIcon,
    [CRYPTO_CURRENCY_MAP.GMX]: GMXIcon,
    [CRYPTO_CURRENCY_MAP.CAKE]: CAKEIcon,
};

export const currencyKeyToNameMap = {
    [SYNTHS_MAP.sBTC]: 'Bitcoin',
    [SYNTHS_MAP.sETH]: 'Ethereum',
    [SYNTHS_MAP.sEUR]: 'Euros',
    [SYNTHS_MAP.sDEFI]: 'DeFi Index',
    [SYNTHS_MAP.sAAPL]: 'Apple',
    [SYNTHS_MAP.sFB]: 'Facebook',
    [SYNTHS_MAP.sGOOG]: 'Google',
    [SYNTHS_MAP.sNFLX]: 'Netflix',
    [SYNTHS_MAP.sLINK]: 'Chainlink',
    [SYNTHS_MAP.sAAVE]: 'Aave',
    [SYNTHS_MAP.sUNI]: 'Uniswap',
    [SYNTHS_MAP.sAUD]: 'Australian Dollars',
    [SYNTHS_MAP.sGBP]: 'Pound Sterling',
    [SYNTHS_MAP.sCHF]: 'Swiss Franc',
    [SYNTHS_MAP.sKRW]: 'South Korean Won',
    [SYNTHS_MAP.sXAU]: 'Gold Ounce',
    [SYNTHS_MAP.sOIL]: 'Perpetual Oil Futures',
    [SYNTHS_MAP.sBNB]: 'Binance Coin',
    [SYNTHS_MAP.sTRX]: 'TRON',
    [SYNTHS_MAP.sXTZ]: 'Tezos',
    [SYNTHS_MAP.sXRP]: 'Ripple',
    [SYNTHS_MAP.sLTC]: 'Litecoin',
    [SYNTHS_MAP.sEOS]: 'EOS',
    [SYNTHS_MAP.sETC]: 'Ethereum Classic',
    [SYNTHS_MAP.sDASH]: 'Dash',
    [SYNTHS_MAP.sXMR]: 'Monero',
    [SYNTHS_MAP.sADA]: 'Cardano',
    [SYNTHS_MAP.sYFI]: 'yearn.finance',
    [SYNTHS_MAP.sDOT]: 'Polkadot',
    [SYNTHS_MAP.sCOMP]: 'Compound',
    [SYNTHS_MAP.s1INCH]: '1inch',
    [SYNTHS_MAP.sRUNE]: 'THORChain',
    [SYNTHS_MAP.sNIKKEI]: 'Nikkei 225 Index',
    [SYNTHS_MAP.sTSLA]: 'Tesla',
    [SYNTHS_MAP.sCRV]: 'Curve',
    [SYNTHS_MAP.sAMZN]: 'Amazon',
    [SYNTHS_MAP.sCEX]: 'Centralised Exchange Index',
    [SYNTHS_MAP.sXAG]: 'Silver Ounce',
    [SYNTHS_MAP.sJPY]: 'Japanese Yen',
    [SYNTHS_MAP.sUSD]: 'US Dollars',
    [SYNTHS_MAP.sFTSE]: 'FTSE 100 Index',
    [SYNTHS_MAP.sREN]: 'Ren',
    [SYNTHS_MAP.sBCH]: 'Bitcoin Cash',
    [CRYPTO_CURRENCY_MAP.SNX]: 'Synthetix',
    [CRYPTO_CURRENCY_MAP.KNC]: 'Kyber Network',
    [CRYPTO_CURRENCY_MAP.LEND]: 'LEND',
    [CRYPTO_CURRENCY_MAP.BAT]: 'Basic Attention Token',
    [CRYPTO_CURRENCY_MAP.DAI]: 'Dai',
    [CRYPTO_CURRENCY_MAP.PHP]: 'Philippine Peso',
    [CRYPTO_CURRENCY_MAP.REP]: 'Augur',
    [CRYPTO_CURRENCY_MAP.USDCe]: 'Bridged USDC',
    [CRYPTO_CURRENCY_MAP.USDbC]: 'USD Base Coin',
    [CRYPTO_CURRENCY_MAP.USDC]: 'USD Coin',
    [CRYPTO_CURRENCY_MAP.USDT]: 'Tether',
    [CRYPTO_CURRENCY_MAP.VELO]: 'Velo',
    [CRYPTO_CURRENCY_MAP.ZRX]: '0x',
    [CRYPTO_CURRENCY_MAP.LYRA]: 'Lyra',
    [CRYPTO_CURRENCY_MAP.LUNA]: 'Luna',
    [SYNTHS_MAP.sSOL]: 'Solana',
    [CRYPTO_CURRENCY_MAP.PERP]: 'Perpetual Protocol',
    [CRYPTO_CURRENCY_MAP.APE]: 'Apecoin',
    [CRYPTO_CURRENCY_MAP.ARB]: 'Arbitrum',
    [CRYPTO_CURRENCY_MAP.CVX]: 'Convex Finance',
    [CRYPTO_CURRENCY_MAP.OHM]: 'Olympus',
    [CRYPTO_CURRENCY_MAP.OP]: 'Optimism',
    [CRYPTO_CURRENCY_MAP.LOOKS]: 'LooksRare',
    [CRYPTO_CURRENCY_MAP.DYDX]: 'dYdX',
    [CRYPTO_CURRENCY_MAP.ETC]: 'Ethereum Classic',
    [CRYPTO_CURRENCY_MAP.BNB]: 'Binance Coin',
    [CRYPTO_CURRENCY_MAP.MAGIC]: 'Magic',
    [CRYPTO_CURRENCY_MAP.DPX]: 'Dopex',
    [CRYPTO_CURRENCY_MAP.GMX]: 'GMX',
    [CRYPTO_CURRENCY_MAP.CAKE]: 'PancakeSwap',
    [CRYPTO_CURRENCY_MAP.PEPE]: 'PEPE',
    [CRYPTO_CURRENCY_MAP.WLD]: 'Worldcoin',
    [CRYPTO_CURRENCY_MAP.TIA]: 'TIA',
    [CRYPTO_CURRENCY_MAP.BONK]: 'BONK',
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
