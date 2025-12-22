# 更新日志

本文件记录了 Life-Kline 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

---

## [1.0.1] - 2025-01-01

### 首次开源发布

**Life-Kline 人生K线** - 基于 AI 大模型 + 传统八字命理的人生运势可视化工具。

#### 核心功能
- **智能八字排盘** - 基于 lunar-javascript 精确计算，真太阳时自动修正
- **K 线可视化** - 1-100 岁人生运势图表，类金融 OHLC 展示
- **AI 深度分析** - 统一分析引擎，多维度运势评估
- **Web3 运势** - 加密货币交易运势特供分析

#### 用户系统
- JWT 身份认证
- 积分系统（免费积分 + 兑换券）
- 多档案管理

#### 技术特性
- 前端：React 19 + Vite + TailwindCSS
- 后端：Express.js + SQLite
- AI：OpenAI 兼容接口，支持 GPT/Claude/Gemini
- 流式响应 (Server-Sent Events)

#### 部署模式
- **自托管模式** - 使用自己的 AI API，完全掌控
- **云服务模式** - 使用官方 life-kline.com 服务

#### 开源协议
- Apache License 2.0

---

## 路线图

### v1.1.0 计划
- 多语言支持
- 暗色模式
- PDF 报告导出

### v1.2.0 计划
- 合盘分析
- 择吉功能
- 社区功能

---

<p align="center">
  <a href="README.md">返回主页</a> •
  <a href="https://github.com/miounet11/life-kline/releases">查看所有版本</a>
</p>
