import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';

// Pages
import Landing from './pages/Landing';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminKendaraan from './pages/admin/AdminKendaraan';
import AdminGenerateKey from './pages/admin/AdminGenerateKey';
import AdminPengajuanPerbaikan from './pages/admin/AdminPengajuanPerbaikan';
import AdminLaporanBiaya from './pages/admin/AdminLaporanBiaya';
import DriverDashboard from './pages/driver/DriverDashboard';
import DriverReport from './pages/driver/DriverReport';
import DriverBensin from './pages/driver/DriverBensin';
import DriverTowing from './pages/driver/DriverTowing';
import MekanikDashboard from './pages/mekanik/MekanikDashboard';
import MekanikDetailKerusakan from './pages/mekanik/MekanikDetailKerusakan';
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Landing />} />
        <Route path="/admin/login" element={<LoginPage role="Admin" />} />
        <Route path="/driver/login" element={<LoginPage role="Driver" />} />
        <Route path="/mekanik/login" element={<LoginPage role="Mekanik" />} />

        {/* Admin protected */}
        <Route element={<ProtectedRoute allowedRole="Admin" />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/kendaraan" element={<AdminKendaraan />} />
          <Route path="/admin/generate-key" element={<AdminGenerateKey />} />
          <Route path="/admin/pengajuan-perbaikan" element={<AdminPengajuanPerbaikan />} />
          <Route path="/admin/laporan-biaya" element={<AdminLaporanBiaya />} />
        </Route>

        {/* Driver protected */}
        <Route element={<ProtectedRoute allowedRole="Driver" />}>
          <Route path="/driver/dashboard" element={<DriverDashboard />} />
          <Route path="/driver/report" element={<DriverReport />} />
          <Route path="/driver/struk-bensin" element={<DriverBensin />} />
          <Route path="/driver/towing" element={<DriverTowing />} />
        </Route>

        {/* Mekanik protected */}
        <Route element={<ProtectedRoute allowedRole="Mekanik" />}>
          <Route path="/mekanik/dashboard" element={<MekanikDashboard />} />
          <Route path="/mekanik/detailkerusakan/:id" element={<MekanikDetailKerusakan />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}
