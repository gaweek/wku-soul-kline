import React, { useState } from 'react';
import { Save, Download, Share2, Loader2 } from 'lucide-react';
import html2canvas from 'html2canvas';
import SaveProfileDialog from './SaveProfileDialog';

interface ResultActionsProps {
  baziInfo: {
    yearPillar: string;
    monthPillar: string;
    dayPillar: string;
    hourPillar: string;
    birthYear: string;
  };
  userName?: string;
  onSaveProfile?: (profileName: string) => Promise<void>;
  onShare?: () => void;
  resultElementId?: string;
}

const ResultActions: React.FC<ResultActionsProps> = ({
  baziInfo,
  userName,
  onSaveProfile,
  onShare,
  resultElementId = 'result-chart-section'
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadError, setDownloadError] = useState<string | null>(null);

  // Handle download image functionality
  const handleDownloadImage = async () => {
    const element = document.getElementById(resultElementId);

    if (!element) {
      setDownloadError('Result section not found. Please try again.');
      setTimeout(() => setDownloadError(null), 3000);
      return;
    }

    setIsDownloading(true);
    setDownloadError(null);

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff',
        logging: false,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });

      const link = document.createElement('a');
      const timestamp = new Date().toISOString().split('T')[0];
      link.download = `人生K线_${userName || 'Report'}_${timestamp}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (error) {
      console.error('Download failed:', error);
      setDownloadError('Failed to download image. Please try using screenshot instead.');
      setTimeout(() => setDownloadError(null), 5000);
    } finally {
      setIsDownloading(false);
    }
  };

  // Handle save profile
  const handleSaveProfile = async (profileName: string) => {
    if (onSaveProfile) {
      await onSaveProfile(profileName);
    }
  };

  return (
    <>
      <div className="flex flex-wrap gap-3 items-center">
        {/* Save Profile Button */}
        {onSaveProfile && (
          <button
            onClick={() => setShowSaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all font-medium text-sm shadow-sm"
          >
            <Save className="w-4 h-4" />
            保存档案
          </button>
        )}

        {/* Download Image Button */}
        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all font-medium text-sm shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>生成中...</span>
            </>
          ) : (
            <>
              <Download className="w-4 h-4" />
              <span>下载图片</span>
            </>
          )}
        </button>

        {/* Share Button */}
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all font-medium text-sm shadow-sm"
          >
            <Share2 className="w-4 h-4" />
            分享
          </button>
        )}

        {/* Download Error Message */}
        {downloadError && (
          <div className="w-full bg-red-50 border border-red-200 text-red-700 px-4 py-2 rounded-lg text-sm">
            {downloadError}
          </div>
        )}
      </div>

      {/* Save Profile Dialog */}
      <SaveProfileDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        onSave={handleSaveProfile}
        baziInfo={baziInfo}
      />
    </>
  );
};

export default ResultActions;
