/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Subject, Class, Student, Grade, Attendance, TeachingJournal, ModulAjar } from '../types';
import { getFromStorage, saveToStorage, calculateFinalGrade, calculatePredicate } from '../store';
import { uploadAttachmentToDrive, getAccessToken } from '../googleService';
import { 
  GraduationCap, 
  CalendarCheck, 
  FileText, 
  BookOpen, 
  Layers, 
  Save, 
  FileSpreadsheet, 
  Printer, 
  Check, 
  Clock, 
  Calendar,
  Sparkles,
  Upload,
  Paperclip,
  CheckCircle2,
  Trash2,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Plus,
  BookOpenCheck,
  ChevronDown,
  Percent,
  Sliders,
  PenTool
} from 'lucide-react';

interface AcademicViewProps {
  currentMenu: 'grades' | 'attendance' | 'journals' | 'modul_ajar';
}

export default function AcademicView({ currentMenu }: AcademicViewProps) {
  // Load State
  const [subjects] = useState<Subject[]>(() => getFromStorage<Subject[]>('guruku_subjects', []));
  const [classes] = useState<Class[]>(() => getFromStorage<Class[]>('guruku_classes', []));
  const [students] = useState<Student[]>(() => getFromStorage<Student[]>('guruku_students', []));
  
  const [selectedAcademicYear, setSelectedAcademicYear] = useState<string>(() => {
    try {
      const settingsStr = localStorage.getItem('guruku_app_settings');
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        if (parsed.academicYear) return parsed.academicYear;
      }
    } catch (e) {}
    return '';
  });

  // Get unique academic years from class list + active settings + 3 years into the future
  const getAcademicYearsList = () => {
    const yearsSet = new Set<string>();
    classes.forEach(c => {
      if (c.academic_year) yearsSet.add(c.academic_year.trim());
    });

    let activeYear = '2025/2026';
    try {
      const settingsStr = localStorage.getItem('guruku_app_settings');
      if (settingsStr) {
        const parsed = JSON.parse(settingsStr);
        if (parsed.academicYear) activeYear = parsed.academicYear.trim();
      }
    } catch (e) {}

    if (activeYear) {
      yearsSet.add(activeYear);
      const match = activeYear.match(/^(\d{4})([/-])(\d{4})$/);
      if (match) {
        const startYear = parseInt(match[1]);
        const sep = match[2];
        const endYear = parseInt(match[3]);
        for (let i = 1; i <= 3; i++) {
          yearsSet.add(`${startYear + i}${sep}${endYear + i}`);
        }
      } else {
        const numberMatch = activeYear.match(/\d{4}/);
        if (numberMatch) {
          const yearInt = parseInt(numberMatch[0]);
          for (let i = 1; i <= 3; i++) {
            yearsSet.add(activeYear.replace(String(yearInt), String(yearInt + i)));
          }
        }
      }
    }
    return Array.from(yearsSet).filter(Boolean).sort();
  };

  const uniqueAcademicYears = getAcademicYearsList();

  // Selection Context
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string>('2026-07-17'); // default back to local metadata date

  // Dynamic lists
  const [gradesList, setGradesList] = useState<Grade[]>([]);
  const [attendanceList, setAttendanceList] = useState<Attendance[]>([]);
  const [journalsList, setJournalsList] = useState<TeachingJournal[]>([]);
  const [modulAjarList, setModulAjarList] = useState<ModulAjar[]>(() => getFromStorage<ModulAjar[]>('guruku_modul_ajar', []));

  // Modul Ajar Form Fields
  const [maSemester, setMaSemester] = useState('Ganjil');
  const [maDuration, setMaDuration] = useState('2 x 40 Menit');
  const [maTopic, setMaTopic] = useState('');
  const [maObjectives, setMaObjectives] = useState('');
  const [maActivities, setMaActivities] = useState('');
  const [maAssessment, setMaAssessment] = useState('');
  const [maAttachment, setMaAttachment] = useState('');
  const [editModulId, setEditModulId] = useState<string | null>(null);

  // Jurnal Form Fields
  const [jrHour, setJrHour] = useState('07:30 - 09:00');
  const [jrTopic, setJrTopic] = useState('');
  const [jrMethod, setJrMethod] = useState('Ceramah & Diskusi Interaktif');
  const [jrNote, setJrNote] = useState('');
  const [attachedFile, setAttachedFile] = useState<string>('');
  const [dragging, setDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Edit Journal mode
  const [editJournalId, setEditJournalId] = useState<string | null>(null);

  // Custom Grades Weights Settings State
  const [showWeightSettings, setShowWeightSettings] = useState(false);
  const [weightTugas, setWeightTugas] = useState(20);
  const [weightHarian, setWeightHarian] = useState(30);
  const [weightAsts, setWeightAsts] = useState(25);
  const [weightAsas, setWeightAsas] = useState(25);

  // Status Alerts
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  const triggerAlert = (message: string, type: 'success' | 'danger' = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 2500);
  };

  // Load custom grade weights on mount or whenever settings toggled
  useEffect(() => {
    const weights = getFromStorage('guruku_grade_weights', {
      assignment: 20,
      daily: 30,
      asts: 25,
      asas: 25
    });
    setWeightTugas(weights.assignment ?? 20);
    setWeightHarian(weights.daily ?? 30);
    setWeightAsts(weights.asts ?? 25);
    setWeightAsas(weights.asas ?? 25);
  }, []);

  const uploadFile = async (file: File) => {
    const token = await getAccessToken();
    if (!token) {
      // Local fallback
      if (currentMenu === 'modul_ajar') {
        setMaAttachment(file.name);
      } else {
        setAttachedFile(file.name);
      }
      triggerAlert(`File "${file.name}" terpilih secara lokal. Hubungkan ke Google Workspace di menu Spreadsheet untuk mengunggah otomatis ke Google Drive!`, 'success');
      return;
    }

    try {
      setIsUploading(true);
      triggerAlert(`Mengunggah "${file.name}" ke Google Drive...`, 'success');
      const result = await uploadAttachmentToDrive(file);
      if (currentMenu === 'modul_ajar') {
        setMaAttachment(result.webViewLink);
      } else {
        setAttachedFile(result.webViewLink);
      }
      triggerAlert(`Berhasil mengunggah "${file.name}" ke Google Drive!`, 'success');
    } catch (error: any) {
      console.error(error);
      triggerAlert(`Gagal mengunggah file ke Drive: ${error.message || error}`, 'danger');
    } finally {
      setIsUploading(false);
    }
  };

  // Set default subject and class if available
  useEffect(() => {
    if (subjects.length > 0 && !selectedSubject) setSelectedSubject(subjects[0].id);
    
    const yearFilteredClasses = classes.filter(c => !selectedAcademicYear || c.academic_year === selectedAcademicYear);
    if (yearFilteredClasses.length > 0) {
      // Check if selectedClass is already in the filtered set, if not, select first
      if (!selectedClass || !yearFilteredClasses.some(c => c.id === selectedClass)) {
        setSelectedClass(yearFilteredClasses[0].id);
      }
    } else if (classes.length > 0 && !selectedClass) {
      setSelectedClass(classes[0].id);
    }
  }, [subjects, classes, selectedAcademicYear]);

  // Load Grades for selected Subject & Class
  useEffect(() => {
    if (selectedSubject && selectedClass) {
      const allGrades = getFromStorage<Grade[]>('guruku_grades', []);
      const classStudents = students.filter(s => s.class_id === selectedClass);
      
      // Map grades or generate defaults
      const filtered = classStudents.map(student => {
        const found = allGrades.find(g => g.student_id === student.id && g.subject_id === selectedSubject && g.class_id === selectedClass);
        if (found) {
          // Re-calculate final grade dynamically based on current weights
          const final_grade = calculateFinalGrade(found.assignment, found.daily, found.asts ?? 0, found.asas ?? 0);
          const predicate = calculatePredicate(final_grade);
          return { ...found, final_grade, predicate };
        }
        return {
          id: `gr-${selectedSubject}-${selectedClass}-${student.id}`,
          student_id: student.id,
          subject_id: selectedSubject,
          class_id: selectedClass,
          assignment: 0,
          daily: 0,
          asts: 0,
          asas: 0,
          final_grade: 0,
          predicate: 'E' as const
        };
      });
      setGradesList(filtered);
    }
  }, [selectedSubject, selectedClass, students, weightTugas, weightHarian, weightAsts, weightAsas]);

  // Load Attendance for selected Subject, Class & Date
  useEffect(() => {
    if (selectedSubject && selectedClass && selectedDate) {
      const allAttendance = getFromStorage<Attendance[]>('guruku_attendance', []);
      const classStudents = students.filter(s => s.class_id === selectedClass);
      
      const filtered = classStudents.map(student => {
        const found = allAttendance.find(a => a.student_id === student.id && a.subject_id === selectedSubject && a.class_id === selectedClass && a.date === selectedDate);
        if (found) return found;
        return {
          id: `att-${selectedSubject}-${selectedClass}-${selectedDate}-${student.id}`,
          date: selectedDate,
          student_id: student.id,
          subject_id: selectedSubject,
          class_id: selectedClass,
          status: 'H' as const // default present
        };
      });
      setAttendanceList(filtered);
    }
  }, [selectedSubject, selectedClass, selectedDate, students]);

  // Load Journals
  useEffect(() => {
    const allJournals = getFromStorage<TeachingJournal[]>('guruku_teaching_journals', []);
    setJournalsList(allJournals);
  }, []);

  // --- GRADES INPUT HANDLER ---
  const handleGradeChange = (studentId: string, field: 'assignment' | 'daily' | 'asts' | 'asas', val: number) => {
    // Ensure val is between 0 and 100
    const score = Math.max(0, Math.min(100, val || 0));

    setGradesList(prev => prev.map(g => {
      if (g.student_id === studentId) {
        const updated = { ...g, [field]: score };
        updated.final_grade = calculateFinalGrade(updated.assignment, updated.daily, updated.asts ?? 0, updated.asas ?? 0);
        updated.predicate = calculatePredicate(updated.final_grade);
        return updated;
      }
      return g;
    }));
  };

  const handleSaveGrades = () => {
    const allGrades = getFromStorage<Grade[]>('guruku_grades', []);
    // Merge new grades
    const otherGrades = allGrades.filter(g => !(g.subject_id === selectedSubject && g.class_id === selectedClass));
    const merged = [...otherGrades, ...gradesList];

    saveToStorage('guruku_grades', merged);
    triggerAlert('Seluruh nilai siswa berhasil disimpan!');
  };

  const handleSaveWeights = (e: React.FormEvent) => {
    e.preventDefault();
    const sum = weightTugas + weightHarian + weightAsts + weightAsas;
    if (sum !== 100) {
      triggerAlert(`Gagal! Total persentase harus 100% (saat ini ${sum}%)`, 'danger');
      return;
    }

    const newWeights = {
      assignment: weightTugas,
      daily: weightHarian,
      asts: weightAsts,
      asas: weightAsas
    };

    saveToStorage('guruku_grade_weights', newWeights);
    triggerAlert('Bobot penilaian berhasil diperbarui!');
    setShowWeightSettings(false);

    // Recompute all active lists
    setGradesList(prev => prev.map(g => {
      const final_grade = calculateFinalGrade(g.assignment, g.daily, g.asts ?? 0, g.asas ?? 0);
      const predicate = calculatePredicate(final_grade);
      return { ...g, final_grade, predicate };
    }));
  };


  // --- ATTENDANCE INPUT HANDLER ---
  const handleAttendanceChange = (studentId: string, status: 'H' | 'S' | 'I' | 'A') => {
    setAttendanceList(prev => prev.map(a => {
      if (a.student_id === studentId) {
        return { ...a, status };
      }
      return a;
    }));
  };

  const markAllPresent = () => {
    setAttendanceList(prev => prev.map(a => ({ ...a, status: 'H' })));
    triggerAlert('Semua siswa ditandai Hadir!');
  };

  const handleSaveAttendance = () => {
    const allAttendance = getFromStorage<Attendance[]>('guruku_attendance', []);
    const otherAttendance = allAttendance.filter(a => !(a.subject_id === selectedSubject && a.class_id === selectedClass && a.date === selectedDate));
    const merged = [...otherAttendance, ...attendanceList];

    saveToStorage('guruku_attendance', merged);
    triggerAlert('Rekap absensi siswa berhasil disimpan!');
  };


  // --- TEACHING JOURNAL OPERATIONS ---
  const handleSaveJournal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedClass || !jrTopic) {
      triggerAlert('Pilih Mapel, Kelas, dan isi Materi Pembelajaran!', 'danger');
      return;
    }

    const classStudents = students.filter(s => s.class_id === selectedClass);
    const presentCount = classStudents.length; 

    const allJournals = getFromStorage<TeachingJournal[]>('guruku_teaching_journals', []);

    if (editJournalId) {
      const updated = allJournals.map(j => {
        if (j.id === editJournalId) {
          return {
            ...j,
            subject_id: selectedSubject,
            class_id: selectedClass,
            date: selectedDate,
            hour: jrHour,
            topic: jrTopic,
            method: jrMethod,
            note: jrNote,
            attachment_url: attachedFile || j.attachment_url
          };
        }
        return j;
      });
      setJournalsList(updated);
      saveToStorage('guruku_teaching_journals', updated);
      triggerAlert('Jurnal mengajar berhasil diperbarui!');
      setEditJournalId(null);
    } else {
      const newJournal: TeachingJournal = {
        id: `jr-${Date.now()}`,
        date: selectedDate,
        subject_id: selectedSubject,
        class_id: selectedClass,
        hour: jrHour,
        topic: jrTopic,
        method: jrMethod,
        present_count: presentCount,
        note: jrNote,
        attachment_url: attachedFile
      };

      const merged = [...allJournals, newJournal];
      setJournalsList(merged);
      saveToStorage('guruku_teaching_journals', merged);
      triggerAlert('Jurnal mengajar baru berhasil disimpan!');
    }

    // Reset Form
    setJrTopic('');
    setJrNote('');
    setAttachedFile('');
  };

  const handleEditJournal = (j: TeachingJournal) => {
    setEditJournalId(j.id);
    setSelectedSubject(j.subject_id);
    setSelectedClass(j.class_id);
    setSelectedDate(j.date);
    setJrHour(j.hour);
    setJrTopic(j.topic);
    setJrMethod(j.method);
    setJrNote(j.note);
    setAttachedFile(j.attachment_url || '');
  };

  const handleDeleteJournal = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus jurnal ini?')) {
      const allJournals = getFromStorage<TeachingJournal[]>('guruku_teaching_journals', []);
      const filtered = allJournals.filter(j => j.id !== id);
      setJournalsList(filtered);
      saveToStorage('guruku_teaching_journals', filtered);
      triggerAlert('Jurnal mengajar berhasil dihapus!', 'danger');
    }
  };


  // --- MODUL AJAR OPERATIONS ---
  const handleSaveModul = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubject || !selectedClass || !maTopic) {
      triggerAlert('Pilih Mapel, Kelas, dan isi Materi Pembelajaran!', 'danger');
      return;
    }

    const allModuls = getFromStorage<ModulAjar[]>('guruku_modul_ajar', []);

    if (editModulId) {
      const updated = allModuls.map(ma => {
        if (ma.id === editModulId) {
          return {
            ...ma,
            subject_id: selectedSubject,
            class_id: selectedClass,
            topic: maTopic,
            semester: maSemester,
            duration: maDuration,
            objectives: maObjectives,
            activities: maActivities,
            assessment: maAssessment,
            attachment_url: maAttachment || ma.attachment_url
          };
        }
        return ma;
      });
      setModulAjarList(updated);
      saveToStorage('guruku_modul_ajar', updated);
      triggerAlert('Modul Ajar berhasil diperbarui!');
      setEditModulId(null);
    } else {
      const newMa: ModulAjar = {
        id: `ma-${Date.now()}`,
        subject_id: selectedSubject,
        class_id: selectedClass,
        topic: maTopic,
        semester: maSemester,
        duration: maDuration,
        objectives: maObjectives,
        activities: maActivities,
        assessment: maAssessment,
        attachment_url: maAttachment
      };

      const merged = [...allModuls, newMa];
      setModulAjarList(merged);
      saveToStorage('guruku_modul_ajar', merged);
      triggerAlert('Modul Ajar baru berhasil disimpan!');
    }

    // Reset
    setMaTopic('');
    setMaObjectives('');
    setMaActivities('');
    setMaAssessment('');
    setMaAttachment('');
  };

  const handleEditModul = (ma: ModulAjar) => {
    setEditModulId(ma.id);
    setSelectedSubject(ma.subject_id);
    setSelectedClass(ma.class_id);
    setMaSemester(ma.semester);
    setMaDuration(ma.duration);
    setMaTopic(ma.topic);
    setMaObjectives(ma.objectives);
    setMaActivities(ma.activities);
    setMaAssessment(ma.assessment);
    setMaAttachment(ma.attachment_url || '');
  };

  const handleDeleteModul = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus Modul Ajar ini?')) {
      const allModuls = getFromStorage<ModulAjar[]>('guruku_modul_ajar', []);
      const filtered = allModuls.filter(ma => ma.id !== id);
      setModulAjarList(filtered);
      saveToStorage('guruku_modul_ajar', filtered);
      triggerAlert('Modul Ajar berhasil dihapus!', 'danger');
    }
  };


  // --- EXPORT & PRINT HELPERS ---
  const handleExportCSV = () => {
    const currentSub = subjects.find(s => s.id === selectedSubject);
    const currentCls = classes.find(c => c.id === selectedClass);
    
    let csvContent = "\uFEFF"; // UTF-8 BOM
    
    if (currentMenu === 'grades') {
      csvContent += `REKAP NILAI SISWA\n`;
      csvContent += `Mata Pelajaran:;${currentSub?.name || ''}\n`;
      csvContent += `Kelas:;${currentCls?.name || ''}\n\n`;
      csvContent += `NIS;Nama Siswa;Tugas;Harian;ASTS;ASAS;Nilai Akhir;Predikat\n`;
      
      gradesList.forEach(g => {
        const s = students.find(std => std.id === g.student_id);
        csvContent += `"${s?.nis || ''}";"${s?.name || ''}";${g.assignment};${g.daily};${g.asts ?? 0};${g.asas ?? 0};${g.final_grade};"${g.predicate}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `Rekap_Nilai_${currentSub?.name || 'Mapel'}_${currentCls?.name || 'Kelas'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (currentMenu === 'attendance') {
      csvContent += `REKAP ABSENSI SISWA\n`;
      csvContent += `Tanggal:;${selectedDate}\n`;
      csvContent += `Mata Pelajaran:;${currentSub?.name || ''}\n`;
      csvContent += `Kelas:;${currentCls?.name || ''}\n\n`;
      csvContent += `NIS;Nama Siswa;Status Absensi\n`;
      
      attendanceList.forEach(a => {
        const s = students.find(std => std.id === a.student_id);
        const statLabel = a.status === 'H' ? 'Hadir' : a.status === 'S' ? 'Sakit' : a.status === 'I' ? 'Izin' : 'Alfa';
        csvContent += `"${s?.nis || ''}";"${s?.name || ''}";"${statLabel}"\n`;
      });

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `Rekap_Absensi_${selectedDate}_${currentCls?.name || 'Kelas'}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // Drag & Drop Simulation
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      await uploadFile(file);
    }
  };

  // Filters mapping
  const currentSubObj = subjects.find(s => s.id === selectedSubject);
  const currentClsObj = classes.find(c => c.id === selectedClass);

  return (
    <div className="space-y-6 print:space-y-4 print:p-0">
      
      {/* Alert Overlay */}
      {alert.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-lg border text-sm flex items-center gap-2.5 animate-bounce print:hidden ${
          alert.type === 'success' 
            ? 'bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' 
            : 'bg-rose-50 dark:bg-rose-950 border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300'
        }`}>
          <Check className="w-4 h-4 shrink-0" />
          <span>{alert.message}</span>
        </div>
      )}

      {/* 1. Academic Selectors Bar */}
      <div className="bg-white dark:bg-[#2b2c40] p-5 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs flex flex-wrap gap-4 items-center justify-between transition-colors duration-300 print:hidden">
        
        <div className="flex flex-wrap gap-4 items-center">
          {/* Select Tahun Pelajaran */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tahun Pelajaran</label>
            <div className="relative">
              <select
                value={selectedAcademicYear}
                onChange={(e) => {
                  const newYear = e.target.value;
                  setSelectedAcademicYear(newYear);
                  // Auto-select first class in the new year
                  const filteredCls = classes.filter(c => !newYear || c.academic_year === newYear);
                  if (filteredCls.length > 0) {
                    setSelectedClass(filteredCls[0].id);
                  } else {
                    setSelectedClass('');
                  }
                }}
                className="bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 pl-3 pr-8 text-xs focus:outline-none focus:border-[#696cff] min-w-[140px] font-medium"
              >
                <option value="">Semua Tahun</option>
                {uniqueAcademicYears.map(yr => (
                  <option key={yr} value={yr}>Tahun Pelajaran {yr}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Select Mata Pelajaran */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Mata Pelajaran</label>
            <div className="relative">
              <select
                value={selectedSubject}
                onChange={(e) => setSelectedSubject(e.target.value)}
                className="bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 pl-3 pr-8 text-xs focus:outline-none focus:border-[#696cff] min-w-[160px]"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Select Kelas */}
          <div className="space-y-1">
            <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Kelas</label>
            <div className="relative">
              <select
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className="bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 pl-3 pr-8 text-xs focus:outline-none focus:border-[#696cff] min-w-[120px]"
              >
                {classes
                  .filter(cls => !selectedAcademicYear || cls.academic_year === selectedAcademicYear)
                  .map(cls => (
                    <option key={cls.id} value={cls.id}>{cls.name}</option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Select Date (Absensi only) */}
          {(currentMenu === 'attendance') && (
            <div className="space-y-1">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">Tanggal Sesi</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-1.5 px-3 text-xs focus:outline-none focus:border-[#696cff]"
              />
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {currentMenu !== 'journals' && currentMenu !== 'modul_ajar' && (
          <div className="flex gap-2">
            {currentMenu !== 'grades' && (
              <button
                onClick={handlePrint}
                className="px-3.5 py-2 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#232333] transition text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Cetak PDF</span>
              </button>
            )}
            <button
              onClick={handleExportCSV}
              className="px-3.5 py-2 border border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#232333] transition text-gray-600 dark:text-gray-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" />
              <span>Export Excel</span>
            </button>
          </div>
        )}
      </div>

      {/* --- MENU VIEW BRANCHES --- */}

      {/* MODULE 1: MANAJEMEN NILAI */}
      {currentMenu === 'grades' && (
        <div className="space-y-6">
          
          {/* Printable Report Header */}
          <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase">REKAPITULASI PENILAIAN SISWA - GURUKU</h1>
            <p className="text-sm mt-1">Mata Pelajaran: {currentSubObj?.name} | Kelas: {currentClsObj?.name} | Tahun Ajaran: {currentClsObj?.academic_year}</p>
          </div>

          {/* Weights configuration panel triggers */}
          <div className="print:hidden">
            <button
              onClick={() => setShowWeightSettings(!showWeightSettings)}
              className="px-4 py-2 bg-indigo-50 dark:bg-indigo-950/40 text-[#696cff] text-xs font-bold rounded-xl flex items-center gap-1.5 border border-indigo-100/50 dark:border-indigo-900/30 hover:bg-indigo-100/40 transition cursor-pointer"
            >
              <Sliders className="w-4 h-4" />
              <span>Kustomisasi Persentase Nilai Akhir (Tugas, Harian, ASTS, ASAS)</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showWeightSettings ? 'rotate-180' : ''}`} />
            </button>

            {showWeightSettings && (
              <form onSubmit={handleSaveWeights} className="mt-3 p-5 bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-sm space-y-4 max-w-xl animate-fadeIn">
                <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 flex items-center gap-1.5 border-b pb-2 mb-2">
                  <Percent className="w-4 h-4 text-[#696cff]" />
                  <span>Kustomisasi Bobot Penilaian Akhir</span>
                </h4>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Tugas (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={weightTugas}
                      onChange={(e) => setWeightTugas(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Harian (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={weightHarian}
                      onChange={(e) => setWeightHarian(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">ASTS (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={weightAsts}
                      onChange={(e) => setWeightAsts(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">ASAS (%)</label>
                    <input
                      type="number"
                      required
                      min="0"
                      max="100"
                      value={weightAsas}
                      onChange={(e) => setWeightAsas(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-1.5 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs font-semibold text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-neutral-800">
                  <span className={`text-[11px] font-semibold ${weightTugas + weightHarian + weightAsts + weightAsas === 100 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    Total: {weightTugas + weightHarian + weightAsts + weightAsas}% (Harus 100%)
                  </span>
                  <button
                    type="submit"
                    className="px-4 py-1.5 bg-[#696cff] hover:bg-indigo-600 transition text-white text-[11px] font-bold rounded-lg cursor-pointer"
                  >
                    Simpan & Terapkan Bobot
                  </button>
                </div>
              </form>
            )}
          </div>

          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors duration-300">
            
            <div className="p-5 border-b border-gray-50 dark:border-neutral-800 flex justify-between items-center print:hidden">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-500" />
                <span className="text-xs font-bold text-gray-800 dark:text-gray-100">
                  Input Nilai Siswa: {currentSubObj?.name} ({currentClsObj?.name})
                </span>
              </div>
              <span className="text-[10px] text-[#696cff] font-bold">
                Formula Aktif: NA = ({weightTugas}% Tugas + {weightHarian}% Harian + {weightAsts}% ASTS + {weightAsas}% ASAS)
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                    <th className="py-3 px-6 w-20">NIS</th>
                    <th className="py-3 px-6">Nama Lengkap</th>
                    <th className="py-3 px-4 text-center w-24">Tugas ({weightTugas}%)</th>
                    <th className="py-3 px-4 text-center w-24">Harian ({weightHarian}%)</th>
                    <th className="py-3 px-4 text-center w-24">ASTS ({weightAsts}%)</th>
                    <th className="py-3 px-4 text-center w-24">ASAS ({weightAsas}%)</th>
                    <th className="py-3 px-6 text-center w-28">Nilai Akhir</th>
                    <th className="py-3 px-6 text-center w-24">Predikat</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                  {gradesList.length > 0 ? (
                    gradesList.map((grade) => {
                      const student = students.find(s => s.id === grade.student_id);
                      return (
                        <tr key={grade.student_id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300">
                          <td className="py-3 px-6 font-mono text-xs font-semibold">{student?.nis}</td>
                          <td className="py-3 px-6 font-medium text-gray-800 dark:text-gray-200">{student?.name}</td>
                          
                          {/* Tugas */}
                          <td className="py-2 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grade.assignment || ''}
                              onChange={(e) => handleGradeChange(grade.student_id, 'assignment', parseInt(e.target.value))}
                              className="w-16 py-1 text-center bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#696cff] print:border-none print:bg-transparent"
                            />
                          </td>

                          {/* Harian */}
                          <td className="py-2 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grade.daily || ''}
                              onChange={(e) => handleGradeChange(grade.student_id, 'daily', parseInt(e.target.value))}
                              className="w-16 py-1 text-center bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#696cff] print:border-none print:bg-transparent"
                            />
                          </td>

                          {/* ASTS */}
                          <td className="py-2 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grade.asts || ''}
                              onChange={(e) => handleGradeChange(grade.student_id, 'asts', parseInt(e.target.value))}
                              className="w-16 py-1 text-center bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#696cff] print:border-none print:bg-transparent"
                            />
                          </td>

                          {/* ASAS */}
                          <td className="py-2 px-4 text-center">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              value={grade.asas || ''}
                              onChange={(e) => handleGradeChange(grade.student_id, 'asas', parseInt(e.target.value))}
                              className="w-16 py-1 text-center bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-lg text-xs font-semibold focus:outline-none focus:border-[#696cff] print:border-none print:bg-transparent"
                            />
                          </td>

                          {/* Computed Final */}
                          <td className="py-3 px-6 text-center">
                            <span className={`font-mono font-bold text-xs px-2.5 py-1 rounded-md ${
                              grade.final_grade >= 78 
                                ? 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400' 
                                : grade.final_grade >= 60
                                ? 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400'
                                : 'bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400'
                            }`}>
                              {grade.final_grade}
                            </span>
                          </td>

                          {/* Computed Predicate */}
                          <td className="py-3 px-6 text-center">
                            <span className={`font-bold text-xs px-2 py-0.5 rounded ${
                              grade.predicate === 'A' || grade.predicate === 'B'
                                ? 'bg-indigo-50 dark:bg-indigo-950/30 text-[#696cff]'
                                : 'bg-gray-100 dark:bg-neutral-800 text-gray-600'
                            }`}>
                              {grade.predicate}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={8} className="py-12 text-center text-gray-400">
                        Belum ada siswa di kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Save Grades Panel */}
            <div className="p-5 border-t border-gray-50 dark:border-neutral-800 flex justify-end gap-3 print:hidden">
              <button
                onClick={handleSaveGrades}
                className="px-5 py-2.5 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Nilai Kelas</span>
              </button>
            </div>

          </div>

        </div>
      )}


      {/* MODULE 2: ABSENSI SISWA */}
      {currentMenu === 'attendance' && (
        <div className="space-y-6">
          
          {/* Printable Report Header */}
          <div className="hidden print:block text-center border-b-2 border-gray-800 pb-4 mb-6">
            <h1 className="text-xl font-bold uppercase">REKAP ABSENSI HARIAN SISWA - GURUKU</h1>
            <p className="text-sm mt-1">Tanggal: {selectedDate} | Mapel: {currentSubObj?.name} | Kelas: {currentClsObj?.name}</p>
          </div>

          {/* Quick Attendance Summary metric bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 print:hidden">
            <div className="p-4 bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-50 dark:border-neutral-800 flex flex-col justify-center">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Total Siswa</span>
              <span className="text-xl font-bold text-gray-800 dark:text-gray-100 mt-1">{attendanceList.length} Siswa</span>
            </div>
            <div className="p-4 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-2xl border border-emerald-100/50 dark:border-emerald-900/30 flex flex-col justify-center">
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-wider">Hadir (H)</span>
              <span className="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1">{attendanceList.filter(a => a.status === 'H').length} Siswa</span>
            </div>
            <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-2xl border border-blue-100/50 dark:border-blue-900/30 flex flex-col justify-center">
              <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold uppercase tracking-wider">Izin (I)</span>
              <span className="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1">{attendanceList.filter(a => a.status === 'I').length} Siswa</span>
            </div>
            <div className="p-4 bg-amber-50/50 dark:bg-amber-950/20 rounded-2xl border border-amber-100/50 dark:border-amber-900/30 flex flex-col justify-center">
              <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">Sakit (S)</span>
              <span className="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1">{attendanceList.filter(a => a.status === 'S').length} Siswa</span>
            </div>
            <div className="p-4 bg-rose-50/50 dark:bg-rose-950/20 rounded-2xl border border-rose-100/50 dark:border-rose-900/30 flex flex-col justify-center">
              <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold uppercase tracking-wider">Alfa (A)</span>
              <span className="text-xl font-bold text-rose-700 dark:text-rose-400 mt-1">{attendanceList.filter(a => a.status === 'A').length} Siswa</span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors duration-300">
            
            {/* Table Action header */}
            <div className="p-5 border-b border-gray-50 dark:border-neutral-800 bg-gray-50/20 dark:bg-[#2b2c40] flex flex-wrap gap-4 items-center justify-between print:hidden">
              <span className="text-xs font-bold text-gray-700 dark:text-gray-300">
                Pencatatan Kehadiran Sesi {selectedDate}
              </span>
              <button
                onClick={markAllPresent}
                className="px-3.5 py-1.5 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition text-emerald-600 dark:text-emerald-400 text-xs font-bold rounded-xl cursor-pointer"
              >
                Tandai Semua Hadir (H)
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                    <th className="py-3 px-6 w-28">NIS</th>
                    <th className="py-3 px-6">Nama Lengkap</th>
                    <th className="py-3 px-6">Gender</th>
                    <th className="py-3 px-6 text-center w-[360px]">Status Absensi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                  {attendanceList.length > 0 ? (
                    attendanceList.map((att) => {
                      const student = students.find(s => s.id === att.student_id);
                      return (
                        <tr key={att.student_id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300">
                          <td className="py-4 px-6 font-mono text-xs font-semibold text-gray-500">{student?.nis}</td>
                          <td className="py-4 px-6 font-medium text-gray-800 dark:text-gray-200">{student?.name}</td>
                          <td className="py-4 px-6">
                            <span className="text-xs text-gray-500">{student?.gender === 'L' ? 'Laki-laki' : 'Perempuan'}</span>
                          </td>
                          <td className="py-3 px-6 text-center">
                            {/* Standard Radio selection but wide pill-styled targets */}
                            <div className="flex justify-center gap-1.5">
                              
                              {/* Hadir */}
                              <button
                                onClick={() => handleAttendanceChange(att.student_id, 'H')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  att.status === 'H' 
                                    ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs' 
                                    : 'border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                Hadir (H)
                              </button>

                              {/* Izin */}
                              <button
                                onClick={() => handleAttendanceChange(att.student_id, 'I')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  att.status === 'I' 
                                    ? 'bg-blue-500 border-blue-500 text-white shadow-xs' 
                                    : 'border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                Izin (I)
                              </button>

                              {/* Sakit */}
                              <button
                                onClick={() => handleAttendanceChange(att.student_id, 'S')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  att.status === 'S' 
                                    ? 'bg-amber-500 border-amber-500 text-white shadow-xs' 
                                    : 'border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                Sakit (S)
                              </button>

                              {/* Alfa */}
                              <button
                                onClick={() => handleAttendanceChange(att.student_id, 'A')}
                                className={`px-4 py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                                  att.status === 'A' 
                                    ? 'bg-rose-500 border-rose-500 text-white shadow-xs' 
                                    : 'border-gray-200 dark:border-neutral-700 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-neutral-800'
                                }`}
                              >
                                Alfa (A)
                              </button>

                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-12 text-center text-gray-400">
                        Tidak ada siswa di kelas ini.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Save Attendance bar */}
            <div className="p-5 border-t border-gray-50 dark:border-neutral-800 flex justify-end gap-3 print:hidden">
              <button
                onClick={handleSaveAttendance}
                className="px-5 py-2.5 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/15 cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Simpan Rekap Absensi</span>
              </button>
            </div>

          </div>

        </div>
      )}


      {/* MODULE 3: JURNAL MENGAJAR */}
      {currentMenu === 'journals' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Form (1/3 width) */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs h-fit transition-colors duration-300 print:hidden">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4 flex items-center gap-2">
              <FileText className="w-4.5 h-4.5 text-[#696cff]" />
              <span>{editJournalId ? 'Ubah Jurnal Mengajar' : 'Catat Jurnal Mengajar'}</span>
            </h3>

            <form onSubmit={handleSaveJournal} className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Jam Pelajaran</label>
                <input
                  type="text"
                  value={jrHour}
                  onChange={(e) => setJrHour(e.target.value)}
                  placeholder="Contoh: 07:30 - 09:00"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Materi Pembelajaran</label>
                <textarea
                  rows={2}
                  value={jrTopic}
                  onChange={(e) => setJrTopic(e.target.value)}
                  placeholder="Isi rincian bab / pokok materi..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Metode Pembelajaran</label>
                <input
                  type="text"
                  value={jrMethod}
                  onChange={(e) => setJrMethod(e.target.value)}
                  placeholder="Contoh: Ceramah, Tanya Jawab, Diskusi"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Catatan Hambatan / Solusi</label>
                <textarea
                  rows={2}
                  value={jrNote}
                  onChange={(e) => setJrNote(e.target.value)}
                  placeholder="Catatan keaktifan siswa atau kendala kelas..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              {/* Upload Lampiran Section */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Lampiran Dokumentasi Kelas</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    dragging 
                      ? 'border-[#696cff] bg-indigo-50/20' 
                      : attachedFile 
                      ? 'border-emerald-300 bg-emerald-50/10 dark:border-emerald-800' 
                      : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#232333]'
                  }`}
                >
                   <input
                    type="file"
                    id="file-input"
                    className="hidden"
                    disabled={isUploading}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        await uploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="file-input" className="cursor-pointer">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="w-8 h-8 text-[#696cff] animate-spin mb-1" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Mengunggah ke Google Drive...</span>
                      </div>
                    ) : attachedFile ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-full block" title={attachedFile}>
                          {attachedFile.startsWith('http') ? 'Tautan Google Drive Aktif' : attachedFile}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">Seret file baru atau klik untuk mengganti</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Pilih berkas / Seret kesini</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">PDF, Gambar, Excel (Max 5MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editJournalId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditJournalId(null);
                      setJrTopic('');
                      setJrNote('');
                      setAttachedFile('');
                    }}
                    className="flex-1 py-2 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  <span>{editJournalId ? 'Simpan Perubahan' : 'Simpan Jurnal'}</span>
                </button>
              </div>

            </form>
          </div>

          {/* Right Column: List (2/3 width) */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs xl:col-span-2 overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Riwayat Jurnal Mengajar</h3>
              <span className="text-xs font-mono text-gray-400">{journalsList.length} total jurnalan</span>
            </div>

            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {journalsList.length > 0 ? (
                journalsList.slice().reverse().map((j) => {
                  const sub = subjects.find(s => s.id === j.subject_id);
                  const cls = classes.find(c => c.id === j.class_id);
                  return (
                    <div 
                      key={j.id} 
                      className="p-4 rounded-xl bg-gray-50/75 dark:bg-[#232333]/40 border border-gray-100 dark:border-neutral-800/80 space-y-2 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all"
                    >
                      {/* Badge line */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-neutral-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-[#696cff] text-[10px] font-bold">
                            {cls?.name || 'Kelas'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            {sub?.name || 'Mapel'}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <Calendar className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-mono">{j.date}</span>
                          <span className="font-mono text-[10px] opacity-75">({j.hour})</span>
                        </div>
                      </div>

                      {/* Content */}
                      <div>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200">
                          Materi: <span className="font-normal text-gray-600 dark:text-gray-400">{j.topic}</span>
                        </p>
                        <p className="text-xs font-bold text-gray-800 dark:text-gray-200 mt-1">
                          Metode: <span className="font-normal text-gray-600 dark:text-gray-400">{j.method}</span>
                        </p>
                        {j.note && (
                          <p className="text-xs text-gray-500 italic mt-1.5 pl-2.5 border-l-2 border-gray-200 dark:border-neutral-700">
                            "{j.note}"
                          </p>
                        )}
                      </div>

                      {/* Actions / Attachments line */}
                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-100 dark:border-neutral-800/80 text-[11px] text-gray-400">
                        <div>
                          {j.attachment_url ? (
                            <a
                              href={j.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[150px] font-mono">{j.attachment_url.substring(0, 30)}...</span>
                            </a>
                          ) : (
                            <span className="opacity-60">Tanpa Lampiran</span>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0 print:hidden">
                          <button
                            onClick={() => handleEditJournal(j)}
                            className="text-[#696cff] font-bold hover:underline cursor-pointer"
                          >
                            Ubah
                          </button>
                          <span className="opacity-50">|</span>
                          <button
                            onClick={() => handleDeleteJournal(j.id)}
                            className="text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Belum ada riwayat jurnal mengajar tercatat.
                </div>
              )}
            </div>

          </div>

        </div>
      )}


      {/* MODULE 4: MODUL AJAR (Administrasi Guru) */}
      {currentMenu === 'modul_ajar' && (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          
          {/* Left Column: Form */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs h-fit transition-colors duration-300 print:hidden">
            <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm mb-4 flex items-center gap-2">
              <BookOpenCheck className="w-4.5 h-4.5 text-[#696cff]" />
              <span>{editModulId ? 'Ubah Modul Ajar' : 'Buat Modul Ajar'}</span>
            </h3>

            <form onSubmit={handleSaveModul} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Semester</label>
                  <select
                    value={maSemester}
                    onChange={(e) => setMaSemester(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-semibold"
                  >
                    <option value="Ganjil">Ganjil</option>
                    <option value="Genap">Genap</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Durasi Sesi</label>
                  <input
                    type="text"
                    value={maDuration}
                    onChange={(e) => setMaDuration(e.target.value)}
                    placeholder="Contoh: 2 x 40 Menit"
                    className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Pokok Bahasan / Topik Utama</label>
                <input
                  type="text"
                  value={maTopic}
                  onChange={(e) => setMaTopic(e.target.value)}
                  placeholder="Contoh: Teks Deskriptif Hewan Peliharaan"
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Tujuan Pembelajaran</label>
                <textarea
                  rows={2}
                  value={maObjectives}
                  onChange={(e) => setMaObjectives(e.target.value)}
                  placeholder="Isi kompetensi/tujuan yang harus dicapai siswa..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Langkah Kegiatan Belajar</label>
                <textarea
                  rows={2}
                  value={maActivities}
                  onChange={(e) => setMaActivities(e.target.value)}
                  placeholder="Isi langkah pembuka, inti, dan penutup pelajaran..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Metode Asesmen / Penilaian</label>
                <textarea
                  rows={1.5}
                  value={maAssessment}
                  onChange={(e) => setMaAssessment(e.target.value)}
                  placeholder="Contoh: Tes Formatif Tertulis & Kinerja Presentasi..."
                  className="w-full px-3.5 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                />
              </div>

              {/* Upload Lampiran RPP / Modul PDF */}
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1">Lampiran File RPP / Modul Lengkap</label>
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-4 text-center cursor-pointer transition-colors ${
                    dragging 
                      ? 'border-[#696cff] bg-indigo-50/20' 
                      : maAttachment 
                      ? 'border-emerald-300 bg-emerald-50/10 dark:border-emerald-800' 
                      : 'border-gray-200 dark:border-neutral-700 hover:bg-gray-50 dark:hover:bg-[#232333]'
                  }`}
                >
                   <input
                    type="file"
                    id="ma-file-input"
                    className="hidden"
                    disabled={isUploading}
                    onChange={async (e) => {
                      if (e.target.files && e.target.files[0]) {
                        await uploadFile(e.target.files[0]);
                      }
                    }}
                  />
                  <label htmlFor="ma-file-input" className="cursor-pointer">
                    {isUploading ? (
                      <div className="flex flex-col items-center">
                        <RefreshCw className="w-8 h-8 text-[#696cff] animate-spin mb-1" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300">Mengunggah ke Drive...</span>
                      </div>
                    ) : maAttachment ? (
                      <div className="flex flex-col items-center">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-1" />
                        <span className="text-xs font-bold text-gray-700 dark:text-gray-300 truncate max-w-full block" title={maAttachment}>
                          {maAttachment.startsWith('http') ? 'Tautan Google Drive Aktif' : maAttachment}
                        </span>
                        <span className="text-[10px] text-gray-400 mt-1">Klik untuk mengganti</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center">
                        <Upload className="w-8 h-8 text-gray-400 mb-1" />
                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">Pilih berkas / Seret kesini</span>
                        <span className="text-[9px] text-gray-400 mt-0.5">PDF, Word, RPP (Max 10MB)</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                {editModulId && (
                  <button
                    type="button"
                    onClick={() => {
                      setEditModulId(null);
                      setMaTopic('');
                      setMaObjectives('');
                      setMaActivities('');
                      setMaAssessment('');
                      setMaAttachment('');
                    }}
                    className="flex-1 py-2 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl cursor-pointer"
                  >
                    Batal
                  </button>
                )}
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1 shadow-md shadow-indigo-600/10 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>{editModulId ? 'Simpan Modul' : 'Simpan Modul'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Right Column: List */}
          <div className="bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs xl:col-span-2 overflow-hidden transition-colors duration-300">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">Riwayat Modul Ajar (RPP)</h3>
              <span className="text-xs font-mono text-gray-400">{modulAjarList.length} modul terdaftar</span>
            </div>

            <div className="space-y-4 max-h-[640px] overflow-y-auto pr-1">
              {modulAjarList.length > 0 ? (
                modulAjarList.slice().reverse().map((ma) => {
                  const sub = subjects.find(s => s.id === ma.subject_id);
                  const cls = classes.find(c => c.id === ma.class_id);
                  return (
                    <div 
                      key={ma.id} 
                      className="p-5 rounded-xl bg-gray-50/75 dark:bg-[#232333]/40 border border-gray-100 dark:border-neutral-800/80 space-y-3 hover:border-indigo-100 dark:hover:border-indigo-900/30 transition-all animate-fadeIn"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 dark:border-neutral-800 pb-2">
                        <div className="flex items-center gap-1.5">
                          <span className="px-2.5 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/30 text-[#696cff] text-[10px] font-bold">
                            {cls?.name || 'Kelas'}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">
                            {sub?.name || 'Mapel'}
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400 text-[9px] font-bold uppercase font-mono">
                            Semester {ma.semester}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium font-mono bg-white dark:bg-[#2b2c40] px-2 py-0.5 rounded-md border border-gray-100 dark:border-neutral-800">
                          <span>Sesi: {ma.duration}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-100">
                          Topik: <span className="font-normal text-[#696cff]">{ma.topic}</span>
                        </h4>
                        
                        <div className="text-xs text-gray-600 dark:text-gray-400 space-y-1 bg-white/50 dark:bg-[#232333]/20 p-3 rounded-lg border border-gray-100 dark:border-neutral-800/40">
                          <p><strong className="text-gray-700 dark:text-gray-300">Tujuan Pembelajaran:</strong> {ma.objectives}</p>
                          {ma.activities && <p className="mt-1.5"><strong className="text-gray-700 dark:text-gray-300">Langkah Pembelajaran:</strong> {ma.activities}</p>}
                          {ma.assessment && <p className="mt-1.5"><strong className="text-gray-700 dark:text-gray-300">Asesmen/Penilaian:</strong> {ma.assessment}</p>}
                        </div>
                      </div>

                      <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-neutral-800/80 text-[11px] text-gray-400">
                        <div>
                          {ma.attachment_url ? (
                            <a
                              href={ma.attachment_url}
                              target="_blank"
                              rel="noreferrer"
                              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 hover:underline"
                            >
                              <Paperclip className="w-3 h-3 shrink-0" />
                              <span className="truncate max-w-[160px] font-mono">{ma.attachment_url.substring(0, 30)}...</span>
                            </a>
                          ) : (
                            <span className="opacity-60">Tanpa Lampiran RPP</span>
                          )}
                        </div>

                        <div className="flex gap-2 shrink-0">
                          <button
                            onClick={() => handleEditModul(ma)}
                            className="text-[#696cff] font-bold hover:underline cursor-pointer"
                          >
                            Ubah
                          </button>
                          <span className="opacity-50">|</span>
                          <button
                            onClick={() => handleDeleteModul(ma.id)}
                            className="text-rose-500 font-bold hover:underline cursor-pointer"
                          >
                            Hapus
                          </button>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-gray-400 dark:text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                  Belum ada dokumen Modul Ajar terdaftar. Silakan catat modul ajar pertama Anda di formulir sebelah kiri!
                </div>
              )}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
