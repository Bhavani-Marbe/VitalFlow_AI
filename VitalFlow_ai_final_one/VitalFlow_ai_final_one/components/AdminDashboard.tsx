
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { NETWORK_HEATMAP_DATA, INITIAL_INVENTORY } from '../constants';
import { UserRole, InventoryItem } from '../types';
import { API_ENDPOINTS, apiCall } from '../config';

import EmptyState from './EmptyState';

interface AdminDashboardProps {
  role: UserRole;
  inventory: InventoryItem[];
  selectedCity: string;
  t: any;
  currentUser?: any;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ role, inventory, selectedCity, t, currentUser }) => {
  // Filter for high expiry risk items for the new alerts section
  const highRiskItems = (inventory || []).filter(item => {
    if (!item.aiInsights) return false;
    return item.aiInsights.expiryRiskScore > 0.85;
  });

  // Fallback for cities not in the heatmap data
  const chartKey = NETWORK_HEATMAP_DATA[0].hasOwnProperty(selectedCity) ? selectedCity : 'Mumbai';

  const [hospitalInventory, setHospitalInventory] = React.useState<any[]>([]);
  const [isHospLoading, setIsHospLoading] = React.useState(true);
  const [notifications, setNotifications] = React.useState<any[]>([]);
  const [activeToast, setActiveToast] = React.useState<any | null>(null);

  React.useEffect(() => {
    if (role === UserRole.SuperAdmin) {
      apiCall(API_ENDPOINTS.HOSPITALS_INVENTORY, {
        headers: {
          'x-user-id': currentUser?.id || 'admin',
          'x-user-role': role
        }
      })
        .then(data => {
          setHospitalInventory(Array.isArray(data) ? data : (data as any).results || []);
          setIsHospLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch hospital inventory:', err);
          setIsHospLoading(false);
        });
    } else {
      setIsHospLoading(false);
    }

    // Listen for admin notifications via WebSocket (with error handling)
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const ws = new WebSocket(`${protocol}//${window.location.host}`);
      
      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
      
      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'ADMIN_NOTIFICATION') {
            setNotifications(prev => [data.payload, ...prev].slice(0, 5));
            setActiveToast(data.payload);
            setTimeout(() => setActiveToast(null), 5000);

            // Refresh hospital inventory when a request comes in
            apiCall(API_ENDPOINTS.HOSPITALS_INVENTORY, {
              headers: {
                'x-user-id': currentUser?.id || 'admin',
                'x-user-role': role
              }
            })
              .then(data => setHospitalInventory(Array.isArray(data) ? data : (data as any).results || []))
              .catch(err => console.error('Failed to refresh hospital inventory:', err));
          }
        } catch (parseError) {
          console.error('Error parsing WebSocket message:', parseError);
        }
      };

      return () => {
        try {
          ws.close();
        } catch (e) {
          console.error('Error closing WebSocket:', e);
        }
      };
    } catch (error) {
      console.error('WebSocket setup error:', error);
    }
  }, [role, currentUser]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12 relative"
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-[0.015] pointer-events-none rounded-[3rem]"></div>
      {/* Toast Notification */}
      <AnimatePresence>
        {activeToast && (
          <motion.div
            initial={{ opacity: 0, y: -100, x: '-50%' }}
            animate={{ opacity: 1, y: 20, x: '-50%' }}
            exit={{ opacity: 0, y: -100, x: '-50%' }}
            className="fixed top-0 left-1/2 z-[100] w-full max-w-md"
          >
            <div className="bg-slate-900 border border-red-500/50 p-6 rounded-3xl shadow-2xl shadow-red-600/20 flex items-center gap-6">
              <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg">
                <i className="fas fa-bell animate-pulse"></i>
              </div>
              <div className="flex-1">
                <p className="text-[10px] font-black text-red-500 uppercase tracking-widest mb-1">{activeToast.title}</p>
                <p className="text-sm font-bold text-white leading-tight uppercase tracking-tight">{activeToast.message}</p>
              </div>
              <button onClick={() => setActiveToast(null)} className="text-slate-400 hover:text-white transition-colors">
                <i className="fas fa-xmark"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Dashboard Header */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-900 border border-slate-800 p-12 md:p-16 text-white shadow-2xl mb-12">
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <img 
            src="https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80&w=1200" 
            alt="Admin Dashboard Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold text-red-600 uppercase tracking-widest">{t.liveTelemetry}</span>
            </div>
            <h1 className="text-5xl font-extrabold text-white tracking-tight uppercase">
              {t.commandCenter.split(' ')[0]} <span className="text-red-600">{t.commandCenter.split(' ')[1] || 'Center'}</span>
            </h1>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Node ID: GRID-772-ALPHA • {role} Access</p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white/5 border border-white/10 px-8 py-5 flex flex-col items-end justify-center rounded-2xl shadow-sm backdrop-blur-md">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.networkHealth}</span>
              <span className="text-2xl font-bold text-emerald-400 tracking-tight mono leading-none">99.98%</span>
            </div>
            <div className="bg-white/5 border border-white/10 px-8 py-5 flex flex-col items-end justify-center rounded-2xl shadow-sm backdrop-blur-md">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-1">{t.activeNodes}</span>
              <span className="text-2xl font-bold text-white tracking-tight mono leading-none">1,242</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Model 1: Demand Forecasting View */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="space-y-1">
              <p className="section-label">{t.model01}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">{t.regionalDemandMatrix}</h3>
            </div>
            <span className="px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-600 text-[9px] font-bold rounded-lg uppercase tracking-widest border border-red-100 dark:border-red-900/30">{t.livePrediction}</span>
          </div>
          <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
            {NETWORK_HEATMAP_DATA.map((data, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-slate-700 flex items-center justify-center text-red-600 shadow-sm">
                    <i className="fas fa-chart-line text-xs"></i>
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{data.name}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Time Interval {idx + 1}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black text-red-600 mono leading-none">{data[chartKey]}</p>
                  <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1">Demand Units</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Live Notification Feed */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm flex flex-col"
        >
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-red-600 flex items-center justify-center text-white shadow-lg shadow-red-600/20">
              <i className="fas fa-bell text-xl animate-bounce"></i>
            </div>
            <div>
              <p className="section-label mb-0">Live Feed</p>
              <p className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-tight">Admin Alerts</p>
            </div>
          </div>
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {notifications.length > 0 ? notifications.map((notif, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="text-red-600 text-[9px] font-bold uppercase tracking-widest">{notif.title}</p>
                  <span className="text-[8px] text-slate-400 mono">{new Date(notif.timestamp).toLocaleTimeString()}</span>
                </div>
                <p className="text-[11px] font-medium text-slate-700 dark:text-slate-300 leading-relaxed uppercase tracking-tight">{notif.message}</p>
              </motion.div>
            )) : (
              <div className="flex flex-col items-center justify-center h-full text-center opacity-40">
                <i className="fas fa-inbox text-4xl mb-4 text-slate-300"></i>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">No New Notifications</p>
              </div>
            )}
          </div>
          <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800">
            <p className="section-label">System Integrity</p>
            <p className="text-4xl font-bold text-emerald-600 mt-1 tracking-tight mono leading-none">99.9%</p>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Model 02: Expiry-Risk Optimization Alerts */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <p className="section-label">{t.model02}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">{t.perishableAlerts}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-900/20 flex items-center justify-center text-amber-600 dark:text-amber-400 border border-amber-100 dark:border-amber-900/30 shadow-sm">
              <i className="fas fa-hourglass-end text-xl"></i>
            </div>
          </div>
          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {highRiskItems.length > 0 ? highRiskItems.map(item => (
              <div key={item.id} className="group p-5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all">
                <div className="flex justify-between items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-red-600 text-white text-[9px] font-bold rounded uppercase tracking-tight">{item.bloodGroup}</span>
                      <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.componentType}</span>
                    </div>
                    <p className="text-base font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-tight">{item.facilityName}</p>
                    <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">{item.city}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-red-600 leading-none mono tracking-tighter">{(item.aiInsights.expiryRiskScore * 100).toFixed(0)}%</p>
                    <p className="text-[8px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-1.5">{t.riskIndex}</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200/50 dark:border-slate-700 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <i className="fas fa-truck-fast text-[10px] text-amber-600"></i>
                    <span className="text-[9px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{t.redistributionRequired}</span>
                  </div>
                  <button className="text-[9px] font-bold text-red-600 uppercase tracking-widest hover:text-red-700 transition-colors">{t.draftTransfer}</button>
                </div>
              </div>
            )) : (
              <EmptyState 
                icon="fa-shield-check"
                title={t.networkSecured}
                description={t.noHighRisk}
                tips={[
                  "AI Model 02 runs every 15 minutes to scan for aging inventory.",
                  "Redistribution protocols are automatically suggested for items above 85% risk.",
                  "Current network health is optimal."
                ]}
                t={t}
              />
            )}
          </div>
        </motion.div>

        {/* Model 5: Network Redistribution Engine */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="space-y-1">
              <p className="section-label">{t.model05}</p>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight uppercase">{t.redistributionRoutes}</h3>
            </div>
            <div className="w-12 h-12 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-900 dark:text-white border border-slate-200 dark:border-slate-700 shadow-sm">
              <i className="fas fa-route text-xl"></i>
            </div>
          </div>
          <div className="space-y-3">
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <span className="section-label mb-0">Route Alpha-01</span>
                 <i className="fas fa-arrow-right text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all"></i>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Mumbai Hub A → Pune Sector 4</p>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest bg-red-50 dark:bg-red-900/20 px-2 py-0.5 rounded border border-red-100 dark:border-red-900/30">12 Units (Critical)</span>
                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">84km Transit</span>
              </div>
            </div>
            <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 hover:bg-white dark:hover:bg-slate-700 hover:border-slate-300 dark:hover:border-slate-600 transition-all group">
              <div className="flex justify-between items-start mb-4">
                 <span className="section-label mb-0">Route Beta-04</span>
                 <i className="fas fa-arrow-right text-slate-300 dark:text-slate-600 group-hover:text-slate-900 dark:group-hover:text-white group-hover:translate-x-1 transition-all"></i>
              </div>
              <p className="text-lg font-bold text-slate-900 dark:text-white uppercase tracking-tight">Delhi Central → Gurgaon Metro</p>
              <div className="flex items-center gap-3 mt-4">
                <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded border border-emerald-100 dark:border-emerald-900/30">Demand Balancing</span>
                <span className="w-1 h-1 bg-slate-200 dark:bg-slate-700 rounded-full"></span>
                <span className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">32km Transit</span>
              </div>
            </div>
          </div>
          <button className="btn-primary w-full mt-8 h-14">
            <i className="fas fa-bolt-lightning text-xs"></i>
            {t.executeProtocol}
          </button>
        </motion.div>
      </div>
      <div className="grid grid-cols-1 gap-8 mt-12">
        {/* Hospital Stock Monitor (Admin Only) */}
        {role === UserRole.SuperAdmin && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="space-y-1">
                <p className="section-label">Anti-Hoarding Monitor</p>
                <h3 className="text-2xl font-bold text-slate-900 tracking-tight uppercase">Hospital Stock Levels</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center text-red-600 border border-red-100 shadow-sm">
                <i className="fas fa-shield-halved text-xl"></i>
              </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Hospital</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Blood Group</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Units</th>
                    <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {hospitalInventory.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 text-[11px] font-bold text-slate-900 uppercase tracking-tight">{item.hospitalName}</td>
                      <td className="py-4">
                        <span className="px-2 py-0.5 bg-red-50 text-red-600 text-[9px] font-bold rounded uppercase tracking-tight border border-red-100">{item.bloodGroup}</span>
                      </td>
                      <td className="py-4 text-[11px] font-bold text-slate-900 mono">{item.units}</td>
                      <td className="py-4">
                        {item.units > 5 ? (
                          <span className="flex items-center gap-1.5 text-amber-600 text-[9px] font-bold uppercase tracking-widest">
                            <i className="fas fa-triangle-exclamation"></i>
                            Hoarding Risk
                          </span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-emerald-600 text-[9px] font-bold uppercase tracking-widest">
                            <i className="fas fa-check-circle"></i>
                            Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

export default AdminDashboard;
