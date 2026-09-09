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
      <div className="flex items-center space-x-3 border-b border-[#E5EAE3] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#E8EFE8] text-[#354546] flex items-center justify-center">
          <HelpCircle className="w-6 h-6 text-[#88A788]" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#354546] tracking-tight">What-If Decision Simulator</h1>
          <p className="text-xs text-[#798990]">Test commitments before saying yes, with projected capacity modeling</p>
        </div>
      </div>

      {/* Input Sandbox */}
      <div className="lumora-card p-6 sm:p-7 space-y-4">
        <label className="text-xs font-bold text-[#354546] uppercase tracking-wider">
          Ask Lumora About An Upcoming Decision
        </label>

        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={scenario}
            onChange={(e) => setScenario(e.target.value)}
            placeholder="e.g. Can I accept another 5-hour shift this Saturday?"
            className="flex-1 px-4 py-3 text-sm rounded-2xl border border-[#D3DCD0] bg-[#F8F9F3] focus:outline-none focus:ring-2 focus:ring-[#88A788] text-[#354546]"
          />
          <button
            onClick={() => handleSimulate()}
            disabled={loading || !scenario.trim()}
            className="px-6 py-3 rounded-2xl bg-[#88A788] hover:bg-[#759475] active:scale-95 text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Simulating...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#B3E8C0]" />
                <span>Simulate Impact</span>
              </>
            )}
          </button>
        </div>

        {/* Quick sample chips */}
        <div className="space-y-1.5 pt-1">
          <span className="text-[11px] font-medium text-[#798990]">Sample questions:</span>
          <div className="flex flex-wrap gap-1.5">
            {sampleScenarios.map((s, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setScenario(s);
                  handleSimulate(s);
                }}
                className="text-[11px] px-3 py-1 rounded-lg bg-[#F4F1E5] hover:bg-[#E8EFE8] hover:text-[#354546] text-[#354546] transition-colors border border-[#E2DEC9] cursor-pointer text-left font-medium"
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
          <div className="lumora-card p-6 sm:p-7 bg-[#354546] text-white rounded-3xl space-y-5 border-none shadow-lg">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-[#4d6365] pb-4">
              <div>
                <span className="text-[11px] font-bold text-[#B3E8C0] uppercase tracking-widest">
                  Simulation Outcome
                </span>
                <h3 className="text-base font-bold text-[#F8F9F3] mt-0.5">"{result.question}"</h3>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-[#B3E8C0]">Current</span>
                  <p className="text-2xl font-bold text-[#EDFFEE]">{result.current_load}%</p>
                </div>
                <ArrowRight className="w-5 h-5 text-[#88A788]" />
                <div className="text-center">
                  <span className="text-[10px] uppercase font-bold text-amber-200">With New Shift</span>
                  <p className="text-2xl font-bold text-rose-300">{result.projected_load_unbalanced}%</p>
                </div>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-[#E8EFE8] leading-relaxed">
              {result.impact_analysis}
            </p>

            <div className="flex items-center space-x-2 text-xs text-amber-200 font-semibold">
              <AlertTriangle className="w-4 h-4" />
              <span>Projected Peak Day: {result.peak_day}</span>
            </div>
          </div>

          {/* Options Comparison */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-[#798990] uppercase tracking-wider">
              Strategic Options Explored:
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {result.options.map((opt, idx) => (
                <div
                  key={opt.option_id || idx}
                  className={`lumora-card p-5 space-y-3 flex flex-col justify-between ${
                    opt.recommended
                      ? 'border-2 border-[#88A788] bg-[#E8EFE8]/30 shadow-md'
                      : 'border-[#E5EAE3] bg-white'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#798990]">Option {String.fromCharCode(65 + idx)}</span>
                      {opt.recommended && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#B3E8C0] text-[#354546]">
                          Recommended
                        </span>
                      )}
                    </div>

                    <h4 className="text-sm font-bold text-[#354546] leading-snug">
                      {opt.title}
                    </h4>

                    <p className="text-xs text-[#798990] leading-relaxed">
                      {opt.tradeoff}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-[#E5EAE3] flex items-center justify-between">
                    <span className="text-[11px] text-[#798990] font-medium">Projected Load:</span>
                    <span className={`text-sm font-extrabold ${opt.projected_load >= 85 ? 'text-[#C86D6D]' : 'text-[#88A788]'}`}>
                      {opt.projected_load}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI Verdict */}
          <div className="lumora-card p-4 bg-[#E8EFE8] border border-[#D3DCD0] flex items-start space-x-3">
            <Lightbulb className="w-5 h-5 text-[#88A788] mt-0.5 shrink-0" />
            <div className="space-y-0.5">
              <h4 className="text-xs font-bold text-[#354546] uppercase tracking-wider">Lumora Recommendation</h4>
              <p className="text-xs text-[#354546] leading-relaxed font-medium">
                {result.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
