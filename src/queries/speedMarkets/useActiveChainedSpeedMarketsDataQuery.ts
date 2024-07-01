import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SIDE_TO_POSITION_MAP } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CURRENCY_DECIMALS, SUPPORTED_ASSETS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { bigNumberFormatter, coinFormatter, parseBytes32String, roundNumberToDecimals } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getCurrentPrices, getPriceConnection, getPriceId } from 'utils/pyth';
import { getContract } from 'viem';

const useActiveChainedSpeedMarketsDataQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserChainedPosition[]>({
        ...options,
        queryKey: QUERY_KEYS.Markets.ActiveChainedSpeedMarkets(queryConfig.networkId),
        queryFn: async () => {
            const chainedSpeedMarketsData: UserChainedPosition[] = [];

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
                    ZERO_ADDRESS,
                ]);

                const activeMarketsAddresses = await chainedMarketsAMMContract.read.activeMarkets([
                    0,
                    ammParams.numActiveMarkets,
                ]);
                const marketsDataArray = await speedMarketsDataContractLocal.read.getChainedMarketsData([
                    activeMarketsAddresses,
                ]);
                const activeMarkets = marketsDataArray.map((marketData: any, index: number) => ({
                    ...marketData,
                    market: activeMarketsAddresses[index],
                }));

                // Fetch current prices
                let prices: { [key: string]: number } = {};
                if (activeMarkets.length) {
                    const priceConnection = getPriceConnection(queryConfig.networkId);
                    const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(queryConfig.networkId, asset));
                    prices = await getCurrentPrices(priceConnection, queryConfig.networkId, priceIds);
                }

                for (let i = 0; i < activeMarkets.length; i++) {
                    const marketData = activeMarkets[i];

                    const currencyKey = parseBytes32String(marketData.asset);
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

                    const chainedData: UserChainedPosition = {
                        user: marketData.user,
                        market: marketData.market,
                        currencyKey,
                        sides,
                        strikePrices,
                        strikeTimes,
                        maturityDate,
                        paid: buyinAmount * (1 + fee),
                        payout: payout,
                        payoutMultiplier: bigNumberFormatter(marketData.payoutMultiplier),
                        currentPrice: prices[currencyKey],
                        finalPrices: Array(sides.length).fill(0),
                        canResolve: false,
                        isMatured: maturityDate < Date.now(),
                        isClaimable: false,
                        isUserWinner: false,
                        isResolved: false,
                        createdAt: secondsToMilliseconds(Number(marketData.createdAt)),
                    };

                    chainedSpeedMarketsData.push(chainedData);
                }
            } catch (e) {
                console.log(e);
            }

            return chainedSpeedMarketsData;
        },
    });
};

export default useActiveChainedSpeedMarketsDataQuery;
