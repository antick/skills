import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { chmod, mkdtemp, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const script = fileURLToPath(new URL("../skills/save-window-layout/scripts/save-layout.py", import.meta.url));

async function fixture(context, overrides = {}) {
  const home = await mkdtemp(path.join(os.tmpdir(), "skills-layout-"));
  context.after(() => rm(home, { recursive: true, force: true }));
  const config = path.join(home, ".config/hypr");
  const bin = path.join(home, ".local/bin");
  await mkdir(config, { recursive: true });
  await mkdir(bin, { recursive: true });
  await writeFile(path.join(config, "hyprland.lua"), 'require("hypr.workspace-layout")\n');
  await writeFile(path.join(config, "workspace-layout.lua"), "original rules\n");
  await writeFile(path.join(bin, "omarchy-workspace-startup"), "original startup\n");

  const client = {
    class: "google-chrome", mapped: true, floating: false, workspace: { id: 2, name: "2" },
    at: [0, 0], size: [900, 1000], monitor: 0, title: "PRIVATE WINDOW TITLE",
  };
  await writeFile(path.join(home, "fixture.json"), JSON.stringify({
    clients: [client, { ...client, class: "slack", at: [900, 0] }, { ...client, class: "unmanaged" }],
    monitors: [{ id: 0, name: "TEST-MONITOR", width: 1920, focused: true, activeWorkspace: { name: "2" } }],
    workspaces: [{ id: 2, name: "2" }],
    ...overrides,
  }));
  const hyprctl = path.join(bin, "hyprctl");
  await writeFile(hyprctl, `#!${process.execPath}
const fs = require("node:fs");
const command = process.argv[2];
const responses = JSON.parse(fs.readFileSync(process.env.HOME + "/fixture.json", "utf8"));
fs.appendFileSync(process.env.HOME + "/calls", command + "\\n");
if (command in responses) console.log(JSON.stringify(responses[command]));
else if (command !== "reload" && command !== "configerrors") process.exit(1);
`);
  await chmod(hyprctl, 0o755);
  return {
    home, config, bin,
    run: () => spawnSync("python3", [script], {
      cwd: os.tmpdir(), encoding: "utf8",
      env: { ...process.env, HOME: home, HYPRLAND_INSTANCE_SIGNATURE: "test-instance", PATH: `${bin}:${process.env.PATH}` },
    }),
  };
}

test("layout capture backs up files, produces valid restoration commands, and hides titles", async (context) => {
  const { home, config, bin, run } = await fixture(context);
  const result = run();
  assert.equal(result.status, 0, result.stderr);
  assert.match(result.stdout, /Saved 2 managed windows/);
  assert.match(result.stdout, /Skipped unmanaged classes: unmanaged/);
  assert.doesNotMatch(result.stdout + result.stderr, /PRIVATE WINDOW TITLE/);
  const rules = await readFile(path.join(config, "workspace-layout.lua"), "utf8");
  assert.match(rules, /workspace = "2 silent"/);
  const startup = path.join(bin, "omarchy-workspace-startup");
  const content = await readFile(startup, "utf8");
  assert.match(content, /launch_and_wait google-chrome google-chrome-stable/);
  assert.match(content, /launch_and_wait slack \/usr\/bin\/slack/);
  assert.match(content, /x = 900, y = 1000/);
  assert.match(content, /hyprctl dispatch workspace 2/);
  assert.doesNotMatch(rules + content, /PRIVATE WINDOW TITLE|unmanaged/);
  assert.equal(spawnSync("bash", ["-n", startup], { encoding: "utf8" }).status, 0);
  for (const [directory, prefix, original] of [
    [config, "workspace-layout.lua", "original rules\n"],
    [bin, "omarchy-workspace-startup", "original startup\n"],
  ]) {
    const backup = (await readdir(directory)).find((name) => name.startsWith(`${prefix}.bak.`));
    assert.ok(backup);
    assert.equal(await readFile(path.join(directory, backup), "utf8"), original);
  }
  assert.match(await readFile(path.join(home, "calls"), "utf8"), /reload\nconfigerrors\n$/);
});

for (const [label, clients, error] of [
  ["duplicate classes", [
    { class: "slack", mapped: true }, { class: "slack", mapped: true },
  ], /multiple managed windows share a class/],
  ["floating windows", [{ class: "slack", mapped: true, floating: true }], /floating-window capture is not supported/],
]) {
  test(`layout capture refuses ${label} before writing configuration`, async (context) => {
    const { home, config, bin, run } = await fixture(context, { clients });
    const result = run();
    assert.equal(result.status, 1);
    assert.match(result.stderr, error);
    assert.equal(await readFile(path.join(config, "workspace-layout.lua"), "utf8"), "original rules\n");
    assert.equal(await readFile(path.join(bin, "omarchy-workspace-startup"), "utf8"), "original startup\n");
    assert.doesNotMatch(await readFile(path.join(home, "calls"), "utf8"), /reload/);
  });
}
