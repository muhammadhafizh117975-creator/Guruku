/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="h-14 border-t border-gray-100 dark:border-neutral-800 bg-white dark:bg-[#2b2c40] px-6 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400 mt-auto transition-colors duration-300">
      <div className="font-medium">
        <span>© {currentYear} </span>
        <span className="text-[#696cff] font-bold">GuruKu</span>
        <span className="hidden sm:inline"> • Panel Administrasi Pembelajaran Digital</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden md:inline text-[11px] bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full font-mono">
          Engine: Spreadsheet-DB (Ready)
        </span>
        <span className="font-mono text-[10px]">v1.2.0</span>
      </div>
    </footer>
  );
}
