/**
 * 批量生成名人案例分析
 *
 * 功能：
 * 1. 获取所有名人案例（约25个）
 * 2. 为缺少分析的案例生成LLM分析
 * 3. 异步执行，支持并发控制
 * 4. 保存结果到数据库
 *
 * 使用方法：
 * node scripts/batchGenerateCelebrityAnalysis.js [--force] [--concurrency=N]
 *
 * 参数：
 * --force       强制重新生成所有分析
 * --concurrency=N  并发数量（默认2，避免API限流）
 * --id=xxx      只生成指定ID的案例
 */

import { fileURLToPath } from 'url';
import path from 'path';
import {
  getCelebrityCases,
  getCelebrityCaseById,
  getDb,
} from '../server/database.js';
import { generateCelebrityAnalysis } from '../server/celebrityAnalyzer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 解析命令行参数
const args = process.argv.slice(2);
const FORCE_REGENERATE = args.includes('--force');
const CONCURRENCY = parseInt(args.find(a => a.startsWith('--concurrency='))?.split('=')[1] || '2');
const SPECIFIC_ID = args.find(a => a.startsWith('--id='))?.split('=')[1];

// 延迟函数
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// 进度显示
let completed = 0;
let failed = 0;
let skipped = 0;
let total = 0;

function printProgress() {
  const progress = Math.round((completed + failed + skipped) / total * 100);
  console.log(`\n[进度] ${progress}% | 完成: ${completed} | 失败: ${failed} | 跳过: ${skipped} | 总计: ${total}`);
}

/**
 * 保存分析结果到数据库
 */
function saveAnalysisToDb(id, analysisResult) {
  const db = getDb();
  const updateStmt = db.prepare(`
    UPDATE celebrity_cases
    SET analysis_data = ?,
        scores = ?,
        financial_data = ?,
        honors = ?,
        analysis_generated_at = ?,
        analysis_version = COALESCE(analysis_version, 0) + 1
    WHERE id = ?
  `);

  updateStmt.run(
    JSON.stringify(analysisResult.analysisData),
    JSON.stringify(analysisResult.scores),
    JSON.stringify(analysisResult.financialData || null),
    JSON.stringify(analysisResult.honors || []),
    analysisResult.generatedAt,
    id
  );
}

/**
 * 处理单个名人案例
 */
async function processCelebrityCase(celebrity, index) {
  const { id, name_cn, name, category, analysis_data } = celebrity;
  const displayName = name_cn || name;

  console.log(`\n[${index + 1}/${total}] 处理: ${displayName} (${id})`);
  console.log(`    类别: ${celebrity.category_cn || category}`);

  // 检查是否需要生成
  if (analysis_data && !FORCE_REGENERATE) {
    console.log(`    ✓ 已有分析数据，跳过`);
    skipped++;
    return { success: true, skipped: true };
  }

  if (FORCE_REGENERATE && analysis_data) {
    console.log(`    ⟳ 强制重新生成...`);
  } else {
    console.log(`    ⚡ 开始生成分析...`);
  }

  const startTime = Date.now();

  try {
    // 获取完整的案例数据
    const fullCase = getCelebrityCaseById(id);
    if (!fullCase) {
      console.log(`    ✗ 案例不存在`);
      failed++;
      return { success: false, error: '案例不存在' };
    }

    // 调用LLM生成分析
    const analysisResult = await generateCelebrityAnalysis(fullCase);

    if (!analysisResult.success) {
      console.log(`    ✗ 生成失败: ${analysisResult.error}`);
      failed++;
      return { success: false, error: analysisResult.error };
    }

    // 保存到数据库
    saveAnalysisToDb(id, analysisResult);

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`    ✓ 生成成功 (${elapsed}s, 模型: ${analysisResult.model})`);

    // 打印分析摘要
    if (analysisResult.analysisData?.summary) {
      const summary = analysisResult.analysisData.summary.substring(0, 100);
      console.log(`    📝 摘要: ${summary}...`);
    }

    if (analysisResult.scores) {
      console.log(`    📊 评分: 综合${analysisResult.scores.overall} | 性格${analysisResult.scores.personality} | 事业${analysisResult.scores.career}`);
    }

    completed++;
    return { success: true, elapsed, model: analysisResult.model };

  } catch (error) {
    console.log(`    ✗ 异常: ${error.message}`);
    failed++;
    return { success: false, error: error.message };
  }
}

/**
 * 并发控制的批量处理
 */
async function processWithConcurrency(cases, concurrency) {
  const results = [];

  for (let i = 0; i < cases.length; i += concurrency) {
    const batch = cases.slice(i, i + concurrency);
    const batchPromises = batch.map((c, idx) => processCelebrityCase(c, i + idx));

    const batchResults = await Promise.all(batchPromises);
    results.push(...batchResults);

    // 打印进度
    printProgress();

    // 批次间延迟，避免API限流
    if (i + concurrency < cases.length) {
      console.log(`\n[等待] 批次间隔 3 秒...`);
      await delay(3000);
    }
  }

  return results;
}

/**
 * 主函数
 */
async function main() {
  console.log('═'.repeat(60));
  console.log('  名人案例分析批量生成脚本');
  console.log('═'.repeat(60));
  console.log(`配置:`);
  console.log(`  - 强制重新生成: ${FORCE_REGENERATE ? '是' : '否'}`);
  console.log(`  - 并发数量: ${CONCURRENCY}`);
  if (SPECIFIC_ID) {
    console.log(`  - 指定ID: ${SPECIFIC_ID}`);
  }
  console.log('');

  // 获取所有名人案例
  let cases;
  if (SPECIFIC_ID) {
    const specificCase = getCelebrityCaseById(SPECIFIC_ID);
    if (!specificCase) {
      console.error(`错误: 找不到ID为 ${SPECIFIC_ID} 的案例`);
      process.exit(1);
    }
    cases = [specificCase];
  } else {
    // 获取所有案例（不分页）
    cases = getCelebrityCases(null, 100, 0);
  }

  total = cases.length;
  console.log(`找到 ${total} 个名人案例`);

  // 按类别分组统计
  const categories = {};
  cases.forEach(c => {
    const cat = c.category_cn || c.category;
    categories[cat] = (categories[cat] || 0) + 1;
  });
  console.log('\n类别分布:');
  Object.entries(categories).forEach(([cat, count]) => {
    console.log(`  - ${cat}: ${count} 个`);
  });

  // 统计已有分析的数量
  const withAnalysis = cases.filter(c => c.analysis_data).length;
  const withoutAnalysis = total - withAnalysis;
  console.log(`\n分析状态:`);
  console.log(`  - 已有分析: ${withAnalysis} 个`);
  console.log(`  - 需要生成: ${withoutAnalysis} 个`);

  if (!FORCE_REGENERATE && withoutAnalysis === 0) {
    console.log('\n✓ 所有案例都已有分析数据，无需生成');
    console.log('  提示: 使用 --force 参数可强制重新生成');
    process.exit(0);
  }

  console.log('\n' + '─'.repeat(60));
  console.log('开始生成...');
  console.log('─'.repeat(60));

  const startTime = Date.now();

  // 开始批量处理
  await processWithConcurrency(cases, CONCURRENCY);

  const totalElapsed = ((Date.now() - startTime) / 1000).toFixed(1);

  // 最终报告
  console.log('\n' + '═'.repeat(60));
  console.log('  生成完成');
  console.log('═'.repeat(60));
  console.log(`总耗时: ${totalElapsed} 秒`);
  console.log(`结果:`);
  console.log(`  ✓ 成功: ${completed} 个`);
  console.log(`  ✗ 失败: ${failed} 个`);
  console.log(`  ⊖ 跳过: ${skipped} 个`);
  console.log('═'.repeat(60));

  if (failed > 0) {
    console.log('\n⚠️ 部分案例生成失败，请检查日志后重试');
    process.exit(1);
  }
}

// 执行
main().catch(error => {
  console.error('脚本执行失败:', error);
  process.exit(1);
});
