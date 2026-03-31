import { $ } from "bun";
import env from "../env";

type Mode = "dev" | "prod" | "test";

function getMode(args: string[]): Mode {
  if (args.includes("--test") || args.includes("test")) {
    return "test";
  }

  if (args.includes("--prod") || args.includes("prod")) {
    return "prod";
  }

  if (args.includes("--dev") || args.includes("dev")) {
    return "dev";
  }

  if (process.env.NODE_ENV === "test") {
    return "test";
  }

  if (process.env.NODE_ENV === "production") {
    return "prod";
  }

  return "dev";
}

function getEnvFile(mode: Mode) {
  switch (mode) {
    case "test":
      return ".env.test";
    case "prod":
      return ".env.prod";
    default:
      return ".env";
  }
}

async function main() {
  const args = process.argv.slice(2);
  const mode = getMode(args);
  const envFile = getEnvFile(mode);
  console.log(`🌱 Running ${mode} migration with ${envFile}...`);
  await $`bun --env-file=${envFile} run drizzle-kit migrate`;

  console.log(`✅ ${mode} migration completed successfully!`);
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Unexpected error during migration:", err);
  process.exit(1);
});
