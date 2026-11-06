import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skill = path.join(root, "skills/html-wiki");
const template = await readFile(path.join(skill, "assets/wiki.html"), "utf8");
const complete = template.replace(/WIKI_[A-Z_]+/g, (marker) => ({
  WIKI_TITLE: "Example repository",
  WIKI_TIMESTAMP: "2026-11-06T00:00:00Z",
  WIKI_SOURCE_PATH: "src/main.js",
}[marker] ?? "Inspected example"));

async function check(context, html) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "html-wiki-test-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const filename = path.join(directory, "wiki.html");
  await writeFile(filename, html);
  return spawnSync("python3", [path.join(skill, "scripts/validate.py"), filename], {
    encoding: "utf8",
  });
}

test("completed standalone wiki passes with pinned external citations and embedded images", async (context) => {
  const html = complete.replace("<footer>", '<a href="https://github.com/example/repo/blob/0123456789abcdef0123456789abcdef01234567/src/main.js#L1">Source</a><img alt="Pixel" src="data:image/png;base64,aGVsbG8="><footer>');
  const result = await check(context, html);
  assert.equal(result.status, 0, result.stderr);
});

test("unfilled shell is rejected rather than delivered as documentation", async (context) => {
  const result = await check(context, template);
  assert.equal(result.status, 1);
  assert.match(result.stderr, /unfilled template markers/);
});

test("validator rejects broken navigation and stale section metadata", async (context) => {
  for (const [from, to, error] of [
    ['href="#overview"', 'href="#missing"', /broken anchor/],
    ['id="overview"', 'id="content"', /duplicate id/],
    ['{"overview": ["src/main.js"]}', '{"removed": ["src/main.js"]}', /metadata sections/],
    ['<li><a href="#overview">Overview</a></li>', '', /missing from navigation/],
    ['"src/main.js"', '"../secret"', /source paths/],
    ['"source_commit": null', '"source_commit": "main"', /full SHA/],
    ['2026-11-06T00:00:00Z', '2026-11-06T00:00:00', /UTC ISO timestamp/],
  ]) {
    assert.ok(complete.includes(from));
    const result = await check(context, complete.replace(from, to));
    assert.equal(result.status, 1, `${from}: ${result.stdout}`);
    assert.match(result.stderr, error);
  }
});

test("validator rejects remote and adjacent runtime dependencies", async (context) => {
  const dependencies = [
    '<script src="https://cdn.example.org/wiki.js"></script>',
    '<script src="#inline-is-not-a-script-file"></script>',
    '<link rel="stylesheet" href="wiki.css">',
    '<img src="diagram.svg" alt="Diagram">',
    '<img srcset="https://example.org/a.png 2x" alt="Diagram">',
    '<svg viewBox="0 0 1 1" aria-labelledby="system-title"><use href="icons.svg#one" /></svg>',
    '<style>body { background: url(https://example.org/a.png) }</style>',
    '<style>@import "wiki.css";</style>',
    '<style>@im\\70ort "wiki.css";</style>',
    '<iframe srcdoc="hello"></iframe>',
    '<meta http-equiv="refresh" content="0;url=https://example.org">',
    '<a href="src/main.js">Local source</a>',
    '<a href="https://token@example.org/source">Credential URL</a>',
    '<script>fetch("https://example.org/index.json")</script>',
  ];
  for (const dependency of dependencies) {
    const result = await check(context, complete.replace("</body>", `${dependency}</body>`));
    assert.equal(result.status, 1, dependency);
    assert.match(result.stderr, /ERROR:/);
  }
});

test("metadata failures produce actionable errors without a traceback", async (context) => {
  for (const value of ["null", "[]", '{"version": 1}', "{broken"]) {
    const html = complete.replace(/(<script id="wiki-metadata"[^>]*>)[\s\S]*?(<\/script>)/, `$1${value}$2`);
    const result = await check(context, html);
    assert.equal(result.status, 1);
    assert.match(result.stderr, /invalid metadata/);
    assert.doesNotMatch(result.stderr, /Traceback/);
  }
});
