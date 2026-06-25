"use client";

import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import type { Table } from "@tanstack/react-table";

import { cn } from "@/shared/utils";

import { Button } from "../button";
import { Select } from "../select";
import { Separator } from "../separator";

interface TablePaginationProps<T> {
  table: Table<T>;
  rowCount: number;
  onChangePageSize: (size: string) => void;
  wrapperClassName?: string;
  showPageSizeSelector?: boolean;
}

const pageSizeOptions = [
  { value: 10, label: "10" },
  { value: 25, label: "25" },
  { value: 50, label: "50" },
  { value: 100, label: "100" },
];

export function TablePagination<T>({
  table,
  rowCount,
  onChangePageSize,
  wrapperClassName,
  showPageSizeSelector = true,
}: TablePaginationProps<T>) {
  const { getState, getCanPreviousPage, getCanNextPage, previousPage, nextPage } = table;

  const { pagination } = getState();
  const { pageIndex, pageSize } = pagination;

  const pageStart = rowCount > 0 ? pageIndex * pageSize + 1 : 0;
  const pageEnd = Math.min((pageIndex + 1) * pageSize, rowCount);

  const selectedPageSizeOption =
    pageSizeOptions.find((option) => option.value === pageSize) || pageSizeOptions[0];

  const handlePreviousPage = () => {
    if (getCanPreviousPage()) {
      previousPage();
    }
  };

  const handleNextPage = () => {
    if (getCanNextPage()) {
      nextPage();
    }
  };

  return (
    <div className={cn(wrapperClassName)}>
      <div className="gap-xl ml-auto flex w-fit flex-col items-end justify-center md:flex-row">
        {showPageSizeSelector && (
          <Select
            value={selectedPageSizeOption}
            onChange={(option) => {
              if (option && "value" in option) {
                onChangePageSize(option.value.toString());
              }
            }}
            options={pageSizeOptions}
            placeholder="Rows per page"
            formatOptionLabel={(option) => {
              return (
                <span className="text-primary body-md font-medium">
                  {option.value} <span className="font-regular text-secondary"> per page</span>
                </span>
              );
            }}
            size="sm"
            className="min-w-37.5"
            menuPosition="absolute"
            menuPlacement="top"
            isSearchable={false}
          />
        )}

        <div className="border-brand-primary flex w-fit items-center rounded-4xl border border-solid">
          <div className="pl-2xl py-md pr-md">
            <span className="body-md font-medium text-white">
              {pageStart}-{pageEnd}{" "}
              <span className="font-regular text-neutral-300"> of {rowCount}</span>
            </span>
          </div>

          <Separator orientation="vertical" />

          <div className="flex items-center">
            <Button
              variant="primary"
              size="sm"
              onClick={handlePreviousPage}
              disabled={!getCanPreviousPage()}
              iconOnly
              className="border-0 bg-transparent text-white"
              rounded="full"
            >
              <ArrowLeftIcon size={16} />
            </Button>

            <Button
              variant="primary"
              size="sm"
              onClick={handleNextPage}
              disabled={!getCanNextPage()}
              iconOnly
              className="border-0 bg-transparent text-white"
              rounded="full"
            >
              <ArrowRightIcon size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
