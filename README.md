# WKU soul-kline

WKU soul-kline 是一个面向兴趣社交场景的 AI 连接行情 Demo。

它不做命运预测，也不把用户定型；它把用户的生日、性别、MBTI、SBTI、兴趣和真实社交样本，转译成一条可以交互查看的 `soul-kline`，帮助用户理解自己在社交平台里哪里更容易被看见、被接住、被再次想起。

## 核心体验

- **Who Know U**：单人连接分析，生成个人 soul-kline、社交表达建议和同频人群线索。
- **Who Know Us**：双人共振分析，生成两个人的共振 K 线、共同点、错频风险和靠近建议。
- **多 Agent 分析**：画像建模、共鸣信号、soul-kline 生成、同频人群、表达方案、安全边界六个 Agent 并行协作。
- **可交互读盘**：鼠标 hover 查看节点详情，点击锁定或取消锁定读盘卡片。

## 本地运行

```bash
npm install
npm run dev
```

前端默认运行在 `http://localhost:5173`，后端默认运行在 `http://localhost:3000`。

## 环境变量

```bash
API_BASE_URL=https://api.openai.com/v1
API_KEY=your-api-key
DEFAULT_MODEL=gpt-4.1-mini
PORT=3000
```

项目会根据 `API_BASE_URL` 自动识别兼容 DeepSeek、OpenAI、Gemini 等 OpenAI-compatible 服务的默认模型与候选模型。

## 当前接口

- `GET /api/health`
- `POST /api/vibeline/analyze`
- `POST /api/vibeline/match`

## 代码结构

```text
pages/VibeLinePage.tsx          # WKU soul-kline 主页面
components/VibeLineChart.tsx    # 可交互 soul-kline 曲线
services/vibelineService.ts     # 前端 SSE 调用
types/vibeline.ts               # 前后端共享的前端类型
server/index.js                 # 极简 Express 入口
server/vibelineAnalyzer.js      # Who Know U 多 Agent 分析
server/vibelineMatchAnalyzer.js # Who Know Us 多 Agent 分析
server/vibelinePrompts.js       # soul-kline Agent 提示词
server/vibelineEngine.js        # 输入清洗、兜底结构与结果合并
server/modelConfig.js           # OpenAI-compatible 模型配置
```
