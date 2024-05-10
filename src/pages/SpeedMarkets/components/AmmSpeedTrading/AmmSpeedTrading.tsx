import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import { GradientContainer } from 'components/Common/GradientBorder';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import {
    ALTCOIN_CONVERSION_BUFFER_PERCENTAGE,
    POSITIONS_TO_SIDE_MAP,
    SPEED_MARKETS_QUOTE,
    STABLECOIN_CONVERSION_BUFFER_PERCENTAGE,
} from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
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
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { toast } from 'react-toastify';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsBiconomy, getSelectedCollateralIndex, setWalletConnectModalVisibility } from 'redux/modules/wallet';
import styled from 'styled-components';
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivRowCentered } from 'styles/common';
import {
    COLLATERAL_DECIMALS,
    NetworkId,
    bigNumberFormatter,
    ceilNumberToDecimals,
    coinParser,
    truncToDecimals,
} from 'thales-utils';
import { AmmChainedSpeedMarketsLimits, AmmSpeedMarketsLimits } from 'types/market';
import { SupportedNetwork } from 'types/network';
import { RootState } from 'types/ui';
import { ViemContract } from 'types/viem';
import { executeBiconomyTransaction } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import speedMarketsAMMCreatorContract from 'utils/contracts/speedMarketsAMMCreatorContract';
import { getCoinBalance, getCollateral, getDefaultCollateral, isStableCurrency } from 'utils/currency';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getPriceId, getPriceServiceEndpoint, priceParser } from 'utils/pyth';
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
    ammSpeedMarketsLimits,
    ammChainedSpeedMarketsLimits,
    currentPrice,
    setSkewImpact,
    resetData,
}) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();

    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const networkId = useChainId() as SupportedNetwork;
    const client = useClient();
    const walletClient = useWalletClient();
    const { isConnected, address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const selectedCollateralIndex = useSelector((state: RootState) => getSelectedCollateralIndex(state));
    const isMobile = useSelector((state: RootState) => getIsMobile(state));

    const [buyinAmount, setBuyinAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState<number | string>(
        selectedStableBuyinAmount ? selectedStableBuyinAmount : ''
    );
    const [totalPaidAmount, setTotalPaidAmount] = useState(0);
    const [potentialProfit, setPotentialProfit] = useState(0);
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

    const chainedQuote =
        isChained && ammChainedSpeedMarketsLimits
            ? ceilNumberToDecimals(
                  ammChainedSpeedMarketsLimits?.payoutMultipliers[
                      chainedPositions.length - ammChainedSpeedMarketsLimits.minChainedMarkets
                  ] ** chainedPositions.length
              )
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
        isConnected &&
        (getReferralWallet()?.toLowerCase() !== walletAddress?.toLowerCase() ||
            getReferralWallet()?.toLowerCase() !== biconomyConnector.address)
            ? getReferralWallet()
            : null;

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

                return ceilNumberToDecimals(lpFee + skew - discount + Number(ammSpeedMarketsLimits?.safeBoxImpact), 4);
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
        if (selectedCollateral === defaultCollateral) {
            setTotalPaidAmount(Number(paidAmount));
            setBuyinAmount(Number(paidAmount) / (1 + totalFee));
        } else if (isStableCurrency(selectedCollateral)) {
            // add half percent to amount to take into account collateral conversion
            setTotalPaidAmount(Number(paidAmount) * (1 + STABLECOIN_CONVERSION_BUFFER_PERCENTAGE));
            setBuyinAmount(Number(paidAmount) / (1 + totalFee + STABLECOIN_CONVERSION_BUFFER_PERCENTAGE));
        } else {
            setTotalPaidAmount(Number(paidAmount));
            setBuyinAmount(Number(paidAmount));
        }

        if (totalFee) {
            setPotentialProfit(isChained ? chainedQuote : SPEED_MARKETS_QUOTE / (1 + totalFee));
        }
    }, [
        paidAmount,
        totalFee,
        selectedCollateral,
        defaultCollateral,
        selectedStableBuyinAmount,
        isChained,
        chainedQuote,
    ]);

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
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string,
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
        walletAddress,
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
            let hash;
            if (isBiconomy) {
                hash = await executeBiconomyTransaction(networkId, erc20Instance.address, erc20Instance, 'approve', [
                    addressToApprove,
                    approveAmount,
                ]);
            } else {
                hash = await erc20Instance.write.approve([addressToApprove, approveAmount]);
            }
            setOpenApprovalModal(false);
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });
            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`common.transaction.successful`), id));
                setIsAllowing(false);
            } else {
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
        if (!isBiconomy && isButtonDisabled) return;

        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        const speedMarketsAMMContractWithSigner = getContract({
            abi: speedMarketsAMMCreatorContract.abi,
            address: speedMarketsAMMCreatorContract.addresses[networkId],
            client: walletClient.data as Client,
        });

        try {
            const priceId = getPriceId(networkId, currencyKey);

            const latestPriceUpdateResponse = await fetch(`
                ${getPriceServiceEndpoint(networkId)}/v2/updates/price/latest?ids[]=${priceId.replace('0x', '')}`);

            const latestPriceUpdate = JSON.parse(await latestPriceUpdateResponse.text());

            const pythPrice = bigNumberFormatter(latestPriceUpdate.parsed[0].price.price, PYTH_CURRENCY_DECIMALS);
            setSubmittedStrikePrice(pythPrice);

            const strikePrice = priceParser(pythPrice);
            const strikePriceSlippage = parseUnits('0.02', 18); // TODO: add to UI custom slippage % (2%)

            const asset = stringToHex(currencyKey, { size: 32 });

            // guaranteed by isButtonDisabled that there are no undefined positions
            const chainedSides = chainedPositions.map((pos) => (pos !== undefined ? POSITIONS_TO_SIDE_MAP[pos] : -1));
            const singleSides = positionType !== undefined ? [POSITIONS_TO_SIDE_MAP[positionType]] : [];
            const sides = isChained ? chainedSides : singleSides;

            const buyInAmountParam = coinParser(
                truncToDecimals(buyinAmount, COLLATERAL_DECIMALS[selectedCollateral]),
                networkId,
                selectedCollateral
            );
            const skewImpactParam = positionType ? parseUnits(skewImpact[positionType].toString(), 18) : undefined;

            const hash = await getTransactionForSpeedAMM(
                speedMarketsAMMContractWithSigner,
                asset,
                deltaTimeSec,
                strikeTimeSec,
                sides,
                buyInAmountParam,
                strikePrice,
                strikePriceSlippage,
                selectedCollateral !== defaultCollateral ? collateralAddress : '',
                referral as string,
                skewImpactParam as any,
                isBiconomy
            );

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`common.buy.confirmation-message`), id));
                resetData();
                setPaidAmount('');

                await delay(secondsToMilliseconds(10)); // wait some time for creator to pick up pending markets

                refetchUserSpeedMarkets(
                    isChained,
                    networkId,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string
                );
                refetchSpeedMarketsLimits(isChained, networkId);
                refetchBalances((isBiconomy ? biconomyConnector.address : walletAddress) as string, networkId);
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
            const hash = await collateralWithSigner.write.mintForUser([walletAddress]);

            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });

            if (txReceipt.status === 'success') {
                toast.update(
                    id,
                    getSuccessToastOptions(t(`common.mint.confirmation-message`, { token: selectedCollateral }), id)
                );
                refetchBalances((isBiconomy ? biconomyConnector.address : walletAddress) as string, networkId);
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
            return (
                <Button height="40px" onClick={() => dispatch(setWalletConnectModalVisibility({ visibility: true }))}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
        }
        if (isMintAvailable) {
            return (
                <Button height="40px" onClick={handleMint}>
                    {isSubmitting ? t('common.mint.progress-label') : t('common.mint.label')}
                    <CollateralText>&nbsp;{selectedCollateral}</CollateralText>
                    {isSubmitting ? '...' : ''}
                </Button>
            );
        }
        if (!isPositionSelected) {
            return (
                <Button height="40px" disabled={true}>
                    {isChained
                        ? t('speed-markets.chained.errors.choose-directions')
                        : t('speed-markets.amm-trading.choose-direction')}
                </Button>
            );
        }
        if (!(strikeTimeSec || deltaTimeSec)) {
            return (
                <Button height="40px" disabled={true}>
                    {t('speed-markets.amm-trading.choose-time')}
                </Button>
            );
        }
        if (!isPaidAmountEntered) {
            return (
                <Button height="40px" disabled={true}>
                    {t('common.enter-amount')}
                </Button>
            );
        }
        if (outOfLiquidityPerDirection) {
            return (
                <Button height="40px" disabled={true}>
                    {t('speed-markets.errors.out-of-liquidity-direction')}
                </Button>
            );
        }
        if (outOfLiquidity) {
            return (
                <Button height="40px" disabled={true}>
                    {t('common.errors.out-of-liquidity')}
                </Button>
            );
        }
        if (!hasAllowance) {
            if (isBiconomy) {
                return (
                    <Button onClick={handleSubmit}>
                        {isSubmitting ? t(`common.buy.progress-label`) : t(`common.buy.label`)}
                    </Button>
                );
            } else {
                return (
                    <Button height="40px" disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                        {isAllowing
                            ? t('common.enable-wallet-access.approve-progress')
                            : t('common.enable-wallet-access.approve')}
                        <CollateralText>&nbsp;{selectedCollateral}</CollateralText>
                        {isAllowing ? '...' : ''}
                    </Button>
                );
            }
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleSubmit}>
                {isSubmitting ? t(`common.buy.progress-label`) : t(`common.buy.label`)}
            </Button>
        );
    };

    const getTradingDetails = () => {
        return (
            <GradientContainer width={640}>
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
            </GradientContainer>
        );
    };

    const inputWrapperRef = useRef<HTMLDivElement>(null);

    return (
        <Container $isChained={isChained}>
            {!isMobile && getTradingDetails()}
            <FinalizeTrade>
                <ColumnSpaceBetween ref={inputWrapperRef}>
                    {isMobile && getTradingDetails()}
                    <QuoteContainer>
                        <QuoteLabel>{t('speed-markets.profit')}</QuoteLabel>
                        <QuoteText>{truncToDecimals(potentialProfit)}x</QuoteText>
                    </QuoteContainer>
                    {getSubmitButton()}
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
    height: 140px;
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
    height: 100%;
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
    padding: 20px;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        margin-bottom: 10px;
    }
`;

const FinalizeTrade = styled(FlexDivCentered)`
    width: 340px;
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
    }
`;

const ColumnSpaceBetween = styled(FlexDivColumn)`
    width: 100%;
    justify-content: space-between;
    height: 100%;
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

const QuoteContainer = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    height: 90px;
    padding: 20px;
    border-radius: 8px;
    background: ${(props) => props.theme.background.quinary};
    color: ${(props) => props.theme.input.textColor.tertiary};
`;

const QuoteLabel = styled.span`
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 18px;
    font-style: normal;
    font-weight: 800;
    line-height: 100%;
    text-transform: capitalize;
`;

const QuoteText = styled.span`
    font-family: ${(props) => props.theme.fontFamily.tertiary};
    font-size: 30px;
    font-style: normal;
    font-weight: 800;
    line-height: 100%; /* 13px */
    text-transform: capitalize;
`;

export default AmmSpeedTrading;
