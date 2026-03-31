import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  CheckCircle2, 
  Clock, 
  Truck, 
  Hospital, 
  MapPin, 
  X,
  PackageCheck,
  ArrowRight,
  Navigation,
  Zap
} from 'lucide-react';
import { BloodRequestStatus, DeliveryMethod } from '../types';
import MapView from './MapView';

interface BloodRequestTrackerProps {
  status: BloodRequestStatus;
  deliveryMethod: DeliveryMethod;
  deliveryAddress?: string;
  facilityName: string;
  onClose: () => void;
  t: any;
}

export const BloodRequestTracker: React.FC<BloodRequestTrackerProps> = ({
  status,
  deliveryMethod,
  deliveryAddress,
  facilityName,
  onClose,
  t
}) => {
  const [showLiveMap, setShowLiveMap] = useState(false);
  const [courierPos, setCourierPos] = useState({ lat: 19.0760, lng: 72.8777 });

  // Simulate courier movement
  useEffect(() => {
    if (status === BloodRequestStatus.InTransit) {
      const interval = setInterval(() => {
        setCourierPos(prev => ({
          lat: prev.lat + (Math.random() - 0.5) * 0.001,
          lng: prev.lng + (Math.random() - 0.5) * 0.001
        }));
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [status]);

  const steps = [
    { 
      id: BloodRequestStatus.Sent, 
      label: 'Request Sent', 
      icon: Clock,
      description: 'Waiting for hospital confirmation'
    },
    { 
      id: BloodRequestStatus.Initiated, 
      label: 'Process Initiated', 
      icon: PackageCheck,
      description: 'Blood units are being prepared'
    },
    { 
      id: BloodRequestStatus.InTransit, 
      label: deliveryMethod === DeliveryMethod.Transfer ? 'In Transit' : 'Ready for Pickup', 
      icon: deliveryMethod === DeliveryMethod.Transfer ? Truck : MapPin,
      description: deliveryMethod === DeliveryMethod.Transfer 
        ? 'Courier is on the way' 
        : `Available at ${facilityName}`
    },
    { 
      id: BloodRequestStatus.Reached, 
      label: deliveryMethod === DeliveryMethod.Transfer ? 'Delivered' : 'Collected', 
      icon: CheckCircle2,
      description: 'Process completed successfully'
    }
  ];

  const currentStepIndex = steps.findIndex(s => s.id === status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        className={`fixed bottom-6 right-6 ${showLiveMap ? 'w-[600px]' : 'w-96'} bg-white rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.15)] border border-slate-100 overflow-hidden z-[1000] transition-all duration-500`}
      >
        <div className="p-6 bg-slate-900 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20">
              <Hospital className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-black uppercase tracking-[0.2em] block">Tracking System</span>
              <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">Active Request</span>
            </div>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex flex-col md:flex-row">
          {/* Status Steps */}
          <div className={`${showLiveMap ? 'md:w-1/2' : 'w-full'} p-8 border-r border-slate-50`}>
            <div className="space-y-8 relative">
              {/* Progress Line */}
              <div className="absolute left-4 top-2 bottom-2 w-0.5 bg-slate-100" />
              <div 
                className="absolute left-4 top-2 w-0.5 bg-red-600 transition-all duration-1000" 
                style={{ height: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              />

              {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const Icon = step.icon;

                return (
                  <div key={step.id} className="flex gap-6 relative">
                    <div className={`
                      w-8 h-8 rounded-xl flex items-center justify-center z-10 transition-all duration-500
                      ${isCompleted || isCurrent ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'bg-slate-50 text-slate-300'}
                      ${isCurrent ? 'ring-4 ring-red-100 scale-110' : ''}
                    `}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className={`text-[11px] font-black uppercase tracking-widest ${isCurrent ? 'text-red-600' : 'text-slate-900'}`}>
                        {step.label}
                      </h4>
                      <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-tight">
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {status === BloodRequestStatus.InTransit && deliveryMethod === DeliveryMethod.Transfer && (
              <button 
                onClick={() => setShowLiveMap(!showLiveMap)}
                className="w-full mt-10 py-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center gap-3 text-[10px] font-black text-slate-900 uppercase tracking-widest hover:bg-white hover:border-red-200 transition-all group"
              >
                <Navigation className={`w-4 h-4 ${showLiveMap ? 'text-red-600' : 'text-slate-400'} group-hover:rotate-45 transition-transform`} />
                {showLiveMap ? 'Hide Live Map' : 'View Live Tracking'}
              </button>
            )}

            {deliveryMethod === DeliveryMethod.Transfer && deliveryAddress && (
              <div className="mt-8 p-5 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">
                  <MapPin className="w-3 h-3" />
                  <span>Destination</span>
                </div>
                <p className="text-[11px] font-bold text-slate-900 leading-relaxed">{deliveryAddress}</p>
              </div>
            )}
          </div>

          {/* Map View */}
          {showLiveMap && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="md:w-1/2 h-[450px] p-4 bg-slate-50"
            >
              <div className="w-full h-full rounded-[2rem] overflow-hidden border border-slate-200 shadow-inner relative">
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
                <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-slate-200 flex items-center justify-between shadow-xl">
                  <div>
                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Estimated Arrival</p>
                    <p className="text-sm font-black text-slate-900">12 Minutes</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="w-4 h-4 text-emerald-500" />
                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Optimal Route</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {status === BloodRequestStatus.Reached && (
          <div className="p-6 bg-slate-50 border-t border-slate-100">
            <button
              onClick={onClose}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all flex items-center justify-center gap-3"
            >
              Complete & Dismiss
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
};

