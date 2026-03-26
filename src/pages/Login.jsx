import { useState } from 'react';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, query, where, getDocs, updateDoc, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebaseConfig';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [invitationCode, setInvitationCode] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isRegistering, setIsRegistering] = useState(false);

  // Buscar código en Firestore
  const validateCode = async (code) => {
    try {
      const codesRef = collection(db, 'invitationCodes');
      const q = query(codesRef, where('code', '==', code.toUpperCase()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return { valid: false, message: 'Código inválido' };
      }

      const docData = querySnapshot.docs[0];
      if (docData.data().usado) {
        return { valid: false, message: 'Código ya fue usado' };
      }

      return { valid: true, docId: docData.id };
    } catch (err) {
      return { valid: false, message: 'Error: ' + err.message };
    }
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
      // Validar código
      const codeValidation = await validateCode(invitationCode);
      if (!codeValidation.valid) {
        setError(codeValidation.message);
        return;
      }

      // Crear usuario en Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      // Guardar en colección users
      await setDoc(doc(db, 'users', uid), {
        email: email,
        createdAt: serverTimestamp(),
        estado: 'activo'
      });

      // Marcar código como usado
      await updateDoc(doc(db, 'invitationCodes', codeValidation.docId), {
        usado: true,
        usadoPor: uid
      });

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
      await signInWithEmailAndPassword(auth, email, password);
      setSuccess('¡Bienvenido!');
      setEmail('');
      setPassword('');
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
