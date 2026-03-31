
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { InventoryItem } from '../types';
import { TranslationKeys } from '../translations';
import { ShieldAlert, Satellite, Activity, MapPin } from 'lucide-react';

interface LocalSectorPageProps {
  t: TranslationKeys;
  locationDetails: any;
  detectedAddress: string | null;
  detectLocation: () => void;
  allCityFacilities: InventoryItem[];
  syncSeconds: number;
  setEmergencyMode: (mode: boolean) => void;
  isEmergencyMode?: boolean;
}

const LocalSectorPage: React.FC<LocalSectorPageProps> = ({
  t,
  locationDetails,
  detectedAddress,
  detectLocation,
  allCityFacilities,
  syncSeconds,
  setEmergencyMode,
  isEmergencyMode = false
}) => {
  return (
    <motion.div 
      key="local-sector"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-12 py-10 relative"
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-[0.015] pointer-events-none rounded-[3rem]"></div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">{t.localSector}</h1>
          <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-2">{t.detectedLocation}</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={detectLocation}
            className="px-6 py-3 bg-red-600 text-white rounded-2xl font-bold text-[10px] uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
          >
            <i className="fas fa-location-crosshairs mr-2"></i>
            {t.scanNetwork}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm relative overflow-hidden flex flex-col">
            <div className="relative z-10 mb-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                  <MapPin className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.location}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t.liveTracking}</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.street}</p>
                <p className="text-[11px] font-bold text-slate-900 truncate">{locationDetails?.street || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.area}</p>
                <p className="text-[11px] font-bold text-slate-900 truncate">{locationDetails?.area || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.location}</p>
                <p className="text-[11px] font-bold text-slate-900 truncate">{locationDetails?.city || '---'}</p>
              </div>
              <div className="space-y-1">
                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.state}</p>
                <p className="text-[11px] font-bold text-slate-900 truncate">{locationDetails?.state || '---'}</p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center text-xl shadow-inner">
                  <i className="fas fa-hospital"></i>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{t.nearbyFacilities}</h3>
                  <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">{t.precision} {t.intelligence}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {allCityFacilities.slice(0, 5).map((facility, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-red-200 transition-all">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-red-600 shadow-sm overflow-hidden">
                      <img 
                        src={`https://picsum.photos/seed/${facility.facilityName}/100/100`} 
                        alt={facility.facilityName} 
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{facility.facilityName}</p>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{facility.city}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-black text-red-600">{facility.distanceKm.toFixed(1)} KM</p>
                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.latency}: {facility.aiInsights.precisionMatchRank * 100}%</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-xl shadow-slate-900/20 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-600/20 rounded-full blur-3xl -mr-16 -mt-16"></div>
            <div className="relative z-10 space-y-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-xl">
                <Satellite className="w-6 h-6 animate-pulse" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{t.nationalBioGrid}</h3>
                <p className="text-white/40 text-[10px] font-bold uppercase tracking-widest">{t.liveTelemetry}</p>
              </div>
              <div className="space-y-4 pt-4">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase">{t.networkStatus}</span>
                  <span className="text-[10px] font-black text-emerald-400 uppercase">{t.operational}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase">{t.activeNodes}</span>
                  <span className="text-[10px] font-black text-white uppercase">1,284</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold text-white/40 uppercase">{t.sync}</span>
                  <span className="text-[10px] font-black text-white uppercase">{syncSeconds}s</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-red-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-red-600/20">
            <div className="space-y-6">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-2xl font-black uppercase tracking-tight">{t.sos}</h3>
                <p className="text-white/60 text-[10px] font-bold uppercase tracking-widest">{t.emergencyProtocol}</p>
              </div>
              <p className="text-xs font-medium leading-relaxed opacity-80">
                {t.broadcastingTo} {locationDetails?.city || 'your city'} {t.andSurrounding}.
              </p>
              <button 
                onClick={() => setEmergencyMode(true)}
                className="w-full py-4 bg-white text-red-600 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all shadow-lg"
              >
                {t.executeProtocol}
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default LocalSectorPage;

