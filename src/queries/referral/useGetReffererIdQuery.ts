import { LINKS } from 'constants/links';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';

const useGetReffererIdQuery = (walletAddress: string, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<string>({
        queryKey: QUERY_KEYS.Referral.ReferrerID(walletAddress),
        queryFn: async () => {
            try {
                const response = await fetch(`${LINKS.API}/get-address-refferer-id/${walletAddress}`);
                const id = await response.text();
                return id;
            } catch (e) {
                return '';
            }
        },
        ...options,
    });
};

export default useGetReffererIdQuery;
