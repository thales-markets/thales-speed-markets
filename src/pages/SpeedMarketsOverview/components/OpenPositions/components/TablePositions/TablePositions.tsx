import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { t } from 'i18next';
import MarketPrice from 'pages/SpeedMarkets/components/MarketPrice';
import PositionAction from 'pages/SpeedMarkets/components/PositionAction';
import { DirectionIcon } from 'pages/SpeedMarkets/components/UserOpenPositions/components/TablePositions/TablePositions';
import React from 'react';
import styled from 'styled-components';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { UserPosition } from 'types/market';
import { getCollateralByAddress, isOverCurrency } from 'utils/currency';
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
                        <MarketPrice position={cellProps.row.original} isRefetchDisabled />
                    </Value>
                </Wrapper>
            ),
            size: 80,
        },
        {
            header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessorKey: 'maturityDate',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{formatShortDateWithFullTime(cellProps.cell.getValue())}</Value>
                </Wrapper>
            ),
            size: 140,
        },
        {
            header: <Header>{t('speed-markets.user-positions.paid')}</Header>,
            accessorKey: 'paid',
            cell: (cellProps: any) => {
                const position = cellProps.row.original;
                const collateralByAddress = getCollateralByAddress(position.collateralAddress, position.networkId);
                const collateral = `${isOverCurrency(collateralByAddress) ? '$' : ''}${collateralByAddress}`;
                return (
                    <Wrapper>
                        <Value>
                            {position.isDefaultCollateral
                                ? formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())
                                : formatCurrencyWithKey(collateral, cellProps.cell.getValue())}
                        </Value>
                    </Wrapper>
                );
            },
            size: 95,
        },
        {
            header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessorKey: 'payout',
            cell: (cellProps: any) => {
                const position = cellProps.row.original;
                const collateralByAddress = getCollateralByAddress(position.collateralAddress, position.networkId);
                const collateral = `${isOverCurrency(collateralByAddress) ? '$' : ''}${collateralByAddress}`;
                return (
                    <Wrapper>
                        <Value>
                            {position.isDefaultCollateral
                                ? formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())
                                : formatCurrencyWithKey(collateral, cellProps.cell.getValue())}
                        </Value>
                    </Wrapper>
                );
            },
            size: 95,
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
                    <PositionAction
                        position={cellProps.row.original}
                        maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                        isOverview
                        isAdmin={isAdmin}
                        isSubmittingBatch={isSubmittingBatch}
                    />
                </Wrapper>
            ),
            size: 180,
        },
    ];

    return <Table data={data} columns={columns as any} columnsDeps={[isAdmin, isSubmittingBatch]} />;
};

export const Header = styled.p`
    color: ${(props) => props.theme.textColor.primary};
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
    background: ${(props) => props.theme.icon.background.primary};
    color: ${(props) => props.theme.icon.textColor.tertiary};
    border-radius: 50%;
`;

export const Value = styled.span`
    color: ${(props) => props.theme.textColor.secondary};
    font-size: 13px;
    font-weight: 700;
`;

export const AssetName = styled(Value)`
    font-weight: 800;
`;

export default TablePositions;
