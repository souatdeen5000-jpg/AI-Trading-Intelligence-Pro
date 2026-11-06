import React, { useState } from 'react';
import { useTrading } from '../context/TradingContext';
import { Settings as SettingsIcon, Globe, Moon, Sun, Clock, Bell, Shield, Volume2, VolumeX, Download, Upload } from 'lucide-react';

export const Settings: React.FC = () => {
  const { t, language, setLanguage, theme, setTheme, dhakaTime, setShowTestModal } = useTrading();

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [defaultRiskPct, setDefaultRiskPct] = useState(2);
  const [autoRefreshSecs, setAutoRefreshSecs] = useState(15);
  const [notice, setNotice] = useState<string | null>(null);

  const handleExportData = () => {
    const backupData = {
      timestamp: Date.now(),
      dhakaTime,
      theme,
      language,
      defaultRiskPct,
    };
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-trading-pro-settings-${Date.now()}.json`;
    a.click();
    setNotice('Settings and configuration exported successfully.');
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <SettingsIcon className="h-6 w-6 text-slate-300" />
            {t.nav.settings}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global Terminal Preferences, Localization, Risk Defaults & System Diagnostics
          </p>
        </div>

        <button
          onClick={() => setShowTestModal(true)}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition flex items-center gap-1.5 shadow-sm"
        >
          <Shield className="h-3.5 w-3.5" />
          Run 20-Point System Diagnostics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Localization & Appearance */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Globe className="h-4 w-4 text-emerald-400" />
            Localization & Interface Theme
          </h3>

          <div className="space-y-4 text-xs">
            {/* Language Selection */}
            <div className="flex items-center justify-between">
              <div>
                <span className="font-semibold text-white block">Platform Language</span>
                <span className="text-[11px] text-slate-400">Toggle between English and বাংলা</span>
              </div>
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    language === 'en' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  English
                </button>
                <button
                  onClick={() => setLanguage('bn')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition ${
                    language === 'bn' ? 'bg-emerald-500 text-slate-950 font-sans' : 'text-slate-400 hover:text-white font-sans'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>

            {/* Theme Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div>
                <span className="font-semibold text-white block">Color Theme</span>
                <span className="text-[11px] text-slate-400">Dark Trading Terminal or Light Clean Mode</span>
              </div>
              <div className="flex items-center bg-slate-900 rounded-lg p-1 border border-slate-700">
                <button
                  onClick={() => setTheme('dark')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                    theme === 'dark' ? 'bg-slate-800 text-emerald-400 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Moon className="h-3.5 w-3.5" />
                  Dark
                </button>
                <button
                  onClick={() => setTheme('light')}
                  className={`px-3 py-1 rounded text-xs font-semibold transition flex items-center gap-1 ${
                    theme === 'light' ? 'bg-slate-200 text-slate-900 shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5" />
                  Light
                </button>
              </div>
            </div>

            {/* Timezone Information (Section 10) */}
            <div className="pt-3 border-t border-slate-800/80 space-y-1">
              <span className="font-semibold text-white block">System Timezone</span>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs">
                <span className="text-slate-400 flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 text-emerald-400" />
                  Asia/Dhaka (BST)
                </span>
                <span className="text-emerald-400 font-bold">UTC+6 Synced</span>
              </div>
              <span className="text-[10px] text-slate-500 block">
                All signal open/close and expiry timings strictly follow Bangladesh Standard Time.
              </span>
            </div>
          </div>
        </div>

        {/* Risk & Notification Defaults */}
        <div className="rounded-xl border border-slate-800 bg-[#0d131f] p-5 space-y-4 shadow-lg">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center gap-2">
            <Shield className="h-4 w-4 text-cyan-400" />
            Risk & Sound Notifications
          </h3>

          <div className="space-y-4 text-xs">
            {/* Risk Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-white">Default Risk Per Trade (%)</span>
                <span className="font-mono font-bold text-emerald-400">{defaultRiskPct}%</span>
              </div>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={defaultRiskPct}
                onChange={e => setDefaultRiskPct(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">
                Standard quantitative recommendation is 1% to 2% max per trade.
              </span>
            </div>

            {/* Sound Toggle */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <div>
                <span className="font-semibold text-white block">Audio Sound Alert</span>
                <span className="text-[11px] text-slate-400">Play pleasant chime when A+ signal arrives</span>
              </div>
              <button
                onClick={() => setSoundEnabled(!soundEnabled)}
                className={`p-2 rounded-lg border transition ${
                  soundEnabled
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                    : 'bg-slate-900 text-slate-500 border-slate-800'
                }`}
              >
                {soundEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
              </button>
            </div>

            {/* Export Config */}
            <div className="pt-3 border-t border-slate-800/80 space-y-2">
              <span className="font-semibold text-white block">Data Export & Backup</span>
              <button
                onClick={handleExportData}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition flex items-center justify-center gap-1.5"
              >
                <Download className="h-3.5 w-3.5" />
                Export Settings Backup (JSON)
              </button>
            </div>

            {notice && (
              <div className="rounded-lg bg-emerald-950/30 border border-emerald-800/40 p-2 text-xs text-emerald-300">
                {notice}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
