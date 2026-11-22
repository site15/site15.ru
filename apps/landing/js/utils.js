function initScrollAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1,
  };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, observerOptions);
  document.querySelectorAll('.reveal').forEach((el) => {
    observer.observe(el);
  });
}

function initMobileMenuToggle() {
  const menuBtn = document.getElementById('mobile-menu-btn');
  const mobileMenu = document.getElementById('mobile-menu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', () => {
      mobileMenu.classList.toggle('hidden');
    });
    // Hide mobile menu on link click
    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        mobileMenu.classList.add('hidden');
      });
    });
  }
}

/**
 * GET с ограничением по времени, отдающий распарсенный JSON.
 *
 * Публичные эндпоинты лендинга читают БД, и пока сервер не ответил, fetch висит
 * неограниченно: плашки остаются в «Загрузка...» до конца жизни вкладки. Здесь
 * любая неудача (таймаут, не-2xx, битый JSON) превращается в null — вызывающий
 * код продолжает жить на своих запасных значениях.
 */
function fetchJsonWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    },
    signal: controller.signal,
  })
    .then((response) => (response.ok ? response.json() : null))
    .catch(() => null)
    .finally(() => clearTimeout(timer));
}

function initLucide() {
  if (typeof lucide !== 'undefined') {
    lucide.createIcons();
  } else {
    console.error('Lucide library failed to load');
    // Retry mechanism in case of async loading issues
    setTimeout(function () {
      if (typeof lucide !== 'undefined') {
        lucide.createIcons();
      }
    }, 1000);
  }
}
