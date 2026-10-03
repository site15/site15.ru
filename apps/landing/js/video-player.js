/**
 * Adaptive video embeds for the landing page.
 *
 * Some visitors (notably from Russia) cannot reach YouTube. On first visit
 * we probe YouTube and mount either the YouTube or the Rutube player. The
 * user can always override the choice by clicking a platform chip — the
 * manual selection is persisted in localStorage for the next visits.
 */
(function () {
    'use strict';

    // YouTube в России троттлится, но Google-домены (ytimg.com) часто остаются
    // доступны, поэтому проверять нужно именно youtube.com — грузим служебный
    // iframe с реальным embed-URL и ждём события load. Если за время таймаута
    // iframe не загрузился (Roskomnadzor-троттлинг/DNS-block) — считаем,
    // что YouTube недоступен и переходим на Rutube.
    var PROBE_TIMEOUT_MS = 3500;
    var STORAGE_PREFIX = 'site15:video:';
    var PROVIDER_LABELS = { youtube: 'YouTube', rutube: 'Rutube', vk: 'VK Видео' };
    // Как в form.js: на локальном хостинге сервер на 3000 порту, иначе — прод.
    var API_BASE = window.location.href.indexOf('localhost') !== -1
        ? 'http://localhost:3000/api'
        : 'https://site15.ru/api';

    function storageGet(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { /* quota / private mode */ }
    }
    function storageRemove(key) {
        try { window.localStorage.removeItem(key); } catch (e) { /* noop */ }
    }

    function probeYouTube(videoId) {
        return new Promise(function (resolve) {
            if (!document.body) {
                resolve(false);
                return;
            }
            var frame = document.createElement('iframe');
            var settled = false;

            function finish(ok) {
                if (settled) return;
                settled = true;
                clearTimeout(timer);
                frame.onload = null;
                frame.onerror = null;
                if (frame.parentNode) frame.parentNode.removeChild(frame);
                resolve(ok);
            }

            var timer = setTimeout(function () {
                finish(false);
            }, PROBE_TIMEOUT_MS);

            // 1x1 off-screen; user never sees it.
            frame.setAttribute('aria-hidden', 'true');
            frame.setAttribute('tabindex', '-1');
            frame.setAttribute('referrerpolicy', 'no-referrer');
            frame.style.cssText =
                'position:absolute;width:1px;height:1px;left:-9999px;top:-9999px;border:0;visibility:hidden;';
            frame.onload = function () {
                // `load` срабатывает и на error-page — поэтому дополнительно
                // пробуем прочитать contentWindow (бросит XSS в нормальном
                // случае, но при сетевой ошибке вернётся пустой about:blank).
                try {
                    var href = frame.contentWindow && frame.contentWindow.location.href;
                    if (href && href.indexOf('about:') === 0) {
                        finish(false);
                        return;
                    }
                } catch (e) {
                    /* cross-origin: значит youtube реально отдал документ */
                }
                finish(true);
            };
            frame.onerror = function () {
                finish(false);
            };
            frame.src = 'https://www.youtube.com/embed/' + encodeURIComponent(videoId) +
                '?enablejsapi=0&playsinline=1&probe=' + Date.now();
            document.body.appendChild(frame);
        });
    }

    // Результат пробирования кэшируется ПО КАЖДОМУ видео: переключение
    // между роликами на главной переиспользует уже готовый ответ и не
    // ждёт новую сетевую проверку.
    var probeCache = {};

    function probeYouTubeOnce(videoId) {
        if (probeCache[videoId]) return probeCache[videoId];
        var promise = probeYouTube(videoId).catch(function () {
            delete probeCache[videoId];
            return false;
        });
        probeCache[videoId] = promise;
        return promise;
    }

    function createIframe(src, title, allow) {
        var iframe = document.createElement('iframe');
        iframe.src = src;
        iframe.title = title;
        iframe.setAttribute('allow', allow);
        iframe.setAttribute('frameborder', '0');
        iframe.className = 'absolute inset-0 w-full h-full';
        return iframe;
    }

    function parseVkId(vkId) {
        // "-241775994_456239017" → { oid: '-241775994', id: '456239017' }
        var parts = String(vkId).split('_');
        return { oid: parts[0], id: parts[1] };
    }

    function mountPlayer(container, provider, ids) {
        container.innerHTML = '';
        var iframe;
        if (provider === 'youtube') {
            iframe = createIframe(
                'https://www.youtube-nocookie.com/embed/' + encodeURIComponent(ids.youtubeId) + '?rel=0&modestbranding=1',
                'Видео с YouTube',
                'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture'
            );
        } else if (provider === 'vk') {
            var vk = parseVkId(ids.vkId);
            iframe = createIframe(
                'https://vk.com/video_ext.php?oid=' + encodeURIComponent(vk.oid) +
                    '&id=' + encodeURIComponent(vk.id) + '&hd=2',
                'Видео с VK',
                'autoplay; encrypted-media; fullscreen; picture-in-picture; screen-wake-lock'
            );
        } else {
            iframe = createIframe(
                'https://rutube.ru/play/embed/' + encodeURIComponent(ids.rutubeId) + '/',
                'Видео с Rutube',
                'clipboard-write; autoplay; fullscreen; picture-in-picture'
            );
        }
        container.appendChild(iframe);
    }

    function renderState(card, state, ids) {
        var provider = state.provider;
        var source = state.source;

        var badge = card.querySelector('[data-video-badge]');
        if (badge) {
            var text;
            if (!provider) {
                text = 'Определяем…';
            } else if (source === 'manual') {
                text = 'Вручную: ' + (PROVIDER_LABELS[provider] || provider);
            } else if (provider === 'youtube') {
                text = 'Играет YouTube (авто)';
            } else {
                text = 'YouTube недоступен — играет Rutube';
            }
            badge.textContent = text;
            badge.classList.remove('hidden', 'bg-neo-yellow', 'bg-neo-green', 'bg-neo-purple');
            if (!provider) {
                badge.classList.add('bg-neo-yellow');
            } else {
                badge.classList.add(provider === 'youtube' ? 'bg-neo-green' : 'bg-neo-purple');
            }
        }

        var container = card.querySelector('[data-youtube-id][data-rutube-id]');
        if (container) {
            container.setAttribute('data-active-provider', provider || '');
        }

        Array.prototype.forEach.call(card.querySelectorAll('[data-video-platform]'), function (el) {
            var isActive = el.getAttribute('data-video-platform') === provider;
            el.classList.toggle('opacity-100', isActive);
            el.classList.toggle('opacity-60', !isActive);
            el.classList.toggle('ring-4', isActive);
            el.classList.toggle('ring-neo-black', isActive);
            el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        var reset = card.querySelector('[data-video-reset]');
        if (reset) {
            reset.classList.toggle('hidden', source !== 'manual');
        }
    }

    function setProvider(card, provider, source, ids) {
        var container = card.querySelector('[data-youtube-id][data-rutube-id]');
        if (!container) return;
        // Защита от устаревших асинхронных колбэков: если карточку уже
        // переключили на другое видео (switchVideo), чужой iframe не монтируем.
        if (ids && ids.youtubeId && container.getAttribute('data-youtube-id') !== ids.youtubeId) return;
        card._videoState = { provider: provider, source: source };
        if (provider) {
            mountPlayer(container, provider, ids);
        }
        renderState(card, card._videoState, ids);
    }

    function persistManual(youtubeId, provider) {
        storageSet(STORAGE_PREFIX + youtubeId, provider);
    }
    function clearManual(youtubeId) {
        storageRemove(STORAGE_PREFIX + youtubeId);
    }
    function readManual(youtubeId) {
        var v = storageGet(STORAGE_PREFIX + youtubeId);
        return (v === 'youtube' || v === 'rutube' || v === 'vk') ? v : null;
    }

    // Актуальные id-шники читаем из DOM в момент события: после switchVideo
    // атрибуты контейнера меняются, и «устаревшие» обработчики становятся
    // безвредны — они отработают с теми же данными, что и новые.
    function currentIds(card) {
        var container = card.querySelector('[data-youtube-id][data-rutube-id]');
        return {
            youtubeId: container ? container.getAttribute('data-youtube-id') : null,
            rutubeId: container ? container.getAttribute('data-rutube-id') : null,
            vkId: container ? container.getAttribute('data-vk-id') : null
        };
    }

    function bindCardControls(card) {
        Array.prototype.forEach.call(card.querySelectorAll('[data-video-platform]'), function (el) {
            el.addEventListener('click', function (ev) {
                // Ctrl/Cmd/Shift/Alt/average-click — штатное поведение браузера
                // (открыть в новой вкладке), ничего не делаем.
                if (ev.defaultPrevented) return;
                if (ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
                ev.preventDefault();
                var provider = el.getAttribute('data-video-platform');
                var ids = currentIds(card);
                persistManual(ids.youtubeId, provider);
                setProvider(card, provider, 'manual', ids);
            });
        });

        var reset = card.querySelector('[data-video-reset]');
        if (reset) {
            reset.addEventListener('click', function (ev) {
                if (ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
                ev.preventDefault();
                var ids = currentIds(card);
                clearManual(ids.youtubeId);
                // Запускаем авто-выбор заново.
                setProvider(card, null, 'auto', ids);
                delete probeCache[ids.youtubeId]; // форсируем свежую пробу
                probeYouTubeOnce(ids.youtubeId).then(function (youtubeOk) {
                    var provider = youtubeOk ? 'youtube' : 'rutube';
                    if (readManual(ids.youtubeId)) return; // пользователь уже успел выбрать
                    var cur = currentIds(card);
                    if (cur.youtubeId !== ids.youtubeId) return;
                    setProvider(card, provider, 'auto', cur);
                });
            });
        }
    }

    function formatCount(n) {
        try {
            return new Intl.NumberFormat('ru-RU').format(n);
        } catch (e) {
            return String(n);
        }
    }

    /**
   * Просмотры/лайки берутся с нашего бэкенда (/api/landing/video-stats):
   * он ходит к площадкам сервер-side (CORS не даёт напрямую), кэширует в БД
   * на час (чтобы не словить бан) и пишет историю — тренд по видео.
   * Ошибки игнорируем молча — счётчики не критичны.
   */
    function loadVideoStats(card, ids, gen) {
        var params = [];
        if (ids.youtubeId) params.push('yt=' + encodeURIComponent(ids.youtubeId));
        if (ids.rutubeId) params.push('rutube=' + encodeURIComponent(ids.rutubeId));
        if (ids.vkId) params.push('vk=' + encodeURIComponent(ids.vkId));
        if (!params.length) return;

        var slots = {};
        Array.prototype.forEach.call(card.querySelectorAll('[data-video-platform]'), function (el) {
            var slot = el.querySelector('[data-video-stats]');
            if (slot) slots[el.getAttribute('data-video-platform')] = slot;
        });

        fetch(API_BASE + '/landing/video-stats?' + params.join('&'))
            .then(function (r) { return r.ok ? r.json() : null; })
            .then(function (data) {
                if (!data) return;
                // Пока летел запрос, видео могли переключить — не рисуем чужие счётчики.
                if (gen !== undefined && card._videoGen !== gen) return;
                Object.keys(slots).forEach(function (provider) {
                    var stats = data[provider];
                    if (!stats) return;
                    var parts = [];
                    if (stats.views !== null && stats.views !== undefined) {
                        parts.push(formatCount(stats.views) + ' \uD83D\uDC41\uFE0F');
                    }
                    if (stats.likes !== null && stats.likes !== undefined) {
                        parts.push(formatCount(stats.likes) + ' \uD83D\uDC4D');
                    }
                    if (parts.length) {
                        slots[provider].textContent = '\u00B7 ' + parts.join(' ');
                        slots[provider].classList.remove('hidden');
                    }
                });
            })
            .catch(function () { /* статистика — украшение чипов */ });
    }

    function initVideoCard(card) {
        var container = card.querySelector('[data-youtube-id][data-rutube-id]');
        if (!container) return;

        // Generation counter: prevents stale probe callbacks from overwriting
        // a newer video's iframe when switchVideo() re-initialises the card.
        card._videoGen = (card._videoGen || 0) + 1;
        var myGen = card._videoGen;

        var ids = currentIds(card);

        bindCardControls(card);
        loadVideoStats(card, ids, myGen);

        var manual = readManual(ids.youtubeId);
        if (manual) {
            setProvider(card, manual, 'manual', ids);
            return;
        }

        // Стартовое состояние: показываем «Определяем…», плеер ещё не встроен.
        card._videoState = { provider: null, source: 'auto' };
        renderState(card, card._videoState, ids);

        probeYouTubeOnce(ids.youtubeId).then(function (youtubeOk) {
            // Если карточку уже переинициализировали (switchVideo) — не трогаем.
            if (card._videoGen !== myGen) return;
            // Пользователь мог успеть нажать чип пока шло пробирование.
            if (card._videoState && card._videoState.source === 'manual') return;
            var cur = currentIds(card);
            if (cur.youtubeId !== ids.youtubeId) return;
            var provider = youtubeOk ? 'youtube' : 'rutube';
            setProvider(card, provider, 'auto', cur);
        });
    }

    function initVideoPlayers() {
        var cards = document.querySelectorAll('[data-video-card]');
        Array.prototype.forEach.call(cards, initVideoCard);
    }

    // Expose helpers for the multi-video sidebar on the landing page.
    window.__videoPlayer = {
        initVideoCard: initVideoCard,
        resetProbe: function () {
            probeCache = {};
        },
        probeYouTube: probeYouTubeOnce
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initVideoPlayers);
    } else {
        initVideoPlayers();
    }
})();
