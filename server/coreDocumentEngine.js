/**
 * 核心文档引擎 - Core Document Engine for Bazi Profiles
 *
 * 职责：
 * 1. 为每个用户档案生成核心文档（100年命理数据）
 * 2. 管理核心文档的缓存、验证和重新生成
 * 3. 确保同一八字返回相同的核心结论
 *
 * 核心文档结构：
 * - 100年生命时间线（chartPoints）
 * - 命理核心分析（personality_core, career_core等）
 * - K线数据（kline_data）
 * - 巅峰年/低谷年
 */

import { getUserProfileById, updateProfileCoreDocumentStatus, getDb, nowIso } from './database.js';
import { getCachedAnalysis, cacheAnalysis, computeBaziHash } from './cacheManager.js';
import { calculateLifeTimeline, generateFallbackKLine } from './baziCalculator.js';

/**
 * 生成核心文档
 * @param {object} profile - 用户档案对象
 * @param {boolean} skipCache - 是否跳过缓存检查（强制重新生成）
 * @returns {Promise<object>} 核心文档对象
 */
export const generateCoreDocument = async (profile, skipCache = false) => {
  try {
    console.log(`[CoreDocEngine] 开始生成核心文档 - Profile ID: ${profile.id}`);

    // 1. 更新状态为"生成中"
    updateProfileCoreDocumentStatus(profile.id, 'generating');

    // 2. 计算100年生命时间线
    const timelineData = calculateLifeTimeline({
      birthYear: profile.birthYear,
      gender: profile.gender === 'male' ? 'Male' : 'Female',
      yearPillar: profile.yearPillar,
      monthPillar: profile.monthPillar,
      dayPillar: profile.dayPillar,
      hourPillar: profile.hourPillar,
      startAge: profile.startAge,
      firstDaYun: profile.firstDaYun
    });

    console.log(`[CoreDocEngine] 时间线计算完成 - ${timelineData.timeline.length} 年`);

    // 3. 计算八字哈希
    const baziHash = computeBaziHash(
      profile.yearPillar,
      profile.monthPillar,
      profile.dayPillar,
      profile.hourPillar
    );

    // 4. 检查缓存（除非跳过）
    let cachedAnalysis = null;
    if (!skipCache) {
      cachedAnalysis = getCachedAnalysis(baziHash, profile.gender);
      if (cachedAnalysis) {
        console.log(`[CoreDocEngine] 找到缓存分析 - Hash: ${baziHash}`);
      }
    }

    // 5. 如果没有缓存，触发分析生成（当前使用降级算法）
    let coreDocument;
    if (cachedAnalysis) {
      // 使用缓存数据
      coreDocument = {
        profileId: profile.id,
        baziHash,
        chartPoints: cachedAnalysis.klineData || [],
        personalityCore: cachedAnalysis.personalityCore,
        careerCore: cachedAnalysis.careerCore,
        wealthCore: cachedAnalysis.wealthCore,
        marriageCore: cachedAnalysis.marriageCore,
        healthCore: cachedAnalysis.healthCore,
        klineData: cachedAnalysis.klineData,
        peakYears: cachedAnalysis.peakYears,
        troughYears: cachedAnalysis.troughYears,
        cryptoCore: cachedAnalysis.cryptoCore,
        luckyElements: cachedAnalysis.luckyElements,
        physicalTraits: cachedAnalysis.physicalTraits,
        modelUsed: cachedAnalysis.modelUsed,
        generatedAt: nowIso(),
        fromCache: true
      };
    } else {
      // 生成新的分析（使用降级算法）
      console.log(`[CoreDocEngine] 生成新的核心分析 - 使用降级算法`);

      const klineData = generateFallbackKLine(timelineData);

      // 找出巅峰年和低谷年
      const sortedByScore = [...klineData].sort((a, b) => b.score - a.score);
      const peakYears = sortedByScore.slice(0, 5).map(p => ({
        year: p.year,
        age: p.age,
        score: p.score,
        reason: p.reason
      }));
      const troughYears = sortedByScore.slice(-5).reverse().map(p => ({
        year: p.year,
        age: p.age,
        score: p.score,
        reason: p.reason
      }));

      // 构建核心文档
      coreDocument = {
        profileId: profile.id,
        baziHash,
        chartPoints: klineData,
        personalityCore: {
          content: '基于四柱八字的性格分析（降级版）',
          score: 5
        },
        careerCore: {
          content: '基于四柱八字的事业分析（降级版）',
          score: 5
        },
        wealthCore: {
          content: '基于四柱八字的财运分析（降级版）',
          score: 5
        },
        marriageCore: {
          content: '基于四柱八字的婚姻分析（降级版）',
          score: 5
        },
        healthCore: {
          content: '基于四柱八字的健康分析（降级版）',
          score: 5,
          bodyParts: []
        },
        klineData,
        peakYears,
        troughYears,
        cryptoCore: {
          content: '暂无币圈分析',
          score: 5
        },
        luckyElements: {
          colors: [],
          directions: [],
          zodiac: [],
          numbers: []
        },
        physicalTraits: {
          appearance: '',
          bodyType: '',
          skin: '',
          characterSummary: ''
        },
        modelUsed: 'fallback_v1',
        generatedAt: nowIso(),
        fromCache: false
      };

      // 保存到缓存
      cacheAnalysis({
        baziHash,
        gender: profile.gender,
        structuralData: {
          bazi: [profile.yearPillar, profile.monthPillar, profile.dayPillar, profile.hourPillar],
          summaryScore: 5
        },
        personalityCore: coreDocument.personalityCore,
        careerCore: coreDocument.careerCore,
        wealthCore: coreDocument.wealthCore,
        marriageCore: coreDocument.marriageCore,
        healthCore: coreDocument.healthCore,
        klineData,
        peakYears,
        troughYears,
        cryptoCore: coreDocument.cryptoCore,
        luckyElements: coreDocument.luckyElements,
        physicalTraits: coreDocument.physicalTraits,
        modelUsed: 'fallback_v1',
        version: 1
      });

      console.log(`[CoreDocEngine] 核心分析已缓存 - Hash: ${baziHash}`);
    }

    // 6. 更新档案状态为"就绪"
    updateProfileCoreDocumentStatus(profile.id, 'ready');
    console.log(`[CoreDocEngine] 核心文档生成完成 - Profile ID: ${profile.id}`);

    return coreDocument;

  } catch (error) {
    console.error(`[CoreDocEngine] 生成核心文档失败:`, error);

    // 更新状态为"失败"
    updateProfileCoreDocumentStatus(profile.id, 'failed');

    throw new Error(`生成核心文档失败: ${error.message}`);
  }
};

/**
 * 获取核心文档
 * @param {string} profileId - 档案ID
 * @returns {Promise<object>} 核心文档对象，包含验证状态
 */
export const getCoreDocument = async (profileId) => {
  try {
    console.log(`[CoreDocEngine] 获取核心文档 - Profile ID: ${profileId}`);

    // 1. 获取档案
    const profile = getUserProfileById(profileId);
    if (!profile) {
      throw new Error('档案不存在');
    }

    // 2. 计算八字哈希
    const baziHash = computeBaziHash(
      profile.yearPillar,
      profile.monthPillar,
      profile.dayPillar,
      profile.hourPillar
    );

    // 3. 查询缓存
    const cachedAnalysis = getCachedAnalysis(baziHash, profile.gender);

    // 4. 如果找到缓存，构建文档并返回
    if (cachedAnalysis && cachedAnalysis.klineData && cachedAnalysis.klineData.length > 0) {
      const document = {
        profileId: profile.id,
        baziHash,
        chartPoints: cachedAnalysis.klineData,
        personalityCore: cachedAnalysis.personalityCore,
        careerCore: cachedAnalysis.careerCore,
        wealthCore: cachedAnalysis.wealthCore,
        marriageCore: cachedAnalysis.marriageCore,
        healthCore: cachedAnalysis.healthCore,
        klineData: cachedAnalysis.klineData,
        peakYears: cachedAnalysis.peakYears,
        troughYears: cachedAnalysis.troughYears,
        cryptoCore: cachedAnalysis.cryptoCore,
        luckyElements: cachedAnalysis.luckyElements,
        physicalTraits: cachedAnalysis.physicalTraits,
        modelUsed: cachedAnalysis.modelUsed,
        generatedAt: cachedAnalysis.createdAt,
        fromCache: true
      };

      // 验证文档完整性
      const validation = validateCoreDocument(document);

      console.log(`[CoreDocEngine] 核心文档已从缓存返回 - 验证分数: ${validation.score}`);

      return {
        document,
        validation,
        status: 'ready'
      };
    }

    // 5. 如果没有缓存，生成新文档
    console.log(`[CoreDocEngine] 缓存未找到，生成新核心文档`);
    const document = await generateCoreDocument(profile);
    const validation = validateCoreDocument(document);

    return {
      document,
      validation,
      status: 'ready'
    };

  } catch (error) {
    console.error(`[CoreDocEngine] 获取核心文档失败:`, error);
    throw new Error(`获取核心文档失败: ${error.message}`);
  }
};

/**
 * 验证核心文档完整性
 * @param {object} doc - 核心文档对象
 * @returns {object} 验证结果 { valid: boolean, missing: string[], score: number }
 */
export const validateCoreDocument = (doc) => {
  const missing = [];
  let score = 0;
  const maxScore = 100;

  // 1. 检查 chartPoints 是否存在且有约100项
  if (!doc.chartPoints || !Array.isArray(doc.chartPoints)) {
    missing.push('chartPoints');
  } else if (doc.chartPoints.length === 0) {
    missing.push('chartPoints (empty)');
  } else if (doc.chartPoints.length < 90) {
    missing.push('chartPoints (不足100年)');
    score += 10; // 部分分数
  } else {
    score += 30; // chartPoints 占30分
  }

  // 2. 检查必需字段：personalityCore
  if (!doc.personalityCore || !doc.personalityCore.content) {
    missing.push('personality_core');
  } else {
    score += 15;
  }

  // 3. 检查必需字段：careerCore
  if (!doc.careerCore || !doc.careerCore.content) {
    missing.push('career_core');
  } else {
    score += 15;
  }

  // 4. 检查必需字段：klineData
  if (!doc.klineData || !Array.isArray(doc.klineData)) {
    missing.push('kline_data');
  } else if (doc.klineData.length === 0) {
    missing.push('kline_data (empty)');
  } else {
    score += 20;
  }

  // 5. 检查可选字段：wealthCore
  if (doc.wealthCore && doc.wealthCore.content) {
    score += 5;
  }

  // 6. 检查可选字段：marriageCore
  if (doc.marriageCore && doc.marriageCore.content) {
    score += 5;
  }

  // 7. 检查可选字段：healthCore
  if (doc.healthCore && doc.healthCore.content) {
    score += 5;
  }

  // 8. 检查可选字段：peakYears 和 troughYears
  if (doc.peakYears && Array.isArray(doc.peakYears) && doc.peakYears.length > 0) {
    score += 3;
  }
  if (doc.troughYears && Array.isArray(doc.troughYears) && doc.troughYears.length > 0) {
    score += 2;
  }

  // 9. 检查可选字段：luckyElements
  if (doc.luckyElements && Object.keys(doc.luckyElements).length > 0) {
    score += 3;
  }

  // 10. 检查可选字段：physicalTraits
  if (doc.physicalTraits && Object.keys(doc.physicalTraits).length > 0) {
    score += 2;
  }

  const valid = missing.length === 0 && score >= 80;

  return {
    valid,
    missing,
    score,
    maxScore,
    message: valid
      ? '核心文档完整'
      : `核心文档不完整，缺失字段: ${missing.join(', ')}`
  };
};

/**
 * 强制重新生成核心文档
 * @param {string} profileId - 档案ID
 * @param {string} reason - 重新生成原因
 * @returns {Promise<object>} 新的核心文档对象
 */
export const regenerateCoreDocument = async (profileId, reason = '手动触发') => {
  try {
    console.log(`[CoreDocEngine] 重新生成核心文档 - Profile ID: ${profileId}, 原因: ${reason}`);

    // 1. 获取档案
    const profile = getUserProfileById(profileId);
    if (!profile) {
      throw new Error('档案不存在');
    }

    // 2. 计算八字哈希
    const baziHash = computeBaziHash(
      profile.yearPillar,
      profile.monthPillar,
      profile.dayPillar,
      profile.hourPillar
    );

    // 3. 删除现有缓存
    const db = getDb();
    const deleteStmt = db.prepare(`
      DELETE FROM bazi_analysis_cache
      WHERE bazi_hash = ? AND gender = ?
    `);
    const result = deleteStmt.run(baziHash, profile.gender);

    if (result.changes > 0) {
      console.log(`[CoreDocEngine] 已删除旧缓存 - Hash: ${baziHash}, 删除条数: ${result.changes}`);
    }

    // 4. 记录重新生成日志
    console.log(`[CoreDocEngine] 重新生成原因: ${reason}`);

    // 5. 生成新文档（跳过缓存检查）
    const newDocument = await generateCoreDocument(profile, true);

    console.log(`[CoreDocEngine] 核心文档重新生成完成 - Profile ID: ${profileId}`);

    return {
      document: newDocument,
      regenerated: true,
      reason,
      timestamp: nowIso()
    };

  } catch (error) {
    console.error(`[CoreDocEngine] 重新生成核心文档失败:`, error);
    throw new Error(`重新生成核心文档失败: ${error.message}`);
  }
};

/**
 * 批量生成核心文档（用于系统维护）
 * @param {string[]} profileIds - 档案ID数组
 * @returns {Promise<object>} 批量生成结果统计
 */
export const batchGenerateCoreDocuments = async (profileIds) => {
  console.log(`[CoreDocEngine] 批量生成核心文档 - 数量: ${profileIds.length}`);

  const results = {
    total: profileIds.length,
    success: 0,
    failed: 0,
    errors: []
  };

  for (const profileId of profileIds) {
    try {
      await generateCoreDocument({ id: profileId });
      results.success++;
    } catch (error) {
      results.failed++;
      results.errors.push({
        profileId,
        error: error.message
      });
    }
  }

  console.log(`[CoreDocEngine] 批量生成完成 - 成功: ${results.success}, 失败: ${results.failed}`);

  return results;
};

export default {
  generateCoreDocument,
  getCoreDocument,
  validateCoreDocument,
  regenerateCoreDocument,
  batchGenerateCoreDocuments
};
