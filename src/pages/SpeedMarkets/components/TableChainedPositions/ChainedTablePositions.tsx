import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import ChainedPosition from 'pages/SpeedMarkets/components/ChainedPosition';
import ChainedPositionAction from 'pages/SpeedMarkets/components/ChainedPositionAction';
import React from 'react';
import styled from 'styled-components';
import { formatCurrency, getPrecision } from 'thales-utils';
import { ChainedSpeedMarket } from 'types/market';
import { formatShortDateWithFullTime } from 'utils/formatters/date';

const TableChainedPositions: React.FC<{ data: ChainedSpeedMarket[]; currentPrices?: { [key: string]: number } }> = ({
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
                        <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.row.original.strikePrice, 2)}</AssetName>
                    </AssetWrapper>
                );
            },
        },
        {
            header: <Header>{t('speed-markets.user-positions.direction')}</Header>,
            accessorKey: 'sides',
            cell: (cellProps: any) => {
                return (
                    <AssetWrapper>
                        {cellProps.cell.getValue().map((cellValue: any, index: number) => {
                            return (
                                <DirectionIcon key={index} className={`icon icon--caret-${cellValue.toLowerCase()}`} />
                            );
                        })}
                    </AssetWrapper>
                );
            },
            size: 200,
        },
        {
            header: <Header>{t('speed-markets.user-positions.price')}</Header>,
            accessorKey: 'finalPrice',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    {cellProps.cell.value ? (
                        <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue(), 2)}</AssetName>
                    ) : (
                        <AssetName>
                            {currentPrices
                                ? formatCurrencyWithSign(USD_SIGN, currentPrices[cellProps.row.original.currencyKey], 2)
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
                    <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue(), 2)}</AssetName>
                </AssetWrapper>
            ),
        },
        {
            header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessorKey: 'payout',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    <AssetName>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue(), 2)}</AssetName>
                </AssetWrapper>
            ),
        },
        {
            header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessorKey: 'action',
            cell: (cellProps: any) => (
                <AssetWrapper>
                    <ChainedPositionAction position={cellProps.row.original} />
                </AssetWrapper>
            ),
            size: 200,
        },
    ];

    return (
        <Table
            expandedRow={(row) => {
                return <ChainedPosition position={row.original} />;
            }}
            data={data}
            columns={columns as any}
        ></Table>
    );
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

export default TableChainedPositions;
