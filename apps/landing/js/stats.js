// Initialize GitHub badges with data from githubStats constant
function initializeGitHubBadges(allStats) {
  // Update Rucken stars badge
  const starsElement = document.getElementById('github-stars');
  if (starsElement) {
    const starsWord = getRussianDeclension(allStats.githubStats.rucken.stars, ['звезда', 'звезды', 'звезд']);
    starsElement.textContent = `${allStats.githubStats.rucken.stars} ${starsWord}`;
  }

  // Update Rucken commit count badge
  const commitCountElement = document.getElementById('github-commit-count');
  if (commitCountElement) {
    const commitWord = getRussianDeclension(allStats.githubStats.rucken.commits, ['коммит', 'коммита', 'коммитов']);
    commitCountElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M13 3.997V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1l1.5 1v8.5a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 0 2.5-2.5V4.997L13 3.997zM11.5 4H11v8.5a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 4 12.5V4H4.5L5 4.5V12h1V8.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V12h1V4.5l.5-.5zM6 5h1v1H6V5zm2 0h1v1H8V5zm2 0h1v1h-1V5z"/></svg>
                            <span>${allStats.githubStats.rucken.commits} ${commitWord}</span>`;
  }

  // Update Rucken commit duration badge
  const commitDurationElement = document.getElementById('github-commit-duration');
  if (commitDurationElement) {
    commitDurationElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 13c-3.308 0-6-2.692-6-6s2.692-6 6-6 6 2.692 6 6-2.692 6-6 6zm.5-10.5H7v5h4.5V7h-4V6.5h4z"/></svg>
                            <span>${allStats.githubStats.commitDuration}</span>`;
  }

  // Update KaufmanBot stars badge
  const kaufmanbotStarsElement = document.getElementById('kaufmanbot-stars');
  if (kaufmanbotStarsElement) {
    const starsWord = getRussianDeclension(allStats.kaufmanbotStats.stars, ['звезда', 'звезды', 'звезд']);
    kaufmanbotStarsElement.textContent = `${allStats.kaufmanbotStats.stars} ${starsWord}`;
  }

  // Update KaufmanBot commit count badge
  const kaufmanbotCommitsElement = document.getElementById('kaufmanbot-commits');
  if (kaufmanbotCommitsElement) {
    const commitWord = getRussianDeclension(allStats.kaufmanbotStats.commits, ['коммит', 'коммита', 'коммитов']);
    kaufmanbotCommitsElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M13 3.997V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1l1.5 1v8.5a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 0 2.5-2.5V4.997L13 3.997zM11.5 4H11v8.5a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 4 12.5V4H4.5L5 4.5V12h1V8.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V12h1V4.5l.5-.5zM6 5h1v1H6V5zm2 0h1v1H8V5zm2 0h1v1h-1V5z"/></svg>
                            <span>${allStats.kaufmanbotStats.commits} ${commitWord}</span>`;
  }

  // Update KaufmanBot duration badge
  const kaufmanbotDurationElement = document.getElementById('kaufmanbot-duration');
  if (kaufmanbotDurationElement) {
    kaufmanbotDurationElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 13c-3.308 0-6-2.692-6-6s2.692-6 6-6 6 2.692 6 6-2.692 6-6 6zm.5-10.5H7v5h4.5V7h-4V6.5h4z"/><\/svg>
                            <span>${allStats.kaufmanbotStats.duration}<\/span>`;
  }

  // Update NestJS-mod stars badge
  const nestjsmodStarsElement = document.getElementById('github-nestjs-mod-stars');
  if (nestjsmodStarsElement) {
    const starsWord = getRussianDeclension(allStats.nestjsModStats.stars, ['звезда', 'звезды', 'звезд']);
    nestjsmodStarsElement.textContent = `${allStats.nestjsModStats.stars} ${starsWord}`;
  }

  // Update NestJS-mod commit count badge
  const nestjsmodCommitsElement = document.getElementById('github-nestjs-mod-commits');
  if (nestjsmodCommitsElement) {
    const commitWord = getRussianDeclension(allStats.nestjsModStats.commits, ['коммит', 'коммита', 'коммитов']);
    nestjsmodCommitsElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M13 3.997V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1l1.5 1v8.5a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 0 2.5-2.5V4.997L13 3.997zM11.5 4H11v8.5a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 4 12.5V4H4.5L5 4.5V12h1V8.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V12h1V4.5l.5-.5zM6 5h1v1H6V5zm2 0h1v1H8V5zm2 0h1v1h-1V5z"/><\/svg>
                            <span>${allStats.nestjsModStats.commits} ${commitWord}<\/span>`;
  }

  // Update NestJS-mod duration badge
  const nestjsmodDurationElement = document.getElementById('github-nestjs-mod-duration');
  if (nestjsmodDurationElement) {
    nestjsmodDurationElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 13c-3.308 0-6-2.692-6-6s2.692-6 6-6 6 2.692 6 6-2.692 6-6 6zm.5-10.5H7v5h4.5V7h-4V6.5h4z"/><\/svg>
                            <span>${allStats.nestjsModStats.duration}<\/span>`;
  }

  // Update user followers badge
  const followersElement = document.getElementById('github-followers');
  if (followersElement) {
    const followersWord = getRussianDeclension(allStats.githubStats.user.followers, [
      'подписчик',
      'подписчика',
      'подписчиков',
    ]);
    followersElement.textContent = `${allStats.githubStats.user.followers.toLocaleString()} ${followersWord}`;
  }

  // Update user repos badge
  const reposElement = document.getElementById('github-repos');
  if (reposElement) {
    const reposWord = getRussianDeclension(allStats.githubStats.user.repos, [
      'репозиторий',
      'репозитория',
      'репозиториев',
    ]);
    reposElement.textContent = `${allStats.githubStats.user.repos} ${reposWord}`;
  }

  // Update user total stars badge
  const starsTotalElement = document.getElementById('github-stars-total');
  if (starsTotalElement) {
    const starsWord = getRussianDeclension(allStats.githubStats.user.totalStars, ['звезда', 'звезды', 'звезд']);
    starsTotalElement.textContent = `${allStats.githubStats.user.totalStars} ${starsWord}`;
  }

  // Update org repos badge
  const orgReposElement = document.getElementById('github-nestjs-mod-repos');
  if (orgReposElement) {
    const reposWord = getRussianDeclension(allStats.githubStats.org.repos, [
      'репозиторий',
      'репозитория',
      'репозиториев',
    ]);
    orgReposElement.textContent = `${allStats.githubStats.org.repos} ${reposWord}`;
  }

  // Update org stars badge
  const orgStarsElement = document.getElementById('github-nestjs-mod-stars');
  if (orgStarsElement) {
    const starsWord = getRussianDeclension(allStats.githubStats.org.totalStars, ['звезда', 'звезды', 'звезд']);
    orgStarsElement.textContent = `${allStats.githubStats.org.totalStars} ${starsWord}`;
  }

  // Update ngx-dynamic-form-builder stars badge
  const ngxDynamicFormBuilderStarsElement = document.getElementById('github-ngx-dynamic-form-builder-stars');
  if (ngxDynamicFormBuilderStarsElement) {
    const starsWord = getRussianDeclension(allStats.ngxDynamicFormBuilderStats.stars, ['звезда', 'звезды', 'звезд']);
    ngxDynamicFormBuilderStarsElement.textContent = `${allStats.ngxDynamicFormBuilderStats.stars} ${starsWord}`;
  }

  // Update ngx-dynamic-form-builder commit count badge
  const ngxDynamicFormBuilderCommitsElement = document.getElementById('github-ngx-dynamic-form-builder-commits');
  if (ngxDynamicFormBuilderCommitsElement) {
    const commitWord = getRussianDeclension(allStats.ngxDynamicFormBuilderStats.commits, [
      'коммит',
      'коммита',
      'коммитов',
    ]);
    ngxDynamicFormBuilderCommitsElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M13 3.997V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1l1.5 1v8.5a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 0 2.5-2.5V4.997L13 3.997zM11.5 4H11v8.5a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 4 12.5V4H4.5L5 4.5V12h1V8.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V12h1V4.5l.5-.5zM6 5h1v1H6V5zm2 0h1v1H8V5zm2 0h1v1h-1V5z"/><\/svg>
                            <span>${allStats.ngxDynamicFormBuilderStats.commits} ${commitWord}<\/span>`;
  }

  // Update ngx-dynamic-form-builder duration badge
  const ngxDynamicFormBuilderDurationElement = document.getElementById('github-ngx-dynamic-form-builder-duration');
  if (ngxDynamicFormBuilderDurationElement) {
    ngxDynamicFormBuilderDurationElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 13c-3.308 0-6-2.692-6-6s2.692-6 6-6 6 2.692 6 6-2.692 6-6 6zm.5-10.5H7v5h4.5V7h-4V6.5h4z"/><\/svg>
                            <span>${allStats.ngxDynamicFormBuilderStats.duration}<\/span>`;
  }

  // Update nest-permissions-seed stars badge
  const nestPermissionsSeedStarsElement = document.getElementById('github-nest-permissions-seed-stars');
  if (nestPermissionsSeedStarsElement) {
    const starsWord = getRussianDeclension(allStats.nestPermissionsSeedStats.stars, ['звезда', 'звезды', 'звезд']);
    nestPermissionsSeedStarsElement.textContent = `${allStats.nestPermissionsSeedStats.stars} ${starsWord}`;
  }

  // Update nest-permissions-seed commit count badge
  const nestPermissionsSeedCommitsElement = document.getElementById('github-nest-permissions-seed-commits');
  if (nestPermissionsSeedCommitsElement) {
    const commitWord = getRussianDeclension(allStats.nestPermissionsSeedStats.commits, [
      'коммит',
      'коммита',
      'коммитов',
    ]);
    nestPermissionsSeedCommitsElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M13 3.997V3a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v1l1.5 1v8.5a2.5 2.5 0 0 0 2.5 2.5h4a2.5 2.5 0 0 0 2.5-2.5V4.997L13 3.997zM11.5 4H11v8.5a1.5 1.5 0 0 1-1.5 1.5h-4A1.5 1.5 0 0 1 4 12.5V4H4.5L5 4.5V12h1V8.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 .5.5V12h1V4.5l.5-.5zM6 5h1v1H6V5zm2 0h1v1H8V5zm2 0h1v1h-1V5z"/><\/svg>
                            <span>${allStats.nestPermissionsSeedStats.commits} ${commitWord}<\/span>`;
  }

  // Update nest-permissions-seed duration badge
  const nestPermissionsSeedDurationElement = document.getElementById('github-nest-permissions-seed-duration');
  if (nestPermissionsSeedDurationElement) {
    nestPermissionsSeedDurationElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 13c-3.308 0-6-2.692-6-6s2.692-6 6-6 6 2.692 6 6-2.692 6-6 6zm.5-10.5H7v5h4.5V7h-4V6.5h4z"/><\/svg>
                            <span>${allStats.nestPermissionsSeedStats.duration}<\/span>`;
  }

  // Update class-validator-multi-lang stars badge
  const classValidatorMultiLangStarsElement = document.getElementById('github-class-validator-multi-lang-stars');
  if (classValidatorMultiLangStarsElement) {
    const starsWord = getRussianDeclension(allStats.classValidatorMultiLangStats.stars, ['звезда', 'звезды', 'звезд']);
    classValidatorMultiLangStarsElement.textContent = `${allStats.classValidatorMultiLangStats.stars} ${starsWord}`;
  }

  // Update class-validator-multi-lang duration badge
  const classValidatorMultiLangDurationElement = document.getElementById('github-class-validator-multi-lang-duration');
  if (classValidatorMultiLangDurationElement) {
    classValidatorMultiLangDurationElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 13c-3.308 0-6-2.692-6-6s2.692-6 6-6 6 2.692 6 6-2.692 6-6 6zm.5-10.5H7v5h4.5V7h-4V6.5h4z"/><\/svg>
                            <span>${allStats.classValidatorMultiLangStats.duration}<\/span>`;
  }

  // Update typegraphql-prisma-nestjs stars badge
  const typeGraphqlPrismaNestjsStarsElement = document.getElementById('github-typegraphql-prisma-nestjs-stars');
  if (typeGraphqlPrismaNestjsStarsElement) {
    const starsWord = getRussianDeclension(allStats.typeGraphqlPrismaNestjsStats.stars, ['звезда', 'звезды', 'звезд']);
    typeGraphqlPrismaNestjsStarsElement.textContent = `${allStats.typeGraphqlPrismaNestjsStats.stars} ${starsWord}`;
  }

  // Update typegraphql-prisma-nestjs duration badge
  const typeGraphqlPrismaNestjsDurationElement = document.getElementById('github-typegraphql-prisma-nestjs-duration');
  if (typeGraphqlPrismaNestjsDurationElement) {
    typeGraphqlPrismaNestjsDurationElement.innerHTML = `
                            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 16 16"><path d="M8 1C4.134 1 1 4.134 1 8s3.134 7 7 7 7-3.134 7-7-3.134-7-7-7zm0 13c-3.308 0-6-2.692-6-6s2.692-6 6-6 6 2.692 6 6-2.692 6-6 6zm.5-10.5H7v5h4.5V7h-4V6.5h4z"/><\/svg>
                            <span>${allStats.typeGraphqlPrismaNestjsStats.duration}<\/span>`;
  }
}

// Function to get proper Russian declension for numbers
function getRussianDeclension(number, words) {
  // words array should contain 3 forms: [1, 2-4, 5-20]
  // e.g., ['участник', 'участника', 'участников']
  number = Math.abs(number);
  if (Number.isInteger(number)) {
    const lastDigit = number % 10;
    const lastTwoDigits = number % 100;
    // Exceptions for 11-19
    if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
      return words[2];
    }
    // 1
    if (lastDigit === 1) {
      return words[0];
    }
    // 2, 3, 4
    if (lastDigit >= 2 && lastDigit <= 4) {
      return words[1];
    }
  }
  // 0, 5-9, and decimals
  return words[2];
}

// Function to update Telegram chat display with data
function updateTelegramChatDisplay(chatId, data) {
  const element = document.getElementById(`telegram-${chatId}`);
  if (element) {
    // Parse the number of members
    const membersCount = parseInt(data.members.replace(/[^\d]/g, '')) || 0;
    // For channels, display "subscribers" instead of "участников"
    if (chatId === 'kaufman_log') {
      const subscribersWord = getRussianDeclension(membersCount, ['подписчик', 'подписчика', 'подписчиков']);
      element.textContent = `${data.members} ${subscribersWord}`;
    } else {
      const membersWord = getRussianDeclension(membersCount, ['участник', 'участника', 'участников']);
      element.textContent = `${data.members} ${membersWord}`;
    }
  }
}

function updateTelegramChatsDisplay(allStats) {
  // Fetch data for all Telegram channels
  const telegramChannelIds = [
    'nest_ru',
    'nest_basic',
    'nest_random',
    'prisma_ru',
    'typeorm_ru',
    'nestjs_jobs',
    'nxdev_ru',
    'angular_universal_ru',
    'kaufman_log',
  ];
  telegramChannelIds.forEach(async (chatId) => {
    try {
      const { data } = allStats.telegramDataStats.find((channel) => channel.id === chatId) || { data: null };
      if (data) {
        // Update display
        updateTelegramChatDisplay(chatId, data);
      }
    } catch (error) {
      console.error(`Failed to fetch data for ${chatId}:`, error);
    }
  });
}

// Update Dev.to badges with hardcoded data
function updateDevToBadges(allStats) {
  // Update articles count
  const articlesElement = document.getElementById('devto-articles');
  if (articlesElement) {
    const articlesWord = getRussianDeclension(allStats.devToStats.articles, ['статья', 'статьи', 'статей']);
    articlesElement.textContent = `${allStats.devToStats.articles} ${articlesWord}`;
  }
  // Update followers count
  const followersElement = document.getElementById('devto-followers');
  if (followersElement) {
    const followersWord = getRussianDeclension(allStats.devToStats.followers, [
      'подписчик',
      'подписчика',
      'подписчиков',
    ]);
    followersElement.textContent = `${allStats.devToStats.followers.toLocaleString()} ${followersWord}`;
  }
  // Update views count
  const viewsElement = document.getElementById('devto-views');
  if (viewsElement) {
    // Format large numbers (e.g., 50000 -> 50K)
    let viewsText = allStats.devToStats.views.toLocaleString();
    let viewsWord = getRussianDeclension(allStats.devToStats.views, ['просмотр', 'просмотра', 'просмотров']);
    if (allStats.devToStats.views >= 1000) {
      viewsText = `${Math.round(allStats.devToStats.views / 1000)}K`;
      viewsWord = 'просмотров'; // Always use plural for thousands
    }
    viewsElement.textContent = `${viewsText} ${viewsWord}`;
  }
  // Update reactions count
  const reactionsElement = document.getElementById('devto-reactions');
  if (reactionsElement) {
    // Format large numbers (e.g., 1500 -> 1.5K)
    let reactionsText = allStats.devToStats.reactions.toLocaleString();
    let reactionsWord = getRussianDeclension(allStats.devToStats.reactions, ['реакция', 'реакции', 'реакций']);
    if (allStats.devToStats.reactions >= 1000) {
      reactionsText = `${(allStats.devToStats.reactions / 1000).toFixed(1)}K`;
      reactionsWord = 'реакций'; // Always use plural for thousands
    }
    reactionsElement.textContent = `${reactionsText} ${reactionsWord}`;
  }
}

// Update Habr badges with hardcoded data
function updateHabrBadges(allStats) {
  // Update articles count
  const articlesElement = document.getElementById('habr-articles');
  if (articlesElement) {
    const articlesWord = getRussianDeclension(allStats.habrStats.articles, ['статья', 'статьи', 'статей']);
    articlesElement.textContent = `${allStats.habrStats.articles} ${articlesWord}`;
  }
  // Update followers count
  const followersElement = document.getElementById('habr-followers');
  if (followersElement) {
    const followersWord = getRussianDeclension(allStats.habrStats.followers, [
      'подписчик',
      'подписчика',
      'подписчиков',
    ]);
    followersElement.textContent = `${allStats.habrStats.followers.toLocaleString()} ${followersWord}`;
  }
  // Update karma count
  const karmaElement = document.getElementById('habr-karma');
  if (karmaElement) {
    karmaElement.textContent = `карма - ${allStats.habrStats.karma.toLocaleString()}`;
  }
}

// Update NPM badges
function updateNpmBadges(allStats) {
  const npmDownloads = document.getElementById('npm-downloads-nestjs-mod');
  if (npmDownloads) {
    const downloadsCount = allStats.npmNestjsModStats.downloads;
    const formattedDownloads = downloadsCount.toLocaleString();
    const downloadsWord = getRussianDeclension(downloadsCount, ['загрузка', 'загрузки', 'загрузок']);
    const downloadsText = `${formattedDownloads} ${downloadsWord}/мес`;
    npmDownloads.textContent = downloadsText;
  }
}
