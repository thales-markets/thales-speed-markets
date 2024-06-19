import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import MyPositionAction from 'pages/SpeedMarkets/components/MyPositionAction';
import React from 'react';
import styled from 'styled-components';
import { formatCurrencyWithSign, localStore } from 'thales-utils';
import { UserPosition } from 'types/market';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import MarketPrice from '../../../MarketPrice';
import SharePosition from '../../../SharePosition';
import { PAGINATION_SIZE } from 'components/Table/Table';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Icon } from '../../../SelectPosition/styled-components';

type TablePositionsProps = {
    data: UserPosition[];
};

const TablePositions: React.FC<TablePositionsProps> = ({ data }) => {
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
                        <Value>{formatCurrencyWithSign(USD_SIGN, cellProps.row.original.strikePrice)}</Value>
                    </Wrapper>
                );
            },
        },
        {
            header: <Header>{t('speed-markets.user-positions.direction')}</Header>,
            accessorKey: 'side',
            cell: (cellProps: any) => (
                <Wrapper>
                    <DirectionIcon
                        className={`icon icon--caret-${cellProps.cell.getValue().toLowerCase()}`}
                        size={25}
                    />
                </Wrapper>
            ),
            size: 110,
        },
        {
            header: <Header>{t('speed-markets.user-positions.price')}</Header>,
            accessorKey: 'finalPrice',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>
                        <MarketPrice position={cellProps.row.original} />
                    </Value>
                </Wrapper>
            ),
        },
        {
            header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessorKey: 'maturityDate',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatShortDateWithFullTime(cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
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
            size: 100,
        },
        {
            header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessorKey: 'payout',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 120,
        },
        {
            header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessorKey: 'action',
            cell: (cellProps: any) => (
                <Wrapper>
                    <MyPositionAction position={cellProps.row.original} />
                </Wrapper>
            ),
            size: 300,
        },
        {
            header: <></>,
            accessorKey: 'share',
            cell: (cellProps: any) => (
                <Wrapper>
                    <ShareWrapper>
                        <SharePosition position={cellProps.row.original} />
                    </ShareWrapper>
                </Wrapper>
            ),
            size: 40,
        },
    ];

    const rowsPerPageLS = localStore.get(LOCAL_STORAGE_KEYS.TABLE_ROWS_PER_PAGE);
    const foundPagination = PAGINATION_SIZE.filter((obj) => obj.value === Number(rowsPerPageLS));
    const rowsPerPage = foundPagination.length ? foundPagination[0].value : undefined;

    return <Table data={data} columns={columns as any} rowsPerPage={rowsPerPage} />;
};

export const Header = styled.p`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 700;
`;

export const Wrapper = styled.div<{ isAlignStart?: boolean }>`
    display: flex;
    justify-content: ${(props) => (props.isAlignStart ? 'flex-start' : 'center')};
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 10px 0;
`;

export const AssetIcon = styled.i`
    font-size: 25px;
    line-height: 100%;
    background: ${(props) => props.theme.icon.background.primary};
    color: ${(props) => props.theme.icon.textColor.tertiary};
    border-radius: 50%;
`;

export const DirectionIcon = styled(Icon)<{ $alignUp?: boolean; $alignEmptyUp?: boolean }>`
    color: ${(props) => props.theme.icon.textColor.primary};
    ${(props) => (props.$alignUp ? 'margin-bottom: -4px;' : props.$alignEmptyUp ? 'margin-bottom: 2px;' : '')}
`;

export const Value = styled.span<{ $color?: string }>`
    color: ${(props) => (props.$color ? props.$color : props.theme.textColor.secondary)};
    font-size: 13px;
    font-weight: 700;
`;

export const AssetName = styled(Value)`
    font-weight: 800;
`;

export const ShareWrapper = styled.div`
    margin-left: auto;
`;

export default TablePositions;
