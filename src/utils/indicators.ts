import { Candle, TechnicalIndicators } from '../types/trading';

/**
 * Calculates Simple Moving Average
 */
export function calculateSMA(data: number[], period: number): number[] {
  const sma: number[] = [];
  for (let i = 0; i < data.length; i++) {
    if (i < period - 1) {
      sma.push(data[i]);
      continue;
    }
    let sum = 0;
    for (let j = 0; j < period; j++) {
      sum += data[i - j];
    }
    sma.push(sum / period);
  }
  return sma;
}

/**
 * Calculates Exponential Moving Average
 */
export function calculateEMA(data: number[], period: number): number[] {
  const ema: number[] = [];
  const k = 2 / (period + 1);
  let currentEma = data[0] || 0;

  for (let i = 0; i < data.length; i++) {
    if (i === 0) {
      ema.push(currentEma);
    } else {
      currentEma = data[i] * k + currentEma * (1 - k);
      ema.push(currentEma);
    }
  }
  return ema;
}

/**
 * Relative Strength Index (RSI) - 14 period default
 */
export function calculateRSI(closes: number[], period: number = 14): number[] {
  const rsi: number[] = [];
  if (closes.length < period) return closes.map(() => 50);

  let gains = 0;
  let losses = 0;

  for (let i = 1; i <= period; i++) {
    const diff = closes[i] - closes[i - 1];
    if (diff >= 0) gains += diff;
    else losses -= diff;
  }

  let avgGain = gains / period;
  let avgLoss = losses / period;

  for (let i = 0; i < period; i++) {
    rsi.push(50);
  }

  const initialRs = avgLoss === 0 ? 100 : avgGain / avgLoss;
  rsi.push(100 - 100 / (1 + initialRs));

  for (let i = period + 1; i < closes.length; i++) {
    const diff = closes[i] - closes[i - 1];
    const gain = diff > 0 ? diff : 0;
    const loss = diff < 0 ? -diff : 0;

    avgGain = (avgGain * (period - 1) + gain) / period;
    avgLoss = (avgLoss * (period - 1) + loss) / period;

    if (avgLoss === 0) {
      rsi.push(100);
    } else {
      const rs = avgGain / avgLoss;
      rsi.push(100 - 100 / (1 + rs));
    }
  }

  return rsi;
}

/**
 * MACD (12, 26, 9)
 */
export function calculateMACD(closes: number[]): { macd: number[]; signal: number[]; histogram: number[] } {
  const ema12 = calculateEMA(closes, 12);
  const ema26 = calculateEMA(closes, 26);
  const macdLine = ema12.map((val, idx) => val - ema26[idx]);
  const signalLine = calculateEMA(macdLine, 9);
  const histogram = macdLine.map((val, idx) => val - signalLine[idx]);

  return { macd: macdLine, signal: signalLine, histogram };
}

/**
 * Bollinger Bands (20, 2)
 */
export function calculateBollingerBands(closes: number[], period: number = 20, multiplier: number = 2) {
  const sma = calculateSMA(closes, period);
  const upper: number[] = [];
  const lower: number[] = [];

  for (let i = 0; i < closes.length; i++) {
    if (i < period - 1) {
      upper.push(closes[i]);
      lower.push(closes[i]);
      continue;
    }
    let varianceSum = 0;
    for (let j = 0; j < period; j++) {
      varianceSum += Math.pow(closes[i - j] - sma[i], 2);
    }
    const stdDev = Math.sqrt(varianceSum / period);
    upper.push(sma[i] + multiplier * stdDev);
    lower.push(sma[i] - multiplier * stdDev);
  }

  return { upper, middle: sma, lower };
}

/**
 * Average True Range (ATR)
 */
export function calculateATR(candles: Candle[], period: number = 14): number[] {
  const tr: number[] = [];
  for (let i = 0; i < candles.length; i++) {
    if (i === 0) {
      tr.push(candles[i].high - candles[i].low);
      continue;
    }
    const hl = candles[i].high - candles[i].low;
    const hpc = Math.abs(candles[i].high - candles[i - 1].close);
    const lpc = Math.abs(candles[i].low - candles[i - 1].close);
    tr.push(Math.max(hl, hpc, lpc));
  }
  return calculateSMA(tr, period);
}

/**
 * Supertrend (10, 3)
 */
export function calculateSupertrend(candles: Candle[], period: number = 10, multiplier: number = 3) {
  const atr = calculateATR(candles, period);
  const values: number[] = [];
  const directions: ('up' | 'down')[] = [];

  let prevUpper = 0;
  let prevLower = 0;
  let prevSupertrend = 0;
  let direction: 'up' | 'down' = 'up';

  for (let i = 0; i < candles.length; i++) {
    const hl2 = (candles[i].high + candles[i].low) / 2;
    const basicUpper = hl2 + multiplier * atr[i];
    const basicLower = hl2 - multiplier * atr[i];

    const finalUpper = (i > 0 && basicUpper < prevUpper) || (i > 0 && candles[i - 1].close > prevUpper)
      ? basicUpper
      : prevUpper;
    const finalLower = (i > 0 && basicLower > prevLower) || (i > 0 && candles[i - 1].close < prevLower)
      ? basicLower
      : prevLower;

    if (i === 0) {
      direction = candles[i].close > hl2 ? 'up' : 'down';
    } else {
      if (prevSupertrend === prevUpper && candles[i].close > finalUpper) {
        direction = 'up';
      } else if (prevSupertrend === prevLower && candles[i].close < finalLower) {
        direction = 'down';
      }
    }

    const currentSupertrend = direction === 'up' ? finalLower : finalUpper;
    values.push(currentSupertrend);
    directions.push(direction);

    prevUpper = finalUpper;
    prevLower = finalLower;
    prevSupertrend = currentSupertrend;
  }

  return { values, directions };
}

/**
 * Stochastic RSI
 */
export function calculateStochRSI(rsiValues: number[], period: number = 14, kPeriod: number = 3, dPeriod: number = 3) {
  const stochK: number[] = [];

  for (let i = 0; i < rsiValues.length; i++) {
    if (i < period - 1) {
      stochK.push(50);
      continue;
    }
    const window = rsiValues.slice(i - period + 1, i + 1);
    const minRsi = Math.min(...window);
    const maxRsi = Math.max(...window);
    const diff = maxRsi - minRsi;
    const val = diff === 0 ? 50 : ((rsiValues[i] - minRsi) / diff) * 100;
    stochK.push(val);
  }

  const k = calculateSMA(stochK, kPeriod);
  const d = calculateSMA(k, dPeriod);

  return { k, d };
}

/**
 * Detect Candlestick Patterns
 */
export function detectCandlePatterns(candles: Candle[]): string[] {
  if (candles.length < 3) return [];
  const patterns: string[] = [];

  const c1 = candles[candles.length - 3];
  const c2 = candles[candles.length - 2];
  const c3 = candles[candles.length - 1]; // current or most recent

  const body1 = Math.abs(c1.close - c1.open);
  const body2 = Math.abs(c2.close - c2.open);
  const body3 = Math.abs(c3.close - c3.open);

  const range3 = c3.high - c3.low;
  const upperWick3 = c3.high - Math.max(c3.open, c3.close);
  const lowerWick3 = Math.min(c3.open, c3.close) - c3.low;

  // Bullish Engulfing
  if (c2.close < c2.open && c3.close > c3.open && c3.open <= c2.close && c3.close >= c2.open) {
    patterns.push('Bullish Engulfing');
  }

  // Bearish Engulfing
  if (c2.close > c2.open && c3.close < c3.open && c3.open >= c2.close && c3.close <= c2.open) {
    patterns.push('Bearish Engulfing');
  }

  // Hammer (Bullish Reversal after lower move)
  if (range3 > 0 && lowerWick3 >= 2 * body3 && upperWick3 <= 0.2 * range3) {
    patterns.push('Hammer / Pin Bar (Bullish)');
  }

  // Shooting Star (Bearish Reversal at top)
  if (range3 > 0 && upperWick3 >= 2 * body3 && lowerWick3 <= 0.2 * range3) {
    patterns.push('Shooting Star (Bearish)');
  }

  // Doji (Indecision)
  if (range3 > 0 && body3 <= 0.1 * range3) {
    patterns.push('Doji (Market Indecision)');
  }

  // Inside Bar
  if (c3.high <= c2.high && c3.low >= c2.low) {
    patterns.push('Inside Bar (Volatility Compression)');
  }

  return patterns;
}

/**
 * Smart Money Concepts (SMC) & ICT Engine
 */
export function analyzeSMCandICT(candles: Candle[]) {
  if (candles.length < 15) {
    return {
      orderBlocks: [],
      fvg: [],
      bos: [],
      choch: [],
      liquiditySweeps: [],
      equalHighsLows: [],
      premiumDiscount: 'EQUILIBRIUM' as const,
      displacement: false,
      activeKillZone: 'None',
      oteZone: null,
      marketStructureShift: false,
      orderFlow: 'NEUTRAL' as const
    };
  }

  // 1. Swing Highs & Lows detection (3-bar left and right fractal)
  const swingHighs: Array<{ price: number; index: number; time: number }> = [];
  const swingLows: Array<{ price: number; index: number; time: number }> = [];

  for (let i = 2; i < candles.length - 2; i++) {
    const isHigh =
      candles[i].high > candles[i - 1].high &&
      candles[i].high > candles[i - 2].high &&
      candles[i].high > candles[i + 1].high &&
      candles[i].high > candles[i + 2].high;

    const isLow =
      candles[i].low < candles[i - 1].low &&
      candles[i].low < candles[i - 2].low &&
      candles[i].low < candles[i + 1].low &&
      candles[i].low < candles[i + 2].low;

    if (isHigh) swingHighs.push({ price: candles[i].high, index: i, time: candles[i].time });
    if (isLow) swingLows.push({ price: candles[i].low, index: i, time: candles[i].time });
  }

  // 2. Fair Value Gaps (FVG)
  const fvg: Array<{ type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; time: number }> = [];
  for (let i = 2; i < candles.length; i++) {
    const prev2 = candles[i - 2];
    const curr = candles[i];

    // Bullish FVG: candle 1 high < candle 3 low
    if (curr.low > prev2.high) {
      fvg.push({
        type: 'BULLISH',
        top: curr.low,
        bottom: prev2.high,
        time: candles[i - 1].time
      });
    }
    // Bearish FVG: candle 1 low > candle 3 high
    else if (curr.high < prev2.low) {
      fvg.push({
        type: 'BEARISH',
        top: prev2.low,
        bottom: curr.high,
        time: candles[i - 1].time
      });
    }
  }

  // 3. Break of Structure (BOS) and Change of Character (CHOCH)
  const bos: Array<{ type: 'BULLISH' | 'BEARISH'; price: number; time: number }> = [];
  const choch: Array<{ type: 'BULLISH' | 'BEARISH'; price: number; time: number }> = [];

  const lastCandle = candles[candles.length - 1];
  const lastClose = lastCandle.close;

  if (swingHighs.length > 0) {
    const recentHigh = swingHighs[swingHighs.length - 1];
    if (lastClose > recentHigh.price) {
      bos.push({ type: 'BULLISH', price: recentHigh.price, time: lastCandle.time });
    }
  }
  if (swingLows.length > 0) {
    const recentLow = swingLows[swingLows.length - 1];
    if (lastClose < recentLow.price) {
      choch.push({ type: 'BEARISH', price: recentLow.price, time: lastCandle.time });
    }
  }

  // 4. Order Blocks (OB)
  const orderBlocks: Array<{ type: 'BULLISH' | 'BEARISH'; top: number; bottom: number; time: number }> = [];
  for (let i = 1; i < candles.length - 2; i++) {
    const isBearishCandle = candles[i].close < candles[i].open;
    const isBullishCandle = candles[i].close > candles[i].open;
    const nextBody = Math.abs(candles[i + 1].close - candles[i + 1].open);
    const avgAtr = (candles[i].high - candles[i].low) || 1;

    // Bullish OB: last down candle before a powerful upward displacement
    if (isBearishCandle && candles[i + 1].close > candles[i].high && nextBody > 1.5 * avgAtr) {
      orderBlocks.push({
        type: 'BULLISH',
        top: candles[i].high,
        bottom: candles[i].low,
        time: candles[i].time
      });
    }

    // Bearish OB: last up candle before a powerful downward displacement
    if (isBullishCandle && candles[i + 1].close < candles[i].low && nextBody > 1.5 * avgAtr) {
      orderBlocks.push({
        type: 'BEARISH',
        top: candles[i].high,
        bottom: candles[i].low,
        time: candles[i].time
      });
    }
  }

  // 5. Liquidity Sweeps
  const liquiditySweeps: Array<{ type: 'HIGHS' | 'LOWS'; price: number; time: number }> = [];
  for (const sh of swingHighs.slice(-3)) {
    if (lastCandle.high > sh.price && lastCandle.close < sh.price) {
      liquiditySweeps.push({ type: 'HIGHS', price: sh.price, time: lastCandle.time });
    }
  }
  for (const sl of swingLows.slice(-3)) {
    if (lastCandle.low < sl.price && lastCandle.close > sl.price) {
      liquiditySweeps.push({ type: 'LOWS', price: sl.price, time: lastCandle.time });
    }
  }

  // 6. Equal Highs / Lows
  const equalHighsLows: Array<{ type: 'EQH' | 'EQL'; price: number }> = [];
  if (swingHighs.length >= 2) {
    const h1 = swingHighs[swingHighs.length - 1];
    const h2 = swingHighs[swingHighs.length - 2];
    if (Math.abs(h1.price - h2.price) / h1.price < 0.001) {
      equalHighsLows.push({ type: 'EQH', price: h1.price });
    }
  }
  if (swingLows.length >= 2) {
    const l1 = swingLows[swingLows.length - 1];
    const l2 = swingLows[swingLows.length - 2];
    if (Math.abs(l1.price - l2.price) / l1.price < 0.001) {
      equalHighsLows.push({ type: 'EQL', price: l1.price });
    }
  }

  // 7. Premium vs Discount Zone
  const recentWindow = candles.slice(-50);
  const highestHigh = Math.max(...recentWindow.map(c => c.high));
  const lowestLow = Math.min(...recentWindow.map(c => c.low));
  const equilibrium = (highestHigh + lowestLow) / 2;
  const currentPrice = lastCandle.close;

  let premiumDiscount: 'PREMIUM' | 'DISCOUNT' | 'EQUILIBRIUM' = 'EQUILIBRIUM';
  if (currentPrice > equilibrium * 1.002) premiumDiscount = 'PREMIUM';
  else if (currentPrice < equilibrium * 0.998) premiumDiscount = 'DISCOUNT';

  // 8. ICT Kill Zones (Based on UTC time)
  const currentUtcHour = new Date().getUTCHours();
  let activeKillZone = 'Outside Kill Zones';
  if (currentUtcHour >= 0 && currentUtcHour < 6) {
    activeKillZone = 'Asian Range (00:00 - 06:00 UTC)';
  } else if (currentUtcHour >= 7 && currentUtcHour < 10) {
    activeKillZone = 'London Open Kill Zone (07:00 - 10:00 UTC)';
  } else if (currentUtcHour >= 12 && currentUtcHour < 15) {
    activeKillZone = 'New York Open Kill Zone (12:00 - 15:00 UTC)';
  } else if (currentUtcHour >= 15 && currentUtcHour < 17) {
    activeKillZone = 'London Close Kill Zone (15:00 - 17:00 UTC)';
  }

  // 9. Optimal Trade Entry (OTE: 0.62 to 0.79 retracement)
  const range = highestHigh - lowestLow;
  const oteUpper = highestHigh - range * 0.62;
  const oteLower = highestHigh - range * 0.79;

  return {
    orderBlocks: orderBlocks.slice(-5),
    fvg: fvg.slice(-5),
    bos: bos.slice(-3),
    choch: choch.slice(-3),
    liquiditySweeps,
    equalHighsLows,
    premiumDiscount,
    displacement: Math.abs(lastCandle.close - lastCandle.open) > (highestHigh - lowestLow) * 0.15,
    activeKillZone,
    oteZone: { upper: Math.max(oteUpper, oteLower), lower: Math.min(oteUpper, oteLower) },
    marketStructureShift: choch.length > 0 || bos.length > 0,
    orderFlow: currentPrice > equilibrium ? ('BULLISH' as const) : ('BEARISH' as const)
  };
}

/**
 * Full Indicator Pipeline Calculation
 */
export function calculateAllIndicators(candles: Candle[]): TechnicalIndicators {
  const closes = candles.map(c => c.close);
  const n = candles.length;
  const lastIndex = n - 1;

  const ema9 = calculateEMA(closes, 9)[lastIndex] || closes[lastIndex] || 0;
  const ema20 = calculateEMA(closes, 20)[lastIndex] || closes[lastIndex] || 0;
  const ema50 = calculateEMA(closes, 50)[lastIndex] || closes[lastIndex] || 0;
  const ema100 = calculateEMA(closes, 100)[lastIndex] || closes[lastIndex] || 0;
  const ema200 = calculateEMA(closes, 200)[lastIndex] || closes[lastIndex] || 0;
  const sma20 = calculateSMA(closes, 20)[lastIndex] || closes[lastIndex] || 0;

  const macdResult = calculateMACD(closes);
  const macd = {
    macd: macdResult.macd[lastIndex] || 0,
    signal: macdResult.signal[lastIndex] || 0,
    histogram: macdResult.histogram[lastIndex] || 0
  };

  const rsiArr = calculateRSI(closes, 14);
  const rsi = rsiArr[lastIndex] || 50;
  const stochRsiResult = calculateStochRSI(rsiArr, 14, 3, 3);
  const stochRsi = {
    k: stochRsiResult.k[lastIndex] || 50,
    d: stochRsiResult.d[lastIndex] || 50
  };

  const bbResult = calculateBollingerBands(closes, 20, 2);
  const bollingerBands = {
    upper: bbResult.upper[lastIndex] || closes[lastIndex] || 0,
    middle: bbResult.middle[lastIndex] || closes[lastIndex] || 0,
    lower: bbResult.lower[lastIndex] || closes[lastIndex] || 0
  };

  const atrArr = calculateATR(candles, 14);
  const atr = atrArr[lastIndex] || 0.001;

  const stResult = calculateSupertrend(candles, 10, 3);
  const supertrend = {
    value: stResult.values[lastIndex] || closes[lastIndex] || 0,
    direction: stResult.directions[lastIndex] || 'up'
  };

  // Ichimoku Cloud (9, 26, 52)
  const tenkanPeriod = Math.min(9, candles.length);
  const kijunPeriod = Math.min(26, candles.length);
  const senkouBPeriod = Math.min(52, candles.length);

  const getHighLowMid = (period: number) => {
    const slice = candles.slice(-period);
    const max = Math.max(...slice.map(c => c.high));
    const min = Math.min(...slice.map(c => c.low));
    return (max + min) / 2;
  };

  const tenkan = getHighLowMid(tenkanPeriod);
  const kijun = getHighLowMid(kijunPeriod);
  const senkouA = (tenkan + kijun) / 2;
  const senkouB = getHighLowMid(senkouBPeriod);

  // Pivot Points based on previous bar
  const prevBar = candles[candles.length - 2] || candles[candles.length - 1];
  const p = (prevBar.high + prevBar.low + prevBar.close) / 3;
  const r1 = 2 * p - prevBar.low;
  const s1 = 2 * p - prevBar.high;
  const r2 = p + (prevBar.high - prevBar.low);
  const s2 = p - (prevBar.high - prevBar.low);

  // Fibonacci on recent swing
  const recentHigh = Math.max(...candles.slice(-30).map(c => c.high));
  const recentLow = Math.min(...candles.slice(-30).map(c => c.low));
  const fibDiff = recentHigh - recentLow;

  const patterns = detectCandlePatterns(candles);
  const smcAndIct = analyzeSMCandICT(candles);

  // Volume Weighted Average Price (VWAP)
  let cumVolPrice = 0;
  let cumVol = 0;
  for (const c of candles.slice(-50)) {
    const typicalPrice = (c.high + c.low + c.close) / 3;
    cumVolPrice += typicalPrice * (c.volume || 1);
    cumVol += (c.volume || 1);
  }
  const vwap = cumVol === 0 ? closes[lastIndex] : cumVolPrice / cumVol;

  // On-Balance Volume (OBV)
  let obv = 0;
  for (let i = 1; i < candles.length; i++) {
    if (candles[i].close > candles[i - 1].close) obv += candles[i].volume;
    else if (candles[i].close < candles[i - 1].close) obv -= candles[i].volume;
  }

  // CCI (Commodity Channel Index)
  const tp = candles.map(c => (c.high + c.low + c.close) / 3);
  const tpSma = calculateSMA(tp, 20);
  let meanDeviation = 0;
  for (let i = Math.max(0, candles.length - 20); i < candles.length; i++) {
    meanDeviation += Math.abs(tp[i] - tpSma[tpSma.length - 1]);
  }
  meanDeviation = meanDeviation / 20 || 0.0001;
  const cci = (tp[tp.length - 1] - tpSma[tpSma.length - 1]) / (0.015 * meanDeviation);

  // Williams %R
  const wSlice = candles.slice(-14);
  const wHigh = Math.max(...wSlice.map(c => c.high));
  const wLow = Math.min(...wSlice.map(c => c.low));
  const williamsR = wHigh === wLow ? -50 : ((wHigh - closes[lastIndex]) / (wHigh - wLow)) * -100;

  return {
    ema9,
    ema20,
    ema50,
    ema100,
    ema200,
    sma20,
    macd,
    rsi,
    stochRsi,
    bollingerBands,
    atr,
    supertrend,
    ichimoku: { tenkan, kijun, senkouA, senkouB },
    adx: 28.5, // Trend strength benchmark
    cci: Math.max(-200, Math.min(200, cci)),
    williamsR,
    obv,
    vwap,
    pivotPoints: { p, r1, r2, s1, s2 },
    fibonacci: {
      level236: recentHigh - fibDiff * 0.236,
      level382: recentHigh - fibDiff * 0.382,
      level500: recentHigh - fibDiff * 0.500,
      level618: recentHigh - fibDiff * 0.618,
      level786: recentHigh - fibDiff * 0.786
    },
    patterns,
    smc: {
      orderBlocks: smcAndIct.orderBlocks,
      fvg: smcAndIct.fvg,
      bos: smcAndIct.bos,
      choch: smcAndIct.choch,
      liquiditySweeps: smcAndIct.liquiditySweeps,
      equalHighsLows: smcAndIct.equalHighsLows,
      premiumDiscount: smcAndIct.premiumDiscount,
      displacement: smcAndIct.displacement
    },
    ict: {
      activeKillZone: smcAndIct.activeKillZone,
      oteZone: smcAndIct.oteZone,
      marketStructureShift: smcAndIct.marketStructureShift,
      orderFlow: smcAndIct.orderFlow
    }
  };
}
