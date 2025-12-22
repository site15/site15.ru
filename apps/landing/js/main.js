document.addEventListener('DOMContentLoaded', function () {
  // Check if lucide is defined before using it
  initLucide();

  // Attach click handler to all project cards
  initModals();

  // Mobile Menu Toggle
  initMobileMenuToggle();

  // Intersection Observer for Scroll Animations
  initScrollAnimations();

  // Start the coin animation
  initCoinAnimation();

  // ALL_STATS: BEGIN
  const allStats = {
    githubStats: {
      rucken: {
        stars: 508,
        commits: 2814,
      },
      user: {
        followers: 97,
        repos: 88,
        totalStars: 431,
      },
      org: {
        repos: 9,
        totalStars: 35,
      },
      commitDuration: '2 года 11 месяцев 26 дней',
    },
    kaufmanbotStats: {
      stars: 26,
      commits: 465,
      duration: '7 месяцев 14 дней',
    },
    nestjsModStats: {
      stars: 33,
      commits: 2405,
      duration: '1 год 7 месяцев 15 дней',
    },
    ngxDynamicFormBuilderStats: {
      stars: 117,
      commits: 343,
      duration: '2 года 9 месяцев 13 дней',
    },
    nestPermissionsSeedStats: {
      stars: 174,
      commits: 29,
      duration: '1 месяц 12 дней',
    },
    typeGraphqlPrismaNestjsStats: {
      stars: 29,
      commits: 100,
      duration: '4 года 6 месяцев 15 дней',
    },
    classValidatorMultiLangStats: {
      stars: 15,
      commits: 807,
      duration: '5 лет 3 месяца 28 дней',
    },
    devToStats: {
      articles: 97,
      followers: 2944,
      views: 90408,
      reactions: 439,
    },
    telegramDataStats: [
      {
        id: 'nest_ru',
        data: {
          members: '3 013',
          online: '1 403',
        },
      },
      {
        id: 'nest_basic',
        data: {
          members: '230',
          online: '109',
        },
      },
      {
        id: 'nest_random',
        data: {
          members: '230',
          online: '88',
        },
      },
      {
        id: 'prisma_ru',
        data: {
          members: '191',
          online: '73',
        },
      },
      {
        id: 'typeorm_ru',
        data: {
          members: '217',
          online: '89',
        },
      },
      {
        id: 'nestjs_jobs',
        data: {
          members: '671',
          online: '193',
        },
      },
      {
        id: 'nxdev_ru',
        data: {
          members: '17',
          online: '11',
        },
      },
      {
        id: 'angular_universal_ru',
        data: {
          members: '516',
          online: '191',
        },
      },
      {
        id: 'kaufman_log',
        data: {
          members: '51',
          online: 'N/A',
        },
      },
    ],
    habrStats: {
      articles: '28',
      followers: '19',
      karma: '1',
    },
    npmNestjsModStats: {
      downloads: 866,
    },
  };
  // ALL_STATS: END

  // Initialize GitHub badges when DOM is loaded
  initializeGitHubBadges(allStats);

  //
  updateTelegramChatsDisplay(allStats);

  // Initialize Dev.to badges
  updateDevToBadges(allStats);

  //
  updateNpmBadges(allStats);

  // Initialize Habr badges
  updateHabrBadges(allStats);
});

function initCoinAnimation() {
  log('Setting initial animation delay');
  setTimeout(bounceElement, 2000);
  changeCoinContent(false);
}

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

function initModals() {
  document.querySelectorAll('.project-card').forEach((card) => {
    card.addEventListener('click', function () {
      const id = this.getAttribute('data-id');
      window.openProjectModal(id);
    });
  });
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
