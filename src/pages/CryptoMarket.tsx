import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal } from '../types/trading';
import { TradingChart } from '../components/chart/TradingChart';
import { SignalCard } from '../components/common/SignalCard';
import { Coins, ArrowUpRight, ArrowDownRight, ShieldCheck, Flame, Zap } from 'lucide-react';

export const CryptoMarket: React.FC = () => {
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
  } = useTrading();

  const [cryptoSignal, setCryptoSignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const cryptoAssets = assets.filter(a => a.category === 'crypto');

  const handleSelectCoin = (sym: string) => {
    setActiveSymbol(sym);
    setActiveCategory('crypto');
    setCryptoSignal(null);
  };

  const handleGenerate = async (mode: 'A_PLUS' | 'NORMAL') => {
    setIsGenerating(true);
    const sig = await generateSignal(activeSymbol, 'crypto', mode, activeTimeframe);
    setIsGenerating(false);
    if (sig) {
      setCryptoSignal(sig);
    }
  };

  const activeDisplaySignal = cryptoSignal || signals.find(s => s.category === 'crypto' && s.pair === activeSymbol) || null;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Coins className="h-6 w-6 text-cyan-400" />
            {t.nav.cryptoMarket} (Binance Public Spot Feed)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time Direct Binance Public API streaming, 24h high-frequency volume, liquidity sweeps & order flow
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate('A_PLUS')}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-cyan-500/20 disabled:opacity-50"
          >
            <ShieldCheck className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Generate A+ Crypto Signal'}
          </button>
        </div>
      </div>

      {/* Prominent Crypto Signal Card */}
      {activeDisplaySignal && (
        <SignalCard signal={activeDisplaySignal} onClose={() => setCryptoSignal(null)} />
      )}

      {/* Crypto Coins Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
        {cryptoAssets.map(coin => {
          const isSelected = activeSymbol === coin.symbol;
          const isBull = coin.change24h >= 0;
          return (
            <button
              key={coin.symbol}
              onClick={() => handleSelectCoin(coin.symbol)}
              className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
                isSelected
                  ? 'border-cyan-500 bg-cyan-950/20 shadow-md shadow-cyan-500/10'
                  : 'border-slate-800 bg-[#0d131f] hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{coin.symbol}</span>
                {isBull ? (
                  <ArrowUpRight className="h-3.5 w-3.5 text-emerald-400" />
                ) : (
                  <ArrowDownRight className="h-3.5 w-3.5 text-rose-400" />
                )}
              </div>
              <div className="mt-2 text-sm font-extrabold font-mono text-white">
                ${coin.price >= 100 ? coin.price.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : coin.price.toFixed(4)}
              </div>
              <div className={`text-[10px] font-mono mt-1 ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
                {isBull ? '+' : ''}{coin.change24h.toFixed(2)}%
              </div>
            </button>
          );
        })}
      </div>

      {/* Main Chart for Selected Crypto Pair */}
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

        {/* Crypto Technical Diagnostics */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Binance Market Profile
            </h3>

            {currentIndicators ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Feed Engine:</span>
                  <span className="text-emerald-400 font-bold">Binance Direct</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Order Flow:</span>
                  <span className={`font-bold ${currentIndicators.ict.orderFlow === 'BULLISH' ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {currentIndicators.ict.orderFlow}
                  </span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Displacement:</span>
                  <span className="text-slate-200">{currentIndicators.smc.displacement ? 'Active Push' : 'Contained'}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">RSI Regime:</span>
                  <span className="text-amber-400">{currentIndicators.rsi.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Bollinger Upper:</span>
                  <span className="text-purple-400">${currentIndicators.bollingerBands.upper.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Bollinger Lower:</span>
                  <span className="text-purple-400">${currentIndicators.bollingerBands.lower.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Loading crypto metrics...</div>
            )}

            <button
              onClick={() => generateSignal(activeSymbol, 'crypto', 'NORMAL')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Generate Normal Crypto Signal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
