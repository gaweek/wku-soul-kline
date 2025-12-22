# 统一分析模式 (Unified Analyzer) - API文档

## 概述

统一分析模式将原有的 6 个 Agent 并行分析简化为单个 Agent 统一分析，大幅降低 API 调用成本和复杂度。

## 架构对比

### 原架构（6 Agent 并行模式）
```
API调用次数: 6次
- Agent 1: 核心命理分析
- Agent 2A: 过去K线分析 (出生到今年)
- Agent 2B: 未来K线分析 (今年到100岁)
- Agent 3: 事业财富分析
- Agent 4: 婚姻健康分析
- Agent 5: 币圈交易分析

成本: 6x API调用费用
复杂度: 高（需要协调6个Agent、合并结果、处理部分失败）
```

### 新架构（单 Agent 统一模式）
```
API调用次数: 1次
- 统一Agent: 全维度分析（包含以上所有功能）

成本: 1x API调用费用 (节省83%)
复杂度: 低（单次请求、单点处理、简单降级）
```

## API端点

### 1. 统一分析（推荐）

**端点:** `POST /api/analyze-unified`

**功能:** 单次AI请求完成所有分析维度，输出格式与并行模式完全兼容。

**请求示例:**
```javascript
// SSE流式请求
const eventSource = new EventSource('/api/analyze-unified', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    name: '张三',
    gender: 'Male',
    birthYear: 1990,
    yearPillar: '庚午',
    monthPillar: '戊寅',
    dayPillar: '甲子',
    hourPillar: '丙寅',
    startAge: 1,
    firstDaYun: '己卯',
    birthPlace: '北京',
    useCustomApi: false,
    skipCache: false,
  })
});

eventSource.addEventListener('progress', (e) => {
  const data = JSON.parse(e.data);
  console.log('进度:', data.message);
});

eventSource.addEventListener('cache_hit', (e) => {
  const data = JSON.parse(e.data);
  console.log('命中缓存:', data.baziHash);
});

eventSource.addEventListener('unified_start', (e) => {
  const data = JSON.parse(e.data);
  console.log('开始统一分析');
});

eventSource.addEventListener('complete', (e) => {
  const data = JSON.parse(e.data);
  console.log('分析完成:', data.result);
  console.log('模型:', data.modelUsed);
  console.log('耗时:', data.processingTimeMs, 'ms');
  eventSource.close();
});

eventSource.addEventListener('error', (e) => {
  const data = JSON.parse(e.data);
  console.error('错误:', data.message);
  eventSource.close();
});
```

**响应数据格式:**
```json
{
  "result": {
    "chartData": [
      {
        "age": 1,
        "year": 1990,
        "daYun": "童限",
        "ganZhi": "庚午",
        "open": 50,
        "close": 55,
        "high": 60,
        "low": 45,
        "score": 55,
        "reason": "流年详批..."
      }
    ],
    "analysis": {
      "bazi": ["庚午", "戊寅", "甲子", "丙寅"],
      "summary": "命理总评...",
      "summaryScore": 7,
      "personality": "性格深度分析...",
      "personalityScore": 7,
      "industry": "事业行业分析...",
      "industryScore": 7,
      "wealth": "财富层级分析...",
      "wealthScore": 7,
      "marriage": "婚姻感情分析...",
      "marriageScore": 6,
      "health": "健康状况分析...",
      "healthScore": 6,
      "crypto": "币圈交易分析...",
      "cryptoScore": 7,
      "family": "六亲关系...",
      "fengShui": "风水建议...",
      "appearance": "相貌特征",
      "bodyType": "体型特点",
      "skin": "皮肤特征",
      "luckyColors": ["红色", "紫色"],
      "luckyDirections": ["南方", "东方"],
      "luckyZodiac": ["马", "虎"],
      "luckyNumbers": [3, 8]
    }
  },
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "points": 950
  },
  "cost": 50,
  "isGuest": false,
  "fromCache": false,
  "processingTimeMs": 15000,
  "modelUsed": "gemini-3-pro-preview",
  "mode": "unified"
}
```

### 2. 并行分析（旧模式，保留兼容）

**端点:** `POST /api/analyze-parallel`

**功能:** 6个Agent并行分析，适合需要极致速度的场景。

**优势:**
- 首个Agent响应更快（渐进式推送）
- 单个Agent失败不影响整体

**劣势:**
- API调用成本高6倍
- 代码复杂度高
- 需要协调多个Agent

## SSE事件类型

### 统一分析模式事件

| 事件名 | 说明 | 数据示例 |
|--------|------|---------|
| `progress` | 进度更新 | `{ message: "正在初始化...", phase: "init" }` |
| `cache_hit` | 命中缓存 | `{ baziHash: "abc123", cachedAt: "2025-01-01T00:00:00Z" }` |
| `cache_miss` | 未命中缓存 | `{ baziHash: "abc123" }` |
| `unified_start` | 开始统一分析 | `{ message: "启动统一分析Agent..." }` |
| `complete` | 分析完成 | `{ result: {...}, modelUsed: "...", processingTimeMs: 15000 }` |
| `error` | 错误 | `{ error: "ERROR_CODE", message: "错误描述" }` |

### 并行分析模式事件

| 事件名 | 说明 | 数据示例 |
|--------|------|---------|
| `progress` | 进度更新 | `{ message: "Agent[core] 完成" }` |
| `parallel_start` | 开始并行分析 | `{ agents: ["core", "kline_past", ...] }` |
| `agent_core_complete` | 核心Agent完成 | `{ data: {...}, elapsed: "3.2s" }` |
| `agent_kline_past_complete` | 过去K线完成 | `{ data: {...}, elapsed: "5.1s" }` |
| `agent_kline_future_complete` | 未来K线完成 | `{ data: {...}, elapsed: "4.8s" }` |
| `agent_career_complete` | 事业Agent完成 | `{ data: {...}, elapsed: "2.9s" }` |
| `agent_marriage_complete` | 婚姻Agent完成 | `{ data: {...}, elapsed: "3.5s" }` |
| `agent_crypto_complete` | 币圈Agent完成 | `{ data: {...}, elapsed: "2.7s" }` |
| `complete` | 所有Agent完成 | `{ result: {...}, agentsUsed: [...], successCount: 6 }` |

## 缓存机制

两种模式共享同一套缓存系统：

- **缓存键:** `baziHash` (基于八字四柱的SHA256哈希)
- **缓存类型:** 永久缓存（不过期）
- **缓存命中:** 直接返回，不重复调用AI
- **性别区分:** 男女八字分别缓存

## 成本对比

假设单次API调用成本为 `$0.01`：

| 模式 | API调用次数 | 单次成本 | 1000次成本 |
|------|------------|---------|-----------|
| 统一分析 | 1次 | $0.01 | $10 |
| 并行分析 | 6次 | $0.06 | $60 |
| **节省** | **-5次** | **-$0.05** | **-$50 (83%)** |

## 迁移指南

### 前端代码迁移

**原代码（并行模式）:**
```javascript
fetch('/api/analyze-parallel', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

**新代码（统一模式）:**
```javascript
// 只需更改端点，其余代码不变
fetch('/api/analyze-unified', {
  method: 'POST',
  body: JSON.stringify(data)
})
```

输出格式完全兼容，无需修改后续处理逻辑。

## 降级策略

### 统一分析降级

1. 主模型: `gemini-3-pro-preview`
2. 备用模型: `grok-4-auto`
3. 备用模型: `claude-haiku-4-5-20251001`
4. 备用模型: `grok-4`
5. K线降级: 使用本地算法生成（如AI全部失败）

### 并行分析降级

每个Agent独立降级，单个失败不影响整体。

## 最佳实践

1. **推荐使用统一分析模式** - 成本低、速度快、代码简单
2. **启用缓存** - 相同八字直接返回，秒级响应
3. **监控错误率** - 统一模式失败影响全局，需要密切监控
4. **保留并行模式** - 作为高可用备选方案

## 性能指标

| 指标 | 统一模式 | 并行模式 |
|------|---------|---------|
| API调用次数 | 1次 | 6次 |
| 平均响应时间 | 15-20秒 | 10-15秒（首个Agent）|
| 完整响应时间 | 15-20秒 | 15-25秒 |
| 成本 | 低 | 高6倍 |
| 可维护性 | 高 | 中 |
| 容错能力 | 中 | 高 |

## 环境变量

```bash
# API配置
API_BASE_URL=https://api.openai.com/v1
API_KEY=sk-your-key-here
DEFAULT_MODEL=gemini-3-pro-preview

# 分析成本
COST_PER_ANALYSIS=50
```

## 测试建议

1. **功能测试:** 对比统一模式和并行模式的输出一致性
2. **压力测试:** 验证单Agent模式在高并发下的稳定性
3. **成本测试:** 监控实际API调用成本
4. **缓存测试:** 验证缓存命中率和数据一致性

## FAQ

**Q: 统一模式和并行模式输出一样吗？**
A: 格式完全一致，但内容可能略有差异（不同AI调用）。

**Q: 统一模式失败率会更高吗？**
A: 是的，单点失败影响全局。但通过多模型降级策略可以缓解。

**Q: 什么时候应该用并行模式？**
A: 需要极致速度、对成本不敏感、或统一模式频繁失败时。

**Q: 缓存会过期吗？**
A: 不会，八字分析是永久的，相同八字总是返回相同结果。

**Q: 如何清除缓存？**
A: 可通过数据库直接删除 `bazi_analysis_cache` 表中的记录。
