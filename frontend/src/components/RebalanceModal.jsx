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
        colors: ['#0D9488', '#10B981', '#3B82F6']
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
        return { label: 'MOVE', color: 'bg-[#F4F1E5] text-[#354546] border-[#E2DEC9]' };
      case 'reduce':
        return { label: 'REDUCE', color: 'bg-[#E8EFE8] text-[#354546] border-[#88A788]/50' };
      case 'protect':
        return { label: 'PROTECT', color: 'bg-amber-50 text-amber-800 border-amber-200' };
      case 'postpone':
        return { label: 'POSTPONE', color: 'bg-[#F4F1E5] text-[#798990] border-[#E2DEC9]' };
      default:
        return { label: 'REBALANCE', color: 'bg-[#B3E8C0] text-[#354546] border-[#94B094]' };
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 sm:px-8 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-800">
                AI Load Balancer
              </h2>
              <p className="text-xs text-slate-500">
                Protecting your capacity before overload becomes burnout
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6">
          {!acceptedSuccess ? (
            <>
              {/* Overload Alert & Impact Comparison */}
              <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/40 rounded-2xl p-5 border border-amber-200/70 space-y-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                  <div>
                    <h3 className="text-sm font-bold text-amber-900">
                      Your week is approaching overload limits.
                    </h3>
                    <p className="text-xs text-amber-800/90 leading-relaxed mt-1">
                      Multiple high-cognitive tasks, part-time commitments, and everyday errands are converging midweek. Here is a safer configuration that protects your primary semester milestone:
                    </p>
                  </div>
                </div>

                {/* Before / After Load Comparison */}
                <div className="grid grid-cols-3 gap-3 bg-white/90 p-4 rounded-xl border border-amber-200/50 shadow-xs text-center items-center">
                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400">Current Load</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-rose-500">{beforeLoad}%</p>
                    <span className="text-[10px] font-semibold text-rose-600">High Strain</span>
                  </div>

                  <div className="flex flex-col items-center justify-center">
                    <div className="w-9 h-9 rounded-full bg-[#E8EFE8] text-[#557755] flex items-center justify-center font-bold text-xs shadow-inner">
                      <ArrowDown className="w-4 h-4" />
                    </div>
                    <span className="text-[11px] font-bold text-[#557755] mt-1">
                      ↓ {reduction}%
                    </span>
                    <span className="text-[10px] text-slate-400">Breathing room</span>
                  </div>

                  <div>
                    <span className="text-[11px] uppercase font-bold text-slate-400">Projected Load</span>
                    <p className="text-2xl sm:text-3xl font-extrabold text-[#6E8E6E]">{afterLoad}%</p>
                    <span className="text-[10px] font-semibold text-[#6E8E6E]">Balanced Range</span>
                  </div>
                </div>
              </div>

              {/* Proposed Changes */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                  Recommended Schedule Adjustments:
                </h4>

                <div className="space-y-2.5">
                  {recommendations.map((rec) => {
                    const badge = getTypeBadge(rec.type);
                    return (
                      <div
                        key={rec.id}
                        className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs hover:border-slate-300 transition-all space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center space-x-2">
                            <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md border ${badge.color}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {rec.title}
                            </span>
                          </div>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed pl-1">
                          {rec.details}
                        </p>

                        <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1 border-t border-slate-100">
                          <span className="text-[#557755] font-medium">{rec.impact}</span>
                          {rec.proposed_state && (
                            <span className="font-mono text-slate-500">→ {rec.proposed_state}</span>
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
                  className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-[#88A788] hover:bg-[#759475] active:scale-98 text-white text-xs sm:text-sm font-bold shadow-lg shadow-[#88A788]/25 transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <CheckCircle2 className="w-4 h-4 text-[#EDFFEE]" />
                  <span>{applying ? 'Updating schedule...' : 'Accept Changes'}</span>
                </button>

                <button
                  onClick={handleDecline}
                  className="w-full sm:w-auto py-3 px-5 rounded-2xl bg-[#F4F1E5] hover:bg-[#EAE6D6] text-[#354546] border border-[#DFD9C0] text-xs font-bold transition-all cursor-pointer"
                >
                  Decline (Keep Current Schedule)
                </button>
              </div>
            </>
          ) : (
            /* Post-Accept Success View */
            <div className="py-6 text-center space-y-5 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-3xl bg-[#E8EFE8] text-[#557755] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-bold text-slate-800">
                  Schedule Rebalanced Successfully!
                </h3>
                <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
                  Your flexible commitments have been safely redistributed. Your projected workload dropped from <strong className="text-slate-800">{beforeLoad}%</strong> to <strong className="text-[#6E8E6E]">{afterLoad}%</strong>.
                </p>
              </div>

              {/* Suggested Recovery CTA */}
              <div className="bg-[#F0F6EF] border border-[#D5E4D4] rounded-2xl p-4 max-w-md mx-auto text-left space-y-2">
                <div className="flex items-center space-x-2 text-[#355535] font-bold text-xs">
                  <HeartHandshake className="w-4 h-4" />
                  <span>Next Step: Give yourself permission to rest</span>
                </div>
                <p className="text-xs text-[#557755] leading-relaxed">
                  You've operated at high cognitive load for days. Tonight isn't another task to complete. Take 30 minutes outside.
                </p>
                <button
                  onClick={() => {
                    handleClose();
                    setCurrentView('recovery');
                  }}
                  className="mt-2 text-xs font-bold text-[#354546] hover:underline flex items-center space-x-1 cursor-pointer"
                >
                  <span>Open Recovery Sanctuary</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleReturnToDashboard}
                  className="px-6 py-2.5 rounded-xl bg-slate-800 text-white text-xs font-bold hover:bg-slate-900 transition-colors cursor-pointer active:scale-98 shadow-sm"
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
