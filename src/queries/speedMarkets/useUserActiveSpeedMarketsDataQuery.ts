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
import freeBetHolderContract from 'utils/contracts/freeBetHolderContract';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getCollateralByAddress } from 'utils/currency';
import { getCurrentPrices, getPriceConnection, getPriceId } from 'utils/pyth';
import { getFeesFromHistory } from 'utils/speedAmm';
import { getContract } from 'viem';

const useUserActiveSpeedMarketsDataQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserPosition[]>({
        queryKey: QUERY_KEYS.User.SpeedMarkets(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const userSpeedMarketsData: UserPosition[] = [];

            try {
                const speedMarketsDataContractLocal = getContract({
                    abi: getContractAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const speedMarketsAMMContractLocal = getContract({
                    abi: getContractAbi(speedMarketsAMMContract, queryConfig.networkId),
                    address: speedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const freeBetHolderContractLocal = getContract({
                    abi: getContractAbi(freeBetHolderContract, queryConfig.networkId),
                    address: freeBetHolderContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const ammParams = await speedMarketsDataContractLocal.read.getSpeedMarketsAMMParameters([
                    walletAddress,
                ]);

                const activeMarketsPerUser = await speedMarketsAMMContractLocal.read.activeMarketsPerUser([
                    0,
                    ammParams.numActiveMarketsPerUser,
                    walletAddress,
                ]);

                // Free Bet
                const freeBetActiveMarketsPerUser = await freeBetHolderContractLocal?.read.getActiveSpeedMarketsPerUser(
                    [0, ammParams.numFreeBetActiveMarketsPerUser, walletAddress]
                );

                const activeMarkets = (Array.isArray(activeMarketsPerUser)
                    ? activeMarketsPerUser
                    : [activeMarketsPerUser]
                ).concat(
                    Array.isArray(freeBetActiveMarketsPerUser)
                        ? freeBetActiveMarketsPerUser
                        : [freeBetActiveMarketsPerUser]
                );

                const marketsData = activeMarkets.length
                    ? await speedMarketsDataContractLocal.read.getMarketsData([activeMarkets])
                    : [];
                const marketsDataArray = Array.isArray(marketsData) ? marketsData : [marketsData];

                const userActiveMarkets = marketsDataArray.map((marketData: any, index: number) => ({
                    ...marketData,
                    market: activeMarkets[index],
                }));

                const openMarkets: any = marketsDataArray
                    .map((marketData: any, index: number) => ({ ...marketData, market: activeMarkets[index] }))
                    .filter((market: any) => secondsToMilliseconds(Number(market.strikeTime)) > Date.now());

                // Fetch current prices
                let prices: { [key: string]: number } = {};
                if (openMarkets.length) {
                    const priceConnection = getPriceConnection(queryConfig.networkId);
                    const priceIds = SUPPORTED_ASSETS.map((asset) => getPriceId(queryConfig.networkId, asset));
                    prices = await getCurrentPrices(priceConnection, queryConfig.networkId, priceIds);
                }

                for (let i = 0; i < userActiveMarkets.length; i++) {
                    const marketData = userActiveMarkets[i];

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
                        currencyKey: parseBytes32String(marketData.asset),
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
