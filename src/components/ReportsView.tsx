/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Subject, Class, Student, Grade, Attendance, TeachingJournal } from '../types';
import { getFromStorage } from '../store';
import { 
  FileSpreadsheet, 
  Printer, 
  GraduationCap, 
  CalendarCheck, 
  FileText, 
  TrendingUp, 
  Percent, 
  Award,
  ChevronRight,
  Filter,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface ReportsViewProps {
  currentMenu: 'report_grades' | 'report_attendance' | 'report_journals';
}

export default function ReportsView({ currentMenu }: ReportsViewProps) {
  // Read Master Tables
  const subjects = getFromStorage<Subject[]>('guruku_subjects', []);
  const classes = getFromStorage<Class[]>('guruku_classes', []);
  const students = getFromStorage<Student[]>('guruku_students', []);
  const grades = getFromStorage<Grade[]>('guruku_grades', []);
  const attendance = getFromStorage<Attendance[]>('guruku_attendance', []);
  const journals = getFromStorage<TeachingJournal[]>('guruku_teaching_journals', []);
  const appSettings = getFromStorage<any>('guruku_app_settings', {
    schoolName: 'SMP NEGERI INDONESIA JAYA',
    schoolAddress: 'Jl. Pendidikan No. 45, Kebayoran, Jakarta Selatan',
    schoolContact: 'Telp: (021) 555-0199 | Email: info@smpn-indonesiajaya.sch.id',
    academicYear: '2025/2026'
  });

  // Filter States
  const [filterSubject, setFilterSubject] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [filterStartDate, setFilterStartDate] = useState('2026-07-01');
  const [filterEndDate, setFilterEndDate] = useState('2026-07-31');

  // Set default filters
  useEffect(() => {
    if (subjects.length > 0 && !filterSubject) setFilterSubject(subjects[0].id);
    if (classes.length > 0 && !filterClass) setFilterClass(classes[0].id);
  }, [subjects, classes]);

  // Object bindings
  const currentSub = subjects.find(s => s.id === filterSubject);
  const currentCls = classes.find(c => c.id === filterClass);

  // --- REPORT 1: NILAI CALCULATION ---
  // Read customized weights
  const weights = getFromStorage<any>('guruku_grade_weights', {
    assignment: 30,
    daily: 30,
    asts: 20,
    asas: 20
  });

  const calculateFinalGrade = (assignment: number, daily: number, asts: number, asas: number) => {
    const wAss = (weights.assignment ?? 30) / 100;
    const wDai = (weights.daily ?? 30) / 100;
    const wAst = (weights.asts ?? 20) / 100;
    const wAsa = (weights.asas ?? 20) / 100;
    return Math.round(
      (assignment * wAss) + 
      (daily * wDai) + 
      ((asts ?? 0) * wAst) + 
      ((asas ?? 0) * wAsa)
    );
  };

  const calculatePredicate = (score: number) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'E';
  };

  const classStudents = students.filter(s => s.class_id === filterClass);
  const filteredGrades = classStudents.map(student => {
    const found = grades.find(g => g.student_id === student.id && g.subject_id === filterSubject && g.class_id === filterClass);
    if (found) {
      // Recompute on-the-fly for absolute consistency with current customized weights
      const computedFinal = calculateFinalGrade(found.assignment, found.daily, found.asts ?? 0, found.asas ?? 0);
      const computedPredicate = calculatePredicate(computedFinal);
      return {
        student,
        grade: {
          ...found,
          final_grade: computedFinal,
          predicate: computedPredicate as any
        }
      };
    }
    return {
      student,
      grade: { assignment: 0, daily: 0, asts: 0, asas: 0, final_grade: 0, predicate: 'E' as const }
    };
  });

  // Grade analytics
  const totalStudentsInReport = filteredGrades.length;
  const gradedStudentsCount = filteredGrades.filter(fg => fg.grade.final_grade > 0).length;
  
  const classSum = filteredGrades.reduce((sum, fg) => sum + fg.grade.final_grade, 0);
  const classAvg = gradedStudentsCount > 0 ? Math.round((classSum / gradedStudentsCount) * 10) / 10 : 0;
  
  // High / Low
  const activeGrades = filteredGrades.filter(fg => fg.grade.final_grade > 0).map(fg => fg.grade.final_grade);
  const maxGrade = activeGrades.length > 0 ? Math.max(...activeGrades) : 0;
  const minGrade = activeGrades.length > 0 ? Math.min(...activeGrades) : 0;

  // Passing threshold (Indonesian KKM = 75)
  const passingCount = filteredGrades.filter(fg => fg.grade.final_grade >= 75).length;
  const passingRate = totalStudentsInReport > 0 ? Math.round((passingCount / totalStudentsInReport) * 100) : 0;


  // --- REPORT 2: ABSENSI CALCULATION ---
  // Count counts of attendance by date range and selected class / subject
  const attendanceReportList = classStudents.map(student => {
    const studentRecords = attendance.filter(a => 
      a.student_id === student.id && 
      a.subject_id === filterSubject && 
      a.class_id === filterClass &&
      a.date >= filterStartDate && 
      a.date <= filterEndDate
    );

    let h = 0, s = 0, i = 0, a = 0;
    studentRecords.forEach(r => {
      if (r.status === 'H') h++;
      else if (r.status === 'S') s++;
      else if (r.status === 'I') i++;
      else if (r.status === 'A') a++;
    });

    const totalDays = studentRecords.length;
    const rate = totalDays > 0 ? Math.round((h / totalDays) * 100) : 100; // fallback to 100% if no logs

    return {
      student,
      hadir: h,
      sakit: s,
      izin: i,
      alfa: a,
      total: totalDays,
      rate
    };
  });


  // --- REPORT 3: JURNAL CALCULATION ---
  const filteredJournals = journals.filter(j => 
    j.subject_id === filterSubject && 
    j.class_id === filterClass && 
    j.date >= filterStartDate && 
    j.date <= filterEndDate
  );


  // --- EXPORT FUNCTION ---
  const handleExportCSV = () => {
    let csvContent = "\uFEFF"; // UTF-8 BOM
    
    if (currentMenu === 'report_grades') {
      csvContent += `LAPORAN NILAI SISWA PER MATA PELAJARAN\n`;
      csvContent += `Mata Pelajaran:;${currentSub?.name || ''}\n`;
      csvContent += `Kelas:;${currentCls?.name || ''}\n`;
      csvContent += `Rata-rata Kelas:;${classAvg}\n`;
      csvContent += `Persentase Kelulusan (KKM >= 75):;${passingRate}%\n\n`;
      
      csvContent += `NIS;Nama Siswa;Tugas;Harian;ASTS;ASAS;Nilai Akhir;Predikat\n`;
      filteredGrades.forEach(fg => {
        csvContent += `"${fg.student.nis}";"${fg.student.name}";${fg.grade.assignment};${fg.grade.daily};${fg.grade.asts ?? 0};${fg.grade.asas ?? 0};${fg.grade.final_grade};"${fg.grade.predicate}"\n`;
      });

      downloadFile(csvContent, `Laporan_Nilai_${currentSub?.name || 'Mapel'}_${currentCls?.name || 'Kelas'}.csv`);
    } else if (currentMenu === 'report_attendance') {
      csvContent += `LAPORAN PRESENSI KEHADIRAN SISWA\n`;
      csvContent += `Periode:;${filterStartDate} s/d ${filterEndDate}\n`;
      csvContent += `Mata Pelajaran:;${currentSub?.name || ''}\n`;
      csvContent += `Kelas:;${currentCls?.name || ''}\n\n`;
      
      csvContent += `NIS;Nama Siswa;Hadir (H);Izin (I);Sakit (S);Alfa (A);Total Sesi;% Kehadiran\n`;
      attendanceReportList.forEach(ar => {
        csvContent += `"${ar.student.nis}";"${ar.student.name}";${ar.hadir};${ar.izin};${ar.sakit};${ar.alfa};${ar.total};${ar.rate}%\n`;
      });

      downloadFile(csvContent, `Laporan_Absensi_${currentCls?.name || 'Kelas'}.csv`);
    } else if (currentMenu === 'report_journals') {
      csvContent += `LAPORAN JURNAL MENGAJAR GURU\n`;
      csvContent += `Periode:;${filterStartDate} s/d ${filterEndDate}\n`;
      csvContent += `Mata Pelajaran:;${currentSub?.name || ''}\n`;
      csvContent += `Kelas:;${currentCls?.name || ''}\n\n`;
      
      csvContent += `Tanggal;Jam;Materi Pembelajaran;Metode Pembelajaran;Kehadiran;Catatan Hambatan/Solusi\n`;
      filteredJournals.forEach(j => {
        csvContent += `"${j.date}";"${j.hour}";"${j.topic.replace(/"/g, '""')}";"${j.method.replace(/"/g, '""')}";${j.present_count};"${j.note.replace(/"/g, '""')}"\n`;
      });

      downloadFile(csvContent, `Laporan_Jurnal_${currentCls?.name || 'Kelas'}.csv`);
    }
  };

  const downloadFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Fetch profiles for signature
  const teacherProfile = getFromStorage<any>('guruku_profiles', {
    name: 'Muhammad Hafizh, S.Pd.',
    nip_nuptk: '19920824 201803 1 004'
  });

  const headmasterName = appSettings.headmasterName || 'Drs. H. Mulyadi, M.Pd.';
  const headmasterNip = appSettings.headmasterNip || '19710312 199702 1 002';

  const renderSignatureBlock = () => {
    const today = new Date();
    const formattedDate = `${today.getDate()} ${['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'][today.getMonth()]} ${today.getFullYear()}`;

    return (
      <div className="mt-12 text-xs text-black hidden print:grid grid-cols-2 text-center break-inside-avoid">
        <div className="space-y-16">
          <div>
            <p>Mengetahui,</p>
            <p className="font-bold">Kepala {appSettings.schoolName}</p>
          </div>
          <div>
            <p className="font-bold underline">{headmasterName}</p>
            <p className="text-[10px] font-mono">{(appSettings.headmasterNipType || 'NUKS')}. {headmasterNip}</p>
          </div>
        </div>

        <div className="space-y-16">
          <div>
            <p>Bandung, {formattedDate}</p>
            <p className="font-bold">Guru Mata Pelajaran,</p>
          </div>
          <div>
            <p className="font-bold underline">{teacherProfile.name}</p>
            <p className="text-[10px] font-mono">{(teacherProfile.nip_nuptk_type || 'NIP')}. {teacherProfile.nip_nuptk || '-'}</p>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Filter Panel (Print Hidden) */}
      <div className="bg-white dark:bg-[#2b2c40] p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs space-y-4 transition-colors duration-300 print:hidden">
        <div className="flex items-center gap-2 border-b border-gray-50 dark:border-neutral-800 pb-3 mb-1">
          <Filter className="w-4.5 h-4.5 text-[#696cff]" />
          <h4 className="text-xs font-bold text-gray-800 dark:text-gray-100 uppercase tracking-wider">Filter Laporan Akademik</h4>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Filter Subject */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Mata Pelajaran</label>
            <select
              value={filterSubject}
              onChange={(e) => setFilterSubject(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#696cff]"
            >
              {subjects.map(s => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>

          {/* Filter Class */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Kelas</label>
            <select
              value={filterClass}
              onChange={(e) => setFilterClass(e.target.value)}
              className="w-full bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#696cff]"
            >
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Date range inputs (shown for absensi / jurnal) */}
          {currentMenu !== 'report_grades' && (
            <>
              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Tanggal Mulai</label>
                <input
                  type="date"
                  value={filterStartDate}
                  onChange={(e) => setFilterStartDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-[#696cff]"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400">Tanggal Selesai</label>
                <input
                  type="date"
                  value={filterEndDate}
                  onChange={(e) => setFilterEndDate(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-[#696cff]"
                />
              </div>
            </>
          )}

        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-2 pt-2 border-t border-gray-50 dark:border-neutral-800">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#232333] transition text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak PDF</span>
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV Excel</span>
          </button>
        </div>
      </div>

      {/* 2. Print Header layout (Print only) with customized Kop Surat */}
      <div className="hidden print:block text-black mb-6">
        {appSettings.logoDataUrl ? (
          <div className="w-full mb-5">
            <img 
              src={appSettings.logoDataUrl} 
              alt="Kop Surat" 
              className="w-full h-auto block"
              referrerPolicy="no-referrer"
            />
          </div>
        ) : (
          <div className="w-full h-24 border border-dashed border-gray-300 flex items-center justify-center text-xs text-gray-400 mb-5 font-semibold uppercase rounded-xl">
            [Silakan unggah Gambar Kop Surat Lengkap di menu Pengaturan]
          </div>
        )}
        
        <div className="text-center space-y-1">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            {currentMenu === 'report_grades' && 'LAPORAN REKAPITULASI NILAI AKADEMIK SISWA'}
            {currentMenu === 'report_attendance' && 'LAPORAN REKAPITULASI PRESENSI KEHADIRAN SISWA'}
            {currentMenu === 'report_journals' && 'LAPORAN REKAPITULASI JURNAL MENGAJAR GURU'}
          </h2>
          <p className="text-[11px] font-medium text-gray-700">
            Mata Pelajaran: <span className="font-bold">{currentSub?.name}</span> &nbsp;|&nbsp; Kelas: <span className="font-bold">{currentCls?.name}</span> &nbsp;|&nbsp; Tahun Pelajaran: <span className="font-bold">{appSettings.academicYear}</span>
            {currentMenu !== 'report_grades' && `\u00A0\u00A0|\u00A0\u00A0 Periode: ${filterStartDate} s/d ${filterEndDate}`}
          </p>
        </div>
      </div>

      {/* --- RENDERED REPORTS --- */}

      {/* REPORT 1: LAPORAN NILAI */}
      {currentMenu === 'report_grades' && (
        <div className="space-y-6">
          
          {/* Score Analytics Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            <div className="p-4 bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-950/30 rounded-xl flex items-center justify-center text-[#696cff] shrink-0">
                <TrendingUp className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Rata-rata Kelas</p>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">{classAvg}</h4>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl flex items-center justify-center text-emerald-500 shrink-0">
                <Percent className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Kelulusan (KKM 75)</p>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">{passingRate}%</h4>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 bg-blue-50 dark:bg-blue-950/30 rounded-xl flex items-center justify-center text-blue-500 shrink-0">
                <Award className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Nilai Tertinggi</p>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">{maxGrade}</h4>
              </div>
            </div>

            <div className="p-4 bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 flex items-center gap-4 transition-colors">
              <div className="w-10 h-10 bg-rose-50 dark:bg-rose-950/30 rounded-xl flex items-center justify-center text-rose-500 shrink-0">
                <AlertCircle className="w-4.5 h-4.5" />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Nilai Terendah</p>
                <h4 className="text-lg font-bold text-gray-800 dark:text-gray-100 mt-0.5">{minGrade}</h4>
              </div>
            </div>

          </div>

          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-xs transition-colors duration-300">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                    <th className="py-3 px-6 w-28">NIS</th>
                    <th className="py-3 px-6">Nama Siswa</th>
                    <th className="py-3 px-4 text-center">Tugas</th>
                    <th className="py-3 px-4 text-center">Harian</th>
                    <th className="py-3 px-4 text-center">ASTS</th>
                    <th className="py-3 px-4 text-center">ASAS</th>
                    <th className="py-3 px-6 text-center">Nilai Akhir</th>
                    <th className="py-3 px-6 text-center">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                  {filteredGrades.length > 0 ? (
                    filteredGrades.map((fg) => (
                      <tr key={fg.student.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300">
                        <td className="py-3.5 px-6 font-mono text-xs">{fg.student.nis}</td>
                        <td className="py-3.5 px-6 font-bold">{fg.student.name}</td>
                        <td className="py-3.5 px-4 text-center font-mono">{fg.grade.assignment}</td>
                        <td className="py-3.5 px-4 text-center font-mono">{fg.grade.daily}</td>
                        <td className="py-3.5 px-4 text-center font-mono">{fg.grade.asts ?? 0}</td>
                        <td className="py-3.5 px-4 text-center font-mono">{fg.grade.asas ?? 0}</td>
                        <td className="py-3.5 px-6 text-center">
                          <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                            fg.grade.final_grade >= 75 
                              ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20' 
                              : 'text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/20'
                          }`}>
                            {fg.grade.final_grade}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 text-center">
                          <span className="font-bold text-gray-700 dark:text-gray-300">{fg.grade.predicate}</span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        Tidak ada data siswa untuk kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {renderSignatureBlock()}

        </div>
      )}

      {/* REPORT 2: LAPORAN ABSENSI */}
      {currentMenu === 'report_attendance' && (
        <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-xs transition-colors duration-300">
          <div className="p-4 border-b border-gray-50 dark:border-neutral-800 flex justify-between items-center bg-gray-50/20">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
              Rekap Kehadiran: {filterStartDate} s/d {filterEndDate}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                  <th className="py-3 px-6 w-28">NIS</th>
                  <th className="py-3 px-6">Nama Siswa</th>
                  <th className="py-3 px-4 text-center text-emerald-600">Hadir</th>
                  <th className="py-3 px-4 text-center text-blue-600">Izin</th>
                  <th className="py-3 px-4 text-center text-amber-600">Sakit</th>
                  <th className="py-3 px-4 text-center text-rose-600">Alfa</th>
                  <th className="py-3 px-4 text-center">Total Sesi</th>
                  <th className="py-3 px-6 text-center">% Kehadiran</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                {attendanceReportList.length > 0 ? (
                  attendanceReportList.map((ar) => (
                    <tr key={ar.student.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300">
                      <td className="py-3.5 px-6 font-mono text-xs">{ar.student.nis}</td>
                      <td className="py-3.5 px-6 font-bold">{ar.student.name}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-emerald-600">{ar.hadir}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-blue-500">{ar.izin}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-amber-500">{ar.sakit}</td>
                      <td className="py-3.5 px-4 text-center font-mono font-semibold text-rose-500">{ar.alfa}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{ar.total}</td>
                      <td className="py-3.5 px-6 text-center">
                        <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                          ar.rate >= 90 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400' 
                            : ar.rate >= 75
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400'
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400'
                        }`}>
                          {ar.rate}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-gray-400">
                      Tidak ada data absensi untuk filter terpilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {renderSignatureBlock()}

        </div>
      )}

      {/* REPORT 3: LAPORAN JURNAL MENGAJAR */}
      {currentMenu === 'report_journals' && (
        <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden shadow-xs transition-colors duration-300">
          <div className="p-4 border-b border-gray-50 dark:border-neutral-800 bg-gray-50/20 text-xs font-bold text-gray-700 dark:text-gray-300">
            Daftar Jurnal Mengajar Terdaftar: {filterStartDate} s/d {filterEndDate}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                  <th className="py-3 px-6 w-28">Tanggal</th>
                  <th className="py-3 px-6 w-24">Jam</th>
                  <th className="py-3 px-6">Materi Pembelajaran</th>
                  <th className="py-3 px-6">Metode</th>
                  <th className="py-3 px-4 text-center w-24">Hadir</th>
                  <th className="py-3 px-6">Catatan Guru</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                {filteredJournals.length > 0 ? (
                  filteredJournals.map((j) => (
                    <tr key={j.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300">
                      <td className="py-3.5 px-6 font-mono text-xs">{j.date}</td>
                      <td className="py-3.5 px-6 font-mono text-xs text-gray-400">{j.hour}</td>
                      <td className="py-3.5 px-6 font-medium">{j.topic}</td>
                      <td className="py-3.5 px-6 text-gray-600 dark:text-gray-400">{j.method}</td>
                      <td className="py-3.5 px-4 text-center font-mono">{j.present_count}</td>
                      <td className="py-3.5 px-6 text-xs text-gray-500 dark:text-gray-400 italic">
                        {j.note ? `"${j.note}"` : '-'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400">
                      Tidak ada catatan jurnal dalam periode & filter terpilih.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {renderSignatureBlock()}

        </div>
      )}

    </div>
  );
}
