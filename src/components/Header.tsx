import React, { useState, useRef, useEffect } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Menu, 
  Search, 
  Sun, 
  Moon, 
  Save, 
  User, 
  Download, 
  Upload, 
  Lock,
  CheckCircle2
} from 'lucide-react';
import { CalendarAppLogo } from './CalendarAppLogo';

interface HeaderProps {
  currentView: string;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isSidebarOpen, onToggleSidebar }) => {
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
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleBackupClick = () => {
    exportBackupJSON();
    showToast('تم تصدير وحفظ النسخة الاحتياطية بنجاح 💾');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          importBackupJSON(content);
          showToast('تم استيراد البيانات وتحديثها بنجاح');
        }
      };
      reader.readAsText(file);
      setIsProfileMenuOpen(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

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

  return (
    <>
      {/* Hidden file input for backup restore */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 left-1/2 transform -translate-x-1/2 bg-[#2F6F6D] text-white px-6 py-2.5 rounded-full shadow-2xl z-50 flex items-center gap-2.5 text-xs font-bold transition-all animate-bounce">
          <CheckCircle2 className="w-4 h-4 text-white" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header Bar */}
      <header className="bg-[#1B1D2A] border-b border-white/10 sticky top-0 z-30 shadow-lg w-full select-none">
        <div className="w-full px-4 md:px-6 py-2.5 flex justify-between items-center">
          
          {/* Far Right (RTL): Hamburger Button -> Logo Box -> App Title */}
          <div className="flex items-center gap-3">
            {/* Sidebar toggle button (☰) */}
            <button 
              type="button"
              onClick={onToggleSidebar}
              title="فتح القائمة الجانبية"
              aria-label="القائمة الجانبية"
              className="w-11 h-11 rounded-xl bg-[#12131C] border border-white/10 flex justify-center items-center hover:border-[#D4A72C] transition-colors text-white shadow-sm shrink-0 cursor-pointer"
            >
              <Menu className="w-5 h-5 text-white" />
            </button>
            
            {/* Branding Container: Hides smoothly when sidebar is open! */}
            <div 
              id="mainHeaderBranding" 
              className={`flex items-center gap-3 transition-all duration-300 ${
                isSidebarOpen ? 'opacity-0 pointer-events-none -translate-x-3' : 'opacity-100 translate-x-0'
              }`}
            >
              {/* Calendar Daily App Logo in square box matching menu button */}
              <div className="w-11 h-11 rounded-xl bg-[#12131C] border border-white/10 flex justify-center items-center shadow-sm shrink-0">
                <CalendarAppLogo size={22} />
              </div>

              {/* Title */}
              <div className="flex flex-col">
                <span className="font-extrabold text-base md:text-lg text-white truncate">
                  نظام تدبير المهام اليومية
                </span>
                <span className="text-[10px] text-[#8E91A0] truncate hidden sm:block">
                  المديرية الإقليمية لوزارة العدل بسطات
                </span>
              </div>
            </div>
          </div>
          
          {/* Far Left: Tool Buttons (💾 Save, 🔍 Search, 🌙 Theme, 👤 Profile) */}
          <div className="flex items-center gap-2">
            {/* 1. Save Button 💾 */}
            <button 
              type="button"
              onClick={handleBackupClick}
              title="حفظ وتصدير نسخة احتياطية كاملة (JSON)"
              aria-label="تصدير نسخة احتياطية"
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#12131C] border border-white/10 flex justify-center items-center text-[#59718A] hover:border-[#59718A] hover:bg-[#59718A]/10 transition-colors shrink-0 shadow-sm cursor-pointer"
            >
              <Save className="w-4 h-4 md:w-5 md:h-5" />
            </button>

            {/* 2. Search Button 🔍 */}
            <button 
              type="button"
              onClick={() => {
                window.dispatchEvent(new CustomEvent('open-global-search'));
              }}
              title="بحث شامل في المهام والعمليات (Ctrl+K)"
              aria-label="بحث شامل"
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#12131C] border border-white/10 flex justify-center items-center hover:border-[#2F6F6D] transition-colors text-white shrink-0 shadow-sm cursor-pointer"
            >
              <Search className="w-4 h-4 md:w-5 md:h-5 text-gray-200" />
            </button>

            {/* 3. Theme Mode Toggle Button 🌙 / ☀️ */}
            <button 
              type="button"
              onClick={toggleTheme}
              title={theme === 'dark' ? 'التبديل إلى مظهر بديل' : 'تفعيل المظهر الداكن'}
              aria-label="تغيير المظهر"
              className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#12131C] border border-white/10 flex justify-center items-center hover:border-[#D4A72C] transition-colors text-white shrink-0 shadow-sm cursor-pointer"
            >
              {theme === 'dark' ? (
                <Moon className="w-4 h-4 md:w-5 md:h-5 text-[#D4A72C]" />
              ) : (
                <Sun className="w-4 h-4 md:w-5 md:h-5 text-[#D4A72C]" />
              )}
            </button>

            {/* 4. Profile Button 👤 with dropdown */}
            <div className="relative" ref={profileMenuRef}>
              <button 
                type="button"
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                title="الملف الشخصي وإدارة النظام"
                aria-label="الملف الشخصي"
                className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-[#12131C] border border-white/10 flex justify-center items-center hover:border-[#E07A47] transition-colors text-[#E07A47] shrink-0 shadow-sm cursor-pointer"
              >
                <User className="w-4 h-4 md:w-5 md:h-5" />
              </button>

              {/* Profile Dropdown Modal */}
              {isProfileMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#1B1D2A] border border-white/10 shadow-2xl p-4 z-50 text-right text-xs">
                  <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#12131C] border border-white/5 mb-3">
                    <div className="w-10 h-10 rounded-full bg-[#59718A] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-md">
                      {profile.fullName ? profile.fullName.charAt(0) : 'م'}
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="font-bold text-white truncate text-sm">
                        {profile.fullName || 'محمد ايت حمادي'}
                      </span>
                      <span className="text-[11px] text-[#8E91A0] font-mono truncate">
                        mohamed105@gmail.com
                      </span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#12131C] border border-white/5 mb-3 space-y-2">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8E91A0]">حالة الحفظ والمزامنة:</span>
                      <span className="font-bold text-[#8FA68F] flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-[#8FA68F]" />
                        محفوظ محلياً ومؤمن
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8E91A0]">إجمالي التدخلات:</span>
                      <span className="font-bold text-white font-mono tabular-nums">
                        {kpiStats.totalTasks} مهمة
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-[#8E91A0]">رمز الطوارئ PIN:</span>
                      <span className="text-[#D4A72C] flex items-center gap-1 font-semibold">
                        <Lock className="w-3 h-3" />
                        <span>مفعل (105 / 7080)</span>
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-2 border-t border-white/10">
                    <button
                      type="button"
                      onClick={() => {
                        exportBackupJSON();
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#12131C] hover:bg-white/5 text-white font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Download className="w-3.5 h-3.5 text-[#59718A]" />
                        <span>تصدير نسخة احتياطية</span>
                      </span>
                      <span className="text-[10px] text-[#8E91A0] font-mono">.json</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-[#12131C] hover:bg-white/5 text-white font-semibold transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <Upload className="w-3.5 h-3.5 text-[#E07A47]" />
                        <span>استيراد وتحديث البيانات</span>
                      </span>
                      <span className="text-[10px] text-[#8E91A0]">استرجاع</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

        </div>
      </header>
    </>
  );
};
