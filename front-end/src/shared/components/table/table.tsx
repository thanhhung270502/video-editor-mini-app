"use client";

import React, { useCallback, useEffect, useMemo } from "react";
import type {
  ColumnDef,
  ColumnMeta,
  ColumnOrderState,
  ColumnPinningState,
  ExpandedState,
  InitialTableState,
  OnChangeFn,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
  TableOptions,
} from "@tanstack/react-table";
import {
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { cva } from "class-variance-authority";

import { cn } from "@/shared/utils";

import { Separator, Skeleton, SortDirectionIcon, TableFooter, TablePagination } from "..";
import { ArrowDownUpIcon } from "lucide-react";

type ColumnMetaWithOnClick<T extends RowData> = ColumnMeta<T, unknown> & {
  onClick?: (row: T) => void;
};

type BaseTableStyleProps = {
  // Container styles
  containerClassName?: string;

  // Header styles
  headerClassName?: string;
  headerCellClassName?: string;

  // Body styles
  bodyClassName?: string;
  cellClassName?: string;

  // Empty state styles
  emptyStateClassName?: string;
};

type BaseTableProps<T extends RowData> = BaseTableStyleProps & {
  // Core data props
  data: T[];
  columns: ColumnDef<T>[];
  isLoading?: boolean;
  isFetching?: boolean;
  initialState?: InitialTableState;

  // Table configuration
  tableProps?: Omit<TableOptions<T>, "columns" | "data" | "getCoreRowModel">;

  // Sorting
  sorting?: SortingState;
  setSorting?: OnChangeFn<SortingState>;
  manualSorting?: boolean;

  // Pagination
  enablePagination?: boolean;
  pagination?: PaginationState;
  setPagination?: OnChangeFn<PaginationState>;
  manualPagination?: boolean;
  rowCount?: number;
  paginationWrapperClassName?: string;
  showPageSizeSelector?: boolean;

  // Ordering
  columnOrder?: ColumnOrderState;
  setColumnOrder?: OnChangeFn<ColumnOrderState>;

  // Filtering
  globalFilter?: string;
  setGlobalFilter?: OnChangeFn<any>;

  // Selection
  rowSelection?: RowSelectionState;
  setRowSelection?: OnChangeFn<RowSelectionState>;
  rowClassName?: string | ((row: T) => string);

  // Visibility and interaction
  columnVisibility?: Record<string, boolean>;
  setColumnVisibility?: OnChangeFn<Record<string, boolean>>;
  columnPinning?: ColumnPinningState;
  onRowClick?: (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>, row: T) => void;

  // Expansion/detail panel
  expanded?: ExpandedState;
  onExpandedChange?: OnChangeFn<ExpandedState>;

  // Misc
  emptyState?: React.ReactNode;

  // Footer configuration
  selectedCount?: number;
  footerSelectedLabel?: string;
  footerActions?: React.ReactNode;
};

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_STATE_HEIGHT = "h-[200px]";

const baseContainerClassNames =
  "border-brand-primary bg-brand-primary-dark flex h-full w-full flex-col overflow-hidden rounded-2xl border";
const baseHeaderClassNames = "flex-shrink-0";
const baseHeaderCellClassNames =
  "group text-brand-primary-light flex items-center gap-sm text-[11px] font-bold tracking-wider uppercase";
const baseRowClassNames = cva("hover:bg-brand-primary/5 transition-colors", {
  variants: {
    variant: {
      default: "",
      striped: "",
    },
  },
});
const baseCellClassNames =
  "border-brand-primary border-b px-5 py-4 text-left align-middle text-sm text-white";
const baseBodyClassNames = "relative min-h-0 overflow-auto [&_tr:last-child_td]:border-b-0";

export function Table<T extends RowData>({
  // Core data
  data,
  columns,
  isLoading = false,

  // Table configuration
  tableProps,

  // Sorting
  sorting,
  setSorting,
  manualSorting,

  // Pagination
  pagination,
  setPagination,
  rowCount,
  paginationWrapperClassName,
  manualPagination,
  showPageSizeSelector,

  // Ordering
  columnOrder,
  setColumnOrder,

  // Filtering
  globalFilter,
  setGlobalFilter,

  // Selection
  rowSelection,
  setRowSelection,

  // Visibility and interaction
  columnVisibility,
  setColumnVisibility,
  columnPinning,
  onRowClick,

  // Expansion/detail panel
  expanded,
  onExpandedChange,

  // Styling
  containerClassName,
  headerClassName,
  headerCellClassName,
  bodyClassName,
  rowClassName,
  cellClassName,
  emptyStateClassName,

  // Misc
  emptyState,

  // Footer configuration
  selectedCount,
  footerSelectedLabel = "selected",
  footerActions,
}: BaseTableProps<T>) {
  const tableData = useMemo(
    () => (isLoading ? (Array(DEFAULT_PAGE_SIZE).fill({}) as T[]) : data),
    [isLoading, data]
  );

  const tableColumns = useMemo(
    () =>
      isLoading
        ? columns.map((col) => ({
            ...col,
            cell: () => <Skeleton className="h-5 w-full" />,
          }))
        : columns,
    [isLoading, columns]
  );

  const table = useReactTable({
    data: tableData,
    columns: tableColumns,
    enableColumnPinning: true,
    enableRowSelection: true,
    state: {
      ...(sorting && { sorting }),
      ...(pagination && { pagination }),
      ...(globalFilter !== undefined && { globalFilter }),
      ...(rowSelection && { rowSelection }),
      ...(columnVisibility && { columnVisibility }),
      ...(columnPinning && { columnPinning }),
      ...(expanded && { expanded }),
      ...(columnOrder && { columnOrder }),
    },
    getCoreRowModel: getCoreRowModel(),
    ...(!manualPagination && { getPaginationRowModel: getPaginationRowModel() }),
    ...(setRowSelection && { onRowSelectionChange: setRowSelection }),
    ...(setPagination && { onPaginationChange: setPagination }),
    ...(setColumnVisibility && { onColumnVisibilityChange: setColumnVisibility }),
    ...(onExpandedChange && { onExpandedChange, getExpandedRowModel: getExpandedRowModel() }),
    ...(setColumnOrder && { onColumnOrderChange: setColumnOrder }),
    ...(!manualSorting && { getSortedRowModel: getSortedRowModel() }),
    getFilteredRowModel: getFilteredRowModel(),
    ...(setSorting && { onSortingChange: setSorting }),
    ...(setGlobalFilter && { onGlobalFilterChange: setGlobalFilter }),
    globalFilterFn: "auto",
    manualPagination: manualPagination,
    manualSorting: manualSorting,
    ...(rowCount && { rowCount }),
    ...tableProps,
  });

  // Note: 'table' omitted from deps - it uses interior mutability
  useEffect(() => {
    if (pagination && setPagination) {
      const currentPagination = table.getState().pagination;
      if (
        currentPagination.pageIndex !== pagination.pageIndex ||
        currentPagination.pageSize !== pagination.pageSize
      ) {
        table.setPageIndex(pagination.pageIndex);
        table.setPageSize(pagination.pageSize);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination, setPagination]);

  const handleRowClick = useCallback(
    (row: Row<T>) => (e: React.MouseEvent<HTMLTableRowElement, MouseEvent>) => {
      onRowClick?.(e, row.original);
      const isExpanded = row.getIsExpanded();
      if (isExpanded) {
        row.toggleExpanded();
      }
    },
    [onRowClick]
  );

  // Note: 'table' omitted from deps - it uses interior mutability
  const handleChangePageSize = useCallback(
    (size: string) => {
      const newSize = Number(size);
      const newPagination = {
        pageIndex: 0,
        pageSize: newSize,
      };
      table.setPageSize(newSize);
      setPagination?.(newPagination);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [setPagination]
  );

  // Determine if pagination should be shown
  const showPagination = pagination && setPagination;

  const headers = table.getFlatHeaders();
  const rows = table.getRowModel().rows || [];

  return (
    <div className={cn(baseContainerClassNames, containerClassName)}>
      <div className="relative flex h-full flex-col">
        <div className="relative min-h-0 flex-1 overflow-auto">
          <table className="w-full caption-bottom border-collapse">
            <thead className={cn(baseHeaderClassNames, headerClassName, "sticky top-0 z-10")}>
              <tr>
                {headers.map((header) => {
                  const direction = header.column.getIsSorted();
                  const canSort = header.column.getCanSort();
                  const toggleSorting = header.column.getToggleSortingHandler();
                  const label = flexRender(header.column.columnDef.header, header.getContext());
                  return (
                    <th
                      key={header.id}
                      colSpan={header.colSpan}
                      onClick={toggleSorting}
                      style={{
                        minWidth: `${header.getSize()}px`,
                      }}
                      className={cn(
                        "border-brand-primary bg-white/2 border-b px-5 py-3.5 text-left align-middle"
                      )}
                    >
                      <div
                        className={cn(
                          baseHeaderCellClassNames,
                          canSort && "cursor-pointer select-none",
                          headerCellClassName
                        )}
                      >
                        <span>{label}</span>
                        {canSort && !direction && (
                          <ArrowDownUpIcon
                            size={16}
                            className="text-brand-primary-light group-hover:text-white"
                          />
                        )}
                        {direction && <SortDirectionIcon direction={direction} />}
                      </div>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody className={cn(baseBodyClassNames, bodyClassName)}>
              {rows.length > 0 ? (
                rows.map((row, rowIndex) => {
                  const isStriped = rowIndex % 2 === 0;
                  const rowVariant = isStriped ? "striped" : "default";
                  const cells = row.getVisibleCells();
                  return (
                    <React.Fragment key={row.id}>
                      <tr
                        role="row"
                        id={row.id}
                        onClick={handleRowClick(row)}
                        className={cn(
                          baseRowClassNames({ variant: rowVariant }),
                          onRowClick && "cursor-pointer",
                          typeof rowClassName === "function"
                            ? rowClassName(row.original)
                            : rowClassName
                        )}
                      >
                        {cells.map((cell) => {
                          const columnDef = cell.column.columnDef as ColumnDef<T, unknown>;
                          const meta = columnDef.meta as ColumnMetaWithOnClick<T> | undefined;
                          const label = flexRender(cell.column.columnDef.cell, cell.getContext());
                          return (
                            <td
                              key={cell.id}
                              className={cn(baseCellClassNames, cellClassName)}
                              onClick={(e) => {
                                if (meta?.onClick) {
                                  e.stopPropagation();
                                  meta.onClick(row.original);
                                }
                              }}
                              style={{
                                minWidth: `${cell.column.getSize()}px`,
                              }}
                            >
                              {label}
                            </td>
                          );
                        })}
                      </tr>
                    </React.Fragment>
                  );
                })
              ) : (
                // Empty state
                <tr>
                  <td colSpan={table.getAllFlatColumns().length} className={cn(EMPTY_STATE_HEIGHT)}>
                    <div
                      className={cn(
                        "text-brand-primary-light body-lg flex h-full items-center justify-center",
                        emptyStateClassName
                      )}
                    >
                      {emptyState || "No data available"}
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Separator />
        <TableFooter
          selectedCount={selectedCount}
          selectedLabel={footerSelectedLabel}
          actions={footerActions}
        >
          {showPagination ? (
            <TablePagination<T>
              table={table}
              rowCount={rowCount || table.getFilteredRowModel().rows.length}
              onChangePageSize={handleChangePageSize}
              wrapperClassName={paginationWrapperClassName}
              showPageSizeSelector={showPageSizeSelector}
            />
          ) : null}
        </TableFooter>
      </div>
    </div>
  );
}

Table.displayName = "Table";
export type {
  BaseTableProps,
  ColumnDef,
  ColumnOrderState,
  OnChangeFn,
  PaginationState,
  Row,
  RowData,
  RowSelectionState,
  SortingState,
};
