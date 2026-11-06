import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { TradingSignal, MarketCategory, Timeframe } from '../types/trading';
import {
  Calculator,
  AlertTriangle,
  RotateCcw,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ShieldCheck,
  Clock,
  Timer,
  CheckCircle2,
  XCircle,
  Trophy,
  WalletCards,
  Zap,
} from 'lucide-react';

interface CompoundingTradeLog {
  id: string;
  timestamp: string;
  step: number;
  pair: string;
  type: string;
  stake: number;
  payoutPct: number;
  outcome: 'WON' | 'LOST';
  pnl: number;
  entryTime: string;
}

export const ThreeStepCompounding: React.FC = () => {
  const {
    t,
    language,
    dhakaTime,
    candleSecondsRemaining,
    generateSignal,
    assets,
    setActiveSymbol,
    setActiveCategory,
    setActivePage,
  } = useTrading();

  // Staking Parameters
  const [startingBalance, setStartingBalance] = useState<number>(1000);
  const [initialStake, setInitialStake] = useState<number>(10);
  const [payoutPct, setPayoutPct] = useState<number>(85);

  // Active Compounding Cycle State
  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [cycleCompleted, setCycleCompleted] = useState<boolean>(false);
  const [stopRuleNotice, setStopRuleNotice] = useState<string | null>(null);

  // Active Step Signal State
  const [selectedCategory, setSelectedCategory] = useState<MarketCategory>('binary');
  const [selectedPair, setSelectedPair] = useState<string>('EUR/USD (Binary)');
  const [selectedTimeframe, setSelectedTimeframe] = useState<Timeframe>('5m');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [stepSignal, setStepSignal] = useState<TradingSignal | null>(null);

  // Trade Execution History
  const [tradeLogs, setTradeLogs] = useState<CompoundingTradeLog[]>([]);

  // Calculation Logic:
  // Step 1: stake = initialStake
  const step1Stake = initialStake;
  const step1Profit = step1Stake * (payoutPct / 100);
  const step1TotalReturn = step1Stake + step1Profit;

  // Step 2: Reinvests principal + profit of step 1
  const step2Stake = step1TotalReturn;
  const step2Profit = step2Stake * (payoutPct / 100);
  const step2TotalReturn = step2Stake + step2Profit;

  // Step 3: Reinvests principal + profit of step 2
  const step3Stake = step2TotalReturn;
  const step3Profit = step3Stake * (payoutPct / 100);
  const step3TotalReturn = step3Stake + step3Profit;

  const totalCompoundedProfit = step3TotalReturn - initialStake;
  const projectedEndingBalance = startingBalance + totalCompoundedProfit;
  const maxPossibleLoss = initialStake;
  const riskExposurePct = startingBalance > 0 ? (initialStake / startingBalance) * 100 : 1;

  // Current active step stake and profit
  const currentStake = currentStep === 1 ? step1Stake : currentStep === 2 ? step2Stake : step3Stake;
  const currentPotentialProfit = currentStep === 1 ? step1Profit : currentStep === 2 ? step2Profit : step3Profit;
  const currentTotalReturn = currentStep === 1 ? step1TotalReturn : currentStep === 2 ? step2TotalReturn : step3TotalReturn;

  const formatCountdown = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Generate A+ Signal tailored for current compounding step
  const handleGenerateStepSignal = async () => {
    setIsGenerating(true);
    setStopRuleNotice(null);
    const sig = await generateSignal(selectedPair, selectedCategory, 'A_PLUS', selectedTimeframe);
    setIsGenerating(false);
    if (sig) {
      setStepSignal(sig);
    }
  };

  // Handle Trade WON: advance to next step or complete cycle
  const handleTradeWon = () => {
    if (!stepSignal) return;

    const log: CompoundingTradeLog = {
      id: `LOG-${Date.now()}`,
      timestamp: dhakaTime,
      step: currentStep,
      pair: stepSignal.pair,
      type: stepSignal.type,
      stake: currentStake,
      payoutPct,
      outcome: 'WON',
      pnl: currentPotentialProfit,
      entryTime: stepSignal.entryTimeFormatted || stepSignal.localTimeDhaka,
    };
    setTradeLogs(prev => [log, ...prev]);

    if (currentStep === 1) {
      setCurrentStep(2);
      setStepSignal(null);
      setStopRuleNotice(
        language === 'bn'
          ? `ধাপ ১ সফল! লাভসহ $${step2Stake.toFixed(2)} নিয়ে ধাপ ২ এ অগ্রসর হওয়া হয়েছে।`
          : `Step 1 WON! Reinvesting returns ($${step2Stake.toFixed(2)}) into Step 2.`
      );
    } else if (currentStep === 2) {
      setCurrentStep(3);
      setStepSignal(null);
      setStopRuleNotice(
        language === 'bn'
          ? `ধাপ ২ সফল! লাভসহ $${step3Stake.toFixed(2)} নিয়ে চূড়ান্ত ধাপ ৩ এ অগ্রসর হওয়া হয়েছে।`
          : `Step 2 WON! Reinvesting returns ($${step3Stake.toFixed(2)}) into Step 3.`
      );
    } else {
      // Step 3 WON -> Cycle Complete!
      setCycleCompleted(true);
      setCurrentStep(1);
      setStepSignal(null);
      setStopRuleNotice(
        language === 'bn'
          ? `অভিনন্দন! ৩-ধাপের কম্পাউন্ডিং সফলভাবে সম্পন্ন হয়েছে। মোট লাভ: +$${totalCompoundedProfit.toFixed(2)}। লাভ সুরক্ষিত করে চক্রটি পুনরায় ধাপ ১ এ রিসেট করা হয়েছে।`
          : `Congratulations! 3-Step Compounding Cycle completed with +$${totalCompoundedProfit.toFixed(2)} net profit. Capital preserved and reset to Step 1.`
      );
    }
  };

  // Handle Trade LOST: Strict Capital Preservation Stop Rule (Section 11 Compliance)
  const handleTradeLost = () => {
    const lostStep = currentStep;
    const log: CompoundingTradeLog = {
      id: `LOG-${Date.now()}`,
      timestamp: dhakaTime,
      step: lostStep,
      pair: stepSignal ? stepSignal.pair : selectedPair,
      type: stepSignal ? stepSignal.type : 'CALL/PUT',
      stake: currentStake,
      payoutPct,
      outcome: 'LOST',
      pnl: -currentStake,
      entryTime: stepSignal ? (stepSignal.entryTimeFormatted || stepSignal.localTimeDhaka) : dhakaTime,
    };
    setTradeLogs(prev => [log, ...prev]);

    // STRICT STOP RULE: Return to Step 1 immediately upon any loss.
    // Never chase consecutive losses. Never increase stake size after a losing trade (Martingale prohibited).
    setCurrentStep(1);
    setStepSignal(null);
    setCycleCompleted(false);

    setStopRuleNotice(
      language === 'bn'
        ? `[কঠোর ক্যাপিটাল প্রিজারভেশন রুল]: ধাপ ${lostStep}-এ লস হয়েছে। অবিলম্বে ধাপ ১ এ রিসেট করা হলো। কখনোই লসের পর সাইজ বাড়াবেন না (মার্টিনগেল নিষিদ্ধ)। সর্বোচ্চ লস মাত্র প্রাথমিক স্টেকের সমান ($${initialStake.toFixed(2)}) সীমাবদ্ধ রাখা হয়েছে।`
        : `[Strict Capital Preservation Stop Rule]: Trade lost on Step ${lostStep}. Immediately returned to Step 1 base stake ($${initialStake.toFixed(2)}). Never chase losses or increase stake (Martingale prohibited). Total capital remains strictly protected.`
    );
  };

  const handleReset = () => {
    setCurrentStep(1);
    setStepSignal(null);
    setCycleCompleted(false);
    setStopRuleNotice(null);
    setInitialStake(10);
    setPayoutPct(85);
  };

  const binaryOrFastPairs = assets.filter(
    a => a.category === selectedCategory || a.category === 'binary' || a.category === 'forex' || a.category === 'otc'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Calculator className="h-6 w-6 text-emerald-400" />
            {t.compounding.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Section 11 Compliant 3-Step Consecutive Win Compounding & Real-Time A+ Signal Engine
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
            <Clock className="h-3.5 w-3.5 text-emerald-400" />
            <span>{dhakaTime}</span>
          </div>

          <button
            onClick={handleReset}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition flex items-center gap-1.5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            {t.compounding.reset}
          </button>
        </div>
      </div>

      {/* Safety Caveat as mandated by Section 11 */}
      <div className="rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/30 via-slate-900 to-rose-950/20 p-4 text-xs text-rose-200/90 flex items-start gap-3 shadow-lg">
        <ShieldAlert className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="text-rose-300 font-bold block uppercase tracking-wider">
            Strict Capital Preservation & Stop Rule (Section 11 Compliance):
          </strong>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            <strong>Stop Rule:</strong> Return to Step 1 immediately upon any loss. Never chase consecutive losses. Never increase stake size after a losing trade (Martingale is prohibited). Compounding should only occur on consecutive wins using earned profits.
          </p>
        </div>
      </div>

      {/* Active Compounding Step Progress Tracker */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 shadow-lg space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-emerald-400" />
            <h2 className="text-xs font-extrabold text-white uppercase tracking-wider">
              Active Compounding Cycle Status
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-mono">Current Stage:</span>
            <span className="px-2.5 py-1 rounded-lg text-xs font-black font-mono bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20">
              STEP {currentStep} OF 3
            </span>
          </div>
        </div>

        {/* 3 Steps Visual Progress Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Step 1 Card */}
          <div
            className={`rounded-xl border p-4 space-y-2 transition relative ${
              currentStep === 1
                ? 'border-emerald-500 bg-gradient-to-b from-emerald-950/40 to-slate-900 shadow-lg shadow-emerald-500/10'
                : currentStep > 1
                ? 'border-emerald-800/40 bg-emerald-950/10 opacity-75'
                : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${currentStep === 1 ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                STEP 1
              </span>
              <span className="text-[10px] text-slate-400">Base Stake (100% Capital Risk)</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white pt-1">
              ${step1Stake.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-400 font-mono">
              +${step1Profit.toFixed(2)} profit ({payoutPct}%)
            </div>
            <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-800/80 font-mono flex justify-between">
              <span>Return: <strong>${step1TotalReturn.toFixed(2)}</strong></span>
              {currentStep > 1 && <span className="text-emerald-400 font-bold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Won</span>}
            </div>
          </div>

          {/* Step 2 Card */}
          <div
            className={`rounded-xl border p-4 space-y-2 transition relative ${
              currentStep === 2
                ? 'border-cyan-500 bg-gradient-to-b from-cyan-950/40 to-slate-900 shadow-lg shadow-cyan-500/10'
                : currentStep > 2
                ? 'border-emerald-800/40 bg-emerald-950/10 opacity-75'
                : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${currentStep === 2 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                STEP 2
              </span>
              <span className="text-[10px] text-cyan-400 font-medium">Reinvest Step 1 Return</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white pt-1">
              ${step2Stake.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-400 font-mono">
              +${step2Profit.toFixed(2)} profit ({payoutPct}%)
            </div>
            <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-800/80 font-mono flex justify-between">
              <span>Return: <strong>${step2TotalReturn.toFixed(2)}</strong></span>
              {currentStep > 2 && <span className="text-emerald-400 font-bold flex items-center gap-0.5"><CheckCircle2 className="h-3 w-3" /> Won</span>}
            </div>
          </div>

          {/* Step 3 Card */}
          <div
            className={`rounded-xl border p-4 space-y-2 transition relative ${
              currentStep === 3
                ? 'border-amber-500 bg-gradient-to-b from-amber-950/40 to-slate-900 shadow-lg shadow-amber-500/10 animate-pulse'
                : 'border-slate-800 bg-slate-900/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${currentStep === 3 ? 'bg-amber-500 text-slate-950' : 'bg-slate-800 text-slate-300'}`}>
                STEP 3
              </span>
              <span className="text-[10px] text-amber-400 font-bold">Target Harvest</span>
            </div>
            <div className="text-2xl font-extrabold font-mono text-white pt-1">
              ${step3Stake.toFixed(2)}
            </div>
            <div className="text-xs text-emerald-400 font-mono">
              +${step3Profit.toFixed(2)} profit ({payoutPct}%)
            </div>
            <div className="text-[11px] text-slate-300 pt-2 border-t border-slate-800/80 font-mono flex justify-between">
              <span>Final Harvest: <strong>${step3TotalReturn.toFixed(2)}</strong></span>
              <span className="text-emerald-400 font-bold">+${totalCompoundedProfit.toFixed(2)} Net</span>
            </div>
          </div>
        </div>

        {/* Notice Banner */}
        {stopRuleNotice && (
          <div className="rounded-xl border border-sky-800/50 bg-sky-950/20 p-3.5 text-xs text-sky-200 flex items-start gap-2.5">
            <ShieldCheck className="h-4 w-4 text-sky-400 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{stopRuleNotice}</span>
          </div>
        )}
      </div>

      {/* DEDICATED LIVE SIGNAL STATION FOR 3-STEP COMPOUNDING */}
      <div className="rounded-xl border border-emerald-500/40 bg-[#0d131f] p-5 shadow-2xl space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-emerald-400" />
            <div>
              <h2 className="text-sm font-extrabold text-white uppercase tracking-wider">
                Step {currentStep} High-Confluence AI Signal
              </h2>
              <p className="text-xs text-slate-400">
                Only qualified A+ setups with strict trend and SMC confirmation are recommended for compounding.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            <span className="text-slate-400">Stake:</span>
            <span className="text-emerald-400 font-extrabold text-sm">${currentStake.toFixed(2)}</span>
          </div>
        </div>

        {/* Signal Config Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs text-slate-400 block mb-1">Market Category:</label>
            <select
              value={selectedCategory}
              onChange={e => {
                const cat = e.target.value as MarketCategory;
                setSelectedCategory(cat);
                const first = assets.find(a => a.category === cat);
                if (first) setSelectedPair(first.symbol);
              }}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="binary">Binary Options (Call/Put)</option>
              <option value="forex">Forex Interbank Spot</option>
              <option value="gold">Gold Spot (XAU/USD)</option>
              <option value="crypto">Crypto Spot (Binance)</option>
              <option value="otc">Broker OTC Weekend</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Select Asset / Pair:</label>
            <select
              value={selectedPair}
              onChange={e => setSelectedPair(e.target.value)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              {binaryOrFastPairs.map(a => (
                <option key={a.symbol} value={a.symbol}>
                  {a.symbol} ({a.category.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 block mb-1">Expiry / Timeframe:</label>
            <select
              value={selectedTimeframe}
              onChange={e => setSelectedTimeframe(e.target.value as Timeframe)}
              className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
            >
              <option value="1m">1 Minute (Micro Candle)</option>
              <option value="5m">5 Minutes (Recommended A+)</option>
              <option value="15m">15 Minutes</option>
            </select>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerateStepSignal}
          disabled={isGenerating}
          className="w-full py-3 rounded-xl text-xs font-black bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:opacity-95 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 disabled:opacity-50"
        >
          <Sparkles className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
          {isGenerating ? 'Generating A+ Compounding Signal...' : `Generate Step ${currentStep} A+ Signal ($${currentStake.toFixed(2)} Stake)`}
        </button>

        {/* Display Generated Signal for Step */}
        {stepSignal ? (
          <div className="rounded-xl border border-emerald-500/50 bg-gradient-to-r from-emerald-950/40 via-[#0d131f] to-teal-950/30 p-5 shadow-2xl space-y-5">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`px-3 py-1.5 rounded-lg text-sm font-black font-mono tracking-wider ${
                    stepSignal.type === 'BUY' || stepSignal.type === 'CALL'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  }`}
                >
                  {stepSignal.type} {stepSignal.pair}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Step {currentStep} Compounding Trade
                </span>
              </div>

              <div className="flex items-center gap-3 font-mono">
                <span className="text-xs text-slate-400">Calibrated Confidence:</span>
                <span className="text-xl font-black text-emerald-400">
                  {stepSignal.confidenceScore}%
                </span>
              </div>
            </div>

            {/* DEDICATED PROMINENT SIGNAL ENTRY TIME BANNER */}
            <div className="rounded-xl border border-emerald-500/50 bg-slate-950/90 p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-xl bg-emerald-500 text-slate-950 font-black shadow-md flex items-center justify-center">
                  <Clock className="h-6 w-6" />
                </div>
                <div>
                  <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-wider block">
                    {language === 'bn' ? 'সিগন্যাল এন্ট্রি টাইম (EXACT ENTRY TIME)' : 'EXACT SIGNAL ENTRY TIME (UTC+6)'}
                  </span>
                  <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                    {stepSignal.entryTimeFormatted || stepSignal.localTimeDhaka}
                  </span>
                  <span className="text-xs text-emerald-200/90 block font-sans mt-0.5">
                    {stepSignal.suggestedEntryAction || (language === 'bn' ? 'পরবর্তী ক্যান্ডেল ওপেনের সাথে সাথে এন্ট্রি নিন' : 'Enter immediately at the next candle opening')}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2.5 bg-slate-900 px-4 py-2.5 rounded-xl border border-emerald-500/30 font-mono">
                <Timer className="h-4 w-4 text-amber-400 animate-pulse" />
                <div className="flex flex-col text-right">
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider">Remaining</span>
                  <span className="text-base font-extrabold text-amber-300">
                    {formatCountdown(candleSecondsRemaining)}
                  </span>
                </div>
              </div>
            </div>

            {/* Stake, Target Return, and Potential Profit */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TRADE STAKE</span>
                <span className="text-base font-extrabold text-white">${currentStake.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">TARGET PROFIT ({payoutPct}%)</span>
                <span className="text-base font-extrabold text-emerald-400">+${currentPotentialProfit.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">NEXT STEP CAPITAL</span>
                <span className="text-base font-extrabold text-cyan-300">${currentTotalReturn.toFixed(2)}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-[10px] text-slate-500 block">STOP RULE RISK</span>
                <span className="text-base font-extrabold text-rose-400">-${currentStake.toFixed(2)}</span>
              </div>
            </div>

            {/* Confirmations List */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">
                Technical Confluences:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {stepSignal.confirmations.map((conf, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-slate-900 border border-slate-800 text-slate-300 font-mono">
                    &bull; {conf}
                  </span>
                ))}
              </div>
            </div>

            {/* Interactive Outcome Recording Buttons (Strict Stop Rule Enforced) */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>Record Trade Outcome (ট্রেড রেজাল্ট নির্বাচন করুন):</span>
                <span className="text-rose-400 font-mono text-[11px]">Strict Stop Rule Active</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  onClick={handleTradeWon}
                  className="py-3 px-4 rounded-xl text-xs font-black bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  {currentStep === 3
                    ? `TRADE WON! Complete Cycle (+$${totalCompoundedProfit.toFixed(2)})`
                    : `TRADE WON! (Advance To Step ${currentStep + 1} with $${currentTotalReturn.toFixed(2)})`}
                </button>

                <button
                  onClick={handleTradeLost}
                  className="py-3 px-4 rounded-xl text-xs font-black bg-rose-600 hover:bg-rose-500 text-white transition flex items-center justify-center gap-2 shadow-lg shadow-rose-600/20"
                >
                  <XCircle className="h-4 w-4" />
                  TRADE LOST (Stop Rule - Reset To Step 1)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center space-y-2 bg-slate-900/30">
            <Sparkles className="h-8 w-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Step {currentStep} Signal Generated Yet</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Click <strong>"Generate Step {currentStep} A+ Signal"</strong> above to calculate institutional confluence, exact entry time, and required ${currentStake.toFixed(2)} stake.
            </p>
          </div>
        )}
      </div>

      {/* Trade Execution History & Compliance Audit */}
      {tradeLogs.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Compounding Cycle Execution Audit Log
            </h4>
            <span className="text-[11px] font-mono text-slate-500">{tradeLogs.length} Trades Recorded</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-2.5">Time (UTC+6)</th>
                  <th className="p-2.5">Step</th>
                  <th className="p-2.5">Asset</th>
                  <th className="p-2.5">Type</th>
                  <th className="p-2.5">Stake</th>
                  <th className="p-2.5">Outcome</th>
                  <th className="p-2.5">PnL</th>
                  <th className="p-2.5">Action Taken</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {tradeLogs.map(log => (
                  <tr key={log.id} className="hover:bg-slate-900/40">
                    <td className="p-2.5 text-slate-400">{log.timestamp}</td>
                    <td className="p-2.5 font-bold text-white">Step {log.step}</td>
                    <td className="p-2.5 text-slate-200">{log.pair}</td>
                    <td className="p-2.5 font-bold">{log.type}</td>
                    <td className="p-2.5 text-white">${log.stake.toFixed(2)}</td>
                    <td className="p-2.5">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${log.outcome === 'WON' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                        {log.outcome}
                      </span>
                    </td>
                    <td className={`p-2.5 font-bold ${log.outcome === 'WON' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {log.pnl >= 0 ? `+$${log.pnl.toFixed(2)}` : `-$${Math.abs(log.pnl).toFixed(2)}`}
                    </td>
                    <td className="p-2.5 text-slate-400 text-[11px]">
                      {log.outcome === 'WON' ? `Advanced to Step ${log.step === 3 ? 1 : log.step + 1}` : 'Stop Rule: Reset to Step 1'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
