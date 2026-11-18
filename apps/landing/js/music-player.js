/**
 * Adaptive music embeds for the landing page.
 *
 * Альбом лежит на нескольких площадках, но встраиваются iframe'ом только те,
 * у которых нет `X-Frame-Options: deny` (Яндекс Музыка, Spotify, SoundCloud).
 * Какой плеер показать — решает посетитель: ЛКМ по чипу переключает плеер на
 * месте и запоминает выбор в localStorage, Ctrl/⌘/Shift/Alt/средняя кнопка —
 * штатно открывает релиз на площадке в новой вкладке.
 *
 * Пробирование доступности, как в video-player.js, сознательно не делается:
 * у iframe'а площадки событие `load` приходит и на гео-заглушке, и на
 * капче, так что отличить «недоступно в твоём регионе» от «загрузилось»
 * кросс-доменно нельзя. Поэтому выбор всегда остаётся за чипами.
 *
 * Конфигурация albums живёт на бэкенде (GET /api/landing/albums); карточка
 * получает её в `data-music-embeds` как JSON, поэтому плеер всегда читает
 * актуальные данные из DOM, а не из замыкания.
 */
(function () {
    'use strict';

    var STORAGE_PREFIX = 'site15:music:';
    var DEFAULT_HEIGHT = 520;

    function storageGet(key) {
        try { return window.localStorage.getItem(key); } catch (e) { return null; }
    }
    function storageSet(key, value) {
        try { window.localStorage.setItem(key, value); } catch (e) { /* quota / private mode */ }
    }
    function storageRemove(key) {
        try { window.localStorage.removeItem(key); } catch (e) { /* noop */ }
    }

    /** Актуальный конфиг альбома — из DOM в момент события (после switchAlbum старое не рисуем). */
    function currentConfig(card) {
        var holder = card.querySelector('[data-music-player]');
        if (!holder) return null;
        var embeds = [];
        try {
            embeds = JSON.parse(holder.getAttribute('data-music-embeds') || '[]');
        } catch (e) {
            embeds = [];
        }
        return {
            slug: holder.getAttribute('data-music-slug') || '',
            embeds: Array.isArray(embeds) ? embeds : [],
            holder: holder,
        };
    }

    function findEmbed(config, provider) {
        for (var i = 0; i < config.embeds.length; i++) {
            if (config.embeds[i].provider === provider) return config.embeds[i];
        }
        return null;
    }

    function allowFor(provider) {
        if (provider === 'spotify') {
            return 'autoplay; encrypted-media; clipboard-write; fullscreen';
        }
        return 'autoplay; encrypted-media; fullscreen; picture-in-picture';
    }

    function mountPlayer(config, embed) {
        config.holder.innerHTML = '';
        if (!embed) {
            config.holder.innerHTML =
                '<div class="absolute inset-0 flex items-center justify-center text-white font-mono text-sm px-4 text-center">' +
                'Плеер для этой площадки не настроен — откройте релиз по ссылке ниже.</div>';
            return;
        }
        var iframe = document.createElement('iframe');
        iframe.src = embed.embedUrl;
        iframe.title = embed.label + ' — ' + config.slug;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', allowFor(embed.provider));
        iframe.setAttribute('referrerpolicy', 'no-referrer-when-downgrade');
        iframe.className = 'absolute inset-0 w-full h-full';
        config.holder.appendChild(iframe);
    }

    function renderState(card, config, provider, source) {
        var embed = findEmbed(config, provider);

        // Высота подстраивается под площадку: у Яндекса и Spotify трек-лист
        // плотный, у SoundCloud шапка с обложкой — без этого появляется пустота.
        config.holder.style.height = ((embed && embed.height) || DEFAULT_HEIGHT) + 'px';

        Array.prototype.forEach.call(card.querySelectorAll('[data-music-platform]'), function (el) {
            var isActive = el.getAttribute('data-music-platform') === provider;
            el.classList.toggle('opacity-100', isActive);
            el.classList.toggle('opacity-80', !isActive);
            el.classList.toggle('ring-4', isActive);
            el.classList.toggle('ring-neo-black', isActive);
            el.setAttribute('aria-pressed', isActive ? 'true' : 'false');
        });

        var badge = card.querySelector('[data-music-badge]');
        if (badge) {
            badge.textContent = source === 'manual'
                ? 'Ваш выбор: ' + ((embed && embed.label) || provider)
                : 'По умолчанию: ' + ((embed && embed.label) || provider);
            badge.classList.remove('hidden');
        }

        var reset = card.querySelector('[data-music-reset]');
        if (reset) {
            reset.classList.toggle('hidden', source !== 'manual');
        }
    }

    function setProvider(card, provider, source) {
        var config = currentConfig(card);
        if (!config) return;
        var embed = provider ? findEmbed(config, provider) : null;
        // Ключ альбома мог смениться до этого момента (switchAlbum) — чужой
        // iframe не монтируем: provider ищем в актуальном списке embeds.
        if (provider && !embed) return;
        card._musicState = { provider: provider, source: source };
        mountPlayer(config, embed);
        renderState(card, config, provider, source);
    }

    function persistManual(slug, provider) {
        if (slug) storageSet(STORAGE_PREFIX + slug, provider);
    }
    function clearManual(slug) {
        if (slug) storageRemove(STORAGE_PREFIX + slug);
    }
    function readManual(slug) {
        var v = storageGet(STORAGE_PREFIX + slug);
        return v ? String(v) : null;
    }

    function bindCardControls(card) {
        if (card._musicControlsBound) return;
        card._musicControlsBound = true;

        // Делегирование: чипы перерисовываются при смене альбома, поэтому
        // вешать слушателя на каждый элемент нельзя — один на всю карточку.
        card.addEventListener('click', function (ev) {
            var chip = ev.target && ev.target.closest ? ev.target.closest('[data-music-platform]') : null;
            if (chip && card.contains(chip)) {
                // Ctrl/Cmd/Shift/Alt/средняя кнопка — штатное поведение браузера.
                if (ev.defaultPrevented) return;
                if (ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
                ev.preventDefault();
                var config = currentConfig(card);
                if (!config) return;
                var provider = chip.getAttribute('data-music-platform');
                persistManual(config.slug, provider);
                setProvider(card, provider, 'manual');
                return;
            }

            var reset = ev.target && ev.target.closest ? ev.target.closest('[data-music-reset]') : null;
            if (reset && card.contains(reset)) {
                if (ev.button !== 0 || ev.ctrlKey || ev.metaKey || ev.shiftKey || ev.altKey) return;
                ev.preventDefault();
                var resetConfig = currentConfig(card);
                if (!resetConfig) return;
                clearManual(resetConfig.slug);
                initMusicCard(card);
            }
        });
    }

    /**
     * Перерисовать карточку под текущий `data-music-embeds`/`data-music-slug`.
     * Вызывается при загрузке страницы и каждый раз, когда сайдбар сменил альбом.
     */
    function initMusicCard(card) {
        var config = currentConfig(card);
        if (!config || !config.embeds.length) return;

        bindCardControls(card);

        var manual = readManual(config.slug);
        if (manual && findEmbed(config, manual)) {
            setProvider(card, manual, 'manual');
            return;
        }
        setProvider(card, config.embeds[0].provider, 'auto');
    }

    function initMusicCards() {
        Array.prototype.forEach.call(document.querySelectorAll('[data-music-card]'), initMusicCard);
    }

    window.__musicPlayer = {
        initMusicCard: initMusicCard,
        setProvider: setProvider,
        currentConfig: currentConfig,
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initMusicCards);
    } else {
        initMusicCards();
    }
})();
