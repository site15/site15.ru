/**
 * Trend badges for every statistic on the landing page.
 *
 * Разметка бейджа отмечает метрику атрибутом data-trend-key="level1|level2|level3"
 * (ключи совпадают с metricsDynamic/metricsDynamicHistory на бэкенде). Скрипт
 * собирает такие элементы, одним запросом тянет историю
 * (GET /api/landing/metric-history) и вешает в правый верхний угол бейджа круглый
 * переключатель: ↑ рост, ↓ спад, ★ без изменений — сравнение последнего
 * значения с предыдущим. Клик открывает модалку с пятью последними значениями.
 *
 * Данные только из БД: история пишется в момент, когда значение меняется,
 * поэтому даты в модалке — даты изменений, а не равные интервалы опроса.
 */
(function () {
    'use strict';

    // Как в video-player.js/form.js: на локальном хостинге сервер на 3000 порту.
    var API_BASE = window.location.href.indexOf('localhost') !== -1
        ? 'http://localhost:3000/api'
        : 'https://site15.ru/api';

    var POINTS_LIMIT = 5;
    var KEYS_PER_REQUEST = 20;
    // Бейдж вешаем на «чип»: сам элемент либо ближайший контейнер-плашка.
    var HOST_SELECTOR = 'a, .inline-flex, .flex';

    var ICONS = { up: '\u2191', down: '\u2193', flat: '\u2605' };
    var DIRECTIONS = { up: 'рост', down: 'спад', flat: 'без изменений' };

    var LEVEL1_TITLES = {
        githubStats: 'GitHub',
        kaufmanbotStats: 'KaufmanBot',
        nestjsModStats: 'nestjs-mod',
        ngxDynamicFormBuilderStats: 'ngx-dynamic-form-builder',
        nestPermissionsSeedStats: 'nest-permissions-seed',
        typeGraphqlPrismaNestjsStats: 'typegraphql-prisma-nestjs',
        classValidatorMultiLangStats: 'class-validator-multi-lang',
        myDashboardStats: 'my-dashboard',
        ragSystemStats: 'rag-system',
        opworkStats: 'opwork',
        devToStats: 'Dev.to',
        habrStats: 'Habr',
        npmNestjsModStats: 'npm nestjs-mod',
        telegramDataStats: 'Telegram',
        videoStats: 'Видео'
    };

    var LEVEL2_TITLES = {
        rucken: 'Rucken',
        user: 'профиль',
        org: 'организация'
    };

    var PROVIDER_TITLES = { youtube: 'YouTube', rutube: 'Rutube', vk: 'VK Видео' };

    var LEVEL3_TITLES = {
        stars: 'звёзды',
        totalStars: 'всего звёзд',
        commits: 'коммиты',
        repos: 'репозитории',
        followers: 'подписчики',
        members: 'участники',
        online: 'онлайн',
        views: 'просмотры',
        likes: 'лайки',
        reactions: 'реакции',
        articles: 'статьи',
        karma: 'карма',
        downloads: 'загрузки',
        duration: 'длительность',
        commitDuration: 'длительность коммитов'
    };

    var STYLES = [
        '.site15-trend-host{position:relative;}',
        '.site15-trend-badge{position:absolute;top:-9px;right:-9px;width:18px;height:18px;',
        'display:flex;align-items:center;justify-content:center;border-radius:9999px;',
        'border:2px solid #111;background:#fff;font:700 11px/1 ui-monospace,SFMono-Regular,Menlo,monospace;',
        'cursor:pointer;z-index:30;box-shadow:0 1px 0 rgba(0,0,0,.35);user-select:none;padding:0;}',
        '.site15-trend-badge:hover{transform:scale(1.15);}',
        '.site15-trend-badge--up{color:#15803d;background:#ecfdf5;}',
        '.site15-trend-badge--down{color:#b91c1c;background:#fef2f2;}',
        '.site15-trend-badge--flat{color:#1d4ed8;background:#eff6ff;}',
        '.site15-trend-modal{position:fixed;inset:0;z-index:120;display:flex;align-items:center;',
        'justify-content:center;background:rgba(0,0,0,.55);padding:1rem;}',
        '.site15-trend-modal--hidden{display:none;}',
        '.site15-trend-modal__panel{width:100%;max-width:420px;background:#fff;border:3px solid #111;',
        'box-shadow:8px 8px 0 #111;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;}',
        '.site15-trend-modal__header{display:flex;align-items:center;justify-content:space-between;',
        'gap:.75rem;padding:.6rem .75rem;background:#fde047;border-bottom:3px solid #111;}',
        '.site15-trend-modal__title{font-weight:700;font-size:13px;line-height:1.3;}',
        '.site15-trend-modal__close{flex:none;width:26px;height:26px;border:2px solid #111;background:#fff;',
        'font-weight:700;font-size:14px;line-height:1;cursor:pointer;}',
        '.site15-trend-modal__body{padding:.25rem .75rem .75rem;}',
        '.site15-trend-row{display:flex;align-items:center;gap:.6rem;padding:.5rem 0;',
        'border-bottom:1px dashed rgba(0,0,0,.25);font-size:13px;}',
        '.site15-trend-row:last-child{border-bottom:0;}',
        '.site15-trend-row__icon{flex:none;width:22px;height:22px;border-radius:9999px;border:2px solid #111;',
        'display:flex;align-items:center;justify-content:center;font-weight:700;font-size:12px;}',
        '.site15-trend-row__icon--up{color:#15803d;background:#ecfdf5;}',
        '.site15-trend-row__icon--down{color:#b91c1c;background:#fef2f2;}',
        '.site15-trend-row__icon--flat{color:#1d4ed8;background:#eff6ff;}',
        '.site15-trend-row__value{font-weight:700;}',
        '.site15-trend-row__date{margin-left:auto;color:rgba(0,0,0,.6);font-size:12px;}',
        '.site15-trend-modal__hint{margin-top:.6rem;font-size:11px;color:rgba(0,0,0,.55);}'
    ].join('');

    var cache = {}; // key -> points[]
    var modal = null;

    /* ---------------- утилиты ---------------- */

    function ensureStyles() {
        if (document.getElementById('site15-trend-styles')) return;
        var style = document.createElement('style');
        style.id = 'site15-trend-styles';
        style.textContent = STYLES;
        document.head.appendChild(style);
    }

    function parseKey(key) {
        var parts = String(key || '').split('|');
        if (parts.length !== 3 || !parts[0] || !parts[2]) return null;
        return { level1: parts[0], level2: parts[1], level3: parts[2] };
    }

    /**
     * Число из значения метрики. Сокращения и нечисловые строки («2 года…»,
     * «1,2 млн») не угадываем — возвращаем null, тренд по ним не рисуем.
     */
    function toNumber(value) {
        if (value === null || value === undefined) return null;
        var text = String(value).replace(/[\u00a0\s]/g, '').replace(/[\u2212\u2013\u2014]/g, '-');
        if (!/^-?\d+(\.\d+)?$/.test(text)) return null;
        return Number(text);
    }

    function formatValue(value) {
        var n = toNumber(value);
        if (n === null) return String(value === null || value === undefined ? '—' : value);
        try { return new Intl.NumberFormat('ru-RU').format(n); } catch (e) { return String(n); }
    }

    function formatDateTime(iso) {
        try {
            return new Intl.DateTimeFormat('ru-RU', {
                day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
            }).format(new Date(iso));
        } catch (e) { return String(iso || ''); }
    }

    /** Рост/спад/без изменений: самое свежее значение против предыдущего. */
    function directionOf(points, level3) {
        if (!points || !points.length) return 'flat'; // Если истории нет, считаем что значение не менялось (★)
        if (points.length < 2) return 'flat';
        var current = toNumber(points[0].value);
        var previous = toNumber(points[1].value);
        if (current === null || previous === null) {
            if (points[0].value === points[1].value) return 'flat';
            // Длительности («2 года 3 месяца 15 дней») числами не являются, но
            // всегда растут: изменение = рост.
            return /duration$/i.test(level3 || '') ? 'up' : null;
        }
        if (current > previous) return 'up';
        if (current < previous) return 'down';
        return 'flat';
    }

    /** Направление i-й точки относительно следующей (более старой). */
    function directionAt(points, index, level3) {
        if (index + 1 >= points.length) return 'flat';
        var direction = directionOf(points.slice(index), level3);
        return direction || 'flat';
    }

    function humanTitle(key) {
        var parsed = parseKey(key);
        if (!parsed) return key;
        var chunks = [LEVEL1_TITLES[parsed.level1] || parsed.level1];
        if (parsed.level2) {
            if (parsed.level1 === 'videoStats') {
                var provider = /^([a-z]+):/.exec(parsed.level2);
                chunks.push(provider ? PROVIDER_TITLES[provider[1]] || provider[1] : parsed.level2);
            } else {
                chunks.push(LEVEL2_TITLES[parsed.level2] || parsed.level2);
            }
        }
        chunks.push(LEVEL3_TITLES[parsed.level3] || parsed.level3);
        return chunks.join(' · ');
    }

    /* ---------------- запрос истории ---------------- */

    /**
     * Нули и пустые значения — шум от сбоев опроса площадок (пришёл пустой ответ,
     * парсер не нашёл число). Бэкенд их вырезает, но фильтруем и здесь: иначе
     * старая сборка сервера нарисует «рост» после обнуления счётчика.
     */
    function isNoisePoint(point) {
        if (!point) return true;
        var value = point.value;
        if (value === null || value === undefined || String(value).trim() === '') return true;
        var n = toNumber(value);
        return n !== null && n === 0;
    }

    function fetchHistory(keys) {
        var chunks = [];
        for (var i = 0; i < keys.length; i += KEYS_PER_REQUEST) {
            chunks.push(keys.slice(i, i + KEYS_PER_REQUEST));
        }
        return Promise.all(chunks.map(function (chunk) {
            var url = API_BASE + '/landing/metric-history?limit=' + POINTS_LIMIT +
                '&keys=' + encodeURIComponent(chunk.join(','));
            return fetch(url)
                .then(function (response) { return response.ok ? response.json() : null; })
                .then(function (data) {
                    if (!data || !data.items) return;
                    data.items.forEach(function (item) {
                        if (!item || !item.key) return;
                        cache[item.key] = (item.points || []).filter(function (point) {
                            return !isNoisePoint(point);
                        });
                    });
                })
                .catch(function () { /* бэкенд недоступен — бейджей просто не будет */ });
        }));
    }

    /* ---------------- бейдж на бейдже статистики ---------------- */

    /** Плашка, на которую вешаем круглешек: сам элемент или ближайший чип-контейнер. */
    function hostFor(el) {
        if (!el || !el.closest) return el;
        return el.closest(HOST_SELECTOR) || el;
    }

    function paint(el) {
        var key = el.getAttribute('data-trend-key');
        var host = hostFor(el);
        if (!key || !host || !parseKey(key)) {
            removeBadge(el);
            return;
        }

        var existing = host.querySelector('.site15-trend-badge');
        if (existing && existing.getAttribute('data-trend-key') !== key) {
            host.removeChild(existing);
            existing = null;
        }

        var points = cache[key];
        var direction = directionOf(points, parseKey(key).level3);
        if (!direction) {
            if (existing) host.removeChild(existing);
            return;
        }

        if (!existing) {
            host.classList.add('site15-trend-host');
            if (getComputedStyle(host).position === 'static') {
                host.style.position = 'relative';
            }
            existing = document.createElement('span');
            existing.className = 'site15-trend-badge';
            existing.setAttribute('role', 'button');
            existing.setAttribute('tabindex', '0');
            existing.setAttribute('data-trend-key', key);
            bindBadge(existing);
            host.appendChild(existing);
        }

        existing.className = 'site15-trend-badge site15-trend-badge--' + direction;
        existing.setAttribute('data-trend-key', key);
        existing.textContent = ICONS[direction];
        var title = humanTitle(key);
        existing.setAttribute('aria-label', 'Тренд: ' + DIRECTIONS[direction] + ' · ' + title);
        existing.title = 'Тренд: ' + DIRECTIONS[direction] + ' · ' + title + ' · последние значения';
    }

    function removeBadge(el) {
        var host = hostFor(el);
        var badge = host && host.querySelector('.site15-trend-badge');
        if (badge) host.removeChild(badge);
    }

    function bindBadge(badge) {
        function open(ev) {
            // Чип-бейджи часто являются ссылками — клик не должен никуда вести.
            ev.preventDefault();
            ev.stopPropagation();
            openModal(badge.getAttribute('data-trend-key'));
        }
        badge.addEventListener('click', open);
        badge.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'Spacebar') open(ev);
        });
    }

    function missingKeys(elements) {
        var missing = [];
        elements.forEach(function (el) {
            var key = el.getAttribute('data-trend-key');
            if (!key || !parseKey(key)) return;
            if (missing.indexOf(key) !== -1) return;
            if (Object.prototype.hasOwnProperty.call(cache, key)) return;
            missing.push(key);
        });
        return missing;
    }

    function paintOrFetch(elements) {
        if (!elements.length) return;
        ensureStyles();

        var missing = missingKeys(elements);
        if (!missing.length) {
            elements.forEach(paint);
            return;
        }
        fetchHistory(missing).then(function () {
            // Пока летел запрос, ключ мог смениться (switchVideo) — paint() читает
            // актуальный data-trend-key, поэтому устаревшие бейджи не остаются.
            elements.forEach(paint);
        });
    }

    /**
     * Отложенная перерисовка одного элемента: video-player вызывает refresh()
     * сразу для трёх чипов площадки — запрос истории должен быть один, а не три.
     */
    var queued = [];
    var queueTimer = null;

    function queueElement(el) {
        if (!el) return;
        ensureStyles();
        if (queued.indexOf(el) === -1) queued.push(el);
        if (queueTimer) return;
        queueTimer = setTimeout(function () {
            queueTimer = null;
            var elements = queued;
            queued = [];
            paintOrFetch(elements);
        }, 0);
    }

    /* ---------------- модалка с последними значениями ---------------- */

    function ensureModal() {
        if (modal) return modal;
        var overlay = document.createElement('div');
        overlay.className = 'site15-trend-modal site15-trend-modal--hidden';
        overlay.innerHTML =
            '<div class="site15-trend-modal__panel" role="dialog" aria-modal="true" aria-labelledby="site15TrendTitle">' +
            '<div class="site15-trend-modal__header">' +
            '<span class="site15-trend-modal__title" id="site15TrendTitle"></span>' +
            '<button type="button" class="site15-trend-modal__close" aria-label="Закрыть">&times;</button>' +
            '</div>' +
            '<div class="site15-trend-modal__body"></div>' +
            '</div>';
        document.body.appendChild(overlay);

        var body = overlay.querySelector('.site15-trend-modal__body');
        overlay.addEventListener('click', function (ev) {
            if (ev.target === overlay) closeModal();
        });
        overlay.querySelector('.site15-trend-modal__close').addEventListener('click', closeModal);
        document.addEventListener('keydown', function (ev) {
            if (ev.key === 'Escape') closeModal();
        });

        modal = { overlay: overlay, title: overlay.querySelector('.site15-trend-modal__title'), body: body };
        return modal;
    }

    function openModal(key) {
        var refs = ensureModal();
        var points = cache[key] || [];
        var parsed = parseKey(key);
        var metricLevel3 = parsed ? parsed.level3 : '';
        refs.title.textContent = humanTitle(key);
        refs.body.textContent = '';

        if (!points.length) {
            var empty = document.createElement('div');
            empty.className = 'site15-trend-modal__hint';
            empty.textContent = 'Истории ещё нет — значение не менялось с начала наблюдения.';
            refs.body.appendChild(empty);
        }

        points.forEach(function (point, index) {
            var direction = directionAt(points, index, metricLevel3);
            var row = document.createElement('div');
            row.className = 'site15-trend-row';

            var icon = document.createElement('span');
            icon.className = 'site15-trend-row__icon site15-trend-row__icon--' + direction;
            icon.textContent = ICONS[direction];
            icon.title = DIRECTIONS[direction];

            var value = document.createElement('span');
            value.className = 'site15-trend-row__value';
            value.textContent = formatValue(point.value);

            var date = document.createElement('span');
            date.className = 'site15-trend-row__date';
            date.textContent = formatDateTime(point.createdAt);

            row.appendChild(icon);
            row.appendChild(value);
            row.appendChild(date);
            refs.body.appendChild(row);
        });

        if (points.length) {
            var hint = document.createElement('div');
            hint.className = 'site15-trend-modal__hint';
            hint.textContent = 'Показаны последние ' + points.length +
                ' состояний метрики; дата — момент, когда значение изменилось.';
            refs.body.appendChild(hint);
        }

        refs.overlay.classList.remove('site15-trend-modal--hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        if (!modal) return;
        modal.overlay.classList.add('site15-trend-modal--hidden');
        document.body.style.overflow = '';
    }

    /* ---------------- инициализация ---------------- */

    function collectElements(root) {
        var found = (root || document).querySelectorAll('[data-trend-key]');
        return Array.prototype.slice.call(found);
    }

    function init(root) {
        paintOrFetch(collectElements(root));
    }

    window.statsTrend = {
        /** Перерисовать бейдж одного элемента (чипы площадок меняют метрику при switchVideo). */
        refresh: queueElement,
        init: init,
        /** Сбросить кэш истории — данные снова поедут с бэкенда. */
        clearCache: function () { cache = {}; }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function () { init(document); });
    } else {
        init(document);
    }
})();
