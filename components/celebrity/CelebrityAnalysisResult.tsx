import React, { useState } from 'react';
import {
  User,
  Briefcase,
  Wallet,
  Heart,
  Activity,
  MapPin,
  ChevronDown,
  ChevronUp,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { CelebrityAnalysisData } from '../../types';
import { KnowledgeTerm } from '../cases/KnowledgeTerm';

interface CelebrityAnalysisResultProps {
  analysisData: CelebrityAnalysisData;
  celebrityName: string;
  className?: string;
}

interface AnalysisSectionProps {
  title: string;
  icon: React.ReactNode;
  content: string;
  gradientFrom: string;
  gradientTo: string;
  defaultExpanded?: boolean;
}

const AnalysisSection: React.FC<AnalysisSectionProps> = ({
  title,
  icon,
  content,
  gradientFrom,
  gradientTo,
  defaultExpanded = false,
}) => {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const preview = content.slice(0, 150);
  const hasMore = content.length > 150;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden">
      <div
        className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} px-5 py-4 flex items-center justify-between cursor-pointer`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center gap-3 text-white">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
            {icon}
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
        </div>
        <button className="text-white/80 hover:text-white transition-colors">
          {expanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        </button>
      </div>

      <div className="p-5">
        <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
          <KnowledgeTerm text={expanded || !hasMore ? content : `${preview}...`} />
        </div>
        {hasMore && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center gap-1"
          >
            展开全部
            <ChevronDown className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

const CelebrityAnalysisResult: React.FC<CelebrityAnalysisResultProps> = ({
  analysisData,
  celebrityName,
  className = ''
}) => {
  const sections = [
    {
      key: 'summary',
      title: '命理总评',
      icon: <Sparkles className="w-5 h-5 text-white" />,
      content: analysisData.summary,
      gradientFrom: 'from-violet-600',
      gradientTo: 'to-purple-600',
      defaultExpanded: true,
    },
    {
      key: 'personality',
      title: '性格分析',
      icon: <User className="w-5 h-5 text-white" />,
      content: analysisData.personality,
      gradientFrom: 'from-blue-600',
      gradientTo: 'to-cyan-600',
    },
    {
      key: 'career',
      title: '事业分析',
      icon: <Briefcase className="w-5 h-5 text-white" />,
      content: analysisData.career,
      gradientFrom: 'from-emerald-600',
      gradientTo: 'to-green-600',
    },
    {
      key: 'wealth',
      title: '财富分析',
      icon: <Wallet className="w-5 h-5 text-white" />,
      content: analysisData.wealth,
      gradientFrom: 'from-yellow-600',
      gradientTo: 'to-amber-600',
    },
    {
      key: 'marriage',
      title: '婚姻分析',
      icon: <Heart className="w-5 h-5 text-white" />,
      content: analysisData.marriage,
      gradientFrom: 'from-rose-600',
      gradientTo: 'to-pink-600',
    },
    {
      key: 'health',
      title: '健康分析',
      icon: <Activity className="w-5 h-5 text-white" />,
      content: analysisData.health,
      gradientFrom: 'from-red-600',
      gradientTo: 'to-orange-600',
    },
  ];

  // Add life trajectory if available
  if (analysisData.lifeTrajectory) {
    sections.push({
      key: 'lifeTrajectory',
      title: '人生轨迹',
      icon: <TrendingUp className="w-5 h-5 text-white" />,
      content: analysisData.lifeTrajectory,
      gradientFrom: 'from-indigo-600',
      gradientTo: 'to-violet-600',
    });
  }

  // Add feng shui if available
  if (analysisData.fengShui) {
    sections.push({
      key: 'fengShui',
      title: '风水建议',
      icon: <MapPin className="w-5 h-5 text-white" />,
      content: analysisData.fengShui,
      gradientFrom: 'from-teal-600',
      gradientTo: 'to-emerald-600',
    });
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-2 mb-6">
        <Sparkles className="w-5 h-5 text-indigo-600" />
        <h2 className="text-xl font-bold text-gray-800">
          {celebrityName} 命理深度分析
        </h2>
      </div>

      {sections.map((section) => (
        <AnalysisSection
          key={section.key}
          title={section.title}
          icon={section.icon}
          content={section.content}
          gradientFrom={section.gradientFrom}
          gradientTo={section.gradientTo}
          defaultExpanded={section.defaultExpanded}
        />
      ))}
    </div>
  );
};

export default CelebrityAnalysisResult;
