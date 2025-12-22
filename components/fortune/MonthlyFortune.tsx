import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, AlertTriangle, Star, Target, Award, Gift } from 'lucide-react';
import { FortuneCalculator, MonthlyFortune } from '../../services/fortuneCalculator';
import { UserInput } from '../../types';

interface MonthlyFortuneProps {
  profile: UserInput;
  year?: number;
  month?: number;
}

const MonthlyFortune: React.FC<MonthlyFortuneProps> = ({
  profile,
  year = new Date().getFullYear(),
  month = new Date().getMonth() + 1
}) => {
  const [fortune, setFortune] = useState<MonthlyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateFortune = async () => {
      setLoading(true);
      setError(null);

      try {
        const calculator = new FortuneCalculator();
        const monthlyFortune = calculator.calculateMonthly(profile, year, month);
        setFortune(monthlyFortune);
      } catch (err) {
        setError('计算月运失败，请重试');
        console.error('Fortune calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateFortune();
  }, [profile, year, month]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-48 bg-gray-200 rounded-lg"></div>
          <div className="h-32 bg-gray-200 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error || !fortune) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-red-500">
          <Calendar className="w-12 h-12 mx-auto mb-2" />
          <p>{error || '无法获取月运信息'}</p>
        </div>
      </div>
    );
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case '上升': return <TrendingUp className="w-5 h-5 text-green-600" />;
      case '下降': return <TrendingDown className="w-5 h-5 text-red-600" />;
      default: return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
    }
  };

  const getThemeIcon = (theme: string) => {
    if (theme.includes('财运')) return <Award className="w-6 h-6" />;
    if (theme.includes('事业')) return <Target className="w-6 h-6" />;
    if (theme.includes('感情')) return <Star className="w-6 h-6" />;
    if (theme.includes('学习')) return <Gift className="w-6 h-6" />;
    return <Calendar className="w-6 h-6" />;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">本月运势</h2>
            <p className="text-blue-100">{year}年{month}月</p>
          </div>
          <Calendar className="w-10 h-10 text-blue-200" />
        </div>
      </div>

      <div className="p-6">
        {/* Monthly Theme */}
        <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-white rounded-lg shadow-sm">
              {getThemeIcon(fortune.monthly_theme)}
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-800">{fortune.monthly_theme}</h3>
              <p className="text-sm text-gray-600">本月主题</p>
            </div>
          </div>
          <p className="text-sm text-gray-700 mt-2">{fortune.theme_description}</p>
        </div>

        {/* Key Dates */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-500" />
            重要日期
          </h3>
          <div className="space-y-2">
            {fortune.key_dates.map((date, idx) => (
              <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {date.day}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{date.event}</p>
                  <p className="text-sm text-gray-600">{date.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  date.type === 'opportunity'
                    ? 'bg-green-100 text-green-800'
                    : date.type === 'warning'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {date.type === 'opportunity' ? '机遇' : date.type === 'warning' ? '注意' : '重要'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Trends */}
        <div className="mb-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">运势走势</h3>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(fortune.trends).map(([category, trend]) => (
              <div key={category} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-gray-800 capitalize">
                    {category === 'career' ? '事业' :
                     category === 'wealth' ? '财运' :
                     category === 'relationship' ? '感情' : '健康'}
                  </span>
                  {getTrendIcon(trend.trend)}
                </div>
                <div className="mt-2">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-gray-600">评分:</span>
                    <span className={`font-bold ${
                      trend.score >= 70 ? 'text-green-600' :
                      trend.score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {trend.score}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{trend.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Advice */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <h3 className="text-lg font-bold text-gray-800 mb-2 flex items-center gap-2">
            <Target className="w-5 h-5 text-green-600" />
            本月建议
          </h3>
          <ul className="space-y-2">
            {fortune.advice.map((item, idx) => (
              <li key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-600 mt-0.5">•</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default MonthlyFortune;