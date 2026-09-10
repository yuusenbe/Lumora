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
      <div className="flex items-center space-x-3 border-b border-[#E5EAE3] pb-5">
        <div className="w-12 h-12 rounded-2xl bg-[#E8EFE8] text-[#88A788] flex items-center justify-center">
          <Smile className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold text-[#354546] tracking-tight">Mood & Mental State</h1>
          <p className="text-xs text-[#798990]">Tracking daily emotional bandwidth and cognitive saturation</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Interactive Daily Checkin */}
        <div className="lg:col-span-5 lumora-card p-6 sm:p-7 space-y-6">
          <div className="border-b border-[#E5EAE3] pb-3">
            <h3 className="text-sm font-bold text-[#354546]">Today's Check-in</h3>
            <p className="text-xs text-[#798990]">How does your mind feel right now?</p>
          </div>

          <form onSubmit={handleSaveCheckin} className="space-y-5">
            {/* Stress Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#354546]">Perceived Stress</span>
                <span className="text-[#88A788] font-bold">{stress} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={stress}
                onChange={(e) => setStress(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E8EFE8] rounded-lg cursor-pointer accent-[#88A788]"
              />
              <div className="flex justify-between text-[10px] text-[#798990]">
                <span>1 — Calm & centered</span>
                <span>5 — Overwhelmed</span>
              </div>
            </div>

            {/* Mood Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#354546]">Mood Level</span>
                <span className="text-[#88A788] font-bold">{mood} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={mood}
                onChange={(e) => setMood(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E8EFE8] rounded-lg cursor-pointer accent-[#88A788]"
              />
              <div className="flex justify-between text-[10px] text-[#798990]">
                <span>1 — Depleted</span>
                <span>5 — Energized</span>
              </div>
            </div>

            {/* Mental Fatigue Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-[#354546]">Cognitive Fatigue</span>
                <span className="text-[#88A788] font-bold">{mentalFatigue} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={mentalFatigue}
                onChange={(e) => setMentalFatigue(parseInt(e.target.value))}
                className="w-full h-2 bg-[#E8EFE8] rounded-lg cursor-pointer accent-[#88A788]"
              />
              <div className="flex justify-between text-[10px] text-[#798990]">
                <span>1 — Fresh focus</span>
                <span>5 — Heavy brain fog</span>
              </div>
            </div>

            {/* Optional reflection notes */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-[#354546]">Reflective note (optional)</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g., Felt rushed before lecture, but study block went well."
                rows={2}
                className="w-full px-3 py-2 text-xs rounded-xl border border-[#D3DCD0] bg-[#F8F9F3] resize-none focus:outline-none focus:ring-2 focus:ring-[#88A788] text-[#354546]"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="w-full py-3 rounded-2xl bg-[#88A788] hover:bg-[#759475] text-white text-xs font-bold transition-all shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              {saving ? <span>Logging check-in...</span> : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Update My Capacity</span>
                </>
              )}
            </button>

            {savedSuccess && (
              <p className="text-xs text-center text-[#88A788] font-semibold flex items-center justify-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Check-in recorded! Capacity recalibrated.</span>
              </p>
            )}
          </form>
        </div>

        {/* Right: Trend Visualization */}
        <div className="lg:col-span-7 lumora-card p-6 sm:p-7 space-y-5 flex flex-col justify-between">
          <div className="border-b border-[#E5EAE3] pb-3">
            <h3 className="text-sm font-bold text-[#354546]">Weekly Stress & Bandwidth Trend</h3>
            <p className="text-xs text-[#798990]">Visualizing pressure patterns across your semester</p>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ top: 10, right: 15, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5EAE3" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#798990' }} />
                <YAxis domain={[1, 5]} ticks={[1, 2, 3, 4, 5]} tick={{ fontSize: 11, fill: '#798990' }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#FFFFFF',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px -2px rgba(53,69,70,0.1)',
                    border: '1px solid #E5EAE3',
                    fontSize: '12px'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="stress"
                  name="Stress Level"
                  stroke="#C89B6D"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
                <Line
                  type="monotone"
                  dataKey="mood"
                  name="Mood Bandwidth"
                  stroke="#88A788"
                  strokeWidth={2.5}
                  dot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3.5 rounded-xl bg-[#F8F9F3] border border-[#E5EAE3] text-xs text-[#354546] leading-relaxed">
            <strong className="text-[#354546]">Observation:</strong> When stress remains at 4+ for consecutive days, the recommendation engine automatically increases buffer times around your focus blocks.
          </div>
        </div>
      </div>
    </div>
  );
}
