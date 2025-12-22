import React from 'react';

export type TabType = 'for-you' | 'mine';

interface FeedTabsProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
}

const FeedTabs: React.FC<FeedTabsProps> = ({ activeTab, onTabChange }) => {
  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-2xl mx-auto flex">
        <button
          onClick={() => onTabChange('for-you')}
          className={`flex-1 px-4 py-4 text-center font-semibold text-sm relative transition-colors ${
            activeTab === 'for-you'
              ? 'text-gray-900'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          For You
          {activeTab === 'for-you' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
          )}
        </button>
        <button
          onClick={() => onTabChange('mine')}
          className={`flex-1 px-4 py-4 text-center font-semibold text-sm relative transition-colors ${
            activeTab === 'mine'
              ? 'text-gray-900'
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          Mine
          {activeTab === 'mine' && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-indigo-600 rounded-t-full" />
          )}
        </button>
      </div>
    </div>
  );
};

export default FeedTabs;
