
import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TranslationKeys } from '../translations';

interface HomePageProps {
  t: TranslationKeys;
  currentSlide: number;
  setCurrentSlide: (idx: number) => void;
  slides: any[];
  onSearchClick: () => void;
  onInventoryClick: () => void;
  onCampClick: () => void;
  onAboutClick: () => void;
  onLoginTrigger: (mode: 'patient' | 'admin') => void;
}

const HomePage: React.FC<HomePageProps> = ({
  t,
  currentSlide,
  setCurrentSlide,
  slides,
  onSearchClick,
  onInventoryClick,
  onCampClick,
  onAboutClick,
  onLoginTrigger
}) => {
  return (
    <motion.div
      key="home"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-24"
    >
      {/* Hero Slider Section */}
      <div className="relative h-[600px] overflow-hidden rounded-[3rem] border border-slate-800 shadow-2xl group bg-slate-950">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="absolute inset-0"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${slides[currentSlide].color} z-10`}></div>
            <img 
              src={slides[currentSlide].image} 
              alt="Hero"
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            
            <div className="absolute inset-0 z-20 flex flex-col justify-center px-12 md:px-20">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 text-red-400 text-[10px] font-bold uppercase tracking-widest mb-8 backdrop-blur-md w-fit"
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                </span>
                {slides[currentSlide].slogan}
              </motion.div>
              
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl sm:text-6xl md:text-8xl font-extrabold tracking-tight leading-[1.05] mb-6 uppercase text-white"
              >
                {slides[currentSlide].title} <br />
                <span className="text-red-500">{slides[currentSlide].subtitle}</span>
              </motion.h1>
              
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-slate-300 max-w-xl leading-relaxed mb-10 font-medium"
              >
                {slides[currentSlide].description}
              </motion.p>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-6"
              >
                <button 
                  onClick={onInventoryClick}
                  className="px-8 py-4 bg-red-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-red-700 transition-all shadow-xl shadow-red-600/20"
                >
                  {t.inventory}
                </button>
                <button 
                  onClick={onAboutClick}
                  className="px-8 py-4 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all"
                >
                  {t.aboutVitalFlow}
                </button>
              </motion.div>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slider Controls */}
        <div className="absolute bottom-10 right-12 z-30 flex gap-3">
          {slides.map((_, idx) => (
            <button
              key={idx}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(idx);
              }}
              className={`w-3 h-3 transition-all duration-300 rounded-full border-2 ${currentSlide === idx ? 'bg-red-500 border-red-500 scale-125' : 'bg-white/20 border-white/40 hover:bg-white/40'}`}
              aria-label={`Go to slide ${idx + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Quick Features Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          { icon: 'fa-magnifying-glass-location', label: t.findBloodBank, color: 'text-maroon-600', bg: 'bg-maroon-50', action: onSearchClick },
          { icon: 'fa-droplet', label: t.bloodAvailability, color: 'text-red-600', bg: 'bg-red-50', action: onInventoryClick },
          { icon: 'fa-calendar-check', label: t.campSchedule, color: 'text-emerald-600', bg: 'bg-emerald-50', action: onCampClick },
          { icon: 'fa-user-lock', label: t.donorLogin, color: 'text-blue-600', bg: 'bg-blue-50', action: () => onLoginTrigger('patient') },
          { icon: 'fa-circle-info', label: t.aboutVitalFlow, color: 'text-slate-600', bg: 'bg-slate-50', action: onAboutClick },
        ].map((feature, idx) => (
          <motion.button
            key={idx}
            onClick={feature.action}
            whileHover={{ y: -8, scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="bg-white border border-slate-100 p-8 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 transition-all flex flex-col items-center text-center gap-5 group"
          >
            <div className={`w-16 h-16 ${feature.bg} ${feature.color} rounded-[1.5rem] flex items-center justify-center group-hover:rotate-12 transition-transform shadow-inner`}>
              <i className={`fa-solid ${feature.icon} text-2xl`}></i>
            </div>
            <span className="text-[11px] font-black text-slate-900 uppercase tracking-widest leading-tight">{feature.label}</span>
          </motion.button>
        ))}
      </div>

      {/* Facts & Process Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        <div className="bg-slate-900 p-12 rounded-[2.5rem] text-white space-y-10 shadow-2xl shadow-slate-900/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <h2 className="text-3xl font-bold flex items-center gap-3 relative z-10">
            <i className="fa-solid fa-lightbulb text-red-500"></i>
            {t.bloodDonationFacts}
          </h2>
          <div className="grid grid-cols-1 gap-6 relative z-10">
            {[t.fact1, t.fact2, t.fact3, t.fact4].map((fact, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-start gap-4"
              >
                <div className="w-6 h-6 rounded-full bg-red-600/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <div className="w-2 h-2 rounded-full bg-red-600"></div>
                </div>
                <p className="text-lg font-medium leading-tight text-slate-300">{fact}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-12 rounded-[2.5rem] shadow-sm">
          <h2 className="text-3xl font-bold mb-10 text-slate-900 flex items-center gap-3">
            <i className="fa-solid fa-arrows-spin text-red-600"></i>
            {t.donationProcess}
          </h2>
          <div className="relative space-y-12">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-100"></div>
            
            {[
              { title: t.step1Title, desc: t.step1Desc, icon: "fa-clipboard-list" },
              { title: t.step2Title, desc: t.step2Desc, icon: "fa-hand-holding-medical" },
              { title: t.step3Title, desc: t.step3Desc, icon: "fa-mug-hot" }
            ].map((step, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="relative flex items-start gap-8 pl-14"
              >
                <div className="absolute left-0 w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-red-600 shadow-sm z-10">
                  <i className={`fa-solid ${step.icon} text-xl`}></i>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2 uppercase tracking-tight">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Latest Updates */}
      <div className="bg-slate-50 border border-slate-100 rounded-[3rem] p-12 shadow-inner">
        <div className="flex items-center justify-between mb-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <i className="fa-solid fa-newspaper text-xl"></i>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">Latest Updates</h2>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stay informed about blood donation</p>
            </div>
          </div>
          <button className="px-6 py-2 rounded-full border border-slate-200 text-[10px] font-bold uppercase tracking-widest hover:bg-white transition-all">View All News</button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: "World Blood Donor Day 2026", date: "June 14, 2026", desc: "Join the global celebration and help us reach our goal of 1 million donations." },
            { title: "New Blood Center in Jaipur", date: "March 25, 2026", desc: "A state-of-the-art facility is now operational to serve the local community." },
            { title: "Plasma Donation Drive", date: "March 20, 2026", desc: "Special drive focusing on plasma collection for critical care patients." }
          ].map((news, i) => (
            <motion.div 
              key={i}
              whileHover={{ y: -5 }}
              className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-4"
            >
              <span className="text-[9px] font-bold text-red-600 uppercase tracking-widest bg-red-50 px-3 py-1 rounded-full">{news.date}</span>
              <h3 className="text-lg font-bold text-slate-900 leading-tight">{news.title}</h3>
              <p className="text-sm text-slate-500 leading-relaxed">{news.desc}</p>
              <button className="text-[10px] font-bold text-red-600 uppercase tracking-widest flex items-center gap-2 group">
                Read More <i className="fa-solid fa-arrow-right group-hover:translate-x-1 transition-transform"></i>
              </button>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default HomePage;
