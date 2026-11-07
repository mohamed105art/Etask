import React, { useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { CalendarAppLogo } from './CalendarAppLogo';
import { 
  BarChart3, 
  Sun, 
  Bookmark, 
  Calendar, 
  ClipboardList, 
  FileText, 
  History, 
  Trash2, 
  Settings, 
  Plus, 
  Zap, 
  X, 
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
      badgeColor: 'bg-[#D4A72C]/20 border border-[#D4A72C] text-[#D4A72C]' 
    },
    { 
      id: 'backlog', 
      label: settings?.sidebarLabels?.backlog || 'برمجة المهام', 
      icon: Bookmark, 
      badge: kpiStats.futureTasks > 0 ? kpiStats.futureTasks : null, 
      badgeColor: 'bg-[#5B3A62]/20 border border-[#5B3A62] text-[#c084fc]' 
    },
    { 
      id: 'calendar', 
      label: settings?.sidebarLabels?.calendar || 'التقويم الزمني', 
      icon: Calendar, 
      badge: null 
    },
    { 
      id: 'tasks', 
      label: settings?.sidebarLabels?.tasks || 'سجل المهام والعمليات', 
      icon: ClipboardList, 
      badge: kpiStats.totalTasks, 
      badgeColor: 'bg-white/10 text-gray-300' 
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
      badgeColor: 'bg-[#E07A47]/20 border border-[#E07A47] text-[#E07A47]' 
    }
  ];

  const recentTasks = tasks.slice(0, 4);

  return (
    <>
      {/* Dark Overlay Backdrop */}
      <div 
        id="sidebar-backdrop"
        className={isOpen ? 'open' : ''}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar Drawer (fixed top-0 right-0 h-screen w-[280px] bg-[#12131C] z-50) */}
      <aside 
        id="app-sidebar"
        className={`fixed top-0 right-0 w-[85%] max-w-[280px] sm:w-[280px] h-full bg-[#12131C] z-50 transform transition-transform duration-300 ease-in-out flex flex-col border-l border-white/10 shadow-2xl overflow-y-auto ${
          isOpen ? 'translate-x-0 open' : 'translate-x-full'
        }`}
        role="dialog"
        aria-label="القائمة الجانبية للنظام"
      >
        {/* Header: Right has Calendar Logo (32px) + Title (16px bold) + Subtitle (12px #8E91A0)
                  Left has Close button (32x32px) in top corner */}
        <div className="flex justify-between items-start p-4 border-b border-white/10 shrink-0">
          {/* Right Section: Flex-col */}
          <div className="flex flex-col items-start gap-1">
            <div className="w-[36px] h-[36px] rounded-[8px] bg-[#1B1D2A] border border-[#59718A] flex justify-center items-center shadow-xs mb-1">
              <CalendarAppLogo size={22} />
            </div>
            <h2 className="font-bold text-[16px] text-white leading-tight">
              نظام تدبير المهام اليومية
            </h2>
            <p className="text-[12px] text-[#8E91A0]">
              المديرية الإقليمية بسطات
            </p>
          </div>

          {/* Left Section: Close button 32x32px */}
          <button
            type="button"
            onClick={onClose}
            aria-label="إغلاق القائمة الجانبية"
            title="إغلاق (Esc)"
            className="w-[32px] h-[32px] rounded-[8px] bg-white/5 border border-white/10 flex justify-center items-center hover:bg-white/10 text-gray-400 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Buttons in Sidebar */}
        <div className="p-4 flex flex-col gap-2 shrink-0 border-b border-white/5">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-global-search'));
                onClose();
              }}
              className="flex-1 bg-[#1B1D2A] border border-[#E07A47]/50 text-[#E07A47] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#E07A47]/10 transition-colors cursor-pointer"
            >
              <Search className="w-3.5 h-3.5" />
              <span>بحث شامل</span>
            </button>

            <button
              type="button"
              onClick={() => {
                onOpenFastCaptureModal();
                onClose();
              }}
              className="flex-1 bg-[#D4A72C]/20 border border-[#D4A72C]/50 text-[#D4A72C] rounded-xl py-2.5 text-xs font-bold flex items-center justify-center gap-1.5 hover:bg-[#D4A72C]/30 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-[#D4A72C]" />
              <span>إدخال فوري</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              onOpenNewTaskModal();
              onClose();
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl py-3 text-xs font-bold flex items-center justify-center gap-2 shadow-lg transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>مهمة جديدة</span>
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-3 overflow-y-auto space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  onSelectView(item.id);
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl transition-colors text-xs cursor-pointer ${
                  isActive
                    ? 'bg-white/5 border border-[#59718A]/40 text-[#59718A] font-bold'
                    : 'text-gray-300 hover:bg-white/5 font-semibold'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#59718A]' : 'text-gray-400'}`} />
                  <span className="truncate">{item.label}</span>
                </div>

                {item.badge !== null && (
                  <span className={`w-6 h-5 rounded-full flex items-center justify-center text-[10px] font-bold tabular-nums ${item.badgeColor || 'bg-white/10 text-gray-300'}`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Recent tasks brief */}
          {recentTasks.length > 0 && (
            <div className="mt-4 pt-3 border-t border-white/5">
              <span className="text-[10px] font-bold text-gray-400 uppercase px-2 mb-1.5 block">
                الأحدث مسجلة
              </span>
              <div className="flex flex-col gap-1">
                {recentTasks.map(t => (
                  <div
                    key={t.id}
                    onClick={() => {
                      onSelectView('tasks');
                      onClose();
                    }}
                    title={t.title}
                    className="p-1.5 rounded-lg hover:bg-white/5 text-[11px] text-gray-400 hover:text-white cursor-pointer flex items-center gap-1.5 truncate transition-colors"
                  >
                    <span className="text-gray-500">·</span>
                    <span className="truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </nav>

        {/* Footer with Settings & Profile */}
        <div className="p-3 border-t border-white/10 mt-auto shrink-0 bg-[#12131C]">
          <button
            type="button"
            onClick={() => {
              onSelectView('settings');
              onClose();
            }}
            className="w-full flex items-center justify-between px-2 py-2 text-gray-400 hover:text-white font-semibold text-xs transition-colors mb-2 cursor-pointer"
          >
            <span>الإعدادات والنسخ</span>
            <Settings className="w-4 h-4" />
          </button>

          <div 
            onClick={() => {
              onSelectView('settings');
              onClose();
            }}
            className="bg-[#1B1D2A] border border-white/5 rounded-xl p-2.5 flex justify-between items-center cursor-pointer hover:border-[#59718A]/50 transition-colors"
          >
            <div className="text-right">
              <h4 className="font-bold text-xs text-white truncate">
                {profile?.fullName || settings?.userName || 'الأستاذ محمد'}
              </h4>
              <p className="text-[10px] text-gray-400 truncate">
                {profile?.jobTitle || 'إطار إداري وتقني'}
              </p>
            </div>
            <div className="w-8 h-8 rounded-full bg-[#59718A] flex justify-center items-center font-bold text-white text-xs shrink-0 shadow-sm">
              {profile?.fullName ? profile.fullName.charAt(0) : 'م'}
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};
