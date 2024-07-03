import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import QUERY_KEYS from 'constants/queryKeys';
import { AmmSpeedMarketsCreatorParams } from 'types/market';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import { getContractAbi } from 'utils/contracts/abi';
import speedMarketsAMMCreatorContract from 'utils/contracts/speedMarketsAMMCreatorContract';
import { getContract } from 'viem';

const useAmmSpeedMarketsCreatorQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<AmmSpeedMarketsCreatorParams>({
        queryKey: QUERY_KEYS.Markets.SpeedMarketsCreator(queryConfig.networkId),
        queryFn: async () => {
            const ammSpeedMarketsCreatorParams: AmmSpeedMarketsCreatorParams = { maxCreationDelay: 0 };

            try {
                const speedMarketsDataContractLocal = getContract({
                    abi: getContractAbi(speedMarketsAMMCreatorContract, queryConfig.networkId),
                    address: speedMarketsAMMCreatorContract.addresses[queryConfig.networkId],
                    client: queryConfig.client,
                }) as ViemContract;

                const maxCreationDelay = await speedMarketsDataContractLocal.read.maxCreationDelay();

                ammSpeedMarketsCreatorParams.maxCreationDelay = Number(maxCreationDelay);
            } catch (e) {
                console.log(e);
            }

            return ammSpeedMarketsCreatorParams;
        },
        ...options,
    });
};

export default useAmmSpeedMarketsCreatorQuery;
