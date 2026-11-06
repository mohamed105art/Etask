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
  ArrowLeft,
  Clock,
  Sparkles
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
    { name: 'الرباط (المصالح المركزية)', count: tasks.filter(t => t.destination?.includes('الرباط') || t.court?.includes('الرباط')).length, filterCity: 'الرباط' },
    { name: 'المحكمة الابتدائية بابن أحمد', count: tasks.filter(t => t.destination?.includes('أحمد') || t.court?.includes('أحمد')).length, filterCity: 'ابن أحمد' },
    { name: 'المحكمة الابتدائية ببرشيد', count: tasks.filter(t => t.destination?.includes('برشيد') || t.court?.includes('برشيد')).length, filterCity: 'برشيد' },
    { name: 'الدائرة القضائية بسطات (محلي)', count: tasks.filter(t => t.destination?.includes('سطات') || t.court?.includes('سطات')).length, filterCity: 'سطات' }
  ];

  return (
    <div className="space-y-5">
      {/* 1. EXACT 6 MINIMALIST MATTE KPI METRIC CARDS (3x2 Desktop, 2x3 Tablet, 1x6 Mobile) */}
      <div className="kpi-matte-grid-6">
        {/* Card 1: Total Registered Tasks (Blue) */}
        <div 
          onClick={() => { setFilters({}); onNavigate('tasks'); }}
          className="kpi-matte-card kpi-theme-blue"
          title="النقر لعرض كافة المهام المسجلة"
        >
          <div className="kpi-watermark-icon">
            <ClipboardList />
          </div>
          <div className="kpi-matte-top">
            <span className="kpi-matte-title">إجمالي المهام المسجلة</span>
          </div>
          <div className="kpi-matte-number">
            {kpiStats.totalTasks}
          </div>
          <div className="kpi-matte-footer">
            <span className="kpi-matte-sub">
              <span>{kpiStats.localCount} محلي</span>
              <span>·</span>
              <span>{kpiStats.externalCount} تنقل خارجي</span>
            </span>
          </div>
        </div>

        {/* Card 2: Today's Active Tasks (Amber) */}
        <div 
          onClick={() => onNavigate('today')}
          className="kpi-matte-card kpi-theme-amber"
          title="النقر للانتقال إلى لوحة مهام اليوم"
        >
          <div className="kpi-watermark-icon">
            <Sun />
          </div>
          <div className="kpi-matte-top">
            <span className="kpi-matte-title">مهام جارية اليوم</span>
          </div>
          <div className="kpi-matte-number">
            {kpiStats.todayTasks}
          </div>
          <div className="kpi-matte-footer">
            <span className="kpi-matte-sub">
              <span>برنامج وجدولة اليوم</span>
            </span>
          </div>
        </div>

        {/* Card 3: Scheduled & Open Tasks (Purple) */}
        <div 
          onClick={() => onNavigate('backlog')}
          className="kpi-matte-card kpi-theme-purple"
          title="النقر لعرض المهام المبرمجة والمستقبلية"
        >
          <div className="kpi-watermark-icon">
            <Calendar />
          </div>
          <div className="kpi-matte-top">
            <span className="kpi-matte-title">مهام مبرمجة ومفتوحة</span>
          </div>
          <div className="kpi-matte-number">
            {kpiStats.futureTasks}
          </div>
          <div className="kpi-matte-footer">
            <span className="kpi-matte-sub">
              <span>مجدولة وقيد التحضير</span>
            </span>
          </div>
        </div>

        {/* Card 4: Needs Follow-up / Overdue (Red) */}
        <div 
          onClick={() => { setFilters({ status: 'قيد المتابعة' }); onNavigate('tasks'); }}
          className="kpi-matte-card kpi-theme-red"
          title="النقر لتصفية المهام التي تحتاج متابعة أو تسوية"
        >
          <div className="kpi-watermark-icon">
            <AlertTriangle />
          </div>
          <div className="kpi-matte-top">
            <span className="kpi-matte-title">تحتاج متابعة وتسوية</span>
          </div>
          <div className="kpi-matte-number">
            {kpiStats.pendingTasks}
          </div>
          <div className="kpi-matte-footer">
            <span className="kpi-matte-sub">
              <span>قيد التتبع والمطابقة</span>
            </span>
          </div>
        </div>

        {/* Card 5: Regional Judicial Trips (Cyan) */}
        <div 
          onClick={() => { setFilters({ scope: 'تنقل خارجي' }); onNavigate('tasks'); }}
          className="kpi-matte-card kpi-theme-cyan"
          title="النقر لتصفية تنقلات وتدخلات الدائرة القضائية"
        >
          <div className="kpi-watermark-icon">
            <MapPin />
          </div>
          <div className="kpi-matte-top">
            <span className="kpi-matte-title">تنقلات الدائرة القضائية</span>
          </div>
          <div className="kpi-matte-number">
            {kpiStats.externalCount}
          </div>
          <div className="kpi-matte-footer">
            <span className="kpi-matte-sub">
              <span>الرباط · ابن أحمد · برشيد</span>
            </span>
          </div>
        </div>

        {/* Card 6: Completed Tasks & Rate (Emerald Green) */}
        <div 
          onClick={() => { setFilters({ status: 'منجزة' }); onNavigate('tasks'); }}
          className="kpi-matte-card kpi-theme-green"
          title="النقر لعرض المهام المنجزة والمستوفاة"
        >
          <div className="kpi-watermark-icon">
            <CheckCircle2 />
          </div>
          <div className="kpi-matte-top">
            <span className="kpi-matte-title">مهام مستوفاة ومنجزة</span>
          </div>
          <div className="kpi-matte-number">
            {kpiStats.doneTasks}
          </div>
          <div className="kpi-matte-footer">
            <span className="kpi-matte-sub">
              <span>نسبة الإنجاز: {kpiStats.completionRate}%</span>
            </span>
          </div>
        </div>
      </div>

      {/* 2. ADAPTIVE TODAY SECTION */}
      <div className="bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#1f2937] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1f2937]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Sun className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              برنامج مهام اليوم الجارية ({todayTasks.length})
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onOpenNewTaskModal(todayStr)}
              className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>مهمة لليوم</span>
            </button>
            <button
              type="button"
              onClick={() => setIsTodaySectionFolded(!isTodaySectionFolded)}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-[#1e293b] cursor-pointer transition-colors"
              title={isTodaySectionFolded ? 'توسيع' : 'طي'}
            >
              {isTodaySectionFolded ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {!isTodaySectionFolded && (
          <div className="mt-3 space-y-2">
            {todayTasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-[#131b2e]/40 rounded-lg border border-dashed border-slate-200 dark:border-[#1f2937]">
                <Clock className="w-5 h-5 mx-auto mb-1.5 text-slate-400 opacity-60" />
                <p className="font-semibold">لا توجد مهام مبرمجة لليوم حالياً.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">يمكنك إضافة مهمة بالضغط على «مهمة لليوم» أو تعيين مهمة من القائمة المبرمجة أدناه.</p>
              </div>
            ) : (
              todayTasks.slice(0, 5).map(t => (
                <div 
                  key={t.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-[#1f2937] bg-slate-50/70 dark:bg-[#131b2e]/70 hover:border-blue-400 dark:hover:border-blue-500 transition-all gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                      <span className="font-bold text-amber-600 dark:text-amber-400">اليوم</span>
                      <span>·</span>
                      <span className="truncate">📍 {t.destination}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700 dark:text-slate-300">🏷️ {t.category}</span>
                    </div>
                    <div 
                      onClick={() => onViewTask(t)}
                      className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-blue-500"
                    >
                      {t.title}
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => toggleTaskStatus(t.id)}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>إنجاز</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(t)}
                      className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1f2937] bg-white dark:bg-[#151d30] text-slate-600 dark:text-slate-300 hover:text-blue-500 hover:border-blue-400 cursor-pointer transition-colors"
                      title="تعديل المهمة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      className="p-1.5 rounded-lg border border-red-200 dark:border-red-900/40 bg-white dark:bg-[#151d30] text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 cursor-pointer transition-colors"
                      title="نقل للمهملات"
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

      {/* 3. FUTURE TASKS & BACKLOG FORECAST */}
      <div className="bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#1f2937] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1f2937]">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Calendar className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              استشراف المهام المبرمجة والمستقبلية ({futureTasks.length})
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('backlog')}
            className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>جدول البرمجة الكامل</span>
            <ArrowLeft className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="mt-3 space-y-2">
          {futureTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500 dark:text-slate-400">
              لا توجد مهام مبرمجة مستقبلاً.
            </div>
          ) : (
            futureTasks.slice(0, 3).map(t => (
              <div 
                key={t.id}
                className="flex items-center justify-between p-3 rounded-lg border border-slate-100 dark:border-[#1f2937] bg-slate-50/70 dark:bg-[#131b2e]/70 hover:border-purple-400 transition-all gap-3"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mb-0.5">
                    <span className="font-bold text-purple-600 dark:text-purple-400 font-mono">
                      {t.taskDate ? t.taskDate : '📌 مفتوحة بدون تاريخ'}
                    </span>
                    <span>·</span>
                    <span className="truncate">📍 {t.destination}</span>
                    <span>·</span>
                    <span>🏷️ {t.category}</span>
                  </div>
                  <div 
                    onClick={() => onViewTask(t)}
                    className="font-bold text-xs text-slate-900 dark:text-white truncate cursor-pointer hover:text-purple-500"
                  >
                    {t.title}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => scheduleTaskForToday(t.id)}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold border border-purple-300 dark:border-purple-800 text-purple-700 dark:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-950/40 transition-colors cursor-pointer"
                  >
                    تعيين لليوم
                  </button>
                  <button
                    type="button"
                    onClick={() => onEditTask(t)}
                    className="p-1.5 rounded-lg border border-slate-200 dark:border-[#1f2937] bg-white dark:bg-[#151d30] text-slate-600 dark:text-slate-300 hover:text-blue-500 cursor-pointer transition-colors"
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

      {/* 4. GEOGRAPHIC JURISDICTION & REGIONAL TRIPS */}
      <div className="bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#1f2937] rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1f2937] mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <MapPin className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              تنقلات وتدخلات الدائرة القضائية لسطات
            </h2>
          </div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">حسب مقرات المحاكم والمصالح</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {geoBreakdown.map(geo => (
            <div 
              key={geo.name}
              onClick={() => { setFilters({ destination: geo.filterCity }); onNavigate('tasks'); }}
              className="p-3 rounded-lg bg-slate-50/70 dark:bg-[#131b2e]/60 border border-slate-200/60 dark:border-[#1f2937] hover:border-blue-500 transition-all cursor-pointer flex items-center justify-between group"
            >
              <div className="flex items-center gap-2 min-w-0">
                <span className="w-2 h-2 rounded-full bg-blue-500 shrink-0" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate group-hover:text-blue-500 transition-colors">
                  {geo.name}
                </span>
              </div>
              <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 tabular-nums font-mono mr-2">
                {geo.count}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. QUICK TEMPLATES ACCELERATOR */}
      {templates.length > 0 && (
        <div className="bg-white dark:bg-[#151d30] border border-slate-200 dark:border-[#1f2937] rounded-xl p-4 shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>قوالب التدخلات السريعة بنقرة واحدة:</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {templates.map(tpl => (
              <button
                key={tpl.id}
                type="button"
                onClick={() => {
                  onOpenNewTaskModal(todayStr);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-[#1f2937] bg-slate-50 dark:bg-[#131b2e] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
              >
                ⚡ {tpl.title}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
