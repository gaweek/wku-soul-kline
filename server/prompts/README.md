# 提示词加密保护系统

## 概述

本系统为 life-kline 项目的核心业务逻辑（Agent 提示词）提供加密保护，防止直接读取完整的命理分析提示词。

## 加密策略

- **算法**: Base64 + XOR 混淆
- **密钥**: 通过环境变量 `PROMPT_ENCRYPTION_KEY` 设置
- **存储**: `server/prompts/` 目录下的 `.prompt.enc` 文件
- **强度**: 中等混淆级别（非军事级加密）

## 目录结构

```
server/
├── promptLoader.js          # 核心加密/解密模块
├── prompts/                 # 加密提示词存储目录
│   ├── *.prompt.enc         # 加密的提示词文件
│   └── metadata.json        # 元数据和校验和
├── agentPrompts.js          # 提示词接口（加密版本）
└── agentPrompts.original.js # 原始明文备份（不提交到Git）

scripts/
└── encryptPrompts.js        # 加密工具脚本
```

## 使用方法

### 1. 初次加密

```bash
# 设置自定义加密密钥（推荐）
export PROMPT_ENCRYPTION_KEY="your-super-secret-key-2025"

# 运行加密脚本
node scripts/encryptPrompts.js
```

这将：
1. 读取 `server/agentPrompts.js` 中的所有提示词
2. 使用 Base64 + XOR 加密每个提示词
3. 保存到 `server/prompts/*.prompt.enc` 文件
4. 生成新的 `server/agentPrompts.encrypted.js` 文件

### 2. 启用加密版本

```bash
# 备份原始文件
cp server/agentPrompts.js server/agentPrompts.original.js

# 启用加密版本
mv server/agentPrompts.encrypted.js server/agentPrompts.js
```

### 3. 在代码中使用

加密后的 `agentPrompts.js` 保持与原版本相同的接口：

```javascript
import { AGENT_PROMPTS } from './server/agentPrompts.js';

// 懒加载，运行时自动解密
const corePrompt = AGENT_PROMPTS.core;
const careerPrompt = AGENT_PROMPTS.career;
```

### 4. 环境变量配置

在 `.env` 文件中添加：

```bash
# 提示词加密密钥（可选，不设置则使用默认密钥）
PROMPT_ENCRYPTION_KEY=your-secret-key-here
```

## API 文档

### promptLoader.js 模块

#### 加密/解密函数

```javascript
import {
  encryptPrompt,
  decryptPrompt,
  loadEncryptedPrompt,
  saveEncryptedPrompt
} from './server/promptLoader.js';

// 加密文本
const encrypted = encryptPrompt('明文提示词');

// 解密文本
const plaintext = decryptPrompt(encrypted);

// 从文件加载并解密
const prompt = loadEncryptedPrompt('AGENT_CORE_PROMPT.prompt.enc');

// 加密并保存到文件
saveEncryptedPrompt('my_prompt.enc', '明文内容');
```

#### 关键词混淆（可选，额外保护层）

```javascript
import { obfuscateKeywords, deobfuscateKeywords } from './server/promptLoader.js';

// 混淆敏感关键词
const obfuscated = obfuscateKeywords('滴天髓和穷通宝鉴是经典命理著作');
// 输出: "CLASSIC_TEXT_01和CLASSIC_TEXT_02是经典命理著作"

// 还原关键词
const original = deobfuscateKeywords(obfuscated);
```

#### 完整性验证

```javascript
import { generateChecksum, verifyChecksum } from './server/promptLoader.js';

// 生成校验和
const checksum = generateChecksum('提示词内容');

// 验证完整性
const isValid = verifyChecksum('提示词内容', expectedChecksum);
```

#### 保护状态检查

```javascript
import { getProtectionStatus } from './server/promptLoader.js';

const status = getProtectionStatus();
console.log(status);
// {
//   isProtected: true,
//   hasCustomKey: true,
//   promptsDirectory: true,
//   encryptedPromptCount: 12,
//   encryptionAlgorithm: 'Base64 + XOR'
// }
```

## 安全建议

### 基础保护（当前实现）

- ✅ 防止直接读取源代码获取完整提示词
- ✅ 提高逆向工程的难度
- ✅ 使用自定义密钥增强保护

### 进阶保护（推荐）

1. **完全隐藏加密文件**

   在 `.gitignore` 中取消注释：
   ```gitignore
   server/prompts/*.enc
   server/prompts/metadata.json
   ```

2. **使用环境变量存储密钥**

   永远不要在代码中硬编码密钥，始终使用环境变量：
   ```bash
   export PROMPT_ENCRYPTION_KEY="$(openssl rand -base64 32)"
   ```

3. **部署到独立服务**

   真正的保护是将核心提示词部署到独立的后端 API 服务中：
   ```javascript
   // 客户端只调用 API，不存储提示词
   const prompt = await fetch('https://api.your-domain.com/prompt/core', {
     headers: { 'Authorization': 'Bearer YOUR_TOKEN' }
   }).then(r => r.text());
   ```

4. **定期轮换密钥**

   定期更换加密密钥并重新加密：
   ```bash
   export PROMPT_ENCRYPTION_KEY="new-key-$(date +%Y%m%d)"
   node scripts/encryptPrompts.js
   ```

## 开源版本策略

如果要开源 life-kline 项目，建议：

1. **提供简化版提示词**

   创建 `agentPrompts.opensource.js`，包含基础版本的提示词

2. **分离商业版和开源版**

   ```
   server/
   ├── agentPrompts.opensource.js   # 开源版（提交到Git）
   ├── agentPrompts.commercial.js   # 商业版（不提交）
   └── prompts/                      # 加密文件（不提交）
   ```

3. **文档中说明差异**

   在 README 中明确说明开源版和商业版的区别

## 性能优化

### 懒加载 + 缓存

加密版本使用懒加载策略，只在首次访问时解密：

```javascript
// 第一次访问：解密并缓存
const prompt1 = AGENT_PROMPTS.core; // 解密，耗时约 1-2ms

// 后续访问：直接从缓存读取
const prompt2 = AGENT_PROMPTS.core; // 缓存命中，耗时 < 0.1ms
```

### 清除缓存

在需要热重载时：

```javascript
import { AGENT_PROMPTS } from './server/agentPrompts.js';

// 清除缓存，强制重新加载
AGENT_PROMPTS.clearCache?.();
```

## 故障排查

### 问题：解密失败

**错误信息**：
```
[PromptLoader] 解密失败: ...
提示词解密失败，请检查加密密钥是否正确
```

**解决方法**：
1. 检查 `PROMPT_ENCRYPTION_KEY` 环境变量是否设置
2. 确认密钥与加密时使用的密钥一致
3. 验证 `.prompt.enc` 文件是否完整

### 问题：找不到提示词文件

**错误信息**：
```
[PromptLoader] 加载提示词失败: AGENT_CORE_PROMPT
提示词文件不存在: AGENT_CORE_PROMPT.prompt.enc
```

**解决方法**：
1. 运行 `node scripts/encryptPrompts.js` 生成加密文件
2. 检查 `server/prompts/` 目录是否存在
3. 确认文件权限正确

### 问题：校验和不匹配

**原因**：
提示词文件可能被篡改或损坏

**解决方法**：
重新运行加密脚本生成新的加密文件

## 许可证

本加密系统是 life-kline 项目的一部分，遵循项目的主许可证。

## 贡献

如果要改进加密系统，请：
1. Fork 项目
2. 创建功能分支
3. 提交 Pull Request

## 联系方式

如有问题，请提交 Issue 或联系项目维护者。

---

**注意**：本加密系统不是军事级加密，主要目的是提高逆向工程的门槛。对于真正的商业保密需求，请考虑将核心提示词部署到独立的后端服务中。
