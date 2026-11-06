import React, { useState, useRef, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { Bot, Send, User, Sparkles, AlertTriangle, ArrowRight, Layers, Clock } from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export const AiSupport: React.FC = () => {
  const { t, language, activeSymbol, assets, currentIndicators, dhakaTime } = useTrading();

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      sender: 'ai',
      text:
        language === 'bn'
          ? `স্বাগতম! আমি আপনার AI ট্রেডিং সহকারী এবং কোয়ান্টিটেটিভ মেন্টর। আপনি ফরেক্স, গোল্ড, ক্রিপ্টো, বাইনারি বা ওটিসি মার্কেট সম্পর্কে যেকোনো প্রশ্ন করতে পারেন। আমি আইসিটি (ICT), এসএমসি (SMC) এবং টেকনিক্যাল ইন্ডিকেটর বিস্তারিতভাবে ধাপে ধাপে বাংলায় ব্যাখ্যা করব।`
          : `Welcome! I am your AI Trading Quantitative Assistant & ICT/SMC Mentor. You can ask me any questions regarding Forex, Gold (XAU/USD), Crypto, Binary Options or OTC setups. I will explain market structures, Fair Value Gaps, Order Blocks, and risk management step-by-step.`,
      timestamp: dhakaTime,
    },
  ]);
  const [isSending, setIsSending] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isSending) return;

    const userText = inputMessage.trim();
    setInputMessage('');

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: dhakaTime,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsSending(true);

    try {
      const activeAsset = assets.find(a => a.symbol === activeSymbol);
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          context: {
            symbol: activeSymbol,
            price: activeAsset?.price,
            trend: currentIndicators ? (currentIndicators.ema9 > currentIndicators.ema20 ? 'BULLISH' : 'BEARISH') : 'NEUTRAL',
            killZone: currentIndicators?.ict.activeKillZone,
          },
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        const aiMsg: ChatMessage = {
          id: `ai-${Date.now()}`,
          sender: 'ai',
          text: data.reply,
          timestamp: data.dhakaTime || dhakaTime,
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const errorMsg: ChatMessage = {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: data.error || (language === 'bn' ? 'দুঃখিত, প্রতিক্রিয়া পেতে সমস্যা হয়েছে।' : 'Sorry, could not generate response at this time.'),
          timestamp: dhakaTime,
        };
        setMessages(prev => [...prev, errorMsg]);
      }
    } catch (e: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `ai-err-${Date.now()}`,
          sender: 'ai',
          text: 'Network connectivity error. Please ensure GEMINI_API_KEY is configured.',
          timestamp: dhakaTime,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  };

  const quickPrompts = [
    language === 'bn' ? 'এসএমসি (SMC) অর্ডার ব্লক কীভাবে কাজ করে?' : 'How does an SMC Order Block work?',
    language === 'bn' ? 'গোল্ডে (XAU/USD) কীভাবে লিকুইডিটি সুইপ শনাক্ত করব?' : 'How to identify Liquidity Sweeps in Gold (XAU/USD)?',
    language === 'bn' ? 'বাইনারিতে ৩-স্টেপ কম্পাউন্ডিংয়ের ঝুঁকি কী?' : 'What are the strict risks of 3-step compounding in binary?',
    language === 'bn' ? 'আইসিটি ওটিই (ICT OTE) ৬২-৭৯% রিট্রেসমেন্ট বুঝিয়ে বলুন' : 'Explain ICT Optimal Trade Entry (OTE 62%-79%)',
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <Bot className="h-6 w-6 text-emerald-400" />
            {t.support.title}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            {t.support.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
          <span className="text-slate-300">Active Asset Context: {activeSymbol}</span>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="rounded-xl border border-slate-800 bg-[#0d131f] flex flex-col h-[600px] shadow-2xl overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex gap-3 max-w-3xl ${msg.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div
                className={`h-8 w-8 rounded-lg shrink-0 flex items-center justify-center ${
                  msg.sender === 'user' ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-emerald-400'
                }`}
              >
                {msg.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
              </div>

              <div
                className={`rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                  msg.sender === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none whitespace-pre-wrap'
                }`}
              >
                <p>{msg.text}</p>
                <span className="block mt-1.5 text-[9px] text-slate-400 font-mono text-right">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          ))}

          {isSending && (
            <div className="flex gap-3 max-w-xl">
              <div className="h-8 w-8 rounded-lg bg-slate-800 text-emerald-400 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-tl-none bg-slate-900 border border-slate-800 p-3.5 text-xs text-slate-400 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span>Thinking & calculating market context...</span>
              </div>
            </div>
          )}

          <div ref={chatBottomRef} />
        </div>

        {/* Quick Prompts Bar */}
        <div className="border-t border-slate-800/80 px-4 py-2 bg-slate-950/40 flex items-center gap-2 overflow-x-auto scrollbar-none">
          <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Suggestions:</span>
          {quickPrompts.map((prompt, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputMessage(prompt);
              }}
              className="px-2.5 py-1 rounded-md text-[11px] bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 whitespace-nowrap transition"
            >
              {prompt}
            </button>
          ))}
        </div>

        {/* Chat Input Bar */}
        <form onSubmit={handleSendMessage} className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            value={inputMessage}
            onChange={e => setInputMessage(e.target.value)}
            placeholder={t.support.placeholder}
            className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            disabled={!inputMessage.trim() || isSending}
            className="px-4 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition flex items-center gap-1.5 shadow-md shadow-emerald-500/20 disabled:opacity-50"
          >
            <Send className="h-4 w-4" />
            <span className="hidden sm:inline">{t.support.send}</span>
          </button>
        </form>
      </div>
    </div>
  );
};
