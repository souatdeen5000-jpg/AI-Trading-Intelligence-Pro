import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { BacktestResult, Timeframe } from '../types/trading';
import { FlaskConical, Play, CheckCircle2, XCircle, TrendingUp, AlertTriangle, ArrowRight } from 'lucide-react';

export const Backtesting: React.FC = () => {
  const { t, language, assets, activeSymbol, setActiveSymbol } = useTrading();

  const [symbol, setSymbol] = useState<string>('BTC/USDT');
  const [timeframe, setTimeframe] = useState<Timeframe>('15m');
  const [strategy, setStrategy] = useState<string>('SMC_FVG_ORDER_BLOCK');
  const [initialBalance, setInitialBalance] = useState<number>(10000);
  const [riskPerTrade, setRiskPerTrade] = useState<number>(2);

  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [result, setResult] = useState<BacktestResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRunBacktest = async () => {
    try {
      setIsRunning(true);
      setErrorMsg(null);
      const res = await fetch('/api/backtest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol,
          timeframe,
          strategy,
          initialBalance,
          riskPerTrade,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setResult(data.result);
      } else {
        setErrorMsg(data.error || 'Backtest execution failed.');
      }
    } catch (e: any) {
      setErrorMsg(e.message || 'Network error running backtest.');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <FlaskConical className="h-6 w-6 text-emerald-400" />
            {t.backtesting.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.backtesting.subtitle}
          </p>
        </div>

        <button
          onClick={handleRunBacktest}
          disabled={isRunning}
          className="px-5 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Play className={`h-4 w-4 ${isRunning ? 'animate-spin' : ''}`} />
          {isRunning ? 'Simulating Historical Trades...' : t.backtesting.runTest}
        </button>
      </div>

      {/* Backtest Configuration Form */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-4 shadow-lg">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
          Simulation Parameters (Chronological Walk-Forward)
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 text-xs">
          {/* Symbol */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Asset / Pair:</label>
            <select
              value={symbol}
              onChange={e => setSymbol(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              {assets.map(a => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol}
                </option>
              ))}
            </select>
          </div>

          {/* Timeframe */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Timeframe:</label>
            <select
              value={timeframe}
              onChange={e => setTimeframe(e.target.value as Timeframe)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="5m">5 Minutes</option>
              <option value="15m">15 Minutes</option>
              <option value="1h">1 Hour</option>
              <option value="4h">4 Hours</option>
              <option value="1d">Daily</option>
            </select>
          </div>

          {/* Strategy */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Strategy Engine:</label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            >
              <option value="SMC_FVG_ORDER_BLOCK">SMC Order Block + FVG Reversal</option>
              <option value="EMA_CROSSOVER_TREND">Triple EMA (9/20/50) Trend Alignment</option>
              <option value="SUPERTREND_MACD">Supertrend + MACD Momentum Expansion</option>
            </select>
          </div>

          {/* Capital */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Starting Balance ($):</label>
            <input
              type="number"
              value={initialBalance}
              onChange={e => setInitialBalance(parseFloat(e.target.value) || 10000)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Risk */}
          <div className="space-y-1.5">
            <label className="text-slate-400">Risk Per Trade (%):</label>
            <input
              type="number"
              value={riskPerTrade}
              onChange={e => setRiskPerTrade(parseFloat(e.target.value) || 2)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
            />
          </div>
        </div>

        {errorMsg && (
          <div className="rounded-lg bg-rose-950/30 border border-rose-800/50 p-3 text-xs text-rose-300 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}
      </div>

      {/* Backtest Report Output */}
      {result && (
        <div className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">FINAL BALANCE</span>
              <span className="text-lg font-extrabold font-mono text-emerald-400">
                ${result.finalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">WIN RATE</span>
              <span className="text-lg font-extrabold font-mono text-white">
                {result.winRate}%
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">PROFIT FACTOR</span>
              <span className="text-lg font-extrabold font-mono text-cyan-400">
                {result.profitFactor}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">MAX DRAWDOWN</span>
              <span className="text-lg font-extrabold font-mono text-rose-400">
                {result.maxDrawdown}%
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">TOTAL TRADES</span>
              <span className="text-lg font-extrabold font-mono text-slate-200">
                {result.totalTrades} ({result.wins}W / {result.losses}L)
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-3.5 space-y-1">
              <span className="text-[10px] text-slate-500 font-mono block">AVG R:R RATIO</span>
              <span className="text-lg font-extrabold font-mono text-amber-300">
                1:{result.avgRewardRisk}
              </span>
            </div>
          </div>

          {/* Historical Trades Log Table */}
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                Simulated Historical Trades Log ({result.trades.length} Entries)
              </span>
              <span className="text-[11px] text-slate-500 font-mono">Walk-forward validation</span>
            </div>

            <div className="overflow-x-auto max-h-96">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-900/90 text-slate-400 uppercase text-[10px] border-b border-slate-800 sticky top-0">
                  <tr>
                    <th className="p-2.5">Trade ID</th>
                    <th className="p-2.5">Action</th>
                    <th className="p-2.5">Entry Price</th>
                    <th className="p-2.5">Exit Price</th>
                    <th className="p-2.5">PnL (%)</th>
                    <th className="p-2.5">Reason / Trigger</th>
                    <th className="p-2.5">Outcome</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {result.trades.map(trade => (
                    <tr key={trade.id} className="hover:bg-slate-900/40">
                      <td className="p-2.5 text-slate-500">{trade.id}</td>
                      <td className="p-2.5">
                        <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                          {trade.type}
                        </span>
                      </td>
                      <td className="p-2.5 text-white font-bold">{trade.entryPrice.toFixed(2)}</td>
                      <td className="p-2.5 text-slate-300">{trade.exitPrice.toFixed(2)}</td>
                      <td className={`p-2.5 font-bold ${trade.isWin ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.isWin ? '+' : ''}{trade.pnlPct}%
                      </td>
                      <td className="p-2.5 text-slate-400 font-sans text-[11px]">{trade.reason}</td>
                      <td className="p-2.5">
                        {trade.isWin ? (
                          <span className="text-emerald-400 font-bold flex items-center gap-1 text-[11px]">
                            <CheckCircle2 className="h-3.5 w-3.5" /> WIN
                          </span>
                        ) : (
                          <span className="text-rose-400 font-bold flex items-center gap-1 text-[11px]">
                            <XCircle className="h-3.5 w-3.5" /> LOSS
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
