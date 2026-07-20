/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Profile } from '../types';
import { getFromStorage, saveToStorage } from '../store';
import { 
  User, 
  Lock, 
  Mail, 
  Phone, 
  CreditCard, 
  Save, 
  Check, 
  Sparkles,
  Info
} from 'lucide-react';

export default function ProfileView() {
  const [profile, setProfile] = useState<Profile>(() => getFromStorage<Profile>('guruku_profiles', {
    name: 'Muhammad Hafizh, S.Pd.',
    nip_nuptk: '19920824 201803 1 004',
    email: 'muhammad.hafizh117975@guru.smp.belajar.id',
    hp: '081234567890',
    photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&h=300&q=80'
  }));

  // Inputs
  const [name, setName] = useState(profile.name);
  const [nip, setNip] = useState(profile.nip_nuptk);
  const [nipNuptkType, setNipNuptkType] = useState<'NIP' | 'NUPTK'>(profile.nip_nuptk_type || 'NIP');
  const [email, setEmail] = useState(profile.email);
  const [hp, setHp] = useState(profile.hp);
  const [photo, setPhoto] = useState(profile.photoUrl);

  // Password fields
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const triggerAlert = (message: string, type: 'success' | 'danger' = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 2500);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      triggerAlert('Nama Guru dan Email wajib diisi!', 'danger');
      return;
    }

    const updated: Profile = {
      name,
      nip_nuptk: nip,
      nip_nuptk_type: nipNuptkType,
      email,
      hp,
      photoUrl: photo
    };

    setProfile(updated);
    saveToStorage('guruku_profiles', updated);
    triggerAlert('Profil Guru berhasil diperbarui!');
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    const savedPassword = localStorage.getItem('guruku_password') || 'password123';

    if (!currentPassword || !newPassword) {
      triggerAlert('Semua field password wajib diisi!', 'danger');
      return;
    }

    if (currentPassword !== savedPassword) {
      triggerAlert('Password saat ini salah!', 'danger');
      return;
    }

    if (newPassword.length < 6) {
      triggerAlert('Password baru minimal 6 karakter!', 'danger');
      return;
    }

    if (newPassword !== confirmPassword) {
      triggerAlert('Konfirmasi password baru tidak cocok!', 'danger');
      return;
    }

    localStorage.setItem('guruku_password', newPassword);
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    triggerAlert('Password berhasil diperbarui!');
  };

  // Avatar presets
  const avatars = [
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=150&h=150&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=150&h=150&q=80'
  ];

  return (
    <div className="space-y-6">
      
      {/* Alert Overlay */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm flex items-center gap-2.5 animate-bounce ${
          alert.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <Check className="w-4 h-4 shrink-0" />
          <span>{alert.message}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Avatar & Quick Info Card (1/3 width) */}
        <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs h-fit transition-colors">
          <div className="flex flex-col items-center text-center">
            
            <img
              src={photo || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&h=300&q=80"}
              alt="Foto Profil"
              referrerPolicy="no-referrer"
              className="w-28 h-28 rounded-2xl object-cover ring-4 ring-indigo-500/10 mb-4 shadow-sm"
            />
            
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-base">{profile.name}</h3>
            <p className="text-xs text-gray-400 mt-1">{profile.email}</p>
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-[#696cff] text-[10px] font-bold rounded-full mt-3 uppercase tracking-wider">
              {profile.nip_nuptk_type || 'NIP'}: {profile.nip_nuptk || 'BELUM DIATUR'}
            </span>

            {/* Quick stats list */}
            <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800/80 space-y-3 text-left">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Status Jabatan</span>
                <span className="font-bold text-gray-700 dark:text-gray-300">Guru Utama / Pembina</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Koneksi DB</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">Google Sheet Active</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Sistem Lisensi</span>
                <span className="font-mono text-[10px] bg-gray-50 dark:bg-[#232333] px-2 py-0.5 rounded text-gray-500">GuruKu_PRO_2026</span>
              </div>
            </div>

            {/* Avatar Preset Selector */}
            <div className="w-full mt-6 pt-6 border-t border-gray-100 dark:border-neutral-800/80">
              <p className="text-[10px] font-bold text-left text-gray-400 uppercase tracking-wider mb-2.5">Pilih Avatar Instan</p>
              <div className="flex justify-center gap-2">
                {avatars.map((url, index) => (
                  <button
                    key={index}
                    onClick={() => setPhoto(url)}
                    className={`w-10 h-10 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      photo === url ? 'border-[#696cff] scale-105' : 'border-transparent opacity-80'
                    }`}
                  >
                    <img src={url} alt="preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Edit Profile Fields & Password Form (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Edit Profile Panel */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs transition-colors">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4 flex items-center gap-2">
              <User className="w-4.5 h-4.5 text-[#696cff]" />
              <span>Detail Informasi Guru</span>
            </h4>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nama Lengkap & Gelar</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <User className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Contoh: Muhammad Hafizh, S.Pd."
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Pilihan Identitas Guru</label>
                  <div className="flex gap-4 mb-2">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="nipNuptkType"
                        value="NIP"
                        checked={nipNuptkType === 'NIP'}
                        onChange={() => setNipNuptkType('NIP')}
                        className="text-[#696cff] focus:ring-[#696cff]"
                      />
                      <span>NIP (PNS)</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs text-gray-700 dark:text-gray-300">
                      <input
                        type="radio"
                        name="nipNuptkType"
                        value="NUPTK"
                        checked={nipNuptkType === 'NUPTK'}
                        onChange={() => setNipNuptkType('NUPTK')}
                        className="text-[#696cff] focus:ring-[#696cff]"
                      />
                      <span>NUPTK (Non-PNS)</span>
                    </label>
                  </div>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <CreditCard className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={nip}
                      onChange={(e) => setNip(e.target.value)}
                      placeholder={nipNuptkType === 'NIP' ? 'Contoh NIP: 19920824 201803 1 004' : 'Contoh NUPTK: 1029310293810293'}
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Alamat Email Belajar.id</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Mail className="w-4 h-4" />
                    </span>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="email@guru.smp.belajar.id"
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Nomor WhatsApp / HP</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                      <Phone className="w-4 h-4" />
                    </span>
                    <input
                      type="text"
                      value={hp}
                      onChange={(e) => setHp(e.target.value)}
                      placeholder="Contoh: 0812345678"
                      className="w-full pl-9 pr-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">URL Foto Profil Custom</label>
                <input
                  type="text"
                  value={photo}
                  onChange={(e) => setPhoto(e.target.value)}
                  placeholder="Link gambar foto profil..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-mono"
                />
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Perbarui Profil</span>
                </button>
              </div>

            </form>
          </div>

          {/* Change Password Panel */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs transition-colors">
            <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4 flex items-center gap-2">
              <Lock className="w-4.5 h-4.5 text-[#696cff]" />
              <span>Ganti Kredensial Password</span>
            </h4>

            <form onSubmit={handleChangePassword} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Password Saat Ini</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Password Baru</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 6 karakter"
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Ulangi Password Baru</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  />
                </div>

              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Ubah Sandi Akun</span>
                </button>
              </div>

            </form>
          </div>

        </div>

      </div>

    </div>
  );
}
