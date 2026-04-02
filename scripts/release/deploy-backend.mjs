import process from "node:process";

const hookUrl = process.env.DOKPLOY_BACKEND_DEPLOY_HOOK_URL?.trim();

if (!hookUrl) {
  console.error(
    "Missing DOKPLOY_BACKEND_DEPLOY_HOOK_URL. Set the Dokploy deploy hook URL before running release:deploy:backend.",
  );
  process.exit(1);
}

const response = await fetch(hookUrl, { method: "POST" });

if (!response.ok) {
  const body = await response.text();
  console.error(`Dokploy backend deploy hook failed with ${response.status}.`);
  if (body) {
    console.error(body);
  }
  process.exit(1);
}

console.log("Triggered Dokploy backend deployment.");
