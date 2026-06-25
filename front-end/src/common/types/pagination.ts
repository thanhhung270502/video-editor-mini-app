export interface PaginationParams {
  limit?: number;
  offset?: number;
}

export interface PaginatedMeta {
  total_record: number;
  limit?: number;
  offset?: number;
}

export const DEFAULT_PAGE_SIZE = 10;

export const buildPaginationQueryString = (
  params?: PaginationParams & { search?: string; status?: string }
): string => {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  const entries: Record<string, string | number | undefined> = {
    limit: params.limit,
    offset: params.offset,
    search: params.search,
    status: params.status,
  };

  Object.entries(entries).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};
