import PythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import CollateralSelector from 'components/CollateralSelector';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import Tooltip from 'components/Tooltip/Tooltip';
import NumericInput from 'components/fields/NumericInput';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    ALTCOIN_CONVERSION_BUFFER_PERCENTAGE,
    POSITIONS_TO_SIDE_MAP,
    SPEED_MARKETS_QUOTE,
    STABLECOIN_CONVERSION_BUFFER_PERCENTAGE,
} from 'constants/market';
import { PYTH_CONTRACT_ADDRESS, PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import useInterval from 'hooks/useInterval';
import SharePositionModal from 'pages/SpeedMarkets/components/SharePositionModal';
import TradingDetailsSentence from 'pages/SpeedMarkets/components/TradingDetailsSentence';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useMultipleCollateralBalanceQuery from 'queries/walletBalances/useMultipleCollateralBalanceQuery';
import useStableBalanceQuery from 'queries/walletBalances/useStableBalanceQuery';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getSelectedCollateralIndex } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import {
    COLLATERAL_DECIMALS,
    NetworkId,
    bigNumberFormatter,
    ceilNumberToDecimals,
    coinParser,
    formatCurrencyWithKey,
    formatCurrencyWithSign,
    formatPercentage,
    truncToDecimals,
} from 'thales-utils';
import { AmmChainedSpeedMarketsLimits, AmmSpeedMarketsLimits } from 'types/market';
import { SupportedNetwork } from 'types/network';
import { RootState } from 'types/ui';
import { ViemContract } from 'types/viem';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import { getCoinBalance, getCollateral, getCollaterals, getDefaultCollateral, isStableCurrency } from 'utils/currency';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId, getPriceServiceEndpoint } from 'utils/pyth';
import { refetchBalances, refetchSpeedMarketsLimits, refetchUserSpeedMarkets } from 'utils/queryConnector';
import { getReferralWallet } from 'utils/referral';
import { getFeeByTimeThreshold, getTransactionForSpeedAMM } from 'utils/speedAmm';
import { delay } from 'utils/timer';
import { Client, getContract, parseUnits, stringToHex } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import { SelectedPosition } from '../SelectPosition/SelectPosition';

type AmmSpeedTradingProps = {
    isChained: boolean;
    currencyKey: string;
    positionType: SelectedPosition;
    chainedPositions: SelectedPosition[];
    strikeTimeSec: number;
    deltaTimeSec: number;
    selectedStableBuyinAmount: number;
    setSelectedStableBuyinAmount: React.Dispatch<number>;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    ammChainedSpeedMarketsLimits: AmmChainedSpeedMarketsLimits | null;
    currentPrice: number;
    setSkewImpact: React.Dispatch<{ [Positions.UP]: number; [Positions.DOWN]: number }>;
    resetData: React.Dispatch<void>;
};

const AmmSpeedTrading: React.FC<AmmSpeedTradingProps> = ({
    isChained,
    currencyKey,
    positionType,
    chainedPositions,
    strikeTimeSec,
    deltaTimeSec,
    selectedStableBuyinAmount,
    setSelectedStableBuyinAmount,
    ammSpeedMarketsLimits,
    ammChainedSpeedMarketsLimits,
    currentPrice,
    setSkewImpact,
    resetData,
}) => {
    const { t } = useTranslation();
    const { openConnectModal } = useConnectModal();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useChainId() as SupportedNetwork;
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address } = useAccount();

    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [paidAmount, setPaidAmount] = useState<number | string>(
        selectedStableBuyinAmount ? selectedStableBuyinAmount : ''
    );
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [submittedStrikePrice, setSubmittedStrikePrice] = useState(0);
    const [deltaFromStrikeTime, setDeltaFromStrikeTime] = useState(0);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMessageKey, setErrorMessageKey] = useState('');
    const [outOfLiquidity, setOutOfLiquidity] = useState(false);
    const [outOfLiquidityPerDirection, setOutOfLiquidityPerDirection] = useState(false);
    const [hasAllowance, setAllowance] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [openTwitterShareModal, setOpenTwitterShareModal] = useState(false);

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);

    const isPositionSelected = isChained
        ? chainedPositions.every((pos) => pos !== undefined)
        : positionType !== undefined;

    const isPaidAmountEntered = Number(paidAmount) > 0;

    const isButtonDisabled =
        !isPositionSelected ||
        !(strikeTimeSec || deltaTimeSec) ||
        !isPaidAmountEntered ||
        isSubmitting ||
        !hasAllowance ||
        !!errorMessageKey ||
        outOfLiquidity;

    const isButtonBuyAvailable =
        isConnected &&
        isPositionSelected &&
        !!(strikeTimeSec || deltaTimeSec) &&
        isPaidAmountEntered &&
        !outOfLiquidityPerDirection &&
        !outOfLiquidity &&
        hasAllowance;

    const chainedQuote =
        isChained && ammChainedSpeedMarketsLimits
            ? ammChainedSpeedMarketsLimits?.payoutMultipliers[
                  chainedPositions.length - ammChainedSpeedMarketsLimits.minChainedMarkets
              ] ** chainedPositions.length
            : 0;

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

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const collateralAddress = isMultiCollateralSupported
        ? multipleCollateral[selectedCollateral].addresses[networkId]
        : erc20Contract.addresses[networkId];

    const referral =
        address && getReferralWallet()?.toLowerCase() !== address?.toLowerCase() ? getReferralWallet() : null;

    const stableBalanceQuery = useStableBalanceQuery(
        address as string,
        { networkId, client },
        {
            enabled: isAppReady && isConnected && !isMultiCollateralSupported,
        }
    );
    const multipleCollateralBalances = useMultipleCollateralBalanceQuery(
        address as string,
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

    const isBlastSepolia = networkId === NetworkId.BlastSepolia;
    const isMintAvailable = isBlastSepolia && collateralBalance < totalPaidAmount;

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

    const convertToStable = useCallback(
        (value: number) => {
            const rate = exchangeRates?.[selectedCollateral] || 0;
            return isStableCurrency(selectedCollateral)
                ? value
                : value * rate * (1 - ALTCOIN_CONVERSION_BUFFER_PERCENTAGE);
        },
        [selectedCollateral, exchangeRates]
    );
    const convertFromStable = useCallback(
        (value: number) => {
            if (isStableCurrency(selectedCollateral)) {
                return value;
            } else {
                const rate = exchangeRates?.[selectedCollateral];
                const priceFeedBuffer = value === minBuyinAmount ? 1 - ALTCOIN_CONVERSION_BUFFER_PERCENTAGE : 1;
                return rate
                    ? Math.ceil((value / (rate * priceFeedBuffer)) * 10 ** COLLATERAL_DECIMALS[selectedCollateral]) /
                          10 ** COLLATERAL_DECIMALS[selectedCollateral]
                    : 0;
            }
        },
        [selectedCollateral, exchangeRates, minBuyinAmount]
    );

    const skewImpact = useMemo(() => {
        const skewPerPosition = { [Positions.UP]: 0, [Positions.DOWN]: 0 };

        const riskPerUp = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
            (data) => data.currency === currencyKey && data.position === Positions.UP
        )[0];
        const riskPerDown = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
            (data) => data.currency === currencyKey && data.position === Positions.DOWN
        )[0];

        if (riskPerUp && riskPerDown) {
            skewPerPosition[Positions.UP] = ceilNumberToDecimals(
                (riskPerUp.current / riskPerUp.max) * ammSpeedMarketsLimits?.maxSkewImpact,
                4
            );
            skewPerPosition[Positions.DOWN] = ceilNumberToDecimals(
                (riskPerDown.current / riskPerDown.max) * ammSpeedMarketsLimits?.maxSkewImpact,
                4
            );
        }

        return skewPerPosition;
    }, [ammSpeedMarketsLimits?.maxSkewImpact, ammSpeedMarketsLimits?.risksPerAssetAndDirection, currencyKey]);

    const totalFee = useMemo(() => {
        if (ammSpeedMarketsLimits) {
            if (isChained) {
                return ammSpeedMarketsLimits.safeBoxImpact;
            } else if (deltaTimeSec || strikeTimeSec) {
                const lpFee = getFeeByTimeThreshold(
                    deltaTimeSec ? deltaTimeSec : deltaFromStrikeTime,
                    ammSpeedMarketsLimits?.timeThresholdsForFees,
                    ammSpeedMarketsLimits?.lpFees,
                    ammSpeedMarketsLimits?.defaultLPFee
                );
                const skew = positionType ? skewImpact[positionType] : 0;
                const oppositePosition = positionType
                    ? positionType === Positions.UP
                        ? Positions.DOWN
                        : Positions.UP
                    : undefined;
                const discount = oppositePosition ? skewImpact[oppositePosition] / 2 : 0;

                return lpFee + skew - discount + Number(ammSpeedMarketsLimits?.safeBoxImpact);
            }
        }
        return 0;
    }, [isChained, ammSpeedMarketsLimits, deltaTimeSec, strikeTimeSec, deltaFromStrikeTime, skewImpact, positionType]);

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // Recalculate delta from Strike Time on every 5 seconds
    useInterval(async () => {
        if (!mountedRef.current) return null;
        if (strikeTimeSec) {
            setDeltaFromStrikeTime(strikeTimeSec - millisecondsToSeconds(Date.now()));
        }
    }, secondsToMilliseconds(5));

    useEffect(() => {
        if (selectedCollateral !== defaultCollateral && isStableCurrency(selectedCollateral)) {
            // add half percent to amount to take into account collateral conversion
            setTotalPaidAmount(Number(paidAmount) * (1 + totalFee + STABLECOIN_CONVERSION_BUFFER_PERCENTAGE));
        } else {
            setTotalPaidAmount(Number(paidAmount) * (1 + totalFee));
        }
    }, [paidAmount, totalFee, selectedCollateral, defaultCollateral, selectedStableBuyinAmount]);

    // when buttons are used to populate amount
    useEffect(() => {
        if (selectedStableBuyinAmount > 0) {
            if (isStableCurrency(selectedCollateral)) {
                setPaidAmount(selectedStableBuyinAmount);
            } else {
                setPaidAmount(convertFromStable(selectedStableBuyinAmount));
            }
        } else {
            setPaidAmount('');
        }
    }, [selectedStableBuyinAmount, convertFromStable, selectedCollateral]);

    // Update skew
    useDebouncedEffect(() => {
        setSkewImpact(skewImpact);
    }, [skewImpact, setSkewImpact]);

    // Reset inputs
    useEffect(() => {
        setPaidAmount('');
    }, [networkId, isConnected]);

    // Input field validations
    useEffect(() => {
        let messageKey = '';

        if (totalPaidAmount > collateralBalance) {
            messageKey = 'speed-markets.errors.insufficient-balance-fee';
        }
        if (
            Number(paidAmount) > 0 &&
            ((isConnected && Number(paidAmount) > collateralBalance) || collateralBalance === 0)
        ) {
            messageKey = isBlastSepolia
                ? 'speed-markets.errors.insufficient-balance-wallet'
                : 'common.errors.insufficient-balance-wallet';
        }
        if (Number(paidAmount) > 0) {
            const convertedTotalPaidAmount = isStableCurrency(selectedCollateral)
                ? Number(paidAmount)
                : convertToStable(Number(paidAmount));

            if (convertedTotalPaidAmount < minBuyinAmount) {
                messageKey = 'speed-markets.errors.min-buyin';
            } else if (convertedTotalPaidAmount > maxBuyinAmount) {
                messageKey = 'speed-markets.errors.max-buyin';
            }
        }

        setErrorMessageKey(messageKey);
    }, [
        minBuyinAmount,
        maxBuyinAmount,
        paidAmount,
        collateralBalance,
        isConnected,
        totalPaidAmount,
        selectedCollateral,
        convertToStable,
        isBlastSepolia,
    ]);

    // Submit validations
    useEffect(() => {
        const convertedStableBuyinAmount = selectedStableBuyinAmount || convertToStable(Number(paidAmount));
        if (convertedStableBuyinAmount > 0) {
            if (isChained) {
                if (ammChainedSpeedMarketsLimits?.risk) {
                    setOutOfLiquidity(
                        ammChainedSpeedMarketsLimits?.risk.current + convertedStableBuyinAmount >
                            ammChainedSpeedMarketsLimits?.risk.max
                    );
                    setOutOfLiquidityPerDirection(false);
                }
            } else {
                const riskPerAssetAndDirectionData = ammSpeedMarketsLimits?.risksPerAssetAndDirection.filter(
                    (data) => data.currency === currencyKey && data.position === positionType
                )[0];
                if (riskPerAssetAndDirectionData) {
                    setOutOfLiquidityPerDirection(
                        riskPerAssetAndDirectionData?.current + convertedStableBuyinAmount >
                            riskPerAssetAndDirectionData?.max
                    );
                }

                const riskPerAssetData = ammSpeedMarketsLimits?.risksPerAsset.filter(
                    (data) => data.currency === currencyKey
                )[0];
                if (riskPerAssetData) {
                    setOutOfLiquidity(riskPerAssetData?.current + convertedStableBuyinAmount > riskPerAssetData?.max);
                }
            }
        } else {
            setOutOfLiquidity(false);
        }
    }, [
        isChained,
        ammSpeedMarketsLimits,
        ammChainedSpeedMarketsLimits?.risk,
        currencyKey,
        selectedStableBuyinAmount,
        convertToStable,
        paidAmount,
        positionType,
    ]);

    // Check allowance
    useDebouncedEffect(() => {
        if (!collateralAddress) {
            return;
        }
        const erc20Instance = getContract({
            abi: erc20Contract.abi,
            address: collateralAddress,
            client: client as Client,
        });
        const addressToApprove = isChained
            ? chainedSpeedMarketsAMMContract.addresses[networkId]
            : speedMarketsAMMContract.addresses[networkId];

        const getAllowance = async () => {
            try {
                const parsedAmount: bigint = coinParser(
                    isStableCurrency(selectedCollateral)
                        ? ceilNumberToDecimals(totalPaidAmount).toString()
                        : ceilNumberToDecimals(totalPaidAmount, COLLATERAL_DECIMALS[selectedCollateral]).toString(),
                    networkId,
                    selectedCollateral
                );
                const allowance: boolean = await checkAllowance(
                    parsedAmount,
                    erc20Instance,
                    address as string,
                    addressToApprove
                );

                setAllowance(allowance);
            } catch (e) {
                console.log(e);
            }
        };

        if (isConnected) {
            if (selectedCollateral === CRYPTO_CURRENCY_MAP.ETH) {
                setAllowance(true);
            } else {
                getAllowance();
            }
        }
    }, [
        collateralAddress,
        networkId,
        paidAmount,
        totalPaidAmount,
        address,
        isConnected,
        hasAllowance,
        isAllowing,
        selectedCollateral,
    ]);

    const handleAllowance = async (approveAmount: bigint) => {
        if (!collateralAddress) {
            return;
        }

        const erc20Instance = getContract({
            abi: erc20Contract.abi,
            address: collateralAddress,
            client: walletClient.data as Client,
        }) as ViemContract;
        const addressToApprove = isChained
            ? chainedSpeedMarketsAMMContract.addresses[networkId]
            : speedMarketsAMMContract.addresses[networkId];

        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());
        try {
            setIsAllowing(true);

            const hash = await erc20Instance.write.approve([addressToApprove, approveAmount]);
            setOpenApprovalModal(false);
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });
            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`common.transaction.successful`), id));
                setIsAllowing(false);
            } else {
                console.log('Transaction status', txReceipt.status);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
                setIsAllowing(false);
                setOpenApprovalModal(false);
            }
        } catch (e) {
            console.log(e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            setIsAllowing(false);
            setOpenApprovalModal(false);
        }
    };

    const handleSubmit = async () => {
        if (isButtonDisabled) return;

        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        const speedMarketsAMMContractWithSigner = getContract({
            abi: !isChained ? speedMarketsAMMContract.abi : chainedSpeedMarketsAMMContract.abi,
            address: !isChained
                ? speedMarketsAMMContract.addresses[networkId]
                : chainedSpeedMarketsAMMContract.addresses[networkId],
            client: walletClient.data as Client,
        });

        try {
            const priceId = getPriceId(networkId, currencyKey);

            const latestPriceUpdateResponse = await fetch(`
                ${getPriceServiceEndpoint(networkId)}/v2/updates/price/latest?ids[]=${priceId.replace('0x', '')}`);

            const latestPriceUpdate = JSON.parse(await latestPriceUpdateResponse.text());

            const pythPrice = bigNumberFormatter(latestPriceUpdate.parsed[0].price.price, PYTH_CURRENCY_DECIMALS);
            setSubmittedStrikePrice(pythPrice);

            const pythContract = getContract({
                abi: PythInterfaceAbi,
                address: PYTH_CONTRACT_ADDRESS[networkId],
                client: client as Client,
            });
            const priceUpdateData = ['0x' + latestPriceUpdate.binary.data[0]];
            const updateFee = await pythContract.read.getUpdateFee([priceUpdateData]);

            const asset = stringToHex(currencyKey, { size: 32 });

            // guaranteed by isButtonDisabled that there are no undefined positions
            const chainedSides = chainedPositions.map((pos) => (pos !== undefined ? POSITIONS_TO_SIDE_MAP[pos] : -1));
            const singleSides = positionType !== undefined ? [POSITIONS_TO_SIDE_MAP[positionType]] : [];
            const sides = isChained ? chainedSides : singleSides;

            const buyInAmountBigNum =
                selectedCollateral === defaultCollateral
                    ? coinParser(truncToDecimals(paidAmount), networkId, selectedCollateral)
                    : isStableCurrency(selectedCollateral)
                    ? coinParser(truncToDecimals(totalPaidAmount), networkId, selectedCollateral)
                    : coinParser(
                          truncToDecimals(totalPaidAmount, COLLATERAL_DECIMALS[selectedCollateral]),
                          networkId,
                          selectedCollateral
                      );
            const skewImpactBigNum = positionType ? parseUnits(skewImpact[positionType].toString(), 18) : undefined;
            const isNonDefaultCollateral = selectedCollateral !== defaultCollateral;

            const hash = await getTransactionForSpeedAMM(
                speedMarketsAMMContractWithSigner,
                isNonDefaultCollateral,
                asset,
                deltaTimeSec,
                strikeTimeSec,
                sides,
                buyInAmountBigNum,
                priceUpdateData,
                updateFee,
                collateralAddress || '',
                referral,
                skewImpactBigNum as any
            );

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`common.buy.confirmation-message`), id));
                refetchUserSpeedMarkets(isChained, networkId, address as string);
                refetchSpeedMarketsLimits(isChained, networkId);
                PLAUSIBLE.trackEvent(
                    isChained ? PLAUSIBLE_KEYS.chainedSpeedMarketsBuy : PLAUSIBLE_KEYS.speedMarketsBuy,
                    {
                        props: {
                            value: Number(paidAmount),
                            collateral: getCollateral(networkId, selectedCollateralIndex),
                            networkId,
                        },
                    }
                );
                resetData();
                setPaidAmount('');
            } else {
                console.log('Transaction status', txReceipt.status);
                await delay(800);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
        }
        setSubmittedStrikePrice(0);
        setIsSubmitting(false);
    };

    const handleMint = async () => {
        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        const collateralWithSigner = getContract({
            abi: erc20Contract.abi,
            address: erc20Contract.addresses[networkId],
            client: walletClient.data as Client,
        }) as ViemContract;

        try {
            const hash = await collateralWithSigner.write.mintForUser([address]);

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(
                    id,
                    getSuccessToastOptions(t(`common.mint.confirmation-message`, { token: selectedCollateral }), id)
                );
                refetchBalances(address as string, networkId);
            } else {
                console.log('Transaction status', txReceipt.status);
                await delay(800);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
        }
        setIsSubmitting(false);
    };

    const getSubmitButton = () => {
        if (!isConnected) {
            return <Button onClick={openConnectModal}>{t('common.wallet.connect-your-wallet')}</Button>;
        }
        if (isMintAvailable) {
            return (
                <Button onClick={handleMint}>
                    {isSubmitting ? t('common.mint.progress-label') : t('common.mint.label')}
                    <CollateralText>&nbsp;{selectedCollateral}</CollateralText>
                    {isSubmitting ? '...' : ''}
                </Button>
            );
        }
        if (!isPositionSelected) {
            return (
                <Button disabled={true}>
                    {isChained
                        ? t('speed-markets.chained.errors.choose-directions')
                        : t('speed-markets.amm-trading.choose-direction')}
                </Button>
            );
        }
        if (!(strikeTimeSec || deltaTimeSec)) {
            return <Button disabled={true}>{t('speed-markets.amm-trading.choose-time')}</Button>;
        }
        if (!isPaidAmountEntered) {
            return <Button disabled={true}>{t('common.enter-amount')}</Button>;
        }
        if (outOfLiquidityPerDirection) {
            return <Button disabled={true}>{t('speed-markets.errors.out-of-liquidity-direction')}</Button>;
        }
        if (outOfLiquidity) {
            return <Button disabled={true}>{t('common.errors.out-of-liquidity')}</Button>;
        }
        if (!hasAllowance) {
            return (
                <Button disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                    {isAllowing
                        ? t('common.enable-wallet-access.approve-progress')
                        : t('common.enable-wallet-access.approve')}
                    <CollateralText>&nbsp;{selectedCollateral}</CollateralText>
                    {isAllowing ? '...' : ''}
                </Button>
            );
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleSubmit}>
                {isSubmitting ? t(`common.buy.progress-label`) : t(`common.buy.label`)}
            </Button>
        );
    };

    const onMaxClick = () => {
        if (collateralBalance > 0 && totalFee) {
            const maxWalletAmount =
                selectedCollateral === defaultCollateral
                    ? Number(truncToDecimals(collateralBalance / (1 + totalFee)))
                    : isStableCurrency(selectedCollateral)
                    ? Number(
                          truncToDecimals(collateralBalance / (1 + totalFee + STABLECOIN_CONVERSION_BUFFER_PERCENTAGE))
                      )
                    : Number(truncToDecimals(collateralBalance / (1 + totalFee), 18));

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
                Math.min(maxBuyinAmount, maxWalletAmount, maxLiquidity, maxLiquidityPerDirection)
            );
            setPaidAmount(maxPaidAmount);
            setSelectedStableBuyinAmount(Math.min(maxPaidAmount, convertToStable(maxWalletAmount)));
        }
    };

    const getTradingDetails = () => {
        return (
            <TradingDetailsContainer>
                <TradingDetailsSentence
                    currencyKey={currencyKey}
                    maturityDate={secondsToMilliseconds(strikeTimeSec)}
                    deltaTimeSec={deltaTimeSec}
                    market={{
                        address: 'Any',
                        strikePrice: submittedStrikePrice ? submittedStrikePrice : currentPrice,
                        positionType: isChained ? undefined : positionType,
                        chainedPositions: isChained ? chainedPositions : undefined,
                    }}
                    isFetchingQuote={false}
                    priceProfit={(isChained ? chainedQuote : SPEED_MARKETS_QUOTE) - 1}
                    paidAmount={selectedStableBuyinAmount || convertToStable(Number(paidAmount))}
                    hasCollateralConversion={selectedCollateral !== defaultCollateral}
                />
                {!isChained && (
                    <ShareIcon
                        className="icon-home icon-home--twitter-x"
                        disabled={isButtonDisabled}
                        onClick={() => !isButtonDisabled && setOpenTwitterShareModal(true)}
                    />
                )}
            </TradingDetailsContainer>
        );
    };

    const inputWrapperRef = useRef<HTMLDivElement>(null);

    const dynamicFeesTooltipData =
        !isChained && ammSpeedMarketsLimits && ammSpeedMarketsLimits?.lpFees.length > 4
            ? {
                  firstPerc: formatPercentage(
                      ammSpeedMarketsLimits?.lpFees[0] + ammSpeedMarketsLimits?.safeBoxImpact,
                      0
                  ),
                  secondPerc: formatPercentage(
                      ammSpeedMarketsLimits?.lpFees[1] + ammSpeedMarketsLimits?.safeBoxImpact,
                      0
                  ),
                  thirdPerc: formatPercentage(
                      ammSpeedMarketsLimits?.lpFees[3] + ammSpeedMarketsLimits?.safeBoxImpact,
                      0
                  ),
                  fourthPerc: formatPercentage(
                      ammSpeedMarketsLimits?.lpFees[4] + ammSpeedMarketsLimits?.safeBoxImpact,
                      0
                  ),
                  firstTime: ammSpeedMarketsLimits?.timeThresholdsForFees[0],
                  secondTime: ammSpeedMarketsLimits?.timeThresholdsForFees[1],
                  thirdTime: ammSpeedMarketsLimits?.timeThresholdsForFees[3],
                  fourthTime: ammSpeedMarketsLimits?.timeThresholdsForFees[4],
                  maxSkewImpact: formatPercentage(ammSpeedMarketsLimits?.maxSkewImpact, 0),
              }
            : {};

    return (
        <Container $isChained={isChained}>
            {!isMobile && getTradingDetails()}
            <FinalizeTrade>
                <ColumnSpaceBetween ref={inputWrapperRef}>
                    <NumericInput
                        value={paidAmount}
                        disabled={isSubmitting}
                        placeholder={t('common.enter-amount')}
                        onChange={(_, value) => {
                            setPaidAmount(value);
                            setSelectedStableBuyinAmount(isStableCurrency(selectedCollateral) ? Number(value) : 0);
                        }}
                        onMaxButton={onMaxClick}
                        showValidation={!!errorMessageKey}
                        validationMessage={t(errorMessageKey, {
                            currencyKey: selectedCollateral,
                            minAmount: convertFromStable(minBuyinAmount),
                            maxAmount: convertFromStable(maxBuyinAmount),
                            fee: totalFee ? formatPercentage(totalFee) : '...',
                        })}
                        currencyComponent={
                            isMultiCollateralSupported ? (
                                <CollateralSelector
                                    collateralArray={getCollaterals(networkId)}
                                    selectedItem={selectedCollateralIndex}
                                    onChangeCollateral={() => {}}
                                    disabled={isSubmitting}
                                    isDetailedView
                                    collateralBalances={multipleCollateralBalances.data}
                                    exchangeRates={exchangeRates}
                                    dropDownWidth={inputWrapperRef.current?.getBoundingClientRect().width + 'px'}
                                />
                            ) : undefined
                        }
                        currencyLabel={!isMultiCollateralSupported ? defaultCollateral : undefined}
                    />
                    {isMobile && getTradingDetails()}
                    {getSubmitButton()}
                    {isButtonBuyAvailable && (
                        <BuyInfo>
                            {t('speed-markets.buy-info', { value: ammSpeedMarketsLimits?.maxPriceDelaySec })}
                        </BuyInfo>
                    )}
                    <PaymentInfo>
                        {!isChained && !totalFee ? (
                            t('speed-markets.fee-info')
                        ) : isStableCurrency(selectedCollateral) ? (
                            <Trans
                                i18nKey={`speed-markets${isChained ? '.chained' : ''}.total-pay`}
                                values={{
                                    amount: selectedStableBuyinAmount
                                        ? formatCurrencyWithSign(USD_SIGN, selectedStableBuyinAmount)
                                        : formatCurrencyWithSign(USD_SIGN, Number(paidAmount)),
                                    fee: formatPercentage(totalFee),
                                    totalAmount: selectedStableBuyinAmount
                                        ? formatCurrencyWithSign(USD_SIGN, selectedStableBuyinAmount * (1 + totalFee))
                                        : formatCurrencyWithSign(USD_SIGN, Number(paidAmount) * (1 + totalFee)),
                                }}
                                components={{
                                    tooltip:
                                        positionType && skewImpact[positionType] ? (
                                            <Tooltip overlay={t('speed-markets.tooltips.skew-slippage')} />
                                        ) : (
                                            <></>
                                        ),
                                }}
                            />
                        ) : (
                            <Trans
                                i18nKey={`speed-markets${isChained ? '.chained' : ''}.to-pay-with-conversion`}
                                values={{
                                    amount: formatCurrencyWithKey(selectedCollateral, Number(paidAmount)),
                                    stableAmount: selectedStableBuyinAmount
                                        ? formatCurrencyWithSign(USD_SIGN, selectedStableBuyinAmount)
                                        : formatCurrencyWithSign(USD_SIGN, convertToStable(Number(paidAmount))),
                                    fee: formatPercentage(totalFee),
                                }}
                                components={{
                                    tooltip:
                                        positionType && skewImpact[positionType] ? (
                                            <Tooltip overlay={t('speed-markets.tooltips.skew-slippage')} />
                                        ) : (
                                            <></>
                                        ),
                                }}
                            />
                        )}
                        {!isChained && !totalFee ? (
                            <Tooltip
                                overlay={
                                    Object.keys(dynamicFeesTooltipData).length ? (
                                        <Trans
                                            i18nKey="speed-markets.tooltips.fee-info"
                                            components={{
                                                br: <br />,
                                            }}
                                            values={{ ...dynamicFeesTooltipData }}
                                        />
                                    ) : (
                                        t('common.progress')
                                    )
                                }
                            />
                        ) : (
                            isStableCurrency(selectedCollateral) &&
                            selectedCollateral !== defaultCollateral && (
                                <Tooltip overlay={t('speed-markets.tooltips.paid-conversion')} />
                            )
                        )}
                    </PaymentInfo>
                    {!!totalFee && !isStableCurrency(selectedCollateral) && (
                        <PaymentInfo>
                            {t('speed-markets.total-pay-with-conversion', {
                                amount: formatCurrencyWithKey(selectedCollateral, totalPaidAmount),
                                stableAmount: selectedStableBuyinAmount
                                    ? formatCurrencyWithSign(USD_SIGN, selectedStableBuyinAmount * (1 + totalFee))
                                    : formatCurrencyWithSign(USD_SIGN, convertToStable(totalPaidAmount)),
                            })}
                            {selectedCollateral !== defaultCollateral && (
                                <Tooltip overlay={t('speed-markets.tooltips.paid-conversion')} />
                            )}
                        </PaymentInfo>
                    )}
                </ColumnSpaceBetween>
            </FinalizeTrade>
            {openTwitterShareModal && positionType && (
                <SharePositionModal
                    type="potential-speed"
                    positions={[positionType]}
                    currencyKey={currencyKey}
                    strikeDate={
                        secondsToMilliseconds(strikeTimeSec) || Date.now() + secondsToMilliseconds(deltaTimeSec)
                    }
                    strikePrices={[currentPrice ?? 0]}
                    buyIn={convertToStable(Number(paidAmount))}
                    payout={SPEED_MARKETS_QUOTE * convertToStable(Number(paidAmount))}
                    onClose={() => setOpenTwitterShareModal(false)}
                />
            )}
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={
                        isStableCurrency(selectedCollateral)
                            ? ceilNumberToDecimals(totalPaidAmount)
                            : ceilNumberToDecimals(totalPaidAmount, COLLATERAL_DECIMALS[selectedCollateral])
                    }
                    tokenSymbol={selectedCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Container>
    );
};

const Container = styled(FlexDivRow)<{ $isChained: boolean }>`
    position: relative;
    z-index: 4;
    height: ${(props) => (props.$isChained ? '98' : '78')}px;
    margin-bottom: ${(props) => (props.$isChained ? '48' : '68')}px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-width: initial;
        height: 100%;
        margin-bottom: 20px;
        flex-direction: column;
    }
`;

const TradingDetailsContainer = styled(FlexDivRowCentered)`
    position: relative;
    width: 640px;
    background: ${(props) => props.theme.background.secondary};
    border-radius: 8px;
    padding: 10px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        margin-bottom: 10px;
    }
`;

const FinalizeTrade = styled(FlexDivCentered)`
    width: 410px;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
    }
`;

const ColumnSpaceBetween = styled(FlexDivColumn)`
    width: 100%;
    height: 100%;
    justify-content: space-between;
`;

const BuyInfo = styled.span`
    font-size: 13px;
    font-weight: 600;
    line-height: 110%;
    text-align: center;
    color: ${(props) => props.theme.textColor.secondary};
    margin-top: 6px;
`;

const PaymentInfo = styled.span`
    font-size: 13px;
    font-weight: 600;
    line-height: 110%;
    text-align: center;
    color: ${(props) => props.theme.textColor.secondary};
    margin-top: 6px;
`;

const ShareIcon = styled.i<{ disabled: boolean }>`
    position: absolute;
    top: 12px;
    right: 12px;
    font-size: 18px;
    color: ${(props) => props.theme.textColor.primary};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.disabled ? '0.5' : '1')};
`;

const CollateralText = styled.span`
    text-transform: none;
`;

export default AmmSpeedTrading;
