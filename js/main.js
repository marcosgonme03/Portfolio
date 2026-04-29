/**
 * PORTFOLIO — MARCOS GONZÁLEZ MESA
 * main.js — Animaciones, Canvas de ondas, Scroll reveal, Interacciones
 */

/* ============================================================
   1. CANVAS — ONDAS FLUIDAS ORGÁNICAS
   Técnica: múltiples curvas Bézier animadas con sin/cos
   Rendimiento: requestAnimationFrame + baja opacidad
============================================================ */
(function initCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Reducir si el usuario prefiere movimiento reducido
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    canvas.style.display = 'none';
    return;
  }

  let width, height, animId;

  // Definición de ondas — cada una tiene parámetros únicos
  // para que el movimiento se sienta orgánico y no mecánico
  const waves = [
    {
      // Onda naranja principal — lenta y profunda
      color: 'rgba(255, 106, 0, 0.18)',
      amplitude: 0.18,   // fracción de height
      frequency: 0.0012,
      speed: 0.00018,
      phase: 0,
      yOffset: 0.48,
      thickness: 2.5,
    },
    {
      // Onda naranja media — más rápida, más delgada
      color: 'rgba(255, 140, 0, 0.10)',
      amplitude: 0.12,
      frequency: 0.0018,
      speed: 0.00025,
      phase: Math.PI * 0.7,
      yOffset: 0.52,
      thickness: 1.5,
    },
    {
      // Onda sutil blancuzca — muy traslúcida
      color: 'rgba(255, 255, 255, 0.04)',
      amplitude: 0.09,
      frequency: 0.0010,
      speed: 0.00012,
      phase: Math.PI * 1.3,
      yOffset: 0.44,
      thickness: 1,
    },
    {
      // Onda de relleno naranja tenue — parte inferior
      color: 'rgba(255, 80, 0, 0.07)',
      amplitude: 0.22,
      frequency: 0.0008,
      speed: 0.00008,
      phase: Math.PI * 0.4,
      yOffset: 0.65,
      thickness: 1.5,
    },
  ];

  function resize() {
    width  = canvas.width  = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  /**
   * Dibuja una onda con relleno hacia el borde inferior del canvas.
   * Esto crea la sensación de "forma orgánica fluida" en lugar de
   * una simple línea.
   */
  function drawWave(wave, time) {
    const pts = [];
    const step = 4; // píxeles por punto — menor = más suave, más costoso

    for (let x = 0; x <= width; x += step) {
      // Combinación de dos senoides con frecuencias ligeramente distintas
      // para romper la periodicidad perfecta y lograr movimiento orgánico
      const y =
        height * wave.yOffset +
        Math.sin(x * wave.frequency + time * wave.speed + wave.phase) *
          height * wave.amplitude * 0.6 +
        Math.sin(x * wave.frequency * 1.7 + time * wave.speed * 1.3 + wave.phase * 0.5) *
          height * wave.amplitude * 0.4;
      pts.push({ x, y });
    }

    ctx.beginPath();
    ctx.moveTo(0, height);
    ctx.lineTo(pts[0].x, pts[0].y);

    // Curvas suaves tipo cardinal spline para evitar quiebres visuales
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }

    ctx.lineTo(width, height);
    ctx.closePath();

    // Relleno con gradiente vertical — naranja → transparente
    const grad = ctx.createLinearGradient(0, 0, 0, height);
    grad.addColorStop(0, wave.color);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fill();

    // Borde de la onda — línea más brillante
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length - 1; i++) {
      const midX = (pts[i].x + pts[i + 1].x) / 2;
      const midY = (pts[i].y + pts[i + 1].y) / 2;
      ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
    }
    ctx.strokeStyle = wave.color.replace(/[\d.]+\)$/, (wave.thickness * 0.4) + ')');
    ctx.lineWidth = wave.thickness;
    ctx.stroke();
  }

  let lastTime = 0;

  function render(timestamp) {
    // Throttle a ~60fps máximo — no hace falta más
    if (timestamp - lastTime < 16) {
      animId = requestAnimationFrame(render);
      return;
    }
    lastTime = timestamp;

    ctx.clearRect(0, 0, width, height);

    // Dibuja ondas de fondo a delantera
    waves.forEach(wave => drawWave(wave, timestamp));

    animId = requestAnimationFrame(render);
  }

  // Pausa la animación si el tab no está visible (rendimiento)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      animId = requestAnimationFrame(render);
    }
  });

  const ro = new ResizeObserver(() => {
    resize();
  });
  ro.observe(canvas.parentElement);

  resize();
  animId = requestAnimationFrame(render);
})();

/* ============================================================
   2. NAVBAR — Solid on scroll + active link tracking
============================================================ */
(function initNavbar() {
  const navbar  = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!navbar) return;

  // Solid background cuando se supera el 80% de la pantalla
  const onScroll = () => {
    if (window.scrollY > 80) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }

    // Active link tracking con Intersection Observer (ver sección 4)
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();

/* ============================================================
   3. MOBILE MENU
============================================================ */
(function initMobileMenu() {
  const burger = document.getElementById('navBurger');
  const menu   = document.getElementById('mobileMenu');
  const links  = document.querySelectorAll('.mobile-link');

  if (!burger || !menu) return;

  function open() {
    burger.classList.add('open');
    menu.classList.add('open');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function close() {
    burger.classList.remove('open');
    menu.classList.remove('open');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', () => {
    burger.classList.contains('open') ? close() : open();
  });

  // Cerrar al clicar un link
  links.forEach(link => link.addEventListener('click', close));

  // Cerrar con Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();

/* ============================================================
   4. SCROLL REVEAL — Intersection Observer
   Clase .reveal → .reveal.visible cuando el elemento entra
   en el viewport, respetando el delay CSS por --delay
============================================================ */
(function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal');
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Dejar de observar una vez revelado — mejor rendimiento
          observer.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.1,     // 10% visible para disparar
      rootMargin: '0px 0px -40px 0px', // Pequeño margen inferior
    }
  );

  elements.forEach(el => observer.observe(el));
})();

/* ============================================================
   5. ACTIVE NAVBAR LINK — IntersectionObserver por sección
============================================================ */
(function initActiveLinks() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  if (!sections.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const id = entry.target.getAttribute('id');
          navLinks.forEach(link => {
            link.classList.toggle(
              'active',
              link.getAttribute('href') === `#${id}`
            );
          });
        }
      });
    },
    { threshold: 0.4 }
  );

  sections.forEach(s => observer.observe(s));
})();

/* ============================================================
   6. COUNTER ANIMATION — Stats bar
   Anima los números desde 0 al valor final (data-target)
   cuando entran en viewport
============================================================ */
(function initCounters() {
  const counters = document.querySelectorAll('.stat-number[data-target]');
  if (!counters.length) return;

  // Respeta prefers-reduced-motion
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const duration = 1800; // ms
    const start    = performance.now();

    if (reduced) {
      el.textContent = target;
      return;
    }

    function update(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.round(eased * target);
      if (progress < 1) requestAnimationFrame(update);
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();

/* ============================================================
   7. CONTACT FORM — Envío real al backend Node.js/Express
   - En desarrollo (localhost / 127.0.0.1 / file://) → localhost:3001
   - En producción → BACKEND_URL (cambia esta variable cuando despliegues)
============================================================ */
(function initContactForm() {
  const form      = document.getElementById('contactForm');
  const statusEl  = document.getElementById('formStatus');
  const submitBtn = document.getElementById('submitBtn');

  // ⚠️  CAMBIA ESTA URL cuando despliegues el backend (ej. en Render o Railway)
  // Ejemplo: 'https://portfolio-marcos-backend.onrender.com/api/contact'
  const PROD_BACKEND = 'https://TU-BACKEND-DESPLEGADO.onrender.com/api/contact';
  const DEV_BACKEND  = 'http://localhost:3001/api/contact';

  const isLocal = ['localhost', '127.0.0.1', ''].includes(window.location.hostname);
  const API_URL = isLocal ? DEV_BACKEND : PROD_BACKEND;

  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const message = form.message.value.trim();

    // Validación en cliente antes de enviar
    if (!name || !email || !message) {
      setStatus('Por favor, rellena todos los campos.', 'error');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setStatus('Introduce un email válido.', 'error');
      return;
    }

    // Estado de carga
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span style="opacity:.6">Enviando...</span>';
    setStatus('', '');

    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus('¡Mensaje enviado! Te responderé pronto.', 'success');
        form.reset();
      } else {
        // El servidor devolvió un error controlado
        setStatus(data.error || 'Algo salió mal. Inténtalo de nuevo.', 'error');
      }
    } catch {
      // Error de red — backend no disponible
      setStatus('No se pudo conectar con el servidor. Escríbeme directamente a marcosgonme03@gmail.com', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = 'Enviar mensaje <span aria-hidden="true">→</span>';
    }
  });

  function setStatus(msg, type) {
    statusEl.textContent = msg;
    statusEl.className   = 'form-status' + (type ? ` ${type}` : '');
  }
})();

/* ============================================================
   7.B PROJECT LINKS — Lee data-repo / data-demo y los aplica
   Si data-demo está vacío, oculta el botón "Ver demo" (más limpio
   que dejar un enlace roto). Si data-repo está vacío, oculta el
   botón "Código".
============================================================ */
(function initProjectLinks() {
  const cards = document.querySelectorAll('.project-card');
  if (!cards.length) return;

  cards.forEach(card => {
    const repo = card.dataset.repo?.trim();
    const demo = card.dataset.demo?.trim();

    const repoBtn = card.querySelector('[data-action="repo"]');
    const demoBtn = card.querySelector('[data-action="demo"]');

    // Configura botón "Código"
    if (repoBtn) {
      if (repo) {
        repoBtn.href = repo;
      } else {
        repoBtn.hidden = true;
      }
    }

    // Configura botón "Ver demo"
    if (demoBtn) {
      if (demo) {
        demoBtn.href = demo;
      } else {
        demoBtn.hidden = true;
      }
    }

    // Si la card no tiene NI repo NI demo, marca "próximamente"
    if (!repo && !demo) {
      const actions = card.querySelector('.card-actions');
      if (actions) {
        const soon = document.createElement('span');
        soon.className = 'card-soon';
        soon.textContent = 'Próximamente';
        actions.appendChild(soon);
      }
    }
  });
})();

/* ============================================================
   8. SMOOTH SCROLL FALLBACK
   Para navegadores que no soportan scroll-behavior nativo
============================================================ */
(function initSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]');

  // Si el navegador soporta scroll-behavior CSS, no hacemos nada
  if (CSS.supports('scroll-behavior', 'smooth')) return;

  links.forEach(link => {
    link.addEventListener('click', (e) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
