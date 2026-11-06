import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal, MarketCategory, Timeframe } from '../types/trading';
import { TradingChart } from '../components/chart/TradingChart';
import { LineChart, Clock, Timer, Sparkles, ShieldCheck, Activity, CheckCircle2, ArrowRight, WalletCards, AlertTriangle, RefreshCw } from 'lucide-react';

export const LiveMarketCharts: React.FC = () => {
  const {
    t,
    language,
    assets,
    activeSymbol,
    setActiveSymbol,
    activeCategory,
    setActiveCategory,
    activeTimeframe,
    setActiveTimeframe,
    currentCandles,
    currentIndicators,
    dhakaTime,
    candleSecondsRemaining,
    generateSignal,
    signals,
    setActivePage,
  } = useTrading();

  const [isGenerating, setIsGenerating] = useState(false);
  const [activeChartSignal, setActiveChartSignal] = useState<TradingSignal | null>(null);

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGenerate = async (mode: 'A_PLUS' | 'NORMAL') => {
    setIsGenerating(true);
    const sig = await generateSignal(activeSymbol, activeCategory, mode, activeTimeframe);
    setIsGenerating(false);
    if (sig) {
      setActiveChartSignal(sig);
    }
  };

  // Find recent signal for current symbol if activeChartSignal is null
  const displaySignal = activeChartSignal || signals.find(s => s.pair === activeSymbol) || null;

  const categories: { key: MarketCategory | 'all'; label: string }[] = [
    { key: 'all', label: language === 'bn' ? 'সব মার্কেট' : 'All Markets' },
    { key: 'forex', label: 'Forex' },
    { key: 'gold', label: 'Gold (XAU/USD)' },
    { key: 'crypto', label: 'Crypto' },
    { key: 'binary', label: 'Binary Options' },
    { key: 'otc', label: 'Broker OTC' },
  ];

  const filteredAssets = activeCategory === 'gold' 
    ? assets.filter(a => a.category === 'gold')
    : activeCategory === 'crypto'
    ? assets.filter(a => a.category === 'crypto')
    : activeCategory === 'binary'
    ? assets.filter(a => a.category === 'binary')
    : activeCategory === 'otc'
    ? assets.filter(a => a.category === 'otc')
    : activeCategory === 'forex'
    ? assets.filter(a => a.category === 'forex')
    : assets;

  return (
    <div className="space-y-4">
      {/* Top Banner Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <LineChart className="h-6 w-6 text-emerald-400" />
            <h1 className="text-xl font-extrabold text-white">
              {t.nav.liveMarketCharts}
            </h1>
          </div>
        </div>

        {/* Live Bangladesh Time & Next Candle Clock */}
        <div className="flex items-center gap-3 text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5 text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{dhakaTime}</span>
          </div>

          <div className="flex items-center gap-1.5 text-amber-300 font-bold bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Timer className="h-3.5 w-3.5 text-amber-400 animate-pulse" />
            <span>Close: {formatCountdown(candleSecondsRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Market Category Filter Switcher & Quick Asset Selector */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-[#0d131f]">
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map(cat => {
            const isSelected = cat.key === 'all' ? false : activeCategory === cat.key;
            return (
              <button
                key={cat.key}
                onClick={() => {
                  if (cat.key !== 'all') {
                    setActiveCategory(cat.key);
                    const first = assets.find(a => a.category === cat.key);
                    if (first) setActiveSymbol(first.symbol);
                  }
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                  isSelected
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Asset dropdown & Generate Buttons */}
        <div className="flex items-center gap-2">
          <select
            value={activeSymbol}
            onChange={e => {
              const sym = e.target.value;
              setActiveSymbol(sym);
              const matched = assets.find(a => a.symbol === sym);
              if (matched) setActiveCategory(matched.category);
              setActiveChartSignal(null);
            }}
            className="rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
          >
            {filteredAssets.map(a => (
              <option key={a.symbol} value={a.symbol}>
                {a.symbol} ({a.category.toUpperCase()})
              </option>
            ))}
          </select>

          <button
            onClick={() => handleGenerate('A_PLUS')}
            disabled={isGenerating}
            className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition flex items-center gap-1 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <ShieldCheck className={`h-3.5 w-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Generate A+ Signal'}
          </button>
        </div>
      </div>

      {/* Prominent Live Signal Overlay Banner If Signal Generated */}
      {displaySignal && (
        <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#0d131f] to-teal-950/30 p-4 shadow-xl shadow-emerald-500/10 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
            <div className="flex items-center gap-3">
              <span className={`px-3 py-1 rounded-lg text-xs font-extrabold font-mono tracking-wider ${
                displaySignal.type === 'BUY' || displaySignal.type === 'CALL'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
              }`}>
                {displaySignal.type} {displaySignal.pair}
              </span>
              <span className="text-xs font-mono font-bold text-slate-300">
                {displaySignal.mode} &bull; {displaySignal.timeframe}
              </span>
            </div>

            <div className="flex items-center gap-3 font-mono">
              <span className="text-xs text-slate-400">Confidence:</span>
              <span className="text-lg font-black text-emerald-400">
                {displaySignal.confidenceScore}%
              </span>
            </div>
          </div>

          {/* DEDICATED EXACT ENTRY TIME CARD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2 flex items-center gap-3 bg-slate-950/80 p-3 rounded-xl border border-emerald-500/30">
              <div className="p-2.5 rounded-lg bg-emerald-500 text-slate-950 font-black">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'সিগন্যাল এন্ট্রি টাইম (EXACT ENTRY TIME)' : 'EXACT SIGNAL ENTRY TIME (UTC+6)'}
                </span>
                <span className="text-base sm:text-lg font-black font-mono text-white">
                  {displaySignal.entryTimeFormatted || displaySignal.localTimeDhaka}
                </span>
                <span className="text-[11px] text-emerald-200/90 block font-sans">
                  {displaySignal.suggestedEntryAction || (language === 'bn' ? 'পরবর্তী ক্যান্ডেল শুরুর সাথে সাথে এন্ট্রি নিন' : 'Enter immediately at next candle opening')}
                </span>
              </div>
            </div>

            <div className="flex flex-col justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Entry Price:</span>
                <span className="text-white font-bold">{displaySignal.entryPrice >= 100 ? displaySignal.entryPrice.toFixed(2) : displaySignal.entryPrice.toFixed(4)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">{displaySignal.category === 'binary' ? 'Expiry:' : 'Take Profit:'}</span>
                <span className="text-emerald-400 font-bold">{displaySignal.takeProfit1 ? displaySignal.takeProfit1.toFixed(4) : 'Next 5m Bar'}</span>
              </div>
              <button
                onClick={() => {
                  setActiveSymbol(displaySignal.pair);
                  setActiveCategory(displaySignal.category);
                  setActivePage('paper');
                }}
                className="mt-1 w-full py-1 rounded text-[11px] font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center justify-center gap-1 shadow-sm"
              >
                <WalletCards className="h-3 w-3" />
                Execute In Paper Trading
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full Size Candlestick Terminal Chart */}
      <TradingChart
        candles={currentCandles}
        indicators={currentIndicators}
        symbol={activeSymbol}
        timeframe={activeTimeframe}
        onTimeframeChange={setActiveTimeframe}
        height={540}
      />

      {/* Multi-Indicator Diagnostics Matrix */}
      {currentIndicators && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-slate-500 block">EMA 9</span>
              <span className="font-bold text-cyan-400">{currentIndicators.ema9.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">EMA 20</span>
              <span className="font-bold text-yellow-400">{currentIndicators.ema20.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">EMA 50</span>
              <span className="font-bold text-purple-400">{currentIndicators.ema50.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">EMA 200</span>
              <span className="font-bold text-orange-400">{currentIndicators.ema200.toFixed(4)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">RSI (14)</span>
              <span className="font-bold text-amber-300">{currentIndicators.rsi.toFixed(1)}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">SUPERTREND</span>
              <span className={`font-bold ${currentIndicators.supertrend.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentIndicators.supertrend.direction.toUpperCase()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">MACD HIST</span>
              <span className={`font-bold ${currentIndicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {currentIndicators.macd.histogram.toFixed(4)}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">ICT SESSION</span>
              <span className="font-bold text-sky-400 truncate block">
                {currentIndicators.ict.activeKillZone.split(' ')[0]}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
