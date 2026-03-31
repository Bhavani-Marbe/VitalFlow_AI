
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem } from '../types';
import { TranslationKeys } from '../translations';
import { Phone, CalendarCheck, MapPin, Activity, Zap } from 'lucide-react';
import { getComponentImage } from '../utils/imageAssets';

interface InventoryCardProps {
  item: InventoryItem;
  onReserve: (item: InventoryItem) => void;
  onCall: (item: InventoryItem) => void;
  isExactMatch?: boolean;
  t: TranslationKeys;
}

const InventoryCard: React.FC<InventoryCardProps> = ({ item, onReserve, onCall, isExactMatch = false, t }) => {
  const [justUpdated, setJustUpdated] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    setJustUpdated(true);
    const timer = setTimeout(() => setJustUpdated(false), 2000);
    return () => clearTimeout(timer);
  }, [item.units]);

  const isCritical = item.status === 'Critical';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white border border-slate-200 rounded-[2rem] p-8 flex flex-col justify-between relative overflow-hidden group cursor-pointer shadow-sm hover:shadow-md transition-all ${isCritical ? 'border-red-200 shadow-red-50/50' : ''}`}
      onClick={() => setIsExpanded(!isExpanded)}
    >
      {/* Top Header: Status and Risk */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isCritical ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`}></div>
          <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{item.status}</span>
        </div>
        <div className="flex items-center gap-3">
          {justUpdated && (
            <div className="flex items-center gap-1.5 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
              <div className="w-1 h-1 bg-emerald-500 rounded-full animate-ping"></div>
              <span className="text-[8px] font-black text-emerald-600 uppercase tracking-widest">Live</span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
            <Activity className={`w-3 h-3 ${item.aiInsights.expiryRiskScore > 0.7 ? 'text-red-500' : 'text-slate-400'}`} />
            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest">{(item.aiInsights.expiryRiskScore * 100).toFixed(0)}%</span>
          </div>
        </div>
      </div>

      {/* Match Type Badge */}
      <div className="mb-4">
        <span className={`text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-[0.15em] border ${
          isExactMatch 
            ? 'bg-red-50 text-red-600 border-red-100' 
            : 'bg-blue-50 text-blue-600 border-blue-100'
        }`}>
          {isExactMatch ? 'Exact Match' : 'Compatible Group'}
        </span>
      </div>

      {/* Facility Info */}
      <div className="flex items-start gap-4 mb-8">
        <div className="w-16 h-16 rounded-2xl overflow-hidden border border-slate-100 shadow-sm flex-shrink-0">
          <img 
            src={getComponentImage(item.componentType)} 
            alt={item.componentType} 
            className="w-full h-full object-cover group-hover:scale-110 transition-transform"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="space-y-1">
          <h3 className="text-xl font-black text-slate-900 tracking-tight leading-tight group-hover:text-red-600 transition-colors uppercase">{item.facilityName}</h3>
          <div className="flex items-center gap-2 text-slate-400">
            <MapPin className="w-3 h-3" />
            <p className="text-[10px] font-bold uppercase tracking-widest">{item.city} • {item.distanceKm} KM</p>
          </div>
          {item.trafficStatus && (
            <div className="flex items-center gap-2 mt-1">
              <Zap className={`w-3 h-3 ${
                item.trafficStatus === 'High' ? 'text-red-500' : 
                item.trafficStatus === 'Moderate' ? 'text-amber-500' : 'text-emerald-500'
              }`} />
              <span className={`text-[9px] font-black uppercase tracking-widest ${
                item.trafficStatus === 'High' ? 'text-red-600' : 
                item.trafficStatus === 'Moderate' ? 'text-amber-600' : 'text-emerald-600'
              }`}>
                {item.trafficStatus} Traffic • {item.estimatedArrivalMins} Mins ETA
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Units Display Box */}
      <div className={`relative rounded-3xl p-6 flex items-center gap-6 border transition-all mb-8 ${
        justUpdated 
          ? 'border-emerald-400 bg-emerald-50/30' 
          : 'border-slate-100 bg-slate-50 group-hover:bg-white group-hover:border-slate-200'
      }`}>
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center shadow-sm border-2 transition-all ${
          justUpdated 
            ? 'bg-emerald-500 border-emerald-400 text-white' 
            : 'bg-white border-slate-100 text-red-600 group-hover:border-red-100'
        }`}>
          <span className="text-3xl font-black tracking-tighter">{item.bloodGroup}</span>
        </div>
        <div className="flex-1">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{item.componentType}</p>
          <div className="flex items-baseline gap-2">
            <p className={`text-4xl font-black leading-none tracking-tight ${justUpdated ? 'text-emerald-600' : 'text-slate-900'}`}>{item.units}</p>
            <span className="text-xs font-black text-slate-400 uppercase tracking-widest">{t.units}</span>
          </div>
        </div>
        {isCritical && (
          <div className="absolute -top-2 -right-2">
            <div className="bg-red-600 text-white text-[8px] font-black px-2 py-1 rounded-lg shadow-lg uppercase tracking-widest">Critical</div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden space-y-4 mb-8"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Days to Expiry</p>
                <p className="text-sm font-bold text-slate-900">{item.aiInsights.daysToExpiry} Days</p>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100">
                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mb-1">Redistribution Weight</p>
                <p className="text-sm font-bold text-slate-900">{(item.aiInsights.redistributionWeight * 100).toFixed(1)}%</p>
              </div>
            </div>
            <div className="bg-red-50 p-4 rounded-xl border border-red-100">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-3 h-3 text-red-600" />
                <p className="text-[9px] font-bold text-red-600 uppercase tracking-widest">AI Insights</p>
              </div>
              <p className="text-[11px] text-slate-600 leading-relaxed italic">
                "{item.aiInsights.riskRecommendation}"
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 mb-8" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={() => onReserve(item)}
          className="flex-1 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center gap-3 text-[11px] font-black text-slate-900 uppercase tracking-widest hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <CalendarCheck className="w-4 h-4 text-slate-900" />
          {t.reserve}
        </button>
        <button 
          onClick={() => onCall(item)}
          className="w-14 h-14 bg-white border border-slate-200 rounded-2xl flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all shadow-sm"
        >
          <Phone className="w-5 h-5" />
        </button>
      </div>

      <div className="flex items-center justify-between pt-6 border-t border-slate-100">
         <div className="flex items-center gap-2">
           <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{t.neuralMatch}</span>
         </div>
         <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mono">
           {t.latency}: 22ms
         </div>
      </div>
    </motion.div>
  );
};

export default InventoryCard;
