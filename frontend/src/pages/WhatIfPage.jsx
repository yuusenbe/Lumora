import React, { useState } from 'react';
import { HelpCircle, Sparkles, ArrowRight, CheckCircle2, AlertTriangle, Lightbulb, Loader2 } from 'lucide-react';
import { api } from '../api/client';

export default function WhatIfPage() {
  const [scenario, setScenario] = useState('Can I accept another part-time shift on Saturday?');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const sampleScenarios = [
    "Can I accept another part-time shift on Saturday?",
    "What if I take on an extra research project this month?",
    "Can I join my friends for an all-day road trip on Friday?",
    "What happens if I postpone my gym sessions until the weekend?"
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

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3.5 border-b border-[#D2E2D8] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0] flex items-center justify-center shadow-2xs">
          <HelpCircle className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#152F26] tracking-tight font-display">What-If Decision Simulator</h1>
          <p className="text-xs text-[#638379]">Test commitments before saying yes, with projected capacity modeling</p>
        </div>
      </div>

      {/* Input Sandbox */}
      <div
        style={{
          background: '#FFFFFF',
          borderColor: '#D2E2D8'
        }}
        className="lumora-card p-6 sm:p-7 space-y-4 shadow-xs border"
      >
        <label className="text-xs font-bold text-[#152F26] uppercase tracking-wider">
          Ask Lumora About An Upcoming Decision
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="e.g. Can I accept another 5-hour shift this Saturday?"
            className="flex-1 px-4 py-3 text-sm rounded-xl border border-[#D2E2D8] bg-[#EDF3EE] focus:outline-none focus:ring-2 focus:ring-[#1F6B4F]/20 focus:border-[#1F6B4F] text-[#152F26]"
          />
          <button
            onClick={() => handleSimulate()}
            disabled={loading || !scenario.trim()}
            className="btn-primary px-6 py-3 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#D1F0DE]" />
                <span>Simulate Impact</span>
              </>
            )}
          </button>
        </div>

        {/* Quick sample chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-[#638379]">Sample questions:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleScenarios.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setScenario(s);
                  handleSimulate(s);
                }}
                className="text-[11px] px-3 py-1 rounded-lg bg-[#EDF3EE] hover:bg-[#E3F2E9] hover:text-[#152F26] text-[#638379] transition-colors border border-[#D2E2D8] cursor-pointer text-left font-medium"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Simulation Results Display */}
      {result && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2">
          {/* Capacity Shift Summary */}
          <div className="lumora-card p-6 sm:p-7 bg-[#152F26] text-white rounded-3xl space-y-5 border border-[#0E221B] shadow-xl">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#24473C] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#74D6A4] uppercase tracking-widest">
                  Simulation Outcome
                </span>
                <h3 className="text-base font-bold text-white mt-0.5 font-display">"{result.question}"</h3>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-[#D1F0DE]">Current</span>
                  <p className="text-2xl font-black text-white font-display">{result.current_load}%</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#638379]" />
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-[#FAF6EC]">With New Shift</span>
                  <p className="text-2xl font-black text-rose-300 font-display">{result.projected_load_unbalanced}%</p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#D1F0DE]/90 leading-relaxed">
              {result.impact_analysis}
            </p>

            <div className="flex items-center space-x-2 text-xs text-[#FAF6EC] font-semibold">
              <AlertTriangle className="w-4 h-4 text-[#D97706]" />
              <span>Projected Peak Day: {result.peak_day}</span>
            </div>
          </div>

          {/* Options Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#638379] uppercase tracking-wider">
              Strategic Options Explored:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.options.map((opt, idx) => (
                <div
                  key={opt.option_id || idx}
                  className={`lumora-card p-5 space-y-3 flex flex-col justify-between transition-all ${
                    opt.recommended
                      ? 'border-2 border-[#1F6B4F] bg-[#E3F2E9] shadow-sm'
                      : 'border-[#D2E2D8] bg-white hover:border-[#1F6B4F]/60 shadow-xs'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#638379]">Option {String.fromCharCode(65 + idx)}</span>
                      {opt.recommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C2E2D0] text-[#152F26] border border-[#A5D4BA]">
                          Recommended
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#152F26] leading-snug font-display">
                      {opt.title}
                    </h4>

                    <p className="text-xs text-[#638379] leading-relaxed">
                      {opt.tradeoff}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#D2E2D8] flex items-center justify-between">
                    <span className="text-[11px] text-[#638379] font-medium">Projected Load:</span>
                    <span className={`text-sm font-extrabold ${opt.projected_load >= 85 ? 'text-rose-600' : 'text-[#1F6B4F]'}`}>
                      {opt.projected_load}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Verdict */}
          <div className="lumora-card p-4.5 bg-[#FEF3C7]/40 border border-[#FDE68A] flex items-start space-x-3.5 shadow-xs">
            <Lightbulb className="w-5 h-5 text-[#D97706] mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#92400E] uppercase tracking-wider">Lumora Recommendation</h4>
              <p className="text-xs text-[#152F26] leading-relaxed font-medium">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
