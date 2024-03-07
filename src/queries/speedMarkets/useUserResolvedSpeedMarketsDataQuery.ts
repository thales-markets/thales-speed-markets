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
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { NetworkId, bigNumberFormatter, coinFormatter, formatCurrencyWithSign, parseBytes32String } from 'thales-utils';
import { UserClosedPositions } from 'types/market';
import snxJSConnector from 'utils/snxJSConnector';
import { getFeesFromHistory } from 'utils/speedAmm';

const useUserResolvedSpeedMarketsDataQuery = (
    networkId: NetworkId,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserClosedPositions[]>({
        queryKey: QUERY_KEYS.User.ResolvedSpeedMarkets(networkId, walletAddress),
        queryFn: async () => {
            const userClosedSpeedMarketsData: UserClosedPositions[] = [];
            const { speedMarketsAMMContract, speedMarketsDataContract } = snxJSConnector;

            if (speedMarketsAMMContract && speedMarketsDataContract) {
                const ammParams = await speedMarketsDataContract.read.getSpeedMarketsAMMParameters([walletAddress]);

                const pageSize = Math.min(ammParams.numMaturedMarketsPerUser, MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH);
                const index = Number(ammParams.numMaturedMarketsPerUser) - pageSize;
                const maturedMarkets: [] = await speedMarketsAMMContract.read.maturedMarketsPerUser([
                    index,
                    pageSize,
                    walletAddress,
                ]);

                const promises = [];
                for (let i = 0; i < Math.ceil(maturedMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = maturedMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                    promises.push(speedMarketsDataContract.read.getMarketsData([batchMarkets]));
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
                    const payout = coinFormatter(marketData.buyinAmount, networkId) * SPEED_MARKETS_QUOTE;
                    const maturityDate = secondsToMilliseconds(Number(marketData.strikeTime));

                    const createdAt = !marketData.createdAt.isZero()
                        ? secondsToMilliseconds(Number(marketData.createdAt))
                        : maturityDate - hoursToMilliseconds(1);
                    const lpFee = !marketData.lpFee.isZero()
                        ? bigNumberFormatter(marketData.lpFee)
                        : getFeesFromHistory(createdAt).lpFee;
                    const safeBoxImpact = !marketData.safeBoxImpact.isZero()
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
                        paid: coinFormatter(marketData.buyinAmount, networkId) * (1 + fees),
                        value: payout,
                        finalPrice: bigNumberFormatter(marketData.finalPrice, PYTH_CURRENCY_DECIMALS),
                        isUserWinner: marketData.isUserWinner,
                    };

                    userClosedSpeedMarketsData.push(userData);
                }
            }

            return userClosedSpeedMarketsData;
        },
        ...options,
    });
};

export default useUserResolvedSpeedMarketsDataQuery;
