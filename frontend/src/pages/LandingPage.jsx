import React from 'react';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Compass,
  HeartHandshake,
  HelpCircle,
  CheckCircle2,
  SlidersHorizontal
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
  const { demoLogin, setCurrentView } = useAuth();

  return (
    <div className="min-h-screen bg-[#F8F9F3] flex flex-col justify-between">
      {/* Top Bar */}
      <header className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <img
            src="/logo_symbol_transparent.png"
            alt="Lumora Logo"
            className="h-11 w-auto object-contain"
          />
          <div className="flex flex-col">
            <div className="flex items-center space-x-1.5">
              <span className="text-xl font-black text-[#354546] tracking-tight">LUMORA</span>
              <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded-full bg-[#E8EFE8] text-[#557755] border border-[#D5E2D5]">
                Autopilot
              </span>
            </div>
            <span className="text-[9px] uppercase tracking-widest text-[#798990] font-bold">
              Workload & Recovery Autopilot
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setCurrentView('login')}
            className="text-xs font-bold text-[#55696B] hover:text-[#354546] px-3 py-2 transition-colors cursor-pointer"
          >
            Sign In
          </button>
          <button
            onClick={() => demoLogin()}
            className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-[#88A788] hover:bg-[#759475] active:scale-95 text-white text-xs font-bold transition-all shadow-sm cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EDFFEE]" />
            <span>Launch Live Demo</span>
          </button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 text-center space-y-8">
        {/* Logo Symbol Display */}
        <div className="flex justify-center">
          <img
            src="/logo_symbol_transparent.png"
            alt="Lumora Symbol"
            className="h-28 sm:h-36 w-auto object-contain select-none"
          />
        </div>

        {/* Positioning Pill */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-[#E8EFE8] border border-[#D5E2D5] text-[#3E5C3E] text-xs font-semibold shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#88A788] animate-pulse" />
          <span>A Burnout Autopilot, Not Another To-Do List</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold text-[#354546] tracking-tight leading-[1.15]">
          Know Your Load. <br className="hidden sm:inline" />
          <span className="text-[#88A788]">Protect Your Energy.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="max-w-2xl mx-auto text-[#55696B] text-base sm:text-lg leading-relaxed">
          Most productivity apps help students fit more into their schedules. Lumora helps them know <strong>when they shouldn't</strong>.
        </p>

        {/* Primary & Secondary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2">
          <button
            onClick={() => demoLogin()}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#88A788] hover:bg-[#759475] active:scale-98 text-white text-sm font-bold shadow-lg shadow-[#88A788]/25 transition-all flex items-center justify-center space-x-2 cursor-pointer group"
          >
            <span>Try Lumora with Alex's Week</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={() => setCurrentView('signup')}
            className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-white hover:bg-[#F8FAF6] border border-[#DDE4DC] text-[#354546] text-sm font-bold transition-all shadow-2xs cursor-pointer"
          >
            Create New Account
          </button>
        </div>

        {/* Interactive Story Progression Preview Card */}
        <div className="pt-8">
          <div className="lumora-card p-6 sm:p-8 text-left max-w-3xl mx-auto border border-[#E2E8DF] shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#EEF2EC] pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-[#557755]">
                The Lumora Continuous Feedback Loop
              </span>
              <span className="text-xs font-semibold text-[#8A9B9D]">Deterministic & Explainable</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-6 gap-2 text-center text-xs">
              {[
                { step: '01', title: 'Capture', desc: 'Smart AI natural extraction' },
                { step: '02', title: 'Understand', desc: 'Combined life capacity' },
                { step: '03', title: 'Detect', desc: 'Pre-burnout overload' },
                { step: '04', title: 'Rebalance', desc: 'Move flexible errands' },
                { step: '05', title: 'Recover', desc: 'Permission to rest' },
                { step: '06', title: 'Simulate', desc: 'Test what-if shifts' }
              ].map((item, idx) => (
                <div key={idx} className="p-2.5 rounded-xl bg-[#F8FAF6] border border-[#E7ECE5] space-y-1">
                  <span className="text-[10px] font-mono text-[#88A788] font-bold">{item.step}</span>
                  <p className="font-bold text-[#354546]">{item.title}</p>
                  <p className="text-[10px] text-[#798990] leading-tight">{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Quick Demo Preview Box */}
            <div className="p-4 rounded-2xl bg-[#F4F8F3] border border-[#D5E2D5] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1">
                <p className="text-xs font-bold text-[#2A422A]">Pre-seeded Hackathon Demo Scenario:</p>
                <p className="text-xs text-[#4A644A]">
                  Alex starts on Monday (68%) → adds FYP & part-time shift (91%) → Lumora rebalances flexible commitments → load recovers to 73% (↓ 18%).
                </p>
              </div>
              <button
                onClick={() => demoLogin()}
                className="whitespace-nowrap px-4 py-2 rounded-xl bg-[#88A788] text-white text-xs font-bold hover:bg-[#759475] transition-colors cursor-pointer shadow-xs"
              >
                Experience Flow →
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5EAE3] py-6 text-center text-xs text-[#8A9B9D]">
        <p>Lumora — Designed for university students with care, calm geometry, and non-clinical guidance.</p>
      </footer>
    </div>
  );
}
