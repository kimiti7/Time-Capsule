"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Activity, Flame, Lock, Edit3, Save, LogOut, 
  Image as ImageIcon, Book, BarChart3, Upload, 
  Heart, Ghost, Coffee, Moon, CheckCircle2 // <--- ADD THIS
} from 'lucide-react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

const MOODS = [
  { id: 'happy', icon: Heart, color: 'text-pink-500', label: 'Radiant' },
  { id: 'low', icon: Moon, color: 'text-blue-400', label: 'Quiet' },
  { id: 'missing', icon: Ghost, color: 'text-purple-500', label: 'Missing' },
  { id: 'tired', icon: Coffee, color: 'text-orange-400', label: 'Tired' }
];

export default function VaultFinal() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('home');
  const [dbData, setDbData] = useState<any>({ content: "", streak: 0, mediaUrl: "", mood: "happy" });
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  const SECRET_WORD = "Sacrifice";

  useEffect(() => {
    if (isAuthorized) {
      const unsubscribe = onSnapshot(doc(db, "vault", "data"), (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setDbData(data);
          setNewNote(data.content || "");
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthorized]);

  const updateMood = async (moodId: string) => {
    await updateDoc(doc(db, "vault", "data"), { mood: moodId });
  };

  const saveJournal = async () => {
    await updateDoc(doc(db, "vault", "data"), { 
      content: newNote,
      streak: (dbData.streak || 0) + 1,
      lastUpdated: serverTimestamp() 
    });
    setIsEditing(false);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-6">
        <motion.div animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 2 }} className="text-red-600 mb-12">
          <Activity size={80} />
        </motion.div>
        <input 
          type="password" 
          placeholder="OVERRIDE KEY" 
          className="bg-transparent border-b border-slate-800 text-red-500 text-center outline-none w-48 tracking-widest uppercase py-2"
          onChange={(e) => e.target.value.toLowerCase() === SECRET_WORD.toLowerCase() && setIsAuthorized(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-32 selection:bg-red-500/30">
      {/* HEADER */}
      <header className="p-6 flex justify-between items-center border-b border-slate-900 sticky top-0 bg-slate-950/80 backdrop-blur-md z-50">
        <h1 className="text-lg font-black italic text-red-600 tracking-tighter uppercase">Vault_OS.v3</h1>
        <div className="flex items-center gap-2 text-slate-400 font-mono text-sm">
           {dbData.streak} <Flame size={18} className={dbData.streak > 0 ? "text-orange-500" : "text-slate-800"} />
        </div>
      </header>

      {/* NAVIGATION */}
      <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-slate-900/90 backdrop-blur-2xl border border-slate-800 p-2 rounded-3xl flex justify-around items-center z-50 shadow-2xl">
        {[
          { id: 'home', icon: Activity },
          { id: 'journal', icon: Book },
          { id: 'media', icon: ImageIcon },
          { id: 'stats', icon: BarChart3 }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-4 rounded-2xl transition-all ${activeTab === tab.id ? 'bg-red-600 text-white shadow-lg shadow-red-600/20' : 'text-slate-500 hover:text-slate-300'}`}
          >
            <tab.icon size={22} />
          </button>
        ))}
      </nav>

      <main className="p-6 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          <motion.div 
            key={activeTab} 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            
            {/* HUB / MOOD TAB */}
            {activeTab === 'home' && (
              <div className="space-y-8 py-10">
                <div className="text-center">
                  <p className="text-[10px] text-slate-500 uppercase tracking-[0.3em] mb-10">Shared_Status_Signal</p>
                  <div className="grid grid-cols-2 gap-4">
                    {MOODS.map((m) => (
                      <button 
                        key={m.id}
                        onClick={() => updateMood(m.id)}
                        className={`p-8 rounded-[2.5rem] border transition-all flex flex-col items-center gap-4 ${dbData.mood === m.id ? 'bg-slate-900 border-slate-700 shadow-xl' : 'bg-transparent border-slate-900 opacity-30 hover:opacity-100'}`}
                      >
                        <m.icon size={36} className={dbData.mood === m.id ? m.color : 'text-slate-600'} />
                        <span className="text-[9px] uppercase font-black tracking-widest">{m.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOG / JOURNAL TAB */}
            {activeTab === 'journal' && (
              <div className="bg-slate-900 p-6 rounded-[2.5rem] border border-slate-800">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Encrypted_Log</h3>
                  <button onClick={() => isEditing ? saveJournal() : setIsEditing(true)} className="text-red-500 bg-slate-950 p-2 rounded-full border border-slate-800">
                    {isEditing ? <Save size={20} /> : <Edit3 size={20} />}
                  </button>
                </div>
                {isEditing ? (
                  <textarea 
                    className="w-full h-64 bg-slate-950 border border-slate-800 p-4 rounded-2xl outline-none focus:border-red-600 text-slate-200" 
                    value={newNote} 
                    onChange={(e) => setNewNote(e.target.value)} 
                  />
                ) : (
                  <p className="text-xl leading-relaxed italic text-slate-300 font-serif">"{dbData.content || "Silence is the only signal..."}"</p>
                )}
                <div className="mt-8 pt-6 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-600 uppercase tracking-widest font-black">
                   <span className="flex items-center gap-2"><CheckCircle2 size={12} className="text-green-500"/> Secure</span>
                   <span>Auto-Streak Active</span>
                </div>
              </div>
            )}

            {/* MEM / MEDIA TAB */}
            {activeTab === 'media' && (
              <div className="space-y-6">
                <div className="aspect-square bg-slate-900 rounded-[2.5rem] border border-slate-800 overflow-hidden flex items-center justify-center relative shadow-inner">
                  {dbData.mediaUrl ? (
                    <video key={dbData.mediaUrl} src={dbData.mediaUrl} controls className="w-full h-full object-cover" />
                  ) : (
                    <ImageIcon size={48} className="text-slate-800 animate-pulse" />
                  )}
                </div>
                
                <label className="w-full py-12 border-2 border-dashed border-slate-800 rounded-[2.5rem] text-slate-500 flex flex-col items-center cursor-pointer hover:bg-slate-900/50 transition-all group overflow-hidden relative">
                  {isUploading ? (
                    <div className="text-center z-10">
                      <div className="text-5xl font-black text-red-600 mb-2">{Math.round(uploadProgress)}%</div>
                      <div className="text-[9px] uppercase tracking-widest font-bold">Transmitting_Data...</div>
                      <div className="absolute bottom-0 left-0 h-2 bg-red-600 transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  ) : (
                    <>
                      <Upload size={30} className="mb-3 group-hover:text-red-500 transition-colors" />
                      <span className="text-[10px] uppercase font-black tracking-widest">Update Memory</span>
                    </>
                  )}
                  <input type="file" className="hidden" disabled={isUploading} onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setIsUploading(true);
                    const storageRef = ref(storage, `memories/${Date.now()}_${file.name}`);
                    const uploadTask = uploadBytesResumable(storageRef, file);
                    uploadTask.on('state_changed', 
                      (s) => setUploadProgress((s.bytesTransferred / s.totalBytes) * 100),
                      (err) => { console.error(err); setIsUploading(false); },
                      async () => {
                        const url = await getDownloadURL(uploadTask.snapshot.ref);
                        await updateDoc(doc(db, "vault", "data"), { mediaUrl: url });
                        setIsUploading(false);
                        setUploadProgress(0);
                      }
                    );
                  }} />
                </label>
              </div>
            )}

            {/* DATA / STATS TAB */}
            {activeTab === 'stats' && (
              <div className="grid grid-cols-1 gap-4">
                <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 text-center">
                  <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-4">Time_Elapsed</p>
                  <p className="text-7xl font-black tracking-tighter tabular-nums">
                    {Math.floor((new Date().getTime() - new Date("2025-10-13").getTime()) / (1000 * 60 * 60 * 24))}
                  </p>
                  <p className="text-[10px] text-slate-600 uppercase mt-4 tracking-widest font-bold">Days since start</p>
                </div>
              </div>
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      <button onClick={() => setIsAuthorized(false)} className="fixed top-6 right-6 p-3 text-slate-700 hover:text-red-500 transition-colors">
        <LogOut size={20} />
      </button>
    </div>
  );
}