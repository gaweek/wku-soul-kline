/**
 * Unified Location Selector Component
 *
 * Features:
 * 1. Switch between China and International locations
 * 2. China: Province -> City -> District cascading
 * 3. International: Continent -> Country -> City cascading
 * 4. Search/autocomplete support
 * 5. Returns coordinates for true solar time calculation
 */

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { MapPin, Search, ChevronDown, X, Globe, Flag } from 'lucide-react';
import {
  CHINA_REGIONS,
  getProvinces,
  getCitiesByProvince,
  getDistrictsByCity,
  searchLocation as searchChinaLocation,
  getLocationCoordinates,
  calculateTrueSolarTimeOffset,
} from '../data/chinaCities';
import {
  WORLD_REGIONS,
  getContinents,
  getCountriesByContinent,
  getCitiesByCountry,
  searchWorldLocation,
  getWorldLocationCoordinates,
  calculateWorldTrueSolarTimeOffset,
} from '../data/worldLocations';

export interface LocationData {
  // Common fields
  longitude: number;
  latitude: number;
  fullName: string;
  trueSolarTimeOffset: number;
  timezone?: string;

  // China-specific
  province?: string;
  city?: string;
  district?: string;

  // International-specific
  continent?: string;
  country?: string;
  worldCity?: string;

  // Region type
  isChina: boolean;
}

interface LocationSelectorProps {
  value?: LocationData | null;
  onChange: (location: LocationData | null) => void;
  placeholder?: string;
  className?: string;
  showCoordinates?: boolean;
  showOffset?: boolean;
  defaultRegion?: 'china' | 'international';
}

const LocationSelector: React.FC<LocationSelectorProps> = ({
  value,
  onChange,
  placeholder = '请选择出生地点',
  className = '',
  showCoordinates = false,
  showOffset = true,
  defaultRegion = 'china',
}) => {
  // Region mode: 'china' | 'international'
  const [region, setRegion] = useState<'china' | 'international'>(defaultRegion);

  // Selection mode: 'search' | 'cascade'
  const [mode, setMode] = useState<'search' | 'cascade'>('search');

  // Search mode state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // China cascade state
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // International cascade state
  const [selectedContinent, setSelectedContinent] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedWorldCity, setSelectedWorldCity] = useState('');

  // Common cascade state
  const [showCascadeDropdown, setShowCascadeDropdown] = useState(false);
  const [cascadeStep, setCascadeStep] = useState<1 | 2 | 3>(1);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // China data
  const provinces = useMemo(() => getProvinces(), []);
  const cities = useMemo(() => {
    if (!selectedProvince) return [];
    return getCitiesByProvince(selectedProvince);
  }, [selectedProvince]);
  const districts = useMemo(() => {
    if (!selectedProvince || !selectedCity) return [];
    return getDistrictsByCity(selectedProvince, selectedCity);
  }, [selectedProvince, selectedCity]);

  // International data
  const continents = useMemo(() => getContinents(), []);
  const countries = useMemo(() => {
    if (!selectedContinent) return [];
    return getCountriesByContinent(selectedContinent);
  }, [selectedContinent]);
  const worldCities = useMemo(() => {
    if (!selectedContinent || !selectedCountry) return [];
    return getCitiesByCountry(selectedContinent, selectedCountry);
  }, [selectedContinent, selectedCountry]);

  // Search handler
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    if (query.trim().length >= 1) {
      if (region === 'china') {
        const results = searchChinaLocation(query);
        setSearchResults(results.map(r => ({ ...r, isChina: true })));
      } else {
        const results = searchWorldLocation(query);
        setSearchResults(results.map(r => ({ ...r, isChina: false })));
      }
      setShowSearchDropdown(true);
    } else {
      setSearchResults([]);
      setShowSearchDropdown(false);
    }
  }, [region]);

  // Select search result
  const handleSelectSearchResult = (result: any) => {
    if (result.isChina) {
      const locationData: LocationData = {
        province: result.province,
        city: result.city,
        district: result.district,
        longitude: result.longitude,
        latitude: result.latitude,
        fullName: result.fullName,
        trueSolarTimeOffset: calculateTrueSolarTimeOffset(result.longitude),
        isChina: true,
      };
      onChange(locationData);
    } else {
      const locationData: LocationData = {
        continent: result.continent,
        country: result.country,
        worldCity: result.city,
        longitude: result.longitude,
        latitude: result.latitude,
        fullName: result.fullName,
        timezone: result.timezone,
        trueSolarTimeOffset: calculateWorldTrueSolarTimeOffset(result.longitude, result.timezone),
        isChina: false,
      };
      onChange(locationData);
    }
    setSearchQuery(result.fullName);
    setShowSearchDropdown(false);
  };

  // China cascade selection
  const handleSelectProvince = (provinceName: string) => {
    setSelectedProvince(provinceName);
    setSelectedCity('');
    setSelectedDistrict('');
    setCascadeStep(2);
  };

  const handleSelectCity = (cityName: string) => {
    setSelectedCity(cityName);
    setSelectedDistrict('');
    const cityDistricts = getDistrictsByCity(selectedProvince, cityName);
    if (cityDistricts.length > 0) {
      setCascadeStep(3);
    } else {
      confirmChinaSelection(selectedProvince, cityName);
    }
  };

  const handleSelectDistrict = (districtName: string) => {
    setSelectedDistrict(districtName);
    confirmChinaSelection(selectedProvince, selectedCity, districtName);
  };

  const confirmChinaSelection = (province: string, city: string, district?: string) => {
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
        isChina: true,
      };
      onChange(locationData);
      setShowCascadeDropdown(false);
    }
  };

  // International cascade selection
  const handleSelectContinent = (continentName: string) => {
    setSelectedContinent(continentName);
    setSelectedCountry('');
    setSelectedWorldCity('');
    setCascadeStep(2);
  };

  const handleSelectCountry = (countryName: string) => {
    setSelectedCountry(countryName);
    setSelectedWorldCity('');
    const countryCities = getCitiesByCountry(selectedContinent, countryName);
    if (countryCities.length > 1) {
      setCascadeStep(3);
    } else if (countryCities.length === 1) {
      // Only one city, select it automatically
      confirmInternationalSelection(selectedContinent, countryName, countryCities[0].name);
    } else {
      // No cities, use country coordinates
      confirmInternationalSelection(selectedContinent, countryName);
    }
  };

  const handleSelectWorldCity = (cityName: string) => {
    setSelectedWorldCity(cityName);
    confirmInternationalSelection(selectedContinent, selectedCountry, cityName);
  };

  const confirmInternationalSelection = (continent: string, country: string, city?: string) => {
    const coords = getWorldLocationCoordinates(continent, country, city);
    if (coords) {
      const fullName = city ? `${country} ${city}` : country;
      const locationData: LocationData = {
        continent,
        country,
        worldCity: city,
        longitude: coords.longitude,
        latitude: coords.latitude,
        fullName,
        timezone: coords.timezone,
        trueSolarTimeOffset: calculateWorldTrueSolarTimeOffset(coords.longitude, coords.timezone),
        isChina: false,
      };
      onChange(locationData);
      setShowCascadeDropdown(false);
    }
  };

  // Clear selection
  const handleClear = () => {
    onChange(null);
    setSearchQuery('');
    setSelectedProvince('');
    setSelectedCity('');
    setSelectedDistrict('');
    setSelectedContinent('');
    setSelectedCountry('');
    setSelectedWorldCity('');
    setCascadeStep(1);
  };

  // Switch region
  const handleSwitchRegion = (newRegion: 'china' | 'international') => {
    setRegion(newRegion);
    setSearchQuery('');
    setSearchResults([]);
    setShowSearchDropdown(false);
    setCascadeStep(1);
    // Keep the current value if it matches the new region
    if (value && value.isChina !== (newRegion === 'china')) {
      // Clear if switching to different region type
      handleClear();
    }
  };

  // Click outside handler
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

  // Sync with external value
  useEffect(() => {
    if (value) {
      setSearchQuery(value.fullName);
      setRegion(value.isChina ? 'china' : 'international');
      if (value.isChina) {
        setSelectedProvince(value.province || '');
        setSelectedCity(value.city || '');
        setSelectedDistrict(value.district || '');
      } else {
        setSelectedContinent(value.continent || '');
        setSelectedCountry(value.country || '');
        setSelectedWorldCity(value.worldCity || '');
      }
    }
  }, [value]);

  // Format offset display
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
      {/* Region toggle */}
      <div className="flex gap-2 mb-2">
        <button
          type="button"
          onClick={() => handleSwitchRegion('china')}
          className={`flex-1 py-1.5 px-3 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
            region === 'china'
              ? 'bg-red-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Flag className="w-3 h-3" />
          中国
        </button>
        <button
          type="button"
          onClick={() => handleSwitchRegion('international')}
          className={`flex-1 py-1.5 px-3 text-xs rounded-lg transition-colors flex items-center justify-center gap-1 ${
            region === 'international'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <Globe className="w-3 h-3" />
          国际
        </button>
      </div>

      {/* Mode toggle */}
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

      {/* Search mode */}
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
              placeholder={region === 'china' ? '搜索省/市/区...' : 'Search country/city...'}
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

          {/* Search results dropdown */}
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
                        {result.timezone && ` | ${result.timezone}`}
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

      {/* Cascade mode */}
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

          {/* Cascade dropdown */}
          {showCascadeDropdown && (
            <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-xl shadow-lg">
              {/* Step indicator */}
              <div className="flex border-b border-gray-100 text-xs">
                {region === 'china' ? (
                  <>
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
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => setCascadeStep(1)}
                      className={`flex-1 py-2 ${cascadeStep >= 1 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                    >
                      洲
                    </button>
                    <button
                      type="button"
                      onClick={() => selectedContinent && setCascadeStep(2)}
                      disabled={!selectedContinent}
                      className={`flex-1 py-2 ${cascadeStep >= 2 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                    >
                      国家
                    </button>
                    <button
                      type="button"
                      onClick={() => selectedCountry && worldCities.length > 0 && setCascadeStep(3)}
                      disabled={!selectedCountry || worldCities.length === 0}
                      className={`flex-1 py-2 ${cascadeStep >= 3 ? 'text-indigo-600 font-bold' : 'text-gray-400'}`}
                    >
                      城市
                    </button>
                  </>
                )}
              </div>

              {/* Selection list */}
              <div className="max-h-52 overflow-y-auto">
                {region === 'china' ? (
                  <>
                    {/* Province list */}
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

                    {/* City list */}
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

                    {/* District list */}
                    {cascadeStep === 3 && (
                      <div className="p-2">
                        <div className="text-xs text-gray-500 mb-2 px-1">
                          当前城市: <span className="font-medium text-indigo-600">{selectedCity}</span>
                        </div>
                        {districts.length > 0 ? (
                          <div className="grid grid-cols-3 gap-1">
                            <button
                              type="button"
                              onClick={() => confirmChinaSelection(selectedProvince, selectedCity)}
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
                  </>
                ) : (
                  <>
                    {/* Continent list */}
                    {cascadeStep === 1 && (
                      <div className="p-2 grid grid-cols-3 gap-1">
                        {continents.map((continent) => (
                          <button
                            key={continent}
                            type="button"
                            onClick={() => handleSelectContinent(continent)}
                            className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                              selectedContinent === continent
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-50 hover:bg-blue-100 text-gray-700'
                            }`}
                          >
                            {continent}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Country list */}
                    {cascadeStep === 2 && (
                      <div className="p-2">
                        <div className="text-xs text-gray-500 mb-2 px-1">
                          当前洲: <span className="font-medium text-blue-600">{selectedContinent}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1">
                          {countries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => handleSelectCountry(country.name)}
                              className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                                selectedCountry === country.name
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-gray-50 hover:bg-blue-100 text-gray-700'
                              }`}
                            >
                              {country.name}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* City list */}
                    {cascadeStep === 3 && (
                      <div className="p-2">
                        <div className="text-xs text-gray-500 mb-2 px-1">
                          当前国家: <span className="font-medium text-blue-600">{selectedCountry}</span>
                        </div>
                        {worldCities.length > 0 ? (
                          <div className="grid grid-cols-3 gap-1">
                            {worldCities.map((city) => (
                              <button
                                key={city.nameEn}
                                type="button"
                                onClick={() => handleSelectWorldCity(city.name)}
                                className={`px-2 py-1.5 text-xs rounded-lg transition-colors ${
                                  selectedWorldCity === city.name
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-50 hover:bg-blue-100 text-gray-700'
                                }`}
                              >
                                {city.name}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center text-gray-500 text-sm py-4">
                            该国家无城市数据
                          </div>
                        )}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Selected location info */}
      {value && (showCoordinates || showOffset) && (
        <div className="mt-2 p-2 bg-indigo-50 rounded-lg text-xs text-gray-600 space-y-1">
          {showCoordinates && (
            <div className="flex justify-between">
              <span>经度: {value.longitude.toFixed(4)}°{value.longitude >= 0 ? 'E' : 'W'}</span>
              <span>纬度: {value.latitude.toFixed(4)}°{value.latitude >= 0 ? 'N' : 'S'}</span>
            </div>
          )}
          {showOffset && (
            <div className="flex items-center gap-1 text-indigo-700">
              <span>真太阳时校正:</span>
              <span className="font-bold">{formatOffset(value.trueSolarTimeOffset)}</span>
              {value.isChina ? (
                <span className="text-gray-500">(相对北京时间)</span>
              ) : (
                <span className="text-gray-500">(相对{value.timezone || '当地标准时间'})</span>
              )}
            </div>
          )}
          {value.timezone && !value.isChina && (
            <div className="text-gray-500">
              时区: {value.timezone}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LocationSelector;
