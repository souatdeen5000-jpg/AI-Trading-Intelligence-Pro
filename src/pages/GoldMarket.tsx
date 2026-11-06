import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal } from '../types/trading';
import { TradingChart } from '../components/chart/TradingChart';
import { SignalCard } from '../components/common/SignalCard';
import { Gem, ArrowUpRight, ArrowDownRight, ShieldCheck, Flame, Scale, TrendingUp } from 'lucide-react';

export const GoldMarket: React.FC = () => {
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

  const [goldSignal, setGoldSignal] = useState<TradingSignal | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    setActiveSymbol('XAU/USD');
    setActiveCategory('gold');
  }, [setActiveSymbol, setActiveCategory]);

  const goldAsset = assets.find(a => a.symbol === 'XAU/USD') || {
    symbol: 'XAU/USD',
    price: 2742.80,
    change24h: 0.85,
    high24h: 2758.40,
    low24h: 2730.10,
    volume24h: 48900000,
    provider: 'Binance Physical Gold (PAXG/USDT)',
  };

  const isBull = goldAsset.change24h >= 0;

  const handleGenerate = async (mode: 'A_PLUS' | 'NORMAL') => {
    setIsGenerating(true);
    const sig = await generateSignal('XAU/USD', 'gold', mode, activeTimeframe);
    setIsGenerating(false);
    if (sig) {
      setGoldSignal(sig);
    }
  };

  const activeDisplaySignal = goldSignal || signals.find(s => s.category === 'gold' && s.pair === 'XAU/USD') || null;

  return (
    <div className="space-y-6">
      {/* Gold Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Gem className="h-6 w-6 text-amber-400" />
            {t.nav.goldMarket} (XAU/USD)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real Physical Gold Spot Stream, Macro Hedge Confluences, Pivot Levels & Liquidity Sweeps
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleGenerate('A_PLUS')}
            disabled={isGenerating}
            className="px-3.5 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50"
          >
            <ShieldCheck className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
            {isGenerating ? 'Analyzing...' : 'Generate A+ Gold Signal'}
          </button>
        </div>
      </div>

      {/* Prominent Gold Signal Card */}
      {activeDisplaySignal && (
        <SignalCard signal={activeDisplaySignal} onClose={() => setGoldSignal(null)} />
      )}

      {/* Gold Price & Key Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-[#0d131f] p-4">
          <span className="text-xs text-amber-400 font-bold uppercase tracking-wider">Spot Gold Price</span>
          <div className="mt-2 text-2xl font-extrabold font-mono text-white flex items-baseline gap-2">
            ${goldAsset.price.toFixed(2)}
            <span className={`text-xs font-bold ${isBull ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isBull ? '+' : ''}{goldAsset.change24h.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 text-[10px] text-slate-400 truncate">
            Feed: {goldAsset.provider}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <span className="text-xs text-slate-400 font-medium">24h High / Low</span>
          <div className="mt-2 text-base font-extrabold font-mono text-white">
            <span className="text-emerald-400">${goldAsset.high24h.toFixed(2)}</span> /{' '}
            <span className="text-rose-400">${goldAsset.low24h.toFixed(2)}</span>
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            Intraday Range: ${(goldAsset.high24h - goldAsset.low24h).toFixed(2)}
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <span className="text-xs text-slate-400 font-medium">SMC Gold Order Block</span>
          <div className="mt-2 text-sm font-bold font-mono text-emerald-400">
            {currentIndicators?.smc.orderBlocks.length ? 'Active Mitigation Zone' : 'Equilibrium Range'}
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            FVG Imbalance: {currentIndicators?.smc.fvg.length || 0} gaps detected
          </div>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4">
          <span className="text-xs text-slate-400 font-medium">Gold Trend Bias</span>
          <div className="mt-2 text-sm font-bold font-mono flex items-center gap-1.5 text-emerald-400">
            <TrendingUp className="h-4 w-4" />
            BULLISH EXPANSION
          </div>
          <div className="mt-2 text-[10px] text-slate-500">
            Above EMA 50 & 200 dynamic support
          </div>
        </div>
      </div>

      {/* Main Candlestick Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3">
          <TradingChart
            candles={currentCandles}
            indicators={currentIndicators}
            symbol="XAU/USD"
            timeframe={activeTimeframe}
            onTimeframeChange={setActiveTimeframe}
            height={460}
          />
        </div>

        {/* Gold Support & Resistance Table */}
        <div className="space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
              Gold Key Levels (S/R)
            </h3>

            {currentIndicators ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Major Resistance R2:</span>
                  <span className="text-rose-400 font-bold">${currentIndicators.pivotPoints.r2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Local Resistance R1:</span>
                  <span className="text-rose-300">${currentIndicators.pivotPoints.r1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Floor Pivot P:</span>
                  <span className="text-amber-400 font-bold">${currentIndicators.pivotPoints.p.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Local Support S1:</span>
                  <span className="text-emerald-300">${currentIndicators.pivotPoints.s1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Major Support S2:</span>
                  <span className="text-emerald-400 font-bold">${currentIndicators.pivotPoints.s2.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-1 border-b border-slate-800/50">
                  <span className="text-slate-400">Golden Pocket (0.618):</span>
                  <span className="text-cyan-400">${currentIndicators.fibonacci.level618.toFixed(2)}</span>
                </div>
              </div>
            ) : (
              <div className="text-xs text-slate-500 py-4 text-center">Calculating Gold levels...</div>
            )}

            <button
              onClick={() => generateSignal('XAU/USD', 'gold', 'NORMAL')}
              className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
            >
              Generate Normal Gold Signal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
