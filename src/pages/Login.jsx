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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!email || !password || !invitationCode) {
      setError('Completa todos los campos');
      return;
    }

    try {
      const codeValidation = await validateCode(invitationCode);
      if (!codeValidation.valid) {
        setError(codeValidation.message);
        return;
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const uid = userCredential.user.uid;

      await setDoc(doc(db, 'users', uid), {
        email: email,
        createdAt: serverTimestamp(),
        estado: 'activo'
      });

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
    <div style={{ padding: '40px', maxWidth: '500px', margin: '0 auto' }}>
      <h2>{isRegistering ? 'Registrarse' : 'Iniciar Sesión'}</h2>

      {error && <div style={{ color: 'red', marginBottom: '20px', padding: '10px', backgroundColor: '#ffe0e0' }}>{error}</div>}
      {success && <div style={{ color: 'green', marginBottom: '20px', padding: '10px', backgroundColor: '#e0ffe0' }}>{success}</div>}

      <form onSubmit={isRegistering ? handleRegister : handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
        />

        {isRegistering && (
          <input
            type="text"
            placeholder="Código de invitación"
            value={invitationCode}
            onChange={(e) => setInvitationCode(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', boxSizing: 'border-box' }}
          />
        )}

        <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer', fontSize: '16px' }}>
          {isRegistering ? 'Registrarse' : 'Iniciar Sesión'}
        </button>
      </form>

      <p style={{ marginTop: '20px', textAlign: 'center' }}>
        {isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
        <span
          onClick={() => { setIsRegistering(!isRegistering); setError(''); setSuccess(''); }}
          style={{ color: '#4CAF50', cursor: 'pointer', textDecoration: 'underline' }}
        >
          {isRegistering ? 'Iniciar Sesión' : 'Registrarse'}
        </span>
      </p>
    </div>
  );
}
