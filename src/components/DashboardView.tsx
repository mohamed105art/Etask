import React, { useState, useMemo } from 'react';
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
  ArrowLeft,
  Tag,
  TrendingUp,
  TrendingDown,
  Filter
} from 'lucide-react';
import { Task } from '../types/tasks';

interface DashboardViewProps {
  onNavigate: (view: string) => void;
  onOpenNewTaskModal: (initialDate?: string) => void;
  onEditTask: (task: Task) => void;
  onViewTask: (task: Task) => void;
}

type PeriodFilter = 'all' | 'month' | 'week' | 'today';

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
  const [period, setPeriod] = useState<PeriodFilter>('all');
  const todayStr = new Date().toISOString().split('T')[0];

  // Helper date calculations
  const now = new Date();
  const currentMonthPrefix = todayStr.slice(0, 7); // YYYY-MM
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Previous month prefix for trend comparison
  const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const prevMonthPrefix = prevMonthDate.toISOString().split('T')[0].slice(0, 7);

  // Yesterday date for today trend comparison
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  // Filter tasks based on selected period
  const { filteredTasksList, prevPeriodTasksList } = useMemo(() => {
    let current: Task[] = [];
    let prev: Task[] = [];

    switch (period) {
      case 'today':
        current = tasks.filter(t => t.taskDate === todayStr || (t.createdAt && t.createdAt.startsWith(todayStr)));
        prev = tasks.filter(t => t.taskDate === yesterday || (t.createdAt && t.createdAt.startsWith(yesterday)));
        break;
      case 'week':
        current = tasks.filter(t => (t.taskDate && t.taskDate >= sevenDaysAgo && t.taskDate <= todayStr) || (t.createdAt && t.createdAt.slice(0, 10) >= sevenDaysAgo));
        prev = tasks.filter(t => (t.taskDate && t.taskDate >= fourteenDaysAgo && t.taskDate < sevenDaysAgo) || (t.createdAt && t.createdAt.slice(0, 10) >= fourteenDaysAgo && t.createdAt.slice(0, 10) < sevenDaysAgo));
        break;
      case 'month':
        current = tasks.filter(t => (t.taskDate && t.taskDate.startsWith(currentMonthPrefix)) || (t.createdAt && t.createdAt.startsWith(currentMonthPrefix)));
        prev = tasks.filter(t => (t.taskDate && t.taskDate.startsWith(prevMonthPrefix)) || (t.createdAt && t.createdAt.startsWith(prevMonthPrefix)));
        break;
      case 'all':
      default:
        current = tasks;
        // In "all", compare against tasks created before the current month to show long-term growth
        prev = tasks.filter(t => (t.taskDate && t.taskDate < currentMonthPrefix) || (t.createdAt && t.createdAt < currentMonthPrefix));
        break;
    }

    return { filteredTasksList: current, prevPeriodTasksList: prev };
  }, [tasks, period, todayStr, yesterday, sevenDaysAgo, fourteenDaysAgo, currentMonthPrefix, prevMonthPrefix]);

  // Compute stats for current period
  const periodStats = useMemo(() => {
    if (period === 'all') {
      return {
        totalTasks: kpiStats.totalTasks,
        todayTasks: kpiStats.todayTasks,
        futureTasks: kpiStats.futureTasks,
        pendingTasks: kpiStats.pendingTasks,
        externalCount: kpiStats.externalCount,
        doneTasks: kpiStats.doneTasks,
        completionRate: kpiStats.completionRate,
        localCount: kpiStats.localCount
      };
    }

    const total = filteredTasksList.length;
    const today = filteredTasksList.filter(t => !t.isBacklog && t.taskDate === todayStr && t.status !== 'منجزة' && t.status !== 'مكتملة').length;
    const future = filteredTasksList.filter(t => (t.isBacklog || !t.taskDate || (t.taskDate && t.taskDate > todayStr)) && t.status !== 'منجزة' && t.status !== 'مكتملة').length;
    const pending = filteredTasksList.filter(t => (t.status === 'معلقة' || t.status === 'متأخرة' || (t.taskDate && t.taskDate < todayStr)) && t.status !== 'منجزة' && t.status !== 'مكتملة').length;
    const external = filteredTasksList.filter(t => t.scope === 'تنقل خارجي' || t.destination?.includes('الرباط') || t.destination?.includes('أحمد') || t.destination?.includes('برشيد')).length;
    const done = filteredTasksList.filter(t => t.status === 'منجزة' || t.status === 'مكتملة').length;
    const local = total - external;
    const rate = total > 0 ? Math.round((done / total) * 100) : 0;

    return {
      totalTasks: total,
      todayTasks: today,
      futureTasks: future,
      pendingTasks: pending,
      externalCount: external,
      doneTasks: done,
      completionRate: rate,
      localCount: Math.max(0, local)
    };
  }, [filteredTasksList, period, kpiStats, todayStr]);

  // Compute trend percentages comparing current vs prev
  const computeTrend = (curr: number, prev: number) => {
    if (prev === 0 && curr === 0) return { percent: 0, isUp: true, isNeutral: true };
    if (prev === 0) return { percent: 100, isUp: true, isNeutral: false };
    const diff = curr - prev;
    const p = Math.round((diff / prev) * 100);
    return {
      percent: Math.abs(p),
      isUp: p >= 0,
      isNeutral: p === 0
    };
  };

  const totalTrend = useMemo(() => computeTrend(periodStats.totalTasks, prevPeriodTasksList.length), [periodStats.totalTasks, prevPeriodTasksList]);
  const doneTrend = useMemo(() => {
    const prevDone = prevPeriodTasksList.filter(t => t.status === 'منجزة' || t.status === 'مكتملة').length;
    return computeTrend(periodStats.doneTasks, prevDone);
  }, [periodStats.doneTasks, prevPeriodTasksList]);
  const externalTrend = useMemo(() => {
    const prevExt = prevPeriodTasksList.filter(t => t.scope === 'تنقل خارجي').length;
    return computeTrend(periodStats.externalCount, prevExt);
  }, [periodStats.externalCount, prevPeriodTasksList]);

  // Today active tasks
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
      {/* Top Bar: Title & Sleek Time-Range Dropdown */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#1B1D2A] border border-white/10 rounded-[16px] p-3.5 px-4 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#59718A]/20 text-[#59718A] flex items-center justify-center shrink-0">
            <ClipboardList className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white leading-tight">لوحة القيادة والمؤشرات الإستراتيجية</h2>
            <p className="text-[11px] text-[#8E91A0] mt-0.5">مؤشرات الأداء اللحظية وتتبع العمليات الميدانية</p>
          </div>
        </div>

        {/* Time-Range Filter Dropdown */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <label htmlFor="kpi-period-select" className="text-xs text-[#8E91A0] font-semibold flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-[#59718A]" />
            <span>فترة المؤشرات:</span>
          </label>
          <div className="relative">
            <select
              id="kpi-period-select"
              value={period}
              onChange={e => setPeriod(e.target.value as PeriodFilter)}
              className="bg-[#12131C] text-white border border-white/15 rounded-xl px-3 py-1.5 text-xs font-bold appearance-none pl-8 pr-3 focus:outline-none focus:border-[#59718A] cursor-pointer hover:border-white/30 transition-colors shadow-xs"
            >
              <option value="all" className="bg-[#1B1D2A] text-white">الكل (كامل السجل)</option>
              <option value="month" className="bg-[#1B1D2A] text-white">هذا الشهر</option>
              <option value="week" className="bg-[#1B1D2A] text-white">هذا الأسبوع</option>
              <option value="today" className="bg-[#1B1D2A] text-white">اليوم</option>
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-[#8E91A0] absolute left-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 1. THE 6 KPI CARDS (Even 6 Cards: 2 cols on md, 3 cols on lg, 1 col on mobile) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 w-full">
        {/* Card 1: Slate Blue (#59718A) - إجمالي المهام */}
        <div 
          onClick={() => { setFilters({}); onNavigate('tasks'); }}
          className="bg-[#59718A] rounded-[12px] p-4 min-h-[92px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="عرض سجل المهام الكامل"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[13px] font-semibold flex items-center gap-[6px]">
              <ClipboardList className="w-4 h-4 shrink-0" />
              <span>إجمالي المهام المسجلة</span>
            </div>
            <div className="text-[11px] opacity-90 mt-1 font-medium">
              {periodStats.localCount} محلي • {periodStats.externalCount} تنقل خارجي
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                {totalTrend.isUp ? (
                  <TrendingUp className="w-3 h-3 text-emerald-300" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-300" />
                )}
                <span>{totalTrend.isUp ? `+${totalTrend.percent}%` : `-${totalTrend.percent}%`}</span>
              </span>
              <span className="text-[10px] opacity-75">مقارنة بالفترة السابقة</span>
            </div>
          </div>
          <div className="flex items-center justify-end pr-2">
            <span className="text-[32px] font-bold leading-none font-sans tabular-nums">
              {periodStats.totalTasks}
            </span>
          </div>
        </div>

        {/* Card 2: Mustard (#D4A72C) - مهام جارية اليوم */}
        <div 
          onClick={() => onNavigate('today')}
          className="bg-[#D4A72C] rounded-[12px] p-4 min-h-[92px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="الانتقال إلى لوحة إدارة اليوم"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[13px] font-semibold flex items-center gap-[6px]">
              <Sun className="w-4 h-4 shrink-0" />
              <span>مهام جارية اليوم</span>
            </div>
            <div className="text-[11px] opacity-90 mt-1 font-medium">
              برنامج وجدولة اليوم
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                <Sun className="w-3 h-3 text-amber-200" />
                <span>نشطة الآن</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end pr-2">
            <span className="text-[32px] font-bold leading-none font-sans tabular-nums">
              {periodStats.todayTasks}
            </span>
          </div>
        </div>

        {/* Card 3: Deep Plum (#5B3A62) - مهام مبرمجة ومفتوحة */}
        <div 
          onClick={() => onNavigate('backlog')}
          className="bg-[#5B3A62] rounded-[12px] p-4 min-h-[92px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="الانتقال إلى برمجة المهام"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[13px] font-semibold flex items-center gap-[6px]">
              <Calendar className="w-4 h-4 shrink-0" />
              <span>مهام مبرمجة ومفتوحة</span>
            </div>
            <div className="text-[11px] opacity-90 mt-1 font-medium">
              مجدولة وقيد التحضير
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                <Clock className="w-3 h-3 text-purple-200" />
                <span>استشراف قادم</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end pr-2">
            <span className="text-[32px] font-bold leading-none font-sans tabular-nums">
              {periodStats.futureTasks}
            </span>
          </div>
        </div>

        {/* Card 4: Terracotta (#E07A47) - تحتاج متابعة وتسوية */}
        <div 
          onClick={() => { setFilters({ status: 'قيد المتابعة' }); onNavigate('tasks'); }}
          className="bg-[#E07A47] rounded-[12px] p-4 min-h-[92px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="تصفية المهام التي تحتاج متابعة"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[13px] font-semibold flex items-center gap-[6px]">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>تحتاج متابعة وتسوية</span>
            </div>
            <div className="text-[11px] opacity-90 mt-1 font-medium">
              قيد التتبع والمطابقة
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                <AlertTriangle className="w-3 h-3 text-amber-200" />
                <span>أولوية المعالجة</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end pr-2">
            <span className="text-[32px] font-bold leading-none font-sans tabular-nums">
              {periodStats.pendingTasks}
            </span>
          </div>
        </div>

        {/* Card 5: Teal (#2F6F6D) - تنقلات الدائرة القضائية */}
        <div 
          onClick={() => { setFilters({ scope: 'تنقل خارجي' }); onNavigate('tasks'); }}
          className="bg-[#2F6F6D] rounded-[12px] p-4 min-h-[92px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="تصفية تنقلات وتدخلات الدائرة القضائية"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[13px] font-semibold flex items-center gap-[6px]">
              <MapPin className="w-4 h-4 shrink-0" />
              <span>تنقلات الدائرة القضائية</span>
            </div>
            <div className="text-[11px] opacity-90 mt-1 font-medium">
              الرباط • ابن أحمد • برشيد
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                {externalTrend.isUp ? (
                  <TrendingUp className="w-3 h-3 text-teal-200" />
                ) : (
                  <TrendingDown className="w-3 h-3 text-rose-200" />
                )}
                <span>{externalTrend.isUp ? `+${externalTrend.percent}%` : `-${externalTrend.percent}%`}</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end pr-2">
            <span className="text-[32px] font-bold leading-none font-sans tabular-nums">
              {periodStats.externalCount}
            </span>
          </div>
        </div>

        {/* Card 6: Sage Green (#8FA68F) - مهام مستوفاة ومنجزة */}
        <div 
          onClick={() => { setFilters({ status: 'منجزة' }); onNavigate('tasks'); }}
          className="bg-[#8FA68F] rounded-[12px] p-4 min-h-[92px] shadow-lg flex justify-between items-center text-white cursor-pointer hover:scale-[1.01] transition-transform select-none"
          title="عرض المهام المنجزة"
        >
          <div className="flex flex-col justify-center items-start">
            <div className="text-[13px] font-semibold flex items-center gap-[6px]">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>مهام مستوفاة ومنجزة</span>
            </div>
            <div className="text-[11px] opacity-90 mt-1 font-medium">
              نسبة الإنجاز: {periodStats.completionRate}%
            </div>
            <div className="mt-2 flex items-center gap-1.5">
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-black/25 text-white">
                <TrendingUp className="w-3 h-3 text-emerald-200" />
                <span>+{doneTrend.percent}% نجاح</span>
              </span>
            </div>
          </div>
          <div className="flex items-center justify-end pr-2">
            <span className="text-[32px] font-bold leading-none font-sans tabular-nums">
              {periodStats.doneTasks}
            </span>
          </div>
        </div>
      </div>

      {/* 2. حاوية مهام اليوم الجارية (Mustard Border) */}
      <div className="w-full bg-[#1B1D2A] border border-[#D4A72C]/40 rounded-[12px] p-4 shadow-lg mb-5">
        <div className="flex justify-between items-center pb-3 border-b border-white/5">
          <div className="text-[14px] font-bold text-[#D4A72C] flex items-center gap-2">
            <Sun className="w-4 h-4" />
            <span>برنامج مهام اليوم الجارية ({todayTasks.length})</span>
          </div>

          <div className="flex items-center gap-2">
            {/* Minimalist icon button for new task with tooltip */}
            <button
              type="button"
              onClick={() => onOpenNewTaskModal(todayStr)}
              title="إضافة مهمة جديدة لليوم"
              className="w-8 h-8 rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsTodaySectionFolded(!isTodaySectionFolded)}
              className="w-8 h-8 rounded-lg text-[#8E91A0] hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors"
              title={isTodaySectionFolded ? 'توسيع القائمة' : 'طي القائمة'}
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
                  يمكنك إضافة مهمة بالضغط على زر الإضافة (+) أو تعيين مهمة من القائمة المبرمجة أدناه.
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
                      <span className="truncate flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#D4A72C] shrink-0" />
                        <span>{t.destination}</span>
                      </span>
                      <span>•</span>
                      <span className="truncate text-gray-300 flex items-center gap-1">
                        <Tag className="w-3 h-3 text-[#8E91A0] shrink-0" />
                        <span>{t.category}</span>
                      </span>
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
                      title="تعليم كمكتملة / مستوفاة"
                      className="w-8 h-8 rounded-lg bg-[#8FA68F] hover:bg-[#8FA68F]/80 text-white flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onEditTask(t)}
                      className="w-8 h-8 rounded-lg border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 flex items-center justify-center cursor-pointer transition-colors"
                      title="تعديل المهمة"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteTask(t.id)}
                      className="w-8 h-8 rounded-lg border border-[#E07A47]/40 text-[#E07A47] hover:bg-[#E07A47]/10 flex items-center justify-center cursor-pointer transition-colors"
                      title="حذف المهمة"
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
          <div className="text-[14px] font-bold text-[#c084fc] flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>استشراف المهام المستقبلية ({futureTasks.length})</span>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('backlog')}
            title="الانتقال إلى جدول البرمجة الكامل"
            className="text-xs text-[#c084fc] font-bold hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
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
                <span className="text-[11px] font-bold text-[#D4A72C] bg-[#D4A72C]/10 px-2 py-0.5 rounded-md font-sans">
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
                <span className="text-gray-400 truncate max-w-[120px] flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-gray-500 shrink-0" />
                  <span>{t.destination}</span>
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
          <div className="text-[14px] font-bold text-[#8FA68F] flex items-center gap-2">
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
              <span className="text-xs font-bold text-white bg-white/5 px-2.5 py-0.5 rounded-lg font-sans tabular-nums">
                {geo.count} تدخلاً
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* 5. حاوية قوالب التدخلات السريعة (Teal Border) */}
      {templates.length > 0 && (
        <div className="w-full bg-[#1B1D2A] border border-[#2F6F6D]/40 rounded-[12px] p-4 shadow-lg mb-5">
          <div className="text-[14px] font-bold text-[#2F6F6D] flex items-center gap-2 mb-3">
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
