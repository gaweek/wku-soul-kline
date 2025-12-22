import React from 'react';
import { X, CheckCircle, Clock, Loader2, Brain, Briefcase, Heart, Bitcoin, TrendingUp, TrendingDown } from 'lucide-react';

// Local type definitions for the 6-agent parallel system
type AgentType = 'core' | 'kline_past' | 'kline_future' | 'career' | 'marriage' | 'crypto';

interface AgentStatus {
  status: 'pending' | 'running' | 'completed' | 'failed';
  data?: any;
  error?: string;
  elapsed?: string;
}

interface PartialResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  agentStatuses: Record<AgentType, AgentStatus>;
}

const PartialResultsModal: React.FC<PartialResultsModalProps> = ({
  isOpen,
  onClose,
  agentStatuses,
  result,
}) => {
  if (!isOpen) return null;

  const agentNames: Record<AgentType, string> = {
    core: '核心命理',
    kline: 'K线数据',
    career: '事业财富',
    marriage: '婚姻健康',
    crypto: '币圈分析',
  };

  const agentIcons: Record<AgentType, React.ComponentType<any>> = {
    core: Brain,
    kline: Clock,
    career: Briefcase,
    marriage: Heart,
    crypto: Bitcoin,
  };

  // Get completed agents
  const completedAgents = (Object.keys(agentStatuses) as AgentType[]).filter(
    (type) => agentStatuses[type].status === 'completed'
  );

  // Get analysis data for each agent
  const getAgentData = (agentType: AgentType) => {
    if (!result?.analysis) return null;

    switch (agentType) {
      case 'core':
        return {
          summary: result.analysis.summary,
          personality: result.analysis.personality,
          family: result.analysis.family,
          fengShui: result.analysis.fengShui,
        };
      case 'career':
        return {
          industry: result.analysis.industry,
          wealth: result.analysis.wealth,
        };
      case 'marriage':
        return {
          marriage: result.analysis.marriage,
          health: result.analysis.health,
        };
      case 'crypto':
        return {
          crypto: result.analysis.crypto,
          cryptoYear: result.analysis.cryptoYear,
          cryptoStyle: result.analysis.cryptoStyle,
        };
      case 'kline':
        return {
          chartData: result.chartData,
          pastEvents: result.analysis.pastEvents,
          futureEvents: result.analysis.futureEvents,
        };
      default:
        return null;
    }
  };

  const renderAgentContent = (agentType: AgentType) => {
    const data = getAgentData(agentType);
    if (!data) return <p className="text-sm text-gray-500">暂无数据</p>;

    const Icon = agentIcons[agentType];

    switch (agentType) {
      case 'core':
        return (
          <div className="space-y-4">
            {data.summary && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">命理总评</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.summary}</p>
              </div>
            )}
            {data.personality && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">性格分析</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.personality}</p>
              </div>
            )}
          </div>
        );

      case 'career':
        return (
          <div className="space-y-4">
            {data.industry && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">事业行业</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.industry}</p>
              </div>
            )}
            {data.wealth && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">财富层级</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.wealth}</p>
              </div>
            )}
          </div>
        );

      case 'marriage':
        return (
          <div className="space-y-4">
            {data.marriage && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">婚姻情感</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.marriage}</p>
              </div>
            )}
            {data.health && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">身体健康</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.health}</p>
              </div>
            )}
          </div>
        );

      case 'crypto':
        return (
          <div className="space-y-4">
            {data.crypto && (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">币圈交易运势</h5>
                <p className="text-sm text-gray-600 whitespace-pre-wrap">{data.crypto}</p>
                {data.cryptoYear && (
                  <div className="mt-2 flex gap-2">
                    <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded">
                      暴富流年: {data.cryptoYear}
                    </span>
                    {data.cryptoStyle && (
                      <span className="px-2 py-1 bg-indigo-100 text-indigo-700 text-xs rounded">
                        推荐: {data.cryptoStyle}
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 'kline':
        return (
          <div className="space-y-4">
            {data.chartData && data.chartData.length > 0 ? (
              <div>
                <h5 className="font-medium text-gray-700 mb-2">K线数据已生成</h5>
                <p className="text-sm text-gray-600">
                  共 {data.chartData.length} 个数据点
                </p>
              </div>
            ) : (
              <p className="text-sm text-gray-500">K线数据正在生成中...</p>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-white">
            <CheckCircle className="w-5 h-5" />
            <h3 className="font-bold text-lg">已完成分析预览</h3>
            <span className="text-sm opacity-80">({completedAgents.length}/5)</span>
          </div>
          <button
            onClick={onClose}
            className="text-white/80 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          {completedAgents.length === 0 ? (
            <div className="text-center py-12">
              <Loader2 className="w-12 h-12 text-indigo-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600">正在分析中，暂无已完成的部分...</p>
              <p className="text-sm text-gray-500 mt-2">请稍候，分析完成后将自动显示</p>
            </div>
          ) : (
            <div className="space-y-6">
              {completedAgents.map((agentType) => {
                const Icon = agentIcons[agentType];
                const status = agentStatuses[agentType];

                return (
                  <div
                    key={agentType}
                    className="bg-gray-50 rounded-xl p-5 border border-gray-200"
                  >
                    {/* Agent Header */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Icon className="w-5 h-5 text-indigo-600" />
                        <h4 className="font-bold text-gray-800">{agentNames[agentType]}</h4>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3" />
                        <span>已完成</span>
                        {status.elapsed && <span className="text-gray-500">({status.elapsed})</span>}
                      </div>
                    </div>

                    {/* Agent Content */}
                    {renderAgentContent(agentType)}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex justify-between items-center bg-gray-50 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            其他部分仍在分析中，完成后将自动显示在主页面
          </p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all"
          >
            关闭
          </button>
        </div>
      </div>
    </div>
  );
};

export default PartialResultsModal;
