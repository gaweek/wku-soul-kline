// Celebrity Case Service
// 名人案例管理服务 - 用于获取名人案例和计算相似度

import {
  CelebrityCase,
  CelebrityCategory,
  BaziSimilarity,
  CaseHighlight,
  CelebrityAnalysisData,
  CelebrityScores,
  CelebrityFinancialData,
  CelebrityHonor,
} from '../types';

// Category labels for display
export const CELEBRITY_CATEGORY_LABELS: Record<CelebrityCategory, string> = {
  sudden_downfall: '巨星陨落与意外',
  rising_power: '逆袭与实力爆发',
  corporate_fate: '商业帝国运势',
  ai_tech: 'AI纪元与科技新贵',
  crypto_macro: '虚拟资产与宏观',
};

// Category colors for styling
export const CELEBRITY_CATEGORY_COLORS: Record<CelebrityCategory, { bg: string; text: string; border: string }> = {
  sudden_downfall: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
  rising_power: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  corporate_fate: { bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  ai_tech: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  crypto_macro: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
};

// Category icons (icon names for lucide-react)
export const CELEBRITY_CATEGORY_ICONS: Record<CelebrityCategory, string> = {
  sudden_downfall: 'Skull',
  rising_power: 'Rocket',
  corporate_fate: 'Building2',
  ai_tech: 'Cpu',
  crypto_macro: 'Bitcoin',
};

/**
 * Map API response (snake_case) to frontend type (camelCase)
 */
function mapCelebrityCase(item: any): CelebrityCase {
  return {
    id: item.id,
    name: item.name,
    nameCn: item.name_cn || item.nameCn,
    category: item.category,
    categoryCn: item.category_cn || item.categoryCn,
    birthDate: item.birth_date || item.birthDate,
    birthLocation: {
      city: item.birth_location_city || item.birthLocation?.city || '',
      lat: item.birth_location_lat || item.birthLocation?.lat || 0,
      lng: item.birth_location_lng || item.birthLocation?.lng || 0,
    },
    description: item.description,
    tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || []),
    yearPillar: item.year_pillar || item.yearPillar,
    monthPillar: item.month_pillar || item.monthPillar,
    dayPillar: item.day_pillar || item.dayPillar,
    hourPillar: item.hour_pillar || item.hourPillar,
    chartData: typeof item.chart_data === 'string' ? JSON.parse(item.chart_data) : (item.chart_data || item.chartData || []),
    highlights: typeof item.highlights === 'string' ? JSON.parse(item.highlights) : (item.highlights || []),
    hotnessScore: item.hotness_score || item.hotnessScore || 0,
    viewCount: item.view_count || item.viewCount || 0,
    // New analysis fields
    analysisData: item.analysisData || (item.analysis_data ? (typeof item.analysis_data === 'string' ? JSON.parse(item.analysis_data) : item.analysis_data) : undefined),
    scores: item.scores || (item.scores ? (typeof item.scores === 'string' ? JSON.parse(item.scores) : item.scores) : undefined),
    financialData: item.financialData || (item.financial_data ? (typeof item.financial_data === 'string' ? JSON.parse(item.financial_data) : item.financial_data) : undefined),
    honors: item.honors || (item.honors ? (typeof item.honors === 'string' ? JSON.parse(item.honors) : item.honors) : undefined),
    analysisGeneratedAt: item.analysis_generated_at || item.analysisGeneratedAt,
    analysisVersion: item.analysis_version || item.analysisVersion,
  };
}

/**
 * Get all celebrity cases with optional category filter
 */
export async function getCelebrityCases(
  category?: CelebrityCategory,
  limit = 20,
  offset = 0
): Promise<CelebrityCase[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  const response = await fetch(`/api/celebrity-cases?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch celebrity cases');
  }
  const data = await response.json();
  // API returns 'items', map to frontend expected format
  return (data.items || data.cases || []).map(mapCelebrityCase);
}

/**
 * Get trending/hot celebrity cases
 */
export async function getTrendingCelebrityCases(limit = 5): Promise<CelebrityCase[]> {
  const params = new URLSearchParams();
  params.append('limit', String(limit));

  const response = await fetch(`/api/celebrity-cases/trending?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch trending celebrity cases');
  }
  const data = await response.json();
  return (data.items || data.cases || []).map(mapCelebrityCase);
}

/**
 * Get a single celebrity case by ID
 */
export async function getCelebrityCaseById(id: string): Promise<CelebrityCase | null> {
  const response = await fetch(`/api/celebrity-cases/${encodeURIComponent(id)}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch celebrity case');
  }
  const data = await response.json();
  const item = data.case || data.item || data;
  return item ? mapCelebrityCase(item) : null;
}

/**
 * Calculate Ba Zi similarity between user and celebrity
 */
export async function calculateSimilarity(
  celebrityId: string,
  userBazi: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
  }
): Promise<BaziSimilarity> {
  const response = await fetch(`/api/celebrity-cases/${encodeURIComponent(celebrityId)}/similarity`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userBazi }),
  });

  if (!response.ok) {
    throw new Error('Failed to calculate similarity');
  }
  const data = await response.json();
  return data.similarity;
}

/**
 * Get category display name
 */
export function getCategoryName(category: CelebrityCategory): string {
  return CELEBRITY_CATEGORY_LABELS[category] || category;
}

/**
 * Get category colors
 */
export function getCategoryColors(category: CelebrityCategory): { bg: string; text: string; border: string } {
  return CELEBRITY_CATEGORY_COLORS[category] || { bg: 'bg-gray-50', text: 'text-gray-700', border: 'border-gray-200' };
}

/**
 * Get all category options for filters
 */
export function getAllCategories(): { key: CelebrityCategory; label: string }[] {
  return [
    { key: 'sudden_downfall', label: '巨星陨落与意外' },
    { key: 'rising_power', label: '逆袭与实力爆发' },
    { key: 'corporate_fate', label: '商业帝国运势' },
    { key: 'ai_tech', label: 'AI纪元与科技新贵' },
    { key: 'crypto_macro', label: '虚拟资产与宏观' },
  ];
}

/**
 * Format similarity score for display
 */
export function formatSimilarityScore(score: number): string {
  return `${Math.round(score)}%`;
}

/**
 * Get similarity level description
 */
export function getSimilarityLevel(score: number): {
  level: 'high' | 'medium' | 'low';
  label: string;
  color: string;
} {
  if (score >= 80) {
    return { level: 'high', label: '高度相似', color: 'text-amber-600' };
  } else if (score >= 60) {
    return { level: 'medium', label: '中等相似', color: 'text-blue-600' };
  } else {
    return { level: 'low', label: '差异较大', color: 'text-gray-500' };
  }
}

/**
 * Response type for full analysis API
 */
export interface CelebrityCaseFullResponse {
  case: CelebrityCase;
  fromCache: boolean;
  generatedAt?: string;
  model?: string;
  elapsed?: string;
  analysisError?: string;
}

/**
 * Get a celebrity case with full analysis (generates on-demand if missing)
 */
export async function getCelebrityCaseWithAnalysis(
  id: string,
  regenerate = false
): Promise<CelebrityCaseFullResponse> {
  const params = new URLSearchParams();
  if (regenerate) params.append('regenerate', 'true');

  const url = `/api/celebrity-cases/${encodeURIComponent(id)}/full${params.toString() ? `?${params}` : ''}`;
  const response = await fetch(url);

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Celebrity case not found');
    }
    throw new Error('Failed to fetch celebrity case with analysis');
  }

  const data = await response.json();
  const caseItem = data.case || data.item || data;

  return {
    case: mapCelebrityCase(caseItem),
    fromCache: data.fromCache || false,
    generatedAt: data.generatedAt,
    model: data.model,
    elapsed: data.elapsed,
    analysisError: data.analysisError,
  };
}

/**
 * Check if a category is company/project type
 */
export function isCompanyCategory(category: CelebrityCategory): boolean {
  return ['corporate_fate', 'ai_tech', 'crypto_macro'].includes(category);
}
