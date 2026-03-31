import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Clock, CheckCircle, Truck, MapPin, Phone, User, AlertCircle } from 'lucide-react';
import Toast from './Toast';
import { API_ENDPOINTS, apiCall } from '../config';

interface BloodRequestStatus {
  id: string;
  request_id: string;
  status: 'PENDING' | 'SENT' | 'INITIATED' | 'IN_TRANSIT' | 'REACHED' | 'COMPLETED';
  units: number;
  blood_group: string;
  facility_name: string;
  accepted_by_name?: string;
  accepted_by_phone?: string;
  driver_proof_details?: string;
  timestamp: string;
  accepted_at?: string;
}

interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

interface RequesterStatusViewProps {
  userCity: string;
  t?: any;
}

const RequesterStatusView: React.FC<RequesterStatusViewProps> = ({ userCity, t = {} }) => {
  const [requests, setRequests] = useState<BloodRequestStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BloodRequestStatus | null>(null);

  const addToast = (type: 'success' | 'error' | 'info', message: string) => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch requests with polling
  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const data = await apiCall(API_ENDPOINTS.BLOOD_REQUESTS);
        const requestsList = Array.isArray(data) ? data : (data as any).results || [];
        setRequests(requestsList);
      } catch (error) {
        console.error('Failed to fetch requests:', error);
        addToast('error', 'Failed to fetch requests');
      } finally {
        setIsLoading(false);
      }
    };

    // Initial fetch
    fetchRequests();

    // Poll every 5 seconds for real-time updates
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, []);

  const getStatusStageIndex = (status: string) => {
    const stages = ['PENDING', 'SENT', 'INITIATED', 'IN_TRANSIT', 'REACHED', 'COMPLETED'];
    return stages.indexOf(status);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'SENT':
        return 'text-amber-600';
      case 'INITIATED':
        return 'text-blue-600';
      case 'IN_TRANSIT':
        return 'text-blue-600';
      case 'REACHED':
      case 'COMPLETED':
        return 'text-emerald-600';
      default:
        return 'text-slate-600';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'PENDING':
      case 'SENT':
        return 'bg-amber-50';
      case 'INITIATED':
        return 'bg-blue-50';
      case 'IN_TRANSIT':
        return 'bg-blue-50';
      case 'REACHED':
      case 'COMPLETED':
        return 'bg-emerald-50';
      default:
        return 'bg-slate-50';
    }
  };

  const pendingRequests = requests.filter(r => r.status === 'PENDING');
  const activeRequests = requests.filter(r => ['SENT', 'INITIATED', 'IN_TRANSIT'].includes(r.status));
  const completedRequests = requests.filter(r => ['REACHED', 'COMPLETED'].includes(r.status));

  return (
    <div className="space-y-10 py-10">
      {/* Toast Notifications */}
      <AnimatePresence>
        {toasts.map(toast => (
          <Toast key={toast.id} type={toast.type} message={toast.message} />
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
            My Blood Requests
          </h1>
          <p className="text-slate-400 text-sm font-bold uppercase tracking-widest mt-2">
            Track and manage all your blood requests
          </p>
        </div>
      </div>

      {/* Tabs/Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 cursor-pointer"
          onClick={() => setSelectedRequest(pendingRequests[0] || null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest">
                Pending Requests
              </p>
              <p className="text-3xl font-black text-amber-900 mt-1">{pendingRequests.length}</p>
            </div>
            <Clock className="w-8 h-8 text-amber-600 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6 cursor-pointer"
          onClick={() => setSelectedRequest(activeRequests[0] || null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                In Progress
              </p>
              <p className="text-3xl font-black text-blue-900 mt-1">{activeRequests.length}</p>
            </div>
            <Truck className="w-8 h-8 text-blue-600 opacity-50" />
          </div>
        </motion.div>

        <motion.div
          whileHover={{ scale: 1.02 }}
          className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 cursor-pointer"
          onClick={() => setSelectedRequest(completedRequests[0] || null)}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                Completed
              </p>
              <p className="text-3xl font-black text-emerald-900 mt-1">{completedRequests.length}</p>
            </div>
            <CheckCircle className="w-8 h-8 text-emerald-600 opacity-50" />
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <i className="fas fa-circle-notch animate-spin text-slate-200 text-4xl"></i>
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-[2.5rem] p-20 text-center">
          <AlertCircle className="w-16 h-16 text-slate-300 mx-auto mb-6" />
          <p className="text-slate-600 text-lg font-bold">No requests found</p>
          <p className="text-slate-400 text-sm mt-2">When you make a blood request, it will appear here</p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Pending Requests */}
          {pendingRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm"
            >
              <div className="p-8 border-b border-slate-100 bg-amber-50">
                <h2 className="text-xl font-black text-amber-900 tracking-tight uppercase">
                  Trying to Find Providers
                </h2>
                <p className="text-amber-700 text-sm mt-2">Waiting for drivers/donors to accept</p>
              </div>
              <div className="p-8 space-y-6">
                {pendingRequests.map(request => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-2 border-amber-200 rounded-2xl p-6 bg-amber-50 relative overflow-hidden"
                  >
                    {/* Animated pulse background */}
                    <div className="absolute inset-0 opacity-5">
                      <motion.div
                        animate={{ scale: [1, 1.5, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-amber-500 rounded-full"
                      ></motion.div>
                    </div>

                    <div className="relative">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">
                            Request ID: {request.request_id}
                          </p>
                          <h3 className="text-2xl font-black text-amber-900">
                            {request.blood_group} Blood
                          </h3>
                        </div>
                        <span className="text-xs font-black bg-amber-200 text-amber-700 px-3 py-1 rounded-full uppercase tracking-widest">
                          Searching...
                        </span>
                      </div>

                      <motion.div
                        animate={{ opacity: [0.6, 1, 0.6] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="flex items-center gap-2 text-amber-700 font-semibold mb-4"
                      >
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <AlertCircle className="w-5 h-5" />
                        </motion.div>
                        Searching for nearby Drivers/Donors...
                      </motion.div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-amber-600 text-[10px] font-bold uppercase">Units Needed</p>
                          <p className="text-amber-900 font-bold">{request.units} units</p>
                        </div>
                        <div>
                          <p className="text-amber-600 text-[10px] font-bold uppercase">Facility</p>
                          <p className="text-amber-900 font-bold">{request.facility_name}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Active Requests */}
          {activeRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm"
            >
              <div className="p-8 border-b border-slate-100 bg-blue-50">
                <h2 className="text-xl font-black text-blue-900 tracking-tight uppercase">
                  {activeRequests.length > 0 && activeRequests[0].status === 'INITIATED'
                    ? 'Request Accepted'
                    : 'In Transit'}
                </h2>
              </div>
              <div className="p-8 space-y-6">
                {activeRequests.map(request => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-2 border-blue-200 rounded-2xl p-6 bg-blue-50"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">
                          {request.request_id}
                        </p>
                        <h3 className="text-2xl font-black text-blue-900">
                          {request.blood_group} Blood
                        </h3>
                      </div>
                      <span className={`text-xs font-black px-3 py-1 rounded-full uppercase tracking-widest ${
                        request.status === 'INITIATED'
                          ? 'bg-emerald-200 text-emerald-700'
                          : 'bg-blue-200 text-blue-700'
                      }`}>
                        {request.status === 'INITIATED' ? '✓ Accepted' : 'In Transit'}
                      </span>
                    </div>

                    {/* If accepted, show driver details */}
                    {request.status === 'INITIATED' && request.accepted_by_name && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="bg-emerald-100 border-2 border-emerald-300 rounded-2xl p-4 mb-4"
                      >
                        <p className="text-emerald-700 font-bold text-sm mb-3 flex items-center gap-2">
                          <CheckCircle className="w-5 h-5" />
                          Provider Accepted Your Request
                        </p>
                        <div className="grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase">Name</p>
                            <p className="text-emerald-900 font-bold">{request.accepted_by_name}</p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase">Contact</p>
                            <p className="text-emerald-900 font-bold flex items-center gap-1">
                              <Phone className="w-4 h-4" />
                              {request.accepted_by_phone}
                            </p>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase">ID Proof</p>
                            <p className="text-emerald-900 font-bold">{request.driver_proof_details}</p>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    {/* Status Progress */}
                    <div className="space-y-3">
                      <div className="flex items-center gap-4">
                        <div
                          className={`flex-1 h-1 rounded-full ${
                            ['SENT', 'INITIATED', 'IN_TRANSIT', 'REACHED', 'COMPLETED'].indexOf(request.status) >= 0
                              ? 'bg-blue-500'
                              : 'bg-slate-200'
                          }`}
                        ></div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-blue-600 text-[10px] font-bold uppercase">Units</p>
                          <p className="text-blue-900 font-bold">{request.units} units</p>
                        </div>
                        <div>
                          <p className="text-blue-600 text-[10px] font-bold uppercase">Status</p>
                          <p className="text-blue-900 font-bold capitalize">{request.status}</p>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Completed Requests */}
          {completedRequests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white border border-slate-200 rounded-[2.5rem] overflow-hidden shadow-sm"
            >
              <div className="p-8 border-b border-slate-100 bg-emerald-50">
                <h2 className="text-xl font-black text-emerald-900 tracking-tight uppercase">
                  Completed Deliveries
                </h2>
              </div>
              <div className="p-8 space-y-4">
                {completedRequests.map(request => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-emerald-200 rounded-2xl p-4 bg-emerald-50"
                  >
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-6 h-6 text-emerald-600" />
                        <div>
                          <p className="font-bold text-slate-900">{request.blood_group} - {request.units} units</p>
                          <p className="text-sm text-slate-600">{request.request_id}</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-100 px-3 py-1 rounded-full">
                        Delivered
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
};

export default RequesterStatusView;
