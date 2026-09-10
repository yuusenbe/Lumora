import React from 'react';
import {
  Sparkles,
  Shield,
  HeartHandshake,
  CheckCircle2,
  PauseCircle,
  ArrowRight,
  Wind
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function BalanceSanctuary({ sanctuary, capacityScore }) {
  const { setCurrentView } = useAuth();

  if (!sanctuary) return null;

  const {
    streak_days = 5,
    streak_status = 'active',
    plant_stage = 'foliage',
    plant_stage_name = 'Thriving Sage Foliage 🌿',
    plant_growth_percent = 70,
    balance_points = 280,
    status_headline = '5 Days in Restorative Equilibrium 🌿',
    status_message = 'Your energy envelope is well-protected in the sustainable sweet spot.',
    milestones = []
  } = sanctuary;

  const isFrozen = streak_status === 'frozen' || capacityScore > 80;

  // Plant representation illustrations
  const renderPlantVisual = () => {
    if (plant_stage === 'sprout') {
      return (
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute inset-0 rounded-full bg-[#88A788]/15 animate-ping opacity-30" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#EDF5EC] to-[#DEEAD9] border border-[#CADBC9] flex flex-col items-center justify-center shadow-inner text-4xl select-none">
            🌱
          </div>
        </div>
      );
    }

    if (plant_stage === 'blooming_bonsai') {
      return (
        <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
          <div className="absolute inset-0 rounded-full bg-[#88A788]/20 serene-pulse" />
          <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#EBF5EA] to-[#D5E8D4] border border-[#BBD5BA] flex flex-col items-center justify-center shadow-md text-4xl select-none">
            🌳
          </div>
        </div>
      );
    }

    // Default: Foliage
    return (
      <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
        <div className="absolute inset-0 rounded-full bg-[#88A788]/15 serene-pulse" />
        <div className="relative w-20 h-20 rounded-full bg-gradient-to-b from-[#F0F6EE] to-[#DFECDD] border border-[#C5D9C4] flex flex-col items-center justify-center shadow-inner text-4xl select-none">
          🌿
        </div>
      </div>
    );
  };

  return (
    <div className="lumora-card p-6 sm:p-7 bg-white border border-[#E2EAE0] relative overflow-hidden space-y-5">
      {/* Gentle background decorative glow */}
      <div
        style={{
          background: isFrozen
            ? 'radial-gradient(circle, #C89B6D15 0%, transparent 70%)'
            : 'radial-gradient(circle, #88A78818 0%, transparent 70%)'
        }}
        className="absolute -left-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
      />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#EEF3EC] pb-4 relative z-10">
        <div>
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#798990]">
              Anti-Streak & Sanctuary
            </span>
            {isFrozen ? (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#FAF3EC] text-[#B87A4A] border border-[#EED7C5] inline-flex items-center space-x-1">
                <PauseCircle className="w-3.5 h-3.5" />
                <span>Gracefully Paused</span>
              </span>
            ) : (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#EFF6EE] text-[#557755] border border-[#D3E4D1] inline-flex items-center space-x-1">
                <Shield className="w-3.5 h-3.5 text-[#88A788]" />
                <span>Zero-Anxiety Mode</span>
              </span>
            )}
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold text-[#354546] tracking-tight mt-0.5">
            {isFrozen ? 'Streak Gracefully Paused 🛡️' : status_headline}
          </h2>
        </div>

        {/* Streak Counter Pill */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="px-3.5 py-1.5 rounded-2xl bg-[#F4F8F3] border border-[#D8E6D6] flex items-center space-x-2">
            <span className="text-2xl font-black text-[#354546]">{streak_days}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#688868]">
                Days
              </span>
              <span className="text-[10px] text-[#798990] font-medium">In Equilibrium</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: Plant growth & Sanctuary summary */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        {/* Plant Visual & Growth Bar */}
        <div className="md:col-span-4 flex flex-col items-center justify-center p-4 rounded-2xl bg-[#F8FAF7] border border-[#E7EFE6] space-y-3 text-center">
          {renderPlantVisual()}

          <div className="w-full space-y-1">
            <div className="flex items-center justify-between text-[11px] font-semibold text-[#55696B]">
              <span>{plant_stage_name}</span>
              <span>{plant_growth_percent}%</span>
            </div>
            <div className="w-full h-2 bg-[#E2ECE0] rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${plant_growth_percent}%` }}
                className="h-full rounded-full bg-[#88A788] transition-all duration-700 ease-out"
              />
            </div>
            <p className="text-[10px] text-[#8A9B9D]">
              Nurtured by rest, rebalancing, and healthy limits
            </p>
          </div>
        </div>

        {/* Explanatory Message & Milestones */}
        <div className="md:col-span-8 space-y-4">
          <p className="text-xs sm:text-sm text-[#55696B] leading-relaxed">
            {isFrozen
              ? 'Peak load detected (>80%). Lumora never resets your streak to zero when life gets intense. Your balance progress is frozen with zero guilt until you recover.'
              : status_message}
          </p>

          {/* Self-Care Milestones */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#798990] block">
              Recent Restorative Milestones:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {milestones.map((m, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-[#F9FBF8] border border-[#E2ECE0] flex items-center space-x-2 text-xs font-medium text-[#405658]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#88A788] shrink-0" />
                  <span className="truncate">{m}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTA */}
          <div className="pt-1 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentView('recovery')}
              className="px-4 py-2 rounded-xl bg-[#88A788] hover:bg-[#759475] active:scale-98 text-white text-xs font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
            >
              <Wind className="w-3.5 h-3.5 text-[#EDFFEE]" />
              <span>Enter Recovery Sanctuary</span>
              <ArrowRight className="w-3.5 h-3.5 ml-1" />
            </button>

            <span className="text-[11px] text-[#798990] italic">
              +25 Growth Points on every completed breathwork or rest session
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
