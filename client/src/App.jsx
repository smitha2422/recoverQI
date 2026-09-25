import React, { useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import ScanResults from './pages/ScanResults';
import ReconstructionLab from './pages/ReconstructionLab';
import StoragePage from './pages/StoragePage';
import PhotoAnalysisPage from './pages/PhotoAnalysisPage';
import Diagnostics from './components/Diagnostics';
import { mockScanData } from './data/mockData';

export default function App() {
 const [scanResult, setScanResult] = useState(null);

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-[#B33A2E]/30 selection:text-[#F2EFE9]">
        {/* Top Navbar with Manila Folder Tabs */}
        <Navbar />

        {/* Routed View Content */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            {/* 1. Upload & Main Dashboard Workspace (/) */}
            <Route
              path="/"
              element={<Dashboard scanResult={scanResult} setScanResult={setScanResult} />}
            />

            {/* 2. Photo Analysis Lab (/photo) */}
            <Route
              path="/photo"
              element={<PhotoAnalysisPage scanResult={scanResult} />}
            />

            {/* 3. Detailed Results Page (/results/:scanId) */}
            <Route
              path="/results/:scanId"
              element={<ScanResults />}
            />

            {/* 4. Dedicated Reconstruction Lab (/lab) */}
            <Route
              path="/lab"
              element={<ReconstructionLab scanResult={scanResult} />}
            />

            {/* 5. Storage Digital Twin (/storage) */}
            <Route
              path="/storage"
              element={<StoragePage />}
            />

            {/* 6. Hardware & Engine Diagnostics (/diagnostics) */}
            <Route
              path="/diagnostics"
              element={<Diagnostics />}
            />
          </Routes>
        </main>

        {/* Global Footer with Evidence Board details */}
        <footer className="mt-auto border-t border-[#2F2926] bg-[#14110F] py-6 text-center text-xs text-[#A39D95]">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-document">© 2026 RecoverIQ Project • Forensic Reconstruction & Evidence Ledger Engine</p>
            <div className="flex items-center gap-4 text-xs font-mono">
              <span>Branch: <span className="text-[#D8C39A]">member-2</span></span>
              <span>Integrity Engine: <span className="text-[#4C7A5E]">NIST-800-88 Verified</span></span>
            </div>
          </div>
        </footer>
      </div>
    </BrowserRouter>
  );
}
