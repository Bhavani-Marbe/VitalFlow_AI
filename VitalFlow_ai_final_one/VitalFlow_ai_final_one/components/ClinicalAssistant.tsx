
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { askClinicalAssistant } from '../services/gemini';

const ClinicalAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user' | 'ai', text: string}[]>([
    { role: 'ai', text: 'VitalFlow Bio-Logic Assistant Online. 🧬 I can help with clinical protocols and biological inventory logic.' }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsTyping(true);
    try {
      const response = await askClinicalAssistant(userMsg);
      setMessages(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', text: "⚠️ Connectivity issue. Protocol interrupted." }]);
    } finally { setIsTyping(false); }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-[9999] flex flex-col items-end pointer-events-none">
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="pointer-events-auto w-[calc(100vw-3rem)] max-w-[600px] h-[min(700px,80vh)] bg-white border border-slate-200 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden mb-2 md:mb-4 relative"
          >
            <div className="scanline opacity-[0.01]"></div>
            <div className="bg-slate-50/50 p-8 flex items-center justify-between border-b border-slate-100 relative z-10">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-red-600 flex items-center justify-center text-white shadow-lg overflow-hidden border-2 border-white">
                  <img 
                    src="https://images.unsplash.com/photo-1675271591211-126ad94e495d?auto=format&fit=crop&q=80&w=100" 
                    alt="AI Assistant" 
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div>
                  <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Bio-Logic Assistant</p>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                    <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Protocol Active</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900 transition-colors">
                <i className="fa-solid fa-chevron-down"></i>
              </button>
            </div>
            
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 bg-white custom-scrollbar">
              {messages.map((m, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: m.role === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  key={`${m.role}-${i}`} 
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`max-w-[85%] p-6 rounded-[2rem] text-[13px] font-bold leading-relaxed ${
                    m.role === 'user' 
                      ? 'bg-red-600 text-white rounded-tr-none shadow-md' 
                      : 'bg-slate-50 text-slate-700 rounded-tl-none border border-slate-100 markdown-content'
                  }`}>
                    {m.role === 'ai' ? <ReactMarkdown>{m.text}</ReactMarkdown> : m.text}
                  </div>
                </motion.div>
              ))}
              {isTyping && (
                <div className="flex items-center gap-2 px-4">
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1 h-1 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
            </div>

            <div className="p-8 bg-slate-50/50 border-t border-slate-100 flex gap-4">
              <input 
                type="text" value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Query Bio-Logic Protocol..."
                className="flex-1 bg-white border border-slate-200 rounded-2xl px-6 py-4 text-[13px] font-bold text-slate-900 outline-none focus:border-red-600/30 transition-all placeholder:text-slate-300"
              />
              <button 
                onClick={handleSend} 
                className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all shadow-lg active:scale-90"
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button 
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`pointer-events-auto w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center shadow-[0_10px_40px_rgba(220,38,38,0.5)] transition-all duration-500 z-[10000] border-4 border-white group relative ${isOpen ? 'bg-slate-900' : 'bg-red-600 pulse-red'}`}
      >
        <i className={`fa-solid ${isOpen ? 'fa-xmark' : 'fa-dna'} text-2xl md:text-3xl text-white`}></i>
      </motion.button>
    </div>
  );
};

export default ClinicalAssistant;
