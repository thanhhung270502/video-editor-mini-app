/**
 * The interface representing a pageable response.
 * @typeParam T The type of items in the response list.
 */
export interface PageableResponse<T> {
  total_record: number;
  data: T[];
}

/*
 * The interface representing the query parameters for pagination.
 */
export interface PaginationQueryParams {
  limit: number;
  offset: number;
}

export const DEFAULT_LIMIT = 10;
export const DEFAULT_OFFSET = 0;
