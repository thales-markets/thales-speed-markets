import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import snxJSConnector from '../../utils/snxJSConnector';
import { bigNumberFormatter } from 'thales-utils';
import { VestingInfo } from 'types/token';
import { Network } from 'enums/network';

const useVestingEscrowQuery = (walletAddress: string, networkId: Network, options?: UseQueryOptions<VestingInfo>) => {
    return useQuery<VestingInfo>(
        QUERY_KEYS.Token.VestingEscrow(walletAddress, networkId),
        async () => {
            const [unlocked, initialLocked, totalClaimed, startTime, endTime] = await Promise.all([
                (snxJSConnector as any).vestingEscrowContract.balanceOf(walletAddress),
                (snxJSConnector as any).vestingEscrowContract.initialLocked(walletAddress),
                (snxJSConnector as any).vestingEscrowContract.totalClaimed(walletAddress),
                (snxJSConnector as any).vestingEscrowContract.startTime(),
                (snxJSConnector as any).vestingEscrowContract.endTime(),
            ]);

            const vestingInfo: VestingInfo = {
                unlocked: bigNumberFormatter(unlocked),
                initialLocked: bigNumberFormatter(initialLocked),
                totalClaimed: bigNumberFormatter(totalClaimed),
                startTime: Number(startTime) * 1000,
                endTime: Number(endTime) * 1000,
            };

            return vestingInfo;
        },
        {
            ...options,
        }
    );
};

export default useVestingEscrowQuery;
