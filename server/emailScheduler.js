import cron from 'node-cron';
import { Lunar } from 'lunar-javascript';
import { getDb } from './database.js';
import { sendFortuneReminder, sendLowPointsReminder } from './emailService.js';

// Start all scheduled tasks
export function startEmailScheduler() {
  console.log('✓ 邮件定时任务调度器已启动');

  // Daily tasks at 8 AM (fortune + birthday)
  cron.schedule('0 8 * * *', async () => {
    console.log('开始执行每日定时任务 (8:00 AM)...');
    await sendDailyFortuneReminders();
    await sendBirthdayReminders();
  });

  // Monthly at 9 AM on 1st
  cron.schedule('0 9 1 * *', async () => {
    console.log('开始执行每月定时任务 (9:00 AM, 1st)...');
    await sendMonthlyFortuneReminders();
  });

  // Yearly at 9 AM on Dec 20
  cron.schedule('0 9 20 12 *', async () => {
    console.log('开始执行流年定时任务 (9:00 AM, Dec 20)...');
    await sendYearlyFortuneReminders();
  });

  // Low points check every Monday 10 AM
  cron.schedule('0 10 * * 1', async () => {
    console.log('开始执行积分不足检查 (10:00 AM, Monday)...');
    await sendLowPointsReminders();
  });
}

// Helper functions:

async function sendDailyFortuneReminders() {
  try {
    const db = getDb();

    // Query users with sub_daily_fortune = 1 and email_verified = 1
    const stmt = db.prepare(`
      SELECT u.id, u.email, es.user_id
      FROM users u
      INNER JOIN email_subscriptions es ON u.id = es.user_id
      WHERE es.sub_daily_fortune = 1 AND es.email_verified = 1
    `);

    const users = stmt.all();
    console.log(`找到 ${users.length} 位订阅每日运势的用户`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get user's profiles
        const profileStmt = db.prepare(`
          SELECT id, name FROM user_profiles
          WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)
          ORDER BY is_default DESC, created_at DESC
          LIMIT 1
        `);

        const profile = profileStmt.get(user.id);

        if (profile) {
          await sendFortuneReminder(user.email, 'daily', profile.name);
          successCount++;
          console.log(`✓ 已发送每日运势提醒至 ${user.email} (${profile.name})`);
        } else {
          console.log(`⚠ 用户 ${user.email} 没有可用的档案，跳过`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ 发送每日运势提醒失败 (${user.email}):`, error.message);
      }
    }

    console.log(`每日运势提醒完成: 成功 ${successCount}, 失败 ${errorCount}`);
  } catch (error) {
    console.error('执行每日运势提醒任务失败:', error);
  }
}

async function sendMonthlyFortuneReminders() {
  try {
    const db = getDb();

    // Query users with sub_monthly_fortune = 1 and email_verified = 1
    const stmt = db.prepare(`
      SELECT u.id, u.email, es.user_id
      FROM users u
      INNER JOIN email_subscriptions es ON u.id = es.user_id
      WHERE es.sub_monthly_fortune = 1 AND es.email_verified = 1
    `);

    const users = stmt.all();
    console.log(`找到 ${users.length} 位订阅每月运势的用户`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get user's profiles
        const profileStmt = db.prepare(`
          SELECT id, name FROM user_profiles
          WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)
          ORDER BY is_default DESC, created_at DESC
          LIMIT 1
        `);

        const profile = profileStmt.get(user.id);

        if (profile) {
          await sendFortuneReminder(user.email, 'monthly', profile.name);
          successCount++;
          console.log(`✓ 已发送每月运势提醒至 ${user.email} (${profile.name})`);
        } else {
          console.log(`⚠ 用户 ${user.email} 没有可用的档案，跳过`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ 发送每月运势提醒失败 (${user.email}):`, error.message);
      }
    }

    console.log(`每月运势提醒完成: 成功 ${successCount}, 失败 ${errorCount}`);
  } catch (error) {
    console.error('执行每月运势提醒任务失败:', error);
  }
}

async function sendYearlyFortuneReminders() {
  try {
    const db = getDb();

    // Query users with sub_yearly_fortune = 1 and email_verified = 1
    const stmt = db.prepare(`
      SELECT u.id, u.email, es.user_id
      FROM users u
      INNER JOIN email_subscriptions es ON u.id = es.user_id
      WHERE es.sub_yearly_fortune = 1 AND es.email_verified = 1
    `);

    const users = stmt.all();
    console.log(`找到 ${users.length} 位订阅流年运势的用户`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        // Get user's profiles
        const profileStmt = db.prepare(`
          SELECT id, name FROM user_profiles
          WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)
          ORDER BY is_default DESC, created_at DESC
          LIMIT 1
        `);

        const profile = profileStmt.get(user.id);

        if (profile) {
          await sendFortuneReminder(user.email, 'yearly', profile.name);
          successCount++;
          console.log(`✓ 已发送流年运势提醒至 ${user.email} (${profile.name})`);
        } else {
          console.log(`⚠ 用户 ${user.email} 没有可用的档案，跳过`);
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ 发送流年运势提醒失败 (${user.email}):`, error.message);
      }
    }

    console.log(`流年运势提醒完成: 成功 ${successCount}, 失败 ${errorCount}`);
  } catch (error) {
    console.error('执行流年运势提醒任务失败:', error);
  }
}

async function sendLowPointsReminders() {
  try {
    const db = getDb();

    // Query users with points < 100 and sub_low_points = 1 and email_verified = 1
    const stmt = db.prepare(`
      SELECT u.id, u.email, u.points
      FROM users u
      INNER JOIN email_subscriptions es ON u.id = es.user_id
      WHERE u.points < 100 AND es.sub_low_points = 1 AND es.email_verified = 1
    `);

    const users = stmt.all();
    console.log(`找到 ${users.length} 位积分不足的用户`);

    let successCount = 0;
    let errorCount = 0;

    for (const user of users) {
      try {
        await sendLowPointsReminder(user.email, user.points);
        successCount++;
        console.log(`✓ 已发送积分不足提醒至 ${user.email} (剩余 ${user.points} 点)`);
      } catch (error) {
        errorCount++;
        console.error(`✗ 发送积分不足提醒失败 (${user.email}):`, error.message);
      }
    }

    console.log(`积分不足提醒完成: 成功 ${successCount}, 失败 ${errorCount}`);
  } catch (error) {
    console.error('执行积分不足提醒任务失败:', error);
  }
}

async function sendBirthdayReminders() {
  try {
    const db = getDb();

    // Get today's lunar date
    const today = new Date();
    const todayLunar = Lunar.fromDate(today);
    const todayLunarMonth = todayLunar.getMonth();
    const todayLunarDay = todayLunar.getDay();

    console.log(`今日农历: ${todayLunarMonth}月${todayLunarDay}日`);

    // Query users with sub_birthday_reminder = 1 and email_verified = 1
    const stmt = db.prepare(`
      SELECT u.id, u.email, es.user_id
      FROM users u
      INNER JOIN email_subscriptions es ON u.id = es.user_id
      WHERE es.sub_birthday_reminder = 1 AND es.email_verified = 1
    `);

    const users = stmt.all();
    console.log(`检查 ${users.length} 位订阅生日提醒的用户`);

    let successCount = 0;
    let errorCount = 0;
    let birthdayCount = 0;

    for (const user of users) {
      try {
        // Get all user's profiles (check all in case they have multiple people)
        const profileStmt = db.prepare(`
          SELECT id, name, birth_year, month_pillar, day_pillar
          FROM user_profiles
          WHERE user_id = ? AND (is_deleted = 0 OR is_deleted IS NULL)
          AND birth_year IS NOT NULL
        `);

        const profiles = profileStmt.all(user.id);

        for (const profile of profiles) {
          try {
            // Try to extract lunar birthday from birth_year and pillars
            // For a more accurate implementation, we would need the full birth date
            // For now, we'll use a simplified approach:
            // Convert the Gregorian birth year to lunar and check the month/day

            // Since we don't have the exact birth date stored, we'll check if:
            // 1. The profile has complete pillar information
            // 2. We can derive a lunar birthday from the available data

            // This is a simplified version - in production you'd want to store
            // the actual birth date (both Gregorian and Lunar) in the database

            // For now, let's skip profiles without complete birth info
            if (!profile.birth_year || !profile.month_pillar || !profile.day_pillar) {
              continue;
            }

            // Extract month and day from pillars if possible
            // The month_pillar and day_pillar contain heavenly stems and earthly branches
            // which can be used to derive the lunar date

            // This is a simplified approach - we'd need more sophisticated parsing
            // For a basic implementation, we can't accurately determine lunar birthday
            // from pillars alone without the full birth date

            // TODO: Add a birth_date field to user_profiles table for accurate birthday tracking
            console.log(`⚠ 生日提醒功能需要完整的出生日期信息 (用户: ${user.email}, 档案: ${profile.name})`);

          } catch (profileError) {
            console.error(`检查档案生日失败 (${profile.name}):`, profileError.message);
          }
        }
      } catch (error) {
        errorCount++;
        console.error(`✗ 检查生日失败 (${user.email}):`, error.message);
      }
    }

    console.log(`生日提醒检查完成: 今日生日 ${birthdayCount}, 成功发送 ${successCount}, 失败 ${errorCount}`);
    console.log(`提示: 生日提醒功能需要在 user_profiles 表中添加完整的 birth_date 字段以实现精确匹配`);
  } catch (error) {
    console.error('执行生日提醒任务失败:', error);
  }
}

export default {
  startEmailScheduler
};
