import { useState } from 'react'
import AdminGate, { isAdminAuthenticated, clearAdminSession } from './AdminGate'
import AdminPanel from './AdminPanel'
import { useNavigate } from 'react-router-dom'

export default function AdminRoute() {
  const [authed, setAuthed] = useState(isAdminAuthenticated())
  const navigate = useNavigate()

  function handleLogout() {
    clearAdminSession()
    setAuthed(false)
    navigate('/', { replace: true })
  }

  if (!authed) {
    return <AdminGate onAuthenticated={() => setAuthed(true)} />
  }

  return <AdminPanel onLogout={handleLogout} />
}
