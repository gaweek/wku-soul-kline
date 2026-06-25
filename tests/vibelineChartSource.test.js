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
  assert.match(pageSource, /loadingText=\{singleProgress\}/);
  assert.match(pageSource, /loadingText=\{matchProgress\}/);
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
  assert.match(pageSource, /scrollToGenerationPreview/);
  assert.match(pageSource, /requestAnimationFrame\(performGenerationPreviewScroll\)/);
  assert.match(pageSource, /scrollTo:\s*\{\s*y:\s*target/);
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
  assert.match(pageSource, /const buildShareHref = \(payload: string\) => `\/share\/\$\{payload\}`/);
  assert.match(appSource, /path="\/share\/:sharePayload"/);
  assert.match(pageSource, /SharedResultPage/);
  assert.match(pageSource, /buildSingleShareText/);
  assert.match(pageSource, /buildMatchShareText/);
  assert.match(cssSource, /wku-result-share-card/);
  assert.match(cssSource, /wku-shared-result-page/);
  assert.match(cssSource, /wku-share-card-actions/);
});

test('share links open a standalone page and can be copied with a fallback', () => {
  assert.match(pageSource, /wku-standalone-share-page/);
  assert.match(pageSource, /activeShareLink/);
  assert.match(pageSource, /shareLink=\{activeShareLink\}/);
  assert.match(pageSource, /onCopyShare=\{\(\) => copyText\('shared-result-link', activeShareLink\)\}/);
  assert.match(pageSource, /writeClipboardText/);
  assert.match(pageSource, /navigator\.clipboard\?\.writeText/);
  assert.match(pageSource, /document\.execCommand\('copy'\)/);
  assert.equal(pageSource.includes('window.location.hash = nextHash'), false);
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
  assert.equal(pageSource.includes('wku-invite-seat-grid'), false);
  assert.equal(pageSource.includes('wku-invite-seat'), false);
  assert.equal(cssSource.includes('wku-invite-seat-grid'), false);
  assert.equal(cssSource.includes('wku-invite-seat'), false);
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

test('home and workbench are separate routed pages instead of one vertical scroller', () => {
  assert.match(appSource, /path="\/workbench"/);
  assert.match(pageSource, /HomePage/);
  assert.match(pageSource, /WorkbenchPage/);
  assert.match(pageSource, /isHomeView/);
  assert.match(pageSource, /navigate\('\/workbench'\)/);
  assert.match(pageSource, /首页/);
  assert.match(pageSource, /WKU 工作台/);
  assert.equal(pageSource.includes('onNavigateHome={() => openWorkbench'), false);
  assert.equal(pageSource.includes('返回工作台'), false);
  assert.equal(pageSource.includes('id="wku-experience"'), false);
  assert.equal(pageSource.includes("scrollTo: { y: '#wku-experience'"), false);
});

test('sidebar owns workbench mode switching and stays fixed while content scrolls', () => {
  assert.match(pageSource, /wku-side-workbench-group/);
  assert.match(pageSource, /wku-side-group-title/);
  assert.match(pageSource, /wku-side-workbench-link/);
  assert.match(pageSource, /wku-side-collapsed-mode-button/);
  assert.match(pageSource, /wku-side-mode-list/);
  assert.match(pageSource, /wku-side-mode-item/);
  assert.match(pageSource, /onSelectMode\('single'\)/);
  assert.match(pageSource, /onSelectMode\('match'\)/);
  assert.equal(pageSource.includes("className={`wku-side-nav-item wku-clickable ${activeView === 'workbench'"), false);
  assert.equal(pageSource.includes('<ModeChoiceCards mode={mode}'), false);
  assert.match(cssSource, /wku-side-nav\s*\{[\s\S]*position:\s*fixed/);
  assert.match(cssSource, /wku-app-shell\s*\{[\s\S]*grid-template-columns:\s*1fr/);
  assert.match(cssSource, /wku-app-content\s*\{[\s\S]*margin-left:\s*220px/);
  assert.match(cssSource, /wku-app-shell\.is-collapsed\s+\.wku-app-content/);
  assert.match(cssSource, /wku-side-mode-list/);
});

test('sidebar workbench parent is a non-clickable group and modes are the clear actions', () => {
  assert.match(pageSource, /<div className=\{`wku-side-workbench-group/);
  assert.match(pageSource, /<div className="wku-side-group-title"/);
  assert.match(pageSource, /<button[\s\S]*className=\{`wku-side-mode-item wku-clickable/);
  assert.match(cssSource, /wku-side-workbench-group/);
  assert.match(cssSource, /wku-side-group-title/);
  assert.match(cssSource, /wku-side-nav\s+\.wku-side-workbench-link\s*\{[\s\S]*display:\s*none/);
  assert.match(cssSource, /wku-side-nav\.is-collapsed\s+\.wku-side-workbench-link\s*\{[\s\S]*display:\s*none/);
});

test('collapsed sidebar exposes three clear icon buttons for home single and match modes', () => {
  assert.match(pageSource, /UserRound/);
  assert.match(pageSource, /UsersRound/);
  assert.match(pageSource, /aria-label="切换到 Who Know U 单人模式"/);
  assert.match(pageSource, /aria-label="切换到 Who Know Us 双人模式"/);
  assert.match(pageSource, /wku-side-collapsed-mode-glyph/);
  assert.match(pageSource, /wku-side-collapsed-mode-button is-single/);
  assert.match(pageSource, /wku-side-collapsed-mode-button is-match/);
  assert.match(cssSource, /wku-side-nav\.is-collapsed\s+\.wku-side-collapsed-mode-button\s*\{[\s\S]*display:\s*inline-flex/);
  assert.match(cssSource, /wku-side-collapsed-mode-glyph\.is-single/);
  assert.match(cssSource, /wku-side-collapsed-mode-glyph\.is-match/);
});

test('home view does not highlight workbench mode buttons', () => {
  assert.match(pageSource, /const workbenchNavActive = activeView === 'workbench' \|\| activeView === 'invite'/);
  assert.match(pageSource, /workbenchNavActive \? 'is-active' : ''/);
  assert.match(pageSource, /workbenchNavActive && mode === 'single'/);
  assert.match(pageSource, /workbenchNavActive && mode === 'match'/);
  assert.equal(pageSource.includes("wku-side-mode-item wku-clickable ${mode === 'single' ? 'is-active' : ''}"), false);
});

test('shared recent result highlights the selected record instead of the workbench modes', () => {
  assert.match(pageSource, /activeRecentHref/);
  assert.match(pageSource, /normalizeRecentShareHref\(record\.href\) === activeRecentHref/);
  assert.match(pageSource, /activeRecentHref=\{activeRecentHref\}/);
  assert.match(pageSource, /wku-recent-run \$\{isRecentActive \? 'is-active' : ''\}/);
  assert.match(cssSource, /wku-recent-run\.is-active/);
  assert.match(cssSource, /wku-recent-run\.is-active b/);
  assert.equal(pageSource.includes("const workbenchNavActive = activeView === 'workbench' || activeView === 'invite' || activeView === 'share'"), false);
});

test('home keeps the original hero without an embedded mode switch', () => {
  assert.equal(pageSource.includes('<HeroModeSwitch mode={mode}'), false);
  assert.equal(pageSource.includes('onSelectMode={handleHeroModeSelect}'), false);
  assert.equal(pageSource.includes('onStart(mode)'), false);
  assert.match(pageSource, /onStart\('single'\)/);
  assert.match(pageSource, /立即体验/);
});

test('workbench mode switching is only exposed in the fixed sidebar', () => {
  assert.equal(pageSource.includes('wku-mode-choice-card'), false);
  assert.equal(pageSource.includes('wku-mode-choice-grid'), false);
  assert.equal(pageSource.includes('wku-choice-action'), false);
  assert.equal(pageSource.includes('<ModeChoiceCards mode={mode}'), false);
  assert.match(pageSource, /wku-side-mode-list/);
  assert.match(cssSource, /wku-side-mode-list/);
});

test('workbench title owns the input deck heading and the form starts immediately', () => {
  assert.match(pageSource, /const activeInputTitle = mode === 'single'/);
  assert.match(pageSource, /WKU 输入台/);
  assert.match(pageSource, /\{activeInputTitle\}/);
  assert.match(pageSource, /\{activeLoading \? activeProgress : activeActionHint\}/);
  assert.match(pageSource, /<div className="wku-workbench-header">[\s\S]*wku-input-actions[\s\S]*<\/div>[\s\S]*<div className="wku-workbench-body">/);
  assert.equal(pageSource.includes('className="wku-input-deck-head"'), false);
  assert.equal(pageSource.includes('wku-start-button-head'), false);
  assert.match(cssSource, /wku-input-deck\s*\{[\s\S]*padding:\s*0/);
});

test('sidebar active states use the dark rendered mode card treatment', () => {
  assert.match(cssSource, /wku-side-nav-item:hover/);
  assert.match(cssSource, /wku-side-mode-item:hover/);
  assert.match(cssSource, /wku-side-mode-item\.is-active[\s\S]*linear-gradient\(180deg,\s*#0f172a/);
  assert.match(cssSource, /wku-side-mode-item\.is-active[\s\S]*color:\s*#ecfeff/);
  assert.match(cssSource, /wku-side-mode-item\.is-active::after/);
  assert.match(cssSource, /transform:\s*translateX\(2px\)/);
  assert.match(cssSource, /transition:\s*transform 180ms/);
});

test('recent share records open through the standalone route and expose copy action', () => {
  assert.match(pageSource, /record\.href\.startsWith\('\/share\/'\) \|\| record\.href\.startsWith\('\/#\/share\/'\)/);
  assert.match(pageSource, /const nextPath = normalizeRecentShareHref\(record\.href\)/);
  assert.match(pageSource, /navigate\(nextPath\)/);
  assert.match(pageSource, /wku-recent-copy-button/);
  assert.match(pageSource, /onCopyRecent\(record\)/);
  assert.match(pageSource, /getAbsoluteShareLink\(record\.href\)/);
  assert.match(pageSource, /`recent-share-\$\{record\.id\}`/);
  assert.equal(pageSource.includes('window.location.href = `${window.location.origin}${record.href}`'), false);
  assert.match(pageSource, /RECENT_RUNS_STORAGE_KEY/);
  assert.match(pageSource, /window\.localStorage/);
});

test('interactive controls use a shared clickable affordance system', () => {
  assert.match(cssSource, /wku-clickable/);
  assert.match(cssSource, /\.wku-page button:not\(:disabled\)/);
  assert.match(pageSource, /className="wku-hero-cta wku-clickable"/);
  assert.match(pageSource, /className=\{`wku-side-mode-item wku-clickable/);
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

test('home layout keeps the original hero and makes the workbench CTA obvious', () => {
  assert.match(pageSource, /wku-hero wku-glass-hero wku-hero-strip/);
  assert.match(pageSource, /wku-home-shell/);
  assert.match(pageSource, /max-w-\[1640px\]/);
  assert.match(pageSource, /max-w-\[1080px\]/);
  assert.match(pageSource, /立即体验/);
  assert.match(pageSource, /onStart\('single'\)/);
  assert.match(pageSource, /lg:text-\[64px\]/);
  assert.match(pageSource, /sm:text-\[34px\]/);
  assert.equal(cssSource.includes('white-space: nowrap;\\n    text-wrap: normal;'), false);
  assert.match(cssSource, /wku-home-shell\s*\{[\s\S]*min-height:\s*100svh/);
  assert.match(cssSource, /wku-hero-strip\s*\{[\s\S]*min-height:\s*calc\(100svh - 32px\)/);
  assert.match(cssSource, /wku-hero-strip\s*>\s*\.relative\s*\{[\s\S]*grid-template-rows:\s*auto auto minmax\(460px,\s*1fr\)/);
  assert.match(cssSource, /wku-hero-subtitle\s*\{[\s\S]*text-wrap:\s*balance/);
  assert.match(cssSource, /wku-hero-cta\s*\{[\s\S]*justify-self:\s*center/);
  assert.match(cssSource, /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(240px,\s*340px\)/);
  assert.match(cssSource, /min-height:\s*64px/);
  assert.match(cssSource, /wku-hero-map\s*\{[\s\S]*min-height:\s*clamp\(460px,\s*48svh,\s*620px\)/);
});

test('loading preview carries the six agent progress beside the chart', () => {
  assert.match(chartSource, /agentStatuses\?: VibeLineAgentStatusMap/);
  assert.match(chartSource, /LoadingAgentProgress/);
  assert.match(chartSource, /六个 Agent 实时进度/);
  assert.match(chartSource, /wku-loading-agent-panel/);
  assert.match(chartSource, /item\.status === 'running' && \(/);
  assert.match(chartSource, /wku-loading-agent-spinner/);
  assert.match(pageSource, /agentStatuses=\{singleAgentStatuses\}/);
  assert.match(pageSource, /agentStatuses=\{matchAgentStatuses\}/);
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

test('single and match agent progress stay isolated across mode switches and completion', () => {
  assert.match(pageSource, /ALL_AGENT_COMPLETE_STATUSES/);
  assert.match(pageSource, /singleAgentStatuses/);
  assert.match(pageSource, /matchAgentStatuses/);
  assert.match(pageSource, /singleProgress/);
  assert.match(pageSource, /matchProgress/);
  assert.match(pageSource, /activeAgentStatuses/);
  assert.match(pageSource, /activeProgress/);
  assert.match(pageSource, /activeCompletedCount/);
  assert.equal(pageSource.includes('const [agentStatuses, setAgentStatuses]'), false);
  assert.equal(pageSource.includes('const [progress, setProgress]'), false);
  assert.equal(pageSource.includes('setAgentStatuses(createInitialVibeLineAgentStatuses())'), false);
  assert.match(pageSource, /setSingleAgentStatuses\(createAgentStatusSnapshot\(ALL_AGENT_COMPLETE_STATUSES\)\)/);
  assert.match(pageSource, /setMatchAgentStatuses\(createAgentStatusSnapshot\(ALL_AGENT_COMPLETE_STATUSES\)\)/);
  assert.match(pageSource, /AgentConsole[\s\S]*statusMap=\{activeAgentStatuses\}/);
  assert.match(pageSource, /VibeLineChart[\s\S]*agentStatuses=\{singleAgentStatuses\}/);
  assert.match(pageSource, /VibeLineChart[\s\S]*agentStatuses=\{matchAgentStatuses\}/);
});

test('generating preview does not add a large blank spacer below the chart', () => {
  assert.match(pageSource, /wku-result-block space-y-5 scroll-mt-5 \$\{activeLoading \? 'is-generating' : ''\}/);
  assert.match(cssSource, /wku-result-block\.is-generating/);
  assert.equal(cssSource.includes('padding-bottom: clamp(280px, 38vh, 430px)'), false);
  assert.match(cssSource, /wku-result-block\.is-generating\s*\{[\s\S]*padding-bottom:\s*clamp\(16px,\s*4vh,\s*36px\)/);
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
