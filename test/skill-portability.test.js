import assert from "node:assert/strict";
import { mkdtemp, readFile, readdir, rm, stat } from "node:fs/promises";
import { spawnSync } from "node:child_process";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";
import { loadCatalog } from "../scripts/install.mjs";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

async function filesUnder(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const filename = path.join(directory, entry.name);
    return entry.isDirectory() ? filesUnder(filename) : [filename];
  }));
  return files.flat();
}

test("every skill installs independently with intact, self-contained local resources", async (context) => {
  const project = await mkdtemp(path.join(os.tmpdir(), "skills-portability-"));
  context.after(() => rm(project, { recursive: true, force: true }));
  const catalog = await loadCatalog(root);
  const agent = catalog.agents.find((entry) => entry.id === "codex");
  assert.ok(agent, "Codex installation mapping is missing");
  const folders = (await readdir(path.join(root, "skills"), { withFileTypes: true }))
    .filter((entry) => entry.isDirectory());

  for (const { name } of folders) {
    const destination = path.join(project, name);
    const result = spawnSync(process.execPath, [
      path.join(root, "scripts/install.mjs"), "--skill", name,
      "--agent", "codex", "--copy", "--yes", "--cwd", destination,
    ], { cwd: root, encoding: "utf8" });
    assert.equal(result.status, 0, `${name}: ${result.stderr}`);

    const sourceRoot = path.join(root, "skills", name);
    const installedRoot = path.join(destination, agent.projectDir, name);
    const sourceFiles = await filesUnder(sourceRoot);
    const expectedPaths = sourceFiles.map((file) => path.relative(sourceRoot, file)).sort();
    const installedPaths = (await filesUnder(installedRoot))
      .map((file) => path.relative(installedRoot, file)).sort();
    assert.deepEqual(installedPaths, expectedPaths, `${name}: missing or extra installed resources`);

    for (const relative of expectedPaths) {
      const original = await readFile(path.join(sourceRoot, relative));
      const installed = await readFile(path.join(installedRoot, relative));
      assert.deepEqual(installed, original, `${name}/${relative}: changed during installation`);
      if (!relative.endsWith(".md")) continue;

      // A standalone install must not depend on another skill's checkout paths.
      for (const match of installed.toString().matchAll(/\[[^\]]*\]\(([^\s)]+)(?:\s+"[^"]*")?\)/g)) {
        const href = match[1];
        if (/^[a-z][a-z\d+.-]*:|^#/i.test(href)) continue;
        const target = path.resolve(path.dirname(path.join(installedRoot, relative)),
          decodeURIComponent(href.split("#")[0]));
        const fromRoot = path.relative(installedRoot, target);
        assert.ok(fromRoot !== ".." && !fromRoot.startsWith(`..${path.sep}`) && !path.isAbsolute(fromRoot),
          `${name}/${relative}: resource escapes skill folder: ${href}`);
        assert.ok((await stat(target)).isFile(), `${name}/${relative}: missing resource: ${href}`);
      }
    }
  }
});
