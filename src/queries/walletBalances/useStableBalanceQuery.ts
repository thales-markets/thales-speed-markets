import snxJSConnector from 'utils/snxJSConnector';

import QUERY_KEYS from 'constants/queryKeys';
import { COLLATERAL_DECIMALS } from 'thales-utils';
import { SupportedNetwork } from 'types/network';
import { getDefaultCollateral } from 'utils/currency';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

const useStableBalanceQuery = (
    walletAddress: string,
    networkId: SupportedNetwork,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<any>({
        queryKey: QUERY_KEYS.WalletBalances.StableCoinBalance(walletAddress ?? '', networkId),
        queryFn: async () => {
            try {
                const collateral = snxJSConnector.collateral;
                const collateralKey = getDefaultCollateral(networkId);

                let usdBalance = await collateral?.balanceOf(walletAddress);
                usdBalance = usdBalance
                    ? parseInt(usdBalance) /
                      10 ** (COLLATERAL_DECIMALS[collateralKey] ? COLLATERAL_DECIMALS[collateralKey] : 18)
                    : 0;

                return {
                    [collateralKey]: {
                        balance: usdBalance,
                    },
                };
            } catch (e) {
                console.log('e ', e);
                return null;
            }
        },
        ...options,
    });
};

export default useStableBalanceQuery;
