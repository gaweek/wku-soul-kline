import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { FortuneCalculator, DailyFortune } from '../../services/fortuneCalculator';
import { UserInput } from '../../types';

interface FortuneCalendarProps {
  profile: UserInput;
  onDateSelect?: (date: Date) => void;
  selectedDate?: Date;
}

interface FortuneData {
  [date: string]: {
    score: number;
    summary: string;
  };
}

const FortuneCalendar: React.FC<FortuneCalendarProps> = ({
  profile,
  onDateSelect,
  selectedDate = new Date()
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [fortuneData, setFortuneData] = useState<FortuneData>({});
  const [loading, setLoading] = useState(false);

  const monthNames = [
    '一月', '二月', '三月', '四月', '五月', '六月',
    '七月', '八月', '九月', '十月', '十一月', '十二月'
  ];

  const weekDays = ['日', '一', '二', '三', '四', '五', '六'];

  useEffect(() => {
    loadMonthFortune();
  }, [currentDate, profile]);

  const loadMonthFortune = async () => {
    setLoading(true);
    const calculator = new FortuneCalculator();
    const data: FortuneData = {};

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // Calculate fortune for each day in the month
    for (let day = 1; day <= daysInMonth; day++) {
      try {
        const date = new Date(year, month, day);
        const fortune = calculator.calculateDaily(profile, date);
        const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        data[dateKey] = {
          score: fortune.overall_score,
          summary: fortune.advice.substring(0, 30) + '...'
        };
      } catch (error) {
        console.error(`Error calculating fortune for ${year}-${month + 1}-${day}:`, error);
      }
    }

    setFortuneData(data);
    setLoading(false);
  };

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    return new Date(year, month, 1).getDay();
  };

  const formatDateKey = (year: number, month: number, day: number) => {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'bg-green-100 text-green-800 border-green-300';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    if (score >= 40) return 'bg-orange-100 text-orange-800 border-orange-300';
    return 'bg-red-100 text-red-800 border-red-300';
  };

  const navigateMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
  };

  const handleDateClick = (day: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
    if (onDateSelect) {
      onDateSelect(newDate);
    }
  };

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth();
    const firstDay = getFirstDayOfMonth();
    const days = [];

    // Empty cells for days before month starts
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-10"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const dateKey = formatDateKey(currentDate.getFullYear(), currentDate.getMonth(), day);
      const fortune = fortuneData[dateKey];
      const isSelected = selectedDate &&
        selectedDate.getDate() === day &&
        selectedDate.getMonth() === currentDate.getMonth() &&
        selectedDate.getFullYear() === currentDate.getFullYear();
      const isToday = new Date().getDate() === day &&
        new Date().getMonth() === currentDate.getMonth() &&
        new Date().getFullYear() === currentDate.getFullYear();

      days.push(
        <div
          key={day}
          onClick={() => handleDateClick(day)}
          className={`h-10 border rounded-lg cursor-pointer transition-all hover:scale-105 relative ${
            isSelected ? 'ring-2 ring-indigo-500' : 'border-gray-200'
          } ${isToday ? 'font-bold' : ''} ${
            fortune ? getScoreColor(fortune.score) : 'bg-gray-50'
          }`}
          title={fortune?.summary}
        >
          <div className="text-center text-sm leading-10">
            {day}
            {fortune && (
              <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-current opacity-60 m-0.5"></div>
            )}
          </div>
        </div>
      );
    }

    return days;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-gray-800">运势日历</h3>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-lg font-medium min-w-[120px] text-center">
            {currentDate.getFullYear()}年{monthNames[currentDate.getMonth()]}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Week days */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {loading ? (
        <div className="grid grid-cols-7 gap-1 animate-pulse">
          {Array.from({ length: 35 }).map((_, idx) => (
            <div key={idx} className="h-10 bg-gray-200 rounded-lg"></div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-1">
          {renderCalendar()}
        </div>
      )}

      {/* Legend */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-gray-600" />
          <span className="text-sm font-medium text-gray-700">运势等级</span>
        </div>
        <div className="flex flex-wrap gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-green-100 border border-green-300 rounded"></div>
            <span>优秀 (80+)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded"></div>
            <span>良好 (60-79)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-orange-100 border border-orange-300 rounded"></div>
            <span>一般 (40-59)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-red-100 border border-red-300 rounded"></div>
            <span>需注意 (40以下)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FortuneCalendar;