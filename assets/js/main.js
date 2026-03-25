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

  // Fix ruta del logo según si estamos en raíz o pages/
  const logoImg = document.querySelector('#nav-placeholder .nav-logo-img');
  if (logoImg) logoImg.src = `${base}assets/images/logo/logo_web.png`;
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

  const baseColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--accent-dark').trim();

  window.addEventListener('scroll', () => {
    nav.style.background = window.scrollY > 40
      ? `${baseColor}f7`
      : baseColor;
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
// SLIDER DE INSTALACIONES
// =============================================

function initSlider() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  let current = 0;

  function goTo(index) {
    slides[current].classList.remove('active');
    dots[current].classList.remove('active');
    current = (index + slides.length) % slides.length;
    slides[current].classList.add('active');
    dots[current].classList.add('active');
  }

  slider.querySelector('.slider-prev').addEventListener('click', () => goTo(current - 1));
  slider.querySelector('.slider-next').addEventListener('click', () => goTo(current + 1));
  dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));
}

// =============================================
// WIDGET METEOROLOGÍA (Open-Meteo, sin API key)
// =============================================

const WEATHER_CODES = {
  0: 'Despejado', 1: 'Mayormente despejado', 2: 'Parcialmente nublado', 3: 'Nublado',
  45: 'Niebla', 48: 'Niebla con escarcha',
  51: 'Llovizna ligera', 53: 'Llovizna', 55: 'Llovizna intensa',
  61: 'Lluvia ligera', 63: 'Lluvia', 65: 'Lluvia intensa',
  71: 'Nieve ligera', 73: 'Nieve', 75: 'Nieve intensa',
  80: 'Chubascos ligeros', 81: 'Chubascos', 82: 'Chubascos intensos',
  95: 'Tormenta', 96: 'Tormenta con granizo', 99: 'Tormenta con granizo intenso'
};

const WEATHER_ICONS = {
  0: '☀️', 1: '🌤️', 2: '⛅', 3: '☁️',
  45: '🌫️', 48: '🌫️',
  51: '🌦️', 53: '🌦️', 55: '🌧️',
  61: '🌧️', 63: '🌧️', 65: '🌧️',
  71: '🌨️', 73: '❄️', 75: '❄️',
  80: '🌦️', 81: '🌧️', 82: '⛈️',
  95: '⛈️', 96: '⛈️', 99: '⛈️'
};

const DAYS_ES = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

async function initWeather() {
  const container = document.getElementById('weather-widget');
  if (!container) return;

  try {
    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=41.6066&longitude=-0.9301'
      + '&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m'
      + '&daily=temperature_2m_max,temperature_2m_min,weathercode'
      + '&timezone=Europe%2FMadrid&forecast_days=4';

    const res  = await fetch(url);
    const data = await res.json();
    const c    = data.current;
    const d    = data.daily;

    const forecastHTML = d.time.slice(1, 4).map((dateStr, i) => {
      const idx = i + 1;
      const day = DAYS_ES[new Date(dateStr).getDay()];
      const ico = WEATHER_ICONS[d.weathercode[idx]] || '🌡️';
      return `
        <div class="wf-day">
          <span class="wf-label">${day}</span>
          <span class="wf-ico">${ico}</span>
          <span class="wf-temps">${Math.round(d.temperature_2m_max[idx])}° / ${Math.round(d.temperature_2m_min[idx])}°</span>
        </div>`;
    }).join('');

    container.innerHTML = `
      <div class="weather-card">
        <div class="weather-location">Cuarte de Huerva</div>
        <div class="weather-main">
          <span class="weather-ico">${WEATHER_ICONS[c.weathercode] || '🌡️'}</span>
          <span class="weather-temp">${Math.round(c.temperature_2m)}°C</span>
        </div>
        <div class="weather-desc">${WEATHER_CODES[c.weathercode] || ''}</div>
        <div class="weather-details">
          <span>💨 ${Math.round(c.windspeed_10m)} km/h</span>
          <span>💧 ${c.relative_humidity_2m}%</span>
        </div>
        <div class="weather-forecast">${forecastHTML}</div>
        <p class="weather-source">Datos: Open-Meteo</p>
      </div>`;
  } catch {
    container.innerHTML = '<p class="weather-error">No se pudo cargar el tiempo</p>';
  }
}

// =============================================
// INIT
// =============================================

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initContactForm();
  initSlider();
  initWeather();
});
