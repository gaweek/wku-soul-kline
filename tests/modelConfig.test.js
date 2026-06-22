import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getProviderDefaultModel,
  getProviderFallbackModels,
  getProviderModelPool,
  isDeepSeekEndpoint,
} from '../server/modelConfig.js';

test('detects DeepSeek-compatible endpoints', () => {
  assert.equal(isDeepSeekEndpoint('https://api.deepseek.com'), true);
  assert.equal(isDeepSeekEndpoint('https://example.com/openai/v1'), false);
});

test('uses only DeepSeek models for DeepSeek endpoints', () => {
  const endpoint = 'https://api.deepseek.com';
  assert.equal(getProviderDefaultModel(endpoint, 'grok-4', 'gemini-3-pro-preview'), 'deepseek-v4-flash');
  assert.deepEqual(
    getProviderFallbackModels(endpoint, 'deepseek-v4-flash', ['grok-4', 'gemini-3-pro-preview']),
    ['deepseek-v4-pro']
  );
  assert.deepEqual(
    getProviderModelPool(endpoint, 'grok-4', ['gemini-3-pro-preview']),
    ['deepseek-v4-flash', 'deepseek-v4-pro']
  );
});

test('keeps legacy model pool for non-DeepSeek endpoints', () => {
  const endpoint = 'https://api.openai.com/v1';
  assert.equal(getProviderDefaultModel(endpoint, 'grok-4', 'gemini-3-pro-preview'), 'grok-4');
  assert.deepEqual(
    getProviderModelPool(endpoint, 'grok-4', ['gemini-3-pro-preview', 'grok-4-auto']),
    ['grok-4', 'gemini-3-pro-preview', 'grok-4-auto']
  );
});
