import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';

const chartSource = readFileSync(new URL('../components/VibeLineChart.tsx', import.meta.url), 'utf8');
const pageSource = readFileSync(new URL('../pages/VibeLinePage.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const cssSource = readFileSync(new URL('../index.css', import.meta.url), 'utf8');

test('VibeLineChart shows loading skeleton before any generated chart data', () => {
  const loadingReturn = chartSource.indexOf('if (loading) {');
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

test('generation state makes the AI model and estimated wait visible', () => {
  assert.match(pageSource, /AI_MODEL_LABEL/);
  assert.match(pageSource, /DeepSeek/);
  assert.match(pageSource, /activeGenerationEstimate/);
  assert.match(pageSource, /getConcreteEstimateSeconds/);
  assert.match(pageSource, /single:\s*\[18,\s*24/);
  assert.match(pageSource, /match:\s*\[24,\s*32/);
  assert.equal(pageSource.includes('30-45s'), false);
  assert.equal(pageSource.includes('45-70s'), false);
  assert.match(chartSource, /modelLabel\?: string/);
  assert.match(chartSource, /estimateText\?: string/);
  assert.match(chartSource, /当前模型：\{modelLabel\}/);
  assert.match(chartSource, /预计 \{estimateText\}/);
  assert.match(chartSource, /wku-chart-run-meta/);
  assert.equal(pageSource.includes('wku-generation-meta'), false);
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
  assert.match(pageSource, /GENERATION_SCROLL_DURATION/);
  assert.match(pageSource, /EXPERIENCE_SCROLL_DURATION/);
  assert.match(pageSource, /scrollToGenerationPreview/);
  assert.match(pageSource, /requestAnimationFrame\(performGenerationPreviewScroll\)/);
  assert.match(pageSource, /scrollTo:\s*\{\s*y:\s*target/);
  assert.match(pageSource, /handleExperienceJump/);
  assert.match(pageSource, /scrollTo:\s*\{\s*y:\s*'#wku-experience'/);
  assert.match(pageSource, /scrollToGenerationPreview\('single'\)/);
  assert.match(pageSource, /scrollToGenerationPreview\('match'\)/);
  assert.match(pageSource, /wku-generation-scroll-note/);
  assert.match(cssSource, /wku-generation-scroll-note/);
});

test('workbench left rail stays focused on object, samples, and AI run status', () => {
  assert.match(pageSource, /wku-lens-summary/);
  assert.match(pageSource, /wku-form-run-card/);
  assert.match(pageSource, /showRunCard/);
  assert.equal(/<aside className="wku-lens-desk">[\s\S]*<ScoreGuide \/>[\s\S]*<\/aside>/.test(pageSource), false);
  assert.match(cssSource, /wku-lens-summary/);
  assert.match(cssSource, /wku-form-run-card/);
  assert.match(cssSource, /grid-template-columns:\s*minmax\(260px,\s*320px\)\s*minmax\(0,\s*1fr\)/);
});

test('generated results include a complete share card surface', () => {
  assert.match(pageSource, /ShareResultCard/);
  assert.match(pageSource, /结果分享卡/);
  assert.match(pageSource, /复制个人结果链接/);
  assert.match(pageSource, /生成我的 soul-kline/);
  assert.match(pageSource, /encodeSharePayload/);
  assert.match(pageSource, /decodeSharePayload/);
  assert.match(pageSource, /wkuShare/);
  assert.match(appSource, /path="\/share\/:sharePayload"/);
  assert.match(pageSource, /SharedResultPage/);
  assert.match(pageSource, /buildSingleShareText/);
  assert.match(pageSource, /buildMatchShareText/);
  assert.match(cssSource, /wku-result-share-card/);
  assert.match(cssSource, /wku-shared-result-page/);
  assert.match(cssSource, /wku-share-card-actions/);
});

test('match mode supports a two-person invite link flow', () => {
  assert.match(pageSource, /InviteLinkPanel/);
  assert.match(pageSource, /encodeInvitePayload/);
  assert.match(pageSource, /decodeInvitePayload/);
  assert.match(pageSource, /wkuInvite/);
  assert.match(appSource, /path="\/invite\/:invitePayload"/);
  assert.match(pageSource, /邀请 TA 补全样本/);
  assert.match(pageSource, /复制邀请链接/);
  assert.match(pageSource, /Ta 的信息已经填好，等待你填写/);
  assert.match(pageSource, /setPersonA\(invitePayload\.personA\)/);
  assert.match(pageSource, /setPersonB\(normalizeInviteProfile\(\)\)/);
  assert.match(cssSource, /wku-invite-panel/);
  assert.match(cssSource, /wku-invite-seat-grid/);
  assert.equal(pageSource.includes('wku-invite-url'), false);
  assert.equal(cssSource.includes('wku-invite-url'), false);
});

test('app shell separates workbench share and invite pages with a collapsible sidebar history', () => {
  assert.match(pageSource, /activeView/);
  assert.match(pageSource, /WorkbenchShell/);
  assert.match(pageSource, /wku-app-shell/);
  assert.match(pageSource, /wku-side-nav/);
  assert.match(pageSource, /sidebarCollapsed/);
  assert.match(pageSource, /最近生成/);
  assert.match(pageSource, /RecentRunRecord/);
  assert.match(pageSource, /saveRecentRun/);
  assert.match(pageSource, /wku-recent-runs/);
  assert.match(cssSource, /wku-app-shell/);
  assert.match(cssSource, /wku-side-nav\.is-collapsed/);
  assert.match(cssSource, /wku-workbench-actions/);
});

test('mode discovery is promoted as two equal analysis choices', () => {
  assert.match(pageSource, /ModeChoiceCards/);
  assert.match(pageSource, /HeroModeSwitch/);
  assert.match(pageSource, /handleHeroModeSelect/);
  assert.match(pageSource, /wku-mode-switch-grid/);
  assert.match(pageSource, /wku-mode-switch-card/);
  assert.match(pageSource, /wku-mode-switch-action/);
  assert.match(pageSource, /当前：\{activeMode\.title\}/);
  assert.match(pageSource, /这次要分析哪条连接 K 线/);
  assert.match(pageSource, /模式切换/);
  assert.match(pageSource, /我想分析自己/);
  assert.match(pageSource, /我想分析我和 TA/);
  assert.match(pageSource, /支持单人读盘 \/ 双人共振/);
  assert.match(pageSource, /双人模式/);
  assert.match(cssSource, /wku-hero-mode-switch/);
  assert.match(cssSource, /wku-mode-choice-panel/);
  assert.match(cssSource, /wku-mode-choice-panel\.is-prominent/);
});

test('workbench mode switch stays visible without becoming a bulky card area', () => {
  assert.equal(pageSource.includes('wku-mode-choice-card'), false);
  assert.equal(pageSource.includes('wku-mode-choice-grid'), false);
  assert.equal(pageSource.includes('wku-choice-action'), false);
  assert.match(pageSource, /wku-mode-switch-grid/);
  assert.match(cssSource, /grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/);
  assert.match(cssSource, /min-height:\s*82px/);
});

test('inactive mode cards have a refined animated border affordance', () => {
  assert.match(pageSource, /modeSwitchRef/);
  assert.match(pageSource, /gsap\.matchMedia/);
  assert.match(pageSource, /prefers-reduced-motion: reduce/);
  assert.match(pageSource, /wku-mode-switch-orbit/);
  assert.match(pageSource, /wku-mode-switch-card:not\(\.is-active\) \.wku-mode-switch-orbit/);
  assert.match(cssSource, /wku-mode-switch-orbit/);
  assert.match(cssSource, /conic-gradient/);
  assert.match(cssSource, /mask-composite:\s*exclude/);
  assert.match(cssSource, /wku-mode-switch-card:not\(\.is-active\)/);
  assert.match(cssSource, /will-change:\s*transform,\s*opacity/);
});

test('interactive controls use a shared clickable affordance system', () => {
  assert.match(cssSource, /wku-clickable/);
  assert.match(cssSource, /\.wku-page button:not\(:disabled\)/);
  assert.match(pageSource, /className="wku-hero-cta wku-clickable"/);
  assert.match(pageSource, /className=\{`wku-mode-switch-card wku-clickable/);
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

test('chart interactions use GSAP feedback for hover and locked nodes', () => {
  assert.match(chartSource, /animatePointFeedback/);
  assert.match(chartSource, /contextSafe/);
  assert.match(chartSource, /wku-chart-cursor/);
  assert.match(chartSource, /wku-active-stage-band/);
  assert.match(chartSource, /gsap\.to\(\[node/);
  assert.match(cssSource, /wku-chart-cursor/);
  assert.match(cssSource, /wku-active-stage-band/);
  assert.match(cssSource, /vector-effect:\s*non-scaling-stroke/);
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
