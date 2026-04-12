import { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthContext } from '../context/AuthContext'
import { useProgress } from '../hooks/useProgress'
import { modulesManifest } from '../data/contentLoader'

let firebaseAuth = null
let auth = null
try {
  const cfg = await import('../config/firebaseConfig')
  auth = cfg.auth
  firebaseAuth = await import('firebase/auth')
} catch { /* Firebase not configured */ }

const COUNTRIES = [
  'Argentina','Bolivia','Brasil','Chile','Colombia',
  'Costa Rica','Cuba','Ecuador','El Salvador','España',
  'Guatemala','Honduras','México','Nicaragua','Panamá',
  'Paraguay','Perú','Puerto Rico','República Dominicana',
  'Uruguay','Venezuela','Otro',
]

const AVATAR_COLORS = [
  { hex: '#041e42', label: 'Azul profundo' },
  { hex: '#0552a0', label: 'Azul oscuro' },
  { hex: '#178fce', label: 'Azul claro' },
  { hex: '#f08223', label: 'Naranja' },
  { hex: '#fdc413', label: 'Amarillo', dark: true },
  { hex: '#22c55e', label: 'Verde' },
  { hex: '#8b5cf6', label: 'Violeta' },
  { hex: '#ef4444', label: 'Rojo' },
]

const MODULE_EMOJIS = {
  '1':'🧠','2':'🔗','2.5':'📏','3':'⚡','4':'📊',
  '5':'🎯','6':'🛠️','7':'📋','8':'💬','9':'🕸️',
  '10':'🌿','11':'🤝','12':'🔄','13':'🏁',
}
const MODULE_SHORT = {
  '1' :'Filosofía y Fundamentos', '2'  :'Condicionamiento Clásico',
  '2.5':'Operacionalización',      '3'  :'Condicionamiento Operante',
  '4' :'Análisis Funcional',       '5'  :'Evaluación Conductual',
  '6' :'Técnicas de Intervención', '7'  :'Medición y Registro',
  '8' :'Conducta Verbal',          '9'  :'RFT',
  '10':'ACT',                      '11' :'FAP',
  '12':'Integración Clínica',      '13' :'Síntesis Final',
}

function getInitials(name, lastName) {
  const a = name?.trim()?.[0]?.toUpperCase() || ''
  const b = lastName?.trim()?.[0]?.toUpperCase() || ''
  return a + b || '?'
}

function AvatarBig({ name, lastName, avatarColor, profileCompleted, size = 80 }) {
  const initials = profileCompleted ? getInitials(name, lastName) : '?'
  const bg       = profileCompleted ? (avatarColor || '#0552a0') : '#dcdadb'
  const color    = profileCompleted ? '#fff' : '#0552a0'
  return (
    <div
      className="prf-avatar-big"
      style={{ width: size, height: size, background: bg, color, fontSize: size * 0.28 }}
    >
      {initials}
    </div>
  )
}

export default function Profile() {
  const authCtx     = useContext(AuthContext)
  const navigate    = useNavigate()
  const user        = authCtx?.user
  const profile     = authCtx?.userProfile || {}
  const updateProfile = authCtx?.updateProfile

  const { getNivelAprobado, getModuloCompletado, getModuloDesbloqueado } = useProgress()

  // Redirect if not logged in
  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  // Form state — mirror profile
  const [name,        setName]        = useState(profile.name        || '')
  const [lastName,    setLastName]    = useState(profile.lastName    || '')
  const [country,     setCountry]     = useState(profile.country     || '')
  const [profession,  setProfession]  = useState(profile.profession  || '')
  const [university,  setUniversity]  = useState(profile.university  || '')
  const [avatarColor, setAvatarColor] = useState(profile.avatarColor || '#0552a0')

  // Sync when profile loads from Firestore
  useEffect(() => {
    setName(profile.name        || '')
    setLastName(profile.lastName    || '')
    setCountry(profile.country     || '')
    setProfession(profile.profession  || '')
    setUniversity(profile.university  || '')
    setAvatarColor(profile.avatarColor || '#0552a0')
  }, [profile.name, profile.lastName])

  const [toast,       setToast]       = useState('')
  const [saving,      setSaving]      = useState(false)
  const [resetSent,   setResetSent]   = useState(false)

  // Live avatar preview
  const previewCompleted = !!(name.trim() && lastName.trim())

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile({ name, lastName, country, profession, university, avatarColor })
      showToast('✓ Perfil actualizado')
    } catch (err) {
      showToast('Error al guardar: ' + err.message)
    } finally {
      setSaving(false)
    }
  }

  function showToast(msg) {
    setToast(msg)
    setTimeout(() => setToast(''), 3000)
  }

  async function handleResetPassword() {
    if (!auth || !firebaseAuth || !user?.email) return
    try {
      await firebaseAuth.sendPasswordResetEmail(auth, user.email)
      setResetSent(true)
      setTimeout(() => setResetSent(false), 5000)
    } catch {
      showToast('No se pudo enviar el email.')
    }
  }

  // Progress section
  const completedCount = modulesManifest.filter(m => getModuloCompletado(m.id)).length

  function getModStatus(mod) {
    if (getModuloCompletado(mod.id)) return 'completed'
    if (!getModuloDesbloqueado(mod.id)) return 'locked'
    const lvls = [1,2,3].filter(n => getNivelAprobado(mod.id, n)).length
    return lvls > 0 ? 'in-progress' : 'available'
  }

  if (!user) return null

  return (
    <div className="prf-screen">
      {/* Particles (same as dashboard) */}
      <div className="prf-bg" />

      <div className="prf-container">

        {/* ── SECTION 1: Header ── */}
        <div className="prf-head">
          <AvatarBig
            name={name}
            lastName={lastName}
            avatarColor={avatarColor}
            profileCompleted={previewCompleted}
            size={80}
          />
          <h2 className="prf-displayname">
            {previewCompleted ? `${name} ${lastName}` : 'Sin nombre aún'}
          </h2>
          <p className="prf-email">{user.email}</p>
          {!profile.profileCompleted && (
            <span className="prf-incomplete-badge">⚠️ Perfil incompleto</span>
          )}
        </div>

        {/* ── SECTION 2: Form ── */}
        <form className="prf-card" onSubmit={handleSave}>
          <h3 className="prf-card-title">Información personal</h3>

          <div className="prf-grid-2">
            <div className="prf-field">
              <label className="prf-label">Nombre *</label>
              <input
                className="prf-input"
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Tu nombre"
                required
              />
            </div>
            <div className="prf-field">
              <label className="prf-label">Apellido *</label>
              <input
                className="prf-input"
                type="text"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                placeholder="Tu apellido"
                required
              />
            </div>
          </div>

          <div className="prf-field">
            <label className="prf-label">País</label>
            <select
              className="prf-input prf-select"
              value={country}
              onChange={e => setCountry(e.target.value)}
            >
              <option value="">Selecciona tu país</option>
              {COUNTRIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div className="prf-field">
            <label className="prf-label">Profesión</label>
            <input
              className="prf-input"
              type="text"
              value={profession}
              onChange={e => setProfession(e.target.value)}
              placeholder="Ej: Psicólogo/a, Estudiante de psicología…"
            />
          </div>

          <div className="prf-field">
            <label className="prf-label">Universidad / Institución</label>
            <input
              className="prf-input"
              type="text"
              value={university}
              onChange={e => setUniversity(e.target.value)}
              placeholder="Nombre de tu institución"
            />
          </div>

          {/* ── SECTION 3: Avatar color ── */}
          <h3 className="prf-card-title" style={{ marginTop: '1.5rem' }}>Color de tu avatar</h3>
          <div className="prf-color-row">
            {AVATAR_COLORS.map(c => (
              <button
                key={c.hex}
                type="button"
                className={`prf-color-dot${avatarColor === c.hex ? ' prf-color-selected' : ''}`}
                style={{ background: c.hex }}
                aria-label={c.label}
                onClick={() => setAvatarColor(c.hex)}
              />
            ))}
            {/* Live preview */}
            <div className="prf-color-preview">
              <AvatarBig
                name={name}
                lastName={lastName}
                avatarColor={avatarColor}
                profileCompleted={previewCompleted}
                size={42}
              />
            </div>
          </div>

          {/* ── Save button ── */}
          <button
            type="submit"
            className="prf-save-btn"
            disabled={saving}
          >
            {saving ? 'Guardando…' : 'Guardar cambios'}
          </button>
        </form>

        {/* ── SECTION 4: Progress ── */}
        <div className="prf-card">
          <h3 className="prf-card-title">Mi avance en AFC Praxis</h3>

          <div className="prf-prog-wrap">
            <p className="prf-prog-label">
              <span className="prf-prog-n">{completedCount}</span>
              {` de ${modulesManifest.length} módulos completados`}
            </p>
            <div className="prf-prog-track">
              <div
                className="prf-prog-fill"
                style={{ width: `${(completedCount / modulesManifest.length) * 100}%` }}
              />
            </div>
          </div>

          <div className="prf-mod-grid">
            {modulesManifest.map(mod => {
              const status = getModStatus(mod)
              const emoji  = MODULE_EMOJIS[mod.id] || '📚'
              const name_  = MODULE_SHORT[mod.id] || mod.titulo
              const icon   = status === 'completed' ? '✅'
                           : status === 'in-progress' ? '🔄'
                           : status === 'locked' ? '🔒' : '▶️'
              return (
                <div key={mod.id} className={`prf-mod-item prf-mod-${status}`}>
                  <span className="prf-mod-emoji">{emoji}</span>
                  <span className="prf-mod-name">{name_}</span>
                  <span className="prf-mod-icon">{icon}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* ── SECTION 5: Security ── */}
        <div className="prf-card prf-security">
          <h3 className="prf-card-title">Seguridad</h3>
          {resetSent ? (
            <p className="prf-reset-sent">
              ✓ Te enviamos un email a <strong>{user.email}</strong> con instrucciones
            </p>
          ) : (
            <button
              type="button"
              className="prf-reset-btn"
              onClick={handleResetPassword}
            >
              Enviar email para cambiar contraseña
            </button>
          )}
        </div>

      </div>

      {/* ── Toast ── */}
      {toast && (
        <div className="prf-toast">{toast}</div>
      )}
    </div>
  )
}
