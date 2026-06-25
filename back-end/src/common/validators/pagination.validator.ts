import Joi from "joi";
import {
  DEFAULT_LIMIT,
  DEFAULT_OFFSET,
  type PaginationQueryParams,
} from "../types/pagination";

export const MAX_LIMIT = 100;

export const paginationQuerySchema = Joi.object<PaginationQueryParams>({
  limit: Joi.number().integer().min(0).max(MAX_LIMIT).optional(),
  offset: Joi.number().integer().min(0).optional(),
});

export const validatePaginationQuery = (query: unknown) =>
  paginationQuerySchema.validate(query, {
    abortEarly: false,
    stripUnknown: true,
  });

export const resolvePaginationParams = (
  value?: Partial<PaginationQueryParams>
): PaginationQueryParams | null => {
  if (value?.limit === undefined && value?.offset === undefined) {
    return null;
  }

  return {
    limit: value?.limit ?? DEFAULT_LIMIT,
    offset: value?.offset ?? DEFAULT_OFFSET,
  };
};
