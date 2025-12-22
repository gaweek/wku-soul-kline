import React, { useState, useEffect, useRef, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Star,
  Loader2,
  Share2,
  Eye,
  Calendar,
  MapPin,
  Sparkles,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import SEO from '../components/SEO';
import {
  getCelebrityCaseWithAnalysis,
  calculateSimilarity,
  getCategoryName,
  getCategoryColors,
  isCompanyCategory,
  CelebrityCaseFullResponse,
} from '../services/celebrityCaseService';
import { CelebrityCase, BaziSimilarity } from '../types';
import { BaziComparisonPanel } from '../components/cases/BaziComparisonPanel';
import { SimilarityBadge } from '../components/widgets/SimilarityBadge';
import { KnowledgeTerm } from '../components/cases/KnowledgeTerm';
import {
  CopyrightNotice,
  CelebrityScoresPanel,
  CelebrityFinancialCard,
  CelebrityAnalysisResult,
  CelebritySharePanel,
  CelebrityPoster,
} from '../components/celebrity';

// Lazy load the chart component
const LifeKLineChart = lazy(() => import('../components/LifeKLineChart'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
  </div>
);

// Analysis generation loading component
const AnalysisGenerating: React.FC<{ name: string }> = ({ name }) => (
  <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-xl border border-indigo-100 p-8 text-center">
    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-indigo-100 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
    </div>
    <h3 className="text-xl font-bold text-gray-800 mb-2">
      正在生成 {name} 的命理分析
    </h3>
    <p className="text-gray-600 mb-4">
      我们的自研中华古法命理科学算法正在深度解析八字命盘...
    </p>
    <div className="flex items-center justify-center gap-2 text-sm text-indigo-600">
      <Sparkles className="w-4 h-4" />
      <span>首次生成约需 15-30 秒，请稍候</span>
    </div>
  </div>
);

const CelebrityCaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<CelebrityCase | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [analysisFromCache, setAnalysisFromCache] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  // Share panel state
  const [showSharePanel, setShowSharePanel] = useState(false);
  const [showPoster, setShowPoster] = useState(false);
  const analysisRef = useRef<HTMLDivElement>(null);

  // User's bazi for comparison (from localStorage or context)
  const [userBazi, setUserBazi] = useState<{
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
  } | null>(null);
  const [similarity, setSimilarity] = useState<BaziSimilarity | null>(null);
  const [loadingSimilarity, setLoadingSimilarity] = useState(false);

  useEffect(() => {
    if (id) {
      loadCaseWithAnalysis(id);
    }
  }, [id]);

  // Load user's bazi from localStorage
  useEffect(() => {
    try {
      const savedInput = localStorage.getItem('lifekline_user_input');
      if (savedInput) {
        const parsed = JSON.parse(savedInput);
        if (parsed.yearPillar && parsed.monthPillar && parsed.dayPillar && parsed.hourPillar) {
          setUserBazi({
            yearPillar: parsed.yearPillar,
            monthPillar: parsed.monthPillar,
            dayPillar: parsed.dayPillar,
            hourPillar: parsed.hourPillar,
          });
        }
      }
    } catch {
      // Ignore parsing errors
    }
  }, []);

  // Calculate similarity when both data are available
  useEffect(() => {
    if (caseData && userBazi && id) {
      loadSimilarity();
    }
  }, [caseData, userBazi, id]);

  const loadCaseWithAnalysis = async (caseId: string) => {
    setLoading(true);
    setNotFound(false);
    setAnalysisError(null);

    try {
      // First check if analysis will need to be generated
      setGeneratingAnalysis(true);
      const response: CelebrityCaseFullResponse = await getCelebrityCaseWithAnalysis(caseId);

      setCaseData(response.case);
      setAnalysisFromCache(response.fromCache);

      if (response.analysisError) {
        setAnalysisError(response.analysisError);
      }
    } catch (error: any) {
      console.error('Failed to load celebrity case:', error);
      if (error.message === 'Celebrity case not found') {
        setNotFound(true);
      } else {
        setAnalysisError(error.message || '加载失败');
      }
    } finally {
      setLoading(false);
      setGeneratingAnalysis(false);
    }
  };

  const handleRegenerateAnalysis = async () => {
    if (!id) return;
    setGeneratingAnalysis(true);
    setAnalysisError(null);

    try {
      const response = await getCelebrityCaseWithAnalysis(id, true);
      setCaseData(response.case);
      setAnalysisFromCache(false);

      if (response.analysisError) {
        setAnalysisError(response.analysisError);
      }
    } catch (error: any) {
      setAnalysisError(error.message || '重新生成失败');
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  const loadSimilarity = async () => {
    if (!id || !userBazi) return;
    setLoadingSimilarity(true);
    try {
      const result = await calculateSimilarity(id, userBazi);
      setSimilarity(result);
    } catch (error) {
      console.error('Failed to calculate similarity:', error);
    } finally {
      setLoadingSimilarity(false);
    }
  };

  if (loading && !generatingAnalysis) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  if (notFound || (!caseData && !loading)) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Star className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-700">案例不存在</h1>
        <p className="text-gray-500">您访问的名人案例可能已被删除或不存在</p>
        <Link
          to="/cases"
          className="mt-4 px-6 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
        >
          返回案例库
        </Link>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
      </div>
    );
  }

  const categoryColors = getCategoryColors(caseData.category);
  const isCompany = isCompanyCategory(caseData.category);
  const hasAnalysis = caseData.analysisData && caseData.analysisData.summary;

  // Build structured data for SEO
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: `${caseData.nameCn}八字命理深度分析`,
    description: caseData.description,
    author: {
      '@type': 'Organization',
      name: '人生K线',
    },
    publisher: {
      '@type': 'Organization',
      name: '人生K线',
    },
    about: {
      '@type': isCompany ? 'Organization' : 'Person',
      name: caseData.name,
      alternateName: caseData.nameCn,
    },
    datePublished: caseData.analysisGeneratedAt || new Date().toISOString(),
    mainEntityOfPage: `/celebrity-cases/${caseData.id}`,
  };

  return (
    <>
      <SEO
        title={`${caseData.nameCn}八字命理分析 - 人生K线`}
        description={`${caseData.nameCn}(${caseData.name})命理深度分析，基于自研中华古法命理科学算法，解析性格、事业、财富、婚姻、健康五大维度。八字：${caseData.yearPillar}${caseData.monthPillar}${caseData.dayPillar}${caseData.hourPillar}`}
        url={`/celebrity-cases/${caseData.id}`}
        type="article"
        structuredData={structuredData}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-amber-600 text-white">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-amber-100 mb-6">
              <Link to="/cases" className="hover:text-white flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                案例库
              </Link>
              <span>/</span>
              <span>名人案例</span>
              <span>/</span>
              <span>{getCategoryName(caseData.category)}</span>
            </div>

            {/* Header Content */}
            <div className="flex flex-col md:flex-row md:items-start gap-6">
              {/* Left: Name and Info */}
              <div className="flex-1">
                {/* Category Tag */}
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full ${categoryColors.bg} ${categoryColors.text} ${categoryColors.border} border mb-4`}>
                  <Star className="w-4 h-4" />
                  {caseData.categoryCn}
                </span>

                {/* Name */}
                <h1 className="text-3xl md:text-4xl font-bold font-serif-sc mb-2">
                  {caseData.nameCn}
                </h1>
                <p className="text-lg text-amber-100 mb-4">{caseData.name}</p>

                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4 text-sm text-amber-100">
                  {caseData.birthDate && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {caseData.birthDate}
                    </span>
                  )}
                  {caseData.birthLocation?.city && (
                    <span className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {caseData.birthLocation.city}
                    </span>
                  )}
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {caseData.viewCount || 0} 次查看
                  </span>
                </div>
              </div>

              {/* Right: Actions and Similarity */}
              <div className="flex flex-col items-end gap-4">
                {/* Similarity Score (if available) */}
                {similarity && (
                  <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
                    <SimilarityBadge score={similarity.overallScore} size="lg" showLabel />
                    <p className="text-xs text-amber-100 mt-2">与你的命盘相似度</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowSharePanel(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    <span className="text-sm font-medium">分享</span>
                  </button>
                  <button
                    onClick={() => setShowPoster(true)}
                    className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" />
                    <span className="text-sm font-medium">海报</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12" ref={analysisRef}>
          {/* Description */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <p className="text-lg text-gray-700 leading-relaxed">
              {caseData.description}
            </p>

            {/* Tags */}
            {caseData.tags && caseData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {caseData.tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-amber-50 text-amber-700 text-sm rounded-full border border-amber-100">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Ba Zi Display */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800 font-serif-sc">
                {caseData.nameCn}的八字命盘
              </h2>
            </div>

            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '年柱', value: caseData.yearPillar },
                { label: '月柱', value: caseData.monthPillar },
                { label: '日柱', value: caseData.dayPillar },
                { label: '时柱', value: caseData.hourPillar },
              ].map((pillar) => (
                <div key={pillar.label} className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-4 text-center border border-amber-100">
                  <div className="text-xs text-amber-600 mb-2">{pillar.label}</div>
                  <div className="text-3xl font-serif-sc font-bold text-gray-800">
                    {pillar.value || '--'}
                  </div>
                </div>
              ))}
            </div>

            {/* Ba Zi Note */}
            <p className="mt-4 text-sm text-gray-500 flex items-center gap-1">
              <KnowledgeTerm term="八字">八字</KnowledgeTerm>
              由出生年、月、日、时的
              <KnowledgeTerm term="天干">天干</KnowledgeTerm>
              <KnowledgeTerm term="地支">地支</KnowledgeTerm>
              组成，共八个字。
            </p>
          </div>

          {/* Scores Panel */}
          {caseData.scores && (
            <div className="mb-8">
              <CelebrityScoresPanel
                scores={caseData.scores}
                celebrityName={caseData.nameCn}
              />
            </div>
          )}

          {/* Chart */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-indigo-600 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800 font-serif-sc">
                人生K线走势图
              </h2>
            </div>

            {caseData.chartData && caseData.chartData.length > 0 ? (
              <Suspense fallback={<LoadingFallback />}>
                <LifeKLineChart data={caseData.chartData} />
              </Suspense>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                暂无图表数据
              </div>
            )}

            {/* Legend */}
            <div className="mt-4 flex items-center gap-6 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-green-500 rounded"></span>
                运势上涨（吉）
              </span>
              <span className="flex items-center gap-1">
                <span className="w-3 h-3 bg-red-500 rounded"></span>
                运势下跌（凶）
              </span>
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 text-amber-500" />
                人生巅峰
              </span>
            </div>
          </div>

          {/* Analysis Section */}
          {generatingAnalysis && !hasAnalysis ? (
            <div className="mb-8">
              <AnalysisGenerating name={caseData.nameCn} />
            </div>
          ) : hasAnalysis ? (
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  {analysisFromCache && (
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      已缓存
                    </span>
                  )}
                </div>
                <button
                  onClick={handleRegenerateAnalysis}
                  disabled={generatingAnalysis}
                  className="flex items-center gap-1 text-sm text-indigo-600 hover:text-indigo-700 disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${generatingAnalysis ? 'animate-spin' : ''}`} />
                  重新生成
                </button>
              </div>
              <CelebrityAnalysisResult
                analysisData={caseData.analysisData!}
                celebrityName={caseData.nameCn}
              />
            </div>
          ) : analysisError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
              <p className="text-red-700 mb-4">分析生成失败：{analysisError}</p>
              <button
                onClick={handleRegenerateAnalysis}
                disabled={generatingAnalysis}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                重试
              </button>
            </div>
          ) : null}

          {/* Financial Data Card (for company/crypto categories) */}
          {(caseData.financialData || caseData.honors) && (
            <div className="mb-8">
              <CelebrityFinancialCard
                financialData={caseData.financialData}
                honors={caseData.honors}
                celebrityName={caseData.nameCn}
                isCompany={isCompany}
              />
            </div>
          )}

          {/* Highlights */}
          {caseData.highlights && caseData.highlights.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800 font-serif-sc">
                  关键转折点
                </h2>
              </div>

              <div className="space-y-4">
                {caseData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-14 h-14 rounded-full flex flex-col items-center justify-center ${
                      highlight.type === 'peak' ? 'bg-green-100 text-green-700' :
                      highlight.type === 'trough' ? 'bg-red-100 text-red-700' :
                      highlight.type === 'transition' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <span className="font-bold text-lg">{highlight.age}</span>
                      <span className="text-xs">岁</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-bold text-gray-800">
                          {highlight.type === 'peak' ? '人生高峰' :
                           highlight.type === 'trough' ? '低谷期' :
                           highlight.type === 'transition' ? '转折点' :
                           '关键节点'}
                        </h4>
                        {highlight.year && (
                          <span className="text-xs text-gray-500">({highlight.year}年)</span>
                        )}
                      </div>
                      <p className="text-gray-600">{highlight.note}</p>
                      {highlight.baziExplanation && (
                        <p className="mt-2 text-sm text-purple-600 bg-purple-50 px-3 py-2 rounded">
                          <Sparkles className="w-4 h-4 inline mr-1" />
                          {highlight.baziExplanation}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comparison Panel */}
          {similarity && userBazi && (
            <div className="mb-8">
              <BaziComparisonPanel
                userBazi={userBazi}
                celebrityBazi={{
                  yearPillar: caseData.yearPillar,
                  monthPillar: caseData.monthPillar,
                  dayPillar: caseData.dayPillar,
                  hourPillar: caseData.hourPillar,
                }}
                celebrityName={caseData.nameCn}
                similarity={similarity}
              />
            </div>
          )}

          {/* No User Bazi - CTA */}
          {!userBazi && (
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl p-8 text-white text-center mb-8">
              <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-80" />
              <h3 className="text-2xl font-bold mb-3">想知道你和{caseData.nameCn}有多相似？</h3>
              <p className="text-amber-100 mb-6">先生成你的人生K线，即可查看与名人的命盘相似度</p>
              <Link
                to="/"
                className="inline-block px-8 py-3 bg-white text-amber-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
              >
                立即生成我的K线
              </Link>
            </div>
          )}

          {/* Copyright Notice */}
          <div className="mb-8">
            <CopyrightNotice variant="full" />
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">探索更多名人案例</h3>
            <p className="text-indigo-100 mb-6">了解不同人生轨迹的命理奥秘</p>
            <Link
              to="/cases"
              className="inline-block px-8 py-3 bg-white text-indigo-600 font-bold rounded-lg hover:bg-gray-100 transition-colors"
            >
              浏览案例库
            </Link>
          </div>
        </div>
      </div>

      {/* Share Panel Modal */}
      {showSharePanel && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <CelebritySharePanel
              celebrityId={caseData.id}
              celebrityName={caseData.nameCn}
              analysisRef={analysisRef}
              onClose={() => setShowSharePanel(false)}
            />
          </div>
        </div>
      )}

      {/* Poster Modal */}
      {showPoster && (
        <CelebrityPoster
          celebrity={caseData}
          scores={caseData.scores}
          chartData={caseData.chartData}
          onClose={() => setShowPoster(false)}
        />
      )}
    </>
  );
};

export default CelebrityCaseDetail;
