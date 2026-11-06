import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const skillRoot = new URL("../skills/ai-tools-update/", import.meta.url);

test("AI tool coverage includes CLI, server and Desktop as separate default entries", async () => {
  const [skill, registry, serverGuide, website] = await Promise.all([
    readFile(new URL("SKILL.md", skillRoot), "utf8"),
    readFile(new URL("references/tools.md", skillRoot), "utf8"),
    readFile(new URL("references/openmausbot.md", skillRoot), "utf8"),
    readFile(new URL("../website/src/lib/catalog.ts", import.meta.url), "utf8"),
  ]);
  const rows = [...registry.matchAll(/^\| (.+?) \|/gm)]
    .map(([, name]) => name).filter(name => name !== "Report row" && name !== "---");
  assert.equal(rows.length, new Set(rows).size);
  for (const name of ["OpenMausBot CLI", "OpenMausBot Server", "OpenMausBot Desktop (MausBot)"]) {
    assert.ok(rows.includes(name), `missing default row: ${name}`);
  }
  for (const document of [skill, registry, website]) {
    assert.match(document, new RegExp(`\\b${rows.length} (?:default |entries|tools)`));
  }
  assert.match(skill, /references\/openmausbot\.md/);
  for (const route of ["ExecStart", "OMB_DATA_DIR", "npm", "Source checkout", "Container / Compose", "Embedded Desktop server"]) {
    assert.ok(serverGuide.includes(route), `missing server route or detection field: ${route}`);
  }
});
