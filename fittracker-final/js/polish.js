// ===================================================
// FitTracker | js/polish.js
// Drop-in UX micro-interactions & animations
// Add <script src="js/polish.js"></script> before
// </body> on every page to activate.
// ===================================================

(function () {
  'use strict';

  /* ── Navbar scroll state ── */
  const navbar = document.querySelector('.navbar');
  if (navbar) {
    const onScroll = () => navbar.classList.toggle('scrolled', window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ── Reading progress bar ── */
  const bar = document.createElement('div');
  bar.id = 'read-progress';
  document.body.appendChild(bar);
  window.addEventListener('scroll', () => {
    const docH = document.documentElement.scrollHeight - window.innerHeight;
    bar.style.width = docH > 0 ? (window.scrollY / docH * 100) + '%' : '0%';
  }, { passive: true });

  /* ── Scroll reveal ──
     Automatically adds .reveal to cards, stat-boxes, and form-cards
     so they animate in as the user scrolls.
  ── */
  const revealSelectors = [
    '.card', '.stat-box', '.ex-card', '.insight-card',
    '.form-card', '.delete-card', '.entry-selector',
    '.chart-card', '.crud-card', '.alert'
  ];

  const revealEls = document.querySelectorAll(revealSelectors.join(','));

  revealEls.forEach((el, i) => {
    if (!el.classList.contains('reveal')) {
      el.classList.add('reveal');
      // Stagger within groups of 4
      const delay = (i % 4);
      if (delay > 0) el.classList.add(`reveal-delay-${delay}`);
    }
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  /* ── Toast notification system ──
     Usage: window.showToast('Workout saved!');
            window.showToast('Something went wrong', 'error');
            window.showToast('Heads up', 'warning');
  ── */
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  window.showToast = function (msg, type = 'success', duration = 3500) {
    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = 'toast' + (type !== 'success' ? ` toast-${type}` : '');
    toast.innerHTML = `<span>${icons[type] || icons.success}</span><span>${msg}</span>`;
    toastContainer.appendChild(toast);
    const dismiss = () => {
      toast.classList.add('toast-out');
      toast.addEventListener('animationend', () => toast.remove(), { once: true });
    };
    setTimeout(dismiss, duration);
    toast.addEventListener('click', dismiss);
  };

  /* ── Button press ripple (enhances .btn) ── */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mousedown', function (e) {
      const ripple = document.createElement('span');
      const rect = this.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.cssText = `
        position:absolute; border-radius:50%; pointer-events:none;
        width:${size}px; height:${size}px;
        left:${e.clientX - rect.left - size / 2}px;
        top:${e.clientY - rect.top - size / 2}px;
        background:rgba(255,255,255,0.15);
        transform:scale(0); animation:rippleAnim 0.5s ease-out forwards;
      `;
      if (!document.getElementById('ripple-style')) {
        const s = document.createElement('style');
        s.id = 'ripple-style';
        s.textContent = '@keyframes rippleAnim{to{transform:scale(2.5);opacity:0;}}';
        document.head.appendChild(s);
      }
      this.style.position = 'relative';
      this.style.overflow = 'hidden';
      this.appendChild(ripple);
      ripple.addEventListener('animationend', () => ripple.remove(), { once: true });
    });
  });

  /* ── Hamburger animate ── */
  const hamburger = document.querySelector('.hamburger');
  const navLinks  = document.getElementById('nav-links');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      const isOpen = navLinks.classList.contains('open');
      const spans  = hamburger.querySelectorAll('span');
      if (isOpen) {
        spans[0].style.transform = '';
        spans[1].style.opacity   = '';
        spans[2].style.transform = '';
      } else {
        spans[0].style.transform = 'translateY(7px) rotate(45deg)';
        spans[1].style.opacity   = '0';
        spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
      }
    });
    navLinks.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        hamburger.querySelectorAll('span').forEach(s => {
          s.style.transform = ''; s.style.opacity = '';
        });
      });
    });
  }

  /* ── Table row stagger animation ──
     Runs once after the DOM is ready to catch dynamically rendered rows.
  ── */
  function animateTableRows() {
    const rows = document.querySelectorAll('#log-body tr, #results-body tr');
    rows.forEach((row, i) => {
      row.style.opacity = '0';
      row.style.transform = 'translateY(8px)';
      row.style.transition = `opacity 0.3s ease ${i * 0.04}s, transform 0.3s ease ${i * 0.04}s`;
      requestAnimationFrame(() => {
        row.style.opacity = '1';
        row.style.transform = 'translateY(0)';
      });
    });
  }

  // Run on load for static content
  setTimeout(animateTableRows, 100);
  // Expose globally so CRUD pages can call it after re-render
  window.animateTableRows = animateTableRows;

})();
