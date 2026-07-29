/**
 * Downloads a pinned Streamlink Windows release into src-tauri/resources/streamlink.
 * Used by CI / release packaging. Dev builds fall back to system Streamlink.
 *
 * Usage: node scripts/fetch-streamlink.mjs [version]
 */
import { mkdir, rm, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const version = process.argv[2] ?? "8.4.0";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src-tauri", "resources", "streamlink");

// Official Windows builds: https://github.com/streamlink/windows-builds
const assetUrl = `https://github.com/streamlink/windows-builds/releases/download/${version}/streamlink-${version}-py313-x86_64.zip`;

console.log(`Fetching Streamlink ${version}…`);
console.log(assetUrl);

const res = await fetch(assetUrl, { redirect: "follow" });
if (!res.ok) {
  console.error(`Download failed: ${res.status} ${res.statusText}`);
  console.error(
    "Pin a valid tag from https://github.com/streamlink/windows-builds/releases",
  );
  process.exit(1);
}

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });

const zipPath = path.join(outDir, "streamlink.zip");
await pipeline(res.body, createWriteStream(zipPath));

// Prefer system tar (Windows 10+) to extract zip
const { execFileSync } = await import("node:child_process");
try {
  execFileSync("tar", ["-xf", zipPath, "-C", outDir], { stdio: "inherit" });
} catch {
  console.error("Failed to extract with tar. Install tar or extract manually.");
  process.exit(1);
}

await rm(zipPath, { force: true });
await writeFile(
  path.join(outDir, "VERSION"),
  `${version}\n`,
  "utf8",
);

console.log(`Streamlink ${version} extracted to ${outDir}`);
