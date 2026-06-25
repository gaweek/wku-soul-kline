import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const serviceSource = readFileSync(new URL('../services/vibelineService.ts', import.meta.url), 'utf8');

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

test('Who Know U analyzer does not abort agents when generation exceeds the display estimate', () => {
  const source = readFileSync(new URL('../server/vibelineAnalyzer.js', import.meta.url), 'utf8');

  assert.equal(source.includes('FAST_SINGLE_AGENT_TIMEOUT_MS'), false);
  assert.equal(source.includes('new AbortController()'), false);
  assert.equal(source.includes('setTimeout(() => controller.abort()'), false);
  assert.equal(source.includes('signal: controller.signal'), false);
});

test('Who Know Us analyzer gives lifecycle kline agent extra time and a retry', () => {
  const source = readFileSync(new URL('../server/vibelineMatchAnalyzer.js', import.meta.url), 'utf8');

  assert.match(source, /getMatchAgentTimeoutMs/);
  assert.match(source, /lifecycle_kline:\s*90000/);
  assert.match(source, /requestAgentWithRetry/);
  assert.match(source, /正在重试/);
});

test('Who Know Us analyzer includes failed agent error details in final message', () => {
  const source = readFileSync(new URL('../server/vibelineMatchAnalyzer.js', import.meta.url), 'utf8');

  assert.match(source, /formatFailedAgent/);
  assert.match(source, /item\.agentType.*item\.error/s);
  assert.equal(source.includes('failed.map((item) => item.agentType || item.error)'), false);
});

test('frontend maps timeout and busy Who Know Us failures to readable retry copy', () => {
  assert.match(serviceSource, /formatVibeLineErrorMessage/);
  assert.match(serviceSource, /生成响应超时，可能是当前访问较频繁或模型生成耗时较长，请稍后重试。/);
  assert.match(serviceSource, /当前访问人数较多，服务器处理较繁忙，请稍后重试。/);
  assert.match(serviceSource, /formatVibeLineErrorMessage\(data\.message \|\| data\.error \|\| 'Who Know Us 生成失败', 'match'\)/);
});
