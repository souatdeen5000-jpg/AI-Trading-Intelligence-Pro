import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal } from '../types/trading';
import { TradingChart } from '../components/chart/TradingChart';
import { SignalCard } from '../components/common/SignalCard';
import { CircleDollarSign, ArrowUpRight, ArrowDownRight, Sparkles, Activity, Layers, ShieldCheck } from 'lucide-react';

export const ForexMarket: React.FC = () => {
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

  const [forexSignal, setForexSignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const forexAssets = assets.filter(a => a.category === 'forex');

  const handleSelectPair = (sym: string) => {
    setActiveSymbol(sym);
    setActiveCategory('forex');
    setForexSignal(null);
  };

  const handleGenerate = async (mode: 'A_PLUS' | 'NORMAL') => {
    setIsGenerating(true);
    const sig = await generateSignal(activeSymbol, 'forex', mode, activeTimeframe);
    setIsGenerating(false);
    if (sig) {
      setForexSignal(sig);
    }
  };

  const activeDisplaySignal = forexSignal || signals.find(s => s.category === 'forex' && s.pair === activeSymbol) || null;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <CircleDollarSign className="h-6 w-6 text-emerald-400" />
            {t.nav.forexMarket}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Institutional Interbank Spot Rates, Multi-Timeframe Pip Analysis & SMC Order Block Confirmations
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate('A_PLUS')}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <ShieldCheck className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Generate A+ Forex Signal'}
          </button>
        </div>
      </div>

      {/* Prominent Signal Card if signal exists */}
      {activeDisplaySignal && (
        <SignalCard signal={activeDisplaySignal} onClose={() => setForexSignal(null)} />
      )}

      {/* Forex Pairs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {forexAssets.map(pair => {
          const isSelected = activeSymbol === pair.symbol;
          const isBull = pair.change24h >= 0;
          return (
            <button
              key={pair.symbol}
              onClick={() => handleSelectPair(pair.symbol)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                  : 'border-slate-800 bg-[#0d131f] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{pair.symbol}</span>
                {isBull ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                )}
              </div>
              <div className="mt-2 text-sm font-extrabold font-mono text-white">
                {pair.price.toFixed(4)}
              </div>
              <div className={`text-[10px] font-mono mt-1 ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBull ? '+' : ''}{pair.change24h.toFixed(2)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart for Selected Forex Pair */}
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

        {/* Forex Technical Matrix */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Forex Confluence Matrix
            </h3>

            {currentIndicators ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Pair:</span>
                  <span className="text-white font-bold">{activeSymbol}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Floor Pivot (P):</span>
                  <span className="text-slate-200">{currentIndicators.pivotPoints.p.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Resistance (R1):</span>
                  <span className="text-rose-400">{currentIndicators.pivotPoints.r1.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Support (S1):</span>
                  <span className="text-emerald-400">{currentIndicators.pivotPoints.s1.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Fibonacci 0.618:</span>
                  <span className="text-amber-400">{currentIndicators.fibonacci.level618.toFixed(4)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">ICT Kill Zone:</span>
                  <span className="text-sky-400 font-sans text-[11px] truncate">{currentIndicators.ict.activeKillZone}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Loading indicator matrix...</div>
            )}

            <button
              onClick={() => handleGenerate('NORMAL')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Generate Normal Signal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
