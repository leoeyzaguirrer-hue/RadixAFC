import { lazy, Suspense, useContext } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ModuleProvider } from './context/ModuleContext';
import TopNav from './components/TopNav';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import TheoryPage from './pages/TheoryPage';
import ExercisePage from './pages/ExercisePage';
import AdminRoute from './pages/AdminRoute'
import Profile from './pages/Profile';

const Login = lazy(() => import('./pages/Login'));

// Protege rutas que requieren autenticación
function ProtectedRoute({ children }) {
  const { user, loading } = useContext(AuthContext);
  if (loading) return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#fff',
    }}>
      <div style={{
        width: 40, height: 40, border: '3px solid #dcdadb',
        borderTopColor: '#0552a0', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/modulo/:moduloId" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
        <Route path="/modulo/:moduloId/nivel/:nivelId/teoria" element={<ProtectedRoute><TheoryPage /></ProtectedRoute>} />
        <Route path="/modulo/:moduloId/nivel/:nivelId/ejercicios" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
        <Route path="/perfil" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Suspense>
  );
}

function AppWithNav() {
  return (
    <>
      <TopNav />
      <AppRoutes />
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <ModuleProvider>
            <Routes>
              {/* Admin route — sin TopNav */}
              <Route path="/admin-afc-praxis-2024" element={<AdminRoute />} />
              {/* Resto de rutas — con TopNav */}
              <Route path="*" element={<AppWithNav />} />
            </Routes>
          </ModuleProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
