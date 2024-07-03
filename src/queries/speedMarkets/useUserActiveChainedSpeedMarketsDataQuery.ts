import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SIDE_TO_POSITION_MAP } from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { bigNumberFormatter, coinFormatter, parseBytes32String, roundNumberToDecimals } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getContract } from 'viem';

const useUserActiveChainedSpeedMarketsDataQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserChainedPosition[]>({
        queryKey: QUERY_KEYS.User.ChainedSpeedMarkets(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const userChainedSpeedMarketsData: UserChainedPosition[] = [];

            try {
                const speedMarketsDataContractLocal = getContract({
                    abi: getContractAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const chainedMarketsAMMContract = getContract({
                    abi: getContractAbi(chainedSpeedMarketsAMMContract, queryConfig.networkId),
                    address: chainedSpeedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const ammParams = await speedMarketsDataContractLocal.read.getChainedSpeedMarketsAMMParameters([
                    walletAddress,
                ]);

                const activeMarkets = await chainedMarketsAMMContract.read.activeMarketsPerUser([
                    0,
                    ammParams.numActiveMarketsPerUser,
                    walletAddress,
                ]);
                const marketsDataArray = await speedMarketsDataContractLocal.read.getChainedMarketsData([
                    activeMarkets,
                ]);
                const userActiveMarkets = marketsDataArray.map((marketData: any, index: number) => ({
                    ...marketData,
                    market: activeMarkets[index],
                }));

                for (let i = 0; i < userActiveMarkets.length; i++) {
                    const marketData = userActiveMarkets[i];

                    const sides = marketData.directions.map((direction: number) => SIDE_TO_POSITION_MAP[direction]);
                    const maturityDate = secondsToMilliseconds(Number(marketData.strikeTime));
                    const strikeTimes = Array(sides.length)
                        .fill(0)
                        .map((_, i) =>
                            secondsToMilliseconds(
                                Number(marketData.initialStrikeTime) + i * Number(marketData.timeFrame)
                            )
                        );
                    const strikePrices = Array(sides.length).fill(0);
                    strikePrices[0] = bigNumberFormatter(marketData.initialStrikePrice, PYTH_CURRENCY_DECIMALS);
                    const buyinAmount = coinFormatter(marketData.buyinAmount, queryConfig.networkId);
                    const fee = bigNumberFormatter(marketData.safeBoxImpact);
                    const payout = roundNumberToDecimals(
                        buyinAmount * bigNumberFormatter(marketData.payoutMultiplier) ** sides.length,
                        8
                    );

                    const userData: UserChainedPosition = {
                        user: marketData.user,
                        market: marketData.market,
                        currencyKey: parseBytes32String(marketData.asset),
                        sides,
                        strikePrices,
                        strikeTimes,
                        maturityDate,
                        paid: buyinAmount * (1 + fee),
                        payout: payout,
                        payoutMultiplier: bigNumberFormatter(marketData.payoutMultiplier),
                        currentPrice: 0,
                        finalPrices: Array(sides.length).fill(0),
                        canResolve: false,
                        isMatured: maturityDate < Date.now(),
                        isClaimable: false,
                        isUserWinner: false,
                        isResolved: false,
                        createdAt: secondsToMilliseconds(Number(marketData.createdAt)),
                    };

                    userChainedSpeedMarketsData.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return userChainedSpeedMarketsData;
        },
        ...options,
    });
};

export default useUserActiveChainedSpeedMarketsDataQuery;
