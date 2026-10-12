import React, { useState } from 'react';
import { useAdminStore } from '../adminStore';
import {
  ClipboardList,
  Search,
  ShieldAlert,
  Clock,
  User,
  Filter,
  Lock,
} from 'lucide-react';

export const AuditLogsView: React.FC = () => {
  const { activityLogs } = useAdminStore();
  const [search, setSearch] = useState('');

  const logsList = activityLogs || [];

  const filteredLogs = logsList.filter((log) => {
    const q = (search || '').toLowerCase();
    const action = (log.action || '').toLowerCase();
    const staff = (log.adminName || (log as any).performedByName || '').toLowerCase();
    const entity = (log.module || (log as any).entityType || '').toLowerCase();
    const detailsStr = typeof log.details === 'object' ? JSON.stringify(log.details).toLowerCase() : String(log.details || '').toLowerCase();
    return (
      action.includes(q) ||
      staff.includes(q) ||
      entity.includes(q) ||
      detailsStr.includes(q)
    );
  });

  return (
    <div className="space-y-6 font-sans">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-400" />
            <span>Immutable Audit &amp; Activity Log</span>
          </h1>
          <p className="text-xs text-slate-400">
            Cryptographically enforced append-only trail of all staff logins, stock movements, price updates, and order changes.
          </p>
        </div>
      </div>

      {/* Security note */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 text-xs text-slate-300 flex items-start gap-3">
        <Lock className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div>
          <strong className="text-white block mb-0.5">Non-Repudiation Guarantee:</strong>
          In Firestore, the <code className="text-blue-400 font-mono">activityLogs</code> collection is protected by security rule <code className="text-emerald-400 font-mono">allow update, delete: if false;</code>. No user or administrator can alter or delete logged actions.
        </div>
      </div>

      {/* Search */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search logs by action, staff name, entity..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/70 text-slate-400 text-[11px] uppercase border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-3">Staff Operator</th>
                <th className="py-3 px-3">Action</th>
                <th className="py-3 px-3">Entity Type</th>
                <th className="py-3 px-4">Log Details &amp; Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-500">
                    No activity logs found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition">
                    <td className="py-3 px-4 text-slate-400 text-[11px] font-mono whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString('en-GB', {
                        dateStyle: 'short',
                        timeStyle: 'medium',
                      })}
                    </td>

                    <td className="py-3 px-3">
                      <div className="font-bold text-white">{log.adminName || (log as any).performedByName || 'Admin'}</div>
                      <div className="text-[10px] font-mono text-slate-500">{(log.adminEmail || (log as any).performedBy || log.id || 'system').slice(0, 15)}</div>
                    </td>

                    <td className="py-3 px-3">
                      <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                        {(log.action || '').replace('_', ' ')}
                      </span>
                    </td>

                    <td className="py-3 px-3 font-semibold text-slate-300 capitalize">
                      {log.module || (log as any).entityType || 'General'}
                    </td>

                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400 max-w-md truncate">
                      {typeof log.details === 'object'
                        ? JSON.stringify(log.details)
                        : String(log.details)}
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
