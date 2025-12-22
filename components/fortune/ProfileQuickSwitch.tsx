import React, { useState, useRef, useEffect } from 'react';
import { User, ChevronDown, Settings, Check } from 'lucide-react';

export interface ProfileInfo {
  id: string;
  name: string;
  yearPillar: string;
  monthPillar: string;
  dayPillar: string;
  hourPillar: string;
  isDefault?: boolean;
}

interface ProfileQuickSwitchProps {
  profiles: ProfileInfo[];
  currentProfileId: string | null;
  onProfileChange: (profileId: string) => void;
  onManageProfiles: () => void;
}

/**
 * ProfileQuickSwitch - Compact profile switcher for DailyFortuneCard
 *
 * Rendering logic:
 * - 0 profiles → "管理我的档案" button
 * - 1 profile → Display that profile directly with edit icon
 * - Multiple profiles → Dropdown selector with profile list
 */
export const ProfileQuickSwitch: React.FC<ProfileQuickSwitchProps> = ({
  profiles,
  currentProfileId,
  onProfileChange,
  onManageProfiles,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Get current profile
  const currentProfile = profiles.find(p => p.id === currentProfileId) || profiles[0];

  // Format bazi display (compact)
  const formatBazi = (profile: ProfileInfo) => {
    return `${profile.yearPillar} ${profile.monthPillar} ${profile.dayPillar} ${profile.hourPillar}`;
  };

  // No profiles - show manage button
  if (profiles.length === 0) {
    return (
      <button
        onClick={onManageProfiles}
        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm rounded-lg transition-colors"
      >
        <Settings className="w-4 h-4" />
        <span>管理我的档案</span>
      </button>
    );
  }

  // Single profile - display directly with edit icon
  if (profiles.length === 1) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-lg">
          <User className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-medium text-indigo-700">{currentProfile.name}</span>
          <span className="text-xs text-indigo-500 font-mono">{formatBazi(currentProfile)}</span>
        </div>
        <button
          onClick={onManageProfiles}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          title="管理档案"
        >
          <Settings className="w-4 h-4 text-gray-500" />
        </button>
      </div>
    );
  }

  // Multiple profiles - dropdown selector
  return (
    <div ref={dropdownRef} className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors min-w-0"
      >
        <User className="w-4 h-4 text-indigo-600 flex-shrink-0" />
        <span className="text-sm font-medium text-indigo-700 truncate max-w-[100px]">
          {currentProfile?.name || '选择档案'}
        </span>
        <ChevronDown className={`w-4 h-4 text-indigo-500 flex-shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white border border-gray-200 rounded-xl shadow-lg z-50 overflow-hidden animate-fade-in">
          {/* Profile list */}
          <div className="max-h-48 overflow-y-auto">
            {profiles.map((profile) => (
              <button
                key={profile.id}
                onClick={() => {
                  onProfileChange(profile.id);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center gap-2 px-3 py-2.5 text-left hover:bg-gray-50 transition-colors ${
                  profile.id === currentProfileId ? 'bg-indigo-50' : ''
                }`}
              >
                <div className="flex-shrink-0 w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-800 truncate">
                    {profile.name}
                  </div>
                  <div className="text-xs text-gray-500 font-mono truncate">
                    {formatBazi(profile)}
                  </div>
                </div>
                {profile.id === currentProfileId && (
                  <Check className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                )}
              </button>
            ))}
          </div>

          {/* Manage profiles button */}
          <div className="border-t border-gray-100">
            <button
              onClick={() => {
                onManageProfiles();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2 px-3 py-2.5 text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Settings className="w-4 h-4" />
              <span className="text-sm">管理档案</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileQuickSwitch;
