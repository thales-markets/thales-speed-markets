import { BATCH_NUMBER_OF_SPEED_MARKETS, SPEED_MARKETS_QUOTE } from 'constants/market';
import QUERY_KEYS from 'constants/queryKeys';
import { hoursToMilliseconds, secondsToMilliseconds } from 'date-fns';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { NetworkId, bigNumberFormatter, coinFormatter, roundNumberToDecimals } from 'thales-utils';
import { UserProfileData } from 'types/profile';
import { isOnlySpeedMarketsSupported } from 'utils/network';

import { getFeesFromHistory } from 'utils/speedAmm';
import { QueryConfig } from 'types/network';
import { getContract } from 'viem';
import speedMarketsAMMContract from 'utils/contracts/speedMarketsAMMContract';
import speedMarketsDataContract from 'utils/contracts/speedMarketsAMMDataContract';
import chainedSpeedMarketsAMMContract from 'utils/contracts/chainedSpeedMarketsAMMContract';
import { ViemContract } from 'types/viem';
import { getContarctAbi } from 'utils/contracts/abi';

const useProfileDataQuery = (
    queryConfig: QueryConfig,
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<UserProfileData>({
        queryKey: QUERY_KEYS.Profile.Data(walletAddress, queryConfig.networkId),
        queryFn: async () => {
            let [profit, volume, numberOfTrades, gain, investment] = [0, 0, 0, 0, 0];

            try {
                const speedMarketsAMMContractLocal = getContract({
                    abi: getContarctAbi(speedMarketsAMMContract, queryConfig.networkId),
                    address: speedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;
                const speedMarketsDataContractLocal = getContract({
                    abi: getContarctAbi(speedMarketsDataContract, queryConfig.networkId),
                    address: speedMarketsDataContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;
                const chainedSpeedMarketsAMMContractLocal = getContract({
                    abi: chainedSpeedMarketsAMMContract.abi,
                    address: chainedSpeedMarketsAMMContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                let speedAmmParams = [],
                    chainedAmmParams = [];

                if (isOnlySpeedMarketsSupported(queryConfig.networkId)) {
                    speedAmmParams = await speedMarketsDataContractLocal?.read.getSpeedMarketsAMMParameters([
                        walletAddress,
                    ]);
                } else {
                    [speedAmmParams, chainedAmmParams] = await Promise.all([
                        speedMarketsDataContractLocal?.read.getSpeedMarketsAMMParameters([walletAddress]),
                        speedMarketsDataContractLocal?.read.getChainedSpeedMarketsAMMParameters([walletAddress]),
                    ]);
                }

                if (speedMarketsAMMContract && speedMarketsDataContractLocal) {
                    let activeSpeedMarkets = [],
                        maturedSpeedMarkets = [],
                        activeChainedSpeedMarkets = [],
                        maturedChainedSpeedMarkets = [];

                    if (isOnlySpeedMarketsSupported(queryConfig.networkId)) {
                        [activeSpeedMarkets, maturedSpeedMarkets] = await Promise.all([
                            speedMarketsAMMContractLocal.read.activeMarketsPerUser([
                                0,
                                speedAmmParams.numActiveMarketsPerUser,
                                walletAddress,
                            ]),
                            speedMarketsAMMContractLocal.read.maturedMarketsPerUser([
                                0,
                                speedAmmParams.numMaturedMarketsPerUser,
                                walletAddress,
                            ]),
                        ]);
                    } else if (chainedSpeedMarketsAMMContract) {
                        [
                            activeSpeedMarkets,
                            maturedSpeedMarkets,
                            activeChainedSpeedMarkets,
                            maturedChainedSpeedMarkets,
                        ] = await Promise.all([
                            speedMarketsAMMContractLocal.read.activeMarketsPerUser([
                                0,
                                speedAmmParams.numActiveMarketsPerUser,
                                walletAddress,
                            ]),
                            speedMarketsAMMContractLocal.read.maturedMarketsPerUser([
                                0,
                                speedAmmParams.numMaturedMarketsPerUser,
                                walletAddress,
                            ]),
                            chainedSpeedMarketsAMMContractLocal.read.activeMarketsPerUser([
                                0,
                                chainedAmmParams.numActiveMarketsPerUser,
                                walletAddress,
                            ]),
                            chainedSpeedMarketsAMMContractLocal.read.maturedMarketsPerUser([
                                0,
                                chainedAmmParams.numMaturedMarketsPerUser,
                                walletAddress,
                            ]),
                        ]);
                    }

                    const promises = [];
                    if (activeSpeedMarkets.length) {
                        promises.push(speedMarketsDataContractLocal.read.getMarketsData([activeSpeedMarkets]));
                    }
                    if (!isOnlySpeedMarketsSupported(queryConfig.networkId)) {
                        // Chained speed markets active
                        promises.push(
                            speedMarketsDataContractLocal.read.getChainedMarketsData([activeChainedSpeedMarkets])
                        );

                        // Chained speed markets matured
                        for (
                            let i = 0;
                            i < Math.ceil(maturedChainedSpeedMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS);
                            i++
                        ) {
                            const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                            const batchMarkets = maturedChainedSpeedMarkets
                                .slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS)
                                .map((market: string) => {
                                    let marketAddresss;
                                    // Hot fix for 2 markets when resolved with final price 0 and fetching data for that market is failing
                                    if (
                                        queryConfig.networkId === NetworkId.OptimismMainnet &&
                                        walletAddress === '0x5ef88d0a93e5773DB543bd421864504618A18de4' &&
                                        market === '0x79F6f48410fC659a274c0A236e19e581373bf2f9'
                                    ) {
                                        // some other market address of this user
                                        marketAddresss = '0x6A01283c0F4579B55FB7214CaF619CFe72044b68';
                                    } else if (
                                        queryConfig.networkId === NetworkId.PolygonMainnet &&
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
                            promises.push(speedMarketsDataContractLocal.read.getChainedMarketsData([batchMarkets]));
                        }
                    }

                    // Speed markets matured
                    for (let i = 0; i < Math.ceil(maturedSpeedMarkets.length / BATCH_NUMBER_OF_SPEED_MARKETS); i++) {
                        const start = i * BATCH_NUMBER_OF_SPEED_MARKETS;
                        const batchMarkets = maturedSpeedMarkets.slice(start, start + BATCH_NUMBER_OF_SPEED_MARKETS);
                        promises.push(speedMarketsDataContractLocal.read.getMarketsData([batchMarkets]));
                    }

                    const allSpeedMarkets = await Promise.all(promises);

                    allSpeedMarkets.flat().forEach((marketData: any) => {
                        const isChained = !!marketData.directions;

                        const createdAt =
                            marketData.createdAt != 0
                                ? secondsToMilliseconds(Number(marketData.createdAt))
                                : secondsToMilliseconds(Number(marketData.strikeTime)) - hoursToMilliseconds(1);
                        const lpFee = isChained
                            ? 0
                            : marketData.lpFee != 0
                            ? bigNumberFormatter(marketData.lpFee)
                            : getFeesFromHistory(createdAt).lpFee;
                        const safeBoxImpact = isChained
                            ? bigNumberFormatter(marketData.safeBoxImpact)
                            : marketData.safeBoxImpact != 0
                            ? bigNumberFormatter(marketData.safeBoxImpact)
                            : getFeesFromHistory(createdAt).safeBoxImpact;
                        const fees = lpFee + safeBoxImpact;
                        const buyinAmount = coinFormatter(marketData.buyinAmount, queryConfig.networkId);
                        const paid = buyinAmount * (1 + fees);
                        const payout = isChained
                            ? roundNumberToDecimals(
                                  buyinAmount *
                                      bigNumberFormatter(marketData.payoutMultiplier) ** marketData.directions.length,
                                  8
                              )
                            : buyinAmount * SPEED_MARKETS_QUOTE;

                        if (marketData.isUserWinner) {
                            profit += payout - paid;
                        } else {
                            profit -= paid;
                        }
                        investment += paid;
                        volume += paid;
                    });

                    const numSpeedMarkets =
                        Number(speedAmmParams.numActiveMarketsPerUser) +
                        Number(speedAmmParams.numMaturedMarketsPerUser) +
                        (isOnlySpeedMarketsSupported(queryConfig.networkId)
                            ? 0
                            : Number(chainedAmmParams.numActiveMarketsPerUser) +
                              Number(chainedAmmParams.numMaturedMarketsPerUser));
                    numberOfTrades += numSpeedMarkets;
                }

                gain = investment !== 0 ? profit / investment : 0;
            } catch (e) {
                console.log(e);
            }

            const result = {
                profit,
                volume,
                numberOfTrades,
                gain,
                investment,
            };

            return result;
        },
        ...options,
    });
};

export default useProfileDataQuery;
