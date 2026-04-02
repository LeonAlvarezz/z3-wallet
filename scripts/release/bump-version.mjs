import { readFile, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const semverPattern = /^(\d+)\.(\d+)\.(\d+)$/;
const releaseTypes = new Set(["major", "minor", "patch"]);
const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");

const packageJsonPaths = [
  path.join(repoRoot, "package.json"),
  path.join(repoRoot, "apps/web/package.json"),
  path.join(repoRoot, "apps/backend/package.json"),
];

const versionFilePaths = [
  path.join(repoRoot, "apps/web/src/lib/app-version.ts"),
  path.join(repoRoot, "apps/backend/src/constant/app-version.ts"),
];

function parseSemver(version) {
  const match = semverPattern.exec(version);
  if (!match) {
    throw new Error(
      `Invalid version "${version}". Expected format: x.y.z (for example 1.2.3).`,
    );
  }

  return match.slice(1).map((value) => Number.parseInt(value, 10));
}

function formatSemver(parts) {
  return parts.join(".");
}

function getNextVersion(currentVersion, input) {
  if (releaseTypes.has(input)) {
    const [major, minor, patch] = parseSemver(currentVersion);

    if (input === "major") {
      return formatSemver([major + 1, 0, 0]);
    }

    if (input === "minor") {
      return formatSemver([major, minor + 1, 0]);
    }

    return formatSemver([major, minor, patch + 1]);
  }

  parseSemver(input);
  return input;
}

function detectIndentation(jsonText) {
  const match = jsonText.match(/\n(\s+)"name":/);
  return match?.[1] ?? "  ";
}

async function updatePackageVersion(filePath, version) {
  const currentText = await readFile(filePath, "utf8");
  const indentation = detectIndentation(currentText);
  const parsed = JSON.parse(currentText);
  parsed.version = version;
  await writeFile(
    filePath,
    `${JSON.stringify(parsed, null, indentation)}\n`,
    "utf8",
  );
}

async function updateVersionModule(filePath, version) {
  await writeFile(
    filePath,
    `export const APP_VERSION = "${version}";\n`,
    "utf8",
  );
}

function refreshLockfile() {
  const result = spawnSync("bun", ["install", "--lockfile-only"], {
    cwd: repoRoot,
    stdio: "inherit",
  });

  if (result.status !== 0) {
    throw new Error("Failed to refresh bun.lock after updating versions.");
  }
}

async function main() {
  const requestedVersion = process.argv[2];

  if (!requestedVersion) {
    throw new Error("Usage: bun run release:bump -- <patch|minor|major|x.y.z>");
  }

  const rootPackageJsonPath = packageJsonPaths[0];
  const rootPackageJson = JSON.parse(
    await readFile(rootPackageJsonPath, "utf8"),
  );
  const nextVersion = getNextVersion(rootPackageJson.version, requestedVersion);

  for (const packageJsonPath of packageJsonPaths) {
    await updatePackageVersion(packageJsonPath, nextVersion);
  }

  for (const versionFilePath of versionFilePaths) {
    await updateVersionModule(versionFilePath, nextVersion);
  }

  refreshLockfile();

  console.log(`Updated release version to v${nextVersion}.`);
  console.log("Next steps:");
  console.log("  1. Commit the version changes.");
  console.log("  2. Run `bun run release:tag`.");
  console.log("  3. Push the commit and tag with `git push --follow-tags`.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
