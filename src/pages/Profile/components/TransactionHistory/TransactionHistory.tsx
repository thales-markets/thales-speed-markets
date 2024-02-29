import TileTable from 'components/TileTable';
import { OPTIONS_POSITIONS_MAP } from 'constants/options';
import { Positions } from 'enums/options';
import useUserChainedSpeedMarketsTransactionsQuery from 'queries/options/speedMarkets/useUserChainedSpeedMarketsTransactionsQuery';
import useUserSpeedMarketsTransactionsQuery from 'queries/options/speedMarkets/useUserSpeedMarketsTransactionsQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { getIsMobile } from 'redux/modules/ui';
import { getIsWalletConnected, getNetworkId, getWalletAddress } from 'redux/modules/wallet';
import { useTheme } from 'styled-components';
import {
    formatCurrency,
    formatHoursAndMinutesFromTimestamp,
    formatShortDate,
    formatShortDateWithTime,
    getEtherscanTxLink,
} from 'thales-utils';
import { HistoricalOptionsMarketInfo, OptionSide, RangedMarket, SpeedMarket } from 'types/options';
import { TradeWithMarket } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { ArrowLink, getAmount } from '../styled-components';

type TransactionHistoryProps = {
    searchAddress: string;
    searchText: string;
};

const TransactionHistory: React.FC<TransactionHistoryProps> = ({ searchAddress, searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();
    const isMobile = useSelector((state: RootState) => getIsMobile(state));
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
                    const isRanged = row.optionSide === 'in' || row.optionSide == 'out';
                    const isSpeedMarket = (row.marketItem as SpeedMarket)?.isSpeedMarket;
                    const marketExpired = row.marketItem.result;
                    const optionPrice =
                        row.orderSide != 'sell' ? row.takerAmount / row.makerAmount : row.makerAmount / row.takerAmount;
                    const paidAmount = row.orderSide == 'sell' ? row.makerAmount : row.takerAmount;
                    const amount = row.orderSide == 'sell' ? row.takerAmount : row.makerAmount;

                    const cells: any = [
                        { title: row.orderSide, value: formatHoursAndMinutesFromTimestamp(row.timestamp) },
                        {
                            title: t('profile.history.strike'),
                            value: isRanged
                                ? `$${formatCurrency((row.marketItem as RangedMarket).leftPrice)} - $${formatCurrency(
                                      (row.marketItem as RangedMarket).rightPrice
                                  )}`
                                : `$${formatCurrency((row.marketItem as HistoricalOptionsMarketInfo).strikePrice)}`,
                        },
                        {
                            title: t('profile.history.price'),
                            value: `$${formatCurrency(optionPrice)}`,
                        },
                        {
                            title: t('profile.history.amount'),
                            value: getAmount(
                                formatCurrency(amount),
                                OPTIONS_POSITIONS_MAP[row.optionSide as OptionSide] as Positions,
                                theme,
                                (row.marketItem as SpeedMarket).isChainedSpeedMarket
                            ),
                        },
                        {
                            title: row.orderSide == 'sell' ? t('profile.history.received') : t('profile.history.paid'),
                            value: `$${formatCurrency(paidAmount)}`,
                        },
                        {
                            title: marketExpired ? t('profile.history.expired') : t('profile.history.expires'),
                            value: isSpeedMarket
                                ? formatShortDateWithTime(row.marketItem.maturityDate)
                                : formatShortDate(row.marketItem.maturityDate),
                        },
                    ];

                    if (!isMobile) {
                        cells.push({
                            value: !isSpeedMarket && (
                                <ArrowLink href={getEtherscanTxLink(networkId, row.transactionHash)} />
                            ),
                            width: '30px',
                        });
                    }

                    return {
                        asset: {
                            currencyKey: row.marketItem.currencyKey,
                        },
                        cells,
                        link: isMobile ? getEtherscanTxLink(networkId, row.transactionHash) : undefined,
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
    }, [filteredData, isMobile, networkId, t, theme]);

    return (
        <TileTable
            rows={rows as any}
            isLoading={speedMarketsDataQuery.isLoading || chainedSpeedMarketsDataQuery.isLoading}
        />
    );
};

export default TransactionHistory;
