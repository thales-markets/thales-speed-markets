import { BATCH_NUMBER_OF_SPEED_MARKETS, MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH, MIN_MATURITY } from 'constants/market';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, bigNumberFormatter, coinFormatter, parseBytes32String, roundNumberToDecimals } from 'thales-utils';
import { SpeedMarket } from 'types/market';
import { TradeWithMarket } from 'types/profile';
import snxJSConnector from 'utils/snxJSConnector';

const useUserChainedSpeedMarketsTransactionsQuery = (
    networkId: NetworkId,
    walletAddress: string,
    options?: UseQueryOptions<TradeWithMarket[]>
) => {
    return useQuery<TradeWithMarket[]>(
        QUERY_KEYS.User.ChainedSpeedMarketsTransactions(networkId, walletAddress),
        async () => {
            const userTransactions: TradeWithMarket[] = [];

            const { chainedSpeedMarketsAMMContract, speedMarketsDataContract } = snxJSConnector;

            if (chainedSpeedMarketsAMMContract && speedMarketsDataContract) {
                const ammParams = await speedMarketsDataContract.getChainedSpeedMarketsAMMParameters(walletAddress);

                const pageSize = Math.min(ammParams.numMaturedMarketsPerUser, MAX_NUMBER_OF_SPEED_MARKETS_TO_FETCH);
                const index = Number(ammParams.numMaturedMarketsPerUser) - pageSize;
                const [activeMarkets, maturedMarkets] = await Promise.all([
                    chainedSpeedMarketsAMMContract.activeMarketsPerUser(
                        0,
                        ammParams.numActiveMarketsPerUser,
                        walletAddress
                    ),
                    chainedSpeedMarketsAMMContract.maturedMarketsPerUser(index, pageSize, walletAddress),
                ]);
                const allMarkets: any[] = activeMarkets.concat(maturedMarkets);

                const promises = [];
                for (let i = 0; i < Math.ceil(allMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                    const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                    const batchMarkets = allMarkets
                        .slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS)
                        .map((market: string) => {
                            let marketAddresss;
                            // Hot fix for 2 markets when resolved with final price 0 and fetching data for that market is failing
                            if (
                                networkId === NetworkId.OptimismMainnet &&
                                walletAddress === '0x5ef88d0a93e5773DB543bd421864504618A18de4' &&
                                market === '0x79F6f48410fC659a274c0A236e19e581373bf2f9'
                            ) {
                                // some other market address of this user
                                marketAddresss = '0x6A01283c0F4579B55FB7214CaF619CFe72044b68';
                            } else if (
                                networkId === NetworkId.PolygonMainnet &&
                                walletAddress === '0x8AAcec3D7077D04F19aC924d2743fc0DE1456941' &&
                                market === '0x1e195Ea2ABf23C1A793F01c934692A230bb5Fc40'
                            ) {
                                // some other market address of this user
                                marketAddresss = '0x9c5e5c979dbcab721336ad3ed6eac76650f7eb2c';
                            } else {
                                marketAddresss = market;
                            }

                            return marketAddresss;
                        });
                    promises.push(speedMarketsDataContract.getChainedMarketsData(batchMarkets));
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
                    const sides = marketData.directions.map((direction: number) => direction);
                    const side = marketData.resolved ? sides[sides.length - 1] : sides[0];
                    const buyinAmount = coinFormatter(marketData.buyinAmount, networkId);
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
                        timestamp: createdAt,
                        user: walletAddress,
                        payout,
                        paid: buyinAmount * (1 + safeBoxImpact),
                        market: marketData.market,
                        side,
                        marketItem: {
                            address: marketData.market,
                            timestamp: createdAt,
                            currencyKey: parseBytes32String(marketData.asset),
                            strikePrice,
                            maturityDate,
                            isOpen: !marketData.resolved,
                            result: marketData.resolved ? side : null,
                            finalPrice,
                            isChained: true,
                        } as SpeedMarket,
                    };

                    // Hot fix for one market when resolved with final price 0 and fetching data for that market is failing
                    if (
                        networkId === NetworkId.OptimismMainnet &&
                        userData.marketItem.address === '0x79F6f48410fC659a274c0A236e19e581373bf2f9'
                    ) {
                        userData.timestamp = 1702229901000;
                        userData.payout = roundNumberToDecimals(5 * 1.9 ** 6, 8);
                        userData.paid = 5.1;
                        userData.side = 0;

                        userData.marketItem = {
                            address: userData.market,
                            timestamp: 1702229901000,
                            currencyKey: 'BTC',
                            strikePrice: 43890.09284569,
                            maturityDate: 1702233501000,
                            isOpen: false,
                            result: 0,
                            finalPrice: 43869.69322549,
                            isChained: true,
                        } as SpeedMarket;
                    } else if (
                        networkId === NetworkId.PolygonMainnet &&
                        userData.marketItem.address === '0x9C5e5C979DbCaB721336AD3eD6eac76650F7eB2C'
                    ) {
                        userData.marketItem = {
                            ...userData.marketItem,
                            strikePrice: 38695.60766178,
                            finalPrice: 38830.08275709,
                        } as SpeedMarket;
                    } else if (
                        networkId === NetworkId.PolygonMainnet &&
                        userData.marketItem.address === '0x1e195Ea2ABf23C1A793F01c934692A230bb5Fc40'
                    ) {
                        userData.timestamp = 1701461351000;
                        userData.payout = roundNumberToDecimals(5 * 1.9 ** 6, 8);
                        userData.paid = 5.1;
                        userData.side = 1;

                        userData.marketItem = {
                            address: userData.market,
                            timestamp: 1701461351000,
                            currencyKey: 'BTC',
                            strikePrice: 38770.95500499,
                            maturityDate: 1701464951000,
                            isOpen: false,
                            result: 1,
                            finalPrice: 38797.0925,
                            isChained: true,
                        } as SpeedMarket;
                    }

                    userTransactions.push(userData);
                }
            }

            return userTransactions;
        },
        {
            ...options,
        }
    );
};

export default useUserChainedSpeedMarketsTransactionsQuery;