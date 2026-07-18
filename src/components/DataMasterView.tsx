/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Subject, Class, Student } from '../types';
import { getFromStorage, saveToStorage } from '../store';
import * as XLSX from 'xlsx';
import { 
  BookOpen, 
  Layers, 
  Users, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  X, 
  Check, 
  Filter, 
  MapPin, 
  Phone,
  AlertCircle,
  Upload,
  FileSpreadsheet
} from 'lucide-react';

interface DataMasterViewProps {
  currentMenu: 'subjects' | 'classes' | 'students';
}

export default function DataMasterView({ currentMenu }: DataMasterViewProps) {
  // Read Master Tables
  const [subjects, setSubjects] = useState<Subject[]>(() => getFromStorage<Subject[]>('guruku_subjects', []));
  const [classes, setClasses] = useState<Class[]>(() => getFromStorage<Class[]>('guruku_classes', []));
  const [students, setStudents] = useState<Student[]>(() => getFromStorage<Student[]>('guruku_students', []));

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [classFilter, setClassFilter] = useState('');

  // Active form state (unified modal approach for clean UI)
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Subject Form Fields
  const [subCode, setSubCode] = useState('');
  const [subName, setSubName] = useState('');

  // Class Form Fields
  const [clsName, setClsName] = useState('');
  const [clsLevel, setClsLevel] = useState('VII');
  const [clsYear, setClsYear] = useState('2025/2026');

  // Student Form Fields
  const [stdNis, setStdNis] = useState('');
  const [stdName, setStdName] = useState('');
  const [stdGender, setStdGender] = useState<'L' | 'P'>('L');
  const [stdBirthPlace, setStdBirthPlace] = useState('');
  const [stdBirthDate, setStdBirthDate] = useState('');
  const [stdAddress, setStdAddress] = useState('');
  const [stdParentPhone, setStdParentPhone] = useState('');
  const [stdClassId, setStdClassId] = useState('');

  // Alert message state
  const [alert, setAlert] = useState({ show: false, message: '', type: 'success' });

  // Excel/CSV Import state
  const [showImportModal, setShowImportModal] = useState(false);
  const [importClassId, setImportClassId] = useState('');
  const [parsedStudents, setParsedStudents] = useState<Omit<Student, 'id' | 'class_id'>[]>([]);
  const [importFileName, setImportFileName] = useState('');

  const handleImportFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImportFileName(file.name);
    
    // Set default import class if not set
    if (!importClassId && classes.length > 0) {
      setImportClassId(classes[0].id);
    }
    
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // Convert sheet to 2D array of rows
        const rows = XLSX.utils.sheet_to_json<any[]>(ws, { header: 1 });
        if (rows.length < 2) {
          triggerAlert('File kosong atau format salah!', 'danger');
          return;
        }

        // Find columns index by checking the header row (first row)
        const header = rows[0].map((h: any) => String(h || '').trim().toLowerCase());
        const nisIdx = header.findIndex((h: string) => h.includes('nis') || h.includes('induk'));
        const nameIdx = header.findIndex((h: string) => h.includes('nama') || h.includes('lengkap'));
        const genderIdx = header.findIndex((h: string) => h.includes('gender') || h.includes('l/p') || h.includes('kelamin') || h === 'lp');

        if (nisIdx === -1 || nameIdx === -1 || genderIdx === -1) {
          triggerAlert('Header kolom (NIS, Nama Lengkap, L/P) tidak ditemukan! Pastikan baris pertama berisi nama kolom tersebut.', 'danger');
          return;
        }

        const list: Omit<Student, 'id' | 'class_id'>[] = [];
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row || row.length === 0) continue;

          const rawNis = String(row[nisIdx] ?? '').trim();
          const rawName = String(row[nameIdx] ?? '').trim();
          let rawGender = String(row[genderIdx] ?? '').trim().toUpperCase();

          if (!rawNis && !rawName) continue;

          // Normalize gender
          let gender: 'L' | 'P' = 'L';
          if (rawGender.startsWith('P') || rawGender.includes('PEREMPUAN') || rawGender === 'W' || rawGender === 'FEMALE') {
            gender = 'P';
          }

          list.push({
            nis: rawNis,
            name: rawName,
            gender,
            birth_place: '',
            birth_date: '',
            address: '',
            parent_phone: ''
          });
        }

        setParsedStudents(list);
        triggerAlert(`Berhasil memuat ${list.length} data siswa. Silakan pilih Kelas Tujuan dan klik Simpan Impor!`);
      } catch (err: any) {
        console.error(err);
        triggerAlert('Gagal membaca file Excel/CSV: ' + err.message, 'danger');
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleSaveImport = () => {
    if (!importClassId) {
      triggerAlert('Pilih kelas tujuan terlebih dahulu!', 'danger');
      return;
    }
    if (parsedStudents.length === 0) {
      triggerAlert('Tidak ada data siswa untuk diimpor!', 'danger');
      return;
    }

    const newStudents: Student[] = parsedStudents.map((ps, idx) => ({
      ...ps,
      id: `std-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 5)}`,
      class_id: importClassId
    }));

    const updatedList = [...students, ...newStudents];
    setStudents(updatedList);
    saveToStorage('guruku_students', updatedList);
    
    // Reset
    setParsedStudents([]);
    setImportFileName('');
    setShowImportModal(false);
    triggerAlert(`Berhasil mengimpor ${newStudents.length} siswa baru ke kelas!`);
  };

  const triggerAlert = (message: string, type: 'success' | 'danger' = 'success') => {
    setAlert({ show: true, message, type });
    setTimeout(() => {
      setAlert({ show: false, message: '', type: 'success' });
    }, 2500);
  };

  // --- SUBJECT OPERATIONS ---
  const openAddSubject = () => {
    setEditId(null);
    setSubCode('');
    setSubName('');
    setShowModal(true);
  };

  const openEditSubject = (sub: Subject) => {
    setEditId(sub.id);
    setSubCode(sub.code);
    setSubName(sub.name);
    setShowModal(true);
  };

  const handleSaveSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subCode || !subName) {
      triggerAlert('Semua field wajib diisi!', 'danger');
      return;
    }

    let updatedList: Subject[];
    if (editId) {
      updatedList = subjects.map(s => s.id === editId ? { ...s, code: subCode, name: subName } : s);
      triggerAlert('Mata pelajaran berhasil diperbarui!');
    } else {
      const newSub: Subject = {
        id: `sub-${Date.now()}`,
        code: subCode,
        name: subName
      };
      updatedList = [...subjects, newSub];
      triggerAlert('Mata pelajaran baru berhasil ditambahkan!');
    }

    setSubjects(updatedList);
    saveToStorage('guruku_subjects', updatedList);
    setShowModal(false);
  };

  const handleDeleteSubject = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus mata pelajaran ini? Semua data nilai dan jurnal terkait juga akan terpengaruh.')) {
      const updatedList = subjects.filter(s => s.id !== id);
      setSubjects(updatedList);
      saveToStorage('guruku_subjects', updatedList);
      triggerAlert('Mata pelajaran berhasil dihapus!');
    }
  };


  // --- CLASS OPERATIONS ---
  const openAddClass = () => {
    setEditId(null);
    setClsName('');
    setClsLevel('VII');
    setClsYear('2025/2026');
    setShowModal(true);
  };

  const openEditClass = (cls: Class) => {
    setEditId(cls.id);
    setClsName(cls.name);
    setClsLevel(cls.level);
    setClsYear(cls.academic_year);
    setShowModal(true);
  };

  const handleSaveClass = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clsName) {
      triggerAlert('Nama kelas wajib diisi!', 'danger');
      return;
    }

    let updatedList: Class[];
    if (editId) {
      updatedList = classes.map(c => c.id === editId ? { ...c, name: clsName, level: clsLevel, academic_year: clsYear } : c);
      triggerAlert('Kelas berhasil diperbarui!');
    } else {
      const newCls: Class = {
        id: `cls-${Date.now()}`,
        name: clsName,
        level: clsLevel,
        academic_year: clsYear
      };
      updatedList = [...classes, newCls];
      triggerAlert('Kelas baru berhasil ditambahkan!');
    }

    setClasses(updatedList);
    saveToStorage('guruku_classes', updatedList);
    setShowModal(false);
  };

  const handleDeleteClass = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini? Semua siswa di dalam kelas ini akan kehilangan asosiasi kelas.')) {
      const updatedList = classes.filter(c => c.id !== id);
      setClasses(updatedList);
      saveToStorage('guruku_classes', updatedList);
      triggerAlert('Kelas berhasil dihapus!');
    }
  };


  // --- STUDENT OPERATIONS ---
  const openAddStudent = () => {
    setEditId(null);
    setStdNis('');
    setStdName('');
    setStdGender('L');
    setStdBirthPlace('');
    setStdBirthDate('');
    setStdAddress('');
    setStdParentPhone('');
    setStdClassId(classes[0]?.id || '');
    setShowModal(true);
  };

  const openEditStudent = (student: Student) => {
    setEditId(student.id);
    setStdNis(student.nis);
    setStdName(student.name);
    setStdGender(student.gender);
    setStdBirthPlace(student.birth_place);
    setStdBirthDate(student.birth_date);
    setStdAddress(student.address);
    setStdParentPhone(student.parent_phone);
    setStdClassId(student.class_id);
    setShowModal(true);
  };

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!stdNis || !stdName || !stdClassId) {
      triggerAlert('NIS, Nama Lengkap, dan Kelas wajib diisi!', 'danger');
      return;
    }

    let updatedList: Student[];
    if (editId) {
      updatedList = students.map(s => s.id === editId ? {
        ...s,
        nis: stdNis,
        name: stdName,
        gender: stdGender,
        birth_place: stdBirthPlace,
        birth_date: stdBirthDate,
        address: stdAddress,
        parent_phone: stdParentPhone,
        class_id: stdClassId
      } : s);
      triggerAlert('Data siswa berhasil diperbarui!');
    } else {
      const newStudent: Student = {
        id: `std-${Date.now()}`,
        nis: stdNis,
        name: stdName,
        gender: stdGender,
        birth_place: stdBirthPlace,
        birth_date: stdBirthDate,
        address: stdAddress,
        parent_phone: stdParentPhone,
        class_id: stdClassId
      };
      updatedList = [...students, newStudent];
      triggerAlert('Siswa baru berhasil ditambahkan!');
    }

    setStudents(updatedList);
    saveToStorage('guruku_students', updatedList);
    setShowModal(false);
  };

  const handleDeleteStudent = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus data siswa ini? Semua catatan nilai dan absensi terkait siswa ini akan dihapus.')) {
      const updatedList = students.filter(s => s.id !== id);
      setStudents(updatedList);
      saveToStorage('guruku_students', updatedList);
      triggerAlert('Data siswa berhasil dihapus!');
    }
  };


  // Filtering of Students
  const filteredStudents = students.filter(std => {
    const matchesSearch = std.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          std.nis.includes(searchTerm);
    const matchesClass = classFilter ? std.class_id === classFilter : true;
    return matchesSearch && matchesClass;
  });

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

      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#2b2c40] p-6 rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs">
        <div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 flex items-center gap-2.5">
            {currentMenu === 'subjects' && <BookOpen className="w-5 h-5 text-[#696cff]" />}
            {currentMenu === 'classes' && <Layers className="w-5 h-5 text-[#696cff]" />}
            {currentMenu === 'students' && <Users className="w-5 h-5 text-[#696cff]" />}
            <span>
              {currentMenu === 'subjects' && 'Data Master - Mata Pelajaran'}
              {currentMenu === 'classes' && 'Data Master - Kelas'}
              {currentMenu === 'students' && 'Data Master - Siswa'}
            </span>
          </h2>
          <p className="text-xs text-gray-500 mt-1 leading-relaxed">
            {currentMenu === 'subjects' && 'Kelola daftar mata pelajaran yang Anda ajarkan di seluruh kelas.'}
            {currentMenu === 'classes' && 'Buat, edit, dan organisasikan kelas beserta tingkat dan tahun ajaran.'}
            {currentMenu === 'students' && 'Manajemen profil siswa lengkap, pengelompokan kelas, dan kontak orang tua.'}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 self-start sm:self-auto">
          {currentMenu === 'students' && (
            <button
              onClick={() => setShowImportModal(true)}
              className="px-4 py-2 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition text-xs font-semibold rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>Impor Excel/CSV</span>
            </button>
          )}
          <button
            onClick={
              currentMenu === 'subjects' ? openAddSubject :
              currentMenu === 'classes' ? openAddClass : openAddStudent
            }
            className="px-4 py-2 bg-[#696cff] hover:bg-indigo-600 transition text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-600/10 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>
              {currentMenu === 'subjects' && 'Tambah Mata Pelajaran'}
              {currentMenu === 'classes' && 'Tambah Kelas'}
              {currentMenu === 'students' && 'Tambah Siswa'}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Table Area */}
      <div className="bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-xs overflow-hidden transition-colors duration-300">
        
        {/* Search & Filters (Siswa only) */}
        {currentMenu === 'students' && (
          <div className="p-5 border-b border-gray-50 dark:border-neutral-800 bg-gray-50/50 dark:bg-[#2b2c40] flex flex-col md:flex-row gap-4 items-center">
            
            {/* Search bar */}
            <div className="relative w-full md:w-80">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                <Search className="w-4 h-4" />
              </span>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Cari nama atau NIS siswa..."
                className="w-full pl-9 pr-4 py-2 bg-white dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-xs focus:outline-none focus:border-[#696cff]"
              />
            </div>

            {/* Class Filter */}
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Filter className="w-4 h-4 text-gray-400 shrink-0" />
              <select
                value={classFilter}
                onChange={(e) => setClassFilter(e.target.value)}
                className="bg-white dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 text-gray-700 dark:text-gray-300 rounded-xl py-2 px-3 text-xs focus:outline-none focus:border-[#696cff]"
              >
                <option value="">Semua Kelas</option>
                {classes.map(cls => (
                  <option key={cls.id} value={cls.id}>{cls.name}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-gray-400 ml-auto font-mono">
              Menampilkan {filteredStudents.length} dari {students.length} siswa
            </div>
          </div>
        )}

        {/* Dynamic Tables */}
        <div className="overflow-x-auto">
          
          {/* 1. SUBJECTS TABLE */}
          {currentMenu === 'subjects' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                  <th className="py-3 px-6 w-20">No</th>
                  <th className="py-3 px-6">Kode Pelajaran</th>
                  <th className="py-3 px-6">Nama Mata Pelajaran</th>
                  <th className="py-3 px-6 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                {subjects.length > 0 ? (
                  subjects.map((sub, idx) => (
                    <tr key={sub.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs">{idx + 1}</td>
                      <td className="py-3.5 px-6 font-semibold text-[#696cff] font-mono text-xs">{sub.code}</td>
                      <td className="py-3.5 px-6 font-medium">{sub.name}</td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex justify-end gap-2">
                          <button
                            onClick={() => openEditSubject(sub)}
                            className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubject(sub.id)}
                            className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-12 text-center text-gray-400 dark:text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
                      Belum ada mata pelajaran. Klik tombol Tambah di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* 2. CLASSES TABLE */}
          {currentMenu === 'classes' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                  <th className="py-3 px-6 w-20">No</th>
                  <th className="py-3 px-6">Nama Kelas</th>
                  <th className="py-3 px-6">Tingkat</th>
                  <th className="py-3 px-6">Tahun Ajaran</th>
                  <th className="py-3 px-6">Jumlah Siswa</th>
                  <th className="py-3 px-6 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                {classes.length > 0 ? (
                  classes.map((cls, idx) => {
                    const studentCount = students.filter(s => s.class_id === cls.id).length;
                    return (
                      <tr key={cls.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300 transition-colors">
                        <td className="py-3.5 px-6 font-mono text-xs">{idx + 1}</td>
                        <td className="py-3.5 px-6 font-bold">{cls.name}</td>
                        <td className="py-3.5 px-6">
                          <span className="px-2 py-0.5 text-xs font-semibold rounded bg-indigo-50 dark:bg-indigo-950/30 text-[#696cff]">
                            Tingkat {cls.level}
                          </span>
                        </td>
                        <td className="py-3.5 px-6 font-mono text-xs">{cls.academic_year}</td>
                        <td className="py-3.5 px-6 font-medium text-gray-600 dark:text-gray-400">
                          {studentCount} Siswa
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditClass(cls)}
                              className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                              title="Edit"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(cls.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-gray-400 dark:text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
                      Belum ada kelas terdaftar. Klik tombol Tambah Kelas di atas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

          {/* 3. STUDENTS TABLE */}
          {currentMenu === 'students' && (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-[#252538] text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-neutral-800">
                  <th className="py-3 px-6 w-28">NIS</th>
                  <th className="py-3 px-6">Nama Lengkap</th>
                  <th className="py-3 px-6">L/P</th>
                  <th className="py-3 px-6">Kelas</th>
                  <th className="py-3 px-6 text-right w-36">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-neutral-800 text-sm">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((std) => {
                    const associatedClass = classes.find(c => c.id === std.class_id);
                    return (
                      <tr key={std.id} className="hover:bg-gray-50/50 dark:hover:bg-[#232333]/50 text-gray-700 dark:text-gray-300 transition-colors">
                        <td className="py-3 px-6 font-mono text-xs font-semibold text-[#696cff]">{std.nis}</td>
                        <td className="py-3 px-6 font-bold">{std.name}</td>
                        <td className="py-3 px-6">
                          <span className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            std.gender === 'L' 
                              ? 'bg-blue-50 dark:bg-blue-950/20 text-blue-600' 
                              : 'bg-pink-50 dark:bg-pink-950/20 text-pink-600'
                          }`}>
                            {std.gender === 'L' ? 'Laki-laki' : 'Perempuan'}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          <span className="font-semibold text-gray-800 dark:text-gray-200">
                            {associatedClass?.name || 'Belum diatur'}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => openEditStudent(std)}
                              className="p-1.5 rounded-lg text-indigo-500 hover:bg-indigo-50 dark:hover:bg-indigo-950/20 transition cursor-pointer"
                              title="Edit Profil"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteStudent(std.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition cursor-pointer"
                              title="Hapus"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500">
                      <AlertCircle className="w-8 h-8 mx-auto text-gray-300 dark:text-neutral-700 mb-2" />
                      Siswa tidak ditemukan atau belum ada data.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}

        </div>
      </div>

      {/* MODAL OVERLAY */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          
          <div className="w-full max-w-lg bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            
            {/* Modal Header */}
            <div className="h-14 px-6 border-b border-gray-50 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#2b2c40]">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                {editId ? 'Ubah Data' : 'Tambah Data Baru'} - {
                  currentMenu === 'subjects' ? 'Mata Pelajaran' :
                  currentMenu === 'classes' ? 'Kelas' : 'Siswa'
                }
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232333] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            {currentMenu === 'subjects' && (
              <form onSubmit={handleSaveSubject} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Kode Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={subCode}
                    onChange={(e) => setSubCode(e.target.value)}
                    placeholder="Contoh: MAT-SMP, ING-SMP"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Nama Mata Pelajaran
                  </label>
                  <input
                    type="text"
                    value={subName}
                    onChange={(e) => setSubName(e.target.value)}
                    placeholder="Contoh: Matematika"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  />
                </div>
                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-[#232333] transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#696cff] text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 transition cursor-pointer"
                  >
                    Simpan Pelajaran
                  </button>
                </div>
              </form>
            )}

            {currentMenu === 'classes' && (
              <form onSubmit={handleSaveClass} className="p-6 space-y-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Nama Kelas
                  </label>
                  <input
                    type="text"
                    value={clsName}
                    onChange={(e) => setClsName(e.target.value)}
                    placeholder="Contoh: Kelas VII-A"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Tingkat
                    </label>
                    <select
                      value={clsLevel}
                      onChange={(e) => setClsLevel(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    >
                      <option value="VII">VII (Tujuh)</option>
                      <option value="VIII">VIII (Delapan)</option>
                      <option value="IX">IX (Sembilan)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Tahun Ajaran
                    </label>
                    <input
                      type="text"
                      value={clsYear}
                      onChange={(e) => setClsYear(e.target.value)}
                      placeholder="Contoh: 2025/2026"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    />
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-[#232333] transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#696cff] text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 transition cursor-pointer"
                  >
                    Simpan Kelas
                  </button>
                </div>
              </form>
            )}

            {currentMenu === 'students' && (
              <form onSubmit={handleSaveStudent} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Nomor Induk Siswa (NIS)
                    </label>
                    <input
                      type="text"
                      value={stdNis}
                      onChange={(e) => setStdNis(e.target.value)}
                      placeholder="Contoh: 102101"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Kelas
                    </label>
                    <select
                      value={stdClassId}
                      onChange={(e) => setStdClassId(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    >
                      {classes.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                    Nama Lengkap Siswa
                  </label>
                  <input
                    type="text"
                    value={stdName}
                    onChange={(e) => setStdName(e.target.value)}
                    placeholder="Contoh: Ahmad Fauzi"
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  />
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-1.5">
                      Jenis Kelamin
                    </label>
                    <select
                      value={stdGender}
                      onChange={(e) => setStdGender(e.target.value as 'L' | 'P')}
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                    >
                      <option value="L">Laki-laki</option>
                      <option value="P">Perempuan</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 justify-end pt-4 border-t border-gray-100 dark:border-neutral-800">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-[#232333] transition cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#696cff] text-white text-xs font-semibold rounded-xl hover:bg-indigo-600 transition cursor-pointer"
                  >
                    Simpan Siswa
                  </button>
                </div>
              </form>
            )}

          </div>

        </div>
      )}

      {/* EXCEL IMPORT MODAL */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white dark:bg-[#2b2c40] rounded-2xl border border-gray-100 dark:border-neutral-800 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
            {/* Modal Header */}
            <div className="h-14 px-6 border-b border-gray-50 dark:border-neutral-800 flex items-center justify-between bg-gray-50/50 dark:bg-[#2b2c40]">
              <h3 className="font-bold text-gray-800 dark:text-gray-100 text-sm">
                Impor Siswa Baru dari Excel / CSV
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setParsedStudents([]);
                  setImportFileName('');
                }}
                className="p-1 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-[#232333] transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {/* Instructions */}
              <div className="p-3.5 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-xl space-y-1 text-xs">
                <p className="font-bold text-gray-800 dark:text-gray-200">Aturan Format Dokumen:</p>
                <ul className="list-disc pl-4 space-y-1 text-gray-600 dark:text-gray-400">
                  <li>Harus menyertakan baris pertama sebagai nama kolom (Header).</li>
                  <li>Wajib memiliki kolom: <span className="font-semibold text-[#696cff]">NIS</span>, <span className="font-semibold text-[#696cff]">Nama Lengkap</span>, dan <span className="font-semibold text-[#696cff]">L/P</span> (L/P, L/Perempuan, Laki-laki/Perempuan).</li>
                  <li>Dukungan tipe berkas: Excel (<code className="font-mono bg-white dark:bg-[#232333] px-1 py-0.5 rounded border border-gray-100 dark:border-neutral-800">.xlsx</code>, <code className="font-mono bg-white dark:bg-[#232333] px-1 py-0.5 rounded border border-gray-100 dark:border-neutral-800">.xls</code>) atau teks (<code className="font-mono bg-white dark:bg-[#232333] px-1 py-0.5 rounded border border-gray-100 dark:border-neutral-800">.csv</code>).</li>
                </ul>
              </div>

              {/* Class Selection & File Upload */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Kelas Tujuan Impor
                  </label>
                  <select
                    value={importClassId}
                    onChange={(e) => setImportClassId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-50 dark:bg-[#232333] border border-gray-200 dark:border-neutral-700 rounded-xl text-sm focus:outline-none focus:border-[#696cff] text-gray-800 dark:text-gray-200"
                  >
                    <option value="" disabled>Pilih Kelas Tujuan...</option>
                    {classes.map(cls => (
                      <option key={cls.id} value={cls.id}>{cls.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Pilih File Excel / CSV
                  </label>
                  <div className="relative">
                    <input
                      type="file"
                      accept=".xlsx, .xls, .csv"
                      onChange={handleImportFileChange}
                      className="hidden"
                      id="excel-file-uploader"
                    />
                    <label
                      htmlFor="excel-file-uploader"
                      className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-50 dark:bg-emerald-950/20 border border-dashed border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 text-sm font-semibold rounded-xl cursor-pointer hover:bg-emerald-100/40 dark:hover:bg-emerald-950/30 transition truncate text-center"
                    >
                      <Upload className="w-4 h-4" />
                      <span>{importFileName || 'Pilih File Excel...'}</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Preview table if parsed */}
              {parsedStudents.length > 0 && (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-gray-800 dark:text-gray-200 uppercase tracking-wider">
                      Preview Data Terbaca ({parsedStudents.length} Siswa)
                    </h4>
                    <span className="text-[10px] text-emerald-500 font-bold">Siap diimpor</span>
                  </div>

                  <div className="border border-gray-100 dark:border-neutral-800 rounded-xl overflow-hidden max-h-48 overflow-y-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-gray-50 dark:bg-[#252538] text-[10px] font-bold uppercase text-gray-500 border-b border-gray-100 dark:border-neutral-800">
                          <th className="py-2 px-4 w-12">No</th>
                          <th className="py-2 px-4 w-28">NIS</th>
                          <th className="py-2 px-4">Nama Lengkap</th>
                          <th className="py-2 px-4 w-16">L/P</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50 dark:divide-neutral-800">
                        {parsedStudents.map((ps, idx) => (
                          <tr key={idx} className="text-gray-600 dark:text-gray-400">
                            <td className="py-1.5 px-4 font-mono">{idx + 1}</td>
                            <td className="py-1.5 px-4 font-mono font-semibold text-gray-800 dark:text-gray-300">{ps.nis}</td>
                            <td className="py-1.5 px-4 font-semibold">{ps.name}</td>
                            <td className="py-1.5 px-4">
                              <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${
                                ps.gender === 'L' ? 'bg-blue-50 text-blue-500' : 'bg-pink-50 text-pink-500'
                              }`}>
                                {ps.gender}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-gray-50 dark:bg-[#2b2c40] border-t border-gray-100 dark:border-neutral-800 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowImportModal(false);
                  setParsedStudents([]);
                  setImportFileName('');
                }}
                className="px-4 py-2 border border-gray-200 dark:border-neutral-700 text-gray-600 dark:text-gray-400 text-xs font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-[#232333] transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                disabled={parsedStudents.length === 0}
                onClick={handleSaveImport}
                className="px-5 py-2 bg-[#696cff] disabled:bg-gray-200 dark:disabled:bg-neutral-800 text-white disabled:text-gray-400 text-xs font-semibold rounded-xl shadow-md shadow-emerald-500/10 transition cursor-pointer"
              >
                Simpan Impor ({parsedStudents.length} Siswa)
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
