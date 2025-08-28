import { AsyncLocalStorage } from 'async_hooks';

export interface RequestN8nApiOverride {
  baseUrl: string;
  apiKey: string;
  timeout?: number;
  maxRetries?: number;
}

export interface RequestContextStore {
  n8nApi?: RequestN8nApiOverride;
}

// Async-local context for per-request configuration
export const requestContext = new AsyncLocalStorage<RequestContextStore>();

export function getN8nApiOverride(): RequestN8nApiOverride | undefined {
  return requestContext.getStore()?.n8nApi;
}

