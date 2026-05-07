import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'

// ─── Mocks ─────────────────────────────────────────────────────────────────
let codesData = []
let insertResult = { error: null }
let deleteResult = { error: null }

const orderFn  = vi.fn(() => Promise.resolve({ data: codesData, error: null }))
const selectFn = vi.fn(() => ({ order: orderFn }))
const insertFn = vi.fn(() => Promise.resolve(insertResult))
const deleteEqFn = vi.fn(() => Promise.resolve(deleteResult))
const deleteFn = vi.fn(() => ({ eq: deleteEqFn }))
const updateEqFn = vi.fn(() => Promise.resolve({ error: null }))
const updateFn = vi.fn(() => ({ eq: updateEqFn }))

const fromFn = vi.fn(() => ({
  select: selectFn,
  insert: insertFn,
  delete: deleteFn,
  update: updateFn,
}))

const channelOnFn = vi.fn(function () { return this })
const channelSubscribeFn = vi.fn()
const channelObj = { on: channelOnFn, subscribe: channelSubscribeFn }
const channelFn = vi.fn(() => channelObj)
const removeChannelFn = vi.fn()

vi.mock('../config/supabase', () => ({
  supabase: {
    from:          (...a) => fromFn(...a),
    channel:       (...a) => channelFn(...a),
    removeChannel: (...a) => removeChannelFn(...a),
  },
}))

vi.mock('../config/firebaseConfig', () => ({
  db: { __db: true },
}))

vi.mock('firebase/firestore', () => ({
  collection: () => ({}),
  getDocs:    () => Promise.resolve({ docs: [] }),
  doc:        () => ({}),
  setDoc:     () => Promise.resolve(),
  updateDoc:  () => Promise.resolve(),
  getDoc:     () => Promise.resolve({ exists: () => false }),
}))

vi.mock('./AdminGate', () => ({
  clearAdminSession: vi.fn(),
}))

vi.mock('../data/contentLoader', () => ({
  modulesManifest: [
    { id: 'm1', numero: '1', titulo: 'Mod 1' },
    { id: 'm2', numero: '2', titulo: 'Mod 2' },
  ],
}))

// ─── Imports under test ────────────────────────────────────────────────────
import AdminPanel from './AdminPanel'

function renderAdmin() {
  return render(
    <MemoryRouter>
      <AdminPanel onLogout={() => {}} />
    </MemoryRouter>
  )
}

beforeEach(() => {
  vi.clearAllMocks()
  codesData = []
  insertResult = { error: null }
})

async function goToInvitaciones(user) {
  await user.click(screen.getByRole('button', { name: /Invitaciones/i }))
}

// ─── TESTS ─────────────────────────────────────────────────────────────────

describe('AdminPanel — pestaña Invitaciones', () => {
  it('muestra mensaje vacío cuando no hay códigos', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await goToInvitaciones(user)
    expect(await screen.findByText(/Sin invitaciones creadas/i)).toBeInTheDocument()
  })

  it('lista códigos con su estado (Disponible / Usado)', async () => {
    codesData = [
      { id: 1, code: 'AFC-AAAA', notes: 'Para Juan', is_supervisor: false, used: false },
      { id: 2, code: 'AFC-BBBB', notes: null, is_supervisor: true,  used: true,
        used_by: 'usado@x.com', used_at: '2026-05-01T10:00:00Z' },
    ]
    const user = userEvent.setup()
    renderAdmin()
    await goToInvitaciones(user)

    expect(await screen.findByText('AFC-AAAA')).toBeInTheDocument()
    expect(screen.getByText('AFC-BBBB')).toBeInTheDocument()
    expect(screen.getByText('Disponible')).toBeInTheDocument()
    expect(screen.getByText('Usado')).toBeInTheDocument()
    expect(screen.getByText('usado@x.com')).toBeInTheDocument()
  })

  it('crea un código nuevo en Supabase con normalización mayúsculas', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await goToInvitaciones(user)

    const input = await screen.findByPlaceholderText(/Código \(ej: AFC-XXXX-XXXX\)/i)
    await user.type(input, 'afc-test-1234')
    await user.click(screen.getByRole('button', { name: /Crear invitación/i }))

    await waitFor(() => expect(insertFn).toHaveBeenCalled())
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'AFC-TEST-1234',
        used: false,
        is_supervisor: false,
      })
    )
  })

  it('marca el switch supervisor antes de crear', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await goToInvitaciones(user)

    await user.type(screen.getByPlaceholderText(/Código \(ej:/i), 'AFC-SUP')
    await user.click(screen.getByRole('button', { name: /Alumno regular/i }))
    await user.click(screen.getByRole('button', { name: /Crear invitación/i }))

    await waitFor(() => expect(insertFn).toHaveBeenCalled())
    expect(insertFn).toHaveBeenCalledWith(
      expect.objectContaining({ code: 'AFC-SUP', is_supervisor: true })
    )
  })

  it('botón refrescar vuelve a consultar Supabase', async () => {
    codesData = [{ id: 1, code: 'AFC-X', notes: null, is_supervisor: false, used: false }]
    const user = userEvent.setup()
    renderAdmin()
    await goToInvitaciones(user)
    await screen.findByText('AFC-X')

    const callsBefore = selectFn.mock.calls.length
    await user.click(screen.getByRole('button', { name: /Refrescar/i }))

    await waitFor(() => expect(selectFn.mock.calls.length).toBeGreaterThan(callsBefore))
  })

  it('se suscribe a Supabase Realtime al montar la pestaña', async () => {
    const user = userEvent.setup()
    renderAdmin()
    await goToInvitaciones(user)

    await waitFor(() => expect(channelFn).toHaveBeenCalledWith('invitation_codes_changes'))
    expect(channelOnFn).toHaveBeenCalledWith(
      'postgres_changes',
      expect.objectContaining({ event: '*', table: 'invitation_codes' }),
      expect.any(Function)
    )
    expect(channelSubscribeFn).toHaveBeenCalled()
  })

  it('muestra error de Supabase al fallar la creación', async () => {
    insertResult = { error: { message: 'duplicate key value' } }
    const user = userEvent.setup()
    renderAdmin()
    await goToInvitaciones(user)

    await user.type(screen.getByPlaceholderText(/Código \(ej:/i), 'AFC-DUPE')
    await user.click(screen.getByRole('button', { name: /Crear invitación/i }))

    expect(await screen.findByText(/duplicate key value/i)).toBeInTheDocument()
  })
})
