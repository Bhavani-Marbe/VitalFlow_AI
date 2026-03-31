
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { UserRole, User } from '../types';
import { Language } from '../translations';

interface HeaderProps {
  role: UserRole;
  onRoleChange: (role: UserRole) => void;
  onHomeClick: () => void;
  emergency: boolean;
  toggleEmergency: () => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  onLogout: () => void;
  onLoginTrigger: (mode?: 'patient' | 'admin') => void;
  activeView: 'home' | 'search' | 'analytics' | 'assistant' | 'dashboard' | 'local-sector' | 'hospital-dashboard' | 'driver-dashboard' | 'audit';
  onNav: (view: 'home' | 'search' | 'analytics' | 'assistant' | 'dashboard' | 'local-sector' | 'hospital-dashboard' | 'driver-dashboard' | 'audit') => void;
  t: any;
  language: Language;
  setLanguage: (lang: Language) => void;
}

const Header: React.FC<HeaderProps> = ({ 
  onHomeClick,
  emergency, 
  toggleEmergency,
  isAuthenticated,
  currentUser,
  onLogout,
  onLoginTrigger,
  activeView,
  onNav,
  role,
  t,
  language,
  setLanguage
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: t.home || 'Home', icon: 'fa-house' },
    { id: 'search', label: t.inventory, icon: 'fa-droplet' },
    { id: 'local-sector', label: t.localSector, icon: 'fa-location-crosshairs' },
    { 
      id: role === UserRole.HospitalAdmin ? 'hospital-dashboard' : 
          role === UserRole.Driver ? 'driver-dashboard' : 'dashboard', 
      label: t.dashboard, 
      icon: 'fa-gauge-high', 
      protected: true 
    },
    { id: 'analytics', label: t.analytics, icon: 'fa-chart-simple', adminOnly: true },
    { id: 'audit', label: 'Audit Logs', icon: 'fa-shield-halved', adminOnly: true },
    { id: 'assistant', label: t.assistant, icon: 'fa-brain' },
  ];

  const filteredNavItems = navItems.filter(item => {
    if (item.adminOnly && role !== UserRole.SuperAdmin) return false;
    if (item.protected && !isAuthenticated) return false;
    return true;
  });

  return (
    <header className="fixed top-0 left-0 right-0 z-[200] px-4 md:px-6 py-4 pointer-events-none">
      <div className="max-w-[1200px] mx-auto flex items-center justify-between pointer-events-auto bg-white/90 backdrop-blur-xl border border-slate-200 px-4 md:px-6 py-3 rounded-2xl shadow-sm">
        <div 
          className="flex items-center gap-2 md:gap-3 cursor-pointer group"
          onClick={onHomeClick}
        >
          <div className="w-9 h-9 md:w-10 md:h-10 bg-red-600 rounded-xl flex items-center justify-center shadow-lg shadow-red-600/20 group-hover:scale-105 transition-all">
            <i className="fa-solid fa-droplet text-white text-base md:text-lg"></i>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 md:gap-2">
              <span className="text-base md:text-lg font-bold tracking-tight text-slate-900 leading-none">{t.title}</span>
              <div className="hidden sm:flex items-center gap-1.5 px-1.5 py-0.5 bg-emerald-50 border border-emerald-100 rounded-md">
                <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-[7px] font-bold text-emerald-600 uppercase tracking-widest">{t.live}</span>
              </div>
            </div>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{t.nationalBioGrid}</span>
          </div>
        </div>

        {/* Desktop Nav */}
        <nav className="hidden lg:flex items-center gap-1">
          {filteredNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onNav(item.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold uppercase tracking-tight transition-all ${
                activeView === item.id 
                  ? 'bg-slate-900 text-white shadow-md' 
                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <i className={`fa-solid ${item.icon} text-[10px]`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2 md:gap-3">
          {/* Language Switcher */}
          <div className="hidden md:flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            {(['en', 'hi', 'kn'] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setLanguage(lang)}
                className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-tighter transition-all ${
                  language === lang 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>

          {/* Theme Toggle Removed */}

          <button 
            onClick={toggleEmergency}
            className={`flex items-center gap-2 px-4 md:px-6 py-2.5 rounded-xl text-[10px] md:text-[11px] font-bold uppercase tracking-widest transition-all border-2 ${
              emergency 
                ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/20 animate-pulse' 
                : 'bg-white border-red-100 text-red-600 hover:border-red-600 shadow-sm'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${emergency ? 'bg-white' : 'bg-red-600'} animate-ping`}></div>
            <span className="hidden xs:inline">{emergency ? t.sos + ' ' + t.active.toUpperCase() : t.sos}</span>
            <span className="xs:hidden">{t.sos}</span>
          </button>

          <div className="hidden sm:block w-[1px] h-6 bg-slate-200 mx-1"></div>

          {!isAuthenticated ? (
            <div className="relative group">
              <button 
                className="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-sm flex items-center gap-2"
              >
                {t.login}
                <i className="fa-solid fa-chevron-down text-[8px] opacity-50 group-hover:rotate-180 transition-transform"></i>
              </button>
              
              <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-slate-200 rounded-2xl shadow-xl p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform origin-top-right scale-95 group-hover:scale-100 z-50">
                <button 
                  onClick={() => onLoginTrigger('patient')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all"
                >
                  <i className="fa-solid fa-user text-xs"></i>
                  {t.user}
                </button>
                <button 
                  onClick={() => onLoginTrigger('patient')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all"
                >
                  <i className="fa-solid fa-truck-fast text-xs"></i>
                  {t.driver}
                </button>
                <button 
                  onClick={() => onLoginTrigger('admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all"
                >
                  <i className="fa-solid fa-hospital text-xs"></i>
                  {t.hospital}
                </button>
                <button 
                  onClick={() => onLoginTrigger('admin')}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-all"
                >
                  <i className="fa-solid fa-user-shield text-xs"></i>
                  {t.admin}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-right">
                <p className="text-[10px] font-bold text-slate-900 uppercase tracking-tight leading-none">{currentUser?.name || role}</p>
                <p className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{role === UserRole.SuperAdmin ? t.administrator : t.verifiedUser}</p>
              </div>
              <button 
                onClick={onLogout}
                className="w-10 h-10 bg-slate-50 text-slate-400 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all flex items-center justify-center border border-slate-200"
              >
                <i className="fa-solid fa-power-off text-sm"></i>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle Removed */}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-4 right-4 mt-2 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex flex-col gap-2 pointer-events-auto lg:hidden"
          >
            {filteredNavItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNav(item.id as any);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-tight transition-all ${
                  activeView === item.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <i className={`fa-solid ${item.icon} text-xs`}></i>
                {item.label}
              </button>
            ))}
            <div className="h-[1px] bg-slate-100 my-2"></div>
            {isAuthenticated ? (
              <div className="flex items-center justify-between px-4 py-2">
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold text-slate-900 uppercase tracking-tight leading-none">{currentUser?.name || role}</span>
                  <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-widest mt-1">{role === UserRole.SuperAdmin ? t.administrator : t.verifiedUser}</span>
                </div>
                <button 
                  onClick={() => {
                    onLogout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="text-red-600 text-xs font-bold uppercase tracking-widest"
                >
                  {t.logout}
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <button 
                  onClick={() => {
                    onLoginTrigger('patient');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-slate-900 text-white px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest w-full"
                >
                  {t.login}
                </button>
                <button 
                  onClick={() => {
                    onLoginTrigger('admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className="bg-white text-slate-900 border border-slate-200 px-4 py-3 rounded-xl font-bold text-xs uppercase tracking-widest w-full"
                >
                  {t.adminAccess}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
