import React from 'react';
import { useTrading } from '../../context/TradingContext';
import {
  LayoutDashboard,
  Coins,
  Gem,
  Binary,
  Radio,
  ScanSearch,
  Sparkles,
  Camera,
  Bot,
  Calculator,
  LineChart,
  History,
  Percent,
  FlaskConical,
  WalletCards,
  KeyRound,
  Settings,
  CircleDollarSign,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { activePage, setActivePage, t } = useTrading();

  const navSections = [
    {
      title: 'CORE PLATFORM',
      items: [
        { id: 'dashboard', label: t.nav.dashboard, icon: LayoutDashboard },
        { id: 'charts', label: t.nav.liveMarketCharts, icon: LineChart },
        { id: 'scanner', label: t.nav.allMarketScanner, icon: ScanSearch, badge: 'AUTO' },
        { id: 'signals', label: t.nav.aiSignalGenerator, icon: Sparkles, badge: 'A+' },
      ],
    },
    {
      title: 'MARKET ASSETS',
      items: [
        { id: 'forex', label: t.nav.forexMarket, icon: CircleDollarSign },
        { id: 'gold', label: t.nav.goldMarket, icon: Gem },
        { id: 'crypto', label: t.nav.cryptoMarket, icon: Coins },
        { id: 'binary', label: t.nav.binaryMarket, icon: Binary },
        { id: 'otc', label: t.nav.otcMarket, icon: Radio },
      ],
    },
    {
      title: 'INTELLIGENCE & TOOLS',
      items: [
        { id: 'screenshot', label: t.nav.screenshotAnalyzer, icon: Camera, badge: 'AI' },
        { id: 'support', label: t.nav.aiSupport, icon: Bot },
        { id: 'compounding', label: t.nav.threeStepCompounding, icon: Calculator },
        { id: 'paper', label: t.nav.paperTrading, icon: WalletCards },
      ],
    },
    {
      title: 'ANALYTICS & RECORDS',
      items: [
        { id: 'history', label: t.nav.signalHistory, icon: History },
        { id: 'winrate', label: t.nav.winRateStats, icon: Percent },
        { id: 'backtest', label: t.nav.backtesting, icon: FlaskConical },
      ],
    },
    {
      title: 'SYSTEM & SECURITY',
      items: [
        { id: 'api', label: t.nav.apiConfig, icon: KeyRound },
        { id: 'settings', label: t.nav.settings, icon: Settings },
      ],
    },
  ];

  const handleNavClick = (id: string) => {
    setActivePage(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col border-r border-slate-800 bg-[#0a0e17] transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Top Header on Mobile */}
        <div className="flex h-14 items-center justify-between border-b border-slate-800 px-4 lg:hidden">
          <span className="font-bold text-white text-sm">Navigation Menu</span>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded">
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Nav Items */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {navSections.map((section, idx) => (
            <div key={idx} className="space-y-1">
              <div className="px-3 pb-1 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500">
                {section.title}
              </div>
              {section.items.map(item => {
                const Icon = item.icon;
                const isActive = activePage === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleNavClick(item.id)}
                    className={`group flex w-full items-center justify-between rounded-lg px-3 py-2 text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-gradient-to-r from-emerald-500/20 to-teal-500/10 text-emerald-400 border border-emerald-500/30 font-semibold shadow-sm shadow-emerald-500/10'
                        : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`h-4 w-4 transition-colors ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider ${
                          item.badge === 'A+'
                            ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                            : item.badge === 'AI'
                            ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                            : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Bottom Status Card */}
        <div className="border-t border-slate-800/80 p-3 bg-slate-950/60">
          <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Core Engine
            </span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="mt-1 text-[10px] text-slate-500 truncate">
            v2.4.0 &bull; Asia/Dhaka UTC+6
          </div>
        </div>
      </aside>
    </>
  );
};
