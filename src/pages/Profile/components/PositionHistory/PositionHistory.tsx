import TileTable from 'components/TileTable';
import { USD_SIGN } from 'constants/currency';
import { ZERO_ADDRESS } from 'constants/network';
import { orderBy } from 'lodash';
import useUserResolvedChainedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserResolvedChainedSpeedMarketsDataQuery';
import useUserResolvedSpeedMarketsDataQuery from 'queries/speedMarkets/useUserResolvedSpeedMarketsDataQuery';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getIsAppReady } from 'redux/modules/app';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign, formatShortDateWithTime } from 'thales-utils';
import { UserPosition } from 'types/profile';
import { RootState, ThemeInterface } from 'types/ui';
import { isOnlySpeedMarketsSupported } from 'utils/network';
import { getStatus } from '../styled-components';
import { useAccount, useChainId, useClient } from 'wagmi';

type PositionHistoryProps = {
    searchAddress: string;
    searchText: string;
};

const PositionHistory: React.FC<PositionHistoryProps> = ({ searchAddress, searchText }) => {
    const { t } = useTranslation();
    const theme: ThemeInterface = useTheme();

    const networkId = useChainId();
    const client = useClient();
    const isAppReady = useSelector((state: RootState) => getIsAppReady(state));
    const { isConnected, address } = useAccount();

    const closedSpeedMarketsDataQuery = useUserResolvedSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress || (address as string),
        {
            enabled: isAppReady && isConnected,
        }
    );

    const closedSpeedMarketsData = useMemo(
        () =>
            closedSpeedMarketsDataQuery.isSuccess && closedSpeedMarketsDataQuery.data
                ? closedSpeedMarketsDataQuery.data
                : [],
        [closedSpeedMarketsDataQuery]
    );

    const closedChainedSpeedMarketsDataQuery = useUserResolvedChainedSpeedMarketsDataQuery(
        { networkId, client },
        searchAddress || (address as string),
        {
            enabled: isAppReady && isConnected && !isOnlySpeedMarketsSupported(networkId),
        }
    );

    const closedChainedSpeedMarketsData = useMemo(
        () =>
            closedChainedSpeedMarketsDataQuery.isSuccess && closedChainedSpeedMarketsDataQuery.data
                ? closedChainedSpeedMarketsDataQuery.data
                : [],
        [closedChainedSpeedMarketsDataQuery]
    );

    const data: UserPosition[] = useMemo(() => {
        const speedMarketsClosedPositions: UserPosition[] = closedSpeedMarketsData.map((marketData) => {
            return {
                positionAddress: ZERO_ADDRESS,
                currencyKey: marketData.currencyKey,
                strikePrice: marketData.strikePriceNum,
                leftPrice: 0,
                rightPrice: 0,
                finalPrice: marketData.finalPrice,
                payout: marketData.payout,
                maturityDate: marketData.maturityDate,
                expiryDate: marketData.maturityDate,
                market: marketData.market,
                sides: [marketData.side],
                paid: marketData.paid,
                value: marketData.value,
                claimable: false,
                claimed: marketData.isUserWinner,
                isChained: false,
            };
        });

        const chainedSpeedMarketsClosedPositions: UserPosition[] = closedChainedSpeedMarketsData.map((marketData) => {
            const lastPositivePriceIndex =
                marketData.strikePrices.length -
                1 -
                [...marketData.strikePrices].reverse().findIndex((strikePrice) => strikePrice);
            return {
                positionAddress: ZERO_ADDRESS,
                currencyKey: marketData.currencyKey,
                strikePrice: marketData.strikePrices[lastPositivePriceIndex],
                leftPrice: 0,
                rightPrice: 0,
                finalPrice: marketData.finalPrices[lastPositivePriceIndex],
                payout: marketData.payout,
                maturityDate: marketData.strikeTimes[lastPositivePriceIndex],
                expiryDate: marketData.maturityDate,
                market: marketData.address,
                sides: marketData.sides,
                paid: marketData.paid,
                value: marketData.payout,
                claimable: false,
                claimed: marketData.isUserWinner,
                isChained: true,
            };
        });

        return orderBy(
            speedMarketsClosedPositions.concat(chainedSpeedMarketsClosedPositions),
            ['maturityDate'],
            ['desc']
        );
    }, [closedSpeedMarketsData, closedChainedSpeedMarketsData]);

    const filteredData = useMemo(() => {
        if (searchText === '') return data;
        return data.filter(
            (position: UserPosition) => position.currencyKey.toLowerCase().indexOf(searchText.toLowerCase()) > -1
        );
    }, [searchText, data]);

    const rows = useMemo(() => {
        const generateRows = (data: UserPosition[]) => {
            try {
                return data.map((row: UserPosition) => {
                    const cells: any = [
                        {
                            value: getStatus(row.claimed, theme, t),
                        },
                        {
                            title: t(`profile.strike-price`),
                            value: `${formatCurrencyWithSign(USD_SIGN, row.strikePrice)}`,
                        },
                        {
                            title: t('profile.final-price'),
                            value: formatCurrencyWithSign(USD_SIGN, row.finalPrice),
                        },
                        {
                            title: t('profile.history.payout'),
                            value: formatCurrencyWithSign(USD_SIGN, row.payout, 2),
                        },
                        {
                            title: t('profile.history.expired'),
                            value: formatShortDateWithTime(row.maturityDate),
                        },
                    ];

                    return {
                        asset: {
                            currencyKey: row.currencyKey,
                        },
                        cells: cells,
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
            isLoading={closedSpeedMarketsDataQuery.isLoading || closedChainedSpeedMarketsDataQuery.isLoading}
        />
    );
};

export default PositionHistory;
