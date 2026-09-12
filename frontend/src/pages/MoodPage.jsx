import React, { useState, useEffect } from 'react';
import { Smile, Activity, HeartHandshake, Save, CheckCircle2 } from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { api } from '../api/client';

export default function MoodPage() {
  const [stress, setStress] = useState(3);
  const [mood, setMood] = useState(3);
  const [mentalFatigue, setMentalFatigue] = useState(3);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [history, setHistory] = useState([]);

  const loadData = async () => {
    try {
      try {
        const latest = await api.getLatestCheckin();
        if (latest) {
          setStress(latest.stress || 3);
          setMood(latest.mood || 3);
          setMentalFatigue(latest.mental_fatigue || 3);
        }
      } catch (err) {
        console.warn('Could not fetch latest checkin:', err);
      }

      const hist = await api.getCheckinHistory();
      if (hist && hist.length > 0) {
        setHistory(hist.map(h => ({
          date: h.date?.length > 5 ? h.date.slice(5) : (h.date || 'Today'),
          stress: Number(h.stress) || 3,
          mood: Number(h.mood) || 3,
          fatigue: Number(h.mental_fatigue) || 3
        })));
      } else {
        setHistory([
          { date: 'Mon', stress: 2, mood: 4, fatigue: 2 },
          { date: 'Tue', stress: 3, mood: 4, fatigue: 2 },
          { date: 'Wed', stress: 3, mood: 3, fatigue: 3 },
          { date: 'Thu', stress: 4, mood: 3, fatigue: 4 },
          { date: 'Fri', stress: 4, mood: 2, fatigue: 4 },
          { date: 'Sat', stress: 3, mood: 4, fatigue: 3 },
          { date: 'Today', stress: 3, mood: 3, fatigue: 3 }
        ]);
      }
    } catch (e) {
      console.error('Error fetching checkin history:', e);
      setHistory([
        { date: 'Mon', stress: 2, mood: 4, fatigue: 2 },
        { date: 'Tue', stress: 3, mood: 4, fatigue: 2 },
        { date: 'Wed', stress: 3, mood: 3, fatigue: 3 },
        { date: 'Thu', stress: 4, mood: 3, fatigue: 4 },
        { date: 'Fri', stress: 4, mood: 2, fatigue: 4 },
        { date: 'Sat', stress: 3, mood: 4, fatigue: 3 },
        { date: 'Today', stress: 3, mood: 3, fatigue: 3 }
      ]);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveCheckin = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createCheckin({
        stress,
        mood,
        mental_fatigue: mentalFatigue,
        physical_fatigue: 3,
        sleep_hours: 6.8,
        notes
      });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
      loadData();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in">
      {/* Header */}
      <div className="flex items-center space-x-3.5 border-b border-[#D2E2D8] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0] flex items-center justify-center shadow-2xs">
          <Smile className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-[#152F26] tracking-tight font-display">Mood & Mental State</h1>
          <p className="text-xs text-[#638379]">Tracking daily emotional bandwidth and cognitive saturation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Daily Checkin */}
        <div
          style={{
            background: '#FFFFFF',
            borderColor: '#D2E2D8'
          }}
          className="lg:col-span-5 lumora-card p-6 sm:p-7 space-y-6 shadow-xs border"
        >
          <div className="border-b border-[#D2E2D8] pb-3">
            <h3 className="text-base font-bold text-[#152F26] font-display">Today's Check-in</h3>
            <p className="text-xs text-[#638379]">How does your mind feel right now?</p>
          </div>

          <form onSubmit={handleSaveCheckin} className="space-y-5">
            {/* Stress Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#152F26]">Perceived Stress</span>
                <span className="text-[#D97706] font-bold">{stress} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={stress}
                onChange={(e) => setStress(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E4ECE7] rounded-lg cursor-pointer accent-[#D97706]"
              />
              <div className="flex justify-between text-[10px] text-[#638379] font-medium">
                <span>1 — Calm & centered</span>
                <span>5 — Overwhelmed</span>
              </div>
            </div>

            {/* Mood Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#152F26]">Mood Level</span>
                <span className="text-[#1F6B4F] font-bold">{mood} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E4ECE7] rounded-lg cursor-pointer accent-[#1F6B4F]"
              />
              <div className="flex justify-between text-[10px] text-[#638379] font-medium">
                <span>1 — Depleted</span>
                <span>5 — Energized</span>
              </div>
            </div>

            {/* Mental Fatigue Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#152F26]">Cognitive Fatigue</span>
                <span className="text-[#2B6CB0] font-bold">{mentalFatigue} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={mentalFatigue}
                onChange={(e) => setMentalFatigue(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E4ECE7] rounded-lg cursor-pointer accent-[#2B6CB0]"
              />
              <div className="flex justify-between text-[10px] text-[#638379] font-medium">
                <span>1 — Fresh focus</span>
                <span>5 — Heavy brain fog</span>
              </div>
            </div>

            {/* Optional reflection notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[#152F26]">Reflective note (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Felt rushed before lecture, but study block went well."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D2E2D8] bg-[#EDF3EE] resize-none focus:outline-none focus:ring-2 focus:ring-[#1F6B4F]/20 focus:border-[#1F6B4F] text-[#152F26]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-primary w-full py-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center space-x-2 cursor-pointer"
            >
              {saving ? <span>Logging check-in...</span> : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update My Capacity</span>
                </>
              )}
            </button>

            {savedSuccess && (
              <p className="text-xs text-center text-[#1F6B4F] font-bold flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Check-in recorded! Capacity recalibrated.</span>
              </p>
            )}
          </form>
        </div>

        {/* Right: Trend Visualization */}
        <div
          style={{
            background: '#FFFFFF',
            borderColor: '#D2E2D8'
          }}
          className="lg:col-span-7 lumora-card p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-xs border"
        >
          <div className="border-b border-[#D2E2D8] pb-3">
            <h3 className="text-base font-bold text-[#152F26] font-display">Weekly Stress & Bandwidth Trend</h3>
            <p className="text-xs text-[#638379]">Visualizing pressure patterns across your semester</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#D2E2D8" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#638379' }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#638379' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(21, 47, 38, 0.08)',
                    border: '1px solid #D2E2D8',
                    fontSize: '12px',
                    color: '#152F26'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  name="Stress Level"
                  stroke="#D97706"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#D97706' }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood Bandwidth"
                  stroke="#1F6B4F"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: '#1F6B4F' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 rounded-xl bg-[#EDF3EE] border border-[#D2E2D8] text-xs text-[#638379] leading-relaxed">
            <strong className="text-[#152F26] font-bold">Observation:</strong> When stress remains at 4+ for consecutive days, the recommendation engine automatically increases buffer times around your focus blocks.
          </div>
        </div>
      </div>
    </div>
  );
}
