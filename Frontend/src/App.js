import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './contexts/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import FindDoctors from './pages/FindDoctors';
import DoctorProfile from './pages/DoctorProfile';
import SymptomChecker from './pages/SymptomChecker';
import Appointments from './pages/Appointments';
import Prescriptions from './pages/Prescriptions';
import PaymentHistory from './pages/PaymentHistory';

// Layout
import Navbar from './components/Navbar';

const BgEffects = () => (
  <>
    <div className="bg-grid" />
    <div className="bg-orbs">
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />
    </div>
  </>
);

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', color: 'var(--accent-teal)' }}>Loading...</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const DashboardRouter = () => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'doctor') return <DoctorDashboard />;
  return <PatientDashboard />;
};

const AppContent = () => {
  const { user } = useAuth();

  return (
    <div className="app-layout" style={{ position: 'relative' }}>
      <BgEffects />
      {user && <Navbar />}
      <div style={{ position: 'relative', zIndex: 1, flex: 1 }}>
        <Routes>
          <Route path="/" element={user ? <Navigate to="/dashboard" /> : <LandingPage />} />
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage mode="login" />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <AuthPage mode="register" />} />

          <Route path="/dashboard" element={<ProtectedRoute><DashboardRouter /></ProtectedRoute>} />
          <Route path="/doctors" element={<ProtectedRoute><FindDoctors /></ProtectedRoute>} />
          <Route path="/doctors/:id" element={<ProtectedRoute><DoctorProfile /></ProtectedRoute>} />
          <Route path="/symptom-checker" element={<ProtectedRoute roles={['patient']}><SymptomChecker /></ProtectedRoute>} />
          <Route path="/appointments" element={<ProtectedRoute><Appointments /></ProtectedRoute>} />
          <Route path="/prescriptions" element={<ProtectedRoute><Prescriptions /></ProtectedRoute>} />
          <Route path="/payments" element={<ProtectedRoute><PaymentHistory /></ProtectedRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'var(--bg-card)',
            color: 'var(--text-primary)',
            border: '1px solid var(--border-medium)',
            borderRadius: '12px',
            fontFamily: 'var(--font-body)',
            fontSize: '14px'
          },
          success: { iconTheme: { primary: 'var(--accent-teal)', secondary: 'var(--bg-card)' } },
          error: { iconTheme: { primary: 'var(--accent-rose)', secondary: 'var(--bg-card)' } }
        }}
      />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;
