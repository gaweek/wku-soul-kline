# Life-Kline 官方云服务

## 概述

Life-Kline 官方云服务为开源用户提供开箱即用的 AI 算力支持，无需自行配置 AI API，即可快速体验完整的命理分析功能。

## 两种使用模式对比

| 特性 | 自托管模式 (Self-Hosted) | 云服务模式 (Cloud Service) |
|------|-------------------------|---------------------------|
| **配置难度** | 需要自己申请 AI API | 一键接入，零配置 |
| **成本** | 按自己的 AI API 计费 | 统一定价，透明计费 |
| **稳定性** | 取决于所选 API | 官方保障，高可用 |
| **功能支持** | 完整功能 | 完整功能 + 优先更新 |
| **适用场景** | 技术用户，已有 API | 普通用户，快速上手 |

## 快速开始

### 1. 申请 API Key

访问 [life-kline.com](https://life-kline.com) 注册账号并申请 API Key：

1. 注册/登录账号
2. 进入控制台 → API 管理
3. 创建新的 API Key
4. 复制并保存密钥（仅显示一次）

### 2. 配置环境变量

编辑项目根目录的 `.env` 文件：

```bash
# 切换到云服务模式
API_MODE=cloud

# 配置云服务 API Key
CLOUD_API_KEY=your-cloud-api-key-here

# 可选：自定义云服务端点（通常不需要修改）
CLOUD_API_ENDPOINT=https://api.life-kline.com/v1
```

### 3. 启动服务

```bash
npm run dev
```

启动后，系统会自动使用云服务进行 AI 分析。

## 定价说明

### 免费套餐

- **免费额度**：每月 100 次分析
- **功能限制**：基础功能完整可用
- **适用场景**：个人体验、轻度使用

### 标准套餐

- **价格**：¥29/月
- **分析次数**：1000 次/月
- **功能支持**：全部功能
- **技术支持**：邮件支持

### 专业套餐

- **价格**：¥99/月
- **分析次数**：5000 次/月
- **功能支持**：全部功能 + 优先体验新功能
- **技术支持**：优先邮件支持 + 工单系统

### 企业套餐

- **价格**：联系商务
- **分析次数**：自定义
- **功能支持**：全部功能 + 定制开发
- **技术支持**：专属客服 + SLA 保障

## API 配额管理

### 查看配额

在应用中可实时查看当前配额使用情况：

- 总配额
- 已使用
- 剩余次数
- 重置日期

### 配额重置

- 免费套餐：每月 1 日重置
- 付费套餐：按订阅日期每月重置

### 超额处理

配额用完后：

1. 免费套餐：自动暂停服务，可升级套餐
2. 付费套餐：可购买额外配额包

## API 限制

### 请求频率限制

| 套餐类型 | 每分钟请求数 | 并发请求数 |
|---------|------------|-----------|
| 免费套餐 | 10 次 | 2 |
| 标准套餐 | 30 次 | 5 |
| 专业套餐 | 100 次 | 10 |
| 企业套餐 | 自定义 | 自定义 |

### 请求超时

- 标准超时：120 秒
- 复杂分析：180 秒

### 响应大小

- 最大响应：5 MB
- 建议优化：控制在 1 MB 以内

## 安全性

### API Key 保护

- **加密传输**：所有请求使用 HTTPS
- **密钥轮换**：支持定期更换 API Key
- **访问控制**：可设置 IP 白名单（企业套餐）

### 数据隐私

- **数据加密**：静态数据 AES-256 加密
- **隐私保护**：用户数据不用于模型训练
- **合规认证**：符合 GDPR、等保 2.0 要求

## 错误码说明

### 认证错误

- `401 Unauthorized`：API Key 无效或过期
  - 解决方案：检查 API Key 是否正确，或重新申请

### 配额错误

- `402 Payment Required`：配额不足
  - 解决方案：升级套餐或购买额外配额

### 频率限制

- `429 Too Many Requests`：请求频率过高
  - 解决方案：降低请求频率，或升级套餐

### 服务错误

- `500 Internal Server Error`：服务内部错误
  - 解决方案：稍后重试，或联系技术支持

- `503 Service Unavailable`：服务暂时不可用
  - 解决方案：等待服务恢复，查看状态页面

## 技术支持

### 获取帮助

1. **文档中心**：[docs.life-kline.com](https://docs.life-kline.com)
2. **社区论坛**：[community.life-kline.com](https://community.life-kline.com)
3. **邮件支持**：support@life-kline.com
4. **工单系统**：仅限专业版及以上

### 服务状态

查看实时服务状态：[status.life-kline.com](https://status.life-kline.com)

### API 变更通知

- 重大变更：提前 30 天通知
- 功能更新：通过邮件通知
- 安全更新：即时通知

## 最佳实践

### 1. API Key 管理

```bash
# 不要将 API Key 提交到代码仓库
echo "CLOUD_API_KEY=your-key" >> .env

# 为不同环境使用不同的 Key
# 开发环境：development-key
# 生产环境：production-key
```

### 2. 错误处理

```javascript
try {
  const result = await analyzeWithCloud(payload);
} catch (error) {
  if (error.message.includes('配额不足')) {
    // 引导用户升级套餐
    showUpgradePrompt();
  } else if (error.message.includes('频率过高')) {
    // 实现请求队列
    queueRequest(payload);
  } else {
    // 其他错误
    logError(error);
  }
}
```

### 3. 缓存策略

```javascript
// 对相同输入进行缓存，避免重复请求
const cacheKey = computeHash(input);
const cached = await getCache(cacheKey);

if (cached) {
  return cached;
}

const result = await analyzeWithCloud(input);
await setCache(cacheKey, result, TTL);
```

### 4. 监控告警

- 配置配额告警：剩余 20% 时通知
- 监控错误率：超过 5% 时告警
- 跟踪响应时间：P95 超过 5s 时告警

## 常见问题

### Q1: 云服务和自托管可以切换吗？

**A:** 可以随时切换。只需修改 `.env` 中的 `API_MODE` 配置即可。

### Q2: 云服务支持哪些 AI 模型？

**A:** 云服务使用优化后的多模型组合，自动选择最佳模型，无需用户配置。

### Q3: 数据会存储在云端吗？

**A:** 分析请求会临时处理，结果返回后立即删除。不会长期存储用户数据。

### Q4: 云服务有地域限制吗？

**A:** 目前主要服务中国大陆地区，海外访问可能较慢，建议使用自托管模式。

### Q5: 如何申请发票？

**A:** 企业用户可在控制台 → 财务管理 → 申请发票。

## 联系我们

- **官方网站**：https://life-kline.com
- **技术文档**：https://docs.life-kline.com
- **商务合作**：business@life-kline.com
- **技术支持**：support@life-kline.com
- **GitHub**：https://github.com/miounet11/life-kline

---

更新时间：2025-12-22
文档版本：v1.0.0
