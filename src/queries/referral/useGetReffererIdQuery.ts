import axios from 'axios';
import { LINKS } from 'constants/links';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from 'react-query';

const useGetReffererIdQuery = (walletAddress: string, options?: UseQueryOptions<string>) => {
    return useQuery<string>(
        QUERY_KEYS.Referral.ReferrerID(walletAddress),
        async () => {
            try {
                const response = await axios.get(`${LINKS.API}/get-address-refferer-id/${walletAddress}`);
                return response.data;
            } catch (e) {
                return null;
            }
        },
        { ...options }
    );
};

export default useGetReffererIdQuery;
