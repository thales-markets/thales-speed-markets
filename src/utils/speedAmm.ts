import * as pythEvmJs from '@pythnetwork/pyth-evm-js';
import PythInterfaceAbi from '@pythnetwork/pyth-sdk-solidity/abis/IPyth.json';
import {
    getDefaultToastContent,
    getErrorToastOptions,
    getInfoToastOptions,
    getLoadingToastOptions,
    getSuccessToastOptions,
} from 'components/ToastMessage/ToastMessage';
import { ZERO_ADDRESS } from 'constants/network';
import { CONNECTION_TIMEOUT_MS, PYTH_CONTRACT_ADDRESS } from 'constants/pyth';
import { millisecondsToSeconds, secondsToMinutes } from 'date-fns';
import { Positions } from 'enums/market';
import i18n from 'i18n';
import { toast } from 'react-toastify';
import { ChainedSpeedMarket, UserOpenPositions } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getPriceId, getPriceServiceEndpoint, priceParser } from 'utils/pyth';
import { refetchActiveSpeedMarkets } from 'utils/queryConnector';
import { delay } from 'utils/timer';
import { getContract } from 'viem';
import { getContarctAbi } from './contracts/abi';
import chainedSpeedMarketsAMMContract from './contracts/chainedSpeedMarketsAMMContract';
import speedMarketsAMMContract from './contracts/speedMarketsAMMContract';

export const getTransactionForSpeedAMM = async (
    speedMarketsAMMContractWithSigner: any, // speed or chained
    isNonDefaultCollateral: boolean,
    asset: string,
    deltaTimeSec: number,
    strikeTimeSec: number,
    sides: number[],
    buyInAmount: bigint,
    pythPriceUpdateData: string[],
    pythUpdateFee: any,
    collateralAddress: string,
    referral: string | null,
    skewImpact?: bigint
) => {
    let tx;
    const isEth = collateralAddress === ZERO_ADDRESS;
    const isChained = sides.length > 1;

    if (isNonDefaultCollateral) {
        if (isChained) {
            tx = await speedMarketsAMMContractWithSigner.write.createNewMarketWithDifferentCollateral(
                [
                    asset,
                    deltaTimeSec,
                    sides,
                    pythPriceUpdateData,
                    collateralAddress,
                    buyInAmount,
                    isEth,
                    referral ? referral : ZERO_ADDRESS,
                ],
                { value: isEth ? buyInAmount + pythUpdateFee : pythUpdateFee }
            );
        } else {
            tx = await speedMarketsAMMContractWithSigner.write.createNewMarketWithDifferentCollateral(
                [
                    asset,
                    strikeTimeSec,
                    deltaTimeSec,
                    sides[0],
                    pythPriceUpdateData,
                    collateralAddress,
                    buyInAmount,
                    isEth,
                    referral ? referral : ZERO_ADDRESS,
                    skewImpact,
                ],
                { value: isEth ? buyInAmount + pythUpdateFee : pythUpdateFee }
            );
        }
    } else {
        if (isChained) {
            tx = await speedMarketsAMMContractWithSigner.write.createNewMarket(
                [asset, deltaTimeSec, sides, buyInAmount, pythPriceUpdateData, referral ? referral : ZERO_ADDRESS],
                { value: pythUpdateFee }
            );
        } else {
            tx = await speedMarketsAMMContractWithSigner.write.createNewMarket(
                [
                    asset,
                    strikeTimeSec,
                    deltaTimeSec,
                    sides[0],
                    buyInAmount,
                    pythPriceUpdateData,
                    referral ? referral : ZERO_ADDRESS,
                    skewImpact,
                ],
                { value: pythUpdateFee }
            );
        }
    }

    return tx;
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

export const getUserLostAtSideIndex = (position: ChainedSpeedMarket) => {
    const userLostIndex = position.finalPrices.findIndex(
        (finalPrice, i) =>
            finalPrice > 0 &&
            position.strikePrices[i] > 0 &&
            ((position.sides[i] === Positions.UP && finalPrice <= position.strikePrices[i]) ||
                (position.sides[i] === Positions.DOWN && finalPrice >= position.strikePrices[i]))
    );
    return userLostIndex > -1 ? userLostIndex : position.sides.length - 1;
};

export const resolveAllSpeedPositions = async (
    positions: UserOpenPositions[],
    isAdmin: boolean,
    queryConfig: QueryConfig
) => {
    if (!positions.length) {
        return;
    }

    const priceConnection = new pythEvmJs.EvmPriceServiceConnection(getPriceServiceEndpoint(queryConfig.networkId), {
        timeout: CONNECTION_TIMEOUT_MS,
    });

    const id = toast.loading(getDefaultToastContent(i18n.t('common.progress')), getLoadingToastOptions());

    const speedMarketsAMMContractWithSigner = getContract({
        abi: getContarctAbi(speedMarketsAMMContract, queryConfig.networkId),
        address: speedMarketsAMMContract.addresses[queryConfig.networkId],
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

            const [priceFeedUpdateVaa] = await priceConnection.getVaa(
                getPriceId(queryConfig.networkId, position.currencyKey),
                millisecondsToSeconds(position.maturityDate)
            );

            const priceUpdateData = ['0x' + Buffer.from(priceFeedUpdateVaa, 'base64').toString('hex')];
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
            const tx = isAdmin
                ? await speedMarketsAMMContractWithSigner.write.resolveMarketManuallyBatch([
                      marketsToResolve,
                      manualFinalPrices,
                  ])
                : await speedMarketsAMMContractWithSigner.write.resolveMarketsBatch(
                      [marketsToResolve, priceUpdateDataArray],
                      {
                          value: totalUpdateFee,
                      }
                  );

            if (tx) {
                toast.update(id, getSuccessToastOptions(i18n.t(`speed-markets.overview.confirmation-message`), id));
                await delay(5000);
                refetchActiveSpeedMarkets(false, queryConfig.networkId);
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
    positions: ChainedSpeedMarket[],
    isAdmin: boolean,
    queryConfig: QueryConfig
) => {
    if (!positions.length) {
        return;
    }

    const priceConnection = new pythEvmJs.EvmPriceServiceConnection(getPriceServiceEndpoint(queryConfig.networkId), {
        timeout: CONNECTION_TIMEOUT_MS,
    });

    const id = toast.loading(getDefaultToastContent(i18n.t('common.progress')), getLoadingToastOptions());

    const chainedSpeedMarketsAMMContractWithSigner = getContract({
        abi: chainedSpeedMarketsAMMContract.abi,
        address: chainedSpeedMarketsAMMContract.addresses[queryConfig.networkId],
        client: queryConfig.client,
    }) as ViemContract;

    const marketsToResolve: string[] = isAdmin
        ? positions.filter((position) => position.canResolve).map((position) => position.address)
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
                promises.push(priceConnection.getVaa(pythPriceId, millisecondsToSeconds(position.strikeTimes[i])));
            }
            const priceFeedUpdateVaas = await Promise.all(promises);

            promises = [];
            const priceUpdateDataPerMarket: string[][] = [];
            for (let i = 0; i < strikeTimesToFetchPrice.length; i++) {
                const [priceFeedUpdateVaa] = priceFeedUpdateVaas[i];
                const priceUpdateData = ['0x' + Buffer.from(priceFeedUpdateVaa, 'base64').toString('hex')];
                priceUpdateDataPerMarket.push(priceUpdateData);
                promises.push(pythContract.read.getUpdateFee([priceUpdateData]));
            }
            priceUpdateDataArray.push(priceUpdateDataPerMarket);

            const updateFees = await Promise.all(promises);
            totalUpdateFee = totalUpdateFee + updateFees.reduce((a: bigint, b: bigint) => a + b, BigInt(0));
            marketsToResolve.push(position.address);
        } catch (e) {
            console.log(`Can't fetch VAA from Pyth API for marekt ${position.address}`, e);
        }
    }

    if (marketsToResolve.length > 0) {
        try {
            const tx = isAdmin
                ? await chainedSpeedMarketsAMMContractWithSigner.write.resolveMarketManuallyBatch([
                      marketsToResolve,
                      manualFinalPrices,
                  ])
                : await chainedSpeedMarketsAMMContractWithSigner.write.resolveMarketsBatch(
                      [marketsToResolve, priceUpdateDataArray],
                      { value: totalUpdateFee }
                  );

            if (tx) {
                toast.update(id, getSuccessToastOptions(i18n.t(`speed-markets.overview.confirmation-message`), id));
                await delay(5000);
                refetchActiveSpeedMarkets(true, queryConfig.networkId);
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
