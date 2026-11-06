import React, { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  BarChart3, 
  Sun, 
  Bookmark, 
  Calendar, 
  ClipboardList, 
  History, 
  Trash2, 
  Settings, 
  Plus, 
  Zap, 
  X,
  User,
  FileText,
  Search
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onSelectView: (view: string) => void;
  isOpen: boolean;
  onClose: () => void;
  onOpenNewTaskModal: () => void;
  onOpenFastCaptureModal: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onSelectView,
  isOpen,
  onClose,
  onOpenNewTaskModal,
  onOpenFastCaptureModal
}) => {
  const { kpiStats, tasks, profile, settings } = useTasks();

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const navItems = [
    { 
      id: 'dashboard', 
      label: settings?.sidebarLabels?.dashboard || 'لوحة القيادة والمؤشرات', 
      icon: BarChart3, 
      badge: null 
    },
    { 
      id: 'today', 
      label: settings?.sidebarLabels?.today || 'لوحة إدارة اليوم', 
      icon: Sun, 
      badge: kpiStats.todayTasks > 0 ? kpiStats.todayTasks : null, 
      badgeColor: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30' 
    },
    { 
      id: 'backlog', 
      label: settings?.sidebarLabels?.backlog || 'برمجة المهام المفتوحة', 
      icon: Bookmark, 
      badge: kpiStats.futureTasks > 0 ? kpiStats.futureTasks : null, 
      badgeColor: 'bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30' 
    },
    { 
      id: 'calendar', 
      label: settings?.sidebarLabels?.calendar || 'التقويم والجدولة', 
      icon: Calendar, 
      badge: null 
    },
    { 
      id: 'tasks', 
      label: settings?.sidebarLabels?.tasks || 'سجل المهام والعمليات', 
      icon: ClipboardList, 
      badge: kpiStats.totalTasks, 
      badgeColor: 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300' 
    },
    { 
      id: 'report', 
      label: settings?.sidebarLabels?.report || 'تقرير خاص بالمهمة', 
      icon: FileText, 
      badge: null 
    },
    { 
      id: 'audit', 
      label: 'سجل العمليات والتتبع', 
      icon: History, 
      badge: null 
    },
    { 
      id: 'trash', 
      label: settings?.sidebarLabels?.trash || 'سلة المهملات', 
      icon: Trash2, 
      badge: kpiStats.trashCount > 0 ? kpiStats.trashCount : null, 
      badgeColor: 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30' 
    }
  ];

  // Last 4 recent tasks for quick navigation
  const recentTasks = tasks.slice(0, 4);

  return (
    <>
      {/* Smart Glassmorphic Backdrop (#sidebar-backdrop) */}
      <div 
        id="sidebar-backdrop"
        className={isOpen ? 'open' : ''}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Smart Drawer Sidebar (#app-sidebar) - Fixed 280px width */}
      <aside 
        id="app-sidebar"
        className={isOpen ? 'open' : ''}
        role="dialog"
        aria-label="القائمة الجانبية للنظام"
      >
        {/* Top Header Section: Logo + System Name + Dismiss Button */}
        <div className="p-3.5 border-b border-slate-200 dark:border-[#1f2937] flex items-center justify-between gap-2 shrink-0">
          <div 
            onClick={() => { onSelectView('dashboard'); onClose(); }}
            className="flex items-center gap-2.5 cursor-pointer overflow-hidden group"
            title="المديرية الإقليمية لوزارة العدل بسطات"
          >
            <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 font-bold text-base shadow-xs group-hover:scale-105 transition-transform">
              ⚖️
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                {settings.systemName || 'نظام تدبير المهام'}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                المديرية الإقليمية بسطات
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة الجانبية"
            title="إغلاق (Esc)"
            className="w-7 h-7 rounded-lg border border-slate-200 dark:border-[#1f2937] bg-slate-100/80 dark:bg-[#151d30] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:border-slate-400 flex items-center justify-center transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Primary Action CTA Container (.sidebar-action-wrap) */}
        <div className="sidebar-action-wrap p-3 flex flex-col gap-2 shrink-0 border-b border-slate-100 dark:border-[#1f2937]/70 bg-slate-50/50 dark:bg-[#131b2e]/30">
          {/* Primary CTA: + مهمة جديدة */}
          <button
            type="button"
            onClick={() => { onOpenNewTaskModal(); onClose(); }}
            title="إضافة مهمة جديدة"
            className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-bold text-xs shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4 shrink-0" />
            <span>+ مهمة جديدة</span>
          </button>

          {/* Quick Dual Actions: Fast Capture & Global Search */}
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => { onOpenFastCaptureModal(); onClose(); }}
              title="إدخال فوري وسريع"
              className="py-1.5 px-2 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 border border-amber-500/30 font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span>إدخال فوري</span>
            </button>

            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-global-search'));
                onClose();
              }}
              title="بحث شامل في المهام"
              className="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-[#151d30] hover:bg-slate-200 dark:hover:bg-[#1c263e] text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-[#1f2937] font-bold text-[11px] transition-all flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>بحث شامل</span>
            </button>
          </div>
        </div>

        {/* Navigation Items (Strict RTL Flex Hierarchy) */}
        <nav className="flex-1 overflow-y-auto px-2.5 py-3 flex flex-col gap-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => { onSelectView(item.id); onClose(); }}
                title={item.label}
                className={`
                  w-full flex items-center py-2.5 px-3 rounded-lg transition-all text-xs cursor-pointer
                  ${isActive 
                    ? 'bg-blue-600/10 dark:bg-blue-500/15 text-blue-700 dark:text-blue-300 font-bold border border-blue-500/20' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#151d30] hover:text-slate-900 dark:hover:text-slate-200 font-semibold'}
                `}
              >
                {/* Right: Linear Icon (20x20) */}
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 dark:text-slate-500'}`} />
                
                {/* Center: Section Label */}
                <span className="flex-1 text-right font-bold text-[0.84rem] mr-2.5 truncate">
                  {item.label}
                </span>

                {/* Left: Metric Counter Badge */}
                {item.badge !== null && (
                  <span className={`mr-auto min-w-[20px] text-center text-[10px] font-bold font-mono px-1.5 py-0.5 rounded-full tabular-nums ${item.badgeColor || 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Recent Tasks List */}
          {recentTasks.length > 0 && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-[#1f2937]">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase px-2 mb-1.5 block">
                الأحدث تسجيلاً
              </span>
              <div className="flex flex-col gap-0.5">
                {recentTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => { onSelectView('tasks'); onClose(); }}
                    title={t.title}
                    className="p-1.5 rounded-md hover:bg-slate-100 dark:hover:bg-[#151d30] text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer flex items-center gap-1.5 truncate transition-colors"
                  >
                    <span className="text-slate-400 text-xs">·</span>
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Sidebar Footer: Active Admin User Card & Settings */}
        <div className="p-3 border-t border-slate-200 dark:border-[#1f2937] flex flex-col gap-1.5 shrink-0 bg-slate-50/70 dark:bg-[#0e1424]">
          <button
            type="button"
            onClick={() => { onSelectView('settings'); onClose(); }}
            title="الإعدادات والنسخ الاحتياطي"
            className={`
              w-full flex items-center gap-2.5 py-2 px-3 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200/60 dark:hover:bg-[#151d30] transition-colors cursor-pointer
              ${currentView === 'settings' ? 'bg-slate-200/80 dark:bg-[#151d30] text-slate-900 dark:text-white font-bold' : ''}
            `}
          >
            <Settings className="w-4 h-4 shrink-0 text-slate-400" />
            <span className="flex-1 text-right">الإعدادات والنسخ</span>
          </button>

          {/* User Mini Card */}
          <div 
            onClick={() => { onSelectView('settings'); onClose(); }}
            className="flex items-center gap-2.5 p-2 rounded-xl bg-white dark:bg-[#151d30] border border-slate-200/80 dark:border-[#1f2937] hover:border-blue-500 transition-colors cursor-pointer"
            title={`${profile.fullName || settings.userName} - ${profile.organization || settings.department}`}
          >
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              {profile.fullName ? profile.fullName.charAt(0) : 'م'}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {profile.fullName || settings.userName}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                {profile.jobTitle || settings.userRole}
              </span>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
