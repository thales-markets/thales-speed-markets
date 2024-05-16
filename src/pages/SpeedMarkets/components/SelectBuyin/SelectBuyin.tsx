import CollateralSelector from 'components/CollateralSelector';
import NumericInput from 'components/fields/NumericInput';
import { USD_SIGN } from 'constants/currency';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import { t } from 'i18next';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import useStableBalanceQuery from 'queries/walletBalances/useStableBalanceQuery';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsBiconomy, getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivRow } from 'styles/common';
import { NetworkId, ceilNumberToDecimals, truncToDecimals } from 'thales-utils';
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
import { Header, HeaderText } from '../SelectPosition/styled-components';

type SelectBuyinProps = {
    onChange: React.Dispatch<number>;
    isChained: boolean;
    chainedPositions: SelectedPosition[];
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    ammChainedSpeedMarketsLimits: AmmChainedSpeedMarketsLimits | null;
    currencyKey: string;
};

const roundMaxBuyin = (maxBuyin: number) => Math.floor(maxBuyin / 10) * 10;

const SelectBuyin: React.FC<SelectBuyinProps> = ({
    onChange,
    isChained,
    chainedPositions,
    ammSpeedMarketsLimits,
    ammChainedSpeedMarketsLimits,
    currencyKey,
}) => {
    const networkId = useChainId();
    const { address: walletAddress, isConnected } = useAccount();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const isBiconomy = useSelector((rootState: RootState) => getIsBiconomy(rootState));
    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);
    const selectedCollateralIndex = useSelector((rootState: RootState) => getSelectedCollateralIndex(rootState));

    const [buyinAmount, setBuyinAmount] = useState(0);
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

    const buyinAmounts = useMemo(() => {
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
            const useRateBuffer = value === minBuyinAmount;
            return convertFromStableToCollateral(selectedCollateral, value, rate, useRateBuffer);
        },
        [selectedCollateral, exchangeRates, minBuyinAmount]
    );

    // Input field validations
    useEffect(() => {
        let messageKey = '';

        if (buyinAmount > 0 && ((isConnected && buyinAmount > collateralBalance) || collateralBalance === 0)) {
            messageKey =
                networkId === NetworkId.BlastSepolia
                    ? 'speed-markets.errors.insufficient-balance-wallet'
                    : 'common.errors.insufficient-balance-wallet';
        }
        if (buyinAmount > 0) {
            const convertedTotalPaidAmount = isStableCurrency(selectedCollateral)
                ? buyinAmount
                : convertToStable(buyinAmount);

            if (convertedTotalPaidAmount < minBuyinAmount) {
                messageKey = 'speed-markets.errors.min-buyin';
            } else if (convertedTotalPaidAmount > maxBuyinAmount) {
                messageKey = 'speed-markets.errors.max-buyin';
            }
        }

        if (messageKey) {
            onChange(0);
            setErrorMessageKey(messageKey);
        }
        setErrorMessageKey(messageKey);
    }, [
        minBuyinAmount,
        maxBuyinAmount,
        buyinAmount,
        collateralBalance,
        isConnected,
        selectedCollateral,
        convertToStable,
        networkId,
        onChange,
    ]);

    // Reset inputs
    useEffect(() => {
        setBuyinAmount(0);
        onChange(0);
    }, [networkId, isConnected, onChange]);

    const onMaxClick = () => {
        if (collateralBalance > 0) {
            const maxWalletAmount = isStableCurrency(selectedCollateral)
                ? Number(truncToDecimals(collateralBalance))
                : Number(truncToDecimals(collateralBalance, 18));

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

            const maxPaidAmount = Math.floor(
                Math.min(buyinAmounts[buyinAmounts.length - 1], maxWalletAmount, maxLiquidity, maxLiquidityPerDirection)
            );
            onChange(maxPaidAmount);
            setBuyinAmount(maxPaidAmount);
        }
    };

    return (
        <div>
            <Header>
                <HeaderText> {t('speed-markets.steps.enter-buyin')}</HeaderText>
            </Header>
            <BuyinAmountsWrapper>
                {buyinAmounts.map((amount, index) => {
                    return (
                        <Amount
                            key={index}
                            $isSelected={buyinAmount === amount}
                            onClick={() => {
                                onChange(amount);
                                setBuyinAmount(amount);
                            }}
                        >
                            <DollarSign>{USD_SIGN}</DollarSign>
                            {amount}
                        </Amount>
                    );
                })}
            </BuyinAmountsWrapper>
            <NumericInput
                value={buyinAmount || ''}
                placeholder={t('common.enter-amount')}
                onChange={(_, value) => {
                    onChange(Number(value));
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

const BuyinAmountsWrapper = styled(FlexDivRow)`
    margin-bottom: 10px;
`;

const Amount = styled(FlexDivCentered)<{ $isSelected: boolean }>`
    width: 60px;
    height: 40px;
    border-radius: 8px;
    font-family: ${(props) => props.theme.fontFamily.primary};
    font-size: 13px;
    font-weight: 800;
    line-height: 100%;
    ${(props) => (props.$isSelected ? '' : `border: 2px solid ${props.theme.button.borderColor.secondary};`)}
    background: ${(props) =>
        props.$isSelected ? props.theme.button.background.secondary : props.theme.button.background.primary};
    color: ${(props) =>
        props.$isSelected ? props.theme.button.textColor.secondary : props.theme.button.textColor.tertiary};
    cursor: pointer;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 60px;
    }
`;

const DollarSign = styled.span`
    padding-right: 2px;
`;

export default SelectBuyin;
