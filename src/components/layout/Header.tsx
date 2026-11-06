import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { Clock, Timer, Globe, Sun, Moon, ShieldCheck, Zap, TrendingUp } from 'lucide-react';

export const Header: React.FC<{ onToggleSidebar?: () => void }> = ({ onToggleSidebar }) => {
  const {
    t,
    language,
    setLanguage,
    theme,
    setTheme,
    dhakaTime,
    candleSecondsRemaining,
    activeTimeframe,
    assets,
    setShowTestModal,
    setActivePage,
    setActiveSymbol,
    setActiveCategory,
  } = useTrading();

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Top 4 marquee items
  const marqueeAssets = assets.slice(0, 5);

  return (
    <header className="sticky top-0 z-30 flex flex-col border-b border-slate-800 bg-[#080b11]/95 backdrop-blur-md">
      {/* Top Banner Bar */}
      <div className="flex h-14 items-center justify-between px-3 sm:px-6">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              aria-label="Toggle Navigation"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          )}

          <div
            onClick={() => setActivePage('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="h-5 w-5 text-slate-950 font-bold" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
                AI TRADING <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">PRO</span>
                <span className="hidden sm:inline-block px-1.5 py-0.5 rounded text-[10px] uppercase font-mono font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  SMC &bull; ICT
                </span>
              </span>
              <span className="text-[10px] text-slate-400 hidden sm:inline">{t.tagline}</span>
            </div>
          </div>
        </div>

        {/* Center: Live UTC+6 Bangladesh Clock & Candle Countdown */}
        <div className="hidden md:flex items-center gap-4 bg-slate-900/80 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono-numbers">
          <div className="flex items-center gap-2 text-slate-300">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span className="font-semibold text-slate-100">{dhakaTime || 'Loading BST...'}</span>
          </div>

          <div className="h-3 w-[1px] bg-slate-700"></div>

          <div className="flex items-center gap-1.5 text-amber-400 font-medium">
            <Timer className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-slate-400">{t.common.candleCountdown} ({activeTimeframe}):</span>
            <span className="font-bold text-amber-300">{formatCountdown(candleSecondsRemaining)}</span>
          </div>
        </div>

        {/* Right: Controls & Language & Diagnostics */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Audit Test Suite Button */}
          <button
            onClick={() => setShowTestModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/20 transition shadow-sm"
            title="System Diagnostics & 20-Point Audit"
          >
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            <span className="hidden sm:inline">20-Point Audit</span>
          </button>

          {/* Bilingual Switcher */}
          <div className="flex items-center bg-slate-900 rounded-lg p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded font-medium transition ${
                language === 'en' ? 'bg-emerald-500/20 text-emerald-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('bn')}
              className={`px-2 py-1 rounded font-medium transition ${
                language === 'bn' ? 'bg-emerald-500/20 text-emerald-400 font-sans' : 'text-slate-400 hover:text-white font-sans'
              }`}
            >
              বাংলা
            </button>
          </div>

          {/* Theme Switcher */}
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Real-time horizontal ticker strip */}
      {marqueeAssets.length > 0 && (
        <div className="flex items-center overflow-x-auto scrollbar-none border-t border-slate-800/60 bg-[#06080e] px-4 py-1 text-[11px] font-mono-numbers">
          <div className="flex items-center gap-6 whitespace-nowrap min-w-max">
            {marqueeAssets.map(asset => {
              const isBull = asset.change24h >= 0;
              return (
                <button
                  key={asset.symbol}
                  onClick={() => {
                    setActiveSymbol(asset.symbol);
                    setActiveCategory(asset.category);
                    setActivePage('charts');
                  }}
                  className="flex items-center gap-2 hover:opacity-80 transition cursor-pointer"
                >
                  <span className="font-semibold text-slate-300">{asset.symbol}</span>
                  <span className="text-white font-bold">
                    {asset.price >= 100 ? asset.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : asset.price.toFixed(4)}
                  </span>
                  <span className={`text-[10px] font-bold ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isBull ? '+' : ''}{asset.change24h.toFixed(2)}%
                  </span>
                  <span className="text-slate-700">|</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
