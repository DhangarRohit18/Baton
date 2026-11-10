import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProjectProvider } from './context/ProjectContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';

import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { IngestionPage } from './pages/IngestionPage';
import { ClaimsLedgerPage } from './pages/ClaimsLedgerPage';
import { GapsRadarPage } from './pages/GapsRadarPage';
import { ExitInterviewPage } from './pages/ExitInterviewPage';
import { HandoverPage } from './pages/HandoverPage';
import { SuccessorPortalPage } from './pages/SuccessorPortalPage';
import { QRBridgePage } from './pages/QRBridgePage';
import { PublicVerifyPage } from './pages/PublicVerifyPage';
import { AuditLogPage } from './pages/AuditLogPage';
import { TeamSettingsPage } from './pages/TeamSettingsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { token, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#070D1E] flex items-center justify-center text-cyan-400 font-bold text-xs">
        Loading BATON Vault...
      </div>
    );
  }
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Layout>{children}</Layout>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ProjectProvider>
          <BrowserRouter>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/verify-bridge" element={<PublicVerifyPage />} />

            {/* Protected authenticated routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/ingestion" element={<ProtectedRoute><IngestionPage /></ProtectedRoute>} />
            <Route path="/claims" element={<ProtectedRoute><ClaimsLedgerPage /></ProtectedRoute>} />
            <Route path="/radar" element={<ProtectedRoute><GapsRadarPage /></ProtectedRoute>} />
            <Route path="/gaps" element={<ProtectedRoute><GapsRadarPage /></ProtectedRoute>} />
            <Route path="/interviews" element={<ProtectedRoute><ExitInterviewPage /></ProtectedRoute>} />
            <Route path="/handovers" element={<ProtectedRoute><HandoverPage /></ProtectedRoute>} />
            <Route path="/successor" element={<ProtectedRoute><SuccessorPortalPage /></ProtectedRoute>} />
            <Route path="/qr-bridge" element={<ProtectedRoute><QRBridgePage /></ProtectedRoute>} />
            <Route path="/audit" element={<ProtectedRoute><AuditLogPage /></ProtectedRoute>} />
            <Route path="/team" element={<ProtectedRoute><TeamSettingsPage /></ProtectedRoute>} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </ProjectProvider>
    </AuthProvider>
  </ThemeProvider>
  );
};

export default App;
