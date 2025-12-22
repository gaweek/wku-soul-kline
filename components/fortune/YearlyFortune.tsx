import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Calendar, AlertTriangle, Award, Target, Star, Shield, Zap } from 'lucide-react';
import { FortuneCalculator, YearlyFortune } from '../../services/fortuneCalculator';
import { UserInput } from '../../types';

interface YearlyFortuneProps {
  profile: UserInput;
  year?: number;
}

const YearlyFortune: React.FC<YearlyFortuneProps> = ({
  profile,
  year = new Date().getFullYear()
}) => {
  const [fortune, setFortune] = useState<YearlyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateFortune = async () => {
      setLoading(true);
      setError(null);

      try {
        const calculator = new FortuneCalculator();
        const yearlyFortune = calculator.calculateYearly(profile, year);
        setFortune(yearlyFortune);
      } catch (err) {
        setError('计算年运失败，请重试');
        console.error('Fortune calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateFortune();
  }, [profile, year]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="h-48 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !fortune) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-red-500">
          <Calendar className="w-12 h-12 mx-auto mb-2" />
          <p>{error || '无法获取年运信息'}</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case '上升': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case '下降': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <Shield className="w-5 h-5 text-blue-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case '上升': return 'text-green-600 bg-green-50 border-green-200';
      case '下降': return 'text-red-600 bg-red-50 border-red-200';
      default: return 'text-blue-600 bg-blue-50 border-blue-200';
    }
  };

  const months = ['一月', '二月', '三月', '四月', '五月', '六月',
                 '七月', '八月', '九月', '十月', '十一月', '十二月'];

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">年度运势</h2>
            <p className="text-indigo-100">{year}年全年运势解析</p>
          </div>
          <Calendar className="w-10 h-10 text-indigo-200" />
        </div>
      </div>

      <div className="p-6">
        {/* Annual Trend */}
        <div className="mb-6">
          <div className={`flex items-center gap-3 p-4 rounded-xl border ${getTrendColor(fortune.overall_trend)}`}>
            {getTrendIcon(fortune.overall_trend)}
            <div>
              <h3 className="text-lg font-bold">年度总趋势</h3>
              <p className="text-sm mt-1">{fortune.overall_description}</p>
            </div>
          </div>
        </div>

        {/* Key Moments */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            重要转折点
          </h3>
          <div className="space-y-3">
            {fortune.key_moments.map((moment, idx) => (
              <div key={idx} className="flex gap-3">
                <div className="flex-shrink-0 w-24 text-right">
                  <span className="text-sm font-medium text-gray-600">{moment.month}</span>
                </div>
                <div className="flex-shrink-0 w-2 h-2 bg-indigo-500 rounded-full mt-2"></div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{moment.event}</p>
                  <p className="text-sm text-gray-600">{moment.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Crisis Periods */}
        {fortune.crisis_periods && fortune.crisis_periods.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              需要注意的时期
            </h3>
            <div className="space-y-3">
              {fortune.crisis_periods.map((period, idx) => (
                <div key={idx} className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-800">
                        {period.start_month} - {period.end_month}
                      </p>
                      <p className="text-sm text-gray-600 mt-1">{period.warning}</p>
                      <p className="text-sm text-gray-700 mt-2">应对建议: {period.mitigation}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Opportunities by Sector */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-purple-500" />
            机遇领域
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {fortune.opportunities.map((opp, idx) => (
              <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Target className="w-4 h-4 text-purple-600" />
                  <span className="font-medium text-gray-800">{opp.sector}</span>
                </div>
                <p className="text-xs text-gray-600">{opp.description}</p>
                <div className="mt-2 text-xs">
                  <span className="text-purple-600 font-medium">最佳时机: {opp.best_months.join(', ')}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Overview */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">12月运势概览</h3>
          <div className="grid grid-cols-3 gap-2">
            {fortune.favorable_months?.map((monthIdx, idx) => (
              <div
                key={idx}
                className={`text-center p-2 rounded-lg text-sm ${
                  fortune.favorable_months?.includes(idx + 1)
                    ? 'bg-green-100 text-green-800 font-medium'
                    : 'bg-gray-100 text-gray-600'
                }`}
              >
                {months[idx]}
              </div>
            )) || months.map((month, idx) => (
              <div key={idx} className="text-center p-2 bg-gray-100 text-gray-600 rounded-lg text-sm">
                {month}
              </div>
            ))}
          </div>
        </div>

        {/* Zodiac Compatibility */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-200">
          <h3 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
            <Zap className="w-5 h-5 text-blue-600" />
            生肖贵人
          </h3>
          <div className="flex flex-wrap gap-2">
            {fortune.zodiac_compatibility?.map((zodiac, idx) => (
              <span
                key={idx}
                className="px-3 py-1 bg-blue-100 text-blue-800 rounded-lg text-sm font-medium"
              >
                {zodiac}
              </span>
            ))}
          </div>
          {fortune.zodiac_advice && (
            <p className="text-sm text-gray-700 mt-3">{fortune.zodiac_advice}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default YearlyFortune;