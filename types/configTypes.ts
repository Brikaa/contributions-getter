type PartialResponse = Pick<Response, 'json' | 'status' | 'statusText'>;
export type FetchType = (...args: Parameters<typeof fetch>) => Promise<PartialResponse>;

export interface Config {
  monthsInterval?: number;
  fetchFn?: FetchType;
}
