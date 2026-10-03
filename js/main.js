// Shared interactions for every page of the portfolio.
document.addEventListener('DOMContentLoaded', () => {
  // Navbar shadow + back-to-top button on scroll
  const nav = document.querySelector('.site-nav');
  const toTop = document.querySelector('.back-to-top');
  const onScroll = () => {
    const y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 30);
    if (toTop) toTop.classList.toggle('show', y > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  if (toTop) toTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  // Current year in footer
  document.querySelectorAll('.year').forEach(el => { el.textContent = new Date().getFullYear(); });

  // Reveal-on-scroll, skill bars and number counters
  const animateCounter = el => {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.count.split('.')[1] || '').length;
    const suffix = el.dataset.suffix || '';
    const start = performance.now();
    const step = now => {
      const p = Math.min((now - start) / 1500, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      el.classList.add('visible');
      if (el.dataset.count) animateCounter(el);
      if (el.dataset.width) el.style.width = el.dataset.width;
      observer.unobserve(el);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll('.reveal, [data-count], .skill-bar span').forEach(el => observer.observe(el));

  // Typing effect on the home page
  const typed = document.querySelector('.typed-role');
  if (typed) {
    const words = JSON.parse(typed.dataset.words);
    let w = 0, c = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      c += deleting ? -1 : 1;
      typed.textContent = word.slice(0, c);
      let delay = deleting ? 45 : 90;
      if (!deleting && c === word.length) { deleting = true; delay = 1600; }
      else if (deleting && c === 0) { deleting = false; w = (w + 1) % words.length; delay = 300; }
      setTimeout(tick, delay);
    };
    tick();
  }

  // Portfolio filter buttons
  const filterBtns = document.querySelectorAll('.filter-bar [data-filter]');
  filterBtns.forEach(btn => btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.project-item').forEach(item => {
      item.classList.toggle('hide', f !== 'all' && !item.dataset.category.includes(f));
    });
  }));

  // Show / hide password buttons
  document.querySelectorAll('.btn-eye').forEach(btn => btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target);
    const show = input.type === 'password';
    input.type = show ? 'text' : 'password';
    btn.innerHTML = show ? '<i class="bi bi-eye-slash"></i>' : '<i class="bi bi-eye"></i>';
    btn.setAttribute('aria-label', show ? 'Hide password' : 'Show password');
  }));

  // Password strength meter (sign up page)
  const pwd = document.getElementById('signupPassword');
  const meter = document.querySelector('.strength span');
  const meterText = document.getElementById('strengthText');
  if (pwd && meter) {
    pwd.addEventListener('input', () => {
      const v = pwd.value;
      let score = 0;
      if (v.length >= 8) score++;
      if (/[A-Z]/.test(v) && /[a-z]/.test(v)) score++;
      if (/\d/.test(v)) score++;
      if (/[^A-Za-z0-9]/.test(v)) score++;
      const levels = [
        ['0%', '#ece7fb', ''],
        ['25%', '#ff6b8b', 'Weak'],
        ['50%', '#ff9a5a', 'Fair'],
        ['75%', '#ffc94d', 'Good'],
        ['100%', '#19c3b4', 'Strong']
      ];
      const [width, color, label] = levels[v ? Math.max(score, 1) : 0];
      meter.style.width = width;
      meter.style.background = color;
      if (meterText) meterText.textContent = label ? 'Strength: ' + label : '';
    });
  }

  // Bootstrap-style validation for every form with .needs-validation
  const toast = document.querySelector('.form-toast');
  const showToast = msg => {
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3800);
  };

  document.querySelectorAll('form.needs-validation').forEach(form => {
    form.addEventListener('submit', e => {
      e.preventDefault();
      const confirm = form.querySelector('#signupConfirm');
      if (confirm) {
        const match = confirm.value === form.querySelector('#signupPassword').value;
        confirm.setCustomValidity(match ? '' : 'Passwords do not match');
      }
      if (!form.checkValidity()) {
        form.classList.add('was-validated');
        return;
      }
      form.classList.remove('was-validated');
      showToast(form.dataset.success || 'Thank you! Your form was submitted.');
      form.reset();
      if (meter) { meter.style.width = '0%'; if (meterText) meterText.textContent = ''; }
    });
  });
});
