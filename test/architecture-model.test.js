import assert from "node:assert/strict";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const scripts = path.join(root, "skills/deep-wiki-html/scripts");
const template = await readFile(path.join(root, "skills/deep-wiki-html/assets/wiki.html"), "utf8");
const timestamp = "2026-11-13T00:00:00Z";
const metadata = {
  version: 1, source_commit: null, working_tree: "unknown", generated_at: timestamp,
  scope: { audience: "Developers", depth: "Overview", included: ["src"], excluded: [] },
  sections: { overview: ["src/main.js"] },
};
const evidence = [{ path: "src/main.js", start_line: 1, end_line: 5, basis: "source" }];
const model = {
  schema_version: 1, source_commit: null, working_tree: "unknown", generated_at: timestamp,
  coverage: { included: ["src"], excluded: [], unknowns: [] },
  components: [{ id: "app", name: "App", kind: "application", responsibility: "fetch data", evidence }],
  relationships: [{ id: "self", from: "app", to: "app", type: "request", description: "Internal request", evidence }],
  flows: [{ id: "load", name: "Load", steps: [{ component_id: "app", description: "Read data", evidence }] }],
};

async function run(context, value = model, exported = value, meta = metadata) {
  const directory = await mkdtemp(path.join(os.tmpdir(), "architecture-model-"));
  context.after(() => rm(directory, { recursive: true, force: true }));
  const htmlPath = path.join(directory, "map.html");
  const jsonPath = path.join(directory, "map.json");
  const serialize = value => JSON.stringify(value).replaceAll("<", "\\u003c");
  const html = template.replace(/WIKI_[A-Z_]+/g, "Inspected source")
    .replace(/(<script[^>]*id="wiki-metadata"[^>]*>)[\s\S]*?(<\/script>)/,
      (_, start, end) => start + serialize(meta) + end)
    .replace("</body>", `<script id="architecture-model" type="application/json">${serialize(value)}</script></body>`);
  await writeFile(htmlPath, html);
  await writeFile(jsonPath, JSON.stringify(exported));
  return {
    html: spawnSync("python3", [path.join(scripts, "validate.py"), htmlPath], { encoding: "utf8" }),
    model: spawnSync("python3", [path.join(scripts, "validate_model.py"), htmlPath, "--json", jsonPath], { encoding: "utf8" }),
  };
}

test("offline HTML accepts an inert model containing network API names and a matching export", async context => {
  const result = await run(context);
  assert.equal(result.html.status, 0, result.html.stderr);
  assert.equal(result.model.status, 0, result.model.stderr);
});

test("model check rejects drift, dangling references, and missing evidence", async context => {
  const cases = [
    [value => { value.relationships[0].to = "missing"; }, /unknown relationship/],
    [value => { value.flows[0].steps[0].component_id = "missing"; }, /unknown flow/],
    [value => { value.components[0].evidence = []; }, /evidence must be nonempty/],
    [value => { value.components[0].evidence[0].path = "../secret"; }, /project-relative/],
    [value => { value.components[0].evidence[0].end_line = 0; }, /line range/],
    [value => { value.components.push(structuredClone(value.components[0])); }, /duplicate components/],
    [value => { value.source_commit = "a".repeat(40); }, /disagree on source_commit/],
  ];
  for (const [mutate, error] of cases) {
    const value = structuredClone(model);
    mutate(value);
    const result = await run(context, value);
    assert.equal(result.model.status, 1);
    assert.match(result.model.stderr, error);
  }
  const result = await run(context, model, { ...model, flows: [] });
  assert.equal(result.model.status, 1);
  assert.match(result.model.stderr, /export differs/);
});

test("document explainer logical source identities fit offline metadata without a Git baseline", async context => {
  const meta = structuredClone(metadata);
  meta.kind = "document-explainer";
  meta.document_sources = [{ id: "spec", title: "Specification", locator: "Attachment specification", revision: null }];
  meta.sections.overview = ["documents/specification"];
  const result = await run(context, model, model, meta);
  assert.equal(result.html.status, 0, result.html.stderr);
});
