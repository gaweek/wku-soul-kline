/**
 * Example usage of Feed components
 * This file demonstrates how to compose the feed system
 */

import React, { useState } from 'react';
import FeedTabs, { TabType } from './FeedTabs';
import Composer from './Composer';
import FeedList, { FeedItem } from './FeedList';
import { UserInput } from '../../types';

const FeedExample: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('for-you');
  const [isComposerExpanded, setIsComposerExpanded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Example feed items
  const exampleItems: FeedItem[] = [
    {
      id: '1',
      type: 'report',
      timestamp: '2小时前',
      data: {
        id: '1',
        title: '张三的人生K线分析报告',
        timestamp: '2023-12-15 14:30',
        summary: '整体命局偏财旺盛，适合从事投资相关行业。30-40岁为事业黄金期。',
        score: 85,
        peakYear: 35,
        name: '张三',
        gender: '男',
        isLocked: false,
      },
    },
    {
      id: '2',
      type: 'case',
      timestamp: '5小时前',
      data: {
        id: '2',
        title: '科技创业者的逆袭之路',
        persona: '程序员',
        curveType: 'V型反转',
        description: '从底层码农到独角兽CTO，看技术人如何把握命运转折点。',
      },
    },
    {
      id: '3',
      type: 'knowledge',
      timestamp: '1天前',
      data: {
        id: '3',
        title: '八字中的十神解析：如何看懂你的财运',
        category: '基础知识',
        summary: '深入浅出讲解八字十神系统，重点分析正财、偏财对个人财运的影响。',
        views: 12580,
        tags: ['八字', '财运', '十神'],
      },
    },
    {
      id: '4',
      type: 'announcement',
      timestamp: '2天前',
      data: {
        title: '新功能上线：AI智能八字解读',
        content: '我们全新推出了基于大语言模型的智能八字分析系统，为您提供更专业、更个性化的命理解读。',
      },
    },
    {
      id: '5',
      type: 'report',
      timestamp: '3天前',
      data: {
        id: '5',
        title: '游客测算报告',
        timestamp: '2023-12-12 09:15',
        summary: '这是一个示例报告，展示了游客未登录状态下的锁定效果。',
        score: 78,
        peakYear: 42,
        isLocked: true,
      },
    },
  ];

  const handleSubmit = async (data: UserInput) => {
    console.log('Generating K-line for:', data);
    setIsGenerating(true);

    // Simulate API call
    setTimeout(() => {
      setIsGenerating(false);
      setIsComposerExpanded(false);
      alert('人生K线生成成功！');
    }, 2000);
  };

  const handleItemClick = (item: FeedItem) => {
    console.log('Item clicked:', item);
    alert(`查看 ${item.type}: ${item.id}`);
  };

  const feedItems = activeTab === 'for-you'
    ? exampleItems
    : exampleItems.filter(item => item.type === 'report');

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-2xl mx-auto bg-white sticky top-0 z-20 shadow-sm">
        <div className="px-4 py-4">
          <h1 className="text-2xl font-bold text-gray-900">人生K线</h1>
        </div>
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Composer */}
      <div className="max-w-2xl mx-auto">
        <Composer
          onSubmit={handleSubmit}
          isLoading={isGenerating}
          isExpanded={isComposerExpanded}
          onToggle={setIsComposerExpanded}
        />
      </div>

      {/* Feed List */}
      <div className="max-w-2xl mx-auto p-4">
        <FeedList items={feedItems} onItemClick={handleItemClick} />
      </div>
    </div>
  );
};

export default FeedExample;
