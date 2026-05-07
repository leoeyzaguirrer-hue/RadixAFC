import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ─── Mocks ─────────────────────────────────────────────────────────────────
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

const createUserWithEmailAndPassword = vi.fn()
const signInWithEmailAndPassword     = vi.fn()
const signOut                        = vi.fn().mockResolvedValue(undefined)
vi.mock('firebase/auth', () => ({
  createUserWithEmailAndPassword: (...a) => createUserWithEmailAndPassword(...a),
  signInWithEmailAndPassword:     (...a) => signInWithEmailAndPassword(...a),
  signOut:                        (...a) => signOut(...a),
}))

const setDoc          = vi.fn()
const getDoc          = vi.fn()
vi.mock('firebase/firestore', () => ({
  doc:             (...args) => ({ __doc: args }),
  setDoc:          (...a) => setDoc(...a),
  getDoc:          (...a) => getDoc(...a),
  serverTimestamp: () => '__SERVER_TS__',
}))

vi.mock('../config/firebaseConfig', () => ({
  auth: { currentUser: null },
  db:   { __db: true },
}))

// Supabase mock — chainable query builder
let supabaseSelectResult = { data: null, error: null }
let supabaseUpdateResult = { error: null }
const supabaseSelectChain = {
  eq:     vi.fn(function () { return this }),
  single: vi.fn(() => Promise.resolve(supabaseSelectResult)),
}
const supabaseUpdateChain = {
  eq: vi.fn(() => Promise.resolve(supabaseUpdateResult)),
}
const supabaseFromObj = {
  select: vi.fn(() => supabaseSelectChain),
  update: vi.fn(() => supabaseUpdateChain),
}
vi.mock('../config/supabase', () => ({
  supabase: { from: vi.fn(() => supabaseFromObj) },
}))

// ─── Imports under test ────────────────────────────────────────────────────
import Login from './Login'

function renderLogin() {
  return render(<MemoryRouter><Login /></MemoryRouter>)
}

beforeEach(() => {
  vi.clearAllMocks()
  supabaseSelectResult = { data: null, error: null }
  supabaseUpdateResult = { error: null }
})

async function switchToRegister(user) {
  await user.click(screen.getByRole('button', { name: /Regístrate/i }))
}

async function fillRegisterForm(user, { email, password, code }) {
  await user.type(screen.getByLabelText(/Email/i), email)
  await user.type(screen.getByLabelText(/Contraseña/i), password)
  await user.type(screen.getByLabelText(/Código de invitación/i), code)
}

// ─── TESTS ─────────────────────────────────────────────────────────────────

describe('Login — pantalla de login', () => {
  it('muestra el formulario de login por defecto', () => {
    renderLogin()
    expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument()
  })

  it('muestra error si email/contraseña están vacíos', async () => {
    const user = userEvent.setup()
    renderLogin()
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))
    expect(await screen.findByText(/Ingresa email y contraseña/i)).toBeInTheDocument()
  })

  it('login exitoso navega al dashboard', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } })
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ active: true }) })

    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText(/Email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/Contraseña/i), 'pass1234')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/dashboard', { replace: true }))
  })

  it('login bloqueado para cuenta desactivada', async () => {
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u1' } })
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ active: false }) })

    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText(/Email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/Contraseña/i), 'pass1234')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByText(/cuenta ha sido desactivada/i)).toBeInTheDocument()
    expect(signOut).toHaveBeenCalled()
  })

  it('contraseña incorrecta muestra mensaje en español', async () => {
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' })

    const user = userEvent.setup()
    renderLogin()
    await user.type(screen.getByLabelText(/Email/i), 'a@b.com')
    await user.type(screen.getByLabelText(/Contraseña/i), 'pass1234')
    await user.click(screen.getByRole('button', { name: /Ingresar/i }))

    expect(await screen.findByText(/Contraseña incorrecta/i)).toBeInTheDocument()
  })
})

describe('Login — registro feliz', () => {
  it('registra usuario, crea perfil, marca código y cierra sesión', async () => {
    supabaseSelectResult = {
      data: { code: 'AFC-1234-5678', is_supervisor: false, used: false },
      error: null,
    }
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'newuid' } })
    setDoc.mockResolvedValue(undefined)

    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'NEW@user.com', password: 'pass1234', code: 'afc-1234-5678' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))

    await waitFor(() => expect(setDoc).toHaveBeenCalled())

    // 1. Validó código en Supabase normalizado
    expect(supabaseSelectChain.eq).toHaveBeenCalledWith('code', 'AFC-1234-5678')
    expect(supabaseSelectChain.eq).toHaveBeenCalledWith('used', false)

    // 2. Creó usuario en Firebase con email normalizado
    expect(createUserWithEmailAndPassword).toHaveBeenCalledWith(
      expect.anything(), 'new@user.com', 'pass1234'
    )

    // 3. Guardó perfil con supervisorAccess = false (no era supervisor)
    const profile = setDoc.mock.calls[0][1]
    expect(profile).toMatchObject({
      uid: 'newuid',
      email: 'new@user.com',
      active: true,
      supervisorAccess: false,
      profileCompleted: false,
    })

    // 4. Marcó código usado en Supabase
    expect(supabaseFromObj.update).toHaveBeenCalledWith(
      expect.objectContaining({ used: true, used_by: 'new@user.com' })
    )

    // 5. Cerró sesión y mostró éxito
    expect(signOut).toHaveBeenCalled()
    expect(await screen.findByText(/¡Registro exitoso!/i)).toBeInTheDocument()
  })

  it('hereda supervisorAccess=true cuando el código es de supervisor', async () => {
    supabaseSelectResult = {
      data: { code: 'AFC-SUPER', is_supervisor: true, used: false },
      error: null,
    }
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'sup1' } })
    setDoc.mockResolvedValue(undefined)

    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'sup@x.com', password: 'pass1234', code: 'AFC-SUPER' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))

    await waitFor(() => expect(setDoc).toHaveBeenCalled())
    expect(setDoc.mock.calls[0][1].supervisorAccess).toBe(true)
  })
})

describe('Login — registro con validaciones', () => {
  it('rechaza si faltan campos', async () => {
    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(await screen.findByText(/Completa todos los campos/i)).toBeInTheDocument()
  })

  it('rechaza contraseñas menores a 6 caracteres', async () => {
    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'a@b.com', password: '123', code: 'AFC-X' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))
    expect(await screen.findByText(/al menos 6 caracteres/i)).toBeInTheDocument()
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })

  it('rechaza si el código de invitación no es válido', async () => {
    supabaseSelectResult = { data: null, error: { message: 'no rows' } }

    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'a@b.com', password: 'pass1234', code: 'BAD-CODE' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))

    expect(await screen.findByText(/Código inválido o ya utilizado/i)).toBeInTheDocument()
    expect(createUserWithEmailAndPassword).not.toHaveBeenCalled()
  })
})

describe('Login — errores y recuperación (caso Miguel)', () => {
  it('muestra mensaje claro cuando Firestore rechaza por permisos', async () => {
    supabaseSelectResult = {
      data: { code: 'AFC-X', is_supervisor: false, used: false },
      error: null,
    }
    createUserWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u' } })
    setDoc.mockRejectedValue(new Error('Missing or insufficient permissions'))

    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'a@b.com', password: 'pass1234', code: 'AFC-X' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))

    expect(await screen.findByText(/permisos insuficientes en Firestore/i)).toBeInTheDocument()
    // Código NO se debe haber marcado usado si el perfil falló
    expect(supabaseFromObj.update).not.toHaveBeenCalled()
  })

  it('RECUPERACIÓN: email-already-in-use + sin perfil → completa el registro', async () => {
    supabaseSelectResult = {
      data: { code: 'AFC-X', is_supervisor: false, used: false },
      error: null,
    }
    // Primera vez: crear usuario falla porque ya existe
    createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' })
    // Pero la contraseña que escribió coincide con la cuenta existente
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'oldUid' } })
    // Y NO tiene perfil en Firestore (registro previo a medias)
    getDoc.mockResolvedValue({ exists: () => false })
    setDoc.mockResolvedValue(undefined)

    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'miguel@itacaformacion.es', password: 'pass1234', code: 'AFC-X' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))

    expect(await screen.findByText(/¡Registro completado!/i)).toBeInTheDocument()
    expect(setDoc).toHaveBeenCalled()
    expect(supabaseFromObj.update).toHaveBeenCalled() // código marcado usado
    expect(signOut).toHaveBeenCalled()
  })

  it('RECUPERACIÓN: si la cuenta YA tiene perfil → manda a iniciar sesión', async () => {
    supabaseSelectResult = {
      data: { code: 'AFC-X', is_supervisor: false, used: false },
      error: null,
    }
    createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' })
    signInWithEmailAndPassword.mockResolvedValue({ user: { uid: 'u' } })
    getDoc.mockResolvedValue({ exists: () => true, data: () => ({ email: 'a@b.com' }) })

    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'a@b.com', password: 'pass1234', code: 'AFC-X' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))

    expect(await screen.findByText(/ya está completamente registrado/i)).toBeInTheDocument()
    expect(setDoc).not.toHaveBeenCalled()
    expect(signOut).toHaveBeenCalled()
  })

  it('email-already-in-use + contraseña distinta → mensaje claro', async () => {
    supabaseSelectResult = {
      data: { code: 'AFC-X', is_supervisor: false, used: false },
      error: null,
    }
    createUserWithEmailAndPassword.mockRejectedValue({ code: 'auth/email-already-in-use' })
    signInWithEmailAndPassword.mockRejectedValue({ code: 'auth/wrong-password' })

    const user = userEvent.setup()
    renderLogin()
    await switchToRegister(user)
    await fillRegisterForm(user, { email: 'a@b.com', password: 'pass1234', code: 'AFC-X' })
    await user.click(screen.getByRole('button', { name: /Registrarse/i }))

    expect(await screen.findByText(/ya está registrado con otra contraseña/i)).toBeInTheDocument()
  })
})
