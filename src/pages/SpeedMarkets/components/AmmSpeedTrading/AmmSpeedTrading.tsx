import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import {
    ALLOWANCE_BUFFER_PERCENTAGE,
    DEFAULT_PRICE_SLIPPAGE_PERCENTAGE,
    POSITIONS_TO_SIDE_MAP,
    SPEED_MARKETS_QUOTE,
} from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
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
import { FlexDivCentered, FlexDivColumn, FlexDivRow, FlexDivRowCentered, GradientContainer } from 'styles/common';
import {
    COLLATERAL_DECIMALS,
    NetworkId,
    bigNumberFormatter,
    ceilNumberToDecimals,
    coinParser,
    localStore,
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
import {
    convertCollateralToStable,
    convertFromStableToCollateral,
    getCoinBalance,
    getCollateral,
    getDefaultCollateral,
    isStableCurrency,
} from 'utils/currency';
import { checkAllowance, getIsMultiCollateralSupported } from 'utils/network';
import { getPriceConnection, getPriceId, priceParser } from 'utils/pyth';
import {
    refetchActiveSpeedMarkets,
    refetchBalances,
    refetchSpeedMarketsLimits,
    refetchUserSpeedMarkets,
} from 'utils/queryConnector';
import { getReferralWallet } from 'utils/referral';
import { getFeeByTimeThreshold, getTransactionForSpeedAMM } from 'utils/speedAmm';
import { delay } from 'utils/timer';
import { Client, getContract, parseUnits, stringToHex } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { useAccount, useChainId, useClient, useWalletClient } from 'wagmi';
import PriceSlippage from '../PriceSlippage';
import { SelectedPosition } from '../SelectPosition/SelectPosition';
import SharePosition from '../SharePosition';
import useUserActiveSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveSpeedMarketsDataQuery';
import useUserActiveChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserActiveChainedSpeedMarketsDataQuery';

type AmmSpeedTradingProps = {
    isChained: boolean;
    currencyKey: string;
    positionType: SelectedPosition;
    chainedPositions: SelectedPosition[];
    deltaTimeSec: number;
    enteredBuyinAmount: number;
    ammSpeedMarketsLimits: AmmSpeedMarketsLimits | null;
    ammChainedSpeedMarketsLimits: AmmChainedSpeedMarketsLimits | null;
    currentPrice: number;
    setProfitAndSkewPerPosition: React.Dispatch<{
        profit: { [Positions.UP]: number; [Positions.DOWN]: number };
        skew: { [Positions.UP]: number; [Positions.DOWN]: number };
    }>;
    resetData: React.Dispatch<void>;
    hasError: boolean;
};

const DEFAULT_CREATOR_DELAY_TIME_SEC = 12;

const AmmSpeedTrading: React.FC<AmmSpeedTradingProps> = ({
    isChained,
    currencyKey,
    positionType,
    chainedPositions,
    deltaTimeSec,
    enteredBuyinAmount,
    ammSpeedMarketsLimits,
    ammChainedSpeedMarketsLimits,
    currentPrice,
    setProfitAndSkewPerPosition,
    resetData,
    hasError,
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

    const lsPriceSlippage: number | undefined = localStore.get(LOCAL_STORAGE_KEYS.PRICE_SLIPPAGE);

    const [buyinAmount, setBuyinAmount] = useState(0);
    const [paidAmount, setPaidAmount] = useState(enteredBuyinAmount);
    const [potentialProfit, setPotentialProfit] = useState(0);
    const [submittedStrikePrice, setSubmittedStrikePrice] = useState(0);
    const [priceSlippage, setPriceSlippage] = useState(lsPriceSlippage || DEFAULT_PRICE_SLIPPAGE_PERCENTAGE);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [outOfLiquidity, setOutOfLiquidity] = useState(false);
    const [outOfLiquidityPerDirection, setOutOfLiquidityPerDirection] = useState(false);
    const [hasAllowance, setAllowance] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [openTwitterShareModal, setOpenTwitterShareModal] = useState(false);
    const [toastId, setToastId] = useState<string | number>('');
    const [numOfUserMarketsBeforeBuy, setNumOfUserMarketsBeforeBuy] = useState(-1); // deafult -1 when buy not started

    const isMultiCollateralSupported = getIsMultiCollateralSupported(networkId);

    const isPositionSelected = isChained
        ? chainedPositions.every((pos) => pos !== undefined)
        : positionType !== undefined;

    const isPaidAmountEntered = paidAmount > 0;

    const isButtonDisabled =
        !isPositionSelected ||
        !deltaTimeSec ||
        !isPaidAmountEntered ||
        isSubmitting ||
        !hasAllowance ||
        outOfLiquidity ||
        hasError;

    const chainedQuote =
        isChained && ammChainedSpeedMarketsLimits
            ? ceilNumberToDecimals(
                  ammChainedSpeedMarketsLimits?.payoutMultipliers[
                      chainedPositions.length - ammChainedSpeedMarketsLimits.minChainedMarkets
                  ] ** chainedPositions.length
              )
            : 0;

    const defaultCollateral = useMemo(() => getDefaultCollateral(networkId), [networkId]);
    const selectedCollateral = useMemo(() => getCollateral(networkId, selectedCollateralIndex), [
        networkId,
        selectedCollateralIndex,
    ]);
    const isEth = selectedCollateral === CRYPTO_CURRENCY_MAP.ETH;
    const collateralAddress = isMultiCollateralSupported
        ? isEth
            ? multipleCollateral.WETH.addresses[networkId]
            : multipleCollateral[selectedCollateral].addresses[networkId]
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

    // SINGLE
    const userActiveSpeedMarketsDataQuery = useUserActiveSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected && !isChained && isSubmitting,
        }
    );

    const userOpenSpeedMarketsData = useMemo(
        () =>
            userActiveSpeedMarketsDataQuery.isSuccess && userActiveSpeedMarketsDataQuery.data
                ? userActiveSpeedMarketsDataQuery.data
                : [],
        [userActiveSpeedMarketsDataQuery]
    );

    // CHAINED
    const userChainedSpeedMarketsDataQuery = useUserActiveChainedSpeedMarketsDataQuery(
        { networkId, client },
        isBiconomy ? biconomyConnector.address : walletAddress || '',
        {
            enabled: isAppReady && isConnected && isChained && isSubmitting,
        }
    );

    const userOpenChainedSpeedMarketsData = useMemo(
        () =>
            userChainedSpeedMarketsDataQuery.isSuccess && userChainedSpeedMarketsDataQuery.data
                ? userChainedSpeedMarketsDataQuery.data
                : [],
        [userChainedSpeedMarketsDataQuery]
    );

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

    const getTotalFee = useCallback(
        (position: Positions | undefined) => {
            if (ammSpeedMarketsLimits) {
                if (isChained) {
                    return ammSpeedMarketsLimits.safeBoxImpact;
                } else if (deltaTimeSec) {
                    const lpFee = getFeeByTimeThreshold(
                        deltaTimeSec,
                        ammSpeedMarketsLimits?.timeThresholdsForFees,
                        ammSpeedMarketsLimits?.lpFees,
                        ammSpeedMarketsLimits?.defaultLPFee
                    );
                    const skew = position ? skewImpact[position] : 0;
                    const oppositePosition = position
                        ? position === Positions.UP
                            ? Positions.DOWN
                            : Positions.UP
                        : undefined;
                    const discount = oppositePosition ? skewImpact[oppositePosition] / 2 : 0;

                    return ceilNumberToDecimals(
                        lpFee + skew - discount + Number(ammSpeedMarketsLimits?.safeBoxImpact),
                        4
                    );
                }
            }
            return 0;
        },
        [isChained, ammSpeedMarketsLimits, deltaTimeSec, skewImpact]
    );

    const totalFee = useMemo(() => getTotalFee(positionType), [positionType, getTotalFee]);

    const profitPerPosition = useMemo(() => {
        const totalFeeUp = getTotalFee(Positions.UP);
        const totalFeeDown = getTotalFee(Positions.DOWN);

        return {
            [Positions.UP]: totalFeeUp ? SPEED_MARKETS_QUOTE / (1 + totalFeeUp) : 0,
            [Positions.DOWN]: totalFeeDown ? SPEED_MARKETS_QUOTE / (1 + totalFeeDown) : 0,
        };
    }, [getTotalFee]);

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    useEffect(() => {
        if (selectedCollateral === defaultCollateral) {
            setBuyinAmount(paidAmount / (1 + totalFee));
        } else {
            setBuyinAmount(paidAmount);
        }

        if (totalFee) {
            setPotentialProfit((isChained ? chainedQuote : SPEED_MARKETS_QUOTE) / (1 + totalFee));
        } else {
            // initial value
            setPotentialProfit(0);
        }
    }, [paidAmount, totalFee, selectedCollateral, defaultCollateral, isChained, chainedQuote]);

    useEffect(() => {
        if (enteredBuyinAmount > 0) {
            setPaidAmount(enteredBuyinAmount);
        } else {
            setPaidAmount(0);
        }
    }, [enteredBuyinAmount, convertFromStable, selectedCollateral]);

    // Update profits and skew per each position
    useDebouncedEffect(() => {
        setProfitAndSkewPerPosition({ profit: profitPerPosition, skew: skewImpact });
    }, [profitPerPosition, skewImpact, setProfitAndSkewPerPosition]);

    // Save price slippage to local storage
    useEffect(() => {
        localStore.set(LOCAL_STORAGE_KEYS.PRICE_SLIPPAGE, priceSlippage);
    }, [priceSlippage]);

    // Submit validations
    useEffect(() => {
        const convertedStablePaidAmount = convertToStable(paidAmount);
        if (convertedStablePaidAmount > 0) {
            if (isChained) {
                if (ammChainedSpeedMarketsLimits?.risk) {
                    setOutOfLiquidity(
                        ammChainedSpeedMarketsLimits?.risk.current + convertedStablePaidAmount >
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
                        riskPerAssetAndDirectionData?.current + convertedStablePaidAmount >
                            riskPerAssetAndDirectionData?.max
                    );
                }

                const riskPerAssetData = ammSpeedMarketsLimits?.risksPerAsset.filter(
                    (data) => data.currency === currencyKey
                )[0];
                if (riskPerAssetData) {
                    setOutOfLiquidity(riskPerAssetData?.current + convertedStablePaidAmount > riskPerAssetData?.max);
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
        convertToStable,
        paidAmount,
        positionType,
    ]);

    // check if new market is created
    useEffect(() => {
        if (isSubmitting && numOfUserMarketsBeforeBuy === -1) {
            setNumOfUserMarketsBeforeBuy(
                isChained ? userOpenChainedSpeedMarketsData.length : userOpenSpeedMarketsData.length
            );
        } else if (!isSubmitting && toastId !== '') {
            const numOfUserMarketsAfter = isChained
                ? userOpenChainedSpeedMarketsData.length
                : userOpenSpeedMarketsData.length;

            // TODO: improve by comparing markets addresses before and after
            if (numOfUserMarketsAfter - numOfUserMarketsBeforeBuy > 0) {
                toast.update(toastId, getSuccessToastOptions(t(`common.buy.confirmation-message`), toastId));
            } else {
                toast.update(toastId, getErrorToastOptions(t('common.errors.buy-failed'), toastId));
            }
            setToastId('');
            setNumOfUserMarketsBeforeBuy(-1);
            setSubmittedStrikePrice(0);
        }
    }, [
        numOfUserMarketsBeforeBuy,
        isSubmitting,
        isChained,
        userOpenSpeedMarketsData.length,
        userOpenChainedSpeedMarketsData.length,
        t,
        toastId,
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
                    (
                        ALLOWANCE_BUFFER_PERCENTAGE *
                        (isStableCurrency(selectedCollateral)
                            ? ceilNumberToDecimals(paidAmount)
                            : ceilNumberToDecimals(paidAmount, COLLATERAL_DECIMALS[selectedCollateral]))
                    ).toString(),
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
            getAllowance();
        }
    }, [
        collateralAddress,
        networkId,
        paidAmount,
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
        setToastId(id);

        const speedMarketsAMMContractWithSigner = getContract({
            abi: speedMarketsAMMCreatorContract.abi,
            address: speedMarketsAMMCreatorContract.addresses[networkId],
            client: walletClient.data as Client,
        });

        try {
            const priceConnection = getPriceConnection(networkId);
            const priceId = getPriceId(networkId, currencyKey);

            const priceFeeds = await priceConnection.getLatestPriceUpdates([priceId]);

            const pythPrice = priceFeeds.parsed
                ? bigNumberFormatter(BigInt(priceFeeds.parsed[0].price.price), PYTH_CURRENCY_DECIMALS)
                : 0;

            setSubmittedStrikePrice(pythPrice);

            const strikePrice = priceParser(pythPrice);
            const strikePriceSlippage = parseUnits(priceSlippage.toString(), 18);

            const asset = stringToHex(currencyKey, { size: 32 });

            // guaranteed by isButtonDisabled that there are no undefined positions
            const chainedSides = chainedPositions.map((pos) => (pos !== undefined ? POSITIONS_TO_SIDE_MAP[pos] : -1));
            const singleSides = positionType !== undefined ? [POSITIONS_TO_SIDE_MAP[positionType]] : [];
            const sides = isChained ? chainedSides : singleSides;

            const collateralAddressParam = selectedCollateral !== defaultCollateral ? collateralAddress : '';

            const buyInAmountParam = coinParser(
                truncToDecimals(buyinAmount, COLLATERAL_DECIMALS[selectedCollateral]),
                networkId,
                selectedCollateral
            );

            const skewImpactParam = positionType ? parseUnits(skewImpact[positionType].toString(), 18) : undefined;

            // contract doesn't support ETH so convert it to WETH when ETH is selected
            if (isEth && !isBiconomy) {
                const wethContractWithSigner = getContract({
                    abi: multipleCollateral.WETH.abi,
                    address: multipleCollateral.WETH.addresses[networkId],
                    client: walletClient.data as Client,
                });
                const hash = await wethContractWithSigner.write.deposit([], { value: buyInAmountParam });
                const txReceipt = await waitForTransactionReceipt(client as Client, { hash });
                if (txReceipt.status !== 'success') {
                    console.log('Failed WETH deposit', txReceipt);
                    throw txReceipt;
                }
            }

            const hash = await getTransactionForSpeedAMM(
                speedMarketsAMMContractWithSigner,
                asset,
                deltaTimeSec,
                sides,
                buyInAmountParam,
                strikePrice,
                strikePriceSlippage,
                collateralAddressParam,
                referral as string,
                skewImpactParam as any,
                isBiconomy,
                isEth
            );

            const txReceipt = await waitForTransactionReceipt(client as Client, { hash });

            if (txReceipt.status === 'success') {
                resetData();
                setPaidAmount(0);

                // wait some time for creator to pick up pending markets (after max delay it will fail for sure)
                await delay(secondsToMilliseconds(DEFAULT_CREATOR_DELAY_TIME_SEC));

                refetchUserSpeedMarkets(
                    isChained,
                    networkId,
                    (isBiconomy ? biconomyConnector.address : walletAddress) as string
                );
                refetchActiveSpeedMarkets(isChained, networkId);
                refetchSpeedMarketsLimits(isChained, networkId);
                refetchBalances((isBiconomy ? biconomyConnector.address : walletAddress) as string, networkId);

                PLAUSIBLE.trackEvent(
                    isChained ? PLAUSIBLE_KEYS.chainedSpeedMarketsBuy : PLAUSIBLE_KEYS.speedMarketsBuy,
                    {
                        props: {
                            value: paidAmount,
                            collateral: getCollateral(networkId, selectedCollateralIndex),
                            networkId,
                        },
                    }
                );
            } else {
                console.log('Transaction status', txReceipt.status);
                await delay(800);
                setToastId('');
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
                setSubmittedStrikePrice(0);
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            setToastId('');
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            setSubmittedStrikePrice(0);
        }
        await delay(3000); // wait for refetch
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

    const isBlastSepolia = networkId === NetworkId.BlastSepolia;
    const isMintAvailable = isBlastSepolia && collateralBalance < paidAmount;

    const getSubmitButton = () => {
        if (!isConnected) {
            return (
                <Button onClick={() => dispatch(setWalletConnectModalVisibility({ visibility: true }))}>
                    {t('common.wallet.connect-your-wallet')}
                </Button>
            );
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
        if (!deltaTimeSec) {
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
            if (isBiconomy) {
                return (
                    <Button onClick={handleSubmit}>
                        {isSubmitting ? t(`common.buy.progress-label`) : t(`common.buy.label`)}
                    </Button>
                );
            } else {
                return (
                    <Button disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                        {isAllowing
                            ? t('common.enable-wallet-access.approve-progress')
                            : t('common.enable-wallet-access.approve')}
                        <CollateralText>&nbsp;{isEth ? CRYPTO_CURRENCY_MAP.WETH : selectedCollateral}</CollateralText>
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
            <GradientContainer width={isMobile ? 0 : 780}>
                <TradingDetailsContainer isChained={isChained}>
                    {!isChained && <PriceSlippage slippage={priceSlippage} onChange={setPriceSlippage} />}
                    <TradingDetailsSentence
                        currencyKey={currencyKey}
                        deltaTimeSec={deltaTimeSec}
                        market={{
                            strikePrice: submittedStrikePrice ? submittedStrikePrice : currentPrice,
                            positionType: isChained ? undefined : positionType,
                            chainedPositions: isChained ? chainedPositions : undefined,
                        }}
                        isFetchingQuote={false}
                        profit={potentialProfit}
                        paidAmount={convertToStable(paidAmount)}
                        hasCollateralConversion={selectedCollateral !== defaultCollateral}
                    />
                    {!isChained && (
                        <ShareWrapper>
                            <ShareText
                                $isDisabled={isButtonDisabled}
                                onClick={() => !isButtonDisabled && setOpenTwitterShareModal(true)}
                            >
                                {' '}
                                {t('common.flex-card.share')}
                            </ShareText>
                            <SharePosition
                                position={{
                                    user: walletAddress || '',
                                    market: '',
                                    currencyKey: currencyKey,
                                    side: positionType || Positions.UP,
                                    strikePrice: currentPrice ?? 0,
                                    maturityDate: Date.now() + secondsToMilliseconds(deltaTimeSec || 100),
                                    paid: convertToStable(paidAmount),
                                    payout: SPEED_MARKETS_QUOTE * convertToStable(paidAmount),
                                    currentPrice: currentPrice ?? 0,
                                    finalPrice: currentPrice ?? 0,
                                    isClaimable: false,
                                    isResolved: false,
                                    createdAt: 0,
                                }}
                                isDisabled={isButtonDisabled}
                                isOpen={openTwitterShareModal}
                                onClose={() => setOpenTwitterShareModal(false)}
                            />
                        </ShareWrapper>
                    )}
                </TradingDetailsContainer>
            </GradientContainer>
        );
    };

    const inputWrapperRef = useRef<HTMLDivElement>(null);

    return (
        <Container>
            {!isMobile && getTradingDetails()}
            <FinalizeTrade>
                <ColumnSpaceBetween ref={inputWrapperRef}>
                    <QuoteContainer>
                        <QuoteLabel>{t('speed-markets.profit')}</QuoteLabel>
                        <QuoteText>{potentialProfit ? `${truncToDecimals(potentialProfit)}x` : '-'}</QuoteText>
                    </QuoteContainer>
                    {isMobile && getTradingDetails()}

                    {getSubmitButton()}
                </ColumnSpaceBetween>
            </FinalizeTrade>
            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={
                        ALLOWANCE_BUFFER_PERCENTAGE *
                        (isStableCurrency(selectedCollateral)
                            ? ceilNumberToDecimals(paidAmount)
                            : ceilNumberToDecimals(paidAmount, COLLATERAL_DECIMALS[selectedCollateral]))
                    }
                    tokenSymbol={isEth ? CRYPTO_CURRENCY_MAP.WETH : selectedCollateral}
                    isAllowing={isAllowing}
                    onSubmit={handleAllowance}
                    onClose={() => setOpenApprovalModal(false)}
                />
            )}
        </Container>
    );
};

const Container = styled(FlexDivRow)`
    position: relative;
    z-index: 4;
    height: 140px;
    margin-bottom: 20px;
    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        min-width: initial;
        height: 100%;
        margin-bottom: 20px;
        flex-direction: column;
    }
`;

const TradingDetailsContainer = styled(FlexDivRowCentered)<{ isChained: boolean }>`
    position: relative;
    height: 100%;
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
    padding: 20px;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        ${(props) => (props.isChained ? '' : 'padding-bottom: 70px;')}
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
    height: 100%;
    justify-content: space-between;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        gap: 10px;
    }
`;

const ShareWrapper = styled.div`
    position: absolute;
    bottom: 12px;
    right: 12px;
`;

const ShareText = styled.span<{ $isDisabled: boolean }>`
    margin-right: 5px;
    color: ${(props) => props.theme.textColor.quinary};
    cursor: ${(props) => (props.$isDisabled ? 'default' : 'pointer')};
    opacity: ${(props) => (props.$isDisabled ? '0.5' : '1')};
    font-size: 14px;
    font-weight: 400;
    text-transform: lowercase;
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
    font-size: 18px;
    font-weight: 800;
    line-height: 100%;
    text-transform: capitalize;
`;

const QuoteText = styled.span`
    font-size: 30px;
    font-weight: 800;
    line-height: 100%;
    text-transform: capitalize;
`;

export default AmmSpeedTrading;
