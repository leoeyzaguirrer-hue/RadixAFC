import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { supabase } from '../config/supabase';

// Mensajes de error de Firebase Auth → español amigable
function friendlyAuthError(err) {
  const code = err?.code || '';
  if (code === 'auth/email-already-in-use')      return 'Este email ya está registrado. Inicia sesión o usa "¿Olvidaste tu contraseña?".';
  if (code === 'auth/invalid-email')             return 'El formato del email no es válido.';
  if (code === 'auth/weak-password')              return 'La contraseña debe tener al menos 6 caracteres.';
  if (code === 'auth/network-request-failed')    return 'Sin conexión. Revisa tu internet e inténtalo de nuevo.';
  if (code === 'auth/wrong-password')             return 'Contraseña incorrecta.';
  if (code === 'auth/user-not-found')             return 'No existe una cuenta con ese email.';
  if (code === 'auth/too-many-requests')         return 'Demasiados intentos. Espera un momento e intenta de nuevo.';
  return err?.message || 'Ocurrió un error inesperado.';
}

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Validar código contra Supabase
  const validateCode = async (code) => {
    console.log('Código ingresado:', code);
    console.log('Código normalizado:', code.trim().toUpperCase());

    if (!supabase) {
      console.log('ERROR: supabase es null — variables de entorno no cargadas');
      return { valid: false, message: 'Sistema de invitaciones no disponible' };
    }
    try {
      const { data, error } = await supabase
        .from('invitation_codes')
        .select('*')
        .eq('code', code.trim().toUpperCase())
        .eq('used', false)
        .single();

      console.log('Respuesta Supabase data:', data);
      console.log('Respuesta Supabase error:', error);

      if (error || !data) {
        return { valid: false, message: 'Código inválido o ya utilizado' };
      }

      return { valid: true, data };
    } catch (err) {
      console.log('Excepción en validateCode:', err);
      return { valid: false, message: 'Error al validar el código' };
    }
  };

  // Marcar código como usado en Supabase
  const markCodeAsUsed = async (code, userEmail) => {
    if (!supabase) return;
    await supabase
      .from('invitation_codes')
      .update({
        used: true,
        used_by: userEmail,
        used_at: new Date().toISOString(),
      })
      .eq('code', code.trim().toUpperCase());
  };

  // Construye el documento de perfil del usuario
  function buildUserDoc(uid, userEmail, codeData) {
    return {
      uid,
      email: userEmail,
      createdAt: serverTimestamp(),
      active: true,
      supervisorAccess: codeData?.is_supervisor || false,
      profileCompleted: false,
      name: '',
      lastName: '',
      country: '',
      profession: '',
      university: '',
      avatarColor: '#0552a0',
    };
  }

  // Crea perfil en Firestore + marca código usado. Mensajes claros si falla cualquiera.
  async function finishRegistration(uid, userEmail, codeData, code) {
    try {
      await setDoc(doc(db, 'users', uid), buildUserDoc(uid, userEmail, codeData));
    } catch (err) {
      throw new Error(
        'No se pudo guardar tu perfil (permisos insuficientes en Firestore). ' +
        'Avísale al administrador para que actualice las reglas de seguridad. ' +
        'Detalle: ' + (err?.message || err)
      );
    }
    try {
      await markCodeAsUsed(code, userEmail);
    } catch (err) {
      // No es bloqueante: el usuario ya quedó registrado. Lo logueamos.
      console.warn('Aviso: perfil creado pero no se pudo marcar el código como usado:', err);
    }
  }

  // Registrar usuario
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode  = invitationCode.trim().toUpperCase();

    if (!cleanEmail || !password || !cleanCode) {
      setError('Completa todos los campos');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // 1. Validar código contra Supabase
    const codeValidation = await validateCode(cleanCode);
    if (!codeValidation.valid) {
      setError(codeValidation.message);
      return;
    }

    // 2. Crear usuario en Firebase Auth
    let uid;
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      uid = userCredential.user.uid;
    } catch (err) {
      // Caso especial: la cuenta ya existe en Firebase Auth pero el registro
      // anterior se rompió (perfil de Firestore nunca se creó por reglas).
      // Intentamos recuperar: iniciar sesión con la contraseña y completar el setup.
      if (err?.code === 'auth/email-already-in-use') {
        try {
          const recCred = await signInWithEmailAndPassword(auth, cleanEmail, password);
          const recUid  = recCred.user.uid;
          // ¿Ya tiene perfil completo?
          const snap = await getDoc(doc(db, 'users', recUid));
          if (snap.exists()) {
            await signOut(auth);
            setError('Este email ya está completamente registrado. Inicia sesión normalmente.');
            return;
          }
          // No tiene perfil → completamos el registro pendiente
          await finishRegistration(recUid, cleanEmail, codeValidation.data, cleanCode);
          await signOut(auth);
          setSuccess('¡Registro completado! Ya puedes iniciar sesión.');
          setEmail(''); setPassword(''); setInvitationCode('');
          setIsRegistering(false);
          return;
        } catch (recErr) {
          // El password no coincide con la cuenta existente
          if (recErr?.code === 'auth/wrong-password' || recErr?.code === 'auth/invalid-credential') {
            setError('Este email ya está registrado con otra contraseña. Inicia sesión o recupera tu contraseña.');
          } else {
            setError(friendlyAuthError(recErr));
          }
          return;
        }
      }
      setError(friendlyAuthError(err));
      return;
    }

    // 3 + 4: Guardar perfil en Firestore y marcar código usado
    try {
      await finishRegistration(uid, cleanEmail, codeValidation.data, cleanCode);
    } catch (err) {
      setError(err.message);
      return;
    }

    // Cerramos sesión: queremos que entren con su contraseña explícitamente
    try { await signOut(auth); } catch { /* noop */ }

    setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
    setEmail('');
    setPassword('');
    setInvitationCode('');
    setIsRegistering(false);
  };

  // Login básico
  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password) {
      setError('Ingresa email y contraseña');
      return;
    }

    try {
      const credential = await signInWithEmailAndPassword(auth, email.trim().toLowerCase(), password);
      const uid = credential.user.uid;

      // Verificar si la cuenta está activa en Firestore
      try {
        const userSnap = await getDoc(doc(db, 'users', uid));
        if (userSnap.exists() && userSnap.data()?.active === false) {
          await signOut(auth);
          setError('Tu cuenta ha sido desactivada. Contacta al administrador para más información.');
          return;
        }
      } catch {
        // Si no se puede leer Firestore, dejar pasar (fail open)
      }

      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(friendlyAuthError(err));
    }
  };

  return (
    <section className="login-page">
      <div className="login-card">
        <h2>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h2>

        {error && <div className="login-error">{error}</div>}
        {success && <div className="login-success">{success}</div>}

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Contraseña</label>
            <input
              id="password"
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={isRegistering ? 'new-password' : 'current-password'}
            />
          </div>

          {isRegistering && (
            <div className="form-group">
              <label htmlFor="invitationCode">Código de invitación</label>
              <input
                id="invitationCode"
                type="text"
                placeholder="Código de invitación"
                value={invitationCode}
                onChange={(e) => setInvitationCode(e.target.value.toUpperCase())}
              />
            </div>
          )}

          <button type="submit" className="login-btn">
            {isRegistering ? 'Registrarse' : 'Ingresar'}
          </button>
        </form>

        <p className="login-footer">
          {isRegistering ? '¿Ya tienes cuenta? ' : '¿No tienes cuenta? '}
          <button
            type="button"
            className="link-btn"
            onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
          >
            {isRegistering ? 'Inicia sesión' : 'Regístrate'}
          </button>
        </p>
      </div>
    </section>
  );
}
