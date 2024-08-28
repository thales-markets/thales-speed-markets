import { LINKS } from 'constants/links';
import QUERY_KEYS from 'constants/queryKeys';
import { millisecondsToSeconds } from 'date-fns';
import { UseQueryOptions, useQuery } from '@tanstack/react-query';

type CandlestickData = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
};

const usePythCandlestickQuery = (
    asset: string,
    dateFrom: number,
    dateTo: number,
    resolution: string,
    options?: Omit<UseQueryOptions<any>, 'queryKey' | 'queryFn'>
) => {
    return useQuery<CandlestickData[]>({
        queryKey: QUERY_KEYS.Prices.PythCandlestickData(asset, dateFrom, resolution),
        queryFn: async () => {
            const response = await fetch(
                `${
                    LINKS.Pyth.BenchmarksTradingViewHistory
                }?symbol=Crypto.${asset}/USD&resolution=${resolution}&from=${millisecondsToSeconds(
                    dateFrom
                )}&to=${millisecondsToSeconds(dateTo)}`
            );
            const pythCandlestickData = await response.json();

            const candleStickData = pythCandlestickData.t.map((time: number, index: number) => {
                return {
                    open: pythCandlestickData.o[index],
                    high: pythCandlestickData.h[index],
                    low: pythCandlestickData.l[index],
                    close: pythCandlestickData.c[index],
                    time: time,
                };
            });

            return candleStickData;
        },
        ...options,
    });
};

export default usePythCandlestickQuery;
