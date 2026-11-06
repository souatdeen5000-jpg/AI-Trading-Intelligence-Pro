import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal, MarketCategory, Timeframe } from '../types/trading';
import { Sparkles, ShieldCheck, Activity, Clock, Timer, CheckCircle2, AlertTriangle, ArrowRight, WalletCards } from 'lucide-react';

export const AiSignalGenerator: React.FC = () => {
  const {
    t,
    language,
    assets,
    activeSymbol,
    setActiveSymbol,
    activeCategory,
    setActiveCategory,
    activeTimeframe,
    setActiveTimeframe,
    generateSignal,
    signals,
    dhakaTime,
    candleSecondsRemaining,
    setActivePage,
  } = useTrading();

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const [selectedMode, setSelectedMode] = useState<'A_PLUS' | 'NORMAL'>('A_PLUS');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeGeneratedSignal, setActiveGeneratedSignal] = useState<TradingSignal | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setNotice(null);
    const sig = await generateSignal(activeSymbol, activeCategory, selectedMode, activeTimeframe);
    setIsGenerating(false);

    if (sig) {
      setActiveGeneratedSignal(sig);
    } else {
      setNotice(
        selectedMode === 'A_PLUS'
          ? (language === 'bn'
              ? 'বর্তমানে A+ সেটআপের কঠোর শর্তাবলী (মাল্টি-টাইমফ্রেম ট্রেন্ড, এসএমসি ব্লক ও লিকুইডিটি) পূরণ হয়নি। "NORMAL" মোড চেষ্টা করুন বা ভিন্ন টাইমফ্রেম নির্বাচন করুন।'
              : 'No A+ setup currently qualifies. A+ mode requires strict multi-timeframe alignment, SMC order block presence, and verified R:R. Try switching to "Normal" mode or another timeframe.')
          : (language === 'bn'
              ? 'কোনো উপযুক্ত টেকনিক্যাল কনফ্লুয়েন্স পাওয়া যায়নি।'
              : 'No qualified technical confluence detected at this moment.')
      );
    }
  };

  const currentDisplaySignal = activeGeneratedSignal || (signals.length > 0 ? signals[0] : null);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-emerald-400" />
            {t.signals.generatorTitle}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Dual-Mode Algorithmic Intelligence (A+ Multi-Confluence & Normal Technical Setup Engine)
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Clock className="h-3.5 w-3.5 text-emerald-400" />
          <span className="text-slate-300">{dhakaTime}</span>
        </div>
      </div>

      {/* Signal Configuration Form */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-lg space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* 1. Category */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">{t.signals.filterCategory}:</label>
            <select
              value={activeCategory}
              onChange={e => {
                const cat = e.target.value as MarketCategory;
                setActiveCategory(cat);
                const first = assets.find(a => a.category === cat);
                if (first) setActiveSymbol(first.symbol);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="crypto">Crypto Spot (Binance Public)</option>
              <option value="forex">Forex Interbank Spot</option>
              <option value="gold">Gold Spot (XAU/USD)</option>
              <option value="binary">Binary Options (Call/Put)</option>
              <option value="otc">OTC Weekend Market</option>
            </select>
          </div>

          {/* 2. Asset / Pair */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">{t.signals.selectPair}:</label>
            <select
              value={activeSymbol}
              onChange={e => setActiveSymbol(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              {assets
                .filter(a => a.category === activeCategory)
                .map(a => (
                  <option key={a.symbol} value={a.symbol}>
                    {a.symbol} - {a.name}
                  </option>
                ))}
            </select>
          </div>

          {/* 3. Timeframe */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">{t.common.timeframe}:</label>
            <select
              value={activeTimeframe}
              onChange={e => setActiveTimeframe(e.target.value as Timeframe)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="1m">1 Minute (Binary/Scalping)</option>
              <option value="3m">3 Minutes</option>
              <option value="5m">5 Minutes (Recommended)</option>
              <option value="15m">15 Minutes (Intraday)</option>
              <option value="30m">30 Minutes</option>
              <option value="1h">1 Hour (Swing Structure)</option>
              <option value="4h">4 Hours</option>
              <option value="1d">Daily (Macro)</option>
            </select>
          </div>

          {/* 4. Qualification Mode */}
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-slate-400">{t.signals.modeSelector}:</label>
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedMode('A_PLUS')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  selectedMode === 'A_PLUS'
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                A+ MODE
              </button>
              <button
                type="button"
                onClick={() => setSelectedMode('NORMAL')}
                className={`py-2 rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 ${
                  selectedMode === 'NORMAL'
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <Activity className="h-3.5 w-3.5" />
                NORMAL
              </button>
            </div>
          </div>
        </div>

        {/* Mode Explanation Box */}
        <div className="rounded-lg bg-slate-900/60 border border-slate-800/80 p-3 text-xs text-slate-400">
          {selectedMode === 'A_PLUS' ? (
            <div className="flex items-start gap-2 text-emerald-300">
              <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-400" />
              <span>
                <strong>A+ Mode Requirement:</strong> {t.signals.aPlusDesc} Only high-probability confluences are admitted.
              </span>
            </div>
          ) : (
            <div className="flex items-start gap-2 text-slate-300">
              <Activity className="h-4 w-4 shrink-0 mt-0.5 text-cyan-400" />
              <span>
                <strong>Normal Mode:</strong> {t.signals.normalDesc}
              </span>
            </div>
          )}
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? t.signals.generating : t.signals.generateBtn}
        </button>

        {notice && (
          <div className="rounded-lg bg-amber-950/30 border border-amber-800/50 p-3 text-xs text-amber-300 font-medium flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <span>{notice}</span>
          </div>
        )}
      </div>

      {/* Comprehensive Signal Card Output (Section 6 Requirement: All 20 items) */}
      {currentDisplaySignal && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 shadow-2xl space-y-6">
          {/* Signal Header */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-white">{currentDisplaySignal.pair}</span>
                <span
                  className={`px-3 py-1 rounded-lg text-xs font-extrabold font-mono tracking-wider ${
                    currentDisplaySignal.type === 'BUY' || currentDisplaySignal.type === 'CALL'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  }`}
                >
                  {currentDisplaySignal.type}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 uppercase">
                  {currentDisplaySignal.mode}
                </span>
              </div>
              <span className="text-xs text-slate-400 block font-mono">
                Asset: {currentDisplaySignal.assetName} &bull; Market: {currentDisplaySignal.category.toUpperCase()} &bull; TF: {currentDisplaySignal.timeframe}
              </span>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 font-mono">Calibrated Confidence</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {currentDisplaySignal.confidenceScore}%
              </span>
              <span className="text-[10px] text-slate-500">Risk Assessment: <strong className="text-slate-300">{currentDisplaySignal.riskAssessment}</strong></span>
            </div>
          </div>

          {/* DEDICATED PROMINENT SIGNAL ENTRY TIME CARD */}
          <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#0d131f] to-teal-950/30 p-4 shadow-xl shadow-emerald-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'সিগন্যাল এন্ট্রি টাইম (EXACT ENTRY TIME)' : 'EXACT SIGNAL ENTRY TIME (UTC+6)'}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                  {currentDisplaySignal.entryTimeFormatted || currentDisplaySignal.localTimeDhaka}
                </span>
                <span className="text-xs text-emerald-200/90 block font-sans mt-0.5">
                  {currentDisplaySignal.suggestedEntryAction || (language === 'bn' ? 'পরবর্তী ক্যান্ডেল শুরুর ঠিক সময়ে এন্ট্রি নিন' : 'Enter immediately at the next candle opening')}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-emerald-500/30">
              <Timer className="h-4 w-4 text-amber-400 animate-pulse" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Entry In</span>
                <span className="text-base font-extrabold font-mono text-amber-300">
                  {formatCountdown(candleSecondsRemaining)}
                </span>
              </div>
            </div>
          </div>

          {/* Beginner Friendly Quick Execution Rules */}
          <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              {t.signals.beginnerGuide}
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-300">
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-emerald-400 font-bold block mb-0.5">{t.signals.step1Desc}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-cyan-400 font-bold block mb-0.5">{t.signals.step2Desc}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800/80">
                <span className="text-amber-400 font-bold block mb-0.5">{t.signals.step3Desc}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Targets Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
              <span className="text-[10px] text-slate-500 block">ENTRY PRICE</span>
              <span className="text-base font-extrabold text-white">
                {currentDisplaySignal.entryPrice >= 100 ? currentDisplaySignal.entryPrice.toFixed(2) : currentDisplaySignal.entryPrice.toFixed(5)}
              </span>
            </div>

            {currentDisplaySignal.stopLoss ? (
              <div className="rounded-xl border border-rose-900/30 bg-rose-950/10 p-3">
                <span className="text-[10px] text-rose-400 block">STOP LOSS (SL)</span>
                <span className="text-base font-extrabold text-rose-400">
                  {currentDisplaySignal.stopLoss >= 100 ? currentDisplaySignal.stopLoss.toFixed(2) : currentDisplaySignal.stopLoss.toFixed(5)}
                </span>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-3">
                <span className="text-[10px] text-slate-500 block">OPTION EXPIRY</span>
                <span className="text-base font-extrabold text-purple-400">
                  {currentDisplaySignal.expiryTime ? new Date(currentDisplaySignal.expiryTime).toLocaleTimeString('en-US', { timeZone: 'Asia/Dhaka', hour: '2-digit', minute: '2-digit' }) : '5m Close'}
                </span>
              </div>
            )}

            <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-3">
              <span className="text-[10px] text-emerald-400 block">TAKE PROFIT 1</span>
              <span className="text-base font-extrabold text-emerald-400">
                {currentDisplaySignal.takeProfit1 ? (currentDisplaySignal.takeProfit1 >= 100 ? currentDisplaySignal.takeProfit1.toFixed(2) : currentDisplaySignal.takeProfit1.toFixed(5)) : 'In-The-Money'}
              </span>
            </div>

            <div className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-3">
              <span className="text-[10px] text-emerald-400 block">TAKE PROFIT 2 / EXT</span>
              <span className="text-base font-extrabold text-emerald-300">
                {currentDisplaySignal.takeProfit2 ? (currentDisplaySignal.takeProfit2 >= 100 ? currentDisplaySignal.takeProfit2.toFixed(2) : currentDisplaySignal.takeProfit2.toFixed(5)) : 'Dynamic 1:2 R:R'}
              </span>
            </div>
          </div>

          {/* Time & Session Audit Table */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono bg-slate-900/40 p-3.5 rounded-xl border border-slate-800/80">
            <div>
              <span className="text-slate-500 block text-[10px]">DHAKA TIME (UTC+6):</span>
              <span className="text-slate-200 font-semibold">{currentDisplaySignal.localTimeDhaka}</span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">CANDLE OPEN / CLOSE:</span>
              <span className="text-slate-200">
                {new Date(currentDisplaySignal.candleOpenTime).toLocaleTimeString()} - {new Date(currentDisplaySignal.candleCloseTime).toLocaleTimeString()}
              </span>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">DATA SOURCE:</span>
              <span className="text-emerald-400 font-semibold">{currentDisplaySignal.dataSource}</span>
            </div>
          </div>

          {/* Technical Confirmations List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              {t.signals.confirmations}:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentDisplaySignal.confirmations.map((conf, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-2 text-xs text-slate-300"
                >
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>{conf}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Strategic Explanation */}
          <div className="space-y-1.5 rounded-xl bg-slate-900/80 border border-slate-800 p-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              {t.signals.reasoning}:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed">
              {language === 'bn' && currentDisplaySignal.explanationBn
                ? currentDisplaySignal.explanationBn
                : currentDisplaySignal.explanation}
            </p>
          </div>

          {/* Action Button: Execute in Paper Trading */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-500">
              Disclaimer: Calibrated analytical signal. Risk management strictly enforced.
            </span>
            <button
              onClick={() => {
                setActiveSymbol(currentDisplaySignal.pair);
                setActiveCategory(currentDisplaySignal.category);
                setActivePage('paper');
              }}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <WalletCards className="h-4 w-4" />
              {t.signals.executePaperTrade}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
