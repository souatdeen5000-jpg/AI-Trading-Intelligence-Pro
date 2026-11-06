import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal, SignalStatus } from '../types/trading';
import { History, Filter, RefreshCw, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

export const SignalHistory: React.FC = () => {
  const { t, language, signals, fetchSignals } = useTrading();

  const [filterMarket, setFilterMarket] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterMode, setFilterMode] = useState<string>('ALL');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchSignals();
    setIsRefreshing(false);
  };

  const filteredSignals = signals.filter(sig => {
    if (filterMarket !== 'ALL' && sig.category !== filterMarket) return false;
    if (filterStatus !== 'ALL' && sig.status !== filterStatus) return false;
    if (filterMode !== 'ALL' && sig.mode !== filterMode) return false;
    return true;
  });

  const getStatusBadge = (status: SignalStatus) => {
    switch (status) {
      case 'WON':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="h-3 w-3" />
            WON
          </span>
        );
      case 'LOST':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <XCircle className="h-3 w-3" />
            LOST
          </span>
        );
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 animate-pulse">
            <Clock className="h-3 w-3" />
            ACTIVE
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700">
            EXPIRED
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-400">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <History className="h-6 w-6 text-emerald-400" />
            {t.nav.signalHistory}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Chronological audit of all generated AI signals with verified outcomes and Dhaka timestamps
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5 shadow-sm"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin text-emerald-400' : ''}`} />
          Refresh & Audit
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center gap-3 p-3.5 rounded-xl border border-slate-800 bg-[#0d131f] text-xs">
        <div className="flex items-center gap-1.5 text-slate-400 font-medium">
          <Filter className="h-3.5 w-3.5 text-emerald-400" />
          <span>Filters:</span>
        </div>

        <select
          value={filterMarket}
          onChange={e => setFilterMarket(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
        >
          <option value="ALL">All Markets</option>
          <option value="forex">Forex</option>
          <option value="gold">Gold</option>
          <option value="crypto">Crypto</option>
          <option value="binary">Binary</option>
          <option value="otc">OTC</option>
        </select>

        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
        >
          <option value="ALL">All Statuses</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="WON">WON</option>
          <option value="LOST">LOST</option>
          <option value="EXPIRED">EXPIRED</option>
        </select>

        <select
          value={filterMode}
          onChange={e => setFilterMode(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
        >
          <option value="ALL">All Modes</option>
          <option value="A_PLUS">A+ Setups</option>
          <option value="NORMAL">Normal Setups</option>
        </select>

        <div className="ml-auto text-[11px] text-slate-400 font-mono">
          Showing <strong>{filteredSignals.length}</strong> of <strong>{signals.length}</strong> signals
        </div>
      </div>

      {/* Signals Record Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Signal ID</th>
                <th className="p-3">Asset / Pair</th>
                <th className="p-3">Market</th>
                <th className="p-3">Action</th>
                <th className="p-3">Mode</th>
                <th className="p-3">Entry Price</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Time (UTC+6)</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredSignals.length === 0 ? (
                <tr>
                  <td colSpan={9} className="p-8 text-center text-slate-500 font-sans">
                    No signals matching current filter criteria.
                  </td>
                </tr>
              ) : (
                filteredSignals.map(sig => {
                  const isBull = sig.type === 'BUY' || sig.type === 'CALL';
                  return (
                    <tr key={sig.id} className="hover:bg-slate-900/40 transition">
                      <td className="p-3 text-slate-500 font-bold">{sig.id.split('-').slice(0, 2).join('-')}</td>
                      <td className="p-3 text-white font-bold">{sig.pair}</td>
                      <td className="p-3 text-slate-400 uppercase text-[10px]">{sig.category}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${isBull ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {sig.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-300">{sig.mode}</td>
                      <td className="p-3 text-white font-bold">
                        {sig.entryPrice >= 100 ? sig.entryPrice.toFixed(2) : sig.entryPrice.toFixed(5)}
                      </td>
                      <td className="p-3 text-emerald-400 font-bold">{sig.confidenceScore}%</td>
                      <td className="p-3 text-slate-400 text-[11px]">{sig.localTimeDhaka}</td>
                      <td className="p-3">{getStatusBadge(sig.status)}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
