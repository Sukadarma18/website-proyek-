document.getElementById("year").textContent = new Date().getFullYear();

// Sticky navbar style on scroll
const header = document.getElementById('site-header');
const backToTop = document.getElementById('backToTop');
const onScroll = () => {
  const y = window.scrollY;
  if (y > 8) header.classList.add('scrolled'); else header.classList.remove('scrolled');
  if (y > 400) backToTop.classList.add('show'); else backToTop.classList.remove('show');
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

// Smooth scroll for anchor links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', e => {
    const targetId = anchor.getAttribute('href');
    if (targetId && targetId.length > 1) {
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const yOffset = -72; // account for fixed navbar
        const y = target.getBoundingClientRect().top + window.pageYOffset + yOffset;
        window.scrollTo({ top: y, behavior: 'smooth' });
      }
    }
  });
});

// Back to top
backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

// Init AOS animations
if (window.AOS) {
  AOS.init({ duration: 700, once: true, offset: 80, easing: 'ease-out-cubic' });
}
