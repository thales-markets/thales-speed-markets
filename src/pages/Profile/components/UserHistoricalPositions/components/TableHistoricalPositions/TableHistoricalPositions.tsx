import Table from 'components/Table';
import { PAGINATION_SIZE } from 'components/Table/Table';
import { USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Positions } from 'enums/market';
import { t } from 'i18next';
import ChainedMarketPrice from 'pages/SpeedMarkets/components/ChainedMarketPrice';
import ChainedPosition from 'pages/SpeedMarkets/components/ChainedPosition';
import MarketPrice from 'pages/SpeedMarkets/components/MarketPrice';
import SharePosition from 'pages/SpeedMarkets/components/SharePosition';
import {
    AssetIcon,
    AssetName,
    DirectionIcon,
    Header,
    ShareWrapper,
    Value,
    Wrapper,
} from 'pages/SpeedMarkets/components/UserOpenPositions/components/TablePositions/TablePositions';
import { useTheme } from 'styled-components';
import { formatCurrencyWithSign, localStore } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { UserHistoryPosition } from 'types/profile';
import { ThemeInterface } from 'types/ui';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { getHistoryStatus, mapUserHistoryToPosition } from 'utils/position';
import { getStatusColor } from 'utils/style';

const TableHistoricalPositions: React.FC<{ data: UserHistoryPosition[] }> = ({ data }) => {
    const theme: ThemeInterface = useTheme();

    const columns = [
        {
            header: <Header>{t('speed-markets.user-positions.asset')}</Header>,
            accessorKey: 'currencyKey',
            cell: (cellProps: any) => {
                const position = cellProps.row.original as UserChainedPosition;
                const isChained = position.strikeTimes.length > 1;

                return (
                    <Wrapper isAlignStart>
                        <AssetIcon
                            className={`currency-icon currency-icon--${cellProps.cell.getValue().toLowerCase()}`}
                        />
                        <AssetName>{cellProps.cell.getValue()}</AssetName>
                        <Value>
                            {isChained ? (
                                <ChainedMarketPrice position={cellProps.row.original} isStrikePrice />
                            ) : (
                                <Value>{formatCurrencyWithSign(USD_SIGN, position.strikePrices[0])}</Value>
                            )}
                        </Value>
                    </Wrapper>
                );
            },
        },
        {
            header: <Header>{t('speed-markets.chained.directions')}</Header>,
            accessorKey: 'sides',
            cell: (cellProps: any) => {
                const position = cellProps.row.original as UserChainedPosition;
                const isChained = position.strikeTimes.length > 1;

                return (
                    <Wrapper>
                        {isChained ? (
                            cellProps.cell.getValue().map((cellValue: any, index: number) => {
                                const hasFinalPrice = position.finalPrices[index];
                                const isPositionLost = !position.isClaimable && index === position.resolveIndex;
                                const isPositionIrrelevant =
                                    !position.isClaimable &&
                                    position.resolveIndex !== undefined &&
                                    index > position.resolveIndex;
                                const isEmptyIcon = !hasFinalPrice || isPositionLost || isPositionIrrelevant;
                                const isUp = (cellValue.toUpperCase() as Positions) === Positions.UP;

                                return (
                                    <DirectionIcon
                                        key={index}
                                        className={
                                            isEmptyIcon
                                                ? `icon icon--caret-${cellValue.toLowerCase()}-empty`
                                                : `icon icon--caret-${cellValue.toLowerCase()}`
                                        }
                                        size={25}
                                        isDisabled={isPositionIrrelevant}
                                        $alignUp={!isEmptyIcon && isUp}
                                        $alignEmptyUp={isEmptyIcon && isUp}
                                    />
                                );
                            })
                        ) : (
                            <DirectionIcon
                                className={`icon icon--caret-${position.sides[0].toLowerCase()}`}
                                size={25}
                            />
                        )}
                    </Wrapper>
                );
            },
            size: 180,
        },
        {
            header: <Header>{t('speed-markets.user-positions.price')}</Header>,
            accessorKey: 'finalPrices',
            cell: (cellProps: any) => {
                const position = cellProps.row.original as UserChainedPosition;
                const isChained = position.strikeTimes.length > 1;

                return (
                    <Wrapper>
                        <Value>
                            {isChained ? (
                                <ChainedMarketPrice position={position} />
                            ) : (
                                <MarketPrice position={position} />
                            )}
                        </Value>
                    </Wrapper>
                );
            },
            size: 90,
        },
        {
            header: <Header>{t('speed-markets.user-positions.created-time')}</Header>,
            accessorKey: 'createdAt',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatShortDateWithFullTime(cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 180,
        },
        {
            header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessorKey: 'maturityDate',
            cell: (cellProps: any) => {
                const position = cellProps.row.original as UserChainedPosition;
                const isChained = position.strikeTimes.length > 1;

                let endTime = position.maturityDate;
                if (isChained) {
                    const strikeTimeIndex = position.strikeTimes.findIndex((t) => t > Date.now());
                    endTime =
                        position.resolveIndex !== undefined
                            ? position.strikeTimes[position.resolveIndex]
                            : strikeTimeIndex > -1
                            ? position.strikeTimes[strikeTimeIndex]
                            : cellProps.cell.getValue();
                }

                return (
                    <Wrapper>
                        <Value>{formatShortDateWithFullTime(endTime)}</Value>
                    </Wrapper>
                );
            },
            size: 180,
        },
        {
            header: <Header>{t('speed-markets.user-positions.paid')}</Header>,
            accessorKey: 'paid',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 90,
        },
        {
            header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessorKey: 'payout',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 100,
        },
        {
            header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessorKey: 'status',
            cell: (cellProps: any) => {
                const status = getHistoryStatus(cellProps.row.original);
                return (
                    <Wrapper>
                        <Value $color={getStatusColor(status, theme)}>{status}</Value>
                    </Wrapper>
                );
            },
            size: 120,
        },
        {
            header: <></>,
            accessorKey: 'share',
            cell: (cellProps: any) => {
                const isChained = (cellProps.row.original as UserChainedPosition).strikeTimes.length > 1;
                const position = isChained
                    ? (cellProps.row.original as UserChainedPosition)
                    : mapUserHistoryToPosition(cellProps.row.original as UserHistoryPosition);

                return (
                    <Wrapper>
                        <ShareWrapper>
                            <SharePosition position={position} isChained={isChained} />
                        </ShareWrapper>
                    </Wrapper>
                );
            },
            size: 40,
        },
    ];

    const rowsPerPageLS = localStore.get(LOCAL_STORAGE_KEYS.TABLE_ROWS_PER_PAGE);
    const foundPagination = PAGINATION_SIZE.filter((obj) => obj.value === Number(rowsPerPageLS));
    const rowsPerPage = foundPagination.length ? foundPagination[0].value : undefined;

    return (
        <Table
            data={data}
            columns={columns as any}
            expandedRow={(row) => {
                const isChained = (row.original as UserChainedPosition).strikeTimes.length > 1;
                return isChained ? <ChainedPosition position={row.original} /> : <></>;
            }}
            rowsPerPage={rowsPerPage}
            tableRowCellStyles={{ paddingRight: '0' }}
        ></Table>
    );
};

export default TableHistoricalPositions;
