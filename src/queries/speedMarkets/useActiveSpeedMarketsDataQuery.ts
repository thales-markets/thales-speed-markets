import { EvmPriceServiceConnection } from '@pythnetwork/pyth-evm-js';
import { SIDE_TO_POSITION_MAP, SPEED_MARKETS_QUOTE } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { CONNECTION_TIMEOUT_MS, PYTH_CURRENCY_DECIMALS, SUPPORTED_ASSETS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { getCurrentPrices, getPriceId, getPriceServiceEndpoint } from 'utils/pyth';
import { getFeesFromHistory } from 'utils/speedAmm';
import { getContract } from 'viem';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import { QueryConfig } from 'types/network';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { ViemContract } from 'types/viem';

const useActiveSpeedMarketsDataQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserOpenPositions[]>({
        queryKey: QUERY_KEYS.Markets.ActiveSpeedMarkets(queryConfig),
        queryFn: async () => {
            const activeSpeedMarketsData: UserOpenPositions[] = [];

            const speedMarketsAMMContractLocal = getContract({
                abi: speedMarketsAMMContract.abi,
                address: speedMarketsAMMContract.addresses[queryConfig.networkId],
                client: queryConfig.client,
            }) as ViemContract;

            const speedMarketsDataContractLocal = getContract({
                abi: speedMarketsDataContract.abi,
                address: speedMarketsDataContract.addresses[queryConfig.networkId],
                client: queryConfig.client,
            }) as ViemContract;

            const priceConnection = new EvmPriceServiceConnection(getPriceServiceEndpoint(queryConfig.networkId), {
                timeout: CONNECTION_TIMEOUT_MS,
            });

            const ammParams = await speedMarketsDataContractLocal.read.getSpeedMarketsAMMParameters([ZERO_ADDRESS]);

            const activeMarkets = await speedMarketsAMMContractLocal.read.activeMarkets([
                0,
                ammParams.numActiveMarkets,
            ]);
            const marketsDataArray = activeMarkets.length
                ? await speedMarketsDataContractLocal.read.getMarketsData([activeMarkets])
                : [];
            const maturedMarkets: any = marketsDataArray
                .map((marketData: any, index: number) => ({ ...marketData, market: activeMarkets[index] }))
                .filter((market: any) => secondsToMilliseconds(Number(market.strikeTime)) < Date.now());
            const openMarkets: any = marketsDataArray
                .map((marketData: any, index: number) => ({ ...marketData, market: activeMarkets[index] }))
                .filter((market: any) => secondsToMilliseconds(Number(market.strikeTime)) > Date.now());

            // Matured markets - not resolved
            for (let i = 0; i < maturedMarkets.length; i++) {
                const marketData = maturedMarkets[i];
                const side = SIDE_TO_POSITION_MAP[marketData.direction];
                const payout = coinFormatter(marketData.buyinAmount, queryConfig.networkId) * SPEED_MARKETS_QUOTE;

                const maturityDate = secondsToMilliseconds(Number(marketData.strikeTime));
                const createdAt =
                    marketData.createdAt != 0
                        ? secondsToMilliseconds(Number(marketData.createdAt))
                        : maturityDate - hoursToMilliseconds(1);
                const lpFee =
                    marketData.lpFee != 0 ? bigNumberFormatter(marketData.lpFee) : getFeesFromHistory(createdAt).lpFee;
                const safeBoxImpact =
                    marketData.safeBoxImpact != 0
                        ? bigNumberFormatter(marketData.safeBoxImpact)
                        : getFeesFromHistory(createdAt).safeBoxImpact;
                const fees = lpFee + safeBoxImpact;

                const userData: UserOpenPositions = {
                    positionAddress: ZERO_ADDRESS,
                    currencyKey: parseBytes32String(marketData.asset),
                    strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS).toString(),
                    payout: payout,
                    maturityDate,
                    market: marketData.market,
                    side,
                    paid: coinFormatter(marketData.buyinAmount, queryConfig.networkId) * (1 + fees),
                    value: payout,
                    claimable: undefined,
                    finalPrice: undefined,
                    user: marketData.user,
                };

                activeSpeedMarketsData.push(userData);
            }

            // Fetch current prices
            let prices: { [key: string]: number } = {};
            if (openMarkets.length) {
                const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(queryConfig.networkId, asset));
                prices = await getCurrentPrices(priceConnection, queryConfig.networkId, priceIds);
            }

            // Open markets
            for (let i = 0; i < openMarkets.length; i++) {
                const marketData = openMarkets[i];
                const currencyKey = parseBytes32String(marketData.asset);
                const side = SIDE_TO_POSITION_MAP[marketData.direction];
                const payout = coinFormatter(marketData.buyinAmount, queryConfig.networkId) * SPEED_MARKETS_QUOTE;

                const lpFee =
                    marketData.lpFee != 0 ? bigNumberFormatter(marketData.lpFee) : getFeesFromHistory(Date.now()).lpFee;
                const safeBoxImpact =
                    marketData.safeBoxImpact != 0
                        ? bigNumberFormatter(marketData.safeBoxImpact)
                        : getFeesFromHistory(Date.now()).safeBoxImpact;
                const fees = lpFee + safeBoxImpact;

                const userData: UserOpenPositions = {
                    positionAddress: ZERO_ADDRESS,
                    currencyKey: currencyKey,
                    strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS).toString(),
                    payout: payout,
                    maturityDate: secondsToMilliseconds(Number(marketData.strikeTime)),
                    market: marketData.market,
                    side,
                    paid: coinFormatter(marketData.buyinAmount, queryConfig.networkId) * (1 + fees),
                    value: payout,
                    claimable: false,
                    finalPrice: 0,
                    currentPrice: prices[currencyKey],
                    user: marketData.user,
                };

                activeSpeedMarketsData.push(userData);
            }

            return activeSpeedMarketsData;
        },
        ...options,
    });
};

export default useActiveSpeedMarketsDataQuery;
