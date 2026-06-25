import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

const VibeLinePage = lazy(() => import('./pages/VibeLinePage'));

const PageLoadingFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-[#f4fbfb] text-slate-950">
    <div className="flex items-center gap-3 rounded-full border border-teal-100 bg-white/80 px-5 py-3 shadow-sm backdrop-blur-xl">
      <Loader2 className="h-5 w-5 animate-spin text-teal-600" />
      <span className="text-sm font-bold tracking-wide">WKU soul-kline 正在启动</span>
    </div>
  </div>
);

const App: React.FC = () => (
  <BrowserRouter>
    <Suspense fallback={<PageLoadingFallback />}>
      <Routes>
        <Route path="/" element={<VibeLinePage />} />
        <Route path="/workbench" element={<VibeLinePage />} />
        <Route path="/vibeline" element={<Navigate to="/workbench" replace />} />
        <Route path="/soul-kline" element={<Navigate to="/workbench" replace />} />
        <Route path="/share/:sharePayload" element={<VibeLinePage />} />
        <Route path="/invite/:invitePayload" element={<VibeLinePage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  </BrowserRouter>
);

export default App;
