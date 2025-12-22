import React from 'react';
import { Send, Twitter } from 'lucide-react';

interface CommunityCardProps {
  telegramUrl?: string;
  twitterUrl?: string;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  telegramUrl = 'https://t.me/+HmqljTJNwaIxZDJl',
  twitterUrl = 'https://twitter.com/laoshiline',
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <h3 className="text-sm font-bold text-gray-800 mb-3">加入社群</h3>

      <div className="space-y-2">
        <a
          href={telegramUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between bg-[#0088cc] hover:bg-[#0077b5] text-white rounded-lg p-3 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/20 rounded-lg p-1.5">
              <Send className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Telegram 社群</div>
              <div className="text-xs opacity-90">实时交流互动</div>
            </div>
          </div>
          <svg
            className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>

        <a
          href={twitterUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full flex items-center justify-between bg-gray-900 hover:bg-gray-800 text-white rounded-lg p-3 transition-colors group"
        >
          <div className="flex items-center gap-3">
            <div className="bg-white/10 rounded-lg p-1.5">
              <Twitter className="w-4 h-4" />
            </div>
            <div className="text-left">
              <div className="text-sm font-semibold">Twitter / X</div>
              <div className="text-xs opacity-90">@laoshiline</div>
            </div>
          </div>
          <svg
            className="w-4 h-4 opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </a>
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        关注我们获取最新资讯和优惠
      </p>
    </div>
  );
};
