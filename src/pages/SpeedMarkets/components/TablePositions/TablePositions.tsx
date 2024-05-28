import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import MyPositionAction from 'pages/Profile/components/MyPositionAction';
import React from 'react';
import styled from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserOpenPositions } from 'types/market';
import { formatShortDateWithFullTime } from 'utils/formatters/date';

const TablePositions: React.FC<{ data: UserOpenPositions[]; currentPrices?: { [key: string]: number } }> = ({
    data,
    currentPrices,
}) => {
    const columns = [
        {
            header: <Header>{t('speed-markets.user-positions.asset')}</Header>,
            accessorKey: 'currencyKey',
            cell: (cellProps: any) => {
                return (
                    <AssetWrapper first>
                        <AssetIcon
                            className={`currency-icon currency-icon--${cellProps.cell.getValue().toLowerCase()}`}
                        />
                        <AssetName>{cellProps.cell.value}</AssetName>
                        <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.row.original.strikePrice)}</AssetName>
                    </AssetWrapper>
                );
            },
        },
        {
            header: <Header>{t('speed-markets.user-positions.direction')}</Header>,
            accessorKey: 'side',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    <DirectionIcon className={`icon icon--caret-${cellProps.cell.getValue().toLowerCase()}`} />
                </AssetWrapper>
            ),
        },
        {
            header: <Header>{t('speed-markets.user-positions.price')}</Header>,
            accessorKey: 'finalPrice',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    {cellProps.cell.value ? (
                        <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</AssetName>
                    ) : (
                        <AssetName>
                            {currentPrices
                                ? formatCurrencyWithSign(USD_SIGN, currentPrices[cellProps.row.original.currencyKey])
                                : ''}
                        </AssetName>
                    )}
                </AssetWrapper>
            ),
        },
        {
            header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessorKey: 'maturityDate',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetName>{formatShortDateWithFullTime(cellProps.cell.getValue())}</AssetName>
                </AssetWrapper>
            ),
        },
        {
            header: <Header>{t('speed-markets.user-positions.paid')}</Header>,
            accessorKey: 'paid',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</AssetName>
                </AssetWrapper>
            ),
            size: 120,
        },
        {
            header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessorKey: 'payout',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</AssetName>
                </AssetWrapper>
            ),
            size: 100,
        },
        {
            header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessorKey: 'action',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    <MyPositionAction position={cellProps.row.original} />
                </AssetWrapper>
            ),
            size: 400,
        },
    ];

    return <Table data={data} columns={columns as any}></Table>;
};

const Header = styled.p`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 13px;
    font-style: normal;
    font-weight: 700;
`;

const AssetWrapper = styled.div<{ first?: boolean }>`
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

const AssetName = styled.i`
    color: ${(props) => props.theme.textColor.primary};
    font-size: 13px;
    font-weight: 700;
`;

export default TablePositions;
