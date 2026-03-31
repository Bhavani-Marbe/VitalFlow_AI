import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, BloodRequest, BloodRequestStatus } from '../types';
import { Truck, MapPin, Navigation, CheckCircle, Clock, Activity, Zap } from 'lucide-react';
import MapView from './MapView';
import { API_ENDPOINTS, apiCall } from '../config';

interface DriverDashboardProps {
  user: User;
  t: any;
}

const DriverDashboard: React.FC<DriverDashboardProps> = ({ user, t }) => {
  const [activeDeliveries, setActiveDeliveries] = useState<BloodRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [courierPos, setCourierPos] = useState({ lat: 19.0760, lng: 72.8777 });
  const [updatingDelivery, setUpdatingDelivery] = useState<string | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<BloodRequest | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return (R * c).toFixed(2);
  };

  const handleShowMap = (delivery: BloodRequest) => {
    setSelectedDelivery(delivery);
    setShowMapModal(true);
  };

  const handleUpdateStatus = async (deliveryId: string) => {
    setUpdatingDelivery(deliveryId);
    try {
      const url = `${API_ENDPOINTS.BLOOD_REQUESTS}/${deliveryId}`;
      // The backend currently supports a simple update route for demo purposes.
      await apiCall(url, {
        method: 'PATCH',
        body: JSON.stringify({
          status: BloodRequestStatus.Reached
        })
      });

      setActiveDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      alert('Delivery marked as completed!');
    } catch (error) {
      console.error('Failed to update delivery status:', error);
      // Fallback local status update when backend does not support persistence.
      setActiveDeliveries(prev => prev.filter(d => d.id !== deliveryId));
      alert('Delivery marked as completed (local fallback).');
    } finally {
      setUpdatingDelivery(null);
    }
  };

  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        // Simulate fetching driver specific deliveries
        const data = await apiCall(API_ENDPOINTS.BLOOD_REQUESTS);
        const deliveryList = Array.isArray(data) ? data : (data as any).results || [];
        // Filter for active deliveries (simulated)
        const active = deliveryList.filter((r: BloodRequest) => r.status === BloodRequestStatus.InTransit);
        setActiveDeliveries(active);
      } catch (error) {
        console.error("Failed to fetch driver deliveries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Simulate courier movement
  useEffect(() => {
    const interval = setInterval(() => {
      setCourierPos(prev => ({
        lat: prev.lat + (Math.random() - 0.5) * 0.0005,
        lng: prev.lng + (Math.random() - 0.5) * 0.0005
      }));
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { label: t.activeDeliveries, value: activeDeliveries.length, icon: Truck, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: t.completedDeliveries, value: 12, icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Distance', value: '142 KM', icon: Navigation, color: 'text-amber-600', bg: 'bg-amber-50' },
    { label: 'Avg Time', value: '24 mins', icon: Clock, color: 'text-red-600', bg: 'bg-red-50' },
  ];

  return (
    <div className="space-y-10 py-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 rounded-[2rem] overflow-hidden border-4 border-white shadow-xl">
            <img 
              src={`https://picsum.photos/seed/${user.id}/200/200`} 
              alt={user.name} 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{t.driverDashboard}</h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">{user.name} • {t.accountId}: {user.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{t.vehicleStatus}: Online</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
            <div className="p-8 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">{t.activeDeliveries}</h2>
            </div>
            <div className="p-8 space-y-6">
              {isLoading ? (
                <div className="text-center py-20">
                  <i className="fas fa-circle-notch animate-spin text-slate-200 text-3xl"></i>
                </div>
              ) : activeDeliveries.length === 0 ? (
                <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
                  No active deliveries
                </div>
              ) : (
                activeDeliveries.map((delivery) => (
                  <div key={delivery.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-red-600 shadow-sm">
                          <Truck className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="text-sm font-black text-slate-900 uppercase tracking-tight">#{delivery.id.slice(0, 8)}</p>
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{delivery.bloodGroup} {delivery.componentType}</p>
                        </div>
                      </div>
                      <span className="bg-blue-50 text-blue-600 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest border border-blue-100">
                        {delivery.status}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200/50">
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <MapPin className="w-3 h-3" /> Pickup
                        </p>
                        <p className="text-xs font-bold text-slate-900">{delivery.facilityName}</p>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                          <Navigation className="w-3 h-3" /> Destination
                        </p>
                        <p className="text-xs font-bold text-slate-900">{delivery.deliveryAddress || 'Hospital Address'}</p>
                      </div>
                    </div>

                    <div className="flex gap-4">
                      <button 
                        onClick={() => handleShowMap(delivery)}
                        className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4" /> View Location
                      </button>
                      <button 
                        onClick={() => handleUpdateStatus(delivery.id)}
                        disabled={updatingDelivery === delivery.id}
                        className="flex-1 py-4 bg-red-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {updatingDelivery === delivery.id ? (
                          <i className="fas fa-circle-notch animate-spin"></i>
                        ) : (
                          <CheckCircle className="w-4 h-4" />
                        )}
                        {updatingDelivery === delivery.id ? 'Updating...' : 'Update Status'}
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                <Navigation className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{t.routeOptimization}</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">AI Assisted Routing</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Traffic Status</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase">Clear</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase">Optimal Route</span>
                  <span className="text-[10px] font-black text-white uppercase">Active</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-4 shadow-sm overflow-hidden h-[400px]">
            <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight mb-4 px-4">Live Tracking</h3>
            <div className="w-full h-full rounded-3xl overflow-hidden relative">
              <MapView 
                items={[]} 
                t={t} 
                onReserve={() => {}} 
                onCall={() => {}} 
                activeRoute={{
                  start: { lat: 19.0760, lng: 72.8777 },
                  end: { lat: 19.1000, lng: 72.9000 },
                  courierPos: courierPos,
                  type: 'truck'
                }}
              />
              <div className="absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[8px] font-black text-white uppercase tracking-widest">GPS: Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Location Map Modal */}
      <AnimatePresence>
        {showMapModal && selectedDelivery && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[3rem] w-full max-w-2xl max-h-[90vh] overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-red-600 to-red-500 p-8 text-white flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black uppercase tracking-tight">Delivery Location</h2>
                  <p className="text-white/80 text-sm mt-2">Delivery ID: {selectedDelivery.id.slice(0, 12)}</p>
                </div>
                <button
                  onClick={() => setShowMapModal(false)}
                  className="w-12 h-12 bg-white/20 hover:bg-white/30 rounded-2xl flex items-center justify-center transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="p-8 space-y-6 max-h-[calc(90vh-200px)] overflow-y-auto">
                {/* Map Section */}
                <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl overflow-hidden h-80 flex items-center justify-center border-2 border-blue-100">
                  <MapView
                    items={[]}
                    t={t}
                    onReserve={() => {}}
                    onCall={() => {}}
                    activeRoute={{
                      start: { lat: courierPos.lat, lng: courierPos.lng },
                      end: { lat: 19.1100, lng: 72.9200 },
                      courierPos: courierPos,
                      type: 'truck'
                    }}
                  />
                </div>

                {/* Location Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Pickup Details */}
                  <div className="bg-blue-50 rounded-[2rem] p-6 border border-blue-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center font-black">
                        📍
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase">Pickup Location</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Facility</p>
                        <p className="text-slate-900 font-semibold">{selectedDelivery.facilityName || 'Blood Bank'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Coordinates</p>
                        <p className="text-slate-900 font-mono text-xs">{courierPos.lat.toFixed(4)}, {courierPos.lng.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Details */}
                  <div className="bg-emerald-50 rounded-[2rem] p-6 border border-emerald-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-emerald-500 text-white rounded-full flex items-center justify-center font-black">
                        🏥
                      </div>
                      <h3 className="text-lg font-black text-slate-900 uppercase">Destination</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Hospital</p>
                        <p className="text-slate-900 font-semibold">{selectedDelivery.deliveryAddress || 'Emergency Ward'}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase mb-1">Coordinates</p>
                        <p className="text-slate-900 font-mono text-xs">19.1100, 72.9200</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Distance and Duration */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-amber-50 rounded-[2rem] p-6 border border-amber-100 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Distance</p>
                    <p className="text-4xl font-black text-amber-600">
                      {calculateDistance(courierPos.lat, courierPos.lng, 19.1100, 72.9200)} km
                    </p>
                  </div>
                  <div className="bg-cyan-50 rounded-[2rem] p-6 border border-cyan-100 text-center">
                    <p className="text-xs font-bold text-slate-400 uppercase mb-2">Est. Duration</p>
                    <p className="text-4xl font-black text-cyan-600">
                      {Math.ceil(parseFloat(calculateDistance(courierPos.lat, courierPos.lng, 19.1100, 72.9200)) / 50 * 60)} min
                    </p>
                  </div>
                </div>

                {/* Blood Details */}
                <div className="bg-red-50 rounded-[2rem] p-6 border border-red-100">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-red-500 text-white rounded-full flex items-center justify-center font-black">
                      🩸
                    </div>
                    <h3 className="text-lg font-black text-slate-900 uppercase">Blood Details</h3>
                  </div>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-2xl font-black text-red-600 mb-1">{selectedDelivery.bloodGroup}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase">Blood Group</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-red-600 mb-1">{selectedDelivery.units}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase">Units</p>
                    </div>
                    <div>
                      <p className="text-2xl font-black text-red-600 mb-1">{selectedDelivery.componentType}</p>
                      <p className="text-xs font-bold text-slate-400 uppercase">Component</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t border-slate-200 p-8 bg-slate-50 flex gap-4">
                <button
                  onClick={() => setShowMapModal(false)}
                  className="flex-1 py-4 bg-slate-200 text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-300 transition-all"
                >
                  Close
                </button>
                <button
                  className="flex-1 py-4 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:from-red-700 hover:to-red-600 transition-all flex items-center justify-center gap-2"
                >
                  <Navigation className="w-4 h-4" /> Start Navigation
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};


export default DriverDashboard;
