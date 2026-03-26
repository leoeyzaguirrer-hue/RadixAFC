import { useState } from 'react'
import Header from './components/Header'
import Footer from './components/Footer'
import Navigation from './components/Navigation'
import Landing from './pages/Landing'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Modulos from './pages/Modulos'
import NotFound from './pages/NotFound'

function App() {
  const [currentPage, setCurrentPage] = useState('landing')

  const navigate = (page) => setCurrentPage(page)

  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <Landing navigate={navigate} />
      case 'login':
        return <Login />
      case 'dashboard':
        return <Dashboard navigate={navigate} />
      case 'modulos':
        return <Modulos navigate={navigate} />
      default:
        return <NotFound navigate={navigate} />
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
