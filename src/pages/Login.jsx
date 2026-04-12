import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';
import { signOut } from 'firebase/auth';
import { supabase } from '../config/supabase';

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

  // Registrar usuario
  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !invitationCode) {
      setError('Completa todos los campos');
      return;
    }

    try {
      // 1. Validar código contra Supabase
      const codeValidation = await validateCode(invitationCode);
      if (!codeValidation.valid) {
        setError(codeValidation.message);
        return;
      }

      // 2. Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // 3. Guardar usuario en Firestore colección "users" con estructura completa
      await setDoc(doc(db, 'users', uid), {
        uid,
        email,
        createdAt: serverTimestamp(),
        active: true,
        supervisorAccess: false,
        profileCompleted: false,
        name: '',
        lastName: '',
        country: '',
        profession: '',
        university: '',
        avatarColor: '#0552a0',
      });

      // 4. Marcar código como usado en Supabase
      await markCodeAsUsed(invitationCode, email);

      setSuccess('¡Registro exitoso! Ya puedes iniciar sesión.');
      setEmail('');
      setPassword('');
      setInvitationCode('');
      setIsRegistering(false);
    } catch (err) {
      setError('Error: ' + err.message);
    }
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
      const credential = await signInWithEmailAndPassword(auth, email, password);
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

      navigate('/dashboard');
    } catch (err) {
      setError('Email o contraseña incorrectos');
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
