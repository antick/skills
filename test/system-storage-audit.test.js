import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import test from "node:test";

test("system and folder audits preserve scope, history, and filesystem boundaries", () => {
  const result = spawnSync("python3", [
    "-B", "-m", "unittest", "discover", "-s", "test", "-p", "storage_*_test.py",
  ], { encoding: "utf8", timeout: 120_000 });
  assert.equal(result.status, 0, `${result.stdout}\n${result.stderr}`);
});
