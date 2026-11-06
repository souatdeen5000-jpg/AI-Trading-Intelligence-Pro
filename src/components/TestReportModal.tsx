import React, { useState, useEffect } from 'react';
import { useTrading } from '../context/TradingContext';
import { ShieldCheck, CheckCircle2, AlertTriangle, X, RefreshCw, Layers, ExternalLink } from 'lucide-react';

export const TestReportModal: React.FC = () => {
  const { showTestModal, setShowTestModal } = useTrading();

  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState<any>(null);

  const runTestAudit = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/system/test-report');
      if (res.ok) {
        const data = await res.json();
        setReportData(data);
      }
    } catch (e) {
      console.error('Audit run failed', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (showTestModal) {
      runTestAudit();
    }
  }, [showTestModal]);

  if (!showTestModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-slate-800 bg-[#0a0e17] shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 bg-slate-900/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                Automated 20-Point System Diagnostics Report
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">
                Section 18 Full-Stack Compliance Audit
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={runTestAudit}
              disabled={isLoading}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              title="Re-run Diagnostic Audit"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-400' : ''}`} />
            </button>
            <button
              onClick={() => setShowTestModal(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Summary Score Bar */}
          {reportData && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-emerald-500/30 bg-emerald-950/20">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider block">
                  Tests Passed
                </span>
                <span className="text-2xl font-extrabold font-mono text-white">
                  {reportData.passedCount} / {reportData.totalCount}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d131f]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  System Health Score
                </span>
                <span className="text-2xl font-extrabold font-mono text-emerald-400">
                  {((reportData.passedCount / reportData.totalCount) * 100).toFixed(0)}%
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-800 bg-[#0d131f]">
                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                  Audit Timestamp (UTC+6)
                </span>
                <span className="text-xs font-extrabold font-mono text-slate-300 block truncate pt-1">
                  {reportData.generatedAt}
                </span>
              </div>
            </div>
          )}

          {/* 20 Test Items List */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Diagnostic Verification Matrix
            </h3>

            {isLoading && !reportData ? (
              <div className="py-8 text-center text-xs text-slate-400 animate-pulse">
                Running 20-Point Automated Diagnostics...
              </div>
            ) : (
              <div className="space-y-1.5 max-h-80 overflow-y-auto pr-1">
                {reportData?.tests?.map((t: any) => (
                  <div
                    key={t.id}
                    className="flex items-center justify-between p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 text-xs font-mono"
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-slate-500 font-bold w-5">#{t.id}</span>
                      <span className="text-slate-200 font-medium font-sans">{t.name}</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-[11px] text-slate-400 font-sans hidden sm:inline">
                        {t.details}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.status === 'PASSED'
                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {t.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Limitations & Disclosures */}
          {reportData?.limitations && (
            <div className="rounded-xl border border-slate-800 bg-slate-900/40 p-4 space-y-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Declared Known Limitations & Boundaries (Section 18 & 19):
              </span>
              <ul className="space-y-1 text-xs text-slate-400 list-disc list-inside">
                {reportData.limitations.map((lim: string, idx: number) => (
                  <li key={idx} className="leading-relaxed">
                    {lim}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t border-slate-800 px-6 py-3 bg-slate-900/80 flex justify-end">
          <button
            onClick={() => setShowTestModal(false)}
            className="px-4 py-2 rounded-lg text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition"
          >
            Close Audit Report
          </button>
        </div>
      </div>
    </div>
  );
};
