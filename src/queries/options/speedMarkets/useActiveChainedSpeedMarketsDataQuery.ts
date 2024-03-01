import { SIDE_TO_POSITION_MAP } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CURRENCY_DECIMALS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { parseBytes32String } from 'ethers/lib/utils.js';
import { UseQueryOptions, useQuery } from 'react-query';
import { NetworkId, bigNumberFormatter, coinFormatter, roundNumberToDecimals } from 'thales-utils';
import { ChainedSpeedMarket } from 'types/options';
import snxJSConnector from 'utils/snxJSConnector';

const useActiveChainedSpeedMarketsDataQuery = (
    networkId: NetworkId,
    options?: UseQueryOptions<ChainedSpeedMarket[]>
) => {
    return useQuery<ChainedSpeedMarket[]>(
        QUERY_KEYS.BinaryOptions.ActiveChainedSpeedMarkets(networkId),
        async () => {
            const chainedSpeedMarketsData: ChainedSpeedMarket[] = [];

            const { chainedSpeedMarketsAMMContract, speedMarketsDataContract } = snxJSConnector;

            if (chainedSpeedMarketsAMMContract && speedMarketsDataContract) {
                const ammParams = await speedMarketsDataContract.getChainedSpeedMarketsAMMParameters(ZERO_ADDRESS);

                const activeMarketsAddresses = await chainedSpeedMarketsAMMContract.activeMarkets(
                    0,
                    ammParams.numActiveMarkets
                );
                const marketsDataArray = await speedMarketsDataContract.getChainedMarketsData(activeMarketsAddresses);
                const activeMarkets = marketsDataArray.map((marketData: any, index: number) => ({
                    ...marketData,
                    market: activeMarketsAddresses[index],
                }));

                for (let i = 0; i < activeMarkets.length; i++) {
                    const marketData = activeMarkets[i];

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
                    const buyinAmount = coinFormatter(marketData.buyinAmount, networkId);
                    const fee = bigNumberFormatter(marketData.safeBoxImpact);
                    const payout = roundNumberToDecimals(
                        buyinAmount * bigNumberFormatter(marketData.payoutMultiplier) ** sides.length,
                        8
                    );

                    const chainedData: ChainedSpeedMarket = {
                        address: marketData.market,
                        timestamp: secondsToMilliseconds(Number(marketData.createdAt)),
                        currencyKey: parseBytes32String(marketData.asset),
                        sides,
                        strikePrices,
                        strikeTimes,
                        maturityDate,
                        amount: payout,
                        paid: buyinAmount * (1 + fee),
                        payoutMultiplier: bigNumberFormatter(marketData.payoutMultiplier),
                        finalPrices: Array(sides.length).fill(0),
                        isOpen: true,
                        isMatured: maturityDate < Date.now(),
                        canResolve: false,
                        claimable: false,
                        isUserWinner: false,
                        user: marketData.user,
                    };

                    chainedSpeedMarketsData.push(chainedData);
                }
            }

            return chainedSpeedMarketsData;
        },
        {
            ...options,
        }
    );
};

export default useActiveChainedSpeedMarketsDataQuery;
