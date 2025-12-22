import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';

interface LayoutProps {
  isLoggedIn: boolean;
  userInfo: { email: string; points: number } | null;
  isGuest: boolean;
  showUserMenu: boolean;
  setShowUserMenu: (show: boolean) => void;
  onLoginClick: () => void;
  onLogout: () => void;
}

const Layout: React.FC<LayoutProps> = ({
  isLoggedIn,
  userInfo,
  isGuest,
  showUserMenu,
  setShowUserMenu,
  onLoginClick,
  onLogout,
}) => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header
        isLoggedIn={isLoggedIn}
        userInfo={userInfo}
        isGuest={isGuest}
        showUserMenu={showUserMenu}
        setShowUserMenu={setShowUserMenu}
        onLoginClick={onLoginClick}
        onLogout={onLogout}
      />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

export default Layout;
