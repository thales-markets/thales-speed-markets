import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import {
    BATCH_NUMBER_OF_SPEED_MARKETS,
    MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH,
    MIN_MATURITY,
    SIDE_TO_POSITION_MAP,
} from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { UserPosition } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getCollateralByAddress } from 'utils/currency';
import { getFeesFromHistory } from 'utils/speedAmm';
import { getContract } from 'viem';

const useUserResolvedSpeedMarketsQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserPosition[]>({
        queryKey: QUERY_KEYS.User.ResolvedSpeedMarkets(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const userResolvedPositions: UserPosition[] = [];

            try {
                const speedMarketsAMMContractLocal = getContract({
                    abi: getContractAbi(speedMarketsAMMContract, queryConfig.networkId),
                    address: speedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const speedMarketsDataContractLocal = getContract({
                    abi: getContractAbi(speedMarketsDataContract, queryConfig.networkId),
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
                const resolvedMarkets = await speedMarketsAMMContractLocal.read.maturedMarketsPerUser([
                    index,
                    pageSize,
                    walletAddress,
                ]);

                const promises = [];
                for (let i = 0; i < Math.ceil(resolvedMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = resolvedMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                    promises.push(speedMarketsDataContractLocal.read.getMarketsData([batchMarkets]));
                }
                const resolvedMarketsDataArray = await Promise.all(promises);

                const filteredMarketsData = resolvedMarketsDataArray
                    .flat()
                    .map((marketData: any, index: number) => ({
                        ...marketData,
                        market: resolvedMarkets[index],
                    }))
                    .filter((marketData: any) => Number(marketData.strikeTime) > MIN_MATURITY);

                for (let i = 0; i < filteredMarketsData.length; i++) {
                    const marketData = filteredMarketsData[i];

                    const createdAt =
                        marketData.createdAt != 0
                            ? secondsToMilliseconds(Number(marketData.createdAt))
                            : secondsToMilliseconds(Number(marketData.strikeTime)) - hoursToMilliseconds(1);

                    const lpFee =
                        marketData.lpFee != 0
                            ? bigNumberFormatter(marketData.lpFee)
                            : getFeesFromHistory(createdAt).lpFee;
                    const safeBoxImpact =
                        marketData.safeBoxImpact != 0
                            ? bigNumberFormatter(marketData.safeBoxImpact)
                            : getFeesFromHistory(createdAt).safeBoxImpact;
                    const fees = lpFee + safeBoxImpact;

                    const collateral = getCollateralByAddress(marketData.collateral, queryConfig.networkId);
                    const marketBuyinAmount = coinFormatter(marketData.buyinAmount, queryConfig.networkId, collateral);

                    const paid = marketBuyinAmount * (1 + fees);
                    const payout = coinFormatter(marketData.payout, queryConfig.networkId, collateral);

                    const userData: UserPosition = {
                        user: marketData.user,
                        market: marketData.market,
                        currencyKey: parseBytes32String(marketData.asset),
                        side: SIDE_TO_POSITION_MAP[marketData.direction],
                        strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        maturityDate: secondsToMilliseconds(Number(marketData.strikeTime)),
                        paid,
                        payout,
                        collateralAddress: marketData.collateral,
                        isDefaultCollateral: marketData.isDefaultCollateral,
                        currentPrice: 0,
                        finalPrice: bigNumberFormatter(marketData.finalPrice, PYTH_CURRENCY_DECIMALS),
                        isClaimable: false,
                        isResolved: true,
                        createdAt,
                    };

                    userResolvedPositions.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return userResolvedPositions;
        },
        ...options,
    });
};

export default useUserResolvedSpeedMarketsQuery;
