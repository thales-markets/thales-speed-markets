import { useQuery, UseQueryOptions } from 'react-query';
import QUERY_KEYS from '../../constants/queryKeys';
import snxJSConnector from '../../utils/snxJSConnector';
import { bigNumberFormatter } from 'thales-utils';
import { MigratedRetroReward } from 'types/token';
import unclaimedInvestorsRetroRewardsHashes from 'utils/json/airdrop-hashes-unclaimed-retro-investors.json';
import { Network } from 'enums/network';

const useMigratedInvestorsRetroRewardsQuery = (
    walletAddress: string,
    networkId: Network,
    options?: UseQueryOptions<MigratedRetroReward>
) => {
    return useQuery<MigratedRetroReward>(
        QUERY_KEYS.Token.MigratedInvestorsRetroRewards(walletAddress, networkId),
        async () => {
            const paused = await (snxJSConnector as any).unclaimedInvestorsRetroAirdropContract.paused();

            const unclaimedInvestorsRetroRewardsHash = unclaimedInvestorsRetroRewardsHashes.find(
                (airdrop: any) => airdrop.address.toLowerCase() === walletAddress.toLowerCase()
            );

            const migratedRewards: MigratedRetroReward = {
                isPaused: paused,
                hasClaimRights:
                    unclaimedInvestorsRetroRewardsHash !== undefined &&
                    unclaimedInvestorsRetroRewardsHash.balance !== '0',
                claimed: false,
            };
            if (unclaimedInvestorsRetroRewardsHash) {
                migratedRewards.reward = {
                    rawBalance: unclaimedInvestorsRetroRewardsHash.balance,
                    balance: bigNumberFormatter(unclaimedInvestorsRetroRewardsHash.balance),
                    index: unclaimedInvestorsRetroRewardsHash.index,
                    proof: unclaimedInvestorsRetroRewardsHash.proof,
                };
                migratedRewards.claimed = !(await (snxJSConnector as any).unclaimedInvestorsRetroAirdropContract.canClaim(
                    unclaimedInvestorsRetroRewardsHash.index
                ));
            }

            return migratedRewards;
        },
        {
            ...options,
        }
    );
};

export default useMigratedInvestorsRetroRewardsQuery;
