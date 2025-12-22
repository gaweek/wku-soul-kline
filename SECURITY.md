# 安全政策

## 支持的版本

我们为以下版本提供安全更新：

| 版本 | 支持状态 |
| ------- | ------------------ |
| 1.x.x   | :white_check_mark: 支持 |
| < 1.0   | :x: 不再支持 |

---

## 报告安全漏洞

我们非常重视安全问题。如果你发现了安全漏洞，请负责任地披露。

### 不要

- **不要** 在公开的 GitHub Issues 中报告安全漏洞
- **不要** 在社交媒体、论坛等公开平台讨论漏洞
- **不要** 利用漏洞进行恶意活动

### 请这样做

1. **私密报告**
   - 通过 GitHub Security Advisories（推荐）
     - 访问 https://github.com/miounet11/life-kline/security/advisories
     - 点击 "Report a vulnerability"
   - 或发送邮件至项目维护者（如果有公开的安全邮箱）

2. **提供详细信息**

   请在报告中包含以下信息：

   ```markdown
   **漏洞类型**
   [如：SQL 注入、XSS、CSRF、权限提升等]

   **受影响版本**
   [具体版本号或版本范围]

   **漏洞描述**
   清晰描述漏洞的性质和潜在影响

   **复现步骤**
   1. 访问 ...
   2. 输入 ...
   3. 观察到 ...

   **概念验证（PoC）**
   [如果有，提供代码或截图]

   **影响范围**
   [数据泄露、系统破坏、权限绕过等]

   **建议修复方案**
   [如果你有想法]

   **你的信息（可选）**
   [如果你希望被致谢]
   ```

3. **等待回应**
   - 我们会在 48 小时内确认收到报告
   - 我们会在 7 天内提供初步评估
   - 我们会与你保持沟通，讨论修复方案

---

## 安全最佳实践

### 对于用户

#### 自托管部署

1. **保护环境变量**
   ```bash
   # 不要提交 .env 文件到版本控制
   # 确保 .env 在 .gitignore 中
   echo ".env" >> .gitignore
   ```

2. **使用强密钥**
   ```bash
   # JWT_SECRET 应该是强随机字符串
   JWT_SECRET=$(openssl rand -base64 32)

   # 管理员密码应该复杂且唯一
   ADMIN_VOUCHER_PASSWORD=<strong-password>
   ```

3. **HTTPS 部署**
   - 生产环境必须使用 HTTPS
   - 使用 Let's Encrypt 等免费证书
   - 配置 HSTS 头

4. **定期更新**
   ```bash
   # 定期检查更新
   npm outdated

   # 更新依赖
   npm update
   ```

5. **限制 API 访问**
   - 配置 CORS 白名单
   - 使用 API 速率限制
   - 监控异常请求

#### API 密钥管理

1. **保护 API 密钥**
   - 不要在客户端暴露 API 密钥
   - 使用环境变量存储
   - 定期轮换密钥

2. **最小权限原则**
   - API 密钥只授予必要权限
   - 使用专门的密钥用于本项目

3. **监控使用情况**
   - 定期检查 API 使用量
   - 设置使用限额和警告

### 对于开发者

#### 代码安全

1. **输入验证**
   ```javascript
   // ✅ 好的做法
   const validateBirthInfo = (data) => {
     if (!data.year || data.year < 1900 || data.year > 2100) {
       throw new Error('Invalid year')
     }
     // 验证所有输入...
   }

   // ❌ 不好的做法
   const process = (data) => {
     // 直接使用未验证的数据
     database.insert(data)
   }
   ```

2. **防止注入攻击**
   ```javascript
   // ✅ 使用参数化查询
   const user = db.prepare('SELECT * FROM users WHERE id = ?').get(userId)

   // ❌ 拼接 SQL
   const user = db.exec(`SELECT * FROM users WHERE id = ${userId}`)
   ```

3. **安全的密码处理**
   ```javascript
   // ✅ 使用 bcrypt
   const bcrypt = require('bcryptjs')
   const hashedPassword = await bcrypt.hash(password, 10)

   // ❌ 明文存储
   const password = user.password // 永远不要这样做
   ```

4. **防止 XSS**
   ```tsx
   // ✅ React 自动转义
   <div>{userInput}</div>

   // ❌ 使用 dangerouslySetInnerHTML
   <div dangerouslySetInnerHTML={{ __html: userInput }} />
   ```

5. **CSRF 保护**
   ```javascript
   // 使用 CSRF token
   // 验证请求来源
   ```

#### 依赖安全

1. **审计依赖**
   ```bash
   # 检查已知漏洞
   npm audit

   # 自动修复
   npm audit fix
   ```

2. **最小化依赖**
   - 只安装必要的包
   - 定期审查和清理未使用的依赖

3. **锁定版本**
   - 使用 `package-lock.json`
   - 谨慎升级主版本

---

## 已知安全考虑

### 1. API 密钥暴露风险

**风险：** 如果不当配置，API 密钥可能被暴露

**缓解措施：**
- API 密钥仅存储在服务器端
- 客户端通过后端代理调用 AI API
- 使用环境变量，从不硬编码

### 2. 用户数据隐私

**风险：** 出生信息属于敏感个人数据

**缓解措施：**
- 自托管模式下，数据完全本地存储
- 云服务模式下，数据加密传输和存储
- 用户可以删除自己的数据
- 不与第三方分享用户数据

### 3. AI 生成内容

**风险：** AI 可能生成不当或有害内容

**缓解措施：**
- 使用结构化的 prompt 模板
- 内容过滤和审核机制
- 明确的免责声明

### 4. 积分系统

**风险：** 积分系统可能被滥用

**缓解措施：**
- 速率限制
- 兑换券验证机制
- 审计日志

---

## 安全更新流程

当发现安全漏洞时，我们会：

1. **评估严重程度**
   - 严重：立即修复（24 小时内）
   - 高：快速修复（7 天内）
   - 中：正常修复（30 天内）
   - 低：计划修复

2. **开发修复方案**
   - 创建私有分支
   - 开发和测试修复
   - 准备安全公告

3. **发布更新**
   - 发布新版本
   - 发布安全公告
   - 通知用户更新

4. **公开披露**
   - 修复发布后 30 天
   - 或与报告者协商确定时间

---

## 安全公告订阅

获取安全更新：

1. **Watch 仓库**
   - 在 GitHub 上 Watch 本项目
   - 选择 "Releases only" 或 "All Activity"

2. **查看 Security Advisories**
   - https://github.com/miounet11/life-kline/security/advisories

3. **关注版本发布**
   - 查看 [Releases](https://github.com/miounet11/life-kline/releases)
   - 安全更新会标注为 "Security"

---

## 致谢

我们感谢负责任地报告安全问题的研究人员。如果你希望，我们会在修复发布后公开致谢你的贡献。

### 安全研究人员名单

*暂无*

---

## 联系方式

- **安全问题报告**: [GitHub Security Advisories](https://github.com/miounet11/life-kline/security/advisories)
- **一般问题**: [GitHub Issues](https://github.com/miounet11/life-kline/issues)

---

## PGP 公钥

*如果需要，可以在此提供 PGP 公钥用于加密通信*

---

<p align="center">
  <strong>感谢你帮助保护 Life-Kline 和我们的用户！</strong>
</p>

<p align="center">
  <a href="README.md">返回主页</a> •
  <a href="CONTRIBUTING.md">贡献指南</a> •
  <a href="CODE_OF_CONDUCT.md">行为准则</a>
</p>
