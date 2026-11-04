#!/usr/bin/env node
// Classify pnpm overrides, patched dependencies, and audit waivers in the
// current workspace. Run from the workspace root after `pnpm install`.
//
//   node check-overrides.mjs                     # read-only range analysis
//   node check-overrides.mjs --simulate <dir>    # also remove each override in
//                                                # the scratch worktree <dir>,
//                                                # re-resolve, and audit
//
// Overrides may live in pnpm-workspace.yaml (`overrides:`) or in the root
// package.json (`pnpm.overrides`). Simulation edits that file and
// pnpm-lock.yaml inside <dir> only and restores both before exiting.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const args = process.argv.slice(2);
const simIndex = args.indexOf("--simulate");
const simulateDir =
  simIndex >= 0 ? path.resolve(args[simIndex + 1] ?? "") : null;
const cwd = process.cwd();
const store = path.join(cwd, "node_modules/.pnpm");

if (!fs.existsSync(path.join(cwd, "pnpm-lock.yaml")))
  throw new Error("pnpm-lock.yaml not found: run from the pnpm workspace root");
if (!fs.existsSync(store))
  throw new Error("node_modules/.pnpm not found: run pnpm install first");

const pnpmJson = (dir, ...cmd) => {
  const out = spawnSync("pnpm", cmd, {
    cwd: dir,
    encoding: "utf8",
    maxBuffer: 256 * 1024 * 1024,
  });
  try {
    return JSON.parse(out.stdout || "null");
  } catch {
    return null;
  }
};

// Use the workspace's own semver so no extra install is needed.
const semverPath = (() => {
  const hoisted = path.join(cwd, "node_modules/semver");
  if (fs.existsSync(path.join(hoisted, "package.json"))) {
    const { version } = JSON.parse(
      fs.readFileSync(path.join(hoisted, "package.json"), "utf8"),
    );
    if (version?.startsWith("7.")) return hoisted;
  }
  const dir = fs
    .readdirSync(store)
    .filter((d) => /^semver@7\./.test(d))
    .sort()
    .pop();
  return dir ? path.join(store, dir, "node_modules/semver") : null;
})();
if (!semverPath)
  throw new Error("semver@7 not found in node_modules; run pnpm install first");
const semver = createRequire(import.meta.url)(semverPath);

const overrides = pnpmJson(cwd, "config", "get", "overrides", "--json") ?? {};
const patched =
  pnpmJson(cwd, "config", "get", "patchedDependencies", "--json") ?? {};
const auditConfig =
  pnpmJson(cwd, "config", "get", "auditConfig", "--json") ?? {};
const lockfile = fs.readFileSync(path.join(cwd, "pnpm-lock.yaml"), "utf8");

// "parent@range>child@range" -> { parent, child, childRange }
const splitSelector = (selector) => {
  const parts = selector.split(/>(?!=)/);
  const parse = (part) => {
    const at = part.indexOf("@", part.startsWith("@") ? 1 : 0);
    return at < 0
      ? { name: part, range: null }
      : { name: part.slice(0, at), range: part.slice(at + 1) || null };
  };
  const child = parse(parts.pop());
  return {
    parent: parts.length ? parse(parts.join(">")).name : null,
    child: child.name,
    childRange: child.range,
  };
};

// Every installed package.json's declared dependency ranges, keyed by dependency name.
const declared = new Map();
const record = (pkgFile, includeDev) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  } catch {
    return;
  }
  const sections = [
    "dependencies",
    "optionalDependencies",
    ...(includeDev ? ["devDependencies"] : []),
  ];
  for (const section of sections) {
    for (const [name, range] of Object.entries(pkg[section] ?? {})) {
      if (typeof range !== "string") continue;
      if (!declared.has(name)) declared.set(name, []);
      declared.get(name).push({ from: pkg.name ?? pkgFile, range });
    }
  }
};
for (const entry of fs.readdirSync(store)) {
  const nm = path.join(store, entry, "node_modules");
  if (!fs.existsSync(nm)) continue;
  for (const dir of fs.readdirSync(nm)) {
    const dirs = dir.startsWith("@")
      ? fs.readdirSync(path.join(nm, dir)).map((s) => path.join(dir, s))
      : [dir];
    for (const d of dirs) record(path.join(nm, d, "package.json"), false);
  }
}
const manifests = execFileSync("git", ["ls-files", "*package.json"], {
  cwd,
  encoding: "utf8",
})
  .trim()
  .split("\n")
  .filter(Boolean);
for (const file of manifests)
  if (!file.includes("node_modules")) record(path.join(cwd, file), true);

const lockedVersions = (name, text = lockfile) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const re = new RegExp(`^  '?${escaped}@(\\d[^:(\\s']*)`, "gm");
  return [...new Set([...text.matchAll(re)].map((m) => m[1]))].sort(
    semver.compare,
  );
};

const usableRange = (range) =>
  !range.startsWith("workspace:") &&
  !range.startsWith("npm:") &&
  !range.startsWith("link:") &&
  !range.startsWith("file:") &&
  semver.validRange(range);

const classify = (selector, value) => {
  const { parent, child, childRange } = splitSelector(selector);
  const target = usableRange(String(value))
    ? semver.minVersion(value)?.version
    : null;
  const consumers = (declared.get(child) ?? []).filter(
    (c) => !parent || c.from === parent,
  );
  const governed = consumers.filter(
    (c) =>
      usableRange(c.range) &&
      (!childRange || semver.intersects(c.range, childRange)),
  );
  const locked = lockedVersions(child);
  // A consumer is only forced when no locked version satisfies its declared range.
  const forced = (c) => !locked.some((v) => semver.satisfies(v, c.range));
  const belowTarget = governed.filter(
    (c) => target && semver.lt(semver.minVersion(c.range).version, target),
  );
  // The override resolves older than a consumer accepts: stale, or a deliberate compatibility pin.
  const downgrades = governed.filter(
    (c) => target && forced(c) && semver.ltr(target, c.range),
  );
  // The override resolves newer than a consumer accepts: usually a security bump the parent has not adopted.
  const aboveRange = governed.filter(
    (c) => target && forced(c) && semver.gtr(target, c.range),
  );
  let status = "REDUNDANT";
  if (!governed.length) status = "NO_CONSUMERS";
  else if (!target) status = "UNCLASSIFIED";
  else if (downgrades.length) status = "DOWNGRADES_BELOW_RANGE";
  else if (aboveRange.length) status = "FORCES_ABOVE_RANGE";
  else if (belowTarget.length) status = "FLOOR_STILL_NEEDED";
  return {
    selector,
    value,
    child,
    status,
    locked,
    consumers: governed.length,
    belowTarget,
    downgrades,
    aboveRange,
  };
};

const results = Object.entries(overrides).map(([selector, value]) =>
  classify(selector, value),
);

const advisoryIds = (dir) => {
  const audit = pnpmJson(dir, "audit", "--json");
  return Object.values(audit?.advisories ?? {}).map(
    (a) => `${a.module_name}:${a.github_advisory_id}`,
  );
};

// Remove one override from whichever file declares it. Returns false when not found.
const removeOverride = (dir, selector, originals) => {
  const wsFile = path.join(dir, "pnpm-workspace.yaml");
  if (originals.workspace != null) {
    const lines = originals.workspace.split("\n");
    const start = lines.findIndex((l) => /^overrides:\s*$/.test(l));
    if (start >= 0) {
      for (let i = start + 1; i < lines.length && /^(\s|$)/.test(lines[i]); i++) {
        const key = lines[i]
          .trim()
          .split(/:\s/)[0]
          .replace(/^["']|["']$/g, "");
        if (/^\s{2}\S/.test(lines[i]) && key === selector) {
          lines.splice(i, 1);
          fs.writeFileSync(wsFile, lines.join("\n"));
          return true;
        }
      }
    }
  }
  const pkg = JSON.parse(originals.packageJson);
  if (pkg.pnpm?.overrides && selector in pkg.pnpm.overrides) {
    delete pkg.pnpm.overrides[selector];
    fs.writeFileSync(
      path.join(dir, "package.json"),
      `${JSON.stringify(pkg, null, 2)}\n`,
    );
    return true;
  }
  return false;
};

if (simulateDir) {
  const top = (dir) =>
    execFileSync("git", ["rev-parse", "--show-toplevel"], {
      cwd: dir,
      encoding: "utf8",
    }).trim();
  if (top(simulateDir) === top(cwd))
    throw new Error(
      "--simulate needs a separate scratch worktree, not this checkout",
    );
  const files = {
    workspace: path.join(simulateDir, "pnpm-workspace.yaml"),
    packageJson: path.join(simulateDir, "package.json"),
    lock: path.join(simulateDir, "pnpm-lock.yaml"),
  };
  const originals = {
    workspace: fs.existsSync(files.workspace)
      ? fs.readFileSync(files.workspace, "utf8")
      : null,
    packageJson: fs.readFileSync(files.packageJson, "utf8"),
    lock: fs.readFileSync(files.lock, "utf8"),
  };
  const restore = () => {
    if (originals.workspace != null)
      fs.writeFileSync(files.workspace, originals.workspace);
    fs.writeFileSync(files.packageJson, originals.packageJson);
    fs.writeFileSync(files.lock, originals.lock);
  };
  const baseline = new Set(advisoryIds(simulateDir));
  try {
    for (const result of results) {
      restore();
      if (!removeOverride(simulateDir, result.selector, originals)) {
        result.simulation =
          "selector not found in pnpm-workspace.yaml or package.json pnpm.overrides";
        continue;
      }
      const install = spawnSync("pnpm", ["install", "--lockfile-only"], {
        cwd: simulateDir,
        encoding: "utf8",
      });
      if (install.status !== 0) {
        const reason = `${install.stderr}\n${install.stdout}`
          .split("\n")
          .find((line) => /ERR_PNPM|error/i.test(line));
        result.simulation = `install failed: ${reason?.trim() ?? `exit ${install.status}`}`;
        continue;
      }
      const after = lockedVersions(
        result.child,
        fs.readFileSync(files.lock, "utf8"),
      );
      const added = advisoryIds(simulateDir).filter((id) => !baseline.has(id));
      result.simulation = `locked after removal: ${after.join(", ") || "none"}; new advisories: ${added.join(", ") || "none"}`;
    }
  } finally {
    restore();
  }
}

const describe = (list) =>
  list
    .slice(0, 3)
    .map((c) => `${c.from} ${c.range}`)
    .join("; ");
console.log("## Overrides");
if (!results.length) console.log("none");
for (const r of results) {
  console.log(
    `${r.status.padEnd(28)} ${r.selector}: ${r.value}  locked=[${r.locked.join(", ")}] consumers=${r.consumers}`,
  );
  if (r.downgrades.length)
    console.log(`    requires newer than override: ${describe(r.downgrades)}`);
  else if (r.aboveRange.length)
    console.log(`    declared range below override: ${describe(r.aboveRange)}`);
  else if (r.belowTarget.length)
    console.log(
      `    ranges allowing older versions: ${describe(r.belowTarget)}`,
    );
  if (r.simulation) console.log(`    simulation: ${r.simulation}`);
}

console.log("\n## Patched dependencies");
if (!Object.keys(patched).length) console.log("none");
for (const [key, file] of Object.entries(patched)) {
  const { child } = splitSelector(key);
  const version = key.slice(child.length + 1);
  const meta = pnpmJson(cwd, "view", child, "version", "time", "--json") ?? {};
  const inGraph = version
    ? lockedVersions(child).includes(version)
    : lockedVersions(child).length > 0;
  console.log(
    `${key} -> ${path.relative(cwd, path.resolve(cwd, String(file)))}  inLockfile=${inGraph} latest=${meta.version ?? "unknown"} published=${meta.time?.[meta.version] ?? "unknown"}`,
  );
}

console.log("\n## Audit waivers");
const waivers = [
  ...(auditConfig.ignoreGhsas ?? []),
  ...(auditConfig.ignoreCves ?? []),
];
if (!waivers.length) console.log("none");
for (const id of waivers) console.log(id);
