import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';
import { COLLATERAL_DECIMALS, Coins, NetworkId, bigNumberFormatter } from 'thales-utils';
import { CollateralsBalance } from 'types/collateral';
import { getBalance } from '@wagmi/core';
import snxJSConnector from 'utils/snxJSConnector';
import { wagmiConfig } from 'pages/Root/wagmi-config';

const useMultipleCollateralBalanceQuery = (
    walletAddress: string,
    networkId: NetworkId,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<CollateralsBalance>({
        queryKey: QUERY_KEYS.WalletBalances.MultipleCollateral(walletAddress, networkId),
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
                const multipleCollateral = snxJSConnector.multipleCollateral;

                if (!walletAddress || !networkId) {
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
                    multipleCollateral
                        ? multipleCollateral[SYNTHS_MAP.sUSD as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.DAI as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDC as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDCe as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDbC as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.USDT as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.OP as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.WETH as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
                    getBalance(wagmiConfig, { address: walletAddress as any }) as any,
                    multipleCollateral
                        ? multipleCollateral[CRYPTO_CURRENCY_MAP.ARB as Coins]?.read.balanceOf([walletAddress])
                        : undefined,
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
