import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function MiniMonthCalendar({
  currentDate,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  tasksByDate = {}
}) {
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const monthName = currentDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric'
  });

  // Calculate calendar days for Sunday-start (matching mockup)
  const firstDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const calendarCells = [];

  // Previous month filling days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = new Date(year, month - 1, daysInPrevMonth - i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    calendarCells.push({
      date: d,
      dateKey,
      dayNum: daysInPrevMonth - i,
      isCurrentMonth: false
    });
  }

  // Current month days
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    calendarCells.push({
      date: d,
      dateKey,
      dayNum: i,
      isCurrentMonth: true
    });
  }

  // Next month filling days (total 35 or 42 cells)
  const totalCells = calendarCells.length <= 35 ? 35 : 42;
  const remaining = totalCells - calendarCells.length;
  for (let i = 1; i <= remaining; i++) {
    const d = new Date(year, month + 1, i);
    const dateKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    calendarCells.push({
      date: d,
      dateKey,
      dayNum: i,
      isCurrentMonth: false
    });
  }

  const selectedDateKey = typeof selectedDate === 'string'
    ? selectedDate
    : selectedDate ? `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}` : '';

  const now = new Date();
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  return (
    <div className="lumora-card p-4 sm:p-5 bg-white border border-[#D2E2D8] shadow-xs space-y-3.5">
      {/* Month & Navigation Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#152F26] font-display">
          {monthName}
        </h3>
        <div className="flex items-center space-x-1">
          <button
            onClick={onPrevMonth}
            className="p-1.5 rounded-lg hover:bg-[#EDF3EE] text-[#638379] hover:text-[#152F26] transition-colors cursor-pointer"
            title="Previous month"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onNextMonth}
            className="p-1.5 rounded-lg hover:bg-[#EDF3EE] text-[#638379] hover:text-[#152F26] transition-colors cursor-pointer"
            title="Next month"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Weekday Labels (S M T W T F S) */}
      <div className="grid grid-cols-7 text-center text-[11px] font-semibold text-[#638379]">
        {WEEKDAYS.map((wd, idx) => (
          <div key={idx} className="py-0.5">
            {wd}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 gap-y-1 text-center text-xs">
        {calendarCells.map((cell, idx) => {
          const isSelected = cell.dateKey === selectedDateKey;
          const isToday = cell.dateKey === todayKey;
          const hasTasks = Boolean(tasksByDate[cell.dateKey]?.length);

          return (
            <div key={idx} className="flex flex-col items-center justify-center py-0.5">
              <button
                onClick={() => onSelectDate(cell.dateKey)}
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold transition-all relative cursor-pointer ${
                  isSelected
                    ? 'bg-[#1F6B4F] text-white shadow-xs font-bold'
                    : isToday
                    ? 'bg-[#E3F2E9] text-[#1F6B4F] font-bold border border-[#C2E2D0]'
                    : cell.isCurrentMonth
                    ? 'text-[#152F26] hover:bg-[#EDF3EE]'
                    : 'text-[#638379]/40 hover:text-[#638379]'
                }`}
              >
                {cell.dayNum}
                {hasTasks && !isSelected && (
                  <span className="absolute bottom-0.5 w-1 h-1 rounded-full bg-[#1F6B4F]" />
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}