import { z } from 'zod';
import dotenv from 'dotenv';
import { logger } from '../utils/logger';
import { getN8nApiOverride } from './request-context';

// n8n API configuration schema
const n8nApiConfigSchema = z.object({
  N8N_API_URL: z.string().url().optional(),
  N8N_API_KEY: z.string().min(1).optional(),
  N8N_API_TIMEOUT: z.coerce.number().positive().default(30000),
  N8N_API_MAX_RETRIES: z.coerce.number().positive().default(3),
});

// Track if we've loaded env vars
let envLoaded = false;

// Parse and validate n8n API configuration
export function getN8nApiConfig() {
  
  // First, prefer any per-request override from the async-local context
  const override = getN8nApiOverride();
  if (override && override.baseUrl && override.apiKey) {
    return {
      baseUrl: override.baseUrl,
      apiKey: override.apiKey,
      timeout: override.timeout ?? 30000,
      maxRetries: override.maxRetries ?? 3,
    } as const;
  }

  // If headers-only mode is enabled, never use env fallback
  if (process.env.N8N_API_HEADERS_ONLY === 'true') {
    return null;
  }

  // Load environment variables on first access (only if not headers-only)
  if (!envLoaded) {
    dotenv.config();
    envLoaded = true;
  }
  
  const result = n8nApiConfigSchema.safeParse(process.env);
  
  if (!result.success) {
    return null;
  }
  
  const config = result.data;
  
  // Check if both URL and API key are provided
  if (!config.N8N_API_URL || !config.N8N_API_KEY) {
    return null;
  }
  
  return {
    baseUrl: config.N8N_API_URL,
    apiKey: config.N8N_API_KEY,
    timeout: config.N8N_API_TIMEOUT,
    maxRetries: config.N8N_API_MAX_RETRIES,
  };
}

// Helper to check if n8n API is configured (lazy check)
export function isN8nApiConfigured(): boolean {
  const config = getN8nApiConfig();
  return config !== null;
}

// Type export
export type N8nApiConfig = NonNullable<ReturnType<typeof getN8nApiConfig>>;
