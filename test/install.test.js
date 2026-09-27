import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import {
  detectInstalledAgents,
  loadCatalog,
  parseArgs,
  selectAgents,
  selectSkills,
} from "../scripts/install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installer = path.join(root, "scripts/install.mjs");

test("the catalogue lists every current skill", async () => {
  const result = spawnSync(process.execPath, [installer, "--list"], {
    cwd: root,
    encoding: "utf8",
  });
  const catalog = await loadCatalog(root);
  const plain = result.stdout.replace(/\x1b\[[0-9;]*m/g, "");

  assert.equal(result.status, 0, result.stderr);
  assert.match(plain, new RegExp(`Found ${catalog.skills.length} skills`));
  for (const [name, summary] of Object.entries(catalog.summaries)) {
    assert.match(plain, new RegExp(`${name}\\s+${summary}`));
  }
});

test("non-interactive install copies selected skills", async (context) => {
  const project = await mkdtemp(path.join(os.tmpdir(), "skills-install-"));
  context.after(() => rm(project, { recursive: true, force: true }));

  const result = spawnSync(
    process.execPath,
    [
      installer,
      "--skill",
      "code-build",
      "--skill",
      "make-sense",
      "--agent",
      "cursor",
      "--copy",
      "-y",
      "--cwd",
      project,
    ],
    { cwd: root, encoding: "utf8" },
  );

  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Installed 2 skills/);
  const installedBuild = path.join(project, ".agents/skills/code-build");
  const buildSkill = await readFile(path.join(installedBuild, "SKILL.md"), "utf8");
  assert.match(buildSkill, /^---\nname: code-build\n/);
  const stackEntries = await readdir(path.join(root, "skills/code-build/stacks"), {
    withFileTypes: true,
  });
  const guides = stackEntries.filter((entry) => entry.isFile() && entry.name.endsWith(".md"));
  assert.ok(guides.length > 0, "Stack guides are missing");
  for (const guide of guides) {
    const relativePath = `stacks/${guide.name}`;
    assert.ok(buildSkill.includes(`](${relativePath})`), `Unlinked guide: ${guide.name}`);
    assert.equal(
      await readFile(path.join(installedBuild, relativePath), "utf8"),
      await readFile(path.join(root, "skills/code-build", relativePath), "utf8"),
    );
  }
  assert.match(
    await readFile(path.join(project, ".agents/skills/make-sense/SKILL.md"), "utf8"),
    /^---\nname: make-sense\n/,
  );
});

test("argument parsing and selection stay strict", async () => {
  const catalog = await loadCatalog(root);
  assert.deepEqual(parseArgs(["--list", "--skill", "concise", "-a", "cursor"]).skills, [
    "concise",
  ]);
  assert.equal(selectSkills(catalog, ["*"]).length, catalog.skills.length);
  assert.deepEqual(
    selectSkills(catalog, ["concise"]).map((skill) => skill.name),
    ["concise"],
  );
  assert.throws(() => selectSkills(catalog, ["missing"]), /Unknown skills/);
  assert.throws(() => selectAgents(catalog, ["missing"], []), /Unknown agents/);
  assert.deepEqual(
    selectAgents(catalog, ["cursor"], []).map((agent) => agent.id),
    ["cursor"],
  );
  assert.deepEqual(detectInstalledAgents(catalog.agents, () => false), []);
});
