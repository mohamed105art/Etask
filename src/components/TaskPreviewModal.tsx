import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { X, Calendar, MapPin, Tag, Check, Edit3, Trash2 } from 'lucide-react';

interface TaskPreviewModalProps {
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export const TaskPreviewModal: React.FC<TaskPreviewModalProps> = ({ task, onClose, onEdit }) => {
  const { toggleTaskStatus, deleteTask } = useTasks();
  if (!task) return null;

  const isDone = task.status === 'منجزة' || task.status === 'مكتملة';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-lg bg-[#1B1D2A] border border-white/10 rounded-[20px] shadow-2xl p-5 space-y-4 max-h-[90vh] flex flex-col text-xs">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#59718A]" />
            <h3 className="font-extrabold text-sm text-white">
              تفاصيل ومعاينة المهمة
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto space-y-3.5">
          <div className="flex flex-wrap items-center gap-2 text-[#8E91A0]">
            <span className="font-bold text-[#59718A] flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              <span>{task.destination}</span>
            </span>
            <span>·</span>
            <span>📍 {task.city || 'سطات'} ({task.scope || 'محلي'})</span>
            <span>·</span>
            <span>🏷️ {task.category}</span>
          </div>

          <h2 className="text-base font-extrabold text-white leading-relaxed">
            {task.title}
          </h2>

          {/* Metadata Card */}
          <div className="p-3 bg-[#12131C] border border-white/10 rounded-xl space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-[#8E91A0]">تاريخ المهمة:</span>
              <span className="font-mono font-bold text-white">
                {task.taskDate ? task.taskDate : '📌 مفتوحة بدون تاريخ'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E91A0]">الحالة:</span>
              <span className={`font-bold ${isDone ? 'text-[#8FA68F]' : 'text-[#59718A]'}`}>
                {task.status}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E91A0]">الأولوية:</span>
              <span className="font-bold text-white">
                {task.priority}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#8E91A0]">نسبة التقدم:</span>
              <span className="font-mono font-bold text-[#59718A]">{task.progress}%</span>
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div className="space-y-1">
              <span className="font-bold text-white">التفاصيل والملاحظات:</span>
              <p className="p-3 rounded-xl bg-[#12131C] border border-white/10 text-white/90 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            </div>
          )}

          {/* Subtasks */}
          {task.subtasks && task.subtasks.length > 0 && (
            <div className="space-y-1.5 pt-1">
              <span className="font-bold text-white">
                ☑️ العمليات والمهام الفرعية المنجزة ({task.subtasks.length}):
              </span>
              <div className="space-y-1">
                {task.subtasks.map((st, i) => (
                  <div 
                    key={st.id || i}
                    className="p-2 rounded-lg bg-[#12131C] flex items-center gap-2 border border-white/10"
                  >
                    <span className={st.completed || st.done ? 'text-[#8FA68F] font-bold' : 'text-[#8E91A0]'}>
                      {st.completed || st.done ? '✓' : '◻'}
                    </span>
                    <span className={st.completed || st.done ? 'line-through text-[#8E91A0]' : 'text-white font-medium'}>
                      {st.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-white/10 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => { deleteTask(task.id); onClose(); }}
            className="text-[#E07A47] hover:underline flex items-center gap-1 font-semibold transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>نقل إلى سلة المهملات</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => { toggleTaskStatus(task.id); onClose(); }}
              className={`px-3 py-1.5 rounded-xl font-bold flex items-center gap-1.5 transition-colors ${isDone ? 'border border-white/10 text-white hover:bg-white/5' : 'bg-[#2F6F6D] text-white hover:bg-[#2F6F6D]/80'}`}
            >
              <Check className="w-3.5 h-3.5" />
              <span>{isDone ? 'إعادة فتح' : 'إنجاز'}</span>
            </button>

            <button
              type="button"
              onClick={() => { onClose(); onEdit(task); }}
              className="px-3.5 py-1.5 rounded-xl bg-[#59718A] text-white font-bold hover:bg-[#4d6379] flex items-center gap-1.5 transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>تعديل</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
