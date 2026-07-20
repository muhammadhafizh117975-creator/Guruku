/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { MenuType } from './types';
import { initStorage, getFromStorage, triggerAutoBackup } from './store';

// Views
import Sidebar from './components/Sidebar';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import LoginView from './components/LoginView';
import DashboardView from './components/DashboardView';
import DataMasterView from './components/DataMasterView';
import AcademicView from './components/AcademicView';
import ReportsView from './components/ReportsView';
import ProfileView from './components/ProfileView';
import AppSettingsView from './components/AppSettingsView';
import SpreadsheetView from './components/SpreadsheetView';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentMenu, setCurrentMenu] = useState<MenuType | 'spreadsheet'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('guruku_theme');
    return saved === 'dark';
  });

  // Initialize DB Tables & Check Active Sessions on Mount
  useEffect(() => {
    // Clear reset active flag if any on boot
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem('guruku_reset_active');
    }

    // 1. Initialise mock database seed records
    initStorage();
    
    // Create background auto backup if anything changed
    triggerAutoBackup();

    // 2. Read active session
    const sessionStr = localStorage.getItem('guruku_session') || sessionStorage.getItem('guruku_session');
    if (sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        if (session.loggedIn) {
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.error('Failed to restore active session:', e);
      }
    }
  }, []);

  // Update theme classes on document element
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('guruku_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('guruku_theme', 'light');
    }
  }, [darkMode]);

  const handleToggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleLogout = () => {
    // Clear sessions
    localStorage.removeItem('guruku_session');
    sessionStorage.removeItem('guruku_session');
    setIsLoggedIn(false);
    setCurrentMenu('dashboard');
  };

  // Switch menus
  const handleMenuChange = (menu: MenuType | 'spreadsheet') => {
    setCurrentMenu(menu);
  };

  if (!isLoggedIn) {
    return (
      <LoginView onLoginSuccess={() => setIsLoggedIn(true)} />
    );
  }

  // Load print margins dynamically from local storage
  let printMargins = { top: 1.0, bottom: 1.0, left: 1.0, right: 1.0 };
  try {
    const settingsStr = localStorage.getItem('guruku_app_settings');
    if (settingsStr) {
      const settings = JSON.parse(settingsStr);
      printMargins = {
        top: typeof settings.printMarginTop === 'number' ? settings.printMarginTop : 1.0,
        bottom: typeof settings.printMarginBottom === 'number' ? settings.printMarginBottom : 1.0,
        left: typeof settings.printMarginLeft === 'number' ? settings.printMarginLeft : 1.0,
        right: typeof settings.printMarginRight === 'number' ? settings.printMarginRight : 1.0,
      };
    }
  } catch (e) {
    console.error('Failed to parse app settings for margins:', e);
  }

  return (
    <div className="flex h-screen bg-[#f5f5f9] dark:bg-[#232333] overflow-hidden transition-colors duration-300">
      {/* Dynamic print margin styles based on App Settings */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin-top: ${printMargins.top}cm !important;
            margin-bottom: ${printMargins.bottom}cm !important;
            margin-left: ${printMargins.left}cm !important;
            margin-right: ${printMargins.right}cm !important;
          }
        }
      `}</style>
      
      {/* 1. Sidebar Navigation */}
      <Sidebar
        currentMenu={currentMenu}
        onChangeMenu={handleMenuChange}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        onLogout={handleLogout}
      />

      {/* 2. Main Viewport Panel */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        
        {/* Navbar */}
        <Navbar
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          darkMode={darkMode}
          onToggleDarkMode={handleToggleDarkMode}
          onLogout={handleLogout}
          onChangeMenu={handleMenuChange}
        />

        {/* Content Section */}
        <main className="flex-1 overflow-y-auto px-6 py-6 space-y-6 custom-scrollbar print:overflow-visible print:px-0 print:py-0 print:bg-white">
          
          {/* Main Dashboard Widget view */}
          {currentMenu === 'dashboard' && (
            <DashboardView onChangeMenu={handleMenuChange} />
          )}

          {/* Master views (subjects, classes, students) */}
          {(currentMenu === 'subjects' || currentMenu === 'classes' || currentMenu === 'students') && (
            <DataMasterView currentMenu={currentMenu} />
          )}

          {/* Academic input views (grades, attendance, journals, modul_ajar) */}
          {(currentMenu === 'grades' || currentMenu === 'attendance' || currentMenu === 'journals' || currentMenu === 'modul_ajar') && (
            <AcademicView currentMenu={currentMenu} />
          )}

          {/* Laporan reports views (nilal, attendance, journals reports) */}
          {(currentMenu === 'report_grades' || currentMenu === 'report_attendance' || currentMenu === 'report_journals') && (
            <ReportsView currentMenu={currentMenu} />
          )}

          {/* Setting views (profiles, change passwords) */}
          {currentMenu === 'profile' && (
            <ProfileView />
          )}

          {currentMenu === 'app_settings' && (
            <AppSettingsView />
          )}

          {/* Real-time raw G-Sheet spreadsheet DB view */}
          {currentMenu === 'spreadsheet' && (
            <SpreadsheetView />
          )}

        </main>

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}
