import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { PaperTrade, SignalType } from '../types/trading';
import { WalletCards, TrendingUp, TrendingDown, RotateCcw, ArrowUp, ArrowDown, ShieldAlert, CheckCircle2 } from 'lucide-react';

export const PaperTrading: React.FC = () => {
  const { t, language, assets, activeSymbol, setActiveSymbol, paperAccount, refreshPaperAccount } = useTrading();

  const [tradeAmount, setTradeAmount] = useState<number>(100);
  const [tradeType, setTradeType] = useState<SignalType>('BUY');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const activeAsset = assets.find(a => a.symbol === activeSymbol) || assets[0];

  const handleOpenTrade = async (type: SignalType) => {
    try {
      setIsSubmitting(true);
      setNotice(null);
      const res = await fetch('/api/paper/trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: activeSymbol,
          category: activeAsset.category,
          type,
          amount: tradeAmount,
          mode: 'MANUAL',
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        await refreshPaperAccount();
        setNotice(
          language === 'bn'
            ? `সিমুলেটেড ${type} অর্ডার সফলভাবে এক্সিকিউট হয়েছে!`
            : `Simulated ${type} position opened successfully!`
        );
      } else {
        setNotice(data.error || 'Failed to open paper trade.');
      }
    } catch (e: any) {
      setNotice(e.message || 'Error communicating with paper trading engine.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseTrade = async (tradeId: string) => {
    try {
      const res = await fetch('/api/paper/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tradeId }),
      });
      if (res.ok) {
        await refreshPaperAccount();
      }
    } catch (e) {
      console.error('Failed to close paper trade', e);
    }
  };

  const handleResetAccount = async () => {
    try {
      const res = await fetch('/api/paper/reset', { method: 'POST' });
      if (res.ok) {
        await refreshPaperAccount();
      }
    } catch (e) {
      console.error('Failed to reset account', e);
    }
  };

  const openPositions = paperAccount.trades.filter(t => t.status === 'OPEN');
  const closedPositions = paperAccount.trades.filter(t => t.status !== 'OPEN');

  const totalPnL = closedPositions.reduce((acc, curr) => acc + curr.pnl, 0);

  return (
    <div className="space-y-6">
      {/* Top Banner with Strict Simulated Paper Trading Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <WalletCards className="h-6 w-6 text-amber-400" />
            <h1 className="text-xl font-extrabold text-white">
              {t.paper.title}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
              SIMULATED / ZERO RISK
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {t.paper.subtitle}
          </p>
        </div>

        <button
          onClick={handleResetAccount}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset Balance ($10,000)
        </button>
      </div>

      {/* Account Balances Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">{t.paper.balance}</span>
          <div className="text-2xl font-extrabold font-mono text-white">
            ${paperAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <span className="text-[10px] text-slate-500 block">Initial Starting: $10,000.00</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">Realized PnL</span>
          <div className={`text-2xl font-extrabold font-mono ${totalPnL >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {totalPnL >= 0 ? '+' : ''}${totalPnL.toFixed(2)}
          </div>
          <span className="text-[10px] text-slate-500 block">From {closedPositions.length} closed simulated orders</span>
        </div>

        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-1">
          <span className="text-xs text-slate-400 font-medium">{t.paper.openPositions}</span>
          <div className="text-2xl font-extrabold font-mono text-cyan-400">
            {openPositions.length}
          </div>
          <span className="text-[10px] text-slate-500 block">Active exposure monitoring</span>
        </div>
      </div>

      {/* Order Placement Form */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
          {t.paper.quickTrade}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div className="space-y-1.5">
            <label className="text-slate-400">Selected Asset:</label>
            <select
              value={activeSymbol}
              onChange={e => setActiveSymbol(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            >
              {assets.map(a => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} (${a.price >= 100 ? a.price.toFixed(2) : a.price.toFixed(4)})
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-slate-400">{t.paper.amount}:</label>
            <input
              type="number"
              min={10}
              step={10}
              value={tradeAmount}
              onChange={e => setTradeAmount(parseFloat(e.target.value) || 0)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-end gap-2">
            <button
              onClick={() => handleOpenTrade('BUY')}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
            >
              <ArrowUp className="h-4 w-4" />
              {t.paper.buyAction}
            </button>
            <button
              onClick={() => handleOpenTrade('SELL')}
              disabled={isSubmitting}
              className="flex-1 py-2.5 rounded-lg text-xs font-bold bg-rose-500 hover:bg-rose-400 text-white transition flex items-center justify-center gap-1.5 shadow-md shadow-rose-500/20 disabled:opacity-50"
            >
              <ArrowDown className="h-4 w-4" />
              {t.paper.sellAction}
            </button>
          </div>
        </div>

        {notice && (
          <div className="rounded-lg bg-slate-900 border border-slate-800 p-2.5 text-xs text-slate-200">
            {notice}
          </div>
        )}
      </div>

      {/* Open Positions Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <span className="text-xs font-bold text-white uppercase tracking-wider">
            Active Simulated Positions ({openPositions.length})
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="p-3">Trade ID</th>
                <th className="p-3">Asset</th>
                <th className="p-3">Side</th>
                <th className="p-3">Entry Price</th>
                <th className="p-3">Amount ($)</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {openPositions.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-slate-500 font-sans">
                    No open paper positions. Place a simulated order above.
                  </td>
                </tr>
              ) : (
                openPositions.map(pos => (
                  <tr key={pos.id} className="hover:bg-slate-900/40">
                    <td className="p-3 text-slate-500">{pos.id}</td>
                    <td className="p-3 text-white font-bold">{pos.symbol}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${pos.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {pos.type}
                      </span>
                    </td>
                    <td className="p-3 text-white font-bold">{pos.entryPrice.toFixed(4)}</td>
                    <td className="p-3 text-slate-300">${pos.amount.toFixed(2)}</td>
                    <td className="p-3">
                      <button
                        onClick={() => handleCloseTrade(pos.id)}
                        className="px-2.5 py-1 rounded text-[11px] font-semibold bg-slate-800 hover:bg-slate-700 text-rose-300 border border-slate-700 transition"
                      >
                        {t.paper.closePosition}
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
