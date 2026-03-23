// Smooth scroll offset for fixed nav
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
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

// Nav background on scroll
const nav = document.querySelector('nav');
window.addEventListener('scroll', () => {
  nav.style.background = window.scrollY > 40
    ? 'rgba(13,43,26,0.98)'
    : 'rgba(13,43,26,0.95)';
});

// Form handler
function handleForm(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value;
  const asunto = document.getElementById('asunto').value || 'Consulta desde la web';
  const mensaje = document.getElementById('mensaje').value;
  const email   = document.getElementById('email').value;
  const mailto  = `mailto:contacto@padelation.es?subject=${encodeURIComponent(asunto)}&body=${encodeURIComponent(`Nombre: ${nombre}\nEmail: ${email}\n\n${mensaje}`)}`;
  window.location.href = mailto;
}
