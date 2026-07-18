/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { getFromStorage, saveToStorage } from '../store';
import { Profile } from '../types';
import { BookOpen, Key, Mail, Lock, CheckCircle, RefreshCw, AlertCircle, User, UserPlus } from 'lucide-react';
import { motion } from 'motion/react';

interface LoginViewProps {
  onLoginSuccess: () => void;
}

export default function LoginView({ onLoginSuccess }: LoginViewProps) {
  // Mode: 'login', 'register', 'reset'
  const [viewMode, setViewMode] = useState<'login' | 'register' | 'reset'>('login');

  // Input States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Register Form Fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');

  // Reset Password Flow state
  const [resetEmail, setResetEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Helper to save database of previous user and load database of logging in user
  const swapDatabase = (targetEmail: string, isNewAccount: boolean = false, newName: string = '') => {
    // 1. If currently logged in, we could backup their current data, but since they're logged out here, we assume active keys are safe.
    
    const cleanEmail = targetEmail.toLowerCase().trim();
    const defaultEmail = 'muhammad.hafizh117975@guru.smp.belajar.id';

    if (cleanEmail === defaultEmail) {
      // Restore default seed database if there's no backup yet (the helper initStorage handles defaults)
      const hasDefaultData = localStorage.getItem('guruku_profiles');
      if (!hasDefaultData) {
        localStorage.removeItem('guruku_subjects');
        localStorage.removeItem('guruku_classes');
        localStorage.removeItem('guruku_students');
        localStorage.removeItem('guruku_grades');
        localStorage.removeItem('guruku_attendance');
        localStorage.removeItem('guruku_teaching_journals');
      }
      return;
    }

    // Backup current data if it belongs to someone else
    const currentActiveProfile = getFromStorage<Profile | null>('guruku_profiles', null);
    if (currentActiveProfile && currentActiveProfile.email.toLowerCase().trim() !== defaultEmail) {
      const activeEmail = currentActiveProfile.email.toLowerCase().trim();
      localStorage.setItem(`guruku_profile_backup_${activeEmail}`, localStorage.getItem('guruku_profiles') || '');
      localStorage.setItem(`guruku_subjects_backup_${activeEmail}`, localStorage.getItem('guruku_subjects') || '[]');
      localStorage.setItem(`guruku_classes_backup_${activeEmail}`, localStorage.getItem('guruku_classes') || '[]');
      localStorage.setItem(`guruku_students_backup_${activeEmail}`, localStorage.getItem('guruku_students') || '[]');
      localStorage.setItem(`guruku_grades_backup_${activeEmail}`, localStorage.getItem('guruku_grades') || '[]');
      localStorage.setItem(`guruku_attendance_backup_${activeEmail}`, localStorage.getItem('guruku_attendance') || '[]');
      localStorage.setItem(`guruku_teaching_journals_backup_${activeEmail}`, localStorage.getItem('guruku_teaching_journals') || '[]');
    }

    if (isNewAccount) {
      // Provision fresh clean database
      const freshProfile: Profile = {
        name: newName || 'Guru Mapel Baru',
        nip_nuptk: '',
        email: cleanEmail,
        hp: '',
        photoUrl: ''
      };

      localStorage.setItem('guruku_profiles', JSON.stringify(freshProfile));
      localStorage.setItem('guruku_subjects', JSON.stringify([]));
      localStorage.setItem('guruku_classes', JSON.stringify([]));
      localStorage.setItem('guruku_students', JSON.stringify([]));
      localStorage.setItem('guruku_grades', JSON.stringify([]));
      localStorage.setItem('guruku_attendance', JSON.stringify([]));
      localStorage.setItem('guruku_teaching_journals', JSON.stringify([]));

      // Backup newly provisioned keys for future swaps
      localStorage.setItem(`guruku_profile_backup_${cleanEmail}`, JSON.stringify(freshProfile));
      localStorage.setItem(`guruku_subjects_backup_${cleanEmail}`, JSON.stringify([]));
      localStorage.setItem(`guruku_classes_backup_${cleanEmail}`, JSON.stringify([]));
      localStorage.setItem(`guruku_students_backup_${cleanEmail}`, JSON.stringify([]));
      localStorage.setItem(`guruku_grades_backup_${cleanEmail}`, JSON.stringify([]));
      localStorage.setItem(`guruku_attendance_backup_${cleanEmail}`, JSON.stringify([]));
      localStorage.setItem(`guruku_teaching_journals_backup_${cleanEmail}`, JSON.stringify([]));
    } else {
      // Load target user's backup
      const backedProfile = localStorage.getItem(`guruku_profile_backup_${cleanEmail}`);
      if (backedProfile) {
        localStorage.setItem('guruku_profiles', backedProfile);
        localStorage.setItem('guruku_subjects', localStorage.getItem(`guruku_subjects_backup_${cleanEmail}`) || '[]');
        localStorage.setItem('guruku_classes', localStorage.getItem(`guruku_classes_backup_${cleanEmail}`) || '[]');
        localStorage.setItem('guruku_students', localStorage.getItem(`guruku_students_backup_${cleanEmail}`) || '[]');
        localStorage.setItem('guruku_grades', localStorage.getItem(`guruku_grades_backup_${cleanEmail}`) || '[]');
        localStorage.setItem('guruku_attendance', localStorage.getItem(`guruku_attendance_backup_${cleanEmail}`) || '[]');
        localStorage.setItem('guruku_teaching_journals', localStorage.getItem(`guruku_teaching_journals_backup_${cleanEmail}`) || '[]');
      } else {
        // Fallback profile if backups not found
        const freshProfile: Profile = {
          name: newName || 'Guru Mapel',
          nip_nuptk: '',
          email: cleanEmail,
          hp: '',
          photoUrl: ''
        };
        localStorage.setItem('guruku_profiles', JSON.stringify(freshProfile));
        localStorage.setItem('guruku_subjects', JSON.stringify([]));
        localStorage.setItem('guruku_classes', JSON.stringify([]));
        localStorage.setItem('guruku_students', JSON.stringify([]));
        localStorage.setItem('guruku_grades', JSON.stringify([]));
        localStorage.setItem('guruku_attendance', JSON.stringify([]));
        localStorage.setItem('guruku_teaching_journals', JSON.stringify([]));
      }
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.toLowerCase().trim();

    if (!cleanEmail || !password) {
      setError('Email dan password wajib diisi.');
      return;
    }

    const defaultEmail = 'muhammad.hafizh117975@guru.smp.belajar.id';
    const defaultPassword = 'password123';

    // Retrieve list of registered accounts
    const registeredAccounts = getFromStorage<{ email: string; password: string; name: string }[]>('guruku_accounts', []);
    const matchingAccount = registeredAccounts.find(acc => acc.email.toLowerCase().trim() === cleanEmail);

    let isAuthorized = false;
    let loggedInName = '';

    if (cleanEmail === defaultEmail && password === defaultPassword) {
      isAuthorized = true;
      loggedInName = 'Muhammad Hafizh, S.Pd.';
    } else if (matchingAccount && matchingAccount.password === password) {
      isAuthorized = true;
      loggedInName = matchingAccount.name;
    }

    if (isAuthorized) {
      setSuccess('Login berhasil! Mengalihkan ke Dashboard...');

      // Swap database to this specific user context
      swapDatabase(cleanEmail, false, loggedInName);

      // Store session
      const sessionData = {
        email: cleanEmail,
        loggedIn: true,
        loginTime: new Date().toISOString(),
        rememberMe
      };

      if (rememberMe) {
        localStorage.setItem('guruku_session', JSON.stringify(sessionData));
      } else {
        sessionStorage.setItem('guruku_session', JSON.stringify(sessionData));
      }

      setTimeout(() => {
        onLoginSuccess();
      }, 1000);
    } else {
      setError('Email atau password salah. Silakan periksa kembali kredensial Anda.');
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const name = regName.trim();
    const rawUsername = regEmail.trim().toLowerCase().replace(/@.*/, '');
    const cleanEmail = `${rawUsername}@smppertiwi.sch.id`;

    if (!name || !rawUsername || !regPassword || !regConfirmPassword) {
      setError('Semua kolom pendaftaran wajib diisi.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password minimal harus 6 karakter.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setError('Konfirmasi password tidak cocok.');
      return;
    }

    const defaultEmail = 'muhammad.hafizh117975@guru.smp.belajar.id';
    if (cleanEmail === defaultEmail) {
      setError('Email ini telah digunakan oleh akun sistem default.');
      return;
    }

    // Retrieve accounts
    const registeredAccounts = getFromStorage<{ email: string; password: string; name: string }[]>('guruku_accounts', []);
    const alreadyExists = registeredAccounts.some(acc => acc.email.toLowerCase().trim() === cleanEmail);

    if (alreadyExists) {
      setError('Email ini sudah terdaftar. Silakan gunakan email lain.');
      return;
    }

    // Register account
    const newAccount = { email: cleanEmail, password: regPassword, name };
    registeredAccounts.push(newAccount);
    saveToStorage('guruku_accounts', registeredAccounts);

    // Swap / provision clean database for this user automatically
    swapDatabase(cleanEmail, true, name);

    setSuccess('Pendaftaran berhasil! Database Anda telah disiapkan secara otomatis. Mengalihkan ke halaman login...');
    
    // Switch back to login view after successful registration
    setTimeout(() => {
      setEmail(cleanEmail);
      setPassword(regPassword);
      setViewMode('login');
      setSuccess('');
    }, 2000);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = resetEmail.toLowerCase().trim();

    if (!cleanEmail) {
      setError('Masukkan alamat email terdaftar.');
      return;
    }

    const defaultEmail = 'muhammad.hafizh117975@guru.smp.belajar.id';
    const registeredAccounts = getFromStorage<{ email: string; password: string; name: string }[]>('guruku_accounts', []);
    
    let isDefaultAccount = cleanEmail === defaultEmail;
    const matchingAccountIdx = registeredAccounts.findIndex(acc => acc.email.toLowerCase().trim() === cleanEmail);

    if (!isDefaultAccount && matchingAccountIdx === -1) {
      setError('Email tidak terdaftar di sistem.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setError('Password baru minimal 6 karakter.');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError('Konfirmasi password baru tidak cocok.');
      return;
    }

    if (isDefaultAccount) {
      localStorage.setItem('guruku_password', newPassword);
    } else {
      registeredAccounts[matchingAccountIdx].password = newPassword;
      saveToStorage('guruku_accounts', registeredAccounts);
    }

    setSuccess('Password berhasil direset! Silakan login dengan password baru Anda.');
    
    setTimeout(() => {
      setEmail(cleanEmail);
      setPassword(newPassword);
      setViewMode('login');
      setSuccess('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f9] dark:bg-[#232333] flex items-center justify-center p-4 transition-colors duration-300">
      <div className="w-full max-w-md bg-white dark:bg-[#2b2c40] rounded-2xl shadow-xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
        
        {/* Banner Decoration */}
        <div className="h-2 bg-[#696cff]" />
        
        <div className="p-8">
          {/* Logo & Header */}
          <div className="flex flex-col items-center mb-6">
            <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center mb-3">
              <BookOpen className="w-6 h-6 text-[#696cff]" />
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Guru<span className="text-[#696cff]">Ku</span>
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 text-center">
              Sistem Informasi Jurnal, Absensi & Modul Ajar Guru Mapel
            </p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 rounded-xl flex items-center gap-2 text-sm border border-red-100 dark:border-red-900/50">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs">{error}</span>
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 text-sm border border-emerald-100 dark:border-emerald-900/50">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="text-xs">{success}</span>
            </div>
          )}

          {viewMode === 'login' && (
            /* Normal Login Form */
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                  Email Guru
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="nama.guru@belajar.id"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('reset');
                      setResetEmail(email);
                    }}
                    className="text-[11px] text-[#696cff] hover:underline"
                  >
                    Lupa Password?
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <Lock className="w-4 h-4" />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-[#696cff] focus:ring-[#696cff] border-gray-300 dark:border-neutral-700 accent-[#696cff]"
                  />
                  <span className="text-xs text-gray-600 dark:text-gray-400">Ingat Sesi Saya</span>
                </label>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#696cff] hover:bg-indigo-600 transition-all text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer"
              >
                Masuk ke Akun Guru
              </button>

              <div className="text-center pt-3 border-t border-gray-50 dark:border-neutral-800/60 mt-4">
                <p className="text-xs text-gray-500">
                  Belum memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setViewMode('register')}
                    className="text-[#696cff] font-semibold hover:underline"
                  >
                    Daftar Akun Baru
                  </button>
                </p>
              </div>
            </form>
          )}

          {viewMode === 'register' && (
            /* Register Account Form */
            <form onSubmit={handleRegister} className="space-y-4">
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl text-[10px] text-[#696cff] leading-relaxed mb-1">
                Membuat akun baru akan menyiapkan database pribadi terisolasi secara otomatis di browser/device ini.
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Nama Lengkap & Gelar
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </span>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={(e) => setRegName(e.target.value)}
                    placeholder="Contoh: Muhammad Hafizh, S.Pd."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Email Guru / Username Baru
                </label>
                <div className="flex rounded-xl bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 overflow-hidden focus-within:border-[#696cff] focus-within:ring-1 focus-within:ring-[#696cff] transition">
                  <div className="pl-3.5 flex items-center text-gray-400 shrink-0">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value.replace(/@.*/, ''))}
                    placeholder="Contoh: hafizhazhar03"
                    className="w-full px-3 py-2 bg-transparent text-gray-800 dark:text-gray-200 focus:outline-none text-sm font-mono"
                  />
                  <div className="px-3 bg-gray-100 dark:bg-[#1a1a26] text-gray-500 dark:text-gray-400 text-[11px] flex items-center border-l border-gray-200 dark:border-neutral-700 font-bold font-mono shrink-0">
                    @smppertiwi.sch.id
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                    Ulangi Password
                  </label>
                  <input
                    type="password"
                    required
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Ulangi password"
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-[#696cff] hover:bg-indigo-600 transition-all text-white text-xs font-semibold rounded-xl shadow-md shadow-indigo-600/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Daftar Akun Baru</span>
              </button>

              <div className="text-center pt-3 border-t border-gray-50 dark:border-neutral-800/60 mt-4">
                <p className="text-xs text-gray-500">
                  Sudah memiliki akun?{' '}
                  <button
                    type="button"
                    onClick={() => setViewMode('login')}
                    className="text-[#696cff] font-semibold hover:underline"
                  >
                    Silakan Login
                  </button>
                </p>
              </div>
            </form>
          )}

          {viewMode === 'reset' && (
            /* Reset Password Form */
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="p-3 bg-indigo-50/50 dark:bg-[#232333] rounded-xl text-xs text-[#696cff] mb-2 leading-relaxed">
                Fitur reset ini akan memperbarui kredensial lokal GuruKu untuk akun Anda.
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Email Terdaftar
                </label>
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="email@belajar.id"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Min 6 karakter"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1">
                  Konfirmasi Password Baru
                </label>
                <input
                  type="password"
                  required
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  placeholder="Ulangi password"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-gray-800 dark:text-gray-200 focus:outline-none focus:border-[#696cff] transition text-sm"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setError('');
                    setSuccess('');
                  }}
                  className="flex-1 py-2 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-semibold hover:bg-gray-50 dark:hover:bg-[#232333] transition cursor-pointer"
                >
                  Kembali
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-[#696cff] text-white rounded-xl text-xs font-semibold hover:bg-indigo-600 transition shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  Simpan Password
                </button>
              </div>
            </form>
          )}
        </div>
        
        {/* Footer info */}
        <div className="px-8 py-4 bg-gray-50 dark:bg-[#252538] border-t border-gray-100 dark:border-neutral-800 text-center text-[10px] text-gray-400 dark:text-gray-500 font-mono">
          GuruKu - all rights reserved by azhr
        </div>
      </div>
    </div>
  );
}
