import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Users, TrendingUp, Star, Loader2, Share2 } from 'lucide-react';
import SEO from '../components/SEO';
import { getCaseById, Case, getCurveTypeName } from '../services/contentService';

// Lazy load the chart component
const LifeKLineChart = lazy(() => import('../components/LifeKLineChart'));

const LoadingFallback = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
  </div>
);

const CaseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (id) {
      loadCase(id);
    }
  }, [id]);

  const loadCase = async (caseId: string) => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await getCaseById(caseId);
      if (!data) {
        setNotFound(true);
        return;
      }
      setCaseData(data);
    } catch (error) {
      console.error('Failed to load case:', error);
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  if (notFound || !caseData) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <Users className="w-16 h-16 text-gray-300" />
        <h1 className="text-2xl font-bold text-gray-700">案例不存在</h1>
        <p className="text-gray-500">您访问的案例可能已被删除或不存在</p>
        <Link
          to="/cases"
          className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          返回案例库
        </Link>
      </div>
    );
  }

  return (
    <>
      <SEO
        title={caseData.title}
        description={caseData.narrative}
        url={`/cases/${caseData.id}`}
        type="article"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
              <Link to="/cases" className="hover:text-indigo-600 flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" />
                案例库
              </Link>
              <span>/</span>
              <span>{getCurveTypeName(caseData.curveType)}</span>
            </div>

            {/* Tags */}
            <div className="flex items-center gap-3 mb-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-purple-50 text-purple-700 border border-purple-200">
                <Users className="w-4 h-4" />
                {caseData.persona}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 text-sm font-medium rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <TrendingUp className="w-4 h-4" />
                {getCurveTypeName(caseData.curveType)}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 font-serif-sc">
              {caseData.title}
            </h1>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-4 py-12">
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

          {/* Highlights */}
          {caseData.highlights && caseData.highlights.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-amber-500 rounded-full"></div>
                <h2 className="text-xl font-bold text-gray-800 font-serif-sc">
                  关键转折点
                </h2>
              </div>

              <div className="space-y-4">
                {caseData.highlights.map((highlight, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 rounded-lg">
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                      highlight.type === 'peak' ? 'bg-green-100 text-green-700' :
                      highlight.type === 'trough' ? 'bg-red-100 text-red-700' :
                      highlight.type === 'transition' ? 'bg-amber-100 text-amber-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      <span className="font-bold">{highlight.age}岁</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800">
                        {highlight.type === 'peak' ? '人生高峰' :
                         highlight.type === 'trough' ? '低谷期' :
                         highlight.type === 'transition' ? '转折点' :
                         highlight.type === 'recovery' ? '复苏期' : '关键节点'}
                      </h4>
                      <p className="text-gray-600">{highlight.note}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Narrative */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 mb-8">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-1 h-6 bg-purple-500 rounded-full"></div>
              <h2 className="text-xl font-bold text-gray-800 font-serif-sc">
                案例解读
              </h2>
            </div>

            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed text-lg">
                {caseData.narrative}
              </p>
            </div>
          </div>

          {/* Tags */}
          {caseData.tags && caseData.tags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap mb-8">
              <span className="text-sm text-gray-500">标签：</span>
              {caseData.tags.map((tag, index) => (
                <span key={index} className="px-3 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* CTA */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl p-8 text-white text-center">
            <h3 className="text-2xl font-bold mb-3">想知道自己的人生曲线？</h3>
            <p className="text-indigo-100 mb-6">输入你的八字信息，生成专属人生K线</p>
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

export default CaseDetail;
