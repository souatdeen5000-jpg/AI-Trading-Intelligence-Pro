import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal } from '../types/trading';
import { TradingChart } from '../components/chart/TradingChart';
import { SignalCard } from '../components/common/SignalCard';
import { Binary, ArrowUp, ArrowDown, Clock, Timer, ShieldCheck, AlertTriangle } from 'lucide-react';

export const BinaryMarket: React.FC = () => {
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
    dhakaTime,
    candleSecondsRemaining,
  } = useTrading();

  const [selectedExpiry, setSelectedExpiry] = useState<string>('5m');
  const [binarySignal, setBinarySignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const binaryAssets = assets.filter(a => a.category === 'binary');

  const handleSelectPair = (sym: string) => {
    setActiveSymbol(sym);
    setActiveCategory('binary');
    setBinarySignal(null);
  };

  const handleGenerateBinary = async (directionHint: 'CALL' | 'PUT') => {
    setIsGenerating(true);
    const sig = await generateSignal(activeSymbol, 'binary', 'A_PLUS', activeTimeframe);
    setIsGenerating(false);
    if (sig) {
      setBinarySignal(sig);
    }
  };

  const activeDisplaySignal = binarySignal || signals.find(s => s.category === 'binary' && s.pair === activeSymbol) || null;

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Binary className="h-6 w-6 text-purple-400" />
            {t.nav.binaryMarket} (CALL / PUT High-Confluence Engine)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Broker Option Expiry Timing, Candle Micro-Countdown, S/R Rejection Zones & Binary Momentum Confirmation
          </p>
        </div>

        {/* Live Bangladesh Time & Countdown */}
        <div className="flex items-center gap-3 bg-slate-900 px-3.5 py-1.5 rounded-xl border border-slate-800 text-xs font-mono-numbers">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Clock className="h-3.5 w-3.5 text-purple-400" />
            <span>{dhakaTime}</span>
          </div>
          <div className="h-3 w-[1px] bg-slate-700"></div>
          <div className="flex items-center gap-1.5 text-amber-300 font-bold">
            <Timer className="h-3.5 w-3.5 text-amber-400" />
            <span>Close: {formatCountdown(candleSecondsRemaining)}</span>
          </div>
        </div>
      </div>

      {/* Expiry Selector Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-[#0d131f]">
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
          <span>Target Expiry Duration:</span>
          {['1m', '2m', '3m', '5m', '15m'].map(exp => (
            <button
              key={exp}
              onClick={() => setSelectedExpiry(exp)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                selectedExpiry === exp
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {exp}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerateBinary('CALL')}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <ArrowUp className="h-4 w-4" />
            {isGenerating ? 'Analyzing...' : 'Analyze CALL Setup'}
          </button>
          <button
            onClick={() => handleGenerateBinary('PUT')}
            disabled={isGenerating}
            className="px-4 py-1.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition flex items-center gap-1.5 shadow-md shadow-rose-500/20 disabled:opacity-50"
          >
            <ArrowDown className="h-4 w-4" />
            {isGenerating ? 'Analyzing...' : 'Analyze PUT Setup'}
          </button>
        </div>
      </div>

      {/* Prominent Binary Signal Card */}
      {activeDisplaySignal && (
        <SignalCard signal={activeDisplaySignal} onClose={() => setBinarySignal(null)} />
      )}

      {/* Binary Pairs Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {binaryAssets.map(pair => {
          const isSelected = activeSymbol === pair.symbol;
          const isBull = pair.change24h >= 0;
          return (
            <button
              key={pair.symbol}
              onClick={() => handleSelectPair(pair.symbol)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-purple-500 bg-purple-950/20 shadow-md shadow-purple-500/10'
                  : 'border-slate-800 bg-[#0d131f] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{pair.symbol}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-300">
                  85% Payout
                </span>
              </div>
              <div className="mt-2 text-sm font-extrabold font-mono text-white">
                {pair.price >= 100 ? pair.price.toFixed(2) : pair.price.toFixed(4)}
              </div>
              <div className={`text-[10px] font-mono mt-1 ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBull ? '+' : ''}{pair.change24h.toFixed(2)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart for Binary */}
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

        {/* Binary Micro-Execution Diagnostics */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Binary Expiry Intelligence
            </h3>

            {currentIndicators ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Current Candle Status:</span>
                  <span className="text-emerald-400 font-bold">Active Bar</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Candle Close Remaining:</span>
                  <span className="text-amber-300 font-bold">{formatCountdown(candleSecondsRemaining)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Suggested Entry:</span>
                  <span className="text-white">Next Candle Open (00s)</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Stochastic RSI (%K):</span>
                  <span className="text-purple-400">{currentIndicators.stochRsi.k.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Candle Pattern:</span>
                  <span className="text-cyan-400 font-sans text-[11px] truncate">
                    {currentIndicators.patterns[0] || 'Neutral Continuation'}
                  </span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Loading binary indicators...</div>
            )}

            <div className="rounded-lg bg-amber-950/20 border border-amber-800/30 p-2.5 text-[11px] text-amber-300/90 leading-relaxed flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>Binary options involve all-or-nothing expiry risk. Always wait for candle confirmation before entry.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
