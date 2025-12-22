# 落地路线图（Implementation Roadmap）

## 总原则
- 先改“布局与信息架构”，再逐步精炼组件与数据结构
- 尽量保持现有业务逻辑不变（SSE、历史、导出、分享）
- 以“小步快跑”的里程碑交付

## Phase 0：现状校准（0.5 天）
- 统一确认“报告”的数据结构来源：
  - 当前状态（内存 state）
  - localStorage history
  - 登录后 server history
- 明确分享 URL 语义：
  - 现在分享基本是当前页面 URL
  - 若要真正“可复现报告”，需要 `/reports/:id` + 后端存储

## Phase 1：三栏 AppShell + 主页信息流（2-4 天）
交付：
- 桌面三栏布局（LeftNav/Main/RightSidebar）
- `/` 主页改为：Tabs + Composer + Feed
- 右侧栏上线：CTA/登录点数/Trending/社群

验收点：
- 新用户能在 10 秒内找到并开始生成
- 生成完成后在 feed 中出现 ReportCard，可点击打开详情

## Phase 2：Report Viewer Drawer + 动作条统一（2-3 天）
交付：
- ReportViewer 支持 Drawer 打开
- ActionBar 固定：分享/导出/保存/打印/重新生成
- 权益 gating 统一（AuthGate）

验收点：
- 游客点击锁定能力时才弹登录（减少打断）

## Phase 3：内容页融入统一布局（2-3 天）
交付：
- `/knowledge` `/cases` 迁移到 AppShell 下
- 右侧栏在内容页也生效（推荐/CTA）

验收点：
- 全站导航体验一致

## Phase 4：报告可分享/可复访（后端协作，3-7 天）
交付：
- `/reports/:id`（或 share token）
- 分享链接打开后能复现报告
- SEO：Report 的 meta（title/description/open graph）

验收点：
- 从 x.com 分享链接进入时，落地页直接展示报告摘要与查看详情

## Phase 5：增长与数据（持续）
建议埋点：
- `generate_start`
- `generate_complete`
- `share_click`（按渠道：x/tg/qr/copy/image）
- `export_html`
- `print_pdf`
- `auth_open` / `auth_success`

## 技术注意事项
- SSE 进度与取消：建议提供取消按钮（abort controller）
- 分享组件一致性：当前 `SharePanel` props 在不同调用处存在不一致风险，落地时需统一
- 性能：主栏信息流需要虚拟列表可选（后续再做）

