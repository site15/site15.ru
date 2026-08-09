(function () {
  var btn = document.getElementById('scroll-to-top-btn');
  if (!btn) return;

  var initialized = false;

  window.addEventListener('scroll', function () {
    if (window.scrollY > 300) {
      btn.classList.remove('hidden');
      if (!initialized && window.lucide) {
        lucide.createIcons();
        initialized = true;
      }
    } else {
      btn.classList.add('hidden');
    }
  });

  btn.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
