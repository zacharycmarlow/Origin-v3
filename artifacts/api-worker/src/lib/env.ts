/* ═══════════════════════════════════════════════════════════════
   Environment variable validation for the Origin API Worker.

   Uses zod to validate the Worker environment bindings at startup.
   Throws if required variables are missing.
   ═══════════════════════════════════════════════════════════════ */

import { z } from "zod";

const envSchema = z.object({
  DB: z.any(),
  R2: z.any().optional(),
  ANTHROPIC_API_KEY: z.string().optional(),
  ANTHROPIC_BASE_URL: z.string().optional(),
  PRIVY_APP_ID: z.string().min(1, "PRIVY_APP_ID is required"),
  CORS_ALLOWED_ORIGINS: z.string().default(""),
  R2_BUCKET: z.string().default(""),
  SENTRY_DSN: z.string().optional(),
});

export type ValidatedEnv = z.infer<typeof envSchema>;

/**
 * Validate the Worker environment. Throws if required vars are missing.
 */
export function validateEnv(env: Record<string, unknown>): ValidatedEnv {
  return envSchema.parse(env);
}
