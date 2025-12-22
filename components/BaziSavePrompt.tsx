import React from 'react';
import { Save, X, Bookmark } from 'lucide-react';

interface BaziSavePromptProps {
  onSave: () => void;
  onDismiss: () => void;
  isVisible: boolean;
}

/**
 * BaziSavePrompt - Shows after user fills complete bazi info
 * Prompts user to save the profile for future use
 */
const BaziSavePrompt: React.FC<BaziSavePromptProps> = ({
  onSave,
  onDismiss,
  isVisible,
}) => {
  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-4 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
          <Bookmark className="w-5 h-5 text-amber-600" />
        </div>

        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-bold text-amber-900 mb-1">
            是否保存此八字档案？
          </h4>
          <p className="text-xs text-amber-700 leading-relaxed mb-3">
            保存后可在「今日运势」等功能中快速使用，无需重复输入。
          </p>

          <div className="flex items-center gap-2">
            <button
              onClick={onSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-bold rounded-lg transition-colors shadow-sm"
            >
              <Save className="w-4 h-4" />
              保存档案
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-amber-700 hover:text-amber-900 text-sm font-medium transition-colors"
            >
              跳过
            </button>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="flex-shrink-0 p-1 text-amber-400 hover:text-amber-600 transition-colors"
          aria-label="关闭"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default BaziSavePrompt;
