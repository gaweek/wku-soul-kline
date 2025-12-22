import React from 'react';
import {
  ChevronRight,
  ChevronLeft,
  FileText,
  X,
} from 'lucide-react';

interface AnalysisPanelProps {
  isOpen: boolean;
  onToggle: () => void;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  isOpen,
  onToggle,
  onClose,
  title = '命盘分析报告',
  children,
}) => {
  if (!isOpen) {
    // Collapsed toggle button
    return (
      <div className="fixed right-0 top-1/2 -translate-y-1/2 z-40">
        <button
          onClick={onToggle}
          className="flex items-center gap-1 px-2 py-4 bg-white shadow-lg rounded-l-xl border border-r-0 border-gray-200 hover:bg-gray-50 transition-colors"
        >
          <ChevronLeft className="w-4 h-4 text-gray-400" />
          <FileText className="w-5 h-5 text-indigo-500" />
        </button>
      </div>
    );
  }

  return (
    <div className="fixed top-0 right-0 h-screen w-full md:w-[480px] lg:w-[560px] bg-gray-50 border-l border-gray-200 shadow-xl z-40 flex flex-col transition-all duration-300 ease-in-out overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 bg-white border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-500" />
          </button>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-500" />
            <h2 className="font-bold text-gray-800">{title}</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

export default AnalysisPanel;
