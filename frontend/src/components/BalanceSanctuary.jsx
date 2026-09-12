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
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 shrink-0">
          <div className="absolute inset-0 rounded-full bg-emerald-500/15 animate-ping opacity-30" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col items-center justify-center shadow-inner text-3xl select-none">
            🌱
          </div>
        </div>
      );
    }

    if (plant_stage === 'blooming_bonsai') {
      return (
        <div className="relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 shrink-0">
          <div className="absolute inset-0 rounded-full bg-emerald-500/20 serene-pulse" />
          <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-100 border border-emerald-300/80 flex flex-col items-center justify-center shadow-md text-3xl select-none">
            🌳
          </div>
        </div>
      );
    }

    // Default: Foliage
    return (
      <div className="relative flex items-center justify-center w-20 h-20 sm:w-22 sm:h-22 shrink-0">
        <div className="absolute inset-0 rounded-full bg-emerald-500/15 serene-pulse" />
        <div className="relative w-16 h-16 sm:w-18 sm:h-18 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-200/80 flex flex-col items-center justify-center shadow-inner text-3xl select-none">
          🌿
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        background: isFrozen
          ? 'linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(254, 243, 199, 0.6) 60%, rgba(254, 249, 195, 0.8) 100%)'
          : 'linear-gradient(145deg, rgba(255, 255, 255, 0.96) 0%, rgba(236, 253, 245, 0.7) 50%, rgba(204, 251, 241, 0.75) 100%)',
        borderColor: isFrozen ? '#FCD34D' : 'rgba(16, 185, 129, 0.35)'
      }}
      className="lumora-card p-6 sm:p-7 relative overflow-hidden flex flex-col justify-between h-full shadow-xs hover:shadow-md transition-all border"
    >
      {/* Background decorative glow */}
      <div
        style={{
          background: isFrozen
            ? 'radial-gradient(circle, rgba(245, 158, 11, 0.2) 0%, transparent 70%)'
            : 'radial-gradient(circle, rgba(16, 185, 129, 0.2) 0%, transparent 70%)'
        }}
        className="absolute -left-16 -top-16 w-64 h-64 rounded-full blur-3xl pointer-events-none"
      />

      <div className="space-y-4 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Anti-Streak & Sanctuary
              </span>
              {isFrozen ? (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200/80 inline-flex items-center space-x-1.5">
                  <PauseCircle className="w-3.5 h-3.5" />
                  <span>Gracefully Paused</span>
                </span>
              ) : (
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 inline-flex items-center space-x-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Zero-Anxiety Mode</span>
                </span>
              )}
            </div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight mt-1 font-display">
              {isFrozen ? 'Streak Gracefully Paused 🛡️' : status_headline}
            </h2>
          </div>

          {/* Streak Counter Pill */}
          <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center space-x-2 shadow-2xs shrink-0">
            <span className="text-xl font-black text-slate-900 font-display">{streak_days}</span>
            <div className="flex flex-col leading-tight">
              <span className="text-[9px] font-extrabold uppercase tracking-wider text-emerald-600">
                Days
              </span>
              <span className="text-[9px] text-slate-500 font-medium">Equilibrium</span>
            </div>
          </div>
        </div>

        {/* Plant visual + Growth bar banner */}
        <div className="p-3.5 rounded-2xl bg-slate-50/70 border border-slate-200/70 flex items-center space-x-3.5">
          {renderPlantVisual()}

          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="truncate">{plant_stage_name}</span>
              <span className="text-emerald-600 font-bold ml-2">{plant_growth_percent}%</span>
            </div>
            <div className="w-full h-2 bg-slate-200/70 rounded-full overflow-hidden p-0.5">
              <div
                style={{ width: `${plant_growth_percent}%` }}
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-700 ease-out shadow-xs"
              />
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Nurtured by rest, rebalancing, and healthy limits
            </p>
          </div>
        </div>

        {/* Explanatory Message */}
        <p className="text-xs text-slate-600 leading-relaxed">
          {isFrozen
            ? 'Peak load detected (>80%). Lumora never resets your streak to zero when life gets intense. Your balance progress is frozen with zero guilt until you recover.'
            : status_message}
        </p>

        {/* Milestones Chips */}
        {milestones.length > 0 && (
          <div className="space-y-1.5 pt-0.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Recent Restorative Milestones:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
              {milestones.slice(0, 2).map((m, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center space-x-2 text-[11px] font-medium text-slate-700"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span className="truncate">{m}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action CTA */}
      <div className="pt-4 relative z-10 flex items-center justify-between gap-2 border-t border-slate-100">
        <button
          onClick={() => setCurrentView('recovery')}
          className="btn-primary w-full px-4 py-2.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-1.5 cursor-pointer"
        >
          <Wind className="w-4 h-4 text-emerald-200" />
          <span>Enter Recovery Sanctuary</span>
          <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </button>
      </div>
    </div>
  );
}
