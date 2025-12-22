
export enum Gender {
  MALE = 'Male',
  FEMALE = 'Female',
}

export interface UserInput {
  name?: string;
  birthPlace?: string;
  gender: Gender;
  birthYear: string;   // 出生年份 (如 1990)
  yearPillar: string;  // 年柱
  monthPillar: string; // 月柱
  dayPillar: string;   // 日柱
  hourPillar: string;  // 时柱
  startAge: string;    // 起运年龄 (虚岁) - Changed to string to handle input field state easily, parse later
  firstDaYun: string;  // 第一步大运干支
  
  // New API Configuration Fields
  modelName: string;   // 使用的模型名称
  apiBaseUrl: string;
  apiKey: string;
  useCustomApi: boolean;

  authEmail?: string;
  authPassword?: string;
}

export interface KLinePoint {
  age: number;
  year: number;
  ganZhi: string; // 当年的流年干支 (如：甲辰)
  daYun?: string; // 当前所在的大运（如：甲子大运），用于图表标记
  open: number;
  close: number;
  high: number;
  low: number;
  score: number;
  reason: string; // 这里现在需要存储详细的流年描述
  events?: TimelineEvent[]; // 该年的时间线事件
}

// === Timeline Event Types (V2 升级) ===

export type TimelineEventType = 'corporate' | 'personal' | 'market';
export type TimelineEventSentiment = 'positive' | 'negative' | 'neutral';

export interface TimelineEvent {
  id?: string;
  year: number;
  month?: number;  // 可选的月份
  type: TimelineEventType;
  title: string;
  description: string;
  sentiment: TimelineEventSentiment;
  icon: string;    // Lucide icon name (e.g., 'rocket', 'heart', 'graduation-cap')
  isFuture?: boolean;  // 是否为未来预测事件
  verificationStatus?: 'pending' | 'verified' | 'unverified';  // 预测验证状态
}

export interface AnalysisData {
  bazi: string[]; // [Year, Month, Day, Hour] pillars
  summary: string;
  summaryScore: number; // 0-10

  personality: string;      // 性格分析
  personalityScore: number; // 0-10

  industry: string;
  industryScore: number; // 0-10

  fengShui: string;       // 发展风水 (New)
  fengShuiScore: number;  // 0-10 (New)

  wealth: string;
  wealthScore: number; // 0-10

  marriage: string;
  marriageScore: number; // 0-10

  health: string;
  healthScore: number; // 0-10

  family: string;
  familyScore: number; // 0-10

  // Crypto / Web3 Specifics
  crypto: string;       // 币圈交易分析
  cryptoScore: number;  // 投机运势评分
  cryptoYear: string;   // 暴富流年 (e.g., 2025 乙巳)
  cryptoStyle: string;  // 适合流派 (现货/合约/链上Alpha)

  // === 新增扩展字段 ===

  // 个人特征
  appearance?: string;         // 相貌特征
  bodyType?: string;          // 体型特点
  skin?: string;              // 皮肤特征
  characterSummary?: string;  // 性格核心标签

  // 运势预测
  monthlyFortune?: string;        // 本月运势
  monthlyHighlights?: string[];   // 本月重点事项
  yearlyFortune?: string;         // 今年运势
  yearlyKeyEvents?: string[];     // 今年大事件

  // 幸运元素
  luckyColors?: string[];         // 幸运颜色
  luckyDirections?: string[];     // 幸运方位
  luckyZodiac?: string[];         // 幸运属相
  luckyNumbers?: number[];        // 幸运数字

  // 重点日期
  keyDatesThisMonth?: string[];   // 本月重点日期
  keyDatesThisYear?: string[];    // 今年重点日期

  // 健康扩展
  healthBodyParts?: string[];     // 需注意的身体部位

  // 大事件
  pastEvents?: Array<{year: number; event: string; basis?: string}>;    // 过往大事件
  futureEvents?: Array<{year: number; event: string; basis?: string}>;  // 未来大事件

  // 巅峰/低谷年
  peakYears?: Array<{year: number; age: number; score: number; reason?: string}>;
  troughYears?: Array<{year: number; age: number; score: number; reason?: string}>;
}

// === Agent相关类型 ===

export type AgentType = 'core' | 'kline' | 'career' | 'marriage' | 'crypto';

export type AgentStatusType = 'pending' | 'running' | 'completed' | 'failed';

export interface AgentStatus {
  status: AgentStatusType;
  data?: any;
  error?: string;
  elapsed?: string;
  model?: string;
}

export interface ParallelAnalysisResponse {
  result: LifeDestinyResult;
  isGuest: boolean;
  user: { id: string; email: string; points: number } | null;
  cost: number;
  fromCache?: boolean;
  processingTimeMs?: number;
  agentsUsed?: string[];
  successCount?: number;
  totalAgents?: number;
}

export interface LifeDestinyResult {
  chartData: KLinePoint[];
  analysis: AnalysisData;
}

export interface AuthUser {
  id: string;
  email: string;
  points: number;
}

export interface HistoryListItem {
  id: string;
  createdAt: string;
  cost: number;
  summary: string;
}

// Profile Management Types
export interface UserProfile extends UserInput {
  id: string;
  isDefault: boolean;
  createdAt: string;
}

// === Celebrity Case Types ===

export type CelebrityCategory =
  | 'sudden_downfall'    // 巨星陨落与意外
  | 'rising_power'       // 逆袭与实力爆发
  | 'corporate_fate'     // 商业帝国运势
  | 'ai_tech'            // AI纪元与科技新贵
  | 'crypto_macro';      // 虚拟资产与宏观

// Celebrity-specific analysis data structure
export interface CelebrityAnalysisData {
  // Core sections (matching user analysis format)
  summary: string;           // 命理总评 (200+ words)
  personality: string;       // 性格深度分析 (200+ words)
  career: string;            // 事业分析 (200+ words)
  wealth: string;            // 财富分析 (200+ words)
  marriage: string;          // 婚姻分析 (200+ words)
  health: string;            // 健康分析 (200+ words)

  // Optional extended sections
  fengShui?: string;         // 风水建议
  family?: string;           // 六亲关系

  // Celebrity-specific sections
  lifeTrajectory?: string;   // 人生轨迹分析 - 重大公开事件的命理解读
  publicPerception?: string; // 公众形象分析
  legacyImpact?: string;     // 遗产与影响力
}

// Celebrity BaZi scores (0-100 scale)
export interface CelebrityScores {
  overall: number;           // 总体命格评分
  personality: number;       // 性格评分
  career: number;           // 事业评分
  wealth: number;           // 财富评分
  marriage: number;         // 婚姻评分
  health: number;           // 健康评分
}

// Financial/business data (LLM generated)
export interface CelebrityFinancialData {
  stockPrice?: string;       // 股票价格 (如 "$175.34 (AAPL)")
  marketCap?: string;        // 市值 (如 "$2.8T")
  netWorth?: string;         // 净资产 (如 "$230B")
  peakNetWorth?: string;     // 巅峰净资产 (如 "$340B (2021)")
  majorHoldings?: string[];  // 主要持股/资产
  revenueHistory?: string;   // 营收历史
}

// Honors and achievements
export interface CelebrityHonor {
  title: string;             // 荣誉名称
  year?: number;             // 获得年份
  category?: string;         // 类别 (如 "行业奖项", "国家荣誉")
}

export interface CelebrityCase {
  id: string;
  name: string;
  nameCn: string;
  category: CelebrityCategory;
  categoryCn: string;
  birthDate: string;
  birthLocation: { city: string; lat: number; lng: number };
  description: string;
  tags: string[];
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  chartData: KLinePoint[];
  highlights: CaseHighlight[];
  hotnessScore: number;
  viewCount: number;

  // === NEW: Extended analysis fields ===
  analysisData?: CelebrityAnalysisData;  // Full LLM-generated analysis
  scores?: CelebrityScores;               // BaZi dimension scores
  financialData?: CelebrityFinancialData; // Financial/business data
  honors?: CelebrityHonor[];              // Honors and achievements

  // Analysis generation metadata
  analysisGeneratedAt?: string;           // ISO timestamp of last generation
  analysisVersion?: number;               // Version counter for cache invalidation
}

export interface CaseHighlight {
  age: number;
  year: number;
  type: 'peak' | 'trough' | 'transition' | 'event';
  note: string;
  baziExplanation?: string;
}

export interface BaziSimilarity {
  overallScore: number;
  yearPillarMatch: number;
  monthPillarMatch: number;
  dayPillarMatch: number;
  hourPillarMatch: number;
  elementBalance: number;
  dayMasterRelation: string;
  insights: string[];
}
