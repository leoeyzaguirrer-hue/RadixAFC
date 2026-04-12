import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../config/supabase'
import { clearAdminSession } from './AdminGate'
import { modulesManifest } from '../data/contentLoader'

let db = null
let firestoreFns = null
try {
  const cfg = await import('../config/firebaseConfig')
  db = cfg.db
  firestoreFns = await import('firebase/firestore')
} catch { /* Firebase not configured */ }

// ── helpers ──────────────────────────────────────────────
function randomCode() {
  const seg = () => Math.random().toString(36).slice(2, 6).toUpperCase()
  return `AFC-${seg()}-${seg()}`
}

async function fsCollection(name) {
  if (!db || !firestoreFns) return []
  const { collection, getDocs } = firestoreFns
  const snap = await getDocs(collection(db, name))
  return snap.docs.map(d => ({ id: d.id, ...d.data() }))
}

const TABS = ['Estadísticas', 'Módulos', 'Invitaciones', 'Usuarios']

// ─────────────────────────────────────────────────────────
export default function AdminPanel({ onLogout }) {
  const [tab, setTab] = useState(0)

  return (
    <div className="adm-panel">
      {/* Header */}
      <div className="adm-header">
        <span className="adm-logo">◆ AFC Admin</span>
        <nav className="adm-tabs">
          {TABS.map((t, i) => (
            <button
              key={t}
              className={`adm-tab ${tab === i ? 'adm-tab-active' : ''}`}
              onClick={() => setTab(i)}
            >
              {t}
            </button>
          ))}
        </nav>
        <button className="adm-logout" onClick={onLogout}>Cerrar sesión admin</button>
      </div>

      {/* Content */}
      <div className="adm-content">
        {tab === 0 && <TabStats />}
        {tab === 1 && <TabModules />}
        {tab === 2 && <TabInvitations />}
        {tab === 3 && <TabUsers />}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB 1 — ESTADÍSTICAS
// ═══════════════════════════════════════
function TabStats() {
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const users    = await fsCollection('users')
        const progress = await fsCollection('userProgress')

        const now = Date.now()
        const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000

        const activeCount = users.filter(u => {
          const ts = u.lastActive?.toMillis?.() || u.updatedAt?.toMillis?.() || 0
          return ts > sevenDaysAgo
        }).length

        // Compute most advanced module per user
        const moduleDist = {}
        modulesManifest.forEach(m => { moduleDist[m.id] = 0 })

        progress.forEach(p => {
          let maxIdx = -1
          modulesManifest.forEach((m, i) => {
            const allApproved = [1,2,3].every(n => p[m.id]?.[`level${n}`])
            if (allApproved && i > maxIdx) maxIdx = i
          })
          // Current module = first not completed
          const current = modulesManifest.findIndex((m, i) => {
            return !([1,2,3].every(n => p[m.id]?.[`level${n}`]))
          })
          const modId = modulesManifest[Math.max(current, 0)]?.id
          if (modId) moduleDist[modId] = (moduleDist[modId] || 0) + 1
        })

        const mostAdvanced = Object.entries(moduleDist)
          .sort((a, b) => {
            const ia = modulesManifest.findIndex(m => m.id === a[0])
            const ib = modulesManifest.findIndex(m => m.id === b[0])
            return ib - ia
          })
          .find(([, count]) => count > 0)?.[0] || '—'

        setStats({
          totalUsers:     users.length,
          activeLast7:    activeCount,
          mostAdvanced,
          moduleDist,
        })
      } catch (err) {
        console.warn('Stats error:', err)
        setStats({ totalUsers: 0, activeLast7: 0, mostAdvanced: '—', moduleDist: {} })
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) return <div className="adm-loading">Cargando estadísticas…</div>

  const maxDist = Math.max(1, ...Object.values(stats.moduleDist))

  return (
    <div className="adm-stats">
      <div className="adm-stat-cards">
        <StatCard label="Usuarios registrados" value={stats.totalUsers}       color="#178fce" />
        <StatCard label="Activos (7 días)"      value={stats.activeLast7}     color="#f08223" />
        <StatCard label="Módulo más avanzado"   value={`Módulo ${stats.mostAdvanced}`} color="#fdc413" />
      </div>

      <h3 className="adm-section-title">Distribución por módulo</h3>
      <div className="adm-dist">
        {modulesManifest.map(m => {
          const count = stats.moduleDist[m.id] || 0
          const pct   = Math.round((count / maxDist) * 100)
          return (
            <div key={m.id} className="adm-dist-row">
              <span className="adm-dist-label">{m.numero}</span>
              <div className="adm-dist-track">
                <div className="adm-dist-fill" style={{ width: `${pct}%` }} />
              </div>
              <span className="adm-dist-count">{count}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function StatCard({ label, value, color }) {
  return (
    <div className="adm-stat-card">
      <p className="adm-stat-label">{label}</p>
      <p className="adm-stat-value" style={{ color }}>{value}</p>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB 2 — MÓDULOS
// ═══════════════════════════════════════
function TabModules() {
  return (
    <div className="adm-modules">
      <p className="adm-hint">Acceso directo a todos los módulos como administrador.</p>
      <div className="adm-mod-grid">
        {modulesManifest.map((mod, i) => (
          <Link key={mod.id} to={`/modulo/${mod.id}`} className="adm-mod-card">
            <span className="adm-mod-num">{mod.numero}</span>
            <span className="adm-mod-title">{mod.titulo}</span>
            <span className="adm-mod-arrow">→</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

// ═══════════════════════════════════════
// TAB 3 — INVITACIONES
// ═══════════════════════════════════════
function TabInvitations() {
  const [codes, setCodes]           = useState([])
  const [loading, setLoading]       = useState(true)
  const [newCode, setNewCode]       = useState('')
  const [newNotes, setNewNotes]     = useState('')
  const [newIsSupervisor, setNewIsSupervisor] = useState(false)
  const [creating, setCreating]     = useState(false)
  const [confirmDel, setConfirmDel] = useState(null)
  const [copied, setCopied]         = useState(null)
  const [error, setError]           = useState('')
  const [editTarget, setEditTarget] = useState(null)   // code row being edited
  const [editNotes, setEditNotes]   = useState('')
  const [editIsSup, setEditIsSup]   = useState(false)
  const [editSaving, setEditSaving] = useState(false)
  const [toast, setToast]           = useState('')

  const load = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    setLoading(true)
    const { data, error } = await supabase
      .from('invitation_codes')
      .select('*')
      .order('created_at', { ascending: false })
    if (!error) setCodes(data || [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function handleCreate(e) {
    e.preventDefault()
    if (!newCode.trim()) return
    setCreating(true)
    setError('')
    const codigoGuardado = newCode.trim().toUpperCase()
    const { error } = await supabase.from('invitation_codes').insert({
      code:          codigoGuardado,
      notes:         newNotes.trim() || null,
      is_supervisor: newIsSupervisor,
      used:          false,
    })
    if (error) {
      setError(error.message)
    } else {
      setNewCode('')
      setNewNotes('')
      setNewIsSupervisor(false)
      await load()
    }
    setCreating(false)
  }

  async function handleDelete(id) {
    await supabase.from('invitation_codes').delete().eq('id', id)
    setConfirmDel(null)
    await load()
  }

  function openEdit(c) {
    setEditTarget(c)
    setEditNotes(c.notes || '')
    setEditIsSup(c.is_supervisor || false)
  }

  async function handleEditSave() {
    if (!editTarget) return
    setEditSaving(true)
    const { error } = await supabase
      .from('invitation_codes')
      .update({ notes: editNotes.trim() || null, is_supervisor: editIsSup })
      .eq('code', editTarget.code)
    if (!error) {
      setCodes(prev => prev.map(c =>
        c.code === editTarget.code
          ? { ...c, notes: editNotes.trim() || null, is_supervisor: editIsSup }
          : c
      ))
      setEditTarget(null)
      setToast('✓ Invitación actualizada')
      setTimeout(() => setToast(''), 3000)
    }
    setEditSaving(false)
  }

  function handleCopy(code) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(code)
      setTimeout(() => setCopied(null), 2000)
    })
  }

  if (!supabase) return (
    <div className="adm-empty">
      Supabase no configurado. Agrega VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY al .env
    </div>
  )

  return (
    <div className="adm-inv">
      {/* Create form */}
      <form className="adm-inv-form" onSubmit={handleCreate}>
        <h3 className="adm-section-title">Nueva invitación</h3>
        <div className="adm-inv-row">
          <input
            className="adm-input"
            placeholder="Código (ej: AFC-XXXX-XXXX)"
            value={newCode}
            onChange={e => setNewCode(e.target.value)}
          />
          <button
            type="button"
            className="adm-btn adm-btn-orange"
            onClick={() => setNewCode(randomCode())}
          >
            Generar
          </button>
        </div>
        <input
          className="adm-input"
          placeholder="Notas (para quién es este código)"
          value={newNotes}
          onChange={e => setNewNotes(e.target.value)}
        />

        {/* Supervisor toggle */}
        <div className="adm-inv-toggle-row">
          <span className="adm-inv-toggle-label">
            ¿Este código da acceso a todos los módulos?
          </span>
          <button
            type="button"
            className={`adm-inv-toggle ${newIsSupervisor ? 'adm-inv-toggle-on' : ''}`}
            onClick={() => setNewIsSupervisor(v => !v)}
          >
            {newIsSupervisor ? 'Supervisor 👁️' : 'Alumno regular'}
          </button>
        </div>

        {error && <p className="adm-err">{error}</p>}
        <button
          className="adm-btn adm-btn-green"
          type="submit"
          disabled={!newCode.trim() || creating}
        >
          {creating ? 'Creando…' : '+ Crear invitación'}
        </button>
      </form>

      {/* Table */}
      {loading ? (
        <div className="adm-loading">Cargando…</div>
      ) : codes.length === 0 ? (
        <div className="adm-empty">Sin invitaciones creadas.</div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Tipo</th>
                <th>Notas</th>
                <th>Estado</th>
                <th>Usado por</th>
                <th>Fecha de uso</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c, i) => (
                <tr key={c.id} className={i % 2 === 0 ? 'adm-row-a' : 'adm-row-b'}>
                  <td className="adm-code-cell">
                    <span className="adm-code">{c.code}</span>
                  </td>
                  <td>
                    {c.is_supervisor
                      ? <span className="adm-badge adm-badge-supervisor">Supervisor 👁️</span>
                      : <span className="adm-badge adm-badge-alumno">Alumno</span>
                    }
                  </td>
                  <td>{c.notes || '—'}</td>
                  <td>
                    <span className={`adm-badge ${c.used ? 'adm-badge-used' : 'adm-badge-free'}`}>
                      {c.used ? 'Usado' : 'Disponible'}
                    </span>
                  </td>
                  <td>{c.used_by || '—'}</td>
                  <td>
                    {c.used_at
                      ? new Date(c.used_at).toLocaleDateString('es-AR')
                      : '—'}
                  </td>
                  <td className="adm-actions">
                    <button
                      className="adm-btn adm-btn-orange adm-btn-sm"
                      onClick={() => handleCopy(c.code)}
                    >
                      {copied === c.code ? '✓' : 'Copiar'}
                    </button>
                    {!c.used && (
                      <button
                        className="adm-btn adm-btn-blue adm-btn-sm"
                        onClick={() => openEdit(c)}
                      >
                        Editar ✏️
                      </button>
                    )}
                    {confirmDel === c.id ? (
                      <>
                        <button
                          className="adm-btn adm-btn-red adm-btn-sm"
                          onClick={() => handleDelete(c.id)}
                        >
                          Sí, eliminar
                        </button>
                        <button
                          className="adm-btn adm-btn-ghost adm-btn-sm"
                          onClick={() => setConfirmDel(null)}
                        >
                          Cancelar
                        </button>
                      </>
                    ) : (
                      <button
                        className="adm-btn adm-btn-red adm-btn-sm"
                        onClick={() => setConfirmDel(c.id)}
                      >
                        Eliminar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Edit modal ── */}
      {editTarget && (
        <div className="adm-modal-overlay" onClick={() => setEditTarget(null)}>
          <div className="adm-modal" onClick={e => e.stopPropagation()}>
            <h3 className="adm-modal-title">Editar invitación</h3>
            <p className="adm-modal-code">{editTarget.code}</p>

            <div className="adm-field">
              <label className="adm-modal-label">Notas</label>
              <input
                className="adm-input"
                value={editNotes}
                onChange={e => setEditNotes(e.target.value)}
                placeholder="Para quién es este código"
              />
            </div>

            <div className="adm-inv-toggle-row" style={{ marginTop: '1rem' }}>
              <span className="adm-inv-toggle-label">
                ¿Este código da acceso a todos los módulos?
              </span>
              <button
                type="button"
                className={`adm-inv-toggle ${editIsSup ? 'adm-inv-toggle-on' : ''}`}
                onClick={() => setEditIsSup(v => !v)}
              >
                {editIsSup ? 'Supervisor 👁️' : 'Alumno regular'}
              </button>
            </div>

            <div className="adm-modal-actions">
              <button
                className="adm-btn adm-btn-ghost"
                onClick={() => setEditTarget(null)}
              >
                Cancelar
              </button>
              <button
                className="adm-btn adm-btn-orange"
                onClick={handleEditSave}
                disabled={editSaving}
              >
                {editSaving ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Toast ── */}
      {toast && <div className="adm-toast">{toast}</div>}
    </div>
  )
}

// ═══════════════════════════════════════
// TAB 4 — USUARIOS
// ═══════════════════════════════════════
async function fsUpdateUser(uid, fields) {
  if (!db || !firestoreFns) return
  const { doc, updateDoc, setDoc, getDoc } = firestoreFns
  const ref = doc(db, 'users', uid)
  try {
    await updateDoc(ref, fields)
  } catch {
    // Doc may not have the field yet — merge
    await setDoc(ref, fields, { merge: true })
  }
}

function TabUsers() {
  const [users, setUsers]       = useState([])
  const [loading, setLoading]   = useState(true)
  const [query, setQuery]       = useState('')
  const [confirmDel, setConfirmDel] = useState(null) // uid to confirm deactivate

  const load = useCallback(async () => {
    try {
      const rawUsers    = await fsCollection('users')
      const rawProgress = await fsCollection('userProgress')

      const progressMap = {}
      rawProgress.forEach(p => { progressMap[p.id] = p })

      const enriched = rawUsers.map(u => {
        const uid  = u.uid || u.id
        const prog = progressMap[uid] || {}
        let currentMod = '—'
        let completedLevels = 0

        modulesManifest.forEach(m => {
          const mData = prog[m.id] || {}
          for (let n = 1; n <= 3; n++) {
            if (mData[`level${n}`]) completedLevels++
          }
        })

        const firstIncomplete = modulesManifest.find(m =>
          ![1,2,3].every(n => prog[m.id]?.[`level${n}`])
        )
        currentMod = firstIncomplete?.titulo || 'Completado'

        return {
          uid,
          email:            u.email || '—',
          createdAt:        u.createdAt?.toDate?.() || null,
          active:           u.active !== false, // default true if missing
          supervisorAccess: u.supervisorAccess === true,
          currentMod,
          completedLevels,
        }
      })

      setUsers(enriched)
    } catch (err) {
      console.warn('Users error:', err)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { load() }, [load])

  async function handleToggleActive(u) {
    const newVal = !u.active
    // Optimistic update
    setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, active: newVal } : x))
    setConfirmDel(null)
    await fsUpdateUser(u.uid, { active: newVal })
  }

  async function handleToggleSupervisor(u) {
    const newVal = !u.supervisorAccess
    setUsers(prev => prev.map(x => x.uid === u.uid ? { ...x, supervisorAccess: newVal } : x))
    await fsUpdateUser(u.uid, { supervisorAccess: newVal })
  }

  const filtered = users.filter(u =>
    u.email.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="adm-users">
      <input
        className="adm-input adm-search"
        placeholder="Buscar por email…"
        value={query}
        onChange={e => setQuery(e.target.value)}
      />

      {loading ? (
        <div className="adm-loading">Cargando usuarios…</div>
      ) : filtered.length === 0 ? (
        <div className="adm-empty">
          {query ? 'Sin resultados.' : 'No hay usuarios en Firestore.'}
        </div>
      ) : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Supervisor</th>
                <th>Estado</th>
                <th>Registro</th>
                <th>Módulo actual</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => (
                <tr key={u.uid} className={i % 2 === 0 ? 'adm-row-a' : 'adm-row-b'}>

                  {/* Email + badge supervisor */}
                  <td>
                    <span>{u.email}</span>
                    {u.supervisorAccess && (
                      <span className="adm-badge adm-badge-supervisor">Supervisor</span>
                    )}
                  </td>

                  {/* Supervisor toggle */}
                  <td>
                    {u.supervisorAccess ? (
                      <button
                        className="adm-btn adm-btn-ghost adm-btn-sm"
                        onClick={() => handleToggleSupervisor(u)}
                      >
                        Quitar acceso
                      </button>
                    ) : (
                      <button
                        className="adm-btn adm-btn-orange adm-btn-sm"
                        onClick={() => handleToggleSupervisor(u)}
                      >
                        👁️ Dar acceso
                      </button>
                    )}
                    <p className="adm-sup-hint">
                      Normalmente asignado desde el código de invitación
                    </p>
                  </td>

                  {/* Estado */}
                  <td>
                    <span className={`adm-status-dot ${u.active ? 'adm-dot-active' : 'adm-dot-inactive'}`} />
                    <span className={u.active ? 'adm-status-active' : 'adm-status-inactive'}>
                      {u.active ? 'Activo' : 'Desactivado'}
                    </span>
                  </td>

                  {/* Fecha */}
                  <td>
                    {u.createdAt ? u.createdAt.toLocaleDateString('es-AR') : '—'}
                  </td>

                  {/* Módulo actual */}
                  <td className="adm-mod-name">{u.currentMod}</td>

                  {/* Acciones desactivar/reactivar */}
                  <td className="adm-actions">
                    {u.active ? (
                      confirmDel === u.uid ? (
                        <>
                          <span className="adm-confirm-text">
                            ¿Desactivar a {u.email}?
                          </span>
                          <button
                            className="adm-btn adm-btn-red adm-btn-sm"
                            onClick={() => handleToggleActive(u)}
                          >
                            Sí, desactivar
                          </button>
                          <button
                            className="adm-btn adm-btn-ghost adm-btn-sm"
                            onClick={() => setConfirmDel(null)}
                          >
                            Cancelar
                          </button>
                        </>
                      ) : (
                        <button
                          className="adm-btn adm-btn-red adm-btn-sm"
                          onClick={() => setConfirmDel(u.uid)}
                        >
                          Desactivar
                        </button>
                      )
                    ) : (
                      <button
                        className="adm-btn adm-btn-green adm-btn-sm"
                        onClick={() => handleToggleActive(u)}
                      >
                        Reactivar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
