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
import { NetworkId, bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { TradeWithMarket } from 'types/profile';
import snxJSConnector from 'utils/snxJSConnector';
import { getFeesFromHistory } from 'utils/speedAmm';

const useUserSpeedMarketsTransactionsQuery = (
    networkId: NetworkId,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<TradeWithMarket[]>({
        queryKey: QUERY_KEYS.User.SpeedMarketsTransactions(networkId, walletAddress),
        queryFn: async () => {
            const userTransactions: TradeWithMarket[] = [];

            const { speedMarketsAMMContract, speedMarketsDataContract } = snxJSConnector;

            if (speedMarketsAMMContract && speedMarketsDataContract) {
                const ammParams = await speedMarketsDataContract.read.getSpeedMarketsAMMParameters([walletAddress]);

                const pageSize = Math.min(ammParams.numMaturedMarketsPerUser, MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH);
                const index = Number(ammParams.numMaturedMarketsPerUser) - pageSize;
                const [activeMarkets, maturedMarkets] = await Promise.all([
                    speedMarketsAMMContract.read.activeMarketsPerUser(
                        0,
                        ammParams.numActiveMarketsPerUser,
                        walletAddress
                    ),
                    speedMarketsAMMContract.read.maturedMarketsPerUser([index, pageSize, walletAddress]),
                ]);
                const allMarkets: any[] = activeMarkets.concat(maturedMarkets);

                const promises = [];
                for (let i = 0; i < Math.ceil(allMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = allMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                    promises.push(speedMarketsDataContract.read.getMarketsData([batchMarkets]));
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
                    const sides = [SIDE_TO_POSITION_MAP[marketData.direction]];
                    const payout = coinFormatter(marketData.buyinAmount, networkId) * SPEED_MARKETS_QUOTE;

                    const createdAt = !marketData.createdAt.isZero()
                        ? secondsToMilliseconds(Number(marketData.createdAt))
                        : secondsToMilliseconds(Number(marketData.strikeTime)) - hoursToMilliseconds(1);
                    const lpFee = !marketData.lpFee.isZero()
                        ? bigNumberFormatter(marketData.lpFee)
                        : getFeesFromHistory(createdAt).lpFee;
                    const safeBoxImpact = !marketData.safeBoxImpact.isZero()
                        ? bigNumberFormatter(marketData.safeBoxImpact)
                        : getFeesFromHistory(createdAt).safeBoxImpact;
                    const fees = lpFee + safeBoxImpact;

                    const userData: TradeWithMarket = {
                        user: walletAddress,
                        payout,
                        paid: coinFormatter(marketData.buyinAmount, networkId) * (1 + fees),
                        sides,
                        marketItem: {
                            address: marketData.market,
                            timestamp: createdAt,
                            currencyKey: parseBytes32String(marketData.asset),
                            strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                            maturityDate: secondsToMilliseconds(Number(marketData.strikeTime)),
                            isOpen: !marketData.resolved,
                            isChained: false,
                            finalPrice: bigNumberFormatter(marketData.finalPrice, PYTH_CURRENCY_DECIMALS),
                        },
                    };

                    userTransactions.push(userData);
                }
            }

            return userTransactions;
        },
        ...options,
    });
};

export default useUserSpeedMarketsTransactionsQuery;
