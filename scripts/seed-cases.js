import Database from 'better-sqlite3';
import { nanoid } from 'nanoid';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database(path.join(__dirname, '../server/data/lifekline.db'));

// 示例案例数据
const CASES = [
  {
    title: '早发型：25岁创业成功的程序员',
    persona: '创业者',
    curveType: '早发',
    narrative: '这是一位典型的早发型命局，20-30岁间运势达到高峰。25岁时抓住互联网风口创业成功，但需注意35岁后运势回落，应提前做好财富储备和转型准备。',
    chartData: generateEarlyPeakChart(),
    highlights: [
      { age: 25, type: 'peak', note: '创业黄金期' },
      { age: 35, type: 'transition', note: '大运切换' }
    ]
  },
  {
    title: '晚成型：50岁迎来事业巅峰的企业家',
    persona: '企业家',
    curveType: '晚成',
    narrative: '典型的厚积薄发命局，前半生积累经验和资源，45-55岁迎来人生高光时刻。年轻时不必焦虑，稳扎稳打才是正道。',
    chartData: generateLatePeakChart(),
    highlights: [
      { age: 50, type: 'peak', note: '事业巅峰' },
      { age: 45, type: 'transition', note: '运势上升期开始' }
    ]
  },
  {
    title: '大起大落型：经历过破产又东山再起',
    persona: '交易者',
    curveType: '大起大落',
    narrative: '高波动命局，人生如过山车。30岁第一桶金，35岁破产，42岁东山再起。关键是在高点时落袋为安，在低点时保持韧性。',
    chartData: generateVolatileChart(),
    highlights: [
      { age: 30, type: 'peak', note: '第一桶金' },
      { age: 35, type: 'trough', note: '事业低谷' },
      { age: 42, type: 'recovery', note: '东山再起' }
    ]
  }
];

// 生成不同类型的K线数据
function generateEarlyPeakChart() {
  const points = [];
  for (let age = 1; age <= 80; age++) {
    let score;
    if (age < 20) score = 40 + age * 2;
    else if (age < 30) score = 70 + (age - 20) * 2;
    else if (age < 40) score = 90 - (age - 30) * 3;
    else score = 60 - (age - 40) * 0.5;

    const variance = Math.random() * 10 - 5;
    score = Math.max(20, Math.min(100, score + variance));

    points.push({
      age,
      open: score - 3,
      close: score + 2,
      high: score + 5,
      low: score - 5,
      score: Math.round(score),
      isGreen: Math.random() > 0.4
    });
  }
  return points;
}

function generateLatePeakChart() {
  const points = [];
  for (let age = 1; age <= 80; age++) {
    let score;
    if (age < 30) score = 40 + age * 0.5;
    else if (age < 45) score = 55 + (age - 30) * 1;
    else if (age < 55) score = 70 + (age - 45) * 2;
    else score = 90 - (age - 55) * 1;

    const variance = Math.random() * 10 - 5;
    score = Math.max(20, Math.min(100, score + variance));

    points.push({
      age,
      open: score - 3,
      close: score + 2,
      high: score + 5,
      low: score - 5,
      score: Math.round(score),
      isGreen: Math.random() > 0.4
    });
  }
  return points;
}

function generateVolatileChart() {
  const points = [];
  for (let age = 1; age <= 80; age++) {
    let score;
    if (age < 25) score = 50 + Math.sin(age / 3) * 15;
    else if (age < 32) score = 60 + (age - 25) * 5;
    else if (age < 38) score = 95 - (age - 32) * 12;
    else if (age < 45) score = 25 + (age - 38) * 8;
    else score = 85 - (age - 45) * 1;

    const variance = Math.random() * 15 - 7;
    score = Math.max(15, Math.min(100, score + variance));

    points.push({
      age,
      open: score - 5,
      close: score + 3,
      high: score + 8,
      low: score - 8,
      score: Math.round(score),
      isGreen: Math.random() > 0.5
    });
  }
  return points;
}

// 插入案例
function seedCases() {
  const stmt = db.prepare(`
    INSERT OR REPLACE INTO cases
    (id, title, persona, curve_type, chart_data, highlights, narrative, tags, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const c of CASES) {
    const id = nanoid();
    stmt.run(
      id,
      c.title,
      c.persona,
      c.curveType,
      JSON.stringify(c.chartData),
      JSON.stringify(c.highlights),
      c.narrative,
      JSON.stringify([c.curveType, c.persona]),
      new Date().toISOString()
    );
    console.log(`插入案例: ${c.title}`);
  }

  console.log(`\n共插入 ${CASES.length} 个案例`);
}

seedCases();
