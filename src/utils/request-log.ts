import type { IncomingHttpHeaders } from 'http';

function mask(_value?: unknown): string {
  return '***redacted***';
}

function maskAuthorization(value: unknown): string {
  if (typeof value !== 'string') return '***redacted***';
  // Preserve scheme if present
  const parts = value.split(/\s+/, 2);
  if (parts.length === 2) {
    return `${parts[0]} ***redacted***`;
  }
  return '***redacted***';
}

const SENSITIVE_HEADERS = new Set([
  'authorization',
  'proxy-authorization',
  'x-n8n-api-key',
  'x-n8n-api-url',
  'x-api-key',
  'x-auth-token',
  'cookie',
  'set-cookie',
]);

export function sanitizeHeaders(headers: IncomingHttpHeaders): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(headers || {})) {
    const lower = key.toLowerCase();
    if (lower === 'authorization' || lower === 'proxy-authorization') {
      result[key] = maskAuthorization(value as string);
      continue;
    }
    if (SENSITIVE_HEADERS.has(lower)) {
      result[key] = mask(value);
      continue;
    }
    result[key] = value;
  }
  return result;
}
