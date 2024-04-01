import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { USD_SIGN } from 'constants/currency';
import {
    BATCH_NUMBER_OF_SPEED_MARKETS,
    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH,
    MIN_MATURITY,
    SIDE_TO_POSITION_MAP,
    SPEED_MARKETS_QUOTE,
} from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { bigNumberFormatter, coinFormatter, formatCurrencyWithSign, parseBytes32String } from 'thales-utils';
import { UserClosedPositions } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContarctAbi } from 'utils/contracts/abi';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getFeesFromHistory } from 'utils/speedAmm';
import { getContract } from 'viem';

const useUserResolvedSpeedMarketsDataQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserClosedPositions[]>({
        queryKey: QUERY_KEYS.User.ResolvedSpeedMarkets(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const userClosedSpeedMarketsData: UserClosedPositions[] = [];

            try {
                const speedMarketsAMMContractLocal = getContract({
                    abi: getContarctAbi(speedMarketsAMMContract, queryConfig.networkId),
                    address: speedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const speedMarketsDataContractLocal = getContract({
                    abi: getContarctAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const ammParams = await speedMarketsDataContractLocal.read.getSpeedMarketsAMMParameters([
                    walletAddress,
                ]);

                const pageSize = Math.min(
                    Number(ammParams.numMaturedMarketsPerUser),
                    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH
                );
                const index = Number(ammParams.numMaturedMarketsPerUser) - pageSize;
                const maturedMarkets: [] = await speedMarketsAMMContractLocal.read.maturedMarketsPerUser([
                    index,
                    pageSize,
                    walletAddress,
                ]);

                const promises = [];
                for (let i = 0; i < Math.ceil(maturedMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = maturedMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                    promises.push(speedMarketsDataContractLocal.read.getMarketsData([batchMarkets]));
                }
                const marketsDataArray = await Promise.all(promises);

                const userResolvedMarkets = marketsDataArray
                    .flat()
                    .map((marketData: any, index: number) => ({
                        ...marketData,
                        market: maturedMarkets[index],
                    }))
                    .filter((marketData: any) => Number(marketData.strikeTime) > MIN_MATURITY);

                for (let i = 0; i < userResolvedMarkets.length; i++) {
                    const marketData = userResolvedMarkets[i];
                    const side = SIDE_TO_POSITION_MAP[marketData.direction];
                    const payout = coinFormatter(marketData.buyinAmount, queryConfig.networkId) * SPEED_MARKETS_QUOTE;
                    const maturityDate = secondsToMilliseconds(Number(marketData.strikeTime));

                    const createdAt =
                        marketData.createdAt != 0
                            ? secondsToMilliseconds(Number(marketData.createdAt))
                            : maturityDate - hoursToMilliseconds(1);
                    const lpFee =
                        marketData.lpFee != 0
                            ? bigNumberFormatter(marketData.lpFee)
                            : getFeesFromHistory(createdAt).lpFee;
                    const safeBoxImpact =
                        marketData.safeBoxImpact != 0
                            ? bigNumberFormatter(marketData.safeBoxImpact)
                            : getFeesFromHistory(createdAt).safeBoxImpact;
                    const fees = lpFee + safeBoxImpact;

                    const userData: UserClosedPositions = {
                        currencyKey: parseBytes32String(marketData.asset),
                        strikePrice: formatCurrencyWithSign(
                            USD_SIGN,
                            bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS)
                        ),
                        strikePriceNum: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        payout,
                        maturityDate,
                        market: marketData.market,
                        side,
                        paid: coinFormatter(marketData.buyinAmount, queryConfig.networkId) * (1 + fees),
                        value: payout,
                        finalPrice: bigNumberFormatter(marketData.finalPrice, PYTH_CURRENCY_DECIMALS),
                        isUserWinner: marketData.isUserWinner,
                    };

                    userClosedSpeedMarketsData.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return userClosedSpeedMarketsData;
        },
        ...options,
    });
};

export default useUserResolvedSpeedMarketsDataQuery;
