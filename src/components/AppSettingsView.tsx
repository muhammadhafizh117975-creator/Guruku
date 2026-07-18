/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { 
  Settings, 
  Upload, 
  Trash2, 
  FileDown, 
  FileUp, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar,
  Image as ImageIcon,
  Database,
  FileSpreadsheet,
  Download,
  RefreshCw,
  AlertTriangle,
  Cloud,
  CloudLightning,
  CloudOff,
  User as UserIcon,
  LogOut,
  FolderOpen,
  ArrowDownToLine,
  ArrowUpFromLine,
  FileJson,
  Loader2,
  ExternalLink,
  Plus
} from 'lucide-react';
import { 
  getFromStorage, 
  saveToStorage, 
  exportDatabaseAsSpreadsheetJSON, 
  importDatabaseFromSpreadsheetJSON,
  initStorage
} from '../store';
import { 
  googleSignIn, 
  logoutGoogle, 
  getAccessToken, 
  createGuruKuSpreadsheet, 
  pushDataToSpreadsheet, 
  pullDataFromSpreadsheet,
  uploadBackupToDrive,
  listBackupsFromDrive,
  downloadBackupFromDrive,
  initAuth
} from '../googleService';
import { User } from 'firebase/auth';

interface AppSettings {
  schoolName: string;
  schoolAddress: string;
  schoolContact: string;
  logoDataUrl?: string;
  academicYear: string;
  headmasterName?: string;
  headmasterNip?: string;
}

const DEFAULT_SETTINGS: AppSettings = {
  schoolName: 'SMP NEGERI INDONESIA JAYA',
  schoolAddress: 'Jl. Pendidikan No. 45, Kebayoran, Jakarta Selatan',
  schoolContact: 'Telp: (021) 555-0199 | Email: info@smpn-indonesiajaya.sch.id',
  academicYear: '2025/2026',
  headmasterName: 'Drs. H. Mulyadi, M.Pd.',
  headmasterNip: '19710312 199702 1 002'
};

export default function AppSettingsView() {
  const [settings, setSettings] = useState<AppSettings>(() => {
    return getFromStorage<AppSettings>('guruku_app_settings', DEFAULT_SETTINGS);
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Google Integration States
  const [googleUser, setGoogleUser] = useState<User | null>(null);
  const [gToken, setGToken] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState(false);
  const [isDriveLoading, setIsDriveLoading] = useState(false);
  const [isSheetsLoading, setIsSheetsLoading] = useState(false);
  
  // Sheet config state
  const [sheetConfig, setSheetConfig] = useState(() => {
    return getFromStorage('guruku_spreadsheet_config', {
      connected: false,
      spreadsheetId: '',
      sheetUrl: '',
      lastSynced: ''
    });
  });

  // Backups state
  const [backups, setBackups] = useState<any[]>([]);

  // Auto clear notification
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = initAuth(
      async (user, token) => {
        setGoogleUser(user);
        setGToken(token);
        // Load backups
        try {
          setIsDriveLoading(true);
          const list = await listBackupsFromDrive();
          setBackups(list);
        } catch (err) {
          console.warn('Failed to load drive backups:', err);
        } finally {
          setIsDriveLoading(false);
        }
      },
      () => {
        setGoogleUser(null);
        setGToken(null);
        setBackups([]);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch Backups from Drive
  const fetchBackups = async () => {
    try {
      setIsDriveLoading(true);
      const list = await listBackupsFromDrive();
      setBackups(list);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Gagal memuat cadangan Drive: ${err.message || err}`
      });
    } finally {
      setIsDriveLoading(false);
    }
  };

  const handleSaveSettings = (updated: AppSettings) => {
    setSettings(updated);
    saveToStorage('guruku_app_settings', updated);
    
    // Also save default academic_year for newly created classes
    localStorage.setItem('guruku_tahun_ajaran', updated.academicYear);
    
    setNotification({
      type: 'success',
      message: 'Pengaturan aplikasi berhasil disimpan!'
    });
  };

  // Handler for Kop Surat Logo Upload
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1.5 * 1024 * 1024) {
      setNotification({
        type: 'error',
        message: 'Ukuran file terlalu besar! Maksimal ukuran logo adalah 1.5 MB.'
      });
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      const updated = { ...settings, logoDataUrl: result };
      handleSaveSettings(updated);
    };
    reader.onerror = () => {
      setNotification({
        type: 'error',
        message: 'Gagal membaca file logo.'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    const updated = { ...settings, logoDataUrl: undefined };
    handleSaveSettings(updated);
  };

  // Google Sign-In
  const handleGoogleSignIn = async () => {
    try {
      setIsConnectingGoogle(true);
      const res = await googleSignIn();
      if (res) {
        setGoogleUser(res.user);
        setGToken(res.accessToken);
        setNotification({
          type: 'success',
          message: 'Berhasil menghubungkan Google Workspace!'
        });
        
        // Refresh list of backups
        setTimeout(() => {
          fetchBackups();
        }, 500);
      }
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Gagal masuk ke Google: ${err.message || err}`
      });
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  // Google Sign-Out
  const handleGoogleSignOut = async () => {
    if (confirm('Apakah Anda yakin ingin mematikan integrasi Google Workspace?')) {
      await logoutGoogle();
      setGoogleUser(null);
      setGToken(null);
      setBackups([]);
      setNotification({
        type: 'success',
        message: 'Sesi Google diputus.'
      });
    }
  };

  // Create brand new styled spreadsheet
  const handleCreateNewSpreadsheet = async () => {
    try {
      setIsSheetsLoading(true);
      setNotification({
        type: 'success',
        message: 'Membuat Google Spreadsheet baru di Drive Anda...'
      });
      const sheet = await createGuruKuSpreadsheet();
      
      const newConfig = {
        connected: true,
        spreadsheetId: sheet.id,
        sheetUrl: sheet.url,
        lastSynced: 'Belum pernah disinkronkan'
      };
      saveToStorage('guruku_spreadsheet_config', newConfig);
      setSheetConfig(newConfig);

      setNotification({
        type: 'success',
        message: 'Spreadsheet "GuruKu - Administrasi Sekolah" berhasil dibuat!'
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Gagal membuat spreadsheet: ${err.message}`
      });
    } finally {
      setIsSheetsLoading(false);
    }
  };

  // Push local storage data to Sheets
  const handlePushToSheets = async () => {
    if (!sheetConfig.spreadsheetId) {
      setNotification({
        type: 'error',
        message: 'Harap buat atau masukkan ID Spreadsheet terlebih dahulu!'
      });
      return;
    }
    try {
      setIsSheetsLoading(true);
      setNotification({
        type: 'success',
        message: 'Menulis data dan format ke Google Sheets...'
      });
      await pushDataToSpreadsheet(sheetConfig.spreadsheetId);
      
      const updatedConfig = {
        ...sheetConfig,
        connected: true,
        lastSynced: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      saveToStorage('guruku_spreadsheet_config', updatedConfig);
      setSheetConfig(updatedConfig);
      
      setNotification({
        type: 'success',
        message: 'Seluruh tabel berhasil di-Push ke Google Sheets!'
      });
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Gagal mengirim data: ${err.message}`
      });
    } finally {
      setIsSheetsLoading(false);
    }
  };

  // Pull data from Sheets to local storage
  const handlePullFromSheets = async () => {
    if (!sheetConfig.spreadsheetId) {
      setNotification({
        type: 'error',
        message: 'Harap hubungkan atau buat ID Spreadsheet terlebih dahulu!'
      });
      return;
    }
    if (!confirm('Peringatan: Mengunduh data dari Google Sheets akan menggantikan seluruh database lokal saat ini. Lanjutkan?')) {
      return;
    }

    try {
      setIsSheetsLoading(true);
      setNotification({
        type: 'success',
        message: 'Mengunduh data tabel dari Google Sheets...'
      });
      await pullDataFromSpreadsheet(sheetConfig.spreadsheetId);
      
      const updatedConfig = {
        ...sheetConfig,
        connected: true,
        lastSynced: new Date().toISOString().replace('T', ' ').substring(0, 16)
      };
      saveToStorage('guruku_spreadsheet_config', updatedConfig);
      setSheetConfig(updatedConfig);
      
      setNotification({
        type: 'success',
        message: 'Sinkronisasi selesai! Database lokal telah diperbarui.'
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Gagal menarik data: ${err.message}`
      });
    } finally {
      setIsSheetsLoading(false);
    }
  };

  // Local JSON Export
  const handleExportJSON = () => {
    try {
      const jsonStr = exportDatabaseAsSpreadsheetJSON();
      const blob = new Blob([jsonStr], { type: 'application/json' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `guruku_db_local_backup_${new Date().toISOString().substring(0, 10)}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      setNotification({
        type: 'success',
        message: 'Database lokal berhasil diunduh ke format JSON!'
      });
    } catch (e: any) {
      setNotification({
        type: 'error',
        message: `Gagal mengekspor database lokal: ${e.message}`
      });
    }
  };

  // Local JSON Import
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        const success = importDatabaseFromSpreadsheetJSON(text);
        if (success) {
          setNotification({
            type: 'success',
            message: 'Cadangan JSON lokal berhasil dipulihkan! Memuat ulang sistem...'
          });
          setTimeout(() => {
            window.location.reload();
          }, 1200);
        } else {
          setNotification({
            type: 'error',
            message: 'Format berkas JSON cadangan tidak valid!'
          });
        }
      };
      reader.readAsText(file);
    }
  };

  // Drive Backup creation
  const handleCreateDriveBackup = async () => {
    try {
      setIsDriveLoading(true);
      setNotification({
        type: 'success',
        message: 'Mengunggah berkas cadangan database ke Google Drive...'
      });
      const jsonContent = exportDatabaseAsSpreadsheetJSON();
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const filename = `guruku_database_backup_${timestamp}.json`;
      
      await uploadBackupToDrive(filename, jsonContent);
      setNotification({
        type: 'success',
        message: 'Cadangan database berhasil diunggah ke Google Drive!'
      });
      
      // Refresh list
      fetchBackups();
    } catch (err: any) {
      setNotification({
        type: 'error',
        message: `Gagal mencadangkan ke Drive: ${err.message}`
      });
    } finally {
      setIsDriveLoading(false);
    }
  };

  // Drive Backup Restore
  const handleRestoreDriveBackup = async (fileId: string, filename: string) => {
    if (confirm(`Apakah Anda yakin ingin memulihkan database dari file "${filename}"? Tindakan ini akan menggantikan seluruh data lokal Anda saat ini.`)) {
      try {
        setIsDriveLoading(true);
        setNotification({
          type: 'success',
          message: 'Mengunduh berkas cadangan...'
        });
        const jsonContent = await downloadBackupFromDrive(fileId);
        
        const success = importDatabaseFromSpreadsheetJSON(jsonContent);
        if (success) {
          setNotification({
            type: 'success',
            message: 'Database berhasil dipulihkan dari Google Drive! Memuat ulang sistem...'
          });
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          setNotification({
            type: 'error',
            message: 'Gagal memulihkan: Format JSON tidak didukung.'
          });
        }
      } catch (err: any) {
        setNotification({
          type: 'error',
          message: `Gagal mengunduh berkas cadangan: ${err.message}`
        });
      } finally {
        setIsDriveLoading(false);
      }
    }
  };

  const handleResetDatabase = () => {
    if (confirm('Apakah Anda yakin ingin menyetel ulang database? Seluruh data kustom Anda akan terhapus dan digantikan oleh data simulasi default.')) {
      localStorage.clear();
      initStorage();
      setNotification({
        type: 'success',
        message: 'Database disetel ulang ke mode bawaan! Memuat ulang...'
      });
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2">
            <Settings className="w-5.5 h-5.5 text-[#696cff]" />
            Pengaturan Aplikasi Guru
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
            Kelola identitas Kop Surat, Tahun Pelajaran aktif, serta melakukan sinkronisasi Google Sheets & Google Drive Backup.
          </p>
        </div>
      </div>

      {/* Notifications banner */}
      {notification && (
        <div className={`p-4 rounded-xl flex items-start gap-3 border ${
          notification.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400'
        } transition-all`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          )}
          <div>
            <p className="text-xs font-semibold">{notification.message}</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT & CENTER PANEL: KOP SURAT */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Section 1: Detail Kop Surat */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs space-y-5 transition-colors">
            <div className="flex items-center gap-2 border-b border-gray-50 dark:border-neutral-800 pb-3">
              <FileText className="w-4.5 h-4.5 text-[#696cff]" />
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Identitas Kop Surat Laporan</h4>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Nama Instansi / Sekolah / Yayasan
                </label>
                <input
                  type="text"
                  value={settings.schoolName}
                  onChange={(e) => handleSaveSettings({ ...settings, schoolName: e.target.value })}
                  placeholder="Contoh: SMP NEGERI INDONESIA JAYA"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Alamat Lengkap Instansi
                </label>
                <input
                  type="text"
                  value={settings.schoolAddress}
                  onChange={(e) => handleSaveSettings({ ...settings, schoolAddress: e.target.value })}
                  placeholder="Contoh: Jl. Raya Kebangsaan No. 45"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-medium"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                  Kontak Instansi (Telepon / Email / Fax)
                </label>
                <input
                  type="text"
                  value={settings.schoolContact}
                  onChange={(e) => handleSaveSettings({ ...settings, schoolContact: e.target.value })}
                  placeholder="Contoh: Telp: (021) 1234567 | Email: sekolah@belajar.id"
                  className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    Nama Kepala Sekolah (Penandatangan Laporan)
                  </label>
                  <input
                    type="text"
                    value={settings.headmasterName ?? ''}
                    onChange={(e) => handleSaveSettings({ ...settings, headmasterName: e.target.value })}
                    placeholder="Contoh: Drs. H. Mulyadi, M.Pd."
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                    NIP Kepala Sekolah
                  </label>
                  <input
                    type="text"
                    value={settings.headmasterNip ?? ''}
                    onChange={(e) => handleSaveSettings({ ...settings, headmasterNip: e.target.value })}
                    placeholder="Contoh: 19710312 199702 1 002"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-medium"
                  />
                </div>
              </div>

              {/* Logo Upload Section */}
              <div className="space-y-1.5">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Logo Kop Surat (Format Gambar)
                </label>
                <div className="flex flex-col sm:flex-row items-center gap-4 p-4 bg-gray-50 dark:bg-[#232333] rounded-xl border border-dashed border-gray-200 dark:border-neutral-700">
                  {settings.logoDataUrl ? (
                    <div className="relative w-20 h-20 bg-white rounded-lg p-1.5 border border-gray-100 flex items-center justify-center shrink-0">
                      <img 
                        src={settings.logoDataUrl} 
                        alt="Logo Sekolah" 
                        className="max-w-full max-h-full object-contain"
                        referrerPolicy="no-referrer"
                      />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-rose-500 hover:bg-rose-600 text-white rounded-full shadow-md transition"
                        title="Hapus Logo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <div className="w-20 h-20 bg-gray-200/50 dark:bg-neutral-800 rounded-lg flex items-center justify-center text-gray-400 shrink-0">
                      <ImageIcon className="w-8 h-8 text-gray-300 dark:text-neutral-700" />
                    </div>
                  )}

                  <div className="flex-1 text-center sm:text-left space-y-1.5">
                    <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
                      {settings.logoDataUrl ? 'Ganti file logo baru' : 'Unggah logo resmi sekolah'}
                    </p>
                    <p className="text-[10px] text-gray-400">
                      Disarankan menggunakan file PNG / JPG berlatar belakang transparan (maks. 1.5MB)
                    </p>
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 dark:bg-indigo-950/30 text-[#696cff] hover:bg-indigo-100/50 dark:hover:bg-indigo-950/50 transition text-xs font-bold rounded-lg cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Gambar</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleLogoUpload} 
                        className="hidden" 
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Kop Surat */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs space-y-3 transition-colors">
            <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-400">Live Preview Kop Surat Laporan (Cetak)</h4>
            <div className="border border-gray-100 dark:border-neutral-800 p-5 rounded-xl bg-white text-gray-900 shadow-xs flex items-center gap-5">
              {settings.logoDataUrl ? (
                <img 
                  src={settings.logoDataUrl} 
                  alt="Logo" 
                  className="w-16 h-16 object-contain"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center border border-dashed border-gray-200 shrink-0">
                  <span className="text-[10px] text-gray-400 text-center font-bold px-1">No Logo</span>
                </div>
              )}
              <div className="flex-1 text-center pr-12">
                <h3 className="font-bold text-sm tracking-wide uppercase leading-tight">{settings.schoolName || 'NAMA SEKOLAH BELUM DIATUR'}</h3>
                <p className="text-[10px] text-gray-600 font-medium mt-0.5">{settings.schoolAddress || 'Alamat belum diatur'}</p>
                <p className="text-[9px] text-gray-400 font-mono mt-0.5">{settings.schoolContact || 'Telepon / Email belum diatur'}</p>
                <hr className="border-t-2 border-gray-800 mt-2" />
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT PANEL: TAHUN PELAJARAN & BACKUP/RESTORE ENGINE */}
        <div className="space-y-6">
          
          {/* Card 1: Tahun Pelajaran */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 border-b border-gray-50 dark:border-neutral-800 pb-3">
              <Calendar className="w-4.5 h-4.5 text-[#696cff]" />
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Tahun Pelajaran</h4>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                Tahun Pelajaran Aktif
              </label>
              <input
                type="text"
                value={settings.academicYear}
                onChange={(e) => handleSaveSettings({ ...settings, academicYear: e.target.value })}
                placeholder="Contoh: 2025/2026"
                className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
              />
              <p className="text-[10px] text-gray-400 mt-1.5 leading-relaxed">
                Menetapkan tahun ajaran default yang digunakan saat membuat kelas baru dan pencetakan berkas.
              </p>
            </div>
          </div>

          {/* Card 2: Manajemen File Lokal & Reset Database */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
            <div className="flex items-center gap-2 border-b border-gray-50 dark:border-neutral-800 pb-3">
              <Database className="w-4.5 h-4.5 text-[#696cff]" />
              <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">File Lokal & Reset DB</h4>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed">
              Manajemen cadangan offline lokal di browser perangkat Anda saat ini.
            </p>

            <div className="space-y-2.5">
              <button
                onClick={handleExportJSON}
                className="w-full py-2 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#232333] text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-500" />
                <span>Unduh JSON Lokal</span>
              </button>

              <label className="w-full py-2 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#232333] text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer select-none">
                <Upload className="w-4 h-4 text-[#696cff]" />
                <span>Unggah JSON Lokal</span>
                <input
                  type="file"
                  accept=".json"
                  className="hidden"
                  onChange={handleImportJSON}
                />
              </label>

              <button
                onClick={handleResetDatabase}
                className="w-full py-2 border border-rose-200 dark:border-rose-900/60 hover:bg-rose-50 dark:hover:bg-rose-950/20 text-rose-500 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Setel Ulang DB</span>
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* BOTTOM PANEL: GOOGLE INTEGRATION SYSTEM (SHEETS & DRIVE BACKUP) */}
      <div className="border-t border-gray-100 dark:border-neutral-800 pt-6">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-4 flex items-center gap-2">
          <Cloud className="w-4.5 h-4.5 text-[#696cff]" />
          Integrasi Google Workspace Cloud
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* CARD 1: GOOGLE SHEETS LIVE SYNCHRONIZATION */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-500 shrink-0" />
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Google Sheets Live Synchronization</h3>
                </div>
                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                  googleUser 
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400' 
                    : 'bg-gray-100 dark:bg-[#232333] text-gray-400'
                }`}>
                  {googleUser ? (
                    <>
                      <CloudLightning className="w-3 h-3" />
                      <span>Tersambung API</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3 h-3" />
                      <span>Offline (Lokal)</span>
                    </>
                  )}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Petakan database guru, kelas, siswa, nilai, absensi, dan jurnal langsung ke tab spreadsheet Google Sheets Anda secara dua arah.
              </p>
            </div>

            {/* Connected User / Login Actions */}
            <div className="p-4 bg-gray-50 dark:bg-[#232333]/50 rounded-xl space-y-3">
              {googleUser ? (
                <div className="flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={googleUser.photoURL || ''} 
                      alt="avatar" 
                      className="w-8 h-8 rounded-full border border-gray-200 dark:border-neutral-700"
                      referrerPolicy="no-referrer"
                    />
                    <div>
                      <p className="font-bold text-gray-700 dark:text-gray-200">{googleUser.displayName}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{googleUser.email}</p>
                    </div>
                  </div>
                  <button
                    onClick={handleGoogleSignOut}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition cursor-pointer"
                    title="Putuskan sambungan Google"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center py-2 text-center">
                  <p className="text-xs text-gray-500 mb-3 font-semibold">Integrasikan akun Google Anda untuk mengaktifkan sinkronisasi otomatis</p>
                  <button
                    disabled={isConnectingGoogle}
                    onClick={handleGoogleSignIn}
                    className="px-4 py-2 bg-white dark:bg-[#2b2c40] hover:bg-gray-50 border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center gap-2 transition cursor-pointer"
                  >
                    {isConnectingGoogle ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#696cff]" />
                    ) : (
                      <Cloud className="w-4 h-4 text-[#696cff]" />
                    )}
                    <span>Hubungkan ke Google Workspace</span>
                  </button>
                </div>
              )}
            </div>

            {/* Sync actions if logged in */}
            {googleUser ? (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">Spreadsheet ID Koneksi</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={sheetConfig.spreadsheetId}
                      onChange={(e) => {
                        const id = e.target.value;
                        const updated = {
                          ...sheetConfig,
                          spreadsheetId: id,
                          sheetUrl: `https://docs.google.com/spreadsheets/d/${id}/edit`
                        };
                        setSheetConfig(updated);
                        localStorage.setItem('guruku_spreadsheet_config', JSON.stringify(updated));
                      }}
                      placeholder="Masukkan ID Google Sheet atau klik buat baru"
                      className="flex-1 px-3 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-mono focus:outline-none focus:border-emerald-500"
                    />
                    
                    {sheetConfig.spreadsheetId && (
                      <a
                        href={sheetConfig.sheetUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-xl flex items-center justify-center transition border border-emerald-100"
                        title="Buka Spreadsheet di Tab Baru"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex gap-2 pt-1.5">
                  <button
                    disabled={isSheetsLoading}
                    onClick={handleCreateNewSpreadsheet}
                    className="flex-1 py-2 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-950/20 text-[#696cff] dark:text-indigo-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-indigo-100 dark:border-indigo-900/50 transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buat Baru</span>
                  </button>

                  <button
                    disabled={isSheetsLoading}
                    onClick={handlePushToSheets}
                    className="flex-1 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    {isSheetsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowUpFromLine className="w-3.5 h-3.5" />
                    )}
                    <span>Push ke Sheets</span>
                  </button>

                  <button
                    disabled={isSheetsLoading}
                    onClick={handlePullFromSheets}
                    className="flex-1 py-2 border border-emerald-500 hover:bg-emerald-500/10 text-emerald-500 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {isSheetsLoading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <ArrowDownToLine className="w-3.5 h-3.5" />
                    )}
                    <span>Pull dari Sheets</span>
                  </button>
                </div>

                {sheetConfig.lastSynced && (
                  <p className="text-[10px] text-gray-400 font-mono text-center">
                    Sinkronisasi Terakhir: {sheetConfig.lastSynced}
                  </p>
                )}
              </div>
            ) : (
              <div className="p-6 bg-gray-50/50 dark:bg-neutral-800/20 rounded-xl text-center text-xs text-gray-400 leading-relaxed border border-dashed border-gray-100 dark:border-neutral-800">
                Menyediakan konektivitas awan ke Google Sheets API setelah menghubungkan akun.
              </div>
            )}

          </div>

          {/* CARD 2: GOOGLE DRIVE SECURE SYSTEM BACKUP */}
          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <FolderOpen className="w-5 h-5 text-indigo-500 shrink-0" />
                  <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">Google Drive Secure Backup Storage</h3>
                </div>
                <span className="text-xs font-mono text-gray-400">Folder: /GuruKu_Backups</span>
              </div>
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Cadangkan database GuruKu (semua mata pelajaran, kelas, nilai siswa, dan riwayat jurnal) dalam format `.json` yang aman langsung di akun Google Drive Anda.
              </p>
            </div>

            {googleUser ? (
              <div className="space-y-3 flex-1 flex flex-col justify-between">
                
                {/* Backups file list container */}
                <div className="space-y-2 border border-gray-100 dark:border-neutral-800/80 rounded-xl p-3 bg-gray-50/50 dark:bg-[#232333]/30 max-h-[140px] overflow-y-auto flex-1">
                  {isDriveLoading ? (
                    <div className="flex flex-col items-center justify-center py-6">
                      <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                      <span className="text-[10px] text-gray-400 mt-2">Menghubungi Google Drive...</span>
                    </div>
                  ) : backups.length > 0 ? (
                    backups.map(bk => (
                      <div key={bk.id} className="flex items-center justify-between gap-3 p-2 bg-white dark:bg-[#2b2c40] rounded-lg border border-gray-100 dark:border-neutral-800 text-[11px] hover:border-indigo-200">
                        <div className="flex items-center gap-1.5 truncate max-w-[70%]">
                          <FileJson className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                          <span className="font-mono text-gray-700 dark:text-gray-300 truncate" title={bk.name}>{bk.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] text-gray-400 font-mono">
                            {new Date(bk.createdTime).toLocaleDateString()}
                          </span>
                          <button
                            onClick={() => handleRestoreDriveBackup(bk.id, bk.name)}
                            className="px-2 py-0.5 bg-indigo-50 hover:bg-indigo-100 text-[#696cff] dark:bg-indigo-950/40 dark:text-indigo-300 font-bold rounded text-[9px] transition cursor-pointer"
                          >
                            Restore
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-[10px] text-gray-400">
                      Tidak ditemukan file cadangan di folder Drive /GuruKu_Backups
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2.5">
                  <button
                    disabled={isDriveLoading}
                    onClick={fetchBackups}
                    className="px-3 py-2 border border-gray-200 dark:border-neutral-700 text-gray-500 hover:bg-gray-50 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isDriveLoading ? 'animate-spin' : ''}`} />
                  </button>
                  
                  <button
                    disabled={isDriveLoading}
                    onClick={handleCreateDriveBackup}
                    className="flex-1 py-2 bg-[#696cff] hover:bg-indigo-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Buat Cadangan Cloud Baru</span>
                  </button>
                </div>

              </div>
            ) : (
              <div className="p-6 bg-gray-50/50 dark:bg-neutral-800/20 rounded-xl text-center text-xs text-gray-400 leading-relaxed border border-dashed border-gray-100 dark:border-neutral-800">
                Simpan file cadangan secara awan di Drive setelah menghubungkan akun.
              </div>
            )}

          </div>

        </div>
      </div>

    </div>
  );
}
