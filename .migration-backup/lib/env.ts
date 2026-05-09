/**
 * Environment Variable Validation
 *
 * Uses Zod to validate all required/optional env vars at startup.
 * The app will throw a descriptive error immediately if a required
 * variable is missing — rather than silently failing at runtime.
 *
 * Usage: import { env } from "@/lib/env"
 */

import { z } from "zod"

const envSchema = z.object({
  // ─── Required ───────────────────────────────────────────────────────────────

  /** Tavily web search API key */
  TAVILY_API_KEY: z.string().min(1, "TAVILY_API_KEY is required"),

  // ─── Supabase (optional — app works without auth) ───────────────────────────

  NEXT_PUBLIC_SUPABASE_URL: z
    .string()
    .url("NEXT_PUBLIC_SUPABASE_URL must be a valid URL")
    .optional(),

  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1).optional(),

  // ─── AI Providers (all optional — users can supply keys via UI) ─────────────

  OPENAI_API_KEY: z.string().min(1).optional(),
  ANTHROPIC_API_KEY: z.string().min(1).optional(),
  GOOGLE_GENERATIVE_AI_API_KEY: z.string().min(1).optional(),
  GROQ_API_KEY: z.string().min(1).optional(),

  // ─── Runtime ────────────────────────────────────────────────────────────────
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
})

/**
 * Validated, type-safe environment variables.
 * Throws at startup with a clear message if validation fails.
 */
export const env = (() => {
  const result = envSchema.safeParse(process.env)

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors
    const messages = Object.entries(errors)
      .map(([key, msgs]) => `  ❌ ${key}: ${msgs?.join(", ")}`)
      .join("\n")

    throw new Error(
      `\n\n🚨 Invalid environment variables:\n${messages}\n\n` +
        `Check your .env.local file and ensure all required variables are set.\n` +
        `See .env.example for reference.\n`
    )
  }

  return result.data
})()

export type Env = z.infer<typeof envSchema>
