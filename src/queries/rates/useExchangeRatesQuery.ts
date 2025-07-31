import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { OVER_CONTRACT_RATE_KEY } from 'constants/market';
import QUERY_KEYS from 'constants/queryKeys';
import { bigNumberFormatter, parseBytes32String } from 'thales-utils';
import { QueryConfig } from 'types/network';
import { ViemContract } from 'types/viem';
import priceFeedContract from 'utils/contracts/priceFeedContract';
import { getContract } from 'viem';
export type Rates = Record<string, number>;

const useExchangeRatesQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Rates>({
        queryKey: QUERY_KEYS.Rates.ExchangeRates(queryConfig.networkId),
        queryFn: async () => {
            const exchangeRates: Rates = {};

            const priceFeedContractLocal = getContract({
                address: priceFeedContract.addresses[queryConfig.networkId],
                abi: priceFeedContract.abi,
                client: queryConfig.client,
            }) as ViemContract;

            if (priceFeedContractLocal) {
                const [currencies, rates] = await Promise.all([
                    priceFeedContractLocal.read.getCurrencies(),
                    priceFeedContractLocal.read.getRates(),
                ]);
                currencies.forEach((currency: string, idx: number) => {
                    const currencyName = parseBytes32String(currency);
                    exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);

                    if (currencyName === CRYPTO_CURRENCY_MAP.USDC) {
                        exchangeRates[`${currencyName}e`] = bigNumberFormatter(rates[idx]);
                    }
                    if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                        exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                    if (currencyName === CRYPTO_CURRENCY_MAP.BTC) {
                        exchangeRates[`cb${currencyName}`] = bigNumberFormatter(rates[idx]);
                        exchangeRates[`w${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }

                    exchangeRates[OVER_CONTRACT_RATE_KEY] = exchangeRates[CRYPTO_CURRENCY_MAP.OVER];
                });
            }

            return exchangeRates;
        },
        refetchInterval: 60 * 1000,
        ...options,
    });
};

export default useExchangeRatesQuery;
