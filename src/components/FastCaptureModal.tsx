import React, { useState, useEffect, useRef } from 'react';
import { useTasks } from '../context/TaskContext';
import { Zap, X } from 'lucide-react';

interface FastCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FastCaptureModal: React.FC<FastCaptureModalProps> = ({ isOpen, onClose }) => {
  const { createTask, courts, categories } = useTasks();
  const [inputText, setInputText] = useState('');
  const [destination, setDestination] = useState('');
  const [category, setCategory] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setInputText('');
      setDestination('');
      setCategory(categories[0]?.name || 'مهام إدارية عامة');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    createTask({
      title: inputText.trim(),
      destination: destination.trim(),
      category: category.trim() || 'مهام إدارية عامة',
      status: 'قيد الإنجاز',
      priority: 'عادية',
      progress: 25,
      description: 'تم تسجيل هذا التدخل فجائياً عبر نافذة الإدخال السريع المباشر.'
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-[#1B1D2A] border border-white/10 rounded-[20px] shadow-2xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-white/10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#D4A72C]/20 text-[#D4A72C] flex items-center justify-center">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-white">
              إدخال فوري وسريع لمهمة
            </h3>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1 rounded-lg text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3 text-xs">
          <div>
            <label className="font-bold text-white block mb-1">
              نص المهمة أو التدخل الفجائي:
            </label>
            <input
              ref={inputRef}
              type="text"
              required
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="مثال: تسليم طونير HP بابتدائية ابن أحمد، عطل مفتاح التوقيع..."
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white placeholder-[#8E91A0] text-xs font-semibold focus:outline-none focus:border-[#D4A72C]"
            />
          </div>

          <div>
            <label className="font-bold text-white block mb-1">
              الوجهة المقترحة (اختياري):
            </label>
            <input
              type="text"
              list="fc-courts-list"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              placeholder="ابتدائية سطات، برشيد، ابن أحمد..."
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white placeholder-[#8E91A0] text-xs focus:outline-none focus:border-[#D4A72C]"
            />
            <datalist id="fc-courts-list">
              {courts.map(c => (
                <option key={c.id} value={c.name} />
              ))}
            </datalist>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 transition-colors"
            >
              إلغاء
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-bold rounded-lg bg-[#D4A72C] text-[#12131C] hover:bg-[#D4A72C]/90 shadow-sm transition-all"
            >
              ⚡ تسجيل فوري
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
