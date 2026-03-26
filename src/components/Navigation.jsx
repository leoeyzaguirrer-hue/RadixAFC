export default function Navigation({ currentPage, navigate }) {
  return (
    <nav>
      <button onClick={() => navigate('landing')}>Inicio</button>
      <button onClick={() => navigate('login')}>Login</button>
      <button onClick={() => navigate('dashboard')}>Dashboard</button>
      <button onClick={() => navigate('modulos')}>Módulos</button>
    </nav>
  )
}
