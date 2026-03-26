import { useState, lazy, Suspense } from 'react'
import Footer from './components/Footer'
import Navigation from './components/Navigation'
import Landing from './pages/Landing'

const Login = lazy(() => import('./pages/Login'))
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Modulos = lazy(() => import('./pages/Modulos'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  const navigate = (page) => setCurrentPage(page)

  /* ── Landing: layout 100 % independiente, sin contenedor #root ── */
  if (currentPage === 'landing') {
    return <Landing navigate={navigate} />
  }

  /* ── Resto de páginas: layout normal con nav + footer ── */
  const renderPage = () => {
    switch (currentPage) {
      case 'login':
        return <Suspense fallback={null}><Login /></Suspense>
      case 'dashboard':
        return <Suspense fallback={null}><Dashboard navigate={navigate} /></Suspense>
      case 'modulos':
        return <Suspense fallback={null}><Modulos navigate={navigate} /></Suspense>
      default:
        return <Suspense fallback={null}><NotFound navigate={navigate} /></Suspense>
    }
  }

  return (
    <>
      <Navigation currentPage={currentPage} navigate={navigate} />
      <main>{renderPage()}</main>
      <Footer />
    </>
  )
}

export default App
