/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Profile, Subject, Class, Student, Grade, Attendance, TeachingJournal, ModulAjar } from './types';

// Default Teacher Profile matched to the user's details
const DEFAULT_PROFILE: Profile = {
  name: 'Muhammad Hafizh, S.Pd.',
  nip_nuptk: '19920824 201803 1 004',
  email: 'muhammad.hafizh117975@guru.smp.belajar.id',
  hp: '081234567890',
  photoUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=300&h=300&q=80',
};

// Seed Subjects
const SEED_SUBJECTS: Subject[] = [
  { id: 'sub-1', code: 'MAT-SMP', name: 'Matematika' },
  { id: 'sub-2', code: 'ING-SMP', name: 'Bahasa Inggris' },
  { id: 'sub-3', code: 'IPA-SMP', name: 'Ilmu Pengetahuan Alam (IPA)' },
  { id: 'sub-4', code: 'IND-SMP', name: 'Bahasa Indonesia' },
];

// Seed Classes
const SEED_CLASSES: Class[] = [
  { id: 'cls-1', name: 'Kelas VII-A', level: 'VII', academic_year: '2025/2026' },
  { id: 'cls-2', name: 'Kelas VIII-B', level: 'VIII', academic_year: '2025/2026' },
  { id: 'cls-3', name: 'Kelas IX-C', level: 'IX', academic_year: '2025/2026' },
];

// Seed Students
const SEED_STUDENTS: Student[] = [
  // VII-A
  { id: 'std-1', nis: '102101', name: 'Ahmad Fauzi', gender: 'L', birth_place: 'Jakarta', birth_date: '2013-05-12', address: 'Jl. Merdeka No. 12, Jakarta', parent_phone: '08121111111', class_id: 'cls-1' },
  { id: 'std-2', nis: '102102', name: 'Siti Aminah', gender: 'P', birth_place: 'Bandung', birth_date: '2013-09-24', address: 'Jl. Melati No. 4, Jakarta', parent_phone: '08122222222', class_id: 'cls-1' },
  { id: 'std-3', nis: '102103', name: 'Rizky Pratama', gender: 'L', birth_place: 'Surabaya', birth_date: '2013-02-18', address: 'Perum Hijau Indah Blok B/9', parent_phone: '08123333333', class_id: 'cls-1' },
  { id: 'std-4', nis: '102104', name: 'Dewi Lestari', gender: 'P', birth_place: 'Semarang', birth_date: '2013-11-05', address: 'Jl. Kenanga Timur No. 45', parent_phone: '08124444444', class_id: 'cls-1' },
  { id: 'std-5', nis: '102105', name: 'Budi Santoso', gender: 'L', birth_place: 'Yogyakarta', birth_date: '2013-07-29', address: 'Kampung Sawah No. 8', parent_phone: '08125555555', class_id: 'cls-1' },
  
  // VIII-B
  { id: 'std-6', nis: '101201', name: 'Anisa Rahmawati', gender: 'P', birth_place: 'Malang', birth_date: '2012-04-15', address: 'Jl. Danau No. 10', parent_phone: '08126666666', class_id: 'cls-2' },
  { id: 'std-7', nis: '101202', name: 'Diki Chandra', gender: 'L', birth_place: 'Solo', birth_date: '2012-10-30', address: 'Jl. Slamet Riyadi No. 120', parent_phone: '08127777777', class_id: 'cls-2' },
  { id: 'std-8', nis: '101203', name: 'Eka Saputra', gender: 'L', birth_place: 'Medan', birth_date: '2012-01-22', address: 'Kompleks Harmoni C-3', parent_phone: '08128888888', class_id: 'cls-2' },
  { id: 'std-9', nis: '101204', name: 'Fitri Handayani', gender: 'P', birth_place: 'Palembang', birth_date: '2012-08-14', address: 'Jl. Rawa No. 90', parent_phone: '08129999999', class_id: 'cls-2' },
  
  // IX-C
  { id: 'std-10', nis: '100301', name: 'Genta Perkasa', gender: 'L', birth_place: 'Padang', birth_date: '2011-03-08', address: 'Jl. Bukit Tinggi No. 5', parent_phone: '08130000000', class_id: 'cls-3' },
  { id: 'std-11', nis: '100302', name: 'Hana Olivia', gender: 'P', birth_place: 'Manado', birth_date: '2011-12-19', address: 'Perum Pantai Indah F/12', parent_phone: '08131111111', class_id: 'cls-3' },
  { id: 'std-12', nis: '100303', name: 'Irfan Hakim', gender: 'L', birth_place: 'Bogor', birth_date: '2011-06-25', address: 'Jl. Pajajaran No. 34', parent_phone: '08132222222', class_id: 'cls-3' },
];

// Seed Grades
const SEED_GRADES: Grade[] = [
  // Matematika - VII-A
  { id: 'gr-1', student_id: 'std-1', subject_id: 'sub-1', class_id: 'cls-1', assignment: 85, daily: 80, asts: 78, asas: 82, final_grade: 81.3, predicate: 'B' },
  { id: 'gr-2', student_id: 'std-2', subject_id: 'sub-1', class_id: 'cls-1', assignment: 90, daily: 92, asts: 85, asas: 88, final_grade: 89.1, predicate: 'A' },
  { id: 'gr-3', student_id: 'std-3', subject_id: 'sub-1', class_id: 'cls-1', assignment: 75, daily: 70, asts: 72, asas: 78, final_grade: 73.9, predicate: 'C' },
  { id: 'gr-4', student_id: 'std-4', subject_id: 'sub-1', class_id: 'cls-1', assignment: 88, daily: 85, asts: 80, asas: 85, final_grade: 84.4, predicate: 'B' },
  { id: 'gr-5', student_id: 'std-5', subject_id: 'sub-1', class_id: 'cls-1', assignment: 65, daily: 68, asts: 60, asas: 70, final_grade: 66.1, predicate: 'D' },
  
  // Bahasa Inggris - VII-A
  { id: 'gr-6', student_id: 'std-1', subject_id: 'sub-2', class_id: 'cls-1', assignment: 80, daily: 82, asts: 85, asas: 80, final_grade: 81.4, predicate: 'B' },
  { id: 'gr-7', student_id: 'std-2', subject_id: 'sub-2', class_id: 'cls-1', assignment: 95, daily: 90, asts: 92, asas: 95, final_grade: 92.9, predicate: 'A' },
  
  // Matematika - VIII-B
  { id: 'gr-8', student_id: 'std-6', subject_id: 'sub-1', class_id: 'cls-2', assignment: 82, daily: 85, asts: 80, asas: 84, final_grade: 82.9, predicate: 'B' },
  { id: 'gr-9', student_id: 'std-7', subject_id: 'sub-1', class_id: 'cls-2', assignment: 70, daily: 72, asts: 65, asas: 74, final_grade: 70.5, predicate: 'C' },
  { id: 'gr-10', student_id: 'std-8', subject_id: 'sub-1', class_id: 'cls-2', assignment: 88, daily: 90, asts: 85, asas: 88, final_grade: 88.1, predicate: 'A' },
  { id: 'gr-11', student_id: 'std-9', subject_id: 'sub-1', class_id: 'cls-2', assignment: 92, daily: 88, asts: 90, asas: 92, final_grade: 90.6, predicate: 'A' },
];

// Helper to generate some attendance for last 5 teaching days
const generateSeedAttendance = (): Attendance[] => {
  const list: Attendance[] = [];
  const dates = ['2026-07-13', '2026-07-14', '2026-07-15', '2026-07-16', '2026-07-17'];
  let idCounter = 1;

  // Let's populate for VII-A, sub-1 (Matematika) and sub-2 (English)
  dates.forEach(date => {
    // Matematika VII-A
    ['std-1', 'std-2', 'std-3', 'std-4', 'std-5'].forEach((sid, idx) => {
      let status: 'H' | 'S' | 'I' | 'A' = 'H';
      // Introduce some random absent values
      if (date === '2026-07-15' && idx === 2) status = 'S'; // Rizky Sakit
      if (date === '2026-07-16' && idx === 4) status = 'I'; // Budi Izin
      if (date === '2026-07-17' && idx === 0) status = 'A'; // Ahmad Alfa
      
      list.push({
        id: `att-${idCounter++}`,
        date,
        student_id: sid,
        subject_id: 'sub-1',
        class_id: 'cls-1',
        status
      });
    });

    // IPA VII-A
    ['std-1', 'std-2', 'std-3', 'std-4', 'std-5'].forEach((sid, idx) => {
      let status: 'H' | 'S' | 'I' | 'A' = 'H';
      if (date === '2026-07-14' && idx === 1) status = 'I';
      list.push({
        id: `att-${idCounter++}`,
        date,
        student_id: sid,
        subject_id: 'sub-3',
        class_id: 'cls-1',
        status
      });
    });

    // Matematika VIII-B
    ['std-6', 'std-7', 'std-8', 'std-9'].forEach((sid, idx) => {
      let status: 'H' | 'S' | 'I' | 'A' = 'H';
      if (date === '2026-07-16' && idx === 1) status = 'A';
      list.push({
        id: `att-${idCounter++}`,
        date,
        student_id: sid,
        subject_id: 'sub-1',
        class_id: 'cls-2',
        status
      });
    });
  });

  return list;
};

// Seed Jurnal Mengajar
const SEED_JOURNALS: TeachingJournal[] = [
  {
    id: 'jr-1',
    date: '2026-07-13',
    subject_id: 'sub-1',
    class_id: 'cls-1',
    hour: '07:30 - 09:00',
    topic: 'Aljabar Dasar dan Variabel',
    method: 'Diskusi Kelompok & Ceramah',
    present_count: 5,
    note: 'Siswa sangat antusias memahami variabel x dan y. Latihan soal diselesaikan tepat waktu.',
  },
  {
    id: 'jr-2',
    date: '2026-07-14',
    subject_id: 'sub-3',
    class_id: 'cls-1',
    hour: '09:15 - 10:45',
    topic: 'Sistem Organ Manusia',
    method: 'Presentasi PPT & Alat Peraga',
    present_count: 4,
    note: 'Siti Aminah berhalangan hadir (Izin). Pembahasan difokuskan pada organ pencernaan.',
  },
  {
    id: 'jr-3',
    date: '2026-07-15',
    subject_id: 'sub-1',
    class_id: 'cls-1',
    hour: '07:30 - 09:00',
    topic: 'Penyelesaian Persamaan Linier Satu Variabel',
    method: 'Tanya Jawab & Latihan Soal Mandiri',
    present_count: 4,
    note: 'Rizky Pratama Sakit. Evaluasi harian menunjukkan pemahaman 80% siswa sudah melampaui KKM.',
  },
  {
    id: 'jr-4',
    date: '2026-07-16',
    subject_id: 'sub-1',
    class_id: 'cls-2',
    hour: '10:45 - 12:15',
    topic: 'Fungsi Kuadrat dan Grafik Parabola',
    method: 'Eksperimen Grafis GeoGebra',
    present_count: 3,
    note: 'Diki Chandra Alfa. Siswa aktif berkolaborasi menggambarkan grafik fungsi.',
  },
  {
    id: 'jr-5',
    date: '2026-07-17',
    subject_id: 'sub-1',
    class_id: 'cls-1',
    hour: '07:30 - 09:00',
    topic: 'Kuis Bab 1 Aljabar',
    method: 'Ujian Tertulis Mandiri',
    present_count: 4,
    note: 'Ahmad Fauzi Tanpa Keterangan (Alfa). Kuis berjalan tertib.',
  },
];

// Initialize Storage values
export const initStorage = () => {
  if (!localStorage.getItem('guruku_profiles')) {
    localStorage.setItem('guruku_profiles', JSON.stringify(DEFAULT_PROFILE));
  }
  if (!localStorage.getItem('guruku_subjects')) {
    localStorage.setItem('guruku_subjects', JSON.stringify(SEED_SUBJECTS));
  }
  if (!localStorage.getItem('guruku_classes')) {
    localStorage.setItem('guruku_classes', JSON.stringify(SEED_CLASSES));
  }
  if (!localStorage.getItem('guruku_students')) {
    localStorage.setItem('guruku_students', JSON.stringify(SEED_STUDENTS));
  }
  if (!localStorage.getItem('guruku_grades')) {
    localStorage.setItem('guruku_grades', JSON.stringify(SEED_GRADES));
  }
  if (!localStorage.getItem('guruku_attendance')) {
    localStorage.setItem('guruku_attendance', JSON.stringify(generateSeedAttendance()));
  }
  if (!localStorage.getItem('guruku_teaching_journals')) {
    localStorage.setItem('guruku_teaching_journals', JSON.stringify(SEED_JOURNALS));
  }
  
  // Set spreadsheet authentication info
  if (!localStorage.getItem('guruku_spreadsheet_config')) {
    localStorage.setItem('guruku_spreadsheet_config', JSON.stringify({
      connected: false,
      spreadsheetId: '',
      sheetUrl: '',
      lastSynced: ''
    }));
  }
};

// Main State Getter / Setter Helpers
export const getFromStorage = <T>(key: string, defaultValue: T): T => {
  const val = localStorage.getItem(key);
  if (!val) return defaultValue;
  try {
    return JSON.parse(val) as T;
  } catch (e) {
    return defaultValue;
  }
};

export const saveToStorage = <T>(key: string, data: T): void => {
  localStorage.setItem(key, JSON.stringify(data));
  
  // Sync lastSynced in spreadsheet config
  const config = getFromStorage('guruku_spreadsheet_config', { connected: true, spreadsheetId: '', sheetUrl: '', lastSynced: '' });
  config.lastSynced = new Date().toISOString().replace('T', ' ').substring(0, 16);
  localStorage.setItem('guruku_spreadsheet_config', JSON.stringify(config));

  // Trigger automated backup
  try {
    triggerAutoBackup();
  } catch (err) {
    console.error('Failed to trigger auto-backup inside saveToStorage:', err);
  }
};

// Spreadsheet Export/Import
export const exportDatabaseAsSpreadsheetJSON = () => {
  const data = {
    profiles: getFromStorage<Profile>('guruku_profiles', DEFAULT_PROFILE),
    subjects: getFromStorage<Subject[]>('guruku_subjects', []),
    classes: getFromStorage<Class[]>('guruku_classes', []),
    students: getFromStorage<Student[]>('guruku_students', []),
    grades: getFromStorage<Grade[]>('guruku_grades', []),
    attendance: getFromStorage<Attendance[]>('guruku_attendance', []),
    teaching_journals: getFromStorage<TeachingJournal[]>('guruku_teaching_journals', []),
    modul_ajar: getFromStorage<ModulAjar[]>('guruku_modul_ajar', []),
    app_settings: getFromStorage<any>('guruku_app_settings', null),
    grade_weights: getFromStorage<any>('guruku_grade_weights', null),
  };
  return JSON.stringify(data, null, 2);
};

export const importDatabaseFromSpreadsheetJSON = (jsonString: string): boolean => {
  try {
    const parsed = JSON.parse(jsonString);
    if (parsed.profiles) localStorage.setItem('guruku_profiles', JSON.stringify(parsed.profiles));
    if (parsed.subjects) localStorage.setItem('guruku_subjects', JSON.stringify(parsed.subjects));
    if (parsed.classes) localStorage.setItem('guruku_classes', JSON.stringify(parsed.classes));
    if (parsed.students) localStorage.setItem('guruku_students', JSON.stringify(parsed.students));
    if (parsed.grades) localStorage.setItem('guruku_grades', JSON.stringify(parsed.grades));
    if (parsed.attendance) localStorage.setItem('guruku_attendance', JSON.stringify(parsed.attendance));
    if (parsed.teaching_journals) localStorage.setItem('guruku_teaching_journals', JSON.stringify(parsed.teaching_journals));
    if (parsed.modul_ajar) localStorage.setItem('guruku_modul_ajar', JSON.stringify(parsed.modul_ajar));
    if (parsed.app_settings) localStorage.setItem('guruku_app_settings', JSON.stringify(parsed.app_settings));
    if (parsed.grade_weights) localStorage.setItem('guruku_grade_weights', JSON.stringify(parsed.grade_weights));
    return true;
  } catch (error) {
    console.error('Failed to import database:', error);
    return false;
  }
};

// Calculate Grades
export const calculateFinalGrade = (assignment: number, daily: number, asts: number, asas: number): number => {
  // Let's load weights from localStorage if configured, default: 20% Assignment, 30% Daily, 25% ASTS, 25% ASAS
  const weights = getFromStorage('guruku_grade_weights', {
    assignment: 20,
    daily: 30,
    asts: 25,
    asas: 25
  });
  const wA = (weights.assignment ?? 20) / 100;
  const wD = (weights.daily ?? 30) / 100;
  const wAsts = (weights.asts ?? 25) / 100;
  const wAsas = (weights.asas ?? 25) / 100;

  const calculated = (assignment * wA) + (daily * wD) + (asts * wAsts) + (asas * wAsas);
  return Math.round(calculated * 10) / 10;
};

export const calculatePredicate = (score: number): 'A' | 'B' | 'C' | 'D' | 'E' => {
  if (score >= 88) return 'A';
  if (score >= 78) return 'B';
  if (score >= 68) return 'C';
  if (score >= 55) return 'D';
  return 'E';
};

// Automatic Backup and Restore Helpers
export const triggerAutoBackup = (): void => {
  try {
    const currentDataStr = exportDatabaseAsSpreadsheetJSON();
    const backupsStr = localStorage.getItem('guruku_auto_backups');
    const backups: any[] = backupsStr ? JSON.parse(backupsStr) : [];
    
    // Check if the current data matches the last backup
    if (backups.length > 0) {
      const lastBackup = backups[0];
      if (lastBackup.data === currentDataStr) {
        // No changes, no need to create a new backup
        return;
      }
    }
    
    // Create new backup
    const parsedData = JSON.parse(currentDataStr);
    const summary = {
      studentsCount: parsedData.students?.length || 0,
      classesCount: parsedData.classes?.length || 0,
      gradesCount: parsedData.grades?.length || 0,
      journalsCount: parsedData.teaching_journals?.length || 0,
      subjectsCount: parsedData.subjects?.length || 0,
    };
    
    const newBackup = {
      id: `auto-${Date.now()}`,
      timestamp: new Date().toISOString(),
      data: currentDataStr,
      summary
    };
    
    // Prepend and limit to 10 backups
    const updatedBackups = [newBackup, ...backups].slice(0, 10);
    localStorage.setItem('guruku_auto_backups', JSON.stringify(updatedBackups));
    console.log('Automated backup created successfully.');
  } catch (err) {
    console.error('Failed to run automated backup:', err);
  }
};

export const restoreFromAutoBackup = (backupId: string): boolean => {
  try {
    const backupsStr = localStorage.getItem('guruku_auto_backups');
    if (!backupsStr) return false;
    const backups: any[] = JSON.parse(backupsStr);
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return false;
    
    return importDatabaseFromSpreadsheetJSON(backup.data);
  } catch (err) {
    console.error('Failed to restore from auto backup:', err);
    return false;
  }
};
