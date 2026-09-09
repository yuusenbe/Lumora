import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  Tag,
  Zap,
  Shield,
  Trash2,
  CheckCircle2,
  Circle,
  Save,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function TaskEditModal({ task, isOpen, onClose, onTaskUpdated }) {
  const { triggerRefresh } = useAuth();

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('academic');
  const [scheduledDate, setScheduledDate] = useState('');
  const [isTimeSpecific, setIsTimeSpecific] = useState(false);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [hours, setHours] = useState(2.0);
  const [priority, setPriority] = useState('medium');
  const [flexibility, setFlexibility] = useState('medium');
  const [status, setStatus] = useState('pending');
  const [isProtected, setIsProtected] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setCategory(task.category || 'academic');
      setScheduledDate(task.scheduled_date || task.deadline || '');
      const st = task.start_time || task.scheduled_start || '';
      const et = task.end_time || task.scheduled_end || '';
      setStartTime(st);
      setEndTime(et);
      setIsTimeSpecific(Boolean(st || et));
      setHours(task.estimated_hours || 2.0);
      setPriority(task.priority || 'medium');
      setFlexibility(task.flexibility || 'medium');
      setStatus(task.status || 'pending');
      setIsProtected(Boolean(task.is_protected));
    }
  }, [task, isOpen]);

  if (!isOpen || !task) return null;

  const handleTimeChange = (newStart, newEnd) => {
    setStartTime(newStart);
    setEndTime(newEnd);
    if (newStart && newEnd) {
      const [sh, sm] = newStart.split(':').map(Number);
      const [eh, em] = newEnd.split(':').map(Number);
      const diff = (eh * 60 + em - (sh * 60 + sm)) / 60.0;
      if (diff > 0) {
        setHours(Math.round(diff * 10) / 10);
      }
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setSaving(true);
    try {
      await api.updateTask(task.id, {
        title: title.trim(),
        category,
        scheduled_date: scheduledDate || null,
        deadline: scheduledDate || null,
        scheduled_start: isTimeSpecific && startTime ? startTime : null,
        scheduled_end: isTimeSpecific && endTime ? endTime : null,
        start_time: isTimeSpecific && startTime ? startTime : null,
        end_time: isTimeSpecific && endTime ? endTime : null,
        estimated_hours: parseFloat(hours) || 2.0,
        priority,
        flexibility,
        status,
        progress: status === 'completed' ? 100 : (task.progress > 0 ? task.progress : 50),
        is_protected: isProtected
      });

      triggerRefresh();
      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to update task:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Are you sure you want to remove "${task.title}"?`)) return;

    setDeleting(true);
    try {
      await api.deleteTask(task.id);
      triggerRefresh();
      if (onTaskUpdated) onTaskUpdated();
      onClose();
    } catch (err) {
      console.error('Failed to delete task:', err);
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#EEF2EC] flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#E8EFE8] text-[#557755] flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#354546]">Edit Activity</h2>
              <p className="text-xs text-[#798990]">Adjust schedule, time window, or shielding</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSave} className="p-6 overflow-y-auto space-y-4">
          {/* Title */}
          <div>
            <label className="text-xs font-bold text-[#354546]">Activity Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Machine Learning Lecture"
              required
              className="w-full mt-1.5 px-3.5 py-2.5 rounded-xl border border-[#D3DCD0] focus:outline-none focus:ring-2 focus:ring-[#88A788] text-sm text-[#354546] bg-[#FAFBF8]"
            />
          </div>

          {/* Date & Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-bold text-[#354546]">Scheduled Date</label>
              <input
                type="date"
                value={scheduledDate}
                onChange={(e) => setScheduledDate(e.target.value)}
                required
                className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#D3DCD0] bg-white text-[#354546] focus:outline-none focus:ring-2 focus:ring-[#88A788]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#354546]">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#D3DCD0] bg-white text-[#354546] focus:outline-none focus:ring-2 focus:ring-[#88A788]"
              >
                <option value="academic">Academic</option>
                <option value="work">Work</option>
                <option value="physical">Physical</option>
                <option value="social">Social</option>
                <option value="errand">Errand</option>
              </select>
            </div>
          </div>

          {/* Time Window toggle & inputs */}
          <div className="space-y-2.5 p-3 rounded-2xl bg-[#F8F9F3] border border-[#E5EAE3]">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-[#354546]">Specific Time Window</span>
                <p className="text-[10px] text-[#798990]">For fixed anchors (shifts, lectures, labs)</p>
              </div>
              <input
                type="checkbox"
                checked={isTimeSpecific}
                onChange={(e) => setIsTimeSpecific(e.target.checked)}
                className="w-4 h-4 accent-[#88A788] cursor-pointer"
              />
            </div>

            {isTimeSpecific && (
              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-[#E5EAE3]">
                <div>
                  <label className="text-[11px] font-bold text-[#354546]">Start Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => handleTimeChange(e.target.value, endTime)}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D3DCD0] bg-white text-[#354546]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-[#354546]">End Time</label>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => handleTimeChange(startTime, e.target.value)}
                    className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D3DCD0] bg-white text-[#354546]"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Duration, Priority, Flexibility */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold text-[#354546]">Duration (Hours)</label>
              <input
                type="number"
                step="0.25"
                min="0.25"
                max="14"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#D3DCD0] bg-white text-[#354546]"
              />
            </div>
            <div>
              <label className="text-xs font-bold text-[#354546]">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#D3DCD0] bg-white text-[#354546]"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="text-xs font-bold text-[#354546]">Flexibility</label>
              <select
                value={flexibility}
                onChange={(e) => setFlexibility(e.target.value)}
                className="w-full mt-1.5 px-3 py-2 text-xs rounded-xl border border-[#D3DCD0] bg-white text-[#354546]"
              >
                <option value="high">High (can move)</option>
                <option value="medium">Medium</option>
                <option value="low">Low (fixed)</option>
              </select>
            </div>
          </div>

          {/* Shielded Focus & Status Toggles */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setIsProtected(!isProtected)}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                isProtected
                  ? 'bg-[#E8EFE8] border-[#88A788] text-[#354546]'
                  : 'bg-white border-[#E5EAE3] text-[#798990] hover:bg-[#F8F9F3]'
              }`}
            >
              <div className="flex items-center space-x-2 text-left">
                <Shield className={`w-4 h-4 ${isProtected ? 'text-[#88A788]' : 'text-slate-400'}`} />
                <div>
                  <div className="text-xs font-bold">Shielded Focus</div>
                  <div className="text-[10px] text-[#798990]">Protects from rebalancing</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={isProtected}
                onChange={() => {}}
                className="w-3.5 h-3.5 accent-[#88A788]"
              />
            </button>

            <button
              type="button"
              onClick={() => setStatus(status === 'completed' ? 'pending' : 'completed')}
              className={`p-3 rounded-2xl border flex items-center justify-between transition-all cursor-pointer ${
                status === 'completed'
                  ? 'bg-[#F0F5EF] border-[#88A788] text-[#354546]'
                  : 'bg-white border-[#E5EAE3] text-[#798990] hover:bg-[#F8F9F3]'
              }`}
            >
              <div className="flex items-center space-x-2 text-left">
                {status === 'completed' ? (
                  <CheckCircle2 className="w-4 h-4 text-[#88A788]" />
                ) : (
                  <Circle className="w-4 h-4 text-slate-400" />
                )}
                <div>
                  <div className="text-xs font-bold">Completed</div>
                  <div className="text-[10px] text-[#798990]">Done for the week</div>
                </div>
              </div>
              <input
                type="checkbox"
                checked={status === 'completed'}
                onChange={() => {}}
                className="w-3.5 h-3.5 accent-[#88A788]"
              />
            </button>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-[#EEF2EC]">
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center space-x-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>{deleting ? 'Removing...' : 'Delete'}</span>
            </button>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-[#D3DCD0] text-xs font-bold text-[#55696B] hover:bg-[#F8F9F3] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-1.5 px-5 py-2 rounded-xl bg-[#88A788] hover:bg-[#759475] active:scale-98 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Changes</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
