import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import MyPositionAction from 'pages/Profile/components/MyPositionAction';
import React from 'react';
import styled from 'styled-components';
import { formatCurrency, getPrecision } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { formatShortDateWithFullTime } from 'utils/formatters/date';

const TablePositions: React.FC<{ data: UserOpenPositions[]; currentPrices?: { [key: string]: number } }> = ({
    data,
    currentPrices,
}) => {
    const columns = [
        {
            Header: <Header>{t('speed-markets.user-positions.asset')}</Header>,
            accessor: 'currencyKey',
            Cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetIcon className={`currency-icon currency-icon--${cellProps.cell.value.toLowerCase()}`} />
                    <AssetName>{cellProps.cell.value}</AssetName>
                    <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.row.original.strikePrice, 2)}</AssetName>
                </AssetWrapper>
            ),

            sortable: false,
        },
        {
            Header: <Header>{t('speed-markets.user-positions.direction')}</Header>,
            accessor: 'side',
            Cell: (cellProps: any) => (
                <AssetWrapper>
                    <DirectionIcon className={`icon icon--caret-${cellProps.cell.value.toLowerCase()}`} />
                </AssetWrapper>
            ),
            width: 100,
            sortable: false,
        },
        {
            Header: <Header>{t('speed-markets.user-positions.price')}</Header>,
            accessor: 'finalPrice',
            Cell: (cellProps: any) => (
                <AssetWrapper>
                    {cellProps.cell.value ? (
                        <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</AssetName>
                    ) : (
                        <AssetName>
                            {currentPrices
                                ? formatCurrencyWithSign(USD_SIGN, currentPrices[cellProps.row.original.currencyKey], 2)
                                : ''}
                        </AssetName>
                    )}
                </AssetWrapper>
            ),
            width: 150,
            sortable: false,
        },
        {
            Header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessor: 'maturityDate',
            Cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetName>{formatShortDateWithFullTime(cellProps.cell.value)}</AssetName>
                </AssetWrapper>
            ),
            width: 200,
            sortable: false,
        },
        {
            Header: <Header>{t('speed-markets.user-positions.paid')}</Header>,
            accessor: 'paid',
            Cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</AssetName>
                </AssetWrapper>
            ),
            width: 100,
            sortable: false,
        },
        {
            Header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessor: 'payout',
            Cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.value, 2)}</AssetName>
                </AssetWrapper>
            ),
            width: 100,
            sortable: false,
        },
        {
            Header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessor: 'action',
            Cell: (cellProps: any) => (
                <AssetWrapper>
                    <MyPositionAction position={cellProps.row.original} />
                </AssetWrapper>
            ),
            width: 400,
            sortable: false,
        },
    ];

    return <Table data={data} columns={columns}></Table>;
};

const Header = styled.p`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 13px;
    font-style: normal;
    font-weight: 700;
`;

const AssetWrapper = styled.div`
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 4px;
    padding: 14px 0 10px 0;
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

const AssetName = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 700;
`;

export const formatCurrencyWithSign = (
    sign: string | null | undefined,
    value: number,
    decimals?: number,
    trimDecimals?: boolean
) => {
    return `${Number(value) < 0 ? '-' : ''}${sign ? sign + '' : ''}${formatCurrency(
        typeof value == 'number' ? Math.abs(value) : value,
        decimals !== undefined ? decimals : getPrecision(value),
        trimDecimals
    )}`;
};

export default TablePositions;
