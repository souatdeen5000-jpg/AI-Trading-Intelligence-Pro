export type MarketCategory = 'forex' | 'gold' | 'crypto' | 'binary' | 'otc';

export type Timeframe = '1m' | '2m' | '3m' | '5m' | '10m' | '15m' | '30m' | '1h' | '4h' | '1d';

export interface Candle {
  time: number; // UTC unix ms
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export type SignalType = 'BUY' | 'SELL' | 'CALL' | 'PUT';
export type SignalMode = 'A_PLUS' | 'NORMAL';
export type SignalStatus = 'WAITING' | 'ACTIVE' | 'WON' | 'LOST' | 'EXPIRED' | 'CANCELLED' | 'NO_TRADE';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type DataQuality = 'LIVE_HIGH_FREQ' | 'STREAMING' | 'INTERPOLATED_OTC' | 'UNAVAILABLE';

export interface MarketAsset {
  symbol: string;
  name: string;
  category: MarketCategory;
  price: number;
  change24h: number;
  high24h: number;
  low24h: number;
  volume24h: number;
  provider: string;
  dataQuality: DataQuality;
  lastUpdated: number;
  isOtcSimulated?: boolean;
}

export interface TradingSignal {
  id: string;
  assetName: string;
  category: MarketCategory;
  pair: string;
  type: SignalType;
  mode: SignalMode;
  entryPrice: number;
  stopLoss?: number;
  takeProfit1?: number;
  takeProfit2?: number;
  takeProfit3?: number;
  timeframe: Timeframe;
  generatedAt: number;
  candleOpenTime: number;
  candleCloseTime: number;
  entryTimeFormatted?: string; // e.g. "11:35:00 AM (UTC+6)"
  entryTimeDhaka?: string;
  suggestedEntryAction?: string; // e.g. "Enter at the exact opening of next candle"
  suggestedEntryWindow?: string; // e.g. "11:35:00 AM - 11:35:30 AM (UTC+6)"
  expiryTime?: number; // For Binary
  localTimeDhaka: string; // UTC+6
  confidenceScore: number; // 0 - 100
  confirmations: string[];
  riskAssessment: RiskLevel;
  explanation: string;
  explanationBn?: string;
  dataSource: string;
  status: SignalStatus;
  resolvedAt?: number;
  exitPrice?: number;
  pnl?: number;
}

export interface TechnicalIndicators {
  ema9: number;
  ema20: number;
  ema50: number;
  ema100: number;
  ema200: number;
  sma20: number;
  macd: {
    macd: number;
    signal: number;
    histogram: number;
  };
  rsi: number;
  stochRsi: {
    k: number;
    d: number;
  };
  bollingerBands: {
    upper: number;
    middle: number;
    lower: number;
  };
  atr: number;
  supertrend: {
    value: number;
    direction: 'up' | 'down';
  };
  ichimoku: {
    tenkan: number;
    kijun: number;
    senkouA: number;
    senkouB: number;
  };
  adx: number;
  cci: number;
  williamsR: number;
  obv: number;
  vwap: number;
  pivotPoints: {
    p: number;
    r1: number;
    r2: number;
    s1: number;
    s2: number;
  };
  fibonacci: {
    level236: number;
    level382: number;
    level500: number;
    level618: number;
    level786: number;
  };
  patterns: string[];
  smc: {
    orderBlocks: Array<{
      type: 'BULLISH' | 'BEARISH';
      top: number;
      bottom: number;
      time: number;
    }>;
    fvg: Array<{
      type: 'BULLISH' | 'BEARISH';
      top: number;
      bottom: number;
      time: number;
    }>;
    bos: Array<{
      type: 'BULLISH' | 'BEARISH';
      price: number;
      time: number;
    }>;
    choch: Array<{
      type: 'BULLISH' | 'BEARISH';
      price: number;
      time: number;
    }>;
    liquiditySweeps: Array<{
      type: 'HIGHS' | 'LOWS';
      price: number;
      time: number;
    }>;
    equalHighsLows: Array<{
      type: 'EQH' | 'EQL';
      price: number;
    }>;
    premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM';
    displacement: boolean;
  };
  ict: {
    activeKillZone: string;
    oteZone: {
      upper: number;
      lower: number;
    } | null;
    marketStructureShift: boolean;
    orderFlow: 'BULLISH' | 'BEARISH' | 'NEUTRAL';
  };
}

export interface PaperTrade {
  id: string;
  symbol: string;
  category: MarketCategory;
  type: SignalType;
  entryPrice: number;
  currentPrice: number;
  amount: number;
  leverage?: number;
  stopLoss?: number;
  takeProfit?: number;
  expiryMinutes?: number;
  openTime: number;
  closeTime?: number;
  status: 'OPEN' | 'WON' | 'LOST' | 'CLOSED';
  pnl: number;
  mode: 'A_PLUS' | 'NORMAL' | 'MANUAL';
  exitPrice?: number;
}

export interface BacktestTrade {
  id: string;
  entryTime: number;
  exitTime: number;
  type: SignalType;
  entryPrice: number;
  exitPrice: number;
  pnlPct: number;
  isWin: boolean;
  reason: string;
}

export interface BacktestResult {
  symbol: string;
  timeframe: Timeframe;
  strategy: string;
  initialBalance: number;
  finalBalance: number;
  totalTrades: number;
  wins: number;
  losses: number;
  winRate: number;
  profitFactor: number;
  maxDrawdown: number;
  avgRewardRisk: number;
  trades: BacktestTrade[];
}

export interface ScreenshotAnalysisResult {
  success: boolean;
  interpretation: string;
  marketTrend: 'STRONG_BULLISH' | 'BULLISH' | 'NEUTRAL' | 'BEARISH' | 'STRONG_BEARISH';
  action: 'BUY' | 'SELL' | 'CALL' | 'PUT' | 'NO_TRADE';
  entryZone: string;
  suggestedTimeframe: string;
  confidenceScore: number;
  riskWarning: string;
  detectedCandles: string[];
  detectedIndicators: string[];
  supportResistance: {
    support: string[];
    resistance: string[];
  };
  smcIctNotes: string[];
  isBlurryOrIncomplete: boolean;
  explanationEn: string;
  explanationBn: string;
}

export interface CompoundingStep {
  step: number;
  stake: number;
  payoutPct: number;
  winProfit: number;
  totalBalanceAfterWin: number;
}

export interface ApiConfigState {
  hasGeminiKey: boolean;
  twelveDataKeySet: boolean;
  binancePublicConnected: boolean;
  twelveDataConnected: boolean;
  geminiConnected: boolean;
  lastTestTimestamp: number | null;
  rateLimitStatus: string;
  errors: string[];
}
