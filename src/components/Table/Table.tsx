import SimpleLoader from 'components/SimpleLoader';
import { SortDirection } from 'enums/market';
import React, { CSSProperties, DependencyList, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    useReactTable,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    flexRender,
    Row,
    Cell,
    Column,
} from '@tanstack/react-table';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered } from 'styles/common';
import SelectInput from 'components/SelectInput';

const PAGINATION_SIZE = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
];

type CSSPropertiesWithMedia = { cssProperties: CSSProperties } & { mediaMaxWidth: string };

type ColumnWithSorting<D extends Record<string, unknown>> = Column<D> & {
    sortType?: string | ((rowA: any, rowB: any, columnId?: string, desc?: boolean) => number);
    sortable?: boolean;
    headStyle?: CSSPropertiesWithMedia;
    headTitleStyle?: CSSPropertiesWithMedia;
};

type TableProps = {
    data: Record<string, unknown>[];
    columns: ColumnWithSorting<Record<string, unknown>>[];
    columnsDeps?: DependencyList;
    options?: any;
    onTableRowClick?: (row: Row<any>) => void;
    onTableCellClick?: (row: Row<any>, cell: Cell<any, any>) => void;
    isLoading?: boolean;
    noResultsMessage?: React.ReactNode;
    tableRowHeadStyles?: CSSProperties;
    tableRowStyles?: CSSProperties;
    tableHeadCellStyles?: CSSProperties;
    tableRowCellStyles?: CSSProperties;
    initialState?: any;
    onSortByChanged?: any;
    currentPage?: number;
    rowsPerPage?: number;
    tableHeight?: string;
    expandedRow?: (row: Row<any>) => JSX.Element;
    stickyRow?: JSX.Element;
};

const Table: React.FC<TableProps> = ({
    columns = [],
    columnsDeps = [],
    data = [],
    options = {},
    noResultsMessage = null,
    onTableRowClick = undefined,
    onTableCellClick = undefined,
    isLoading = false,
    tableRowHeadStyles = {},
    tableRowStyles = {},
    tableHeadCellStyles = {},
    tableRowCellStyles = {},
    initialState = {},
    expandedRow,
    stickyRow,
    tableHeight,
}) => {
    const { t } = useTranslation();

    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: 5, //default page size
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedColumns = useMemo(() => columns, [...columnsDeps, t]);
    const tableInstance = useReactTable({
        columns: memoizedColumns,
        data,
        ...options,
        initialState,
        autoResetSortBy: false,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        onPaginationChange: setPagination, //update the pagination state when internal APIs mutate the pagination state
        state: {
            //...
            pagination,
        },
    });

    return (
        <>
            {tableInstance.getHeaderGroups().map((headerGroup: any, headerGroupIndex: any) => (
                <TableRowHead style={tableRowHeadStyles} key={headerGroupIndex}>
                    {headerGroup.headers.map((header: any, headerIndex: any) => (
                        <TableCellHead
                            cssProp={header.headStyle}
                            key={headerIndex}
                            style={
                                header.sortable
                                    ? { cursor: 'pointer', ...tableHeadCellStyles }
                                    : { ...tableHeadCellStyles }
                            }
                            width={header.getSize()}
                            id={header.id}
                        >
                            <HeaderTitle cssProp={header.headTitleStyle}>
                                {' '}
                                {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                            </HeaderTitle>
                            {header.sortable && (
                                <SortIconContainer>
                                    {header.isSorted ? (
                                        header.isSortedDesc ? (
                                            <SortIcon selected sortDirection={SortDirection.DESC} />
                                        ) : (
                                            <SortIcon selected sortDirection={SortDirection.ASC} />
                                        )
                                    ) : (
                                        <SortIcon selected={false} sortDirection={SortDirection.NONE} />
                                    )}
                                </SortIconContainer>
                            )}
                        </TableCellHead>
                    ))}
                </TableRowHead>
            ))}
            <ReactTable height={tableHeight}>
                {isLoading ? (
                    <LoaderContainer>
                        <SimpleLoader />
                    </LoaderContainer>
                ) : noResultsMessage != null && !data?.length ? (
                    <NoResultContainer>{noResultsMessage}</NoResultContainer>
                ) : (
                    <TableBody>
                        {stickyRow ?? <></>}
                        {tableInstance.getPaginationRowModel().rows.map((row: any, rowIndex: any) => {
                            return (
                                <ExpandableRow key={rowIndex}>
                                    {expandedRow ? (
                                        <ExpandableRowReact
                                            row={row}
                                            tableRowCellStyles={tableRowCellStyles}
                                            isVisible={false}
                                            tableRowStyles={tableRowStyles}
                                        >
                                            {expandedRow(row)}
                                        </ExpandableRowReact>
                                    ) : (
                                        <TableRow
                                            style={tableRowStyles}
                                            cursorPointer={!!onTableRowClick}
                                            onClick={onTableRowClick ? () => onTableRowClick(row) : undefined}
                                        >
                                            {row.getAllCells().map((cell: any, cellIndex: any) => {
                                                return (
                                                    <TableCell
                                                        style={tableRowCellStyles}
                                                        key={cellIndex}
                                                        width={cell.column.getSize()}
                                                        id={cell.column.id}
                                                        onClick={
                                                            onTableCellClick
                                                                ? () => onTableCellClick(row, cell)
                                                                : undefined
                                                        }
                                                    >
                                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                    </TableCell>
                                                );
                                            })}
                                        </TableRow>
                                    )}
                                </ExpandableRow>
                            );
                        })}
                    </TableBody>
                )}
            </ReactTable>
            <PaginationWrapper>
                <SelectWrapper>
                    <ArrowWrapper
                        onClick={() => tableInstance.firstPage()}
                        disabled={!tableInstance.getCanPreviousPage()}
                    >
                        {'<<'}
                    </ArrowWrapper>
                    <ArrowWrapper
                        onClick={() => tableInstance.previousPage()}
                        disabled={!tableInstance.getCanPreviousPage()}
                    >
                        {'<'}
                    </ArrowWrapper>
                </SelectWrapper>

                <SelectWrapper className="flex items-center gap-1">
                    <PaginationLabel>Page</PaginationLabel>
                    <PaginationLabel>
                        {tableInstance.getState().pagination.pageIndex + 1} of{' '}
                        {tableInstance.getPageCount().toLocaleString()}
                    </PaginationLabel>
                </SelectWrapper>

                <SelectWrapper>
                    <ArrowWrapper onClick={() => tableInstance.nextPage()} disabled={!tableInstance.getCanNextPage()}>
                        {'>'}
                    </ArrowWrapper>
                    <ArrowWrapper onClick={() => tableInstance.lastPage()} disabled={!tableInstance.getCanNextPage()}>
                        {'>>'}
                    </ArrowWrapper>
                </SelectWrapper>

                <SelectWrapper>
                    <PaginationLabel>{t('common.pagination.rows-per-page')}</PaginationLabel>
                    <div>
                        <SelectInput
                            handleChange={(e) => {
                                console.log(e);
                                tableInstance.setPageSize(Number(e));
                            }}
                            value={{ value: pagination.pageSize, label: '' + pagination.pageSize }}
                            options={PAGINATION_SIZE}
                        />
                    </div>
                </SelectWrapper>
            </PaginationWrapper>
        </>
    );
};

const ExpandableRowReact: React.FC<{
    isVisible: boolean;
    tableRowStyles: React.CSSProperties;
    row: any;
    tableRowCellStyles: React.CSSProperties;
    children: React.ReactNode;
}> = ({ isVisible, tableRowStyles, row, tableRowCellStyles, children }) => {
    const [hidden, setHidden] = useState<boolean>(!isVisible);

    return (
        <>
            <TableRow
                style={{ ...tableRowStyles, borderBottom: hidden ? '' : 'none' }}
                cursorPointer={true}
                onClick={setHidden.bind(this, !hidden)}
            >
                {row.getAllCells().map((cell: any, cellIndex: any) => (
                    <TableCell style={tableRowCellStyles} key={cellIndex} width={cell.column.width} id={cell.column.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                ))}
                <ArrowIcon className={hidden ? 'icon icon--arrow-down' : 'icon icon--arrow-up'} />
            </TableRow>
            <ExpandableRow style={{ display: hidden ? 'none' : 'block' }}>{children}</ExpandableRow>
        </>
    );
};

const ReactTable = styled.div<{ height?: string }>`
    width: 100%;
    height: ${(props) => props.height || '100%'};
    position: relative;
    display: flex;
`;

const TableBody = styled.div`
    display: flex;
    flex-direction: column;
    width: 100%;
`;

const TableRow = styled(FlexDiv)<{ cursorPointer?: boolean }>`
    cursor: ${(props) => (props.cursorPointer ? 'pointer' : 'default')};
    min-height: 38px;
    border-bottom: 1px solid ${(props) => props.theme.borderColor.quaternary};
`;

const TableRowHead = styled(TableRow)`
    min-height: 40px;
`;

const TableCell = styled(FlexDivCentered)<{ width?: number | string; id: string }>`
    flex: 1;
    max-width: ${(props) => (props.width ? `${props.width}px` : 'initial')};
    width: 100%;
    justify-content: center;
    &:first-child {
        padding-left: 16px;
    }
    &:last-child {
        padding-right: 16px;
    }
`;

const TableCellHead = styled(TableCell)<{ cssProp?: CSSPropertiesWithMedia }>``;

const HeaderTitle = styled.span<{ cssProp?: CSSPropertiesWithMedia }>`
    text-transform: uppercase;
    @media (max-width: ${(props) => (props.cssProp ? props.cssProp.mediaMaxWidth : '600px')}) {
        ${(props) => (props.cssProp ? { ...props.cssProp.cssProperties } : '')}
    }
`;

const SortIconContainer = styled.span`
    display: flex;
    align-items: center;
`;

const LoaderContainer = styled(FlexDivCentered)`
    position: relative;
    min-height: 228px;
    width: 100%;
`;

const NoResultContainer = styled(TableRow)`
    height: 60px;
    padding-top: 20px;
    padding-left: 18px;
    font-size: 14px;
    border: none;
    margin: auto;
`;

const SortIcon = styled.i<{ selected: boolean; sortDirection: SortDirection }>`
    font-size: ${(props) => (props.selected && props.sortDirection !== SortDirection.NONE ? 22 : 19)}px;
    &:before {
        font-family: ExoticIcons !important;
        content: ${(props) =>
            props.selected
                ? props.sortDirection === SortDirection.ASC
                    ? "'\\0046'"
                    : props.sortDirection === SortDirection.DESC
                    ? "'\\0047'"
                    : "'\\0045'"
                : "'\\0045'"};
    }
    @media (max-width: 512px) {
        font-size: ${(props) => (props.selected && props.sortDirection !== SortDirection.NONE ? 17 : 14)}px;
    }
`;

const ExpandableRow = styled.div`
    display: block;
`;

const ArrowIcon = styled.i`
    font-size: 9px;
    display: flex;
    align-items: center;
    margin-right: 6px;
`;

const SelectWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    margin: 0 14px;
`;

const PaginationWrapper = styled.div`
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 10px 0;
`;

const PaginationLabel = styled.p`
    color: ${(props) => props.theme.textColor.quinary};
    font-size: 13px;
    font-weight: 700;
    line-height: 10%;
    letter-spacing: 0.13px;
`;

const ArrowWrapper = styled.span<{ disabled: boolean }>`
    height: 24px;
    font-size: 14px;
    padding: 4px;
    border-radius: 14px;
    border: 2px solid ${(props) => props.theme.borderColor.quaternary};
    color: ${(props) => props.theme.textColor.primary};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default Table;
