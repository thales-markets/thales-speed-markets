import PythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getInfoToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CONTRACT_ADDRESS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMinutes } from 'date-fns';
import { Positions } from 'enums/market';
import i18n from 'i18n';
import { toast } from 'react-toastify';
import { UserChainedPosition, UserPosition } from 'types/market';
import { QueryConfig, SupportedNetwork } from 'types/network';
import { ViemContract } from 'types/viem';
import { getPriceConnection, getPriceId, priceParser } from 'utils/pyth';
import { refetchActiveSpeedMarkets, refetchBalances, refetchUserSpeedMarkets } from 'utils/queryConnector';
import { delay } from 'utils/timer';
import { Client, getContract } from 'viem';
import { waitForTransactionReceipt } from 'viem/actions';
import { executeBiconomyTransaction } from './biconomy';
import biconomyConnector from './biconomyWallet';
import { getContractAbi } from './contracts/abi';
import erc20Contract from './contracts/collateralContract';
import speedMarketsAMMResolverContract from './contracts/speedMarketsAMMResolverContract';

export const getTransactionForSpeedAMM = async (
    creatorContractWithSigner: any,
    asset: string,
    deltaTimeSec: number,
    sides: number[],
    buyInAmount: bigint,
    strikePrice: bigint,
    strikePriceSlippage: bigint,
    collateralAddress: string,
    referral: string | null,
    skewImpact?: bigint,
    isBiconomy?: boolean,
    isEth?: boolean
) => {
    let txHash;
    const isChained = sides.length > 1;

    if (isChained) {
        if (isBiconomy) {
            const biconomyChainId = biconomyConnector.wallet?.biconomySmartAccountConfig.chainId as SupportedNetwork;

            txHash = await executeBiconomyTransaction(
                biconomyChainId,
                collateralAddress || erc20Contract.addresses[biconomyChainId],
                creatorContractWithSigner,
                'addPendingChainedSpeedMarket',
                [
                    [
                        asset,
                        deltaTimeSec,
                        strikePrice,
                        strikePriceSlippage,
                        sides,
                        collateralAddress || ZERO_ADDRESS,
                        buyInAmount,
                        referral || ZERO_ADDRESS,
                    ],
                ],
                undefined,
                isEth,
                buyInAmount
            );
        } else {
            txHash = await creatorContractWithSigner.write.addPendingChainedSpeedMarket([
                [
                    asset,
                    deltaTimeSec,
                    strikePrice,
                    strikePriceSlippage,
                    sides,
                    collateralAddress || ZERO_ADDRESS,
                    buyInAmount,
                    referral || ZERO_ADDRESS,
                ],
            ]);
        }
    } else {
        if (isBiconomy) {
            const biconomyChainId = biconomyConnector.wallet?.biconomySmartAccountConfig.chainId as SupportedNetwork;

            txHash = await executeBiconomyTransaction(
                biconomyChainId,
                collateralAddress || erc20Contract.addresses[biconomyChainId],
                creatorContractWithSigner,
                'addPendingSpeedMarket',
                [
                    [
                        asset,
                        0,
                        deltaTimeSec,
                        strikePrice,
                        strikePriceSlippage,
                        sides[0],
                        collateralAddress || ZERO_ADDRESS,
                        buyInAmount,
                        referral || ZERO_ADDRESS,
                        skewImpact,
                    ],
                ],
                undefined,
                isEth,
                buyInAmount
            );
        } else {
            txHash = await creatorContractWithSigner.write.addPendingSpeedMarket([
                [
                    asset,
                    0,
                    deltaTimeSec,
                    strikePrice,
                    strikePriceSlippage,
                    sides[0],
                    collateralAddress || ZERO_ADDRESS,
                    buyInAmount,
                    referral || ZERO_ADDRESS,
                    skewImpact,
                ],
            ]);
        }
    }

    return txHash;
};

// get dynamic LP fee based on time threshold and delta time to maturity
export const getFeeByTimeThreshold = (
    deltaTimeSec: number,
    timeThresholds: number[], // in minutes - ascending order
    fees: number[],
    defaultFee: number
): number => {
    let index = -1;
    // iterate backwards and find index
    for (let i = timeThresholds.length - 1; i >= 0; i--) {
        if (secondsToMinutes(deltaTimeSec) >= timeThresholds[i]) {
            index = i;
            break;
        }
    }
    return index !== -1 ? fees[index] : defaultFee;
};

// when fees are missing from contract (for old markets) get hardcoded history fees
export const getFeesFromHistory = (txTimestampMilis: number) => {
    let safeBoxImpact;
    let lpFee;

    if (txTimestampMilis < 1693039265000) {
        // Until Aug-26-2023 08:41:05 PM +UTC
        safeBoxImpact = 0.01;
        lpFee = 0.04;
    } else if (txTimestampMilis < 1696157435000) {
        // Until Oct-01-2023 10:50:35 AM +UTC
        safeBoxImpact = 0.02;
        lpFee = 0.04;
    } else {
        // latest before added to contract
        safeBoxImpact = 0.02;
        lpFee = 0.05;
    }
    return { safeBoxImpact, lpFee };
};

export const isUserWinner = (position: Positions, strikePrice: number, finalPrice: number) =>
    strikePrice > 0 && finalPrice > 0
        ? (position === Positions.UP && finalPrice > strikePrice) ||
          (position === Positions.DOWN && finalPrice < strikePrice)
        : undefined;

export const getUserLostAtSideIndex = (position: UserChainedPosition) => {
    const userLostIndex = position.finalPrices.findIndex(
        (finalPrice, i) => isUserWinner(position.sides[i], position.strikePrices[i], finalPrice) === false
    );
    return userLostIndex > -1 ? userLostIndex : position.sides.length - 1;
};

export const resolveAllSpeedPositions = async (
    positions: UserPosition[],
    isAdmin: boolean,
    queryConfig: QueryConfig,
    isBiconomy?: boolean,
    collateralAddress?: string,
    isOverview?: boolean
) => {
    if (!positions.length) {
        return;
    }

    const priceConnection = getPriceConnection(queryConfig.networkId);

    const id = toast.loading(getDefaultToastContent(i18n.t('common.progress')), getLoadingToastOptions());

    const speedMarketsAMMResolverContractWithSigner = getContract({
        abi: getContractAbi(speedMarketsAMMResolverContract, queryConfig.networkId),
        address: speedMarketsAMMResolverContract.addresses[queryConfig.networkId],
        client: queryConfig.client,
    }) as ViemContract;

    const marketsToResolve: string[] = isAdmin
        ? positions.filter((position) => !!position.finalPrice).map((position) => position.market)
        : [];
    const manualFinalPrices: number[] = isAdmin
        ? positions
              .filter((position) => !!position.finalPrice)
              .map((position) => Number(priceParser(position.finalPrice || 0)))
        : [];
    const priceUpdateDataArray: string[] = [];
    let totalUpdateFee = BigInt(0);

    for (const position of positions) {
        if (isAdmin) {
            break;
        }
        try {
            const pythContract = getContract({
                abi: PythInterfaceAbi,
                address: PYTH_CONTRACT_ADDRESS[queryConfig.networkId],
                client: queryConfig.client,
            }) as ViemContract;

            const priceFeedUpdate = await priceConnection.getPriceUpdatesAtTimestamp(
                millisecondsToSeconds(position.maturityDate),
                [getPriceId(queryConfig.networkId, position.currencyKey)]
            );

            const priceUpdateData = priceFeedUpdate.binary.data.map((vaa: string) => '0x' + vaa);
            const updateFee = await pythContract.read.getUpdateFee([priceUpdateData]);

            marketsToResolve.push(position.market);
            priceUpdateDataArray.push(priceUpdateData[0]);
            totalUpdateFee = totalUpdateFee + updateFee;
        } catch (e) {
            console.log(`Can't fetch VAA from Pyth API for market ${position.market}`, e);
        }
    }

    if (marketsToResolve.length > 0) {
        try {
            let hash;
            if (isBiconomy && collateralAddress) {
                hash = isAdmin
                    ? await executeBiconomyTransaction(
                          queryConfig.networkId,
                          collateralAddress,
                          speedMarketsAMMResolverContractWithSigner,
                          'resolveMarketManuallyBatch',
                          [marketsToResolve, manualFinalPrices]
                      )
                    : await executeBiconomyTransaction(
                          queryConfig.networkId,
                          collateralAddress,
                          speedMarketsAMMResolverContractWithSigner,
                          'resolveMarketsBatch',
                          [marketsToResolve, priceUpdateDataArray]
                      );
            } else {
                hash = isAdmin
                    ? await speedMarketsAMMResolverContractWithSigner.write.resolveMarketManuallyBatch([
                          marketsToResolve,
                          manualFinalPrices,
                      ])
                    : await speedMarketsAMMResolverContractWithSigner.write.resolveMarketsBatch(
                          [marketsToResolve, priceUpdateDataArray],
                          { value: totalUpdateFee }
                      );
            }

            const txReceipt = await waitForTransactionReceipt(queryConfig.client as Client, { hash });

            if (txReceipt.status === 'success') {
                toast.update(
                    id,
                    getSuccessToastOptions(
                        isOverview
                            ? i18n.t('speed-markets.overview.confirmation-message')
                            : i18n.t('speed-markets.user-positions.confirmation-message'),
                        id
                    )
                );
                await delay(2000);

                const walletAddress = isBiconomy
                    ? biconomyConnector.address
                    : (queryConfig.client as Client)?.account?.address;
                if (walletAddress) {
                    refetchUserSpeedMarkets(false, queryConfig.networkId, walletAddress);
                    refetchBalances(walletAddress, queryConfig.networkId);
                }
                refetchActiveSpeedMarkets(false, queryConfig.networkId);
            } else {
                console.log('Transaction status', txReceipt.status);
                await delay(800);
                toast.update(id, getErrorToastOptions(i18n.t('common.errors.unknown-error-try-again'), id));
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(i18n.t('common.errors.unknown-error-try-again'), id));
        }
    } else {
        toast.update(id, getInfoToastOptions(i18n.t('speed-markets.overview.no-resolve-positions'), id));
    }
};

export const resolveAllChainedMarkets = async (
    positions: UserChainedPosition[],
    isAdmin: boolean,
    queryConfig: QueryConfig,
    isBiconomy?: boolean,
    collateralAddress?: string,
    isOverview?: boolean
) => {
    if (!positions.length) {
        return;
    }

    const priceConnection = getPriceConnection(queryConfig.networkId);

    const id = toast.loading(getDefaultToastContent(i18n.t('common.progress')), getLoadingToastOptions());

    const speedMarketsAMMResolverContractWithSigner = getContract({
        abi: speedMarketsAMMResolverContract.abi,
        address: speedMarketsAMMResolverContract.addresses[queryConfig.networkId],
        client: queryConfig.client,
    }) as ViemContract;

    const marketsToResolve: string[] = isAdmin
        ? positions.filter((position) => position.canResolve).map((position) => position.market)
        : [];

    const fetchUntilFinalPriceEndIndexes = positions.map((position) => getUserLostAtSideIndex(position) + 1);
    const manualFinalPrices: number[][] = isAdmin
        ? positions
              .filter((position) => position.canResolve)
              .map((position, i) =>
                  position.finalPrices
                      .slice(0, fetchUntilFinalPriceEndIndexes[i])
                      .map((finalPrice) => Number(priceParser(finalPrice)))
              )
        : [];

    const priceUpdateDataArray: string[][][] = [];
    let totalUpdateFee = BigInt(0);

    // Fetch prices for non-admin resolve
    for (let index = 0; index < positions.length; index++) {
        if (isAdmin) {
            break;
        }
        const position = positions[index];
        try {
            const pythContract = getContract({
                abi: PythInterfaceAbi,
                address: PYTH_CONTRACT_ADDRESS[queryConfig.networkId],
                client: queryConfig.client,
            }) as ViemContract;

            let promises = [];
            const pythPriceId = getPriceId(queryConfig.networkId, position.currencyKey);
            const strikeTimesToFetchPrice = position.strikeTimes.slice(0, fetchUntilFinalPriceEndIndexes[index]);
            for (let i = 0; i < strikeTimesToFetchPrice.length; i++) {
                promises.push(
                    priceConnection.getPriceUpdatesAtTimestamp(millisecondsToSeconds(position.strikeTimes[i]), [
                        pythPriceId,
                    ])
                );
            }
            const priceFeedUpdateVaas = await Promise.all(promises);

            promises = [];
            const priceUpdateDataPerMarket: string[][] = [];
            for (let i = 0; i < strikeTimesToFetchPrice.length; i++) {
                const priceUpdateData = priceFeedUpdateVaas[i].binary.data.map((vaa: string) => '0x' + vaa);
                priceUpdateDataPerMarket.push(priceUpdateData);
                promises.push(pythContract.read.getUpdateFee([priceUpdateData]));
            }
            priceUpdateDataArray.push(priceUpdateDataPerMarket);

            const updateFees = await Promise.all(promises);
            totalUpdateFee = totalUpdateFee + updateFees.reduce((a: bigint, b: bigint) => a + b, BigInt(0));
            marketsToResolve.push(position.market);
        } catch (e) {
            console.log(`Can't fetch VAA from Pyth API for marekt ${position.market}`, e);
        }
    }

    if (marketsToResolve.length > 0) {
        try {
            let hash;
            if (isBiconomy && collateralAddress) {
                hash = isAdmin
                    ? await executeBiconomyTransaction(
                          queryConfig.networkId,
                          collateralAddress,
                          speedMarketsAMMResolverContractWithSigner,
                          'resolveChainedMarketManuallyBatch',
                          [marketsToResolve, manualFinalPrices]
                      )
                    : await executeBiconomyTransaction(
                          queryConfig.networkId,
                          collateralAddress,
                          speedMarketsAMMResolverContractWithSigner,
                          'resolveChainedMarketsBatch',
                          [marketsToResolve, priceUpdateDataArray]
                      );
            } else {
                hash = isAdmin
                    ? await speedMarketsAMMResolverContractWithSigner.write.resolveChainedMarketManuallyBatch([
                          marketsToResolve,
                          manualFinalPrices,
                      ])
                    : await speedMarketsAMMResolverContractWithSigner.write.resolveChainedMarketsBatch(
                          [marketsToResolve, priceUpdateDataArray],
                          { value: totalUpdateFee }
                      );
            }

            const txReceipt = await waitForTransactionReceipt(queryConfig.client as Client, { hash });

            if (txReceipt.status === 'success') {
                toast.update(
                    id,
                    getSuccessToastOptions(
                        isOverview
                            ? i18n.t('speed-markets.overview.confirmation-message')
                            : i18n.t('speed-markets.user-positions.confirmation-message'),
                        id
                    )
                );
                await delay(2000);

                const walletAddress = isBiconomy
                    ? biconomyConnector.address
                    : (queryConfig.client as Client)?.account?.address;
                if (walletAddress) {
                    refetchUserSpeedMarkets(true, queryConfig.networkId, walletAddress);
                    refetchBalances(walletAddress, queryConfig.networkId);
                }
                refetchActiveSpeedMarkets(true, queryConfig.networkId);
            } else {
                console.log('Transaction status', txReceipt.status);
                await delay(800);
                toast.update(id, getErrorToastOptions(i18n.t('common.errors.unknown-error-try-again'), id));
            }
        } catch (e) {
            console.log(e);
            await delay(800);
            toast.update(id, getErrorToastOptions(i18n.t('common.errors.unknown-error-try-again'), id));
        }
    } else {
        toast.update(id, getInfoToastOptions(i18n.t('speed-markets.overview.no-resolve-positions'), id));
    }
};
