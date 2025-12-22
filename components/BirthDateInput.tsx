/**
 * Optimized Birth Date Input Component
 *
 * Features:
 * 1. Separate Year/Month/Day selectors for quick selection
 * 2. Year grouped by decades for fast navigation
 * 3. Shows Chinese zodiac year preview
 * 4. Quick preset buttons for common selections
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Calendar, ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

interface BirthDateInputProps {
  value: string; // YYYY-MM-DD format
  onChange: (date: string) => void;
  min?: string;
  max?: string;
  className?: string;
}

// Chinese zodiac animals
const ZODIAC_ANIMALS = ['鼠', '牛', '虎', '兔', '龙', '蛇', '马', '羊', '猴', '鸡', '狗', '猪'];
const HEAVENLY_STEMS = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
const EARTHLY_BRANCHES = ['子', '丑', '寅', '卯', '辰', '巳', '午', '未', '申', '酉', '戌', '亥'];

// Get Chinese year info
const getChineseYearInfo = (year: number) => {
  const stemIndex = (year - 4) % 10;
  const branchIndex = (year - 4) % 12;
  const zodiacIndex = (year - 4) % 12;
  return {
    stem: HEAVENLY_STEMS[stemIndex],
    branch: EARTHLY_BRANCHES[branchIndex],
    zodiac: ZODIAC_ANIMALS[zodiacIndex],
    ganZhi: HEAVENLY_STEMS[stemIndex] + EARTHLY_BRANCHES[branchIndex],
  };
};

// Days in month
const getDaysInMonth = (year: number, month: number) => {
  return new Date(year, month, 0).getDate();
};

const BirthDateInput: React.FC<BirthDateInputProps> = ({
  value,
  onChange,
  min = '1900-01-01',
  max = '2100-12-31',
  className = '',
}) => {
  // Parse current value
  const [year, month, day] = useMemo(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      return [parts[0], parts[1], parts[2]];
    }
    return [0, 0, 0];
  }, [value]);

  // UI state
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [yearDecade, setYearDecade] = useState(Math.floor((year || new Date().getFullYear()) / 10) * 10);

  const containerRef = useRef<HTMLDivElement>(null);

  // Parse min/max years
  const minYear = parseInt(min.split('-')[0]);
  const maxYear = parseInt(max.split('-')[0]);
  const currentYear = new Date().getFullYear();

  // Generate decade options
  const decades = useMemo(() => {
    const result = [];
    for (let d = Math.floor(minYear / 10) * 10; d <= maxYear; d += 10) {
      result.push(d);
    }
    return result;
  }, [minYear, maxYear]);

  // Generate years in current decade
  const yearsInDecade = useMemo(() => {
    const result = [];
    for (let y = yearDecade; y < yearDecade + 10 && y <= maxYear; y++) {
      if (y >= minYear) {
        result.push(y);
      }
    }
    return result;
  }, [yearDecade, minYear, maxYear]);

  // Generate days for selected month
  const daysInMonth = useMemo(() => {
    if (!year || !month) return [];
    const days = getDaysInMonth(year, month);
    return Array.from({ length: days }, (_, i) => i + 1);
  }, [year, month]);

  // Update date
  const updateDate = (newYear: number, newMonth: number, newDay: number) => {
    if (newYear && newMonth && newDay) {
      // Validate day doesn't exceed month's days
      const maxDay = getDaysInMonth(newYear, newMonth);
      const validDay = Math.min(newDay, maxDay);
      const dateStr = `${newYear}-${String(newMonth).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
      onChange(dateStr);
    }
  };

  // Select year
  const handleSelectYear = (y: number) => {
    setShowYearPicker(false);
    if (month && day) {
      updateDate(y, month, day);
    } else if (month) {
      updateDate(y, month, 1);
    } else {
      updateDate(y, 1, 1);
    }
  };

  // Select month
  const handleSelectMonth = (m: number) => {
    setShowMonthPicker(false);
    if (year && day) {
      updateDate(year, m, day);
    } else if (year) {
      updateDate(year, m, 1);
    }
  };

  // Select day
  const handleSelectDay = (d: number) => {
    setShowDayPicker(false);
    if (year && month) {
      updateDate(year, month, d);
    }
  };

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowYearPicker(false);
        setShowMonthPicker(false);
        setShowDayPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Quick year presets
  const quickYears = useMemo(() => {
    const years = [];
    for (let i = 0; i < 5; i++) {
      years.push(currentYear - i);
    }
    return years;
  }, [currentYear]);

  const yearInfo = year ? getChineseYearInfo(year) : null;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main display */}
      <div className="flex gap-2">
        {/* Year selector */}
        <div className="relative flex-1">
          <button
            type="button"
            onClick={() => {
              setShowYearPicker(!showYearPicker);
              setShowMonthPicker(false);
              setShowDayPicker(false);
              if (year) setYearDecade(Math.floor(year / 10) * 10);
            }}
            className={`w-full px-3 py-2.5 border rounded-xl text-left flex items-center justify-between transition-colors ${
              showYearPicker
                ? 'border-indigo-500 ring-2 ring-indigo-500'
                : 'border-indigo-200 hover:border-indigo-300'
            } bg-white`}
          >
            <div className="flex items-center gap-2">
              <span className={year ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                {year ? `${year}年` : '年'}
              </span>
              {yearInfo && (
                <span className="text-xs text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                  {yearInfo.zodiac}年
                </span>
              )}
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showYearPicker ? 'rotate-180' : ''}`} />
          </button>

          {/* Year picker dropdown */}
          {showYearPicker && (
            <div className="absolute z-50 w-64 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-3">
              {/* Quick year presets */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-1.5">快速选择</div>
                <div className="flex flex-wrap gap-1">
                  {quickYears.map((y) => (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleSelectYear(y)}
                      className={`px-2 py-1 text-xs rounded-lg transition-colors ${
                        year === y
                          ? 'bg-indigo-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-indigo-100'
                      }`}
                    >
                      {y}
                    </button>
                  ))}
                </div>
              </div>

              {/* Decade navigation */}
              <div className="flex items-center justify-between mb-2">
                <button
                  type="button"
                  onClick={() => setYearDecade(Math.max(Math.floor(minYear / 10) * 10, yearDecade - 10))}
                  disabled={yearDecade <= Math.floor(minYear / 10) * 10}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="text-sm font-medium text-gray-700">
                  {yearDecade}s
                </span>
                <button
                  type="button"
                  onClick={() => setYearDecade(Math.min(Math.floor(maxYear / 10) * 10, yearDecade + 10))}
                  disabled={yearDecade >= Math.floor(maxYear / 10) * 10}
                  className="p-1 rounded hover:bg-gray-100 disabled:opacity-30"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Decade quick jump */}
              <div className="flex flex-wrap gap-1 mb-2 pb-2 border-b border-gray-100">
                {decades.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setYearDecade(d)}
                    className={`px-2 py-0.5 text-xs rounded transition-colors ${
                      yearDecade === d
                        ? 'bg-indigo-100 text-indigo-700 font-medium'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {d}s
                  </button>
                ))}
              </div>

              {/* Years grid */}
              <div className="grid grid-cols-5 gap-1">
                {yearsInDecade.map((y) => {
                  const info = getChineseYearInfo(y);
                  return (
                    <button
                      key={y}
                      type="button"
                      onClick={() => handleSelectYear(y)}
                      className={`px-2 py-2 text-sm rounded-lg transition-colors ${
                        year === y
                          ? 'bg-indigo-600 text-white'
                          : 'hover:bg-indigo-50 text-gray-700'
                      }`}
                    >
                      <div>{y}</div>
                      <div className={`text-xs ${year === y ? 'text-indigo-200' : 'text-gray-400'}`}>
                        {info.zodiac}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Month selector */}
        <div className="relative w-20">
          <button
            type="button"
            onClick={() => {
              setShowMonthPicker(!showMonthPicker);
              setShowYearPicker(false);
              setShowDayPicker(false);
            }}
            disabled={!year}
            className={`w-full px-3 py-2.5 border rounded-xl text-left flex items-center justify-between transition-colors ${
              showMonthPicker
                ? 'border-indigo-500 ring-2 ring-indigo-500'
                : 'border-indigo-200 hover:border-indigo-300'
            } bg-white disabled:bg-gray-50 disabled:text-gray-400`}
          >
            <span className={month ? 'text-gray-800 font-medium' : 'text-gray-400'}>
              {month ? `${month}月` : '月'}
            </span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showMonthPicker ? 'rotate-180' : ''}`} />
          </button>

          {/* Month picker dropdown */}
          {showMonthPicker && (
            <div className="absolute z-50 w-40 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2">
              <div className="grid grid-cols-3 gap-1">
                {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => handleSelectMonth(m)}
                    className={`px-2 py-2 text-sm rounded-lg transition-colors ${
                      month === m
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-indigo-50 text-gray-700'
                    }`}
                  >
                    {m}月
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Day selector */}
        <div className="relative w-20">
          <button
            type="button"
            onClick={() => {
              setShowDayPicker(!showDayPicker);
              setShowYearPicker(false);
              setShowMonthPicker(false);
            }}
            disabled={!year || !month}
            className={`w-full px-3 py-2.5 border rounded-xl text-left flex items-center justify-between transition-colors ${
              showDayPicker
                ? 'border-indigo-500 ring-2 ring-indigo-500'
                : 'border-indigo-200 hover:border-indigo-300'
            } bg-white disabled:bg-gray-50 disabled:text-gray-400`}
          >
            <span className={day ? 'text-gray-800 font-medium' : 'text-gray-400'}>
              {day ? `${day}日` : '日'}
            </span>
            <ChevronDown className={`w-3 h-3 text-gray-400 transition-transform ${showDayPicker ? 'rotate-180' : ''}`} />
          </button>

          {/* Day picker dropdown */}
          {showDayPicker && (
            <div className="absolute z-50 w-56 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-2 right-0">
              <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => handleSelectDay(d)}
                    className={`p-2 text-sm rounded-lg transition-colors ${
                      day === d
                        ? 'bg-indigo-600 text-white'
                        : 'hover:bg-indigo-50 text-gray-700'
                    }`}
                  >
                    {d}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Chinese year info display */}
      {year && month && day && yearInfo && (
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {year}年{month}月{day}日 · {yearInfo.ganZhi}年 · 属{yearInfo.zodiac}
          </span>
        </div>
      )}
    </div>
  );
};

export default BirthDateInput;
