
import React from 'react';
import { motion } from 'motion/react';

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  tips?: string[];
  t: any;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  onAction,
  tips,
  t
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2rem] py-16 px-8 text-center relative overflow-hidden"
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#e11d4805,transparent_70%)]"></div>
      
      <div className="relative z-10">
        <div className="empty-state-illustration mx-auto">
          <i className={`fas ${icon} text-slate-300 dark:text-slate-700 text-2xl`}></i>
        </div>
        
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 tracking-tight uppercase">{title}</h3>
        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto leading-relaxed">{description}</p>
        
        {tips && tips.length > 0 && (
          <div className="max-w-sm mx-auto mb-10 text-left bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm border border-slate-200 dark:border-slate-700 rounded-2xl p-6">
            <span className="section-label flex items-center gap-2">
              <i className="fas fa-lightbulb text-amber-500"></i>
              {t.actionableTips}
            </span>
            <ul className="space-y-3">
              {tips.map((tip, i) => (
                <li key={i} className="empty-state-tip border-none bg-transparent p-0 hover:bg-transparent hover:shadow-none">
                  <span className="text-red-500 font-bold">•</span>
                  {tip}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {actionLabel && onAction && (
          <button 
            onClick={onAction}
            className="btn-primary py-3 px-8 mx-auto"
          >
            {actionLabel}
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default EmptyState;
