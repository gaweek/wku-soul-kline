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
  assert.match(pageSource, /HeroModeSwitch/);
  assert.match(pageSource, /handleHeroModeSelect/);
  assert.match(pageSource, /wku-mode-segment/);
  assert.match(pageSource, /wku-mode-compact-row/);
  assert.match(pageSource, /wku-mode-current-copy/);
  assert.match(pageSource, /当前：\{activeMode\.title\}/);
  assert.match(pageSource, /模式切换/);
  assert.match(pageSource, /我想分析自己/);
  assert.match(pageSource, /我想分析我和 TA/);
  assert.match(pageSource, /支持单人读盘 \/ 双人共振/);
  assert.match(pageSource, /双人模式/);
  assert.match(cssSource, /wku-hero-mode-switch/);
  assert.match(cssSource, /wku-mode-choice-panel/);
  assert.match(cssSource, /wku-mode-choice-panel\.is-compact/);
});

test('workbench mode switch stays compact above the main workspace', () => {
  assert.equal(pageSource.includes('wku-mode-choice-card'), false);
  assert.equal(pageSource.includes('wku-mode-choice-grid'), false);
  assert.equal(pageSource.includes('wku-choice-action'), false);
  assert.match(pageSource, /wku-mode-compact-row/);
  assert.match(cssSource, /grid-template-columns:\s*minmax\(320px,\s*520px\)\s*minmax\(0,\s*1fr\)/);
  assert.match(cssSource, /min-height:\s*38px/);
});

test('interactive controls use a shared clickable affordance system', () => {
  assert.match(cssSource, /wku-clickable/);
  assert.match(cssSource, /\.wku-page button:not\(:disabled\)/);
  assert.match(pageSource, /className="wku-hero-cta wku-clickable"/);
  assert.match(pageSource, /className=\{`wku-mode-segment-button wku-clickable/);
  assert.match(pageSource, /className="wku-sample-chip wku-clickable"/);
  assert.match(pageSource, /type="button"[\s\S]*className="wku-start-button wku-clickable/);
});

test('scores are explained where users see them', () => {
  assert.match(pageSource, /ScoreGuide/);
  assert.match(pageSource, /scoreBands/);
  assert.match(pageSource, /ScoreBadge/);
  assert.match(pageSource, /分数怎么读/);
  assert.match(pageSource, /先看颜色，再看动作/);
  assert.match(pageSource, /读分口诀/);
  assert.match(pageSource, /三个指标/);
  assert.match(pageSource, /当前模式/);
  assert.match(pageSource, /70-100/);
  assert.match(pageSource, /可以继续/);
  assert.match(pageSource, /50-69/);
  assert.match(pageSource, /先找话题/);
  assert.match(pageSource, /0-49/);
  assert.match(pageSource, /先降压/);
  assert.match(pageSource, /连接\/共振分/);
  assert.match(pageSource, /当前能不能继续靠近/);
  assert.match(pageSource, /助推分/);
  assert.match(pageSource, /风险分/);
  assert.match(pageSource, /同频分/);
  assert.match(pageSource, /阶段分/);
  assert.match(pageSource, /越高越适合保留/);
  assert.match(pageSource, /越高越需要修正/);
  assert.match(pageSource, /越高越容易接住你/);
  assert.match(pageSource, /共振分 \{matchResult\.matchScore\}\/100/);
  assert.match(pageSource, /同频/);
  assert.match(chartSource, /分数怎么读/);
  assert.match(chartSource, /70-100<\/b> 可以继续/);
  assert.match(chartSource, /0-49<\/b> 先降压/);
  assert.match(cssSource, /wku-score-guide/);
  assert.match(cssSource, /wku-score-meter/);
  assert.match(cssSource, /wku-score-badge/);
  assert.match(cssSource, /wku-score-section-title/);
});

test('hero layout keeps the first screen compact and makes the primary CTA obvious', () => {
  assert.match(pageSource, /max-w-\[980px\]/);
  assert.match(pageSource, /lg:text-\[56px\]/);
  assert.match(pageSource, /sm:text-\[30px\]/);
  assert.match(cssSource, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(220px,\s*320px\)/);
  assert.match(cssSource, /min-height:\s*64px/);
  assert.match(cssSource, /min-height:\s*clamp\(260px,\s*32vh,\s*340px\)/);
});

test('loading preview carries the six agent progress beside the chart', () => {
  assert.match(chartSource, /agentStatuses\?: VibeLineAgentStatusMap/);
  assert.match(chartSource, /LoadingAgentProgress/);
  assert.match(chartSource, /六个 Agent 实时进度/);
  assert.match(chartSource, /wku-loading-agent-panel/);
  assert.match(chartSource, /item\.status === 'running' && \(/);
  assert.match(chartSource, /wku-loading-agent-spinner/);
  assert.match(pageSource, /agentStatuses=\{agentStatuses\}/);
  assert.match(cssSource, /wku-loading-agent-panel/);
  assert.match(cssSource, /@keyframes wkuAgentSpin/);
  assert.match(cssSource, /wku-loading-agent-spinner/);
  assert.match(cssSource, /prefers-reduced-motion: reduce[\s\S]*wku-loading-agent-spinner/);
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

test('chart pointer hit testing prioritizes the nearest stage band instead of raw diagonal distance', () => {
  assert.match(chartSource, /getPointerPoint/);
  assert.match(chartSource, /getNearestIndexFromPointer/);
  assert.match(chartSource, /stageBandWidth/);
  assert.match(chartSource, /candidateIndices/);
  assert.match(chartSource, /Math\.abs\(point\.x - pointer\.x\)/);
  assert.match(chartSource, /Math\.abs\(point\.y - pointer\.y\) \* 0\.24/);
});

test('chart stage hover highlights all three nodes in the same lifecycle period', () => {
  assert.match(chartSource, /hoveredStageName/);
  assert.match(chartSource, /activeStageName/);
  assert.match(chartSource, /focusStageGroup/);
  assert.match(chartSource, /wku-stage-hover-zone/);
  assert.match(chartSource, /查看\$\{group\.name\}阶段的三个节点/);
  assert.match(chartSource, /isStageActive/);
  assert.match(cssSource, /wku-stage-hover-zone/);
});

test('chart tooltip can dock above or below the selected node to avoid covering the k-line', () => {
  assert.match(chartSource, /TooltipPlacement = 'left' \| 'right' \| 'top' \| 'bottom'/);
  assert.match(chartSource, /chooseTooltipPlacement/);
  assert.match(chartSource, /avoidRect/);
  assert.match(cssSource, /wku-point-tooltip\[data-side="top"\]/);
  assert.match(cssSource, /wku-point-tooltip\[data-side="bottom"\]/);
});

test('chart locking only happens from explicit nodes and background clicks only unlock', () => {
  assert.equal(chartSource.includes('toggleNearestTooltipLock'), false);
  assert.match(chartSource, /lockTooltipAtIndex/);
  assert.match(chartSource, /unlockTooltip/);
  assert.match(chartSource, /onClick=\{\(\) => \{\s*if \(tooltipLocked\) unlockTooltip\(\);/);
  assert.match(chartSource, /lockTooltipAtIndex\(index\)/);
  assert.match(chartSource, /解除锁定/);
  assert.match(cssSource, /wku-tooltip-close/);
});
