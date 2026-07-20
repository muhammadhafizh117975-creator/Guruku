/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Profile {
  name: string;
  nip_nuptk: string;
  email: string;
  hp: string;
  photoUrl: string;
  nip_nuptk_type?: 'NIP' | 'NUPTK';
}

export interface Subject {
  id: string;
  code: string;
  name: string;
}

export interface Class {
  id: string;
  name: string;
  level: string; // e.g. "VII", "VIII", "IX"
  academic_year: string; // e.g. "2025/2026"
}

export interface Student {
  id: string;
  nis: string;
  name: string;
  gender: 'L' | 'P'; // Laki-laki / Perempuan
  birth_place?: string;
  birth_date?: string; // YYYY-MM-DD
  address?: string;
  parent_phone?: string;
  class_id: string;
}

export interface Grade {
  id: string;
  student_id: string;
  subject_id: string;
  class_id: string;
  assignment: number; // Nilai Tugas
  daily: number; // Nilai Harian
  asts: number; // Nilai ASTS
  asas: number; // Nilai ASAS
  final_grade: number; // Nilai Akhir (calculated)
  predicate: 'A' | 'B' | 'C' | 'D' | 'E'; // Predikat (calculated)
}

export interface Attendance {
  id: string;
  date: string; // YYYY-MM-DD
  student_id: string;
  subject_id: string;
  class_id: string;
  status: 'H' | 'S' | 'I' | 'A'; // Hadir, Sakit, Izin, Alfa
}

export interface TeachingJournal {
  id: string;
  date: string; // YYYY-MM-DD
  subject_id: string;
  class_id: string;
  hour: string; // e.g. "07:00 - 08:30"
  topic: string;
  method: string;
  present_count: number;
  note: string;
  attachment_url?: string;
}

export interface ModulAjar {
  id: string;
  subject_id: string;
  class_id: string;
  topic: string;
  semester: string; // e.g. "Ganjil" | "Genap"
  duration: string; // e.g. "2 x 40 Menit"
  objectives: string;
  activities: string;
  assessment: string;
  attachment_url?: string;
}

export type MenuType = 
  | 'dashboard'
  | 'subjects'
  | 'classes'
  | 'students'
  | 'grades'
  | 'attendance'
  | 'journals'
  | 'modul_ajar'
  | 'report_grades'
  | 'report_attendance'
  | 'report_journals'
  | 'app_settings'
  | 'profile';
