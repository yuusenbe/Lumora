import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Check,
  Clock,
  Calendar,
  AlertCircle,
  Tag,
  Zap,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';

export default function SmartCaptureModal({ isOpen, onClose, onTaskCreated }) {
  const { setRebalanceModalOpen, setActiveRebalancePlan, captureInitialDate, setCaptureInitialDate } = useAuth();

  const [inputPrompt, setInputPrompt] = useState('');
  const [parsing, setParsing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [parsedResult, setParsedResult] = useState(null);
  const [isEditingManual, setIsEditingManual] = useState(false);

  // Editable fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('academic');
  const [hours, setHours] = useState(2.0);
  const [deadline, setDeadline] = useState('');
  const [priority, setPriority] = useState('medium');
  const [flexibility, setFlexibility] = useState('medium');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [isTimeSpecific, setIsTimeSpecific] = useState(false);
  const [scheduledDate, setScheduledDate] = useState('');
  const [recommendedSlots, setRecommendedSlots] = useState([]);
  const [selectedSlotIndex, setSelectedSlotIndex] = useState(0);
  const [isFindingSlots, setIsFindingSlots] = useState(false);
  const [showPreferablePicker, setShowPreferablePicker] = useState(false);

  useEffect(() => {
    if (isOpen && captureInitialDate) {
      setScheduledDate(captureInitialDate);
      setDeadline(captureInitialDate);
    }
  }, [isOpen, captureInitialDate]);

  const handleClose = () => {
    if (setCaptureInitialDate) setCaptureInitialDate(null);
    setRecommendedSlots([]);
    setShowPreferablePicker(false);
    onClose();
  };

  if (!isOpen) return null;

  const demoChips = [
    "I need to help my dad with creating poster by before sunday",
    "Campus Library Shift tomorrow 1pm to 4:30pm",
    "I need to finish my FYP methodology by Thursday and it will take around 4 hours.",
    "Part-time cafe shift Saturday 2pm to 6pm.",
    "Machine Learning Lecture Monday 10am to 12pm.",
    "Friend's birthday dinner Wednesday evening.",
    "Need to buy groceries."
  ];

  const handleParse = async (textToParse) => {
    const query = textToParse || inputPrompt;
    if (!query.trim()) return;

    setParsing(true);
    setParsedResult(null);
    try {
      const data = await api.aiParseTask(query);
      setParsedResult(data);
      setTitle(data.title);
      setCategory(data.category);
      setHours(data.estimated_hours);
      setDeadline(data.deadline || '');
      setScheduledDate(data.scheduled_date || '');
      setPriority(data.priority);
      setFlexibility(data.flexibility);
      setRecommendedSlots(data.recommended_slots || []);
      setSelectedSlotIndex(0);
      if (data.start_time) {
        setStartTime(data.start_time);
        setEndTime(data.end_time || '');
        setIsTimeSpecific(true);
      } else {
        setStartTime('');
        setEndTime('');
        setIsTimeSpecific(false);
      }
    } catch (err) {
      console.error(err);
      // Fallback manual defaults
      setTitle(query);
      setParsedResult({
        title: query,
        category: 'academic',
        estimated_hours: 2.0,
        deadline: 'This week',
        priority: 'medium',
        flexibility: 'medium',
        raw_understanding: 'Manually categorized task'
      });
      setRecommendedSlots([]);
      setIsTimeSpecific(false);
    } finally {
      setParsing(false);
    }
  };

  const handleSelectSlot = (slot, index) => {
    setSelectedSlotIndex(index);
    setScheduledDate(slot.date);
    setStartTime(slot.start_time);
    setEndTime(slot.end_time);
    setIsTimeSpecific(true);
  };

  const handlePreferableDateChange = async (prefDate) => {
    setScheduledDate(prefDate);
    if (!prefDate) return;
    setIsFindingSlots(true);
    try {
      const slots = await api.recommendSlots({
        estimated_hours: hours,
        deadline,
        preferred_date: prefDate,
        category
      });
      if (slots && slots.length > 0) {
        setRecommendedSlots(slots);
        setSelectedSlotIndex(0);
        setStartTime(slots[0].start_time);
        setEndTime(slots[0].end_time);
        setIsTimeSpecific(true);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsFindingSlots(false);
    }
  };

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

  const handleSaveToWeek = async () => {
    if (!title.trim()) return;

    setSaving(true);
    try {
      const result = await api.createTask({
        title: title.trim(),
        category,
        estimated_hours: parseFloat(hours) || 2.0,
        deadline: scheduledDate || deadline || 'This week',
        scheduled_date: scheduledDate || null,
        scheduled_start: isTimeSpecific && startTime ? startTime : null,
        scheduled_end: isTimeSpecific && endTime ? endTime : null,
        start_time: isTimeSpecific && startTime ? startTime : null,
        end_time: isTimeSpecific && endTime ? endTime : null,
        priority,
        flexibility
      });

      if (onTaskCreated) onTaskCreated(result.task);

      if (result.needs_rebalance && result.rebalance_plan) {
        setActiveRebalancePlan(result.rebalance_plan);
        setRebalanceModalOpen(true);
      }

      handleClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#152F26]/40 backdrop-blur-sm animate-in fade-in">
      <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#D2E2D8] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-[#D2E2D8] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-2xl bg-[#E3F2E9] text-[#1F6B4F] border border-[#C2E2D0] flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#152F26] font-display">Smart Capture</h2>
              <p className="text-xs text-[#638379]">Express what you're carrying in your own words</p>
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
        <div className="p-6 overflow-y-auto space-y-4">
          {/* Natural language input */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-[#152F26]">What's on your mind?</label>
            <div className="relative">
              <textarea
                value={inputPrompt}
                onChange={(e) => setInputPrompt(e.target.value)}
                placeholder="e.g., I need to finish my FYP methodology by Thursday and it probably takes around 4 hours."
                rows={3}
                className="w-full px-4 py-3 rounded-2xl border border-[#D2E2D8] focus:outline-none focus:ring-2 focus:ring-[#1F6B4F]/20 focus:border-[#1F6B4F] text-sm text-[#152F26] placeholder:text-[#638379]/60 resize-none bg-[#EDF3EE]"
              />
            </div>

            {/* Quick Demo Chips */}
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] font-medium text-[#638379]">Quick student scenarios:</p>
              <div className="flex flex-wrap gap-1.5">
                {demoChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setInputPrompt(chip);
                      handleParse(chip);
                    }}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-[#EDF3EE] hover:bg-[#E3F2E9] hover:text-[#152F26] text-[#638379] transition-colors cursor-pointer text-left border border-[#D2E2D8]"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={() => handleParse()}
                disabled={parsing || !inputPrompt.trim()}
                className="btn-primary flex items-center space-x-1.5 px-4 py-2 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shadow-xs"
              >
                {parsing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-[#D1F0DE]" />
                    <span>Extract with AI</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* AI UNDERSTANDS PREVIEW */}
          {parsedResult && (
            <div className="rounded-2xl border border-[#D2E2D8] bg-[#EDF3EE] p-4 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#152F26] uppercase tracking-wider flex items-center space-x-1.5">
                  <Check className="w-3.5 h-3.5 text-[#1F6B4F]" />
                  <span>AI Understands</span>
                </span>
                <button
                  onClick={() => setIsEditingManual(!isEditingManual)}
                  className="text-xs text-[#1F6B4F] hover:underline font-bold cursor-pointer"
                >
                  {isEditingManual ? 'Done editing' : 'Edit details'}
                </button>
              </div>

              {/* AI Recommended Clash-Free Execution Window */}
              {recommendedSlots && recommendedSlots.length > 0 && (
                <div className="p-4 rounded-2xl bg-[#E3F2E9] border border-[#C2E2D0] space-y-3 shadow-xs animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-[#1F6B4F]" />
                      <span className="text-xs font-bold text-[#152F26]">
                        AI Recommended Execution Window
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C2E2D0] text-[#152F26] border border-[#A5D4BA]">
                      0 Clashes • Buffer Preserved
                    </span>
                  </div>

                  <p className="text-[11px] text-[#638379] leading-relaxed">
                    Lumora scanned Alex's schedule and found clash-free windows that protect workload capacity:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {recommendedSlots.map((slot, sIdx) => {
                      const isSelected = selectedSlotIndex === sIdx || (scheduledDate === slot.date && startTime === slot.start_time);
                      return (
                        <button
                          key={sIdx}
                          type="button"
                          onClick={() => handleSelectSlot(slot, sIdx)}
                          className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-white border-[#1F6B4F] shadow-xs ring-2 ring-[#1F6B4F]/20'
                              : 'bg-white/80 hover:bg-white border-[#D2E2D8] text-[#638379]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between">
                              <span className={`text-xs font-bold ${isSelected ? 'text-[#152F26]' : 'text-[#638379]'}`}>
                                {slot.day_name.split(',')[0]}
                              </span>
                              {slot.is_primary && (
                                <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#1F6B4F] text-white">
                                  Optimal
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-[#152F26] mt-0.5">
                              {slot.start_time} – {slot.end_time}
                            </p>
                          </div>
                          <p className="text-[10px] text-[#1F6B4F] mt-1.5 font-medium leading-tight">
                            {slot.reason.split('•')[1]?.trim() || slot.reason}
                          </p>
                        </button>
                      );
                    })}
                  </div>

                  {/* Preferable Date Selector */}
                  <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-t border-[#C2E2D0]">
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#1F6B4F]" />
                      <span className="text-[11px] font-bold text-[#152F26]">Prefer another day?</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => handlePreferableDateChange(e.target.value)}
                        className="text-xs px-2.5 py-1 rounded-lg border border-[#D2E2D8] bg-white text-[#152F26] font-medium cursor-pointer"
                      />
                      {isFindingSlots && (
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-[#1F6B4F]" />
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!isEditingManual ? (
                <div className="space-y-2 bg-white p-4 rounded-xl border border-[#D2E2D8] shadow-2xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-base font-bold text-[#152F26]">{title}</span>
                    {isTimeSpecific && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EDF3EE] text-[#152F26] border border-[#D2E2D8]">
                        Fixed Anchor
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs text-[#638379] pt-1">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#638379]" />
                      {isTimeSpecific && startTime ? (
                        <span className="font-bold text-[#152F26]">{startTime} – {endTime || '?'} (~{hours}h)</span>
                      ) : (
                        <span>~{hours} hours (flexible)</span>
                      )}
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Tag className="w-3.5 h-3.5 text-[#638379]" />
                      <span className="capitalize">{category}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#638379]" />
                      <span>{scheduledDate ? `${scheduledDate} (${deadline || 'Target'})` : (deadline ? `Due ${deadline}` : 'Flexible timing')}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Zap className="w-3.5 h-3.5 text-[#638379]" />
                      <span className="capitalize">{priority} Priority</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-[#1F6B4F] pt-1 italic font-medium">
                    {parsedResult.raw_understanding}
                  </p>
                </div>
              ) : (
                /* Editable Form */
                <div className="space-y-3 bg-white p-4 rounded-xl border border-[#D2E2D8]">
                  <div>
                    <label className="text-xs font-bold text-[#152F26]">Task Title</label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] focus:ring-2 focus:ring-[#1F6B4F]/20 focus:border-[#1F6B4F] text-[#152F26]"
                    />
                  </div>

                  {/* Specific Time Window Toggle */}
                  <div className="flex items-center justify-between p-2.5 rounded-xl bg-[#EDF3EE] border border-[#D2E2D8]">
                    <div>
                      <span className="text-xs font-bold text-[#152F26]">Specific Time Window</span>
                      <p className="text-[10px] text-[#638379]">For fixed commitments (shifts, lectures, meetings)</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={isTimeSpecific}
                      onChange={(e) => setIsTimeSpecific(e.target.checked)}
                      className="w-4 h-4 accent-[#1F6B4F] cursor-pointer"
                    />
                  </div>

                  {isTimeSpecific && (
                    <div className="grid grid-cols-2 gap-3 p-2.5 rounded-xl bg-[#EDF3EE] border border-[#D2E2D8]">
                      <div>
                        <label className="text-[11px] font-bold text-[#152F26]">Start Time</label>
                        <input
                          type="time"
                          value={startTime}
                          onChange={(e) => handleTimeChange(e.target.value, endTime)}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] bg-white text-[#152F26]"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-[#152F26]">End Time</label>
                        <input
                          type="time"
                          value={endTime}
                          onChange={(e) => handleTimeChange(startTime, e.target.value)}
                          className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] bg-white text-[#152F26]"
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-bold text-[#152F26]">Category</label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] text-[#152F26]"
                      >
                        <option value="academic">Academic</option>
                        <option value="work">Work</option>
                        <option value="physical">Physical</option>
                        <option value="social">Social</option>
                        <option value="errand">Errand</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#152F26]">Total Hours</label>
                      <input
                        type="number"
                        step="0.5"
                        value={hours}
                        onChange={(e) => setHours(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] text-[#152F26]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#152F26]">Target Day / Deadline</label>
                      <input
                        type="text"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        placeholder="e.g. Thursday"
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] text-[#152F26]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#152F26]">Scheduled Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] text-[#152F26]"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-[#152F26]">Flexibility</label>
                      <select
                        value={flexibility}
                        onChange={(e) => setFlexibility(e.target.value)}
                        className="w-full mt-1 px-3 py-1.5 text-xs rounded-lg border border-[#D2E2D8] text-[#152F26]"
                      >
                        <option value="high">High (can float / move)</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low (fixed / hard)</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleSaveToWeek}
                  disabled={saving}
                  className="btn-primary w-full flex items-center justify-center space-x-2 py-3.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  {saving ? (
                    <span>Saving and calculating load...</span>
                  ) : (
                    <>
                      <span>Add to my week</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
