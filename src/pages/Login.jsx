import { useState } from 'react'

export default function Login({ navigate }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Por favor completa todos los campos.')
      return
    }

    setLoading(true)
    try {
      // TODO: Integrar con Firebase Auth
      // await signInWithEmailAndPassword(auth, email, password)
      navigate('dashboard')
    } catch (err) {
      setError('Credenciales incorrectas. Intenta de nuevo.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <section className="login-page">
      <div className="login-card">
        <h2>Iniciar Sesión</h2>
        <p className="login-subtitle">Accede a tu cuenta de RadixAFC</p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Correo electrónico</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@correo.com"
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Tu contraseña"
              autoComplete="current-password"
            />
          </div>

          <button type="submit" className="login-btn" disabled={loading}>
            {loading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>

        <p className="login-footer">
          ¿No tienes cuenta?{' '}
          <button
            type="button"
            className="link-btn"
            onClick={() => navigate('landing')}
          >
            Volver al inicio
          </button>
        </p>
      </div>
    </section>
  )
}
