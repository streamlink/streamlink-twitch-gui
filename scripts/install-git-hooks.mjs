#!/usr/bin/env node
/** Point this clone at .githooks so pre-push runs Windows CI locally. */
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const hooks = path.join(root, ".githooks");

const r = spawnSync("git", ["config", "core.hooksPath", hooks], {
  cwd: root,
  stdio: "inherit",
  shell: process.platform === "win32",
});
if (r.status !== 0) {
  // Not a git checkout (e.g. npm pack) — ignore.
  process.exit(0);
}
