import React, { useState, useEffect } from 'react';
import {
  HeartHandshake,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  CheckCircle2,
  Wind,
  Moon,
  Coffee,
  Trees,
  Headphones
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RecoveryPage() {
  const { triggerRefresh } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [activeSession, setActiveSession] = useState(null);
  const [timerSeconds, setTimerSeconds] = useState(20 * 60);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [breathPhase, setBreathPhase] = useState('Inhale'); // Inhale (4s), Hold (4s), Exhale (4s)
  const [sessionCompletedMsg, setSessionCompletedMsg] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const items = await api.getRecoveryRecommendations();
        setRecommendations(items);
      } catch (e) {
        console.error(e);
      }
    }
    load();
  }, []);

  // Timer countdown
  useEffect(() => {
    let interval = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(s => s - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  // Breathwork rhythm cycle (12 second total: 4s inhale, 4s hold, 4s exhale)
  useEffect(() => {
    const cycle = setInterval(() => {
      setBreathPhase(prev => {
        if (prev === 'Inhale') return 'Hold';
        if (prev === 'Hold') return 'Exhale';
        return 'Inhale';
      });
    }, 4000);
    return () => clearInterval(cycle);
  }, []);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleStartSession = async (item) => {
    setActiveSession(item);
    setTimerSeconds(20 * 60);
    setIsTimerRunning(true);
    setSessionCompletedMsg('');
    try {
      await api.startRecovery(item.id);
    } catch (e) {
      console.error(e);
    }
  };

  const handleCompleteSession = async () => {
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#10B981', '#0D9488', '#38BDF8']
    });

    try {
      const res = await api.completeRecovery(activeSession?.id);
      setSessionCompletedMsg(res.message || 'Rest session completed! Your cognitive capacity has been refreshed.');
      setActiveSession(null);
      setIsTimerRunning(false);
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 animate-in fade-in">
      {/* Hero Recovery Banner */}
      <div
        style={{
          background: '#FFFFFF',
          borderColor: '#D2E2D8'
        }}
        className="lumora-card p-8 sm:p-12 text-center space-y-5 relative overflow-hidden shadow-xs border"
      >
        <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-[#E3F2E9] text-[#152F26] border border-[#C2E2D0] text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
          <span>Active Recovery</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-[#152F26] tracking-tight font-display">
          YOU'VE DONE ENOUGH TODAY.
        </h1>

        <p className="max-w-xl mx-auto text-[#4A675E] text-sm sm:text-base leading-relaxed font-medium">
          Your cognitive load has been sustained for days. Rest is not something you have to earn after exhausting yourself — it is what enables tomorrow.
        </p>

        {/* Breathwork rhythm visualizer */}
        <div className="pt-4 flex flex-col items-center justify-center space-y-3">
          <div className="relative flex items-center justify-center w-32 h-32">
            <div className="absolute inset-0 rounded-full bg-[#1F6B4F]/20 serene-pulse" />
            <div className="relative w-24 h-24 rounded-full bg-white border-2 border-[#1F6B4F] shadow-md flex items-center justify-center">
              <span className="text-xs font-black text-[#152F26] tracking-wider uppercase">
                {breathPhase}
              </span>
            </div>
          </div>
          <p className="text-xs text-[#4A675E] font-semibold">Box breathing: 4s inhale • 4s hold • 4s exhale</p>
        </div>
      </div>

      {/* Active Restorative Window Timer (if triggered) */}
      {activeSession && (
        <div className="lumora-card p-6 bg-[#152F26] text-white rounded-3xl space-y-4 animate-in slide-in-from-top-4 shadow-xl border border-[#0D211A]">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#24473C] pb-4">
            <div>
              <span className="text-[11px] font-bold text-[#86EFAC] uppercase tracking-widest">Active Recovery</span>
              <h3 className="text-lg font-bold text-white font-display">{activeSession.title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-mono font-bold text-[#E3F2E9]">
                {formatTime(timerSeconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <p className="max-w-md text-[#E3F2E9]/80">{activeSession.description}</p>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2 rounded-xl bg-[#1F6B4F] hover:bg-[#16533D] text-white transition-colors cursor-pointer"
                title={isTimerRunning ? "Pause" : "Play"}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setTimerSeconds(20 * 60)}
                className="p-2 rounded-xl bg-[#0D211A] hover:bg-[#07130E] text-slate-200 transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCompleteSession}
                className="btn-primary px-4 py-2 rounded-xl text-white font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Complete Session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Completion Toast */}
      {sessionCompletedMsg && (
        <div className="p-4 rounded-2xl bg-[#E3F2E9] border border-[#C2E2D0] text-[#152F26] text-xs font-semibold flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#1F6B4F]" />
            <span>{sessionCompletedMsg}</span>
          </div>
          <button onClick={() => setSessionCompletedMsg('')} className="text-[#1F6B4F] hover:underline font-bold">
            Dismiss
          </button>
        </div>
      )}

      {/* Suggested Rest Opportunities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-[#152F26] tracking-tight font-display">
            Prescribed Rest Opportunities
          </h2>
          <p className="text-xs text-[#4A675E]">
            Grounded in your current sleep, cognitive fatigue, and academic pressure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              style={{
                background: '#FFFFFF',
                borderColor: '#D2E2D8'
              }}
              className="lumora-card p-6 space-y-3.5 flex flex-col justify-between hover:border-[#1F6B4F]/60 transition-all shadow-xs hover:shadow-md border"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{rec.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#152F26] border border-[#D2E2D8]">
                    {rec.duration}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#152F26] font-display">
                  {rec.title}
                </h3>

                <p className="text-xs text-[#4A675E] leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#D2E2D8] flex items-center justify-between">
                <span className="text-[11px] text-[#638379] italic">
                  {rec.reason}
                </span>

                <button
                  onClick={() => handleStartSession(rec)}
                  className="btn-primary px-3.5 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Start Rest
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
