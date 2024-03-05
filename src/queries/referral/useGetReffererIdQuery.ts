import { LINKS } from 'constants/links';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';

const useGetReffererIdQuery = (walletAddress: string, options?: UseQueryOptions<string>) => {
    return useQuery<string>(
        QUERY_KEYS.Referral.ReferrerID(walletAddress),
        async () => {
            try {
                const response = await fetch(`${LINKS.API}/get-address-refferer-id/${walletAddress}`);
                const id = await response.text();
                return id;
            } catch (e) {
                return '';
            }
        },
        { ...options }
    );
};

export default useGetReffererIdQuery;
