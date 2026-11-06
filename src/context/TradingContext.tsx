import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { MarketAsset, MarketCategory, Timeframe, Candle, TechnicalIndicators, TradingSignal, PaperTrade } from '../types/trading';
import { translations, Language } from '../utils/i18n';

interface TradingContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: typeof translations['en'];
  theme: 'dark' | 'light';
  setTheme: (th: 'dark' | 'light') => void;
  activePage: string;
  setActivePage: (p: string) => void;
  activeSymbol: string;
  setActiveSymbol: (s: string) => void;
  activeCategory: MarketCategory;
  setActiveCategory: (c: MarketCategory) => void;
  activeTimeframe: Timeframe;
  setActiveTimeframe: (tf: Timeframe) => void;
  assets: MarketAsset[];
  isLoadingAssets: boolean;
  refreshAssets: () => Promise<void>;
  currentCandles: Candle[];
  currentIndicators: TechnicalIndicators | null;
  isLoadingCandles: boolean;
  fetchCandles: (sym?: string, tf?: Timeframe) => Promise<void>;
  signals: TradingSignal[];
  signalStats: any;
  fetchSignals: () => Promise<void>;
  generateSignal: (sym: string, cat: MarketCategory, mode: 'A_PLUS' | 'NORMAL', tf?: Timeframe) => Promise<TradingSignal | null>;
  dhakaTime: string;
  candleSecondsRemaining: number;
  paperAccount: { balance: number; initialBalance: number; trades: PaperTrade[] };
  refreshPaperAccount: () => Promise<void>;
  showTestModal: boolean;
  setShowTestModal: (v: boolean) => void;
}

const TradingContext = createContext<TradingContextType | undefined>(undefined);

export const TradingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('trade_lang') as Language) || 'en';
  });
  const [theme, setThemeState] = useState<'dark' | 'light'>('dark');
  const [activePage, setActivePage] = useState<string>('dashboard');
  const [activeSymbol, setActiveSymbol] = useState<string>('BTC/USDT');
  const [activeCategory, setActiveCategory] = useState<MarketCategory>('crypto');
  const [activeTimeframe, setActiveTimeframe] = useState<Timeframe>('5m');
  const [assets, setAssets] = useState<MarketAsset[]>([]);
  const [isLoadingAssets, setIsLoadingAssets] = useState<boolean>(false);

  const [currentCandles, setCurrentCandles] = useState<Candle[]>([]);
  const [currentIndicators, setCurrentIndicators] = useState<TechnicalIndicators | null>(null);
  const [isLoadingCandles, setIsLoadingCandles] = useState<boolean>(false);

  const [signals, setSignals] = useState<TradingSignal[]>([]);
  const [signalStats, setSignalStats] = useState<any>(null);

  const [dhakaTime, setDhakaTime] = useState<string>('');
  const [candleSecondsRemaining, setCandleSecondsRemaining] = useState<number>(300);

  const [paperAccount, setPaperAccount] = useState<{ balance: number; initialBalance: number; trades: PaperTrade[] }>({
    balance: 10000,
    initialBalance: 10000,
    trades: [],
  });

  const [showTestModal, setShowTestModal] = useState<boolean>(false);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('trade_lang', lang);
  };

  const setTheme = (th: 'dark' | 'light') => {
    setThemeState(th);
    const root = document.documentElement;
    if (th === 'light') {
      root.classList.remove('dark');
      root.classList.add('light');
    } else {
      root.classList.remove('light');
      root.classList.add('dark');
    }
  };

  const t = translations[language];

  // Refresh assets
  const refreshAssets = useCallback(async () => {
    try {
      setIsLoadingAssets(true);
      const res = await fetch('/api/market/ticker');
      if (res.ok) {
        const data = await res.json();
        if (data.assets) setAssets(data.assets);
      }
    } catch (e) {
      console.error('Failed to load assets', e);
    } finally {
      setIsLoadingAssets(false);
    }
  }, []);

  // Fetch candle data for current active symbol
  const fetchCandles = useCallback(async (sym?: string, tf?: Timeframe) => {
    const symbolToUse = sym || activeSymbol;
    const tfToUse = tf || activeTimeframe;
    try {
      setIsLoadingCandles(true);
      const res = await fetch(`/api/market/klines?symbol=${encodeURIComponent(symbolToUse)}&interval=${tfToUse}&limit=100`);
      if (res.ok) {
        const data = await res.json();
        if (data.candles) setCurrentCandles(data.candles);
        if (data.indicators) setCurrentIndicators(data.indicators);
      }
    } catch (e) {
      console.error('Failed to load candles', e);
    } finally {
      setIsLoadingCandles(false);
    }
  }, [activeSymbol, activeTimeframe]);

  // Fetch signals history
  const fetchSignals = useCallback(async () => {
    try {
      const res = await fetch('/api/signals/history');
      if (res.ok) {
        const data = await res.json();
        if (data.signals) setSignals(data.signals);
        if (data.stats) setSignalStats(data.stats);
      }
    } catch (e) {
      console.error('Failed to load signals', e);
    }
  }, []);

  // Refresh paper account
  const refreshPaperAccount = useCallback(async () => {
    try {
      const res = await fetch('/api/paper/account');
      if (res.ok) {
        const data = await res.json();
        if (data.account) setPaperAccount(data.account);
      }
    } catch (e) {
      console.error('Failed to load paper account', e);
    }
  }, []);

  // Generate signal
  const generateSignal = async (sym: string, cat: MarketCategory, mode: 'A_PLUS' | 'NORMAL', tf?: Timeframe): Promise<TradingSignal | null> => {
    try {
      const res = await fetch('/api/signals/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: sym,
          category: cat,
          mode,
          timeframe: tf || activeTimeframe,
        }),
      });
      const data = await res.json();
      if (data.success && data.signal) {
        setSignals(prev => [data.signal, ...prev]);
        fetchSignals();
        return data.signal;
      }
      return null;
    } catch (e) {
      console.error('Signal generation failed', e);
      return null;
    }
  };

  // Clock Ticker in Bangladesh Time (UTC+6)
  useEffect(() => {
    const updateTimeAndCandle = () => {
      const now = new Date();
      // Format Asia/Dhaka
      const formatted = now.toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      }) + ' UTC+6';
      setDhakaTime(formatted);

      // Calculate remaining seconds in current candle timeframe
      const totalSeconds = now.getUTCMinutes() * 60 + now.getUTCSeconds();
      let candleSpan = 300; // default 5m
      if (activeTimeframe === '1m') candleSpan = 60;
      else if (activeTimeframe === '2m') candleSpan = 120;
      else if (activeTimeframe === '3m') candleSpan = 180;
      else if (activeTimeframe === '15m') candleSpan = 900;
      else if (activeTimeframe === '30m') candleSpan = 1800;
      else if (activeTimeframe === '1h') candleSpan = 3600;

      const remaining = candleSpan - (totalSeconds % candleSpan);
      setCandleSecondsRemaining(remaining);
    };

    updateTimeAndCandle();
    const timer = setInterval(updateTimeAndCandle, 1000);
    return () => clearInterval(timer);
  }, [activeTimeframe]);

  // Initial load
  useEffect(() => {
    refreshAssets();
    fetchCandles();
    fetchSignals();
    refreshPaperAccount();

    const assetInterval = setInterval(refreshAssets, 15000);
    const signalInterval = setInterval(fetchSignals, 30000);
    return () => {
      clearInterval(assetInterval);
      clearInterval(signalInterval);
    };
  }, [refreshAssets, fetchCandles, fetchSignals, refreshPaperAccount]);

  return (
    <TradingContext.Provider
      value={{
        language,
        setLanguage,
        t,
        theme,
        setTheme,
        activePage,
        setActivePage,
        activeSymbol,
        setActiveSymbol,
        activeCategory,
        setActiveCategory,
        activeTimeframe,
        setActiveTimeframe,
        assets,
        isLoadingAssets,
        refreshAssets,
        currentCandles,
        currentIndicators,
        isLoadingCandles,
        fetchCandles,
        signals,
        signalStats,
        fetchSignals,
        generateSignal,
        dhakaTime,
        candleSecondsRemaining,
        paperAccount,
        refreshPaperAccount,
        showTestModal,
        setShowTestModal,
      }}
    >
      {children}
    </TradingContext.Provider>
  );
};

export const useTrading = () => {
  const context = useContext(TradingContext);
  if (!context) {
    throw new Error('useTrading must be used within a TradingProvider');
  }
  return context;
};
