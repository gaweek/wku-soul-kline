<p align="center">
  <img src="assets/logo-full.svg" alt="人生K线" width="280" />
</p>

<h1 align="center">人生 K 线 | Life Destiny K-Line</h1>

<p align="center">
  <strong>将命运可视化，用 K 线读懂人生</strong>
</p>

<p align="center">
  基于 AI 大模型 + 传统八字命理，以金融 K 线图的形式展现人生运势轨迹
</p>

<p align="center">
  <a href="https://www.life-kline.com">🌐 在线体验</a> •
  <a href="#功能特点">✨ 功能特点</a> •
  <a href="#项目架构">🏗️ 架构</a> •
  <a href="#本地部署">🚀 部署</a>
</p>

---

## 🌐 立即体验

<p align="center">
  <a href="https://www.life-kline.com">
    <img src="https://img.shields.io/badge/在线体验-life--kline.com-blue?style=for-the-badge&logo=google-chrome&logoColor=white" alt="在线体验" />
  </a>
</p>

**无需注册，无需配置，打开即用：**

### 👉 [https://www.life-kline.com](https://www.life-kline.com)

> 本开源项目是 life-kline.com 的完整源码，你可以直接在线体验所有功能，也可以 fork 本项目进行二次开发。

---

## 📸 产品预览

<table>
  <tr>
    <td><img src="assets/1.png" alt="人生K线图" /></td>
    <td><img src="assets/2.png" alt="命理分析报告" /></td>
  </tr>
  <tr>
    <td align="center"><em>人生流年大运 K 线走势图</em></td>
    <td align="center"><em>AI 深度命理分析报告</em></td>
  </tr>
</table>

---

## 💡 产品理念

> **"像看股票一样看人生"**

我们将传统命理学与现代数据可视化相结合，创造了一种全新的人生运势解读方式：

| 传统命理 | 人生 K 线 |
|---------|----------|
| 晦涩难懂的术语 | 直观的图表展示 |
| 主观的文字描述 | 量化的运势评分 |
| 单一维度分析 | 多维度综合评估 |
| 依赖人工解读 | AI 智能深度分析 |

**核心价值：**
- 🎯 **降低门槛** - 无需懂命理，看图即懂运势
- 📊 **数据驱动** - 将抽象运势转化为可视化数据
- 🤖 **AI 赋能** - 大模型深度分析，专业级解读
- 🔮 **古今融合** - 传统智慧与现代技术的完美结合

---

## ✨ 功能特点

### 🎯 智能八字排盘
- 输入出生时间地点，自动精准排盘
- 真太阳时自动修正（基于经度计算）
- 大运流年自动推算
- 基于 `lunar-javascript` 精确计算

### 📈 K 线可视化
- 1-100 岁人生运势 K 线图
- 大运、流年双轨展示
- 类似股票的 OHLC 图表
- 人生"牛市""熊市"一目了然

### 🤖 AI 深度分析
- 性格特质与天赋分析
- 事业财运发展趋势
- 婚姻感情运势预测
- 健康风险提示
- 发展方位风水建议

### ₿ Web3 特供
- 加密货币交易运势
- 暴富流年预测
- 交易风格建议
- 行业适配分析

### 🔐 隐私与安全
- 本地部署数据自主可控
- 无需上传敏感信息
- 开源代码可审计

---

## 🏗️ 项目架构

```
life-kline/
├── 📱 前端 (React 19 + Vite)
│   ├── pages/                    # 页面组件
│   │   ├── HomePage.tsx          # 首页 - K线生成
│   │   ├── DashboardPage.tsx     # 仪表盘
│   │   ├── DailyFortunePage.tsx  # 每日运势
│   │   ├── CasesLibrary.tsx      # 名人案例库
│   │   ├── KnowledgeHub.tsx      # 知识中心
│   │   └── ProfilePage.tsx       # 个人档案
│   │
│   ├── components/               # 可复用组件
│   │   ├── layout/               # 布局组件 (AppShell, Header, Nav)
│   │   ├── chart/                # 图表组件 (K线图, HUD)
│   │   ├── fortune/              # 运势组件 (日/月/年运势)
│   │   ├── celebrity/            # 名人案例组件
│   │   ├── profile/              # 档案管理组件
│   │   └── share/                # 分享海报组件
│   │
│   ├── services/                 # 前端服务
│   │   ├── fortuneCalculator.ts  # 运势计算引擎
│   │   ├── baziSimilarityService.ts # 八字相似度计算
│   │   └── calendarExport.ts     # 日历导出
│   │
│   └── contexts/                 # React Context
│
├── 🖥️ 后端 (Node.js + Express)
│   └── server/
│       ├── index.js              # 主入口 & API 路由
│       ├── database.js           # SQLite 数据库
│       ├── auth.js               # JWT 认证
│       ├── baziCalculator.js     # 八字计算核心
│       ├── parallelAnalyzer.js   # 并行 AI 分析引擎
│       ├── agentPrompts.js       # AI Agent 提示词
│       ├── emailService.js       # 邮件服务
│       └── cacheManager.js       # 缓存管理
│
└── 📜 脚本 (scripts/)
    ├── knowledgeContentGenerator.js  # 知识内容生成
    └── importCelebrityCases.js       # 名人案例导入
```

### 核心流程

```
用户输入出生信息
       ↓
┌──────────────────┐
│  智能八字排盘    │  ← lunar-javascript 精确计算
│  (真太阳时修正)  │
└────────┬─────────┘
         ↓
┌──────────────────┐
│  6 Agent 并行分析 │  ← AI 大模型 (GPT/Claude/Gemini)
│  • 核心命理      │
│  • 事业财富      │
│  • 婚姻健康      │
│  • 过去K线       │
│  • 未来K线       │
│  • 币圈运势      │
└────────┬─────────┘
         ↓
┌──────────────────┐
│   K线图 + 报告   │  ← Recharts 可视化
└──────────────────┘
```

---

## 🛠️ 技术栈

| 层级 | 技术 | 说明 |
|-----|------|------|
| **前端框架** | React 19 + Vite | 最新 React，极速 HMR |
| **UI 样式** | TailwindCSS | 原子化 CSS，高效开发 |
| **图表** | Recharts | 专业金融图表 |
| **动画** | Framer Motion | 流畅交互动效 |
| **路由** | React Router 7 | 声明式路由 |
| **后端** | Express.js | 轻量高效 |
| **数据库** | SQLite (better-sqlite3) | 零配置，本地优先 |
| **认证** | JWT + bcrypt | 安全可靠 |
| **八字算法** | lunar-javascript | 精确农历/干支计算 |
| **AI 接口** | OpenAI 兼容 | 支持多种大模型 |

---

## 🚀 本地部署

### 环境要求
- Node.js 18+
- npm / pnpm / yarn

### 快速开始

```bash
# 1. 克隆项目
git clone https://github.com/miounet11/life-kline.git
cd life-kline

# 2. 配置环境变量
cp .env.example .env
cp server/.env.example server/.env
# 编辑 .env，填入你的 API Key

# 3. 安装依赖
npm install

# 4. 启动服务 (前后端同时启动)
npm run dev
```

打开 http://localhost:5173 即可使用。

### 环境变量说明

```bash
# .env
API_BASE_URL=https://api.openai.com/v1  # API 地址
API_KEY=sk-xxx                           # 你的 API Key
JWT_SECRET=random-string                 # JWT 密钥
```

### 支持的 AI 模型

本项目兼容任何 OpenAI API 格式的服务：
- ✅ OpenAI GPT-4 / GPT-3.5
- ✅ Anthropic Claude
- ✅ Google Gemini (通过兼容接口)
- ✅ 国内各类中转 API

---

## 📄 开源协议

MIT License - 可自由使用、修改、商用

---

## 🔗 相关链接

- 🌐 **官网**: [https://www.life-kline.com](https://www.life-kline.com)
- 📦 **GitHub**: [https://github.com/miounet11/life-kline](https://github.com/miounet11/life-kline)

---

<p align="center">
  <strong>⭐ 如果觉得有趣，欢迎 Star 支持！</strong>
</p>

<p align="center">
  <em>免责声明：本项目仅供娱乐与文化研究，命运掌握在自己手中，请理性看待分析结果。</em>
</p>
