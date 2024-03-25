import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { getBalance } from '@wagmi/core';
import { TBD_ADDRESS } from 'constants/network';
import QUERY_KEYS from 'constants/queryKeys';
import { wagmiConfig } from 'pages/Root/wagmiConfig';
import { COLLATERAL_DECIMALS, bigNumberFormatter } from 'thales-utils';
import { CollateralsBalance } from 'types/collateral';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import multipleCollateral from 'utils/contracts/multipleCollateralContract';
import { Address, getContract } from 'viem';

const useMultipleCollateralBalanceQuery = (
    walletAddress: string,
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<CollateralsBalance>({
        queryKey: QUERY_KEYS.WalletBalances.MultipleCollateral(walletAddress, queryConfig),
        queryFn: async () => {
            let collaterasBalance: CollateralsBalance = {
                sUSD: 0,
                DAI: 0,
                USDCe: 0,
                USDbC: 0,
                USDT: 0,
                OP: 0,
                WETH: 0,
                ETH: 0,
                ARB: 0,
                USDC: 0,
            };
            try {
                const multipleCollateralObject = {
                    sUSD: getContract({
                        abi: multipleCollateral.sUSD.abi,
                        address: multipleCollateral.sUSD.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    DAI: getContract({
                        abi: multipleCollateral.DAI.abi,
                        address: multipleCollateral.DAI.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    USDC: getContract({
                        abi: multipleCollateral.USDC.abi,
                        address: multipleCollateral.USDC.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    USDCe: getContract({
                        abi: multipleCollateral.USDCe.abi,
                        address: multipleCollateral.USDCe.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    USDbC: getContract({
                        abi: multipleCollateral.USDbC.abi,
                        address: multipleCollateral.USDbC.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    USDT: getContract({
                        abi: multipleCollateral.USDT.abi,
                        address: multipleCollateral.USDT.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    OP: getContract({
                        abi: multipleCollateral.OP.abi,
                        address: multipleCollateral.OP.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    WETH: getContract({
                        abi: multipleCollateral.WETH.abi,
                        address: multipleCollateral.WETH.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    ETH: getContract({
                        abi: multipleCollateral.ETH.abi,
                        address: multipleCollateral.ETH.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                    ARB: getContract({
                        abi: multipleCollateral.ARB.abi,
                        address: multipleCollateral.ARB.addresses[queryConfig.networkId],
                        client: queryConfig.client,
                    }) as ViemContract,
                };

                if (!walletAddress || !queryConfig.networkId) {
                    return collaterasBalance;
                }

                const [
                    sUSDBalance,
                    DAIBalance,
                    USDCBalance,
                    USDCeBalance,
                    USDbCBalance,
                    USDTBalance,
                    OPBalance,
                    WETHBalance,
                    ETHBalance,
                    ARBBalance,
                ] = await Promise.all([
                    multipleCollateralObject.sUSD.address !== TBD_ADDRESS
                        ? multipleCollateralObject.sUSD.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject.DAI.address !== TBD_ADDRESS
                        ? multipleCollateralObject.DAI.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject.USDC.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDC.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject.USDCe.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDCe.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject.USDbC.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDbC.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject.USDT.address !== TBD_ADDRESS
                        ? multipleCollateralObject.USDT.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject.OP.address !== TBD_ADDRESS
                        ? multipleCollateralObject.OP.read.balanceOf([walletAddress])
                        : 0,
                    multipleCollateralObject.WETH.address !== TBD_ADDRESS
                        ? multipleCollateralObject.WETH.read.balanceOf([walletAddress])
                        : 0,
                    getBalance(wagmiConfig, { address: walletAddress as Address }),
                    multipleCollateralObject.ARB.address !== TBD_ADDRESS
                        ? multipleCollateralObject.ARB.read.balanceOf([walletAddress])
                        : 0,
                ]);
                collaterasBalance = {
                    sUSD: sUSDBalance ? bigNumberFormatter(sUSDBalance, COLLATERAL_DECIMALS.sUSD) : 0,
                    DAI: DAIBalance ? bigNumberFormatter(DAIBalance, COLLATERAL_DECIMALS.DAI) : 0,
                    USDC: USDCBalance ? bigNumberFormatter(USDCBalance, COLLATERAL_DECIMALS.USDC) : 0,
                    USDCe: USDCeBalance ? bigNumberFormatter(USDCeBalance, COLLATERAL_DECIMALS.USDCe) : 0,
                    USDbC: USDbCBalance ? bigNumberFormatter(USDbCBalance, COLLATERAL_DECIMALS.USDbC) : 0,
                    USDT: USDTBalance ? bigNumberFormatter(USDTBalance, COLLATERAL_DECIMALS.USDT) : 0,
                    OP: OPBalance ? bigNumberFormatter(OPBalance, COLLATERAL_DECIMALS.OP) : 0,
                    WETH: WETHBalance ? bigNumberFormatter(WETHBalance, COLLATERAL_DECIMALS.WETH) : 0,
                    ETH: ETHBalance ? bigNumberFormatter(ETHBalance.value, COLLATERAL_DECIMALS.ETH) : 0,
                    ARB: ARBBalance ? bigNumberFormatter(ARBBalance, COLLATERAL_DECIMALS.ARB) : 0,
                };
            } catch (e) {
                console.log('e ', e);
            }

            return collaterasBalance;
        },
        ...options,
    });
};

export default useMultipleCollateralBalanceQuery;
