import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
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

const Login = lazy(() => import('./pages/Login'));

function AppRoutes() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/modulo/:moduloId" element={<ModulePage />} />
        <Route path="/modulo/:moduloId/nivel/:nivelId/teoria" element={<TheoryPage />} />
        <Route path="/modulo/:moduloId/nivel/:nivelId/ejercicios" element={<ExercisePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
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
