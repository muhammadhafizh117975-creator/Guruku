/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged, User } from 'firebase/auth';
import firebaseConfig from '../firebase-applet-config.json';
import { Profile, Subject, Class, Student, Grade, Attendance, TeachingJournal } from './types';
import { getFromStorage, saveToStorage } from './store';

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Request required Google Workspace scopes
provider.addScope('https://www.googleapis.com/auth/drive');
provider.addScope('https://www.googleapis.com/auth/drive.file');
provider.addScope('https://www.googleapis.com/auth/spreadsheets');

let isSigningIn = false;
let cachedAccessToken: string | null = null;

// Initialize auth listener
export const initAuth = (
  onAuthSuccess?: (user: User, token: string) => void,
  onAuthFailure?: () => void
) => {
  // Try to load cached token from session memory if signed in
  const cached = sessionStorage.getItem('guruku_gtoken');
  if (cached) {
    cachedAccessToken = cached;
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      if (cachedAccessToken) {
        if (onAuthSuccess) onAuthSuccess(user, cachedAccessToken);
      } else {
        // If user is logged in but token was lost (e.g., refresh), we will need re-auth or pop-up
        if (onAuthFailure) onAuthFailure();
      }
    } else {
      cachedAccessToken = null;
      sessionStorage.removeItem('guruku_gtoken');
      if (onAuthFailure) onAuthFailure();
    }
  });
};

// Sign in with Google
export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      throw new Error('Gagal mendapatkan token akses dari Google.');
    }

    cachedAccessToken = credential.accessToken;
    sessionStorage.setItem('guruku_gtoken', cachedAccessToken);
    return { user: result.user, accessToken: cachedAccessToken };
  } catch (error: any) {
    console.error('Sign in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

// Get current access token
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken || sessionStorage.getItem('guruku_gtoken');
};

// Sign out from Google
export const logoutGoogle = async () => {
  await auth.signOut();
  cachedAccessToken = null;
  sessionStorage.removeItem('guruku_gtoken');
};


// ==========================================
// GOOGLE DRIVE API HELPERS
// ==========================================

/**
 * Find or create a specific folder in Google Drive
 */
export async function getOrCreateFolder(folderName: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  // Search for folder
  const query = encodeURIComponent(`name = '${folderName}' and mimeType = 'application/vnd.google-apps.folder' and trashed = false`);
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&fields=files(id,name)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();

  if (data.files && data.files.length > 0) {
    return data.files[0].id;
  }

  // Create folder
  const createRes = await fetch('https://www.googleapis.com/drive/v3/files', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder'
    })
  });
  const folder = await createRes.json();
  return folder.id;
}

/**
 * Upload database JSON backup to Google Drive
 */
export async function uploadBackupToDrive(fileName: string, jsonContent: string): Promise<any> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  const folderId = await getOrCreateFolder('GuruKu_Backups');

  const metadata = {
    name: fileName,
    parents: [folderId],
    mimeType: 'application/json'
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    'Content-Type: application/json\r\n\r\n' +
    jsonContent +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: body
  });

  return await res.json();
}

/**
 * List backup files from Google Drive
 */
export async function listBackupsFromDrive(): Promise<Array<{ id: string, name: string, createdTime: string, size: string }>> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  const folderId = await getOrCreateFolder('GuruKu_Backups');
  const query = encodeURIComponent(`'${folderId}' in parents and mimeType = 'application/json' and trashed = false`);
  
  const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${query}&orderBy=createdTime desc&fields=files(id,name,createdTime,size)`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await res.json();
  return data.files || [];
}

/**
 * Download backup file content from Google Drive
 */
export async function downloadBackupFromDrive(fileId: string): Promise<string> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  
  if (!res.ok) {
    throw new Error('Gagal mengunduh file cadangan dari Drive.');
  }
  return await res.text();
}

/**
 * Upload teaching journal attachment file to Google Drive
 */
export async function uploadAttachmentToDrive(file: File): Promise<{ webViewLink: string; fileId: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  const folderId = await getOrCreateFolder('GuruKu_Journal_Attachments');

  // Convert file to Base64 or ArrayBuffer
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < uint8Array.byteLength; i++) {
    binary += String.fromCharCode(uint8Array[i]);
  }
  const base64Content = btoa(binary);

  const metadata = {
    name: file.name,
    parents: [folderId]
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  const body = 
    delimiter +
    'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
    JSON.stringify(metadata) +
    delimiter +
    `Content-Type: ${file.type || 'application/octet-stream'}\r\n` +
    'Content-Transfer-Encoding: base64\r\n\r\n' +
    base64Content +
    closeDelimiter;

  const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': `multipart/related; boundary=${boundary}`
    },
    body: body
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Gagal mengunggah lampiran ke Drive.');
  }

  // Set permission to anyone with link can view (so it can be displayed in iframe/link)
  try {
    await fetch(`https://www.googleapis.com/drive/v3/files/${data.id}/permissions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        role: 'reader',
        type: 'anyone'
      })
    });
  } catch (err) {
    console.warn('Could not set public view permissions for drive file:', err);
  }

  return {
    webViewLink: data.webViewLink,
    fileId: data.id
  };
}


// ==========================================
// GOOGLE SHEETS API HELPERS
// ==========================================

/**
 * Create a new styled Google Spreadsheet for GuruKu database
 */
export async function createGuruKuSpreadsheet(): Promise<{ id: string; url: string }> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  const requestBody = {
    properties: {
      title: 'GuruKu - Administrasi Sekolah Digital'
    },
    sheets: [
      { properties: { title: 'profiles' } },
      { properties: { title: 'subjects' } },
      { properties: { title: 'classes' } },
      { properties: { title: 'students' } },
      { properties: { title: 'grades' } },
      { properties: { title: 'attendance' } },
      { properties: { title: 'teaching_journals' } }
    ]
  };

  const res = await fetch('https://sheets.googleapis.com/v4/spreadsheets', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Gagal membuat Google Spreadsheet baru.');
  }

  return {
    id: data.spreadsheetId,
    url: data.spreadsheetUrl || `https://docs.google.com/spreadsheets/d/${data.spreadsheetId}/edit`
  };
}

/**
 * Fetch and parse data from worksheets of a Google Spreadsheet
 */
export async function pullDataFromSpreadsheet(spreadsheetId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  const sheetsToPull = ['profiles', 'subjects', 'classes', 'students', 'grades', 'attendance', 'teaching_journals'];
  const ranges = sheetsToPull.map(sheet => `${sheet}!A1:Z500`).join('&ranges=');

  const res = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchGet?ranges=${ranges}`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error?.message || 'Gagal membaca spreadsheet.');
  }

  const valueRanges = data.valueRanges || [];
  
  // Helper to parse a sheet's rows back into JSON object array
  const parseSheetRows = (rows: any[] | undefined): any[] => {
    if (!rows || rows.length <= 1) return [];
    const headers = rows[0];
    return rows.slice(1).map(row => {
      const obj: any = {};
      headers.forEach((header: string, index: number) => {
        let val = row[index] !== undefined ? row[index] : '';
        // Parse numbers if possible
        if (val !== '' && !isNaN(Number(val))) {
          val = Number(val);
        }
        // Parse boolean
        if (val === 'true') val = true;
        if (val === 'false') val = false;
        obj[header] = val;
      });
      return obj;
    });
  };

  // Extract each sheet
  sheetsToPull.forEach((sheetName, index) => {
    const valueRange = valueRanges[index];
    const rows = valueRange ? valueRange.values : [];
    const parsedData = parseSheetRows(rows);

    if (sheetName === 'profiles') {
      if (parsedData.length > 0) {
        localStorage.setItem('guruku_profiles', JSON.stringify(parsedData[0]));
      }
    } else {
      localStorage.setItem(`guruku_${sheetName}`, JSON.stringify(parsedData));
    }
  });

  return true;
}

/**
 * Write current database tables to worksheets of a Google Spreadsheet
 */
export async function pushDataToSpreadsheet(spreadsheetId: string): Promise<boolean> {
  const token = await getAccessToken();
  if (!token) throw new Error('Unauthenticated');

  // Prepare database data
  const profiles = [getFromStorage<Profile>('guruku_profiles', { name: '', nip_nuptk: '', email: '', hp: '', photoUrl: '' })];
  const subjects = getFromStorage<Subject[]>('guruku_subjects', []);
  const classes = getFromStorage<Class[]>('guruku_classes', []);
  const students = getFromStorage<Student[]>('guruku_students', []);
  const grades = getFromStorage<Grade[]>('guruku_grades', []);
  const attendance = getFromStorage<Attendance[]>('guruku_attendance', []);
  const journals = getFromStorage<TeachingJournal[]>('guruku_teaching_journals', []);

  const dataMapping = {
    profiles,
    subjects,
    classes,
    students,
    grades,
    attendance,
    teaching_journals: journals
  };

  const valueRanges: any[] = [];

  // Convert each array of object to a table structure (Header + Rows)
  Object.entries(dataMapping).forEach(([sheetName, records]) => {
    if (records.length === 0) {
      valueRanges.push({
        range: `${sheetName}!A1:Z10`,
        values: [[]]
      });
      return;
    }

    const headers = Object.keys(records[0]);
    const values = [
      headers,
      ...records.map((rec: any) => headers.map(h => rec[h] !== undefined ? rec[h] : ''))
    ];

    valueRanges.push({
      range: `${sheetName}!A1:Z${values.length + 5}`,
      values: values
    });
  });

  // First we clear the existing worksheets to prevent remaining old rows
  const clearPromises = Object.keys(dataMapping).map(sheetName => {
    return fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${sheetName}!A1:Z500:clear`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
  });
  await Promise.all(clearPromises);

  // Send batchUpdate
  const response = await fetch(`https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values:batchUpdate`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      valueInputOption: 'RAW',
      data: valueRanges
    })
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.error?.message || 'Gagal menulis ke Google Sheets.');
  }

  return true;
}
