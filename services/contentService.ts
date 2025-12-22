// Content API Service
// 用于获取知识中心和案例库的内容

export interface KnowledgeArticle {
  id: string;
  slug: string;
  title: string;
  category: string;
  level: number;
  tags: string[];
  summary: string;
  content?: string;
  viewCount: number;
  createdAt: string;
}

export interface Case {
  id: string;
  title: string;
  persona: string;
  curveType: string;
  chartData?: any[];
  highlights?: { age: number; type: string; note: string }[];
  narrative: string;
  tags: string[];
  viewCount: number;
  createdAt: string;
}

export interface SearchResult {
  articles: Pick<KnowledgeArticle, 'id' | 'slug' | 'title' | 'category' | 'summary'>[];
  cases: Pick<Case, 'id' | 'title' | 'persona' | 'curveType'>[];
}

// 获取文章列表
export async function getArticles(category?: string, limit = 20, offset = 0): Promise<KnowledgeArticle[]> {
  const params = new URLSearchParams();
  if (category) params.append('category', category);
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  const response = await fetch(`/api/content/knowledge?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch articles');
  }
  const data = await response.json();
  return data.items;
}

// 获取单篇文章
export async function getArticleBySlug(slug: string): Promise<KnowledgeArticle | null> {
  const response = await fetch(`/api/content/knowledge/${slug}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch article');
  }
  const data = await response.json();
  return data.article;
}

// 获取案例列表
export async function getCases(curveType?: string, limit = 20, offset = 0): Promise<Case[]> {
  const params = new URLSearchParams();
  if (curveType) params.append('curveType', curveType);
  params.append('limit', String(limit));
  params.append('offset', String(offset));

  const response = await fetch(`/api/content/cases?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch cases');
  }
  const data = await response.json();
  return data.items;
}

// 获取单个案例
export async function getCaseById(id: string): Promise<Case | null> {
  const response = await fetch(`/api/content/cases/${id}`);
  if (!response.ok) {
    if (response.status === 404) return null;
    throw new Error('Failed to fetch case');
  }
  const data = await response.json();
  return data.case;
}

// 搜索内容
export async function searchContent(query: string, limit = 10): Promise<SearchResult> {
  if (!query || query.length < 2) {
    return { articles: [], cases: [] };
  }
  const params = new URLSearchParams();
  params.append('q', query);
  params.append('limit', String(limit));

  const response = await fetch(`/api/content/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to search content');
  }
  return response.json();
}

// 分类映射
export const CATEGORY_MAP: Record<string, string> = {
  quickstart: '快速入门',
  kline: 'K线逻辑',
  bazi: '八字基础',
  dayun: '大运流年',
  method: '方法误区',
  faq: '常见问题',
};

// 案例类型映射
export const CURVE_TYPE_MAP: Record<string, string> = {
  '早发': '早发型',
  '晚成': '晚成型',
  '大起大落': '大起大落型',
};

// 获取分类名称
export function getCategoryName(category: string): string {
  return CATEGORY_MAP[category] || category;
}

// 获取案例类型名称
export function getCurveTypeName(curveType: string): string {
  return CURVE_TYPE_MAP[curveType] || curveType;
}
