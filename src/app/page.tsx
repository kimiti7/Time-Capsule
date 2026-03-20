"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Flame, Book, BarChart3, Heart, Ghost, 
  Coffee, Moon, CheckCircle2, Music, ExternalLink,
  Edit3, Save, Image as ImageIcon 
} from 'lucide-react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
// @ts-ignore
import confetti from 'canvas-confetti';

// --- FIREBASE CONFIG ---
const firebaseConfig = {
  apiKey: "AIzaSyD3vYfhT9Ukphq2fVbNH5c9bGqGpcsd4sA",
  authDomain: "vault-final.firebaseapp.com",
  projectId: "vault-final",
  storageBucket: "vault-final.firebasestorage.app",
  messagingSenderId: "334310325243",
  appId: "1:334310325243:web:dfd97334aa1009b391e95e"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

const MOODS = [
  { id: 'happy', icon: Heart, color: 'text-pink-500', label: 'Radiant' },
  { id: 'low', icon: Moon, color: 'text-blue-400', label: 'Quiet' },
  { id: 'missing', icon: Ghost, color: 'text-purple-500', label: 'Missing' },
  { id: 'tired', icon: Coffee, color: 'text-orange-400', label: 'Tired' }
];

const Bubbles = () => (
  <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
    {[...Array(12)].map((_, i) => (
      <div key={`bubble-${i}`} className="bubble" style={{
        width: Math.random() * 25 + 10 + "px",
        height: Math.random() * 25 + 10 + "px",
        left: Math.random() * 100 + "%",
        animation: `floatBubble ${Math.random() * 4 + 6}s linear ${Math.random() * 5}s infinite`
      }} />
    ))}
  </div>
);

export default function VaultOS() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [dbData, setDbData] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [localNote, setLocalNote] = useState("");
  const [localSecret, setLocalSecret] = useState("");

  const SECRET_WORD = "sacrifice";

  useEffect(() => {
    if (isAuthorized) {
      const unsubscribe = onSnapshot(doc(db, "vault", "data"), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setDbData(data);
          if (!isEditing) setLocalNote(data.content || "");
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthorized, isEditing]);

  const handleSaveJournal = async () => {
    await updateDoc(doc(db, "vault", "data"), { 
      content: localNote, 
      streak: (dbData?.streak || 0) + 1, 
      lastUpdated: serverTimestamp() 
    });
    setIsEditing(false);
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#dc2626', '#ffffff'] });
  };

  const handleSaveSecret = async (slot: string) => {
    if (!localSecret.trim()) return;
    await updateDoc(doc(db, "vault", "data"), { [slot]: localSecret });
    setLocalSecret("");
    confetti({ particleCount: 100, scalar: 0.75, shapes: ['circle'], colors: ['#22c55e', '#ffffff'] });
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
        <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 2.5, repeat: Infinity }} className="text-red-600 mb-10">
          <Activity size={60} />
        </motion.div>
        <input 
          type="password" placeholder="ACCESS KEY" 
          className="bg-transparent border-b border-zinc-800 text-red-500 text-center outline-none w-40 tracking-[0.3em] uppercase py-2 text-sm"
          onChange={(e) => e.target.value.toLowerCase() === SECRET_WORD && setIsAuthorized(true)}
        />
      </div>
    );
  }

  if (!dbData) return <div className="min-h-screen bg-black flex items-center justify-center text-zinc-500 font-mono text-xs uppercase tracking-widest">Initialising...</div>;

  return (
    <div className="min-h-screen relative text-zinc-100 font-sans pb-32 overflow-x-hidden bg-slate-950">
      
      <div className="fixed inset-0 z-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: activeTab === 'stats' ? "url('https://images.unsplash.com/photo-1594463750939-ebb28c3f5f53?q=80&w=2070&auto=format&fit=crop')" : 'none',
          opacity: activeTab === 'stats' ? 0.4 : 0
        }}
      />
      {activeTab === 'stats' && <Bubbles />}

      <div className="relative z-10">
        <header className="p-6 flex justify-between items-center border-b border-white/5 sticky top-0 bg-slate-950/80 backdrop-blur-xl">
          <h1 className="text-sm font-black italic text-red-600 tracking-tighter">VAULT_OS.v3</h1>
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs bg-white/5 px-3 py-1 rounded-full border border-white/5">
            {dbData.streak} <Flame size={14} className={dbData.streak > 0 ? "text-orange-500" : ""} />
          </div>
        </header>

        <main className="p-6 max-w-lg mx-auto">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -5 }}>
              
              {activeTab === 'home' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-3">
                    {MOODS.map((m) => (
                      <button key={m.id} onClick={() => updateDoc(doc(db, "vault", "data"), { mood: m.id })}
                        className={`p-5 rounded-3xl border transition-all flex flex-col items-center gap-2 ${dbData.mood === m.id ? 'bg-zinc-900 border-zinc-700' : 'bg-transparent border-white/5 opacity-40'}`}>
                        <m.icon size={24} className={dbData.mood === m.id ? m.color : ''} />
                        <span className="text-[9px] font-bold uppercase tracking-widest">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <div className={`p-6 rounded-[2.5rem] border transition-all ${dbData.streak % 7 === 0 && dbData.streak > 0 ? 'border-yellow-500/50 bg-yellow-500/5 shadow-2xl shadow-yellow-500/10' : 'border-white/5 bg-zinc-900/50'}`}>
                    <div className="flex justify-between items-center mb-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Weekly_Capsule</span>
                      <span className="text-red-500 font-mono">{dbData.streak % 7}/7</span>
                    </div>
                    
                    {dbData.streak % 7 === 0 && dbData.streak > 0 ? (
                      <div className="space-y-4">
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm italic">"{dbData.secret1 || "Partner 1 silent..."}"</div>
                        <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-sm italic">"{dbData.secret2 || "Partner 2 silent..."}"</div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <textarea value={localSecret} onChange={(e) => setLocalSecret(e.target.value)} placeholder="Type a secret..." className="w-full bg-black/40 border border-white/5 p-4 rounded-2xl text-xs outline-none focus:border-red-500 h-24 resize-none" />
                        <div className="flex gap-2">
                          {!dbData.secret1 ? (
                            <button onClick={() => handleSaveSecret('secret1')} className="flex-1 py-3 bg-zinc-800 rounded-xl text-[9px] font-black uppercase">Save P1</button>
                          ) : (
                            <div className="flex-1 py-3 text-center text-[9px] text-green-500 font-black uppercase border border-green-500/20 rounded-xl flex items-center justify-center gap-1"><CheckCircle2 size={12}/> P1 Ready</div>
                          )}
                          {!dbData.secret2 ? (
                            <button onClick={() => handleSaveSecret('secret2')} className="flex-1 py-3 bg-zinc-800 rounded-xl text-[9px] font-black uppercase">Save P2</button>
                          ) : (
                            <div className="flex-1 py-3 text-center text-[9px] text-green-500 font-black uppercase border border-green-500/20 rounded-xl flex items-center justify-center gap-1"><CheckCircle2 size={12}/> P2 Ready</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'journal' && (
                <div className="bg-zinc-900/80 p-6 rounded-[2.5rem] border border-white/5">
                  <div className="flex justify-between mb-6 items-center">
                    <span className="text-[10px] text-zinc-500 font-black uppercase tracking-[0.2em]">Encrypted_Log</span>
                    <button onClick={() => isEditing ? handleSaveJournal() : setIsEditing(true)} className="p-2 text-red-500 bg-black/50 rounded-full border border-white/5">
                      {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
                    </button>
                  </div>
                  {isEditing ? (
                    <textarea className="w-full h-72 bg-black/50 border border-white/10 p-4 rounded-2xl text-zinc-200 outline-none text-sm" value={localNote} onChange={(e) => setLocalNote(e.target.value)} />
                  ) : (
                    <p className="text-lg italic text-zinc-300 leading-relaxed font-serif">"{dbData.content || "..."}"</p>
                  )}
                </div>
              )}

              {activeTab === 'stats' && (
                <div className="space-y-6 pt-6">
                  <div className="bg-yellow-400/10 backdrop-blur-md p-10 rounded-[3rem] border border-yellow-400/30 text-center shadow-xl relative overflow-hidden">
                    <p className="text-yellow-500 text-[10px] font-black uppercase tracking-[0.4em] mb-4">Under_The_Sea</p>
                    <p className="text-8xl font-black text-yellow-400 drop-shadow-lg" style={{ fontFamily: "'Jua', sans-serif" }}>
                      {Math.floor((new Date().getTime() - new Date("2025-10-13").getTime()) / (1000 * 60 * 60 * 24))}
                    </p>
                  </div>
                  <a href={dbData.playlistUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full p-6 bg-green-500/5 border border-green-500/20 rounded-3xl flex items-center justify-between group hover:bg-green-500/10 transition-all">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-green-500 rounded-2xl text-black shadow-lg shadow-green-500/20"><Music size={20} /></div>
                      <div className="text-left">
                        <p className="text-[9px] font-black text-green-500 uppercase tracking-widest">Soundtrack</p>
                        <p className="text-sm font-bold text-zinc-100">Our Shared Playlist</p>
                      </div>
                    </div>
                    <ExternalLink size={16} className="text-green-500" />
                  </a>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </main>

        <nav className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900/90 backdrop-blur-2xl border border-white/10 p-2 rounded-[2rem] flex justify-around items-center z-50 shadow-2xl">
          {[
            { id: 'home', icon: Activity }, { id: 'journal', icon: Book }, { id: 'stats', icon: BarChart3 }
          ].map((tab) => (
            <button key={tab.id} onClick={() => { setActiveTab(tab.id); setIsEditing(false); }} className={`p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-zinc-500 hover:text-zinc-300'}`}>
              <tab.icon size={20} />
            </button>
          ))}
        </nav>
      </div>

      <style jsx global>{`
        @keyframes floatBubble {
          0% { transform: translateY(110vh); opacity: 0; }
          20% { opacity: 0.4; }
          100% { transform: translateY(-10vh); opacity: 0; }
        }
        .bubble { position: fixed; bottom: -50px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3); border-radius: 50%; pointer-events: none; z-index: 0; }
        body { background-color: #020617; margin: 0; overflow-x: hidden; }
      `}</style>
    </div>
  );
}