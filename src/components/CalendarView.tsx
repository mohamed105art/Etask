import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { ChevronRight, ChevronLeft, Plus, Check, Edit3, X } from 'lucide-react';

interface CalendarViewProps {
  onOpenNewTaskModal: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

const MOROCCAN_MONTHS = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'ماي', 'يونيو',
  'يوليوز', 'غشت', 'شتنبر', 'أكتوبر', 'نونبر', 'دجنبر'
];

export const CalendarView: React.FC<CalendarViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { tasks, toggleTaskStatus } = useTasks();
  const [currentDate, setCurrentDate] = useState(new Date(2026, 9, 1)); // Default to Oct 2026 or active date
  const [selectedDayTasks, setSelectedDayTasks] = useState<{ date: string; tasks: Task[] } | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfWeek = new Date(year, month, 1).getDay(); // 0 is Sunday
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const prevMonthDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleResetToToday = () => {
    const now = new Date();
    setCurrentDate(new Date(now.getFullYear(), now.getMonth(), 1));
  };

  // Helper to determine dynamic color style based on task count:
  // 1 task: Terracotta (#E07A47)
  // 2 tasks: Mustard (#D4A72C)
  // 3 tasks: Slate Blue (#59718A)
  // 4 tasks: Sage Green (#8FA68F)
  // 5+ tasks: Deep Plum (#5B3A62)
  const getTaskColorStyle = (count: number) => {
    if (count === 1) {
      return {
        borderClass: 'border-2 border-[#E07A47]',
        badgeBgClass: 'bg-[#E07A47]'
      };
    }
    if (count === 2) {
      return {
        borderClass: 'border-2 border-[#D4A72C]',
        badgeBgClass: 'bg-[#D4A72C]'
      };
    }
    if (count === 3) {
      return {
        borderClass: 'border-2 border-[#59718A]',
        badgeBgClass: 'bg-[#59718A]'
      };
    }
    if (count === 4) {
      return {
        borderClass: 'border-2 border-[#8FA68F]',
        badgeBgClass: 'bg-[#8FA68F]'
      };
    }
    return {
      borderClass: 'border-2 border-[#5B3A62]',
      badgeBgClass: 'bg-[#5B3A62]'
    };
  };

  return (
    <div className="w-full">
      {/* 2. Main Calendar Card: width 100%, bg #1B1D2A, border-radius 20px, padding 24px */}
      <div className="w-full bg-[#1B1D2A] rounded-[20px] p-4 sm:p-6 shadow-2xl border border-white/5">
        
        {/* Main Header Titles */}
        <div className="text-center">
          <h2 className="text-[18px] font-bold text-white text-center">
            التقويم الإداري لتتبع عمليات التسليم
          </h2>
          <p className="text-[13px] text-[#8E91A0] text-center mt-2 mb-6">
            عرض شهري تفاعلي لعمليات تسليم المواد وفق تواريخها بالدائرة القضائية
          </p>
        </div>

        {/* 3. Month Navigator Bar: bg #12131C, rounded 14px, p 8px 16px, mb 24px */}
        <div className="bg-[#12131C] rounded-[14px] px-4 py-2.5 flex justify-between items-center mb-6">
          {/* Next Month Button (RTL: ChevronRight goes to prev or next depending on preference, here left is next, right is prev) */}
          <button
            type="button"
            onClick={handlePrevMonth}
            className="w-[32px] h-[32px] rounded-[8px] bg-[#1B1D2A] text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="الشهر السابق"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Month & Year Title (16px bold white) */}
          <div className="flex items-center gap-3">
            <span className="text-[16px] font-bold text-white tracking-wide">
              {MOROCCAN_MONTHS[month]} {year}
            </span>
            <button
              type="button"
              onClick={handleResetToToday}
              className="text-[11px] font-bold bg-[#1B1D2A] border border-white/10 text-[#8E91A0] hover:text-white px-2.5 py-1 rounded-[6px] transition-colors"
            >
              اليوم
            </button>
          </div>

          <button
            type="button"
            onClick={handleNextMonth}
            className="w-[32px] h-[32px] rounded-[8px] bg-[#1B1D2A] text-white flex items-center justify-center hover:bg-white/10 transition-colors cursor-pointer shrink-0"
            title="الشهر التالي"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* 4. Calendar Weekday Headers: grid 7 cols, gap 10px, text #8E91A0, 13px font-semibold */}
        <div className="grid grid-cols-7 gap-2 sm:gap-[10px] pb-3 text-center text-[13px] font-semibold text-[#8E91A0]">
          {['الأحد', 'الإثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'].map(dayName => (
            <div key={dayName} className="py-1">
              {dayName}
            </div>
          ))}
        </div>

        {/* 5 & 6. Days Grid (repeat 7, gap 10px, aspect-ratio 1 / 1 square cells) */}
        <div className="grid grid-cols-7 gap-2 sm:gap-[10px]">
          {/* Previous month inactive days */}
          {Array.from({ length: firstDayOfWeek }).map((_, i) => {
            const dayNum = prevMonthDays - firstDayOfWeek + i + 1;
            return (
              <div 
                key={`prev-${i}`} 
                className="aspect-square relative flex justify-center items-center bg-[#242736] opacity-30 rounded-[12px] text-[15px] font-semibold text-white cursor-not-allowed select-none"
              >
                <span>{dayNum}</span>
              </div>
            );
          })}

          {/* Current month days */}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(t => t.taskDate === dateStr);
            const count = dayTasks.length;

            const colorStyle = count > 0 ? getTaskColorStyle(count) : null;

            return (
              <div
                key={dateStr}
                onClick={() => setSelectedDayTasks({ date: dateStr, tasks: dayTasks })}
                className={`
                  aspect-square relative flex justify-center items-center rounded-[12px] text-[15px] font-semibold text-white transition-all duration-150 cursor-pointer select-none
                  ${count > 0 
                    ? `bg-[#242736] ${colorStyle?.borderClass} hover:scale-105 shadow-md` 
                    : 'bg-[#242736] hover:bg-[#2d3143]'}
                `}
                title={`${dateStr} - ${count} مهام مسجلة`}
              >
                {/* The Day Number */}
                <span>{day}</span>

                {/* 6. The Circular Badge / Counter with Cutout Effect */}
                {count > 0 && colorStyle && (
                  <span 
                    className={`
                      absolute -bottom-[6px] -right-[6px] w-[20px] h-[20px] rounded-full
                      flex justify-center items-center text-[11px] font-bold text-white
                      ${colorStyle.badgeBgClass}
                      border-2 border-[#1B1D2A] shadow-sm
                    `}
                  >
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Day Inspector Modal */}
      {selectedDayTasks && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/70 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-[#1B1D2A] border border-white/10 rounded-2xl shadow-2xl p-5 space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
              <div>
                <h3 className="font-bold text-sm text-white">
                  📅 مهام تاريخ: {selectedDayTasks.date}
                </h3>
                <span className="text-xs text-[#8E91A0]">
                  {selectedDayTasks.tasks.length} مهام مسجلة
                </span>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDayTasks(null)}
                className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex items-center justify-end shrink-0">
              <button
                type="button"
                onClick={() => {
                  const targetDate = selectedDayTasks.date;
                  setSelectedDayTasks(null);
                  onOpenNewTaskModal(targetDate);
                }}
                className="px-3.5 py-1.5 text-xs font-bold rounded-xl bg-blue-600 text-white hover:bg-blue-700 flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة مهمة لهذا التاريخ</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 text-xs">
              {selectedDayTasks.tasks.length === 0 ? (
                <div className="py-10 text-center text-[#8E91A0]">
                  لا توجد مهام مسجلة في هذا اليوم. انقر «إضافة مهمة لهذا التاريخ» للجدولة.
                </div>
              ) : (
                selectedDayTasks.tasks.map(t => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-white/5 bg-[#12131C] flex items-center justify-between gap-3 hover:border-white/15 transition-all"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 text-[10px] text-[#8E91A0] mb-1">
                        <span>📍 {t.destination}</span>
                        <span>•</span>
                        <span>🏷️ {t.category}</span>
                      </div>
                      <div 
                        onClick={() => { setSelectedDayTasks(null); onViewTask(t); }}
                        className="font-bold text-xs text-white truncate cursor-pointer hover:text-[#D4A72C]"
                      >
                        {t.title}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => { toggleTaskStatus(t.id); setSelectedDayTasks(null); }}
                        className="p-1.5 rounded-lg bg-[#8FA68F]/20 text-[#8FA68F] hover:bg-[#8FA68F]/30 transition-colors"
                        title="إنجاز"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => { setSelectedDayTasks(null); onEditTask(t); }}
                        className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white"
                        title="تعديل"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
