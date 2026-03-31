
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem } from '../types';
import { TranslationKeys } from '../translations';
import { MapPin, Activity, Zap, Navigation, Info } from 'lucide-react';

interface MapViewProps {
  items: InventoryItem[];
  allFacilities?: InventoryItem[];
  t: TranslationKeys;
  onReserve: (item: InventoryItem) => void;
  onCall: (item: InventoryItem) => void;
  emergencyMode?: boolean;
  activeRoute?: {
    start: { lat: number, lng: number };
    end: { lat: number, lng: number };
    courierPos: { lat: number, lng: number };
    type: 'drone' | 'truck';
  };
}

const MapView: React.FC<MapViewProps> = ({ items, allFacilities = [], t, onReserve, onCall, emergencyMode, activeRoute }) => {
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);

  // Use all facilities for coordinate bounds to ensure a consistent map view
  const displayItems = allFacilities.length > 0 ? allFacilities : items;
  
  const allCoords = [
    ...displayItems.map(i => i.coords),
    activeRoute?.start,
    activeRoute?.end,
    activeRoute?.courierPos
  ].filter(Boolean) as { lat: number, lng: number }[];

  // Add some padding to the bounds
  const minLat = Math.min(...allCoords.map(c => c.lat)) - 0.01;
  const maxLat = Math.max(...allCoords.map(c => c.lat)) + 0.01;
  const minLng = Math.min(...allCoords.map(c => c.lng)) - 0.01;
  const maxLng = Math.max(...allCoords.map(c => c.lng)) + 0.01;

  const getPos = (lat: number, lng: number) => {
    const x = ((lng - minLng) / (maxLng - minLng || 0.02)) * 80 + 10;
    const y = 100 - (((lat - minLat) / (maxLat - minLat || 0.02)) * 80 + 10);
    return { x: `${x}%`, y: `${y}%` };
  };

  return (
    <div className="relative w-full h-[600px] bg-slate-950 rounded-[3rem] overflow-hidden border border-slate-800 shadow-2xl">
      {/* Neural Grid Background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 2px 2px, #334155 1px, transparent 0)',
          backgroundSize: '40px 40px' 
        }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950"></div>
      </div>

      {/* Map Header */}
      <div className="absolute top-8 left-8 z-10 flex flex-col gap-3">
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-700 px-6 py-3 rounded-2xl flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Neural Network Active</span>
        </div>
        {emergencyMode && (
          <div className="bg-red-600/90 backdrop-blur-xl border border-red-400/50 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-red-600/20">
            <Activity className="w-3 h-3 text-white animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Emergency Protocol: O- Search</span>
          </div>
        )}
        {activeRoute && (
          <div className="bg-blue-600/90 backdrop-blur-xl border border-blue-400/50 px-6 py-3 rounded-2xl flex items-center gap-3 shadow-lg shadow-blue-600/20">
            <Navigation className="w-3 h-3 text-white animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">Priority Delivery Active</span>
          </div>
        )}
      </div>

      {/* Map Markers & Routes */}
      <div className="absolute inset-0 p-12">
        {/* Active Route Line */}
        {activeRoute && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none overflow-visible">
            <defs>
              <linearGradient id="routeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#3b82f6" stopOpacity="1" />
              </linearGradient>
            </defs>
            <motion.line
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              x1={getPos(activeRoute.start.lat, activeRoute.start.lng).x}
              y1={getPos(activeRoute.start.lat, activeRoute.start.lng).y}
              x2={getPos(activeRoute.end.lat, activeRoute.end.lng).x}
              y2={getPos(activeRoute.end.lat, activeRoute.end.lng).y}
              stroke="url(#routeGradient)"
              strokeWidth="2"
              strokeDasharray={activeRoute.type === 'drone' ? "4 4" : "0"}
              className="drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]"
            />
          </svg>
        )}

        {/* Courier Marker */}
        {activeRoute && (
          <motion.div
            className="absolute z-30"
            style={{ 
              left: getPos(activeRoute.courierPos.lat, activeRoute.courierPos.lng).x, 
              top: getPos(activeRoute.courierPos.lat, activeRoute.courierPos.lng).y 
            }}
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-blue-500/30 rounded-full animate-ping"></div>
              <div className="w-10 h-10 bg-white rounded-2xl flex items-center justify-center shadow-2xl border-2 border-blue-600">
                {activeRoute.type === 'drone' ? (
                  <Zap className="w-5 h-5 text-blue-600 animate-bounce" />
                ) : (
                  <Navigation className="w-5 h-5 text-blue-600 rotate-45" />
                )}
              </div>
              <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 bg-slate-900 px-2 py-1 rounded text-[8px] font-black text-white uppercase tracking-widest whitespace-nowrap">
                Live Courier
              </div>
            </div>
          </motion.div>
        )}

        {/* All Facilities (Background) */}
        {allFacilities.map((facility) => {
          const pos = getPos(facility.coords?.lat || 0, facility.coords?.lng || 0);
          const hasInventory = items.some(i => i.id === facility.id);
          if (hasInventory) return null; // Handled by inventory markers

          return (
            <div
              key={`facility-${facility.id}`}
              className="absolute opacity-30"
              style={{ left: pos.x, top: pos.y }}
            >
              <div className="w-4 h-4 rounded-full bg-slate-700 border border-slate-500"></div>
              <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <p className="text-[6px] font-bold text-slate-500 uppercase tracking-widest">{facility.facilityName}</p>
              </div>
            </div>
          );
        })}

        {/* Inventory Markers */}
        {items.map((item) => {
          const pos = getPos(item.coords?.lat || 0, item.coords?.lng || 0);
          const isSelected = selectedItem?.id === item.id;
          const isCritical = item.status === 'Critical';
          const isEmergencyTarget = emergencyMode && item.bloodGroup === 'O-';

          return (
            <motion.div
              key={item.id}
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="absolute cursor-pointer group"
              style={{ left: pos.x, top: pos.y }}
              onClick={() => setSelectedItem(item)}
            >
              {/* Pulse Effect for Critical or Emergency Target */}
              {(isCritical || isEmergencyTarget) && (
                <div className={`absolute -inset-4 rounded-full animate-ping ${isEmergencyTarget ? 'bg-red-600/40' : 'bg-red-500/20'}`}></div>
              )}
              
              {/* Marker */}
              <div className={`relative w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                isSelected 
                  ? 'bg-white border-red-600 scale-125 z-20 shadow-[0_0_30px_rgba(220,38,38,0.4)]' 
                  : isEmergencyTarget
                    ? 'bg-red-600 border-white scale-125 z-10 shadow-[0_0_20px_rgba(220,38,38,0.6)]'
                    : isCritical 
                      ? 'bg-red-600 border-red-400 scale-110' 
                      : 'bg-slate-800 border-slate-600 hover:border-white'
              }`}>
                <span className={`text-[10px] font-black ${isSelected ? 'text-red-600' : 'text-white'}`}>
                  {item.bloodGroup}
                </span>
              </div>

              {/* Label - Always visible but smaller unless hovered/selected */}
              <div className={`absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap transition-all z-10 ${
                isSelected ? 'scale-110' : 'scale-90'
              }`}>
                <div className={`bg-slate-900/90 backdrop-blur-md border px-3 py-1.5 rounded-lg transition-all ${
                  isSelected ? 'border-red-500 shadow-lg shadow-red-500/20' : 'border-slate-700'
                }`}>
                  <p className={`text-[8px] font-black uppercase tracking-widest ${isSelected ? 'text-red-400' : 'text-white'}`}>
                    {item.facilityName}
                  </p>
                  {isSelected && (
                    <p className="text-[7px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">
                      {item.units} Units Available
                    </p>
                  )}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Selected Item Panel */}
      <AnimatePresence>
        {selectedItem && (
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            className="absolute right-8 top-8 bottom-8 w-80 bg-white rounded-[2.5rem] shadow-2xl p-8 flex flex-col z-30 overflow-hidden"
          >
            <button 
              onClick={() => setSelectedItem(null)}
              className="absolute top-6 right-6 w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 hover:text-slate-900 transition-all"
            >
              <i className="fa-solid fa-xmark"></i>
            </button>

            <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${selectedItem.status === 'Critical' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{selectedItem.status}</span>
                </div>
                <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-tight uppercase">{selectedItem.facilityName}</h3>
                <div className="flex items-center gap-2 text-slate-400">
                  <MapPin className="w-3 h-3" />
                  <p className="text-[10px] font-bold uppercase tracking-widest">{selectedItem.city} • {selectedItem.distanceKm} KM</p>
                </div>
              </div>

              <div className="bg-slate-50 rounded-3xl p-6 flex items-center gap-6 border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-white border-2 border-slate-100 text-red-600 flex items-center justify-center">
                  <span className="text-2xl font-black tracking-tighter">{selectedItem.bloodGroup}</span>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{selectedItem.componentType}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-black text-slate-900 leading-none">{selectedItem.units}</p>
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.units}</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Traffic Status</span>
                  <div className="flex items-center gap-2">
                    <Zap className={`w-3 h-3 ${
                      selectedItem.trafficStatus === 'High' ? 'text-red-500' : 
                      selectedItem.trafficStatus === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
                    }`} />
                    <span className={`text-[10px] font-black uppercase tracking-widest ${
                      selectedItem.trafficStatus === 'High' ? 'text-red-600' : 
                      selectedItem.trafficStatus === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'
                    }`}>
                      {selectedItem.trafficStatus}
                    </span>
                  </div>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: selectedItem.trafficStatus === 'High' ? '90%' : selectedItem.trafficStatus === 'Moderate' ? '50%' : '20%' }}
                    className={`h-full rounded-full ${
                      selectedItem.trafficStatus === 'High' ? 'bg-red-500' : 
                      selectedItem.trafficStatus === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`}
                  />
                </div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center">
                  Estimated Arrival: <span className="text-slate-900">{selectedItem.estimatedArrivalMins} Minutes</span>
                </p>
              </div>

              <div className="bg-red-50 p-6 rounded-3xl border border-red-100 space-y-3">
                <div className="flex items-center gap-2">
                  <Activity className="w-3 h-3 text-red-600" />
                  <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">AI Prediction</p>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed italic">
                  "{selectedItem.aiInsights.riskRecommendation}"
                </p>
              </div>
            </div>

            <div className="pt-8 space-y-3">
              <button 
                onClick={() => onReserve(selectedItem)}
                className="w-full h-14 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/20"
              >
                {t.reserve}
              </button>
              <button 
                onClick={() => onCall(selectedItem)}
                className="w-full h-14 bg-white border border-slate-200 text-slate-900 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-slate-50 transition-all"
              >
                Contact Facility
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Map Legend */}
      <div className="absolute bottom-8 left-8 bg-slate-900/80 backdrop-blur-xl border border-slate-700 p-6 rounded-3xl space-y-4">
        <p className="text-[10px] font-black text-white uppercase tracking-widest mb-2">Network Status</p>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-red-600"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Critical</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Stable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-slate-600"></div>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Surplus</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapView;
