import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal } from '../types/trading';
import { ScanSearch, RefreshCw, Filter, ShieldCheck, Activity, ArrowRight, Zap, CheckCircle2, Clock, Timer } from 'lucide-react';

export const AllMarketScanner: React.FC = () => {
  const { t, language, setActiveSymbol, setActiveCategory, setActivePage } = useTrading();

  const [isScanning, setIsScanning] = useState(false);
  const [scanResults, setScanResults] = useState<TradingSignal[]>([]);
  const [lastScanTime, setLastScanTime] = useState<string | null>(null);

  // Filters
  const [filterMarket, setFilterMarket] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [filterDirection, setFilterDirection] = useState<string>('ALL');
  const [minConfidence, setMinConfidence] = useState<number>(60);

  const runGlobalScan = async () => {
    try {
      setIsScanning(true);
      const res = await fetch('/api/scanner/run', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        if (data.results) {
          setScanResults(data.results);
          setLastScanTime(data.scanTime);
        }
      }
    } catch (e) {
      console.error('Scan failed', e);
    } finally {
      setIsScanning(false);
    }
  };

  const filteredResults = scanResults.filter(sig => {
    if (filterMarket !== 'ALL' && sig.category !== filterMarket) return false;
    if (filterMode === 'A_PLUS' && sig.mode !== 'A_PLUS') return false;
    if (filterMode === 'NORMAL' && sig.mode !== 'NORMAL') return false;
    if (filterDirection === 'BUY' && sig.type !== 'BUY' && sig.type !== 'CALL') return false;
    if (filterDirection === 'SELL' && sig.type !== 'SELL' && sig.type !== 'PUT') return false;
    if (sig.confidenceScore < minConfidence) return false;
    return true;
  });

  const aPlusSetups = filteredResults.filter(s => s.mode === 'A_PLUS');
  const normalSetups = filteredResults.filter(s => s.mode === 'NORMAL');

  return (
    <div className="space-y-6">
      {/* Top Banner & Scanner Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ScanSearch className="h-6 w-6 text-emerald-400" />
            {t.scanner.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.scanner.subtitle}
          </p>
        </div>

        <button
          onClick={runGlobalScan}
          disabled={isScanning}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-60"
        >
          <RefreshCw className={`h-4 w-4 ${isScanning ? 'animate-spin' : ''}`} />
          {isScanning ? t.scanner.scanning : t.scanner.scanAll}
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0d131f] text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span>Filters:</span>
        </div>

        {/* Market Filter */}
        <select
          value={filterMarket}
          onChange={e => setFilterMarket(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Markets</option>
          <option value="forex">Forex</option>
          <option value="gold">Gold</option>
          <option value="crypto">Crypto</option>
          <option value="binary">Binary</option>
          <option value="otc">OTC</option>
        </select>

        {/* Mode Filter */}
        <select
          value={filterMode}
          onChange={e => setFilterMode(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Setups (A+ & Normal)</option>
          <option value="A_PLUS">A+ Setups Only</option>
          <option value="NORMAL">Normal Setups Only</option>
        </select>

        {/* Direction Filter */}
        <select
          value={filterDirection}
          onChange={e => setFilterDirection(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500"
        >
          <option value="ALL">All Directions</option>
          <option value="BUY">BUY / CALL</option>
          <option value="SELL">SELL / PUT</option>
        </select>

        {/* Min Confidence Slider */}
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <span className="text-slate-400">Min Conf:</span>
          <span className="font-mono font-bold text-emerald-400">{minConfidence}%</span>
          <input
            type="range"
            min={50}
            max={85}
            step={5}
            value={minConfidence}
            onChange={e => setMinConfidence(parseInt(e.target.value, 10))}
            className="w-20 accent-emerald-500 cursor-pointer"
          />
        </div>

        {lastScanTime && (
          <div className="ml-auto text-[11px] text-slate-500 font-mono">
            Last scan: {lastScanTime}
          </div>
        )}
      </div>

      {scanResults.length === 0 && !isScanning ? (
        <div className="rounded-xl border border-dashed border-slate-800 p-12 text-center space-y-3 bg-[#0d131f]/50">
          <ScanSearch className="h-10 w-10 text-slate-600 mx-auto" />
          <h3 className="text-sm font-bold text-white">Scanner Ready</h3>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            Click <strong>"Scan All 5 Markets Now"</strong> above to evaluate cross-market price action, multi-timeframe trend alignment, and SMC order block confluences.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Section 1: A+ Setups (Ranked First) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500"></span>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-emerald-400" />
                {t.scanner.aPlusFirst} ({aPlusSetups.length})
              </h2>
            </div>

            {aPlusSetups.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 text-center text-xs text-slate-500">
                No A+ setups currently meeting strict multi-timeframe and SMC confluence criteria.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {aPlusSetups.map(sig => {
                  const isBull = sig.type === 'BUY' || sig.type === 'CALL';
                  return (
                    <div
                      key={sig.id}
                      className="rounded-xl border border-emerald-500/40 bg-gradient-to-b from-emerald-950/20 to-[#0d131f] p-4 space-y-3 shadow-lg shadow-emerald-500/5 hover:border-emerald-500 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{sig.pair}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                            {sig.category}
                          </span>
                        </div>
                        <span className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${isBull ? 'bg-emerald-500 text-slate-950' : 'bg-rose-500 text-white'}`}>
                          {sig.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                        <div>
                          <span className="text-slate-500 block text-[10px]">ENTRY</span>
                          <span className="text-white font-bold">{sig.entryPrice >= 100 ? sig.entryPrice.toFixed(2) : sig.entryPrice.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">CONFIDENCE</span>
                          <span className="text-emerald-400 font-bold">{sig.confidenceScore}%</span>
                        </div>
                      </div>

                      {/* Prominent Signal Entry Time Banner */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-emerald-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            {language === 'bn' ? 'এন্ট্রি টাইম' : 'Entry Time'}
                          </span>
                        </div>
                        <span className="text-white font-extrabold">
                          {sig.entryTimeFormatted || sig.localTimeDhaka}
                        </span>
                      </div>

                      {/* Confirmations List */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 font-semibold uppercase">Confirmed Factors:</span>
                        <div className="flex flex-wrap gap-1">
                          {sig.confirmations.map((conf, i) => (
                            <span key={i} className="px-2 py-0.5 rounded text-[10px] bg-slate-800/80 text-slate-300 font-mono">
                              &bull; {conf}
                            </span>
                          ))}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSymbol(sig.pair);
                          setActiveCategory(sig.category);
                          setActivePage('charts');
                        }}
                        className="w-full py-2 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition flex items-center justify-center gap-1.5"
                      >
                        Inspect On Live Chart <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Section 2: Normal Setups */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-cyan-400"></span>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider flex items-center gap-2">
                <Activity className="h-4 w-4 text-cyan-400" />
                {t.scanner.normalSetups} ({normalSetups.length})
              </h2>
            </div>

            {normalSetups.length === 0 ? (
              <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 text-center text-xs text-slate-500">
                No normal setups meeting current confidence threshold.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {normalSetups.map(sig => {
                  const isBull = sig.type === 'BUY' || sig.type === 'CALL';
                  return (
                    <div
                      key={sig.id}
                      className="rounded-xl border border-slate-800 bg-[#0d131f] p-4 space-y-3 hover:border-slate-700 transition"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-sm">{sig.pair}</span>
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase bg-slate-800 text-slate-300">
                            {sig.category}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold font-mono ${isBull ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {sig.type}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                        <div>
                          <span className="text-slate-500 block text-[10px]">ENTRY</span>
                          <span className="text-white font-bold">{sig.entryPrice >= 100 ? sig.entryPrice.toFixed(2) : sig.entryPrice.toFixed(4)}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">CONFIDENCE</span>
                          <span className="text-cyan-400 font-bold">{sig.confidenceScore}%</span>
                        </div>
                      </div>

                      {/* Prominent Signal Entry Time Banner */}
                      <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900 border border-slate-700/80 text-xs font-mono">
                        <div className="flex items-center gap-1.5 text-cyan-400">
                          <Clock className="h-3.5 w-3.5" />
                          <span className="text-[10px] uppercase font-bold tracking-wider">
                            {language === 'bn' ? 'এন্ট্রি টাইম' : 'Entry Time'}
                          </span>
                        </div>
                        <span className="text-white font-bold">
                          {sig.entryTimeFormatted || sig.localTimeDhaka}
                        </span>
                      </div>

                      <button
                        onClick={() => {
                          setActiveSymbol(sig.pair);
                          setActiveCategory(sig.category);
                          setActivePage('charts');
                        }}
                        className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center justify-center gap-1.5"
                      >
                        Inspect On Live Chart <ArrowRight className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
