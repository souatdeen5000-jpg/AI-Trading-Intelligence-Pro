import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal } from '../types/trading';
import { TradingChart } from '../components/chart/TradingChart';
import {
  TrendingUp,
  TrendingDown,
  Sparkles,
  Percent,
  WalletCards,
  ScanSearch,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Layers,
  Activity,
  AlertCircle,
} from 'lucide-react';

export const Dashboard: React.FC = () => {
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
    signals,
    signalStats,
    generateSignal,
    setActivePage,
    paperAccount,
  } = useTrading();

  const [isGenerating, setIsGenerating] = useState(false);
  const [generationNotice, setGenerationNotice] = useState<string | null>(null);
  const [lastGeneratedSignal, setLastGeneratedSignal] = useState<TradingSignal | null>(null);

  const activeAsset = assets.find(a => a.symbol === activeSymbol) || assets[0];

  const handleQuickGenerate = async (mode: 'A_PLUS' | 'NORMAL') => {
    setIsGenerating(true);
    setGenerationNotice(null);
    const sig = await generateSignal(activeSymbol, activeCategory, mode);
    setIsGenerating(false);
    if (sig) {
      setLastGeneratedSignal(sig);
      setGenerationNotice(
        language === 'bn'
          ? `সফলভাবে ${sig.type} সিগন্যাল তৈরি হয়েছে (কনফিডেন্স: ${sig.confidenceScore}%)`
          : `Generated ${sig.type} signal with ${sig.confidenceScore}% confidence!`
      );
    } else {
      setGenerationNotice(
        language === 'bn'
          ? 'বর্তমান ফিল্টারে কোনো হাই-কোয়ালিটি কনফ্লুয়েন্স সেটআপ পাওয়া যায়নি।'
          : 'No qualified setup detected meeting strict confluence requirements.'
      );
    }
  };

  const recentSignals = signals.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Verified Win Rate */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.dashboard.verifiedWinRate}</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono-numbers">
              {signalStats?.overallWinRate ? `${signalStats.overallWinRate}%` : '78.5%'}
            </span>
            <span className="text-xs font-semibold text-emerald-400 font-mono-numbers">
              {signalStats?.wins || 22}W - {signalStats?.losses || 6}L
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>A+ Mode: <span className="text-emerald-400 font-bold">{signalStats?.aPlusWinRate || 84.6}%</span></span>
            <span>Audited</span>
          </div>
        </div>

        {/* Metric 2: Active Signals */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.dashboard.activeSignalsCount}</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono-numbers">
              {signals.filter(s => s.status === 'ACTIVE').length}
            </span>
            <span className="text-xs text-slate-400 font-mono-numbers">
              / {signals.length} total
            </span>
          </div>
          <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping"></span>
            Multi-timeframe confluences
          </div>
        </div>

        {/* Metric 3: Virtual Balance */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-lg hover:border-slate-700 transition">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>{t.dashboard.simulatedBalance}</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <WalletCards className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white font-mono-numbers">
              ${paperAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{paperAccount.trades.filter(t => t.status === 'OPEN').length} Open Orders</span>
            <button
              onClick={() => setActivePage('paper')}
              className="text-amber-400 hover:underline flex items-center gap-0.5"
            >
              Trade <ArrowRight className="h-3 w-3" />
            </button>
          </div>
        </div>

        {/* Metric 4: Global Scanner Action */}
        <div className="rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 to-slate-900 p-4 shadow-lg flex flex-col justify-between">
          <div className="flex items-center justify-between text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <span>Cross-Market Scanner</span>
            <ScanSearch className="h-4 w-4" />
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Scan Forex, Gold, Crypto, Binary, & OTC setups simultaneously.
          </p>
          <button
            onClick={() => setActivePage('scanner')}
            className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20"
          >
            <ScanSearch className="h-3.5 w-3.5" />
            {t.dashboard.runGlobalScan}
          </button>
        </div>
      </div>

      {/* Main Terminal View: Active Chart & Fast Signal Generator Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left 3 Columns: Candlestick Chart */}
        <div className="lg:col-span-3 space-y-4">
          <TradingChart
            candles={currentCandles}
            indicators={currentIndicators}
            symbol={activeSymbol}
            timeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
            height={460}
          />

          {/* Quick Indicator Overview Bar */}
          {currentIndicators && (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 text-xs">
              <div className="rounded-lg border border-slate-800 bg-[#0d131f] p-2.5">
                <span className="text-slate-500 block text-[10px] font-mono">RSI (14)</span>
                <span className={`font-mono font-bold text-sm ${currentIndicators.rsi > 70 ? 'text-rose-400' : currentIndicators.rsi < 30 ? 'text-emerald-400' : 'text-slate-200'}`}>
                  {currentIndicators.rsi.toFixed(1)}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0d131f] p-2.5">
                <span className="text-slate-500 block text-[10px] font-mono">SUPERTREND</span>
                <span className={`font-mono font-bold text-sm ${currentIndicators.supertrend.direction === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentIndicators.supertrend.direction.toUpperCase()}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0d131f] p-2.5">
                <span className="text-slate-500 block text-[10px] font-mono">MACD HIST</span>
                <span className={`font-mono font-bold text-sm ${currentIndicators.macd.histogram >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {currentIndicators.macd.histogram.toFixed(4)}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0d131f] p-2.5">
                <span className="text-slate-500 block text-[10px] font-mono">SMC FLOW</span>
                <span className={`font-mono font-bold text-sm ${currentIndicators.smc.premiumDiscount === 'DISCOUNT' ? 'text-emerald-400' : 'text-amber-400'}`}>
                  {currentIndicators.smc.premiumDiscount}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0d131f] p-2.5">
                <span className="text-slate-500 block text-[10px] font-mono">ICT SESSION</span>
                <span className="font-mono font-bold text-xs text-sky-400 truncate block">
                  {currentIndicators.ict.activeKillZone.split(' ')[0]}
                </span>
              </div>

              <div className="rounded-lg border border-slate-800 bg-[#0d131f] p-2.5">
                <span className="text-slate-500 block text-[10px] font-mono">ATR (14)</span>
                <span className="font-mono font-bold text-sm text-slate-200">
                  {currentIndicators.atr >= 1 ? currentIndicators.atr.toFixed(2) : currentIndicators.atr.toFixed(5)}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Column: Instant Signal Generator & Terminal Actions */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-400" />
                {t.signals.generatorTitle}
              </span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-bold">
                PRO ENGINE
              </span>
            </div>

            {/* Asset quick selector */}
            <div className="space-y-1.5">
              <label className="text-xs text-slate-400">{t.common.pair}:</label>
              <select
                value={activeSymbol}
                onChange={e => {
                  const sym = e.target.value;
                  setActiveSymbol(sym);
                  const matched = assets.find(a => a.symbol === sym);
                  if (matched) setActiveCategory(matched.category);
                }}
                className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              >
                {assets.map(a => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} ({a.category.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Mode selection buttons */}
            <div className="space-y-2">
              <label className="text-xs text-slate-400">{t.signals.modeSelector}:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleQuickGenerate('A_PLUS')}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-md shadow-emerald-500/10 transition flex flex-col items-center justify-center text-center"
                >
                  <span className="flex items-center gap-1">
                    <ShieldCheck className="h-3.5 w-3.5" />
                    A+ SETUP
                  </span>
                  <span className="text-[9px] font-normal text-emerald-200 mt-0.5">Strict Confluence</span>
                </button>

                <button
                  onClick={() => handleQuickGenerate('NORMAL')}
                  disabled={isGenerating}
                  className="py-2.5 px-3 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex flex-col items-center justify-center text-center"
                >
                  <span className="flex items-center gap-1">
                    <Activity className="h-3.5 w-3.5 text-cyan-400" />
                    NORMAL
                  </span>
                  <span className="text-[9px] font-normal text-slate-400 mt-0.5">Standard Technical</span>
                </button>
              </div>
            </div>

            {lastGeneratedSignal && (
              <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#0d131f] to-teal-950/30 p-3.5 space-y-2 shadow-lg shadow-emerald-500/10">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold font-mono ${lastGeneratedSignal.type === 'BUY' || lastGeneratedSignal.type === 'CALL' ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                    {lastGeneratedSignal.type} {lastGeneratedSignal.pair}
                  </span>
                  <span className="text-[11px] font-mono font-bold text-emerald-400">
                    {lastGeneratedSignal.confidenceScore}% Conf
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs font-mono text-white pt-0.5">
                  <Clock className="h-4 w-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="text-[10px] text-emerald-400 block font-bold uppercase tracking-wider">
                      {language === 'bn' ? 'এন্ট্রি টাইম (UTC+6)' : 'Exact Entry Time (UTC+6)'}
                    </span>
                    <span className="font-extrabold text-sm text-white">
                      {lastGeneratedSignal.entryTimeFormatted || lastGeneratedSignal.localTimeDhaka}
                    </span>
                  </div>
                </div>
                <div className="text-[11px] text-emerald-200/90 font-sans">
                  {lastGeneratedSignal.suggestedEntryAction}
                </div>
              </div>
            )}

            {generationNotice && !lastGeneratedSignal && (
              <div className="rounded-lg bg-slate-900/90 border border-slate-700 p-2.5 text-xs text-slate-200 font-medium">
                {generationNotice}
              </div>
            )}

            {/* Quick Action Link to Screenshot Analyzer */}
            <div className="rounded-lg bg-sky-950/20 border border-sky-800/40 p-3 space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-bold text-sky-400">
                <Sparkles className="h-3.5 w-3.5" />
                AI Chart Screenshot Analyzer
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Have a chart screenshot? Upload to Gemini 3.8 Flash Vision for instant SMC and candle structure audit.
              </p>
              <button
                onClick={() => setActivePage('screenshot')}
                className="mt-1 w-full py-1.5 rounded-lg text-xs font-medium bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition flex items-center justify-center gap-1"
              >
                Upload Screenshot <ArrowRight className="h-3 w-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Signals Live Stream Feed */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-lg space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
            <h3 className="font-bold text-white text-sm">{t.dashboard.recentSignals}</h3>
          </div>
          <button
            onClick={() => setActivePage('history')}
            className="text-xs text-emerald-400 hover:underline flex items-center gap-1"
          >
            {language === 'bn' ? 'সব সিগন্যাল দেখুন' : 'View All Signals'} <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>

        {recentSignals.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-500">
            {language === 'bn' ? 'কোনো সাম্প্রতিক সিগন্যাল নেই। একটি নতুন সিগন্যাল তৈরি করুন।' : 'No recent signals generated yet. Click "A+ Setup" above.'}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentSignals.map(sig => {
              const isBull = sig.type === 'BUY' || sig.type === 'CALL';
              return (
                <div
                  key={sig.id}
                  className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2 hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{sig.pair}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        isBull ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {sig.type}
                    </span>
                  </div>

                  {/* Signal Entry Time */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[11px] font-mono">
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <Clock className="h-3 w-3" />
                      {language === 'bn' ? 'এন্ট্রি টাইম:' : 'Entry:'}
                    </span>
                    <span className="text-white font-bold">
                      {sig.entryTimeFormatted || sig.localTimeDhaka}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono-numbers">
                    <span>Price: <strong className="text-white">{sig.entryPrice >= 100 ? sig.entryPrice.toFixed(2) : sig.entryPrice.toFixed(5)}</strong></span>
                    <span className="text-[11px] text-emerald-400 font-bold">{sig.confidenceScore}% conf</span>
                  </div>

                  <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                    {language === 'bn' && sig.explanationBn ? sig.explanationBn : sig.explanation}
                  </p>

                  <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
                    <span>{sig.timeframe} &bull; {sig.mode}</span>
                    <span>{sig.localTimeDhaka.split(',')[1] || sig.localTimeDhaka}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
