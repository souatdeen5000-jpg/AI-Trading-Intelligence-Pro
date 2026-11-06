import React from 'react';
import { TradingSignal } from '../../types/trading';
import { useTrading } from '../../context/TradingContext';
import { Clock, Timer, ShieldCheck, Activity, CheckCircle2, WalletCards, X } from 'lucide-react';

interface SignalCardProps {
  signal: TradingSignal;
  onClose?: () => void;
}

export const SignalCard: React.FC<SignalCardProps> = ({ signal, onClose }) => {
  const { language, candleSecondsRemaining, setActiveSymbol, setActiveCategory, setActivePage } = useTrading();

  const isBull = signal.type === 'BUY' || signal.type === 'CALL';

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#0d131f] to-teal-950/30 p-4 sm:p-5 shadow-2xl shadow-emerald-500/10 space-y-4">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <span
            className={`px-3 py-1 rounded-lg text-xs font-black font-mono tracking-wider ${
              isBull
                ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
            }`}
          >
            {signal.type} {signal.pair}
          </span>
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 uppercase">
            {signal.mode} &bull; {signal.timeframe}
          </span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            Market: {signal.category.toUpperCase()}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-mono text-xs">
            <span className="text-slate-400">Confidence:</span>
            <span className="text-emerald-400 font-black text-base">{signal.confidenceScore}%</span>
          </div>

          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-500 hover:text-white hover:bg-slate-800 transition"
              title="Close Signal"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* DEDICATED PROMINENT SIGNAL ENTRY TIME BANNER */}
      <div className="rounded-xl border border-emerald-500/40 bg-slate-950/90 p-3.5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500 text-slate-950 font-black shadow-md flex items-center justify-center">
            <Clock className="h-5 w-5" />
          </div>
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
              {language === 'bn' ? 'সিগন্যাল এন্ট্রি টাইম (EXACT ENTRY TIME)' : 'EXACT SIGNAL ENTRY TIME (UTC+6)'}
            </span>
            <span className="text-lg sm:text-xl font-black font-mono text-white tracking-tight">
              {signal.entryTimeFormatted || signal.localTimeDhaka}
            </span>
            <span className="text-xs text-emerald-200/90 block font-sans">
              {signal.suggestedEntryAction || (language === 'bn' ? 'পরবর্তী ক্যান্ডেল শুরুর ঠিক সময়ে এন্ট্রি নিন' : 'Enter immediately at the next candle opening')}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 bg-slate-900 px-3.5 py-2 rounded-xl border border-emerald-500/30 font-mono">
          <Timer className="h-4 w-4 text-amber-400 animate-pulse" />
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-slate-400 uppercase tracking-wider">Entry In</span>
            <span className="text-sm sm:text-base font-extrabold text-amber-300">
              {formatCountdown(candleSecondsRemaining)}
            </span>
          </div>
        </div>
      </div>

      {/* Price Targets Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-xs font-mono">
        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">ENTRY PRICE</span>
          <span className="text-sm font-extrabold text-white">
            {signal.entryPrice >= 100 ? signal.entryPrice.toFixed(2) : signal.entryPrice.toFixed(4)}
          </span>
        </div>

        {signal.stopLoss ? (
          <div className="p-2.5 rounded-lg bg-rose-950/20 border border-rose-900/30">
            <span className="text-[10px] text-rose-400 block">STOP LOSS</span>
            <span className="text-sm font-extrabold text-rose-400">
              {signal.stopLoss >= 100 ? signal.stopLoss.toFixed(2) : signal.stopLoss.toFixed(4)}
            </span>
          </div>
        ) : (
          <div className="p-2.5 rounded-lg bg-purple-950/20 border border-purple-900/30">
            <span className="text-[10px] text-purple-300 block">OPTION EXPIRY</span>
            <span className="text-sm font-extrabold text-purple-300">
              {signal.expiryTime ? new Date(signal.expiryTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }) : '5m Candle Close'}
            </span>
          </div>
        )}

        <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/30">
          <span className="text-[10px] text-emerald-400 block">TAKE PROFIT 1</span>
          <span className="text-sm font-extrabold text-emerald-400">
            {signal.takeProfit1 ? (signal.takeProfit1 >= 100 ? signal.takeProfit1.toFixed(2) : signal.takeProfit1.toFixed(4)) : 'In-The-Money'}
          </span>
        </div>

        <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
          <span className="text-[10px] text-slate-500 block">DATA FEED</span>
          <span className="text-xs font-bold text-slate-300 truncate block">{signal.dataSource}</span>
        </div>
      </div>

      {/* Confirmations and Strategic Reasoning */}
      <div className="space-y-1.5 text-xs">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
          Key Confluences & SMC Flow:
        </span>
        <div className="flex flex-wrap gap-1">
          {signal.confirmations.map((conf, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded text-[10px] bg-slate-900 border border-slate-800 text-slate-300 font-mono">
              &bull; {conf}
            </span>
          ))}
        </div>
        <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">
          {language === 'bn' && signal.explanationBn ? signal.explanationBn : signal.explanation}
        </p>
      </div>

      {/* Action Footer */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-800">
        <span className="text-[10px] text-slate-500">
          Calibrated algorithmic setup &bull; Risk management rules apply
        </span>
        <button
          onClick={() => {
            setActiveSymbol(signal.pair);
            setActiveCategory(signal.category);
            setActivePage('paper');
          }}
          className="px-3.5 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
        >
          <WalletCards className="h-3.5 w-3.5" />
          Execute in Paper Trading
        </button>
      </div>
    </div>
  );
};
