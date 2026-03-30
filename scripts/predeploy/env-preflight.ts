type EnvMap = Record<string, string | undefined>;

const bun = (globalThis as any).Bun;
if (!bun) {
  throw new Error("env-preflight must be executed with Bun.");
}

const MODE = (bun.env.PREDEPLOY_ENV_MODE ?? "production").toLowerCase();
const ROOT_DIR = String(bun.cwd);

function toAbsolutePath(filePath: string): string {
  if (filePath.startsWith("/")) return filePath;
  return `${ROOT_DIR}/${filePath}`;
}

async function parseEnvFile(filePath: string): Promise<EnvMap> {
  const file = bun.file(filePath);
  if (!(await file.exists())) return {};

  const lines = (await file.text()).split(/\r?\n/);
  const parsed: EnvMap = {};

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;

    const separatorIndex = line.indexOf("=");
    if (separatorIndex <= 0) continue;

    const key = line.slice(0, separatorIndex).trim();
    let value = line.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    parsed[key] = value;
  }

  return parsed;
}

async function loadEnv(candidateFiles: string[]): Promise<EnvMap> {
  const fromFiles: EnvMap = {};

  for (const file of candidateFiles) {
    const absolutePath = toAbsolutePath(file);
    const parsed = await parseEnvFile(absolutePath);

    for (const [key, value] of Object.entries(parsed)) {
      if (fromFiles[key] === undefined) {
        fromFiles[key] = value;
      }
    }
  }

  return {
    ...fromFiles,
    ...bun.env,
  };
}

function isValidUrl(value: string | undefined) {
  if (!value) return false;

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function isPostgresUrl(value: string | undefined) {
  if (!value) return false;
  return value.startsWith("postgres://") || value.startsWith("postgresql://");
}

function isRedisUrl(value: string | undefined) {
  if (!value) return false;
  return value.startsWith("redis://") || value.startsWith("rediss://");
}

function validateRequired(
  errors: string[],
  env: EnvMap,
  context: string,
  key: string,
) {
  if (!env[key]?.trim()) {
    errors.push(`[${context}] Missing required key: ${key}`);
  }
}

function validateNodeEnv(errors: string[], value: string | undefined) {
  const valid = new Set(["development", "test", "production"]);
  if (!value || !valid.has(value)) {
    errors.push(
      `[backend] NODE_ENV must be one of development|test|production (received: ${value ?? "undefined"})`,
    );
  }
}

function validateHashPasswordCost(errors: string[], value: string | undefined) {
  if (!value) {
    errors.push("[backend] Missing required key: HASH_PASSWORD_COST");
    return;
  }

  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    errors.push(
      `[backend] HASH_PASSWORD_COST must be a positive integer (received: ${value})`,
    );
  }
}

function validateHashAlgorithm(errors: string[], value: string | undefined) {
  const valid = new Set(["argon2id", "argon2d", "argon2i", "bcrypt"]);
  if (!value || !valid.has(value)) {
    errors.push(
      `[backend] HASH_PASSWORD_ALGORITHM must be one of argon2id|argon2d|argon2i|bcrypt (received: ${value ?? "undefined"})`,
    );
  }
}

function validateCorsOrigins(errors: string[], value: string | undefined) {
  if (!value) {
    errors.push("[backend] Missing required key: CORS_ORIGINS");
    return;
  }

  const origins = value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  if (!origins.length) {
    errors.push("[backend] CORS_ORIGINS must contain at least one origin");
    return;
  }

  for (const origin of origins) {
    if (!isValidUrl(origin)) {
      errors.push(
        `[backend] CORS_ORIGINS contains an invalid URL value: ${origin}`,
      );
    }
  }
}

function validateBackendEnv(errors: string[], env: EnvMap) {
  const requiredKeys = [
    "NODE_ENV",
    "DATABASE_URL",
    "HASH_PASSWORD_ALGORITHM",
    "HASH_PASSWORD_COST",
    "REDIS_URL",
    "CORS_ORIGINS",
    "WEB_APP_URL",
    "GITHUB_CLIENT_ID",
    "GITHUB_CLIENT_SECRET",
    "GITHUB_REDIRECT_URI",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "GOOGLE_REDIRECT_URI",
  ];

  for (const key of requiredKeys) {
    validateRequired(errors, env, "backend", key);
  }

  validateNodeEnv(errors, env.NODE_ENV);
  validateHashAlgorithm(errors, env.HASH_PASSWORD_ALGORITHM);
  validateHashPasswordCost(errors, env.HASH_PASSWORD_COST);

  if (!isPostgresUrl(env.DATABASE_URL)) {
    errors.push(
      "[backend] DATABASE_URL must start with postgres:// or postgresql://",
    );
  }

  if (!isRedisUrl(env.REDIS_URL)) {
    errors.push("[backend] REDIS_URL must start with redis:// or rediss://");
  }

  validateCorsOrigins(errors, env.CORS_ORIGINS);

  const urlKeys = [
    "WEB_APP_URL",
    "GITHUB_REDIRECT_URI",
    "GOOGLE_REDIRECT_URI",
  ] as const;

  for (const key of urlKeys) {
    if (!isValidUrl(env[key])) {
      errors.push(`[backend] ${key} must be a valid http/https URL`);
    }
  }
}

function validateWebEnv(errors: string[], env: EnvMap) {
  validateRequired(errors, env, "web", "VITE_APP_NAME");
  validateRequired(errors, env, "web", "VITE_API_URL");
  validateRequired(errors, env, "web", "VITE_SITE_URL");

  if (env.VITE_API_URL) {
    const isApiProxyPath = env.VITE_API_URL.startsWith("/");
    if (!isApiProxyPath && !isValidUrl(env.VITE_API_URL)) {
      errors.push(
        `[web] VITE_API_URL must be a valid URL or a path value like /api (received: ${env.VITE_API_URL})`,
      );
    }
  }

  if (env.VITE_SITE_URL && !isValidUrl(env.VITE_SITE_URL)) {
    errors.push("[web] VITE_SITE_URL must be a valid http/https URL");
  }
}

function validateWorkerEnv(errors: string[], env: EnvMap) {
  validateRequired(errors, env, "worker", "API_BASE_URL");
  if (env.API_BASE_URL && !isValidUrl(env.API_BASE_URL)) {
    errors.push("[worker] API_BASE_URL must be a valid http/https URL");
  }
}

async function main() {
  const backendEnv =
    MODE === "test"
      ? await loadEnv(["apps/backend/.env.test", "apps/backend/.env"])
      : await loadEnv(["apps/backend/.env.production", "apps/backend/.env"]);

  const webEnv =
    MODE === "test"
      ? await loadEnv(["apps/web/.env.local"])
      : await loadEnv(["apps/web/.env.production"]);

  const errors: string[] = [];
  validateBackendEnv(errors, backendEnv);
  validateWebEnv(errors, webEnv);

  if (errors.length > 0) {
    console.error("❌ Environment preflight failed:\n");
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    bun.exit(1);
  }

  console.log(`✅ Environment preflight passed (mode=${MODE}).`);
}

main().catch((error) => {
  console.error("❌ Environment preflight crashed:", error);
  bun.exit(1);
});
