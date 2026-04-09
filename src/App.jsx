import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import TopNav from './components/TopNav'
import Dashboard from './pages/Dashboard'
import TheoryView from './pages/TheoryView'
import ExerciseView from './pages/ExerciseView'

const Login = lazy(() => import('./pages/Login'))

function App() {
  return (
    <>
      <TopNav />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/teoria" element={<TheoryView />} />
          <Route path="/ejercicios" element={<ExerciseView />} />
        </Routes>
      </Suspense>
    </>
  )
}

export default App
