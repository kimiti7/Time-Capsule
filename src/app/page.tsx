"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Flame, Lock, CheckCircle2, Edit3, Save, LogOut, Image as ImageIcon, Book, BarChart3, Upload } from 'lucide-react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";

// --- YOUR FIREBASE CONFIG ---
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

export default function TimeCapsule() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // home, journal, media, stats
  const [dbData, setDbData] = useState<any>({ content: "", streak: 0, mediaUrl: "" });
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  const [password, setPassword] = useState("");

  const SECRET_WORD = "Sacrifice";

  useEffect(() => {
    if (isAuthorized) {
      const docRef = doc(db, "vault", "data");
      return onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setDbData(docSnap.data());
          setNewNote(docSnap.data().content);
        }
      });
    }
  }, [isAuthorized]);

  const saveJournalAndIncrementStreak = async () => {
    const docRef = doc(db, "vault", "data");
    await updateDoc(docRef, { 
      content: newNote,
      streak: (dbData.streak || 0) + 1, // AUTO-STREAK!
      lastUpdated: serverTimestamp() 
    });
    setIsEditing(false);
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-4">
         <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 2 }} className="text-red-600 mb-8">
          <Activity size={60} />
        </motion.div>
        <input 
          type="password" 
          placeholder="ACCESS CODE" 
          className="bg-transparent border-b border-white/20 text-red-500 outline-none p-2 text-center tracking-widest"
          onChange={(e) => e.target.value.toLowerCase() === SECRET_WORD.toLowerCase() && setIsAuthorized(true)}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-4 font-mono">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-8 border-b border-white/10 pb-4">
        <h1 className="text-xl font-black tracking-tighter italic">CAPSULE_OS.v3</h1>
        <button onClick={() => setIsAuthorized(false)} className="text-white/40"><LogOut size={20}/></button>
      </div>

      {/* TAB NAVIGATION */}
      <div className="flex justify-around mb-8 bg-white/5 p-2 rounded-2xl border border-white/10">
        {[
          { id: 'home', icon: Activity },
          { id: 'journal', icon: Book },
          { id: 'media', icon: ImageIcon },
          { id: 'stats', icon: BarChart3 }
        ].map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`p-3 rounded-xl transition-all ${activeTab === tab.id ? 'bg-red-600 text-white' : 'text-white/40'}`}
          >
            <tab.icon size={24} />
          </button>
        ))}
      </div>

      {/* CONTENT AREA */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -10, opacity: 0 }}
          className="min-h-[400px]"
        >
          {activeTab === 'home' && (
            <div className="space-y-6 text-center">
              <div className="bg-gradient-to-br from-red-900/20 to-black p-12 rounded-3xl border border-red-500/20">
                <Flame size={80} className="mx-auto text-red-500 mb-4 animate-pulse" />
                <h2 className="text-4xl font-bold">{dbData.streak}</h2>
                <p className="text-white/40 uppercase text-xs tracking-widest mt-2">Active_Streak</p>
              </div>
            </div>
          )}

          {activeTab === 'journal' && (
            <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-red-500 text-sm font-bold uppercase">Private_Log</h3>
                <button onClick={() => isEditing ? saveJournalAndIncrementStreak() : setIsEditing(true)}>
                  {isEditing ? <Save className="text-green-500" /> : <Edit3 className="text-white/40" />}
                </button>
              </div>
              {isEditing ? (
                <textarea 
                  className="w-full h-40 bg-black border border-white/20 p-4 rounded-xl outline-none focus:border-red-500"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                />
              ) : (
                <p className="text-lg leading-relaxed text-white/80 italic">"{dbData.content}"</p>
              )}
              <p className="text-[10px] text-white/20 mt-4 uppercase">Saving updates the streak automatically.</p>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="space-y-4">
              <div className="aspect-video bg-white/5 rounded-3xl border border-white/10 flex items-center justify-center overflow-hidden">
                {dbData.mediaUrl ? (
                  <video src={dbData.mediaUrl} controls className="w-full h-full object-cover" />
                ) : (
                  <p className="text-white/20 text-xs">NO_MEDIA_SYNCED</p>
                )}
              </div>
              <button className="w-full py-4 border-2 border-dashed border-white/10 rounded-3xl text-white/20 flex flex-col items-center hover:bg-white/5 transition-all">
                <Upload size={24} className="mb-2" />
                <span className="text-[10px] uppercase">Upload_New_Memory</span>
              </button>
            </div>
          )}

          {activeTab === 'stats' && (
            <div className="grid grid-cols-1 gap-4">
              <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
                <p className="text-white/40 text-[10px] uppercase">Total_Days</p>
                <p className="text-4xl font-bold mt-2">
                  {Math.floor((new Date().getTime() - new Date("2025-10-13").getTime()) / (1000 * 60 * 60 * 24))}
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}