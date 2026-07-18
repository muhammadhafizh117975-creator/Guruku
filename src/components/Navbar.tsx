/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Profile } from '../types';
import { getFromStorage } from '../store';
import { 
  Sun, 
  Moon, 
  Menu, 
  Bell, 
  Search, 
  CloudLightning,
  RefreshCw,
  LogOut,
  User,
  Clock,
  ArrowRight
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  onLogout: () => void;
  onChangeMenu: (menu: any) => void;
}

export default function Navbar({ onToggleSidebar, darkMode, onToggleDarkMode, onLogout, onChangeMenu }: NavbarProps) {
  const profile = getFromStorage<Profile>('guruku_profiles', {
    name: 'Muhammad Hafizh, S.Pd.',
    nip_nuptk: '19920824 201803 1 004',
    email: 'muhammad.hafizh117975@guru.smp.belajar.id',
    hp: '081234567890',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&h=300&q=80'
  });

  const [currentTime, setCurrentTime] = useState(new Date());
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncTime, setSyncTime] = useState('23:05');

  // Real-time Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => {
      setSyncing(false);
      const now = new Date();
      const pad = (n: number) => n.toString().padStart(2, '0');
      setSyncTime(`${pad(now.getHours())}:${pad(now.getMinutes())}`);
    }, 1200);
  };

  const formattedDate = currentTime.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = currentTime.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <header className="h-16 bg-white dark:bg-[#2b2c40] border-b border-gray-100 dark:border-neutral-800 px-6 flex items-center justify-between sticky top-0 z-30 transition-colors duration-300">
      
      {/* Left items */}
      <div className="flex items-center gap-4">
        {/* Toggle Sidebar (Mobile) */}
        <button
          onClick={onToggleSidebar}
          className="p-2 -ml-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-[#232333] transition"
          title="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Dynamic Live Clock (Deskop / Tablet) */}
        <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 font-medium">
          <Clock className="w-4 h-4 text-[#696cff]" />
          <span>{formattedDate}</span>
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-[#696cff] font-mono text-xs ml-1">
            {formattedTime} UTC
          </span>
        </div>
      </div>

      {/* Right items */}
      <div className="flex items-center gap-2 sm:gap-3.5">
        
        {/* Spreadsheet Sync Button */}
        <button
          onClick={handleSync}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-[#696cff] bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-100/50 dark:border-indigo-900/40 hover:bg-indigo-100/50 transition cursor-pointer select-none"
          title="Sinkronkan dengan Google Spreadsheet"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin' : ''}`} />
          <span className="hidden md:inline">{syncing ? 'Sinkronisasi...' : 'Sinkron Spreadsheet'}</span>
          <span className="text-[10px] opacity-75 font-mono hidden lg:inline">({syncTime})</span>
        </button>

        {/* Dark Mode Switcher */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232333] transition cursor-pointer"
          title={darkMode ? "Aktifkan Light Mode" : "Aktifkan Dark Mode"}
        >
          {darkMode ? (
            <Sun className="w-5 h-5 text-amber-500" />
          ) : (
            <Moon className="w-5 h-5 text-indigo-500" />
          )}
        </button>

        {/* User Dropdown Trigger */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-gray-50 dark:hover:bg-[#232333] transition focus:outline-none"
          >
            <img
              src={profile.photoUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&h=300&q=80"}
              alt="Foto Profil"
              referrerPolicy="no-referrer"
              className="w-8 h-8 rounded-lg object-cover ring-2 ring-indigo-500/10"
            />
            <div className="hidden md:block text-left">
              <p className="text-xs font-semibold text-gray-800 dark:text-gray-200 leading-tight">
                {profile.name}
              </p>
              <p className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                {profile.nip_nuptk}
              </p>
            </div>
          </button>

          {/* User Dropdown Menu */}
          {showProfileMenu && (
            <>
              {/* Overlay back to close */}
              <div 
                className="fixed inset-0 z-30" 
                onClick={() => setShowProfileMenu(false)} 
              />
              
              <div className="absolute right-0 mt-2.5 w-60 bg-white dark:bg-[#2b2c40] rounded-xl shadow-xl border border-gray-100 dark:border-neutral-800 py-2.5 z-40 transform origin-top-right transition-all">
                <div className="px-4 py-2 border-b border-gray-50 dark:border-neutral-800 mb-2">
                  <p className="text-sm font-bold text-gray-800 dark:text-gray-100 truncate">
                    {profile.name}
                  </p>
                  <p className="text-xs text-[#696cff] truncate mt-0.5">
                    {profile.email}
                  </p>
                </div>

                <button
                  onClick={() => {
                    onChangeMenu('profile');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#232333] transition-colors"
                >
                  <User className="w-4 h-4 text-gray-400" />
                  <span>Ubah Profil Guru</span>
                </button>

                <button
                  onClick={() => {
                    onChangeMenu('spreadsheet');
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#232333] transition-colors"
                >
                  <CloudLightning className="w-4 h-4 text-[#696cff]" />
                  <span>Panduan Penggunaan</span>
                </button>

                <div className="h-px bg-gray-50 dark:bg-neutral-800 my-2" />

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors text-left"
                >
                  <LogOut className="w-4 h-4 text-rose-500" />
                  <span>Keluar dari Aplikasi</span>
                </button>
              </div>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
