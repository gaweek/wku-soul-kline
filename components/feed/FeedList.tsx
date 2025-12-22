import React from 'react';
import ReportCard from './ReportCard';
import CaseCard from './CaseCard';
import KnowledgeCard from './KnowledgeCard';

export type FeedItemType = 'report' | 'case' | 'knowledge' | 'announcement';

export interface FeedItem {
  id: string;
  type: FeedItemType;
  data: any;
  timestamp?: string;
}

interface FeedListProps {
  items: FeedItem[];
  onItemClick?: (item: FeedItem) => void;
}

const FeedList: React.FC<FeedListProps> = ({ items, onItemClick }) => {
  const handleItemClick = (item: FeedItem) => {
    if (onItemClick) {
      onItemClick(item);
    }
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="text-gray-400 text-6xl mb-4">📭</div>
        <h3 className="text-lg font-semibold text-gray-600 mb-2">暂无内容</h3>
        <p className="text-sm text-gray-500">开始测算您的第一个人生K线吧</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items.map((item) => {
        switch (item.type) {
          case 'report':
            return (
              <ReportCard
                key={item.id}
                report={item.data}
                onView={() => handleItemClick(item)}
                onShare={() => console.log('Share report:', item.id)}
                isLocked={item.data.isLocked}
              />
            );
          case 'case':
            return (
              <CaseCard
                key={item.id}
                case={item.data}
                onClick={() => handleItemClick(item)}
              />
            );
          case 'knowledge':
            return (
              <KnowledgeCard
                key={item.id}
                article={item.data}
                onClick={() => handleItemClick(item)}
              />
            );
          case 'announcement':
            return (
              <div
                key={item.id}
                className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-2xl p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">📢</div>
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      {item.data.title}
                    </h3>
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {item.data.content}
                    </p>
                    {item.timestamp && (
                      <p className="text-xs text-gray-500 mt-2">{item.timestamp}</p>
                    )}
                  </div>
                </div>
              </div>
            );
          default:
            return null;
        }
      })}
    </div>
  );
};

export default FeedList;
