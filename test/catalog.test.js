import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import skillsPlugin from "../.opencode/plugins/skills.mjs";
import skillsExtension from "../pi-extension/index.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const skillNames = (await readdir(path.join(root, "skills"), { withFileTypes: true }))
  .filter((entry) => entry.isDirectory())
  .map((entry) => entry.name)
  .sort();

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(root, relativePath), "utf8"));
}

test("host manifests agree on the plugin name and version", async () => {
  const [codex, claude, packageJson, marketplace] = await Promise.all([
    readJson(".codex-plugin/plugin.json"),
    readJson(".claude-plugin/plugin.json"),
    readJson("package.json"),
    readJson(".claude-plugin/marketplace.json"),
  ]);

  assert.equal(codex.name, "skills");
  assert.equal(claude.name, "skills");
  assert.equal(codex.version, packageJson.version);
  assert.equal(claude.version, packageJson.version);
  assert.equal(marketplace.plugins[0].version, packageJson.version);
  assert.deepEqual(packageJson.pi.skills, ["./skills"]);
});

test("skill files and UI metadata match their directories", async () => {
  for (const name of skillNames) {
    const [skill, metadata] = await Promise.all([
      readFile(path.join(root, `skills/${name}/SKILL.md`), "utf8"),
      readFile(path.join(root, `skills/${name}/agents/openai.yaml`), "utf8"),
    ]);
    assert.match(skill, new RegExp(`^---\\nname: ${name}\\n`));
    assert.doesNotMatch(skill, /\[TODO|TODO:/);
    assert.match(metadata, new RegExp(`\\$${name}\\b`));
  }
});

test("catalogues contain exactly the skills on disk", async () => {
  const [packs, commands, marketplace, skillsDocument] = await Promise.all([
    readJson("packs.json"),
    readJson("pi-extension/commands.json"),
    readJson(".claude-plugin/marketplace.json"),
    readFile(path.join(root, "SKILLS.md"), "utf8"),
  ]);
  const packed = packs.packs.flatMap((pack) => pack.skills);
  const documented = [...skillsDocument.matchAll(/^\| `([a-z][a-z0-9-]*)` \|/gm)].map(
    (match) => match[1],
  );

  assert.deepEqual(Object.keys(packs.summaries).sort(), skillNames);
  assert.deepEqual(packed.slice().sort(), skillNames);
  assert.equal(new Set(packed).size, packed.length);
  assert.deepEqual(Object.keys(commands).sort(), skillNames);
  assert.deepEqual(
    marketplace.plugins[0].skills.map((skill) => path.basename(skill)).sort(),
    skillNames,
  );
  assert.deepEqual(documented.sort(), skillNames);
});

test("OpenCode registers each skill once", async () => {
  const hooks = await skillsPlugin();
  const config = {};
  await hooks.config(config);
  await hooks.config(config);

  assert.deepEqual(Object.keys(config.command).sort(), skillNames);
  assert.equal(config.skills.paths.length, 1);
  assert.equal(config.skills.paths[0], path.join(root, "skills"));
  for (const name of skillNames) {
    assert.match(config.command[name].template, new RegExp(`\\b${name}\\b`));
    assert.match(config.command[name].template, /\$ARGUMENTS/);
  }
});

test("Pi commands delegate to each canonical skill", async () => {
  const commands = new Map();
  const sent = [];
  const pi = {
    registerCommand(name, options) {
      commands.set(name, options);
    },
    sendUserMessage(message, options) {
      sent.push({ message, options });
    },
  };

  skillsExtension(pi);
  assert.deepEqual([...commands.keys()].sort(), skillNames);
  for (const name of skillNames) {
    await commands.get(name).handler("test request", { isIdle: () => true });
  }
  assert.deepEqual(
    sent,
    skillNames.map((name) => ({ message: `/skill:${name} test request`, options: undefined })),
  );
});
