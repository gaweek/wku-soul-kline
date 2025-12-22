// 60 JiaZi Table
const TIAN_GAN = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const DI_ZHI = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

const JIA_ZI = [];
for (let i = 0; i < 60; i++) {
  JIA_ZI.push(TIAN_GAN[i % 10] + DI_ZHI[i % 12]);
}

/**
 * Generates the 100-year life skeleton based on pre-calculated Bazi pillars
 * This avoids the need for full birth date (month/day/hour) and timezone issues on the server
 * by trusting the client-side calculated pillars and start age.
 * 
 * @param {object} input - The input object containing bazi info
 * @returns {object} Skeleton data with timeline
 */
export const calculateLifeTimeline = (input) => {
  const {
    birthYear,
    gender,
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    startAge,
    firstDaYun
  } = input;

  const bazi = [yearPillar, monthPillar, dayPillar, hourPillar];
  const startAgeInt = parseInt(startAge, 10);
  const birthYearInt = parseInt(birthYear, 10);

  // 1. Determine Direction of DaYun
  // Yang Stems: 甲, 丙, 戊, 庚, 壬
  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  const yearStem = yearPillar.charAt(0);
  const isYangYear = yangStems.includes(yearStem);
  
  // Gender: Male=1, Female=0
  // Male: Yang->Forward, Yin->Backward
  // Female: Yang->Backward, Yin->Forward
  const isMale = gender === 'Male';
  let isForward = false;
  if (isMale) {
    isForward = isYangYear;
  } else {
    isForward = !isYangYear; 
  }

  // 2. Generate DaYun Sequence
  let daYunIndex = JIA_ZI.indexOf(firstDaYun);
  if (daYunIndex === -1) {
    console.warn('First DaYun not found in JiaZi:', firstDaYun);
    daYunIndex = 0; 
  }

  const daYunList = [];
  // Generate enough steps for 100+ years (12 steps * 10 years = 120 years)
  for (let i = 0; i < 15; i++) {
    let idx;
    if (isForward) {
      idx = (daYunIndex + i) % 60;
    } else {
      idx = (daYunIndex - i) % 60;
      if (idx < 0) idx += 60;
    }
    daYunList.push(JIA_ZI[idx]);
  }

  // 3. Generate 1-100 Timeline
  const timeline = [];
  
  // Calculate Base Year GanZhi index (Calendar Year)
  // 1984 was 甲子 (Index 0)
  // We align 1984 to 0.
  let baseYearGanZhiIndex = (birthYearInt - 1984) % 60;
  if (baseYearGanZhiIndex < 0) baseYearGanZhiIndex += 60;

  for (let age = 1; age <= 100; age++) {
    const currentYear = birthYearInt + (age - 1);
    
    // Calculate Year GanZhi
    const yearIdx = (baseYearGanZhiIndex + (age - 1)) % 60;
    const ganZhi = JIA_ZI[yearIdx];

    // Determine DaYun
    let daYunStr = "童限";
    if (age >= startAgeInt) {
      // Calculate which step of DaYun
      const daYunStep = Math.floor((age - startAgeInt) / 10);
      if (daYunStep < daYunList.length) {
        daYunStr = daYunList[daYunStep];
      } else {
        daYunStr = "晚运";
      }
    }

    timeline.push({
      age,
      year: currentYear,
      ganZhi,
      daYun: daYunStr
    });
  }

  return {
    bazi,
    startAge: startAgeInt,
    direction: isForward ? '顺行' : '逆行',
    timeline
  };
};

/**
 * 生成降级K线数据（当AI Agent失败时使用）
 * 基于命理规则计算基础评分
 * @param {object} skeletonData - 时间线骨架数据
 * @returns {Array} K线数据点数组
 */
export const generateFallbackKLine = (skeletonData) => {
  const { bazi, timeline } = skeletonData;
  const dayPillar = bazi[2]; // 日柱
  const dayMaster = dayPillar[0]; // 日主天干
  const dayBranch = dayPillar[1]; // 日支

  // 天干五行
  const stemElement = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };

  // 地支六冲
  const branchClashes = [
    ['子', '午'], ['丑', '未'], ['寅', '申'],
    ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
  ];

  // 地支六合
  const branchCombinations = [
    ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
    ['辰', '酉'], ['巳', '申'], ['午', '未']
  ];

  // 五行相生
  const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  // 五行相克
  const controls = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  const dayMasterElement = stemElement[dayMaster];

  // 检查地支关系
  const checkBranchRelation = (branch1, branch2) => {
    for (const clash of branchClashes) {
      if (clash.includes(branch1) && clash.includes(branch2)) return 'clash';
    }
    for (const combo of branchCombinations) {
      if (combo.includes(branch1) && combo.includes(branch2)) return 'combination';
    }
    if (branch1 === branch2) return 'same';
    return 'neutral';
  };

  // 生成降级批断文本
  const generateReason = (ganZhi, daYun, score) => {
    let reason = `${ganZhi}年`;

    if (daYun && daYun !== '童限' && daYun !== '晚运') {
      reason += `，行${daYun}大运`;
    }

    if (score >= 75) {
      reason += '。运势大吉，贵人相助，诸事顺遂。宜把握机遇，积极进取。';
    } else if (score >= 60) {
      reason += '。运势平顺，稳中有升。宜稳扎稳打，循序渐进。';
    } else if (score >= 45) {
      reason += '。运势平平，宜守不宜攻。注意人际关系，避免冲突。';
    } else if (score >= 30) {
      reason += '。运势偏弱，多有阻滞。宜保守行事，静待时机。';
    } else {
      reason += '。运势低迷，诸事不顺。宜韬光养晦，修身养性，切忌冒进。';
    }

    return reason;
  };

  // 计算单年评分
  const calculateYearScore = (yearGanZhi, daYun) => {
    const yearStem = yearGanZhi[0];
    const yearBranch = yearGanZhi[1];
    const yearElement = stemElement[yearStem];

    let score = 50; // 基础分

    // 1. 流年天干与日主的关系 (±15分)
    if (yearStem === dayMaster) {
      score += 8; // 比肩
    } else if (yearElement === dayMasterElement) {
      score += 5; // 同五行
    } else if (generates[dayMasterElement] === yearElement) {
      score += 10; // 食伤（日主生流年）
    } else if (controls[dayMasterElement] === yearElement) {
      score += 15; // 财星（日主克流年）
    } else if (generates[yearElement] === dayMasterElement) {
      score += 8; // 印星（流年生日主）
    } else if (controls[yearElement] === dayMasterElement) {
      score -= 12; // 官杀（流年克日主）
    }

    // 2. 流年地支与日支的关系 (±20分)
    const branchRel = checkBranchRelation(dayBranch, yearBranch);
    if (branchRel === 'clash') {
      score -= 18;
    } else if (branchRel === 'combination') {
      score += 15;
    } else if (branchRel === 'same') {
      score += 5;
    }

    // 3. 大运影响 (±10分)
    if (daYun && daYun !== '童限' && daYun !== '晚运') {
      const daYunStem = daYun[0];
      const daYunBranch = daYun[1];
      const daYunElement = stemElement[daYunStem];

      // 大运天干
      if (generates[dayMasterElement] === daYunElement || controls[dayMasterElement] === daYunElement) {
        score += 8;
      } else if (controls[daYunElement] === dayMasterElement) {
        score -= 8;
      }

      // 大运地支与流年地支
      const daYunYearRel = checkBranchRelation(daYunBranch, yearBranch);
      if (daYunYearRel === 'clash') {
        score -= 10;
      } else if (daYunYearRel === 'combination') {
        score += 10;
      }
    }

    // 4. 添加随机波动 (±5分，基于年份确定性随机)
    const yearHash = yearGanZhi.charCodeAt(0) + yearGanZhi.charCodeAt(1);
    const variation = ((yearHash * 7) % 11) - 5;
    score += variation;

    // 限制在20-95范围
    return Math.max(20, Math.min(95, Math.round(score)));
  };

  // 生成K线数据
  return timeline.map(item => {
    const score = calculateYearScore(item.ganZhi, item.daYun);

    // 生成OHLC数据
    const volatility = Math.abs(score - 50) / 10 + 3;
    const high = Math.min(100, score + Math.round(volatility * 1.5));
    const low = Math.max(0, score - Math.round(volatility * 1.2));

    // open和close决定K线颜色
    const isPositive = score >= 50;
    const open = isPositive ? score - Math.round(volatility * 0.3) : score + Math.round(volatility * 0.3);
    const close = score;

    return {
      age: item.age,
      year: item.year,
      ganZhi: item.ganZhi,
      daYun: item.daYun,
      open: Math.max(low, Math.min(high, open)),
      close: close,
      high: high,
      low: low,
      score: score,
      reason: generateReason(item.ganZhi, item.daYun, score)
    };
  });
};

/**
 * 计算月份干支
 * 月干支基于年干和月份
 * @param {number} year - 年份
 * @param {number} month - 月份（1-12）
 * @returns {string} 月干支
 */
const calculateMonthGanZhi = (year, month) => {
  // 农历月份对应的地支
  const monthBranches = ['寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥', '子', '丑'];

  // 计算年干
  const yearStemIndex = (year - 4) % 10;
  if (yearStemIndex < 0) yearStemIndex + 10;

  // 年上起月法：甲己之年丙作首...
  const monthStemBaseMap = {
    '甲': 2, '己': 2,  // 丙寅
    '乙': 4, '庚': 4,  // 戊寅
    '丙': 6, '辛': 6,  // 庚寅
    '丁': 8, '壬': 8,  // 壬寅
    '戊': 0, '癸': 0   // 甲寅
  };

  const yearStem = TIAN_GAN[yearStemIndex];
  const baseStemIndex = monthStemBaseMap[yearStem];

  // 月份1-12对应寅月到丑月
  const adjustedMonth = month; // 已经是1-12
  const monthStemIndex = (baseStemIndex + adjustedMonth - 1) % 10;
  const monthBranch = monthBranches[adjustedMonth - 1];

  return TIAN_GAN[monthStemIndex] + monthBranch;
};

/**
 * 生成36个月的时间轴骨架
 * @param {object} input - 包含八字信息的输入
 * @param {number} centerYear - 中心年份（通常是当前年）
 * @returns {object} 36个月的时间轴数据
 */
export const calculate36MonthTimeline = (input, centerYear) => {
  const {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    gender,
    startAge,
    birthYear
  } = input;

  const bazi = [yearPillar, monthPillar, dayPillar, hourPillar];
  const startAgeInt = parseInt(startAge, 10) || 0;
  const birthYearInt = parseInt(birthYear, 10);

  // 计算大运列表
  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  const yearStem = yearPillar.charAt(0);
  const isYangYear = yangStems.includes(yearStem);
  const isMale = gender === 'Male';
  let isForward = isMale ? isYangYear : !isYangYear;

  // 计算大运序列
  const monthStem = monthPillar.charAt(0);
  const monthBranch = monthPillar.charAt(1);
  let monthStemIdx = TIAN_GAN.indexOf(monthStem);
  let monthBranchIdx = DI_ZHI.indexOf(monthBranch);

  const daYunList = [];
  for (let i = 0; i < 12; i++) {
    if (isForward) {
      monthStemIdx = (monthStemIdx + 1) % 10;
      monthBranchIdx = (monthBranchIdx + 1) % 12;
    } else {
      monthStemIdx = (monthStemIdx - 1 + 10) % 10;
      monthBranchIdx = (monthBranchIdx - 1 + 12) % 12;
    }
    daYunList.push(TIAN_GAN[monthStemIdx] + DI_ZHI[monthBranchIdx]);
  }

  const timeline = [];

  // 前一年12月 + 当年全年12月 + 后一年12月 = 36个月
  const years = [centerYear - 1, centerYear, centerYear + 1];

  for (const year of years) {
    for (let month = 1; month <= 12; month++) {
      const age = year - birthYearInt + 1;
      const ganZhi = calculateMonthGanZhi(year, month);

      // 年干支
      let yearGanZhiIndex = (year - 1984) % 60;
      if (yearGanZhiIndex < 0) yearGanZhiIndex += 60;
      const liuNian = JIA_ZI[yearGanZhiIndex];

      // 大运
      let daYunStr = "童限";
      if (age >= startAgeInt) {
        const daYunStep = Math.floor((age - startAgeInt) / 10);
        if (daYunStep < daYunList.length) {
          daYunStr = daYunList[daYunStep];
        } else {
          daYunStr = "晚运";
        }
      }

      timeline.push({
        year,
        month,
        age: Math.max(1, age),
        ganZhi,
        liuNian,
        daYun: daYunStr
      });
    }
  }

  return {
    bazi,
    startAge: startAgeInt,
    direction: isForward ? '顺行' : '逆行',
    timeline
  };
};

/**
 * 生成36月K线数据的降级算法
 * @param {object} skeletonData - 36月时间轴骨架
 * @returns {Array} 月度K线数据点
 */
export const generate36MonthFallbackKLine = (skeletonData) => {
  const { bazi, timeline } = skeletonData;
  const dayPillar = bazi[2];
  const dayMaster = dayPillar[0];
  const dayBranch = dayPillar[1];

  const stemElement = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };

  const branchClashes = [
    ['子', '午'], ['丑', '未'], ['寅', '申'],
    ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
  ];

  const branchCombinations = [
    ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
    ['辰', '酉'], ['巳', '申'], ['午', '未']
  ];

  const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const controls = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  const calculateMonthScore = (monthGanZhi, liuNian, daYun) => {
    let score = 55;
    const monthStem = monthGanZhi[0];
    const monthBranch = monthGanZhi[1];
    const dayElement = stemElement[dayMaster];
    const monthElement = stemElement[monthStem];

    // 月干支与日主的关系
    if (generates[monthElement] === dayElement) {
      score += 12; // 月支生日主
    }
    if (generates[dayElement] === monthElement) {
      score += 5; // 日主生月支（泄气）
    }
    if (controls[monthElement] === dayElement) {
      score -= 10; // 月支克日主
    }
    if (controls[dayElement] === monthElement) {
      score += 8; // 日主克月支（财星）
    }

    // 月支冲突
    for (const clash of branchClashes) {
      if (clash.includes(monthBranch) && clash.includes(dayBranch)) {
        score -= 15;
        break;
      }
    }

    // 月支合
    for (const combo of branchCombinations) {
      if (combo.includes(monthBranch) && combo.includes(dayBranch)) {
        score += 10;
        break;
      }
    }

    // 流年影响
    if (liuNian) {
      const liuNianStem = liuNian[0];
      const liuNianElement = stemElement[liuNianStem];
      if (generates[liuNianElement] === dayElement) {
        score += 5;
      }
      if (controls[liuNianElement] === dayElement) {
        score -= 5;
      }
    }

    // 添加随机波动
    score += Math.floor(Math.random() * 10 - 5);

    return Math.max(25, Math.min(90, score));
  };

  const monthKeywords = [
    '新年开局', '蓄势待发', '春暖花开', '贵人月',
    '拼搏月', '转折月', '收获月', '调整月',
    '机遇月', '平稳月', '冲刺月', '收官月'
  ];

  return timeline.map(item => {
    const score = calculateMonthScore(item.ganZhi, item.liuNian, item.daYun);

    const volatility = Math.abs(score - 55) / 10 + 3;
    const high = Math.min(95, score + Math.round(volatility * 1.5));
    const low = Math.max(20, score - Math.round(volatility * 1.2));

    const isPositive = score >= 55;
    const open = isPositive ? score - Math.round(volatility * 0.3) : score + Math.round(volatility * 0.3);

    const keyword = monthKeywords[(item.month - 1) % 12];

    return {
      year: item.year,
      month: item.month,
      age: item.age,
      ganZhi: item.ganZhi,
      liuNian: item.liuNian,
      daYun: item.daYun,
      open: Math.max(low, Math.min(high, open)),
      close: score,
      high: high,
      low: low,
      score: score,
      keyword: keyword,
      summary: `${item.year}年${item.month}月 ${item.ganZhi}月，${score >= 70 ? '吉' : score >= 50 ? '平' : '凶'}。`
    };
  });
};

/**
 * 生成7个月的时间轴骨架 (当前月前后各3个月)
 * @param {object} input - 包含八字信息的输入
 * @param {number} centerYear - 中心年份
 * @param {number} centerMonth - 中心月份 (1-12)
 * @returns {object} 7个月的时间轴数据
 */
export const calculate7MonthTimeline = (input, centerYear, centerMonth) => {
  const {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    gender,
    startAge,
    birthYear
  } = input;

  const bazi = [yearPillar, monthPillar, dayPillar, hourPillar];
  const startAgeInt = parseInt(startAge, 10) || 0;
  const birthYearInt = parseInt(birthYear, 10);

  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  const yearStem = yearPillar.charAt(0);
  const isYangYear = yangStems.includes(yearStem);
  const isMale = gender === 'Male';
  let isForward = isMale ? isYangYear : !isYangYear;

  const monthStem = monthPillar.charAt(0);
  const monthBranch = monthPillar.charAt(1);
  let monthStemIdx = TIAN_GAN.indexOf(monthStem);
  let monthBranchIdx = DI_ZHI.indexOf(monthBranch);

  const daYunList = [];
  for (let i = 0; i < 12; i++) {
    if (isForward) {
      monthStemIdx = (monthStemIdx + 1) % 10;
      monthBranchIdx = (monthBranchIdx + 1) % 12;
    } else {
      monthStemIdx = (monthStemIdx - 1 + 10) % 10;
      monthBranchIdx = (monthBranchIdx - 1 + 12) % 12;
    }
    daYunList.push(TIAN_GAN[monthStemIdx] + DI_ZHI[monthBranchIdx]);
  }

  const timeline = [];

  // 生成前3月 + 当月 + 后3月 = 7个月
  for (let offset = -3; offset <= 3; offset++) {
    let year = centerYear;
    let month = centerMonth + offset;

    if (month < 1) {
      year--;
      month += 12;
    } else if (month > 12) {
      year++;
      month -= 12;
    }

    const age = year - birthYearInt + 1;
    const ganZhi = calculateMonthGanZhi(year, month);

    let yearGanZhiIndex = (year - 1984) % 60;
    if (yearGanZhiIndex < 0) yearGanZhiIndex += 60;
    const liuNian = JIA_ZI[yearGanZhiIndex];

    let daYunStr = "童限";
    if (age >= startAgeInt) {
      const daYunStep = Math.floor((age - startAgeInt) / 10);
      if (daYunStep < daYunList.length) {
        daYunStr = daYunList[daYunStep];
      } else {
        daYunStr = "晚运";
      }
    }

    timeline.push({
      year,
      month,
      age: Math.max(1, age),
      ganZhi,
      liuNian,
      daYun: daYunStr,
      isCurrent: offset === 0
    });
  }

  return {
    bazi,
    startAge: startAgeInt,
    direction: isForward ? '顺行' : '逆行',
    timeline
  };
};

/**
 * 计算日干支
 * @param {number} year - 年份
 * @param {number} month - 月份 (1-12)
 * @param {number} day - 日期 (1-31)
 * @returns {string} 日干支
 */
const calculateDayGanZhi = (year, month, day) => {
  // 使用日柱计算公式
  // 基于1900年1月1日是甲戌日 (index 10)
  const baseDate = new Date(1900, 0, 1);
  const targetDate = new Date(year, month - 1, day);
  const diffDays = Math.floor((targetDate - baseDate) / (1000 * 60 * 60 * 24));

  let dayIdx = (diffDays + 10) % 60; // 1900/1/1 是甲戌日(index 10)
  if (dayIdx < 0) dayIdx += 60;

  return JIA_ZI[dayIdx];
};

/**
 * 生成61天的时间轴骨架 (今天前后各30天)
 * @param {object} input - 包含八字信息的输入
 * @param {string} centerDate - 中心日期 (YYYY-MM-DD)
 * @returns {object} 61天的时间轴数据
 */
export const calculate61DayTimeline = (input, centerDate) => {
  const {
    yearPillar,
    monthPillar,
    dayPillar,
    hourPillar,
    gender,
    startAge,
    birthYear
  } = input;

  const bazi = [yearPillar, monthPillar, dayPillar, hourPillar];
  const startAgeInt = parseInt(startAge, 10) || 0;
  const birthYearInt = parseInt(birthYear, 10);

  const yangStems = ['甲', '丙', '戊', '庚', '壬'];
  const yearStem = yearPillar.charAt(0);
  const isYangYear = yangStems.includes(yearStem);
  const isMale = gender === 'Male';
  let isForward = isMale ? isYangYear : !isYangYear;

  const monthStem = monthPillar.charAt(0);
  const monthBranch = monthPillar.charAt(1);
  let monthStemIdx = TIAN_GAN.indexOf(monthStem);
  let monthBranchIdx = DI_ZHI.indexOf(monthBranch);

  const daYunList = [];
  for (let i = 0; i < 12; i++) {
    if (isForward) {
      monthStemIdx = (monthStemIdx + 1) % 10;
      monthBranchIdx = (monthBranchIdx + 1) % 12;
    } else {
      monthStemIdx = (monthStemIdx - 1 + 10) % 10;
      monthBranchIdx = (monthBranchIdx - 1 + 12) % 12;
    }
    daYunList.push(TIAN_GAN[monthStemIdx] + DI_ZHI[monthBranchIdx]);
  }

  const centerDateObj = new Date(centerDate);
  const timeline = [];

  // 生成前30天 + 今天 + 后30天 = 61天
  for (let offset = -30; offset <= 30; offset++) {
    const date = new Date(centerDateObj);
    date.setDate(date.getDate() + offset);

    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    const age = year - birthYearInt + 1;
    const dayGanZhi = calculateDayGanZhi(year, month, day);
    const monthGanZhi = calculateMonthGanZhi(year, month);

    let yearGanZhiIndex = (year - 1984) % 60;
    if (yearGanZhiIndex < 0) yearGanZhiIndex += 60;
    const liuNian = JIA_ZI[yearGanZhiIndex];

    let daYunStr = "童限";
    if (age >= startAgeInt) {
      const daYunStep = Math.floor((age - startAgeInt) / 10);
      if (daYunStep < daYunList.length) {
        daYunStr = daYunList[daYunStep];
      } else {
        daYunStr = "晚运";
      }
    }

    timeline.push({
      date: dateStr,
      year,
      month,
      day,
      age: Math.max(1, age),
      ganZhi: dayGanZhi,
      monthGanZhi,
      liuNian,
      daYun: daYunStr,
      isCurrent: offset === 0
    });
  }

  return {
    bazi,
    startAge: startAgeInt,
    direction: isForward ? '顺行' : '逆行',
    timeline
  };
};

/**
 * 生成7月K线数据的降级算法 (详细版)
 */
export const generate7MonthFallbackKLine = (skeletonData) => {
  const { bazi, timeline } = skeletonData;
  const dayPillar = bazi[2];
  const dayMaster = dayPillar[0];
  const dayBranch = dayPillar[1];

  const stemElement = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };

  const branchClashes = [
    ['子', '午'], ['丑', '未'], ['寅', '申'],
    ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
  ];

  const branchCombinations = [
    ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
    ['辰', '酉'], ['巳', '申'], ['午', '未']
  ];

  const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const controls = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  const calculateMonthScore = (monthGanZhi, liuNian, daYun) => {
    let score = 55;
    const monthStem = monthGanZhi[0];
    const monthBranch = monthGanZhi[1];
    const dayElement = stemElement[dayMaster];
    const monthElement = stemElement[monthStem];

    if (generates[monthElement] === dayElement) score += 12;
    if (generates[dayElement] === monthElement) score += 5;
    if (controls[monthElement] === dayElement) score -= 10;
    if (controls[dayElement] === monthElement) score += 8;

    for (const clash of branchClashes) {
      if (clash.includes(monthBranch) && clash.includes(dayBranch)) {
        score -= 15;
        break;
      }
    }

    for (const combo of branchCombinations) {
      if (combo.includes(monthBranch) && combo.includes(dayBranch)) {
        score += 10;
        break;
      }
    }

    if (liuNian) {
      const liuNianStem = liuNian[0];
      const liuNianElement = stemElement[liuNianStem];
      if (generates[liuNianElement] === dayElement) score += 5;
      if (controls[liuNianElement] === dayElement) score -= 5;
    }

    score += Math.floor(Math.random() * 10 - 5);
    return Math.max(20, Math.min(95, score));
  };

  const monthKeywords = [
    '新年开局', '蓄势待发', '春暖花开', '贵人月',
    '拼搏月', '转折月', '收获月', '调整月',
    '机遇月', '平稳月', '冲刺月', '收官月'
  ];

  const yiActivities = ['签约', '投资', '社交', '学习', '出行', '谈判'];
  const jiActivities = ['诉讼', '搬迁', '手术', '冒险', '借贷', '远行'];

  return timeline.map(item => {
    const score = calculateMonthScore(item.ganZhi, item.liuNian, item.daYun);

    const volatility = Math.abs(score - 55) / 10 + 3;
    const high = Math.min(95, score + Math.round(volatility * 1.5));
    const low = Math.max(20, score - Math.round(volatility * 1.2));

    const isPositive = score >= 55;
    const open = isPositive ? score - Math.round(volatility * 0.3) : score + Math.round(volatility * 0.3);

    const keyword = monthKeywords[(item.month - 1) % 12];

    // 根据评分生成宜忌
    const numYi = score >= 70 ? 3 : score >= 50 ? 2 : 1;
    const numJi = score <= 40 ? 3 : score <= 60 ? 2 : 1;
    const yi = yiActivities.slice(0, numYi);
    const ji = jiActivities.slice(0, numJi);

    return {
      year: item.year,
      month: item.month,
      age: item.age,
      ganZhi: item.ganZhi,
      liuNian: item.liuNian,
      daYun: item.daYun,
      open: Math.max(low, Math.min(high, open)),
      close: score,
      high: high,
      low: low,
      score: score,
      keyword: keyword,
      summary: `${item.year}年${item.month}月(${item.ganZhi}月)，综合运势${score >= 70 ? '上佳' : score >= 50 ? '平稳' : '需谨慎'}。${item.isCurrent ? '【当前月】' : ''}`,
      advice: {
        yi,
        ji,
        focus: score >= 60 ? '把握机遇，积极进取' : '稳中求进，谨慎行事'
      },
      luckyElements: {
        direction: ['东', '南', '西', '北', '东南', '西南', '东北', '西北'][item.month % 8],
        color: ['红色', '绿色', '蓝色', '黄色', '白色'][score % 5],
        number: [(score % 9) + 1, ((score + 3) % 9) + 1]
      },
      isCurrent: item.isCurrent
    };
  });
};

/**
 * 生成61天K线数据的降级算法
 */
export const generate61DayFallbackKLine = (skeletonData) => {
  const { bazi, timeline } = skeletonData;
  const dayPillar = bazi[2];
  const dayMaster = dayPillar[0];
  const dayBranch = dayPillar[1];

  const stemElement = {
    '甲': '木', '乙': '木',
    '丙': '火', '丁': '火',
    '戊': '土', '己': '土',
    '庚': '金', '辛': '金',
    '壬': '水', '癸': '水'
  };

  const branchClashes = [
    ['子', '午'], ['丑', '未'], ['寅', '申'],
    ['卯', '酉'], ['辰', '戌'], ['巳', '亥']
  ];

  const branchCombinations = [
    ['子', '丑'], ['寅', '亥'], ['卯', '戌'],
    ['辰', '酉'], ['巳', '申'], ['午', '未']
  ];

  const generates = { '木': '火', '火': '土', '土': '金', '金': '水', '水': '木' };
  const controls = { '木': '土', '火': '金', '土': '水', '金': '木', '水': '火' };

  const calculateDayScore = (dayGanZhi, monthGanZhi, liuNian) => {
    let score = 55;
    const dayStem = dayGanZhi[0];
    const dayBranchCurrent = dayGanZhi[1];
    const dayElement = stemElement[dayMaster];
    const currentDayElement = stemElement[dayStem];

    // 流日与日主的关系
    if (generates[currentDayElement] === dayElement) score += 10;
    if (generates[dayElement] === currentDayElement) score += 3;
    if (controls[currentDayElement] === dayElement) score -= 8;
    if (controls[dayElement] === currentDayElement) score += 5;

    // 日支冲
    for (const clash of branchClashes) {
      if (clash.includes(dayBranchCurrent) && clash.includes(dayBranch)) {
        score -= 12;
        break;
      }
    }

    // 日支合
    for (const combo of branchCombinations) {
      if (combo.includes(dayBranchCurrent) && combo.includes(dayBranch)) {
        score += 8;
        break;
      }
    }

    // 月份影响
    if (monthGanZhi) {
      const monthStem = monthGanZhi[0];
      const monthElement = stemElement[monthStem];
      if (generates[monthElement] === dayElement) score += 3;
      if (controls[monthElement] === dayElement) score -= 3;
    }

    score += Math.floor(Math.random() * 8 - 4);
    return Math.max(25, Math.min(90, score));
  };

  const dayQualities = ['大吉', '小吉', '中平', '小凶', '大凶'];
  const weekdays = ['日', '一', '二', '三', '四', '五', '六'];

  return timeline.map(item => {
    const score = calculateDayScore(item.ganZhi, item.monthGanZhi, item.liuNian);

    const volatility = Math.abs(score - 55) / 12 + 2;
    const high = Math.min(90, score + Math.round(volatility * 1.3));
    const low = Math.max(25, score - Math.round(volatility));

    const isPositive = score >= 55;
    const open = isPositive ? score - Math.round(volatility * 0.2) : score + Math.round(volatility * 0.2);

    const quality = score >= 75 ? 'big_up' : score >= 60 ? 'small_up' : score >= 45 ? 'stable' : score >= 35 ? 'small_down' : 'big_down';
    const qualityText = dayQualities[Math.min(4, Math.floor((90 - score) / 15))];

    const dateObj = new Date(item.date);
    const weekday = weekdays[dateObj.getDay()];

    return {
      date: item.date,
      year: item.year,
      month: item.month,
      day: item.day,
      weekday: `周${weekday}`,
      ganZhi: item.ganZhi,
      monthGanZhi: item.monthGanZhi,
      liuNian: item.liuNian,
      daYun: item.daYun,
      open: Math.max(low, Math.min(high, open)),
      close: score,
      high: high,
      low: low,
      score: score,
      quality: quality,
      qualityText: qualityText,
      keyword: qualityText,
      isCurrent: item.isCurrent
    };
  });
};
