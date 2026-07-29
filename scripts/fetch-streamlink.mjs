/**
 * Downloads a pinned Streamlink Windows portable build into
 * src-tauri/resources/streamlink for NSIS/MSI packaging.
 *
 * Usage: node scripts/fetch-streamlink.mjs [tag]
 * Default tag: 8.4.0-1
 */
import { mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { pipeline } from "node:stream/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const version = process.argv[2] ?? "8.4.0-1";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outDir = path.join(root, "src-tauri", "resources", "streamlink");
const assetUrl = `https://github.com/streamlink/windows-builds/releases/download/${version}/streamlink-${version}-py314-x86_64.zip`;

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

try {
  execFileSync("tar", ["-xf", zipPath, "-C", outDir], { stdio: "inherit" });
} catch {
  console.error("Failed to extract with tar. Install tar or extract manually.");
  process.exit(1);
}

await rm(zipPath, { force: true });

async function findExe(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isFile() && /^streamlinkw?\.exe$/i.test(entry.name)) {
      return full;
    }
    if (entry.isDirectory()) {
      const nested = await findExe(full);
      if (nested) return nested;
    }
  }
  return null;
}

const exe = await findExe(outDir);
if (!exe) {
  console.error("streamlinkw.exe / streamlink.exe not found after extract");
  process.exit(1);
}

const exeDir = path.dirname(exe);
if (path.resolve(exeDir) !== path.resolve(outDir)) {
  console.log(`Flattening nested extract from ${exeDir}`);
  const nestedEntries = await readdir(exeDir);
  for (const name of nestedEntries) {
    const from = path.join(exeDir, name);
    const to = path.join(outDir, name);
    try {
      await rename(from, to);
    } catch {
      // ignore collisions
    }
  }
  // remove emptied nest if possible
  try {
    const left = await readdir(exeDir);
    if (!left.length) await rm(exeDir, { recursive: true, force: true });
  } catch {
    // ignore
  }
}

const finalExe = (await findExe(outDir)) ?? exe;
const info = await stat(finalExe);
if (!info.isFile()) {
  console.error("Extracted Streamlink executable missing");
  process.exit(1);
}

await writeFile(path.join(outDir, "VERSION"), `${version}\n`, "utf8");
console.log(`Streamlink ${version} ready at ${finalExe}`);
