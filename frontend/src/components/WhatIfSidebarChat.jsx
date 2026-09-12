import React, { useState } from 'react';
import {
  Sparkles,
  HelpCircle,
  X,
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  MessageSquare,
  TrendingUp,
  ShieldAlert,
  ChevronRight
} from 'lucide-react';
import { api } from '../api/client';

export default function WhatIfSidebarChat({ isOpen, onToggle, onClose }) {
  const [scenario, setScenario] = useState('Can I accept another part-time shift on Saturday?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sampleScenarios = [
    "Can I accept another part-time shift on Saturday?",
    "What if I take on an extra research project this month?",
    "Can I join my friends for an all-day road trip on Friday?",
    "What happens if I postpone my gym sessions until the weekend?",
    "What if I sleep 5.5 hours tonight to study for quiz?"
  ];

  const handleSimulate = async (queryToRun) => {
    const q = queryToRun || scenario;
    if (!q.trim()) return;

    setLoading(true);
    try {
      const data = await api.simulateWhatIf(q);
      setResult(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
    setScenario('');
  };

  return (
    <>
      {/* Floating Chat Trigger Button on Desktop & Tablet */}
      <div className="fixed bottom-6 right-6 z-40 hidden md:block">
        <button
          onClick={onToggle}
          className="relative group p-3.5 sm:px-4 sm:py-3.5 rounded-full bg-gradient-to-r from-[#1F6B4F] to-[#15543D] hover:from-[#16533D] hover:to-[#0D3B2A] text-white shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center space-x-2.5 cursor-pointer border border-[#86EFAC]/30 overflow-hidden"
          title="Open What-If AI Decision Assistant"
        >
          {/* Subtle Aurora Glow on button */}
          <div className="absolute -top-6 -left-6 w-16 h-16 rounded-full bg-[#86EFAC]/30 blur-md pointer-events-none" />

          <div className="relative flex items-center space-x-2">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5 text-[#D1F0DE]" />
            </div>
            <span className="text-xs font-bold tracking-wide pr-1">
              What-If Assistant
            </span>
          </div>
        </button>
      </div>

      {/* Collapsible Right Sidebar Slide-over */}
      {isOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white border-l border-[#D2E2D8] shadow-2xl flex flex-col transform transition-transform animate-in slide-in-from-right duration-300">
              {/* Sidebar Header */}
              <div className="p-4 sm:p-5 border-b border-[#D2E2D8] bg-[#EBF7E9] flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-2xl bg-[#1F6B4F] text-white flex items-center justify-center shadow-xs">
                    <Sparkles className="w-5 h-5 text-[#D1F0DE]" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-[#152F26] tracking-tight font-display">
                      What-If Decision Simulator
                    </h3>
                    <p className="text-[11px] text-[#4A675E]">
                      Predict capacity impact before saying yes
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-1">
                  {result && (
                    <button
                      onClick={handleReset}
                      className="p-2 rounded-xl text-[#638379] hover:text-[#152F26] hover:bg-white/60 transition-colors cursor-pointer"
                      title="Reset scenario"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-2 rounded-xl text-[#638379] hover:text-[#152F26] hover:bg-white/60 transition-colors cursor-pointer"
                    title="Close"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Sidebar Scrollable Body */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
                {/* Scenario Prompt Input */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-[#152F26] uppercase tracking-wider block">
                    Ask About An Upcoming Decision
                  </label>
                  <div className="space-y-2">
                    <textarea
                      rows={2}
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      placeholder="e.g. Can I accept another 5-hour shift this Saturday?"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-[#D2E2D8] bg-[#EBF7E9]/50 focus:outline-none focus:ring-2 focus:ring-[#1F6B4F]/20 focus:border-[#1F6B4F] text-[#152F26] resize-none font-medium"
                    />
                    <button
                      onClick={() => handleSimulate()}
                      disabled={loading || !scenario.trim()}
                      className="w-full btn-primary py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Simulating Projected Impact...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4 text-[#D1F0DE]" />
                          <span>Simulate Impact</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Quick Suggestion Chips */}
                {!result && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-bold text-[#638379] uppercase tracking-wider block">
                      Suggested Scenarios
                    </span>
                    <div className="space-y-1.5">
                      {sampleScenarios.map((s, idx) => (
                        <button
                          key={idx}
                          onClick={() => {
                            setScenario(s);
                            handleSimulate(s);
                          }}
                          className="w-full text-left p-2.5 rounded-xl bg-[#EBF7E9]/60 hover:bg-[#E3F2E9] hover:text-[#152F26] text-[#4A675E] transition-all border border-[#D2E2D8] cursor-pointer text-xs font-medium flex items-center justify-between group"
                        >
                          <span className="line-clamp-2">{s}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-[#638379] group-hover:text-[#1F6B4F] group-hover:translate-x-0.5 transition-transform shrink-0 ml-2" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Simulation Result Preview */}
                {result && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                    {/* Capacity Delta Card */}
                    <div className="p-4 rounded-2xl bg-[#152F26] text-white space-y-3 shadow-md border border-[#0D211A] relative overflow-hidden">
                      <div className="absolute -top-10 -right-10 w-28 h-28 rounded-full bg-[#86EFAC]/15 blur-lg pointer-events-none" />

                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#86EFAC]">
                          Projected Capacity
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            result.projected_score >= 85
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : result.projected_score >= 70
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          }`}
                        >
                          {result.verdict || (result.projected_score >= 85 ? 'Overload Risk' : 'Sustainable')}
                        </span>
                      </div>

                      <div className="flex items-baseline space-x-3">
                        <span className="text-3xl font-black font-display text-white">
                          {Math.round(result.projected_score || 78)}%
                        </span>
                        <span className="text-xs text-[#D1F0DE] font-semibold">
                          from {Math.round(result.current_score || 68)}% (
                          {result.projected_score >= result.current_score ? '+' : ''}
                          {Math.round((result.projected_score || 78) - (result.current_score || 68))}%)
                        </span>
                      </div>

                      <div className="w-full h-2 bg-white/15 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${Math.min(100, Math.max(5, result.projected_score || 78))}%` }}
                          className={`h-full rounded-full transition-all ${
                            result.projected_score >= 85 ? 'bg-rose-400' : result.projected_score >= 70 ? 'bg-amber-400' : 'bg-[#86EFAC]'
                          }`}
                        />
                      </div>
                    </div>

                    {/* AI Guidance Box */}
                    <div className="p-4 rounded-2xl bg-white border border-[#D2E2D8] space-y-2 shadow-xs">
                      <div className="flex items-center space-x-2 text-[#152F26]">
                        <CheckCircle2 className="w-4 h-4 text-[#1F6B4F]" />
                        <h4 className="text-xs font-bold uppercase tracking-wider">
                          Decision Guidance
                        </h4>
                      </div>
                      <p className="text-xs text-[#4A675E] leading-relaxed">
                        {result.recommendation || result.analysis || "Accepting this commitment will increase your weekly cognitive load. Ensure you keep your restorative sleep window intact."}
                      </p>
                    </div>

                    {/* Test Another Question Button */}
                    <button
                      onClick={handleReset}
                      className="w-full py-2.5 rounded-xl bg-[#EBF7E9] hover:bg-[#E3F2E9] text-[#152F26] border border-[#D2E2D8] text-xs font-bold transition-all cursor-pointer flex items-center justify-center space-x-1.5"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#1F6B4F]" />
                      <span>Test Another Scenario</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
