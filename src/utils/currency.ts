import {
    COLLATERALS,
    CRYPTO_CURRENCY_MAP,
    OFFRAMP_UNSUPPORTED_COLLATERALS,
    STABLE_COINS,
    SYNTHS_MAP,
    currencyKeyToNameMap,
} from 'constants/currency';
import { COLLATERAL_DECIMALS, Coins, NetworkId } from 'thales-utils';
import { CollateralsBalance } from 'types/collateral';
import { SupportedNetwork } from 'types/network';
import multipleCollateral from './contracts/multipleCollateralContract';

// TODO: replace this with a more robust logic (like checking the asset field)
const synthToAsset = (currencyKey: string) => currencyKey.replace(/^(i|s)/i, '');

export const getSynthName = (currencyKey: string) =>
    currencyKeyToNameMap[currencyKey] || currencyKeyToNameMap[`s${currencyKey}`] || currencyKey;

export const getSynthAsset = (currencyKey: string) =>
    SYNTHS_MAP[currencyKey] ? synthToAsset(SYNTHS_MAP[currencyKey]) : currencyKey;

export const getDefaultCollateral = (networkId: SupportedNetwork) =>
    COLLATERALS[networkId] ? COLLATERALS[networkId][0] : COLLATERALS[NetworkId.OptimismMainnet][0];

export const getCollateral = (networkId: SupportedNetwork, index: number, collaterals?: Coins[]) => {
    const collats = collaterals || COLLATERALS[networkId];
    return index < collats.length ? collats[index] : collats[0];
};

export const getCollaterals = (networkId: SupportedNetwork) =>
    COLLATERALS[networkId] || COLLATERALS[NetworkId.OptimismMainnet];

export const getOfframpCollaterals = (networkId: SupportedNetwork) =>
    getCollaterals(networkId).filter((collateral) => !OFFRAMP_UNSUPPORTED_COLLATERALS[networkId].includes(collateral));

export const getCollateralIndexForNetwork = (networkId: SupportedNetwork, currencyKey: Coins) =>
    Math.max(0, getCollaterals(networkId).indexOf(currencyKey));

export const getCollateralAddress = (networkId: SupportedNetwork, index: number, collaterals?: Coins[]) =>
    multipleCollateral[getCollateral(networkId, index, collaterals)]?.addresses[networkId];

export const getCollateralByAddress = (collateralAddress: string, networkId: number) => {
    let collateral = getDefaultCollateral(networkId);
    Object.keys(multipleCollateral).forEach((collateralKey: string) => {
        Object.values(multipleCollateral[collateralKey as Coins].addresses).forEach((address: string) => {
            if (collateralAddress.toLowerCase() === address.toLowerCase()) {
                collateral = collateralKey as Coins;
            }
        });
    });

    return collateral;
};

export const isStableCurrency = (currencyKey: Coins) => {
    return STABLE_COINS.includes(currencyKey);
};

export const isOverCurrency = (currencyKey: Coins) => {
    return currencyKey === CRYPTO_CURRENCY_MAP.OVER;
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

const OPTIMISM_MARKETS_WITH_SUSD_END_TIMESTAMP = 1720526400000;
export const isOldMarketWithSusdCollateral = (networkId: SupportedNetwork, marketCreatedAt: number) =>
    [NetworkId.OptimismMainnet, NetworkId.OptimismSepolia].includes(networkId) &&
    marketCreatedAt < OPTIMISM_MARKETS_WITH_SUSD_END_TIMESTAMP;
