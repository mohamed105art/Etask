import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { CalendarAppLogo } from './CalendarAppLogo';
import { 
  Menu, 
  Search, 
  Moon, 
  Save, 
  User, 
  Upload, 
  Download, 
  Lock
} from 'lucide-react';

interface HeaderProps {
  currentView: string;
  onToggleSidebar: () => void;
  isSidebarOpen?: boolean;
}

export const Header: React.FC<HeaderProps> = ({ 
  onToggleSidebar, 
  isSidebarOpen = false 
}) => {
  const { 
    settings, 
    profile, 
    exportBackupJSON, 
    importBackupJSON,
    kpiStats
  } = useTasks();

  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close profile dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
      className="w-full bg-[#1B1D2A] border-b border-white/5 sticky top-0 z-30 px-4 py-3 flex justify-between items-center select-none"
    >
      {/* Hidden file input for backup restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* RIGHT SECTION: Menu Button (36x36) + Calendar Logo (36x36) + Title */}
      <div className="flex items-center gap-[12px] min-w-0">
        {/* Sidebar Toggle Button (36x36, border #59718A, bg #1B1D2A) */}
        <button
          id="btn-sidebar-toggle"
          type="button"
          onClick={onToggleSidebar}
          aria-label="فتح القائمة الجانبية"
          title="فتح القائمة الجانبية (Ctrl+B / Alt+S)"
          className="w-[36px] h-[36px] rounded-[8px] bg-[#1B1D2A] border border-[#59718A] flex justify-center items-center text-white hover:border-[#D4A72C] transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Menu className="w-[18px] h-[18px] text-white" />
        </button>

        {/* Branding Container: Hides smoothly when sidebar is open */}
        <div 
          id="mainHeaderBranding"
          className={`flex items-center gap-[12px] transition-all duration-300 ${
            isSidebarOpen ? 'opacity-0 pointer-events-none -translate-x-2 invisible' : 'opacity-100 visible'
          }`}
        >
          {/* Calendar App Logo Container (36x36, border #59718A) */}
          <div className="w-[36px] h-[36px] rounded-[8px] bg-[#12131C] border border-[#59718A] flex justify-center items-center shrink-0 shadow-xs">
            <CalendarAppLogo size={20} />
          </div>

          {/* App Title (16px, font-bold 700, #FFFFFF) */}
          <span className="text-[16px] font-bold text-white truncate hidden xs:inline-block">
            {settings?.systemName || 'نظام تدبير المهام اليومية'}
          </span>
        </div>
      </div>

      {/* LEFT SECTION: 4 Square Buttons (36x36px each, border white/10) */}
      <div className="flex items-center gap-[8px] shrink-0">
        {/* 1. Save / Backup Button 💾 */}
        <button
          type="button"
          onClick={() => {
            exportBackupJSON();
          }}
          title="حفظ وتصدير نسخة احتياطية (JSON)"
          className="w-[36px] h-[36px] rounded-[8px] bg-[#12131C] border border-white/10 flex justify-center items-center text-white hover:border-[#59718A] hover:text-[#59718A] transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Save className="w-[16px] h-[16px]" />
        </button>

        {/* 2. Global Search Button 🔍 */}
        <button
          type="button"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-global-search'));
          }}
          title="بحث شامل في المهام (Ctrl+K)"
          className="w-[36px] h-[36px] rounded-[8px] bg-[#12131C] border border-white/10 flex justify-center items-center text-white hover:border-[#2F6F6D] hover:text-[#2F6F6D] transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Search className="w-[16px] h-[16px]" />
        </button>

        {/* 3. Theme Toggle / Dark Mode Icon 🌙 */}
        <button
          type="button"
          onClick={() => {
            // Dark mode is permanently enforced in the new design system
          }}
          title="الوضع الداكن المعتمد (Dark Mode)"
          className="w-[36px] h-[36px] rounded-[8px] bg-[#12131C] border border-white/10 flex justify-center items-center text-white hover:border-[#D4A72C] transition-colors shrink-0 cursor-pointer shadow-xs"
        >
          <Moon className="w-[16px] h-[16px]" />
        </button>

        {/* 4. Profile Button 👤 */}
        <div className="relative" ref={profileMenuRef}>
          <button
            type="button"
            onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
            title={`المسؤول: ${profile?.fullName || settings?.userName || 'محمد'}`}
            className="w-[36px] h-[36px] rounded-[8px] bg-[#12131C] border border-white/10 flex justify-center items-center text-white hover:border-[#E07A47] hover:text-[#E07A47] transition-colors shrink-0 cursor-pointer shadow-xs"
          >
            <User className="w-[16px] h-[16px]" />
          </button>

          {/* Profile Dropdown */}
          {isProfileMenuOpen && (
            <div className="absolute left-0 mt-2 w-72 rounded-xl bg-[#1B1D2A] border border-white/10 shadow-2xl p-4 z-50 text-right text-xs">
              <div className="flex items-center gap-3 pb-3 border-b border-white/10 mb-3">
                <div className="w-10 h-10 rounded-full bg-[#59718A] flex justify-center items-center font-bold text-white text-base">
                  {profile?.fullName ? profile.fullName.charAt(0) : 'م'}
                </div>
                <div className="flex flex-col min-w-0">
                  <h4 className="font-bold text-sm text-white truncate">
                    {profile?.fullName || 'الأستاذ محمد'}
                  </h4>
                  <p className="text-[11px] text-[#8E91A0] truncate">
                    mohamed105@gmail.com
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-3 bg-[#12131C] p-2.5 rounded-lg border border-white/5">
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#8E91A0]">المديرية:</span>
                  <span className="text-white font-medium">المديرية الإقليمية بسطات</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#8E91A0]">إجمالي المهام:</span>
                  <span className="text-[#59718A] font-bold">{kpiStats.totalTasks} مهمة</span>
                </div>
                <div className="flex justify-between items-center text-[11px]">
                  <span className="text-[#8E91A0]">رمز الطوارئ PIN:</span>
                  <span className="text-[#8FA68F] font-semibold flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 105 / 7080
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    exportBackupJSON();
                    setIsProfileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/5 text-gray-200 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-[#59718A]" />
                    <span>تصدير نسخة احتياطية</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">.json</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg hover:bg-white/5 text-gray-200 font-semibold transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Upload className="w-3.5 h-3.5 text-[#E07A47]" />
                    <span>استيراد بيانات</span>
                  </span>
                  <span className="text-[10px] text-gray-500 font-mono">استرجاع</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
