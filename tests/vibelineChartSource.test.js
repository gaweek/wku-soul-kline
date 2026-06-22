import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const chartSource = readFileSync(new URL('../components/VibeLineChart.tsx', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../pages/VibeLinePage.tsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

test('VibeLineChart shows loading skeleton before any generated chart data', () => {
  const loadingReturn = chartSource.indexOf('if (loading) return <ChartLoading');
  const emptyReturn = chartSource.indexOf('if (chartData.length === 0) return <ChartEmpty');

  assert.ok(loadingReturn > -1, 'loading branch must not depend on empty data');
  assert.ok(emptyReturn > -1, 'empty branch should still exist');
  assert.ok(loadingReturn < emptyReturn, 'loading branch should run before empty/data branches');
  assert.equal(chartSource.includes('if (loading && data.length === 0)'), false);
});

test('loading chart carries the current generation status copy', () => {
  assert.match(chartSource, /loadingText\?: string/);
  assert.match(chartSource, /正在生成读盘/);
  assert.match(chartSource, /role="status"/);
  assert.match(pageSource, /loadingText=\{progress\}/);
});

test('loading chart uses a stronger animated signal with reduced motion fallback', () => {
  assert.match(chartSource, /wku-loading-status/);
  assert.match(chartSource, /#0d9488/);
  assert.match(cssSource, /@keyframes wkuLoadingPulse/);
  assert.match(cssSource, /wku-loading-status/);
  assert.match(cssSource, /prefers-reduced-motion: reduce[\s\S]*wku-loading-status/);
});
