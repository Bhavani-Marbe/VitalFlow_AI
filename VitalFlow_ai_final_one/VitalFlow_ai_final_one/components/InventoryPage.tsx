
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import InventoryCard from './InventoryCard';
import EmptyState from './EmptyState';
import { InventoryItem, BloodGroup, ComponentType, EmergencyEvent } from '../types';
import { TranslationKeys } from '../translations';
import { Navigation } from 'lucide-react';

interface InventoryPageProps {
  t: TranslationKeys;
  searchCity: string;
  setSearchCity: (city: string) => void;
  filterBloodGroup: string;
  setFilterBloodGroup: (bg: string) => void;
  resultsCity: string;
  resultsBloodGroup: string;
  totalUnits: number;
  lastUpdated: string;
  isDetectingLocation: boolean;
  detectLocation: () => void;
  handleGridScan: () => void;
  setReservingItem: (item: InventoryItem) => void;
  setCallingHospital: (item: InventoryItem) => void;
  CITIES: string[];
  filterComponents: string[];
  setFilterComponents: (components: string[]) => void;
  filterUnits: number;
  setFilterUnits: (units: number) => void;
  isScanning: boolean;
  resultsComponents: string[];
  cityResults: InventoryItem[];
  otherCityResults: InventoryItem[];
  allCityFacilities: InventoryItem[];
  nearestBankResults: InventoryItem[];
  emergencyEvents: EmergencyEvent[];
  availabilityHeatmap: InventoryItem[];
  findNearestBank: (lat: number, lng: number, bloodGroup: BloodGroup, componentType: ComponentType, units: number) => void;
  sendEmergencyAlert: (city: string, bloodGroup: string, severity: 'critical' | 'high' | 'medium' | 'low', details?: string) => void;
  emergencyMode?: boolean;
}

const InventoryPage: React.FC<InventoryPageProps> = ({
  t,
  searchCity,
  setSearchCity,
  filterBloodGroup,
  setFilterBloodGroup,
  filterComponents,
  setFilterComponents,
  filterUnits,
  setFilterUnits,
  isScanning,
  resultsCity,
  resultsBloodGroup,
  resultsComponents,
  cityResults,
  otherCityResults,
  allCityFacilities,
  totalUnits,
  lastUpdated,
  isDetectingLocation,
  detectLocation,
  handleGridScan,
  setReservingItem,
  setCallingHospital,
  CITIES,
  nearestBankResults,
  emergencyEvents,
  availabilityHeatmap,
  findNearestBank,
  sendEmergencyAlert,
  emergencyMode
}) => {
  const handleFindNearest = () => {
    const nearest = [...cityResults].sort((a, b) => a.distanceKm - b.distanceKm)[0];
    if (nearest) {
      setReservingItem(nearest);
      findNearestBank(nearest.coords?.lat || 0, nearest.coords?.lng || 0, nearest.bloodGroup, nearest.componentType, nearest.units);
    }
  };

  return (
    <motion.div
      key="inventory"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="space-y-12 relative"
    >
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1615461066841-6116e61058f4?auto=format&fit=crop&q=80&w=1920')] bg-cover bg-center opacity-[0.02] pointer-events-none rounded-[3rem]"></div>
      {/* Search Hub */}
      <div className="bg-white border border-slate-200 rounded-[3rem] p-10 shadow-sm space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Location Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.location}</span>
              <div className="flex gap-2">
                <button 
                  onClick={handleFindNearest}
                  className="w-8 h-8 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-all flex items-center justify-center border border-red-100"
                  title="Find Nearest Facility"
                >
                  <Navigation className="w-3 h-3" />
                </button>
                <button 
                  onClick={detectLocation}
                  disabled={isDetectingLocation}
                  className="w-8 h-8 rounded-xl bg-slate-50 text-slate-400 hover:text-red-600 transition-all flex items-center justify-center border border-slate-100"
                  title="Detect GPS Location"
                >
                  <i className={`fa-solid fa-crosshairs text-xs ${isDetectingLocation ? 'animate-spin' : ''}`}></i>
                </button>
              </div>
            </div>
            <div className="relative">
              <select 
                value={searchCity}
                onChange={e => setSearchCity(e.target.value)}
                className="w-full h-16 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-sm font-black text-slate-900 outline-none focus:border-red-600/50 transition-all appearance-none cursor-pointer"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <i className="fa-solid fa-location-dot absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs"></i>
            </div>
          </div>

          {/* Blood Group Selection */}
          <div className="space-y-6 pt-6 border-t border-slate-50 md:border-t-0 md:pt-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.bloodGroup}</span>
            <div className="flex flex-wrap gap-3">
              {Object.values(BloodGroup).map(bg => (
                <button
                  key={bg}
                  onClick={() => setFilterBloodGroup(bg)}
                  className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all text-sm font-black tracking-tighter ${filterBloodGroup === bg ? 'bg-red-600 text-white shadow-2xl shadow-red-600/40 scale-110' : 'bg-slate-50 text-slate-400 hover:bg-slate-100'}`}
                >
                  {bg}
                </button>
              ))}
            </div>
          </div>

          {/* Component Type Selection */}
          <div className="space-y-4 pt-4 border-t border-slate-50 md:border-t-0 md:pt-0">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{t.selectComponents}</span>
            <div className="flex flex-wrap gap-3">
              {[
                ComponentType.WholeBlood,
                ComponentType.Plasma,
                ComponentType.PlateletConcentrate,
                ComponentType.PRBC,
                ComponentType.RandomDonorPlatelets,
                ComponentType.WBC
              ].map(ct => {
                const active = filterComponents.includes(ct);
                return (
                  <button
                    key={ct}
                    onClick={() => {
                      if (active) {
                        setFilterComponents(filterComponents.filter(x => x !== ct));
                      } else {
                        setFilterComponents([...filterComponents, ct]);
                      }
                    }}
                    className={`px-3 h-10 rounded-xl text-xs font-black transition-all ${active ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-50 text-slate-500 hover:bg-slate-100'}`}>
                    {ct}
                  </button>
                );
              })}
            </div>
            <div className="flex items-center gap-3">
              <label htmlFor="componentUnits" className="text-xs font-bold text-slate-500">Units</label>
              <input
                id="componentUnits"
                type="number"
                min={1}
                value={filterUnits}
                onChange={e => setFilterUnits(Math.max(1, Number(e.target.value || 1)))}
                className="w-24 h-10 text-sm border border-slate-200 rounded-xl px-3 text-slate-700"
              />
            </div>
          </div>

          {/* Action Button */}
          <div className="pt-6 border-t border-slate-50 md:border-t-0 md:pt-0 h-full flex items-end">
            <button 
              onClick={handleGridScan}
              disabled={isScanning}
              className={`w-full h-16 rounded-2xl font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl ${isScanning ? 'bg-emerald-500 text-white shadow-emerald-500/30 cursor-wait' : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-900/20'}`}>
              <i className={`fa-solid fa-satellite-dish ${isScanning ? 'animate-spin' : 'group-hover:animate-pulse'}`}></i>
              {isScanning ? 'Scanning...' : t.scanNetwork}
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Header */}
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-4">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              {t.sync}: {lastUpdated}
            </div>
          </div>
        </div>
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          {t.sector}: <span className="text-slate-900">{resultsCity}</span>
        </div>
      </div>

      {/* New AI features panel */}
      <div className="bg-white border border-slate-200 rounded-[2rem] p-4 shadow-sm mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl border border-red-100 bg-red-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-red-600">AI Nearest Match</h3>
            <p className="text-[10px] text-slate-500 mt-2">Closest blood banks in {resultsCity}</p>
            {nearestBankResults.slice(0, 3).map(item => (
              <p className="text-[10px] font-bold text-slate-700 uppercase mt-2" key={item.id}>{item.facilityName} ({item.distanceKm?.toFixed(1)} Km)</p>
            ))}
          </div>
          <div className="p-4 rounded-2xl border border-amber-100 bg-amber-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-amber-600">Live Availability</h3>
            <p className="text-[10px] text-slate-500 mt-2">Total facilities: {availabilityHeatmap.length}</p>
            <p className="text-[10px] text-slate-500">Units: {availabilityHeatmap.reduce((sum, i) => sum + i.units, 0)}</p>
          </div>
          <div className="p-4 rounded-2xl border border-blue-100 bg-blue-50">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600">Emergency Alerts</h3>
            <div className="max-h-24 overflow-y-auto space-y-1 mt-2">
              {emergencyEvents.length === 0 ? (
                <p className="text-[10px] text-slate-400">No active alerts</p>
              ) : emergencyEvents.slice(0, 3).map((alert) => (
                <div key={alert.id} className="bg-white/80 p-1 rounded-md border border-blue-100">
                  <p className="text-[9px] font-bold text-slate-700 uppercase">{alert.city} • {alert.bloodGroup}</p>
                  <p className="text-[8px] text-slate-500">{alert.details}</p>
                </div>
              ))}
            </div>
            <button
              onClick={() => sendEmergencyAlert(resultsCity || 'Unknown', resultsBloodGroup || 'O+', 'critical', 'Auto emergency broadcast from dashboard')}
              className="mt-3 w-full bg-red-600 text-white text-[10px] font-black uppercase py-2 rounded-xl hover:bg-red-700 transition-all"
            >
              Trigger Emergency Alert
            </button>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex items-baseline justify-between border-b border-slate-100 pb-4">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t.availableInventory}</h2>
          <div className="flex gap-6">
            <div className="text-right">
              <p className="text-sm font-bold text-slate-900">{cityResults.length + otherCityResults.length}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.facilities}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-bold text-red-600">{totalUnits}</p>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{t.totalUnits}</p>
            </div>
          </div>
        </div>

        {cityResults.length > 0 || otherCityResults.length > 0 ? (
          <div className="space-y-12">
            <>
              {cityResults.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-red-600 uppercase tracking-[0.2em] bg-red-50 px-3 py-1 rounded-full border border-red-100">{t.localSector}: {resultsCity}</span>
                    <div className="flex-1 h-[1px] bg-slate-100"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {cityResults.map((item) => (
                        <InventoryCard 
                          key={item.id} 
                          item={item} 
                          onReserve={setReservingItem} 
                          onCall={setCallingHospital}
                          isExactMatch={item.bloodGroup === resultsBloodGroup}
                          t={t}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {otherCityResults.length > 0 && (
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] bg-slate-50 px-3 py-1 rounded-full border border-slate-100">{t.networkOverflow}</span>
                    <div className="flex-1 h-[1px] bg-slate-100"></div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <AnimatePresence mode="popLayout">
                      {otherCityResults.map((item) => (
                        <InventoryCard 
                          key={item.id} 
                          item={item} 
                          onReserve={setReservingItem} 
                          onCall={setCallingHospital}
                          isExactMatch={item.bloodGroup === resultsBloodGroup}
                          t={t}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              )}
            </>
          </div>
        ) : (
          <EmptyState 
            icon="fa-search"
            title={t.noMatchesTitle}
            description={t.noMatchesDesc}
            tips={[t.tip1, t.tip2, t.tip3, t.tip4]}
            actionLabel={t.resetFilters}
            onAction={() => {
              setSearchCity('Mumbai');
              setFilterBloodGroup(BloodGroup.OPos);
              handleGridScan();
            }}
            t={t}
          />
        )}
      </div>
    </motion.div>
  );
};

export default InventoryPage;
