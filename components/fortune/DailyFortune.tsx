import React, { useState, useEffect } from 'react';
import { Calendar, TrendingUp, TrendingDown, Minus, Crown, Heart, Briefcase, Activity, Sun, Moon, Clock, Sparkles } from 'lucide-react';
import { FortuneCalculator, DailyFortune } from '../../services/fortuneCalculator';
import { UserInput } from '../../types';

interface DailyFortuneProps {
  profile: UserInput;
  date?: Date;
}

const DailyFortune: React.FC<DailyFortuneProps> = ({ profile, date = new Date() }) => {
  const [fortune, setFortune] = useState<DailyFortune | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const calculateFortune = async () => {
      setLoading(true);
      setError(null);

      try {
        const calculator = new FortuneCalculator();
        const dailyFortune = calculator.calculateDaily(profile, date);
        setFortune(dailyFortune);
      } catch (err) {
        setError('计算运势失败，请重试');
        console.error('Fortune calculation error:', err);
      } finally {
        setLoading(false);
      }
    };

    calculateFortune();
  }, [profile, date]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-4">
          <div className="h-32 bg-gray-200 rounded-lg"></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="h-24 bg-gray-200 rounded-lg"></div>
            <div className="h-24 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !fortune) {
    return (
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <div className="text-center text-red-500">
          <Sparkles className="w-12 h-12 mx-auto mb-2" />
          <p>{error || '无法获取运势信息'}</p>
        </div>
      </div>
    );
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreIcon = (score: number) => {
    if (score >= 60) return <TrendingUp className="w-5 h-5" />;
    if (score >= 40) return <Minus className="w-5 h-5" />;
    return <TrendingDown className="w-5 h-5" />;
  };

  const categoryIcons = {
    career: Briefcase,
    wealth: Crown,
    relationship: Heart,
    health: Activity,
  };

  const categoryNames = {
    career: '事业',
    wealth: '财运',
    relationship: '感情',
    health: '健康',
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">今日运势</h2>
            <p className="text-purple-100">{date.toLocaleDateString('zh-CN', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}</p>
          </div>
          <Calendar className="w-10 h-10 text-purple-200" />
        </div>
      </div>

      {/* Overall Score */}
      <div className="p-6">
        <div className="text-center mb-8">
          <div className="relative inline-flex items-center justify-center w-32 h-32">
            <svg className="transform -rotate-90 w-32 h-32">
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="#e5e7eb"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="64"
                cy="64"
                r="56"
                stroke="url(#gradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 56}`}
                strokeDashoffset={`${2 * Math.PI * 56 * (1 - fortune.overall_score / 100)}`}
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#9333ea" />
                  <stop offset="100%" stopColor="#3b82f6" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute">
              <div className={`text-3xl font-bold ${getScoreColor(fortune.overall_score)}`}>
                {fortune.overall_score}
              </div>
              <div className="text-xs text-gray-500">综合运势</div>
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {Object.entries(fortune).map(([key, value]) => {
            if (typeof value !== 'object' || !('score' in value)) return null;
            const Icon = categoryIcons[key as keyof typeof categoryIcons];
            const score = value.score;

            return (
              <div key={key} className="bg-gray-50 rounded-xl p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Icon className="w-5 h-5 text-gray-600" />
                    <span className="font-medium text-gray-800">
                      {categoryNames[key as keyof typeof categoryNames]}
                    </span>
                  </div>
                  <div className={`flex items-center gap-1 ${getScoreColor(score)}`}>
                    {getScoreIcon(score)}
                    <span className="font-bold">{score}</span>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{value.advice}</p>
              </div>
            );
          })}
        </div>

        {/* Lucky Elements */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-xl p-4 border border-amber-200">
            <div className="flex items-center gap-2 mb-2">
              <Crown className="w-5 h-5 text-amber-600" />
              <span className="font-bold text-gray-800">幸运数字</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fortune.lucky_numbers.map((num, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center justify-center w-10 h-10 bg-amber-100 text-amber-800 rounded-lg font-bold"
                >
                  {num}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-pink-50 to-rose-50 rounded-xl p-4 border border-rose-200">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-5 h-5 text-rose-600" />
              <span className="font-bold text-gray-800">幸运颜色</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {fortune.lucky_colors.map((color, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 bg-rose-100 text-rose-800 rounded-lg text-sm font-medium"
                >
                  {color}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Auspicious Hours */}
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-indigo-200 mb-6">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-5 h-5 text-indigo-600" />
            <span className="font-bold text-gray-800">吉时</span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{fortune.auspicious_hours.description}</p>
          <div className="flex flex-wrap gap-2">
            {fortune.auspicious_hours.hours.map((hour, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1 px-3 py-1 bg-indigo-100 text-indigo-800 rounded-lg text-sm"
              >
                {hour.includes('上午') ? <Sun className="w-3 h-3" /> : <Moon className="w-3 h-3" />}
                {hour}
              </span>
            ))}
          </div>
        </div>

        {/* Advice */}
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4 border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-800">今日建议</span>
          </div>
          <p className="text-sm text-gray-700 leading-relaxed">{fortune.advice}</p>
        </div>
      </div>
    </div>
  );
};

export default DailyFortune;