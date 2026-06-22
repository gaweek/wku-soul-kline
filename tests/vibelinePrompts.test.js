import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { VIBELINE_AGENT_DEFINITIONS, VIBEMATCH_AGENT_DEFINITIONS } from '../server/vibelinePrompts.js';

test('WKU soul-kline agent definitions cover the full market workflow', () => {
  const types = VIBELINE_AGENT_DEFINITIONS.map((agent) => agent.type);

  assert.deepEqual(types, [
    'persona_asset',
    'resonance_factor',
    'lifecycle_kline',
    'audience_market',
    'narrative_packaging',
    'safety_authenticity',
  ]);
});

test('WKU soul-kline prompts avoid metaphysics-sensitive terms', () => {
  const forbidden = new RegExp([
    '\u516b\u5b57',
    '\u547d\u7406',
    '\u8fd0\u52bf',
    '\u5927\u8fd0',
    '\u6d41\u5e74',
    '\u98ce\u6c34',
    '\u5f00\u8fd0',
    '\u5409\u51f6',
    '\u7b97\u547d',
    '\u547d\u4e3b',
  ].join('|'));

  for (const agent of [...VIBELINE_AGENT_DEFINITIONS, ...VIBEMATCH_AGENT_DEFINITIONS]) {
    assert.equal(forbidden.test(agent.name), false, agent.name);
    assert.equal(forbidden.test(agent.systemPrompt), false, agent.type);
  }
});

test('Who Know Us agent definitions cover the full resonance workflow', () => {
  const types = VIBEMATCH_AGENT_DEFINITIONS.map((agent) => agent.type);

  assert.deepEqual(types, [
    'persona_asset',
    'resonance_factor',
    'lifecycle_kline',
    'audience_market',
    'narrative_packaging',
    'safety_authenticity',
  ]);
});

test('Who Know Us prompts ask agents to use you and Ta in visible copy', () => {
  const forbiddenVisibleLabels = /(?:A\/B 输入|A 的|B 的|基于 A\/B|分别引用 A 和 B)/;

  for (const agent of VIBEMATCH_AGENT_DEFINITIONS) {
    assert.equal(forbiddenVisibleLabels.test(agent.systemPrompt), false, agent.type);
    assert.equal(agent.systemPrompt.includes('你'), true, agent.type);
    assert.equal(agent.systemPrompt.includes('Ta'), true, agent.type);
  }
});

test('Who Know U prompts ask agents to use direct you and Ta visible copy', () => {
  const impersonalVisibleLabels = /(?:用户|对方)/;

  for (const agent of VIBELINE_AGENT_DEFINITIONS) {
    assert.equal(impersonalVisibleLabels.test(agent.systemPrompt), false, agent.type);
    assert.equal(agent.systemPrompt.includes('你'), true, agent.type);
    assert.equal(agent.systemPrompt.includes('Ta'), true, agent.type);
  }
});

test('Who Know Us prompts describe personB gendered pronoun rule', () => {
  for (const agent of VIBEMATCH_AGENT_DEFINITIONS) {
    assert.equal(agent.systemPrompt.includes('personB 性别为“男”时使用“他”'), true, agent.type);
    assert.equal(agent.systemPrompt.includes('personB 性别为“女”时使用“她”'), true, agent.type);
  }
});

test('Who Know Us analyzer does not complete from fallback builder', () => {
  const source = readFileSync(new URL('../server/vibelineMatchAnalyzer.js', import.meta.url), 'utf8');

  assert.equal(source.includes('buildFallbackVibeMatchResult'), false);
});
