import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import {
    BATCH_NUMBER_OF_SPEED_MARKETS,
    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH,
    MIN_MATURITY,
    SIDE_TO_POSITION_MAP,
} from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import { bigNumberFormatter, coinFormatter, parseBytes32String, roundNumberToDecimals } from 'thales-utils';
import { SpeedMarket } from 'types/market';
import { QueryConfig } from 'types/network';
import { TradeWithMarket } from 'types/profile';
import { ViemContract } from 'types/viem';
import { getContarctAbi } from 'utils/contracts/abi';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getContract } from 'viem';

const useUserChainedSpeedMarketsTransactionsQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<TradeWithMarket[]>({
        queryKey: QUERY_KEYS.User.ChainedSpeedMarketsTransactions(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const userTransactions: TradeWithMarket[] = [];

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
                const [activeMarkets, maturedMarkets] = await Promise.all([
                    chainedMarketsAMMContract.read.activeMarketsPerUser([
                        0,
                        ammParams.numActiveMarketsPerUser,
                        walletAddress,
                    ]),
                    chainedMarketsAMMContract.read.maturedMarketsPerUser([index, pageSize, walletAddress]),
                ]);
                const allMarkets: any[] = activeMarkets.concat(maturedMarkets);

                const promises = [];
                for (let i = 0; i < Math.ceil(allMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = allMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                    promises.push(speedMarketsDataContractLocal.read.getChainedMarketsData([batchMarkets]));
                }
                const allMarketsDataArray = await Promise.all(promises);

                const filteredMarketsData = allMarketsDataArray
                    .flat()
                    .map((marketData: any, index: number) => ({
                        ...marketData,
                        market: allMarkets[index],
                    }))
                    .filter((marketData: any) => Number(marketData.strikeTime) > MIN_MATURITY);

                for (let i = 0; i < filteredMarketsData.length; i++) {
                    const marketData = filteredMarketsData[i];

                    const maturityDate = secondsToMilliseconds(Number(marketData.strikeTime));
                    const sides: Positions[] = marketData.directions.map(
                        (direction: number) => SIDE_TO_POSITION_MAP[direction]
                    );
                    const buyinAmount = coinFormatter(marketData.buyinAmount, queryConfig.networkId);
                    const payout = roundNumberToDecimals(
                        buyinAmount * bigNumberFormatter(marketData.payoutMultiplier) ** sides.length,
                        8
                    );
                    const createdAt = secondsToMilliseconds(Number(marketData.createdAt));
                    const safeBoxImpact = bigNumberFormatter(marketData.safeBoxImpact);

                    const strikePrice = marketData.resolved
                        ? bigNumberFormatter(
                              marketData.strikePrices[marketData.strikePrices.length - 1],
                              PYTH_CURRENCY_DECIMALS
                          )
                        : bigNumberFormatter(marketData.initialStrikePrice, PYTH_CURRENCY_DECIMALS);
                    const finalPrice = marketData.resolved
                        ? bigNumberFormatter(
                              marketData.finalPrices[marketData.finalPrices.length - 1],
                              PYTH_CURRENCY_DECIMALS
                          )
                        : 0;

                    const userData: TradeWithMarket = {
                        user: walletAddress,
                        payout,
                        paid: buyinAmount * (1 + safeBoxImpact),
                        sides,
                        marketItem: {
                            address: marketData.market,
                            timestamp: createdAt,
                            currencyKey: parseBytes32String(marketData.asset),
                            strikePrice,
                            maturityDate,
                            isOpen: !marketData.resolved,
                            result: null,
                            finalPrice,
                            isChained: true,
                        } as SpeedMarket,
                    };

                    userTransactions.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return userTransactions;
        },
        ...options,
    });
};

export default useUserChainedSpeedMarketsTransactionsQuery;
