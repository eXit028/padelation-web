// =============================================
// CARGADOR DE COMPONENTES
// =============================================

async function loadComponent(selector, url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`No se pudo cargar ${url}`);
    const html = await response.text();
    document.querySelector(selector).innerHTML = html;
  } catch (error) {
    console.error('Error cargando componente:', error);
  }
}

async function loadComponents() {
  // Detecta si estamos en una subpágina (pages/) o en la raíz
  const base = window.location.pathname.includes('/pages/') ? '../' : '';

  await loadComponent('#nav-placeholder', `${base}components/nav.html`);
  await loadComponent('#footer-placeholder', `${base}components/footer.html`);

  // Re-inicializar tras cargar los componentes
  fixNavLinks();
  highlightActiveLink();
  initSmoothScroll();
  initNavScroll();
}

// =============================================
// CORRECCIÓN DE RUTAS DE LA NAV
// =============================================

function fixNavLinks() {
  const base = window.location.pathname.includes('/pages/') ? '../' : '';
  const navLinks = document.querySelectorAll('#nav-placeholder a');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    // Solo tocar links relativos, no externos ni anclas puras
    if (href && !href.startsWith('http') && !href.startsWith('#')) {
      const cleanHref = href.startsWith('/') ? href.slice(1) : href;
      link.setAttribute('href', `${base}${cleanHref}`);
    }
  });
}

// =============================================
// ENLACE ACTIVO EN LA NAV
// =============================================

function highlightActiveLink() {
  const currentPath = window.location.pathname;
  const navLinks = document.querySelectorAll('.nav-links a');

  navLinks.forEach(link => {
    const linkPath = new URL(link.href).pathname;
    if (linkPath === currentPath) {
      link.classList.add('active');
    }
  });
}

// =============================================
// SCROLL SUAVE (con offset por la nav fija)
// =============================================

function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 68;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });
}

// =============================================
// NAV: cambio de fondo al hacer scroll
// =============================================

function initNavScroll() {
  const nav = document.querySelector('nav');
  if (!nav) return;

  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? 'rgba(13,43,26,0.98)'
      : 'rgba(13,43,26,0.95)';
  });
}

// =============================================
// FORMULARIO DE CONTACTO
// =============================================

function initContactForm() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    const nombre  = document.getElementById('nombre')?.value || '';
    const email   = document.getElementById('email')?.value || '';
    const asunto  = document.getElementById('asunto')?.value || 'Consulta desde la web';
    const mensaje = document.getElementById('mensaje')?.value || '';
    const mailto  = `mailto:contacto@padelation.es?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`)}`;
    window.location.href = mailto;
  });
}

// =============================================
// INIT
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initContactForm();
});
