"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Flame, Lock, CheckCircle2, Edit3, Save, LogOut } from 'lucide-react';
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, doc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";

//  FIREBASE CONFIG
const firebaseConfig = {
  apiKey: "AIzaSyD3vYfhT9Ukphq2fVbNH5c9bGqGpcsd4sA",
  authDomain: "vault-final.firebaseapp.com",
  databaseURL: "https://vault-final-default-rtdb.firebaseio.com",
  projectId: "vault-final",
  storageBucket: "vault-final.firebasestorage.app",
  messagingSenderId: "334310325243",
  appId: "1:334310325243:web:dfd97334aa1009b391e95e",
  measurementId: "G-ZGNMTT5SNH"
};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function Vault() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [dbData, setDbData] = useState<any>({ content: "", streak: 0 });
  const [isEditing, setIsEditing] = useState(false);
  const [newNote, setNewNote] = useState("");
  
  const SECRET_WORD = "Sacrifice";

  useEffect(() => {
    if (isAuthorized) {
      const docRef = doc(db, "vault", "data");
      const unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDbData(data);
          setNewNote(data.content);
        }
      });
      return () => unsubscribe();
    }
  }, [isAuthorized]);

  const incrementStreak = async () => {
    const docRef = doc(db, "vault", "data");
    await updateDoc(docRef, { streak: (dbData.streak || 0) + 1 });
  };

  const saveNote = async () => {
    const docRef = doc(db, "vault", "data");
    await updateDoc(docRef, { content: newNote });
    setIsEditing(false);
  };

  const handleAccess = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.toLowerCase() === SECRET_WORD.toLowerCase()) {
      setIsAuthorized(true);
      setPassword(""); // Clear password after login
    }
  };

  const handleLogout = () => {
    setIsAuthorized(false);
    setPassword("");
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-red-600 mb-8">
          <Activity size={80} />
        </motion.div>
        <div className="flex items-center border-b border-slate-800 py-3 gap-3">
          <Lock size={18} className="text-slate-600" />
          <input 
            type="password" 
            placeholder="Enter Override Key..." 
            className="bg-transparent text-red-400 outline-none text-center placeholder:text-slate-700" 
            value={password} 
            onChange={handleAccess} 
            autoFocus
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100 selection:bg-red-500/30">
      <div className="flex justify-between items-center mb-12 border-l-4 border-red-600 pl-4">
        <h1 className="text-3xl font-bold tracking-tighter uppercase">Vault_System.v2</h1>
        <button 
          onClick={handleLogout}
          className="p-2 hover:bg-slate-900 rounded-full text-slate-500 hover:text-red-500 transition-all"
          title="Secure Exit"
        >
          <LogOut size={20} />
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        
        {/* 1. TIMELINE */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Time Elapsed</h2>
          <p className="text-6xl font-bold text-red-600 mt-4 tabular-nums">
            {Math.floor((new Date().getTime() - new Date("2025-10-13").getTime()) / (1000 * 60 * 60 * 24))}
          </p>
          <p className="text-slate-500 text-sm mt-2 font-mono uppercase">Days_Passed</p>
        </div>

        {/* 2. VAULT NOTE */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl relative group">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">GG Vault</h2>
            <button onClick={() => isEditing ? saveNote() : setIsEditing(true)} className="text-slate-600 hover:text-red-500 transition-colors">
              {isEditing ? <Save size={18} /> : <Edit3 size={18} />}
            </button>
          </div>
          {isEditing ? (
            <textarea 
              className="bg-slate-950 text-slate-200 w-full p-2 rounded border border-slate-700 outline-none focus:border-red-600 text-sm h-24 resize-none"
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
            />
          ) : (
            <p className="text-slate-300 italic text-lg leading-relaxed">"{dbData.content}"</p>
          )}
        </div>

        {/* 3. STREAK */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between">
              <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Streak</h2>
              <Flame size={18} className={dbData.streak > 0 ? "text-orange-500 animate-pulse" : "text-slate-700"} />
            </div>
            <p className="text-6xl font-bold text-green-400 mt-4 tabular-nums">{dbData.streak || 0}</p>
          </div>
          <button 
            onClick={incrementStreak}
            className="mt-6 flex items-center justify-center gap-2 bg-green-500/10 hover:bg-green-500/20 text-green-500 border border-green-500/50 py-2 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            <CheckCircle2 size={16} /> Complete Task
          </button>
        </div>

        {/* 4. MEDIA */}
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Live Feed</h2>
          <video 
            src="https://res.cloudinary.com/ddb1mvgax/video/upload/v1772827639/WhatsApp_Video_2026-03-06_at_11.02.50_PM_tvfl9n.mp4" 
            className="w-full h-32 object-cover rounded-2xl grayscale hover:grayscale-0 transition-all duration-700" 
            controls
          />
        </div>

      </div>
    </div>
  );
}