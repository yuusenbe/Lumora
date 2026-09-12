import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function CapacityCard({ capacity, onRebalanceTrigger, compact = false }) {
  const { setRebalanceModalOpen, setActiveRebalancePlan } = useAuth();

  if (!capacity) return null;

  const score = capacity.capacity_score || 65;
  const status = capacity.status || 'Moderate load';
  const explanation = capacity.explanation;
  const topContributors = capacity.top_contributors || [];
  const needsRebalance = capacity.needs_rebalance;

  // Fresh Botanical Forest & Amber status colors
  const getCapacityColor = (s) => {
    if (s < 40) return '#1F6B4F'; // fresh forest
    if (s < 70) return '#2E855F'; // vibrant emerald
    if (s < 85) return '#D97706'; // honey amber
    return '#DC2626'; // clear coral rose
  };
  const color = getCapacityColor(score);

  const handleOpenRebalance = async () => {
    try {
      const plan = await api.simulateRebalance();
      setActiveRebalancePlan(plan);
      setRebalanceModalOpen(true);
      if (onRebalanceTrigger) onRebalanceTrigger(plan);
    } catch (e) {
      console.error(e);
    }
  };

  if (compact) {
    return (
      <div className="lumora-card p-4 sm:p-5 bg-white border border-[#D2E2D8] shadow-xs space-y-3.5 relative overflow-hidden">
        {/* Decorative background glow */}
        <div
          style={{
            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`
          }}
          className="absolute -right-10 -top-10 w-40 h-40 rounded-full blur-2xl pointer-events-none"
        />

        {/* Header with status badge */}
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#638379]">
            Current Capacity
          </span>
          <span
            style={{ backgroundColor: `${color}18`, color: color }}
            className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-current/20 inline-flex items-center space-x-1"
          >
            <span
              style={{ backgroundColor: color }}
              className="w-1.5 h-1.5 rounded-full animate-pulse"
            />
            <span>{status}</span>
          </span>
        </div>

        {/* Score & Gauge */}
        <div className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl sm:text-4xl font-black text-[#152F26] tracking-tight font-display">
              {score}%
            </span>
            <span className="text-[11px] text-[#638379] font-medium text-right">
              {score < 70 ? 'Safe envelope' : score < 85 ? 'Elevated load' : 'Overload warning'}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2.5 bg-[#E4ECE7] rounded-full overflow-hidden p-0.5 border border-[#D2E2D8]">
            <div
              style={{
                width: `${Math.min(100, Math.max(5, score))}%`,
                backgroundColor: color
              }}
              className="h-full rounded-full transition-all duration-700 ease-out"
            />
          </div>
        </div>

        {/* Short explanation */}
        <p className="text-xs text-[#4A675E] leading-relaxed line-clamp-2">
          {explanation}
        </p>

        {/* Top drivers chips */}
        {topContributors.length > 0 && (
          <div className="pt-1 flex flex-wrap items-center gap-1.5">
            {topContributors.slice(0, 2).map((c, idx) => (
              <span
                key={idx}
                className="text-[10px] bg-[#EDF3EE] text-[#152F26] px-2 py-0.5 rounded-md font-medium border border-[#D2E2D8]"
              >
                {c}
              </span>
            ))}
          </div>
        )}

        {/* Rebalance Callout Trigger if needed */}
        {needsRebalance && (
          <button
            onClick={handleOpenRebalance}
            className="w-full flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#1F6B4F] hover:bg-[#16533D] active:scale-98 text-white text-xs font-bold transition-all shadow-xs cursor-pointer group mt-1"
          >
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D1F0DE]" />
              <span>Rebalance My Week</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="lumora-card p-6 sm:p-8 bg-white border border-[#D2E2D8] relative overflow-hidden">
      {/* Gentle background decorative glow in fresh forest */}
      <div
        style={{
          background: `radial-gradient(circle, #1F6B4F14 0%, transparent 70%)`
        }}
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
      />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left Info */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#638379]">
              Current Capacity
            </span>
            <span
              style={{ backgroundColor: `${color}18`, color: color }}
              className="text-xs font-bold px-2.5 py-0.5 rounded-full border border-current/20 inline-flex items-center space-x-1"
            >
              <span
                style={{ backgroundColor: color }}
                className="w-1.5 h-1.5 rounded-full"
              />
              <span>{status}</span>
            </span>
          </div>

          <div className="flex items-baseline space-x-3">
            <span className="text-5xl sm:text-6xl font-extrabold text-[#152F26] tracking-tight font-display">
              {score}%
            </span>
            <span className="text-[#638379] text-sm font-medium">
              of recommended weekly energy envelope
            </span>
          </div>

          <p className="text-[#4A675E] text-sm sm:text-base leading-relaxed">
            {explanation}
          </p>

          {/* Top Contributors Tags */}
          {topContributors.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[#638379]">Main drivers:</span>
              {topContributors.map((c, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#E3F2E9] text-[#152F26] px-2.5 py-1 rounded-lg font-medium border border-[#C2E2D0]"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Metric Gauge & Rebalance Action */}
        <div className="w-full lg:w-72 flex flex-col items-center lg:items-end space-y-4">
          {/* Capacity Progress Bar in Fresh Botanical Colors */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[#638379]">
              <span>Rest & Reserve</span>
              <span>Strain Limit</span>
            </div>
            <div className="w-full h-3.5 bg-[#E4ECE7] rounded-full overflow-hidden p-0.5 border border-[#D2E2D8]">
              <div
                style={{
                  width: `${Math.min(100, Math.max(5, score))}%`,
                  backgroundColor: color
                }}
                className="h-full rounded-full transition-all duration-700 ease-out shadow-inner"
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#7A998F]">
              <span>0%</span>
              <span>40%</span>
              <span>70%</span>
              <span>100%</span>
            </div>
          </div>

          {/* Rebalance Callout Trigger */}
          {needsRebalance && (
            <button
              onClick={handleOpenRebalance}
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#1F6B4F] hover:bg-[#16533D] active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-[#1F6B4F]/20 cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#D1F0DE]" />
                <span>Rebalance My Week</span>
              </div>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

