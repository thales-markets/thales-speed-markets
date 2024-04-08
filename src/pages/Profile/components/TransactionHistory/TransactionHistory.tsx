import TileTable from 'components/TileTable';
import { USD_SIGN } from 'constants/currency';
import useUserChainedSpeedMarketsTransactionsQuery from 'queries/speedMarkets/useUserChainedSpeedMarketsTransactionsQuery';
import useUserSpeedMarketsTransactionsQuery from 'queries/speedMarkets/useUserSpeedMarketsTransactionsQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { useTheme } from 'styled-components';
import {
    formatCurrencyWithSign,
    formatHoursAndMinutesFromTimestamp,
    formatShortDate,
    formatShortDateWithTime,
} from 'thales-utils';
import { TradeWithMarket } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { useAccount, useChainId, useClient } from 'wagmi';
import { getDirections } from '../styled-components';
import { getIsBiconomy } from 'redux/modules/wallet';
import biconomyConnector from 'utils/biconomyWallet';

type TransactionHistoryProps = {
    searchAddress: string;
    searchText: string;
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ searchAddress, searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { isConnected, address: walletAddress } = useAccount();
    const isBiconomy = useSelector((state: RootState) => getIsBiconomy(state));

    const speedMarketsDataQuery = useUserSpeedMarketsTransactionsQuery(
        { networkId, client },
        searchAddress || ((isBiconomy ? biconomyConnector.address : walletAddress) as string),
        {
            enabled: isAppReady && isConnected,
        }
    );
    const speedMarketsData: TradeWithMarket[] = useMemo(
        () => (speedMarketsDataQuery.isSuccess && speedMarketsDataQuery.data ? speedMarketsDataQuery.data : []),
        [speedMarketsDataQuery.isSuccess, speedMarketsDataQuery.data]
    );

    const chainedSpeedMarketsDataQuery = useUserChainedSpeedMarketsTransactionsQuery(
        { networkId, client },
        searchAddress || ((isBiconomy ? biconomyConnector.address : walletAddress) as string),
        {
            enabled: isAppReady && isConnected && !isOnlySpeedMarketsSupported(networkId),
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
                const sortedData = data.sort((a, b) => b.marketItem.timestamp - a.marketItem.timestamp);
                sortedData.forEach((trade) => {
                    const tradeDateKey = formatShortDate(trade.marketItem.timestamp).toUpperCase();
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

                    const marketExpired = row.marketItem.maturityDate < Date.now();

                    const cells: any = [
                        { title: 'buy', value: formatHoursAndMinutesFromTimestamp(row.marketItem.timestamp) },
                        {
                            title: t('profile.history.strike'),
                            value: formatCurrencyWithSign(USD_SIGN, row.marketItem.strikePrice),
                        },
                        {
                            title: row.marketItem.isChained
                                ? t('profile.history.directions')
                                : t('profile.history.direction'),
                            value: getDirections(row.sides, theme, row.marketItem.isChained),
                        },
                        {
                            title: t('profile.history.payout'),
                            value: formatCurrencyWithSign(USD_SIGN, row.payout),
                        },
                        {
                            title: t('profile.history.paid'),
                            value: formatCurrencyWithSign(USD_SIGN, row.paid),
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
