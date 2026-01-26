"use client";

import { Suspense } from 'react';
import Dashboard from '../components/Dashboard';

export default function HomePage() {
  return (
    // Kita tambahkan kelas 'p-4' di sini untuk padding di layar terkecil
    <main className="min-h-screen bg-gray-100 text-gray-800 p-4 font-sans">
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Memuat Dashboard...</div>}>
        <Dashboard />
      </Suspense>
    </main>
  );
}