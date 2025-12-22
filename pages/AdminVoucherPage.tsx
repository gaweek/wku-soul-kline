import React, { useState } from 'react';
import { Ticket, Lock, Copy, Check, Loader2, Gift } from 'lucide-react';

interface GeneratedVoucher {
  code: string;
  points: number;
  createdAt: string;
}

const AdminVoucherPage: React.FC = () => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [points, setPoints] = useState(1000);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVoucher, setGeneratedVoucher] = useState<GeneratedVoucher | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [history, setHistory] = useState<GeneratedVoucher[]>([]);

  const handleAuth = () => {
    // 密码验证由后端处理，前端仅作为输入界面
    if (password.length > 0) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('请输入密码');
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    setError('');
    setGeneratedVoucher(null);

    try {
      const response = await fetch('/api/admin/voucher/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password, points }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || '生成失败');
      }

      const voucher = {
        code: data.code,
        points: data.points,
        createdAt: data.createdAt,
      };

      setGeneratedVoucher(voucher);
      setHistory(prev => [voucher, ...prev].slice(0, 10));
    } catch (err: any) {
      setError(err.message || '生成失败');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopy = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textArea = document.createElement('textarea');
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 密码验证界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Lock className="w-8 h-8 text-indigo-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">点券生成器</h1>
            <p className="text-gray-500 mt-2">请输入管理密码</p>
          </div>

          <div className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAuth()}
              placeholder="输入密码"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
            />

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            <button
              onClick={handleAuth}
              className="w-full py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              验证
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 生成界面
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
              <Ticket className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">点券生成器</h1>
              <p className="text-gray-500">为内测用户生成兑换码</p>
            </div>
          </div>

          {/* 点数输入 */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              点数
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                value={points}
                onChange={(e) => setPoints(Math.max(1, Math.min(100000, parseInt(e.target.value) || 0)))}
                min={1}
                max={100000}
                className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none text-lg font-mono"
              />
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-medium rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    生成中
                  </>
                ) : (
                  <>
                    <Gift className="w-5 h-5" />
                    生成
                  </>
                )}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-2">范围: 1 - 100,000 点</p>
          </div>

          {/* 快捷按钮 */}
          <div className="flex flex-wrap gap-2 mb-6">
            {[100, 500, 1000, 2000, 5000, 10000].map(p => (
              <button
                key={p}
                onClick={() => setPoints(p)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  points === p
                    ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {p.toLocaleString()} 点
              </button>
            ))}
          </div>

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600">
              {error}
            </div>
          )}

          {/* 生成结果 */}
          {generatedVoucher && (
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-green-700 font-medium">生成成功</span>
                <span className="text-2xl font-bold text-green-700">
                  {generatedVoucher.points.toLocaleString()} 点
                </span>
              </div>

              <div className="bg-white rounded-lg p-4 flex items-center justify-between">
                <code className="text-2xl font-mono font-bold text-gray-900 tracking-wider">
                  {generatedVoucher.code}
                </code>
                <button
                  onClick={() => handleCopy(generatedVoucher.code)}
                  className="ml-4 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      已复制
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      复制
                    </>
                  )}
                </button>
              </div>

              <p className="text-xs text-gray-500 mt-3 text-center">
                此兑换码只能使用一次，请妥善保管
              </p>
            </div>
          )}
        </div>

        {/* 历史记录 */}
        {history.length > 0 && (
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4">本次生成记录</h2>
            <div className="space-y-3">
              {history.map((voucher, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <code className="font-mono font-medium text-gray-900">
                      {voucher.code}
                    </code>
                    <span className="text-indigo-600 font-medium">
                      {voucher.points.toLocaleString()} 点
                    </span>
                  </div>
                  <button
                    onClick={() => handleCopy(voucher.code)}
                    className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminVoucherPage;
