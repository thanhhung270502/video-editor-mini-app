"use client";

import { useState } from "react";

import type { PaginationState } from "../components";

export const useTablePagination = ({ initialPageSize = 10 }: { initialPageSize?: number } = {}) => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: initialPageSize,
  });

  return {
    pagination,
    setPagination,
  };
};
