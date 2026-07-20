/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { 
  BookOpen, 
  Settings, 
  FileText, 
  Users, 
  FileSpreadsheet, 
  Cloud, 
  Printer, 
  BookType, 
  Clock, 
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  GraduationCap,
  CalendarCheck,
  FileDown,
  RefreshCw,
  Upload,
  Download,
  Database
} from 'lucide-react';

interface GuideStep {
  title: string;
  desc: string;
}

export default function SpreadsheetView() {
  const coreFeatures = [
    {
      icon: BookType,
      title: 'Modul Ajar',
      color: 'text-violet-500 bg-violet-50 dark:bg-violet-950/30',
      desc: 'Kelola dan unggah file Modul Ajar (PDF atau Word) sesuai dengan materi pembelajaran Anda. Membantu guru mendokumentasikan perencanaan mengajar secara terpusat.'
    },
    {
      icon: FileText,
      title: 'Jurnal Mengajar',
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/30',
      desc: 'Catat aktivitas harian di dalam kelas secara detail meliputi tanggal, mata pelajaran, materi pokok (topik), metode pembelajaran, hingga hambatan belajar siswa.'
    },
    {
      icon: CalendarCheck,
      title: 'Presensi & Absensi',
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/30',
      desc: 'Catat kehadiran siswa secara presisi per mata pelajaran dan pertemuan. Sistem merangkum jumlah Hadir (H), Sakit (S), Izin (I), dan Alfa (A) secara real-time.'
    },
    {
      icon: GraduationCap,
      title: 'Rekap Nilai Siswa',
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/30',
      desc: 'Masukkan nilai siswa secara dinamis dengan penyesuaian bobot persentase nilai akhir (Tugas, Ulangan Harian, UTS, UAS). Rata-rata nilai akhir dihitung otomatis.'
    },
    {
      icon: Users,
      title: 'Data Master Terintegrasi',
      color: 'text-pink-500 bg-pink-50 dark:bg-pink-950/30',
      desc: 'Kelola data guru, mata pelajaran, daftar kelas, dan nama-nama siswa (NIS, Nama Lengkap, L/P) dengan opsi impor cepat dari file Excel.'
    },
    {
      icon: Printer,
      title: 'Cetak Laporan Kustom',
      color: 'text-cyan-500 bg-cyan-50 dark:bg-cyan-950/30',
      desc: 'Pencetakan berkas rekapitulasi nilai, absensi, maupun jurnal mengajar ke format PDF siap cetak, lengkap dengan kop surat instansi resmi dan tanda tangan digital.'
    }
  ];

  const quickGuides: GuideStep[] = [
    {
      title: '1. Lengkapi Data Master Terlebih Dahulu',
      desc: 'Masuk ke menu "Data Master" untuk menambahkan Mata Pelajaran, Kelas, serta daftar nama Siswa di kelas tersebut. Anda dapat memasukkan data siswa secara manual atau memanfaatkan fitur unggah file Excel untuk menghemat waktu.'
    },
    {
      title: '2. Sesuaikan Pengaturan Kop Surat',
      desc: 'Buka menu "Pengaturan Aplikasi" untuk memperbarui nama sekolah, alamat, telepon, serta mengunggah logo instansi Anda. Informasi ini akan ditampilkan di bagian atas (Kop Surat) setiap kali Anda mencetak laporan PDF.'
    },
    {
      title: '3. Mulai Pencatatan Administrasi Harian',
      desc: 'Gunakan menu "Administrasi Guru" untuk mengelola tugas harian Anda. Unggah rencana Modul Ajar, catat Jurnal kegiatan kelas setelah selesai mengajar, lakukan presensi siswa, dan masukkan nilai evaluasi belajar mereka.'
    },
    {
      title: '4. Aktifkan Sinkronisasi Google Sheets (Opsional)',
      desc: 'Bila Anda ingin memiliki salinan cloud yang dapat diedit langsung, buka "Pengaturan Aplikasi", klik "Hubungkan ke Google Workspace", buat Spreadsheet baru, dan lakukan "Push ke Sheets". Data lokal Anda akan diekspor menjadi baris tabel Google Sheets yang rapi.'
    },
    {
      title: '5. Ekspor Cadangan Berkala',
      desc: 'Cadangkan data Anda secara berkala dalam format JSON ke penyimpanan lokal komputer Anda atau unggah langsung ke Google Drive melalui folder aman `/GuruKu_Backups` agar terhindar dari kehilangan data jika browser dibersihkan.'
    }
  ];

  return (
    <div className="space-y-6">
      
      {/* Header Banner */}
      <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 shadow-xs flex flex-col md:flex-row md:items-center gap-6 transition-colors">
        <div className="w-14 h-14 bg-[#696cff]/10 text-[#696cff] rounded-2xl flex items-center justify-center shrink-0">
          <BookOpen className="w-7 h-7" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Panduan Penggunaan & Fitur GuruKu
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed max-w-3xl">
            Selamat datang di Pusat Informasi GuruKu. Aplikasi ini dirancang secara khusus untuk mempermudah guru mata pelajaran dalam mengelola perencanaan, administrasi kelas harian, dan pelaporan nilai siswa secara offline-first dengan integrasi Google Workspace Cloud.
          </p>
        </div>
      </div>

      {/* Grid Features */}
      <div className="space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 flex items-center gap-2">
          <Award className="w-4.5 h-4.5 text-[#696cff]" />
          Modul & Fitur Administrasi Utama
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {coreFeatures.map((feat, idx) => (
            <div key={idx} className="bg-white dark:bg-[#2b2c40] p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs flex gap-4 transition-all hover:scale-[1.01]">
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${feat.color}`}>
                <feat.icon className="w-5.5 h-5.5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">{feat.title}</h4>
                <p className="text-[11px] text-gray-400 leading-relaxed dark:text-gray-400">
                  {feat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step by Step Setup */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Step Guide Column (2/3 width) */}
        <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs p-6 lg:col-span-2 space-y-5 transition-colors">
          <h3 className="text-xs font-bold uppercase tracking-wider text-gray-800 dark:text-gray-100 flex items-center gap-2 border-b border-gray-50 dark:border-neutral-800 pb-3">
            <HelpCircle className="w-4.5 h-4.5 text-[#696cff]" />
            Alur Pengoperasian Aplikasi
          </h3>

          <div className="space-y-4">
            {quickGuides.map((step, idx) => (
              <div key={idx} className="flex gap-4">
                <div className="w-6 h-6 rounded-full bg-indigo-50 dark:bg-indigo-950/40 text-[#696cff] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  {idx + 1}
                </div>
                <div>
                  <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200">{step.title}</h4>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Security & Offline Tech Info (1/3 width) */}
        <div className="space-y-6">
          
          {/* Card: Cloud Storage Info */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs space-y-4 transition-colors">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 border-b border-gray-50 dark:border-neutral-800 pb-3 uppercase tracking-wider">
              <ShieldCheck className="w-4.5 h-4.5 text-emerald-500" />
              Keamanan Offline-First
            </h4>

            <div className="space-y-3.5 text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              <p>
                Aplikasi GuruKu beroperasi menggunakan sistem <span className="font-semibold text-[#696cff]">Isolasi Sandbox Lokal</span> di browser Anda. Setiap akun guru memiliki partisi database terpisah yang tidak saling bercampur.
              </p>
              <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 rounded-xl border border-emerald-100/50">
                <p className="font-bold">Keuntungan:</p>
                <ul className="list-disc pl-4 mt-1 space-y-1">
                  <li>Bekerja 100% tanpa internet</li>
                  <li>Data siswa terlindungi lokal</li>
                  <li>Sangat cepat dan responsif</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card: Sync Status Warning */}
          <div className="bg-[#696cff]/[0.02] dark:bg-neutral-800/10 p-6 rounded-2xl border border-gray-200/60 dark:border-neutral-800/80 shadow-xs space-y-4">
            <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2 uppercase tracking-wider">
              <Clock className="w-4.5 h-4.5 text-amber-500" />
              Siklus Sinkronisasi
            </h4>

            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Koneksi Google Sheets diaktifkan secara manual. Guru baru dapat mulai dengan mengisi data lokal, kemudian mendaftar ke Google Sheets sewaktu-waktu melalui halaman Pengaturan.
            </p>
          </div>

        </div>

      </div>

      {/* Google Sheets Live Synchronization Guide */}
      <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs p-6 space-y-6 transition-colors">
        <div className="flex items-center gap-3 border-b border-gray-50 dark:border-neutral-800 pb-4">
          <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-xl">
            <FileSpreadsheet className="w-5.5 h-5.5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-gray-100">
              Panduan Google Sheets Live Synchronization
            </h3>
            <p className="text-[11px] text-gray-400 dark:text-gray-400">
              Sinkronisasikan database lokal GuruKu dengan Google Spreadsheet secara real-time demi kemudahan backup dan akses multi-perangkat.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Alur Sinkronisasi */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-[#696cff]" />
              Langkah Menghubungkan Google Sheets
            </h4>
            
            <div className="space-y-3.5">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Hubungkan Akun Google</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    Klik tombol <strong>"Hubungkan ke Google Workspace"</strong> di halaman <strong>Pengaturan Aplikasi</strong> atau tombol Google Login di bar atas. Setujui izin akses ke Google Drive & Google Sheets.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Buat Spreadsheet Baru</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    Tekan tombol <strong>"Buat Spreadsheet Baru"</strong> di bagian integrasi Google Sheets. Aplikasi akan otomatis membuat berkas Excel Spreadsheet resmi bernama <code>GuruKu_Database</code> di Google Drive Anda.
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <h5 className="text-xs font-semibold text-gray-800 dark:text-gray-200">Push & Pull Data</h5>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">
                    Gunakan tombol <strong>"Push ke Sheets"</strong> untuk mengunggah seluruh data lokal Anda ke cloud, atau <strong>"Pull dari Sheets"</strong> untuk mengunduh kembali data jika Anda berpindah ke komputer atau perangkat lain.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Konsep Data & Lembar Spreadsheet */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Database className="w-4 h-4 text-emerald-500" />
              Struktur Lembar (Sheets) & Cadangan
            </h4>
            
            <p className="text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
              Google Spreadsheet yang terbentuk akan memiliki 8 Lembar Utama (Sheet Tabs) yang tersusun rapi sebagai berikut:
            </p>

            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono bg-gray-50 dark:bg-[#232333]/60 p-3 rounded-xl border border-gray-100 dark:border-neutral-800/80">
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>1. Profil Guru</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>2. Mata Pelajaran</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>3. Kelas</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>4. Daftar Siswa</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>5. Rekap Nilai</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>6. Presensi Harian</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>7. Jurnal Mengajar</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-3 h-3 text-emerald-500 shrink-0" />
                <span>8. Pengaturan</span>
              </div>
            </div>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-400 rounded-xl border border-indigo-100/50 text-[11px] leading-relaxed">
              <strong>Tips Backup Otomatis:</strong> Selain sinkronisasi Google Sheets, aplikasi ini juga secara otomatis mengunggah file cadangan JSON terenkripsi ke folder Drive Anda bernama <code>/GuruKu_Backups</code> setiap kali Anda memperbarui data penting.
            </div>
          </div>
        </div>

        {/* Tips & Pemecahan Masalah */}
        <div className="bg-gray-50 dark:bg-[#232333]/30 rounded-xl p-4 border border-gray-100 dark:border-neutral-800/80 text-[11px] space-y-2">
          <p className="font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5">
            <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
            Tips & Pemecahan Masalah (Troubleshooting)
          </p>
          <ul className="list-disc pl-5 space-y-1 text-gray-500 dark:text-gray-400 leading-relaxed">
            <li>
              <strong>Masalah Izin Akses (Popup Blocked):</strong> Saat pertama kali menghubungkan Google Workspace, browser Anda mungkin memblokir popup otorisasi. Pastikan untuk mengizinkan pop-up dari situs ini di pengaturan browser Anda.
            </li>
            <li>
              <strong>Bekerja Multi-perangkat:</strong> Jika Anda selesai memasukkan nilai siswa di laptop sekolah, klik <strong>Push ke Sheets</strong>. Saat sampai di rumah, buka GuruKu di komputer rumah, login dengan akun Google yang sama, lalu klik <strong>Pull dari Sheets</strong> untuk mengambil hasil input sebelumnya.
            </li>
            <li>
              <strong>Hindari Mengubah Nama Kolom:</strong> Anda bebas menambahkan atau mengubah isi sel di Google Sheets secara langsung melalui Google Drive. Namun, mohon hindari mengubah nama kolom/header lembar agar proses "Pull" kembali ke aplikasi tidak mengalami kendala.
            </li>
          </ul>
        </div>
      </div>

    </div>
  );
}
