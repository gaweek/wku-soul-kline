/**
 * 知识内容调度器 (长期运行)
 *
 * 功能：
 * 1. 定时触发内容生成
 * 2. 按阶段自动调整生成频率
 * 3. 自动重试失败任务
 * 4. 日志记录与状态报告
 *
 * 使用方法：
 * nohup node scripts/knowledgeContentScheduler.js > logs/knowledge_scheduler.log 2>&1 &
 *
 * 调度规则：
 * - 第1-4周: 每4小时运行，每次8篇
 * - 第5-12周: 每6小时运行，每次5篇
 * - 第13周+: 每12小时运行，每次2篇
 */

import { fileURLToPath } from 'url';
import path from 'path';
import { spawn } from 'child_process';
import { getDb } from '../server/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============ 配置 ============

// 调度配置
const SCHEDULE_CONFIG = {
  // 阶段定义 (按已完成文章数)
  phases: [
    { name: 'phase1', maxArticles: 120, intervalHours: 4, batchSize: 8 },
    { name: 'phase2', maxArticles: 300, intervalHours: 6, batchSize: 5 },
    { name: 'phase3', maxArticles: Infinity, intervalHours: 12, batchSize: 2 },
  ],

  // 失败任务重试
  retryInterval: 3600000, // 1小时检查一次
  maxRetries: 3,

  // 日志
  logInterval: 600000, // 10分钟输出一次心跳
};

// ============ 状态管理 ============

let isRunning = false;
let lastRunTime = null;
let totalGenerated = 0;
let totalFailed = 0;

// 获取当前阶段
function getCurrentPhase() {
  const db = getDb();
  const result = db.prepare(`
    SELECT COUNT(*) as count FROM knowledge_articles WHERE published = 1
  `).get();

  const articleCount = result?.count || 0;

  for (const phase of SCHEDULE_CONFIG.phases) {
    if (articleCount < phase.maxArticles) {
      return { ...phase, currentCount: articleCount };
    }
  }

  return { ...SCHEDULE_CONFIG.phases[SCHEDULE_CONFIG.phases.length - 1], currentCount: articleCount };
}

// 获取队列状态
function getQueueStatus() {
  const db = getDb();

  try {
    const stats = db.prepare(`
      SELECT status, COUNT(*) as count
      FROM content_generation_queue
      GROUP BY status
    `).all();

    return stats.reduce((acc, s) => {
      acc[s.status] = s.count;
      return acc;
    }, { pending: 0, generating: 0, completed: 0, failed: 0 });
  } catch (e) {
    return { pending: 0, generating: 0, completed: 0, failed: 0, error: e.message };
  }
}

// ============ 任务执行 ============

// 运行生成器
function runGenerator(phase, batchSize) {
  return new Promise((resolve, reject) => {
    console.log(`[${new Date().toISOString()}] 启动生成器: phase=${phase}, batch=${batchSize}`);

    const generatorPath = path.join(__dirname, 'knowledgeContentGenerator.js');
    const child = spawn('node', [
      generatorPath,
      `--phase=${phase}`,
      `--batch=${batchSize}`,
    ], {
      cwd: path.join(__dirname, '..'),
      stdio: 'pipe',
    });

    let stdout = '';
    let stderr = '';

    child.stdout.on('data', (data) => {
      const output = data.toString();
      stdout += output;
      process.stdout.write(output); // 实时输出
    });

    child.stderr.on('data', (data) => {
      const output = data.toString();
      stderr += output;
      process.stderr.write(output);
    });

    child.on('close', (code) => {
      if (code === 0) {
        // 解析完成数量
        const completedMatch = stdout.match(/完成: (\d+)/);
        const failedMatch = stdout.match(/失败: (\d+)/);

        const completed = completedMatch ? parseInt(completedMatch[1]) : 0;
        const failed = failedMatch ? parseInt(failedMatch[1]) : 0;

        totalGenerated += completed;
        totalFailed += failed;

        resolve({ completed, failed });
      } else {
        reject(new Error(`Generator exited with code ${code}: ${stderr}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

// 重试失败任务
function retryFailedTasks() {
  const db = getDb();

  try {
    const result = db.prepare(`
      UPDATE content_generation_queue
      SET status = 'pending'
      WHERE status = 'failed' AND retry_count < ?
    `).run(SCHEDULE_CONFIG.maxRetries);

    if (result.changes > 0) {
      console.log(`[${new Date().toISOString()}] 重置 ${result.changes} 个失败任务`);
    }
  } catch (e) {
    console.error(`[${new Date().toISOString()}] 重试失败任务出错:`, e.message);
  }
}

// ============ 调度逻辑 ============

async function runScheduledTask() {
  if (isRunning) {
    console.log(`[${new Date().toISOString()}] 跳过: 上一个任务仍在运行`);
    return;
  }

  isRunning = true;
  lastRunTime = new Date();

  try {
    const phase = getCurrentPhase();
    console.log(`\n${'='.repeat(60)}`);
    console.log(`[${new Date().toISOString()}] 开始调度任务`);
    console.log(`当前阶段: ${phase.name} | 已完成: ${phase.currentCount} 篇`);
    console.log(`本次批量: ${phase.batchSize} 篇`);
    console.log('='.repeat(60));

    // 获取队列状态
    const queueStatus = getQueueStatus();
    console.log(`队列状态: 待处理=${queueStatus.pending}, 生成中=${queueStatus.generating}, 已完成=${queueStatus.completed}, 失败=${queueStatus.failed}`);

    if (queueStatus.pending === 0) {
      console.log('没有待处理任务，跳过本次运行');
      isRunning = false;
      return;
    }

    // 运行生成器
    const result = await runGenerator(
      phase.name === 'phase1' ? 1 : phase.name === 'phase2' ? 2 : 3,
      Math.min(phase.batchSize, queueStatus.pending)
    );

    console.log(`\n[${new Date().toISOString()}] 任务完成: 生成 ${result.completed} 篇, 失败 ${result.failed} 篇`);

  } catch (error) {
    console.error(`[${new Date().toISOString()}] 任务执行失败:`, error.message);
  } finally {
    isRunning = false;
  }
}

// 心跳日志
function logHeartbeat() {
  const phase = getCurrentPhase();
  const queueStatus = getQueueStatus();

  console.log(`[${new Date().toISOString()}] 心跳 | 阶段: ${phase.name} | 已发布: ${phase.currentCount}/300 | 待处理: ${queueStatus.pending} | 累计生成: ${totalGenerated} | 累计失败: ${totalFailed}`);
}

// ============ 主循环 ============

async function main() {
  console.log('═'.repeat(60));
  console.log('  知识内容调度器启动');
  console.log('═'.repeat(60));
  console.log(`启动时间: ${new Date().toISOString()}`);
  console.log(`PID: ${process.pid}`);
  console.log('');

  // 初始检查
  const phase = getCurrentPhase();
  const queueStatus = getQueueStatus();
  console.log(`当前阶段: ${phase.name}`);
  console.log(`已完成文章: ${phase.currentCount}`);
  console.log(`队列状态:`, queueStatus);
  console.log(`调度间隔: ${phase.intervalHours} 小时`);
  console.log(`每批数量: ${phase.batchSize} 篇`);
  console.log('');

  // 立即运行一次
  await runScheduledTask();

  // 设置定时任务
  const scheduleInterval = setInterval(async () => {
    const currentPhase = getCurrentPhase();
    await runScheduledTask();
  }, getCurrentPhase().intervalHours * 3600000);

  // 失败任务重试
  setInterval(retryFailedTasks, SCHEDULE_CONFIG.retryInterval);

  // 心跳日志
  setInterval(logHeartbeat, SCHEDULE_CONFIG.logInterval);

  // 优雅退出
  process.on('SIGINT', () => {
    console.log(`\n[${new Date().toISOString()}] 收到 SIGINT，正在退出...`);
    clearInterval(scheduleInterval);
    process.exit(0);
  });

  process.on('SIGTERM', () => {
    console.log(`\n[${new Date().toISOString()}] 收到 SIGTERM，正在退出...`);
    clearInterval(scheduleInterval);
    process.exit(0);
  });

  console.log('调度器已启动，等待下次运行...\n');
}

// 运行
main().catch(error => {
  console.error('调度器启动失败:', error);
  process.exit(1);
});
