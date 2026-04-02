import { readFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import path from "node:path";
import process from "node:process";
import { fileURLToPath } from "node:url";

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, "../..");
const allowDirty = process.argv.includes("--allow-dirty");

function runGit(args, options = {}) {
  const result = spawnSync("git", args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: options.stdio ?? "pipe",
  });

  return result;
}

async function main() {
  if (!allowDirty) {
    const status = runGit(["status", "--short"]);
    if (status.status !== 0) {
      throw new Error(status.stderr.trim() || "Failed to inspect git status.");
    }

    if (status.stdout.trim().length > 0) {
      throw new Error(
        "Refusing to create a release tag from a dirty worktree. Commit or stash changes first, or rerun with --allow-dirty.",
      );
    }
  }

  const packageJsonPath = path.join(repoRoot, "package.json");
  const packageJson = JSON.parse(await readFile(packageJsonPath, "utf8"));
  const tagName = `v${packageJson.version}`;

  const existingTag = runGit(["rev-parse", "--verify", "--quiet", tagName]);
  if (existingTag.status === 0) {
    throw new Error(`Tag ${tagName} already exists.`);
  }

  const createTag = runGit(
    ["tag", "-a", tagName, "-m", `Release ${tagName}`],
    { stdio: "inherit" },
  );

  if (createTag.status !== 0) {
    throw new Error(`Failed to create tag ${tagName}.`);
  }

  console.log(`Created annotated tag ${tagName}.`);
  console.log("Push it with `git push --follow-tags` to start the release workflow.");
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
