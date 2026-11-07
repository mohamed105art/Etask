import React from 'react';
import { useTasks } from '../context/TaskContext';
import { Trash2, RotateCcw, AlertTriangle, MapPin } from 'lucide-react';

export const TrashView: React.FC = () => {
  const { trash, restoreTask, deleteTask, emptyTrash } = useTasks();

  return (
    <div className="space-y-4">
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold text-[#E07A47] flex items-center gap-2">
            <Trash2 className="w-4 h-4" />
            <span>سلة المهملات والأمان ({trash.length})</span>
          </h2>
          <p className="text-xs text-[#8E91A0] mt-0.5">
            المهام المحذوفة مؤقتاً لحمايتها من الحذف غير المقصود مع إمكانية استرجاعها فوراً
          </p>
        </div>

        {trash.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('هل أنت متأكد من تفريغ سلة المهملات نهائياً؟ لا يمكن التراجع عن هذا الإجراء.')) {
                emptyTrash();
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-[#E07A47]/40 text-[#E07A47] hover:bg-[#E07A47]/10 text-xs font-bold transition-colors flex items-center gap-1.5"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>تفريغ السلة</span>
          </button>
        )}
      </div>

      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#12131C]/80 text-[#8E91A0] font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4 w-36 text-center">تاريخ الحذف</th>
                <th className="py-3 px-4">موضوع المهمة المحذوفة</th>
                <th className="py-3 px-4 w-36">التصنيف</th>
                <th className="py-3 px-4 w-44">الوجهة</th>
                <th className="py-3 px-4 w-36 text-center">إجراءات الأمان</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {trash.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-[#8E91A0]">
                    سلة المهملات فارغة حالياً. لا توجد عناصر محذوفة.
                  </td>
                </tr>
              ) : (
                trash.map(task => (
                  <tr key={task.id} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-center font-sans text-xs text-[#8E91A0] whitespace-nowrap">
                      {task.deletedAt ? task.deletedAt.replace('T', ' ').slice(0, 16) : '-'}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{task.title}</div>
                      {task.description && (
                        <div className="text-[11px] text-[#8E91A0] line-clamp-1">{task.description}</div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-[#8E91A0] font-semibold">{task.category}</td>
                    <td className="py-3 px-4 text-white">
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-[#D4A72C] shrink-0" />
                        <span>{task.destination}</span>
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => restoreTask(task.id)}
                          className="px-2.5 py-1 text-xs font-bold rounded-lg border border-white/10 text-white hover:bg-white/5 flex items-center gap-1 transition-colors"
                          title="استرجاع إلى السجل النشط"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-[#59718A]" />
                          <span>استرجاع</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (window.confirm(`حذف نهائي للمهمة: "${task.title}"؟`)) {
                              deleteTask(task.id, true);
                            }
                          }}
                          className="p-1 rounded-lg border border-white/10 text-[#E07A47] hover:bg-white/5 transition-colors"
                          title="حذف نهائي"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
