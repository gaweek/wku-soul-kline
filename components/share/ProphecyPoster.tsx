import React, { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { QRCodeSVG } from 'qrcode.react';
import { Download, Share2, Calendar, Sparkles } from 'lucide-react';
import { KLinePoint, TimelineEvent, AnalysisData } from '../../types';

interface ProphecyPosterProps {
  userName?: string;
  bazi?: string[];
  futureYears: KLinePoint[];
  futureEvents?: TimelineEvent[];
  prediction?: string;
  onClose?: () => void;
}

const ProphecyPoster: React.FC<ProphecyPosterProps> = ({
  userName = '命主',
  bazi = ['甲', '乙', '丙', '丁'],
  futureYears,
  futureEvents = [],
  prediction,
  onClose,
}) => {
  const posterRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const currentDate = new Date();
  const timestamp = `${currentDate.getFullYear()}.${String(currentDate.getMonth() + 1).padStart(2, '0')}.${String(currentDate.getDate()).padStart(2, '0')}`;

  // Get the highest and lowest points in future years
  const peakYear = futureYears.reduce((max, y) =>
    y.score > max.score ? y : max, futureYears[0]
  );
  const troughYear = futureYears.reduce((min, y) =>
    y.score < min.score ? y : min, futureYears[0]
  );

  const generatePoster = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#0F172A', // slate-900
        useCORS: true,
        logging: false,
      });

      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `life-kline-prophecy-${userName}-${timestamp.replace(/\./g, '')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error('Failed to generate poster:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const sharePoster = async () => {
    if (!posterRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = await html2canvas(posterRef.current, {
        scale: 2,
        backgroundColor: '#0F172A',
        useCORS: true,
        logging: false,
      });

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), 'image/png');
      });

      if (navigator.share) {
        await navigator.share({
          title: 'Life Kline 命运预言',
          text: `${userName}的未来运势预测`,
          files: [new File([blob], 'prophecy.png', { type: 'image/png' })],
        });
      } else {
        // Fallback to download
        generatePoster();
      }
    } catch (error) {
      console.error('Failed to share:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-auto">
      <div className="max-w-lg w-full">
        {/* Poster Content */}
        <div
          ref={posterRef}
          className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-2xl overflow-hidden shadow-2xl"
          style={{ fontFamily: '"Noto Serif SC", serif' }}
        >
          {/* Header */}
          <div className="relative p-6 pb-4">
            {/* Decorative elements */}
            <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-indigo-500/20 to-transparent rounded-full blur-3xl" />
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-amber-500/20 to-transparent rounded-full blur-2xl" />

            <div className="relative flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-amber-400" />
                  命运预言
                </h1>
                <p className="text-indigo-300 text-sm mt-1">Life Kline Prophecy</p>
              </div>
              <div className="text-right">
                <p className="text-gray-400 text-xs">预测于</p>
                <p className="text-white font-mono">{timestamp}</p>
              </div>
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-xs mb-1">命主</p>
                <p className="text-xl text-white font-bold">{userName}</p>
              </div>
              <div className="flex gap-2">
                {bazi.map((pillar, idx) => (
                  <div
                    key={idx}
                    className="w-10 h-10 rounded bg-white/5 border border-white/10 flex items-center justify-center"
                  >
                    <span className="text-indigo-300 font-bold">{pillar}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Future K-Line Mini Chart */}
          <div className="px-6 py-4 border-t border-white/10">
            <p className="text-gray-400 text-xs mb-3">未来运势走向</p>
            <div className="flex items-end justify-between h-24 gap-1">
              {futureYears.slice(0, 5).map((year, idx) => {
                const height = Math.max(20, (year.score / 100) * 80);
                const isPeak = year.year === peakYear.year;
                const isTrough = year.year === troughYear.year;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center">
                    <div
                      className={`w-full rounded-t transition-all ${
                        isPeak
                          ? 'bg-gradient-to-t from-emerald-600 to-emerald-400'
                          : isTrough
                            ? 'bg-gradient-to-t from-rose-600 to-rose-400'
                            : 'bg-gradient-to-t from-indigo-600 to-indigo-400'
                      }`}
                      style={{ height: `${height}%` }}
                    />
                    <p className="text-gray-400 text-xs mt-1">{year.year}</p>
                    <p className={`text-xs font-bold ${
                      isPeak ? 'text-emerald-400' : isTrough ? 'text-rose-400' : 'text-indigo-300'
                    }`}>
                      {year.score}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Key Prediction */}
          {prediction && (
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-gray-400 text-xs mb-2 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                核心预言
              </p>
              <p className="text-white leading-relaxed text-sm">
                "{prediction}"
              </p>
            </div>
          )}

          {/* Key Events */}
          {futureEvents.length > 0 && (
            <div className="px-6 py-4 border-t border-white/10">
              <p className="text-gray-400 text-xs mb-3">关键转折点</p>
              <div className="space-y-2">
                {futureEvents.slice(0, 3).map((event, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded-lg ${
                      event.sentiment === 'positive'
                        ? 'bg-emerald-500/10 border border-emerald-500/30'
                        : event.sentiment === 'negative'
                          ? 'bg-rose-500/10 border border-rose-500/30'
                          : 'bg-white/5 border border-white/10'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-sm font-medium ${
                        event.sentiment === 'positive'
                          ? 'text-emerald-400'
                          : event.sentiment === 'negative'
                            ? 'text-rose-400'
                            : 'text-gray-300'
                      }`}>
                        {event.year}年 - {event.title}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Footer with QR Code */}
          <div className="px-6 py-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-xs">扫码查看完整K线</p>
              <p className="text-indigo-400 text-xs font-mono">人生K线</p>
            </div>
            <div className="bg-white p-2 rounded-lg">
              <QRCodeSVG
                value={window.location.origin}
                size={60}
                level="L"
                includeMargin={false}
              />
            </div>
          </div>

          {/* Watermark */}
          <div className="px-6 py-2 bg-white/5 text-center">
            <p className="text-gray-500 text-xs">
              Life Kline · AI命理分析 · 仅供娱乐参考
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={generatePoster}
            disabled={isGenerating}
            className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-800 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            {isGenerating ? '生成中...' : '保存图片'}
          </button>
          <button
            onClick={sharePoster}
            disabled={isGenerating}
            className="flex-1 py-3 bg-white/10 hover:bg-white/20 disabled:bg-white/5 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Share2 className="w-5 h-5" />
            分享
          </button>
        </div>

        {/* Close Button */}
        {onClose && (
          <button
            onClick={onClose}
            className="w-full mt-3 py-2 text-gray-400 hover:text-white text-sm transition-colors"
          >
            关闭
          </button>
        )}
      </div>
    </div>
  );
};

export default ProphecyPoster;
