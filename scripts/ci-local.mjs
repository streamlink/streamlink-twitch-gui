#!/usr/bin/env node
/**
 * Local mirror of the Windows CI jobs (frontend + rust).
 * Used by `npm run ci` and the pre-push git hook.
 */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const tauri = path.join(root, "src-tauri");

function run(cmd, args, cwd = root) {
  console.log(`\n> ${cmd} ${args.join(" ")}`);
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

run("npm", ["test"]);
run("npm", ["run", "build"]);
run("node", ["scripts/audit-gate.mjs"]);
run("cargo", ["fmt", "--check"], tauri);
run("cargo", ["clippy", "--", "-D", "warnings"], tauri);
run("cargo", ["test"], tauri);
console.log("\nci-local: all Windows CI checks passed.");
