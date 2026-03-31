import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { User, UserActivity, BloodRequestStatus, DeliveryMethod } from '../types';
import { Clock, PackageCheck, Truck, MapPin, CheckCircle2 } from 'lucide-react';
import { API_ENDPOINTS, apiCall } from '../config';

interface DashboardProps {
  user: User;
  activeRequest?: {
    status: BloodRequestStatus;
    deliveryMethod: DeliveryMethod;
    deliveryAddress?: string;
    facilityName: string;
  } | null;
  onUpdateUser: (user: User) => void;
  t: any;
}

const Dashboard: React.FC<DashboardProps> = ({ user, activeRequest, onUpdateUser, t }) => {
  const [activities, setActivities] = useState<UserActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [emergencyName, setEmergencyName] = useState(user.emergencyContactName || '');
  const [emergencyPhone, setEmergencyPhone] = useState(user.emergencyContactPhone || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveEmergency = () => {
    setIsSaving(true);
    setTimeout(() => {
      onUpdateUser({
        ...user,
        emergencyContactName: emergencyName,
        emergencyContactPhone: emergencyPhone
      });
      setIsSaving(false);
    }, 800);
  };

  // Memoize fetch to prevent re-running on every render
  const memoizedUserId = React.useMemo(() => user.id, [user.id]);

  useEffect(() => {
    if (!memoizedUserId) {
      console.error("No user id available for fetching activities.");
      setActivities([]);
      setIsLoading(false);
      return;
    }

    const fetchActivities = async () => {
      try {
        const url = `${API_ENDPOINTS.ACTIVITIES}/${memoizedUserId}`;
        const data = await apiCall(url);
        setActivities(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch activities:", error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities();
  }, [memoizedUserId]);

  const stats = [
    { label: t.totalPurchases, value: activities.filter(a => a.type === 'PURCHASE').length, icon: 'fa-shopping-cart', color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: t.reservations, value: activities.filter(a => a.type === 'RESERVATION').length, icon: 'fa-calendar-check', color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    { label: t.totalUnits, value: activities.reduce((acc, curr) => acc + curr.units, 0), icon: 'fa-droplet', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
    { label: t.totalSpend, value: `₹${activities.reduce((acc, curr) => acc + curr.cost, 0).toLocaleString()}`, icon: 'fa-indian-rupee-sign', color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
  ];

  return (
    <div className="space-y-12 py-10 relative">
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-[0.015] pointer-events-none rounded-[3rem]"></div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{t.userDashboard}</h1>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">{t.welcomeBack}, {user.name} • {t.accountId}: {user.id}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-slate-900">{user.email}</p>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role}</p>
          </div>
          <img src={user.avatar || `https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm" referrerPolicy="no-referrer" />
        </div>
      </div>

      {activeRequest && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-red-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-600/20"
        >
          <div className="flex flex-col md:flex-row justify-between gap-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase tracking-tight">{t.activeRequestStatus}</h3>
                  <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{t.liveTracking}</p>
                </div>
              </div>
              <div className="flex items-center gap-6 pt-4">
                {[
                  { id: BloodRequestStatus.Sent, icon: Clock, label: 'Sent' },
                  { id: BloodRequestStatus.Initiated, icon: PackageCheck, label: 'Initiated' },
                  { id: BloodRequestStatus.InTransit, icon: activeRequest.deliveryMethod === DeliveryMethod.Transfer ? Truck : MapPin, label: activeRequest.deliveryMethod === DeliveryMethod.Transfer ? t.transfer : t.pickup },
                  { id: BloodRequestStatus.Reached, icon: CheckCircle2, label: 'Reached' }
                ].map((step, idx) => {
                  const statusOrder = [BloodRequestStatus.Sent, BloodRequestStatus.Initiated, BloodRequestStatus.InTransit, BloodRequestStatus.Reached];
                  const currentIndex = statusOrder.indexOf(activeRequest.status);
                  const stepIndex = statusOrder.indexOf(step.id);
                  const isActive = stepIndex <= currentIndex;
                  const Icon = step.icon;

                  return (
                    <div key={step.id} className="flex flex-col items-center gap-2">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isActive ? 'bg-white text-red-600 shadow-lg' : 'bg-white/10 text-white/30'}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`text-[9px] font-black uppercase tracking-widest ${isActive ? 'text-white' : 'text-white/30'}`}>{step.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="bg-black/10 rounded-3xl p-6 flex-1 max-w-md border border-white/10 backdrop-blur-sm">
              <h4 className="text-[10px] font-bold text-white/60 uppercase tracking-widest mb-4">{t.requestDetails}</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase">{t.facility}</span>
                  <span className="text-xs font-black uppercase">{activeRequest.facilityName}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white/40 uppercase">{t.method}</span>
                  <span className="text-xs font-black uppercase">{activeRequest.deliveryMethod}</span>
                </div>
                {activeRequest.deliveryAddress && (
                  <div className="pt-2 border-t border-white/5">
                    <span className="text-[10px] font-bold text-white/40 uppercase block mb-1">{t.destination}</span>
                    <span className="text-xs font-medium leading-relaxed">{activeRequest.deliveryAddress}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div 
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm hover:shadow-md transition-all"
          >
            <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 text-xl shadow-inner`}>
              <i className={`fas ${stat.icon}`}></i>
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm h-full">
            <div className="flex items-center gap-4 mb-8">
              <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                <i className="fas fa-shield-heart"></i>
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.emergencyContact}</h3>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t.criticalRequirement}</p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.contactName}</label>
                <input 
                  type="text" 
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  placeholder="e.g. John Doe"
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{t.phoneNumber}</label>
                <input 
                  type="tel" 
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all"
                />
              </div>
              <button 
                onClick={handleSaveEmergency}
                disabled={isSaving}
                className="w-full h-14 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSaving ? (
                  <i className="fas fa-circle-notch animate-spin"></i>
                ) : (
                  <i className="fas fa-save"></i>
                )}
                {t.save}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm h-full">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t.activityHistory}</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.date}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.activity}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.bloodGroup}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.facility}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t.components}</th>
                <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">{t.cost}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center">
                    <i className="fas fa-circle-notch animate-spin text-slate-200 text-3xl"></i>
                  </td>
                </tr>
              ) : activities.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                    {t.noActivity}
                  </td>
                </tr>
              ) : (
                activities.map((activity, i) => (
                  <tr key={activity.id || `activity-${i}`} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-900">{new Date(activity.timestamp).toLocaleDateString()}</p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">{new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                        activity.type === 'PURCHASE' ? 'bg-blue-50 text-blue-600' : 
                        activity.type === 'RESERVATION' ? 'bg-emerald-50 text-emerald-600' : 
                        'bg-red-50 text-red-600'
                      }`}>
                        {activity.type}
                      </span>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 bg-red-50 text-red-600 rounded-md flex items-center justify-center text-[10px] font-black">{activity.bloodGroup}</span>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{activity.componentType}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-xs font-bold text-slate-700">{activity.facilityName}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-xs font-black text-slate-900">{activity.units}</p>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <p className="text-xs font-black text-slate-900">₹{activity.cost.toLocaleString()}</p>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</div>
  );
};

export default React.memo(Dashboard);
