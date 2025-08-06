import { getPublicClient } from '@wagmi/core';
import ApprovalModal from 'components/ApprovalModal';
import Button from 'components/Button';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import Tooltip from 'components/Tooltip';
import { PLAUSIBLE, PLAUSIBLE_KEYS } from 'constants/analytics';
import { CRYPTO_CURRENCY_MAP, USD_SIGN } from 'constants/currency';
import {
    ALLOWANCE_BUFFER_PERCENTAGE,
    DEFAULT_PRICE_SLIPPAGES_PERCENTAGE,
    POSITIONS_TO_SIDE_MAP,
    SPEED_MARKETS_QUOTE,
} from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import { ScreenSizeBreakpoint } from 'enums/ui';
import useDebouncedEffect from 'hooks/useDebouncedEffect';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import TradingDetailsSentence from 'pages/SpeedMarkets/components/TradingDetailsSentence';
import useExchangeRatesQuery, { Rates } from 'queries/rates/useExchangeRatesQuery';
import useAmmSpeedMarketsCreatorQuery from 'queries/speedMarkets/useAmmSpeedMarketsCreatorQuery';
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
    bigNumberFormatter,
    ceilNumberToDecimals,
    coinParser,
    COLLATERAL_DECIMALS,
    DEFAULT_CURRENCY_DECIMALS,
    formatCurrencyWithSign,
    localStore,
    LONG_CURRENCY_DECIMALS,
    NetworkId,
    roundNumberToDecimals,
    truncToDecimals,
} from 'thales-utils';
import { AmmChainedSpeedMarketsLimits, AmmSpeedMarketsLimits } from 'types/market';
import { SupportedNetwork } from 'types/network';
import { RootState } from 'types/ui';
import { ViemContract } from 'types/viem';
import { executeBiconomyTransaction, getPaymasterData } from 'utils/biconomy';
import biconomyConnector from 'utils/biconomyWallet';
import { getContractAbi } from 'utils/contracts/abi';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import erc20Contract from 'utils/contracts/collateralContract';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import speedMarketsAMMCreatorContract from 'utils/contracts/speedMarketsAMMCreatorContract';
import {
    convertCollateralToStable,
    convertFromStableToCollateral,
    getCollateral,
    getDefaultCollateral,
    isLpSupported,
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
    setBuyinGasFee: React.Dispatch<number>;
    resetData: React.Dispatch<void>;
    hasError: boolean;
};

const DEFAULT_MAX_CREATOR_DELAY_TIME_SEC = 15;

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
    setBuyinGasFee,
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
    const [priceSlippage, setPriceSlippage] = useState(lsPriceSlippage || DEFAULT_PRICE_SLIPPAGES_PERCENTAGE[0]);
    const [isAllowing, setIsAllowing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [outOfLiquidity, setOutOfLiquidity] = useState(false);
    const [outOfLiquidityPerDirection, setOutOfLiquidityPerDirection] = useState(false);
    const [hasAllowance, setAllowance] = useState(false);
    const [openApprovalModal, setOpenApprovalModal] = useState(false);
    const [openTwitterShareModal, setOpenTwitterShareModal] = useState(false);
    const [gasFee, setGasFee] = useState(0);

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
    const collateralHasLp = isLpSupported(selectedCollateral);
    const isDefaultCollateral = selectedCollateral === defaultCollateral;
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

    const ammSpeedMarketsCreatorQuery = useAmmSpeedMarketsCreatorQuery(
        { networkId, client },
        {
            enabled: isAppReady,
        }
    );

    const ammSpeedMarketsCreatorData = useMemo(() => {
        return ammSpeedMarketsCreatorQuery.isSuccess ? ammSpeedMarketsCreatorQuery.data : null;
    }, [ammSpeedMarketsCreatorQuery]);

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

        const bonusPerCollateral = ammSpeedMarketsLimits?.bonusPerCollateral[selectedCollateral] || 0;
        const quoteWithBonus = SPEED_MARKETS_QUOTE * (1 + bonusPerCollateral);

        return {
            [Positions.UP]: totalFeeUp ? quoteWithBonus / (1 + totalFeeUp) : 0,
            [Positions.DOWN]: totalFeeDown ? quoteWithBonus / (1 + totalFeeDown) : 0,
        };
    }, [getTotalFee, selectedCollateral, ammSpeedMarketsLimits]);

    // Used for canceling asynchronous tasks
    const mountedRef = useRef(true);
    useEffect(() => {
        return () => {
            mountedRef.current = false;
        };
    }, []);

    // set buyin without fees if it is native collateral
    useEffect(() => {
        if (collateralHasLp) {
            setBuyinAmount(paidAmount / (1 + totalFee));
        } else {
            setBuyinAmount(paidAmount);
        }

        if (totalFee) {
            const bonusPerCollateral = ammSpeedMarketsLimits?.bonusPerCollateral[selectedCollateral] || 0;
            const quoteWithBonus = (isChained ? chainedQuote : SPEED_MARKETS_QUOTE) * (1 + bonusPerCollateral);
            setPotentialProfit(quoteWithBonus / (1 + totalFee));
        } else {
            // initial value
            setPotentialProfit(0);
        }
    }, [
        paidAmount,
        totalFee,
        collateralHasLp,
        isChained,
        chainedQuote,
        ammSpeedMarketsLimits?.bonusPerCollateral,
        selectedCollateral,
    ]);

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

    const userAddress = isBiconomy ? biconomyConnector.address : (walletAddress as string);

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
            if (isBiconomy) {
                setAllowance(true);
            } else {
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
                        userAddress,
                        addressToApprove
                    );

                    setAllowance(allowance);
                } catch (e) {
                    console.log(e);
                }
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
            const txReceipt = await waitForTransactionReceipt(client as Client, {
                hash,
            });
            if (txReceipt.status === 'success') {
                toast.update(id, getSuccessToastOptions(t(`common.transaction.successful`), id));
                setOpenApprovalModal(false);
                setIsAllowing(false);
            } else {
                console.log('Transaction status', txReceipt.status);
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
                setIsAllowing(false);
            }
        } catch (e) {
            console.log(e);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            setIsAllowing(false);
        }
    };

    const onMarketCreated = useCallback(
        (toastIdParam: string | number) => {
            toast.update(toastIdParam, getSuccessToastOptions(t('common.buy.confirmation-message'), toastIdParam));
            resetData();
            setPaidAmount(0);
            setSubmittedStrikePrice(0);
            setIsSubmitting(false);

            refetchUserSpeedMarkets(isChained, networkId, userAddress);
            refetchActiveSpeedMarkets(isChained, networkId);
            refetchSpeedMarketsLimits(isChained, networkId);
            refetchBalances(userAddress, networkId);
        },
        [isChained, networkId, resetData, t, userAddress]
    );

    const handleSubmit = async () => {
        if (!isBiconomy && isButtonDisabled) return;

        setIsSubmitting(true);
        const id = toast.loading(getDefaultToastContent(t('common.progress')), getLoadingToastOptions());

        const speedMarketsCreatorContractWithSigner = getContract({
            abi: getContractAbi(speedMarketsAMMCreatorContract, networkId),
            address: speedMarketsAMMCreatorContract.addresses[networkId],
            client: walletClient.data as Client,
        });

        const ammContract = isChained ? chainedSpeedMarketsAMMContract : speedMarketsAMMContract;

        const speedMarketsAMMContractWithClient = getContract({
            abi: getContractAbi(ammContract, networkId),
            address: ammContract.addresses[networkId],
            client,
        }) as ViemContract;

        const numOfActiveUserMarketsBefore = Number(
            (await speedMarketsAMMContractWithClient.read.getLengths([userAddress]))[2]
        );

        const publicClient = getPublicClient(wagmiConfig, { chainId: networkId });
        let isMarketCreated = false;

        const unwatch = publicClient.watchContractEvent({
            address: ammContract.addresses[networkId],
            abi: getContractAbi(ammContract, networkId),
            eventName: isChained ? 'MarketCreated' : 'MarketCreatedWithFees',
            args: { [isChained ? 'user' : '_user']: userAddress },
            onLogs: () => {
                isMarketCreated = true;
                onMarketCreated(id);
            },
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
                }) as ViemContract;
                const hash = await wethContractWithSigner.write.deposit([], { value: buyInAmountParam });
                const txReceipt = await waitForTransactionReceipt(client as Client, { hash });
                if (txReceipt.status !== 'success') {
                    console.log('Failed WETH deposit', txReceipt);
                    throw txReceipt;
                }
            }

            const hash = await getTransactionForSpeedAMM(
                speedMarketsCreatorContractWithSigner,
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
                // if creator didn't created market for max time then check for total number of markets
                const maxCreationTime = secondsToMilliseconds(
                    ammSpeedMarketsCreatorData?.maxCreationDelay || DEFAULT_MAX_CREATOR_DELAY_TIME_SEC
                );
                let checkDelay = 2000; // check on every 2s is market created
                while (!isMarketCreated && checkDelay < maxCreationTime) {
                    await delay(checkDelay);

                    const numOfActiveUserMarketsAfter = Number(
                        (await speedMarketsAMMContractWithClient.read.getLengths([userAddress]))[2]
                    );

                    if (!isMarketCreated && numOfActiveUserMarketsAfter - numOfActiveUserMarketsBefore > 0) {
                        unwatch();
                        isMarketCreated = true;
                        onMarketCreated(id);
                    }

                    checkDelay += checkDelay;
                }
                if (!isMarketCreated) {
                    toast.update(id, getErrorToastOptions(t('common.errors.buy-failed'), id));
                    setSubmittedStrikePrice(0);
                    setIsSubmitting(false);
                }

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
                toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
                setSubmittedStrikePrice(0);
                setIsSubmitting(false);
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(t('common.errors.unknown-error-try-again'), id));
            setSubmittedStrikePrice(0);
            setIsSubmitting(false);
        }
        unwatch();
    };

    const getSubmitButton = () => {
        if (!isConnected) {
            return (
                <Button onClick={() => dispatch(setWalletConnectModalVisibility({ visibility: true }))}>
                    {t('common.wallet.connect-your-wallet')}
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
            return (
                <>
                    <Button disabled={isAllowing} onClick={() => setOpenApprovalModal(true)}>
                        {isAllowing
                            ? t('common.enable-wallet-access.approve-progress')
                            : t('common.enable-wallet-access.approve')}
                        <CollateralText>
                            &nbsp;
                            {isEth ? CRYPTO_CURRENCY_MAP.WETH : selectedCollateral}
                        </CollateralText>
                        {isEth && !isMobile && <Tooltip overlay={t('speed-markets.tooltips.eth-to-weth')} />}
                        {isAllowing ? '...' : ''}
                    </Button>
                    {isEth && isMobile && <InfoText>{t('speed-markets.tooltips.eth-to-weth')}</InfoText>}
                </>
            );
        }

        return (
            <Button disabled={isButtonDisabled} onClick={handleSubmit}>
                {isSubmitting
                    ? isEth && !isBiconomy
                        ? t('common.buy.wrap-eth-progress')
                        : t('common.buy.progress-label')
                    : isEth && !isBiconomy
                    ? t('common.buy.wrap-eth')
                    : t('common.buy.label')}
            </Button>
        );
    };

    const getTradingDetails = () => {
        return (
            <GradientContainer width={isMobile ? 0 : 780}>
                <TradingDetailsContainer>
                    <PriceSlippage slippage={priceSlippage} onChange={setPriceSlippage} />
                    <TradingDetailsSentence
                        currencyKey={currencyKey}
                        deltaTimeSec={deltaTimeSec}
                        market={{
                            strikePrice: submittedStrikePrice ? submittedStrikePrice : currentPrice,
                            positionType: isChained ? undefined : positionType,
                            chainedPositions: isChained ? chainedPositions : undefined,
                        }}
                        isFetchingQuote={false}
                        payout={
                            isDefaultCollateral || !collateralHasLp
                                ? convertToStable(potentialProfit * paidAmount)
                                : potentialProfit * paidAmount
                        }
                        selectedCollateral={selectedCollateral}
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
                                    payout: potentialProfit * convertToStable(paidAmount),
                                    collateralAddress,
                                    isDefaultCollateral,
                                    currentPrice: currentPrice ?? 0,
                                    finalPrice: 0,
                                    isClaimable: false,
                                    isResolved: false,
                                    createdAt: Date.now(),
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

    useMemo(async () => {
        if (isBiconomy && !isButtonDisabled) {
            const speedMarketsCreatorContract = getContract({
                abi: getContractAbi(speedMarketsAMMCreatorContract, networkId),
                address: speedMarketsAMMCreatorContract.addresses[networkId],
                client: walletClient.data as Client,
            });
            const asset = stringToHex(currencyKey, { size: 32 });
            const chainedSides = chainedPositions.map((pos) => (pos !== undefined ? POSITIONS_TO_SIDE_MAP[pos] : -1));
            const singleSides = positionType !== undefined ? [POSITIONS_TO_SIDE_MAP[positionType]] : [];
            const sides = isChained ? chainedSides : singleSides;
            const strikePriceSlippage = parseUnits(priceSlippage.toString(), 18);
            const collateralAddressParam = selectedCollateral !== defaultCollateral ? collateralAddress : '';
            const buyInAmountParam = coinParser(
                truncToDecimals(buyinAmount, COLLATERAL_DECIMALS[selectedCollateral]),
                networkId,
                selectedCollateral
            );

            const skewImpactParam = positionType ? parseUnits(skewImpact[positionType].toString(), 18) : undefined;

            if (isChained) {
                const paymasterDataLocal = await getPaymasterData(
                    collateralAddress,
                    speedMarketsCreatorContract,
                    'addPendingChainedSpeedMarket',
                    [
                        [
                            asset,
                            deltaTimeSec,
                            0,
                            strikePriceSlippage,
                            sides,
                            collateralAddressParam || ZERO_ADDRESS,
                            buyInAmountParam,
                            referral || ZERO_ADDRESS,
                        ],
                    ]
                );
                if (paymasterDataLocal && paymasterDataLocal.maxGasFeeUSD) {
                    setGasFee(paymasterDataLocal.maxGasFeeUSD);
                    setBuyinGasFee(paymasterDataLocal.maxGasFeeUSD);
                }
            } else {
                const paymasterDataLocal = await getPaymasterData(
                    collateralAddress,
                    speedMarketsCreatorContract,
                    'addPendingSpeedMarket',
                    [
                        [
                            asset,
                            0,
                            deltaTimeSec,
                            sides,
                            strikePriceSlippage,
                            sides[0],
                            collateralAddressParam || ZERO_ADDRESS,
                            buyInAmountParam,
                            referral || ZERO_ADDRESS,
                            skewImpactParam,
                        ],
                    ]
                );
                if (paymasterDataLocal && paymasterDataLocal.maxGasFeeUSD) {
                    setGasFee(paymasterDataLocal.maxGasFeeUSD);
                    setBuyinGasFee(paymasterDataLocal.maxGasFeeUSD);
                }
            }
        }
    }, [
        isBiconomy,
        collateralAddress,
        currencyKey,
        priceSlippage,
        buyinAmount,
        chainedPositions,
        defaultCollateral,
        deltaTimeSec,
        isChained,
        networkId,
        positionType,
        referral,
        selectedCollateral,
        skewImpact,
        walletClient.data,
        isButtonDisabled,
        setBuyinGasFee,
    ]);

    return (
        <Container>
            {!isMobile && getTradingDetails()}
            <FinalizeTrade>
                <ColumnSpaceBetween>
                    <QuoteContainer>
                        <QuoteLabel>{t('speed-markets.potential-profit')}</QuoteLabel>
                        <QuoteText>{potentialProfit ? `${roundNumberToDecimals(potentialProfit)}x` : '-'}</QuoteText>
                    </QuoteContainer>
                    {isMobile && getTradingDetails()}
                    <ButtonWrapper>
                        {getSubmitButton()}
                        {gasFee > 0 && !isButtonDisabled && (
                            <Tooltip overlay={t('speed-markets.estimate-gas')}>
                                <GasText $isStrikeThrough={networkId === NetworkId.Base}>
                                    <GasIcon className={`network-icon network-icon--gas`} />
                                    {formatCurrencyWithSign(USD_SIGN, gasFee, 2)}
                                </GasText>
                            </Tooltip>
                        )}
                    </ButtonWrapper>
                </ColumnSpaceBetween>
            </FinalizeTrade>

            {openApprovalModal && (
                <ApprovalModal
                    defaultAmount={ceilNumberToDecimals(
                        ALLOWANCE_BUFFER_PERCENTAGE * paidAmount,
                        isStableCurrency(selectedCollateral) ? DEFAULT_CURRENCY_DECIMALS : LONG_CURRENCY_DECIMALS
                    )}
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

const TradingDetailsContainer = styled(FlexDivRowCentered)`
    position: relative;
    height: 100%;
    background: ${(props) => props.theme.background.primary};
    border-radius: 8px;
    padding: 20px 30px 20px 20px;

    @media (max-width: ${ScreenSizeBreakpoint.SMALL}px) {
        width: 100%;
        padding: 12px;
        padding-bottom: 70px;
    }
`;

const FinalizeTrade = styled(FlexDivCentered)`
    width: 340px;
    color: ${(props) => props.theme.textColor.secondary};
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
    color: ${(props) => props.theme.textColor.primary};
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
    background: ${(props) => props.theme.background.secondary};
    color: ${(props) => props.theme.input.textColor.secondary};
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

const InfoText = styled.span`
    font-weight: 400;
    font-size: 13px;
    letter-spacing: 0.13px;
    color: ${(props) => props.theme.textColor.primary};
    padding: 5px 10px;
`;

const ButtonWrapper = styled(FlexDivColumn)`
    justify-content: end;
`;

const GasIcon = styled.i`
    font-size: 20px;
    color: ${(props) => props.theme.textColor.primary};
    margin-right: 2px;
`;

const GasText = styled.span<{ $isStrikeThrough?: boolean }>`
    display: flex;
    font-size: 18px;
    color: ${(props) => props.theme.textColor.primary};
    position: absolute;
    right: 16px;
    bottom: 10px;
    text-decoration: ${(props) => (props.$isStrikeThrough ? 'line-through' : '')};
`;

export default AmmSpeedTrading;
