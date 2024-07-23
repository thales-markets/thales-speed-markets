import Table from 'components/Table';
import { PAGINATION_SIZE } from 'components/Table/Table';
import { USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { t } from 'i18next';
import ChainedPosition from 'pages/SpeedMarkets/components/ChainedPosition';
import ChainedPositionAction from 'pages/SpeedMarkets/components/ChainedPositionAction';
import React from 'react';
import { formatCurrencyWithSign, localStore } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import ChainedMarketPrice from '../../../ChainedMarketPrice';
import SharePosition from '../../../SharePosition';
import {
    AssetIcon,
    AssetName,
    DirectionIcon,
    Header,
    ShareWrapper,
    Value,
    Wrapper,
} from '../TablePositions/TablePositions';
import { Positions } from 'enums/market';
import { getChainedEndTime, tableSortByEndTime, tableSortByStatus } from 'utils/position';

const TableChainedPositions: React.FC<{ data: UserChainedPosition[] }> = ({ data }) => {
    const columns = [
        {
            header: <Header>{t('speed-markets.user-positions.asset')}</Header>,
            accessorKey: 'currencyKey',
            cell: (cellProps: any) => {
                return (
                    <Wrapper isAlignStart>
                        <AssetIcon
                            className={`currency-icon currency-icon--${cellProps.cell.getValue().toLowerCase()}`}
                        />
                        <AssetName>{cellProps.cell.getValue()}</AssetName>
                        <Value>
                            <ChainedMarketPrice position={cellProps.row.original} isStrikePrice />
                        </Value>
                    </Wrapper>
                );
            },
            enableSorting: true,
            sortDescFirst: false,
            sortingFn: 'alphanumeric',
        },
        {
            header: <Header>{t('speed-markets.chained.directions')}</Header>,
            accessorKey: 'sides',
            cell: (cellProps: any) => {
                return (
                    <Wrapper>
                        {cellProps.cell.getValue().map((cellValue: any, index: number) => {
                            const position = cellProps.row.original as UserChainedPosition;

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
                        })}
                    </Wrapper>
                );
            },
            size: 180,
        },
        {
            header: <Header>{t('speed-markets.user-positions.price')}</Header>,
            accessorKey: 'finalPrices',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>
                        <ChainedMarketPrice position={cellProps.row.original} />
                    </Value>
                </Wrapper>
            ),
            size: 90,
        },
        {
            header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessorKey: 'maturityDate',
            cell: (cellProps: any) => {
                const position = cellProps.row.original as UserChainedPosition;
                const endTime = getChainedEndTime(position);

                return (
                    <Wrapper>
                        <Value>{formatShortDateWithFullTime(endTime)}</Value>
                    </Wrapper>
                );
            },
            size: 180,
            enableSorting: true,
            sortDescFirst: false,
            sortingFn: tableSortByEndTime,
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
            accessorKey: 'action',
            cell: (cellProps: any) => (
                <Wrapper>
                    <ChainedPositionAction position={cellProps.row.original} />
                </Wrapper>
            ),
            size: 300,
            enableSorting: true,
            sortDescFirst: false,
            sortingFn: tableSortByStatus,
        },
        {
            header: <></>,
            accessorKey: 'share',
            cell: (cellProps: any) => (
                <Wrapper>
                    <ShareWrapper>
                        <SharePosition position={cellProps.row.original} isChained />
                    </ShareWrapper>
                </Wrapper>
            ),
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
                return <ChainedPosition position={row.original} />;
            }}
            rowsPerPage={rowsPerPage}
        ></Table>
    );
};

export default TableChainedPositions;
