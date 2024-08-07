import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE } from 'constants/market';
import { ZERO_ADDRESS } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import { bigNumberFormatter, coinFormatter } from 'thales-utils';
import { AmmChainedSpeedMarketsLimits } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import { getContract } from 'viem';

const useChainedAmmSpeedMarketsLimitsQuery = (
    queryConfig: QueryConfig,
    walletAddress?: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AmmChainedSpeedMarketsLimits>({
        queryKey: QUERY_KEYS.Markets.ChainedSpeedMarketsLimits(queryConfig.networkId, walletAddress),
        queryFn: async () => {
            const ammChainedSpeedMarketsLimits: AmmChainedSpeedMarketsLimits = {
                minChainedMarkets: 0,
                maxChainedMarkets: 0,
                minBuyinAmount: 0,
                maxBuyinAmount: 0,
                maxProfitPerIndividualMarket: 0,
                minTimeFrame: 0,
                maxTimeFrame: 0,
                risk: { current: 0, max: 0 },
                payoutMultipliers: [],
                maxPriceDelayForResolvingSec: 0,
                whitelistedAddress: false,
            };

            try {
                const speedMarketsDataContractLocal = getContract({
                    abi: getContractAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;
                if (speedMarketsDataContract) {
                    const [chainedAmmParams, ammParams] = await Promise.all([
                        speedMarketsDataContractLocal.read.getChainedSpeedMarketsAMMParameters([
                            walletAddress || ZERO_ADDRESS,
                        ]),
                        speedMarketsDataContractLocal.read.getSpeedMarketsAMMParameters([
                            walletAddress || ZERO_ADDRESS,
                        ]),
                    ]);

                    ammChainedSpeedMarketsLimits.minChainedMarkets = Number(chainedAmmParams.minChainedMarkets);
                    ammChainedSpeedMarketsLimits.maxChainedMarkets = Number(chainedAmmParams.maxChainedMarkets);

                    ammChainedSpeedMarketsLimits.minBuyinAmount =
                        coinFormatter(chainedAmmParams.minBuyinAmount, queryConfig.networkId) /
                        (1 - MIN_BUYIN_COLLATERAL_CONVERSION_BUFFER_PERCENTAGE);
                    ammChainedSpeedMarketsLimits.maxBuyinAmount = coinFormatter(
                        chainedAmmParams.maxBuyinAmount,
                        queryConfig.networkId
                    );

                    ammChainedSpeedMarketsLimits.maxProfitPerIndividualMarket = coinFormatter(
                        chainedAmmParams.maxProfitPerIndividualMarket,
                        queryConfig.networkId
                    );

                    ammChainedSpeedMarketsLimits.minTimeFrame = Number(chainedAmmParams.minTimeFrame);
                    ammChainedSpeedMarketsLimits.maxTimeFrame = Number(chainedAmmParams.maxTimeFrame);
                    ammChainedSpeedMarketsLimits.risk = {
                        current: coinFormatter(chainedAmmParams.risk.current, queryConfig.networkId),
                        max: coinFormatter(chainedAmmParams.risk.max, queryConfig.networkId),
                    };
                    ammChainedSpeedMarketsLimits.payoutMultipliers = chainedAmmParams.payoutMultipliers.map(
                        (payoutMultiplier: bigint) => bigNumberFormatter(payoutMultiplier)
                    );
                    ammChainedSpeedMarketsLimits.maxPriceDelayForResolvingSec = Number(
                        ammParams.maximumPriceDelayForResolving
                    );
                    ammChainedSpeedMarketsLimits.whitelistedAddress = ammParams.isAddressWhitelisted;
                }
            } catch (e) {
                console.log(e);
            }

            return ammChainedSpeedMarketsLimits;
        },
        ...options,
    });
};

export default useChainedAmmSpeedMarketsLimitsQuery;
