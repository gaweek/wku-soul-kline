/**
 * 测试提示词加密/解密功能
 *
 * 使用方法：
 * node scripts/testDecryption.js
 */

import {
  encryptPrompt,
  decryptPrompt,
  loadEncryptedPrompt,
  getProtectionStatus,
  generateChecksum,
  verifyChecksum,
} from '../server/promptLoader.js';

console.log('🧪 开始测试提示词加密/解密功能\n');

// 测试 1: 基本加密/解密
console.log('测试 1: 基本加密/解密');
const testText = '你是一位精通命理的大师，擅长分析八字。';
const encrypted = encryptPrompt(testText);
const decrypted = decryptPrompt(encrypted);

console.log(`  原文: ${testText}`);
console.log(`  加密: ${encrypted.substring(0, 50)}...`);
console.log(`  解密: ${decrypted}`);
console.log(`  ✓ 测试通过: ${testText === decrypted ? '成功' : '失败'}\n`);

// 测试 2: 从文件加载
console.log('测试 2: 从文件加载加密的提示词');
try {
  const corePrompt = loadEncryptedPrompt('AGENT_CORE_PROMPT.prompt.enc');
  console.log(`  ✓ 成功加载 AGENT_CORE_PROMPT`);
  console.log(`  长度: ${corePrompt.length} 字符`);
  console.log(`  前100字符: ${corePrompt.substring(0, 100)}...\n`);
} catch (error) {
  console.log(`  ✗ 加载失败: ${error.message}\n`);
}

// 测试 3: 校验和验证
console.log('测试 3: 校验和验证');
const checksumTest = '测试内容';
const checksum1 = generateChecksum(checksumTest);
const checksum2 = generateChecksum(checksumTest);
const isValid = verifyChecksum(checksumTest, checksum1);

console.log(`  校验和 1: ${checksum1.substring(0, 16)}...`);
console.log(`  校验和 2: ${checksum2.substring(0, 16)}...`);
console.log(`  校验和一致: ${checksum1 === checksum2 ? '是' : '否'}`);
console.log(`  验证通过: ${isValid ? '是' : '否'}\n`);

// 测试 4: 保护状态检查
console.log('测试 4: 保护状态检查');
const status = getProtectionStatus();
console.log('  保护状态:', JSON.stringify(status, null, 2));
console.log('');

// 测试 5: 性能测试
console.log('测试 5: 性能测试');
const iterations = 1000;
const perfTestText = '这是一段用于性能测试的文本'.repeat(10);

const startEncrypt = performance.now();
for (let i = 0; i < iterations; i++) {
  encryptPrompt(perfTestText);
}
const encryptTime = performance.now() - startEncrypt;

const encryptedForPerf = encryptPrompt(perfTestText);
const startDecrypt = performance.now();
for (let i = 0; i < iterations; i++) {
  decryptPrompt(encryptedForPerf);
}
const decryptTime = performance.now() - startDecrypt;

console.log(`  加密 ${iterations} 次耗时: ${encryptTime.toFixed(2)} ms (平均 ${(encryptTime / iterations).toFixed(3)} ms/次)`);
console.log(`  解密 ${iterations} 次耗时: ${decryptTime.toFixed(2)} ms (平均 ${(decryptTime / iterations).toFixed(3)} ms/次)`);
console.log('');

// 测试 6: 懒加载测试（模拟实际使用）
console.log('测试 6: 懒加载性能测试');
const startLazy = performance.now();
const prompt1 = loadEncryptedPrompt('AGENT_CORE_PROMPT.prompt.enc');
const lazyTime1 = performance.now() - startLazy;

const startCached = performance.now();
const prompt2 = loadEncryptedPrompt('AGENT_CORE_PROMPT.prompt.enc');
const cachedTime = performance.now() - startCached;

console.log(`  首次加载耗时: ${lazyTime1.toFixed(2)} ms`);
console.log(`  再次加载耗时: ${cachedTime.toFixed(2)} ms (未使用缓存)`);
console.log(`  提示词长度: ${prompt1.length} 字符\n`);

// 总结
console.log('✨ 所有测试完成！\n');
console.log('📊 总结:');
console.log(`  - 加密状态: ${status.isProtected ? '已保护' : '未保护'}`);
console.log(`  - 加密文件数: ${status.encryptedPromptCount}`);
console.log(`  - 自定义密钥: ${status.hasCustomKey ? '是' : '否（使用默认密钥）'}`);
console.log(`  - 加密算法: ${status.encryptionAlgorithm}`);
console.log('');
console.log('💡 建议:');
if (!status.hasCustomKey) {
  console.log('  ⚠️  设置自定义加密密钥: export PROMPT_ENCRYPTION_KEY="your-secret-key"');
}
console.log('  📖 查看完整文档: server/prompts/README.md');
