import { useEffect, useRef, useCallback } from 'react'
import './Landing.css'

/* ─── SVG Icons ─── */
const ArrowRight = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
)

const ArrowDown = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <polyline points="19 12 12 19 5 12" />
  </svg>
)

const BookIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
  </svg>
)

/* ─── Data ─── */
const FASES = [
  {
    number: '01',
    name: 'Fundamentos de la Conducta',
    tagline: 'Antes de analizar, aprende a observar. Filosofía, historia y conceptos base del conductismo radical.',
    modules: '4 módulos',
  },
  {
    number: '02',
    name: 'Procesos de Condicionamiento',
    tagline: 'Clásico, operante y las leyes que gobiernan el cambio conductual. La mecánica del aprendizaje.',
    modules: '4 módulos',
  },
  {
    number: '03',
    name: 'Análisis Funcional Básico',
    tagline: 'De la observación al esquema funcional. Aprende a identificar contingencias en casos reales.',
    modules: '3 módulos',
  },
  {
    number: '04',
    name: 'Análisis Funcional Avanzado',
    tagline: 'Formulación de casos complejos, cadenas conductuales y planificación de intervención contextual.',
    modules: '3 módulos',
  },
]

const STATS = [
  { count: 14, label: 'Módulos' },
  { count: 200, label: 'Ejercicios clínicos' },
  { count: 46, label: 'Casos de pacientes' },
]

/* ─── Counter animation helper ─── */
function animateCounter(el, target) {
  const duration = 1500
  const start = performance.now()

  function update(now) {
    const elapsed = now - start
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3)
    const current = Math.floor(eased * target)
    el.textContent = current + (target >= 100 ? '+' : '')
    if (progress < 1) requestAnimationFrame(update)
  }

  requestAnimationFrame(update)
}

/* ─── Landing Page Component ─── */
export default function Landing({ navigate }) {
  const heroRef = useRef(null)
  const spheresRef = useRef([])
  const scrollProgressRef = useRef(null)
  const navbarRef = useRef(null)
  const animatedCounters = useRef(new Set())

  const scrollTo = useCallback((id) => {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth' })
  }, [])

  /* ── Scroll: navbar bg + progress bar ── */
  useEffect(() => {
    const onScroll = () => {
      const nav = navbarRef.current
      const progress = scrollProgressRef.current
      if (!nav || !progress) return

      if (window.scrollY > 60) {
        nav.classList.add('scrolled')
      } else {
        nav.classList.remove('scrolled')
      }

      const total = document.documentElement.scrollHeight - window.innerHeight
      const ratio = total > 0 ? window.scrollY / total : 0
      progress.style.transform = `scaleX(${ratio})`
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  /* ── ERC diagram entrance animation ── */
  useEffect(() => {
    const timer = setTimeout(() => {
      document.querySelectorAll('.erc-node, .erc-arrow').forEach((el) => {
        el.classList.add('animate')
      })
    }, 800)
    return () => clearTimeout(timer)
  }, [])

  /* ── Intersection Observer for scroll animations + counters ── */
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')

            const counter = entry.target.querySelector('.stat-number[data-count]')
            if (counter && !animatedCounters.current.has(counter)) {
              animatedCounters.current.add(counter)
              animateCounter(counter, parseInt(counter.dataset.count, 10))
            }
          }
        })
      },
      { rootMargin: '0px 0px -80px 0px', threshold: 0.1 }
    )

    document.querySelectorAll('[data-animate]').forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [])

  /* ── Parallax: spheres follow mouse ── */
  useEffect(() => {
    const hero = heroRef.current
    if (!hero) return

    const onMove = (e) => {
      const rect = hero.getBoundingClientRect()
      const x = (e.clientX - rect.left) / rect.width - 0.5
      const y = (e.clientY - rect.top) / rect.height - 0.5

      spheresRef.current.forEach((sphere, i) => {
        if (!sphere) return
        const speed = (i + 1) * 8
        sphere.style.transform = `translate(${x * speed * -1}px, ${y * speed * -1}px)`
      })
    }

    const onLeave = () => {
      spheresRef.current.forEach((sphere) => {
        if (!sphere) return
        sphere.style.transition = 'transform 0.8s ease'
        sphere.style.transform = 'translate(0, 0)'
        setTimeout(() => { if (sphere) sphere.style.transition = '' }, 800)
      })
    }

    hero.addEventListener('mousemove', onMove)
    hero.addEventListener('mouseleave', onLeave)
    return () => {
      hero.removeEventListener('mousemove', onMove)
      hero.removeEventListener('mouseleave', onLeave)
    }
  }, [])

  return (
    <div className="landing-root">
      {/* Scroll progress bar */}
      <div className="scroll-progress" ref={scrollProgressRef} />

      {/* ═══ NAVBAR ═══ */}
      <nav className="landing-navbar" ref={navbarRef}>
        <a className="nav-logo" onClick={() => scrollTo('hero')}>
          <div className="nav-logo-icon">Af</div>
          <div className="nav-logo-text">AFC <span>Praxis</span></div>
        </a>
        <ul className="nav-links">
          <li><a onClick={() => scrollTo('fases')}>Programa</a></li>
          <li><a onClick={() => scrollTo('fases')}>Método</a></li>
          <li><a onClick={() => scrollTo('acceder')}>Contacto</a></li>
          <li><a className="nav-btn" onClick={() => navigate('login')}>Acceder</a></li>
        </ul>
      </nav>

      {/* ═══ SECTION 1: HERO ═══ */}
      <section className="landing-hero" id="hero" ref={heroRef}>
        {/* Floating spheres */}
        <div className="sphere sphere-1" ref={(el) => (spheresRef.current[0] = el)} />
        <div className="sphere sphere-2" ref={(el) => (spheresRef.current[1] = el)} />
        <div className="sphere sphere-3" ref={(el) => (spheresRef.current[2] = el)} />
        <div className="sphere sphere-4" ref={(el) => (spheresRef.current[3] = el)} />

        <div className="hero-content">
          {/* Left: Text */}
          <div className="hero-text">
            <div className="hero-tag">Plataforma de entrenamiento clínico</div>
            <h1 className="hero-title">
              ¿Puedes leer lo que<br />
              la <span className="highlight">conducta</span><br />
              está diciendo?
            </h1>
            <p className="hero-subtitle">
              Domina el análisis funcional desde sus fundamentos filosóficos
              hasta la práctica clínica avanzada. Un sistema progresivo diseñado
              para terapeutas contextuales.
            </p>
            <div className="hero-actions">
              <button className="btn-primary" onClick={() => scrollTo('acceder')}>
                Comenzar ahora
                <ArrowRight />
              </button>
              <button className="btn-secondary" onClick={() => scrollTo('fases')}>
                Ver programa
              </button>
            </div>
          </div>

          {/* Right: E→R→C Diagram */}
          <div className="hero-diagram">
            <div className="erc-diagram">
              <div className="diagram-glow" />

              {/* Node: Estímulo */}
              <div className="erc-node estim">
                <div className="erc-icon">E</div>
                <div className="erc-label">Estímulo</div>
                <div className="erc-sublabel">Antecedente contextual</div>
              </div>

              {/* Arrow 1 */}
              <div className="erc-arrow">
                <ArrowDown />
              </div>

              {/* Node: Respuesta */}
              <div className="erc-node resp">
                <div className="erc-icon">R</div>
                <div className="erc-label">Respuesta</div>
                <div className="erc-sublabel">Conducta del organismo</div>
              </div>

              {/* Arrow 2 */}
              <div className="erc-arrow">
                <ArrowDown />
              </div>

              {/* Node: Consecuencia */}
              <div className="erc-node cons">
                <div className="erc-icon">C</div>
                <div className="erc-label">Consecuencia</div>
                <div className="erc-sublabel">Función de la conducta</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 2: FASES ═══ */}
      <section className="landing-fases" id="fases">
        <div className="section-header">
          <div className="section-tag" data-animate="">Itinerario formativo</div>
          <h2 className="section-title" data-animate="">
            4 fases hacia el dominio<br />del análisis funcional
          </h2>
          <p className="section-desc" data-animate="">
            Cada fase construye sobre la anterior. Desde comprender qué es conducta
            hasta formular casos clínicos complejos con precisión funcional.
          </p>
        </div>

        <div className="fases-grid">
          {FASES.map((fase) => (
            <div className="fase-card" data-animate="" key={fase.number}>
              <div className="fase-number">{fase.number}</div>
              <div className="fase-name">{fase.name}</div>
              <div className="fase-tagline">{fase.tagline}</div>
              <div className="fase-modules">
                <BookIcon />
                {fase.modules}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ SECTION 3: CTA ═══ */}
      <section className="landing-cta" id="acceder">
        <div className="cta-content">
          <h2 className="cta-title" data-animate="">
            Tu formación en análisis<br />funcional <span className="highlight">comienza aquí</span>
          </h2>
          <p className="cta-desc" data-animate="">
            Accede a 14 módulos, más de 200 ejercicios clínicos y casos
            reales de pacientes. Ingresa con tu código de invitación.
          </p>
          <form
            className="cta-form"
            data-animate=""
            onSubmit={(e) => { e.preventDefault(); navigate('login') }}
          >
            <input
              type="text"
              className="cta-input"
              placeholder="Código de invitación"
            />
            <button type="submit" className="cta-submit">Acceder</button>
          </form>
          <p className="cta-note" data-animate="">
            ¿No tienes código? Contacta a tu supervisor o institución.
          </p>

          <div className="stats-row">
            {STATS.map((stat) => (
              <div className="stat-item" data-animate="" key={stat.label}>
                <div className="stat-number" data-count={stat.count}>0</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ FOOTER ═══ */}
      <footer className="landing-footer">
        <p>&copy; 2026 AFC Praxis — Análisis Funcional de la Conducta. Todos los derechos reservados.</p>
      </footer>
    </div>
  )
}
