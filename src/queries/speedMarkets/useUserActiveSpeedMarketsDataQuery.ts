import { EvmPriceServiceConnection, PriceFeed } from '@pythnetwork/pyth-evm-js';
import { USD_SIGN } from 'constants/currency';
import { SIDE_TO_POSITION_MAP, SPEED_MARKETS_QUOTE } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { CONNECTION_TIMEOUT_MS, PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { Positions } from 'enums/options';
import { reject } from 'lodash';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, bigNumberFormatter, coinFormatter, formatCurrencyWithSign, parseBytes32String } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { getBenchmarksPriceFeeds, getPriceId, getPriceServiceEndpoint } from 'utils/pyth';
import snxJSConnector from 'utils/snxJSConnector';
import { getFeesFromHistory } from 'utils/speedAmm';

const useUserActiveSpeedMarketsDataQuery = (
    networkId: NetworkId,
    walletAddress: string,
    options?: UseQueryOptions<UserOpenPositions[]>
) => {
    return useQuery<UserOpenPositions[]>(
        QUERY_KEYS.User.SpeedMarkets(networkId, walletAddress),
        async () => {
            const userSpeedMarketsData: UserOpenPositions[] = [];

            const { speedMarketsAMMContract, speedMarketsDataContract } = snxJSConnector;
            const priceConnection = new EvmPriceServiceConnection(getPriceServiceEndpoint(networkId), {
                timeout: CONNECTION_TIMEOUT_MS,
            });

            if (speedMarketsAMMContract && speedMarketsDataContract) {
                const ammParams = await speedMarketsDataContract.getSpeedMarketsAMMParameters(walletAddress);

                const activeMarkets = await speedMarketsAMMContract.activeMarketsPerUser(
                    0,
                    ammParams.numActiveMarketsPerUser,
                    walletAddress
                );
                const marketsDataArray = activeMarkets.length
                    ? await speedMarketsDataContract.getMarketsData(activeMarkets)
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
                        const priceId = getPriceId(networkId, parseBytes32String(market.asset));
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
                    const payout = coinFormatter(marketData.buyinAmount, networkId) * SPEED_MARKETS_QUOTE;

                    let isClaimable = false;
                    let price = 0;
                    const isMarketMatured = secondsToMilliseconds(Number(marketData.strikeTime)) < Date.now();
                    if (isMarketMatured) {
                        const priceFeed: PromiseSettledResult<PriceFeed> = priceFeeds[i];
                        if (priceFeed.status === 'fulfilled' && priceFeed.value) {
                            price = priceFeed.value.getPriceUnchecked().getPriceAsNumberUnchecked();
                        } else {
                            const benchmarksPriceId = getPriceId(
                                networkId,
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

                    const userData: UserOpenPositions = {
                        positionAddress: ZERO_ADDRESS,
                        currencyKey: parseBytes32String(marketData.asset),
                        strikePrice: formatCurrencyWithSign(
                            USD_SIGN,
                            bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS)
                        ),
                        strikePriceNum: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        amount: payout,
                        maturityDate,
                        market: marketData.market,
                        side,
                        paid: coinFormatter(marketData.buyinAmount, networkId) * (1 + fees),
                        value: payout,
                        claimable: isClaimable,
                        finalPrice: price,
                    };

                    userSpeedMarketsData.push(userData);
                }
            }

            return userSpeedMarketsData;
        },
        {
            ...options,
        }
    );
};

export default useUserActiveSpeedMarketsDataQuery;