import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Candle, Timeframe, TechnicalIndicators } from '../../types/trading';
import { useTrading } from '../../context/TradingContext';
import { Maximize2, Minimize2, Eye, EyeOff, Layers, Activity, RefreshCw } from 'lucide-react';

interface TradingChartProps {
  candles: Candle[];
  indicators?: TechnicalIndicators | null;
  symbol: string;
  timeframe: Timeframe;
  onTimeframeChange?: (tf: Timeframe) => void;
  height?: number;
}

export const TradingChart: React.FC<TradingChartProps> = ({
  candles,
  indicators,
  symbol,
  timeframe,
  onTimeframeChange,
  height = 460,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { t, fetchCandles, isLoadingCandles } = useTrading();

  // Overlay toggles
  const [showEma, setShowEma] = useState(true);
  const [showBb, setShowBb] = useState(false);
  const [showVolume, setShowVolume] = useState(true);
  const [showSmc, setShowSmc] = useState(true);

  // Crosshair state
  const [hoverData, setHoverData] = useState<{
    candle: Candle | null;
    x: number;
    y: number;
    price: number;
  } | null>(null);

  const timeframes: Timeframe[] = ['1m', '3m', '5m', '15m', '30m', '1h', '4h', '1d'];

  // Render Canvas Chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const canvasHeight = canvas.height;

    // Clear canvas
    ctx.clearRect(0, 0, width, canvasHeight);

    // Padding dimensions
    const paddingRight = 75; // for price axis
    const paddingBottom = 28; // for time axis
    const paddingTop = 15;
    const paddingLeft = 10;

    const chartWidth = width - paddingRight - paddingLeft;
    const chartHeight = canvasHeight - paddingBottom - paddingTop;
    const volumeHeight = showVolume ? chartHeight * 0.2 : 0;
    const mainChartHeight = chartHeight - volumeHeight;

    // Find Price Bounds
    const prices = candles.flatMap(c => [c.high, c.low]);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);

    // Add a 5% buffer to price range
    const priceBuffer = (maxPrice - minPrice) * 0.05 || 0.001;
    minPrice -= priceBuffer;
    maxPrice += priceBuffer;
    const priceRange = maxPrice - minPrice || 1;

    // Max volume for volume bars
    const maxVolume = Math.max(...candles.map(c => c.volume || 1), 1);

    // Coordinate conversions
    const getY = (price: number) => {
      return paddingTop + (1 - (price - minPrice) / priceRange) * mainChartHeight;
    };

    const getPriceFromY = (y: number) => {
      const normalized = 1 - (y - paddingTop) / mainChartHeight;
      return minPrice + normalized * priceRange;
    };

    const candleWidth = chartWidth / candles.length;
    const barWidth = Math.max(2, candleWidth * 0.7);

    // 1. Draw Grid lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
    ctx.lineWidth = 1;

    // Horizontal Price Grid (5 levels)
    const gridSteps = 5;
    ctx.fillStyle = '#64748b';
    ctx.font = '10px JetBrains Mono, monospace';
    ctx.textAlign = 'left';

    for (let i = 0; i <= gridSteps; i++) {
      const y = paddingTop + (mainChartHeight / gridSteps) * i;
      const priceVal = maxPrice - (priceRange / gridSteps) * i;

      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();

      // Price labels on the right
      ctx.fillText(priceVal >= 100 ? priceVal.toFixed(2) : priceVal.toFixed(5), width - paddingRight + 6, y + 3);
    }

    // 2. Draw SMC Fair Value Gaps (FVG) and Order Blocks (OB)
    if (showSmc && indicators?.smc) {
      // Draw Bullish & Bearish Order Blocks
      for (const ob of indicators.smc.orderBlocks) {
        const yTop = getY(ob.top);
        const yBottom = getY(ob.bottom);
        const h = Math.abs(yBottom - yTop) || 4;

        ctx.fillStyle = ob.type === 'BULLISH' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)';
        ctx.strokeStyle = ob.type === 'BULLISH' ? 'rgba(16, 185, 129, 0.4)' : 'rgba(239, 68, 68, 0.4)';
        ctx.fillRect(paddingLeft, Math.min(yTop, yBottom), chartWidth, h);
        ctx.strokeRect(paddingLeft, Math.min(yTop, yBottom), chartWidth, h);

        ctx.fillStyle = ob.type === 'BULLISH' ? '#10b981' : '#ef4444';
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(ob.type === 'BULLISH' ? 'SMC Bullish OB' : 'SMC Bearish OB', paddingLeft + 8, Math.min(yTop, yBottom) + 12);
      }

      // Draw Fair Value Gaps
      for (const fvg of indicators.smc.fvg) {
        const yTop = getY(fvg.top);
        const yBottom = getY(fvg.bottom);
        const h = Math.abs(yBottom - yTop) || 3;

        ctx.fillStyle = fvg.type === 'BULLISH' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(244, 63, 94, 0.12)';
        ctx.fillRect(width * 0.4, Math.min(yTop, yBottom), chartWidth * 0.6, h);
      }
    }

    // 3. Draw Bollinger Bands
    if (showBb && indicators?.bollingerBands) {
      const upperY = getY(indicators.bollingerBands.upper);
      const middleY = getY(indicators.bollingerBands.middle);
      const lowerY = getY(indicators.bollingerBands.lower);

      ctx.strokeStyle = 'rgba(168, 85, 247, 0.6)';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);

      // Upper
      ctx.beginPath();
      ctx.moveTo(paddingLeft, upperY);
      ctx.lineTo(width - paddingRight, upperY);
      ctx.stroke();

      // Lower
      ctx.beginPath();
      ctx.moveTo(paddingLeft, lowerY);
      ctx.lineTo(width - paddingRight, lowerY);
      ctx.stroke();

      // Middle (SMA 20)
      ctx.strokeStyle = 'rgba(168, 85, 247, 0.8)';
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, middleY);
      ctx.lineTo(width - paddingRight, middleY);
      ctx.stroke();
    }

    // 4. Draw Candlesticks & Volume
    candles.forEach((candle, index) => {
      const x = paddingLeft + index * candleWidth + candleWidth / 2;
      const isBullish = candle.close >= candle.open;

      const openY = getY(candle.open);
      const closeY = getY(candle.close);
      const highY = getY(candle.high);
      const lowY = getY(candle.low);

      const color = isBullish ? '#10b981' : '#ef4444';

      // Draw Volume Bar if enabled
      if (showVolume) {
        const volRatio = (candle.volume || 1) / maxVolume;
        const vHeight = volRatio * volumeHeight;
        const vY = canvasHeight - paddingBottom - vHeight;

        ctx.fillStyle = isBullish ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)';
        ctx.fillRect(x - barWidth / 2, vY, barWidth, vHeight);
      }

      // Draw Candle Wick
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw Candle Body
      const bodyTop = Math.min(openY, closeY);
      const bodyHeight = Math.max(1.5, Math.abs(closeY - openY));

      ctx.fillStyle = color;
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyHeight);
    });

    // 5. Draw EMA Trend Lines (EMA 9, 20, 50, 200)
    if (showEma && indicators) {
      const drawEmaLine = (price: number, strokeColor: string, label: string) => {
        const y = getY(price);
        if (y < paddingTop || y > canvasHeight - paddingBottom) return;

        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(paddingLeft, y);
        ctx.lineTo(width - paddingRight, y);
        ctx.stroke();
        ctx.setLineDash([]);

        ctx.fillStyle = strokeColor;
        ctx.font = '9px JetBrains Mono, monospace';
        ctx.fillText(label, width - paddingRight + 4, y + 3);
      };

      if (indicators.ema9) drawEmaLine(indicators.ema9, '#06b6d4', 'EMA 9');
      if (indicators.ema20) drawEmaLine(indicators.ema20, '#eab308', 'EMA 20');
      if (indicators.ema50) drawEmaLine(indicators.ema50, '#a855f7', 'EMA 50');
      if (indicators.ema200) drawEmaLine(indicators.ema200, '#f97316', 'EMA 200');
    }

    // 6. Draw Current Price Marker Line
    if (candles.length > 0) {
      const lastCandle = candles[candles.length - 1];
      const lastPrice = lastCandle.close;
      const lastY = getY(lastPrice);
      const isBull = lastCandle.close >= lastCandle.open;
      const tagColor = isBull ? '#10b981' : '#ef4444';

      ctx.strokeStyle = tagColor;
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(paddingLeft, lastY);
      ctx.lineTo(width - paddingRight, lastY);
      ctx.stroke();
      ctx.setLineDash([]);

      // Current Price Badge on Axis
      ctx.fillStyle = tagColor;
      ctx.fillRect(width - paddingRight, lastY - 9, paddingRight - 4, 18);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 10px JetBrains Mono, monospace';
      ctx.fillText(lastPrice >= 100 ? lastPrice.toFixed(2) : lastPrice.toFixed(4), width - paddingRight + 5, lastY + 4);
    }

    // 7. Draw Crosshair if hovering
    if (hoverData) {
      const { x, y, price, candle } = hoverData;

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([4, 4]);

      // Vertical line
      ctx.beginPath();
      ctx.moveTo(x, paddingTop);
      ctx.lineTo(x, canvasHeight - paddingBottom);
      ctx.stroke();

      // Horizontal line
      ctx.beginPath();
      ctx.moveTo(paddingLeft, y);
      ctx.lineTo(width - paddingRight, y);
      ctx.stroke();
      ctx.setLineDash([]);

      // Price Tag on right
      ctx.fillStyle = '#334155';
      ctx.fillRect(width - paddingRight, y - 8, paddingRight - 4, 16);
      ctx.fillStyle = '#f8fafc';
      ctx.font = '10px JetBrains Mono, monospace';
      ctx.fillText(price >= 100 ? price.toFixed(2) : price.toFixed(4), width - paddingRight + 5, y + 4);

      // Time tag on bottom
      if (candle) {
        const timeStr = new Date(candle.time).toLocaleTimeString('en-US', {
          timeZone: 'Asia/Dhaka',
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        });
        const tagW = 55;
        ctx.fillStyle = '#334155';
        ctx.fillRect(x - tagW / 2, canvasHeight - paddingBottom + 2, tagW, 16);
        ctx.fillStyle = '#f8fafc';
        ctx.font = '10px JetBrains Mono, monospace';
        ctx.textAlign = 'center';
        ctx.fillText(timeStr, x, canvasHeight - paddingBottom + 14);
        ctx.textAlign = 'left';
      }
    }
  }, [candles, indicators, showEma, showBb, showVolume, showSmc, hoverData]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      canvas.width = container.clientWidth * window.devicePixelRatio;
      canvas.height = height * window.devicePixelRatio;
      canvas.style.width = `${container.clientWidth}px`;
      canvas.style.height = `${height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    handleResize();
    const observer = new ResizeObserver(handleResize);
    if (containerRef.current) observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [height]);

  // Mouse Move for Crosshair
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || candles.length === 0) return;

    const rect = canvas.getBoundingClientRect();
    const clientX = e.clientX - rect.left;
    const clientY = e.clientY - rect.top;

    const paddingRight = 75;
    const paddingLeft = 10;
    const paddingTop = 15;
    const paddingBottom = 28;
    const chartWidth = canvas.clientWidth - paddingRight - paddingLeft;
    const mainChartHeight = canvas.clientHeight - paddingBottom - paddingTop;

    if (clientX < paddingLeft || clientX > canvas.clientWidth - paddingRight || clientY < paddingTop || clientY > canvas.clientHeight - paddingBottom) {
      setHoverData(null);
      return;
    }

    const candleWidth = chartWidth / candles.length;
    const candleIndex = Math.floor((clientX - paddingLeft) / candleWidth);
    const candle = candles[Math.max(0, Math.min(candles.length - 1, candleIndex))];

    const prices = candles.flatMap(c => [c.high, c.low]);
    let minPrice = Math.min(...prices);
    let maxPrice = Math.max(...prices);
    const priceBuffer = (maxPrice - minPrice) * 0.05 || 0.001;
    minPrice -= priceBuffer;
    maxPrice += priceBuffer;
    const priceRange = maxPrice - minPrice || 1;

    const normalized = 1 - (clientY - paddingTop) / mainChartHeight;
    const price = minPrice + normalized * priceRange;

    setHoverData({
      candle,
      x: clientX,
      y: clientY,
      price,
    });
  };

  const handleMouseLeave = () => {
    setHoverData(null);
  };

  const activeCandle = hoverData?.candle || (candles.length > 0 ? candles[candles.length - 1] : null);

  return (
    <div className="flex flex-col rounded-xl border border-slate-800 bg-[#0d131f] shadow-2xl overflow-hidden" ref={containerRef}>
      {/* Top Chart Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-slate-800/80 px-4 py-2.5 bg-slate-900/60 text-xs">
        {/* Symbol & Timeframe controls */}
        <div className="flex items-center gap-2">
          <span className="font-bold text-white tracking-wide text-sm flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            {symbol}
          </span>
          <div className="h-4 w-[1px] bg-slate-800 mx-1"></div>

          {/* Timeframes */}
          <div className="flex items-center bg-slate-950/70 rounded-lg p-0.5 border border-slate-800">
            {timeframes.map(tf => (
              <button
                key={tf}
                onClick={() => onTimeframeChange?.(tf)}
                className={`px-2 py-1 rounded font-medium transition-all ${
                  timeframe === tf
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>

          <button
            onClick={() => fetchCandles()}
            disabled={isLoadingCandles}
            className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition"
            title="Refresh Candles"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isLoadingCandles ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>

        {/* Technical Overlays Toggles */}
        <div className="flex items-center gap-2 mt-1 sm:mt-0">
          <button
            onClick={() => setShowEma(!showEma)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition border ${
              showEma ? 'bg-cyan-950/40 text-cyan-400 border-cyan-800/50' : 'text-slate-500 border-transparent hover:text-slate-400'
            }`}
          >
            EMA (9/20/50)
          </button>

          <button
            onClick={() => setShowSmc(!showSmc)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition border ${
              showSmc ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/50' : 'text-slate-500 border-transparent hover:text-slate-400'
            }`}
          >
            SMC / FVG
          </button>

          <button
            onClick={() => setShowBb(!showBb)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition border ${
              showBb ? 'bg-purple-950/40 text-purple-400 border-purple-800/50' : 'text-slate-500 border-transparent hover:text-slate-400'
            }`}
          >
            Bollinger
          </button>

          <button
            onClick={() => setShowVolume(!showVolume)}
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11px] font-mono transition border ${
              showVolume ? 'bg-amber-950/40 text-amber-400 border-amber-800/50' : 'text-slate-500 border-transparent hover:text-slate-400'
            }`}
          >
            Volume
          </button>
        </div>
      </div>

      {/* OHLCV Legend Bar */}
      {activeCandle && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 px-4 py-1.5 bg-[#090d16] border-b border-slate-800/50 text-[11px] font-mono-numbers">
          <span className="text-slate-400">
            O: <span className="text-slate-200">{activeCandle.open >= 100 ? activeCandle.open.toFixed(2) : activeCandle.open.toFixed(4)}</span>
          </span>
          <span className="text-slate-400">
            H: <span className="text-emerald-400">{activeCandle.high >= 100 ? activeCandle.high.toFixed(2) : activeCandle.high.toFixed(4)}</span>
          </span>
          <span className="text-slate-400">
            L: <span className="text-rose-400">{activeCandle.low >= 100 ? activeCandle.low.toFixed(2) : activeCandle.low.toFixed(4)}</span>
          </span>
          <span className="text-slate-400">
            C: <span className={activeCandle.close >= activeCandle.open ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
              {activeCandle.close >= 100 ? activeCandle.close.toFixed(2) : activeCandle.close.toFixed(4)}
            </span>
          </span>
          <span className="text-slate-400">
            Vol: <span className="text-slate-300">{(activeCandle.volume || 0).toLocaleString()}</span>
          </span>
          {indicators && (
            <span className="hidden md:inline text-slate-500">
              | RSI(14): <span className="text-amber-400">{indicators.rsi.toFixed(1)}</span>
            </span>
          )}
          {indicators?.ict && (
            <span className="hidden lg:inline text-slate-500">
              | ICT: <span className="text-sky-400">{indicators.ict.activeKillZone.split(' ')[0]}</span>
            </span>
          )}
        </div>
      )}

      {/* Canvas Element */}
      <div className="relative w-full cursor-crosshair bg-[#080b11]">
        <canvas
          ref={canvasRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          className="block w-full"
        />
      </div>
    </div>
  );
};
