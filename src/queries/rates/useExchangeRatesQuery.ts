import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { bigNumberFormatter, parseBytes32String } from 'thales-utils';
import priceFeedContract from 'utils/contracts/priceFeedContract';
import { getContract } from 'viem';
import { QueryConfig } from 'types/network';
export type Rates = Record<string, number>;

const useExchangeRatesQuery = (
    queryConfig: QueryConfig,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<Rates>({
        queryKey: QUERY_KEYS.Rates.ExchangeRates(queryConfig),
        queryFn: async () => {
            const exchangeRates: Rates = {};

            const priceFeedContractLocal = getContract({
                address: priceFeedContract.addresses[queryConfig.networkId] as any,
                abi: priceFeedContract.abi,
                client: queryConfig.client,
            }) as any;

            if (priceFeedContractLocal) {
                const [currencies, rates] = await Promise.all([
                    priceFeedContractLocal.read.getCurrencies(),
                    priceFeedContractLocal.read.getRates(),
                ]);
                currencies.forEach((currency: string, idx: number) => {
                    const currencyName = parseBytes32String(currency);
                    exchangeRates[currencyName] = bigNumberFormatter(rates[idx]);
                    if (currencyName === 'SUSD') {
                        exchangeRates[`sUSD`] = bigNumberFormatter(rates[idx]);
                    } else {
                        exchangeRates[`s${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                    if (currencyName === CRYPTO_CURRENCY_MAP.ETH) {
                        exchangeRates[`W${currencyName}`] = bigNumberFormatter(rates[idx]);
                    }
                });
            }

            console.log(exchangeRates);

            return exchangeRates;
        },
        refetchInterval: 60 * 1000,
        ...options,
    });
};

export default useExchangeRatesQuery;
