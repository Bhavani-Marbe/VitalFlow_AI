import React, { useState } from 'react';
import { motion } from 'motion/react';

import { User, UserRole } from '../types';
import { API_ENDPOINTS } from '../config';

interface LoginProps {
  onLoginSuccess: (user: User) => void;
  onCancel: () => void;
  initialMode?: 'patient' | 'admin';
  t: any;
}

const Login: React.FC<LoginProps> = ({ onLoginSuccess, onCancel, initialMode = 'patient', t }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [method, setMethod] = useState<'email' | 'mobile'>('email');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.Patient);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getFallbackDemoUser = (email: string, password: string): User | null => {
    const fallbackUsers: Record<string, { password: string; user: User }> = {
      'john@example.com': {
        password: 'password123',
        user: { id: 'demo-user', name: 'John Doe', email: 'john@example.com', role: UserRole.Patient }
      },
      'driver@vitalflow.ai': {
        password: 'drive123',
        user: { id: 'demo-driver', name: 'Demo Driver', email: 'driver@vitalflow.ai', role: UserRole.Driver }
      },
      'admin@vitalflow.ai': {
        password: 'admin123',
        user: { id: 'demo-admin', name: 'Demo Admin', email: 'admin@vitalflow.ai', role: UserRole.SuperAdmin }
      },
      'hospital@vitalflow.ai': {
        password: 'hosp123',
        user: { id: 'demo-hospital', name: 'Demo Hospital', email: 'hospital@vitalflow.ai', role: UserRole.HospitalAdmin }
      }
    };

    const record = fallbackUsers[email.toLowerCase()];
    if (record && record.password === password) {
      return record.user;
    }
    return null;
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const endpoint = isRegister ? API_ENDPOINTS.REGISTER : API_ENDPOINTS.LOGIN;
    const payload = isRegister 
      ? { name, email, password, role } 
      : { email, password };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const user = await response.json();

        // Store user data in localStorage for future use
        localStorage.setItem('user_data', JSON.stringify(user));

        if (!isRegister) {
          // Check if user role matches login mode
          const isAdminMode = initialMode === 'admin';
          const isUserAdmin = user.role === 'SUPER_ADMIN' || user.role === 'BANK_ADMIN' || user.role === 'HOSP_ADMIN';
          const isUserDriver = user.role === 'DRIVER';

          if (isAdminMode && !isUserAdmin) {
            setError("Access Denied: This account does not have administrative privileges.");
            setIsLoading(false);
            return;
          }

          if (!isAdminMode && (isUserAdmin && !isUserDriver)) {
            setError("Please use the Admin Access portal for this account.");
            setIsLoading(false);
            return;
          }
        }

        onLoginSuccess(user);
      } else {
        // Fallback: support built-in demo users if backend denies user
        const fallbackUser = getFallbackDemoUser(email, password);
        if (fallbackUser) {
          localStorage.setItem('user_data', JSON.stringify(fallbackUser));
          onLoginSuccess(fallbackUser);
          return;
        }

        let errorMessage = "Authentication failed. Please check your credentials.";
        try {
          const data = await response.json();
          if (data.error) {
            errorMessage = data.error;
          } else if (data.username) {
            errorMessage = "Username not found";
          } else if (data.email) {
            errorMessage = data.email;
          } else {
            errorMessage = Object.values(data)[0] as string || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `Server error (${response.status}): ${response.statusText}`;
        }

        setError(errorMessage);
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError("Request timeout. Please check your internet connection.");
      } else if (err instanceof TypeError) {
        setError("Cannot reach the server. Please ensure the backend is running at 127.0.0.1:8000 and verify your internet connection.");
      } else {
        setError(`Error: ${err.message || 'Network error. Please try again later.'}`);
      }
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden"
      >
        <div className={`p-12 text-center relative overflow-hidden border-b border-slate-100 dark:border-slate-800 ${initialMode === 'admin' ? 'bg-slate-900 text-white' : 'bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white'}`}>
          {initialMode === 'admin' ? (
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#e11d4815,transparent_70%)] opacity-50"></div>
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-red-50 to-blue-50 dark:from-red-900/10 dark:to-blue-900/10 opacity-50"></div>
          )}
          
          <motion.div 
            animate={{ y: [0, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className={`w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 relative z-10 border shadow-sm ${initialMode === 'admin' ? 'bg-slate-800 border-slate-700' : 'bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800'}`}
          >
            <i className={`fas ${initialMode === 'admin' ? 'fa-user-shield text-red-500' : 'fa-shield-halved text-red-600'} text-4xl`}></i>
          </motion.div>
          <h2 className="text-3xl font-black tracking-tight uppercase leading-none relative z-10">
            {isRegister ? 'Create Account' : (initialMode === 'admin' ? t.adminPortal : t.secureLogin)}
          </h2>
          <p className={`${initialMode === 'admin' ? 'text-slate-500' : 'text-slate-400 dark:text-slate-500'} text-[11px] uppercase tracking-widest mt-4 font-bold relative z-10`}>
            {isRegister ? 'Join the VitalFlow Bio-Grid' : 'VitalFlow Healthcare Portal v4.2'}
          </p>
        </div>

        <div className="p-12 space-y-10">
          {!isRegister && (
            <div className="flex bg-slate-50 dark:bg-slate-800/50 p-1 rounded-xl border border-slate-100 dark:border-slate-800">
              <button onClick={() => setMethod('email')} className={`flex-1 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${method === 'email' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>Email Node</button>
              <button onClick={() => setMethod('mobile')} className={`flex-1 py-3 rounded-lg text-[11px] font-bold uppercase tracking-wider transition-all ${method === 'mobile' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-900 dark:text-white' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}>OTP Node</button>
            </div>
          )}

          <form onSubmit={handleFormSubmit} className="space-y-6">
             <div className="space-y-4">
                {isRegister && (
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
                      <i className="fas fa-user text-sm"></i>
                    </div>
                    <input 
                      type="text" 
                      placeholder="FULL NAME"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase tracking-wider text-xs"
                      value={name}
                      onChange={e => setName(e.target.value)}
                      required
                    />
                  </div>
                )}
                <div className="relative group">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
                    <i className={`fas ${method === 'email' ? 'fa-at' : 'fa-mobile-screen'} text-sm`}></i>
                  </div>
                  <input 
                    type={method === 'email' ? 'email' : 'tel'} 
                    placeholder={method === 'email' ? 'EMAIL ADDRESS' : 'SECURE MOBILE'}
                    className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase tracking-wider text-xs"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                  />
                </div>
                {method === 'email' && (
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
                      <i className="fas fa-key text-sm"></i>
                    </div>
                    <input 
                      type="password" 
                      placeholder="PASSWORD"
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase tracking-wider text-xs"
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      required
                    />
                  </div>
                )}
                {isRegister && (
                  <div className="relative group">
                    <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-red-600 transition-colors">
                      <i className="fas fa-users-cog text-sm"></i>
                    </div>
                    <select 
                      className="w-full pl-14 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-4 focus:ring-red-500/5 focus:border-red-500 transition-all font-bold text-slate-900 dark:text-white placeholder:text-slate-300 dark:placeholder:text-slate-600 uppercase tracking-wider text-xs appearance-none"
                      value={role}
                      onChange={e => setRole(e.target.value as UserRole)}
                      required
                    >
                      <option value={UserRole.Patient}>PATIENT</option>
                      <option value={UserRole.HospitalAdmin}>HOSPITAL ADMIN</option>
                      <option value={UserRole.Driver}>DRIVER</option>
                      <option value={UserRole.SuperAdmin}>SUPER ADMIN</option>
                    </select>
                  </div>
                )}
             </div>

              {!isRegister && (
                <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-2">
                  <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Demo Credentials</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {initialMode === 'admin' ? (
                      <>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-user-shield text-red-500"></i> {t.admin}
                          </p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400">admin@vitalflow.ai</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">admin123</p>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-hospital text-red-500"></i> {t.hospital}
                          </p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400">hospital@vitalflow.ai</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">hosp123</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-user text-red-500"></i> {t.user}
                          </p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400">john@example.com</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">password123</p>
                        </div>
                        <div className="p-2 bg-white dark:bg-slate-900 rounded-lg border border-slate-100 dark:border-slate-700">
                          <p className="text-[10px] font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            <i className="fa-solid fa-truck-fast text-red-500"></i> {t.driver}
                          </p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400">driver@vitalflow.ai</p>
                          <p className="text-[9px] text-slate-500 dark:text-slate-400 font-mono">drive123</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}

             {error && (
               <motion.p 
                 initial={{ opacity: 0, y: -10 }}
                 animate={{ opacity: 1, y: 0 }}
                 className="text-[11px] font-bold text-red-600 bg-red-50 dark:bg-red-900/20 p-4 text-center uppercase tracking-wider rounded-xl border border-red-100 dark:border-red-900/30"
               >
                 {error}
               </motion.p>
             )}

             <button type="submit" disabled={isLoading} className="w-full py-4 bg-red-600 text-white rounded-xl font-bold text-[13px] uppercase tracking-wider shadow-sm hover:bg-red-700 transition-all active:scale-95 disabled:opacity-50">
               {isLoading ? <i className="fas fa-circle-notch animate-spin text-lg"></i> : (isRegister ? 'Register & Authenticate' : t.authenticateAccess)}
             </button>
          </form>

          <div className="text-center space-y-4">
            <button 
              onClick={() => setIsRegister(!isRegister)} 
              className="text-[10px] font-bold text-red-600 uppercase tracking-widest hover:underline"
            >
              {isRegister ? 'Already have an account? Login' : 'New to Bio-Grid? Register Now'}
            </button>
            <button onClick={onCancel} className="w-full text-center text-slate-400 dark:text-slate-500 font-bold text-[11px] uppercase tracking-widest hover:text-slate-900 dark:hover:text-white transition-all">{t.returnToSearch}</button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;