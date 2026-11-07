import React, { useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { Task, TaskSearchResult } from '../types/tasks';
import { Search, X, MapPin, Tag, ArrowLeft, Eye, Edit3, Calendar, CheckCircle2 } from 'lucide-react';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onViewTask: (task: Task) => void;
  onEditTask: (task: Task) => void;
  onNavigateToRegistry: (task: Task) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onViewTask,
  onEditTask,
  onNavigateToRegistry
}) => {
  const { 
    globalSearchQuery, 
    setGlobalSearchQuery, 
    searchResults, 
    categories 
  } = useTasks();

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Global Keyboard Shortcut handler for Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const popularTags = [
    'طونير',
    'توقيع إلكتروني',
    'مباريات',
    'صفقات',
    'صيانة وعتاد',
    'الرباط',
    'برشيد',
    'ابن أحمد'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center p-3 sm:p-6 pt-12 sm:pt-20 bg-black/60 backdrop-blur-md">
      <div 
        className="w-full max-w-2xl bg-[#1B1D2A] border border-white/10 rounded-[20px] shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-white/10 flex items-center gap-3 bg-[#12131C]/60 shrink-0">
          <Search className="w-5 h-5 text-[#59718A] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={globalSearchQuery}
            onChange={e => setGlobalSearchQuery(e.target.value)}
            placeholder="بحث شامل فوري في سجل التدخلات التاريخية (العنوان، الوصف، الوسوم، العمليات)..."
            className="w-full bg-transparent text-sm font-semibold text-white placeholder:text-[#8E91A0] focus:outline-none"
          />
          {globalSearchQuery && (
            <button
              type="button"
              onClick={() => setGlobalSearchQuery('')}
              className="text-xs text-[#8E91A0] hover:text-white p-1 transition-colors"
            >
              مسح
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-bold text-[#8E91A0] bg-[#12131C] border border-white/10 rounded">
            ESC
          </kbd>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Tag Accelerators */}
        <div className="px-4 py-2 border-b border-white/10 bg-[#1B1D2A] flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
          <span className="text-[11px] font-bold text-[#8E91A0] whitespace-nowrap pl-1">
            وسوم سريعة:
          </span>
          {popularTags.map(tag => (
            <button
              key={tag}
              type="button"
              onClick={() => setGlobalSearchQuery(tag)}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-[#12131C] border border-white/10 text-white/90 hover:bg-[#59718A]/20 hover:text-[#59718A] hover:border-[#59718A]/40 transition-colors whitespace-nowrap"
            >
              #{tag}
            </button>
          ))}
        </div>

        {/* Search Results Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5 text-xs">
          {!globalSearchQuery.trim() ? (
            <div className="py-12 text-center text-[#8E91A0] space-y-2">
              <Search className="w-8 h-8 mx-auto stroke-1 opacity-50 text-[#59718A]" />
              <div className="font-bold text-xs text-white">اكتب أي كلمة للبحث الفوري في كافة التدخلات التاريخية</div>
              <p className="text-[11px] max-w-md mx-auto text-[#8E91A0]">
                يدعم المحرك البحث الذكي باللغة العربية (توحيد الهمزات والتاء المربوطة) والبحث عبر العناوين، المحاكم، أرقام الصفقات، مراجع الطونير، وتفاصيل العمليات الفرعية.
              </p>
            </div>
          ) : searchResults.length === 0 ? (
            <div className="py-12 text-center text-[#8E91A0] space-y-2">
              <div className="text-xl">🔍</div>
              <div className="font-bold text-xs text-white">
                لم يتم العثور على أي تدخل يطابق: &quot;{globalSearchQuery}&quot;
              </div>
              <p className="text-[11px] text-[#8E91A0]">
                تأكد من كتابة الكلمات بشكل صحيح أو جرّب البحث باستخدام اسم المحكمة أو تصنيف التدخل.
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between text-[11px] text-[#8E91A0] px-1 mb-1">
                <span>نتائج البحث الفوري: {searchResults.length} تدخل تاريخي</span>
                <span>مرتبة حسب درجة التطابق ⚡</span>
              </div>

              {searchResults.map(({ task, score, matches }) => {
                const isDone = task.status === 'منجزة' || task.status === 'مكتملة';
                return (
                  <div
                    key={task.id}
                    className="p-3.5 rounded-xl border border-white/10 bg-[#12131C] hover:border-[#59718A]/50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 group"
                  >
                    <div className="flex-1 min-w-0">
                      {/* Meta kicker */}
                      <div className="flex items-center gap-2 text-[11px] text-[#8E91A0] mb-1">
                        <span className="font-mono text-[#59718A] font-semibold">
                          {task.taskDate ? task.taskDate : 'مفتوحة'}
                        </span>
                        <span>·</span>
                        <span className="truncate">📍 {task.destination}</span>
                        <span>·</span>
                        <span className="text-white/80 font-medium">🏷️ {task.category}</span>
                        <span>·</span>
                        <span className={isDone ? 'text-[#8FA68F] font-bold' : 'text-[#D4A72C] font-bold'}>
                          {task.status}
                        </span>
                      </div>

                      {/* Main Title */}
                      <div
                        onClick={() => { onClose(); onViewTask(task); }}
                        className="font-bold text-xs text-white group-hover:text-[#59718A] cursor-pointer transition-colors"
                      >
                        {task.title}
                      </div>

                      {/* Matched Highlights / Snippets */}
                      {matches.length > 0 && (
                        <div className="mt-1.5 flex flex-wrap gap-1.5 text-[10px]">
                          {matches.map((m, idx) => (
                            <span 
                              key={idx}
                              className="px-2 py-0.5 rounded-md bg-[#1B1D2A] border border-white/10 text-white/90 font-medium truncate max-w-full"
                            >
                              <strong className="text-[#59718A]">{m.fieldLabel}:</strong> {m.snippet}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Quick actions on result */}
                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        type="button"
                        onClick={() => { onClose(); onViewTask(task); }}
                        className="px-2.5 py-1 rounded-lg border border-white/10 text-white hover:bg-white/5 flex items-center gap-1 transition-colors"
                        title="معاينة"
                      >
                        <Eye className="w-3.5 h-3.5 text-[#59718A]" />
                        <span>معاينة</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => { onClose(); onEditTask(task); }}
                        className="p-1 rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors"
                        title="تعديل"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#D4A72C]" />
                      </button>

                      <button
                        type="button"
                        onClick={() => { onClose(); onNavigateToRegistry(task); }}
                        className="p-1 rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors"
                        title="عرض في السجل"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 text-[#59718A]" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </>
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2.5 border-t border-white/10 text-[11px] text-[#8E91A0] flex items-center justify-between shrink-0 bg-[#12131C]/60">
          <span>نظام البحث الفوري المتكامل — E-Tasks Enterprise</span>
          <span>اختصار سريع: <kbd className="font-mono bg-[#1B1D2A] border border-white/10 px-1 rounded text-white">Ctrl+K</kbd></span>
        </div>
      </div>
    </div>
  );
};
