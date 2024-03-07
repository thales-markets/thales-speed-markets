import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import QUERY_KEYS from 'constants/queryKeys';
import { useQuery, UseQueryOptions } from '@tanstack/react-query';
import { bigNumberFormatter, NetworkId, parseBytes32String } from 'thales-utils';
import snxJSConnector from 'utils/snxJSConnector';
export type Rates = Record<string, number>;

const useExchangeRatesQuery = (networkId: NetworkId, options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>) => {
    return useQuery<Rates>({
        queryKey: QUERY_KEYS.Rates.ExchangeRates(networkId),
        queryFn: async () => {
            const exchangeRates: Rates = {};

            if (snxJSConnector.priceFeedContract) {
                const [currencies, rates] = await Promise.all([
                    snxJSConnector.priceFeedContract.read.getCurrencies(),
                    snxJSConnector.priceFeedContract.read.getRates(),
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

            return exchangeRates;
        },
        refetchInterval: 60 * 1000,
        ...options,
    });
};

export default useExchangeRatesQuery;
