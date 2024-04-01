import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { USD_SIGN } from 'constants/currency';
import { SIDE_TO_POSITION_MAP, SPEED_MARKETS_QUOTE } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { CONNECTION_TIMEOUT_MS, PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/market';
import { reject } from 'lodash';
import { bigNumberFormatter, coinFormatter, formatCurrencyWithSign, parseBytes32String } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContarctAbi } from 'utils/contracts/abi';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getBenchmarksPriceFeeds, getPriceId, getPriceServiceEndpoint } from 'utils/pyth';
import { getFeesFromHistory } from 'utils/speedAmm';
import { getContract } from 'viem';

const useUserActiveSpeedMarketsDataQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserOpenPositions[]>({
        queryKey: QUERY_KEYS.User.SpeedMarkets(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const userSpeedMarketsData: UserOpenPositions[] = [];

            try {
                const speedMarketsDataContractLocal = getContract({
                    abi: getContarctAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const speedMarketsAMMContractLocal = getContract({
                    abi: getContarctAbi(speedMarketsAMMContract, queryConfig.networkId),
                    address: speedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const priceConnection = new EvmPriceServiceConnection(getPriceServiceEndpoint(queryConfig.networkId), {
                    timeout: CONNECTION_TIMEOUT_MS,
                });

                const ammParams = await speedMarketsDataContractLocal.read.getSpeedMarketsAMMParameters([
                    walletAddress,
                ]);

                const activeMarkets = await speedMarketsAMMContractLocal.read.activeMarketsPerUser([
                    0,
                    ammParams.numActiveMarketsPerUser,
                    walletAddress,
                ]);
                const marketsDataArray = activeMarkets.length
                    ? await speedMarketsDataContractLocal.read.getMarketsData([activeMarkets])
                    : [];
                const userActiveMarkets = marketsDataArray.map((marketData: any, index: number) => ({
                    ...marketData,
                    market: activeMarkets[index],
                }));

                const unavailablePrices: { priceId: string; publishTime: number }[] = [];

                // Fetch prices for all active matured markets, but not resolved (not in matured on contract)
                const pricePromises = userActiveMarkets.map((market: any) => {
                    const isMarketMatured = secondsToMilliseconds(Number(market.strikeTime)) < Date.now();
                    if (isMarketMatured) {
                        const priceId = getPriceId(queryConfig.networkId, parseBytes32String(market.asset));
                        return priceConnection.getPriceFeed(priceId, Number(market.strikeTime)).catch((e) => {
                            console.log('Pyth price feed error', e);
                            unavailablePrices.push({
                                priceId: priceId.replace('0x', ''),
                                publishTime: Number(market.strikeTime),
                            });
                        });
                    } else {
                        return reject(`Price still unknown as this is for future time: ${market.strikeTime}`);
                    }
                });
                const priceFeeds = await Promise.allSettled(pricePromises);

                // Secondary API for fetching prices using Pyth benchmarks in case that primary fails
                const benchmarksPriceFeeds = await getBenchmarksPriceFeeds(unavailablePrices);

                for (let i = 0; i < userActiveMarkets.length; i++) {
                    const marketData = userActiveMarkets[i];
                    const side = SIDE_TO_POSITION_MAP[marketData.direction];
                    const payout = coinFormatter(marketData.buyinAmount, queryConfig.networkId) * SPEED_MARKETS_QUOTE;

                    let isClaimable = false;
                    let price = 0;
                    const isMarketMatured = secondsToMilliseconds(Number(marketData.strikeTime)) < Date.now();
                    if (isMarketMatured) {
                        const priceFeed: PromiseSettledResult<PriceFeed> = priceFeeds[i];
                        if (priceFeed.status === 'fulfilled' && priceFeed.value) {
                            price = priceFeed.value.getPriceUnchecked().getPriceAsNumberUnchecked();
                        } else {
                            const benchmarksPriceId = getPriceId(
                                queryConfig.networkId,
                                parseBytes32String(marketData.asset)
                            ).replace('0x', '');
                            price =
                                benchmarksPriceFeeds.find(
                                    (benchmarksPrice) =>
                                        benchmarksPrice.priceId === benchmarksPriceId &&
                                        benchmarksPrice.publishTime === Number(marketData.strikeTime)
                                )?.price || 0;
                        }

                        isClaimable =
                            !!price &&
                            ((side === Positions.UP &&
                                price > bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS)) ||
                                (side === Positions.DOWN &&
                                    price < bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS)));
                    }

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

                    const userData: UserOpenPositions = {
                        positionAddress: ZERO_ADDRESS,
                        currencyKey: parseBytes32String(marketData.asset),
                        strikePrice: formatCurrencyWithSign(
                            USD_SIGN,
                            bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS)
                        ),
                        strikePriceNum: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        payout: payout,
                        maturityDate,
                        market: marketData.market,
                        side,
                        paid: coinFormatter(marketData.buyinAmount, queryConfig.networkId) * (1 + fees),
                        value: payout,
                        claimable: isClaimable,
                        finalPrice: price,
                    };

                    userSpeedMarketsData.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return userSpeedMarketsData;
        },
        ...options,
    });
};

export default useUserActiveSpeedMarketsDataQuery;
