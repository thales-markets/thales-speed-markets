import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { LINKS } from 'constants/links';

const useSolanaAddressForWalletQuery = (
    walletAddress: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<string>({
        queryKey: QUERY_KEYS.User.Solana(walletAddress),
        queryFn: async () => {
            try {
                const response = await fetch(`${LINKS.API}/speed-markets/solana-address/${walletAddress}`);
                const id = await response.text();
                return id;
            } catch (e) {
                return '';
            }
        },
        ...options,
    });
};

export default useSolanaAddressForWalletQuery;
