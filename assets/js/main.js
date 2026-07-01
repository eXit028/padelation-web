// =============================================================
// MAIN.JS
// Este fichero se carga en TODAS las páginas (index.html y las de
// pages/) mediante <script src=".../main.js"></script> justo antes
// de cerrar el <body>. Se encarga de:
//   - Insertar la nav y el footer compartidos (loadComponents)
//   - Arreglar las rutas de esa nav según la página (fixNavLinks)
//   - Marcar en el menú el enlace de la página actual (highlightActiveLink)
//   - Hacer scroll suave al pulsar enlaces de ancla (initSmoothScroll)
//   - Oscurecer el fondo de la nav al hacer scroll (initNavScroll)
//   - El formulario de contacto (initContactForm)
//   - El carrusel de fotos de instalaciones (initSlider)
//   - El widget del tiempo (initWeather)
// Todo arranca al final del fichero, en el evento DOMContentLoaded.
// =============================================================

// =============================================
// CARGADOR DE COMPONENTES
// =============================================

/**
 * Descarga un fragmento HTML (url) y lo mete dentro del elemento
 * indicado por selector (ej: "#nav-placeholder"). Así reutilizamos
 * la misma nav.html/footer.html en todas las páginas sin copiarlas.
 */
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

/**
 * Inserta la nav y el footer en la página actual y, una vez están
 * en el DOM, vuelve a ejecutar las funciones que dependen de ellos
 * (corregir enlaces, marcar el activo, scroll suave, color de la nav).
 */
async function loadComponents() {
  // Detecta si estamos en una subpágina (pages/) o en la raíz.
  // Se usa para saber cuántos "../" hacen falta al construir rutas.
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

/**
 * components/nav.html tiene los enlaces escritos "como si estuviera
 * en la raíz" (ej: "pages/tarifas.html"). Si estamos dentro de pages/,
 * esa ruta estaría mal (faltaría subir un nivel), así que aquí se le
 * añade "../" delante a cada enlace interno y al logo cuando toca.
 */
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

/**
 * Añade la clase "active" al enlace del menú que corresponde a la
 * página que se está viendo, comparando la URL de cada enlace con
 * la URL actual del navegador.
 */
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

/**
 * Hace que los enlaces tipo href="#seccion" (anclas) se desplacen
 * con animación en lugar de saltar de golpe, y resta el alto de la
 * nav fija (offset) para que la sección no quede tapada debajo de ella.
 */
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = 68; // debe coincidir con la altura de la nav (ver "nav { height: 68px }" en style.css)
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

/**
 * Hace la nav ligeramente más opaca (añadiendo transparencia "f7" en
 * hexadecimal al color) cuando el usuario ha bajado más de 40px, para
 * que se lea mejor sobre el contenido que pasa por debajo.
 */
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

/**
 * Solo tiene efecto en pages/contacto.html (es la única página con un
 * <form>). Al enviar el formulario, en vez de mandarlo a un servidor,
 * cancela el envío normal (preventDefault) y en su lugar abre el
 * cliente de correo del usuario con un enlace "mailto:" que ya lleva
 * el asunto y el cuerpo del mensaje rellenados con lo que escribió.
 */
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

/**
 * Solo tiene efecto en pages/instalaciones.html. Controla qué foto
 * (.slide) y qué punto (.dot) tienen la clase "active" en cada
 * momento, y engancha los clicks de las flechas y los puntos.
 */
function initSlider() {
  const slider = document.querySelector('.slider');
  if (!slider) return;

  const slides = slider.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.slider-dots .dot');
  let current = 0;

  // Cambia a la diapositiva "index". El "% slides.length" hace que
  // al pasar de la última vuelva a la primera (y viceversa al ir atrás).
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
// Open-Meteo es un servicio gratuito de previsión del tiempo que no
// necesita registro ni clave de API: basta con hacer una petición a
// su URL con las coordenadas deseadas (ver initWeather más abajo).
// Esta API devuelve el tiempo como un número "weathercode"; las dos
// tablas siguientes traducen ese número a texto e icono en español.

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

/**
 * Solo tiene efecto en pages/instalaciones.html. Descarga el tiempo
 * actual y la previsión de los próximos 3 días para Cuarte de Huerva
 * y construye el HTML del widget. Si la petición falla (sin internet,
 * API caída, etc.) se muestra un mensaje de error en su lugar.
 */
async function initWeather() {
  const container = document.getElementById('weather-widget');
  if (!container) return;

  try {
    // Coordenadas fijas de Cuarte de Huerva (Zaragoza). Si el club se
    // trasladara, habría que cambiar latitude/longitude aquí.
    const url = 'https://api.open-meteo.com/v1/forecast'
      + '?latitude=41.6066&longitude=-0.9301'
      + '&current=temperature_2m,weathercode,windspeed_10m,relative_humidity_2m'
      + '&daily=temperature_2m_max,temperature_2m_min,weathercode'
      + '&timezone=Europe%2FMadrid&forecast_days=4';

    const res  = await fetch(url);
    const data = await res.json();
    const c    = data.current;
    const d    = data.daily;

    // d.time[0] es el día de hoy, por eso se cogen las posiciones 1,2,3
    // (slice(1,4)) para mostrar los 3 días siguientes en la previsión.
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
// Punto de entrada del script: "DOMContentLoaded" se dispara cuando el
// navegador ha terminado de leer el HTML de la página. A partir de ahí
// se arrancan todas las funciones. Las que no encuentran su elemento
// en la página (ej. initSlider en una página sin slider) simplemente
// no hacen nada gracias al "if (!x) return;" del principio de cada una.

document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
  initContactForm();
  initSlider();
  initWeather();
});
