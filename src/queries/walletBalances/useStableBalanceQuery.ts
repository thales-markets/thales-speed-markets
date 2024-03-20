import QUERY_KEYS from 'constants/queryKeys';
import { COLLATERAL_DECIMALS } from 'thales-utils';
import { QueryConfig } from 'types/network';
import { getDefaultCollateral } from 'utils/currency';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { getContract } from 'viem';
import erc20Contract from 'utils/contracts/collateralContract';
import { ViemContract } from 'types/viem';

// used only for when multiCollateral is not available(zk sync, blast)
const useStableBalanceQuery = (
    walletAddress: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<any>({
        queryKey: QUERY_KEYS.WalletBalances.StableCoinBalance(walletAddress ?? '', queryConfig),
        queryFn: async () => {
            try {
                console.log('lets try stable: ');
                const collateral = getContract({
                    abi: erc20Contract.abi,
                    address: erc20Contract.addresses[queryConfig.networkId] as any,
                    client: queryConfig.client,
                }) as ViemContract;
                const collateralKey = getDefaultCollateral(queryConfig.networkId);

                let usdBalance = await collateral.read.balanceOf([walletAddress]);
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
