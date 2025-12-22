import React from 'react';
import { Twitter } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gray-900 text-gray-400 py-8 mt-auto no-print">
      <div className="max-w-7xl mx-auto px-4 text-center text-sm flex flex-col items-center gap-2">
        <p>&copy; {new Date().getFullYear()} 人生K线项目 | 仅供娱乐与文化研究，请勿迷信</p>
        <a
          href="https://x.com/laoshiline"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 hover:text-white transition-colors"
        >
          <Twitter className="w-3 h-3" />
          @laoshiline
        </a>
      </div>
    </footer>
  );
};

export default Footer;
