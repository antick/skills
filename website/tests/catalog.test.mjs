import assert from 'node:assert/strict';
import test from 'node:test';
import { agents, skills, installCommand } from '../src/lib/catalog.ts';

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

test('install commands cover every catalogue entry and reject invalid inputs', () => {
  assert.equal(new Set(skills.map(skill => skill.name)).size, skills.length);
  assert.ok(agents.length > 0);
  for (const skill of ['all', ...skills.map(skill => skill.name)]) {
    for (const agent of agents) {
      assert.equal(installCommand(skill, agent.id, 'global'), `node scripts/install.mjs --skill ${skill === 'all' ? "'*'" : skill} --agent ${agent.id} --global --copy --yes`);
    }
  }
  assert.match(installCommand('code-build', 'codex', 'project'), /--cwd \/path\/to\/project --copy --yes$/);
  assert.throws(() => installCommand('unknown', 'codex', 'global'), /Unknown skill/);
  assert.throws(() => installCommand('all', 'unknown', 'global'), /Unknown agent/);
  assert.throws(() => installCommand('all', 'codex', 'unknown'), /Unknown installation scope/);
});
