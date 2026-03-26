import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/landing.css';
export default function Landing({ navigate }) {
  const [scrollY, setScrollY] = useState(0);
  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  return (
    <div className="landing">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo-section">
            <div className="logo-mark">◆</div>
            <span className="logo-text">AFC Praxis</span>
          </div>
          <div className="nav-links">
            <button onClick={() => navigate('login')} className="nav-login">Ingresa</button>
            <button onClick={() => navigate('login')} className="nav-signup">Regístrate</button>
          </div>
        </div>
      </nav>
      {/* Hero Section */}
      <section className="hero" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
        <div className="hero-content">
          <h1 className="hero-title">
            Conviértete en Terapeuta Experto
            <span className="hero-accent">mediante Análisis Funcional</span>
          </h1>
          <p className="hero-subtitle">
            Entrena tus habilidades clínicas en un entorno seguro antes de pasar a la práctica real. Domina los fundamentos del análisis funcional de la conducta con ejercicios progresivos y casos reales.
          </p>
          <div className="hero-cta">
            <button onClick={() => navigate('login')} className="btn-primary">Comienza Ahora</button>
            <button onClick={() => navigate('login')} className="btn-secondary">Explorar Módulos</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card card-1">
            <div className="card-icon">◇</div>
            <p>Fundamentos</p>
          </div>
          <div className="floating-card card-2">
            <div className="card-icon">◆</div>
            <p>Práctica</p>
          </div>
          <div className="floating-card card-3">
            <div className="card-icon">◊</div>
            <p>Clínica</p>
          </div>
        </div>
      </section>
      {/* Features */}
      <section className="features">
        <h2>¿Por qué AFC Praxis?</h2>
        <div className="features-grid">
          <div className="feature-card feature-1">
            <div className="feature-icon">📚</div>
            <h3>Contenido Sistemático</h3>
            <p>Aprende de forma progresiva, desde conceptos básicos hasta análisis funcionales avanzados. Cada módulo construye sobre el anterior.</p>
          </div>
          <div className="feature-card feature-2">
            <div className="feature-icon">🎯</div>
            <h3>Ejercicios Interactivos</h3>
            <p>Resuelve casos reales y obtén feedback inmediato. Desarrolla las habilidades necesarias para la práctica clínica.</p>
          </div>
          <div className="feature-card feature-3">
            <div className="feature-icon">👥</div>
            <h3>Supervisa tu Progreso</h3>
            <p>Seguimiento detallado de tu desempeño. Identifica fortalezas y áreas de mejora en cada competencia.</p>
          </div>
        </div>
      </section>
      {/* Stats */}
      <section className="stats">
        <div className="stat">
          <h3>12+</h3>
          <p>Módulos educativos</p>
        </div>
        <div className="stat">
          <h3>400+</h3>
          <p>Ejercicios prácticos</p>
        </div>
        <div className="stat">
          <h3>50+</h3>
          <p>Casos clínicos</p>
        </div>
      </section>
      {/* CTA Section */}
      <section className="cta-section">
        <h2>Listo para Entrenar?</h2>
        <p>Acceso inmediato a todos los módulos. Aprende a tu ritmo.</p>
        <button onClick={() => navigate('login')} className="btn-large">Crear Cuenta Ahora</button>
      </section>
      {/* Footer */}
      <footer className="landing-footer">
        <p>© 2026 AFC Praxis | Plataforma de formación en análisis funcional de la conducta</p>
      </footer>
    </div>
  );
}
