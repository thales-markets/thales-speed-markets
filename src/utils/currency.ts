import {
    COLLATERALS,
    STABLE_COINS,
    SYNTHS_MAP,
    currencyKeyToAssetIconMap,
    currencyKeyToNameMap,
} from 'constants/currency';
import { COLLATERAL_DECIMALS, Coins } from 'thales-utils';
import { CollateralsBalance } from 'types/collateral';
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

export const getCollateral = (networkId: SupportedNetwork, index: number) =>
    index < COLLATERALS[networkId].length ? COLLATERALS[networkId][index] : getDefaultCollateral(networkId);

export const getCollaterals = (networkId: SupportedNetwork) => COLLATERALS[networkId];

export const getCollateralIndexForNetwork = (networkId: SupportedNetwork, currencyKey: Coins) =>
    COLLATERALS[networkId].indexOf(currencyKey);

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};

export const getMinBalanceThreshold = (coin: Coins): number => (isStableCurrency(coin) ? 1 : 0);

export const getPositiveCollateralIndexByBalance = (
    balancesObject: CollateralsBalance,
    networkId: SupportedNetwork
) => {
    let index = 0;
    for (const [key, value] of Object.entries(balancesObject)) {
        if (value && value > getMinBalanceThreshold(key as Coins)) {
            const collateralIndex = COLLATERALS[networkId].indexOf(key as Coins);
            index = collateralIndex !== -1 ? collateralIndex : 0;
            break;
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

export const convertCollateralToStable = (srcCollateral: Coins, amount: number, rate: number) => {
    return isStableCurrency(srcCollateral) ? amount : amount * rate;
};

export const convertFromStableToCollateral = (dstCollateral: Coins, amount: number, rate: number) => {
    if (isStableCurrency(dstCollateral)) {
        return amount;
    } else {
        return rate
            ? Math.ceil((amount / rate) * 10 ** COLLATERAL_DECIMALS[dstCollateral]) /
                  10 ** COLLATERAL_DECIMALS[dstCollateral]
            : 0;
    }
};
