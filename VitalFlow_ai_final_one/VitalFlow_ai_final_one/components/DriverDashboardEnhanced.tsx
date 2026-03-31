import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Clock, MapPin, Phone } from 'lucide-react';
import Toast from './Toast';
import { API_ENDPOINTS, apiCall } from '../config';

interface DriverDashboardEnhancedProps {
  user: {
    id: string;
    name: string;
    role?: string;
    city?: string;
  };
  t: any;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  priority: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW';
  is_read: boolean;
  created_at: string;
  blood_request?: {
    id: string;
    status: string;
    units: number;
    item?: {
      blood_group: string;
      facility_name: string;
    };
  };
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

const DriverDashboardEnhanced: React.FC<DriverDashboardEnhancedProps> = ({ user, t }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [urgentAlert, setUrgentAlert] = useState<Notification | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeDeliveries, setActiveDeliveries] = useState<any[]>([]);
  const [submittingRequest, setSubmittingRequest] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [acceptanceStatus, setAcceptanceStatus] = useState<Record<string, 'pending' | 'accepted' | 'error'>>({});

  // Toast management
  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  };

  // Fetch notifications with polling
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const url = `${API_ENDPOINTS.NOTIFICATIONS}?city=${user.city || ''}`;
        const data = await apiCall(url);
        const notificationList = Array.isArray(data) ? data : (data as any).results || [];
        
        setNotifications(notificationList);

        // Find urgent alert
        const urgent = notificationList.find(
          (n: any) => n.priority === 'URGENT' && !n.is_read
        );
        if (urgent) {
          setUrgentAlert(urgent);
        }
      } catch (error) {
        console.error('Failed to fetch notifications:', error);
        addToast('error', 'Failed to fetch notifications');
      }
    };

    // Initial fetch
    fetchNotifications();

    // Poll every 10 seconds
    const interval = setInterval(fetchNotifications, 10000);
    return () => clearInterval(interval);
  }, [user.city]);

  // Fetch active deliveries
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        const url = `${API_ENDPOINTS.BLOOD_REQUESTS}?status=IN_TRANSIT`;
        const data = await apiCall(url);
        setActiveDeliveries(Array.isArray(data) ? data : (data as any).results || []);
      } catch (error) {
        console.error('Failed to fetch deliveries:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveries();
  }, []);

  // Accept request handler
  const handleAcceptRequest = async (requestId: string) => {
    if (!requestId) {
      addToast('error', 'Invalid request ID');
      return;
    }

    setSubmittingRequest(requestId);
    setAcceptanceStatus(prev => ({ ...prev, [requestId]: 'pending' }));

    try {
      const url = `${API_ENDPOINTS.BLOOD_REQUESTS}${requestId}/accept/`;
      await apiCall(url, {
        method: 'POST',
        body: JSON.stringify({
          proof_id: 'DL123456789', // In real app, user would upload proof
        }),
      });

      setAcceptanceStatus(prev => ({ ...prev, [requestId]: 'accepted' }));
      addToast('success', 'Submission Initiated - Your acceptance has been recorded');
      
      // Refresh notifications
      try {
        const notifUrl = `${API_ENDPOINTS.NOTIFICATIONS}?city=${user.city || ''}`;
        const refreshData = await apiCall(notifUrl);
        const notificationList = Array.isArray(refreshData) ? refreshData : (refreshData as any).results || [];
        setNotifications(notificationList);
      } catch (refreshError) {
        console.error('Failed to refresh notifications:', refreshError);
      }

      // Clear urgent alert after 5 seconds
      setTimeout(() => {
        setUrgentAlert(null);
      }, 5000);
    } catch (error: any) {
      setAcceptanceStatus(prev => ({ ...prev, [requestId]: 'error' }));
      const msg = error instanceof Error ? error.message : 'Retrying...';
      addToast('error', `Sync Error: ${msg}`);

      if (error instanceof Error && error.message.includes('Network')) {
        // Auto retry for network issues
        setTimeout(() => {
          handleAcceptRequest(requestId);
        }, 5000);
      } else {
        // Retry after 3 seconds for other errors
        setTimeout(() => {
          handleAcceptRequest(requestId);
        }, 3000);
      }
    } finally {
      setSubmittingRequest(null);
    }
  };

  const stats = [
    { label: 'Available Requests', value: notifications.filter(n => n.priority === 'URGENT').length, icon: AlertCircle, color: 'text-red-600' },
    { label: 'Active Deliveries', value: activeDeliveries.length, icon: MapPin, color: 'text-blue-600' },
    { label: 'Completed Today', value: 3, icon: CheckCircle, color: 'text-emerald-600' },
    { label: 'Response Time', value: '2.5 min', icon: Clock, color: 'text-amber-600' },
  ];

  return (
    <div className="space-y-10 py-10">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast
            key={toast.id}
            type={toast.type}
            message={toast.message}
          />
        ))}
      </AnimatePresence>

      {/* Urgent Alert Banner */}
      <AnimatePresence>
        {urgentAlert && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative"
          >
            <div className="bg-gradient-to-r from-red-600 to-red-500 rounded-[2rem] p-6 text-white shadow-2xl border-2 border-red-400 overflow-hidden"
            >
              {/* Animated background */}
              <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 animate-pulse bg-white"></div>
              </div>

              <div className="relative flex items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity }}
                    className="text-4xl"
                  >
                    🚨
                  </motion.div>
                  <div className="flex-1">
                    <p className="text-sm font-black uppercase tracking-widest mb-1">
                      URGENT ALERT
                    </p>
                    <p className="text-lg font-bold">
                      {urgentAlert.message}
                    </p>
                    {urgentAlert.blood_request && (
                      <p className="text-sm opacity-90 mt-2">
                        {urgentAlert.blood_request.units} units of{' '}
                        {urgentAlert.blood_request.item?.blood_group} needed at{' '}
                        {urgentAlert.blood_request.item?.facility_name}
                      </p>
                    )}
                  </div>
                </div>
                {urgentAlert.blood_request && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAcceptRequest(urgentAlert.blood_request!.id)}
                    disabled={submittingRequest === urgentAlert.blood_request!.id}
                    className={`px-6 py-3 font-black rounded-xl uppercase tracking-widest text-sm whitespace-nowrap transition-all ${
                      acceptanceStatus[urgentAlert.blood_request.id] === 'accepted'
                        ? 'bg-emerald-500 text-white'
                        : acceptanceStatus[urgentAlert.blood_request.id] === 'error'
                        ? 'bg-orange-500 text-white'
                        : 'bg-white text-red-600 hover:bg-red-50'
                    }`}
                  >
                    {submittingRequest === urgentAlert.blood_request.id ? (
                      <>
                        <i className="fas fa-spinner animate-spin mr-2"></i>
                        Submitting...
                      </>
                    ) : acceptanceStatus[urgentAlert.blood_request.id] === 'accepted' ? (
                      <>
                        <i className="fas fa-check mr-2"></i>
                        Accepted
                      </>
                    ) : (
                      <>
                        <i className="fas fa-hand-holding-medical mr-2"></i>
                        Accept Request
                      </>
                    )}
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
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
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              {user.role === 'DRIVER' ? 'Driver' : 'Donor'} Dashboard
            </h1>
            <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">
              {user.name} • {user.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-emerald-50 border border-emerald-100 px-4 py-2 rounded-xl flex items-center gap-2">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
              Online & Active
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-white border border-slate-200 p-6 rounded-[2rem] shadow-sm"
          >
            <div className={`w-12 h-12 ${stat.color === 'text-red-600' ? 'bg-red-50' : stat.color === 'text-blue-600' ? 'bg-blue-50' : stat.color === 'text-emerald-600' ? 'bg-emerald-50' : 'bg-amber-50'} ${stat.color} rounded-2xl flex items-center justify-center mb-4 text-xl`}>
              <stat.icon className="w-6 h-6" />
            </div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              {stat.label}
            </p>
            <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Available Requests
          </h2>
          <span className="bg-red-100 text-red-700 font-black text-xs px-3 py-1 rounded-full uppercase tracking-widest">
            {notifications.filter(n => n.priority === 'URGENT').length} Urgent
          </span>
        </div>
        <div className="p-8 space-y-6">
          {isLoading ? (
            <div className="text-center py-20">
              <i className="fas fa-circle-notch animate-spin text-slate-200 text-3xl"></i>
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
              No available requests in your area
            </div>
          ) : (
            notifications
              .filter(n => n.blood_request)
              .map(notification => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`border-2 rounded-3xl p-6 space-y-4 ${
                    notification.priority === 'URGENT'
                      ? 'bg-red-50 border-red-200'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span
                          className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                            notification.priority === 'URGENT'
                              ? 'bg-red-200 text-red-700'
                              : 'bg-slate-200 text-slate-700'
                          }`}
                        >
                          {notification.priority}
                        </span>
                        {acceptanceStatus[notification.blood_request!.id] === 'accepted' && (
                          <span className="text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest bg-emerald-200 text-emerald-700">
                            ✓ Accepted
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-black text-slate-900 mb-2">
                        {notification.blood_request?.item?.blood_group} Blood Needed
                      </h3>
                      <p className="text-slate-700 mb-3">{notification.message}</p>
                      <div className="flex flex-wrap gap-6 text-sm">
                        <div className="flex items-center gap-2 text-slate-600">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-semibold">
                            {notification.blood_request?.units} units
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-slate-600">
                          <MapPin className="w-4 h-4" />
                          <span className="font-semibold">
                            {notification.blood_request?.item?.facility_name}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {acceptanceStatus[notification.blood_request!.id] === 'accepted' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="bg-emerald-100 border border-emerald-300 rounded-2xl p-4"
                    >
                      <p className="text-emerald-700 font-semibold text-sm flex items-center gap-2">
                        <CheckCircle className="w-5 h-5" />
                        Submission Initiated - Task In Progress
                      </p>
                    </motion.div>
                  )}

                  {acceptanceStatus[notification.blood_request!.id] !== 'accepted' && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAcceptRequest(notification.blood_request!.id)}
                      disabled={submittingRequest === notification.blood_request!.id}
                      className={`w-full font-black py-3 rounded-2xl uppercase tracking-widest transition-all ${
                        acceptanceStatus[notification.blood_request!.id] === 'error'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-700 hover:to-red-600 disabled:opacity-50'
                      }`}
                    >
                      {submittingRequest === notification.blood_request!.id ? (
                        <>
                          <i className="fas fa-spinner animate-spin mr-2"></i>
                          Submitting...
                        </>
                      ) : acceptanceStatus[notification.blood_request!.id] === 'error' ? (
                        <>
                          <i className="fas fa-exclamation-triangle mr-2"></i>
                          Try Again
                        </>
                      ) : (
                        <>
                          <i className="fas fa-hand-holding-medical mr-2"></i>
                          Accept Request
                        </>
                      )}
                    </motion.button>
                  )}
                </motion.div>
              ))
          )}
        </div>
      </div>

      {/* Active Deliveries */}
      <div className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm">
        <div className="p-8 border-b border-slate-100">
          <h2 className="text-xl font-black text-slate-900 tracking-tight uppercase">
            Active Deliveries
          </h2>
        </div>
        <div className="p-8 space-y-6">
          {activeDeliveries.length === 0 ? (
            <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest text-xs">
              No active deliveries
            </div>
          ) : (
            activeDeliveries.map(delivery => (
              <div key={delivery.id} className="bg-slate-50 border border-slate-100 rounded-3xl p-6">
                <h3 className="font-bold text-slate-900 mb-4">{delivery.request_id}</h3>
                <p className="text-slate-600 text-sm">Status: {delivery.status}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default DriverDashboardEnhanced;
