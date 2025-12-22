import React, { useState, useEffect } from 'react';
import { Gender } from '../types';
import { Calendar, Clock, Zap, Sparkles, Info } from 'lucide-react';
import LocationSelector, { LocationData } from './LocationSelector';
import BirthDateInput from './BirthDateInput';
import BirthTimeInput from './BirthTimeInput';

// 动态导入 lunar-javascript 以减少初始加载
let Lunar: any, Solar: any;

const loadLunarLib = async () => {
  if (!Lunar) {
    const lib = await import('lunar-javascript');
    Lunar = lib.Lunar;
    Solar = lib.Solar;
  }
};

interface SmartBaziInputProps {
  onBaziCalculated: (data: {
    birthPlace?: string;
    birthYear: string;
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    startAge: string;
    firstDaYun: string;
    longitude?: number;
    latitude?: number;
    trueSolarTimeOffset?: number;
  }) => void;
  gender: Gender;
}

// 默认位置：北京
const DEFAULT_LOCATION: LocationData = {
  province: '北京市',
  city: '北京市',
  longitude: 116.4074,
  latitude: 39.9042,
  fullName: '北京市',
  trueSolarTimeOffset: -14, // (116.4074 - 120) * 4
  isChina: true,
};

const SmartBaziInput: React.FC<SmartBaziInputProps> = ({ onBaziCalculated, gender }) => {
  const [birthDate, setBirthDate] = useState('');
  const [birthTime, setBirthTime] = useState('12:00');
  const [location, setLocation] = useState<LocationData | null>(DEFAULT_LOCATION);
  const [calculatedBazi, setCalculatedBazi] = useState<any>(null);
  const [error, setError] = useState('');
  const [showTrueSolarInfo, setShowTrueSolarInfo] = useState(false);

  const calculateBazi = async () => {
    try {
      setError('');

      if (!birthDate) {
        setError('请选择出生日期');
        return;
      }

      // 动态加载 lunar-javascript
      await loadLunarLib();

      // 解析日期和时间
      const [year, month, day] = birthDate.split('-').map(Number);
      const [hour, minute] = birthTime.split(':').map(Number);

      // 计算真太阳时偏移 (中国标准时间使用东经120度,计算各地偏移)
      const currentLocation = location || DEFAULT_LOCATION;
      const longitudeOffset = currentLocation.trueSolarTimeOffset;

      // 调整时间 - 真太阳时计算
      let adjustedMinute = minute + longitudeOffset;
      let adjustedHour = hour;
      let adjustedDay = day;
      let adjustedMonth = month;
      let adjustedYear = year;

      // 处理分钟溢出
      while (adjustedMinute >= 60) {
        adjustedHour += 1;
        adjustedMinute -= 60;
      }
      while (adjustedMinute < 0) {
        adjustedHour -= 1;
        adjustedMinute += 60;
      }

      // 处理小时溢出
      while (adjustedHour >= 24) {
        adjustedDay += 1;
        adjustedHour -= 24;
      }
      while (adjustedHour < 0) {
        adjustedDay -= 1;
        adjustedHour += 24;
      }

      // 简化日期处理 - 让 Solar 库处理日期边界
      // 创建Solar对象并转换
      const solar = Solar.fromYmdHms(adjustedYear, adjustedMonth, adjustedDay, adjustedHour, Math.round(adjustedMinute), 0);
      const lunar = solar.getLunar();
      const eightChar = lunar.getEightChar();

      // 获取四柱
      const yearPillar = eightChar.getYear();
      const monthPillar = eightChar.getMonth();
      const dayPillar = eightChar.getDay();
      const hourPillar = eightChar.getTime();

      // 计算大运
      const yun = eightChar.getYun(gender === Gender.MALE ? 1 : 0);
      const daYuns = yun.getDaYun();

      // 获取起运信息（从 Yun 对象直接获取）
      const startYear = yun.getStartYear();  // 起运年数
      const startMonth = yun.getStartMonth(); // 起运月数
      const startDay = yun.getStartDay();    // 起运天数

      // 计算虚岁起运年龄：起运年 + 1（因为虚岁出生即1岁）
      const startAge = startYear + 1;

      // 获取第一步大运干支
      const firstDaYun = daYuns && daYuns.length > 0 ? daYuns[0].getGanZhi() : '';

      // 判断大运顺逆（用于显示）
      const isForward = yun.isForward();
      const direction = isForward ? '顺行' : '逆行';

      // 根据性别和年柱天干判断顺逆说明
      const yearStem = yearPillar.charAt(0);
      const yangStems = ['甲', '丙', '戊', '庚', '壬'];
      const isYangYear = yangStems.includes(yearStem);

      let directionNote = '';
      if (gender === Gender.MALE) {
        directionNote = isYangYear ? '(阳男顺行)' : '(阴男逆行)';
      } else {
        directionNote = isYangYear ? '(阳女逆行)' : '(阴女顺行)';
      }

      // 格式化真太阳时时间
      const trueSolarTimeStr = `${String(adjustedHour).padStart(2, '0')}:${String(Math.round(adjustedMinute)).padStart(2, '0')}`;

      const baziData = {
        birthPlace: currentLocation.fullName,
        birthYear: year.toString(),
        yearPillar,
        monthPillar,
        dayPillar,
        hourPillar,
        startAge: startAge.toString(),
        firstDaYun,
        lunarDate: lunar.toString(),
        solarTerm: lunar.getJieQi(),
        direction: direction + directionNote,  // 大运方向说明
        startDetail: `${startYear}年${startMonth}个月${startDay}天`, // 详细起运时间
        longitude: currentLocation.longitude,
        latitude: currentLocation.latitude,
        trueSolarTimeOffset: longitudeOffset,
        localTime: `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`,
        trueSolarTime: trueSolarTimeStr,
      };

      setCalculatedBazi(baziData);
      onBaziCalculated(baziData);

    } catch (err: any) {
      setError('计算八字时出错: ' + err.message);
      console.error(err);
    }
  };

  // 自动计算当用户输入完成时
  useEffect(() => {
    if (birthDate && birthTime) {
      calculateBazi();
    }
  }, [birthDate, birthTime, location, gender]);

  // 格式化偏移时间显示
  const formatOffset = (offset: number) => {
    if (offset === 0) return '无偏移';
    const sign = offset >= 0 ? '+' : '';
    const absOffset = Math.abs(offset);
    const hours = Math.floor(absOffset / 60);
    const minutes = absOffset % 60;
    if (hours > 0 && minutes > 0) {
      return `${sign}${offset >= 0 ? '' : '-'}${hours}时${minutes}分`;
    } else if (hours > 0) {
      return `${sign}${offset >= 0 ? '' : '-'}${hours}小时`;
    } else {
      return `${sign}${offset}分钟`;
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-2xl border border-indigo-200 space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="bg-indigo-600 text-white p-2 rounded-lg">
          <Zap className="w-5 h-5" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-800">智能八字计算</h3>
          <p className="text-xs text-gray-600">填写出生信息,自动生成准确八字 (支持真太阳时校正)</p>
        </div>
      </div>

      {/* 出生日期 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-indigo-600" />
          出生日期 (阳历)
        </label>
        <BirthDateInput
          value={birthDate}
          onChange={setBirthDate}
          min="1900-01-01"
          max="2100-12-31"
        />
      </div>

      {/* 出生时间 */}
      <div>
        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
          <Clock className="w-4 h-4 text-indigo-600" />
          出生时间 (当地钟表时间)
        </label>
        <BirthTimeInput
          value={birthTime}
          onChange={setBirthTime}
          showShiChenInfo={true}
        />
      </div>

      {/* 出生地点 - 使用新的级联选择器 */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
            出生地点 (用于真太阳时校正)
          </label>
          <button
            type="button"
            onClick={() => setShowTrueSolarInfo(!showTrueSolarInfo)}
            className="text-xs text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <Info className="w-3 h-3" />
            什么是真太阳时?
          </button>
        </div>

        {showTrueSolarInfo && (
          <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-800">
            <p className="font-bold mb-1">真太阳时说明:</p>
            <p>中国使用北京时间(东经120°),但不同地区的实际太阳位置不同。</p>
            <p className="mt-1">例如: 乌鲁木齐(东经87.6°)比北京慢约2小时10分钟</p>
            <p className="mt-1">八字排盘需要使用出生地的真太阳时,才能准确确定时辰。</p>
          </div>
        )}

        <LocationSelector
          value={location}
          onChange={setLocation}
          placeholder="搜索或选择出生地点"
          showOffset={true}
          showCoordinates={false}
        />
      </div>

      {/* 错误提示 */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* 计算结果预览 */}
      {calculatedBazi && (
        <div className="bg-white rounded-xl p-4 border border-indigo-200">
          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            计算结果
          </h4>

          {/* 四柱显示 */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">年柱</div>
              <div className="font-bold text-lg text-indigo-700 font-serif-sc">{calculatedBazi.yearPillar}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">月柱</div>
              <div className="font-bold text-lg text-indigo-700 font-serif-sc">{calculatedBazi.monthPillar}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">日柱</div>
              <div className="font-bold text-lg text-indigo-700 font-serif-sc">{calculatedBazi.dayPillar}</div>
            </div>
            <div className="text-center">
              <div className="text-xs text-gray-500 mb-1">时柱</div>
              <div className="font-bold text-lg text-indigo-700 font-serif-sc">{calculatedBazi.hourPillar}</div>
            </div>
          </div>

          <div className="space-y-2 text-xs">
            {/* 农历和节气 */}
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-indigo-50 rounded-lg p-2">
                <span className="text-gray-600">农历：</span>
                <span className="font-medium text-gray-800">{calculatedBazi.lunarDate}</span>
              </div>
              <div className="bg-indigo-50 rounded-lg p-2">
                <span className="text-gray-600">节气：</span>
                <span className="font-medium text-gray-800">{calculatedBazi.solarTerm || '无'}</span>
              </div>
            </div>

            {/* 真太阳时信息 */}
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg p-3 border border-amber-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 font-bold">真太阳时校正</span>
                <span className="text-amber-700 font-bold text-xs">
                  {formatOffset(calculatedBazi.trueSolarTimeOffset)}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-gray-600">钟表时间：</span>
                  <span className="font-medium text-gray-700">{calculatedBazi.localTime}</span>
                </div>
                <div>
                  <span className="text-gray-600">真太阳时：</span>
                  <span className="font-bold text-amber-700">{calculatedBazi.trueSolarTime}</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                出生地: {calculatedBazi.birthPlace} (东经{location?.longitude.toFixed(2)}°)
              </div>
            </div>

            {/* 大运信息 */}
            <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-lg p-3 border border-indigo-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-gray-700 font-bold">大运信息</span>
                <span className="text-indigo-600 font-bold text-xs">{calculatedBazi.direction}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-2">
                <div>
                  <span className="text-gray-600">起运年龄：</span>
                  <span className="font-bold text-indigo-700">{calculatedBazi.startAge}岁（虚岁）</span>
                </div>
                <div>
                  <span className="text-gray-600">第一步：</span>
                  <span className="font-bold text-indigo-700 font-serif-sc">{calculatedBazi.firstDaYun}</span>
                </div>
              </div>
              <div className="mt-1 text-xs text-gray-500">
                精确起运: {calculatedBazi.startDetail}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartBaziInput;
