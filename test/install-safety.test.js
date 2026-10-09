import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { spawnSync } from "node:child_process";
import { syncBuiltinESMExports } from "node:module";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { installSelection, loadCatalog, parseArgs } from "../scripts/install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const installer = path.join(root, "scripts/install.mjs");

async function fixture(context) {
  const temporary = await fs.realpath(await fs.mkdtemp(path.join(os.tmpdir(), "skills-safety-")));
  context.after(() => fs.rm(temporary, { recursive: true, force: true }));
  const project = path.join(temporary, "project");
  const source = path.join(temporary, "source");
  const destinations = [".agents/skills/concise", ".claude/skills/concise"].map((dir) => path.join(project, dir));
  await fs.mkdir(source);
  await fs.writeFile(path.join(source, "SKILL.md"), "new skill");
  for (const destination of destinations) {
    await fs.mkdir(destination, { recursive: true });
    await fs.writeFile(path.join(destination, "custom.md"), "keep me");
  }
  return {
    temporary, project, source, destinations,
    selection: {
      skills: [{ name: "concise", directory: source }],
      agents: [{ projectDir: ".claude/skills" }],
      cwd: project, global: false, copy: true,
    },
  };
}

async function assertOriginals(destinations) {
  for (const destination of destinations) {
    assert.equal(await fs.readFile(path.join(destination, "custom.md"), "utf8"), "keep me");
    assert.deepEqual(await fs.readdir(path.dirname(destination)), ["concise"]);
  }
}

test("missing option values are rejected, including values followed by another flag", () => {
  for (const flag of ["--skill", "-s", "--agent", "-a", "--cwd"]) {
    for (const tail of [[], [""], ["  "], ["--yes"], ["--all"]]) {
      assert.throws(() => parseArgs([flag, ...tail]), /Missing value/);
    }
  }
  for (const flag of ["--skill=", "--agent=", "--cwd="]) {
    assert.throws(() => parseArgs([flag]), /Missing value/);
  }
  assert.equal(parseArgs(["--all"]).yes, true);
  assert.equal(parseArgs(["--cwd=./-project"]).cwd, path.resolve("./-project"));
});

test("unattended and malformed CLI calls fail without replacing existing files", async (context) => {
  const { project, destinations } = await fixture(context);
  const args = [installer, "--cwd", project, "--agent", "cursor"];
  for (const tail of [["--skill", "concise"], ["--yes", "--skill"]]) {
    const result = spawnSync(process.execPath, [...args, ...tail], { encoding: "utf8" });
    assert.equal(result.status, 1);
    assert.match(result.stderr, /requires --yes|Missing value/);
    await assertOriginals(destinations);
  }
  for (const flag of ["--list", "--help"]) {
    const result = spawnSync(process.execPath, [installer, flag], { encoding: "utf8" });
    assert.equal(result.status, 0, result.stderr);
    assert.ok(result.stdout.length > 0);
  }
});

test("missing sources and failed staging preserve all existing copies", async (context) => {
  const { selection, source, destinations } = await fixture(context);
  await assert.rejects(installSelection({ ...selection, skills: [{ name: "concise", directory: `${source}-missing` }] }));
  await assertOriginals(destinations);
  await fs.symlink(path.join(source, "missing"), path.join(source, "broken-link"));
  await assert.rejects(installSelection(selection));
  await assertOriginals(destinations);
});

test("failed replacement restores every destination, even after an earlier swap succeeded", async (context) => {
  const { selection, destinations } = await fixture(context);
  const rename = fs.rename;
  const replacement = context.mock.method(fs, "rename", async (from, to) => {
    if (path.basename(from) === "new" && to === destinations[1]) {
      throw Object.assign(new Error("simulated swap failure"), { code: "EIO" });
    }
    return rename(from, to);
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(installSelection(selection), /simulated swap failure/);
  } finally {
    replacement.mock.restore();
    syncBuiltinESMExports();
  }
  await assertOriginals(destinations);
});

test("failed rollback retains the original in the reported recovery directory", async (context) => {
  const { selection, destinations } = await fixture(context);
  const rename = fs.rename;
  let backup;
  const replacement = context.mock.method(fs, "rename", async (from, to) => {
    if (to === destinations[1] && ["new", "old"].includes(path.basename(from))) {
      if (path.basename(from) === "old") backup = from;
      throw Object.assign(new Error("simulated filesystem failure"), { code: "EIO" });
    }
    return rename(from, to);
  });
  syncBuiltinESMExports();
  try {
    await assert.rejects(installSelection(selection), (error) => {
      assert.ok(error instanceof AggregateError);
      assert.ok(error.message.includes(path.dirname(backup)));
      return true;
    });
  } finally {
    replacement.mock.restore();
    syncBuiltinESMExports();
  }
  assert.equal(await fs.readFile(path.join(backup, "custom.md"), "utf8"), "keep me");
  await assertOriginals([destinations[0]]);
});

test("external parent links are rejected before any selected skill is changed", async (context) => {
  const { selection, project, temporary, destinations } = await fixture(context);
  const outside = path.join(temporary, "project-other");
  await fs.mkdir(outside);
  await fs.writeFile(path.join(outside, "sentinel"), "untouched");
  for (const parent of [".claude", ".agents"]) {
    const target = path.join(project, parent);
    await fs.rename(target, `${target}-backup`);
    await fs.symlink(outside, target);
    await assert.rejects(installSelection(selection), /escapes/);
    assert.deepEqual(await fs.readdir(outside), ["sentinel"]);
    await fs.unlink(target);
    await fs.rename(`${target}-backup`, target);
    await assertOriginals(destinations);
  }
});

test("broken parent links fail without replacing existing skills", async (context) => {
  const { selection, project, temporary, destinations } = await fixture(context);
  await fs.symlink(path.join(temporary, "missing"), path.join(project, "broken"));
  await assert.rejects(installSelection({ ...selection, agents: [{ projectDir: "broken/skills" }] }), /Cannot resolve/);
  await assertOriginals(destinations);
});

test("copy and symlink updates succeed through a project alias without touching leaf-link targets", async (context) => {
  const { selection, project, temporary, destinations } = await fixture(context);
  const alias = path.join(temporary, "alias");
  await fs.symlink(project, alias);
  const outside = path.join(temporary, "outside");
  await fs.mkdir(outside);
  await fs.writeFile(path.join(outside, "custom.md"), "untouched");
  await fs.rm(destinations[1], { recursive: true });
  await fs.symlink(outside, destinations[1]);
  for (const copy of [false, true, false]) {
    await installSelection({ ...selection, cwd: alias, copy });
    for (const destination of destinations) {
      assert.equal(await fs.readFile(path.join(destination, "SKILL.md"), "utf8"), "new skill");
      assert.deepEqual(await fs.readdir(path.dirname(destination)), ["concise"]);
    }
    assert.equal((await fs.lstat(destinations[1])).isSymbolicLink(), !copy);
    assert.equal(await fs.readFile(path.join(outside, "custom.md"), "utf8"), "untouched");
  }
});

test("packed executable works through a symlink for listing and installing", async (context) => {
  const { temporary } = await fixture(context);
  const packed = spawnSync("npm", ["pack", "--json", "--pack-destination", temporary, "--cache", path.join(temporary, "cache")], {
    cwd: root, encoding: "utf8",
  });
  assert.equal(packed.status, 0, packed.stderr);
  const archive = path.join(temporary, JSON.parse(packed.stdout)[0].filename);
  const unpacked = spawnSync("tar", ["-xzf", archive, "-C", temporary], { encoding: "utf8" });
  assert.equal(unpacked.status, 0, unpacked.stderr);
  const binary = path.join(temporary, "skills");
  await fs.symlink(path.join(temporary, "package/scripts/install.mjs"), binary);
  const listed = spawnSync(binary, ["--list"], { cwd: temporary, encoding: "utf8" });
  assert.equal(listed.status, 0, listed.stderr);
  const catalog = await loadCatalog(root);
  const plain = listed.stdout.replace(/\x1b\[[0-9;]*m/g, "");
  assert.match(plain, new RegExp(`Found ${catalog.skills.length} skills`));
  const project = path.join(temporary, "fresh-project");
  const installed = spawnSync(binary, ["--skill", "code-build", "--agent", "codex", "--cwd", project, "--copy", "--yes"], {
    cwd: temporary, encoding: "utf8",
  });
  assert.equal(installed.status, 0, installed.stderr);
  assert.match(installed.stdout, /Installed 1 skills/);
  assert.match(await fs.readFile(path.join(project, ".agents/skills/code-build/stacks/astro.md"), "utf8"), /Astro/);
});
