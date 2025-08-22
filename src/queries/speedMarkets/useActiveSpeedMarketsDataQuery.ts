import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SIDE_TO_POSITION_MAP } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import { PYTH_CURRENCY_DECIMALS, SUPPORTED_ASSETS } from 'constants/pyth';
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
import { getCurrentPrices, getPriceConnection, getPriceId } from 'utils/pyth';
import { getFeesFromHistory } from 'utils/speedAmm';
import { getContract } from 'viem';

const useActiveSpeedMarketsDataQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserPosition[]>({
        queryKey: QUERY_KEYS.Markets.ActiveSpeedMarkets(queryConfig.networkId),
        queryFn: async () => {
            const activeSpeedMarketsData: UserPosition[] = [];

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
                    const collateral = getCollateralByAddress(marketData.collateral, queryConfig.networkId);

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

                    const isFreeBet = marketData.freeBetUser !== ZERO_ADDRESS;

                    const userData: UserPosition = {
                        user: isFreeBet ? marketData.freeBetUser : marketData.user,
                        market: marketData.market,
                        currencyKey: parseBytes32String(marketData.asset),
                        side,
                        strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        maturityDate,
                        paid: coinFormatter(marketData.buyinAmount, queryConfig.networkId, collateral) * (1 + fees),
                        payout: coinFormatter(marketData.payout, queryConfig.networkId, collateral),
                        collateralAddress: marketData.collateral,
                        isDefaultCollateral: marketData.isDefaultCollateral,
                        isFreeBet,
                        currentPrice: 0,
                        finalPrice: 0,
                        isClaimable: false,
                        isResolved: false,
                        createdAt,
                    };

                    activeSpeedMarketsData.push(userData);
                }

                // Fetch current prices
                let prices: { [key: string]: number } = {};
                if (openMarkets.length) {
                    const priceConnection = getPriceConnection(queryConfig.networkId);
                    const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(queryConfig.networkId, asset));
                    prices = await getCurrentPrices(priceConnection, queryConfig.networkId, priceIds);
                }

                // Open markets
                for (let i = 0; i < openMarkets.length; i++) {
                    const marketData = openMarkets[i];
                    const currencyKey = parseBytes32String(marketData.asset);
                    const side = SIDE_TO_POSITION_MAP[marketData.direction];
                    const collateral = getCollateralByAddress(marketData.collateral, queryConfig.networkId);
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

                    const isFreeBet = marketData.freeBetUser !== ZERO_ADDRESS;

                    const userData: UserPosition = {
                        user: isFreeBet ? marketData.freeBetUser : marketData.user,
                        market: marketData.market,
                        currencyKey: currencyKey,
                        side,
                        strikePrice: bigNumberFormatter(marketData.strikePrice, PYTH_CURRENCY_DECIMALS),
                        maturityDate,
                        paid: coinFormatter(marketData.buyinAmount, queryConfig.networkId, collateral) * (1 + fees),
                        payout: coinFormatter(marketData.payout, queryConfig.networkId, collateral),
                        collateralAddress: marketData.collateral,
                        isDefaultCollateral: marketData.isDefaultCollateral,
                        isFreeBet,
                        currentPrice: prices[currencyKey],
                        finalPrice: 0,
                        isClaimable: false,
                        isResolved: false,
                        createdAt,
                    };

                    activeSpeedMarketsData.push(userData);
                }
            } catch (e) {
                console.log(e);
            }

            return activeSpeedMarketsData;
        },
        ...options,
    });
};

export default useActiveSpeedMarketsDataQuery;
