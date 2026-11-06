import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Download, 
  Upload, 
  Lock
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentView, onToggleSidebar }) => {
  const { 
    settings, 
    profile, 
    toggleTheme, 
    exportBackupJSON, 
    importBackupJSON,
    kpiStats
  } = useTasks();

  const theme = settings?.theme || 'dark';
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [syncState, setSyncState] = useState<'online' | 'syncing' | 'offline'>('online');
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state & network listeners
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setSyncState('syncing');
      setTimeout(() => setSyncState('online'), 800);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setSyncState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Close profile dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const viewTitles: Record<string, string> = {
    dashboard: settings?.sidebarLabels?.dashboard || 'لوحة القيادة والمؤشرات',
    today: settings?.sidebarLabels?.today || 'لوحة إدارة اليوم',
    backlog: settings?.sidebarLabels?.backlog || 'برمجة المهام',
    calendar: settings?.sidebarLabels?.calendar || 'التقويم الزمني',
    tasks: settings?.sidebarLabels?.tasks || 'سجل المهام والعمليات',
    report: settings?.sidebarLabels?.report || 'تقرير خاص بالمهمة',
    audit: 'سجل العمليات والتتبع الزمني',
    trash: settings?.sidebarLabels?.trash || 'سلة المهملات',
    settings: settings?.sidebarLabels?.settings || 'الإعدادات والنسخ'
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importBackupJSON(content);
        }
      };
      reader.readAsText(file);
      setIsProfileMenuOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <header 
      id="app-header" 
      className="h-[58px] px-3 sm:px-5 flex items-center justify-between border-b transition-colors select-none"
    >
      {/* Hidden file input for quick backup restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* RIGHT ZONE (RTL): Hamburger Drawer Toggle + System Identity + View Title */}
      <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
        {/* Unified 38x38 Hamburger Toggle Button (#btn-sidebar-toggle) */}
        <button
          id="btn-sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-label="فتح القائمة الجانبية للتنقل"
          title="فتح القائمة الجانبية (Ctrl+B / Alt+S)"
          className="header-ctrl-btn hover:scale-105 active:scale-95"
        >
          <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
        </button>

        {/* Brand Lockup */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 text-base font-bold shadow-xs">
            ⚖️
          </div>
          <div className="flex flex-col min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-xs sm:text-sm text-slate-900 dark:text-white truncate">
                {settings.systemName || 'نظام تدبير المهام'}
              </span>
              <span className="hidden lg:inline-block text-[10px] font-mono px-1.5 py-0.2 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                V18
              </span>
            </div>
            <span className="hidden sm:inline-block text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {viewTitles[currentView] || 'المديرية الإقليمية لوزارة العدل بسطات'}
            </span>
          </div>
        </div>
      </div>

      {/* CENTER ZONE: Interactive Global Search Box */}
      <div className="hidden md:flex items-center justify-center flex-1 max-w-md mx-4">
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-global-search'));
          }}
          className="w-full h-[38px] px-3 rounded-lg border border-slate-200 dark:border-[#1f2937] bg-slate-100/70 dark:bg-[#131b2e] text-slate-500 dark:text-slate-400 hover:border-blue-500 dark:hover:border-blue-500 hover:text-slate-800 dark:hover:text-slate-200 transition-all flex items-center justify-between text-xs cursor-pointer group"
          title="البحث الشامل في أرشيف وتدخلات المهام (Ctrl+K)"
        >
          <div className="flex items-center gap-2 truncate">
            <Search className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
            <span className="truncate">بحث شامل في المهام والعمليات...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono bg-white dark:bg-[#1e293b] text-slate-400 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* LEFT ZONE: Unified 38x38 Control Buttons */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Button */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-global-search'));
          }}
          className="md:hidden header-ctrl-btn"
          title="بحث سريع (Ctrl+K)"
          aria-label="بحث شامل"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Theme Mode Toggle (Dark / Light) */}
        <button
          type="button"
          onClick={toggleTheme}
          title={theme === 'dark' ? 'التبديل إلى الوضع النهاري الصافي' : 'التبديل إلى الوضع الليلي الفخم'}
          aria-label="تبديل وضع السمة"
          className="header-ctrl-btn"
        >
          {theme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform" />
          ) : (
            <Moon className="w-4 h-4 text-blue-600 hover:-rotate-12 transition-transform" />
          )}
        </button>

        {/* 3-State Account & Sync Lamp Button (#header-user-avatar-btn) */}
        <div className="relative" ref={profileMenuRef}>
          <button
            id="header-user-avatar-btn"
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            title={`المسؤول: ${profile.fullName || 'محمد'} (${isOnline ? 'متصل ومزامن 100%' : 'غير متصل'})`}
            aria-label="الملف الشخصي وحالة المزامنة السحابية"
            className={`
              header-ctrl-btn relative overflow-hidden transition-all
              ${syncState === 'online' ? 'hover:border-emerald-500' : ''}
              ${syncState === 'syncing' ? 'border-amber-500' : ''}
              ${syncState === 'offline' ? 'border-red-500' : ''}
            `}
          >
            {/* User Icon or Initial */}
            <span className="font-bold text-xs text-slate-800 dark:text-slate-100">
              {profile.fullName ? profile.fullName.charAt(0) : 'م'}
            </span>

            {/* 3-State Connection Status Dot */}
            <span 
              className={`
                absolute bottom-1 left-1 w-2.5 h-2.5 rounded-full border-2 border-white dark:border-[#111827]
                ${syncState === 'online' ? 'bg-emerald-500' : ''}
                ${syncState === 'syncing' ? 'bg-amber-500 lamp-pulse' : ''}
                ${syncState === 'offline' ? 'bg-red-500' : ''}
              `} 
            />
          </button>

          {/* Profile & Sync Management Dropdown Modal */}
          {isProfileMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-[#1f2937] shadow-xl p-3 z-50 text-right text-xs">
              {/* User Identity Card */}
              <div className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-50 dark:bg-[#151d30] border border-slate-100 dark:border-[#1f2937] mb-2.5">
                <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0">
                  {profile.fullName ? profile.fullName.charAt(0) : 'م'}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {profile.fullName || 'الأستاذ محمد'}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono truncate">
                    mohamed105@gmail.com
                  </span>
                </div>
              </div>

              {/* Status and Sync State */}
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-[#131b2e] border border-slate-100 dark:border-[#1f2937] mb-2.5 space-y-1.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">حالة الربط والمزامنة:</span>
                  <div className="flex items-center gap-1.5">
                    <span 
                      className={`w-2 h-2 rounded-full ${
                        syncState === 'online' ? 'bg-emerald-500' : syncState === 'syncing' ? 'bg-amber-500 lamp-pulse' : 'bg-red-500'
                      }`} 
                    />
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {syncState === 'online' ? 'متصل ومزامن 100%' : syncState === 'syncing' ? 'جارٍ المزامنة...' : 'وضع غير متصل'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">إجمالي المهام المحفوظة:</span>
                  <span className="font-bold font-mono text-blue-600 dark:text-blue-400 tabular-nums">
                    {kpiStats.totalTasks} مهمة
                  </span>
                </div>

                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 dark:text-slate-400">حماية الطوارئ:</span>
                  <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1 font-semibold">
                    <Lock className="w-3 h-3" />
                    <span>رمز PIN مفعل (105 / 7080)</span>
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-[#1f2937]">
                <button
                  type="button"
                  onClick={() => {
                    exportBackupJSON();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c263e] text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-blue-500" />
                    <span>تصدير نسخة احتياطية (JSON)</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">.json</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-[#1c263e] text-slate-700 dark:text-slate-300 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-purple-500" />
                    <span>استيراد وتحديث المعطيات</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">استرجاع</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
