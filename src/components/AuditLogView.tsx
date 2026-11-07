import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { History, Search, Filter } from 'lucide-react';

export const AuditLogView: React.FC = () => {
  const { auditLog } = useTasks();
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredLogs = auditLog.filter(log => {
    if (typeFilter && log.type !== typeFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const inAction = log.action?.toLowerCase().includes(q);
      const inTitle = log.targetTitle?.toLowerCase().includes(q);
      const inDetails = log.details?.toLowerCase().includes(q);
      if (!inAction && !inTitle && !inDetails) return false;
    }
    return true;
  });

  const getActionBadge = (type?: string, action?: string) => {
    switch (type) {
      case 'create':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#59718A] text-white">➕ إنشاء</span>;
      case 'update':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#D4A72C] text-[#12131C]">✏️ تعديل</span>;
      case 'done':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#2F6F6D] text-white">✅ إنجاز</span>;
      case 'delete':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#E07A47] text-white">🗑️ حذف</span>;
      case 'restore':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#5B3A62] text-white">↩️ استرجاع</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-white/10 text-[#8E91A0]">⚙️ نظام</span>;
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#59718A]" />
            <span>سجل العمليات والأحداث الزمنية (Audit Log)</span>
          </h2>
          <p className="text-xs text-[#8E91A0] mt-0.5">
            توثيق تلقائي زمني لكافة عمليات الإنشاء، التعديل، الإنجاز، والحذف لحماية سلامة البيانات
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="بحث في العمليات..."
              className="w-full pl-3 pr-8 py-1.5 rounded-xl border border-white/10 bg-[#12131C] text-white placeholder-[#8E91A0] text-xs focus:outline-none focus:border-[#59718A]"
            />
            <Search className="w-3.5 h-3.5 text-[#8E91A0] absolute right-2.5 top-2.5" />
          </div>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-xl border border-white/10 bg-[#12131C] text-xs font-semibold text-white focus:outline-none focus:border-[#59718A]"
          >
            <option value="" className="bg-[#1B1D2A] text-white">جميع العمليات</option>
            <option value="create" className="bg-[#1B1D2A] text-white">إنشاء</option>
            <option value="update" className="bg-[#1B1D2A] text-white">تعديل</option>
            <option value="done" className="bg-[#1B1D2A] text-white">إنجاز</option>
            <option value="delete" className="bg-[#1B1D2A] text-white">حذف</option>
            <option value="restore" className="bg-[#1B1D2A] text-white">استرجاع</option>
          </select>
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#12131C]/80 text-[#8E91A0] font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4 w-40 text-center">التاريخ والتوقيت</th>
                <th className="py-3 px-4 w-28 text-center">نوع الإجراء</th>
                <th className="py-3 px-4 min-w-[200px]">المهمة / العنصر المعني</th>
                <th className="py-3 px-4">تفاصيل وسياق العملية</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-12 text-center text-[#8E91A0]">
                    لا توجد أحداث مسجلة مطابقة.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log, index) => (
                  <tr key={log.id || `audit-log-${index}-${log.timestamp || ''}`} className="hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 px-4 text-center font-mono text-[11px] text-[#8E91A0] whitespace-nowrap">
                      {log.timestamp ? log.timestamp.replace('T', ' ').slice(0, 19) : '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      {getActionBadge(log.type, log.action)}
                    </td>
                    <td className="py-3 px-4 font-bold text-white">
                      {log.targetTitle || log.action}
                    </td>
                    <td className="py-3 px-4 text-[#8E91A0]">
                      {log.details || '-'}
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
