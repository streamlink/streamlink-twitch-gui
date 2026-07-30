/**
 * Dependency audit gate for CI.
 *
 * Runs `npm audit --json` and fails on any high/critical advisory that is
 * not explicitly allowlisted below. Unlike `npm audit --audit-level=high`,
 * this supports per-advisory exceptions WITH a written justification, so a
 * single non-exploitable advisory does not force us to lower the bar for
 * everything else. Missing audit output fails closed.
 *
 * Allowlist entries must say WHY the advisory is not exploitable here and
 * carry a review date. A stale entry (advisory no longer reported) prints a
 * removal reminder.
 */
import { execSync } from "node:child_process";

const ALLOWLIST = new Map([
  // No active exceptions. The react-router GHSA-qwww-vcr4-c8h2 entry was
  // removed after the react-router 8.3.0 upgrade (2026-07-30). Add new
  // entries only with a written justification + review date, e.g.:
  // ["GHSA-xxxx-yyyy-zzzz", "why it is not exploitable here + review date"],
]);

let raw;
try {
  // npm audit exits non-zero when vulnerabilities exist; capture stdout either way.
  // execSync goes through the system shell, which resolves npm/npm.cmd on
  // Windows (direct spawn of .cmd is blocked since Node 18.20.2/20.12.2).
  raw = execSync("npm audit --json", {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
} catch (err) {
  if (!err.stdout) {
    console.error("npm audit could not run (failing closed):", err.message);
    process.exit(1);
  }
  raw = err.stdout;
}

let report;
try {
  report = JSON.parse(raw);
} catch {
  console.error("npm audit produced unparseable output (failing closed).");
  process.exit(1);
}

const seen = new Map(); // ghsa -> { title, severity }
for (const vuln of Object.values(report.vulnerabilities ?? {})) {
  for (const via of vuln.via ?? []) {
    if (typeof via !== "object" || !via) continue;
    if (via.severity !== "high" && via.severity !== "critical") continue;
    const match = /GHSA-[\da-z-]+/i.exec(via.url ?? "");
    if (match) {
      seen.set(match[0], { title: via.title ?? vuln.name, severity: via.severity });
    }
  }
}

const failures = [];
for (const [ghsa, info] of seen) {
  const justification = ALLOWLIST.get(ghsa);
  if (justification) {
    console.log(`allowlisted ${ghsa} (${info.severity}): ${info.title}`);
  } else {
    failures.push(`${ghsa} (${info.severity}): ${info.title}`);
  }
}

for (const ghsa of ALLOWLIST.keys()) {
  if (!seen.has(ghsa)) {
    console.log(`note: allowlist entry ${ghsa} no longer matches any advisory — remove it.`);
  }
}

if (failures.length) {
  console.error("\nHigh/critical advisories without an exception:");
  for (const line of failures) console.error(`  - ${line}`);
  process.exit(1);
}
console.log(`\nAudit gate passed (${seen.size} high/critical advisories, all allowlisted).`);
