import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { Bookmark, Calendar, Clock, Plus, Search, Edit3, Trash2, MapPin } from 'lucide-react';

interface BacklogViewProps {
  onOpenNewTaskModal: () => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { tasks, scheduleTaskForToday, deleteTask } = useTasks();
  const [searchQuery, setSearchQuery] = useState('');
  const [subFilter, setSubFilter] = useState<'all' | 'future' | 'open'>('all');

  const todayStr = new Date().toISOString().split('T')[0];

  const backlogTasks = tasks.filter(t => {
    // Only non-completed tasks
    if (t.status === 'منجزة' || t.status === 'مكتملة') return false;

    const isFuture = Boolean(t.taskDate && t.taskDate > todayStr);
    const isOpen = Boolean(t.isBacklog || !t.taskDate);

    if (subFilter === 'future' && !isFuture) return false;
    if (subFilter === 'open' && !isOpen) return false;

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      const inTitle = t.title?.toLowerCase().includes(q);
      const inDest = t.destination?.toLowerCase().includes(q);
      const inCat = t.category?.toLowerCase().includes(q);
      if (!inTitle && !inDest && !inCat) return false;
    }

    return true;
  });

  return (
    <div className="space-y-4">
      {/* Header & Sub-filter bar */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-[#59718A]" />
            <span>برمجة المهام المستقبلية والمفتوحة</span>
          </h2>
          <p className="text-xs text-[#8E91A0] mt-0.5">
            إدارة المشاريع والتدخلات التي تنتظر البرمجة أو لها مواعيد لاحقة
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenNewTaskModal}
          title="إضافة مهمة مبرمجة جديدة"
          className="w-9 h-9 rounded-xl bg-[#59718A] hover:bg-[#4d6379] text-white flex items-center justify-center transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Tabs and Search */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-3 flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-1.5 p-1 bg-[#12131C] rounded-xl border border-white/10">
          <button
            type="button"
            onClick={() => setSubFilter('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${subFilter === 'all' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            الكل ({tasks.filter(t => (t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && t.status !== 'منجزة').length})
          </button>
          <button
            type="button"
            onClick={() => setSubFilter('future')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${subFilter === 'future' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>مجدولة بموعد</span>
          </button>
          <button
            type="button"
            onClick={() => setSubFilter('open')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${subFilter === 'open' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>مفتوحة بدون تاريخ</span>
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="بحث في المهام المبرمجة..."
            className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-white/10 bg-[#12131C] text-white placeholder-[#8E91A0] text-xs focus:outline-none focus:border-[#59718A]"
          />
          <Search className="w-3.5 h-3.5 text-[#8E91A0] absolute right-2.5 top-2.5" />
        </div>
      </div>

      {/* Backlog Table */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#12131C]/90 text-[#8E91A0] font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4 w-36 text-center whitespace-nowrap">الموعد / البرمجة</th>
                <th className="py-3 px-4 min-w-[240px]">موضوع المهمة والتفاصيل</th>
                <th className="py-3 px-4 w-36 whitespace-nowrap">التصنيف</th>
                <th className="py-3 px-4 w-44 whitespace-nowrap">الوجهة المقترحة</th>
                <th className="py-3 px-4 w-24 text-center whitespace-nowrap">الأولوية</th>
                <th className="py-3 px-4 w-32 text-center whitespace-nowrap">الإجراء المباشر</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {backlogTasks.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-[#8E91A0]">
                    لا توجد مهام مبرمجة أو مفتوحة مطابقة.
                  </td>
                </tr>
              ) : (
                backlogTasks.map(task => (
                  <tr key={task.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-center font-sans text-xs whitespace-nowrap">
                      {task.taskDate ? (
                        <span className="text-[#59718A] font-bold flex items-center justify-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{task.taskDate}</span>
                        </span>
                      ) : (
                        <span className="text-[#D4A72C] font-bold flex items-center justify-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>مفتوحة</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 min-w-[240px]">
                      <div 
                        onClick={() => onViewTask(task)}
                        className="font-bold text-white hover:text-[#59718A] cursor-pointer transition-colors"
                      >
                        {task.title}
                      </div>
                      {task.description && (
                        <div className="text-[11px] text-[#8E91A0] line-clamp-1 mt-0.5">
                          {task.description}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-semibold text-white/90 whitespace-nowrap">
                      {task.category}
                    </td>

                    <td className="py-3 px-4 text-white font-medium whitespace-nowrap">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D4A72C] shrink-0" />
                        <span>{task.destination}</span>
                      </span>
                    </td>

                    <td className="py-3 px-4 text-center text-[#8E91A0] font-bold whitespace-nowrap">
                      {task.priority}
                    </td>

                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => scheduleTaskForToday(task.id)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg bg-[#59718A] text-white hover:bg-[#4d6379] transition-colors flex items-center gap-1 cursor-pointer"
                          title="تعيين للتنفيذ اليوم"
                        >
                          <Calendar className="w-3 h-3" />
                          <span>اليوم</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => onEditTask(task)}
                          className="w-7 h-7 rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
                          title="تعديل المهمة"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task.id)}
                          className="w-7 h-7 rounded-lg border border-white/10 text-[#E07A47] hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
                          title="حذف المهمة"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
