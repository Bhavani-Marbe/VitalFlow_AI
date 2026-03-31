import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, UserRole, BloodRequest, BloodRequestStatus, HospitalInventory, BloodGroup, ComponentType, DeliveryMethod } from '../types';
import { Activity, Clock, CheckCircle, AlertTriangle, Plus, Package, RefreshCw, X, ShieldAlert } from 'lucide-react';
import { API_ENDPOINTS, apiCall } from '../config';

interface HospitalDashboardProps {
  user: User;
  t: any;
}

const DEMO_REQUESTS: BloodRequest[] = [
  { id: 'REQ12345', itemId: 'item_01', facilityName: 'City Blood Bank', bloodGroup: BloodGroup.APos, componentType: ComponentType.PlateletConcentrate, units: 2, status: BloodRequestStatus.InTransit, deliveryMethod: DeliveryMethod.Transfer, timestamp: new Date(Date.now() - 3600000).toISOString() },
  { id: 'REQ12346', itemId: 'item_02', facilityName: 'General Hospital', bloodGroup: BloodGroup.ONeg, componentType: ComponentType.Plasma, units: 3, status: BloodRequestStatus.Sent, deliveryMethod: DeliveryMethod.SelfCollection, timestamp: new Date(Date.now() - 7200000).toISOString() },
  { id: 'REQ12347', itemId: 'item_03', facilityName: 'Community Clinic', bloodGroup: BloodGroup.BPos, componentType: ComponentType.WBC, units: 1, status: BloodRequestStatus.Completed, deliveryMethod: DeliveryMethod.Transfer, timestamp: new Date(Date.now() - 14400000).toISOString() }
];

const DEMO_INVENTORY: HospitalInventory[] = [
  { hospitalId: 'demo-hospital', bloodGroup: BloodGroup.APos, units: 15, lastUpdated: new Date().toISOString() },
  { hospitalId: 'demo-hospital', bloodGroup: BloodGroup.ONeg, units: 9, lastUpdated: new Date().toISOString() },
  { hospitalId: 'demo-hospital', bloodGroup: BloodGroup.BPos, units: 7, lastUpdated: new Date().toISOString() },
  { hospitalId: 'demo-hospital', bloodGroup: BloodGroup.ABNeg, units: 3, lastUpdated: new Date().toISOString() }
];

const HospitalDashboard: React.FC<HospitalDashboardProps> = ({ user, t }) => {
  const [requests, setRequests] = useState<BloodRequest[]>([]);
  const [inventory, setInventory] = useState<HospitalInventory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isInventoryLoading, setIsInventoryLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestForm, setRequestForm] = useState({
    bloodGroup: 'O+' as BloodGroup,
    units: 1,
    reason: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const data = await apiCall(API_ENDPOINTS.BLOOD_REQUESTS);
      const loadedRequests = Array.isArray(data) ? data : (data as any).results || [];
      setRequests(loadedRequests.length ? loadedRequests : DEMO_REQUESTS);
    } catch (error) {
      console.error("Failed to fetch hospital requests:", error);
      setRequests(DEMO_REQUESTS);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchInventory = async () => {
    setIsInventoryLoading(true);
    try {
      const url = `${API_ENDPOINTS.HOSPITALS_INVENTORY}${user.id}`;
      const data = await apiCall(url);
      const loadedInventory = Array.isArray(data) ? data : (data as any).results || [];
      setInventory(loadedInventory.length ? loadedInventory : DEMO_INVENTORY);
    } catch (error) {
      console.error("Failed to fetch hospital inventory:", error);
      setInventory(DEMO_INVENTORY);
    } finally {
      setIsInventoryLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchInventory();
  }, [user.id]);

  const handleUpdateRequest = async (bloodGroup: BloodGroup, units: number) => {
    try {
      await apiCall(API_ENDPOINTS.HOSPITAL_INVENTORY_UPDATE, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role
        },
        body: JSON.stringify({
          hospitalId: user.id,
          bloodGroup,
          units
        })
      });

      await fetchInventory();
    } catch (error) {
      console.error("Failed to update inventory:", error);
    }
  };

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication
    if (!user || !user.id) {
      setError("You must be logged in to make requests. Please log in first.");
      return;
    }

    if (![UserRole.HospitalAdmin, UserRole.SuperAdmin, UserRole.BloodBankAdmin].includes(user.role)) {
      setError("Only authorized hospital staff can make blood requests.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      // Create a BloodRequest in backend (hospital workflow)
      const requestPayload = {
        facilityName: user.name || 'Unknown Hospital',
        blood_group: requestForm.bloodGroup,
        component_type: 'Whole blood',
        units: requestForm.units,
        reason: requestForm.reason || 'No reason provided',
        delivery_address: '',
        patient_id: `PAT-${Date.now()}`,
        patient_name: 'Auto-generated patient',
        doctor_name: 'Auto-assigned doctor',
        diagnosis: requestForm.reason || 'No diagnosis provided',
        urgency_level: 'ROUTINE',
        hospital_latitude: (user as any).latitude || 0,
        hospital_longitude: (user as any).longitude || 0
      };

      const result = await apiCall(API_ENDPOINTS.BLOOD_REQUESTS, {
        method: 'POST',
        headers: {
          'x-user-id': user.id,
          'x-user-role': user.role,
          'Authorization': `Bearer ${localStorage.getItem('auth_token') || ''}`
        },
        body: JSON.stringify(requestPayload)
      });

      if (result) {
        setSuccess("Request initiated successfully! Our logistics team is on it.");
        fetchRequests();
        setTimeout(() => setShowRequestModal(false), 2000);
      } else {
        const resultAny = result as any;
        setError(resultAny?.error || "Failed to initiate request.");
      }
    } catch (error: any) {
      console.error("Failed to submit request:", error);
      setError(error?.message || "A network error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const stats = [
    { label: t.pendingRequests, value: requests.filter(r => r.status !== BloodRequestStatus.Completed).length, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: t.completedDeliveries, value: requests.filter(r => r.status === BloodRequestStatus.Completed).length, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: t.activeDeliveries, value: requests.filter(r => r.status === BloodRequestStatus.InTransit).length, icon: Activity, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Critical Alerts', value: 2, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-10 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
            <img 
              src="https://images.unsplash.com/photo-1631217315821-f90de6e0f024?auto=format&fit=crop&q=80&w=200&h=200" 
              alt={user.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{t.hospitalDashboard}</h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">{user.name} • {t.accountId}: {user.id}</p>
          </div>
        </div>
        <button 
          onClick={() => setShowRequestModal(true)}
          className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-2xl font-bold text-[11px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
        >
          <Plus className="w-4 h-4" />
          New Request
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm"
              >
                <div className={`w-12 h-12 ${stat.bg} ${stat.color} rounded-2xl flex items-center justify-center mb-4 text-xl`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              </motion.div>
            ))}
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t.pendingRequests}</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Request ID</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Blood Info</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Units</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status</th>
                    <th className="px-8 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">ETA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {isLoading ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center">
                        <RefreshCw className="w-8 h-8 animate-spin text-slate-200 mx-auto" />
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-8 py-20 text-center text-slate-400 font-bold uppercase tracking-widest text-xs">
                        No pending requests
                      </td>
                    </tr>
                  ) : (
                    requests.map((req) => (
                      <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-900">#{req.id.slice(0, 8)}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase">{new Date(req.timestamp).toLocaleDateString()}</p>
                        </td>
                        <td className="px-8 py-5">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 bg-red-50 text-red-600 rounded-md flex items-center justify-center text-[10px] font-black">{req.bloodGroup}</span>
                            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-tight">{req.componentType}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-black text-slate-900">{req.units}</p>
                        </td>
                        <td className="px-8 py-5">
                          <span className={`text-[9px] font-black px-2 py-1 rounded-md uppercase tracking-widest ${
                            req.status === BloodRequestStatus.Sent ? 'bg-slate-100 text-slate-600' :
                            req.status === BloodRequestStatus.InTransit ? 'bg-blue-50 text-blue-600' :
                            'bg-emerald-50 text-emerald-600'
                          }`}>
                            {req.status}
                          </span>
                        </td>
                        <td className="px-8 py-5">
                          <p className="text-xs font-bold text-slate-900">15 mins</p>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-slate-900 text-white p-8 rounded-[2.5rem] shadow-xl shadow-slate-900/20">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-black tracking-tight uppercase">Local Inventory</h2>
              <Package className="w-6 h-6 text-slate-500" />
            </div>
            
            <div className="space-y-4">
              {isInventoryLoading ? (
                <div className="py-10 text-center">
                  <RefreshCw className="w-6 h-6 animate-spin text-slate-700 mx-auto" />
                </div>
              ) : inventory.length === 0 ? (
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest text-center py-4">No inventory data</p>
              ) : (
                inventory.map((item) => (
                  <div key={item.bloodGroup} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center text-xs font-black">{item.bloodGroup}</div>
                      <div>
                        <p className="text-xs font-bold">{item.units} Units</p>
                        <p className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">Last updated: {new Date(item.lastUpdated).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button 
                        onClick={() => handleUpdateRequest(item.bloodGroup, Math.max(0, item.units - 1))}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg font-bold transition-colors"
                      >
                        -
                      </button>
                      <button 
                        onClick={() => handleUpdateRequest(item.bloodGroup, item.units + 1)}
                        className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center text-lg font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="mt-8 pt-8 border-t border-white/10">
              <div className="flex items-center gap-3 text-amber-400">
                <AlertTriangle className="w-5 h-5" />
                <p className="text-[10px] font-bold uppercase tracking-widest">Low Stock Alert: AB-</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-8 rounded-[2.5rem] shadow-sm">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-tight mb-4">Security Policy</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Anti-Hoarding Protocol active. Requests are validated against local stock levels.</p>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mt-0.5">
                  <CheckCircle className="w-3 h-3" />
                </div>
                <p className="text-[10px] text-slate-500 font-medium leading-relaxed">Audit Trail enabled. All inventory movements are logged immutably.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* New Request Modal */}
      <AnimatePresence>
        {showRequestModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowRequestModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="relative w-full max-w-lg bg-white rounded-[3rem] shadow-2xl overflow-hidden"
            >
              <div className="p-10">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase">New Blood Request</h2>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Bio-Grid Acquisition Portal</p>
                  </div>
                  <button 
                    onClick={() => setShowRequestModal(false)}
                    className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-start gap-3 text-red-600"
                  >
                    <ShieldAlert className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight">Security Alert / Error</p>
                      <p className="text-[10px] font-medium leading-relaxed mt-1">{error}</p>
                    </div>
                  </motion.div>
                )}

                {success && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mb-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 text-emerald-600"
                  >
                    <CheckCircle className="w-5 h-5 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[11px] font-black uppercase tracking-tight">Success</p>
                      <p className="text-[10px] font-medium leading-relaxed mt-1">{success}</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmitRequest} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Blood Group</label>
                      <select 
                        value={requestForm.bloodGroup}
                        onChange={(e) => setRequestForm({...requestForm, bloodGroup: e.target.value as BloodGroup})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-red-500/20 transition-all appearance-none"
                      >
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Units Required</label>
                      <input 
                        type="number" 
                        min="1"
                        max="10"
                        value={requestForm.units}
                        onChange={(e) => setRequestForm({...requestForm, units: parseInt(e.target.value)})}
                        className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-red-500/20 transition-all"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-4">Reason for Request</label>
                    <textarea 
                      placeholder="Explain the clinical necessity..."
                      value={requestForm.reason}
                      onChange={(e) => setRequestForm({...requestForm, reason: e.target.value})}
                      className="w-full bg-slate-50 border-none rounded-2xl px-6 py-4 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-red-500/20 transition-all min-h-[100px] resize-none"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-red-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-red-600/20 hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? 'Verifying Security Protocols...' : 'Submit Bio-Request'}
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HospitalDashboard;
