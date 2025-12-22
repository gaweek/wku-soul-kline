
export const BAZI_SYSTEM_INSTRUCTION = `
你是一位世界顶级的八字命理大师，同时精通**加密货币(Crypto/Web3)市场周期**与金融投机心理学。你的任务是根据用户提供的四柱干支和**指定的大运信息**，生成一份"人生K线图"数据和带评分的命理报告。

**核心规则 (Core Rules):**
1. **年龄计算**: 严格采用**虚岁**，数据点必须**从 1 岁开始** (age: 1)。
2. **K线详批**: 每一年的 \`reason\` 必须是该流年的**详细批断**（100字左右），包含具体发生的吉凶事件预测、神煞分析、应对建议。
3. **评分机制**: 所有分析维度（总评、性格、事业、财富等）需给出 0-10 分。
4. **数据起伏 (重要)**: 务必根据流年神煞和五行生克，让每一年的评分（Open/Close/High/Low）呈现**明显的起伏波动**。人生不可能平平淡淡，要在数据中体现出"牛市"（大吉）和"熊市"（大凶）的区别，**严禁输出一条平滑的直线**。

**大运排盘规则 (重要):**
请根据 Prompt 中指定的【大运排序方向 (顺行/逆行)】推导大运序列。
1. **顺行**: 按照六十甲子顺序**往后**推导 (如: 甲子 -> 乙丑 -> 丙寅...)。
2. **逆行**: 按照六十甲子顺序**往前**逆推 (如: 甲子 -> 癸亥 -> 壬戌...)。
3. **起点**: 必须以用户输入的【第一步大运】为起点，每步大运管10年。

**关键字段说明:**
- \`daYun\`: **大运干支** (10年不变)。
- \`ganZhi\`: **流年干支** (每年一变)。

**输出 JSON 结构要求:**

{
  "bazi": ["年柱", "月柱", "日柱", "时柱"],
  "summary": "命理总评摘要。",
  "summaryScore": 8,
  "personality": "性格深层分析（包含显性性格与隐性心理）...",
  "personalityScore": 8,
  "industry": "事业分析内容...",
  "industryScore": 7,
  "fengShui": "发展风水建议：请以流畅的自然段落形式进行综合分析（不要使用数字列表或Markdown格式）。内容必须包含：1.适合的发展方位；2.最佳地理环境（必须明确建议如沿海、山区、繁华都市或宁静之地）；3.日常开运建议（饰品、颜色或布局）。",
  "fengShuiScore": 8,
  "wealth": "财富分析内容...",
  "wealthScore": 9,
  "marriage": "婚姻分析内容...",
  "marriageScore": 6,
  "health": "健康分析内容...",
  "healthScore": 5,
  "family": "六亲分析内容...",
  "familyScore": 7,
  "crypto": "币圈交易分析：分析命主偏财运与风险承受力。适合做长线holder还是短线高频？心理素质如何？",
  "cryptoScore": 8,
  "cryptoYear": "2025年 (乙巳)",
  "cryptoStyle": "链上土狗Alpha / 高倍合约 / 现货定投 (三选一)",
  "chartPoints": [
    {
      "age": 1,
      "year": 1990,
      "daYun": "童限",
      "ganZhi": "庚午",
      "open": 50,
      "close": 55,
      "high": 60,
      "low": 45,
      "score": 55,
      "reason": "详细的流年详批..."
    },
    ... (1-100岁)
  ]
}

**币圈/交易分析逻辑:**
- 结合命局中的**偏财**、**七杀**、**劫财**成分分析投机运。
- **暴富流年(cryptoYear)**: 找出一个偏财最旺或形成特殊暴富格局的年份。
- **交易风格(cryptoStyle)**:
  - 命局稳健、正财旺 -> 推荐"现货定投"。
  - 命局偏财旺、身强能任财 -> 推荐"链上土狗Alpha"。
  - 命局七杀旺、胆大心细 -> 推荐"高倍合约"。
`;

// 系统状态开关
// 1: 正常服务 (Normal)
// 0: 服务器繁忙/维护 (Busy/Maintenance)
export const API_STATUS: number = 1;

// ============ 扩展分析维度定义 ============

/**
 * 分析维度枚举
 */
export enum AnalysisDimension {
  CORE = 'core',           // 核心命理
  KLINE = 'kline',         // K线数据
  CAREER = 'career',       // 事业财富
  MARRIAGE = 'marriage',   // 婚姻健康
  CRYPTO = 'crypto',       // 币圈交易
}

/**
 * Agent状态
 */
export enum AgentStatus {
  PENDING = 'pending',
  RUNNING = 'running',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

/**
 * 扩展分析数据类型
 */
export interface ExtendedAnalysisData {
  // 基础字段
  bazi: string[];
  summary: string;
  summaryScore: number;

  // 核心分析
  personality: string;
  personalityScore: number;
  family: string;
  familyScore: number;
  fengShui: string;
  fengShuiScore: number;

  // 事业财富
  industry: string;
  industryScore: number;
  wealth: string;
  wealthScore: number;

  // 婚姻健康
  marriage: string;
  marriageScore: number;
  health: string;
  healthScore: number;
  healthBodyParts?: string[];

  // 币圈交易
  crypto: string;
  cryptoScore: number;
  cryptoYear: string;
  cryptoStyle: string;

  // 新增: 个人特征
  appearance?: string;
  bodyType?: string;
  skin?: string;
  characterSummary?: string;

  // 新增: 运势预测
  monthlyFortune?: string;
  monthlyHighlights?: string[];
  yearlyFortune?: string;
  yearlyKeyEvents?: string[];

  // 新增: 幸运元素
  luckyColors?: string[];
  luckyDirections?: string[];
  luckyZodiac?: string[];
  luckyNumbers?: number[];

  // 新增: 重点日期
  keyDatesThisMonth?: string[];
  keyDatesThisYear?: string[];

  // 新增: 大事件
  pastEvents?: Array<{year: number; event: string; basis?: string}>;
  futureEvents?: Array<{year: number; event: string; basis?: string}>;

  // 新增: 巅峰/低谷年
  peakYears?: Array<{year: number; age: number; score: number; reason?: string}>;
  troughYears?: Array<{year: number; age: number; score: number; reason?: string}>;
}

/**
 * Agent结果类型
 */
export interface AgentResult {
  agentType: AnalysisDimension;
  status: AgentStatus;
  data?: any;
  error?: string;
  elapsed?: string;
  model?: string;
}

/**
 * 并行分析结果类型
 */
export interface ParallelAnalysisResult {
  success: boolean;
  results: Record<string, any>;
  completedAgents: string[];
  totalAgents: number;
  successCount: number;
  fromCache?: boolean;
  cacheHit?: boolean;
}

/**
 * 缓存数据类型
 */
export interface CachedAnalysisData {
  baziHash: string;
  gender: string;
  structuralData: any;
  personalityCore: any;
  careerCore: any;
  wealthCore: any;
  marriageCore: any;
  healthCore: any;
  klineData: any[];
  peakYears: any[];
  troughYears: any[];
  cryptoCore: any;
  monthlyFortune: any;
  yearlyFortune: any;
  luckyElements: any;
  physicalTraits: any;
  keyDates: any;
  pastEvents: any[];
  futureEvents: any[];
  modelUsed: string;
  version: number;
  createdAt: string;
}

// ============ Celebrity Category Configuration ============

export const CELEBRITY_CATEGORIES = {
  sudden_downfall: {
    id: 'sudden_downfall',
    nameCn: '巨星陨落与意外',
    icon: 'AlertTriangle',
    color: 'red',
    description: '探索意外事件与突然变故对名人命运的影响'
  },
  rising_power: {
    id: 'rising_power',
    nameCn: '逆袭与实力爆发',
    icon: 'TrendingUp',
    color: 'green',
    description: '见证逆境崛起与能量爆发的传奇故事'
  },
  corporate_fate: {
    id: 'corporate_fate',
    nameCn: '商业帝国运势',
    icon: 'Building2',
    color: 'blue',
    description: '解析商业巨头的命理格局与财富密码'
  },
  ai_tech: {
    id: 'ai_tech',
    nameCn: 'AI纪元与科技新贵',
    icon: 'Cpu',
    color: 'purple',
    description: '科技领袖的命运轨迹与时代机遇'
  },
  crypto_macro: {
    id: 'crypto_macro',
    nameCn: '虚拟资产与宏观',
    icon: 'Bitcoin',
    color: 'amber',
    description: '加密货币与宏观投资的命理启示'
  },
};

// ============ Numerology Glossary ============

export const NUMEROLOGY_GLOSSARY: Record<string, { brief: string; detail: string }> = {
  '子午相冲': {
    brief: '子(鼠)与午(马)对冲，主剧烈变动',
    detail: '子水与午火相冲，为十二地支中最激烈的对冲之一。子属北方水，午属南方火，水火不容。逢冲之年易有突发事件、环境巨变、人际冲突。需要保持冷静，避免冲动决策。'
  },
  '天克地冲': {
    brief: '天干相克，地支相冲，大凶之兆',
    detail: '天干五行相克且地支相冲，双重打击。如甲申逢庚寅，天干庚金克甲木，地支寅申相冲，内外交困。此年易有重大变故，需谨慎行事，以守为攻。'
  },
  '食神制杀': {
    brief: '食神化解七杀之凶，转危为安',
    detail: '食神为我生之物，性情温和；七杀为克我之物，性情刚烈。食神制杀，以柔克刚，化险为夷。命局有此结构者，能在压力中找到出路，危机中见转机。'
  },
  '七杀攻身': {
    brief: '七杀无制，压力与危机',
    detail: '七杀又称偏官，为克我之物且无情。七杀攻身指命局中七杀过旺而身弱无制，易受小人陷害、事业受阻、健康受损。需要借助印星化杀或食神制杀来化解。'
  },
  '比肩劫财': {
    brief: '兄弟朋友之星，合作与竞争并存',
    detail: '比肩劫财为同类五行，代表兄弟姐妹、朋友同事。比肩为阳同阳、阴同阴；劫财为阴阳相见。旺则得朋友相助，过旺则易破财、遭背叛。需平衡合作与独立。'
  },
  '正财偏财': {
    brief: '财富之星，正财为薪偏财为横财',
    detail: '正财为我克之物且有情，代表工资、稳定收入；偏财为我克之物且无情，代表投机、意外之财。正财旺者适合稳定工作，偏财旺者适合投资创业。'
  },
  '正官七杀': {
    brief: '权力之星，正官为贵七杀为权',
    detail: '正官为克我之物且有情，代表职位、名誉、约束；七杀为克我之物且无情，代表权力、压力、竞争。身强官旺则贵，身弱官旺则灾。'
  },
  '正印偏印': {
    brief: '母星贵人，正印为生偏印为助',
    detail: '正印为生我之物且有情，代表母亲、贵人、学历；偏印为生我之物且无情，又称枭神。正印旺得长辈扶持，偏印旺易孤独敏感、思维独特。'
  },
  '伤官食神': {
    brief: '才华之星，伤官为锋食神为福',
    detail: '伤官食神皆为我生之物。伤官泄秀，聪明才智但易口舌是非；食神温和，有口福、创造力、子女缘。伤官见官为祸百端，需食神调和。'
  },
  '三合六合': {
    brief: '地支相合，贵人相助之象',
    detail: '三合：申子辰合水局、亥卯未合木局、寅午戌合火局、巳酉丑合金局。六合：子丑合、寅亥合、卯戌合、辰酉合、巳申合、午未合。逢合之年易得贵人相助、人际和谐。'
  },
  '刑冲破害': {
    brief: '地支刑克，不利之象',
    detail: '刑：寅巳申三刑、丑戌未三刑、子卯相刑等。冲：子午、丑未、寅申、卯酉、辰戌、巳亥。破：子酉破、午卯破等。害：子未害、丑午害等。逢之易有是非、伤病、破财。'
  },
  '空亡': {
    brief: '虚空无力，努力难成',
    detail: '空亡又称"旬空"，六十甲子中每旬缺两个地支。如甲子旬中无戌亥，则戌亥为空亡。空亡之字虚浮不实，难以发挥作用。逢之易有计划落空、付出无回报之感。'
  },
  '桃花': {
    brief: '魅力之星，异性缘与艺术天赋',
    detail: '桃花又称咸池，主异性缘、魅力、艺术才华。子午卯酉为四桃花。命带桃花者多情浪漫，易得异性青睐。过多则易沉迷情欲，影响事业。'
  },
  '华盖': {
    brief: '孤独之星，艺术与宗教天赋',
    detail: '华盖为艺术、宗教、玄学之星。命带华盖者多清高孤傲，喜欢艺术、哲学、玄学。才华出众但易孤独，适合从事文化、艺术、宗教相关工作。'
  },
  '天乙贵人': {
    brief: '最大吉神，遇难呈祥',
    detail: '天乙贵人为命理第一吉星。逢凶化吉，遇难呈祥。命带贵人者一生多得长辈提携、贵人相助，危难时刻能化险为夷。'
  },
  '驿马': {
    brief: '走动之星，变动与远行',
    detail: '驿马主走动、变动、迁移。命带驿马者多奔波、喜变动，适合外务工作、旅游业、外贸等。过旺则飘泊不定，难以安定。'
  },
  '羊刃': {
    brief: '刚强之星，勇猛与冲动',
    detail: '羊刃又称阳刃，极刚极锐。命带羊刃者性格刚强、胆大果断，有领导能力。但易冲动、暴躁，需食神、正官调和。适合军警、外科、竞技等行业。'
  },
  '金神': {
    brief: '肃杀之气，锐利与果断',
    detail: '金神为癸酉、己巳、乙丑三日。主性格刚烈、做事果断、不畏艰难。金神入火乡则贵，意为需要磨练方能成器。'
  },
  '魁罡': {
    brief: '刚毅之性，成败起伏大',
    detail: '魁罡为庚戌、庚辰、壬辰、戊戌四日。主性格刚毅、聪明果断、不服输。魁罡人成败起伏大，要么大成要么大败，适合创业、竞争性行业。'
  },
  '日德': {
    brief: '善良之性，为人正直',
    detail: '日德为甲寅、丙辰、戊辰、庚辰、壬戌五日。主心地善良、为人正直、有道德感。日德之人多得人缘，但需注意不要过于耿直而得罪人。'
  }
};
