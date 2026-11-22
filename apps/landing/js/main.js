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

  // Запасные значения: с ними страница рисуется сразу, до всякого ответа бэкенда.
  // Ответ API накладывается поверх этого объекта (mergeStatsObjects), поэтому здесь
  // должны жить реальные числа площадок, а не нули — иначе при недоступном бэкенде
  // плашки показывают «0 звезд» вместо правдоподобных значений.
  const FALLBACK_ALL_STATS = {
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
    myDashboardStats: {
      stars: 1,
      commits: 412,
      duration: '2 месяца 11 дней',
    },
    ragSystemStats: {
      stars: 2,
      commits: 122,
      duration: '5 месяцев 15 дней',
    },
    opworkStats: {
      stars: 0,
      commits: 117,
      duration: '3 месяца 23 дня',
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
      articles: 28,
      followers: 19,
      karma: 1,
    },
    npmNestjsModStats: {
      downloads: 866,
    },
  };

  /** Рабочий объект статистики: начинается с запасных значений, дополняется ответом API. */
  let allStats = mergeStatsObjects(FALLBACK_ALL_STATS, {});

  /**
   * Сколько ждём /api/landing/stats. Больше — уже «сервер висит», а не «данные едут»:
   * бэкенд отвечает на чтения лендинга за секунды, остальное — недоступная БД.
   */
  const STATS_FETCH_TIMEOUT_MS = 8000;

  // Апдейдеры изолированы: раньше один TypeError на непривычных данных обрывал
  // всю цепочку, и часть плашек оставалась в «Загрузка...» до перезагрузки вкладки.
  const STATS_UPDATERS = [
    ['github', () => initializeGitHubBadges(allStats)],
    ['telegram', () => updateTelegramChatsDisplay(allStats)],
    ['dev.to', () => updateDevToBadges(allStats)],
    ['npm', () => updateNpmBadges(allStats)],
    ['habr', () => updateHabrBadges(allStats)],
  ];

  function updateHtml() {
    try {
      STATS_UPDATERS.forEach(([name, update]) => {
        try {
          update();
        } catch (error) {
          console.error(`Не удалось отрисовать блок метрик: ${name}`, error);
        }
      });
    } finally {
      // Часть плашек перерисовывается через innerHTML/textContent, вместе с
      // содержимым затираются и тренд-круглешки — ставим их заново (история уже
      // в кэше stats-trend, поэтому повторных запросов не будет). В finally —
      // чтобы бейджи вернулись, даже если один из апдейеров упал на данных.
      if (window.statsTrend && typeof window.statsTrend.init === 'function') {
        window.statsTrend.init(document);
      }
    }
  }

  // Первую отрисовку делаем сразу из запасных значений — так плашки показаны
  // всегда, независимо от того, дождёмся мы ответа бэкенда или нет.
  updateHtml();

  // NOTE: This API endpoint can be called locally during development
  // Local development URL: http://localhost:3000/api/landing/stats
  // Production URL: https://site15.ru/api/landing/stats
  const statsUrl = window.location.href.includes('localhost')
    ? 'http://localhost:3000/api/landing/stats'
    : 'https://site15.ru/api/landing/stats';

  // fetchJsonWithTimeout не бросает: любая неудача — это null.
  fetchJsonWithTimeout(statsUrl, STATS_FETCH_TIMEOUT_MS).then((data) => {
    const incoming = data && data.allStats;
    if (!incoming) {
      return;
    }
    // Не подменяем, а накладываем: частичный ответ (пришли не все метрики) не должен
    // стирать с экрана то, чего в нём нет.
    allStats = mergeStatsObjects(FALLBACK_ALL_STATS, incoming);
    updateHtml();
  });
});
