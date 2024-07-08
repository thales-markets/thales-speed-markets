import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { USD_SIGN } from 'constants/currency';
import { Positions } from 'enums/market';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { t } from 'i18next';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import useStableBalanceQuery from 'queries/walletBalances/useStableBalanceQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import {
    Coins,
    ceilNumberToDecimals,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    truncToDecimals,
} from 'thales-utils';
import { AmmChainedSpeedMarketsLimits, AmmSpeedMarketsLimits } from 'types/market';
import { RootState } from 'types/ui';
import biconomyConnector from 'utils/biconomyWallet';
import {
    convertCollateralToStable,
    convertFromStableToCollateral,
    getCoinBalance,
    getCollateral,
    getCollaterals,
    getDefaultCollateral,
    isStableCurrency,
} from 'utils/currency';
import { getIsMultiCollateralSupported } from 'utils/network';
import { useAccount, useChainId, useClient } from 'wagmi';
import { SelectedPosition } from '../SelectPosition/SelectPosition';
import {
    Amount,
    BuyinAmountsWrapper,
    DollarSign,
    HeaderBalance,
    HeaderRow,
    HeaderText,
    WalletIcon,
} from '../SelectPosition/styled-components';

type SelectBuyinProps = {
    onChange: React.Dispatch<number>;
    isChained: boolean;
    chainedPositions: SelectedPosition[];
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    ammChainedSpeedMarketsLimits: AmmChainedSpeedMarketsLimits | null;
    currencyKey: string;
    isResetTriggered: boolean;
    setIsResetTriggered: React.Dispatch<boolean>;
    setHasError: React.Dispatch<boolean>;
};

const roundMaxBuyin = (maxBuyin: number) => Math.floor(maxBuyin / 10) * 10;

const SelectBuyin: React.FC<SelectBuyinProps> = ({
    onChange,
    isChained,
    chainedPositions,
    ammSpeedMarketsLimits,
    ammChainedSpeedMarketsLimits,
    currencyKey,
    isResetTriggered,
    setIsResetTriggered,
    setHasError,
}) => {
    const networkId = useChainId();
    const { address: walletAddress, isConnected } = useAccount();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isBiconomy = useSelector((rootState: RootState) => getIsBiconomy(rootState));
    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const selectedCollateralIndex = useSelector((rootState: RootState) => getSelectedCollateralIndex(rootState));

    const [buyinAmount, setBuyinAmount] = useState(0);
    const [selectedStableBuyinAmount, setSelectedStableBuyinAmount] = useState(0);
    const [errorMessageKey, setErrorMessageKey] = useState('');

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);

    const stableBalanceQuery = useStableBalanceQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        { networkId, client },
        {
            enabled: isAppReady && isConnected && !isMultiCollateralSupported,
        }
    );
    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        (isBiconomy ? biconomyConnector.address : walletAddress) as string,
        { networkId, client },
        {
            enabled: isAppReady && isConnected && isMultiCollateralSupported,
        }
    );

    const walletBalancesMap = useMemo(() => {
        return stableBalanceQuery.isSuccess ? stableBalanceQuery.data : null;
    }, [stableBalanceQuery]);

    const collateralBalance = useMemo(() => {
        return isMultiCollateralSupported
            ? multipleCollateralBalances.isSuccess
                ? getCoinBalance(multipleCollateralBalances?.data, selectedCollateral)
                : null
            : (walletBalancesMap && walletBalancesMap[defaultCollateral]?.balance) || 0;
    }, [
        multipleCollateralBalances,
        walletBalancesMap,
        isMultiCollateralSupported,
        defaultCollateral,
        selectedCollateral,
    ]);

    const exchangeRatesMarketDataQuery = useExchangeRatesQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );
    const exchangeRates: Rates | null =
        exchangeRatesMarketDataQuery.isSuccess && exchangeRatesMarketDataQuery.data
            ? exchangeRatesMarketDataQuery.data
            : null;

    const payoutMultiplier = useMemo(
        () =>
            ammChainedSpeedMarketsLimits
                ? ammChainedSpeedMarketsLimits.payoutMultipliers[
                      chainedPositions.length - ammChainedSpeedMarketsLimits.minChainedMarkets
                  ]
                : 0,
        [chainedPositions.length, ammChainedSpeedMarketsLimits]
    );

    const chainedQuote = useMemo(
        () => (isChained ? ceilNumberToDecimals(payoutMultiplier ** chainedPositions.length) : 0),
        [isChained, chainedPositions.length, payoutMultiplier]
    );

    const minBuyinAmount = useMemo(
        () => (isChained ? ammChainedSpeedMarketsLimits?.minBuyinAmount : ammSpeedMarketsLimits?.minBuyinAmount) || 0,
        [isChained, ammChainedSpeedMarketsLimits?.minBuyinAmount, ammSpeedMarketsLimits?.minBuyinAmount]
    );
    const maxBuyinAmount = useMemo(
        () =>
            (isChained
                ? Math.floor((ammChainedSpeedMarketsLimits?.maxProfitPerIndividualMarket || 0) / chainedQuote)
                : ammSpeedMarketsLimits?.maxBuyinAmount) || 0,
        [
            isChained,
            ammChainedSpeedMarketsLimits?.maxProfitPerIndividualMarket,
            ammSpeedMarketsLimits?.maxBuyinAmount,
            chainedQuote,
        ]
    );

    // only for generating buttons
    const stableBuyinAmounts = useMemo(() => {
        const first = minBuyinAmount;
        const fifth = isChained
            ? roundMaxBuyin((ammChainedSpeedMarketsLimits?.maxProfitPerIndividualMarket || 0) / chainedQuote)
            : ammSpeedMarketsLimits?.maxBuyinAmount || 0;

        let second;
        let third;
        let fourth;
        const range = fifth - first + 1;
        if (range >= 150) {
            second = first * 2;
            third = second * 5;
            fourth = fifth / 2;
        } else if (range >= 50) {
            second = first * 2;
            third = second * 2;
            fourth = roundMaxBuyin(fifth / 2);
        } else if (range >= 25) {
            second = first * 2;
            third = second + (second - first);
            fourth = third + (second - first);
        } else if (range >= 10) {
            const step = 4;
            second = first + step;
            third = second + step;
            fourth = third + step;
        } else {
            const step = 1;
            second = first + step;
            third = second + step;
            fourth = third + step;
        }

        return [first, second, third, fourth, fifth];
    }, [
        isChained,
        chainedQuote,
        minBuyinAmount,
        ammSpeedMarketsLimits?.maxBuyinAmount,
        ammChainedSpeedMarketsLimits?.maxProfitPerIndividualMarket,
    ]);

    const convertToStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return convertCollateralToStable(selectedCollateral, value, rate);
        },
        [selectedCollateral, exchangeRates]
    );
    const convertFromStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return convertFromStableToCollateral(selectedCollateral, value, rate);
        },
        [selectedCollateral, exchangeRates]
    );

    // Conversion when collateral is changed
    useEffect(() => {
        if (selectedStableBuyinAmount > 0) {
            if (isStableCurrency(selectedCollateral)) {
                setBuyinAmount(selectedStableBuyinAmount);
            } else {
                setBuyinAmount(convertFromStable(selectedStableBuyinAmount));
            }
        } else if (isStableCurrency(selectedCollateral)) {
            setBuyinAmount(selectedStableBuyinAmount);
        }
    }, [selectedCollateral, selectedStableBuyinAmount, convertFromStable]);

    useEffect(() => {
        onChange(buyinAmount);
    }, [buyinAmount, onChange]);

    // Input field validations
    useDebouncedEffect(() => {
        let errorMessageKey = '';

        if (buyinAmount > 0 && ((isConnected && buyinAmount > collateralBalance) || collateralBalance === 0)) {
            errorMessageKey = 'common.errors.insufficient-balance-wallet';
        }
        if (buyinAmount > 0) {
            const convertedBuyinAmount = convertToStable(buyinAmount);

            if (convertedBuyinAmount < minBuyinAmount) {
                errorMessageKey = 'speed-markets.errors.min-buyin';
            } else if (convertedBuyinAmount > maxBuyinAmount) {
                errorMessageKey = 'speed-markets.errors.max-buyin';
            }
        }

        if (errorMessageKey) {
            setHasError(true);
        } else {
            setHasError(false);
        }
        setErrorMessageKey(errorMessageKey);
    }, [
        minBuyinAmount,
        maxBuyinAmount,
        buyinAmount,
        collateralBalance,
        isConnected,
        convertToStable,
        networkId,
        setHasError,
    ]);

    // Reset inputs
    useEffect(() => {
        setBuyinAmount(0);
        setSelectedStableBuyinAmount(0);
    }, [networkId, isConnected]);

    // Reset inputs
    useEffect(() => {
        if (isResetTriggered) {
            setBuyinAmount(0);
            setSelectedStableBuyinAmount(0);
            setIsResetTriggered(false);
        }
    }, [isResetTriggered, setIsResetTriggered]);

    const onMaxClick = () => {
        const maxWalletAmount = isConnected
            ? isStableCurrency(selectedCollateral)
                ? Number(truncToDecimals(collateralBalance))
                : Number(truncToDecimals(collateralBalance, 18))
            : Number.POSITIVE_INFINITY;

        let maxLiquidity, maxLiquidityPerDirection: number;
        if (isChained) {
            maxLiquidity =
                ammChainedSpeedMarketsLimits !== undefined
                    ? Number(ammChainedSpeedMarketsLimits?.risk.max) -
                      Number(ammChainedSpeedMarketsLimits?.risk.current)
                    : Infinity;
            maxLiquidityPerDirection = Infinity;
        } else {
            const riskPerAsset = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
                (data) => data.currency === currencyKey
            )[0];
            maxLiquidity = riskPerAsset !== undefined ? riskPerAsset.max - riskPerAsset.current : Infinity;

            const riskPerAssetAndDirection = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
                (data) => data.currency === currencyKey && data.position === Positions.UP
            )[0];
            maxLiquidityPerDirection =
                riskPerAssetAndDirection !== undefined
                    ? riskPerAssetAndDirection.max - riskPerAssetAndDirection.current
                    : Infinity;
        }

        const maxLimitAmount = Math.min(maxBuyinAmount, maxLiquidity, maxLiquidityPerDirection);
        const maxPaidAmount =
            maxLimitAmount < convertToStable(maxWalletAmount) ? convertFromStable(maxLimitAmount) : maxWalletAmount;

        setSelectedStableBuyinAmount(isStableCurrency(selectedCollateral) ? maxPaidAmount : 0);
        setBuyinAmount(maxPaidAmount);
    };

    const getUSDForCollateral = useCallback(
        (collateral: Coins) =>
            (multipleCollateralBalances.data ? multipleCollateralBalances.data[collateral] : 0) *
            (isStableCurrency(collateral) ? 1 : exchangeRates?.[collateral] || 0),
        [multipleCollateralBalances.data, exchangeRates]
    );

    const collateral = getCollaterals(networkId)[selectedCollateralIndex];

    return (
        <div>
            <HeaderRow>
                <HeaderText>{t('speed-markets.steps.enter-buyin')}</HeaderText>
                <HeaderBalance>
                    <WalletIcon className="icon icon--wallet-balance" />
                    {`${formatCurrencyWithKey(
                        collateral,
                        multipleCollateralBalances.data ? multipleCollateralBalances.data[collateral] : 0
                    )} (${formatCurrencyWithSign(USD_SIGN, getUSDForCollateral(collateral))})`}
                </HeaderBalance>
            </HeaderRow>
            <BuyinAmountsWrapper>
                {stableBuyinAmounts.map((amount, index) => {
                    return (
                        <Amount
                            key={index}
                            $isSelected={selectedStableBuyinAmount === amount}
                            onClick={() => {
                                setSelectedStableBuyinAmount(amount);
                                setBuyinAmount(convertFromStable(amount));
                            }}
                        >
                            <DollarSign>{USD_SIGN}</DollarSign>
                            {amount.toFixed(0)}
                        </Amount>
                    );
                })}
            </BuyinAmountsWrapper>
            <NumericInput
                value={ceilNumberToDecimals(buyinAmount, 8) || ''}
                placeholder={t('common.enter-amount')}
                onChange={(_, value) => {
                    setSelectedStableBuyinAmount(isStableCurrency(selectedCollateral) ? Number(value) : 0);
                    setBuyinAmount(Number(value));
                }}
                showValidation={!!errorMessageKey}
                validationMessage={t(errorMessageKey, {
                    currencyKey: selectedCollateral,
                    minAmount: convertFromStable(minBuyinAmount),
                    maxAmount: convertFromStable(maxBuyinAmount),
                })}
                onMaxButton={onMaxClick}
                currencyComponent={
                    isMultiCollateralSupported ? (
                        <CollateralSelector
                            collateralArray={getCollaterals(networkId)}
                            selectedItem={selectedCollateralIndex}
                            onChangeCollateral={() => {}}
                            isDetailedView
                            collateralBalances={multipleCollateralBalances.data}
                            exchangeRates={exchangeRates}
                        />
                    ) : undefined
                }
                currencyLabel={!isMultiCollateralSupported ? defaultCollateral : undefined}
                margin="0"
            />
        </div>
    );
};

export default SelectBuyin;
