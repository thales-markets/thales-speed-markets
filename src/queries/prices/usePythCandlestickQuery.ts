import { LINKS } from 'constants/links';
import QUERY_KEYS from 'constants/queryKeys';
import { millisecondsToSeconds } from 'date-fns';
import { UseQueryOptions, useQuery } from 'react-query';

type CandlestickData = {
    time: number;
    open: number;
    high: number;
    low: number;
    close: number;
};

const usePythCandlestickQuery = (
    asset: string,
    date: number,
    resolution: string,
    options?: UseQueryOptions<CandlestickData[]>
) => {
    return useQuery<CandlestickData[]>(
        QUERY_KEYS.Prices.PythCandlestickData(asset, date, resolution),
        async () => {
            const startDate = new Date(date);
            const response = await fetch(
                `${
                    LINKS.Pyth.BenchmarksTradingViewHistory
                }?symbol=Crypto.${asset}/USD&resolution=${resolution}&from=${millisecondsToSeconds(
                    Number(startDate)
                )}&to=${millisecondsToSeconds(Number(Date.now()))}`
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
        options
    );
};

export default usePythCandlestickQuery;
