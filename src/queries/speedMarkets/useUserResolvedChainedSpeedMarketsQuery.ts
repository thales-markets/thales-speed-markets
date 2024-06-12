import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import {
    BATCH_NUMBER_OF_SPEED_MARKETS,
    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH,
    MIN_MATURITY,
    SIDE_TO_POSITION_MAP,
} from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import { bigNumberFormatter, coinFormatter, parseBytes32String, roundNumberToDecimals } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContarctAbi } from 'utils/contracts/abi';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getContract } from 'viem';

const useUserResolvedChainedSpeedMarketsQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserChainedPosition[]>({
        queryKey: QUERY_KEYS.User.ResolvedChainedSpeedMarkets(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const userTransactions: UserChainedPosition[] = [];

            try {
                const speedMarketsDataContractLocal = getContract({
                    abi: getContarctAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const chainedMarketsAMMContract = getContract({
                    abi: chainedSpeedMarketsAMMContract.abi,
                    address: chainedSpeedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const ammParams = await speedMarketsDataContractLocal.read.getChainedSpeedMarketsAMMParameters([
                    walletAddress,
                ]);

                const pageSize = Math.min(
                    Number(ammParams.numMaturedMarketsPerUser),
                    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH
                );
                const index = Number(ammParams.numMaturedMarketsPerUser) - pageSize;
                const resolvedMarkets = await chainedMarketsAMMContract.read.maturedMarketsPerUser([
                    index,
                    pageSize,
                    walletAddress,
                ]);

                const promises = [];
                for (let i = 0; i < Math.ceil(resolvedMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = resolvedMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                    promises.push(speedMarketsDataContractLocal.read.getChainedMarketsData([batchMarkets]));
                }
                const allResolvedMarketsDataArray = await Promise.all(promises);

                const filteredMarketsData = allResolvedMarketsDataArray
                    .flat()
                    .map((marketData: any, index: number) => ({
                        ...marketData,
                        market: resolvedMarkets[index],
                    }))
                    .filter((marketData: any) => Number(marketData.strikeTime) > MIN_MATURITY);

                for (let i = 0; i < filteredMarketsData.length; i++) {
                    const marketData = filteredMarketsData[i];

                    const currencyKey = parseBytes32String(marketData.asset);

                    const sides: Positions[] = marketData.directions.map(
                        (direction: number) => SIDE_TO_POSITION_MAP[direction]
                    );
                    const buyinAmount = coinFormatter(marketData.buyinAmount, queryConfig.networkId);
                    const payout = roundNumberToDecimals(
                        buyinAmount * bigNumberFormatter(marketData.payoutMultiplier) ** sides.length,
                        8
                    );

                    const strikeTimes = Array(sides.length)
                        .fill(0)
                        .map((_, i) =>
                            secondsToMilliseconds(
                                Number(marketData.initialStrikeTime) + i * Number(marketData.timeFrame)
                            )
                        );
                    const strikePrices = marketData.strikePrices.map((strikePrice: bigint) =>
                        bigNumberFormatter(strikePrice, PYTH_CURRENCY_DECIMALS)
                    );
                    const finalPrices: number[] = marketData.finalPrices.map((finalPrice: bigint) =>
                        bigNumberFormatter(finalPrice, PYTH_CURRENCY_DECIMALS)
                    );

                    const fee = bigNumberFormatter(marketData.safeBoxImpact);
                    const createdAt =
                        marketData.createdAt != 0
                            ? secondsToMilliseconds(Number(marketData.createdAt))
                            : secondsToMilliseconds(Number(marketData.strikeTime)) - hoursToMilliseconds(1);

                    const chainedData: UserChainedPosition = {
                        user: marketData.user,
                        market: marketData.market,
                        currencyKey,
                        sides,
                        strikePrices,
                        strikeTimes,
                        maturityDate: secondsToMilliseconds(Number(marketData.strikeTime)),
                        paid: buyinAmount * (1 + fee),
                        payout: payout,
                        payoutMultiplier: bigNumberFormatter(marketData.payoutMultiplier),
                        currentPrice: 0,
                        finalPrices,
                        canResolve: false,
                        resolveIndex: finalPrices.length - 1,
                        isMatured: true,
                        isClaimable: false,
                        isUserWinner: marketData.isUserWinner,
                        isResolved: true,
                        createdAt,
                    };

                    userTransactions.push(chainedData);
                }
            } catch (e) {
                console.log(e);
            }

            return userTransactions;
        },
        ...options,
    });
};

export default useUserResolvedChainedSpeedMarketsQuery;
