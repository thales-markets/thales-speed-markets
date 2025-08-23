import Table from 'components/Table';
import { PAGINATION_SIZE } from 'components/Table/Table';
import Tooltip from 'components/Tooltip';
import { USD_SIGN } from 'constants/currency';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { Positions } from 'enums/market';
import { t } from 'i18next';
import ChainedMarketPrice from 'pages/SpeedMarkets/components/ChainedMarketPrice';
import ChainedPosition from 'pages/SpeedMarkets/components/ChainedPosition';
import ChainedPositionAction from 'pages/SpeedMarkets/components/ChainedPositionAction';
import MarketPrice from 'pages/SpeedMarkets/components/MarketPrice';
import PositionAction from 'pages/SpeedMarkets/components/PositionAction';
import SharePosition from 'pages/SpeedMarkets/components/SharePosition';
import {
    AssetIcon,
    AssetName,
    DirectionIcon,
    FreeBetIcon,
    Header,
    ShareWrapper,
    Value,
    Wrapper,
} from 'pages/SpeedMarkets/components/UserOpenPositions/components/TablePositions/TablePositions';
import { formatCurrencyWithKey, formatCurrencyWithSign, localStore } from 'thales-utils';
import { UserChainedPosition, UserPosition } from 'types/market';
import { getCollateralByAddress, isOverCurrency } from 'utils/currency';
import { formatShortDateWithFullTime } from 'utils/formatters/date';
import { getChainedEndTime, tableSortByEndTime, tableSortByStatus } from 'utils/position';
import { useChainId } from 'wagmi';

const TableActivePositions: React.FC<{ data: (UserPosition | UserChainedPosition)[] }> = ({ data }) => {
    const networkId = useChainId();

    const columns = [
        {
            header: <Header>{t('speed-markets.user-positions.asset')}</Header>,
            accessorKey: 'currencyKey',
            cell: (cellProps: any) => {
                const position = cellProps.row.original as UserPosition;
                const isChained = position.side === undefined;

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
                                <Value>{formatCurrencyWithSign(USD_SIGN, position.strikePrice)}</Value>
                            )}
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
                const position = cellProps.row.original as UserChainedPosition;
                const isChained = position.sides !== undefined;

                return (
                    <Wrapper>
                        {isChained ? (
                            cellProps.cell.getValue().map((cellValue: any, index: number) => {
                                const hasFinalPrice = position.finalPrices[index];

                                const isPositionLost =
                                    index === position.resolveIndex &&
                                    (position.isResolved ? !position.isUserWinner : !position.isClaimable);

                                const isPositionIrrelevant = position.isResolved
                                    ? index > (position.resolveIndex || 0)
                                    : !position.isClaimable &&
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
                                className={`icon icon--caret-${(cellProps.row
                                    .original as UserPosition).side.toLowerCase()}`}
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
                const isChained = position.sides !== undefined;

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
            header: <Header>{t('speed-markets.user-positions.end-time')}</Header>,
            accessorKey: 'maturityDate',
            cell: (cellProps: any) => {
                const position = cellProps.row.original as UserChainedPosition;
                const isChained = position.sides !== undefined;

                let endTime = position.maturityDate;
                if (isChained) {
                    endTime = getChainedEndTime(position);
                }

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
            size: 90,
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
                        {position.isFreeBet && (
                            <Tooltip overlay={t('common.free-bet.claim')}>
                                <FreeBetIcon className={'icon icon--gift'} />
                            </Tooltip>
                        )}
                        <Value>
                            {position.isDefaultCollateral
                                ? formatCurrencyWithSign(USD_SIGN, cellProps.cell.getValue())
                                : formatCurrencyWithKey(collateral, cellProps.cell.getValue())}
                        </Value>
                    </Wrapper>
                );
            },
            size: 100,
        },
        {
            header: <Header>{t('speed-markets.user-positions.status')}</Header>,
            accessorKey: 'status',
            cell: (cellProps: any) => {
                const isChained = (cellProps.row.original as UserChainedPosition).sides !== undefined;
                const position = isChained
                    ? (cellProps.row.original as UserChainedPosition)
                    : (cellProps.row.original as UserPosition);

                return (
                    <Wrapper isAlignEnd={position.isClaimable}>
                        {isChained ? (
                            <ChainedPositionAction position={position as UserChainedPosition} />
                        ) : (
                            <PositionAction position={position as UserPosition} />
                        )}
                    </Wrapper>
                );
            },
            size: 300,
            enableSorting: true,
            sortDescFirst: false,
            sortingFn: tableSortByStatus,
        },
        {
            header: <></>,
            accessorKey: 'share',
            cell: (cellProps: any) => {
                const isChained = (cellProps.row.original as UserChainedPosition).sides !== undefined;

                return (
                    <Wrapper>
                        <ShareWrapper>
                            <SharePosition position={cellProps.row.original} isChained={isChained} />
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

    const isActiveClaimable = data.length && data[0].isClaimable;

    return (
        <Table
            data={data}
            columns={columns as any}
            expandedRow={(row) => {
                const isChained = (row.original.sides as UserChainedPosition) !== undefined;
                return isChained ? <ChainedPosition position={row.original} /> : <></>;
            }}
            rowsPerPage={rowsPerPage}
            tableRowCellStyles={{ paddingRight: '0' }}
            initialState={{
                sorting: [
                    {
                        id: 'maturityDate',
                        desc: isActiveClaimable,
                    },
                ],
            }}
        ></Table>
    );
};

export default TableActivePositions;
