import React, { useState } from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { API_ENDPOINTS, apiCall } from '../config';

interface RegistrationProps {
  onRegistrationSuccess: (user: any) => void;
  onCancel: () => void;
  t: any;
}

const CITIES = [
  'Mumbai',
  'Delhi',
  'Bangalore',
  'Hyderabad',
  'Chennai',
  'Kolkata',
  'Pune',
  'Ahmedabad',
  'Jaipur',
  'Surat',
];

const USER_TYPES = [
  { value: 'DRIVER', label: 'Blood Courier/Driver' },
  { value: 'DONOR', label: 'Blood Donor' },
  { value: 'HOSPITAL', label: 'Hospital/Medical Facility' },
  { value: 'ADMIN', label: 'Administrator' },
];

const Registration: React.FC<RegistrationProps> = ({ onRegistrationSuccess, onCancel, t }) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    city: '',
    userType: 'DONOR',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.username.trim()) newErrors.username = 'Username cannot be blank';
    if (!formData.email.trim()) newErrors.email = 'Email cannot be blank';
    if (!formData.password) newErrors.password = 'Password cannot be blank';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.firstName.trim()) newErrors.firstName = 'First name cannot be blank';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name cannot be blank';
    if (!formData.phone.trim()) newErrors.phone = 'Phone cannot be blank';
    if (!formData.city) newErrors.city = 'City cannot be blank';

    // Email validation
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Phone validation (basic)
    if (formData.phone && !/^\d{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = 'Phone must be 10 digits';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      const userData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        first_name: formData.firstName,
        last_name: formData.lastName,
        phone: formData.phone,
        city: formData.city,
        user_type: formData.userType,
      };

      const user = await apiCall(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        body: JSON.stringify(userData),
      });

      setSubmitSuccess(true);
      
      // Store user data in localStorage
      const userInfo = (user as any).user || user;
      localStorage.setItem('user_id', (userInfo as any).id || '');
      localStorage.setItem('user_data', JSON.stringify(userInfo || {}));

      setTimeout(() => {
        onRegistrationSuccess(userInfo);
      }, 1500);
    } catch (error: any) {
      setErrors({ general: error.message || 'Registration failed. Please try again.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (submitSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-20">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center space-y-6"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
            className="flex justify-center"
          >
            <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-emerald-600" />
            </div>
          </motion.div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight mb-2">
              Registration Successful!
            </h2>
            <p className="text-slate-600 text-sm">
              Your account has been created. Redirecting...
            </p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] shadow-xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-12 bg-gradient-to-br from-blue-50 to-red-50 dark:from-blue-900/10 dark:to-red-900/10 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border-2 border-red-500 flex items-center justify-center shadow-sm">
              <i className="fas fa-user-plus text-red-600 text-2xl"></i>
            </div>
            <div>
              <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Create Account
              </h2>
              <p className="text-slate-400 text-[11px] font-bold uppercase tracking-widest mt-1">
                Join the VitalFlow Bio-Grid
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-12 space-y-6">
          {errors.general && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3"
            >
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-red-700 text-sm font-semibold">{errors.general}</p>
            </motion.div>
          )}

          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="John"
              />
              {errors.firstName && <p className="text-red-600 text-xs mt-1">{errors.firstName}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="Doe"
              />
              {errors.lastName && <p className="text-red-600 text-xs mt-1">{errors.lastName}</p>}
            </div>
          </div>

          {/* Username & Email */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="johndoe"
              />
              {errors.username && <p className="text-red-600 text-xs mt-1">{errors.username}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="john@example.com"
              />
              {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
            </div>
          </div>

          {/* Phone & City */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                Phone Number
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="9876543210"
              />
              {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                City
              </label>
              <select
                name="city"
                value={formData.city}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Select City</option>
                {CITIES.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
              {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
            </div>
          </div>

          {/* User Type */}
          <div>
            <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
              User Type
            </label>
            <select
              name="userType"
              value={formData.userType}
              onChange={handleInputChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
            >
              {USER_TYPES.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </select>
          </div>

          {/* Passwords */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
              {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
            </div>
            <div>
              <label className="block text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 dark:bg-slate-800 font-medium placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500"
                placeholder="••••••••"
              />
              {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-6 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-bold rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-xl hover:from-red-700 hover:to-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <i className="fas fa-circle-notch animate-spin"></i>
                  Creating Account...
                </>
              ) : (
                <>
                  <i className="fas fa-user-check"></i>
                  Create Account
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Registration;
