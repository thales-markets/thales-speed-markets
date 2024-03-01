import TileTable from 'components/TileTable';
import { SIDE_TO_POSITION_MAP } from 'constants/market';
import useUserChainedSpeedMarketsTransactionsQuery from 'queries/speedMarkets/useUserChainedSpeedMarketsTransactionsQuery';
import useUserSpeedMarketsTransactionsQuery from 'queries/speedMarkets/useUserSpeedMarketsTransactionsQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import {
    formatCurrency,
    formatHoursAndMinutesFromTimestamp,
    formatShortDate,
    formatShortDateWithTime,
} from 'thales-utils';
import { SpeedMarket } from 'types/market';
import { TradeWithMarket } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { getAmount } from '../styled-components';

type TransactionHistoryProps = {
    searchAddress: string;
    searchText: string;
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ searchAddress, searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useSelector((state: RootState) => getNetworkId(state));
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const walletAddress = useSelector((state: RootState) => getWalletAddress(state)) || '';
    const isWalletConnected = useSelector((state: RootState) => getIsWalletConnected(state));

    const speedMarketsDataQuery = useUserSpeedMarketsTransactionsQuery(networkId, searchAddress || walletAddress, {
        enabled: isAppReady && isWalletConnected,
    });
    const speedMarketsData: TradeWithMarket[] = useMemo(
        () => (speedMarketsDataQuery.isSuccess && speedMarketsDataQuery.data ? speedMarketsDataQuery.data : []),
        [speedMarketsDataQuery.isSuccess, speedMarketsDataQuery.data]
    );

    const chainedSpeedMarketsDataQuery = useUserChainedSpeedMarketsTransactionsQuery(
        networkId,
        searchAddress || walletAddress,
        {
            enabled: isAppReady && isWalletConnected && !isOnlySpeedMarketsSupported(networkId),
        }
    );
    const chainedSpeedMarketsData: TradeWithMarket[] = useMemo(
        () =>
            chainedSpeedMarketsDataQuery.isSuccess && chainedSpeedMarketsDataQuery.data
                ? chainedSpeedMarketsDataQuery.data
                : [],
        [chainedSpeedMarketsDataQuery.isSuccess, chainedSpeedMarketsDataQuery.data]
    );

    const data: TradeWithMarket[] = useMemo(() => {
        return [...speedMarketsData, ...chainedSpeedMarketsData];
    }, [speedMarketsData, chainedSpeedMarketsData]);

    const filteredData = useMemo(
        () =>
            data.filter(
                (trade: TradeWithMarket) =>
                    trade.marketItem &&
                    (!searchText || trade.marketItem.currencyKey.toLowerCase().indexOf(searchText.toLowerCase()) > -1)
            ),
        [searchText, data]
    );

    const rows = useMemo(() => {
        const generateRows = (data: TradeWithMarket[]) => {
            try {
                const dateMap: Record<string, TradeWithMarket[]> = {};
                const sortedData = data.sort((a, b) => b.timestamp - a.timestamp);
                sortedData.forEach((trade) => {
                    const tradeDateKey = formatShortDate(trade.timestamp).toUpperCase();
                    if (!dateMap[tradeDateKey]) {
                        dateMap[tradeDateKey] = [];
                    }
                    dateMap[tradeDateKey].push(trade);
                });

                const rows = Object.keys(dateMap).reduce((prev: (string | TradeWithMarket)[], curr: string) => {
                    prev.push(curr);
                    prev.push(...dateMap[curr]);
                    return prev;
                }, []);

                return rows.map((row: string | TradeWithMarket) => {
                    if (typeof row === 'string') {
                        return row;
                    }

                    const marketExpired = row.marketItem.result;
                    const optionPrice = row.paid / row.payout;
                    const paidAmount = row.paid;
                    const amount = row.payout;

                    const cells: any = [
                        { title: 'buy', value: formatHoursAndMinutesFromTimestamp(row.timestamp) },
                        {
                            title: t('profile.history.strike'),
                            value: `$${formatCurrency(row.marketItem.strikePrice)}`,
                        },
                        {
                            title: t('profile.history.price'),
                            value: `$${formatCurrency(optionPrice)}`,
                        },
                        {
                            title: t('profile.history.amount'),
                            value: getAmount(
                                formatCurrency(amount),
                                SIDE_TO_POSITION_MAP[row.side],
                                theme,
                                (row.marketItem as SpeedMarket).isChained
                            ),
                        },
                        {
                            title: t('profile.history.paid'),
                            value: `$${formatCurrency(paidAmount)}`,
                        },
                        {
                            title: marketExpired ? t('profile.history.expired') : t('profile.history.expires'),
                            value: formatShortDateWithTime(row.marketItem.maturityDate),
                        },
                    ];

                    return {
                        asset: {
                            currencyKey: row.marketItem.currencyKey,
                        },
                        cells,
                        link: undefined,
                    };
                });
            } catch (e) {
                console.log(e);
            }
        };

        if (filteredData.length > 0) {
            return generateRows(filteredData);
        }
        return [];
    }, [filteredData, t, theme]);

    return (
        <TileTable
            rows={rows as any}
            isLoading={speedMarketsDataQuery.isLoading || chainedSpeedMarketsDataQuery.isLoading}
        />
    );
};

export default TransactionHistory;
