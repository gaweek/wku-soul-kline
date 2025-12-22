import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Loader2, Filter, TrendingUp, TrendingDown, Activity, ArrowRight, Eye, Star, Flame, Skull, Rocket, Building2, Cpu, Bitcoin } from 'lucide-react';
import SearchBar from '../components/knowledge/SearchBar';
import SEO from '../components/SEO';
import { getCases, Case, getCurveTypeName } from '../services/contentService';
import {
  getCelebrityCases,
  getCategoryName,
  getCategoryColors,
  getAllCategories,
  CELEBRITY_CATEGORY_LABELS,
} from '../services/celebrityCaseService';
import { CelebrityCase, CelebrityCategory } from '../types';
import { SimilarityBadgeInline } from '../components/widgets/SimilarityBadge';

// Tab type for main navigation
type TabType = 'celebrity' | 'classic';

const CURVE_TYPES = [
  { key: '', label: '全部类型', icon: Activity },
  { key: '早发', label: '早发型', icon: TrendingUp, description: '峰值在20-30岁' },
  { key: '晚成', label: '晚成型', icon: TrendingDown, description: '峰值在40-55岁' },
  { key: '大起大落', label: '大起大落', icon: Activity, description: '高波动人生' },
];

// Celebrity category icons mapping
const CATEGORY_ICONS: Record<CelebrityCategory, React.ComponentType<{ className?: string }>> = {
  sudden_downfall: Skull,
  rising_power: Rocket,
  corporate_fate: Building2,
  ai_tech: Cpu,
  crypto_macro: Bitcoin,
};

// 曲线类型颜色
const CURVE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  '早发': { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200' },
  '晚成': { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  '大起大落': { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
};

// Classic case card component
const CaseCard: React.FC<{ caseItem: Case }> = ({ caseItem }) => {
  const colors = CURVE_COLORS[caseItem.curveType] || CURVE_COLORS['大起大落'];

  return (
    <Link
      to={`/cases/${caseItem.id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Mini Chart Preview (Placeholder) */}
      <div className="h-32 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-30">
          {/* Simulated K-line pattern */}
          <svg viewBox="0 0 200 80" className="w-full h-full">
            <path
              d={caseItem.curveType === '早发'
                ? 'M0,60 Q50,20 100,30 T200,50'
                : caseItem.curveType === '晚成'
                ? 'M0,50 Q50,60 100,40 T200,20'
                : 'M0,40 Q30,20 60,60 Q100,10 140,50 Q170,30 200,40'
              }
              fill="none"
              stroke={caseItem.curveType === '早发' ? '#22c55e' : caseItem.curveType === '晚成' ? '#f59e0b' : '#ef4444'}
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className={`relative z-10 px-4 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-full text-sm font-bold`}>
          {getCurveTypeName(caseItem.curveType)}
        </span>
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Persona Tag */}
        <div className="flex items-center justify-between mb-3">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
            <Users className="w-3 h-3" />
            {caseItem.persona}
          </span>
          {caseItem.viewCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Eye className="w-3 h-3" />
              {caseItem.viewCount}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 group-hover:text-indigo-600 transition-colors line-clamp-2 mb-2">
          {caseItem.title}
        </h3>

        {/* Narrative Preview */}
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {caseItem.narrative}
        </p>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
        <div className="flex gap-2">
          {caseItem.tags?.slice(0, 2).map((tag, idx) => (
            <span key={idx} className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
              {tag}
            </span>
          ))}
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-indigo-600 group-hover:gap-2 transition-all">
          查看案例
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};

// Celebrity case card component
const CelebrityCaseCard: React.FC<{
  celebrity: CelebrityCase;
  similarity?: number;
}> = ({ celebrity, similarity }) => {
  const colors = getCategoryColors(celebrity.category);
  const CategoryIcon = CATEGORY_ICONS[celebrity.category] || Star;

  return (
    <Link
      to={`/celebrity-cases/${celebrity.id}`}
      className="group block bg-white rounded-xl border border-gray-200 hover:border-amber-300 hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Mini Chart Preview */}
      <div className="h-32 bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center relative overflow-hidden">
        {/* Decorative pattern based on category */}
        <div className="absolute inset-0 opacity-20">
          <svg viewBox="0 0 200 80" className="w-full h-full">
            <path
              d={celebrity.category === 'sudden_downfall'
                ? 'M0,20 Q50,30 80,70 L200,80'
                : celebrity.category === 'rising_power'
                ? 'M0,70 Q80,60 120,20 T200,15'
                : celebrity.category === 'crypto_macro'
                ? 'M0,50 Q25,20 50,60 Q75,30 100,55 Q125,25 150,50 Q175,35 200,45'
                : 'M0,40 Q100,20 200,30'
              }
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Category Badge */}
        <span className={`relative z-10 px-4 py-2 ${colors.bg} ${colors.text} ${colors.border} border rounded-full text-sm font-bold flex items-center gap-2`}>
          <CategoryIcon className="w-4 h-4" />
          {celebrity.categoryCn}
        </span>

        {/* Hot Badge */}
        {celebrity.hotnessScore >= 90 && (
          <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3" />
            热门
          </div>
        )}
      </div>

      {/* Card Content */}
      <div className="p-5">
        {/* Name and Similarity */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-800 group-hover:text-amber-600 transition-colors truncate">
              {celebrity.nameCn}
            </h3>
            <p className="text-sm text-gray-500 truncate">{celebrity.name}</p>
          </div>
          {similarity !== undefined && (
            <SimilarityBadgeInline score={similarity} className="flex-shrink-0 ml-2" />
          )}
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
          {celebrity.description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1.5">
          {celebrity.tags?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-xs bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100">
              {tag}
            </span>
          ))}
        </div>
      </div>

      {/* Card Footer */}
      <div className="px-5 py-3 bg-gradient-to-r from-amber-50 to-orange-50 border-t border-amber-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-amber-600">
          <Eye className="w-3 h-3" />
          <span>{celebrity.viewCount || 0} 次查看</span>
        </div>
        <span className="flex items-center gap-1 text-sm font-medium text-amber-600 group-hover:gap-2 transition-all">
          查看详情
          <ArrowRight className="w-4 h-4" />
        </span>
      </div>
    </Link>
  );
};

const CasesLibrary: React.FC = () => {
  // Main tab state
  const [activeTab, setActiveTab] = useState<TabType>('celebrity');

  // Classic cases state
  const [cases, setCases] = useState<Case[]>([]);
  const [loadingCases, setLoadingCases] = useState(true);
  const [selectedType, setSelectedType] = useState('');

  // Celebrity cases state
  const [celebrityCases, setCelebrityCases] = useState<CelebrityCase[]>([]);
  const [loadingCelebrities, setLoadingCelebrities] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<CelebrityCategory | ''>('');

  // Load classic cases
  useEffect(() => {
    if (activeTab === 'classic') {
      loadCases();
    }
  }, [selectedType, activeTab]);

  // Load celebrity cases
  useEffect(() => {
    if (activeTab === 'celebrity') {
      loadCelebrityCases();
    }
  }, [selectedCategory, activeTab]);

  const loadCases = async () => {
    setLoadingCases(true);
    try {
      const data = await getCases(selectedType || undefined, 50);
      setCases(data);
    } catch (error) {
      console.error('Failed to load cases:', error);
    } finally {
      setLoadingCases(false);
    }
  };

  const loadCelebrityCases = async () => {
    setLoadingCelebrities(true);
    try {
      const data = await getCelebrityCases(selectedCategory || undefined, 50);
      setCelebrityCases(data);
    } catch (error) {
      console.error('Failed to load celebrity cases:', error);
    } finally {
      setLoadingCelebrities(false);
    }
  };

  const categories = getAllCategories();

  return (
    <>
      <SEO
        title="案例库 - 人生K线 Pro"
        description="探索名人命盘案例和不同人生曲线类型的真实案例，马斯克、乔布斯、比特币...从真实命盘中学习K线解读方法。"
        url="/cases"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-purple-600 via-indigo-600 to-purple-700 text-white">
          <div className="max-w-7xl mx-auto px-4 py-16 md:py-24">
            <div className="flex flex-col items-center text-center">
              <div className="bg-white/10 backdrop-blur-sm p-4 rounded-2xl mb-6">
                <Users className="w-12 h-12" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-serif-sc mb-4">
                案例库
              </h1>
              <p className="text-lg md:text-xl text-purple-100 max-w-2xl mb-8">
                探索名人命盘与人生曲线案例，
                从真实命运轨迹中洞察八字玄机。
              </p>
              <SearchBar placeholder="搜索案例..." />
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          {/* Main Tab Navigation */}
          <div className="flex items-center gap-4 mb-8 border-b border-gray-200">
            <button
              onClick={() => setActiveTab('celebrity')}
              className={`
                pb-4 px-2 text-lg font-medium border-b-2 transition-colors flex items-center gap-2
                ${activeTab === 'celebrity'
                  ? 'border-amber-500 text-amber-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <Star className="w-5 h-5" />
              名人案例
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                25个
              </span>
            </button>
            <button
              onClick={() => setActiveTab('classic')}
              className={`
                pb-4 px-2 text-lg font-medium border-b-2 transition-colors flex items-center gap-2
                ${activeTab === 'classic'
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
                }
              `}
            >
              <Activity className="w-5 h-5" />
              经典曲线
            </button>
          </div>

          {/* Celebrity Cases Tab */}
          {activeTab === 'celebrity' && (
            <>
              {/* Category Filter */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <button
                  onClick={() => setSelectedCategory('')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === ''
                      ? 'bg-amber-500 text-white shadow-md'
                      : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300 hover:text-amber-600'
                  }`}
                >
                  <Star className="w-4 h-4" />
                  全部分类
                </button>
                {categories.map((cat) => {
                  const Icon = CATEGORY_ICONS[cat.key];
                  return (
                    <button
                      key={cat.key}
                      onClick={() => setSelectedCategory(cat.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedCategory === cat.key
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-amber-300 hover:text-amber-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Category Description */}
              {selectedCategory && (
                <div className="mb-8 p-4 bg-amber-50 rounded-lg border border-amber-200">
                  <p className="text-amber-800">
                    <strong>{getCategoryName(selectedCategory)}：</strong>
                    {selectedCategory === 'sudden_downfall' && '记录那些命运突变、巨星陨落的人生轨迹'}
                    {selectedCategory === 'rising_power' && '从低谷到巅峰，实力爆发的逆袭传奇'}
                    {selectedCategory === 'corporate_fate' && '探索商业帝国的命运起伏与企业运势'}
                    {selectedCategory === 'ai_tech' && 'AI时代科技新贵的命理解析'}
                    {selectedCategory === 'crypto_macro' && '虚拟资产与宏观周期的命理视角'}
                  </p>
                </div>
              )}

              {/* Celebrity Cases Grid */}
              {loadingCelebrities ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
                </div>
              ) : celebrityCases.length === 0 ? (
                <div className="text-center py-20">
                  <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">暂无案例</h3>
                  <p className="text-gray-500">
                    {selectedCategory
                      ? `"${getCategoryName(selectedCategory)}" 类型下暂无案例`
                      : '名人案例即将上线，敬请期待'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {celebrityCases.map((celebrity) => (
                    <CelebrityCaseCard key={celebrity.id} celebrity={celebrity} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* Classic Cases Tab */}
          {activeTab === 'classic' && (
            <>
              {/* Type Filter */}
              <div className="flex flex-wrap items-center gap-3 mb-8">
                <Filter className="w-5 h-5 text-gray-400 flex-shrink-0" />
                {CURVE_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.key}
                      onClick={() => setSelectedType(type.key)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
                        selectedType === type.key
                          ? 'bg-indigo-600 text-white shadow-md'
                          : 'bg-white text-gray-700 border border-gray-200 hover:border-indigo-300 hover:text-indigo-600'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {type.label}
                    </button>
                  );
                })}
              </div>

              {/* Type Description */}
              {selectedType && (
                <div className="mb-8 p-4 bg-indigo-50 rounded-lg border border-indigo-200">
                  <p className="text-indigo-800">
                    <strong>{getCurveTypeName(selectedType)}：</strong>
                    {CURVE_TYPES.find(t => t.key === selectedType)?.description}
                  </p>
                </div>
              )}

              {/* Cases Grid */}
              {loadingCases ? (
                <div className="flex items-center justify-center py-20">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                </div>
              ) : cases.length === 0 ? (
                <div className="text-center py-20">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">暂无案例</h3>
                  <p className="text-gray-500">
                    {selectedType
                      ? `"${getCurveTypeName(selectedType)}" 类型下暂无案例`
                      : '案例库内容即将上线，敬请期待'}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {cases.map((caseItem) => (
                    <CaseCard key={caseItem.id} caseItem={caseItem} />
                  ))}
                </div>
              )}
            </>
          )}

          {/* CTA */}
          <div className="mt-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">想知道自己的命运曲线？</h3>
            <p className="text-indigo-100 mb-6">生成你的人生K线，发现与名人的命理相似度</p>
            <Link
              to="/"
              className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              立即生成我的K线
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default CasesLibrary;
