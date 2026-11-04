#!/usr/bin/env node
// Classify pnpm overrides, patched dependencies, and audit waivers in the
// current workspace. Run from the pnpm workspace root (inside a git checkout)
// after `pnpm install`. Needs a v9 pnpm-lock.yaml and a semver@7 that the
// workspace already installed (hoisted or in node_modules/.pnpm).
//
//   node check-overrides.mjs                     # read-only range analysis
//   node check-overrides.mjs --simulate <dir>    # also remove each override in
//                                                # the scratch worktree <dir>,
//                                                # re-resolve, and audit
//
// Settings come from `pnpm config list --json`, pnpm-workspace.yaml
// (`overrides`, `patchedDependencies`, `catalog`, `catalogs`, `auditConfig`)
// and the root package.json `pnpm` field. pnpm 10+ may ignore the package.json
// field, so entries found only there are flagged. `catalog:` ranges resolve
// through the workspace catalogs. A parent-scoped selector (`parent>child`) is
// judged from the version the lockfile's `snapshots:` resolved for that
// parent's dependency; without that evidence it is UNCLASSIFIED.
//
// Statuses: REDUNDANT, NO_CONSUMERS, FLOOR_STILL_NEEDED, FORCES_ABOVE_RANGE,
// DOWNGRADES_BELOW_RANGE, UNCLASSIFIED (not enough evidence; check by hand).
//
// <dir> must be a separate git worktree or clone, never this checkout.
// Simulation edits pnpm-workspace.yaml or package.json and pnpm-lock.yaml
// inside <dir> only and restores them before exiting, including on errors.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

const fail = (message) => {
  console.error(`check-overrides: ${message}`);
  process.exit(2);
};

const args = process.argv.slice(2);
const simIndex = args.indexOf("--simulate");
let simulateDir = null;
if (simIndex >= 0) {
  const dir = args[simIndex + 1];
  if (!dir || dir.startsWith("--"))
    fail("--simulate needs the path of a scratch worktree");
  simulateDir = path.resolve(dir);
  if (!fs.existsSync(simulateDir))
    fail(`--simulate directory not found: ${simulateDir}`);
}
const cwd = process.cwd();
const store = path.join(cwd, "node_modules/.pnpm");
const lockPath = path.join(cwd, "pnpm-lock.yaml");

if (!fs.existsSync(lockPath))
  fail("pnpm-lock.yaml not found: run from the pnpm workspace root");
if (!fs.existsSync(store))
  fail("node_modules/.pnpm not found: run pnpm install first");

const lockfile = fs.readFileSync(lockPath, "utf8");
const lockVersion = lockfile.match(/^lockfileVersion:\s*['"]?([^'"\s#]+)/m)?.[1];
if (!lockVersion || !/^9(\.|$)/.test(lockVersion))
  fail(
    `unsupported lockfile version ${lockVersion ?? "(missing)"} in pnpm-lock.yaml: only lockfileVersion 9.x is understood`,
  );

const MAX_BUFFER = 256 * 1024 * 1024;
const firstLine = (text) =>
  String(text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l && /ERR_PNPM|error|×/i.test(l)) ??
  String(text ?? "")
    .split("\n")
    .map((l) => l.trim())
    .find(Boolean) ??
  "";

const isInterrupt = (out) => out.signal === "SIGINT" || out.signal === "SIGTERM";

// Run pnpm and parse JSON stdout. Returns { ok, data } or { ok: false, error }.
// `accept(data)` may allow a nonzero exit when the parsed output is usable.
const pnpmJson = (dir, cmd, { timeout = 120_000, accept } = {}) => {
  const label = `pnpm ${cmd.join(" ")}`;
  const out = spawnSync("pnpm", cmd, {
    cwd: dir,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    timeout,
  });
  if (isInterrupt(out) && !out.error) throw new Error(`${label} interrupted`);
  if (out.error)
    return {
      ok: false,
      error: `${label}: ${out.error.code === "ETIMEDOUT" ? `timed out after ${timeout / 1000}s` : out.error.message}`,
    };
  if (out.signal) return { ok: false, error: `${label}: killed by ${out.signal}` };
  let data;
  try {
    data = JSON.parse(out.stdout);
  } catch {
    return {
      ok: false,
      error: `${label}: exit ${out.status}, output is not JSON: ${firstLine(out.stderr || out.stdout) || "(empty)"}`,
    };
  }
  if (accept && !accept(data))
    return {
      ok: false,
      error: `${label}: exit ${out.status}: ${data?.error?.summary ?? data?.error?.code ?? (firstLine(out.stderr) || "unexpected JSON")}`,
    };
  if (out.status !== 0 && !accept)
    return {
      ok: false,
      error: `${label}: exit ${out.status}: ${firstLine(out.stderr || out.stdout)}`,
    };
  return { ok: true, data };
};

const pnpmVersion = (() => {
  const out = spawnSync("pnpm", ["--version"], {
    cwd,
    encoding: "utf8",
    timeout: 60_000,
  });
  if (out.error || out.status !== 0)
    fail(
      `cannot run pnpm --version: ${out.error?.message ?? firstLine(out.stderr)}`,
    );
  return out.stdout.trim();
})();

const git = (dir, gitArgs) => {
  const out = spawnSync("git", gitArgs, {
    cwd: dir,
    encoding: "utf8",
    maxBuffer: MAX_BUFFER,
    timeout: 60_000,
  });
  return out.error || out.status !== 0 ? null : out.stdout;
};
const gitTop = (dir) => {
  const top = git(dir, ["rev-parse", "--show-toplevel"]);
  return top == null ? null : fs.realpathSync(top.trim());
};
const cwdTop = gitTop(cwd);
if (!cwdTop)
  fail(
    `${cwd} is not inside a git repository (git rev-parse failed); workspace manifests are listed with git ls-files`,
  );

// Use the workspace's own semver so no extra install is needed.
const semverPath = (() => {
  const hoisted = path.join(cwd, "node_modules/semver");
  try {
    const { version } = JSON.parse(
      fs.readFileSync(path.join(hoisted, "package.json"), "utf8"),
    );
    if (version?.startsWith("7.")) return hoisted;
  } catch {}
  const dir = fs
    .readdirSync(store)
    .filter((d) => /^semver@7\./.test(d))
    .sort()
    .pop();
  const candidate = dir && path.join(store, dir, "node_modules/semver");
  return candidate && fs.existsSync(path.join(candidate, "package.json"))
    ? candidate
    : null;
})();
if (!semverPath)
  fail(
    "semver@7 not found in node_modules/semver or node_modules/.pnpm/semver@7.*; run pnpm install, or add semver@7 to the workspace",
  );
let semver;
try {
  semver = createRequire(import.meta.url)(semverPath);
} catch (error) {
  fail(`cannot load semver from ${semverPath}: ${error.message}`);
}

// ---------------------------------------------------------------------------
// Minimal YAML reader for pnpm-workspace.yaml and pnpm-lock.yaml: block maps,
// block sequences, flow collections, quoted and plain scalars. Anchors, tags
// and block scalars are reported as errors for the top-level key they sit in.
const YAML_ERROR = Symbol("yamlError");
const isItem = (text) => text === "-" || text.startsWith("- ");

const stripComment = (line) => {
  let quote = null;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quote) {
      if (quote === '"' && ch === "\\") i++;
      else if (ch === quote) quote = null;
    } else if ((ch === '"' || ch === "'") && (i === 0 || /[\s[{,]/.test(line[i - 1])))
      quote = ch;
    else if (ch === "#" && (i === 0 || /\s/.test(line[i - 1])))
      return line.slice(0, i);
  }
  return line;
};

const unquote = (s) =>
  s.startsWith('"') ? JSON.parse(s) : s.slice(1, -1).replace(/''/g, "'");

// Index just past the closing quote of a quoted scalar starting at `start`.
const quoteEnd = (s, start) => {
  const q = s[start];
  for (let j = start + 1; j < s.length; j++) {
    if (q === '"' && s[j] === "\\") j++;
    else if (s[j] === q) {
      if (q === "'" && s[j + 1] === "'") j++;
      else return j + 1;
    }
  }
  throw new Error(`unterminated quote in "${s}"`);
};

const plainScalar = (s) => {
  if (s === "" || s === "~" || s === "null") return null;
  if (s === "true" || s === "false") return s === "true";
  if (/^[&*!]/.test(s)) throw new Error(`anchors, aliases and tags are not supported: "${s}"`);
  if (/^[|>][-+0-9]*$/.test(s)) throw new Error("block scalars are not supported");
  return s;
};

const parseFlow = (src) => {
  let pos = 0;
  const skip = () => {
    while (pos < src.length && /\s/.test(src[pos])) pos++;
  };
  const err = (m) => {
    throw new Error(`${m} in "${src}"`);
  };
  const quoted = () => {
    const end = quoteEnd(src, pos);
    const s = unquote(src.slice(pos, end));
    pos = end;
    return s;
  };
  const plain = (isKey) => {
    const start = pos;
    while (
      pos < src.length &&
      !",]}".includes(src[pos]) &&
      !(src[pos] === ":" && (isKey || /[\s,\]}]/.test(src[pos + 1] ?? " ")))
    )
      pos++;
    return plainScalar(src.slice(start, pos).trim());
  };
  const value = () => {
    skip();
    if (src[pos] === "[") {
      pos++;
      const arr = [];
      for (skip(); src[pos] !== "]"; skip()) {
        arr.push(value());
        skip();
        if (src[pos] === ",") pos++;
        else if (src[pos] !== "]") err("expected , or ]");
      }
      pos++;
      return arr;
    }
    if (src[pos] === "{") {
      pos++;
      const obj = {};
      for (skip(); src[pos] !== "}"; skip()) {
        if (pos >= src.length) err("unterminated {");
        const key = src[pos] === '"' || src[pos] === "'" ? quoted() : plain(true);
        skip();
        let v = null;
        if (src[pos] === ":") {
          pos++;
          v = value();
          skip();
        }
        obj[key] = v;
        if (src[pos] === ",") pos++;
        else if (src[pos] !== "}") err("expected , or }");
      }
      pos++;
      return obj;
    }
    if (src[pos] === '"' || src[pos] === "'") return quoted();
    return plain(false);
  };
  const v = value();
  skip();
  if (pos < src.length) err("unexpected trailing text");
  return v;
};

// "key: rest" -> { key, rest }, or null when the text is not a mapping entry.
const splitKey = (text) => {
  if (text[0] === '"' || text[0] === "'") {
    let end;
    try {
      end = quoteEnd(text, 0);
    } catch {
      return null;
    }
    const after = text.slice(end).trimStart();
    if (!/^:(\s|$)/.test(after)) return null;
    return { key: unquote(text.slice(0, end)), rest: after.slice(1).trim() };
  }
  const m = text.match(/^(.*?):(?:\s+|$)/);
  if (!m || !m[1].trim() || /^[[{?]/.test(m[1])) return null;
  return { key: m[1].trim(), rest: text.slice(m[0].length).trim() };
};

const parseYaml = (text) => {
  const lines = [];
  for (const raw of text.split(/\r?\n/)) {
    const line = stripComment(raw).replace(/\s+$/, "");
    if (!line.trim() || /^(---|\.\.\.)(\s|$)/.test(line)) continue;
    const indent = line.match(/^ */)[0].length;
    lines.push({ indent, text: line.slice(indent) });
  }
  let i = 0;
  const inline = (s) => (/^[[{"']/.test(s) ? parseFlow(s) : plainScalar(s));
  const nested = (parentIndent, allowSameIndentSeq) => {
    const next = lines[i];
    if (!next) return null;
    if (next.indent > parentIndent) return block(next.indent);
    if (allowSameIndentSeq && next.indent === parentIndent && isItem(next.text))
      return seq(next.indent);
    return null;
  };
  const block = (indent) => (isItem(lines[i].text) ? seq(indent) : map(indent));
  const checkDedent = (indent) => {
    if (i < lines.length && lines[i].indent > indent)
      throw new Error(`unexpected indentation at "${lines[i].text}"`);
  };
  const map = (indent) => {
    const obj = {};
    while (i < lines.length && lines[i].indent === indent && !isItem(lines[i].text)) {
      if (lines[i].text.startsWith("\t")) throw new Error("tab indentation");
      const kv = splitKey(lines[i].text);
      if (!kv) throw new Error(`cannot parse "${lines[i].text}"`);
      i++;
      obj[kv.key] = kv.rest === "" ? nested(indent, true) : inline(kv.rest);
      checkDedent(indent);
    }
    return obj;
  };
  const seq = (indent) => {
    const arr = [];
    while (i < lines.length && lines[i].indent === indent && isItem(lines[i].text)) {
      const text = lines[i].text;
      const rest = text.slice(1).trimStart();
      if (rest === "") {
        i++;
        arr.push(nested(indent, false));
      } else if (!/^[[{]/.test(rest) && (isItem(rest) || splitKey(rest))) {
        // "- key: value" or "- - x": reparse the rest as a block at its column.
        const childIndent = indent + text.length - rest.length;
        lines[i] = { indent: childIndent, text: rest };
        arr.push(block(childIndent));
      } else {
        i++;
        arr.push(inline(rest));
      }
      checkDedent(indent);
    }
    return arr;
  };
  const root = {};
  while (i < lines.length) {
    const kv = lines[i].indent === 0 ? splitKey(lines[i].text) : null;
    i++;
    if (!kv) continue;
    try {
      root[kv.key] = kv.rest === "" ? nested(0, true) : inline(kv.rest);
    } catch (error) {
      root[kv.key] = { [YAML_ERROR]: error.message };
      while (i < lines.length && (lines[i].indent !== 0 || isItem(lines[i].text))) i++;
    }
  }
  return root;
};
const yamlError = (value) =>
  value && typeof value === "object" && YAML_ERROR in value ? value[YAML_ERROR] : null;
const obj = (v) => (v && typeof v === "object" && !Array.isArray(v) && !yamlError(v) ? v : {});
const list = (v) => (Array.isArray(v) ? v.filter((x) => typeof x === "string") : []);

// ---------------------------------------------------------------------------
// Lockfile v9 index.

// "name@version(peers)" -> { name, version }
const parseSpec = (spec) => {
  const at = spec.indexOf("@", spec.startsWith("@") ? 1 : 0);
  return at <= 0
    ? null
    : { name: spec.slice(0, at), version: spec.slice(at + 1).replace(/\(.*$/, "") };
};
// Resolved version from a snapshot or importer entry; null when not semver
// (link:, file:, git, tarball URL).
const depVersion = (value) => {
  if (typeof value !== "string") return null;
  const s = value.replace(/\(.*$/, "");
  if (semver.valid(s)) return s;
  const alias = parseSpec(s);
  return alias && semver.valid(alias.version) ? alias.version : null;
};

const indexLockfile = (text) => {
  const data = parseYaml(text);
  const errors = [];
  const get = (key) => {
    const err = yamlError(data[key]);
    if (err) errors.push(`pnpm-lock.yaml ${key}: ${err}`);
    return obj(data[key]);
  };
  const add = (map, id, dep, version) => {
    if (!map.has(id)) map.set(id, new Map());
    const deps = map.get(id);
    if (!deps.has(dep)) deps.set(dep, []);
    if (!deps.get(dep).includes(version)) deps.get(dep).push(version);
  };
  // "name@version" -> Map(dependency key -> resolved versions); peer variants merge.
  const snapshots = new Map();
  for (const [key, snap] of Object.entries(get("snapshots"))) {
    const nv = parseSpec(key);
    if (!nv) continue;
    const id = `${nv.name}@${nv.version}`;
    if (!snapshots.has(id)) snapshots.set(id, new Map());
    for (const section of ["dependencies", "optionalDependencies"])
      for (const [dep, v] of Object.entries(obj(snap?.[section])))
        add(snapshots, id, dep, depVersion(v));
  }
  // importer path ("." for the root) -> Map(dependency key -> resolved versions)
  const importers = new Map();
  for (const [importer, entry] of Object.entries(get("importers"))) {
    importers.set(importer, new Map());
    for (const section of ["dependencies", "devDependencies", "optionalDependencies"])
      for (const [dep, v] of Object.entries(obj(entry?.[section])))
        add(importers, importer, dep, depVersion(v?.version));
  }
  return {
    snapshots,
    importers,
    catalogs: get("catalogs"),
    overrides: get("overrides"),
    errors,
  };
};
const lockIndex = indexLockfile(lockfile);

// ---------------------------------------------------------------------------
// Settings.

const errors = { overrides: [], patched: [], waivers: [] };
const allErrors = (message) => {
  for (const key of Object.keys(errors)) errors[key].push(message);
};

const config = pnpmJson(cwd, ["config", "list", "--json"]);
let cfg = {};
if (!config.ok) allErrors(config.error);
else if (!config.data || typeof config.data !== "object")
  allErrors("pnpm config list --json did not return an object");
else cfg = config.data;

const wsPath = path.join(cwd, "pnpm-workspace.yaml");
let ws = {};
if (fs.existsSync(wsPath)) {
  try {
    ws = parseYaml(fs.readFileSync(wsPath, "utf8"));
  } catch (error) {
    allErrors(`cannot parse pnpm-workspace.yaml: ${error.message}`);
  }
}
const wsGet = (key, section) => {
  const err = yamlError(ws[key]);
  if (err) {
    const message = `cannot parse pnpm-workspace.yaml ${key}: ${err}`;
    if (section) errors[section].push(message);
    else allErrors(message);
    return undefined;
  }
  return ws[key];
};

let rootPkg = {};
try {
  rootPkg = JSON.parse(fs.readFileSync(path.join(cwd, "package.json"), "utf8"));
} catch (error) {
  if (fs.existsSync(path.join(cwd, "package.json")))
    allErrors(`cannot parse package.json: ${error.message}`);
}
const pkgPnpm = obj(rootPkg.pnpm);
const pkgOnlyWarning = (field, inLockfile) =>
  `only in package.json pnpm.${field}${inLockfile === false ? " and absent from pnpm-lock.yaml" : ""}: pnpm ${pnpmVersion} may ignore the package.json "pnpm" field (pnpm 10+ reads pnpm-workspace.yaml)`;

const catalogs = {};
const addCatalog = (name, entries) => {
  for (const [dep, spec] of Object.entries(obj(entries))) {
    const range = typeof spec === "string" ? spec : spec?.specifier;
    if (typeof range === "string") (catalogs[name] ??= {})[dep] = range;
  }
};
for (const [name, entries] of Object.entries(lockIndex.catalogs)) addCatalog(name, entries);
for (const [name, entries] of Object.entries(obj(wsGet("catalogs", "overrides"))))
  addCatalog(name, entries);
addCatalog("default", wsGet("catalog", "overrides"));
for (const [name, entries] of Object.entries(obj(cfg.catalogs))) addCatalog(name, entries);
addCatalog("default", cfg.catalog);
const fromCatalog = (name, range) =>
  catalogs[range.slice("catalog:".length).trim() || "default"]?.[name];

// selector -> { value, source }
const mergeSettings = (field, section) => {
  const merged = new Map();
  for (const [k, v] of Object.entries(obj(wsGet(field, section))))
    merged.set(k, { value: v, source: "pnpm-workspace.yaml" });
  for (const [k, v] of Object.entries(obj(cfg[field])))
    merged.set(k, { value: v, source: merged.get(k)?.source ?? "pnpm config" });
  for (const [k, v] of Object.entries(obj(pkgPnpm[field])))
    if (!merged.has(k)) merged.set(k, { value: v, source: "package.json" });
  return merged;
};
const overrides = mergeSettings("overrides", "overrides");
const patched = mergeSettings("patchedDependencies", "patched");

// ---------------------------------------------------------------------------
// Declared dependency ranges.

const splitAlias = (spec) => {
  const at = spec.indexOf("@", spec.startsWith("@") ? 1 : 0);
  return at < 0
    ? { name: spec, range: null }
    : { name: spec.slice(0, at), range: spec.slice(at + 1) || null };
};

// Normalise a declared range: resolve catalog:, unwrap npm: aliases, and
// return { name, range } or { name, range: null } when it cannot be analysed.
const analyse = (depKey, raw) => {
  let range = raw.trim();
  let name = depKey;
  if (range.startsWith("catalog:")) {
    const resolved = fromCatalog(depKey, range);
    if (typeof resolved !== "string") return { name, range: null, why: "no catalog entry" };
    range = resolved.trim();
  }
  if (range.startsWith("npm:")) {
    const alias = splitAlias(range.slice(4));
    name = alias.name;
    range = alias.range ?? "";
    if (!range) return { name, range: null };
  }
  if (!semver.validRange(range) || !semver.minVersion(range)) return { name, range: null };
  return { name, range };
};

// dependency name -> consumers { from, version, depKey, raw, range, importer?, storeId? }
const declared = new Map();
const seenConsumers = new Set();
const addConsumer = (name, consumer) => {
  const key = [name, consumer.from, consumer.version, consumer.depKey, consumer.raw, consumer.importer ?? ""].join("\0");
  if (seenConsumers.has(key)) return;
  seenConsumers.add(key);
  if (!declared.has(name)) declared.set(name, []);
  declared.get(name).push(consumer);
};
// Snapshot versions per package name, to skip stale store directories that
// pnpm has not pruned yet.
const snapshotVersions = new Map();
for (const id of lockIndex.snapshots.keys()) {
  const { name, version } = parseSpec(id);
  if (!snapshotVersions.has(name)) snapshotVersions.set(name, new Set());
  snapshotVersions.get(name).add(version);
}
const staleInStore = (pkg) => {
  const versions = snapshotVersions.get(pkg.name);
  return Boolean(
    versions &&
      !versions.has(pkg.version) &&
      [...versions].every((v) => semver.valid(v)),
  );
};
const record = (pkgFile, { importer = null, includeDev = false } = {}) => {
  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgFile, "utf8"));
  } catch {
    return;
  }
  if (importer == null && staleInStore(pkg)) return;
  const sections = [
    "dependencies",
    "optionalDependencies",
    ...(includeDev ? ["devDependencies"] : []),
  ];
  for (const section of sections) {
    for (const [depKey, raw] of Object.entries(pkg[section] ?? {})) {
      if (typeof raw !== "string") continue;
      const { name, range, why } = analyse(depKey, raw);
      const base = {
        from: pkg.name ?? pkgFile,
        version: pkg.version ?? null,
        depKey,
        raw,
        importer,
        why,
      };
      addConsumer(name, { ...base, range });
      // An alias key is also a name an override might target; it cannot be judged by range.
      if (name !== depKey) addConsumer(depKey, { ...base, range: null });
    }
  }
};

// Installed packages: each store entry links its dependencies as symlinks, so
// dedupe by real path to count every package once.
const seenDirs = new Set();
for (const entry of fs.readdirSync(store)) {
  const nm = path.join(store, entry, "node_modules");
  if (!fs.existsSync(nm)) continue;
  for (const dir of fs.readdirSync(nm)) {
    let dirs = [dir];
    if (dir.startsWith("@")) {
      try {
        dirs = fs.readdirSync(path.join(nm, dir)).map((s) => path.join(dir, s));
      } catch {
        continue;
      }
    }
    for (const d of dirs) {
      let real;
      try {
        real = fs.realpathSync(path.join(nm, d));
      } catch {
        continue;
      }
      if (seenDirs.has(real)) continue;
      seenDirs.add(real);
      record(path.join(real, "package.json"));
    }
  }
}

// Workspace manifests: files named exactly package.json, limited to lockfile
// importers when the importers section was readable.
const lsFiles = git(cwd, ["ls-files", "-z", "--cached", "--others", "--exclude-standard"]);
if (lsFiles == null) fail(`git ls-files failed in ${cwd}`);
const importerDirs = new Set(lockIndex.importers.keys());
for (const file of new Set(lsFiles.split("\0").filter(Boolean))) {
  if (path.posix.basename(file) !== "package.json") continue;
  if (file.split("/").includes("node_modules")) continue;
  const importer = path.posix.dirname(file) || ".";
  if (importerDirs.size && !importerDirs.has(importer)) continue;
  record(path.join(cwd, file), { importer, includeDev: true });
}

const lockedVersions = (name, text = lockfile) => {
  const escaped = name.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&");
  const re = new RegExp(`^  '?${escaped}@(\\d[^:(\\s']*)`, "gm");
  return [...new Set([...text.matchAll(re)].map((m) => m[1]))]
    .filter((v) => semver.valid(v))
    .sort(semver.compare);
};

// Versions the lockfile resolved for this consumer's dependency, or null.
const resolvedFor = (index, c) => {
  const deps =
    c.importer != null
      ? index.importers.get(c.importer)
      : index.snapshots.get(`${c.from}@${c.version}`);
  const versions = deps?.get(c.depKey);
  return versions?.length && versions.every(Boolean) ? versions : null;
};

// "parent@range>child@range" -> { parent, parentRange, child, childRange }
const splitSelector = (selector) => {
  const parts = selector.split(/>(?!=)/);
  const child = splitAlias(parts.pop());
  const parent = parts.length ? splitAlias(parts.join(">")) : null;
  return {
    parent: parent?.name ?? null,
    parentRange: parent?.range ?? null,
    child: child.name,
    childRange: child.range,
    error: parts.length > 1 ? "selectors with more than one > are not analysed" : null,
  };
};

const classify = (selector, value, source) => {
  const { parent, parentRange, child, childRange, error } = splitSelector(selector);
  const result = {
    selector,
    value,
    child,
    parent,
    source,
    locked: lockedVersions(child),
    consumers: 0,
    belowTarget: [],
    downgrades: [],
    aboveRange: [],
    unanalysable: [],
    notes: [],
    warnings: [],
  };
  if (source === "package.json")
    result.warnings.push(
      pkgOnlyWarning("overrides", selector in lockIndex.overrides),
    );
  const done = (status) => Object.assign(result, { status });
  if (error) {
    result.notes.push(error);
    return done("UNCLASSIFIED");
  }
  for (const [label, r] of [["parent", parentRange], ["child", childRange]])
    if (r && !semver.validRange(r)) {
      result.notes.push(`${label} selector range ${r} is not a semver range`);
      return done("UNCLASSIFIED");
    }

  let targetRange = String(value);
  if (targetRange.startsWith("catalog:"))
    targetRange = fromCatalog(child, targetRange) ?? targetRange;
  const target =
    !/^(npm|workspace|link|file|catalog):/.test(targetRange) &&
    semver.validRange(targetRange)
      ? semver.minVersion(targetRange)?.version
      : null;

  const consumers = [];
  for (const c of declared.get(child) ?? []) {
    if (parent && c.from !== parent) continue;
    if (parent && parentRange) {
      if (!semver.valid(c.version)) {
        result.unanalysable.push({ ...c, why: "parent version unknown" });
        continue;
      }
      if (!semver.satisfies(c.version, parentRange)) continue;
    }
    consumers.push(c);
  }
  result.unanalysable.push(...consumers.filter((c) => c.range == null));
  const governed = consumers.filter(
    (c) =>
      c.range != null &&
      (!childRange || semver.intersects(c.range, childRange)),
  );
  result.consumers = governed.length + result.unanalysable.length;
  if (!result.consumers) return done("NO_CONSUMERS");

  // A consumer is forced when the version resolved for it falls outside its
  // declared range. Parent-scoped selectors need the per-parent resolution;
  // global ones fall back to "no locked version satisfies the range".
  const missing = [];
  const forcedMap = new Map();
  for (const c of governed) {
    const versions = resolvedFor(lockIndex, c);
    c.resolved = versions;
    if (versions) {
      forcedMap.set(c, versions.some((v) => !semver.satisfies(v, c.range)));
      if (parent && target && versions.some((v) => !semver.satisfies(v, targetRange)))
        result.notes.push(
          `${c.from}@${c.version} resolves ${child} ${versions.join("/")}, which does not satisfy the override; the lockfile may be stale (run pnpm install)`,
        );
    } else if (parent) {
      missing.push(c);
      forcedMap.set(c, false);
    } else {
      forcedMap.set(c, !result.locked.some((v) => semver.satisfies(v, c.range)));
    }
  }
  const forced = (c) => forcedMap.get(c);
  result.belowTarget = governed.filter(
    (c) => target && semver.lt(semver.minVersion(c.range).version, target),
  );
  // The override resolves older than a consumer accepts: stale, or a deliberate compatibility pin.
  result.downgrades = governed.filter(
    (c) => target && forced(c) && semver.ltr(target, c.range),
  );
  // The override resolves newer than a consumer accepts: usually a security bump the parent has not adopted.
  result.aboveRange = governed.filter(
    (c) => target && forced(c) && semver.gtr(target, c.range),
  );

  if (missing.length)
    result.notes.push(
      `no resolved ${child} for ${missing.map((c) => `${c.from}@${c.version ?? "?"}`).join(", ")} in pnpm-lock.yaml snapshots/importers${lockIndex.errors.length ? ` (${lockIndex.errors.join("; ")})` : ""}`,
    );
  if (!target) {
    result.notes.push(`override value ${value} is not a semver range`);
    return done("UNCLASSIFIED");
  }
  if (result.unanalysable.length || missing.length) return done("UNCLASSIFIED");
  if (parent && result.notes.length) return done("UNCLASSIFIED");
  if (result.downgrades.length) return done("DOWNGRADES_BELOW_RANGE");
  if (result.aboveRange.length) return done("FORCES_ABOVE_RANGE");
  if (result.belowTarget.length) return done("FLOOR_STILL_NEEDED");
  return done("REDUNDANT");
};

const results = [...overrides].map(([selector, { value, source }]) =>
  classify(selector, value, source),
);

// { ok, ids } or { ok: false, error }. A nonzero exit is accepted only when
// stdout is JSON with an advisories object.
const advisoryIds = (dir) => {
  const audit = pnpmJson(dir, ["audit", "--json"], {
    timeout: 300_000,
    accept: (data) =>
      data && typeof data.advisories === "object" && data.advisories !== null,
  });
  if (!audit.ok) return audit;
  return {
    ok: true,
    ids: Object.values(audit.data.advisories).map(
      (a) => `${a.module_name}:${a.github_advisory_id ?? a.id}`,
    ),
  };
};

// Remove one override from whichever file declares it. Returns false when not found.
const removeOverride = (dir, selector, originals) => {
  if (originals.workspace != null) {
    const eol = originals.workspace.includes("\r\n") ? "\r\n" : "\n";
    const lines = originals.workspace.split(/\r?\n/);
    const start = lines.findIndex((l) => /^overrides:\s*(#.*)?$/.test(l));
    if (start >= 0) {
      const indentOf = (l) => l.match(/^[ \t]*/)[0].length;
      const meaningful = (l) => stripComment(l).trim() !== "";
      let indent = null;
      let entries = 0;
      let hit = -1;
      let end = lines.length;
      for (let i = start + 1; i < lines.length; i++) {
        if (!meaningful(lines[i])) continue;
        const ind = indentOf(lines[i]);
        if (ind === 0) {
          end = i;
          break;
        }
        indent ??= ind;
        if (ind !== indent) continue;
        entries++;
        const kv = splitKey(stripComment(lines[i]).trim());
        if (kv && String(kv.key) === selector && hit < 0) hit = i;
      }
      if (hit >= 0) {
        let stop = hit + 1;
        while (stop < end && (!meaningful(lines[stop]) || indentOf(lines[stop]) > indent)) {
          if (!meaningful(lines[stop])) {
            // keep blank lines and comments unless a deeper continuation follows
            let next = stop;
            while (next < end && !meaningful(lines[next])) next++;
            if (next >= end || indentOf(lines[next]) <= indent) break;
          }
          stop++;
        }
        lines.splice(hit, stop - hit);
        if (entries === 1) lines[start] = "overrides: {}";
        fs.writeFileSync(path.join(dir, "pnpm-workspace.yaml"), lines.join(eol));
        return true;
      }
    }
  }
  const pkg = JSON.parse(originals.packageJson);
  if (pkg.pnpm?.overrides && selector in pkg.pnpm.overrides) {
    delete pkg.pnpm.overrides[selector];
    const indent = originals.packageJson.match(/^[ \t]+(?=")/m)?.[0] ?? 2;
    fs.writeFileSync(
      path.join(dir, "package.json"),
      `${JSON.stringify(pkg, null, indent)}\n`,
    );
    return true;
  }
  return false;
};

if (simulateDir) {
  const simTop = gitTop(simulateDir);
  if (!simTop)
    fail(`--simulate ${simulateDir} is not inside a git worktree or clone`);
  if (simTop === cwdTop || fs.realpathSync(simulateDir) === fs.realpathSync(cwd))
    fail("--simulate needs a separate scratch worktree, not this checkout");
  const files = {
    workspace: path.join(simulateDir, "pnpm-workspace.yaml"),
    packageJson: path.join(simulateDir, "package.json"),
    lock: path.join(simulateDir, "pnpm-lock.yaml"),
  };
  for (const file of [files.packageJson, files.lock])
    if (!fs.existsSync(file))
      fail(`--simulate directory has no ${path.basename(file)}: ${simulateDir}`);
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
    else fs.rmSync(files.workspace, { force: true });
    fs.writeFileSync(files.packageJson, originals.packageJson);
    fs.writeFileSync(files.lock, originals.lock);
  };
  const onSignal = (signal) => {
    restore();
    process.exit(signal === "SIGINT" ? 130 : 143);
  };
  process.on("SIGINT", onSignal);
  process.on("SIGTERM", onSignal);
  try {
    const baseline = advisoryIds(simulateDir);
    for (const result of results) {
      restore();
      if (!removeOverride(simulateDir, result.selector, originals)) {
        result.simulation =
          "selector not found in pnpm-workspace.yaml overrides or package.json pnpm.overrides";
        continue;
      }
      const install = spawnSync("pnpm", ["install", "--lockfile-only"], {
        cwd: simulateDir,
        encoding: "utf8",
        maxBuffer: MAX_BUFFER,
        timeout: 600_000,
      });
      if (isInterrupt(install) && !install.error)
        throw new Error("pnpm install interrupted");
      if (install.error || install.status !== 0) {
        const reason = install.error
          ? install.error.code === "ETIMEDOUT"
            ? "timed out"
            : install.error.message
          : firstLine(`${install.stderr}\n${install.stdout}`) ||
            `exit ${install.status}`;
        result.simulation = `install failed: ${reason}`;
        continue;
      }
      const afterText = fs.readFileSync(files.lock, "utf8");
      const after = lockedVersions(result.child, afterText);
      let underParent = "";
      if (result.parent) {
        const index = indexLockfile(afterText);
        const versions = new Set();
        for (const [id, deps] of index.snapshots)
          if (parseSpec(id)?.name === result.parent)
            for (const v of deps.get(result.child) ?? []) versions.add(v ?? "non-semver");
        underParent = `resolved under ${result.parent}: ${[...versions].join(", ") || "unknown"}; `;
      }
      let advisories;
      if (!baseline.ok) advisories = `UNKNOWN (baseline audit failed: ${baseline.error})`;
      else {
        const audit = advisoryIds(simulateDir);
        advisories = audit.ok
          ? audit.ids.filter((id) => !baseline.ids.includes(id)).join(", ") || "none"
          : `UNKNOWN (${audit.error})`;
      }
      result.simulation = `locked after removal: ${after.join(", ") || "none"}; ${underParent}new advisories: ${advisories}`;
    }
  } finally {
    restore();
    process.off("SIGINT", onSignal);
    process.off("SIGTERM", onSignal);
  }
}

const describe = (items) =>
  items
    .slice(0, 3)
    .map((c) => {
      const range = c.range && c.range !== c.raw ? `${c.raw} (${c.range})` : c.raw;
      const resolved = c.resolved ? ` resolved ${c.resolved.join("/")}` : "";
      const why = c.range == null && c.why ? ` [${c.why}]` : "";
      return `${c.from} ${range}${resolved}${why}`;
    })
    .join("; ") + (items.length > 3 ? `; +${items.length - 3} more` : "");
const printErrors = (list) => {
  for (const message of new Set(list)) console.log(`ERROR: ${message}`);
  if (list.length) process.exitCode = 1;
};

console.log("## Overrides");
printErrors(errors.overrides);
if (!results.length && !errors.overrides.length) console.log("none");
for (const r of results) {
  console.log(
    `${r.status.padEnd(28)} ${r.selector}: ${r.value}  locked=[${r.locked.join(", ")}] consumers=${r.consumers}`,
  );
  for (const w of r.warnings) console.log(`    warning: ${w}`);
  if (r.unanalysable.length)
    console.log(`    unanalysable ranges: ${describe(r.unanalysable)}`);
  if (r.downgrades.length)
    console.log(`    requires newer than override: ${describe(r.downgrades)}`);
  else if (r.aboveRange.length)
    console.log(`    declared range below override: ${describe(r.aboveRange)}`);
  else if (r.belowTarget.length)
    console.log(
      `    ranges allowing older versions: ${describe(r.belowTarget)}`,
    );
  for (const note of r.notes) console.log(`    note: ${note}`);
  if (r.simulation) console.log(`    simulation: ${r.simulation}`);
}

console.log("\n## Patched dependencies");
printErrors(errors.patched);
if (!patched.size && !errors.patched.length) console.log("none");
for (const [key, { value: file, source }] of patched) {
  const { child } = splitSelector(key);
  const version = key.slice(child.length + 1);
  const meta = pnpmJson(cwd, ["view", child, "version", "time", "--json"], {
    timeout: 60_000,
  });
  const info = meta.ok && meta.data && typeof meta.data === "object" ? meta.data : {};
  const locked = lockedVersions(child);
  const inGraph = !version
    ? locked.length > 0
    : semver.valid(version)
      ? locked.includes(version)
      : semver.validRange(version)
        ? locked.some((v) => semver.satisfies(v, version))
        : "unknown";
  console.log(
    `${key} -> ${path.relative(cwd, path.resolve(cwd, String(file)))}  inLockfile=${inGraph} latest=${info.version ?? "unknown"} published=${info.time?.[info.version] ?? "unknown"}`,
  );
  if (source === "package.json")
    console.log(`    warning: ${pkgOnlyWarning("patchedDependencies")}`);
}

console.log("\n## Audit waivers");
printErrors(errors.waivers);
// id -> true when it comes only from package.json pnpm.auditConfig
const waivers = new Map();
const addWaivers = (ids, pkgOnly = false) => {
  for (const id of ids) if (!waivers.has(id)) waivers.set(id, pkgOnly);
};
const wsAudit = obj(wsGet("auditConfig", "waivers"));
addWaivers(list(obj(cfg.audit).ignore));
addWaivers(list(obj(cfg.auditConfig).ignoreGhsas));
addWaivers(list(obj(cfg.auditConfig).ignoreCves));
addWaivers(list(wsAudit.ignoreGhsas));
addWaivers(list(wsAudit.ignoreCves));
addWaivers(list(obj(pkgPnpm.auditConfig).ignoreGhsas), true);
addWaivers(list(obj(pkgPnpm.auditConfig).ignoreCves), true);
if (!waivers.size && !errors.waivers.length) console.log("none");
for (const [id, pkgOnly] of waivers)
  console.log(pkgOnly ? `${id}  (warning: ${pkgOnlyWarning("auditConfig")})` : id);
