/**
 * Optimized Birth Time Input Component
 *
 * Features:
 * 1. Quick 时辰 (Chinese hour) selection - most efficient for Bazi
 * 2. Precise time input when exact time is known
 * 3. Shows corresponding 时辰 for any selected time
 * 4. Visual time wheel for intuitive selection
 */

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Sun, Moon, Sunrise, Sunset, ChevronDown } from 'lucide-react';

interface BirthTimeInputProps {
  value: string; // HH:MM format
  onChange: (time: string) => void;
  className?: string;
  showShiChenInfo?: boolean;
}

// 时辰 data with time ranges and meanings
const SHI_CHEN_DATA = [
  { name: '子', timeRange: '23:00-01:00', alias: '夜半', icon: Moon, period: 'night', hours: [23, 0] },
  { name: '丑', timeRange: '01:00-03:00', alias: '鸡鸣', icon: Moon, period: 'night', hours: [1, 2] },
  { name: '寅', timeRange: '03:00-05:00', alias: '平旦', icon: Sunrise, period: 'dawn', hours: [3, 4] },
  { name: '卯', timeRange: '05:00-07:00', alias: '日出', icon: Sunrise, period: 'dawn', hours: [5, 6] },
  { name: '辰', timeRange: '07:00-09:00', alias: '食时', icon: Sun, period: 'morning', hours: [7, 8] },
  { name: '巳', timeRange: '09:00-11:00', alias: '隅中', icon: Sun, period: 'morning', hours: [9, 10] },
  { name: '午', timeRange: '11:00-13:00', alias: '日中', icon: Sun, period: 'noon', hours: [11, 12] },
  { name: '未', timeRange: '13:00-15:00', alias: '日昳', icon: Sun, period: 'afternoon', hours: [13, 14] },
  { name: '申', timeRange: '15:00-17:00', alias: '晡时', icon: Sunset, period: 'afternoon', hours: [15, 16] },
  { name: '酉', timeRange: '17:00-19:00', alias: '日入', icon: Sunset, period: 'evening', hours: [17, 18] },
  { name: '戌', timeRange: '19:00-21:00', alias: '黄昏', icon: Moon, period: 'evening', hours: [19, 20] },
  { name: '亥', timeRange: '21:00-23:00', alias: '人定', icon: Moon, period: 'night', hours: [21, 22] },
];

// Get 时辰 from hour
const getShiChenFromHour = (hour: number) => {
  if (hour === 23 || hour === 0) return SHI_CHEN_DATA[0]; // 子时
  const index = Math.floor((hour + 1) / 2);
  return SHI_CHEN_DATA[index] || SHI_CHEN_DATA[0];
};

// Get period color
const getPeriodColor = (period: string) => {
  switch (period) {
    case 'night':
      return 'bg-indigo-900 text-indigo-100';
    case 'dawn':
      return 'bg-orange-200 text-orange-800';
    case 'morning':
      return 'bg-amber-100 text-amber-800';
    case 'noon':
      return 'bg-yellow-100 text-yellow-800';
    case 'afternoon':
      return 'bg-orange-100 text-orange-800';
    case 'evening':
      return 'bg-purple-200 text-purple-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

// Get period border color for selection
const getPeriodBorderColor = (period: string, isSelected: boolean) => {
  if (!isSelected) return 'border-gray-200 hover:border-gray-300';
  switch (period) {
    case 'night':
      return 'border-indigo-500 ring-2 ring-indigo-500';
    case 'dawn':
      return 'border-orange-500 ring-2 ring-orange-500';
    case 'morning':
      return 'border-amber-500 ring-2 ring-amber-500';
    case 'noon':
      return 'border-yellow-500 ring-2 ring-yellow-500';
    case 'afternoon':
      return 'border-orange-500 ring-2 ring-orange-500';
    case 'evening':
      return 'border-purple-500 ring-2 ring-purple-500';
    default:
      return 'border-indigo-500 ring-2 ring-indigo-500';
  }
};

const BirthTimeInput: React.FC<BirthTimeInputProps> = ({
  value,
  onChange,
  className = '',
  showShiChenInfo = true,
}) => {
  // Parse current value
  const [hour, minute] = useMemo(() => {
    if (value) {
      const parts = value.split(':').map(Number);
      return [parts[0], parts[1]];
    }
    return [12, 0];
  }, [value]);

  // Current 时辰
  const currentShiChen = useMemo(() => getShiChenFromHour(hour), [hour]);

  // UI state
  const [mode, setMode] = useState<'shichen' | 'precise'>('shichen');
  const [showDropdown, setShowDropdown] = useState(false);
  const [tempHour, setTempHour] = useState(hour);
  const [tempMinute, setTempMinute] = useState(minute);

  const containerRef = useRef<HTMLDivElement>(null);

  // Update time
  const updateTime = (h: number, m: number) => {
    const timeStr = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
    onChange(timeStr);
  };

  // Select 时辰 (uses middle of the time range)
  const handleSelectShiChen = (shiChen: typeof SHI_CHEN_DATA[0]) => {
    // Use the middle of the time range for that 时辰
    const midHour = shiChen.hours[0] === 23 ? 0 : shiChen.hours[0] + 1;
    updateTime(midHour, 0);
    setShowDropdown(false);
  };

  // Apply precise time
  const applyPreciseTime = () => {
    updateTime(tempHour, tempMinute);
    setShowDropdown(false);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Sync temp values when value changes
  useEffect(() => {
    setTempHour(hour);
    setTempMinute(minute);
  }, [hour, minute]);

  const IconComponent = currentShiChen.icon;

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Main display button */}
      <button
        type="button"
        onClick={() => setShowDropdown(!showDropdown)}
        className={`w-full px-4 py-2.5 border rounded-xl text-left flex items-center justify-between transition-colors ${
          showDropdown
            ? getPeriodBorderColor(currentShiChen.period, true)
            : 'border-indigo-200 hover:border-indigo-300'
        } bg-white`}
      >
        <div className="flex items-center gap-3">
          <div className={`p-1.5 rounded-lg ${getPeriodColor(currentShiChen.period)}`}>
            <IconComponent className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-800">{value}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getPeriodColor(currentShiChen.period)}`}>
                {currentShiChen.name}时
              </span>
            </div>
            {showShiChenInfo && (
              <div className="text-xs text-gray-500">
                {currentShiChen.alias} · {currentShiChen.timeRange}
              </div>
            )}
          </div>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {showDropdown && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
          {/* Mode toggle */}
          <div className="flex border-b border-gray-100">
            <button
              type="button"
              onClick={() => setMode('shichen')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'shichen'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              按时辰选择
            </button>
            <button
              type="button"
              onClick={() => setMode('precise')}
              className={`flex-1 py-2 text-sm font-medium transition-colors ${
                mode === 'precise'
                  ? 'bg-indigo-50 text-indigo-700 border-b-2 border-indigo-500'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              精确时间
            </button>
          </div>

          {/* 时辰 selection mode */}
          {mode === 'shichen' && (
            <div className="p-3">
              <div className="grid grid-cols-4 gap-2">
                {SHI_CHEN_DATA.map((shiChen) => {
                  const isSelected = currentShiChen.name === shiChen.name;
                  const Icon = shiChen.icon;
                  return (
                    <button
                      key={shiChen.name}
                      type="button"
                      onClick={() => handleSelectShiChen(shiChen)}
                      className={`p-2 rounded-lg border transition-all ${
                        isSelected
                          ? `${getPeriodBorderColor(shiChen.period, true)} ${getPeriodColor(shiChen.period)}`
                          : `border-gray-200 hover:border-gray-300 hover:bg-gray-50`
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <Icon className={`w-4 h-4 ${isSelected ? '' : 'text-gray-400'}`} />
                        <span className={`text-sm font-bold ${isSelected ? '' : 'text-gray-700'}`}>
                          {shiChen.name}时
                        </span>
                        <span className={`text-xs ${isSelected ? 'opacity-80' : 'text-gray-400'}`}>
                          {shiChen.timeRange.split('-')[0]}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick info */}
              <div className="mt-3 p-2 bg-amber-50 rounded-lg text-xs text-amber-700">
                <span className="font-medium">提示:</span> 选择时辰将自动设置为该时辰的中间时间点。
                如需精确时间，请切换到"精确时间"模式。
              </div>
            </div>
          )}

          {/* Precise time mode */}
          {mode === 'precise' && (
            <div className="p-3">
              {/* Hour selection */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">小时</div>
                <div className="grid grid-cols-8 gap-1">
                  {Array.from({ length: 24 }, (_, i) => {
                    const shiChen = getShiChenFromHour(i);
                    return (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setTempHour(i)}
                        className={`p-1.5 text-xs rounded-lg transition-colors ${
                          tempHour === i
                            ? `${getPeriodColor(shiChen.period)} font-bold`
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {String(i).padStart(2, '0')}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Minute selection */}
              <div className="mb-3">
                <div className="text-xs text-gray-500 mb-2">分钟</div>
                <div className="grid grid-cols-6 gap-1">
                  {[0, 10, 20, 30, 40, 50].map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setTempMinute(m)}
                      className={`p-1.5 text-xs rounded-lg transition-colors ${
                        tempMinute === m
                          ? 'bg-indigo-600 text-white font-bold'
                          : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      {String(m).padStart(2, '0')}
                    </button>
                  ))}
                </div>
                {/* Fine minute adjustment */}
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-xs text-gray-500">微调:</span>
                  <input
                    type="range"
                    min="0"
                    max="59"
                    value={tempMinute}
                    onChange={(e) => setTempMinute(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                  />
                  <span className="text-xs font-medium text-indigo-600 w-8">
                    :{String(tempMinute).padStart(2, '0')}
                  </span>
                </div>
              </div>

              {/* Preview and confirm */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">选择:</span>
                  <span className="text-lg font-bold text-indigo-700">
                    {String(tempHour).padStart(2, '0')}:{String(tempMinute).padStart(2, '0')}
                  </span>
                  <span className={`text-xs px-1.5 py-0.5 rounded ${getPeriodColor(getShiChenFromHour(tempHour).period)}`}>
                    {getShiChenFromHour(tempHour).name}时
                  </span>
                </div>
                <button
                  type="button"
                  onClick={applyPreciseTime}
                  className="px-4 py-1.5 bg-indigo-600 text-white text-sm font-medium rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  确定
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BirthTimeInput;
