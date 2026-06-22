export type VibeLineAgentType =
  | 'persona_asset'
  | 'resonance_factor'
  | 'lifecycle_kline'
  | 'audience_market'
  | 'narrative_packaging'
  | 'safety_authenticity';

export type VibeLineAgentStatusType = 'pending' | 'running' | 'completed' | 'failed';

export interface VibeLineInput {
  draft: string;
  interests: string[];
  mood: string;
  platform: string;
  birthday?: string;
  zodiac?: string;
  gender?: string;
  mbti?: string;
  sbti?: string;
  socialProblem?: string;
  tone?: string;
  boundary?: string;
}

export interface VibeLinePoint {
  id: string;
  stage?: string;
  label: string;
  style: string;
  open: number;
  close: number;
  high: number;
  low: number;
  score: number;
  volume: number;
  volatility: number;
  riskLevel: 'low' | 'medium' | 'high';
  reason: string;
}

export interface VibeLineVariant {
  id: string;
  title: string;
  tone: string;
  text: string;
  bestFor: string;
}

export interface AudienceLens {
  type: string;
  resonance: number;
  why: string;
  likelyReply: string;
}

export interface SoulKLineFactor {
  title: string;
  impact?: number;
  risk?: number;
  evidence: string;
  suggestion: string;
}

export interface VibeLineSafety {
  status: 'passed' | 'review' | 'blocked';
  flags: string[];
  note: string;
}

export interface VibeLineResult {
  productName: string;
  tagline: string;
  input: VibeLineInput;
  marketType: string;
  summary: string;
  kline: VibeLinePoint[];
  variants: VibeLineVariant[];
  audienceLenses: AudienceLens[];
  risingFactors: SoulKLineFactor[];
  fallingFactors: SoulKLineFactor[];
  soulmateSignals: AudienceLens[];
  rebalanceSuggestions: string[];
  simulatedReplies: string[];
  expressionTips: string[];
  safety: VibeLineSafety;
  meta: {
    mode: 'agent' | 'fallback';
    completedAgents?: string[];
    generatedAt: string;
  };
}

export interface VibeMatchInput {
  personA: VibeLineInput;
  personB: VibeLineInput;
  relationshipGoal: string;
}

export interface VibeMatchStageAdvice {
  stage: string;
  score: number;
  highlight: string;
  risk: string;
  suggestion: string;
}

export interface VibeMatchResult {
  productName: string;
  mode: 'Who Know Us';
  tagline: string;
  input: VibeMatchInput;
  personA: VibeLineResult;
  personB: VibeLineResult;
  matchScore: number;
  marketType: string;
  summary: string;
  resonanceKline: VibeLinePoint[];
  overlapSignals: SoulKLineFactor[];
  mismatchRisks: SoulKLineFactor[];
  stageAdvice: VibeMatchStageAdvice[];
  conversationBridges: string[];
  safety: VibeLineSafety;
  meta: {
    mode: 'agent' | 'fallback';
    generatedAt: string;
  };
}

export interface VibeLineAgentStatus {
  status: VibeLineAgentStatusType;
  name: string;
  elapsed?: string;
  model?: string;
  error?: string;
}

export type VibeLineAgentStatusMap = Record<VibeLineAgentType, VibeLineAgentStatus>;
