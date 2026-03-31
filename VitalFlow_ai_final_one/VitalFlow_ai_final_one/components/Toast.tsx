import React from 'react';
import { motion } from 'motion/react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

interface ToastProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const Toast: React.FC<ToastProps> = ({ type, message }) => {
  const config = {
    success: {
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      icon: CheckCircle,
      color: 'text-emerald-600',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      icon: AlertCircle,
      color: 'text-red-600',
    },
    info: {
      bg: 'bg-blue-50 border-blue-200',
      text: 'text-blue-700',
      icon: Info,
      color: 'text-blue-600',
    },
  };

  const { bg, text, icon: Icon, color } = config[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 50, x: 100 }}
      className={`fixed bottom-6 right-6 flex items-center gap-3 px-6 py-4 rounded-xl border ${bg} backdrop-blur-sm shadow-lg z-50`}
    >
      <Icon className={`w-5 h-5 ${color} flex-shrink-0`} />
      <p className={`font-semibold text-sm ${text}`}>{message}</p>
    </motion.div>
  );
};

export default Toast;
