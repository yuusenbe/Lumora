import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function CapacityCard({ capacity, onRebalanceTrigger }) {
  const { setRebalanceModalOpen, setActiveRebalancePlan } = useAuth();

  if (!capacity) return null;

  const score = capacity.capacity_score || 65;
  const status = capacity.status || 'Moderate load';
  const explanation = capacity.explanation;
  const topContributors = capacity.top_contributors || [];
  const needsRebalance = capacity.needs_rebalance;

  // Soft Sage / Mint / Warm Sand brand status colors
  const getCapacityColor = (s) => {
    if (s < 40) return '#88A788'; // soft sage
    if (s < 70) return '#7E9F7E'; // calm sage
    if (s < 85) return '#C89B6D'; // warm sand amber
    return '#C86D6D'; // muted rose
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

  return (
    <div className="lumora-card p-6 sm:p-8 bg-white border border-[#E5EAE3] relative overflow-hidden">
      {/* Gentle background decorative glow in soft sage */}
      <div
        style={{
          background: `radial-gradient(circle, #88A78818 0%, transparent 70%)`
        }}
        className="absolute -right-20 -top-20 w-80 h-80 rounded-full blur-3xl pointer-events-none"
      />

      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        {/* Left Info */}
        <div className="space-y-3 max-w-xl">
          <div className="flex items-center space-x-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#798990]">
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
            <span className="text-5xl sm:text-6xl font-extrabold text-[#354546] tracking-tight">
              {score}%
            </span>
            <span className="text-[#798990] text-sm font-medium">
              of recommended weekly energy envelope
            </span>
          </div>

          <p className="text-[#55696B] text-sm sm:text-base leading-relaxed">
            {explanation}
          </p>

          {/* Top Contributors Tags */}
          {topContributors.length > 0 && (
            <div className="pt-1 flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-[#798990]">Main drivers:</span>
              {topContributors.map((c, idx) => (
                <span
                  key={idx}
                  className="text-xs bg-[#F4F8F3] text-[#405658] px-2.5 py-1 rounded-lg font-medium border border-[#DEE6DD]"
                >
                  {c}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Right Metric Gauge & Rebalance Action matching mockup */}
        <div className="w-full lg:w-72 flex flex-col items-center lg:items-end space-y-4">
          {/* Capacity Progress Bar in Soft Sage */}
          <div className="w-full space-y-1.5">
            <div className="flex justify-between text-xs font-medium text-[#798990]">
              <span>Rest & Reserve</span>
              <span>Strain Limit</span>
            </div>
            <div className="w-full h-3.5 bg-[#EBF0E9] rounded-full overflow-hidden p-0.5 border border-[#DFE6DD]">
              <div
                style={{
                  width: `${Math.min(100, Math.max(5, score))}%`,
                  backgroundColor: color
                }}
                className="h-full rounded-full transition-all duration-700 ease-out shadow-inner"
              />
            </div>
            <div className="flex justify-between text-[11px] text-[#8A9B9D]">
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
              className="w-full flex items-center justify-between px-4 py-3 rounded-2xl bg-[#88A788] hover:bg-[#759475] active:scale-98 text-white text-xs font-bold transition-all shadow-md shadow-[#88A788]/20 cursor-pointer group"
            >
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-[#EBF4EB]" />
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
