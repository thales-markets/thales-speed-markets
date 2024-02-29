import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP, COMMODITY_MAP } from 'constants/currency';

export const assetToTradingViewMap = {
    [SYNTHS_MAP.sBTC]: 'COINBASE:BTCUSD',
    [SYNTHS_MAP.sETH]: 'COINBASE:ETHUSD',
    [SYNTHS_MAP.sEUR]: 'OANDA:EURUSD',
    [SYNTHS_MAP.sDEFI]: 'DEFIUSDT',
    [SYNTHS_MAP.sAAPL]: 'NASDAQ:AAPL',
    [SYNTHS_MAP.sFB]: 'NASDAQ:FB',
    [SYNTHS_MAP.sGOOG]: 'NASDAQ:GOOG',
    [SYNTHS_MAP.sNFLX]: 'NASDAQ:NFLX',
    [SYNTHS_MAP.sLINK]: 'COINBASE:LINKUSD',
    [SYNTHS_MAP.sAAVE]: 'BINANCE:AAVEUSDT',
    [SYNTHS_MAP.sUNI]: 'BINANCE:UNIUSDT',
    [SYNTHS_MAP.sAUD]: 'OANDA:AUDUSD',
    [SYNTHS_MAP.sGBP]: 'OANDA:GBPUSD',
    [SYNTHS_MAP.sCHF]: 'FX_IDC:CHFUSD',
    [SYNTHS_MAP.sKRW]: 'FX_IDC:KRWUSD',
    [SYNTHS_MAP.sXAU]: 'OANDA:XAUUSD',
    [SYNTHS_MAP.sOIL]: 'TVC:USOIL',
    [SYNTHS_MAP.sBNB]: 'BINANCE:BNBUSDT',
    [SYNTHS_MAP.sTRX]: 'BINANCE:TRXUSDT',
    [SYNTHS_MAP.sXTZ]: 'BINANCE:XTZUSDT',
    [SYNTHS_MAP.sXRP]: 'BINANCE:XRPUSDT',
    [SYNTHS_MAP.sLTC]: 'BINANCE:LTCUSDT',
    [SYNTHS_MAP.sEOS]: 'BINANCE:EOSUSDT',
    [SYNTHS_MAP.sETC]: 'BINANCE:ETCUSDT',
    [SYNTHS_MAP.sDASH]: 'BINANCE:DASHUSDT',
    [SYNTHS_MAP.sXMR]: 'BINANCE:XMRUSDT',
    [SYNTHS_MAP.sADA]: 'BINANCE:ADAUSDT',
    [SYNTHS_MAP.sYFI]: 'BINANCE:YFIUSDT',
    [SYNTHS_MAP.sDOT]: 'BINANCE:DOTUSDT',
    [SYNTHS_MAP.sREN]: 'BINANCE:RENUSDT',
    [SYNTHS_MAP.sCOMP]: 'BINANCE:COMPUSDT',
    [SYNTHS_MAP.s1INCH]: 'BINANCE:1INCHUSDT',
    [SYNTHS_MAP.sRUNE]: 'BINANCE:RUNEUSDT',
    [SYNTHS_MAP.sFTSE]: 'CURRENCYCOM:UK100',
    [SYNTHS_MAP.sNIKKEI]: 'TVC:NI225',
    [SYNTHS_MAP.sTSLA]: 'NASDAQ:TSLA',
    [SYNTHS_MAP.sCRV]: 'BINANCE:CRVUSDT',
    [SYNTHS_MAP.sAMZN]: 'NASDAQ:AMZN',
    [SYNTHS_MAP.sUNI]: 'BINANCE:UNIUSDT',
    [SYNTHS_MAP.sUNI]: 'BINANCE:UNIUSDT',
    [SYNTHS_MAP.sUNI]: 'BINANCE:UNIUSDT',
    [SYNTHS_MAP.sCEX]: 'CEXUSDT',
    [SYNTHS_MAP.sXAG]: 'FX_IDC:XAGUSD',
    [SYNTHS_MAP.sJPY]: 'FX_IDC:JPYUSD',
    [CRYPTO_CURRENCY_MAP.SNX]: 'COINBASE:SNXUSD',
    [CRYPTO_CURRENCY_MAP.KNC]: 'COINBASE:KNCUSD',
    [CRYPTO_CURRENCY_MAP.LYRA]: 'LYRAWETH*ETHUSD',
    [CRYPTO_CURRENCY_MAP.LUNA]: 'BINANCE:LUNAUSDT',
    [CRYPTO_CURRENCY_MAP.OHM]: 'OHMDAI',
    [CRYPTO_CURRENCY_MAP.DPX]: 'DPXWETH*ETHUSD',
    [COMMODITY_MAP.XAU]: 'FX_IDC:XAUUSD',
    [COMMODITY_MAP.XAG]: 'FX_IDC:XAGUSD',
};
