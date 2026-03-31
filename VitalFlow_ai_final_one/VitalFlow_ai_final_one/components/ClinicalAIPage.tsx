
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import { BloodGroup } from '../types';
import { askClinicalAssistant } from '../services/gemini';

const COMPATIBILITY_DATA: Record<BloodGroup, BloodGroup[]> = {
  [BloodGroup.OPos]: [BloodGroup.OPos, BloodGroup.ONeg],
  [BloodGroup.ONeg]: [BloodGroup.ONeg],
  [BloodGroup.APos]: [BloodGroup.APos, BloodGroup.ANeg, BloodGroup.OPos, BloodGroup.ONeg],
  [BloodGroup.ANeg]: [BloodGroup.ANeg, BloodGroup.ONeg],
  [BloodGroup.BPos]: [BloodGroup.BPos, BloodGroup.BNeg, BloodGroup.OPos, BloodGroup.ONeg],
  [BloodGroup.BNeg]: [BloodGroup.BNeg, BloodGroup.ONeg],
  [BloodGroup.ABPos]: Object.values(BloodGroup),
  [BloodGroup.ABNeg]: [BloodGroup.ABNeg, BloodGroup.ANeg, BloodGroup.BNeg, BloodGroup.ONeg],
};

const PROTOCOLS = [
  { id: 'massive-transfusion', title: 'Massive Transfusion Protocol (MTP)', icon: 'fa-droplet', color: 'text-red-600', description: 'Emergency activation for uncontrolled hemorrhage.' },
  { id: 'pediatric-dosage', title: 'Pediatric Transfusion Guide', icon: 'fa-child', color: 'text-blue-600', description: 'Weight-based volume calculations for neonates and children.' },
  { id: 'reaction-management', title: 'Adverse Reaction Protocol', icon: 'fa-triangle-exclamation', color: 'text-amber-600', description: 'Immediate steps for suspected transfusion reactions.' },
  { id: 'storage-sterile', title: 'Sterile Window Management', icon: 'fa-clock', color: 'text-emerald-600', description: 'Optimizing shelf-life and biological integrity.' },
];

interface ClinicalAIPageProps {
  t: any;
}

const ClinicalAIPage: React.FC<ClinicalAIPageProps> = ({ t }) => {
  const [selectedRecipient, setSelectedRecipient] = useState<BloodGroup | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', text: string}[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatHistory, isTyping]);

  const [matrixView, setMatrixView] = useState<'recipient' | 'donor' | 'emergency'>('recipient');

  const DONOR_COMPATIBILITY: Record<BloodGroup, BloodGroup[]> = {
    [BloodGroup.OPos]: [BloodGroup.OPos, BloodGroup.APos, BloodGroup.BPos, BloodGroup.ABPos],
    [BloodGroup.ONeg]: Object.values(BloodGroup),
    [BloodGroup.APos]: [BloodGroup.APos, BloodGroup.ABPos],
    [BloodGroup.ANeg]: [BloodGroup.APos, BloodGroup.ANeg, BloodGroup.ABPos, BloodGroup.ABNeg],
    [BloodGroup.BPos]: [BloodGroup.BPos, BloodGroup.ABPos],
    [BloodGroup.BNeg]: [BloodGroup.BPos, BloodGroup.BNeg, BloodGroup.ABPos, BloodGroup.ABNeg],
    [BloodGroup.ABPos]: [BloodGroup.ABPos],
    [BloodGroup.ABNeg]: [BloodGroup.ABPos, BloodGroup.ABNeg],
  };

  const handleChat = async (customQuery?: string) => {
    const msg = customQuery || chatInput;
    if (!msg.trim()) return;
    
    if (!customQuery) setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: msg }]);
    setIsTyping(true);
    try {
      const response = await askClinicalAssistant(msg);
      setChatHistory(prev => [...prev, { role: 'ai', text: response }]);
    } catch (error) {
      setChatHistory(prev => [...prev, { role: 'ai', text: "⚠️ Protocol interrupted. Check network sync." }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleProtocolClick = (protocolId: string) => {
    let query = "";
    switch (protocolId) {
      case 'massive-transfusion':
        query = "Initiate Massive Transfusion Protocol (MTP). What are the immediate action steps and product ratios?";
        break;
      case 'pediatric-dosage':
        query = "Provide the Pediatric Transfusion Guide for a 15kg child. What are the volume calculations for RBC and Plasma?";
        break;
      case 'reaction-management':
        query = "Suspected Adverse Transfusion Reaction. What are the immediate steps for management and investigation?";
        break;
      case 'storage-sterile':
        query = "Explain Sterile Window Management for blood components. How do we optimize shelf-life and integrity?";
        break;
    }
    handleChat(query);
  };

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-[3rem] bg-slate-950 border border-slate-800 p-12 md:p-20 text-white shadow-2xl min-h-[400px] flex items-center">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1579154235602-3c2c2aa5d72e?auto=format&fit=crop&q=80&w=1200" 
            alt="Clinical AI Background" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/80 to-transparent"></div>
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-red-600/10 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-red-500 text-[10px] font-black uppercase tracking-[0.3em] mb-8 backdrop-blur-md">
            <i className="fa-solid fa-circle-dot animate-pulse"></i>
            {t.clinicalIntelligenceNode}
          </div>
          <h1 className="text-4xl md:text-7xl font-black tracking-tight mb-8 leading-[0.9] uppercase">
            {t.precision} <span className="text-red-600">Bio-Logic</span> <br />
            {t.decisionSupport}.
          </h1>
          <p className="text-xl text-slate-400 font-medium leading-relaxed max-w-xl">
            VitalFlow AI provides real-time clinical guidance, compatibility verification, and emergency protocol automation for critical care environments.
          </p>
        </div>

        {/* Floating DNA/Helix Icon as seen in screenshot */}
        <div className="absolute bottom-10 right-10 w-16 h-16 bg-red-600 rounded-full flex items-center justify-center text-white shadow-2xl shadow-red-600/40 z-20">
          <i className="fa-solid fa-dna text-2xl"></i>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Compatibility Matrix (8 cols) */}
        <div className="lg:col-span-8">
          <section className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm relative h-full">
            <div className="flex justify-end mb-8">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <div className="w-3 h-3 rounded-full bg-slate-100"></div>
                <div className="w-3 h-3 rounded-full bg-slate-100"></div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mb-12">
              {Object.values(BloodGroup).map(bg => (
                <button
                  key={bg}
                  onClick={() => setSelectedRecipient(bg)}
                  className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all text-lg font-black tracking-tighter ${
                    selectedRecipient === bg 
                      ? 'bg-red-600 text-white shadow-2xl shadow-red-600/40 scale-110 z-10' 
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                  }`}
                >
                  {bg}
                </button>
              ))}
            </div>

            <div className="bg-slate-50/50 rounded-[2.5rem] p-10 border border-slate-100/50">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                COMPATIBILITY LOGIC: {selectedRecipient || 'SELECT GROUP'}
              </h3>
              
              <div className="flex flex-wrap gap-4">
                {selectedRecipient ? (
                  COMPATIBILITY_DATA[selectedRecipient].map(compat => (
                    <div key={compat} className="px-6 py-4 bg-white border border-slate-100 rounded-2xl flex items-center gap-3 shadow-sm">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                      <span className="text-sm font-black text-slate-900">{compat}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Select a recipient blood group to view logic</p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: AI Assistant Chat (4 cols) */}
        <div className="lg:col-span-4">
          <section className="bg-white border border-slate-100 rounded-[3rem] h-[600px] flex flex-col overflow-hidden shadow-sm relative">
            <div className="p-8 border-b border-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-red-600/20">
                  <i className="fa-solid fa-microchip text-lg"></i>
                </div>
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-6 flex flex-col items-center justify-center text-center">
              {chatHistory.length === 0 ? (
                <div className="space-y-6">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 mx-auto">
                    <i className="fa-solid fa-circle-plus text-3xl"></i>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-black text-slate-900 uppercase tracking-widest">
                      AWAITING CLINICAL QUERY.
                    </p>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed max-w-[200px]">
                      ASK ABOUT DOSAGE, COMPATIBILITY, OR PROTOCOLS.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full space-y-6 text-left">
                  {chatHistory.map((chat, i) => (
                    <div key={`${chat.role}-${i}`} className={`flex ${chat.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[90%] p-5 rounded-3xl text-xs font-bold leading-relaxed ${
                        chat.role === 'user' 
                          ? 'bg-red-600 text-white rounded-tr-none shadow-md' 
                          : 'bg-slate-50 text-slate-700 border border-slate-100 rounded-tl-none markdown-content'
                      }`}>
                        {chat.role === 'ai' ? (
                          <ReactMarkdown>{chat.text}</ReactMarkdown>
                        ) : (
                          chat.text
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              {isTyping && (
                <div className="flex gap-2 mt-4">
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-red-600 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-8 bg-slate-50/30 border-t border-slate-50">
              <div className="flex gap-3">
                <input 
                  type="text" 
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleChat()}
                  placeholder="ENTER CLINICAL QUERY..."
                  className="flex-1 bg-white border border-slate-100 rounded-2xl px-6 py-4 text-[10px] font-black text-slate-900 outline-none focus:border-red-600/50 transition-all placeholder:text-slate-300 uppercase tracking-widest"
                />
                <button 
                  onClick={() => handleChat()}
                  className="w-14 h-14 bg-red-600 text-white rounded-2xl flex items-center justify-center hover:bg-red-700 transition-all shadow-lg shadow-red-600/20 active:scale-95"
                >
                  <i className="fa-solid fa-paper-plane"></i>
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Protocol Cards below */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {PROTOCOLS.map(protocol => (
          <motion.div 
            key={protocol.id}
            whileHover={{ y: -5 }}
            onClick={() => handleProtocolClick(protocol.id)}
            className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl hover:shadow-slate-200/50 transition-all cursor-pointer group"
          >
            <div className={`w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform overflow-hidden`}>
              <img 
                src={`https://picsum.photos/seed/${protocol.id}/100/100`} 
                alt={protocol.title} 
                className="w-full h-full object-cover opacity-50 group-hover:opacity-100 transition-opacity"
                referrerPolicy="no-referrer"
              />
            </div>
            <h3 className="text-[11px] font-black text-slate-900 uppercase tracking-tight mb-2">{protocol.title}</h3>
            <p className="text-[10px] text-slate-400 font-bold leading-relaxed uppercase">{protocol.description}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default ClinicalAIPage;
