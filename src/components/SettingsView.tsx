import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { 
  Settings, 
  User, 
  BookOpen, 
  Sliders, 
  Database, 
  Download, 
  Upload, 
  RotateCcw, 
  Trash2, 
  AlertTriangle, 
  Plus, 
  Edit3, 
  Check, 
  Tag, 
  MapPin, 
  Moon, 
  Sun, 
  CheckCircle2 
} from 'lucide-react';
import { Category, CourtDestination, TaskPriority, TaskStatus } from '../types/tasks';

export const SettingsView: React.FC = () => {
  const { 
    profile, 
    settings, 
    categories, 
    courts, 
    savedTitles, 
    tasks, 
    updateProfile, 
    updateSettings, 
    setTheme, 
    updateCategories, 
    updateCourts, 
    updateSavedTitles, 
    resetLearnedDictionaries, 
    clearCompletedTasks, 
    factoryResetSystem, 
    exportBackupJSON, 
    importBackupJSON 
  } = useTasks();

  const [activeTab, setActiveTab] = useState<'profile' | 'dictionaries' | 'appearance' | 'workflow' | 'backup'>('dictionaries');

  // Profile fields state
  const [fullName, setFullName] = useState(profile.fullName || settings.userName || '');
  const [jobTitle, setJobTitle] = useState(profile.jobTitle || settings.userRole || '');
  const [organization, setOrganization] = useState(profile.organization || settings.department || '');
  const [service, setService] = useState(profile.service || 'مصلحة تدبير الممتلكات والعتاد والمعلوميات');
  const [workplace, setWorkplace] = useState(profile.workplace || 'المديرية الإقليمية للعدل بسطات');
  const [mainDomain, setMainDomain] = useState(profile.mainDomain || 'التدبير الإداري والتقني واللوجستي');
  const [profileSaved, setProfileSaved] = useState(false);

  // New Title modal/inline input
  const [newTitleInput, setNewTitleInput] = useState('');
  
  // New Court modal/inline input
  const [newCourtName, setNewCourtName] = useState('');
  const [newCourtCity, setNewCourtCity] = useState('سطات');

  // New Category inline input
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📁');

  // Backup file status
  const [importFeedback, setImportFeedback] = useState<{ success: boolean; text: string } | null>(null);

  // Approximate storage calculation
  const storageBytes = (() => {
    try {
      let total = 0;
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        const v = localStorage.getItem(k || '') || '';
        total += (k ? k.length : 0) + v.length;
      }
      return total * 2; // UTF-16
    } catch (e) {
      return 1024 * 50;
    }
  })();
  const storageKB = Math.round(storageBytes / 1024);

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      fullName,
      jobTitle,
      organization,
      service,
      workplace,
      mainDomain
    });
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const handleAddTitle = () => {
    if (!newTitleInput.trim()) return;
    const t = newTitleInput.trim();
    if (!savedTitles.includes(t)) {
      updateSavedTitles([t, ...savedTitles]);
    }
    setNewTitleInput('');
  };

  const handleRemoveTitle = (titleToRemove: string) => {
    updateSavedTitles(savedTitles.filter(t => t !== titleToRemove));
  };

  const handleAddCourt = () => {
    if (!newCourtName.trim()) return;
    const name = newCourtName.trim();
    const city = newCourtCity.trim() || 'سطات';
    const scope = city.includes('سطات') ? 'محلي' : 'تنقل خارجي';

    const newCourt: CourtDestination = {
      id: `court-${Date.now()}`,
      name,
      city,
      scope,
      type: 'مرفق قضائي مسجل',
      status: 'active'
    };
    updateCourts([newCourt, ...courts]);
    setNewCourtName('');
    setNewCourtCity('سطات');
  };

  const handleDeleteCourt = (id: string) => {
    if (window.confirm('هل تريد إزالة هذا المرفق القضائي من الدليل؟')) {
      updateCourts(courts.filter(c => c.id !== id));
    }
  };

  const handleAddCategory = () => {
    if (!newCatName.trim()) return;
    const newCat: Category = {
      id: `cat-${Date.now()}`,
      name: newCatName.trim(),
      icon: newCatIcon.trim() || '📁',
      subs: ['عام']
    };
    updateCategories([...categories, newCat]);
    setNewCatName('');
  };

  const handleDeleteCategory = (id: string) => {
    if (window.confirm('هل تريد حذف هذا التصنيف؟')) {
      updateCategories(categories.filter(c => c.id !== id));
    }
  };

  const handleFileRestore = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      const content = event.target?.result as string;
      if (!content) return;
      const res = importBackupJSON(content);
      setImportFeedback({
        success: res.success,
        text: res.success ? `✅ تم بنجاح استرجاع ${res.count} مهمة وكافة القواميس والإعدادات!` : `❌ ${res.message}`
      });
      setTimeout(() => setImportFeedback(null), 5000);
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Control Center Header */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-[#59718A]" />
            <span>مركز التحكم والإعدادات الشاملة</span>
          </h2>
          <p className="text-xs text-[#8E91A0] mt-0.5">
            إدارة متقدمة للقواميس، قواعد التعلم الذاتي، المظهر المؤسساتي، وفاحص الذاكرة المحلية
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 bg-[#12131C] border border-white/10 rounded-xl text-xs">
          <button
            type="button"
            onClick={() => setActiveTab('dictionaries')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'dictionaries' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            القواميس
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'profile' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            البطاقة المهنية
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('appearance')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'appearance' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            المظهر
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('workflow')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'workflow' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            سير العمل
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all ${activeTab === 'backup' ? 'bg-[#59718A] text-white shadow-sm' : 'text-[#8E91A0] hover:text-white'}`}
          >
            البيانات والذاكرة
          </button>
        </div>
      </div>

      {/* ========================================================
          TAB 1: AUTO-LEARNING & DICTIONARY MANAGER (إدارة القواميس والتعلم الذاتي)
          ======================================================== */}
      {activeTab === 'dictionaries' && (
        <div className="space-y-5">
          {/* 1.1 Autocomplete Titles Registry */}
          <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-extrabold text-xs text-white flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-[#59718A]" />
                  <span>عناوين التدخلات المحفوظة للإكمال التلقائي ({savedTitles.length})</span>
                </h3>
                <p className="text-[11px] text-[#8E91A0] mt-0.5">
                  تُقترح هذه العناوين تلقائياً بمجرد فتح استمارة المهمة لتسريع الإدخال
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('هل تريد استعادة العناوين الافتراضية؟')) {
                    resetLearnedDictionaries();
                  }
                }}
                className="px-2.5 py-1 text-xs font-semibold rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
                title="استرجاع العناوين الافتراضية"
              >
                استرجاع الافتراضي
              </button>
            </div>

            {/* Add new title inline */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newTitleInput}
                onChange={e => setNewTitleInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') handleAddTitle(); }}
                placeholder="أضف عنوان مهمة جديد إلى القاموس..."
                className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-xs font-semibold focus:outline-none focus:border-[#59718A]"
              />
              <button
                type="button"
                onClick={handleAddTitle}
                className="px-4 py-2 bg-[#59718A] hover:bg-[#4d6379] text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                title="إضافة العنوان إلى القاموس"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>

            {/* List of titles */}
            <div className="max-h-56 overflow-y-auto space-y-1.5 p-1">
              {savedTitles.map((t, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-white/5 bg-[#12131C] text-xs text-white"
                >
                  <span className="font-semibold truncate">{t}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTitle(t)}
                    className="text-slate-400 hover:text-red-500 p-1"
                    title="حذف من القاموس"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* 1.2 Locations & Courts Registry */}
          <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-extrabold text-xs text-white flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-[#8FA68F]" />
                  <span>دليل المحاكم والمرافق القضائية ({courts.length})</span>
                </h3>
                <p className="text-[11px] text-[#8E91A0] mt-0.5">
                  تحديد المقار الدائمة والنطاق الجغرافي التلقائي (محلي بسطات / تنقل خارجي)
                </p>
              </div>
            </div>

            {/* Add new court */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <input
                type="text"
                value={newCourtName}
                onChange={e => setNewCourtName(e.target.value)}
                placeholder="اسم المرفق (مثال: محكمة الاستئناف بالدار البيضاء)..."
                className="px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-xs font-semibold focus:outline-none focus:border-[#59718A] sm:col-span-2"
              />
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newCourtCity}
                  onChange={e => setNewCourtCity(e.target.value)}
                  placeholder="المدينة..."
                  className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-xs font-semibold focus:outline-none focus:border-[#59718A]"
                />
                <button
                  type="button"
                  onClick={handleAddCourt}
                  className="px-4 py-2 bg-[#59718A] hover:bg-[#4d6379] text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                  title="إضافة مرفق قضائي"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>إضافة</span>
                </button>
              </div>
            </div>

            {/* Courts Table */}
            <div className="max-h-56 overflow-y-auto border border-white/10 rounded-xl">
              <table className="w-full text-right text-xs">
                <thead className="bg-[#12131C] text-[#8E91A0] font-bold border-b border-white/10 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3">اسم المرفق / المحكمة</th>
                    <th className="py-2.5 px-3">المدينة</th>
                    <th className="py-2.5 px-3">النطاق التلقائي</th>
                    <th className="py-2.5 px-3 w-16 text-center">إجراء</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {courts.map(c => (
                    <tr key={c.id} className="hover:bg-white/[0.03]">
                      <td className="py-2 px-3 font-bold text-white flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-2 px-3 text-[#8E91A0]">{c.city || 'سطات'}</td>
                      <td className="py-2 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${c.scope === 'محلي' ? 'bg-[#8FA68F]/20 text-[#8FA68F]' : 'bg-[#5B3A62]/30 text-[#c084fc]'}`}>
                          {c.scope || 'محلي'}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleDeleteCourt(c.id)}
                          className="text-[#8E91A0] hover:text-[#E07A47] p-1 transition-colors cursor-pointer"
                          title="حذف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 1.3 Categories & Keyword Auto-mapping */}
          <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div>
                <h3 className="font-extrabold text-xs text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-[#59718A]" />
                  <span>مجالات وتصنيفات التدخل ({categories.length})</span>
                </h3>
                <p className="text-[11px] text-[#8E91A0] mt-0.5">
                  قواعد الربط الذكي بالكلمات المفتاحية والتفريعات المرتبطة بكل مجال
                </p>
              </div>
            </div>

            {/* Add new category */}
            <div className="flex gap-2">
              <input
                type="text"
                value={newCatIcon}
                onChange={e => setNewCatIcon(e.target.value)}
                placeholder="رمز..."
                className="w-16 px-2 py-2 text-center rounded-xl border border-white/10 bg-[#12131C] text-white text-xs focus:outline-none"
              />
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="اسم التصنيف الجديد..."
                className="flex-1 px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-xs font-semibold focus:outline-none focus:border-[#59718A]"
              />
              <button
                type="button"
                onClick={handleAddCategory}
                className="px-4 py-2 bg-[#59718A] hover:bg-[#4d6379] text-white rounded-xl font-bold text-xs flex items-center gap-1 shrink-0 transition-colors cursor-pointer"
                title="إضافة التصنيف"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>إضافة</span>
              </button>
            </div>

            {/* Categories list */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1">
              {categories.map(c => (
                <div 
                  key={c.id}
                  className="p-3 rounded-xl border border-white/5 bg-[#12131C] flex items-center justify-between text-xs"
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-base">{c.icon || '📁'}</span>
                    <span className="font-bold text-white truncate">{c.name}</span>
                    <span className="text-[10px] text-[#8E91A0]">({c.subs?.length || 0} تفريعات)</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteCategory(c.id)}
                    className="text-[#8E91A0] hover:text-[#E07A47] p-1 transition-colors cursor-pointer"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 2: PROFESSIONAL PROFILE
          ======================================================== */}
      {activeTab === 'profile' && (
        <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <User className="w-4 h-4 text-blue-500" />
            <h3 className="font-extrabold text-xs text-white">
              البطاقة المهنية وتخصيص المنصب الإداري والتقني
            </h3>
          </div>

          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الاسم الكامل للمسؤول:</label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">الوظيفة / الصفة:</label>
                <input
                  type="text"
                  required
                  value={jobTitle}
                  onChange={e => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المديرية / الهيئة:</label>
                <input
                  type="text"
                  required
                  value={organization}
                  onChange={e => setOrganization(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">المصلحة أو القسم:</label>
                <input
                  type="text"
                  value={service}
                  onChange={e => setService(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">مقر العمل الرئيسي:</label>
                <input
                  type="text"
                  value={workplace}
                  onChange={e => setWorkplace(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-white focus:outline-none focus:border-blue-500 font-semibold"
                />
              </div>

              <div>
                <label className="font-bold text-[#8E91A0] block mb-1">المجال الرئيسي:</label>
                <input
                  type="text"
                  value={mainDomain}
                  onChange={e => setMainDomain(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white focus:outline-none focus:border-[#59718A] font-semibold"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[#8FA68F] font-bold">
                {profileSaved ? 'تم حفظ وتحديث البطاقة المهنية بنجاح' : ''}
              </span>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-[#59718A] text-white font-bold hover:bg-[#4d6379] transition-colors shadow-sm cursor-pointer"
                title="حفظ بيانات البطاقة المهنية"
              >
                حفظ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ========================================================
          TAB 3: APPEARANCE & UI CUSTOMIZATION
          ======================================================== */}
      {activeTab === 'appearance' && (
        <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-5 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Sliders className="w-4 h-4 text-[#59718A]" />
            <h3 className="font-extrabold text-xs text-white">
              تخصيص المظهر وتجربة العرض المؤسساتية
            </h3>
          </div>

          {/* Theme Mode Selector with High-Contrast Presets */}
          <div className="space-y-2">
            <label className="font-bold text-white block">
              وضع الألوان والتباين:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md">
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${settings.theme === 'dark' ? 'border-[#59718A] bg-[#12131C] text-white ring-2 ring-[#59718A]/30 font-bold' : 'border-white/10 hover:bg-white/5 text-[#8E91A0]'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-[#59718A]/20 text-[#59718A] flex items-center justify-center">
                  <Moon className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-white">الوضع الداكن المعتمد</div>
                  <div className="text-[10px] text-[#8E91A0]">تباين فائق ومريح للعين والعمل اليومي</div>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3.5 rounded-xl border flex items-center gap-3 transition-all cursor-pointer ${settings.theme === 'light' ? 'border-amber-500 bg-[#12131C] text-white ring-2 ring-amber-500/30 font-bold' : 'border-white/10 hover:bg-white/5 text-[#8E91A0]'}`}
              >
                <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <Sun className="w-4 h-4" />
                </div>
                <div className="text-right">
                  <div className="font-bold text-xs text-white">الوضع النهاري المؤسساتي</div>
                  <div className="text-[10px] text-[#8E91A0]">خلفية فاتحة وتباين عالي للطباعة</div>
                </div>
              </button>
            </div>
          </div>

          {/* Font Scale */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="font-bold text-white block">
              حجم الخط وتكبير النصوص:
            </label>
            <div className="flex flex-wrap gap-2">
              {(['sm', 'md', 'lg'] as const).map(scale => {
                const isSelected = (settings.fontScale || 'md') === scale;
                const labels = { sm: 'مدمج (14px)', md: 'قياسي (16px)', lg: 'كبير للمطالعة (18px)' };
                return (
                  <button
                    key={scale}
                    type="button"
                    onClick={() => updateSettings({ fontScale: scale })}
                    className={`px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${isSelected ? 'bg-[#59718A] text-white shadow-sm' : 'border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5'}`}
                  >
                    {labels[scale]}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Default Startup View */}
          <div className="space-y-2 pt-2 border-t border-white/10">
            <label className="font-bold text-white block">
              الشاشة الافتراضية عند فتح التطبيق:
            </label>
            <select
              value={settings.defaultStartupView || 'dashboard'}
              onChange={e => updateSettings({ defaultStartupView: e.target.value as any })}
              className="px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white font-bold focus:outline-none cursor-pointer"
            >
              <option value="dashboard" className="bg-[#1B1D2A] text-white">لوحة القيادة والمؤشرات</option>
              <option value="today" className="bg-[#1B1D2A] text-white">لوحة إدارة اليوم</option>
              <option value="tasks" className="bg-[#1B1D2A] text-white">سجل المهام والعمليات</option>
              <option value="calendar" className="bg-[#1B1D2A] text-white">التقويم الزمني</option>
              <option value="backlog" className="bg-[#1B1D2A] text-white">برمجة المهام</option>
            </select>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 4: WORKFLOW & DEFAULT PARAMETERS
          ======================================================== */}
      {activeTab === 'workflow' && (
        <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-4 text-xs">
          <div className="flex items-center gap-2 pb-2 border-b border-white/10">
            <Sliders className="w-4 h-4 text-[#59718A]" />
            <h3 className="font-extrabold text-xs text-white">
              ضبط سلوك سير العمل وحسابات الإنجاز
            </h3>
          </div>

          <div className="space-y-4 max-w-lg">
            {/* Auto Complete when Subtasks 100% */}
            <div className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-[#12131C]">
              <div>
                <span className="font-bold text-white block">
                  الإنجاز التلقائي للمهمة عند استيفاء العمليات الفرعية (100%):
                </span>
                <span className="text-[11px] text-[#8E91A0]">
                  تغيير حالة المهمة آلياً إلى «منجزة» بمجرد التأشير على كافة العمليات
                </span>
              </div>
              <input
                type="checkbox"
                checked={settings.autoCompleteWhenSubtasksDone !== false}
                onChange={e => updateSettings({ autoCompleteWhenSubtasksDone: e.target.checked })}
                className="w-5 h-5 rounded text-[#59718A] cursor-pointer"
              />
            </div>

            {/* Default Priority */}
            <div>
              <label className="font-bold text-white block mb-1">
                الأولوية الافتراضية للمهام الجديدة:
              </label>
              <select
                value={settings.defaultPriority || 'عادية'}
                onChange={e => updateSettings({ defaultPriority: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="عادية" className="bg-[#1B1D2A] text-white">عادية (عمل يومي روتيني)</option>
                <option value="متوسطة" className="bg-[#1B1D2A] text-[#59718A]">متوسطة (مأمورية / متابعة)</option>
                <option value="عالية" className="bg-[#1B1D2A] text-[#D4A72C]">عالية / مهمة</option>
                <option value="عاجلة" className="bg-[#1B1D2A] text-[#E07A47]">عاجلة وطارئة</option>
              </select>
            </div>

            {/* Default Status */}
            <div>
              <label className="font-bold text-white block mb-1">
                الحالة الافتراضية للمهام الجديدة:
              </label>
              <select
                value={settings.defaultStatus || 'قيد الإنجاز'}
                onChange={e => updateSettings({ defaultStatus: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white font-bold focus:outline-none cursor-pointer"
              >
                <option value="قيد الإنجاز" className="bg-[#1B1D2A] text-white">قيد الإنجاز</option>
                <option value="مبرمجة" className="bg-[#1B1D2A] text-white">مبرمجة</option>
                <option value="جديدة" className="bg-[#1B1D2A] text-white">جديدة</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================
          TAB 5: DATA, BACKUP & STORAGE INSPECTOR
          ======================================================== */}
      {activeTab === 'backup' && (
        <div className="space-y-5 text-xs">
          {/* Storage Health Inspector Box */}
          <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Database className="w-4 h-4 text-[#59718A]" />
                <h3 className="font-extrabold text-xs text-white">
                  فاحص سلامة الذاكرة وسعة التخزين المحلية
                </h3>
              </div>
              <span className="font-sans font-bold text-[#59718A] bg-[#59718A]/20 border border-[#59718A]/40 px-2 py-0.5 rounded-lg text-[11px] tabular-nums">
                {storageKB} كيلوبايت مستخدمة
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 rounded-xl bg-[#12131C] border border-white/5 text-center">
                <div className="text-[11px] text-[#8E91A0]">إجمالي المهام المخزنة</div>
                <div className="text-xl font-extrabold text-white tabular-nums font-sans">{tasks.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#12131C] border border-white/5 text-center">
                <div className="text-[11px] text-[#8E91A0]">المحاكم والوجهات</div>
                <div className="text-xl font-extrabold text-[#8FA68F] tabular-nums font-sans">{courts.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#12131C] border border-white/5 text-center">
                <div className="text-[11px] text-[#8E91A0]">العناوين المحفوظة</div>
                <div className="text-xl font-extrabold text-[#c084fc] tabular-nums font-sans">{savedTitles.length}</div>
              </div>
              <div className="p-3 rounded-xl bg-[#12131C] border border-white/5 text-center">
                <div className="text-[11px] text-[#8E91A0]">التصنيفات الذكية</div>
                <div className="text-xl font-extrabold text-[#D4A72C] tabular-nums font-sans">{categories.length}</div>
              </div>
            </div>

            {/* Granular Reset & Maintenance Buttons */}
            <div className="pt-2 border-t border-white/10 space-y-2">
              <span className="font-bold text-white block mb-1">
                عمليات الصيانة وإعادة الضبط:
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تريد مسح ذاكرة الاقتراحات وإعادة ضبط القواميس إلى الحالة الافتراضية؟ (لن يتم حذف أي مهام مسجلة).')) {
                      resetLearnedDictionaries();
                      alert('تمت استعادة القواميس الافتراضية بنجاح.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-amber-500/40 text-[#D4A72C] hover:bg-amber-500/10 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="مسح ذاكرة الاقتراحات واستعادة القواميس الأصلية"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>مسح الاقتراحات</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('هل تريد مسح وأرشفة كافة المهام المنجزة والمستوفاة من السجل النشط؟')) {
                      clearCompletedTasks();
                      alert('تم تنظيف المهام المنجزة بنجاح.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="مسح كافة المهام المكتملة لتفريغ السجل النشط"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8FA68F]" />
                  <span>مسح المنجزة</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm('تحذير: هل أنت متأكد من رغبتك في إعادة ضبط المصنع؟ سيتم حذف كافة التعديلات واستعادة الحالة الأولية للمديرية.')) {
                      factoryResetSystem();
                      alert('تمت استعادة ضبط المصنع بنجاح.');
                    }
                  }}
                  className="px-3 py-1.5 rounded-lg border border-[#E07A47]/40 text-[#E07A47] hover:bg-[#E07A47]/10 text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"
                  title="إعادة ضبط المصنع ومسح كافة البيانات"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>ضبط المصنع</span>
                </button>
              </div>
            </div>
          </div>

          {/* Backup Export & Restore */}
          <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 shadow-sm space-y-4">
            <h3 className="font-extrabold text-xs text-white flex items-center gap-2">
              <Download className="w-4 h-4 text-[#8FA68F]" />
              <span>النسخ الاحتياطي وتصدير واسترجاع ملف البيانات الشامل</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-white/10 bg-[#12131C] space-y-2">
                <span className="font-bold text-white block">تصدير ملف النسخة الاحتياطية:</span>
                <p className="text-[11px] text-[#8E91A0]">
                  تحميل ملف بيانات كامل ومطابق يحتوي على كافة المهام والوجهات والتصنيفات والقوالب وسجل العمليات.
                </p>
                <button
                  type="button"
                  onClick={exportBackupJSON}
                  className="w-full py-2 bg-[#59718A] hover:bg-[#4d6379] text-white font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
                  title="تحميل ملف بيانات النسخة الاحتياطية"
                >
                  <Download className="w-4 h-4" />
                  <span>تصدير النسخة</span>
                </button>
              </div>

              <div className="p-4 rounded-xl border border-white/10 bg-[#12131C] space-y-2">
                <span className="font-bold text-white block">استرجاع بيانات من ملف محفوظ:</span>
                <p className="text-[11px] text-[#8E91A0]">
                  اختر ملف نسخة احتياطية سابقة لاستعادة حالتك دون فقدان التوافق.
                </p>
                <label className="w-full py-2 bg-[#8FA68F] hover:bg-[#8FA68F]/80 text-[#12131C] font-bold rounded-lg flex items-center justify-center gap-1.5 shadow-sm cursor-pointer transition-colors" title="استيراد واسترجاع البيانات من ملف محلي">
                  <Upload className="w-4 h-4" />
                  <span>استيراد البيانات</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileRestore}
                    className="hidden"
                  />
                </label>
                {importFeedback && (
                  <div className={`p-2 rounded-lg text-[11px] font-bold ${importFeedback.success ? 'text-[#8FA68F] bg-[#8FA68F]/20' : 'text-[#E07A47] bg-[#E07A47]/20'}`}>
                    {importFeedback.text}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
