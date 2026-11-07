import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("home-folder audit snapshots and comparisons preserve filesystem boundaries", () => {
  const result = spawnSync("python3", [
    "-B", "-m", "unittest", "discover", "-s", "test", "-p", "home_folder_*.py",
  ], { encoding: "utf8", timeout: 120_000 });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
