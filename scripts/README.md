# 内容生成脚本使用指南

## 概述

本目录包含三个用于生成和导入知识内容的脚本：

1. **generate-content.js** - 使用 LLM API 批量生成知识文章
2. **import-content.js** - 将生成的文章导入数据库
3. **seed-cases.js** - 生成示例案例数据

## 使用步骤

### 1. 生成知识文章

```bash
npm run generate-content
```

该脚本将：
- 使用 LLM API 生成 30 篇知识文章
- 覆盖 5 个分类：快速入门(quickstart)、K线逻辑(kline)、八字基础(bazi)、大运流年(dayun)、方法误区(method)
- 生成的内容保存到 `scripts/generated-articles.json`
- 输出 SQL 插入语句到控制台

**注意事项：**
- 确保 `.env` 文件中配置了正确的 `API_KEY`
- 生成过程约需 1-2 分钟（包含 2 秒延迟防止 rate limit）
- 如果某篇文章生成失败，会显示错误但继续生成其他文章

### 2. 导入文章到数据库

```bash
npm run import-content
```

该脚本将：
- 读取 `scripts/generated-articles.json`
- 导入所有文章到 `knowledge_articles` 表
- 使用 `INSERT OR REPLACE` 避免重复

**前置条件：**
- 必须先运行 `generate-content` 生成文章
- 数据库必须已初始化（运行过 `npm run dev` 或 `npm start`）

### 3. 生成示例案例

```bash
npm run seed-cases
```

该脚本将：
- 生成 3 个典型案例（早发型、晚成型、大起大落型）
- 每个案例包含完整的 K 线数据（1-80 岁）
- 带有关键节点标注（highlights）
- 导入到 `cases` 表

## 文章分类说明

### quickstart - 快速入门（6篇）
面向新手用户的基础概念和操作指南

### kline - K线逻辑（6篇）
解释人生K线图的核心逻辑和解读方法

### bazi - 八字基础（8篇）
命理学基础概念的通俗讲解

### dayun - 大运流年（6篇）
大运和流年的原理与应用

### method - 方法误区（4篇）
常见误区和正确使用方法

## 数据库结构

### knowledge_articles 表
```sql
- id: 文章ID
- slug: URL友好的唯一标识符
- title: 标题
- category: 分类
- level: 难度等级（1=入门, 2=进阶, 3=高级）
- tags: 标签数组（JSON）
- summary: 摘要（60字内）
- content: 正文（Markdown格式）
- view_count: 浏览次数
- created_at: 创建时间
- published: 是否发布（1=是, 0=否）
```

### cases 表
```sql
- id: 案例ID
- title: 标题
- persona: 角色类型（创业者、企业家等）
- curve_type: 曲线类型（早发、晚成等）
- chart_data: K线数据（JSON数组）
- highlights: 关键节点（JSON数组）
- narrative: 案例叙述
- tags: 标签数组（JSON）
- view_count: 浏览次数
- created_at: 创建时间
- published: 是否发布（1=是, 0=否）
```

## 自定义内容

### 修改文章主题
编辑 `generate-content.js` 中的 `ARTICLES_TO_GENERATE` 数组：

```javascript
const ARTICLES_TO_GENERATE = [
  { topic: '你的主题', category: 'quickstart' },
  // ... 更多主题
];
```

### 修改案例数据
编辑 `seed-cases.js` 中的 `CASES` 数组：

```javascript
const CASES = [
  {
    title: '案例标题',
    persona: '角色',
    curveType: '类型',
    narrative: '案例描述',
    chartData: generateCustomChart(), // 自定义K线数据
    highlights: [
      { age: 30, type: 'peak', note: '关键事件' }
    ]
  }
];
```

## 故障排除

### 生成失败
- 检查 API_KEY 是否正确
- 检查 API_BASE_URL 是否可访问
- 查看错误信息中的具体原因

### 导入失败
- 确保数据库文件存在（`server/data/lifekline.db`）
- 检查 `generated-articles.json` 文件格式是否正确
- 确保数据库表已创建（重启服务器会自动创建）

### 案例数据异常
- K线数据必须是 1-80 岁的完整数组
- 每个数据点必须包含 age, open, close, high, low, score, isGreen 字段
- highlights 中的 age 必须在 1-80 范围内

## 扩展功能

可以基于这些脚本扩展更多功能：
- 添加文章更新脚本
- 实现增量生成（只生成新主题）
- 添加内容质量检查
- 实现批量标签管理
- 添加文章版本控制
