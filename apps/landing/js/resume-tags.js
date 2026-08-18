// Interactive Tag Cloud for Resume Page
(function () {
  const TAG_DATA = window.TAG_DATA || [];
  const TAG_TYPE_MAP = window.TAG_TYPE_MAP || {};

  const SIZE_MAP = {
    1: { min: 11, max: 13 },
    2: { min: 14, max: 17 },
    3: { min: 18, max: 22 },
  };

  function init() {
    const container = document.getElementById('tag-cloud-container');
    if (!container) return;

    // Assign types from mapping
    TAG_DATA.forEach((tag) => {
      tag.type = TAG_TYPE_MAP[tag.name] || 'опыт работы';
    });

    renderTagCloud(container);
    renderModal();
    bindEvents();
    handleHashNavigation();
  }

  function renderTagCloud(container) {
    // Sort alphabetically
    const tags = [...TAG_DATA].sort((a, b) => a.name.localeCompare(b.name, 'ru'));

    tags.forEach((tag) => {
      const sizeInfo = SIZE_MAP[tag.size];
      const fontSize = sizeInfo.min + Math.random() * (sizeInfo.max - sizeInfo.min);
      const rotation = (Math.random() - 0.5) * 6;

      const el = document.createElement('button');
      el.type = 'button';
      el.className = 'tag-cloud-item neo-border';
      el.dataset.tag = tag.name;
      el.style.fontSize = fontSize.toFixed(1) + 'px';
      el.style.transform = `rotate(${rotation.toFixed(1)}deg)`;

      // Color classes
      const bgClass = getBgClass(tag.color);
      bgClass.split(' ').forEach((c) => el.classList.add(c));

      el.textContent = tag.name + ' (' + tag.items.length + ')';
      container.appendChild(el);
    });
  }

  function getBgClass(color) {
    const map = {
      'neo-black': 'bg-neo-black text-white',
      'neo-blue': 'bg-neo-blue text-white',
      'neo-green': 'bg-neo-green text-neo-black',
      'neo-yellow': 'bg-neo-yellow text-neo-black',
      'neo-pink': 'bg-neo-pink text-neo-black',
      'neo-purple': 'bg-neo-purple text-white',
      'neo-red': 'bg-red-500 text-white',
      'neo-orange': 'bg-orange-500 text-white',
    };
    return map[color] || 'bg-white text-neo-black';
  }

  function renderModal() {
    const modal = document.getElementById('tag-modal');
    if (!modal) return;

    const overlay = modal.querySelector('.tag-modal-overlay');
    const wrapper = modal.querySelector('.tag-modal-wrapper');

    // Close on wrapper click (outside the modal box)
    wrapper.addEventListener('click', (e) => {
      if (e.target === wrapper) closeModal();
    });

    // Close on overlay click
    overlay.addEventListener('click', closeModal);

    // Close on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeModal();
    });

    // Close button
    modal.querySelector('.tag-modal-close').addEventListener('click', closeModal);
  }

  function openModal(tagName) {
    const tag = TAG_DATA.find((t) => t.name === tagName);
    if (!tag) return;

    const modal = document.getElementById('tag-modal');
    const title = modal.querySelector('.tag-modal-title');
    const list = modal.querySelector('.tag-modal-list');

    title.textContent = tagName;
    list.innerHTML = '';

    tag.items.forEach((item, idx) => {
      const li = document.createElement('li');
      li.className = 'tag-modal-item neo-border bg-white p-3 cursor-pointer hover:bg-neo-yellow transition-colors';
      li.innerHTML = `
                <div class="flex items-start gap-2">
                    <span class="font-bold text-neo-black mt-0.5">${idx + 1}.</span>
                    <div class="flex-1">
                        <p class="text-sm leading-relaxed">${item.text}</p>
                        <p class="text-xs text-gray-400 mt-1 font-mono flex items-center gap-1">
                            <span class="px-1.5 py-0.5 bg-gray-100 border border-gray-300 text-[10px] font-bold uppercase rounded">${item.type || tag.type}</span>
                            <i data-lucide="${item.url ? 'external-link' : 'arrow-down-right'}" class="w-3 h-3"></i> ${item.url ? 'перейти к странице' : 'перейти к опыту'}
                        </p>
                    </div>
                </div>
            `;
      li.addEventListener('click', () => {
        closeModal();
        setTimeout(() => navigateToItem(item), 300);
      });
      list.appendChild(li);
    });

    // Re-initialize lucide icons for the new content
    if (window.lucide) lucide.createIcons();

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('tag-modal');
    if (modal) {
      modal.classList.add('hidden');
      document.body.style.overflow = '';
    }
  }

  function navigateToItem(item) {
    if (item.url && !item.exp) {
      // If URL already contains hash, use it as-is; otherwise append target as hash
      const finalUrl = item.url.includes('#') ? item.url : item.url + (item.target ? '#' + item.target : '');

      // Same page — just scroll
      if (window.location.pathname === new URL(finalUrl, window.location.origin).pathname) {
        const hash = finalUrl.split('#')[1];
        if (hash) {
          const el = document.getElementById(hash);
          if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'center' });
            const card = el.closest('.project-card, .experience-card, [class*="reveal"]') || el;
            card.classList.add('experience-highlight');
            setTimeout(() => card.classList.remove('experience-highlight'), 3000);
          }
        }
        return;
      }

      // Cross-page navigation
      window.location.href = finalUrl;
      return;
    }
    if (item.exp) {
      scrollToExperience(item.exp);
    }
  }

  function scrollToExperience(expId) {
    const el = document.querySelector(`[data-experience-id="${expId}"]`);
    if (!el) return;

    // Remove previous highlights
    document.querySelectorAll('.experience-highlight').forEach((prev) => {
      prev.classList.remove('experience-highlight');
    });

    el.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Add highlight after scroll
    setTimeout(() => {
      el.classList.add('experience-highlight');
      // Remove after animation
      setTimeout(() => {
        el.classList.remove('experience-highlight');
      }, 3000);
    }, 600);
  }

  // Handle cross-page hash navigation on page load
  function handleHashNavigation() {
    const hash = window.location.hash.slice(1);
    if (!hash) return;

    // Handle #tag-TAGNAME hash — auto-open tag modal
    if (hash.startsWith('tag-')) {
      const tagName = decodeURIComponent(hash.slice(4));
      const tag = TAG_DATA.find((t) => t.name === tagName);
      if (tag) {
        setTimeout(() => openModal(tagName), 500);
      }
      return;
    }

    const el = document.getElementById(hash) || document.querySelector(`[data-id="${hash}"]`);
    if (!el) return;

    setTimeout(() => {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      // Highlight the element
      const card = el.closest('.project-card, .experience-card, [class*="reveal"]') || el;
      card.classList.add('experience-highlight');
      setTimeout(() => card.classList.remove('experience-highlight'), 3000);
    }, 500);
  }

  function bindEvents() {
    const container = document.getElementById('tag-cloud-container');
    if (!container) return;

    container.addEventListener('click', (e) => {
      const tagEl = e.target.closest('.tag-cloud-item');
      if (!tagEl) return;
      openModal(tagEl.dataset.tag);
    });
  }

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
