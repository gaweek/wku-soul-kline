import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

test('Who Know U analyzer measures elapsed after reading completion body', () => {
  const source = readFileSync(new URL('../server/vibelineAnalyzer.js', import.meta.url), 'utf8');

  const jsonIndex = source.indexOf('const json = await response.json();');
  const successElapsedIndex = source.indexOf(
    "const elapsed = `${((Date.now() - startedAt) / 1000).toFixed(1)}s`;",
    jsonIndex
  );

  assert.notEqual(jsonIndex, -1);
  assert.notEqual(successElapsedIndex, -1);
  assert.equal(successElapsedIndex > jsonIndex, true);
});
