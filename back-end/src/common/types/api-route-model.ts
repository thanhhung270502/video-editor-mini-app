export enum APIMethod {
  GET = "GET",
  POST = "POST",
  PUT = "PUT",
  PATCH = "PATCH",
  DELETE = "DELETE",
}

export interface APIDefinition<
  TParams extends Record<string, string> = NonNullable<unknown>,
  KQueryParams extends Record<string, any> = Record<string, any>
> {
  method: APIMethod;
  baseUrl: string;
  subUrl: string;
  pathRegex?: RegExp;
  requestBody?: any;
  responseBody: any;
  queryParams?: KQueryParams;
  customHeaders?: any;
  buildUrlPath: (params: TParams) => string;
}
