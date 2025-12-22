import React from 'react';
import { User, Coins, FileText, LogOut, LogIn } from 'lucide-react';

interface UserInfo {
  email: string;
  credits: number;
  recentReports?: number;
}

interface UserCardProps {
  isLoggedIn: boolean;
  userInfo?: UserInfo;
  onLogin: () => void;
  onLogout: () => void;
}

export const UserCard: React.FC<UserCardProps> = ({
  isLoggedIn,
  userInfo,
  onLogin,
  onLogout,
}) => {
  if (isLoggedIn && userInfo) {
    return (
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-800">我的账户</h3>
          <button
            onClick={onLogout}
            className="text-xs text-gray-500 hover:text-gray-700 flex items-center gap-1"
          >
            <LogOut className="w-3 h-3" />
            退出
          </button>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-gray-700 truncate">{userInfo.email}</span>
          </div>

          <div className="flex items-center justify-between bg-amber-50 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-amber-600" />
              <span className="text-sm font-medium text-gray-700">点数余额</span>
            </div>
            <span className="text-lg font-bold text-amber-600">
              {userInfo.credits}
            </span>
          </div>

          {userInfo.recentReports !== undefined && userInfo.recentReports > 0 && (
            <button className="w-full flex items-center justify-between bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-600" />
                <span className="text-sm text-gray-700">最近报告</span>
              </div>
              <span className="text-xs font-medium text-purple-600">
                {userInfo.recentReports} 份
              </span>
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-3">
        <User className="w-5 h-5 text-gray-600" />
        <h3 className="text-sm font-bold text-gray-800">登录/注册</h3>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div>
          <p className="text-xs text-gray-600">保存测算记录，随时查看</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div>
          <p className="text-xs text-gray-600">获取每日运势推送提醒</p>
        </div>
        <div className="flex items-start gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5"></div>
          <p className="text-xs text-gray-600">解锁更多高级功能特权</p>
        </div>
      </div>

      <button
        onClick={onLogin}
        className="w-full bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
      >
        <LogIn className="w-4 h-4" />
        立即登录
      </button>
    </div>
  );
};
