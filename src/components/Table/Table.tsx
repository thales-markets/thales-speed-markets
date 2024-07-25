import {
    Cell,
    Column,
    Row,
    SortingState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from '@tanstack/react-table';
import SelectInput from 'components/SelectInput';
import SimpleLoader from 'components/SimpleLoader';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { SortDirection } from 'enums/market';
import React, { CSSProperties, DependencyList, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDiv, FlexDivCentered } from 'styles/common';
import { localStore } from 'thales-utils';

export const PAGINATION_SIZE = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' },
    { value: 100, label: '100' },
];

type CSSPropertiesWithMedia = { cssProperties: CSSProperties } & { mediaMaxWidth: string };

type ColumnWithSorting<D extends Record<string, unknown>> = Column<D> & {
    sortingFn?: string | ((rowA: any, rowB: any, columnId?: string, desc?: boolean) => number);
    enableSorting?: boolean;
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
    rowsPerPage,
}) => {
    const { t } = useTranslation();

    const [sorting, setSorting] = React.useState<SortingState>(initialState.sorting ? initialState.sorting : []);
    const [pagination, setPagination] = useState({
        pageIndex: 0, //initial page index
        pageSize: rowsPerPage || PAGINATION_SIZE[0].value, //default page size
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const memoizedColumns = useMemo(() => columns, [...columnsDeps, t]);

    const tableInstance = useReactTable({
        columns: memoizedColumns,
        data,
        ...options,
        autoResetSortBy: false,
        autoResetPageIndex: false, // turn off auto reset of pageIndex
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        onSortingChange: setSorting, //optionally control sorting state in your own scope for easy access
        onPaginationChange: setPagination, // update the pagination state when internal APIs mutate the pagination state
        state: {
            sorting,
            pagination,
        },
    });

    // handle resetting the pageIndex to avoid showing empty pages (required when autoResetPageIndex is turned off)
    useEffect(() => {
        const maxPageIndex = Math.ceil(data.length / pagination.pageSize) - 1;

        if (pagination.pageIndex > maxPageIndex) {
            setPagination({ ...pagination, pageIndex: maxPageIndex });
        }
    }, [data.length, pagination]);

    return (
        <>
            {tableInstance.getHeaderGroups().map((headerGroup: any, headerGroupIndex: any) => (
                <TableRowHead style={tableRowHeadStyles} key={headerGroupIndex}>
                    {headerGroup.headers.map((header: any, headerIndex: any) => {
                        const isSortEnabled = header.column.columnDef.enableSorting;

                        return (
                            <TableCellHead
                                {...{ onClick: isSortEnabled ? header.column.getToggleSortingHandler() : undefined }}
                                cssProp={header.headStyle}
                                key={headerIndex}
                                style={
                                    isSortEnabled
                                        ? { cursor: 'pointer', ...tableHeadCellStyles }
                                        : { ...tableHeadCellStyles }
                                }
                                width={header.getSize()}
                                id={header.id}
                            >
                                <HeaderTitle cssProp={header.headTitleStyle}>
                                    {flexRender(header.column.columnDef.header, header.getContext())}{' '}
                                </HeaderTitle>
                                {isSortEnabled && (
                                    <SortIconContainer>
                                        {header.column.getIsSorted() ? (
                                            header.column.getIsSorted() === SortDirection.DESC ? (
                                                <SortIcon $isSorted className="icon icon--caret-down" />
                                            ) : (
                                                <SortIcon $isSorted className="icon icon--caret-up" />
                                            )
                                        ) : (
                                            <SortIcon className="icon icon--double-arrow" />
                                        )}
                                    </SortIconContainer>
                                )}
                            </TableCellHead>
                        );
                    })}
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
                                    {expandedRow && expandedRow(row) && expandedRow(row).type !== React.Fragment ? (
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
                    <PaginationLabel>{t('common.page')}</PaginationLabel>
                    <PaginationLabel>
                        {tableInstance.getState().pagination.pageIndex + 1} {t('common.of')}{' '}
                        {tableInstance.getPageCount().toLocaleString()}
                    </PaginationLabel>
                </SelectWrapper>

                <SelectWrapper>
                    <ArrowWrapper
                        onClick={() => tableInstance.getCanNextPage() && tableInstance.nextPage()}
                        disabled={!tableInstance.getCanNextPage()}
                    >
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
                                tableInstance.setPageSize(Number(e));
                                localStore.set(LOCAL_STORAGE_KEYS.TABLE_ROWS_PER_PAGE, Number(e));
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
                onClick={(e) => {
                    !(
                        e.target instanceof HTMLButtonElement ||
                        // quick fix for CollateralSelector
                        (e.target as HTMLElement).parentElement?.classList.contains('clickable')
                    ) && setHidden(!hidden);
                }}
            >
                {row.getAllCells().map((cell: any, cellIndex: any) => (
                    <TableCell
                        style={tableRowCellStyles}
                        key={cellIndex}
                        width={cell.column.getSize()}
                        id={cell.column.id}
                    >
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
    border-bottom: 1px solid ${(props) => props.theme.borderColor.primary};
`;

const TableRowHead = styled(TableRow)`
    min-height: 40px;
`;

const TableCell = styled(FlexDivCentered)<{ width?: number | string }>`
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

const SortIcon = styled.i<{ $isSorted?: boolean }>`
    color: ${(props) => props.theme.icon.textColor.primary};
    font-size: ${(props) => (props.$isSorted ? '11px' : '13px')};
    padding-left: 5px;
`;

const ExpandableRow = styled.div`
    display: block;
`;

const ArrowIcon = styled.i`
    font-size: 10px;
    display: flex;
    align-items: center;
    margin-left: 10px;
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
    color: ${(props) => props.theme.textColor.primary};
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
    border: 2px solid ${(props) => props.theme.borderColor.primary};
    color: ${(props) => props.theme.textColor.secondary};
    opacity: ${(props) => (props.disabled ? 0.5 : 1)};
    cursor: ${(props) => (props.disabled ? 'default' : 'pointer')};
    width: 40px;
    display: flex;
    justify-content: center;
    align-items: center;
`;

export default Table;
