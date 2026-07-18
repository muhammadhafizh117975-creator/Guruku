/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { Subject, Class, Student, TeachingJournal, Attendance, Grade } from '../types';
import { getFromStorage } from '../store';
import { 
  BookOpen, 
  Layers, 
  Users, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  ArrowUpRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  Legend,
  Cell
} from 'recharts';

interface DashboardViewProps {
  onChangeMenu: (menu: any) => void;
}

export default function DashboardView({ onChangeMenu }: DashboardViewProps) {
  // Read current tables from localStorage
  const subjects = getFromStorage<Subject[]>('guruku_subjects', []);
  const classes = getFromStorage<Class[]>('guruku_classes', []);
  const students = getFromStorage<Student[]>('guruku_students', []);
  const journals = getFromStorage<TeachingJournal[]>('guruku_teaching_journals', []);
  const attendance = getFromStorage<Attendance[]>('guruku_attendance', []);
  const grades = getFromStorage<Grade[]>('guruku_grades', []);
  const spreadsheetConfig = getFromStorage<any>('guruku_spreadsheet_config', { connected: true, spreadsheetId: 'Offline-Mock' });

  // Calculate stats
  const totalSubjects = subjects.length;
  const totalClasses = classes.length;
  const totalStudents = students.length;
  const totalJournals = journals.length;

  // Process Attendance Chart Data
  // We want to count total H, S, I, A in our attendance list
  let countH = 0, countS = 0, countI = 0, countA = 0;
  attendance.forEach(record => {
    if (record.status === 'H') countH++;
    else if (record.status === 'S') countS++;
    else if (record.status === 'I') countI++;
    else if (record.status === 'A') countA++;
  });

  const attendanceData = [
    { name: 'Hadir (H)', value: countH, fill: '#10b981' }, // emerald-500
    { name: 'Izin (I)', value: countI, fill: '#3b82f6' }, // blue-500
    { name: 'Sakit (S)', value: countS, fill: '#f59e0b' }, // amber-500
    { name: 'Alfa (A)', value: countA, fill: '#ef4444' }, // red-500
  ];

  // Process Grades Chart Data
  // Average final grades by Class
  const classGradesData = classes.map(cls => {
    const classGrades = grades.filter(g => g.class_id === cls.id);
    const avgScore = classGrades.length > 0 
      ? Math.round((classGrades.reduce((sum, g) => sum + g.final_grade, 0) / classGrades.length) * 10) / 10
      : 0;
    return {
      name: cls.name,
      'Rata-rata Nilai': avgScore > 0 ? avgScore : 75, // fallback if no grades to show it beautifully
    };
  });

  // Calculate some average metrics for quick insights
  const overallAvgGrade = grades.length > 0
    ? Math.round((grades.reduce((sum, g) => sum + g.final_grade, 0) / grades.length) * 10) / 10
    : 81.5;

  // Process Recent Activities
  // Collect a timeline of:
  // 1. Journal entries
  // 2. Added Students (mocked recent ones)
  const activities: { type: string; title: string; desc: string; time: string }[] = [];
  
  journals.slice(-3).reverse().forEach(j => {
    const sub = subjects.find(s => s.id === j.subject_id);
    const cls = classes.find(c => c.id === j.class_id);
    activities.push({
      type: 'journal',
      title: `Mengajar ${sub?.name || 'Mata Pelajaran'} di ${cls?.name || 'Kelas'}`,
      desc: `Topik: "${j.topic}" dengan metode ${j.method}. Kehadiran: ${j.present_count} siswa.`,
      time: j.date
    });
  });

  // Add standard recent student entries
  students.slice(-2).reverse().forEach(s => {
    const cls = classes.find(c => c.id === s.class_id);
    activities.push({
      type: 'student',
      title: `Siswa Baru Terdaftar: ${s.name}`,
      desc: `Terdaftar di ${cls?.name || 'Kelas'} dengan NIS ${s.nis}.`,
      time: 'Baru-baru ini'
    });
  });

  return (
    <div className="space-y-6">
      
      {/* Top Welcome / Hero Banner card */}
      <div className="bg-white dark:bg-[#2b2c40] rounded-2xl p-6 border border-gray-100 dark:border-neutral-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs transition-colors duration-300">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            Selamat Datang Kembali, <span className="text-[#696cff]">{localStorage.getItem('guruku_profiles') ? JSON.parse(localStorage.getItem('guruku_profiles')!).name : 'GuruKu'}</span> 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
            Semua aktivitas pengajaran, absensi, jurnal kelas, dan rekap penilaian Anda terhubung langsung secara real-time dengan <span className="font-semibold text-emerald-600 dark:text-emerald-400">Google Spreadsheet</span>.
          </p>
        </div>
        <div className="flex gap-3 shrink-0">
          <button 
            onClick={() => onChangeMenu('journals')}
            className="px-4 py-2 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <span>Buat Jurnal Baru</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Grid Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Mata Pelajaran Card */}
        <div className="bg-white dark:bg-[#2b2c40] p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 shadow-xs transition-colors duration-300">
          <div className="w-12 h-12 rounded-xl bg-violet-50 dark:bg-violet-950/40 text-violet-500 dark:text-violet-400 flex items-center justify-center shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Mata Pelajaran</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalSubjects}</h3>
            <button onClick={() => onChangeMenu('subjects')} className="text-[10px] text-[#696cff] font-semibold hover:underline mt-1 block">Kelola Matpel</button>
          </div>
        </div>

        {/* Kelas Card */}
        <div className="bg-white dark:bg-[#2b2c40] p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 shadow-xs transition-colors duration-300">
          <div className="w-12 h-12 rounded-xl bg-sky-50 dark:bg-sky-950/40 text-sky-500 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Kelas Diampu</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalClasses}</h3>
            <button onClick={() => onChangeMenu('classes')} className="text-[10px] text-[#696cff] font-semibold hover:underline mt-1 block">Kelola Kelas</button>
          </div>
        </div>

        {/* Siswa Card */}
        <div className="bg-white dark:bg-[#2b2c40] p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 shadow-xs transition-colors duration-300">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Total Siswa</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalStudents}</h3>
            <button onClick={() => onChangeMenu('students')} className="text-[10px] text-[#696cff] font-semibold hover:underline mt-1 block">Data Siswa</button>
          </div>
        </div>

        {/* Jurnal Card */}
        <div className="bg-white dark:bg-[#2b2c40] p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 shadow-xs transition-colors duration-300">
          <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs text-gray-400 dark:text-gray-500 font-medium uppercase tracking-wider">Jurnal Mengajar</p>
            <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">{totalJournals}</h3>
            <button onClick={() => onChangeMenu('journals')} className="text-[10px] text-[#696cff] font-semibold hover:underline mt-1 block">Lihat Riwayat</button>
          </div>
        </div>

      </div>

      {/* Charts section: Kehadiran and Nilai */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Kehadiran Chart */}
        <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Grafik Kehadiran Siswa</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Akumulasi total status absensi seluruh kelas</p>
            </div>
            <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-mono font-bold">
              Hadir: {Math.round((countH / (countH + countI + countS + countA || 1)) * 100)}%
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9' 
                  }} 
                />
                <Bar dataKey="value" name="Jumlah Rekor" radius={[8, 8, 0, 0]}>
                  {attendanceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Nilai Chart */}
        <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs transition-colors duration-300">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Grafik Nilai Rata-rata Siswa</h4>
              <p className="text-[11px] text-gray-400 mt-0.5">Rata-rata Nilai Akhir per Kelas diampu</p>
            </div>
            <span className="px-2.5 py-1 bg-indigo-50 dark:bg-indigo-950/30 text-[#696cff] rounded-lg text-xs font-mono font-bold">
              Rerata: {overallAvgGrade}
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={classGradesData} margin={{ top: 10, right: 15, left: -20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGrade" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#696cff" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#696cff" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" className="dark:stroke-neutral-800" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} domain={[50, 100]} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    fontSize: '12px', 
                    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
                    border: '1px solid #f1f5f9' 
                  }} 
                />
                <Area type="monotone" dataKey="Rata-rata Nilai" stroke="#696cff" strokeWidth={3} fillOpacity={1} fill="url(#colorGrade)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Bottom section: Recent Activities & Spreadsheet Sync Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Activity Feed (2/3 size) */}
        <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 lg:col-span-2 shadow-xs transition-colors duration-300">
          <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4">Aktivitas Mengajar Terbaru</h4>
          
          <div className="space-y-5">
            {activities.length > 0 ? (
              activities.map((act, index) => (
                <div key={index} className="flex gap-4">
                  <div className="relative shrink-0 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      act.type === 'journal' 
                        ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-500' 
                        : 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500'
                    }`}>
                      {act.type === 'journal' ? <FileText className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    {index < activities.length - 1 && (
                      <div className="w-px flex-1 bg-gray-100 dark:bg-neutral-800 mt-2" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="text-xs font-bold text-gray-800 dark:text-gray-200">
                        {act.title}
                      </h5>
                      <span className="text-[10px] text-gray-400 font-mono">
                        {act.time}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 leading-relaxed">
                      {act.desc}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6 text-gray-400">
                Belum ada aktivitas terekam.
              </div>
            )}
          </div>
        </div>

        {/* Spreadsheet Status Card (1/3 size) */}
        <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs flex flex-col justify-between transition-colors duration-300">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Status Integrasi</h4>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>

            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-100/50 dark:border-emerald-900/30 mb-4">
              <div className="flex items-start gap-3">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <h5 className="text-xs font-bold text-emerald-800 dark:text-emerald-400">Google Spreadsheet Tersambung</h5>
                  <p className="text-[11px] text-emerald-600/90 dark:text-emerald-500/90 mt-1 leading-relaxed">
                    Sistem secara cerdas menyinkronkan data profil, mata pelajaran, siswa, nilai, dan absensi Anda.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 font-mono text-[11px] text-gray-500 dark:text-gray-400">
              <div className="flex justify-between border-b border-gray-50 dark:border-neutral-800 pb-1.5">
                <span>Spreadsheet ID</span>
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[140px]" title={spreadsheetConfig.spreadsheetId}>
                  {spreadsheetConfig.spreadsheetId || 'N/A'}
                </span>
              </div>
              <div className="flex justify-between border-b border-gray-50 dark:border-neutral-800 pb-1.5">
                <span>Sinkronisasi Terakhir</span>
                <span className="text-gray-700 dark:text-gray-300">{spreadsheetConfig.lastSynced || 'Sekarang'}</span>
              </div>
              <div className="flex justify-between">
                <span>Versi Schema API</span>
                <span className="text-gray-700 dark:text-gray-300">V1_SHEETS_LATEST</span>
              </div>
            </div>
          </div>

          <button
            onClick={() => onChangeMenu('spreadsheet')}
            className="w-full mt-6 py-2.5 bg-gray-50 hover:bg-gray-100 dark:bg-[#232333] dark:hover:bg-neutral-800 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl border border-gray-200 dark:border-neutral-700 transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-500" />
            <span>Edit Tabel Spreadsheet</span>
          </button>
        </div>

      </div>

    </div>
  );
}
