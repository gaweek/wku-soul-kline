import React, { useState } from 'react';
import { X, Save, User, Calendar, Loader2, Info } from 'lucide-react';

interface SaveProfileDialogProps {
  onClose: () => void;
  onSave: (profileName: string) => Promise<void>;
  baziInfo: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    birthYear: string;
    gender?: string;
  };
  isOpen: boolean;
}

const SaveProfileDialog: React.FC<SaveProfileDialogProps> = ({
  onClose,
  onSave,
  baziInfo,
  isOpen
}) => {
  const [profileName, setProfileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!profileName.trim()) {
      setError('请输入档案名称');
      return;
    }

    if (profileName.trim().length > 20) {
      setError('名称不能超过20个字符');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSave(profileName.trim());
      onClose();
    } catch (err: any) {
      setError(err.message || '保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-orange-50 rounded-t-xl">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Save className="w-5 h-5 text-amber-600" />
            保存八字档案
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/50 rounded-lg transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Profile Name Input */}
          <div>
            <label className="flex items-center space-x-2 text-sm font-bold text-gray-700 mb-2">
              <User className="w-4 h-4" />
              <span>档案名称</span>
            </label>
            <input
              type="text"
              value={profileName}
              onChange={(e) => {
                setProfileName(e.target.value);
                if (error) setError(null);
              }}
              placeholder="例如：我的八字、张三、老婆..."
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent text-lg ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              }`}
              disabled={isSubmitting}
              autoFocus
              maxLength={20}
            />
            {error && (
              <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                <span className="text-red-500">!</span>
                {error}
              </p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              {profileName.length}/20 字符
            </p>
          </div>

          {/* Bazi Information Display */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-gray-600" />
              <h3 className="text-sm font-bold text-gray-700">八字信息预览</h3>
            </div>

            {/* Four Pillars */}
            <div className="grid grid-cols-4 gap-2 mb-3">
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">年柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-900 bg-white px-2 py-1.5 rounded border border-gray-200">
                  {baziInfo.yearPillar || '--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">月柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-900 bg-white px-2 py-1.5 rounded border border-gray-200">
                  {baziInfo.monthPillar || '--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">日柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-900 bg-white px-2 py-1.5 rounded border border-gray-200">
                  {baziInfo.dayPillar || '--'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500 mb-1">时柱</div>
                <div className="text-lg font-serif-sc font-bold text-gray-900 bg-white px-2 py-1.5 rounded border border-gray-200">
                  {baziInfo.hourPillar || '--'}
                </div>
              </div>
            </div>

            {/* Birth Year */}
            <div className="text-sm text-gray-600 flex items-center gap-4">
              <span>
                <span className="font-medium">出生年份：</span>
                {baziInfo.birthYear || '未知'}年
              </span>
              {baziInfo.gender && (
                <span>
                  <span className="font-medium">性别：</span>
                  {baziInfo.gender === 'Male' ? '男' : '女'}
                </span>
              )}
            </div>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 flex items-start gap-2">
            <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-blue-800">
              保存后可在「今日运势」等功能中快速选择使用，无需重复输入八字信息。
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              取消
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !profileName.trim()}
              className="flex items-center space-x-2 px-6 py-2.5 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-bold shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>保存中...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>保存档案</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveProfileDialog;
