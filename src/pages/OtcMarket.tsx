import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal } from '../types/trading';
import { TradingChart } from '../components/chart/TradingChart';
import { SignalCard } from '../components/common/SignalCard';
import { Radio, AlertTriangle, ShieldAlert, Sparkles, Camera, ShieldCheck } from 'lucide-react';

export const OtcMarket: React.FC = () => {
  const {
    t,
    language,
    assets,
    activeSymbol,
    setActiveSymbol,
    setActiveCategory,
    activeTimeframe,
    setActiveTimeframe,
    currentCandles,
    currentIndicators,
    generateSignal,
    signals,
    setActivePage,
  } = useTrading();

  const [otcSignal, setOtcSignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const otcAssets = assets.filter(a => a.category === 'otc');

  const handleSelectPair = (sym: string) => {
    setActiveSymbol(sym);
    setActiveCategory('otc');
    setOtcSignal(null);
  };

  const handleGenerate = async (mode: 'A_PLUS' | 'NORMAL') => {
    setIsGenerating(true);
    const sig = await generateSignal(activeSymbol, 'otc', mode, activeTimeframe);
    setIsGenerating(false);
    if (sig) {
      setOtcSignal(sig);
    }
  };

  const activeDisplaySignal = otcSignal || signals.find(s => s.category === 'otc' && s.pair === activeSymbol) || null;

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Regulatory & Transparency Label */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Radio className="h-6 w-6 text-amber-500 animate-pulse" />
            <h1 className="text-xl font-extrabold text-white">
              {t.nav.otcMarket} (Broker Over-The-Counter Engine)
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              SIMULATED / BROKER MODEL
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Over-The-Counter assets are internal broker-synthesized liquidity algorithms during weekend sessions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate('A_PLUS')}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <ShieldCheck className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Generate A+ OTC Signal'}
          </button>

          <button
            onClick={() => setActivePage('screenshot')}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
          >
            <Camera className="h-4 w-4 text-sky-400" />
            Analyze Screenshot
          </button>
        </div>
      </div>

      {/* Prominent OTC Signal Card */}
      {activeDisplaySignal && (
        <SignalCard signal={activeDisplaySignal} onClose={() => setOtcSignal(null)} />
      )}

      {/* Prominent Transparency Disclosure as demanded by guidelines */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-4 text-xs text-amber-200/90 flex items-start gap-3">
        <ShieldAlert className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-amber-300 font-semibold block">
            Strict OTC Data Integrity Notice (Section 3 Compliance):
          </strong>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            OTC prices are provided by retail broker mathematical models and do not trade on public centralized exchanges.
            AI Trading Intelligence Pro labels these feeds as <strong>INTERPOLATED_OTC</strong>.
            For direct broker charts, we recommend using the <strong>Screenshot Analyzer</strong> to inspect the exact visible broker candles directly.
          </p>
        </div>
      </div>

      {/* OTC Pairs Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {otcAssets.map(pair => {
          const isSelected = activeSymbol === pair.symbol;
          const isBull = pair.change24h >= 0;
          return (
            <button
              key={pair.symbol}
              onClick={() => handleSelectPair(pair.symbol)}
              className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-amber-500 bg-amber-950/20 shadow-md shadow-amber-500/10'
                  : 'border-slate-800 bg-[#0d131f] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{pair.symbol}</span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  OTC FEED
                </span>
              </div>
              <div className="mt-2 text-sm font-extrabold font-mono text-white">
                {pair.price.toFixed(4)}
              </div>
              <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/60 pt-1.5">
                <span>Data Quality:</span>
                <span className="text-amber-400 font-mono font-semibold">INTERPOLATED_OTC</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart for OTC */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <TradingChart
            candles={currentCandles}
            indicators={currentIndicators}
            symbol={activeSymbol}
            timeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
            height={460}
          />
        </div>

        {/* OTC Algorithmic Confluence Diagnostics */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              OTC Technical Diagnostics
            </h3>

            {currentIndicators ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Data Status:</span>
                  <span className="text-amber-400 font-bold">SYNTHESIZED OTC</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Trend Bias:</span>
                  <span className={currentIndicators.ema9 > currentIndicators.ema20 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {currentIndicators.ema9 > currentIndicators.ema20 ? 'BULLISH' : 'BEARISH'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">RSI (14):</span>
                  <span className="text-amber-300">{currentIndicators.rsi.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Order Blocks:</span>
                  <span className="text-white">{currentIndicators.smc.orderBlocks.length} detected</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Loading OTC data...</div>
            )}

            <button
              onClick={() => generateSignal(activeSymbol, 'otc', 'NORMAL')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Generate OTC Technical Signal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
