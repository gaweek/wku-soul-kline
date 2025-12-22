/**
 * 提示词加载器 - 核心业务逻辑保护模块
 *
 * 功能：
 * 1. 提示词加密/解密
 * 2. 运行时动态加载
 * 3. 防止直接读取完整提示词
 *
 * 安全策略：
 * - Base64 + XOR 混淆加密（非强加密，但防止直接阅读）
 * - 关键词混淆处理
 * - 密钥存储在环境变量中
 * - 支持分段加密
 *
 * 注意：
 * 这不是军事级加密，主要目的是提高获取提示词的门槛
 * 真正的保护应该是将核心提示词放在独立的后端API服务中
 */

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 获取加密密钥
 * 优先级：环境变量 > 默认密钥
 */
function getEncryptionKey() {
  const envKey = process.env.PROMPT_ENCRYPTION_KEY;
  if (envKey) {
    return envKey;
  }

  // 默认密钥 - 建议在生产环境中通过环境变量覆盖
  const defaultKey = 'life-kline-2025-destiny-ai';

  // 开发环境下警告
  if (process.env.NODE_ENV !== 'production') {
    console.warn('[PromptLoader] 警告: 正在使用默认加密密钥，建议设置 PROMPT_ENCRYPTION_KEY 环境变量');
  }

  return defaultKey;
}

/**
 * XOR 加密/解密
 * @param {Buffer} buffer - 要加密/解密的 Buffer
 * @param {string} key - 密钥
 * @returns {Buffer} - 加密/解密后的 Buffer
 */
function xorEncryptDecrypt(buffer, key) {
  const keyBuffer = Buffer.from(key, 'utf-8');
  const keyLength = keyBuffer.length;
  const result = Buffer.alloc(buffer.length);

  for (let i = 0; i < buffer.length; i++) {
    result[i] = buffer[i] ^ keyBuffer[i % keyLength];
  }

  return result;
}

/**
 * 加密提示词
 * @param {string} plaintext - 明文提示词
 * @returns {string} - Base64 编码的加密文本
 */
export function encryptPrompt(plaintext) {
  const key = getEncryptionKey();

  // 步骤1: 转换为 Buffer
  const plaintextBuffer = Buffer.from(plaintext, 'utf-8');

  // 步骤2: XOR 加密
  const xorEncrypted = xorEncryptDecrypt(plaintextBuffer, key);

  // 步骤3: Base64 编码
  const base64Encoded = xorEncrypted.toString('base64');

  return base64Encoded;
}

/**
 * 解密提示词
 * @param {string} encrypted - 加密的提示词（Base64 编码）
 * @returns {string} - 明文提示词
 */
export function decryptPrompt(encrypted) {
  try {
    const key = getEncryptionKey();

    // 步骤1: Base64 解码
    const encryptedBuffer = Buffer.from(encrypted, 'base64');

    // 步骤2: XOR 解密
    const decryptedBuffer = xorEncryptDecrypt(encryptedBuffer, key);

    // 步骤3: 转换为字符串
    const plaintext = decryptedBuffer.toString('utf-8');

    return plaintext;
  } catch (error) {
    console.error('[PromptLoader] 解密失败:', error.message);
    throw new Error('提示词解密失败，请检查加密密钥是否正确');
  }
}

/**
 * 简单的 Base64 编码（用于不需要 XOR 的场景）
 * @param {string} text - 明文
 * @returns {string} - Base64 编码
 */
export function encodePrompt(text) {
  return Buffer.from(text, 'utf-8').toString('base64');
}

/**
 * 简单的 Base64 解码
 * @param {string} encoded - Base64 编码
 * @returns {string} - 明文
 */
export function decodePrompt(encoded) {
  return Buffer.from(encoded, 'base64').toString('utf-8');
}

/**
 * 从文件加载加密的提示词
 * @param {string} filename - 文件名（相对于 server/prompts/ 目录）
 * @returns {string} - 解密后的提示词
 */
export function loadEncryptedPrompt(filename) {
  try {
    const promptsDir = path.join(__dirname, 'prompts');
    const filePath = path.join(promptsDir, filename);

    if (!fs.existsSync(filePath)) {
      throw new Error(`提示词文件不存在: ${filename}`);
    }

    const encrypted = fs.readFileSync(filePath, 'utf-8').trim();
    return decryptPrompt(encrypted);
  } catch (error) {
    console.error(`[PromptLoader] 加载提示词失败: ${filename}`, error.message);
    throw error;
  }
}

/**
 * 保存加密的提示词到文件
 * @param {string} filename - 文件名
 * @param {string} plaintext - 明文提示词
 */
export function saveEncryptedPrompt(filename, plaintext) {
  try {
    const promptsDir = path.join(__dirname, 'prompts');

    // 确保目录存在
    if (!fs.existsSync(promptsDir)) {
      fs.mkdirSync(promptsDir, { recursive: true });
    }

    const filePath = path.join(promptsDir, filename);
    const encrypted = encryptPrompt(plaintext);

    fs.writeFileSync(filePath, encrypted, 'utf-8');
    console.log(`[PromptLoader] 提示词已加密保存: ${filename}`);
  } catch (error) {
    console.error(`[PromptLoader] 保存提示词失败: ${filename}`, error.message);
    throw error;
  }
}

/**
 * 关键词混淆映射表
 * 用于替换提示词中的敏感关键词
 */
const KEYWORD_OBFUSCATION_MAP = {
  '滴天髓': 'CLASSIC_TEXT_01',
  '穷通宝鉴': 'CLASSIC_TEXT_02',
  '子平真诠': 'CLASSIC_TEXT_03',
  '三命通会': 'CLASSIC_TEXT_04',
  '渊海子平': 'CLASSIC_TEXT_05',
  '神峰通考': 'CLASSIC_TEXT_06',
  '用神': 'KEY_ELEMENT',
  '十神': 'TEN_GODS',
  '大运': 'MAJOR_CYCLE',
  '流年': 'YEARLY_CYCLE',
};

/**
 * 混淆提示词中的关键词（可选，额外保护）
 * @param {string} text - 原始文本
 * @returns {string} - 混淆后的文本
 */
export function obfuscateKeywords(text) {
  let obfuscated = text;

  for (const [keyword, code] of Object.entries(KEYWORD_OBFUSCATION_MAP)) {
    obfuscated = obfuscated.replaceAll(keyword, code);
  }

  return obfuscated;
}

/**
 * 还原混淆的关键词
 * @param {string} text - 混淆后的文本
 * @returns {string} - 原始文本
 */
export function deobfuscateKeywords(text) {
  let deobfuscated = text;

  for (const [keyword, code] of Object.entries(KEYWORD_OBFUSCATION_MAP)) {
    deobfuscated = deobfuscated.replaceAll(code, keyword);
  }

  return deobfuscated;
}

/**
 * 生成提示词文件的校验和（用于验证完整性）
 * @param {string} content - 提示词内容
 * @returns {string} - SHA256 校验和
 */
export function generateChecksum(content) {
  return crypto.createHash('sha256').update(content, 'utf8').digest('hex');
}

/**
 * 验证提示词完整性
 * @param {string} content - 提示词内容
 * @param {string} expectedChecksum - 期望的校验和
 * @returns {boolean}
 */
export function verifyChecksum(content, expectedChecksum) {
  const actualChecksum = generateChecksum(content);
  return actualChecksum === expectedChecksum;
}

/**
 * 批量加密提示词
 * @param {Object} prompts - 提示词对象 { key: plaintext }
 * @returns {Object} - 加密后的提示词对象 { key: encrypted }
 */
export function encryptPrompts(prompts) {
  const encrypted = {};

  for (const [key, plaintext] of Object.entries(prompts)) {
    encrypted[key] = encryptPrompt(plaintext);
  }

  return encrypted;
}

/**
 * 批量解密提示词
 * @param {Object} prompts - 加密的提示词对象 { key: encrypted }
 * @returns {Object} - 解密后的提示词对象 { key: plaintext }
 */
export function decryptPrompts(prompts) {
  const decrypted = {};

  for (const [key, encrypted] of Object.entries(prompts)) {
    decrypted[key] = decryptPrompt(encrypted);
  }

  return decrypted;
}

/**
 * 提示词保护状态检查
 */
export function getProtectionStatus() {
  const promptsDir = path.join(__dirname, 'prompts');
  const hasCustomKey = !!process.env.PROMPT_ENCRYPTION_KEY;
  const promptsExist = fs.existsSync(promptsDir);

  let encryptedCount = 0;
  if (promptsExist) {
    const files = fs.readdirSync(promptsDir);
    encryptedCount = files.filter(f => f.endsWith('.enc') || f.endsWith('.prompt')).length;
  }

  return {
    isProtected: hasCustomKey && encryptedCount > 0,
    hasCustomKey,
    promptsDirectory: promptsExist,
    encryptedPromptCount: encryptedCount,
    encryptionAlgorithm: 'Base64 + XOR',
  };
}

export default {
  encryptPrompt,
  decryptPrompt,
  encodePrompt,
  decodePrompt,
  loadEncryptedPrompt,
  saveEncryptedPrompt,
  obfuscateKeywords,
  deobfuscateKeywords,
  generateChecksum,
  verifyChecksum,
  encryptPrompts,
  decryptPrompts,
  getProtectionStatus,
};
