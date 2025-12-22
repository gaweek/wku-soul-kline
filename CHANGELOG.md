# 更新日志

本文件记录了 Life-Kline 项目的所有重要变更。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
版本号遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [未发布]

### 新增
- 完整的项目文档体系
  - 更新了 README.md，添加 Apache 2.0 许可证徽章
  - 创建 CONTRIBUTING.md 贡献指南
  - 创建 CODE_OF_CONDUCT.md 行为准则
  - 创建 SECURITY.md 安全政策
  - 创建 CHANGELOG.md 更新日志

### 改进
- README 中突出显示在线体验入口 https://www.life-kline.com
- 增加了两种部署模式的详细说明（云服务模式 vs 自托管模式）
- 完善了技术栈介绍和项目架构说明
- 增加了定价系统自定义说明
- 添加了更详细的快速开始指南

---

## [1.0.0] - 2024-12-22

### 新增

#### 核心功能
- 智能八字排盘系统
  - 基于 lunar-javascript 的精确计算
  - 真太阳时自动修正
  - 大运流年自动推算
- K 线可视化
  - 1-100 岁人生运势展示
  - 大运、流年双轨图表
  - 基于 Recharts 的专业金融图表
- AI 深度分析
  - 统一分析引擎（unifiedAnalyzer）
  - 多维度运势评估（性格、事业、婚姻、健康）
  - Web3 加密货币运势特供
  - 发展方位风水建议

#### 用户系统
- JWT 身份认证
- 积分系统
  - 新用户免费积分
  - 兑换券系统
  - 邮件绑定奖励
- 多档案管理
  - 创建、编辑、删除档案
  - 档案相似度匹配

#### 页面功能
- 首页（HomePage）- K 线生成
- 仪表盘（DashboardPage）- 综合运势展示
- 每日运势（DailyFortunePage）- 日/月/年运势
- 名人案例库（CasesLibrary）- 学习参考
- 知识中心（KnowledgeHub）- 命理知识
- 个人档案（ProfilePage）- 档案管理

#### 分享功能
- 海报生成（基于 html2canvas）
- 二维码分享
- 社交媒体分享
- 日历导出（ICS 格式）

#### 邮件服务
- 邮件验证码
- 每日运势推送
- 重大流年提醒

### 技术实现

#### 前端
- React 19 + Vite
- TailwindCSS 响应式设计
- Framer Motion 动画
- React Router 7 路由
- Recharts 图表库

#### 后端
- Express.js 服务器
- SQLite 数据库（better-sqlite3）
- bcryptjs 密码加密
- JWT 认证
- node-cron 定时任务

#### AI 集成
- OpenAI API 兼容接口
- 支持 GPT-4、Claude、Gemini
- 流式响应（Server-Sent Events）
- 智能缓存机制

### 开源协议
- 采用 Apache License 2.0

---

## 版本说明

### 语义化版本格式

给定版本号 MAJOR.MINOR.PATCH：

- **MAJOR（主版本号）**：不兼容的 API 修改
- **MINOR（次版本号）**：向下兼容的功能性新增
- **PATCH（修订号）**：向下兼容的问题修正

### 版本类型标签

- `新增`: 新功能
- `改进`: 对现有功能的改进
- `修复`: Bug 修复
- `弃用`: 即将移除的功能
- `移除`: 已移除的功能
- `安全`: 安全相关的修复

---

## 路线图

### 计划中的功能

#### v1.1.0
- [ ] 多语言支持（英文、日文）
- [ ] 暗色模式
- [ ] 更多图表类型（折线图、饼图）
- [ ] 导出 PDF 报告
- [ ] 移动端 App

#### v1.2.0
- [ ] 合盘分析（双人八字对比）
- [ ] 择吉功能（选择吉日）
- [ ] 更多名人案例
- [ ] 社区功能（用户讨论）

#### v2.0.0
- [ ] 插件系统
- [ ] 自定义分析模板
- [ ] 更多命理体系（紫微斗数、奇门遁甲）
- [ ] API 开放平台

### 欢迎贡献

如果你对以上功能感兴趣，或有其他想法，欢迎：
- 在 [Issues](https://github.com/miounet11/life-kline/issues) 中讨论
- 提交 [Pull Request](https://github.com/miounet11/life-kline/pulls)
- 查看 [贡献指南](CONTRIBUTING.md)

---

<p align="center">
  <a href="README.md">返回主页</a> •
  <a href="https://github.com/miounet11/life-kline/releases">查看所有版本</a>
</p>
