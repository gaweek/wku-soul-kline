import React, { useState, useRef } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  X as XIcon,
  MessageCircle,
  Link2,
} from 'lucide-react';
import html2canvas from 'html2canvas';

interface CelebritySharePanelProps {
  celebrityId: string;
  celebrityName: string;
  analysisRef: React.RefObject<HTMLDivElement>;
  shareUrl?: string;
  onClose?: () => void;
  className?: string;
}

const CelebritySharePanel: React.FC<CelebritySharePanelProps> = ({
  celebrityId,
  celebrityName,
  analysisRef,
  shareUrl,
  onClose,
  className = ''
}) => {
  const [copied, setCopied] = useState(false);
  const [exporting, setExporting] = useState(false);

  const defaultShareUrl = shareUrl || `${window.location.origin}/celebrity-cases/${celebrityId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(defaultShareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('复制失败:', err);
    }
  };

  const handleExportImage = async () => {
    if (!analysisRef.current || exporting) return;

    setExporting(true);
    try {
      const canvas = await html2canvas(analysisRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: analysisRef.current.scrollWidth,
        windowHeight: analysisRef.current.scrollHeight,
      });

      const link = document.createElement('a');
      link.download = `${celebrityName}_命理分析_${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.error('导出图片失败:', err);
    } finally {
      setExporting(false);
    }
  };

  const handleShareX = () => {
    const text = `${celebrityName}的八字命理深度分析 - 人生K线\n基于中华古法命理科学算法\n`;
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(defaultShareUrl)}`;
    window.open(url, '_blank', 'width=550,height=420');
  };

  const handleShareTelegram = () => {
    const text = `${celebrityName}的八字命理深度分析`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(defaultShareUrl)}&text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className={`bg-white rounded-2xl shadow-lg p-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-indigo-500 to-purple-500 flex items-center justify-center">
            <Share2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-gray-800">分享分析报告</h3>
            <p className="text-sm text-gray-500">{celebrityName}</p>
          </div>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <XIcon className="w-5 h-5 text-gray-500" />
          </button>
        )}
      </div>

      {/* Share buttons */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <button
          onClick={handleShareX}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-black text-white rounded-xl hover:bg-gray-800 transition-colors"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
          <span className="font-medium">分享到 X</span>
        </button>

        <button
          onClick={handleShareTelegram}
          className="flex items-center justify-center gap-2 px-4 py-3 bg-[#0088cc] text-white rounded-xl hover:bg-[#007ab8] transition-colors"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="font-medium">Telegram</span>
        </button>
      </div>

      {/* Copy link */}
      <div className="mb-4">
        <label className="text-sm font-medium text-gray-700 mb-2 block">分享链接</label>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 bg-gray-100 rounded-xl overflow-hidden">
            <Link2 className="w-4 h-4 text-gray-500 flex-shrink-0" />
            <span className="text-sm text-gray-600 truncate">{defaultShareUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className={`px-4 py-2.5 rounded-xl font-medium transition-all ${
              copied
                ? 'bg-green-100 text-green-700'
                : 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
            }`}
          >
            {copied ? (
              <div className="flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>已复制</span>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Copy className="w-4 h-4" />
                <span>复制</span>
              </div>
            )}
          </button>
        </div>
      </div>

      {/* Export image */}
      <button
        onClick={handleExportImage}
        disabled={exporting}
        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-600 hover:to-teal-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <Download className="w-5 h-5" />
        <span className="font-medium">{exporting ? '导出中...' : '保存为图片'}</span>
      </button>

      {/* Disclaimer */}
      <p className="text-xs text-gray-500 text-center mt-4">
        分享内容由自研中华古法命理科学算法生成
      </p>
    </div>
  );
};

export default CelebritySharePanel;
