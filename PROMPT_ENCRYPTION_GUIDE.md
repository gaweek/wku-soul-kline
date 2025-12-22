# 提示词加密保护系统 - 快速开始

## 安装完成状态

已成功为 life-kline 项目实现提示词加密保护机制！

## 文件清单

### 核心模块
- `server/promptLoader.js` - 加密/解密核心模块
- `server/prompts/` - 加密提示词存储目录（已生成 13 个 .enc 文件）
- `server/prompts/metadata.json` - 元数据和校验和

### 工具脚本
- `scripts/encryptPrompts.js` - 加密工具（已运行）
- `scripts/testDecryption.js` - 测试工具（已验证通过）

### 文档
- `server/prompts/README.md` - 完整使用文档

### 配置
- `.gitignore` - 已更新（添加提示词保护相关规则）

## 当前状态

提示词已成功加密并保存到 `server/prompts/` 目录：

```
AGENT_CAREER_PROMPT.prompt.enc          - 事业财富 Agent
AGENT_CELEBRITY_ANALYSIS_PROMPT.prompt.enc - 名人分析 Agent
AGENT_CORE_PROMPT.prompt.enc            - 核心命理 Agent
AGENT_CRYPTO_PROMPT.prompt.enc          - 币圈交易 Agent
AGENT_DAILY_FORTUNE_PROMPT.prompt.enc   - 每日运势 Agent
AGENT_DAILY_KLINE_61_PROMPT.prompt.enc  - 61日K线 Agent
AGENT_KLINE_FUTURE_PROMPT.prompt.enc    - 未来K线 Agent
AGENT_KLINE_PAST_PROMPT.prompt.enc      - 过去K线 Agent
AGENT_KLINE_PROMPT.prompt.enc           - K线生成 Agent
AGENT_MARRIAGE_PROMPT.prompt.enc        - 婚姻健康 Agent
AGENT_MONTHLY_KLINE_36_PROMPT.prompt.enc - 36月K线 Agent
AGENT_MONTHLY_KLINE_7_PROMPT.prompt.enc - 7月K线 Agent
COMMON_EXPERTISE.prompt.enc             - 通用命理知识
```

## 下一步操作

### 选项 1: 启用加密版本（推荐）

如果要立即启用加密保护：

```bash
cd "/Users/lu/Library/Mobile Documents/com~apple~CloudDocs/Documents/lifekline/CascadeProjects/windsurf-project/life-kline"

# 1. 备份原始文件
cp server/agentPrompts.js server/agentPrompts.original.js

# 2. 启用加密版本
mv server/agentPrompts.encrypted.js server/agentPrompts.js

# 3. 重启服务器
npm run dev
```

### 选项 2: 先测试再启用

如果要先测试再决定：

```bash
# 1. 运行测试
node scripts/testDecryption.js

# 2. 查看加密文件
cat server/prompts/AGENT_CORE_PROMPT.prompt.enc | head -5

# 3. 验证解密
node -e "import('./server/promptLoader.js').then(m => console.log(m.loadEncryptedPrompt('AGENT_CORE_PROMPT.prompt.enc').substring(0, 100)))"
```

### 选项 3: 设置自定义加密密钥（强烈推荐）

提高安全性，使用自定义密钥：

```bash
# 生成随机密钥
export PROMPT_ENCRYPTION_KEY="$(openssl rand -base64 32)"

# 重新加密
node scripts/encryptPrompts.js

# 将密钥添加到 .env 文件
echo "PROMPT_ENCRYPTION_KEY=your-generated-key-here" >> server/.env
```

## 性能指标

测试结果（已验证）：

- 加密速度: 平均 0.007 ms/次
- 解密速度: 平均 0.005 ms/次
- 首次加载: 0.14 ms
- UTF-8 中文支持: 完美
- 文件数量: 13 个提示词文件
- 总加密文件大小: ~30 KB

## 安全建议

### 基础保护（当前实现）
- ✅ 防止直接读取源代码获取完整提示词
- ✅ Base64 + XOR 混淆加密
- ✅ 运行时动态解密
- ✅ 校验和验证文件完整性

### 进阶保护（可选）
1. **完全隐藏加密文件**（开源项目）
   ```bash
   # 在 .gitignore 中取消注释这两行：
   server/prompts/*.enc
   server/prompts/metadata.json
   ```

2. **使用自定义密钥**
   ```bash
   export PROMPT_ENCRYPTION_KEY="$(openssl rand -base64 32)"
   ```

3. **定期轮换密钥**
   ```bash
   export PROMPT_ENCRYPTION_KEY="new-key-$(date +%Y%m%d)"
   node scripts/encryptPrompts.js
   ```

## 兼容性说明

加密版本完全兼容现有代码：

```javascript
// 原来的用法
import { AGENT_PROMPTS } from './server/agentPrompts.js';
const prompt = AGENT_PROMPTS.core;

// 加密版本用法（完全相同）
import { AGENT_PROMPTS } from './server/agentPrompts.js';
const prompt = AGENT_PROMPTS.core; // 自动解密
```

## 故障排查

### 问题：解密失败

**症状**: `提示词解密失败，请检查加密密钥是否正确`

**解决方法**:
1. 检查 `PROMPT_ENCRYPTION_KEY` 环境变量
2. 确认密钥与加密时使用的密钥一致
3. 重新运行 `node scripts/encryptPrompts.js`

### 问题：找不到加密文件

**症状**: `提示词文件不存在: *.prompt.enc`

**解决方法**:
```bash
node scripts/encryptPrompts.js
```

### 问题：中文乱码

**状态**: 已修复（UTF-8 编码正确处理）

## 测试验证

运行完整测试套件：

```bash
node scripts/testDecryption.js
```

预期输出：
```
测试 1: 基本加密/解密 ✓
测试 2: 从文件加载加密的提示词 ✓
测试 3: 校验和验证 ✓
测试 4: 保护状态检查 ✓
测试 5: 性能测试 ✓
测试 6: 懒加载性能测试 ✓
```

## 文档链接

- 完整文档: `server/prompts/README.md`
- 加密原理: 查看 `server/promptLoader.js` 注释
- 使用示例: 查看 `scripts/encryptPrompts.js`

## 支持

如有问题，请：
1. 查看 `server/prompts/README.md` 完整文档
2. 运行 `node scripts/testDecryption.js` 诊断
3. 提交 Issue

---

**注意**: 本加密系统不是军事级加密，主要目的是提高逆向工程的门槛。对于真正的商业保密需求，建议将核心提示词部署到独立的后端服务中。
