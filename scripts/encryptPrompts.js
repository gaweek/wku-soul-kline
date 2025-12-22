/**
 * 提示词加密工具脚本
 *
 * 用途：
 * 1. 将 agentPrompts.js 中的明文提示词加密
 * 2. 保存到 server/prompts/ 目录
 * 3. 生成新的 agentPrompts.js（使用加密版本）
 *
 * 使用方法：
 * node scripts/encryptPrompts.js
 *
 * 环境变量：
 * PROMPT_ENCRYPTION_KEY - 自定义加密密钥（可选）
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  encryptPrompt,
  saveEncryptedPrompt,
  generateChecksum,
} from '../server/promptLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 导入原始提示词
const PROMPTS_SOURCE = path.join(__dirname, '../server/agentPrompts.js');
const PROMPTS_DIR = path.join(__dirname, '../server/prompts');
const OUTPUT_FILE = path.join(__dirname, '../server/agentPrompts.encrypted.js');

/**
 * 从 agentPrompts.js 提取所有提示词
 */
async function extractPrompts() {
  console.log('📖 正在读取原始提示词文件...');

  // 动态导入
  const module = await import(PROMPTS_SOURCE);

  const prompts = {
    COMMON_EXPERTISE: extractPromptContent(PROMPTS_SOURCE, 'COMMON_EXPERTISE'),
    AGENT_CORE_PROMPT: module.AGENT_CORE_PROMPT,
    AGENT_KLINE_PROMPT: module.AGENT_KLINE_PROMPT,
    AGENT_KLINE_PAST_PROMPT: module.AGENT_KLINE_PAST_PROMPT,
    AGENT_KLINE_FUTURE_PROMPT: module.AGENT_KLINE_FUTURE_PROMPT,
    AGENT_CAREER_PROMPT: module.AGENT_CAREER_PROMPT,
    AGENT_MARRIAGE_PROMPT: module.AGENT_MARRIAGE_PROMPT,
    AGENT_CRYPTO_PROMPT: module.AGENT_CRYPTO_PROMPT,
    AGENT_DAILY_FORTUNE_PROMPT: module.AGENT_DAILY_FORTUNE_PROMPT,
    AGENT_MONTHLY_KLINE_36_PROMPT: module.AGENT_MONTHLY_KLINE_36_PROMPT,
    AGENT_MONTHLY_KLINE_7_PROMPT: module.AGENT_MONTHLY_KLINE_7_PROMPT,
    AGENT_DAILY_KLINE_61_PROMPT: module.AGENT_DAILY_KLINE_61_PROMPT,
    AGENT_CELEBRITY_ANALYSIS_PROMPT: module.AGENT_CELEBRITY_ANALYSIS_PROMPT,
  };

  console.log(`✅ 成功提取 ${Object.keys(prompts).length} 个提示词`);
  return prompts;
}

/**
 * 从文件中提取特定常量的内容
 */
function extractPromptContent(filePath, constantName) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const regex = new RegExp(`const ${constantName} = \`([\\s\\S]*?)\`;`, 'm');
  const match = content.match(regex);

  if (match && match[1]) {
    return match[1];
  }

  throw new Error(`无法提取 ${constantName} 的内容`);
}

/**
 * 加密所有提示词并保存到文件
 */
async function encryptAndSavePrompts(prompts) {
  console.log('\n🔐 开始加密提示词...');

  // 确保目录存在
  if (!fs.existsSync(PROMPTS_DIR)) {
    fs.mkdirSync(PROMPTS_DIR, { recursive: true });
    console.log(`📁 创建提示词目录: ${PROMPTS_DIR}`);
  }

  const encryptedData = {};
  const checksums = {};

  for (const [key, plaintext] of Object.entries(prompts)) {
    const filename = `${key}.prompt.enc`;

    // 加密并保存
    saveEncryptedPrompt(filename, plaintext);

    // 生成校验和
    const checksum = generateChecksum(plaintext);
    checksums[key] = checksum;

    // 记录加密后的数据（用于生成新的 agentPrompts.js）
    encryptedData[key] = {
      file: filename,
      checksum,
      length: plaintext.length,
    };

    console.log(`  ✓ ${key} - ${plaintext.length} 字符 - ${checksum.substring(0, 8)}...`);
  }

  // 保存元数据
  const metadataPath = path.join(PROMPTS_DIR, 'metadata.json');
  fs.writeFileSync(
    metadataPath,
    JSON.stringify(
      {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        prompts: encryptedData,
        checksums,
      },
      null,
      2
    )
  );

  console.log(`\n📋 元数据已保存: ${metadataPath}`);
  return encryptedData;
}

/**
 * 生成新的 agentPrompts.js 文件（使用加密版本）
 */
function generateEncryptedAgentPrompts(encryptedData) {
  console.log('\n📝 生成加密版本的 agentPrompts.js...');

  const template = `/**
 * 5个专业Agent的系统提示词 - 加密版本
 *
 * 【重要说明】
 * 本文件中的提示词已经过加密处理，防止直接读取核心业务逻辑。
 *
 * 加密策略：
 * - 算法: Base64 + XOR 混淆
 * - 密钥: 通过环境变量 PROMPT_ENCRYPTION_KEY 设置
 * - 存储: server/prompts/ 目录下的 .prompt.enc 文件
 *
 * 解密方法：
 * import { loadEncryptedPrompt } from './promptLoader.js';
 * const prompt = loadEncryptedPrompt('AGENT_CORE_PROMPT.prompt.enc');
 *
 * 安全性：
 * 这不是军事级加密，而是提高逆向工程的难度。
 * 真正的保护应该是将核心提示词放在独立的后端API服务中。
 *
 * 生成时间: ${new Date().toISOString()}
 */

import { loadEncryptedPrompt, decryptPrompt } from './promptLoader.js';

/**
 * 懒加载提示词（运行时解密）
 */
class PromptManager {
  constructor() {
    this.cache = {};
  }

  /**
   * 获取解密后的提示词
   * @param {string} key - 提示词键名
   * @returns {string} - 解密后的提示词
   */
  getPrompt(key) {
    // 使用缓存避免重复解密
    if (this.cache[key]) {
      return this.cache[key];
    }

    try {
      const filename = \`\${key}.prompt.enc\`;
      const decrypted = loadEncryptedPrompt(filename);
      this.cache[key] = decrypted;
      return decrypted;
    } catch (error) {
      console.error(\`[PromptManager] 加载提示词失败: \${key}\`, error.message);
      throw new Error(\`提示词加载失败: \${key}\`);
    }
  }

  /**
   * 清除缓存（用于热重载）
   */
  clearCache() {
    this.cache = {};
  }
}

// 单例模式
const promptManager = new PromptManager();

/**
 * 导出的提示词（懒加载）
 */
export const AGENT_PROMPTS = {
  get core() {
    return promptManager.getPrompt('AGENT_CORE_PROMPT');
  },
  get kline() {
    return promptManager.getPrompt('AGENT_KLINE_PROMPT');
  },
  get kline_past() {
    return promptManager.getPrompt('AGENT_KLINE_PAST_PROMPT');
  },
  get kline_future() {
    return promptManager.getPrompt('AGENT_KLINE_FUTURE_PROMPT');
  },
  get career() {
    return promptManager.getPrompt('AGENT_CAREER_PROMPT');
  },
  get marriage() {
    return promptManager.getPrompt('AGENT_MARRIAGE_PROMPT');
  },
  get crypto() {
    return promptManager.getPrompt('AGENT_CRYPTO_PROMPT');
  },
  get dailyFortune() {
    return promptManager.getPrompt('AGENT_DAILY_FORTUNE_PROMPT');
  },
  get monthlyKLine36() {
    return promptManager.getPrompt('AGENT_MONTHLY_KLINE_36_PROMPT');
  },
  get monthlyKLine7() {
    return promptManager.getPrompt('AGENT_MONTHLY_KLINE_7_PROMPT');
  },
  get dailyKLine61() {
    return promptManager.getPrompt('AGENT_DAILY_KLINE_61_PROMPT');
  },
  get celebrity() {
    return promptManager.getPrompt('AGENT_CELEBRITY_ANALYSIS_PROMPT');
  },
};

/**
 * 兼容性导出（保持与原 agentPrompts.js 相同的接口）
 */
export const AGENT_CORE_PROMPT = () => AGENT_PROMPTS.core;
export const AGENT_KLINE_PROMPT = () => AGENT_PROMPTS.kline;
export const AGENT_KLINE_PAST_PROMPT = () => AGENT_PROMPTS.kline_past;
export const AGENT_KLINE_FUTURE_PROMPT = () => AGENT_PROMPTS.kline_future;
export const AGENT_CAREER_PROMPT = () => AGENT_PROMPTS.career;
export const AGENT_MARRIAGE_PROMPT = () => AGENT_PROMPTS.marriage;
export const AGENT_CRYPTO_PROMPT = () => AGENT_PROMPTS.crypto;
export const AGENT_DAILY_FORTUNE_PROMPT = () => AGENT_PROMPTS.dailyFortune;
export const AGENT_MONTHLY_KLINE_36_PROMPT = () => AGENT_PROMPTS.monthlyKLine36;
export const AGENT_MONTHLY_KLINE_7_PROMPT = () => AGENT_PROMPTS.monthlyKLine7;
export const AGENT_DAILY_KLINE_61_PROMPT = () => AGENT_PROMPTS.dailyKLine61;
export const AGENT_CELEBRITY_ANALYSIS_PROMPT = () => AGENT_PROMPTS.celebrity;

export default AGENT_PROMPTS;

/**
 * 元数据
 */
export const PROMPT_METADATA = ${JSON.stringify(encryptedData, null, 2)};
`;

  fs.writeFileSync(OUTPUT_FILE, template, 'utf-8');
  console.log(`✅ 加密版本已保存: ${OUTPUT_FILE}`);
  console.log('\n⚠️  请手动将以下文件重命名以启用加密保护:');
  console.log(`   mv "${OUTPUT_FILE}" "${PROMPTS_SOURCE}"`);
  console.log('\n💡 建议:');
  console.log('   1. 备份原始的 agentPrompts.js 文件');
  console.log('   2. 将原始文件重命名为 agentPrompts.original.js');
  console.log('   3. 在 .gitignore 中添加 server/prompts/*.enc（如果要完全保密）');
}

/**
 * 主函数
 */
async function main() {
  console.log('🚀 开始提示词加密流程\n');

  try {
    // 检查加密密钥
    const hasCustomKey = !!process.env.PROMPT_ENCRYPTION_KEY;
    if (!hasCustomKey) {
      console.log('⚠️  未设置自定义加密密钥，将使用默认密钥');
      console.log('   建议设置环境变量: export PROMPT_ENCRYPTION_KEY="your-secret-key"\n');
    } else {
      console.log('✅ 检测到自定义加密密钥\n');
    }

    // 步骤1: 提取提示词
    const prompts = await extractPrompts();

    // 步骤2: 加密并保存
    const encryptedData = await encryptAndSavePrompts(prompts);

    // 步骤3: 生成新的 agentPrompts.js
    generateEncryptedAgentPrompts(encryptedData);

    console.log('\n✨ 加密完成！\n');
  } catch (error) {
    console.error('❌ 加密失败:', error.message);
    console.error(error.stack);
    process.exit(1);
  }
}

// 运行
main();
