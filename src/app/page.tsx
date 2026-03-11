"use client";
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function Vault() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  // Using <any> here prevents TypeScript build errors
  const [dbData, setDbData] = useState<any>({ content: "", streak: 0 });
  const SECRET_WORD = "Sacrifice";

  useEffect(() => {
    if (isAuthorized) {
      // Fetching data from the 'notes' table
      supabase
        .from('notes')
        .select('content, streak')
        .eq('id', 1)
        .single()
        .then(({ data, error }) => {
          if (data) setDbData(data);
          if (error) console.error("Supabase Fetch Error:", error);
        });
    }
  }, [isAuthorized]);

  const handleAccess = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPassword(value);
    if (value.toLowerCase() === SECRET_WORD.toLowerCase()) {
      setIsAuthorized(true);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 p-4">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.8 }} className="text-red-500 mb-8">
          <Activity size={80} />
        </motion.div>
        <div className="flex items-center border-b border-slate-700 py-2">
          <input 
            type="password" 
            placeholder="Enter Override Key..." 
            className="bg-transparent text-red-400 outline-none text-center" 
            value={password} 
            onChange={handleAccess} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 md:p-12 text-slate-100">
      <h1 className="text-3xl font-bold mb-8">Double.G Time Capsule</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Vital Signs */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase">Present Age</h2>
          <p className="text-5xl font-bold text-red-500 mt-4">
            {Math.floor((new Date().getTime() - new Date("2025-10-13").getTime()) / (1000 * 60 * 60 * 24))}
          </p>
        </div>

        {/* Vault Content */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase">GG Vault</h2>
          <p className="text-slate-300 italic mt-6">{dbData.content || "Loading..."}</p>
        </div>

        {/* Streak */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl">
          <h2 className="text-xs font-bold text-slate-500 uppercase">Streak</h2>
          <p className="text-5xl font-bold text-green-400 mt-4">{dbData.streak || 0}</p>
        </div>

        {/* Media Gallery */}
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-3xl md:col-span-2 lg:col-span-1">
          <h2 className="text-xs font-bold text-slate-500 uppercase mb-4">Media</h2>
          <video 
            src="https://res.cloudinary.com/ddb1mvgax/video/upload/v1772827639/WhatsApp_Video_2026-03-06_at_11.02.50_PM_tvfl9n.mp4" 
            className="w-full h-32 object-cover rounded-xl" 
            controls
          />
        </div>
      </div>
    </div>
  );
}