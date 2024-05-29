import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import MyPositionAction from 'pages/Profile/components/MyPositionAction';
import React from 'react';
import styled from 'styled-components';
import { formatCurrencyWithSign, localStore } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import MarketPrice from '../MarketPrice';
import SharePosition from '../SharePosition';
import { PAGINATION_SIZE } from 'components/Table/Table';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';

const TablePositions: React.FC<{ data: UserOpenPositions[] }> = ({ data }) => {
    const columns = [
        {
            header: <Header>{t('speed-markets.user-positions.asset')}</Header>,
            accessorKey: 'currencyKey',
            cell: (cellProps: any) => {
                return (
                    <Wrapper first>
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
                    <DirectionIcon className={`icon icon--caret-${cellProps.cell.getValue().toLowerCase()}`} />
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
    const rowsPerPage =
        PAGINATION_SIZE.filter((obj) => obj.value === Number(rowsPerPageLS))[0].value || PAGINATION_SIZE[0].value;

    return <Table data={data} columns={columns as any} rowsPerPage={rowsPerPage} />;
};

const Header = styled.p`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 13px;
    font-style: normal;
    font-weight: 700;
`;

const Wrapper = styled.div<{ first?: boolean }>`
    display: flex;
    justify-content: ${(props) => (props.first ? 'flex-start' : 'center')};
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 10px 0;
`;

const AssetIcon = styled.i`
    font-size: 25px;
    line-height: 100%;
    background: ${(props) => props.theme.dropDown.background.primary};
    color: ${(props) => props.theme.dropDown.textColor.primary};
    border-radius: 50%;
`;

const DirectionIcon = styled(AssetIcon)`
    background: ${(props) => props.theme.background.primary};
    color: ${(props) => props.theme.icon.background.tertiary};
`;

const AssetName = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 800;
`;

const Value = styled.span`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 700;
`;

const ShareWrapper = styled.div`
    margin-left: auto;
`;

export default TablePositions;
