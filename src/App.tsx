import React, { useState } from 'react';
import { TradingProvider, useTrading } from './context/TradingContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { TestReportModal } from './components/TestReportModal';

// Pages
import { Dashboard } from './pages/Dashboard';
import { ForexMarket } from './pages/ForexMarket';
import { GoldMarket } from './pages/GoldMarket';
import { CryptoMarket } from './pages/CryptoMarket';
import { BinaryMarket } from './pages/BinaryMarket';
import { OtcMarket } from './pages/OtcMarket';
import { AllMarketScanner } from './pages/AllMarketScanner';
import { AiSignalGenerator } from './pages/AiSignalGenerator';
import { ScreenshotAnalyzer } from './pages/ScreenshotAnalyzer';
import { AiSupport } from './pages/AiSupport';
import { ThreeStepCompounding } from './pages/ThreeStepCompounding';
import { LiveMarketCharts } from './pages/LiveMarketCharts';
import { SignalHistory } from './pages/SignalHistory';
import { WinRateStats } from './pages/WinRateStats';
import { Backtesting } from './pages/Backtesting';
import { PaperTrading } from './pages/PaperTrading';
import { ApiConfiguration } from './pages/ApiConfiguration';
import { Settings } from './pages/Settings';

const AppContent: React.FC = () => {
  const { activePage, t } = useTrading();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const renderActivePage = () => {
    switch (activePage) {
      case 'dashboard':
        return <Dashboard />;
      case 'forex':
        return <ForexMarket />;
      case 'gold':
        return <GoldMarket />;
      case 'crypto':
        return <CryptoMarket />;
      case 'binary':
        return <BinaryMarket />;
      case 'otc':
        return <OtcMarket />;
      case 'scanner':
        return <AllMarketScanner />;
      case 'signals':
        return <AiSignalGenerator />;
      case 'screenshot':
        return <ScreenshotAnalyzer />;
      case 'support':
        return <AiSupport />;
      case 'compounding':
        return <ThreeStepCompounding />;
      case 'charts':
        return <LiveMarketCharts />;
      case 'history':
        return <SignalHistory />;
      case 'winrate':
        return <WinRateStats />;
      case 'backtest':
        return <Backtesting />;
      case 'paper':
        return <PaperTrading />;
      case 'api':
        return <ApiConfiguration />;
      case 'settings':
        return <Settings />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="flex min-h-screen bg-[#080b11] text-slate-100">
      {/* Sidebar Navigation */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Terminal Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        <Header onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-[1600px] w-full mx-auto">
          {renderActivePage()}
        </main>

        {/* Global Footer & Disclaimer */}
        <footer className="border-t border-slate-800/80 bg-[#06080e] px-4 py-3 text-center text-[11px] text-slate-500">
          <p className="max-w-4xl mx-auto leading-relaxed">
            {t.common.disclaimer} &bull; Powered by Google AI Studio Gemini 3.8 Flash &bull; Binance Public Spot Engine &bull; Asia/Dhaka UTC+6
          </p>
        </footer>
      </div>

      {/* Automated Diagnostics Modal */}
      <TestReportModal />
    </div>
  );
};

export default function App() {
  return (
    <TradingProvider>
      <AppContent />
    </TradingProvider>
  );
}
