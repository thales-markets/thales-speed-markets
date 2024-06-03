import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import MarketPrice from 'pages/SpeedMarkets/components/MarketPrice';
import { DirectionIcon } from 'pages/SpeedMarkets/components/TablePositions/TablePositions';
import OverviewPositionAction from 'pages/SpeedMarketsOverview/components/OverviewPositionAction';
import React from 'react';
import styled from 'styled-components';
import { formatCurrencyWithSign } from 'thales-utils';
import { UserPosition } from 'types/market';
import { formatShortDateWithFullTime } from 'utils/formatters/date';

type TablePositionsProps = {
    data: UserPosition[];
    maxPriceDelayForResolvingSec: number;
    isAdmin: boolean;
    isSubmittingBatch: boolean;
};

const TablePositions: React.FC<TablePositionsProps> = ({
    data,
    maxPriceDelayForResolvingSec,
    isAdmin,
    isSubmittingBatch,
}) => {
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
                    <DirectionIcon
                        className={`icon icon--caret-${cellProps.cell.getValue().toLowerCase()}`}
                        size={25}
                    />
                </Wrapper>
            ),
            size: 70,
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
            size: 100,
        },
        {
            header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessorKey: 'maturityDate',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatShortDateWithFullTime(cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 160,
        },
        {
            header: <Header>{t('speed-markets.user-positions.paid')}</Header>,
            accessorKey: 'paid',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 70,
        },
        {
            header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessorKey: 'payout',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 80,
        },
        {
            header: <Header>{t('speed-markets.overview.user')}</Header>,
            accessorKey: 'user',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{cellProps.cell.getValue()}</Value>
                </Wrapper>
            ),
            size: 340,
        },
        {
            header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessorKey: 'action',
            cell: (cellProps: any) => (
                <Wrapper>
                    <OverviewPositionAction
                        position={cellProps.row.original}
                        maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                        isAdmin={isAdmin}
                        isSubmittingBatch={isSubmittingBatch}
                    />
                </Wrapper>
            ),
            size: 180,
        },
    ];

    return <Table data={data} columns={columns as any} />;
};

export const Header = styled.p`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 13px;
    font-weight: 700;
`;

export const Wrapper = styled.div<{ first?: boolean }>`
    display: flex;
    justify-content: ${(props) => (props.first ? 'flex-start' : 'center')};
    align-items: center;
    gap: 4px;
    width: 100%;
    padding: 10px 0;
`;

export const AssetIcon = styled.i`
    font-size: 25px;
    line-height: 100%;
    background: ${(props) => props.theme.icon.background.secondary};
    color: ${(props) => props.theme.icon.textColor.quaternary};
    border-radius: 50%;
`;

export const Value = styled.span`
    color: ${(props) => props.theme.textColor.primary};
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
