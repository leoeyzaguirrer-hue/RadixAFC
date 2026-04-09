import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ModuleProvider } from './context/ModuleContext';
import { useAuth } from './hooks/useAuth';
import TopNav from './components/TopNav';
import Landing from './pages/Landing';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import TheoryView from './pages/TheoryView';
import ExerciseView from './pages/ExerciseView';
import ModulePage from './pages/ModulePage';
import TheoryPage from './pages/TheoryPage';
import ExercisePage from './pages/ExercisePage';

const Login = lazy(() => import('./pages/Login'));

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
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
        <Route path="/teoria" element={<ProtectedRoute><TheoryView /></ProtectedRoute>} />
        <Route path="/ejercicios" element={<ProtectedRoute><ExerciseView /></ProtectedRoute>} />
        <Route path="/modulo/:moduloId" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
        <Route path="/modulo/:moduloId/nivel/:nivelId/teoria" element={<ProtectedRoute><TheoryPage /></ProtectedRoute>} />
        <Route path="/modulo/:moduloId/nivel/:nivelId" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
      </Routes>
    </Suspense>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <ModuleProvider>
            <TopNav />
            <AppRoutes />
          </ModuleProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
