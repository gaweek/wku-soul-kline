/**
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
 * 生成时间: 2025-12-22T06:38:12.840Z
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
      const filename = `${key}.prompt.enc`;
      const decrypted = loadEncryptedPrompt(filename);
      this.cache[key] = decrypted;
      return decrypted;
    } catch (error) {
      console.error(`[PromptManager] 加载提示词失败: ${key}`, error.message);
      throw new Error(`提示词加载失败: ${key}`);
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
export const PROMPT_METADATA = {
  "COMMON_EXPERTISE": {
    "file": "COMMON_EXPERTISE.prompt.enc",
    "checksum": "7289dfc01234e9527f9974e6818bbcd20761de83237c601addf755b4da509922",
    "length": 546
  },
  "AGENT_CORE_PROMPT": {
    "file": "AGENT_CORE_PROMPT.prompt.enc",
    "checksum": "69b23068381ccf6fb6290ead235a1c2aee1b4f13d9cea54aa122eb41002e1636",
    "length": 2038
  },
  "AGENT_KLINE_PROMPT": {
    "file": "AGENT_KLINE_PROMPT.prompt.enc",
    "checksum": "342ac43ba460fdb0dc1a2a0082a005a030fbd73e3c28af40d50162abc127ef0f",
    "length": 1590
  },
  "AGENT_KLINE_PAST_PROMPT": {
    "file": "AGENT_KLINE_PAST_PROMPT.prompt.enc",
    "checksum": "5b33d6b66a243f1eadbb055f726206f42c0eb1c7aa62826845a732f1dd96b116",
    "length": 1267
  },
  "AGENT_KLINE_FUTURE_PROMPT": {
    "file": "AGENT_KLINE_FUTURE_PROMPT.prompt.enc",
    "checksum": "f0124dae48beafc69a0ca059e0298c763422cf3af19e43955a104c6336961407",
    "length": 1266
  },
  "AGENT_CAREER_PROMPT": {
    "file": "AGENT_CAREER_PROMPT.prompt.enc",
    "checksum": "50604bb1237b2ec93bd2c3210ceceda2eca31a95bded1659e110cff44203aae0",
    "length": 1594
  },
  "AGENT_MARRIAGE_PROMPT": {
    "file": "AGENT_MARRIAGE_PROMPT.prompt.enc",
    "checksum": "34685252108f2936bf2efd794dc1a85177b748e82e547910310467d11d96a0ea",
    "length": 1602
  },
  "AGENT_CRYPTO_PROMPT": {
    "file": "AGENT_CRYPTO_PROMPT.prompt.enc",
    "checksum": "94caacb3bbfaf5113d10dfffc2c28813fc99dbd00013f00eb5c555e3bf586526",
    "length": 1675
  },
  "AGENT_DAILY_FORTUNE_PROMPT": {
    "file": "AGENT_DAILY_FORTUNE_PROMPT.prompt.enc",
    "checksum": "edad8551c7757d816f745242dc3682947a96ceecf03bcdd6e1603d4e19822f58",
    "length": 3231
  },
  "AGENT_MONTHLY_KLINE_36_PROMPT": {
    "file": "AGENT_MONTHLY_KLINE_36_PROMPT.prompt.enc",
    "checksum": "3df881dc9cf100913c3127e9e8e07c7bd2c8e69c418cfff37c63fa91a43c44f7",
    "length": 1680
  },
  "AGENT_MONTHLY_KLINE_7_PROMPT": {
    "file": "AGENT_MONTHLY_KLINE_7_PROMPT.prompt.enc",
    "checksum": "36c7d0c8b81066e1bf967a6d3749b752806776e166cd6df4e35ea09b548ad18e",
    "length": 1407
  },
  "AGENT_DAILY_KLINE_61_PROMPT": {
    "file": "AGENT_DAILY_KLINE_61_PROMPT.prompt.enc",
    "checksum": "93c75a496eff0e995e7963b582f1a656bdab3fcf46b6761a08d768cb78ef8c29",
    "length": 1341
  },
  "AGENT_CELEBRITY_ANALYSIS_PROMPT": {
    "file": "AGENT_CELEBRITY_ANALYSIS_PROMPT.prompt.enc",
    "checksum": "72d041099edb60309cfa7d33da8c5fc3c42b63dc63247f8bd71bb2e064195ed2",
    "length": 2345
  }
};
