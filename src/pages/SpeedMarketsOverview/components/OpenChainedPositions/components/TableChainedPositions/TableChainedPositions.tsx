import Table from 'components/Table';
import { USD_SIGN } from 'constants/currency';
import { Positions } from 'enums/market';
import { t } from 'i18next';
import ChainedMarketPrice from 'pages/SpeedMarkets/components/ChainedMarketPrice';
import ChainedPosition from 'pages/SpeedMarkets/components/ChainedPosition';
import ChainedPositionAction from 'pages/SpeedMarkets/components/ChainedPositionAction';
import { DirectionIcon } from 'pages/SpeedMarkets/components/UserOpenPositions/components/TablePositions/TablePositions';
import React from 'react';
import { formatCurrencyWithKey, formatCurrencyWithSign } from 'thales-utils';
import { UserChainedPosition } from 'types/market';
import { getCollateralByAddress, isOverCurrency } from 'utils/currency';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { getChainedEndTime } from 'utils/position';
import { useChainId } from 'wagmi';
import {
    AssetIcon,
    AssetName,
    Header,
    Value,
    Wrapper,
} from '../../../OpenPositions/components/TablePositions/TablePositions';

type TablePositionsProps = {
    data: UserChainedPosition[];
    maxPriceDelayForResolvingSec: number;
    isAdmin: boolean;
    isSubmittingBatch: boolean;
};

const TableChainedPositions: React.FC<TablePositionsProps> = ({
    data,
    maxPriceDelayForResolvingSec,
    isAdmin,
    isSubmittingBatch,
}) => {
    const networkId = useChainId();

    const columns = [
        {
            header: <Header>{t('speed-markets.user-positions.asset')}</Header>,
            accessorKey: 'currencyKey',
            cell: (cellProps: any) => {
                return (
                    <Wrapper isFirst>
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
            size: 170,
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
            size: 70,
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
            size: 140,
        },
        {
            header: <Header>{t('speed-markets.user-positions.paid')}</Header>,
            accessorKey: 'paid',
            cell: (cellProps: any) => {
                const position = cellProps.row.original;
                const collateralByAddress = getCollateralByAddress(position.collateralAddress, networkId);
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
            size: 50,
        },
        {
            header: <Header>{t('speed-markets.user-positions.payout')}</Header>,
            accessorKey: 'payout',
            cell: (cellProps: any) => {
                const position = cellProps.row.original;
                const collateralByAddress = getCollateralByAddress(position.collateralAddress, networkId);
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
            size: 60,
        },
        {
            header: <Header>{t('speed-markets.overview.user')}</Header>,
            accessorKey: 'user',
            cell: (cellProps: any) => (
                <Wrapper>
                    <Value>{cellProps.cell.getValue()}</Value>
                </Wrapper>
            ),
            size: 330,
        },
        {
            header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessorKey: 'action',
            cell: (cellProps: any) => (
                <Wrapper>
                    <ChainedPositionAction
                        position={cellProps.row.original}
                        maxPriceDelayForResolvingSec={maxPriceDelayForResolvingSec}
                        isOverview
                        isAdmin={isAdmin}
                        isSubmittingBatch={isSubmittingBatch}
                    />
                </Wrapper>
            ),
            size: 164,
        },
    ];

    return (
        <Table
            data={data}
            columns={columns as any}
            columnsDeps={[isAdmin, isSubmittingBatch]}
            expandedRow={(row) => {
                return <ChainedPosition position={row.original} />;
            }}
        ></Table>
    );
};

export default TableChainedPositions;
