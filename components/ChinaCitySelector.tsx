/**
 * 中国城市级联选择器
 *
 * 功能：
 * 1. 三级级联选择：省份 -> 城市 -> 区县
 * 2. 支持搜索/自动完成
 * 3. 返回经纬度用于真太阳时计算
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapPin, Search, ChevronDown, X } from 'lucide-react';
import {
  CHINA_REGIONS,
  Province,
  City,
  District,
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  searchLocation,
  getLocationCoordinates,
  calculateTrueSolarTimeOffset,
} from '../data/chinaCities';

export interface LocationData {
  province: string;
  city: string;
  district?: string;
  longitude: number;
  latitude: number;
  fullName: string;
  trueSolarTimeOffset: number; // 真太阳时偏移（分钟）
}

interface ChinaCitySelectorProps {
  value?: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  className?: string;
  showCoordinates?: boolean;
  showOffset?: boolean;
}

const ChinaCitySelector: React.FC<ChinaCitySelectorProps> = ({
  value,
  onChange,
  placeholder = '请选择出生地点',
  className = '',
  showCoordinates = false,
  showOffset = true,
}) => {
  // 选择模式: 'search' | 'cascade'
  const [mode, setMode] = useState<'search' | 'cascade'>('search');

  // 搜索模式状态
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ReturnType<typeof searchLocation>>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // 级联选择状态
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');
  const [showCascadeDropdown, setShowCascadeDropdown] = useState(false);
  const [cascadeStep, setCascadeStep] = useState<1 | 2 | 3>(1);

  // 引用
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // 省份列表
  const provinces = useMemo(() => getProvinces(), []);

  // 城市列表（根据选择的省份）
  const cities = useMemo(() => {
    if (!selectedProvince) return [];
    return getCitiesByProvince(selectedProvince);
  }, [selectedProvince]);

  // 区县列表（根据选择的城市）
  const districts = useMemo(() => {
    if (!selectedProvince || !selectedCity) return [];
    return getDistrictsByCity(selectedProvince, selectedCity);
  }, [selectedProvince, selectedCity]);

  // 搜索处理
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 1) {
      const results = searchLocation(query);
      setSearchResults(results);
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, []);

  // 选择搜索结果
  const handleSelectSearchResult = (result: ReturnType<typeof searchLocation>[0]) => {
    const locationData: LocationData = {
      province: result.province,
      city: result.city,
      district: result.district,
      longitude: result.longitude,
      latitude: result.latitude,
      fullName: result.fullName,
      trueSolarTimeOffset: calculateTrueSolarTimeOffset(result.longitude),
    };
    onChange(locationData);
    setSearchQuery(result.fullName);
    setShowSearchDropdown(false);
  };

  // 级联选择 - 选择省份
  const handleSelectProvince = (provinceName: string) => {
    setSelectedProvince(provinceName);
    setSelectedCity('');
    setSelectedDistrict('');
    setCascadeStep(2);
  };

  // 级联选择 - 选择城市
  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedDistrict('');

    const cityDistricts = getDistrictsByCity(selectedProvince, cityName);
    if (cityDistricts.length > 0) {
      setCascadeStep(3);
    } else {
      // 没有区县，直接确认
      confirmCascadeSelection(selectedProvince, cityName);
    }
  };

  // 级联选择 - 选择区县
  const handleSelectDistrict = (districtName: string) => {
    setSelectedDistrict(districtName);
    confirmCascadeSelection(selectedProvince, selectedCity, districtName);
  };

  // 确认级联选择
  const confirmCascadeSelection = (province: string, city: string, district?: string) => {
    const coords = getLocationCoordinates(province, city, district);
    if (coords) {
      const fullName = district
        ? `${province} ${city} ${district}`
        : `${province} ${city}`;

      const locationData: LocationData = {
        province,
        city,
        district,
        longitude: coords.longitude,
        latitude: coords.latitude,
        fullName,
        trueSolarTimeOffset: calculateTrueSolarTimeOffset(coords.longitude),
      };
      onChange(locationData);
      setShowCascadeDropdown(false);
    }
  };

  // 清除选择
  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedDistrict('');
    setCascadeStep(1);
  };

  // 点击外部关闭下拉框
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
        setShowCascadeDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // 当外部value变化时同步显示
  useEffect(() => {
    if (value) {
      setSearchQuery(value.fullName);
      setSelectedProvince(value.province);
      setSelectedCity(value.city);
      setSelectedDistrict(value.district || '');
    }
  }, [value]);

  // 格式化偏移时间显示
  const formatOffset = (offset: number) => {
    const sign = offset >= 0 ? '+' : '';
    const hours = Math.floor(Math.abs(offset) / 60);
    const minutes = Math.abs(offset) % 60;
    if (hours > 0 && minutes > 0) {
      return `${sign}${offset >= 0 ? '' : '-'}${hours}小时${minutes}分钟`;
    } else if (hours > 0) {
      return `${sign}${offset >= 0 ? '' : '-'}${hours}小时`;
    } else {
      return `${sign}${offset}分钟`;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* 模式切换 */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => setMode('search')}
          className={`flex-1 py-1.5 px-3 text-xs rounded-lg transition-colors ${
            mode === 'search'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Search className="w-3 h-3 inline mr-1" />
          搜索
        </button>
        <button
          type="button"
          onClick={() => setMode('cascade')}
          className={`flex-1 py-1.5 px-3 text-xs rounded-lg transition-colors ${
            mode === 'cascade'
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <ChevronDown className="w-3 h-3 inline mr-1" />
          级联选择
        </button>
      </div>

      {/* 搜索模式 */}
      {mode === 'search' && (
        <div className="relative">
          <div className="relative">
            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              onFocus={() => searchQuery && setShowSearchDropdown(true)}
              placeholder={placeholder}
              className="w-full pl-10 pr-10 py-2.5 border border-indigo-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none bg-white font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* 搜索结果下拉框 */}
          {showSearchDropdown && searchResults.length > 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => handleSelectSearchResult(result)}
                  className="w-full px-4 py-2.5 text-left hover:bg-indigo-50 transition-colors border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                    <div>
                      <div className="font-medium text-gray-800">{result.fullName}</div>
                      <div className="text-xs text-gray-500">
                        经度: {result.longitude.toFixed(4)}° | 纬度: {result.latitude.toFixed(4)}°
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}

          {showSearchDropdown && searchQuery && searchResults.length === 0 && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg p-4 text-center text-gray-500 text-sm">
              未找到匹配的地点，请尝试其他关键词
            </div>
          )}
        </div>
      )}

      {/* 级联选择模式 */}
      {mode === 'cascade' && (
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowCascadeDropdown(!showCascadeDropdown)}
            className="w-full px-4 py-2.5 border border-indigo-200 rounded-xl bg-white text-left flex items-center justify-between"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-gray-400" />
              <span className={value ? 'text-gray-800 font-medium' : 'text-gray-400'}>
                {value ? value.fullName : placeholder}
              </span>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${showCascadeDropdown ? 'rotate-180' : ''}`} />
          </button>

          {/* 级联选择下拉框 */}
          {showCascadeDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
              {/* 步骤指示器 */}
              <div className="flex border-b border-gray-100 text-xs">
                <button
                  type="button"
                  onClick={() => setCascadeStep(1)}
                  className={`flex-1 py-2 ${cascadeStep >= 1 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                >
                  省份
                </button>
                <button
                  type="button"
                  onClick={() => selectedProvince && setCascadeStep(2)}
                  disabled={!selectedProvince}
                  className={`flex-1 py-2 ${cascadeStep >= 2 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                >
                  城市
                </button>
                <button
                  type="button"
                  onClick={() => selectedCity && districts.length > 0 && setCascadeStep(3)}
                  disabled={!selectedCity || districts.length === 0}
                  className={`flex-1 py-2 ${cascadeStep >= 3 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                >
                  区县
                </button>
              </div>

              {/* 选择列表 */}
              <div className="max-h-52 overflow-y-auto">
                {/* 省份列表 */}
                {cascadeStep === 1 && (
                  <div className="p-2 grid grid-cols-3 gap-1">
                    {provinces.map((province) => (
                      <button
                        key={province}
                        type="button"
                        onClick={() => handleSelectProvince(province)}
                        className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                          selectedProvince === province
                            ? 'bg-indigo-600 text-white'
                            : 'bg-gray-50 hover:bg-indigo-100 text-gray-700'
                        }`}
                      >
                        {province.replace(/省|市|自治区|特别行政区|壮族|维吾尔|回族/g, '')}
                      </button>
                    ))}
                  </div>
                )}

                {/* 城市列表 */}
                {cascadeStep === 2 && (
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 px-1">
                      当前省份: <span className="font-medium text-indigo-600">{selectedProvince}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {cities.map((city) => (
                        <button
                          key={city.name}
                          type="button"
                          onClick={() => handleSelectCity(city.name)}
                          className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                            selectedCity === city.name
                              ? 'bg-indigo-600 text-white'
                              : 'bg-gray-50 hover:bg-indigo-100 text-gray-700'
                          }`}
                        >
                          {city.name.replace(/市|地区|盟|自治州|自治县/g, '')}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* 区县列表 */}
                {cascadeStep === 3 && (
                  <div className="p-2">
                    <div className="text-xs text-gray-500 mb-2 px-1">
                      当前城市: <span className="font-medium text-indigo-600">{selectedCity}</span>
                    </div>
                    {districts.length > 0 ? (
                      <div className="grid grid-cols-3 gap-1">
                        {/* 仅选择城市选项 */}
                        <button
                          type="button"
                          onClick={() => confirmCascadeSelection(selectedProvince, selectedCity)}
                          className="px-2 py-1.5 text-xs rounded-lg bg-indigo-100 hover:bg-indigo-200 text-indigo-700 col-span-3 mb-1"
                        >
                          使用城市级别 ({selectedCity})
                        </button>
                        {districts.map((district) => (
                          <button
                            key={district.name}
                            type="button"
                            onClick={() => handleSelectDistrict(district.name)}
                            className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                              selectedDistrict === district.name
                                ? 'bg-indigo-600 text-white'
                                : 'bg-gray-50 hover:bg-indigo-100 text-gray-700'
                            }`}
                          >
                            {district.name.replace(/区|县|市/g, '')}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 text-sm py-4">
                        该城市无区县数据
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* 选中位置信息显示 */}
      {value && (showCoordinates || showOffset) && (
        <div className="mt-2 p-2 bg-indigo-50 rounded-lg text-xs text-gray-600 space-y-1">
          {showCoordinates && (
            <div className="flex justify-between">
              <span>经度: {value.longitude.toFixed(4)}°E</span>
              <span>纬度: {value.latitude.toFixed(4)}°N</span>
            </div>
          )}
          {showOffset && (
            <div className="flex items-center gap-1 text-indigo-700">
              <span>真太阳时校正:</span>
              <span className="font-bold">{formatOffset(value.trueSolarTimeOffset)}</span>
              <span className="text-gray-500">(相对北京时间)</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChinaCitySelector;
