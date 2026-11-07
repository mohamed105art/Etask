import React, { useState } from 'react';
import { useTasks } from '../context/TaskContext';
import { History, Search } from 'lucide-react';

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

  const getActionBadge = (type?: string) => {
    switch (type) {
      case 'create':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-blue-500/15 text-blue-400">إنشاء</span>;
      case 'update':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500/15 text-amber-400">تعديل</span>;
      case 'done':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-emerald-500/15 text-emerald-400">إنجاز</span>;
      case 'delete':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-red-500/15 text-red-400">حذف</span>;
      case 'restore':
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-purple-500/15 text-purple-400">استرجاع</span>;
      default:
        return <span className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-white/10 text-[#8E91A0]">نظام</span>;
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return { date: '-', time: '' };
    try {
      const parts = timestamp.split('T');
      const date = parts[0] || '-';
      const time = parts[1] ? parts[1].slice(0, 8) : '';
      return { date, time };
    } catch {
      return { date: timestamp, time: '' };
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <History className="w-4 h-4 text-[#59718A]" />
            <span>سجل العمليات والأحداث الزمنية</span>
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

      {/* Log Table with Min-Width & Horizontal Scroll */}
      <div className="bg-[#1B1D2A] border border-white/10 rounded-[20px] overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-xs">
            <thead className="bg-[#12131C]/90 text-[#8E91A0] font-bold border-b border-white/10">
              <tr>
                <th className="py-3 px-4 w-36 text-center whitespace-nowrap">التاريخ والتوقيت</th>
                <th className="py-3 px-4 w-28 text-center whitespace-nowrap">نوع الإجراء</th>
                <th className="py-3 px-4 min-w-[250px] whitespace-nowrap">المهمة / العنصر المعني</th>
                <th className="py-3 px-4 min-w-[280px]">تفاصيل وسياق العملية</th>
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
                filteredLogs.map((log, index) => {
                  const { date, time } = formatTimestamp(log.timestamp);
                  return (
                    <tr 
                      key={log.id || `audit-log-${index}-${log.timestamp || ''}`} 
                      className="hover:bg-white/[0.03] transition-colors"
                    >
                      {/* Stacked Date on top, Time below */}
                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        <div className="font-sans text-xs text-gray-200 font-semibold">{date}</div>
                        {time && <div className="text-[10px] text-[#8E91A0] font-sans mt-0.5">{time}</div>}
                      </td>

                      <td className="py-3 px-4 text-center whitespace-nowrap">
                        {getActionBadge(log.type)}
                      </td>

                      <td className="py-3 px-4 font-bold text-white min-w-[250px]">
                        {log.targetTitle || log.action}
                      </td>

                      <td className="py-3 px-4 text-[#8E91A0] min-w-[280px] leading-relaxed">
                        {log.details || '-'}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
