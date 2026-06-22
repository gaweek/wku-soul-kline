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

test('Who Know Us analyzer does not complete from fallback builder', () => {
  const source = readFileSync(new URL('../server/vibelineMatchAnalyzer.js', import.meta.url), 'utf8');

  assert.equal(source.includes('buildFallbackVibeMatchResult'), false);
});
