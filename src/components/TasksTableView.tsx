import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types/tasks';
import { 
  Search, 
  RotateCcw, 
  Printer, 
  MoreVertical, 
  Check, 
  Edit3, 
  Trash2, 
  Eye, 
  ChevronRight, 
  ChevronLeft,
  MapPin 
} from 'lucide-react';

interface TasksTableViewProps {
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
  onPrintA4Summary?: () => void;
}

export const TasksTableView: React.FC<TasksTableViewProps> = ({
  onEditTask,
  onViewTask,
  onPrintA4Summary
}) => {
  const { 
    filteredTasks, 
    filterOptions, 
    setFilters, 
    resetFilters, 
    toggleTaskStatus, 
    deleteTask,
    categories,
    courts
  } = useTasks();

  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Pagination calculation
  const totalItems = filteredTasks.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedTasks = filteredTasks.slice(startIndex, startIndex + itemsPerPage);

  const handlePrintSummary = () => {
    if (onPrintA4Summary) {
      onPrintA4Summary();
      return;
    }
    window.print();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'منجزة':
      case 'مكتملة':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#8FA68F]/20 text-[#8FA68F]">منجزة</span>;
      case 'قيد الإنجاز':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#59718A]/20 text-[#59718A]">قيد الإنجاز</span>;
      case 'قيد المتابعة':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#D4A72C]/20 text-[#D4A72C]">قيد المتابعة</span>;
      case 'متأخرة':
      case 'معلقة':
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#E07A47]/20 text-[#E07A47]">{status}</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-[#5B3A62]/20 text-[#c084fc]">مبرمجة</span>;
    }
  };

  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'عاجلة':
        return 'text-red-600 dark:text-red-400 font-extrabold';
      case 'عالية':
      case 'مهمة':
        return 'text-amber-600 dark:text-amber-400 font-bold';
      case 'متوسطة':
        return 'text-blue-600 dark:text-blue-400 font-semibold';
      default:
        return 'text-slate-500 dark:text-slate-400 font-medium';
    }
  };

  return (
    <div className="space-y-4">
      {/* 1. FILTER CONTROLS BAR */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-white">
              سجل المهام والعمليات
            </h2>
            <span className="text-xs text-[#8E91A0] tabular-nums">
              ({totalItems} مهمة مطابقة)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              title="إعادة تعيين ومسح الفلاتر"
              className="w-8 h-8 rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={handlePrintSummary}
              title="طباعة كشف المهام الحالية بصيغة A4"
              className="w-8 h-8 rounded-lg bg-[#59718A] hover:bg-[#4d6379] text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Multi-criteria Filter Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={filterOptions.searchQuery || ''}
              onChange={e => { setFilters({ searchQuery: e.target.value }); setCurrentPage(1); }}
              placeholder="بحث في العنوان، التفاصيل..."
              className="w-full pl-3 pr-8 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white placeholder-[#8E91A0] focus:outline-none focus:border-[#59718A]"
            />
            <Search className="w-4 h-4 text-[#8E91A0] absolute right-2.5 top-2.5" />
          </div>

          {/* Destination Filter */}
          <select
            value={filterOptions.destination || ''}
            onChange={e => { setFilters({ destination: e.target.value }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white focus:outline-none focus:border-[#59718A]"
          >
            <option value="" className="bg-[#1B1D2A] text-white">جميع الوجهات والمحاكم</option>
            {courts.map(c => (
              <option key={c.id} value={c.name} className="bg-[#1B1D2A] text-white">{c.name}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={filterOptions.category || ''}
            onChange={e => { setFilters({ category: e.target.value }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white focus:outline-none focus:border-[#59718A]"
          >
            <option value="" className="bg-[#1B1D2A] text-white">جميع التصنيفات</option>
            {categories.map(c => (
              <option key={c.id} value={c.name} className="bg-[#1B1D2A] text-white">{c.name}</option>
            ))}
          </select>

          {/* Scope Filter */}
          <select
            value={filterOptions.scope || ''}
            onChange={e => { setFilters({ scope: e.target.value as any }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white focus:outline-none focus:border-[#59718A]"
          >
            <option value="" className="bg-[#1B1D2A] text-white">جميع النطاقات</option>
            <option value="محلي" className="bg-[#1B1D2A] text-white">محلي (سطات)</option>
            <option value="تنقل خارجي" className="bg-[#1B1D2A] text-white">تنقل خارجي (خارج سطات)</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterOptions.status || ''}
            onChange={e => { setFilters({ status: e.target.value as any }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white focus:outline-none focus:border-[#59718A]"
          >
            <option value="" className="bg-[#1B1D2A] text-white">جميع الحالات</option>
            <option value="قيد الإنجاز" className="bg-[#1B1D2A] text-white">قيد الإنجاز</option>
            <option value="مبرمجة" className="bg-[#1B1D2A] text-white">مبرمجة</option>
            <option value="قيد المتابعة" className="bg-[#1B1D2A] text-white">قيد المتابعة</option>
            <option value="متأخرة" className="bg-[#1B1D2A] text-white">متأخرة</option>
            <option value="منجزة" className="bg-[#1B1D2A] text-white">منجزة ومستوفاة</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterOptions.priority || ''}
            onChange={e => { setFilters({ priority: e.target.value as any }); setCurrentPage(1); }}
            className="w-full px-2.5 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white focus:outline-none focus:border-[#59718A]"
          >
            <option value="" className="bg-[#1B1D2A] text-white">جميع الأولويات</option>
            <option value="عاجلة" className="bg-[#1B1D2A] text-[#E07A47]">عاجلة وطارئة</option>
            <option value="عالية" className="bg-[#1B1D2A] text-[#D4A72C]">عالية / مهمة</option>
            <option value="متوسطة" className="bg-[#1B1D2A] text-[#59718A]">متوسطة</option>
            <option value="عادية" className="bg-[#1B1D2A] text-white">عادية</option>
            <option value="منخفضة" className="bg-[#1B1D2A] text-[#8E91A0]">منخفضة</option>
          </select>
        </div>
      </div>

      {/* 2. HIGH-DENSITY DATA TABLE */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#12131C]/80 text-[#8E91A0] font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4 w-28 text-center">التاريخ</th>
                <th className="py-3 px-4 min-w-[240px]">موضوع التدخل والعمليات الفرعية</th>
                <th className="py-3 px-4 w-36">التصنيف</th>
                <th className="py-3 px-4 w-44">الوجهة والنطاق</th>
                <th className="py-3 px-4 w-24 text-center">الأولوية</th>
                <th className="py-3 px-4 w-28 text-center">الحالة</th>
                <th className="py-3 px-4 w-24 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {paginatedTasks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#8E91A0]">
                    لا توجد مهام مطابقة لخيارات البحث المحددة.
                  </td>
                </tr>
              ) : (
                paginatedTasks.map(task => {
                  const subtasksTotal = task.subtasks?.length || 0;
                  const subtasksDone = task.subtasks?.filter(s => s.completed || s.done).length || 0;
                  const isMenuOpen = activeMenuId === task.id;

                  return (
                    <tr 
                      key={task.id}
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Date */}
                      <td className="py-3 px-4 text-center font-sans text-xs text-[#8E91A0] whitespace-nowrap">
                        {task.taskDate ? task.taskDate : <span className="text-[#C47C8A] font-bold">مفتوحة</span>}
                      </td>

                      {/* Title & Subtasks */}
                      <td className="py-3 px-4">
                        <div 
                          onClick={() => onViewTask(task)}
                          className="font-bold text-white hover:text-[#59718A] cursor-pointer text-xs transition-colors"
                          title={task.title}
                        >
                          {task.title}
                        </div>
                        {task.description && (
                          <div className="text-[11px] text-[#8E91A0] line-clamp-1 mt-0.5">
                            {task.description}
                          </div>
                        )}
                        {subtasksTotal > 0 && (
                          <div className="mt-1 flex items-center gap-1.5 text-[10px] text-[#8E91A0]">
                            <span className="font-semibold text-[#8FA68F] font-sans tabular-nums">
                              {subtasksDone}/{subtasksTotal} عمليات
                            </span>
                            <span>·</span>
                            <span className="font-sans tabular-nums">{task.progress}%</span>
                          </div>
                        )}
                      </td>

                      {/* Category */}
                      <td className="py-3 px-4">
                        <span className="font-semibold text-white/90">
                          {task.category}
                        </span>
                        {task.subcategory && (
                          <span className="text-[10px] text-[#8E91A0] block">
                            {task.subcategory}
                          </span>
                        )}
                      </td>

                      {/* Destination & Scope */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-white truncate flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
                          <span>{task.destination}</span>
                        </div>
                        <span className="text-[10px] text-[#8E91A0]">
                          {task.city || 'سطات'} · {task.scope}
                        </span>
                      </td>

                      {/* Priority */}
                      <td className={`py-3 px-4 text-center text-xs ${getPriorityStyle(task.priority)}`}>
                        {task.priority}
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getStatusBadge(task.status)}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-center relative">
                        <div className="inline-block">
                          <button
                            type="button"
                            onClick={() => setActiveMenuId(isMenuOpen ? null : task.id)}
                            className="p-1 rounded-lg hover:bg-white/10 text-[#8E91A0] hover:text-white transition-colors"
                            title="خيارات"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && (
                            <div className="absolute left-0 mt-1 w-36 bg-[#1B1D2A] border border-white/10 rounded-xl shadow-xl py-1 z-30 text-right">
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); onViewTask(task); }}
                                className="w-full px-3 py-1.5 text-xs text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                              >
                                <Eye className="w-3.5 h-3.5 text-[#59718A]" />
                                <span>معاينة</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); onEditTask(task); }}
                                className="w-full px-3 py-1.5 text-xs text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                              >
                                <Edit3 className="w-3.5 h-3.5 text-[#D4A72C]" />
                                <span>تعديل</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); toggleTaskStatus(task.id); }}
                                className="w-full px-3 py-1.5 text-xs text-white hover:bg-white/5 flex items-center gap-2 transition-colors"
                              >
                                <Check className="w-3.5 h-3.5 text-[#8FA68F]" />
                                <span>{task.status === 'منجزة' ? 'إعادة فتح' : 'إنجاز'}</span>
                              </button>
                              <div className="my-1 border-t border-white/10" />
                              <button
                                type="button"
                                onClick={() => { setActiveMenuId(null); deleteTask(task.id); }}
                                className="w-full px-3 py-1.5 text-xs text-[#E07A47] hover:bg-white/5 flex items-center gap-2 transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>سلة المهملات</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-3 border-t border-white/10 flex items-center justify-between text-xs text-[#8E91A0]">
          <div>
            عرض {totalItems > 0 ? startIndex + 1 : 0} إلى {Math.min(startIndex + itemsPerPage, totalItems)} من أصل {totalItems}
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              className="p-1 rounded-md border border-white/10 disabled:opacity-40 hover:bg-white/5 text-white transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <span className="px-2 font-sans font-bold text-white tabular-nums">
              {currentPage} / {totalPages}
            </span>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              className="p-1 rounded-md border border-white/10 disabled:opacity-40 hover:bg-white/5 text-white transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
