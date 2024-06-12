import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { LINKS } from 'constants/links';
import QUERY_KEYS from 'constants/queryKeys';
import { NetworkId } from 'thales-utils';

export type Banner = {
    image: string;
    url: string;
};

export const useBannersQuery = (networkId: NetworkId, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<Banner[]>({
        queryKey: QUERY_KEYS.Banners(networkId),
        queryFn: async () => {
            try {
                const response = await fetch(`${LINKS.API}/speed-banners/${networkId}`);
                const banners: Banner[] = await response.json();

                const mappedData = banners.map((banner) => ({
                    url: banner.url,
                    image: `${LINKS.API}/speed-banners/image/${banner.image}`,
                }));

                return mappedData;
            } catch (e) {
                console.log('error', e);
                return [];
            }
        },
        ...options,
    });
};
