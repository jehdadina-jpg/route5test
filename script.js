'use strict';

/* ─── Reveal on scroll ─────────────────────────── */
const revealObs = new IntersectionObserver((entries) => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObs.observe(el));

/* ─── Sticky nav ───────────────────────────────── */
const nav = document.getElementById('nav');
window.addEventListener('scroll', () => {
  if (nav) nav.classList.toggle('scrolled', window.scrollY > 20);
}, { passive: true });

/* ─── Use-case tabs ────────────────────────────── */
document.querySelectorAll('.uc-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    const id = btn.dataset.uc;
    document.querySelectorAll('.uc-tab').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.uc-panel').forEach(p => p.classList.remove('active'));
    btn.classList.add('active');
    const panel = document.getElementById('uc-' + id);
    if (panel) panel.classList.add('active');
  });
});

/* ─── Mouse glow on cards ──────────────────────── */
document.querySelectorAll('.pillar-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    card.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    card.style.setProperty('--my', (e.clientY - r.top) + 'px');
  });
});

/* ─── Count-up animation ───────────────────────── */
function countUp(el, target, duration) {
  const isFloat = String(target).includes('.');
  const end = parseFloat(target);
  const step = 16;
  const inc = end / (duration / step);
  let cur = 0;
  const timer = setInterval(() => {
    cur = Math.min(cur + inc, end);
    el.textContent = isFloat ? cur.toFixed(1) : Math.floor(cur);
    if (cur >= end) { el.textContent = isFloat ? end.toFixed(1) : end; clearInterval(timer); }
  }, step);
}

const countObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.mc-count').forEach(el => {
      countUp(el, el.dataset.target, 1400);
    });
    countObs.unobserve(e.target);
  });
}, { threshold: 0.3 });

const metGrid = document.querySelector('.metrics-grid');
if (metGrid) countObs.observe(metGrid);

/* ─── Animated beam background (hero) ─────────── */
(function initBeams() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;inset:0;z-index:0;pointer-events:none;opacity:0.5;';
  document.body.prepend(canvas);

  const ctx = canvas.getContext('2d');
  const palette = [
    [37, 99, 235],   // blue
    [124, 58, 237],  // purple
    [234, 88, 12],   // orange
  ];

  let beams = [];

  function resize() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    beams = Array.from({ length: 10 }, (_, i) => {
      const col = palette[Math.random() < 0.6 ? 0 : Math.random() < 0.8 ? 1 : 2];
      return {
        x:  (canvas.width / 10) * i + Math.random() * 80 - 40,
        w:  Math.random() * 100 + 30,
        h:  canvas.height + 800,
        a:  Math.random() * 26 - 13,
        o:  Math.random() * 0.08 + 0.02,
        dx: (Math.random() - 0.5) * 0.25,
        c:  col,
      };
    });
  }

  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    beams.forEach(b => {
      ctx.save();
      ctx.translate(b.x + b.w / 2, canvas.height / 2);
      ctx.rotate(b.a * Math.PI / 180);
      const g = ctx.createLinearGradient(0, -b.h / 2, 0, b.h / 2);
      const [r, g2, bl] = b.c;
      g.addColorStop(0,   `rgba(${r},${g2},${bl},0)`);
      g.addColorStop(0.3, `rgba(${r},${g2},${bl},${b.o})`);
      g.addColorStop(0.7, `rgba(${r},${g2},${bl},${b.o})`);
      g.addColorStop(1,   `rgba(${r},${g2},${bl},0)`);
      ctx.fillStyle = g;
      ctx.fillRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
      b.x += b.dx;
      if (b.x > canvas.width + 150)  b.x = -150;
      if (b.x < -150) b.x = canvas.width + 150;
    });
    requestAnimationFrame(draw);
  }

  resize();
  draw();
  window.addEventListener('resize', resize, { passive: true });
})();

/* ─── Scramble text utility ────────────────────── */
const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&';
function scramble(el, speed = 36) {
  const text = el.dataset.text || el.textContent;
  let i = 0;
  const iv = setInterval(() => {
    el.textContent = text.split('').map((ch, idx) => {
      if (/[\s→·]/.test(ch)) return ch;
      if (idx < i) return text[idx];
      return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
    }).join('');
    i += 1 / 3;
    if (i >= text.length) { el.textContent = text; clearInterval(iv); }
  }, speed);
}

/* matrix spin every 15s */
setInterval(() => {
  document.querySelectorAll('[data-text]').forEach(el => scramble(el));
}, 15000);

/* ─── Smooth active nav link highlight ─────────── */
const sections = document.querySelectorAll('section[id], div[id]');
const navLinks = document.querySelectorAll('.nav-links a');
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      navLinks.forEach(a => {
        a.style.color = a.getAttribute('href') === '#' + e.target.id ? 'var(--text)' : '';
      });
    }
  });
}, { rootMargin: '-40% 0px -55% 0px' });
sections.forEach(s => sectionObs.observe(s));
