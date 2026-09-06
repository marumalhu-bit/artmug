(function () {
  var demo = document.querySelector('[data-cute-demo]');
  if (!demo) return;

  demo.querySelectorAll('[data-cu-animate]').forEach(function (el, i) {
    setTimeout(function () { el.classList.add('is-in'); }, 60 + i * 70);
  });

  var revealEls = demo.querySelectorAll('[data-cu-reveal]');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -20px 0px' });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  demo.querySelectorAll('[data-cu-doodle]').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      var targetId = btn.getAttribute('data-cu-target');
      var target = targetId ? document.getElementById(targetId) : null;
      if (!target) return;
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  demo.querySelectorAll('[data-cu-fade]').forEach(function (fade) {
    var slides = fade.querySelectorAll('[data-cu-slide]');
    var dots = fade.querySelectorAll('[data-cu-dot]');
    if (!slides.length) return;
    var idx = 0;
    var timer = null;
    var paused = false;

    function show(next) {
      idx = (next + slides.length) % slides.length;
      slides.forEach(function (slide, i) { slide.classList.toggle('is-on', i === idx); });
      dots.forEach(function (dot, i) { dot.classList.toggle('on', i === idx); });
    }
    function stop() { if (timer) { clearInterval(timer); timer = null; } }
    function start() { stop(); if (!paused) timer = setInterval(function () { show(idx + 1); }, 2600); }

    dots.forEach(function (dot) {
      dot.addEventListener('click', function (e) {
        e.preventDefault();
        show(parseInt(dot.getAttribute('data-cu-dot'), 10) || 0);
        start();
      });
    });

    var prevBtn = fade.querySelector('[data-cu-fade-prev]');
    var nextBtn = fade.querySelector('[data-cu-fade-next]');
    if (prevBtn) prevBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); show(idx - 1); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function (e) { e.preventDefault(); e.stopPropagation(); show(idx + 1); start(); });

    var stage = fade.querySelector('.cu-fade-stage');
    if (stage) {
      stage.addEventListener('click', function (e) {
        if (e.target.closest('[data-cu-fade-prev]') || e.target.closest('[data-cu-fade-next]')) return;
        show(idx + 1);
        start();
      });
    }

    fade.addEventListener('mouseenter', function () { paused = true; stop(); });
    fade.addEventListener('mouseleave', function () { paused = false; start(); });
    start();
  });

  demo.querySelectorAll('[data-demo-quote]').forEach(function (calc) {
    var rows = calc.querySelectorAll('[data-demo-price]');
    var totalEl = calc.querySelector('[data-demo-total]');
    function formatWon(n) { return n.toLocaleString('ko-KR') + '원'; }
    function updateTotal() {
      var sum = 0;
      rows.forEach(function (row) {
        if (row.classList.contains('on')) sum += parseInt(row.getAttribute('data-demo-price'), 10) || 0;
      });
      if (totalEl) totalEl.textContent = formatWon(sum);
    }
    rows.forEach(function (row) {
      row.addEventListener('click', function (e) {
        e.preventDefault();
        row.classList.toggle('on');
        updateTotal();
      });
    });
    updateTotal();
  });

  demo.querySelectorAll('[data-demo-faq]').forEach(function (faq) {
    faq.querySelectorAll('[data-demo-faq-item]').forEach(function (item) {
      var btn = item.querySelector('[data-demo-faq-toggle]');
      if (!btn) return;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var isOpen = item.classList.toggle('open');
        btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      });
    });
  });
})();
