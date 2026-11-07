import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  ClipboardList, 
  Sun, 
  Calendar, 
  AlertTriangle, 
  CheckCircle2, 
  MapPin, 
  Plus, 
  Edit3, 
  Check, 
  Trash2, 
  ChevronDown, 
  ChevronUp, 
  Clock,
  Sparkles,
  ArrowLeft
} from 'lucide-react';
import { Task } from '../types/tasks';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenNewTaskModal: (initialDate?: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewTaskModal,
  onEditTask,
  onViewTask
}) => {
  const { 
    kpiStats, 
    tasks, 
    templates, 
    toggleTaskStatus, 
    deleteTask, 
    scheduleTaskForToday, 
    setFilters 
  } = useTasks();

  const [isTodaySectionFolded, setIsTodaySectionFolded] = useState(false);
  const todayStr = new Date().toISOString().split('T')[0];

  // Data sets
  const todayTasks = tasks.filter(t => !t.isBacklog && t.taskDate === todayStr && t.status !== 'منجزة' && t.status !== 'مكتملة');
  const futureTasks = tasks.filter(t => (t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && t.status !== 'منجزة' && t.status !== 'مكتملة');

  // Geographic breakdowns
  const geoBreakdown = [
    { name: 'الرباط (المصالح المركزية)', count: tasks.filter(t => t.destination?.includes('الرباط') || t.court?.includes('الرباط')).length, filterCity: 'الرباط', color: 'bg-[#59718A]' },
    { name: 'المحكمة الابتدائية بابن أحمد', count: tasks.filter(t => t.destination?.includes('أحمد') || t.court?.includes('أحمد')).length, filterCity: 'ابن أحمد', color: 'bg-[#2F6F6D]' },
    { name: 'المحكمة الابتدائية ببرشيد', count: tasks.filter(t => t.destination?.includes('برشيد') || t.court?.includes('برشيد')).length, filterCity: 'برشيد', color: 'bg-[#E07A47]' },
    { name: 'الدائرة القضائية بسطات (محلي)', count: tasks.filter(t => t.destination?.includes('سطات') || t.court?.includes('سطات')).length, filterCity: 'سطات', color: 'bg-[#D4A72C]' }
  ];

  return (
    <div className="w-full space-y-5">
      {/* 1. THE 6 KPI CARDS (Solid Fill 100%, 2 cols on md/lg, 1 col on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full">
        {/* Card 1: Slate Blue (#59718A) - إجمالي المهام */}
        <div 
          onClick={() => { setFilters({}); onNavigate('tasks'); }}
          className="bg-[#59718A] rounded-[12px] p-4 min-h-[80px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="عرض سجل المهام الكامل"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[14px] font-semibold flex items-center gap-[6px]">
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>إجمالي المهام المسجلة</span>
            </div>
            <div className="text-[12px] opacity-90 mt-1 font-medium">
              {kpiStats.localCount} محلي • {kpiStats.externalCount} تنقل خارجي
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-[32px] font-bold leading-none font-mono tabular-nums">
              {kpiStats.totalTasks}
            </span>
          </div>
        </div>

        {/* Card 2: Mustard (#D4A72C) - مهام جارية اليوم */}
        <div 
          onClick={() => onNavigate('today')}
          className="bg-[#D4A72C] rounded-[12px] p-4 min-h-[80px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="الانتقال إلى لوحة إدارة اليوم"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[14px] font-semibold flex items-center gap-[6px]">
              <Sun className="w-4 h-4 shrink-0" />
              <span>مهام جارية اليوم</span>
            </div>
            <div className="text-[12px] opacity-90 mt-1 font-medium">
              برنامج وجدولة اليوم
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-[32px] font-bold leading-none font-mono tabular-nums">
              {kpiStats.todayTasks}
            </span>
          </div>
        </div>

        {/* Card 3: Deep Plum (#5B3A62) - مهام مبرمجة ومفتوحة */}
        <div 
          onClick={() => onNavigate('backlog')}
          className="bg-[#5B3A62] rounded-[12px] p-4 min-h-[80px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="الانتقال إلى برمجة المهام"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[14px] font-semibold flex items-center gap-[6px]">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>مهام مبرمجة ومفتوحة</span>
            </div>
            <div className="text-[12px] opacity-90 mt-1 font-medium">
              مجدولة وقيد التحضير
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-[32px] font-bold leading-none font-mono tabular-nums">
              {kpiStats.futureTasks}
            </span>
          </div>
        </div>

        {/* Card 4: Terracotta (#E07A47) - تحتاج متابعة وتسوية */}
        <div 
          onClick={() => { setFilters({ status: 'قيد المتابعة' }); onNavigate('tasks'); }}
          className="bg-[#E07A47] rounded-[12px] p-4 min-h-[80px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="تصفية المهام التي تحتاج متابعة"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[14px] font-semibold flex items-center gap-[6px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>تحتاج متابعة وتسوية</span>
            </div>
            <div className="text-[12px] opacity-90 mt-1 font-medium">
              قيد التتبع والمطابقة
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-[32px] font-bold leading-none font-mono tabular-nums">
              {kpiStats.pendingTasks}
            </span>
          </div>
        </div>

        {/* Card 5: Teal (#2F6F6D) - تنقلات الدائرة القضائية */}
        <div 
          onClick={() => { setFilters({ scope: 'تنقل خارجي' }); onNavigate('tasks'); }}
          className="bg-[#2F6F6D] rounded-[12px] p-4 min-h-[80px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="تصفية تنقلات وتدخلات الدائرة القضائية"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[14px] font-semibold flex items-center gap-[6px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>تنقلات الدائرة القضائية</span>
            </div>
            <div className="text-[12px] opacity-90 mt-1 font-medium">
              الرباط • ابن أحمد • برشيد
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-[32px] font-bold leading-none font-mono tabular-nums">
              {kpiStats.externalCount}
            </span>
          </div>
        </div>

        {/* Card 6: Sage Green (#8FA68F) - مهام مستوفاة ومنجزة */}
        <div 
          onClick={() => { setFilters({ status: 'منجزة' }); onNavigate('tasks'); }}
          className="bg-[#8FA68F] rounded-[12px] p-4 min-h-[80px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="عرض المهام المنجزة"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[14px] font-semibold flex items-center gap-[6px]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>مهام مستوفاة ومنجزة</span>
            </div>
            <div className="text-[12px] opacity-90 mt-1 font-medium">
              نسبة الإنجاز: {kpiStats.completionRate}%
            </div>
          </div>
          <div className="flex items-center justify-end">
            <span className="text-[32px] font-bold leading-none font-mono tabular-nums">
              {kpiStats.doneTasks}
            </span>
          </div>
        </div>
      </div>

      {/* 2. حاوية مهام اليوم الجارية (Mustard Border) */}
      <div className="w-full bg-[#1B1D2A] border border-[#D4A72C]/40 rounded-[12px] p-4 shadow-lg mb-5">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div className="text-[15px] font-semibold text-[#D4A72C] flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <span>برنامج مهام اليوم الجارية ({todayTasks.length})</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenNewTaskModal(todayStr)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مهمة لليوم</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTodaySectionFolded(!isTodaySectionFolded)}
              className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"
              title={isTodaySectionFolded ? 'توسيع' : 'طي'}
            >
              {isTodaySectionFolded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isTodaySectionFolded && (
          <div className="mt-3 space-y-2">
            {todayTasks.length === 0 ? (
              <div className="border border-dashed border-white/10 rounded-xl py-10 flex flex-col items-center justify-center text-center">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center mb-2.5">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <h4 className="font-bold text-gray-200 text-xs mb-1">لا توجد مهام مبرمجة لليوم حالياً.</h4>
                <p className="text-[11px] text-gray-400 max-w-xs">
                  يمكنك إضافة مهمة بالضغط على «مهمة لليوم» أو تعيين مهمة من القائمة المبرمجة أدناه.
                </p>
              </div>
            ) : (
              todayTasks.slice(0, 5).map(t => (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-white/5 bg-[#12131C] hover:border-[#D4A72C]/40 transition-all gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-gray-400 mb-1">
                      <span className="font-bold text-[#D4A72C]">اليوم</span>
                      <span>•</span>
                      <span className="truncate">📍 {t.destination}</span>
                      <span>•</span>
                      <span className="truncate text-gray-300">🏷️ {t.category}</span>
                    </div>
                    <div 
                      onClick={() => onViewTask(t)}
                      className="font-bold text-xs text-white truncate cursor-pointer hover:text-[#D4A72C]"
                    >
                      {t.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(t.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#8FA68F] hover:bg-[#8FA68F]/80 text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>إنجاز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(t)}
                      className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 cursor-pointer"
                      title="تعديل"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 rounded-lg border border-[#E07A47]/40 text-[#E07A47] hover:bg-[#E07A47]/10 cursor-pointer"
                      title="حذف"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* 3. حاوية استشراف المهام المبرمجة والمستقبلية (Deep Plum Border) */}
      <div className="w-full bg-[#1B1D2A] border border-[#5B3A62]/50 rounded-[12px] p-4 shadow-lg mb-5">
        <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
          <div className="text-[15px] font-semibold text-[#c084fc] flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>استشراف المهام المستقبلية ({futureTasks.length})</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('backlog')}
            className="text-xs text-[#c084fc] font-bold hover:text-white transition-colors flex items-center gap-1 underline cursor-pointer"
          >
            <span>جدول البرمجة الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {futureTasks.slice(0, 3).map(t => (
            <div 
              key={t.id}
              className="bg-[#12131C] border border-white/5 rounded-xl p-3.5 flex flex-col justify-between"
            >
              <div className="flex justify-between items-start mb-2">
                <span className="text-[11px] font-bold text-[#D4A72C] bg-[#D4A72C]/10 px-2 py-0.5 rounded-md">
                  {t.taskDate || 'مفتوحة بدون تاريخ'}
                </span>
                <span className="text-[10px] text-gray-400 bg-white/5 px-2 py-0.5 rounded-md truncate max-w-[110px]">
                  {t.category}
                </span>
              </div>
              <p 
                onClick={() => onViewTask(t)}
                className="font-semibold text-xs text-white mb-3 line-clamp-2 leading-relaxed cursor-pointer hover:text-[#c084fc]"
              >
                {t.title}
              </p>
              <div className="mt-auto flex justify-between items-center pt-2.5 border-t border-white/5 text-[11px]">
                <span className="text-gray-400 truncate max-w-[120px]">
                  📍 {t.destination}
                </span>
                <button
                  type="button"
                  onClick={() => scheduleTaskForToday(t.id)}
                  className="bg-[#5B3A62] hover:bg-[#5B3A62]/80 text-white px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer"
                >
                  تعيين لليوم
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. حاوية تنقلات وتدخلات الدائرة القضائية (Sage Green Border) */}
      <div className="w-full bg-[#1B1D2A] border border-[#8FA68F]/40 rounded-[12px] p-4 shadow-lg mb-5">
        <div className="flex justify-between items-center pb-3 border-b border-white/5 mb-3">
          <div className="text-[15px] font-semibold text-[#8FA68F] flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            <span>تنقلات وتدخلات الدائرة القضائية</span>
          </div>
          <span className="text-[11px] text-[#8E91A0] hidden sm:block">حسب مقرات المحاكم والمصالح</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {geoBreakdown.map(geo => (
            <div 
              key={geo.name}
              onClick={() => { setFilters({ destination: geo.filterCity }); onNavigate('tasks'); }}
              className="bg-[#12131C] border border-white/5 rounded-xl p-3 flex justify-between items-center hover:border-[#59718A]/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <span className={`w-2.5 h-2.5 rounded-full ${geo.color}`}></span>
                <span className="font-semibold text-xs text-gray-200">{geo.name}</span>
              </div>
              <span className="text-xs font-bold text-white bg-white/5 px-2.5 py-0.5 rounded-lg font-mono">
                {geo.count} تدخلاً
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. حاوية قوالب التدخلات السريعة (Teal Border) */}
      {templates.length > 0 && (
        <div className="w-full bg-[#1B1D2A] border border-[#2F6F6D]/40 rounded-[12px] p-4 shadow-lg mb-5">
          <div className="text-[15px] font-semibold text-[#2F6F6D] flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4" />
            <span>قوالب التدخلات السريعة بنقرة واحدة:</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => onOpenNewTaskModal(todayStr)}
                className="bg-[#12131C] border border-white/5 rounded-xl p-3 flex items-center gap-2.5 text-right hover:bg-white/5 hover:border-[#2F6F6D]/50 transition-colors group cursor-pointer"
              >
                <div className="w-7 h-7 rounded-lg bg-[#D4A72C]/10 text-[#D4A72C] flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-3.5 h-3.5" />
                </div>
                <span className="text-xs font-medium text-gray-300 group-hover:text-white truncate">
                  {tpl.title}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
