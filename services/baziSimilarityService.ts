// Ba Zi Similarity Calculation Service
// 八字相似度算法服务

import { BaziSimilarity } from '../types';

// === Weight Distribution ===
const WEIGHTS = {
  dayMaster: 0.30,    // 日主最重要
  dayPillar: 0.25,    // 日柱
  monthPillar: 0.20,  // 月柱
  hourPillar: 0.15,   // 时柱
  yearPillar: 0.10,   // 年柱
};

// === 天干 (Heavenly Stems) ===
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];

// 天干五行
const STEM_ELEMENTS: Record<string, string> = {
  '甲': '木', '乙': '木',
  '丙': '火', '丁': '火',
  '戊': '土', '己': '土',
  '庚': '金', '辛': '金',
  '壬': '水', '癸': '水',
};

// 天干阴阳
const STEM_POLARITY: Record<string, string> = {
  '甲': '阳', '乙': '阴',
  '丙': '阳', '丁': '阴',
  '戊': '阳', '己': '阴',
  '庚': '阳', '辛': '阴',
  '壬': '阳', '癸': '阴',
};

// === 地支 (Earthly Branches) ===
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// 地支五行
const BRANCH_ELEMENTS: Record<string, string> = {
  '子': '水', '丑': '土', '寅': '木', '卯': '木',
  '辰': '土', '巳': '火', '午': '火', '未': '土',
  '申': '金', '酉': '金', '戌': '土', '亥': '水',
};

// === 五行生克关系 ===
// 相生：木生火、火生土、土生金、金生水、水生木
const GENERATING_RELATIONS: Record<string, string> = {
  '木': '火',
  '火': '土',
  '土': '金',
  '金': '水',
  '水': '木',
};

// 相克：木克土、土克水、水克火、火克金、金克木
const CONTROLLING_RELATIONS: Record<string, string> = {
  '木': '土',
  '土': '水',
  '水': '火',
  '火': '金',
  '金': '木',
};

// === 地支六合 ===
const SIX_COMBINATIONS: Record<string, string> = {
  '子': '丑', '丑': '子',
  '寅': '亥', '亥': '寅',
  '卯': '戌', '戌': '卯',
  '辰': '酉', '酉': '辰',
  '巳': '申', '申': '巳',
  '午': '未', '未': '午',
};

// === 地支三合 ===
const TRIPLE_COMBINATIONS: Record<string, string[]> = {
  '水局': ['申', '子', '辰'],
  '木局': ['亥', '卯', '未'],
  '火局': ['寅', '午', '戌'],
  '金局': ['巳', '酉', '丑'],
};

// === 地支六冲 ===
const SIX_CLASHES: Record<string, string> = {
  '子': '午', '午': '子',
  '丑': '未', '未': '丑',
  '寅': '申', '申': '寅',
  '卯': '酉', '酉': '卯',
  '辰': '戌', '戌': '辰',
  '巳': '亥', '亥': '巳',
};

// === Interface for Bazi Data ===
interface BaziData {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
}

/**
 * 主函数：计算两个八字的相似度
 */
export function calculateBaziSimilarity(
  userBazi: BaziData,
  celebrityBazi: BaziData
): BaziSimilarity {
  // 1. 计算各柱相似度
  const yearPillarMatch = calculatePillarSimilarity(userBazi.yearPillar, celebrityBazi.yearPillar);
  const monthPillarMatch = calculatePillarSimilarity(userBazi.monthPillar, celebrityBazi.monthPillar);
  const dayPillarMatch = calculatePillarSimilarity(userBazi.dayPillar, celebrityBazi.dayPillar);
  const hourPillarMatch = calculatePillarSimilarity(userBazi.hourPillar, celebrityBazi.hourPillar);

  // 2. 计算五行平衡相似度
  const elementBalance = calculateElementBalance(userBazi, celebrityBazi);

  // 3. 计算加权总分
  const overallScore = Math.min(
    yearPillarMatch * WEIGHTS.yearPillar +
    monthPillarMatch * WEIGHTS.monthPillar +
    dayPillarMatch * WEIGHTS.dayPillar +
    hourPillarMatch * WEIGHTS.hourPillar +
    elementBalance * WEIGHTS.dayMaster,
    95 // 最高95%，留有余地
  );

  // 4. 分析日主关系
  const dayMasterRelation = analyzeDayMasterRelation(userBazi.dayPillar, celebrityBazi.dayPillar);

  // 5. 生成洞察
  const insights = generateSimilarityInsights(userBazi, celebrityBazi, overallScore);

  return {
    overallScore: Math.round(overallScore * 10) / 10,
    yearPillarMatch: Math.round(yearPillarMatch * 10) / 10,
    monthPillarMatch: Math.round(monthPillarMatch * 10) / 10,
    dayPillarMatch: Math.round(dayPillarMatch * 10) / 10,
    hourPillarMatch: Math.round(hourPillarMatch * 10) / 10,
    elementBalance: Math.round(elementBalance * 10) / 10,
    dayMasterRelation,
    insights,
  };
}

/**
 * 计算单柱相似度
 */
function calculatePillarSimilarity(pillar1: string, pillar2: string): number {
  if (!pillar1 || !pillar2 || pillar1.length !== 2 || pillar2.length !== 2) {
    return 0;
  }

  const stem1 = pillar1[0];
  const stem2 = pillar2[0];
  const branch1 = pillar1[1];
  const branch2 = pillar2[1];

  let score = 0;

  // 完全相同 = 100分
  if (pillar1 === pillar2) {
    return 100;
  }

  // 天干相同 = 50分
  if (stem1 === stem2) {
    score += 50;
  } else {
    // 天干五行相同 = 30分
    if (getStemElement(stem1) === getStemElement(stem2)) {
      score += 30;
    } else if (isGeneratingRelation(stem1, stem2)) {
      // 天干相生 = 20分
      score += 20;
    }
  }

  // 地支相同 = 50分
  if (branch1 === branch2) {
    score += 50;
  } else {
    // 地支五行相同 = 30分
    if (getBranchElement(branch1) === getBranchElement(branch2)) {
      score += 30;
    } else if (isBranchCombination(branch1, branch2)) {
      // 地支六合/三合 = 25分
      score += 25;
    } else if (isBranchClash(branch1, branch2)) {
      // 地支相冲 = -10分 (负面影响)
      score -= 10;
    }
  }

  return Math.max(0, Math.min(100, score));
}

/**
 * 获取天干五行
 */
function getStemElement(stem: string): string {
  return STEM_ELEMENTS[stem] || '';
}

/**
 * 获取地支五行
 */
function getBranchElement(branch: string): string {
  return BRANCH_ELEMENTS[branch] || '';
}

/**
 * 判断天干是否相生
 */
function isGeneratingRelation(stem1: string, stem2: string): boolean {
  const element1 = getStemElement(stem1);
  const element2 = getStemElement(stem2);
  return GENERATING_RELATIONS[element1] === element2 || GENERATING_RELATIONS[element2] === element1;
}

/**
 * 判断地支是否六合或三合
 */
function isBranchCombination(branch1: string, branch2: string): boolean {
  // 六合
  if (SIX_COMBINATIONS[branch1] === branch2) {
    return true;
  }

  // 三合（需要检查是否在同一局中）
  for (const combo of Object.values(TRIPLE_COMBINATIONS)) {
    if (combo.includes(branch1) && combo.includes(branch2)) {
      return true;
    }
  }

  return false;
}

/**
 * 判断地支是否相冲
 */
function isBranchClash(branch1: string, branch2: string): boolean {
  return SIX_CLASHES[branch1] === branch2;
}

/**
 * 计算五行平衡相似度
 */
function calculateElementBalance(bazi1: BaziData, bazi2: BaziData): number {
  // 统计两个八字的五行分布
  const elements1 = countElements(bazi1);
  const elements2 = countElements(bazi2);

  // 计算五行分布的相似度
  let similarity = 0;
  const elements = ['木', '火', '土', '金', '水'];

  for (const element of elements) {
    const count1 = elements1[element] || 0;
    const count2 = elements2[element] || 0;
    // 使用归一化的差值
    const diff = Math.abs(count1 - count2);
    similarity += (8 - diff) / 8; // 最大差值为8（完全不同）
  }

  return (similarity / elements.length) * 100;
}

/**
 * 统计八字中的五行分布
 */
function countElements(bazi: BaziData): Record<string, number> {
  const counts: Record<string, number> = {};
  const pillars = [bazi.yearPillar, bazi.monthPillar, bazi.dayPillar, bazi.hourPillar];

  for (const pillar of pillars) {
    if (pillar && pillar.length === 2) {
      const stemElement = getStemElement(pillar[0]);
      const branchElement = getBranchElement(pillar[1]);

      counts[stemElement] = (counts[stemElement] || 0) + 1;
      counts[branchElement] = (counts[branchElement] || 0) + 1;
    }
  }

  return counts;
}

/**
 * 分析日主关系
 */
function analyzeDayMasterRelation(dayPillar1: string, dayPillar2: string): string {
  if (!dayPillar1 || !dayPillar2 || dayPillar1.length !== 2 || dayPillar2.length !== 2) {
    return '无法分析';
  }

  const stem1 = dayPillar1[0];
  const stem2 = dayPillar2[0];

  if (stem1 === stem2) {
    return '日主完全相同';
  }

  const element1 = getStemElement(stem1);
  const element2 = getStemElement(stem2);

  if (element1 === element2) {
    return '日主五行相同（比肩）';
  }

  if (GENERATING_RELATIONS[element1] === element2) {
    return '你生对方（食伤关系）';
  }

  if (GENERATING_RELATIONS[element2] === element1) {
    return '对方生你（印星关系）';
  }

  if (CONTROLLING_RELATIONS[element1] === element2) {
    return '你克对方（财星关系）';
  }

  if (CONTROLLING_RELATIONS[element2] === element1) {
    return '对方克你（官杀关系）';
  }

  return '五行关系复杂';
}

/**
 * 生成相似度洞察
 */
function generateSimilarityInsights(
  userBazi: BaziData,
  celebrityBazi: BaziData,
  overallScore: number
): string[] {
  const insights: string[] = [];

  // 根据总体相似度给出总结
  if (overallScore >= 80) {
    insights.push('你们的八字格局高度相似，命运轨迹可能有诸多共同点');
  } else if (overallScore >= 60) {
    insights.push('你们的八字有一定相似性，可参考对方的人生经验');
  } else if (overallScore >= 40) {
    insights.push('你们的八字存在部分相似，但差异也较明显');
  } else {
    insights.push('你们的八字差异较大，参考价值有限');
  }

  // 分析日柱
  if (userBazi.dayPillar === celebrityBazi.dayPillar) {
    insights.push('日柱完全相同，核心性格与能量模式极为相似');
  } else if (calculatePillarSimilarity(userBazi.dayPillar, celebrityBazi.dayPillar) >= 50) {
    insights.push('日柱相似度高，性格特质与人生态度有共通之处');
  }

  // 分析月柱
  if (userBazi.monthPillar === celebrityBazi.monthPillar) {
    insights.push('月柱相同，成长环境与青年时期的经历可能相似');
  }

  // 分析五行分布
  const elements1 = countElements(userBazi);
  const elements2 = countElements(celebrityBazi);

  const dominantElement1 = Object.keys(elements1).reduce((a, b) =>
    (elements1[a] || 0) > (elements1[b] || 0) ? a : b
  );
  const dominantElement2 = Object.keys(elements2).reduce((a, b) =>
    (elements2[a] || 0) > (elements2[b] || 0) ? a : b
  );

  if (dominantElement1 === dominantElement2) {
    insights.push(`你们都偏重${dominantElement1}行，能量场相近`);
  }

  // 添加免责声明
  insights.push('⚠️ 相似度仅供参考，命运由多种因素共同决定');

  return insights;
}

/**
 * 辅助函数：从完整八字提取数据
 */
export function extractBaziData(bazi: {
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string
}): BaziData {
  return {
    yearPillar: bazi.yearPillar,
    monthPillar: bazi.monthPillar,
    dayPillar: bazi.dayPillar,
    hourPillar: bazi.hourPillar,
  };
}
