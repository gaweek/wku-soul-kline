/**
 * 真太阳时计算测试 (独立版本)
 */

// 计算真太阳时偏移（分钟）
function calculateTrueSolarTimeOffset(longitude) {
  return Math.round((longitude - 120) * 4);
}

// 测试城市数据
const CITIES = [
  { name: '上海', longitude: 121.4737 },
  { name: '杭州', longitude: 120.1536 },
  { name: '哈尔滨', longitude: 126.6424 },
  { name: '北京', longitude: 116.4074 },
  { name: '武汉', longitude: 114.3054 },
  { name: '西安', longitude: 108.9540 },
  { name: '成都', longitude: 104.0657 },
  { name: '昆明', longitude: 102.7123 },
  { name: '乌鲁木齐', longitude: 87.6177 },
  { name: '拉萨', longitude: 91.1172 },
];

console.log('═'.repeat(70));
console.log('  真太阳时计算准确性测试');
console.log('═'.repeat(70));
console.log('');
console.log('说明: 中国标准时间基于东经120°，各地真太阳时与北京时间有偏差');
console.log('公式: 真太阳时偏移(分钟) = (当地经度 - 120) × 4');
console.log('');
console.log('─'.repeat(70));

for (const city of CITIES) {
  const offset = calculateTrueSolarTimeOffset(city.longitude);
  const offsetStr = offset >= 0 ? `+${offset}` : `${offset}`;
  const hours = Math.abs(offset) >= 60 ? Math.floor(Math.abs(offset) / 60) : 0;
  const minutes = Math.abs(offset) % 60;
  const humanReadable = hours > 0
    ? `(${offset > 0 ? '快' : '慢'}${hours}小时${minutes > 0 ? minutes + '分钟' : ''})`
    : `(${offset > 0 ? '快' : '慢'}${Math.abs(offset)}分钟)`;

  console.log(`${city.name.padEnd(8)} | 经度: ${city.longitude.toFixed(2)}° | 偏移: ${offsetStr.padStart(4)}分钟 ${humanReadable}`);
}

console.log('');
console.log('─'.repeat(70));

// 示例：时辰边界影响演示
console.log('');
console.log('═'.repeat(70));
console.log('  示例：时辰边界影响演示');
console.log('═'.repeat(70));
console.log('');

const EXAMPLES = [
  { city: '乌鲁木齐', longitude: 87.6177, clockTime: '12:00', description: '钟表显示中午12点' },
  { city: '乌鲁木齐', longitude: 87.6177, clockTime: '23:30', description: '钟表显示晚上23:30' },
  { city: '北京', longitude: 116.4074, clockTime: '23:30', description: '钟表显示晚上23:30' },
  { city: '上海', longitude: 121.4737, clockTime: '23:30', description: '钟表显示晚上23:30' },
];

// 时辰对照表
const getShiChen = (hour) => {
  const shiChen = ['子', '丑', '丑', '寅', '寅', '卯', '卯', '辰', '辰', '巳', '巳', '午', '午', '未', '未', '申', '申', '酉', '酉', '戌', '戌', '亥', '亥', '子'];
  return shiChen[hour] + '时';
};

for (const example of EXAMPLES) {
  const offset = calculateTrueSolarTimeOffset(example.longitude);
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

  const clockShiChen = getShiChen(h);
  const trueShiChen = getShiChen(trueSolarHour);

  const trueSolarTimeStr = `${String(trueSolarHour).padStart(2, '0')}:${String(Math.round(trueSolarMinute)).padStart(2, '0')}`;
  const shiChenChanged = clockShiChen !== trueShiChen ? '⚠️ 时辰变化!' : '';

  console.log(`📍 ${example.city} (东经${example.longitude.toFixed(1)}°)`);
  console.log(`   ${example.description}`);
  console.log(`   钟表时间: ${example.clockTime} (${clockShiChen}) → 真太阳时: ${trueSolarTimeStr} (${trueShiChen}) ${shiChenChanged}`);
  console.log('');
}

console.log('═'.repeat(70));
console.log('  关键发现');
console.log('═'.repeat(70));
console.log('');
console.log('1. 东部城市（如上海、哈尔滨）真太阳时比北京时间快');
console.log('2. 西部城市（如成都、乌鲁木齐）真太阳时比北京时间慢');
console.log('3. 乌鲁木齐比北京慢约2小时10分钟，时辰差异最大');
console.log('4. 子时边界（23:00-01:00）附近出生者，地点选择尤为重要');
console.log('');
console.log('═'.repeat(70));
