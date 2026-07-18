/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MenuType } from '../types';
import { 
  LayoutDashboard, 
  BookOpen, 
  Layers, 
  Users, 
  GraduationCap, 
  CalendarCheck, 
  FileSpreadsheet, 
  FileText, 
  ClipboardList, 
  BookOpenCheck,
  User, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu,
  Database
} from 'lucide-react';

interface SidebarProps {
  currentMenu: MenuType | 'spreadsheet';
  onChangeMenu: (menu: MenuType | 'spreadsheet') => void;
  isOpen: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({ currentMenu, onChangeMenu, isOpen, onToggle, onLogout }: SidebarProps) {
  
  const menuGroups = [
    {
      title: 'Utama',
      items: [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      ]
    },
    {
      title: 'Data Master',
      items: [
        { id: 'subjects', label: 'Mata Pelajaran', icon: BookOpen },
        { id: 'classes', label: 'Kelas', icon: Layers },
        { id: 'students', label: 'Siswa', icon: Users },
      ]
    },
    {
      title: 'Administrasi Guru',
      items: [
        { id: 'modul_ajar', label: 'Modul Ajar', icon: BookOpenCheck },
        { id: 'journals', label: 'Jurnal', icon: FileText },
        { id: 'attendance', label: 'Absen', icon: CalendarCheck },
        { id: 'grades', label: 'Nilai Siswa', icon: GraduationCap },
      ]
    },
    {
      title: 'Laporan',
      items: [
        { id: 'report_grades', label: 'Laporan Nilai', icon: BookOpenCheck },
        { id: 'report_attendance', label: 'Laporan Absensi', icon: ClipboardList },
        { id: 'report_journals', label: 'Laporan Jurnal', icon: FileSpreadsheet },
      ]
    },
    {
      title: 'Pengaturan',
      items: [
        { id: 'profile', label: 'Profil Guru', icon: User },
        { id: 'app_settings', label: 'Pengaturan Aplikasi', icon: Settings },
        { id: 'spreadsheet', label: 'Panduan Penggunaan', icon: BookOpen },
      ]
    }
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          onClick={onToggle}
          className="lg:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`fixed lg:static top-0 left-0 bottom-0 z-50 w-64 bg-white dark:bg-[#2b2c40] border-r border-gray-100 dark:border-neutral-800 transition-all duration-300 transform 
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-64'} 
          flex flex-col h-screen shrink-0`}
      >
        {/* Brand / Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-50 dark:border-neutral-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-950/40 rounded-lg flex items-center justify-center">
              <BookOpen className="w-4.5 h-4.5 text-[#696cff]" />
            </div>
            <span className="font-bold text-lg text-gray-800 dark:text-gray-100 tracking-tight">
              Guru<span className="text-[#696cff]">Ku</span>
            </span>
          </div>

          <button 
            onClick={onToggle}
            className="lg:hidden p-1.5 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232333] transition"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items (Scrollable) */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-5 custom-scrollbar">
          {menuGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-widest text-gray-400 dark:text-gray-500 uppercase mb-2">
                {group.title}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = currentMenu === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        onChangeMenu(item.id as any);
                        // Auto-close sidebar on mobile after clicking
                        if (window.innerWidth < 1024) {
                          onToggle();
                        }
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                        isActive 
                          ? 'bg-indigo-50/80 dark:bg-indigo-950/30 text-[#696cff]' 
                          : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-[#232333] hover:text-gray-900 dark:hover:text-gray-200'
                      }`}
                    >
                      <Icon className={`w-4.5 h-4.5 shrink-0 ${isActive ? 'text-[#696cff]' : 'text-gray-400 dark:text-gray-500'}`} />
                      <span>{item.label}</span>
                      {isActive && (
                        <div className="ml-auto w-1 h-5 rounded-full bg-[#696cff]" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Logout Button inside Navbar / Sidebar footer */}
          <div className="pt-4 border-t border-gray-100 dark:border-neutral-800">
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-150"
            >
              <LogOut className="w-4.5 h-4.5 shrink-0" />
              <span>Keluar Sesi</span>
            </button>
          </div>
        </nav>

        {/* Footer info in Sidebar */}
        <div className="p-4 bg-gray-50 dark:bg-[#252538] border-t border-gray-100 dark:border-neutral-800 flex items-center gap-2.5 shrink-0">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[10px] text-gray-400 dark:text-gray-500 font-mono tracking-tight truncate">
            Database: Lokal Aktif
          </span>
        </div>
      </aside>
    </>
  );
}
