/**
 * 导入名人案例数据
 *
 * 功能：
 * 1. 从 /home/docs/celebrity_cases.json 读取25个名人案例
 * 2. 使用 baziCalculator 计算八字（年月日时柱）
 * 3. 生成简化的K线数据（基于描述和命理规则）
 * 4. 根据类别设置热度分数（AI/crypto类别获得更高分数）
 * 5. 导入到 celebrity_cases 表
 *
 * 使用方法：
 * node scripts/importCelebrityCases.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Lunar, Solar } from 'lunar-javascript';
import { createCelebrityCase } from '../server/database.js';
import { calculateLifeTimeline, generateFallbackKLine } from '../server/baziCalculator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 读取 celebrity_cases.json
const CELEBRITY_CASES_PATH = '/home/docs/celebrity_cases.json';

/**
 * 根据生日日期计算八字四柱
 * @param {string} birthDate - ISO格式的生日日期时间字符串
 * @param {number} lat - 纬度（用于时区计算，可选）
 * @param {number} lng - 经度（用于时区计算，可选）
 * @returns {object} 包含四柱的对象
 */
const calculateBaziPillars = (birthDate, lat = 0, lng = 0) => {
  try {
    const date = new Date(birthDate);

    // 使用 lunar-javascript 计算八字
    const solar = Solar.fromDate(date);
    const lunar = solar.getLunar();

    // 获取八字对象
    const baziObj = lunar.getEightChar();

    // 年柱 - 使用农历年干支
    const yearPillar = `${lunar.getYearInGanZhi()}`;

    // 月柱 - 使用农历月干支
    const monthPillar = `${lunar.getMonthInGanZhi()}`;

    // 日柱 - 使用日干支
    const dayPillar = `${lunar.getDayInGanZhi()}`;

    // 时柱 - 使用时辰干支
    const hourPillar = `${lunar.getTimeInGanZhi()}`;

    return {
      yearPillar,
      monthPillar,
      dayPillar,
      hourPillar,
    };
  } catch (error) {
    console.error(`计算八字失败 (${birthDate}):`, error.message);
    // 返回默认值
    return {
      yearPillar: '甲子',
      monthPillar: '甲子',
      dayPillar: '甲子',
      hourPillar: '甲子',
    };
  }
};

/**
 * 生成简化的K线数据
 * 基于名人案例的描述和命理特征生成生命轨迹K线
 * @param {object} celebrityCase - 名人案例数据
 * @param {object} bazi - 八字四柱
 * @returns {Array} K线数据点数组
 */
const generateCelebrityKLine = (celebrityCase, bazi) => {
  const birthYear = new Date(celebrityCase.birth_date).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  try {
    // 使用现有的 calculateLifeTimeline 计算时间线骨架
    const input = {
      birthYear: birthYear,
      gender: 'Male', // 默认使用男性起运方式，实际应用中可以添加性别字段
      yearPillar: bazi.yearPillar,
      monthPillar: bazi.monthPillar,
      dayPillar: bazi.dayPillar,
      hourPillar: bazi.hourPillar,
      startAge: 1, // 从1岁开始大运
      firstDaYun: bazi.monthPillar, // 使用月柱作为首个大运（简化处理）
    };

    const skeleton = calculateLifeTimeline(input);

    // 生成基础K线
    let klineData = generateFallbackKLine(skeleton);

    // 根据案例描述调整K线形态
    klineData = adjustKLineByDescription(klineData, celebrityCase, birthYear);

    // 只返回到当前年龄的数据
    return klineData.filter(point => point.age <= Math.min(age + 10, 100));

  } catch (error) {
    console.error(`生成K线失败 (${celebrityCase.name}):`, error.message);
    return [];
  }
};

/**
 * 根据案例描述调整K线形态
 * @param {Array} klineData - 原始K线数据
 * @param {object} celebrityCase - 名人案例
 * @param {number} birthYear - 出生年份
 * @returns {Array} 调整后的K线数据
 */
const adjustKLineByDescription = (klineData, celebrityCase, birthYear) => {
  const { category, description } = celebrityCase;

  // 根据不同类别应用不同的调整策略
  switch (category) {
    case 'sudden_downfall':
      // 巨星陨落：前期高峰，突然暴跌
      return adjustForSuddenDownfall(klineData, description, birthYear);

    case 'rising_power':
      // 逆袭爆发：早期低谷，后期V型反转
      return adjustForRisingPower(klineData, description, birthYear);

    case 'corporate_fate':
      // 商业帝国：波动较大，有明显周期
      return adjustForCorporateFate(klineData, description, birthYear);

    case 'ai_tech':
      // AI科技：起步即巅峰或快速上升
      return adjustForAITech(klineData, description, birthYear);

    case 'crypto_macro':
      // 虚拟资产：极度波动，牛熊周期明显
      return adjustForCrypto(klineData, description, birthYear);

    default:
      return klineData;
  }
};

// 巨星陨落调整（如科比、张国荣、李小龙）
const adjustForSuddenDownfall = (klineData, description, birthYear) => {
  // 提取关键年份（如2020年、2003年、1973年）
  const yearMatch = description.match(/(\d{4})年/);
  if (yearMatch) {
    const crashYear = parseInt(yearMatch[1]);
    const crashAge = crashYear - birthYear;

    return klineData.map(point => {
      if (point.age < crashAge - 5) {
        // 早期稳步上升
        return { ...point, score: Math.min(point.score + 15, 90), close: Math.min(point.close + 15, 90) };
      } else if (point.age >= crashAge - 5 && point.age < crashAge) {
        // 巅峰时期
        return { ...point, score: 85, close: 85, high: 95, low: 75 };
      } else if (point.age === crashAge) {
        // 突然归零
        return { ...point, score: 15, close: 15, high: 85, low: 15 };
      } else {
        // 之后低迷
        return { ...point, score: 20, close: 20, high: 30, low: 10 };
      }
    });
  }
  return klineData;
};

// 逆袭爆发调整（如乔布斯、马斯克、罗琳）
const adjustForRisingPower = (klineData, description, birthYear) => {
  // 提取低谷和回归年份
  const yearMatches = description.match(/(\d{4})年/g);
  if (yearMatches && yearMatches.length >= 2) {
    const lowYear = parseInt(yearMatches[0]);
    const riseYear = parseInt(yearMatches[1]);
    const lowAge = lowYear - birthYear;
    const riseAge = riseYear - birthYear;

    return klineData.map(point => {
      if (point.age < lowAge - 3) {
        // 早期平稳
        return { ...point, score: Math.max(point.score - 10, 40), close: Math.max(point.close - 10, 40) };
      } else if (point.age >= lowAge - 3 && point.age < riseAge) {
        // 低谷期
        return { ...point, score: 35, close: 35, high: 45, low: 25 };
      } else if (point.age >= riseAge && point.age < riseAge + 5) {
        // V型反转
        const progress = (point.age - riseAge) / 5;
        const score = 35 + progress * 50;
        return { ...point, score: Math.round(score), close: Math.round(score), high: Math.min(95, score + 10) };
      } else {
        // 高位盘整
        return { ...point, score: Math.min(point.score + 20, 88), close: Math.min(point.close + 20, 88) };
      }
    });
  }
  return klineData;
};

// 商业帝国调整（如微软、腾讯、阿里）
const adjustForCorporateFate = (klineData, description, birthYear) => {
  // 企业波动大，周期性明显
  return klineData.map(point => {
    const cycle = Math.sin(point.age * 0.3) * 20; // 周期性波动
    const trend = point.age * 0.5; // 整体上升趋势
    const newScore = Math.max(30, Math.min(85, point.score + cycle + trend));
    return {
      ...point,
      score: Math.round(newScore),
      close: Math.round(newScore),
      high: Math.round(Math.min(95, newScore + 15)),
      low: Math.round(Math.max(20, newScore - 15))
    };
  });
};

// AI科技调整（如ChatGPT、Sora、Gemini）
const adjustForAITech = (klineData, description, birthYear) => {
  // AI产品通常起步即巅峰或快速上升
  return klineData.map(point => {
    if (point.age <= 2) {
      // 起步即巅峰
      return { ...point, score: 90, close: 90, high: 95, low: 85 };
    } else if (point.age <= 5) {
      // 维持高位或小幅调整
      return { ...point, score: 80, close: 80, high: 88, low: 70 };
    } else {
      // 后续稳定
      return { ...point, score: 75, close: 75, high: 82, low: 68 };
    }
  });
};

// 虚拟资产调整（如比特币、以太坊等）
const adjustForCrypto = (klineData, description, birthYear) => {
  // 加密货币极度波动，牛熊周期明显
  return klineData.map(point => {
    // 4年牛熊周期（比特币减半周期）
    const cyclePosition = point.age % 4;
    let multiplier = 1;

    if (cyclePosition === 0 || cyclePosition === 1) {
      // 牛市
      multiplier = 1.8;
    } else {
      // 熊市
      multiplier = 0.4;
    }

    const baseScore = 50;
    const volatility = Math.random() * 30 - 15; // 高波动
    const newScore = Math.max(15, Math.min(95, baseScore * multiplier + volatility));

    return {
      ...point,
      score: Math.round(newScore),
      close: Math.round(newScore),
      high: Math.round(Math.min(95, newScore + 20)),
      low: Math.round(Math.max(10, newScore - 25))
    };
  });
};

/**
 * 根据类别计算热度分数
 * @param {string} category - 案例类别
 * @returns {number} 热度分数 (0-100)
 */
const calculateHotnessScore = (category) => {
  const hotnessMap = {
    'ai_tech': 95,          // AI最热门
    'crypto_macro': 88,     // 加密货币次之
    'rising_power': 75,     // 逆袭故事很受欢迎
    'corporate_fate': 70,   // 商业案例
    'sudden_downfall': 65,  // 明星陨落
  };

  return hotnessMap[category] || 50;
};

/**
 * 生成关键事件高光
 * @param {object} celebrityCase - 名人案例
 * @param {Array} klineData - K线数据
 * @returns {Array} 高光事件数组
 */
const generateHighlights = (celebrityCase, klineData) => {
  const highlights = [];
  const birthYear = new Date(celebrityCase.birth_date).getFullYear();

  // 从描述中提取年份
  const yearMatches = celebrityCase.description.match(/(\d{4})年/g);
  if (yearMatches) {
    yearMatches.forEach(yearStr => {
      const year = parseInt(yearStr);
      const age = year - birthYear;
      const klinePoint = klineData.find(p => p.age === age);

      if (klinePoint) {
        highlights.push({
          age: age,
          year: year,
          event: celebrityCase.description.substring(0, 50) + '...',
          score: klinePoint.score,
          type: klinePoint.score >= 70 ? 'peak' : klinePoint.score <= 40 ? 'trough' : 'turning'
        });
      }
    });
  }

  // 限制高光数量
  return highlights.slice(0, 3);
};

/**
 * 主导入函数
 */
const importCelebrityCases = async () => {
  console.log('开始导入名人案例数据...\n');

  // 读取 JSON 文件
  let celebrityCases;
  try {
    const jsonData = fs.readFileSync(CELEBRITY_CASES_PATH, 'utf-8');
    celebrityCases = JSON.parse(jsonData);
    console.log(`✓ 成功读取 ${celebrityCases.length} 个名人案例\n`);
  } catch (error) {
    console.error('读取 celebrity_cases.json 失败:', error.message);
    process.exit(1);
  }

  let successCount = 0;
  let failCount = 0;

  // 逐个处理案例
  for (const caseData of celebrityCases) {
    try {
      console.log(`处理: ${caseData.name_cn} (${caseData.name})...`);

      // 1. 计算八字
      const bazi = calculateBaziPillars(
        caseData.birth_date,
        caseData.birth_location?.lat,
        caseData.birth_location?.lng
      );
      console.log(`  八字: ${bazi.yearPillar} ${bazi.monthPillar} ${bazi.dayPillar} ${bazi.hourPillar}`);

      // 2. 生成K线数据
      const chartData = generateCelebrityKLine(caseData, bazi);
      console.log(`  生成K线: ${chartData.length} 个数据点`);

      // 3. 计算热度分数
      const hotnessScore = calculateHotnessScore(caseData.category);
      console.log(`  热度分数: ${hotnessScore}`);

      // 4. 生成高光事件
      const highlights = generateHighlights(caseData, chartData);
      console.log(`  高光事件: ${highlights.length} 个`);

      // 5. 准备数据库记录
      const dbRecord = {
        id: caseData.id,
        name: caseData.name,
        name_cn: caseData.name_cn,
        category: caseData.category,
        category_cn: caseData.category_cn,
        birth_date: caseData.birth_date,
        birth_location_city: caseData.birth_location?.city || null,
        birth_location_lat: caseData.birth_location?.lat || null,
        birth_location_lng: caseData.birth_location?.lng || null,
        description: caseData.description,
        tags: caseData.tags,
        year_pillar: bazi.yearPillar,
        month_pillar: bazi.monthPillar,
        day_pillar: bazi.dayPillar,
        hour_pillar: bazi.hourPillar,
        chart_data: chartData,
        highlights: highlights,
        hotness_score: hotnessScore,
        published: 1,
      };

      // 6. 插入数据库
      createCelebrityCase(dbRecord);
      console.log(`  ✓ 导入成功\n`);
      successCount++;

    } catch (error) {
      console.error(`  ✗ 导入失败: ${error.message}\n`);
      failCount++;
    }
  }

  // 输出统计
  console.log('=' .repeat(50));
  console.log(`导入完成！`);
  console.log(`成功: ${successCount}`);
  console.log(`失败: ${failCount}`);
  console.log(`总计: ${celebrityCases.length}`);
  console.log('=' .repeat(50));
};

// 执行导入
importCelebrityCases().catch(error => {
  console.error('导入过程发生错误:', error);
  process.exit(1);
});
