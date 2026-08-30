document.addEventListener('click', function (e) {
  var burger = e.target.closest('.burger');
  if (burger) {
    document.getElementById('menu').classList.toggle('open');
  }
});

var form = document.getElementById('appointment-form');
if (form) {
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    document.getElementById('form-status').textContent =
      'Thank you. Please call 94954 20145 to confirm your appointment slot.';
    form.reset();
  });
}

// Scroll-reveal: fade/slide sections and cards in as they enter view.
(function () {
  var targets = document.querySelectorAll('.section, .card, .quote, .step, .doc, .video-card, .gtile');
  if (!('IntersectionObserver' in window) || !targets.length) {
    targets.forEach(function (el) { el.classList.add('reveal', 'in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('in');
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  targets.forEach(function (el, i) {
    el.classList.add('reveal');
    el.style.transitionDelay = (Math.min(i % 6, 5) * 60) + 'ms';
    io.observe(el);
  });
})();

// Animated stat counters: count up from 0 once the stats row is visible.
(function () {
  var stats = document.querySelectorAll('.stat b[data-count]');
  if (!stats.length) return;
  function animate(el) {
    var target = parseFloat(el.getAttribute('data-count'));
    var suffix = el.getAttribute('data-suffix') || '';
    var start = null, duration = 1100;
    function step(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var val = Math.round(target * (1 - Math.pow(1 - p, 3)));
      el.textContent = val + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  if (!('IntersectionObserver' in window)) {
    stats.forEach(animate);
    return;
  }
  var io2 = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        animate(entry.target);
        io2.unobserve(entry.target);
      }
    });
  }, { threshold: 0.4 });
  stats.forEach(function (el) { io2.observe(el); });
})();

// Gallery lightbox: click a tile with a real photo to view it enlarged.
// Tiles still marked as placeholders (no data-full) are not clickable.
(function () {
  var lightbox = document.getElementById('lightbox');
  if (!lightbox) return;
  var img = lightbox.querySelector('img');
  var cap = lightbox.querySelector('.lightbox-cap');
  document.addEventListener('click', function (e) {
    var tile = e.target.closest('.gtile[data-full]');
    if (tile) {
      img.src = tile.getAttribute('data-full');
      cap.textContent = tile.getAttribute('data-caption') || '';
      lightbox.classList.add('open');
    }
    if (e.target.closest('.lightbox-close') || e.target === lightbox) {
      lightbox.classList.remove('open');
      img.src = '';
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { lightbox.classList.remove('open'); img.src = ''; }
  });
})();
