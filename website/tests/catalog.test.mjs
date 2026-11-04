import assert from 'node:assert/strict';
import test from 'node:test';
import { agents, skills } from '../src/lib/catalog.ts';
import { site } from '../src/lib/site.ts';

test('every skill has complete presentation metadata and its own invocation', () => {
  for (const skill of skills) {
    for (const key of ['summary', 'category', 'heading', 'description', 'prompt', 'mode', 'source']) {
      assert.ok(typeof skill[key] === 'string' && skill[key].trim(), `${skill.name}: missing ${key}`);
    }
    assert.ok(skill.prompt.includes(`$${skill.name} `), `${skill.name}: incorrect invocation`);
    assert.ok(skill.steps.length > 0 && skill.steps.every(step => step.trim()));
    assert.ok(skill.source.endsWith(`/skills/${skill.name}`));
  }
});

test('install commands are the short skills.sh commands and skill names are unique', () => {
  assert.equal(new Set(skills.map(skill => skill.name)).size, skills.length);
  assert.ok(agents.length > 0);
  assert.equal(site.installCommand, 'npx skills@latest add antick/skills --global');
  assert.equal(site.updateCommand, 'npx skills@latest update --global');
});
