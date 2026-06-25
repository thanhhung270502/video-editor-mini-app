export interface ApiResponse<T = undefined> {
  success: boolean;
  message?: string;
  data?: T;
}

export type {
  PageableResponse,
  PaginationQueryParams,
} from './pagination';
export {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
} from './pagination';
