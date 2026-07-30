/**
 * Generates the Tauri v2 updater manifest (latest.json) from the signed
 * bundle artifacts produced by `tauri build` (which only creates .sig files,
 * not the manifest — that is normally tauri-action's job).
 *
 * The manifest endpoint in tauri.conf.json points at
 * releases/latest/download/latest.json, so the release workflow must attach
 * this file to every published release.
 *
 * Usage: node scripts/generate-updater-manifest.mjs <tag> [owner/repo]
 *   tag        e.g. v0.1.0 (or 0.1.0)
 *   owner/repo defaults to $GITHUB_REPOSITORY, then Wibias/streamlink-twitch-gui
 */
import { readdir, readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const bundleDir = path.join(root, "src-tauri", "target", "release", "bundle");

const tag = process.argv[2];
if (!tag) {
  console.error("Usage: node scripts/generate-updater-manifest.mjs <tag> [owner/repo]");
  process.exit(1);
}
const version = tag.replace(/^v/, "");
const repo =
  process.argv[3] ?? process.env.GITHUB_REPOSITORY ?? "Wibias/streamlink-twitch-gui";

// Prefer the NSIS installer; fall back to MSI.
const candidates = [
  { dir: path.join(bundleDir, "nsis"), ext: ".exe.sig" },
  { dir: path.join(bundleDir, "msi"), ext: ".msi.sig" },
];

let assetName = null;
let signature = null;
for (const { dir, ext } of candidates) {
  let entries = [];
  try {
    entries = await readdir(dir);
  } catch {
    continue;
  }
  const sig = entries.find((name) => name.endsWith(ext));
  if (!sig) continue;
  assetName = sig.slice(0, -".sig".length);
  signature = (await readFile(path.join(dir, sig), "utf8")).trim();
  break;
}

if (!assetName || !signature) {
  console.error(
    `No updater signature found under ${bundleDir} (looked for nsis/*.exe.sig, msi/*.msi.sig).`,
  );
  console.error("Did the build run with createUpdaterArtifacts and TAURI_SIGNING_PRIVATE_KEY set?");
  process.exit(1);
}

const manifest = {
  version,
  notes: `See https://github.com/${repo}/releases/tag/${tag}`,
  pub_date: new Date().toISOString(),
  platforms: {
    "windows-x86_64": {
      signature,
      url: `https://github.com/${repo}/releases/download/${tag}/${encodeURIComponent(assetName)}`,
    },
  },
};

const out = path.join(bundleDir, "latest.json");
await mkdir(bundleDir, { recursive: true });
await writeFile(out, JSON.stringify(manifest, null, 2) + "\n", "utf8");
console.log(`Updater manifest written to ${out}`);
console.log(`  version: ${version}`);
console.log(`  asset:   ${assetName}`);
