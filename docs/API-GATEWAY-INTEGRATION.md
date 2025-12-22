# API Gateway 集成指南

本文档说明如何在 Life-Kline 项目中集成和使用新的 API 网关系统。

## 目录

1. [系统架构](#系统架构)
2. [快速开始](#快速开始)
3. [核心模块说明](#核心模块说明)
4. [集成步骤](#集成步骤)
5. [使用示例](#使用示例)
6. [迁移现有代码](#迁移现有代码)
7. [测试验证](#测试验证)

## 系统架构

```
┌─────────────────────────────────────────────────────────────┐
│                        应用层                                │
│  (analyzeStream.js, celebrityAnalyzer.js, etc.)            │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                        │
│                   (apiGateway.js)                           │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  getApiMode() / getApiConfig() / routeRequest()      │  │
│  └──────────────────────────────────────────────────────┘  │
└───────────────┬───────────────────────┬─────────────────────┘
                │                        │
    ┌───────────▼──────────┐   ┌────────▼─────────────┐
    │  Self-Hosted Service │   │   Cloud Service      │
    │ (selfHostedService.js│   │  (cloudService.js)   │
    │                      │   │                      │
    │  ┌────────────────┐ │   │  ┌────────────────┐ │
    │  │ User's AI API  │ │   │  │ life-kline.com │ │
    │  │ (OpenAI/etc)   │ │   │  │  Official API  │ │
    │  └────────────────┘ │   │  └────────────────┘ │
    └─────────────────────┘   └────────────────────────┘
```

## 快速开始

### 1. 环境配置

编辑 `.env` 文件：

```bash
# 选择模式：self 或 cloud
API_MODE=self

# 自托管模式配置
API_BASE_URL=https://api.openai.com/v1
API_KEY=your-api-key
DEFAULT_MODEL=gpt-4

# 云服务模式配置
CLOUD_API_KEY=your-cloud-api-key
CLOUD_API_ENDPOINT=https://api.life-kline.com/v1
```

### 2. 导入网关模块

在需要调用 AI 的文件中导入：

```javascript
import {
  getApiMode,
  getApiConfig,
  routeAnalysisRequest,
  API_MODE
} from './apiGateway.js';
```

### 3. 使用网关

```javascript
const mode = getApiMode();
const config = getApiConfig();

const payload = {
  messages: [
    { role: 'system', content: 'System prompt...' },
    { role: 'user', content: 'User prompt...' }
  ]
};

const result = await routeAnalysisRequest(mode, payload, {
  userId: 'user-123',
  analysisType: 'bazi'
});
```

## 核心模块说明

### apiGateway.js

**职责**：API 路由和配置管理

**主要功能**：
- `getApiMode()` - 获取当前运行模式
- `getApiConfig()` - 获取 API 配置
- `validateApiConfig(config)` - 验证配置完整性
- `routeAnalysisRequest(mode, payload, options)` - 路由请求到对应服务
- `healthCheck()` - 健康检查

### cloudService.js

**职责**：官方云服务对接

**主要功能**：
- `callCloudService(payload, config, options)` - 调用云服务
- `getCloudQuota(apiKey, endpoint)` - 查询配额
- `validateCloudApiKey(apiKey, endpoint)` - 验证 API Key

### selfHostedService.js

**职责**：自托管 API 调用

**主要功能**：
- `callSelfHostedAPI(payload, config, options)` - 调用自托管 API
- `callWithFallback(payload, config, fallbackModels, options)` - 使用备选模型
- `testSelfHostedConnection(config)` - 测试连接

## 集成步骤

### 步骤 1: 修改现有的 API 调用代码

**原代码** (analyzeStream.js):

```javascript
const response = await fetch(`${apiBaseUrl}/chat/completions`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${apiKey}`,
  },
  body: JSON.stringify({
    model: model,
    messages: [
      { role: 'system', content: BAZI_SYSTEM_INSTRUCTION },
      { role: 'user', content: userPrompt },
    ],
    temperature: 0.7,
  }),
});
```

**新代码**:

```javascript
import { getApiMode, routeAnalysisRequest } from './apiGateway.js';

const mode = getApiMode();
const payload = {
  messages: [
    { role: 'system', content: BAZI_SYSTEM_INSTRUCTION },
    { role: 'user', content: userPrompt },
  ],
  options: {
    temperature: 0.7
  }
};

const result = await routeAnalysisRequest(mode, payload, {
  userId,
  systemPrompt: BAZI_SYSTEM_INSTRUCTION,
  userPrompt,
  temperature: 0.7
});

// 使用 result.data.content 获取分析内容
const content = result.data.content || result.data.rawContent;
```

### 步骤 2: 添加配置验证

在服务启动时验证配置：

```javascript
// server/index.js

import { healthCheck } from './apiGateway.js';

// 启动时检查
const health = await healthCheck();
if (!health.configured) {
  console.error(`API 配置错误: ${health.error}`);
  console.error('请检查 .env 文件配置');
  process.exit(1);
}

console.log(`API 模式: ${health.mode}`);
console.log(`API 端点: ${health.endpoint}`);
```

### 步骤 3: 添加配额查询（云服务）

```javascript
// 在分析前检查配额
if (mode === API_MODE.CLOUD_SERVICE) {
  const quota = await getCloudQuota(config.apiKey, config.endpoint);

  if (quota.remaining < 10) {
    console.warn(`配额即将用完，剩余: ${quota.remaining}`);
    // 发送通知给用户
  }
}
```

### 步骤 4: 统一错误处理

```javascript
try {
  const result = await routeAnalysisRequest(mode, payload, options);
  return result.data;

} catch (error) {
  // 统一的错误处理
  if (error.message.includes('配额不足')) {
    // 引导用户升级
    sendUpgradeNotification(userId);
  } else if (error.message.includes('API Key 无效')) {
    // 提示检查配置
    sendConfigCheckNotification(userId);
  } else if (error.message.includes('请求频率过高')) {
    // 实现请求队列
    await queueRequest(payload);
  }

  // 记录错误日志
  await logEvent('analysis_error', {
    userId,
    error: error.message,
    mode
  });

  throw error;
}
```

## 使用示例

### 示例 1: 基础分析

```javascript
import { getApiMode, routeAnalysisRequest } from './apiGateway.js';

async function analyzeBazi(userId, baziData) {
  const mode = getApiMode();

  const payload = {
    messages: [
      {
        role: 'system',
        content: BAZI_SYSTEM_INSTRUCTION
      },
      {
        role: 'user',
        content: buildUserPrompt(baziData)
      }
    ]
  };

  const result = await routeAnalysisRequest(mode, payload, {
    userId,
    analysisType: 'bazi',
    systemPrompt: BAZI_SYSTEM_INSTRUCTION,
    userPrompt: buildUserPrompt(baziData)
  });

  return result.data.content;
}
```

### 示例 2: 使用备选模型（自托管）

```javascript
import { getApiMode, getApiConfig, API_MODE } from './apiGateway.js';
import { callWithFallback } from './selfHostedService.js';

async function analyzeBaziWithFallback(userId, baziData) {
  const mode = getApiMode();

  if (mode !== API_MODE.SELF_HOSTED) {
    // 云服务不支持备选模型
    return analyzeBazi(userId, baziData);
  }

  const config = getApiConfig();
  const fallbackModels = ['gpt-4-turbo', 'gpt-3.5-turbo'];

  const payload = {
    messages: [
      { role: 'system', content: BAZI_SYSTEM_INSTRUCTION },
      { role: 'user', content: buildUserPrompt(baziData) }
    ]
  };

  const result = await callWithFallback(payload, config, fallbackModels, {
    userId
  });

  return result.data.content;
}
```

### 示例 3: Express 路由集成

```javascript
import express from 'express';
import { healthCheck, getApiMode, API_MODE } from './apiGateway.js';
import { getCloudQuota } from './cloudService.js';

const router = express.Router();

// 网关健康检查
router.get('/api/gateway/health', async (req, res) => {
  const health = await healthCheck();
  res.json(health);
});

// 配额查询
router.get('/api/gateway/quota', requireAuth, async (req, res) => {
  const mode = getApiMode();

  if (mode !== API_MODE.CLOUD_SERVICE) {
    return res.status(400).json({
      error: '配额查询仅在云服务模式下可用'
    });
  }

  try {
    const config = getApiConfig();
    const quota = await getCloudQuota(config.apiKey, config.endpoint);
    res.json(quota);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

## 迁移现有代码

### analyzeStream.js 迁移示例

**原代码结构**:
```javascript
async function makeModelRequest(model, apiBaseUrl, apiKey, userPrompt) {
  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    // ... fetch 配置
  });
  // ... 处理响应
}
```

**迁移方案 1: 最小改动**
```javascript
import { getApiConfig } from './apiGateway.js';

async function makeModelRequest(model, userPrompt) {
  const config = getApiConfig();
  const apiBaseUrl = config.endpoint;
  const apiKey = config.apiKey;

  // 保持原有逻辑不变
  const response = await fetch(`${apiBaseUrl}/chat/completions`, {
    // ... 原有配置
  });
}
```

**迁移方案 2: 完全重构**
```javascript
import { routeAnalysisRequest, getApiMode } from './apiGateway.js';

async function makeModelRequest(model, userPrompt) {
  const mode = getApiMode();

  const payload = {
    messages: [
      { role: 'system', content: BAZI_SYSTEM_INSTRUCTION },
      { role: 'user', content: userPrompt }
    ]
  };

  const result = await routeAnalysisRequest(mode, payload, {
    systemPrompt: BAZI_SYSTEM_INSTRUCTION,
    userPrompt
  });

  return result.data;
}
```

### celebrityAnalyzer.js 迁移示例

```javascript
// 原代码
import fetch from 'node-fetch';

const response = await fetch(`${process.env.API_BASE_URL}/chat/completions`, {
  // ...
});

// 迁移后
import { routeAnalysisRequest, getApiMode } from './apiGateway.js';

const mode = getApiMode();
const result = await routeAnalysisRequest(mode, payload, options);
```

## 测试验证

### 1. 单元测试

```javascript
// tests/apiGateway.test.js

import { describe, it, expect } from 'vitest';
import { getApiMode, validateApiConfig, API_MODE } from '../server/apiGateway.js';

describe('API Gateway', () => {
  it('should get correct API mode', () => {
    process.env.API_MODE = 'self';
    expect(getApiMode()).toBe(API_MODE.SELF_HOSTED);

    process.env.API_MODE = 'cloud';
    expect(getApiMode()).toBe(API_MODE.CLOUD_SERVICE);
  });

  it('should validate config correctly', () => {
    const validConfig = {
      mode: API_MODE.SELF_HOSTED,
      endpoint: 'https://api.openai.com/v1',
      apiKey: 'sk-xxx',
      model: 'gpt-4'
    };

    const result = validateApiConfig(validConfig);
    expect(result.valid).toBe(true);
  });
});
```

### 2. 集成测试

```javascript
// tests/integration.test.js

import { routeAnalysisRequest, getApiMode } from '../server/apiGateway.js';

describe('Integration Tests', () => {
  it('should complete basic analysis', async () => {
    const mode = getApiMode();
    const payload = {
      messages: [
        { role: 'system', content: 'You are a test assistant.' },
        { role: 'user', content: 'Say hello.' }
      ]
    };

    const result = await routeAnalysisRequest(mode, payload, {
      userId: 'test-user'
    });

    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  });
});
```

### 3. 手动测试

```bash
# 启动服务
npm run dev

# 测试健康检查
curl http://localhost:3000/api/gateway/health

# 测试分析请求
curl -X POST http://localhost:3000/api/gateway/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user",
    "baziData": {...}
  }'
```

## 常见问题

### Q1: 如何在开发环境使用云服务，生产环境使用自托管？

**A**: 使用不同的 `.env` 文件：

```bash
# .env.development
API_MODE=cloud
CLOUD_API_KEY=dev-key

# .env.production
API_MODE=self
API_BASE_URL=https://your-api.com/v1
API_KEY=prod-key
```

### Q2: 如何监控两种模式的性能差异？

**A**: 所有请求都会记录日志，可以通过日志分析：

```javascript
import { getSystemLogs } from './database.js';

const logs = await getSystemLogs({
  type: 'cloud_service_success',
  startDate: '2025-12-01'
});

const avgElapsed = logs.reduce((sum, log) =>
  sum + parseFloat(log.data.elapsed), 0
) / logs.length;
```

### Q3: 云服务配额用完了怎么办？

**A**: 系统会自动抛出错误，你可以：

1. 引导用户升级套餐
2. 暂时降级到缓存结果
3. 切换到自托管模式（需要重启服务）

---

更新时间：2025-12-22
版本：v1.0.0
