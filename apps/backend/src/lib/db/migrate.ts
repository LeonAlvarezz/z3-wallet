import { $ } from "bun";
import { getMode, getEnvFile } from "./utils/get-mode";
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
