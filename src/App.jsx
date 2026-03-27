import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import { ModuleProvider } from './context/ModuleContext';
import { useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import ModulePage from './pages/ModulePage';
import TheoryPage from './pages/TheoryPage';
import ExercisePage from './pages/ExercisePage';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div>Cargando...</div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/modulo/:moduloId" element={<ProtectedRoute><ModulePage /></ProtectedRoute>} />
      <Route path="/modulo/:moduloId/nivel/:nivelId/teoria" element={<ProtectedRoute><TheoryPage /></ProtectedRoute>} />
      <Route path="/modulo/:moduloId/nivel/:nivelId" element={<ProtectedRoute><ExercisePage /></ProtectedRoute>} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ProgressProvider>
          <ModuleProvider>
            <AppRoutes />
          </ModuleProvider>
        </ProgressProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;