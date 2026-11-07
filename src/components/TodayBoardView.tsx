import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { Sun, AlertTriangle, Calendar, CheckCircle2, Plus, ChevronDown, ChevronUp, Check, Edit3, Trash2, Eye } from 'lucide-react';

interface TodayBoardViewProps {
  onOpenNewTaskModal: (date?: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export const TodayBoardView: React.FC<TodayBoardViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { tasks, toggleTaskStatus, deleteTask, scheduleTaskForToday } = useTasks();
  const todayStr = new Date().toISOString().split('T')[0];

  const [openSections, setOpenSections] = useState({
    scheduled: true,
    pending: true,
    future: false,
    done: false
  });

  const toggleSection = (key: keyof typeof openSections) => {
    setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isDoneTask = (t: Task) => t.status === 'منجزة' || t.status === 'مكتملة';

  const scheduledToday = tasks.filter(t => !t.isBacklog && t.taskDate === todayStr && !isDoneTask(t));
  const pendingTasks = tasks.filter(t => (t.status === 'معلقة' || t.status === 'متأخرة' || (t.taskDate && t.taskDate < todayStr)) && t.taskDate !== todayStr && !t.isBacklog && !isDoneTask(t));
  const futureTasks = tasks.filter(t => (t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && !isDoneTask(t));
  const recentlyDone = tasks.filter(isDoneTask).slice(0, 10);

  const renderTaskCard = (t: Task, isFuture = false) => {
    const isDone = isDoneTask(t);

    return (
      <div 
        key={t.id}
        className="p-3.5 rounded-xl border border-white/10 bg-[#12131C] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:border-white/20 transition-all"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-[#8E91A0] mb-1">
            <span className="font-bold text-[#59718A]">
              {t.taskDate ? t.taskDate : '📌 برمجة مفتوحة'}
            </span>
            <span>·</span>
            <span className="truncate">📍 {t.destination}</span>
            <span>·</span>
            <span>🏷️ {t.category}</span>
            <span>·</span>
            <span className={`font-bold ${t.priority === 'عاجلة' ? 'text-[#E07A47]' : 'text-[#8E91A0]'}`}>
              {t.priority}
            </span>
          </div>
          <div 
            onClick={() => onViewTask(t)}
            className="font-bold text-xs text-white truncate cursor-pointer hover:text-[#59718A] transition-colors"
          >
            {t.title}
          </div>
          {t.description && (
            <div className="text-[11px] text-[#8E91A0] line-clamp-1 mt-0.5">
              {t.description}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
          {isFuture && (
            <button
              type="button"
              onClick={() => scheduleTaskForToday(t.id)}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-[#5B3A62] text-[#C47C8A] hover:bg-[#5B3A62]/30 transition-colors"
            >
              تعيين لليوم
            </button>
          )}

          <button
            type="button"
            onClick={() => toggleTaskStatus(t.id)}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg flex items-center gap-1 transition-colors ${isDone ? 'border border-white/10 text-[#8E91A0] hover:text-white' : 'bg-[#2F6F6D] text-white hover:bg-[#2F6F6D]/80'}`}
          >
            <Check className="w-3.5 h-3.5" />
            <span>{isDone ? 'إعادة فتح' : 'إنجاز'}</span>
          </button>

          <button
            type="button"
            onClick={() => onEditTask(t)}
            className="p-1.5 rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors"
            title="تعديل"
          >
            <Edit3 className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={() => deleteTask(t.id)}
            className="p-1.5 rounded-lg border border-white/10 text-[#E07A47] hover:bg-white/5 transition-colors"
            title="حذف"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Header Bar */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#D4A72C]" />
            <span>لوحة إدارة اليوم الميدانية</span>
          </h2>
          <p className="text-xs text-[#8E91A0] mt-0.5">
            تتبع العمليات والتدخلات المبرمجة والجارية لليوم مع استشراف المهام المتأخرة والقادمة
          </p>
        </div>
        <button
          type="button"
          onClick={() => onOpenNewTaskModal(todayStr)}
          className="px-3 py-1.5 rounded-lg bg-[#59718A] text-white font-bold text-xs hover:bg-[#4d6379] transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>مهمة لليوم</span>
        </button>
      </div>

      {/* Accordion 1: Scheduled Today */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('scheduled')}
          className="w-full p-4 flex items-center justify-between text-right bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[#D4A72C]" />
            <span className="font-bold text-xs text-white">مهام اليوم الجارية</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#D4A72C] text-[#12131C]">
              {scheduledToday.length}
            </span>
          </div>
          {openSections.scheduled ? <ChevronUp className="w-4 h-4 text-[#8E91A0]" /> : <ChevronDown className="w-4 h-4 text-[#8E91A0]" />}
        </button>
        {openSections.scheduled && (
          <div className="p-4 space-y-2 border-t border-white/10">
            {scheduledToday.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8E91A0]">لا توجد مهام مبرمجة لليوم حالياً.</div>
            ) : (
              scheduledToday.map(t => renderTaskCard(t))
            )}
          </div>
        )}
      </div>

      {/* Accordion 2: Needs Follow-up & Overdue */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('pending')}
          className="w-full p-4 flex items-center justify-between text-right bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-[#E07A47]" />
            <span className="font-bold text-xs text-white">مهام متأخرة أو تحتاج تسوية واستكمال</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#E07A47] text-white">
              {pendingTasks.length}
            </span>
          </div>
          {openSections.pending ? <ChevronUp className="w-4 h-4 text-[#8E91A0]" /> : <ChevronDown className="w-4 h-4 text-[#8E91A0]" />}
        </button>
        {openSections.pending && (
          <div className="p-4 space-y-2 border-t border-white/10">
            {pendingTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8E91A0]">ممتاز! لا توجد مهام متأخرة أو معلقة، كافة العمليات مستوفاة.</div>
            ) : (
              pendingTasks.map(t => renderTaskCard(t))
            )}
          </div>
        )}
      </div>

      {/* Accordion 3: Future Programmed Tasks */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('future')}
          className="w-full p-4 flex items-center justify-between text-right bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#59718A]" />
            <span className="font-bold text-xs text-white">المهام المبرمجة مستقبلاً (استشراف المهام القادمة)</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#59718A] text-white">
              {futureTasks.length}
            </span>
          </div>
          {openSections.future ? <ChevronUp className="w-4 h-4 text-[#8E91A0]" /> : <ChevronDown className="w-4 h-4 text-[#8E91A0]" />}
        </button>
        {openSections.future && (
          <div className="p-4 space-y-2 border-t border-white/10">
            {futureTasks.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8E91A0]">لا توجد مهام مبرمجة مستقبلاً.</div>
            ) : (
              futureTasks.map(t => renderTaskCard(t, true))
            )}
          </div>
        )}
      </div>

      {/* Accordion 4: Recently Completed Tasks */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden">
        <button
          type="button"
          onClick={() => toggleSection('done')}
          className="w-full p-4 flex items-center justify-between text-right bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-[#8FA68F]" />
            <span className="font-bold text-xs text-white">مهام أنجزت مؤخراً</span>
            <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#8FA68F] text-[#12131C]">
              {recentlyDone.length}
            </span>
          </div>
          {openSections.done ? <ChevronUp className="w-4 h-4 text-[#8E91A0]" /> : <ChevronDown className="w-4 h-4 text-[#8E91A0]" />}
        </button>
        {openSections.done && (
          <div className="p-4 space-y-2 border-t border-white/10">
            {recentlyDone.length === 0 ? (
              <div className="py-6 text-center text-xs text-[#8E91A0]">لم يتم إنجاز مهام حديثاً.</div>
            ) : (
              recentlyDone.map(t => renderTaskCard(t))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
