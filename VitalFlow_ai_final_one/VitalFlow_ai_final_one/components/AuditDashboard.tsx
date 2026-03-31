
import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { AuditLog, User } from '../types';
import { API_ENDPOINTS, apiCall } from '../config';

interface AuditDashboardProps {
  currentUser: User;
}

const AuditDashboard: React.FC<AuditDashboardProps> = ({ currentUser }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!currentUser?.id) {
      setError('Current user information is missing. Cannot fetch audit logs.');
      setIsLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        const data = await apiCall(API_ENDPOINTS.AUDIT_LOGS, {
          headers: {
            'x-user-id': currentUser.id,
            'x-user-role': currentUser.role
          }
        });
        setLogs(Array.isArray(data) ? data : (data as any).results || []);
      } catch (err: any) {
        setError('Network error fetching audit logs: ' + (err?.message || 'Unknown error'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, [currentUser]);

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-black tracking-tight text-slate-900 uppercase">System Audit Trails</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">Immutable Governance Log Node</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="px-4 py-2 bg-red-50 border border-red-100 rounded-xl">
            <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Compliance Status</p>
            <p className="text-sm font-black text-red-900 uppercase">HIPAA SECURE</p>
          </div>
        </div>
      </div>

      {error ? (
        <div className="p-12 bg-red-50 border border-red-100 rounded-[2rem] text-center">
          <i className="fas fa-exclamation-triangle text-red-600 text-4xl mb-4"></i>
          <p className="text-red-900 font-bold uppercase tracking-wider">{error}</p>
        </div>
      ) : isLoading ? (
        <div className="p-20 flex justify-center">
          <i className="fas fa-circle-notch animate-spin text-4xl text-red-600"></i>
        </div>
      ) : (
        <div className="bg-white border border-slate-200 rounded-[2rem] shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Timestamp</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">User ID</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Role</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resource</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.map((log) => (
                  <motion.tr 
                    key={log.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-slate-900">
                      {log.userId}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded text-[9px] font-bold uppercase tracking-tighter">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter ${
                        log.action === 'GET' ? 'bg-blue-50 text-blue-600' : 
                        log.action === 'POST' ? 'bg-green-50 text-green-600' : 
                        'bg-amber-50 text-amber-600'
                      }`}>
                        {log.action}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {log.resource}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded text-[9px] font-bold uppercase tracking-tighter ${
                        log.status === 'SUCCESS' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                      }`}>
                        {log.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-mono text-slate-400">
                      {log.ipAddress}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AuditDashboard;
