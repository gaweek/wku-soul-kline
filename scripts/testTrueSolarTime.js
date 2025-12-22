/**
 * 真太阳时计算准确性测试
 *
 * 验证各城市的经度偏移计算是否准确
 * 公式: 真太阳时偏移 = (经度 - 120) * 4 分钟
 */

import {
  CHINA_REGIONS,
  calculateTrueSolarTimeOffset,
  getLocationCoordinates,
  searchLocation,
} from '../data/chinaCities.js';

// 测试用例：各地标准经度和预期偏移
const TEST_CASES = [
  // 东部城市 (正偏移，时间早于北京)
  { name: '上海', expectedLongitude: 121.47, expectedOffset: 6 },   // (121.47-120)*4 ≈ 6分钟
  { name: '杭州', expectedLongitude: 120.15, expectedOffset: 1 },   // 几乎与北京时间一致
  { name: '哈尔滨', expectedLongitude: 126.64, expectedOffset: 27 }, // 东部，快约27分钟

  // 中部城市 (小偏移)
  { name: '北京', expectedLongitude: 116.41, expectedOffset: -14 }, // (116.41-120)*4 ≈ -14分钟
  { name: '武汉', expectedLongitude: 114.31, expectedOffset: -23 }, // (114.31-120)*4 ≈ -23分钟
  { name: '西安', expectedLongitude: 108.95, expectedOffset: -44 }, // (108.95-120)*4 ≈ -44分钟

  // 西部城市 (大负偏移，时间晚于北京)
  { name: '成都', expectedLongitude: 104.07, expectedOffset: -64 }, // (104.07-120)*4 ≈ -64分钟 (约1小时4分)
  { name: '昆明', expectedLongitude: 102.71, expectedOffset: -69 }, // 约1小时9分
  { name: '乌鲁木齐', expectedLongitude: 87.62, expectedOffset: -130 }, // 约2小时10分
  { name: '拉萨', expectedLongitude: 91.12, expectedOffset: -116 }, // 约1小时56分
];

console.log('═'.repeat(70));
console.log('  真太阳时计算准确性测试');
console.log('═'.repeat(70));
console.log('');
console.log('说明: 中国标准时间基于东经120°，各地真太阳时与北京时间有偏差');
console.log('公式: 真太阳时偏移(分钟) = (当地经度 - 120) × 4');
console.log('');
console.log('─'.repeat(70));

let passCount = 0;
let failCount = 0;

for (const testCase of TEST_CASES) {
  // 搜索城市
  const results = searchLocation(testCase.name);
  const location = results[0];

  if (!location) {
    console.log(`❌ ${testCase.name}: 未找到该城市`);
    failCount++;
    continue;
  }

  // 计算偏移
  const actualOffset = calculateTrueSolarTimeOffset(location.longitude);
  const expectedOffset = testCase.expectedOffset;
  const longitudeDiff = Math.abs(location.longitude - testCase.expectedLongitude);
  const offsetDiff = Math.abs(actualOffset - expectedOffset);

  // 允许2分钟误差（经度数据可能略有不同）
  const isAccurate = offsetDiff <= 2;

  if (isAccurate) {
    console.log(`✅ ${testCase.name.padEnd(8)} | 经度: ${location.longitude.toFixed(2)}° | 偏移: ${actualOffset >= 0 ? '+' : ''}${actualOffset}分钟`);
    passCount++;
  } else {
    console.log(`❌ ${testCase.name.padEnd(8)} | 经度: ${location.longitude.toFixed(2)}° | 计算偏移: ${actualOffset}分钟 | 预期: ${expectedOffset}分钟`);
    failCount++;
  }
}

console.log('');
console.log('─'.repeat(70));
console.log(`测试结果: 通过 ${passCount}/${TEST_CASES.length}, 失败 ${failCount}/${TEST_CASES.length}`);
console.log('─'.repeat(70));

// 额外测试：边界时间转换示例
console.log('');
console.log('═'.repeat(70));
console.log('  示例：时辰边界影响演示');
console.log('═'.repeat(70));
console.log('');

const EXAMPLES = [
  { city: '乌鲁木齐', clockTime: '12:00', description: '钟表显示中午12点' },
  { city: '乌鲁木齐', clockTime: '23:30', description: '钟表显示晚上23:30' },
  { city: '北京', clockTime: '23:30', description: '钟表显示晚上23:30' },
  { city: '上海', clockTime: '23:30', description: '钟表显示晚上23:30' },
];

for (const example of EXAMPLES) {
  const results = searchLocation(example.city);
  const location = results[0];
  if (!location) continue;

  const offset = calculateTrueSolarTimeOffset(location.longitude);
  const [h, m] = example.clockTime.split(':').map(Number);
  let trueSolarMinute = m + offset;
  let trueSolarHour = h;

  while (trueSolarMinute >= 60) {
    trueSolarHour++;
    trueSolarMinute -= 60;
  }
  while (trueSolarMinute < 0) {
    trueSolarHour--;
    trueSolarMinute += 60;
  }
  while (trueSolarHour >= 24) {
    trueSolarHour -= 24;
  }
  while (trueSolarHour < 0) {
    trueSolarHour += 24;
  }

  // 判断时辰
  const getShiChen = (hour) => {
    const shiChen = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
    return shiChen[hour] + '时';
  };

  const clockShiChen = getShiChen(h);
  const trueShiChen = getShiChen(trueSolarHour);

  const trueSolarTimeStr = `${String(trueSolarHour).padStart(2, '0')}:${String(Math.round(trueSolarMinute)).padStart(2, '0')}`;
  const shiChenChanged = clockShiChen !== trueShiChen ? '⚠️ 时辰变化!' : '';

  console.log(`📍 ${example.city} (东经${location.longitude.toFixed(1)}°)`);
  console.log(`   ${example.description}`);
  console.log(`   钟表时间: ${example.clockTime} (${clockShiChen}) → 真太阳时: ${trueSolarTimeStr} (${trueShiChen}) ${shiChenChanged}`);
  console.log('');
}

console.log('═'.repeat(70));
console.log('  测试完成');
console.log('═'.repeat(70));
