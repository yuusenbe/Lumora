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
      colors: ['#88A788', '#B3E8C0', '#F4F1E5', '#C2E6CB']
    });

    try {
      const res = await api.completeRecovery(activeSession?.id);
      setSessionCompletedMsg(res.message || 'Rest completed! +25 Points awarded to your Living Plant Sanctuary 🌿');
      setActiveSession(null);
      setIsTimerRunning(false);
      triggerRefresh();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-9 animate-in fade-in">
      {/* Hero Sanctuary Banner */}
      <div className="lumora-card p-8 sm:p-10 text-center bg-[#F4F8F3] border-[#D5E2D5] space-y-4 relative overflow-hidden">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white border border-[#C2E6CB] text-[#355535] text-xs font-bold shadow-2xs">
          <Sparkles className="w-3.5 h-3.5 text-[#88A788]" />
          <span>Sanctuary Mode</span>
        </div>

        <h1 className="text-3xl sm:text-5xl font-extrabold text-[#354546] tracking-tight">
          YOU'VE DONE ENOUGH TODAY.
        </h1>

        <p className="max-w-xl mx-auto text-[#55696B] text-sm sm:text-base leading-relaxed">
          Your cognitive load has been sustained for days. Rest is not something you have to earn after exhausting yourself — it is what enables tomorrow.
        </p>

        {/* Breathwork rhythm visualizer */}
        <div className="pt-4 flex flex-col items-center justify-center space-y-2">
          <div className="relative flex items-center justify-center w-28 h-28">
            <div className="absolute inset-0 rounded-full bg-[#C2E6CB]/60 serene-pulse" />
            <div className="relative w-20 h-20 rounded-full bg-white border border-[#88A788] shadow-md flex items-center justify-center">
              <span className="text-xs font-bold text-[#354546] tracking-wider uppercase">
                {breathPhase}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-[#798990] font-medium">Box breathing: 4s inhale • 4s hold • 4s exhale</p>
        </div>
      </div>

      {/* Active Restorative Window Timer (if triggered) */}
      {activeSession && (
        <div className="lumora-card p-6 bg-[#354546] text-white rounded-3xl space-y-4 animate-in slide-in-from-top-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700 pb-4">
            <div>
              <span className="text-[11px] font-bold text-[#C2E6CB] uppercase tracking-widest">Active Recovery</span>
              <h3 className="text-lg font-bold text-white">{activeSession.title}</h3>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-3xl font-mono font-bold text-[#EDFFEE]">
                {formatTime(timerSeconds)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-300">
            <p className="max-w-md">{activeSession.description}</p>
            <div className="flex items-center space-x-2 shrink-0">
              <button
                onClick={() => setIsTimerRunning(!isTimerRunning)}
                className="p-2 rounded-xl bg-[#88A788] hover:bg-[#759475] text-white transition-colors cursor-pointer"
                title={isTimerRunning ? "Pause" : "Play"}
              >
                {isTimerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setTimerSeconds(20 * 60)}
                className="p-2 rounded-xl bg-[#4A5A5C] hover:bg-[#586A6C] text-slate-200 transition-colors cursor-pointer"
                title="Reset timer"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={handleCompleteSession}
                className="px-3.5 py-2 rounded-xl bg-[#6E8E6E] hover:bg-[#5E7E5E] text-white font-bold transition-all shadow-xs flex items-center space-x-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Finish & Nurture Sanctuary 🌿</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Celebratory Completion Toast */}
      {sessionCompletedMsg && (
        <div className="p-4 rounded-2xl bg-[#EFF6EE] border border-[#CDE2CC] text-[#2F4F2F] text-xs font-semibold flex items-center justify-between animate-in fade-in shadow-xs">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-[#88A788]" />
            <span>{sessionCompletedMsg}</span>
          </div>
          <button onClick={() => setSessionCompletedMsg('')} className="text-[#557755] hover:underline">
            Dismiss
          </button>
        </div>
      )}

      {/* Suggested Rest Opportunities */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-extrabold text-[#354546] tracking-tight">
            Prescribed Rest Opportunities
          </h2>
          <p className="text-xs text-[#798990]">
            Grounded in your current sleep, cognitive fatigue, and academic pressure
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="lumora-card p-6 space-y-3 flex flex-col justify-between hover:border-[#88A788] transition-all"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-2xl">{rec.icon}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E8EFE8] text-[#355535] border border-[#D5E2D5]">
                    {rec.duration}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#354546]">
                  {rec.title}
                </h3>

                <p className="text-xs text-[#55696B] leading-relaxed">
                  {rec.description}
                </p>
              </div>

              <div className="pt-2 border-t border-[#EEF2EC] flex items-center justify-between">
                <span className="text-[11px] text-[#798990] italic">
                  {rec.reason}
                </span>

                <button
                  onClick={() => handleStartSession(rec)}
                  className="px-3.5 py-1.5 rounded-xl bg-[#88A788] hover:bg-[#759475] active:scale-95 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
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
