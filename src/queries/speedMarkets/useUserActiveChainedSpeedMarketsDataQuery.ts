import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { SIDE_TO_POSITION_MAP } from 'constants/market';
import { PYTH_CURRENCY_DECIMALS, SUPPORTED_ASSETS } from 'constants/pyth';
import QUERY_KEYS from 'constants/queryKeys';
import { secondsToMilliseconds } from 'date-fns';
import { bigNumberFormatter, coinFormatter, parseBytes32String } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getCollateralByAddress } from 'utils/currency';
import { getCurrentPrices, getPriceConnection, getPriceId } from 'utils/pyth';
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

                const activeMarketsAddresses = await chainedMarketsAMMContract.read.activeMarketsPerUser([
                    0,
                    ammParams.numActiveMarketsPerUser,
                    walletAddress,
                ]);
                const marketsDataArray = await speedMarketsDataContractLocal.read.getChainedMarketsData([
                    activeMarketsAddresses,
                ]);
                const userActiveMarkets = marketsDataArray.map((marketData: any, index: number) => ({
                    ...marketData,
                    market: activeMarketsAddresses[index],
                }));

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

                for (let i = 0; i < userActiveMarkets.length; i++) {
                    const marketData = userActiveMarkets[i];

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
                    const fee = bigNumberFormatter(marketData.safeBoxImpact);
                    const collateral = getCollateralByAddress(marketData.collateral, queryConfig.networkId);

                    const userData: UserChainedPosition = {
                        user: marketData.user,
                        market: marketData.market,
                        currencyKey: parseBytes32String(marketData.asset),
                        sides,
                        strikePrices,
                        strikeTimes,
                        maturityDate,
                        paid: coinFormatter(marketData.buyinAmount, queryConfig.networkId, collateral) * (1 + fee),
                        payout: coinFormatter(marketData.payout, queryConfig.networkId, collateral),
                        payoutMultiplier: bigNumberFormatter(marketData.payoutMultiplier),
                        collateralAddress: marketData.collateral,
                        isDefaultCollateral: marketData.isDefaultCollateral,
                        currentPrice: prices[currencyKey],
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
