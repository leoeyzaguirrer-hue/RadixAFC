import { useState } from 'react'

const SESSION_KEY = 'adminAuthenticated'

export function isAdminAuthenticated() {
  return sessionStorage.getItem(SESSION_KEY) === 'true'
}

export function clearAdminSession() {
  sessionStorage.removeItem(SESSION_KEY)
}

export default function AdminGate({ onAuthenticated }) {
  const [key, setKey]     = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const secret = import.meta.env.VITE_ADMIN_SECRET_KEY
    setTimeout(() => {
      if (key === secret) {
        sessionStorage.setItem(SESSION_KEY, 'true')
        onAuthenticated()
      } else {
        setError('Clave incorrecta')
        setKey('')
      }
      setLoading(false)
    }, 400)
  }

  return (
    <div className="adm-gate">
      <form className="adm-gate-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="adm-gate-logo">◆</div>
        <input
          className={`adm-gate-input ${error ? 'adm-gate-input-err' : ''}`}
          type="password"
          placeholder="Clave de acceso"
          value={key}
          onChange={e => { setKey(e.target.value); setError('') }}
          autoFocus
          autoComplete="new-password"
        />
        {error && <p className="adm-gate-error">{error}</p>}
        <button className="adm-gate-btn" type="submit" disabled={!key || loading}>
          {loading ? '···' : 'Acceder'}
        </button>
      </form>
    </div>
  )
}
