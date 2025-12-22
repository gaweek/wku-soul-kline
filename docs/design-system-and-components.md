# 设计系统与组件拆分规范（Design System & Components）

## 1. 目标
- 统一 Home / Knowledge / Cases 的 UI 语言（目前各页 Hero 风格接近，但信息流与动作体系不统一）
- 提升可维护性：把“生成、分享、权限 gating、卡片列表、右侧栏小组件”组件化
- 提升产品感：参考 x.com 的“卡片 + 信息密度 + 强交互”

## 2. Layout Tokens（建议约束）
### 2.1 栅格与宽度
- **Left Nav**：`w-[280px]`（桌面）
- **Main Column**：`max-w-[680px]`（建议 600-680）
- **Right Sidebar**：`w-[360px]`
- **Container**：`max-w-7xl mx-auto px-4`

### 2.2 卡片与边框
- Card：`bg-white border border-gray-200 rounded-2xl shadow-sm`
- Hover：`hover:shadow-md hover:border-gray-300`

### 2.3 字体与层级
- 正文：Inter
- 中文标题：Noto Serif SC（项目已有 `font-serif-sc`）

建议层级：
- H1：`text-2xl/3xl font-bold`
- H2：`text-xl font-bold`
- Body：`text-sm text-gray-700`
- Meta：`text-xs text-gray-500`

### 2.4 按钮体系
- **Primary**：主动作（生成、分享）
- **Secondary**：保存/打印/重新生成
- **Tertiary**：文本按钮（更多、取消、查看详情）

## 3. 组件清单（建议）
> 这里的“组件名”是建议的模块化方向，用于指导后续重构，不要求一次性做完。

### 3.1 AppShell
职责：
- 三栏布局 + sticky 处理
- 移动端底部导航
- 主栏 route outlet

### 3.2 LeftNav
- Logo
- Nav items：Generate / My / Knowledge / Cases / Search
- 用户状态：已登录展示点数与菜单；未登录展示登录按钮

### 3.3 MainTabs
- For You / Mine
- 可扩展 Following

### 3.4 Composer（生成入口）
- 包装现有 `BaziForm` 的展示方式（折叠/展开）
- 与 SSE progress 对接（`/api/analyze-stream`）
- 生成完成后：生成 ReportCard + 打开 Report Viewer

### 3.5 FeedList / FeedItem
- `FeedItem` 是统一渲染入口：
  - ReportCard
  - KnowledgeCard
  - CaseCard
  - AnnouncementCard

### 3.6 ReportCard
字段建议：
- title：`{name} 的人生K线报告`
- meta：时间、游客/登录、summaryScore
- actions：分享、导出图片、查看详情、（锁定）保存/打印

### 3.7 ReportViewer
复用现有：
- `LifeKLineChart`
- `AnalysisResult`

增强：
- ActionBar（固定）
- 目录导航（可选）：滚动定位到“总评 / 性格 / 财富 / 婚姻 / 健康 / 六亲 / 币圈 / 风水”等

### 3.8 ShareMenu（统一分享组件）
建议将“分享行为”抽象为统一 API：
- 分享到 X
- 分享到 Telegram
- 复制链接
- 展示二维码
- 导出图片（基于 html2canvas）

注意：当前项目里 `SharePanel` 在不同调用处的 props 形态可能不一致，落地时应统一。

### 3.9 AuthGate（权限提示与锁定）
目标：减少频繁弹窗打断
- 按钮可用性：
  - 游客：显示锁图标与 tooltip
  - 点击后触发登录弹窗
- 统一文案：
  - “登录后可保存/打印/跨设备同步历史”

### 3.10 RightSidebar Widgets
- CTA（立即生成）
- 登录/点数卡片
- Trending（热门案例/热门分类）
- 社群入口（TG/X）

## 4. Loading / Empty / Error 规范
### 4.1 Loading
- Feed skeleton：列表占位（5-8 条）
- Report skeleton：图表占位 + 卡片占位

### 4.2 Empty
- Mine 无历史：引导生成
- Knowledge/Cases 无内容：引导关注社媒/加入社群

### 4.3 Error
- SSE 中断：顶部 toast + “重试”
- 点数不足：引导充值或使用自定义 API（右侧栏突出）

## 5. 可访问性与可用性
- 所有 icon button 具备 `aria-label`
- 弹窗/Drawer 支持 ESC 关闭、焦点管理
- 列表可键盘导航（至少 Tab 可达）

