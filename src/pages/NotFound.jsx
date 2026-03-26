export default function NotFound({ navigate }) {
  return (
    <section>
      <h2>404 - Página no encontrada</h2>
      <button onClick={() => navigate('landing')}>Volver al inicio</button>
    </section>
  )
}
