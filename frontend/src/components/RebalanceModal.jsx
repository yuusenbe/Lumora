import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Sparkles,
  CheckCircle2,
  ArrowDown,
  ArrowRight,
  Shield,
  Clock,
  Calendar,
  AlertTriangle,
  HeartHandshake
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function RebalanceModal({ isOpen, onClose, plan, onApplied }) {
  const { setCurrentView, triggerRefresh } = useAuth();
  const [applying, setApplying] = useState(false);
  const [acceptedSuccess, setAcceptedSuccess] = useState(false);

  if (!isOpen || !plan) return null;

  const beforeLoad = plan.before_load || 91;
  const afterLoad = plan.after_load || 73;
  const reduction = plan.load_reduction || (beforeLoad - afterLoad);
  const recommendations = plan.recommendations || [];

  const handleClose = () => {
    setAcceptedSuccess(false);
    onClose();
  };

  const handleReturnToDashboard = async () => {
    if (onApplied) await onApplied();
    triggerRefresh();
    setCurrentView('dashboard');
    handleClose();
  };

  const handleAccept = async () => {
    setApplying(true);
    try {
      await api.applyRebalance();
      setAcceptedSuccess(true);

      // Micro-interaction celebration
      confetti({
        particleCount: 50,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#1F6B4F', '#2E855F', '#BCE7CD']
      });

      if (onApplied) await onApplied();
      triggerRefresh();
    } catch (err) {
      console.error(err);
    } finally {
      setApplying(false);
    }
  };

  const handleDecline = async () => {
    try {
      await api.declineRebalance();
    } catch (err) {
      console.error(err);
    }
    handleClose();
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'move':
        return { label: 'MOVE', color: 'bg-[#EBF4FB] text-[#2B6CB0] border-[#2B6CB0]/30' };
      case 'reduce':
        return { label: 'REDUCE', color: 'bg-[#E3F2E9] text-[#1F6B4F] border-[#C2E2D0]' };
      case 'protect':
        return { label: 'PROTECT', color: 'bg-[#FAF6EC] text-[#645233] border-[#DFD6C3]' };
      case 'postpone':
        return { label: 'POSTPONE', color: 'bg-[#EDF3EE] text-[#638379] border-[#D2E2D8]' };
      default:
        return { label: 'REBALANCE', color: 'bg-[#E3F2E9] text-[#1F6B4F] border-[#C2E2D0]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152F26]/45 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#D2E2D8] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-[#D2E2D8] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-[#FAF6EC] text-[#D97706] border border-[#DFD6C3] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#152F26] font-display">
                AI Load Balancer
              </h2>
              <p className="text-xs text-[#638379]">
                Protecting your capacity before overload becomes burnout
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-[#638379] hover:text-[#152F26] hover:bg-[#EDF3EE] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:px-8 overflow-y-auto space-y-6">
          {!acceptedSuccess ? (
            <>
              {/* Overload Alert & Impact Comparison */}
              <div className="bg-[#FAF6EC] rounded-2xl p-5 border border-[#DFD6C3] space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-[#D97706] mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-[#645233]">
                      Your week is approaching overload limits.
                    </h3>
                    <p className="text-xs text-[#645233]/90 leading-relaxed mt-1">
                      Multiple high-cognitive tasks, part-time commitments, and everyday errands are converging midweek. Here is a safer configuration that protects your primary semester milestone:
                    </p>
                  </div>
                </div>

                {/* Before / After Load Comparison */}
                <div className="grid grid-cols-3 gap-3 bg-white p-4 rounded-xl border border-[#DFD6C3] shadow-2xs text-center items-center">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-[#638379]">Current Load</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-rose-500 font-display">{beforeLoad}%</p>
                    <span className="text-[10px] font-semibold text-rose-600">High Strain</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0] flex items-center justify-center font-bold text-xs shadow-2xs">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#1F6B4F] mt-1">
                      ↓ {reduction}%
                    </span>
                    <span className="text-[10px] text-[#638379]">Breathing room</span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase font-bold text-[#638379]">Projected Load</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#1F6B4F] font-display">{afterLoad}%</p>
                    <span className="text-[10px] font-semibold text-[#1F6B4F]">Balanced Range</span>
                  </div>
                </div>
              </div>

              {/* Proposed Changes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#638379]">
                  Recommended Schedule Adjustments:
                </h4>

                <div className="space-y-2.5">
                  {recommendations.map((rec) => {
                    const badge = getTypeBadge(rec.type);
                    return (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-2xl bg-white border border-[#D2E2D8] shadow-2xs hover:border-[#1F6B4F]/60 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs font-bold text-[#152F26]">
                              {rec.title}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-[#638379] leading-relaxed pl-1">
                          {rec.details}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-[#638379] pt-1 border-t border-[#D2E2D8]">
                          <span className="text-[#1F6B4F] font-medium">{rec.impact}</span>
                          {rec.proposed_state && (
                            <span className="font-mono text-[#638379]">→ {rec.proposed_state}</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons: Accept / Decline */}
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                <button
                  onClick={handleAccept}
                  disabled={applying}
                  className="btn-primary w-full sm:flex-1 py-3.5 px-6 rounded-xl text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#D1F0DE]" />
                  <span>{applying ? 'Updating schedule...' : 'Accept Changes'}</span>
                </button>

                <button
                  onClick={handleDecline}
                  className="w-full sm:w-auto py-3 px-5 rounded-xl bg-[#EDF3EE] hover:bg-[#E3F2E9] text-[#152F26] border border-[#D2E2D8] text-xs font-bold transition-all cursor-pointer"
                >
                  Decline (Keep Current Schedule)
                </button>
              </div>
            </>
          ) : (
            /* Post-Accept Success View */
            <div className="py-6 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0] flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-[#152F26] font-display">
                  Schedule Rebalanced Successfully!
                </h3>
                <p className="text-xs text-[#638379] max-w-md mx-auto leading-relaxed">
                  Your flexible commitments have been safely redistributed. Your projected workload dropped from <strong className="text-[#152F26]">{beforeLoad}%</strong> to <strong className="text-[#1F6B4F]">{afterLoad}%</strong>.
                </p>
              </div>

              {/* Suggested Recovery CTA */}
              <div className="bg-[#E3F2E9] border border-[#C2E2D0] rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center space-x-2 text-[#152F26] font-bold text-xs">
                  <HeartHandshake className="w-4 h-4 text-[#1F6B4F]" />
                  <span>Next Step: Give yourself permission to rest</span>
                </div>
                <p className="text-xs text-[#638379] leading-relaxed">
                  You've operated at high cognitive load for days. Tonight isn't another task to complete. Take 30 minutes outside.
                </p>
                <button
                  onClick={() => {
                    handleClose();
                    setCurrentView('recovery');
                  }}
                  className="mt-2 text-xs font-bold text-[#1F6B4F] hover:text-[#16533D] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open Active Recovery</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReturnToDashboard}
                  className="btn-primary px-6 py-2.5 rounded-xl text-white text-xs font-bold transition-colors cursor-pointer active:scale-98 shadow-sm"
                >
                  Return to Dashboard
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
