import React, { useState, useRef } from 'react';
import { useTrading } from '../context/TradingContext';
import { ScreenshotAnalysisResult, MarketCategory, Timeframe } from '../types/trading';
import { Camera, Upload, Sparkles, AlertTriangle, ShieldCheck, CheckCircle2, ArrowRight, Eye, RefreshCw, Clock, Timer, Zap } from 'lucide-react';

export const ScreenshotAnalyzer: React.FC = () => {
  const { t, language, assets, setActiveSymbol, setActiveCategory, setActivePage, dhakaTime, candleSecondsRemaining } = useTrading();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [category, setCategory] = useState<MarketCategory>('forex');
  const [pair, setPair] = useState<string>('EUR/USD');
  const [timeframe, setTimeframe] = useState<Timeframe>('5m');
  const [broker, setBroker] = useState<string>('Pocket Option / Quotex / MetaTrader');

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ScreenshotAnalysisResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!['image/png', 'image/jpeg', 'image/jpg', 'image/webp'].includes(file.type)) {
        setErrorMsg('Supported image formats: PNG, JPG, JPEG, WebP.');
        return;
      }
      setSelectedFile(file);
      setErrorMsg(null);
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!previewUrl) {
      setErrorMsg(language === 'bn' ? 'অনুগ্রহ করে প্রথমে একটি ট্রেডিং চার্টের স্ক্রিনশট আপলোড করুন।' : 'Please upload a trading chart screenshot first.');
      return;
    }

    try {
      setIsAnalyzing(true);
      setErrorMsg(null);

      const res = await fetch('/api/analyze-screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: previewUrl,
          mimeType: selectedFile?.type || 'image/png',
          category,
          pair,
          timeframe,
          broker,
        }),
      });

      let data: any;
      try {
        data = await res.json();
      } catch (err) {
        data = { success: false, error: 'Response parsing failed' };
      }

      if (data && data.success) {
        setResult(data);
      } else {
        // Human-friendly message, never display raw JSON or 503 errors
        let friendlyMsg = language === 'bn' 
          ? 'সার্ভারে সাময়িক চাপ রয়েছে। দয়া করে কয়েক সেকেন্ড পর আবার চেষ্টা করুন অথবা ভিন্ন পেয়ার নির্বাচন করুন।'
          : 'The vision engine is experiencing high demand. Please try again shortly or use direct signal generator.';
        if (typeof data?.error === 'string' && !data.error.includes('{') && !data.error.includes('503')) {
          friendlyMsg = data.error;
        }
        setErrorMsg(friendlyMsg);
      }
    } catch (e: any) {
      setErrorMsg(
        language === 'bn' 
          ? 'নেটওয়ার্ক সংযোগ বিঘ্নিত হয়েছে। দয়া করে পুনরায় চেষ্টা করুন।' 
          : 'Network communication error. Please check connection and retry.'
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Camera className="h-6 w-6 text-sky-400" />
            {t.screenshot.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.screenshot.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-sky-500/10 text-sky-400 border border-sky-500/20 flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5" />
            Gemini 3.8 Flash Multimodal Vision
          </span>
        </div>
      </div>

      {/* Upload & Context Selector Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: File Dropzone / Preview */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className={`rounded-xl border-2 border-dashed p-6 text-center cursor-pointer transition flex flex-col items-center justify-center min-h-[260px] ${
              previewUrl
                ? 'border-emerald-500/50 bg-slate-900/50'
                : 'border-slate-700 bg-[#0d131f] hover:border-slate-500'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {previewUrl ? (
              <div className="space-y-3 w-full">
                <img
                  src={previewUrl}
                  alt="Chart Screenshot Preview"
                  className="max-h-56 mx-auto rounded-lg object-contain border border-slate-700 shadow-md"
                />
                <span className="text-[11px] text-emerald-400 font-mono block">
                  Click to replace screenshot
                </span>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="p-3 rounded-full bg-slate-800 text-slate-400 mx-auto w-fit">
                  <Upload className="h-6 w-6 text-sky-400" />
                </div>
                <span className="text-xs font-bold text-white block">
                  {t.screenshot.dragDropText}
                </span>
                <span className="text-[10px] text-slate-500 block">
                  Supports PNG, JPG, JPEG, WebP
                </span>
              </div>
            )}
          </div>

          {errorMsg && (
            <div className="rounded-lg bg-rose-950/30 border border-rose-800/50 p-3 text-xs text-rose-300 flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>

        {/* Right 2 Columns: Chart Context Inputs & Action */}
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Screenshot Chart Parameters
              </h3>
              <span className="text-[11px] text-sky-400 font-mono">1-Click Presets</span>
            </div>

            {/* Quick Presets for Beginners */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 block font-medium">Quick Select Pair (সহজে নির্বাচন করুন):</span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'EUR/USD', cat: 'forex' as const, pairName: 'EUR/USD', tf: '5m' as const, brk: 'MetaTrader / TradingView' },
                  { label: 'GBP/USD', cat: 'forex' as const, pairName: 'GBP/USD', tf: '5m' as const, brk: 'MetaTrader' },
                  { label: 'XAU/USD (Gold)', cat: 'gold' as const, pairName: 'XAU/USD', tf: '5m' as const, brk: 'TradingView / Interbank' },
                  { label: 'BTC/USDT', cat: 'crypto' as const, pairName: 'BTC/USDT', tf: '5m' as const, brk: 'Binance' },
                  { label: 'EUR/USD (Binary)', cat: 'binary' as const, pairName: 'EUR/USD', tf: '1m' as const, brk: 'Quotex / PocketOption' },
                  { label: 'EUR/USD (OTC)', cat: 'otc' as const, pairName: 'EUR/USD (OTC)', tf: '1m' as const, brk: 'Pocket Option OTC' },
                ].map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setCategory(item.cat);
                      setPair(item.pairName);
                      setTimeframe(item.tf);
                      setBroker(item.brk);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono font-medium transition ${
                      pair === item.pairName && category === item.cat
                        ? 'bg-sky-500 text-slate-950 font-bold shadow-sm'
                        : 'bg-slate-900 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Market Category:</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value as MarketCategory)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="forex">Forex</option>
                  <option value="gold">Gold (XAU/USD)</option>
                  <option value="crypto">Crypto</option>
                  <option value="binary">Binary Options</option>
                  <option value="otc">Broker OTC</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Pair / Asset Shown:</label>
                <input
                  type="text"
                  value={pair}
                  onChange={e => setPair(e.target.value)}
                  placeholder="e.g. EUR/USD, BTC/USDT, XAU/USD"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Chart Timeframe:</label>
                <select
                  value={timeframe}
                  onChange={e => setTimeframe(e.target.value as Timeframe)}
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                >
                  <option value="1m">1 Minute</option>
                  <option value="2m">2 Minutes</option>
                  <option value="5m">5 Minutes</option>
                  <option value="15m">15 Minutes</option>
                  <option value="1h">1 Hour</option>
                  <option value="4h">4 Hours</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs text-slate-400">Broker / Platform Origin:</label>
                <input
                  type="text"
                  value={broker}
                  onChange={e => setBroker(e.target.value)}
                  placeholder="e.g. TradingView, Quotex, PocketOption, MT4/5"
                  className="w-full rounded-lg border border-slate-700 bg-slate-900 px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>
            </div>

            <button
              onClick={handleAnalyze}
              disabled={isAnalyzing || !previewUrl}
              className="w-full py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-sky-500 via-cyan-500 to-teal-500 hover:opacity-95 text-slate-950 transition flex items-center justify-center gap-2 shadow-lg shadow-sky-500/20 disabled:opacity-50"
            >
              <Sparkles className={`h-4 w-4 ${isAnalyzing ? 'animate-spin' : ''}`} />
              {isAnalyzing ? t.screenshot.analyzing : 'Audit Chart with Gemini Vision'}
            </button>
          </div>
        </div>
      </div>

      {/* Multimodal Analysis Output Result Card */}
      {result && (
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-6 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Visual Inspection Audit Result
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xl font-extrabold text-white">Action Recommendation:</span>
                <span
                  className={`px-3 py-1 rounded-lg text-sm font-extrabold font-mono ${
                    result.action === 'BUY' || result.action === 'CALL'
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : result.action === 'SELL' || result.action === 'PUT'
                      ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                      : 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  }`}
                >
                  {result.action}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Trend: <strong className="text-white">{result.marketTrend}</strong>
                </span>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <span className="text-xs text-slate-500 font-mono">Calibrated Confidence</span>
              <span className="text-2xl font-extrabold font-mono text-emerald-400">
                {result.confidenceScore}%
              </span>
              <span className="text-[10px] text-slate-500">Entry: {result.entryZone}</span>
            </div>
          </div>

          {/* DEDICATED SCREENSHOT SIGNAL ENTRY TIME CARD */}
          <div className="rounded-xl border border-sky-500/40 bg-gradient-to-r from-sky-950/40 via-[#0d131f] to-teal-950/30 p-4 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-sky-500 text-slate-950 font-black shadow-md flex items-center justify-center">
                <Clock className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-mono font-bold text-sky-400 uppercase tracking-wider block">
                  {language === 'bn' ? 'সিগন্যাল এন্ট্রি টাইম (EXACT ENTRY TIME)' : 'EXACT SIGNAL ENTRY TIME (UTC+6)'}
                </span>
                <span className="text-xl sm:text-2xl font-black font-mono text-white tracking-tight">
                  {dhakaTime}
                </span>
                <span className="text-xs text-sky-200/90 block font-sans mt-0.5">
                  {result.action === 'NO_TRADE' 
                    ? (language === 'bn' ? 'কোনো কনফার্ম ট্রেড সেটআপ নেই, অপেক্ষা করুন' : 'No confirmed setup, stand aside') 
                    : `${language === 'bn' ? 'পরবর্তী ক্যান্ডেল ওপেনে এন্ট্রি জোন:' : 'Entry Zone:'} ${result.entryZone}`}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 bg-slate-950/80 px-4 py-2.5 rounded-xl border border-sky-500/30">
              <Timer className="h-4 w-4 text-amber-400 animate-pulse" />
              <div className="flex flex-col text-right">
                <span className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Timeframe</span>
                <span className="text-sm font-bold font-mono text-amber-300">
                  {result.suggestedTimeframe || timeframe}
                </span>
              </div>
            </div>
          </div>

          {/* Detected Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Detected Candles & Patterns */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Eye className="h-4 w-4 text-emerald-400" />
                {t.screenshot.detectedCandles}
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.detectedCandles.map((c, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-mono">
                    {c}
                  </span>
                ))}
              </div>
            </div>

            {/* Identified Visible Indicators */}
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-400" />
                {t.screenshot.detectedIndicators}
              </span>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {result.detectedIndicators.map((ind, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-md text-xs bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                    {ind}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Support & Resistance & SMC Observations */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t.screenshot.supportResistance}
              </span>
              <div className="space-y-1 text-xs font-mono text-slate-300">
                <div>
                  <span className="text-emerald-400">Support Levels:</span>{' '}
                  {result.supportResistance.support.join(', ') || 'Dynamic lower channel'}
                </div>
                <div>
                  <span className="text-rose-400">Resistance Levels:</span>{' '}
                  {result.supportResistance.resistance.join(', ') || 'Recent swing peak'}
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                {t.screenshot.smcNotes}
              </span>
              <div className="space-y-1 text-xs text-slate-300">
                {result.smcIctNotes.map((note, i) => (
                  <div key={i} className="flex items-start gap-1.5">
                    <span className="text-sky-400">&bull;</span>
                    <span>{note}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bilingual Reasoning Breakdown */}
          <div className="space-y-3 rounded-xl bg-slate-900/80 border border-slate-800 p-4">
            <span className="text-xs font-bold text-white uppercase tracking-wider block">
              Strategic AI Vision Analysis:
            </span>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {language === 'bn' ? result.explanationBn : result.explanationEn}
            </p>
          </div>

          {/* Risk caveat */}
          <div className="rounded-lg bg-amber-950/20 border border-amber-800/40 p-3 text-xs text-amber-300/90 flex items-start gap-2">
            <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
            <span>
              <strong>Risk Warning:</strong> {result.riskWarning}
            </span>
          </div>

          {/* Quick Action Navigation */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800">
            <button
              onClick={() => {
                setActiveSymbol(pair);
                setActiveCategory(category);
                setActivePage('charts');
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center gap-1.5"
            >
              Open {pair} Live Chart <ArrowRight className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => {
                setActiveSymbol(pair);
                setActiveCategory(category);
                setActivePage('paper');
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              Execute In Paper Trading <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
