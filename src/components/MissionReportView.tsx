import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { FileText, Printer, RotateCcw, CheckSquare, Square } from 'lucide-react';

export const MissionReportView: React.FC = () => {
  const { tasks, profile, settings } = useTasks();
  const [selectedTaskId, setSelectedTaskId] = useState<string>('__manual__');
  const [destination, setDestination] = useState('المحكمة الابتدائية بسطات');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState('مهمة وتدخل إداري وتقني');
  const [notes, setNotes] = useState('تم تنفيذ المهمة على أكمل وجه واستيفاء كافة التدخلات والإجراءات الإدارية والتقنية المطلوبة وفق الضوابط المعمول بها.');

  const handleTaskSelect = (taskId: string) => {
    setSelectedTaskId(taskId);
    if (taskId === '__manual__') {
      setDestination('المحكمة الابتدائية بسطات');
      setDate(new Date().toISOString().split('T')[0]);
      setSubject('مهمة وتدخل إداري وتقني');
      setNotes('تم تنفيذ المهمة على أكمل وجه واستيفاء كافة الإجراءات.');
    } else {
      const t = tasks.find(x => x.id === taskId);
      if (t) {
        setDestination(t.destination || 'المديرية الإقليمية للعدل بسطات');
        setDate(t.taskDate || new Date().toISOString().split('T')[0]);
        setSubject(t.title || '');
        setNotes(t.description || 'تم إنجاز التدخل الميداني واستيفاء كافة المحاضر والإشهادات المطلوبة.');
      }
    }
  };

  const selectedTask = tasks.find(t => t.id === selectedTaskId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Control Header */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 flex items-center justify-between no-print">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#59718A]" />
            <span>تقرير خاص بالمهمة الإدارية والميدانية</span>
          </h2>
          <p className="text-xs text-[#8E91A0] mt-0.5">
            استخراج وطباعة تقرير إداري رسمي معتمد بصيغة A4 لوزارة العدل
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleTaskSelect('__manual__')}
            title="تفريغ الحقول وبدء إدخال يدوي جديد"
            className="w-8 h-8 rounded-lg border border-white/10 text-[#8E91A0] hover:text-white hover:bg-white/5 flex items-center justify-center transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={handlePrint}
            title="طباعة التقرير بصيغة A4"
            className="w-8 h-8 rounded-lg bg-[#59718A] hover:bg-[#4d6379] text-white flex items-center justify-center shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-5 space-y-4 text-xs no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="font-bold text-white block mb-1">
              اختر المهمة المعنية لتعبئة المعطيات تلقائياً:
            </label>
            <select
              value={selectedTaskId}
              onChange={e => handleTaskSelect(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white font-semibold focus:outline-none focus:border-[#59718A]"
            >
              <option value="__manual__">➕ إدخال يدوي حر جديد</option>
              {tasks.map(t => (
                <option key={t.id} value={t.id}>
                  {t.taskDate || 'مفتوحة'} - {t.title} ({t.destination})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-bold text-white block mb-1">
              مكان التدخل / الوجهة الرسمية:
            </label>
            <input
              type="text"
              value={destination}
              onChange={e => setDestination(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white font-semibold focus:outline-none focus:border-[#59718A]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="font-bold text-[#8E91A0] block mb-1">
              القائم بالمهمة:
            </label>
            <input
              type="text"
              readOnly
              value={profile.fullName || settings.userName || 'محمد ايت حمادي'}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C]/60 text-[#8E91A0] font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-[#8E91A0] block mb-1">
              المصلحة / الإدارة:
            </label>
            <input
              type="text"
              readOnly
              value={profile.organization || settings.department || 'المديرية الإقليمية بسطات'}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C]/60 text-[#8E91A0] font-bold"
            />
          </div>

          <div>
            <label className="font-bold text-white block mb-1">
              تاريخ المهمة:
            </label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white font-sans font-bold focus:outline-none focus:border-[#59718A]"
            />
          </div>
        </div>

        <div>
          <label className="font-bold text-white block mb-1">
            موضوع المهمة والغرض منها:
          </label>
          <input
            type="text"
            value={subject}
            onChange={e => setSubject(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white font-bold focus:outline-none focus:border-[#59718A]"
          />
        </div>

        <div>
          <label className="font-bold text-white block mb-1">
            تفاصيل وملاحظات سير تنفيذ المهمة:
          </label>
          <textarea
            rows={3}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-white/10 bg-[#12131C] text-white text-xs leading-relaxed focus:outline-none focus:border-[#59718A]"
          />
        </div>
      </div>

      {/* Official A4 Printable Document Sheet */}
      <div 
        id="official-mission-sheet"
        className="bg-white text-slate-900 p-8 sm:p-12 rounded-xl border border-slate-200 shadow-md font-sans text-xs leading-relaxed"
      >
        {/* Official Header */}
        <div className="text-center pb-4 border-b-2 border-slate-900 space-y-1 mb-6">
          <div className="font-extrabold text-sm text-slate-900">
            {profile.ministry || settings.ministry || 'المملكة المغربية - وزارة العدل'}
          </div>
          <div className="font-bold text-xs text-slate-700">
            {profile.organization || settings.department || 'المديرية الإقليمية بسطات'}
          </div>
          {profile.service && (
            <div className="text-[11px] text-slate-600 font-semibold">
              {profile.service}
            </div>
          )}
        </div>

        {/* Title */}
        <div className="text-center my-6">
          <h1 className="text-lg font-black text-slate-900 underline inline-block">
            تقرير خاص بالمهمة الإدارية والميدانية
          </h1>
        </div>

        {/* Metadata Table */}
        <div className="border border-slate-300 rounded-lg p-3.5 mb-6 space-y-2 bg-slate-50/50">
          <div className="grid grid-cols-2 gap-4">
            <div>• <strong>الشخص القائم بالمهمة:</strong> <u>{profile.fullName || settings.userName || 'محمد ايت حمادي'}</u> ({profile.jobTitle || settings.userRole})</div>
            <div>• <strong>المصلحة / الإدارة:</strong> {profile.organization || settings.department}</div>
            <div>• <strong>مكان التدخل / الوجهة:</strong> <strong>{destination}</strong></div>
            <div>• <strong>تاريخ المهمة:</strong> <span className="font-sans font-bold">{date || '(غير محدد)'}</span></div>
          </div>
        </div>

        {/* Subject */}
        <div className="mb-6 space-y-1">
          <strong className="text-slate-900 block">موضوع المهمة والغرض منها:</strong>
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 font-bold text-slate-900 text-xs leading-relaxed">
            {subject}
          </div>
        </div>

        {/* Subtasks if present */}
        {selectedTask && selectedTask.subtasks && selectedTask.subtasks.length > 0 && (
          <div className="mb-6 space-y-1">
            <strong className="text-slate-900 block">العمليات والإجراءات الفرعية المنجزة:</strong>
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 text-xs">
              {selectedTask.subtasks.map((st, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  {st.completed || st.done ? (
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  ) : (
                    <Square className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  )}
                  <span>{st.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Detailed Notes */}
        <div className="mb-12 space-y-1">
          <strong className="text-slate-900 block">تفاصيل وملاحظات سير تنفيذ المهمة:</strong>
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 min-h-[120px] whitespace-pre-wrap text-slate-900 text-xs leading-loose">
            {notes}
          </div>
        </div>

        {/* Official Signatures */}
        <div className="flex justify-between items-start pt-6 border-t border-slate-200 text-xs">
          <div className="text-center w-48 space-y-8">
            <strong>توقيع القائم بالمهمة:</strong>
            <div className="font-bold underline text-slate-900">
              {profile.fullName || settings.userName || 'محمد ايت حمادي'}
            </div>
          </div>

          <div className="text-center w-48 space-y-8">
            <strong>{profile.officialStampText || settings.officialStampText || 'تأشيرة السيد المدير الإقليمي'}:</strong>
            <div className="text-slate-400">
              ..................................
            </div>
          </div>
        </div>

        {/* Official Footer */}
        <div className="text-center pt-8 mt-8 border-t border-slate-200 text-[10px] text-slate-500">
          {settings.footerText || 'المديرية الإقليمية للعدل بسطات - مصلحة تدبير الممتلكات والعتاد والمعلوماتيات'}
        </div>
      </div>
    </div>
  );
};
