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

test('generation actions scroll to the preview chart with GSAP feedback', () => {
  assert.match(pageSource, /ScrollToPlugin/);
  assert.match(pageSource, /scrollToGenerationPreview/);
  assert.match(pageSource, /scrollTo:\s*\{\s*y:\s*target/);
  assert.match(pageSource, /scrollToGenerationPreview\('single'\)/);
  assert.match(pageSource, /scrollToGenerationPreview\('match'\)/);
  assert.match(pageSource, /wku-generation-scroll-note/);
  assert.match(cssSource, /wku-generation-scroll-note/);
});

test('mode discovery is promoted as two equal analysis choices', () => {
  assert.match(pageSource, /ModeChoiceCards/);
  assert.match(pageSource, /我想分析自己/);
  assert.match(pageSource, /我想分析我和 TA/);
  assert.match(pageSource, /选择分析对象/);
  assert.match(pageSource, /支持单人读盘 \/ 双人共振/);
  assert.match(cssSource, /wku-mode-choice-panel/);
});

test('loading preview carries the six agent progress beside the chart', () => {
  assert.match(chartSource, /agentStatuses\?: VibeLineAgentStatusMap/);
  assert.match(chartSource, /LoadingAgentProgress/);
  assert.match(chartSource, /六个 Agent 实时进度/);
  assert.match(chartSource, /wku-loading-agent-panel/);
  assert.match(pageSource, /agentStatuses=\{agentStatuses\}/);
  assert.match(cssSource, /wku-loading-agent-panel/);
});

test('active generation uses preview as the only full agent progress surface', () => {
  assert.match(pageSource, /AgentHandoffCard/);
  assert.match(pageSource, /进度已同步到预览盘/);
  assert.match(pageSource, /activeLoading\s*\?\s*\(\s*<AgentHandoffCard[\s\S]*\)\s*:\s*\(\s*<AgentConsole/);
  assert.match(cssSource, /wku-agent-handoff/);
});

test('generated results render directly without an expand gate', () => {
  assert.equal(pageSource.includes('resultVisible'), false);
  assert.equal(pageSource.includes('handleViewResult'), false);
  assert.equal(pageSource.includes('wku-result-gate'), false);
  assert.equal(pageSource.includes('展开完整读盘'), false);
  assert.equal(pageSource.includes('查看读盘'), false);
  assert.match(pageSource, /result \? \(/);
  assert.match(pageSource, /matchResult \? \(/);
});
