import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  HeartHandshake,
  HelpCircle,
  CheckCircle2,
  SlidersHorizontal,
  Zap,
  Activity,
  CalendarCheck,
  Shield,
  Layers,
  Repeat
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { demoLogin, setCurrentView } = useAuth();

  const loopSteps = [
    { step: '01', title: 'Smart Capture', desc: 'Natural task intake & effort estimation', icon: Zap },
    { step: '02', title: 'Capacity Engine', desc: 'Real-time multi-dimensional load scoring', icon: Activity },
    { step: '03', title: 'Early Warning', desc: 'Overload detection before burnout sets in', icon: Shield },
    { step: '04', title: 'Autopilot Rebalance', desc: 'One-click load distribution & errand deferral', icon: Repeat },
    { step: '05', title: 'Active Recovery', desc: 'Guilt-free rest & cognitive pacing', icon: Compass },
    { step: '06', title: 'What-If Sandbox', desc: 'Simulate new commitments before saying yes', icon: SlidersHorizontal }
  ];

  return (
    <div className="min-h-screen bg-[#EDF3EE] flex flex-col justify-between selection:bg-[#E3F2E9] selection:text-[#152F26]">
      {/* Top Bar */}
      <header className="sticky top-0 z-40 w-full border-b border-[#D2E2D8] bg-white/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="h-9 w-9 rounded-xl bg-[#1F6B4F] flex items-center justify-center shadow-xs">
              <img
                src="/logo_symbol_transparent.png"
                alt="Lumora Logo"
                className="h-6 w-auto object-contain brightness-0 invert"
              />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-lg font-bold text-[#152F26] tracking-tight font-display">LUMORA</span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0]">
                  Autopilot
                </span>
              </div>
              <span className="text-[9px] uppercase tracking-wider text-[#4A675E] font-semibold">
                Workload & Recovery Autopilot
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setCurrentView('login')}
              className="text-xs font-semibold text-[#4A675E] hover:text-[#152F26] px-3 py-2 transition-colors cursor-pointer"
            >
              Sign In
            </button>
            <button
              onClick={() => demoLogin()}
              className="btn-primary flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E3F2E9]" />
              <span>Launch Live Demo</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 text-center space-y-10">
        {/* Positioning Pill */}
        <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-[#E3F2E9] border border-[#C2E2D0] text-[#152F26] text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#1F6B4F] animate-pulse" />
          <span>A Burnout Autopilot, Not Another Overwhelming To-Do List</span>
        </div>

        {/* Hero Headline */}
        <div className="space-y-4">
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-[#152F26] tracking-tight leading-[1.1] font-display">
            Know Your Load. <br />
            <span className="text-[#1F6B4F]">
              Protect Your Energy.
            </span>
          </h1>

          {/* Supporting Copy */}
          <p className="max-w-2xl mx-auto text-[#4A675E] text-base sm:text-lg leading-relaxed font-normal">
            Most productivity apps help students squeeze more into packed schedules. Lumora calculates your holistic mental bandwidth and tells you <strong>when to stop</strong>.
          </p>
        </div>

        {/* Primary & Secondary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => demoLogin()}
            className="btn-primary w-full sm:w-auto px-7 py-3.5 rounded-2xl text-sm font-semibold shadow-sm flex items-center justify-center space-x-2 cursor-pointer group"
          >
            <span>Try Lumora with Alex's Week</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setCurrentView('signup')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-[#EDF3EE] border border-[#D2E2D8] text-[#152F26] text-sm font-semibold transition-all shadow-xs cursor-pointer"
          >
            Create New Account
          </button>
        </div>

        {/* Interactive Story Progression Preview Card */}
        <div className="pt-8">
          <div className="lumora-card p-6 sm:p-8 text-left max-w-4xl mx-auto space-y-6 bg-white border border-[#D2E2D8]">
            <div className="flex items-center justify-between border-b border-[#D2E2D8] pb-4">
              <span className="text-xs font-bold uppercase tracking-wider text-[#1F6B4F]">
                The Lumora Continuous Feedback Loop
              </span>
              <span className="text-xs font-medium text-[#4A675E]">Deterministic & Explainable Engine</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-left">
              {loopSteps.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <div key={idx} className="p-3.5 rounded-xl bg-[#EDF3EE] border border-[#D2E2D8] space-y-2 hover:border-[#1F6B4F]/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono text-[#1F6B4F] font-bold">{item.step}</span>
                      <Icon className="w-3.5 h-3.5 text-[#638379]" />
                    </div>
                    <p className="font-semibold text-xs text-[#152F26]">{item.title}</p>
                    <p className="text-[10px] text-[#4A675E] leading-snug">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Quick Demo Preview Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#E3F2E9] border border-[#C2E2D0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#152F26]">Pre-seeded University Scenario:</p>
                <p className="text-xs text-[#4A675E]">
                  Alex starts on Monday (68%) → adds FYP milestones & work shift (91% overload) → Lumora recommends moving flexible tasks → capacity drops back to safe 73% (↓ 18%).
                </p>
              </div>
              <button
                onClick={() => demoLogin()}
                className="whitespace-nowrap btn-primary text-xs font-semibold px-4 py-2.5 rounded-xl cursor-pointer shrink-0"
              >
                Experience Live Flow →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#D2E2D8] py-8 bg-white text-center text-xs text-[#4A675E]">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <span className="font-bold text-[#152F26]">Lumora</span>
            <span>— Burnout Autopilot for Students</span>
          </div>
          <p className="text-[#638379] text-[11px]">Designed with calm geometry, cognitive pacing, and zero shame.</p>
        </div>
      </footer>
    </div>
  );
}
