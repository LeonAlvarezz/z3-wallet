import { z } from "zod";

const envSchema = z.object({
  PORT: z.coerce.number().optional().default(3000),
  NODE_ENV: z
    .union([
      z.literal("development"),
      z.literal("test"),
      z.literal("production"),
    ])
    .default("development"),
  DATABASE_URL: z.string().startsWith("postgres"),
  HASH_PASSWORD_ALGORITHM: z.enum(["argon2id", "argon2d", "argon2i", "bcrypt"]),
  HASH_PASSWORD_COST: z.coerce.number().int().positive(),
  REDIS_URL: z.string(),
  CORS_ORIGINS: z.string().min(1),
  WEB_APP_URL: z.url().optional(),
  GITHUB_CLIENT_ID: z.string(),
  GITHUB_CLIENT_SECRET: z.string(),
  GITHUB_REDIRECT_URI: z.string(),
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  GOOGLE_REDIRECT_URI: z.string(),
});

function applyRuntimeDefaults(rawEnv: Record<string, string | undefined>) {
  const nodeEnv = rawEnv.NODE_ENV ?? "development";
  if (nodeEnv === "production") return rawEnv;

  return {
    ...rawEnv,
    CORS_ORIGINS: rawEnv.CORS_ORIGINS ?? "http://localhost:5173",
    WEB_APP_URL: rawEnv.WEB_APP_URL ?? "http://localhost:5173",
    GITHUB_CLIENT_ID: rawEnv.GITHUB_CLIENT_ID ?? "test-github-client-id",
    GITHUB_CLIENT_SECRET:
      rawEnv.GITHUB_CLIENT_SECRET ?? "test-github-client-secret",
    GITHUB_REDIRECT_URI:
      rawEnv.GITHUB_REDIRECT_URI ??
      "http://localhost:4000/v1/auth/github/callback",
    GOOGLE_CLIENT_ID: rawEnv.GOOGLE_CLIENT_ID ?? "test-google-client-id",
    GOOGLE_CLIENT_SECRET:
      rawEnv.GOOGLE_CLIENT_SECRET ?? "test-google-client-secret",
    GOOGLE_REDIRECT_URI:
      rawEnv.GOOGLE_REDIRECT_URI ??
      "http://localhost:4000/v1/auth/google/callback",
  };
}

const parsedEnv = envSchema.parse(
  applyRuntimeDefaults(process.env as Record<string, string | undefined>),
);
const corsOrigins = parsedEnv.CORS_ORIGINS.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (!corsOrigins.length) {
  throw new Error("CORS_ORIGINS must contain at least one origin.");
}

export const env = {
  ...parsedEnv,
  CORS_ORIGINS_LIST: corsOrigins,
};

export default env;
