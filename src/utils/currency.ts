import {
    ADDITIONAL_COLLATERALS,
    COLLATERALS,
    COMMODITY,
    CRYPTO_CURRENCY,
    STABLE_COINS,
    SYNTHS_MAP,
    currencyKeyToAssetIconMap,
    currencyKeyToNameMap,
} from 'constants/currency';
import { Coins } from 'thales-utils';
import { SupportedNetwork } from 'types/network';

// TODO: replace this with a more robust logic (like checking the asset field)
const synthToAsset = (currencyKey: string) => currencyKey.replace(/^(i|s)/i, '');

export const getAssetIcon = (currencyKey: string) =>
    currencyKeyToAssetIconMap[currencyKey] || currencyKeyToAssetIconMap[`s${currencyKey}`];

export const getSynthName = (currencyKey: string) =>
    currencyKeyToNameMap[currencyKey] || currencyKeyToNameMap[`s${currencyKey}`] || currencyKey;

export const getSynthAsset = (currencyKey: string) =>
    SYNTHS_MAP[currencyKey] ? synthToAsset(SYNTHS_MAP[currencyKey]) : currencyKey;

export const getDefaultCollateral = (networkId: SupportedNetwork) => COLLATERALS[networkId][0];

export const getCollateral = (networkId: SupportedNetwork, index: number, includeAdditional?: boolean) =>
    COLLATERALS[networkId].concat(includeAdditional ? ADDITIONAL_COLLATERALS[networkId] : [])[index];

export const getCollaterals = (networkId: SupportedNetwork, includeAdditional?: boolean) =>
    COLLATERALS[networkId].concat(includeAdditional ? ADDITIONAL_COLLATERALS[networkId] : []);

export const getCollateralIndexForNetwork = (networkId: SupportedNetwork, currencyKey: Coins) =>
    COLLATERALS[networkId].concat(ADDITIONAL_COLLATERALS[networkId]).indexOf(currencyKey);

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};

type StableBalances = {
    sUSD: number | null;
    DAI: number | null;
    USDCe: number | null;
    USDbC: number | null;
    USDC: number | null;
    USDT: number | null;
};

export const getCollateralIndexByBalance = (balancesObject: any, networkId: SupportedNetwork, collateral: Coins) => {
    let index = COLLATERALS[networkId].indexOf(collateral);
    if (balancesObject && balancesObject[collateral] < 1) {
        for (const [key, value] of Object.entries(balancesObject as StableBalances)) {
            if (value && value > 1) {
                const collateralIndex = COLLATERALS[networkId].indexOf(key as Coins);
                index = collateralIndex !== -1 ? collateralIndex : 0;
                break;
            }
        }
    }

    return index;
};

export const getCoinBalance = (balancesQueryObject: any, currency: Coins) => {
    if (balancesQueryObject && currency) {
        return balancesQueryObject[currency] ? balancesQueryObject[currency] : 0;
    }
    return 0;
};

export const getCurrencyPriority = (currency: string) => {
    const currencyPriority = CRYPTO_CURRENCY.indexOf(currency);
    const commodityPriority = CRYPTO_CURRENCY.length + COMMODITY.indexOf(currency);
    return currencyPriority !== -1 ? currencyPriority : commodityPriority;
};
