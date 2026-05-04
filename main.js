  const toolGrid = document.getElementById('toolGrid');
const searchInput = document.getElementById('searchInput');
const sortInline = document.getElementById('sortInline');
const sortSelect = document.getElementById('sortSelect') || sortInline;
const priceFilter = document.getElementById('priceFilter');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const stats = document.getElementById('stats');
const emptyState = document.getElementById('emptyState');
const emptyGuide = document.getElementById('emptyGuide');
const langToggle = document.getElementById('langToggle');
const submitEntry = document.getElementById('submitEntry');
const aboutEntry = document.getElementById('aboutEntry');
const heroTitle = document.getElementById('heroTitle');
const heroSub = document.getElementById('heroSub');
const mTotalLabel = document.getElementById('mTotalLabel');
const mFreeLabel = document.getElementById('mFreeLabel');
const mCatsLabel = document.getElementById('mCatsLabel');
const mTotal = document.getElementById('mTotal');
const mFree = document.getElementById('mFree');
const mCats = document.getElementById('mCats');
const firstVisitHint = document.getElementById('firstVisitHint');
const toTopBtn = document.getElementById('toTopBtn');
const viewGridBtn = document.getElementById('viewGridBtn');
const viewListBtn = document.getElementById('viewListBtn');
const categoryTagRow = document.getElementById('categoryTagRow');
const recentToolsRow = document.getElementById('recentToolsRow');
const pagination = document.getElementById('pagination');

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const I18N = window.AppLocales?.main;

const i18nUtils = window.I18NUtils || {};
const resolveLang = i18nUtils.resolveLang || ((lang) => (['zh', 'en', 'ja'].includes(lang) ? lang : 'zh'));
const isNonZhLang = i18nUtils.isNonZhLang || ((lang) => lang !== 'zh');
const htmlLang = i18nUtils.htmlLang || ((lang) => (lang === 'zh' ? 'zh-CN' : (lang === 'ja' ? 'ja' : 'en')));
const categoryMap = i18nUtils.CATEGORY_MAP || { 对话: 'Chat', 作图: 'Image', 绘图: 'Image', 视频: 'Video', 编程: 'Coding', 办公: 'Office', 学习: 'Learning' };
const reverseCategoryMap = Object.fromEntries(Object.entries(categoryMap).map(([k, v]) => [v, k]));
const categoryIcons = { 对话: '💬', 作图: '🖼️', 绘图: '🖼️', 视频: '🎬', 编程: '💻', 办公: '🧾', 学习: '📚' };
const LANGUAGE_LABELS = { zh: '中文', en: 'EN', ja: '日本語' };
const STORAGE_KEYS = {
  language: 'prefLanguage',
  viewMode: 'prefViewMode',
  priceFilter: 'prefPriceFilter',
  recentViewed: 'recentViewedTools'
};
const supportedViewModes = new Set(['grid', 'list']);
const supportedPriceModes = new Set(['all', 'free', 'freemium', 'opensource', 'paid']);

let tools = [];
let currentLang = 'zh';
let moreExpanded = false;
const activeTagKeys = new Set();
let priceMode = 'all';
let currentPage = 1;
const PAGE_SIZE = 24;
const hasSeenHint = localStorage.getItem('firstVisitHintSeen') === '1';

const queryLang = new URLSearchParams(window.location.search).get('lang');
const savedLang = localStorage.getItem(STORAGE_KEYS.language);
currentLang = resolveLang(queryLang || savedLang || currentLang);

const localizedCategory = (zh) => currentLang === 'zh' ? zh : (categoryMap[zh] || zh);
const badgeClass = (f) => (f === '免费' ? 'badge free' : ((f === '免费试用' || f === '部分免费') ? 'badge freemium' : 'badge paid'));
const categoryClass = (c) => ({ 对话: 'cat-chat', 作图: 'cat-image', 绘图: 'cat-image', 视频: 'cat-video', 编程: 'cat-code', 办公: 'cat-write' }[c] || 'cat-default');
const localizedTags = (tool) => isNonZhLang(currentLang) ? (tool.tagsEn || tool.tags || []) : (tool.tags || []);
const localizedDescription = (tool) => isNonZhLang(currentLang) ? (tool.descriptionEn || tool.description) : tool.description;
const localizedFreeType = (f) => {
  if (currentLang === 'zh') {
    if (f === '免费') return '免费';
    if (f === '免费试用' || f === '部分免费') return '试用';
    return '付费';
  }
  if (currentLang === 'ja') {
    if (f === '免费') return '無料';
    if (f === '免费试用' || f === '部分免费') return '体験';
    return '有料';
  }
  if (f === '免费') return 'Free';
  if (f === '免费试用' || f === '部分免费') return 'Trial';
  return 'Paid';
};
const getToolScreenshot = (url) => { try { const u = new URL(url); return `https://image.thum.io/get/width/800/noanimate/${u.origin}`; } catch { return ''; } };
const getToolScreenshotFallback = (url) => { try { const u = new URL(url); return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(u.origin)}?w=800`; } catch { return ''; } };
const getToolScreenshotFallback2 = (url) => { try { const u = new URL(url); return `https://mini.s-shot.ru/1024x768/JPEG/1024/Z100/?${encodeURIComponent(u.origin)}`; } catch { return ''; } };
const getToolLogo = (url) => { try { const u = new URL(url); return `${u.origin}/favicon.ico`; } catch { return './logo.png'; } };
const getToolLogoFallback = (url) => { try { const u = new URL(url); return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`; } catch { return './logo.png'; } };
const getToolLogoFallback2 = (url) => { try { const u = new URL(url); return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(u.hostname)}&sz=64`; } catch { return './logo.png'; } };
const getToolIcon = (url) => { try { const u = new URL(url); return `${u.origin}/favicon.ico`; } catch { return './logo.png'; } };
const getToolIconFallback = (url) => { try { const u = new URL(url); return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`; } catch { return './logo.png'; } };
const getToolIconFallback2 = (url) => { try { const u = new URL(url); return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(u.hostname)}&sz=64`; } catch { return './logo.png'; } };
const normalizeTagText = (value) => (value || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');

function slugifyToolName(name) {
  return (name || '')
    .toString()
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || 'tool';
}

function attachToolIdentity(rawTools) {
  const usedSlugs = new Set();
  return rawTools.map((tool, idx) => {
    const base = slugifyToolName(tool.slug || tool.name);
    let slug = base;
    let n = 2;
    while (usedSlugs.has(slug)) {
      slug = `${base}-${n}`;
      n += 1;
    }
    usedSlugs.add(slug);
    return { ...tool, id: idx, slug };
  });
}

function getDetailUrl(tool) {
  const detailUrl = new URL('./tool.html', window.location.href);
  detailUrl.searchParams.set('lang', currentLang);
  detailUrl.hash = `/${encodeURIComponent(tool.slug)}`;
  return detailUrl.toString();
}

function getCategoryAliasSet(tool) {
  const zhCategory = (tool.category || '').toString().trim();
  const enCategory = categoryMap[zhCategory] || zhCategory;
  const aliasValues = [
    zhCategory,
    enCategory,
    localizedCategory(zhCategory),
    reverseCategoryMap[enCategory] || ''
  ];
  return new Set(aliasValues.map(normalizeTagText).filter(Boolean));
}

function getDisplayTags(tool, maxCount = 3) {
  const tags = localizedTags(tool);
  const categoryAliases = getCategoryAliasSet(tool);
  const seen = new Set();
  const output = [];
  tags.forEach((tag) => {
    const raw = (tag || '').toString().trim();
    if (!raw) return;
    const normalized = normalizeTagText(raw);
    if (!normalized) return;
    if (categoryAliases.has(normalized)) return;
    if (seen.has(normalized)) return;
    seen.add(normalized);
    output.push(raw);
  });
  return output.slice(0, maxCount);
}

function updateMetrics(allTools) {
  if (mTotal) mTotal.textContent = allTools.length;
  if (mFree) mFree.textContent = allTools.filter(t => t.freeType === '免费' || t.freeType === '免费试用' || t.freeType === '部分免费').length;
  if (mCats) mCats.textContent = new Set(allTools.map(t => t.category)).size;
}

function setSortOptions() {
  const labels = (I18N?.[currentLang]?.sortLabel) || ['Default', 'Latest Added', 'Name A-Z'];
  const map = ['default', 'latest', 'name'];
  const prev = sortInline.value || sortSelect.value || 'default';
  const html = labels.map((l, i) => `<option value="${map[i]}">${l}</option>`).join('');
  sortSelect.innerHTML = html;
  sortInline.innerHTML = html;
  sortSelect.value = prev;
  sortInline.value = prev;
}

function setPriceFilterOptions() {
  if (!priceFilter) return;
  const lang = I18N[currentLang];
  if (!lang || !lang.priceFilterLabels) return;
  const prev = priceFilter.value || priceMode || 'all';
  const order = ['all', 'free', 'freemium', 'opensource', 'paid'];
  priceFilter.innerHTML = order.map((key) => {
    const label = lang.priceFilterLabels[key];
    if (!label) return '';
    const icon = (lang.priceFilterIcons && lang.priceFilterIcons[key]) || '';
    const text = icon ? `${icon} ${label}` : label;
    return `<option value="${key}">${text}</option>`;
  }).join('');
  priceFilter.value = order.includes(prev) ? prev : 'all';
  priceMode = priceFilter.value;
}

function matchesPriceFilter(tool) {
  if (!priceMode || priceMode === 'all') return true;
  const ft = tool.freeType || '';
  if (priceMode === 'free') return ft === '免费';
  if (priceMode === 'freemium') return ft === '部分免费' || ft === '免费试用';
  if (priceMode === 'paid') return ft === '付费';
  if (priceMode === 'opensource') {
    const text = [
      ...(tool.tags || []),
      ...(tool.tagsEn || []),
      tool.description || '',
      tool.descriptionEn || ''
    ].join(' ').toLowerCase();
    return text.includes('开源') || text.includes('open source');
  }
  return true;
}

function applySort(list) {
  const mode = sortInline.value || sortSelect.value || 'default';
  const cloned = [...list];
  if (mode === 'name') cloned.sort((a, b) => a.name.localeCompare(b.name));
  if (mode === 'latest') cloned.reverse();
  return cloned;
}

function renderSkeletonCards(count = 8) {
  toolGrid.innerHTML = '';
  emptyState.classList.add('hidden');
  emptyGuide.classList.add('hidden');
  if (stats) stats.textContent = '';

  for (let index = 0; index < count; index += 1) {
    const card = document.createElement('article');
    card.className = 'card skeleton-card';
    card.setAttribute('aria-hidden', 'true');
    card.innerHTML = `
      <div class="card-media skeleton-block"></div>
      <div class="card-top">
        <div class="tool-head">
          <span class="tool-icon skeleton-block"></span>
          <span class="skeleton-line skeleton-title"></span>
        </div>
        <span class="skeleton-pill"></span>
      </div>
      <p class="desc skeleton-line skeleton-desc"></p>
      <div class="tags">
        <span class="skeleton-pill skeleton-tag"></span>
        <span class="skeleton-pill skeleton-tag"></span>
      </div>`;
    toolGrid.appendChild(card);
  }
}

function renderEmptyGuide() {
  if (!emptyGuide) return;
  const lang = I18N[currentLang];
  const hints = (lang.emptySuggestKeywords || ['chat', 'image', 'free'])
    .map((keyword) => `<button type="button" class="empty-suggest-btn" data-keyword="${keyword}">${keyword}</button>`)
    .join('');
  emptyGuide.innerHTML = `<div class="empty-guide-wrap">${hints}<button type="button" class="empty-reset-btn" data-action="reset">${lang.emptyReset || lang.clear}</button></div>`;
}

function renderPagination(totalItems, totalPages) {
  if (!pagination) return;
  if (!totalItems || totalPages <= 1) {
    pagination.innerHTML = '';
    return;
  }

  pagination.style.display = 'flex';
  pagination.style.justifyContent = 'center';
  pagination.style.alignItems = 'center';
  pagination.style.gap = '12px';

  const prevDisabled = currentPage <= 1 ? 'disabled' : '';
  const nextDisabled = currentPage >= totalPages ? 'disabled' : '';
  const prevLabel = currentLang === 'zh' ? '上一页' : (currentLang === 'ja' ? '前へ' : 'Prev');
  const nextLabel = currentLang === 'zh' ? '下一页' : (currentLang === 'ja' ? '次へ' : 'Next');
  const firstLabel = currentLang === 'zh' ? '回到第一页' : (currentLang === 'ja' ? '最初のページへ' : 'First');
  const firstBtn = currentPage > 1 ? `<button type="button" class="category-tag-btn" data-page="first">${firstLabel}</button>` : '';
  pagination.innerHTML = `
    ${firstBtn}
    <button type="button" class="category-tag-btn" data-page="prev" ${prevDisabled}>${prevLabel}</button>
    <span class="category-tag-btn" aria-hidden="true">${currentPage} / ${totalPages}</span>
    <button type="button" class="category-tag-btn" data-page="next" ${nextDisabled}>${nextLabel}</button>
  `;
}

function armScreenshotTimeout(card) {
  const shot = card.querySelector('.tool-shot');
  if (!shot) return;
  window.setTimeout(() => {
    if (shot.dataset.loaded === '1') return;
    if (!shot.dataset.fallbackTried && shot.dataset.fallback) {
      shot.dataset.fallbackTried = '1';
      shot.src = shot.dataset.fallback;
      return;
    }
    if (!shot.dataset.fallback2Tried && shot.dataset.fallback2) {
      shot.dataset.fallback2Tried = '1';
      shot.src = shot.dataset.fallback2;
      return;
    }
    shot.style.display = 'none';
    if (shot.nextElementSibling) shot.nextElementSibling.style.display = 'flex';
  }, 6000);
}

function render(list, totalCount = list.length, totalPages = 1) {
  toolGrid.innerHTML = '';
  if (!list.length) {
    emptyState.classList.remove('hidden');
    emptyGuide.classList.remove('hidden');
    renderEmptyGuide();
  } else {
    emptyState.classList.add('hidden');
    emptyGuide.classList.add('hidden');
  }

  list.forEach(tool => {
    const card = document.createElement('article');
    const detailUrl = getDetailUrl(tool);
    card.className = 'card';
    card.setAttribute('role', 'link');
    card.setAttribute('tabindex', '0');
    card.setAttribute('title', localizedDescription(tool));
    card.addEventListener('click', () => { window.location.href = detailUrl; });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        window.location.href = detailUrl;
      }
    });

    const tags = getDisplayTags(tool).map(t => `<span class="tag">${t}</span>`).join('');
    card.innerHTML = `
      <div class="card-media">
        <img class="tool-shot" src="${getToolScreenshot(tool.url)}" data-fallback="${getToolScreenshotFallback(tool.url)}" data-fallback2="${getToolScreenshotFallback2(tool.url)}" alt="${tool.name} screenshot" loading="lazy" referrerpolicy="no-referrer" onerror="if(!this.dataset.fallbackTried && this.dataset.fallback){ this.dataset.fallbackTried='1'; this.src=this.dataset.fallback; return; } if(!this.dataset.fallback2Tried && this.dataset.fallback2){ this.dataset.fallback2Tried='1'; this.src=this.dataset.fallback2; return; } this.style.display='none'; this.nextElementSibling.style.display='flex';" onload="if(this.naturalWidth && this.naturalHeight){ this.dataset.loaded='1'; return; } this.style.display='none'; this.nextElementSibling.style.display='flex';" />
        <div class="tool-shot-fallback" style="display:none;"><img class="tool-logo-large" src="${getToolLogo(tool.url)}" data-fallback="${getToolLogoFallback(tool.url)}" data-fallback2="${getToolLogoFallback2(tool.url)}" alt="${tool.name} logo" loading="lazy" referrerpolicy="no-referrer" onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried='1';this.src=this.dataset.fallback||'./logo.png';return;}if(!this.dataset.fallback2Tried){this.dataset.fallback2Tried='1';this.src=this.dataset.fallback2||'./logo.png';return;}this.onerror=null;this.src='./logo.png';" /></div>
      </div>
      <div class="card-top">
        <div class="tool-head"><img class="tool-icon" src="${getToolIcon(tool.url)}" data-fallback="${getToolIconFallback(tool.url)}" data-fallback2="${getToolIconFallback2(tool.url)}" alt="${tool.name} icon" loading="lazy" referrerpolicy="no-referrer" onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried='1';this.src=this.dataset.fallback||'./logo.png';return;}if(!this.dataset.fallback2Tried){this.dataset.fallback2Tried='1';this.src=this.dataset.fallback2||'./logo.png';return;}this.onerror=null;this.src='./logo.png';" /><h3>${tool.name}</h3></div>
        <span class="${badgeClass(tool.freeType)}">${localizedFreeType(tool.freeType)}</span>
      </div>
      <p class="desc">${localizedDescription(tool)}</p>
      <div class="tags">${tags}</div>`;

    toolGrid.appendChild(card);
    armScreenshotTimeout(card);
  });
  stats.textContent = I18N[currentLang].stats(totalCount);
  renderPagination(totalCount, totalPages);
}

function updateActiveTagUI() {
  if (!categoryTagRow) return;
  const buttons = categoryTagRow.querySelectorAll('.category-tag-btn');
  buttons.forEach((btn) => {
    const i18nKey = btn.dataset.i18nKey;
    if (i18nKey === 'more') {
      btn.classList.remove('is-active');
      return;
    }
    const rawKey = (btn.dataset.key || btn.textContent || '').trim().toLowerCase();
    btn.classList.toggle('is-active', activeTagKeys.has(rawKey));
  });
}

function updateClearButtonVisibility() {
  if (!clearSearchBtn) return;
  const shouldShow = activeTagKeys.size > 0 || !!searchInput.value.trim();
  clearSearchBtn.classList.toggle('hidden', !shouldShow);
}

function filterTools(keepPage = false) {
  if (!keepPage) currentPage = 1;
  const rawKeyword = searchInput.value.trim().toLowerCase();
  const keyword = rawKeyword;

  const filtered = tools.filter(tool => {
    const nameDescTags = [
      tool.name,
      localizedDescription(tool),
      localizedTags(tool).join(' ')
    ].join(' ').toLowerCase();

    const allTagsText = [
      ...(tool.tags || []),
      ...(tool.tagsEn || [])
    ].join(' ').toLowerCase();

    const matchKeyword = !keyword || nameDescTags.includes(keyword) || allTagsText.includes(keyword);
    const matchTag = activeTagKeys.size === 0 || [...activeTagKeys].some((tagKey) => allTagsText.includes(tagKey));
    const matchPrice = matchesPriceFilter(tool);
    return matchKeyword && matchTag && matchPrice;
  });

  const sorted = applySort(filtered);
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  if (currentPage > totalPages) currentPage = totalPages;
  const start = (currentPage - 1) * PAGE_SIZE;
  const paged = sorted.slice(start, start + PAGE_SIZE);

  render(paged, sorted.length, totalPages);
  updateActiveTagUI();
  updateClearButtonVisibility();
}

function formatRecentToolName(item) {
  const raw = (item?.name || item?.slug || '').toString().trim();
  return raw.replace(/[_\uFF3F-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

function getRecentViewedItems() {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.recentViewed);
    const parsed = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(parsed)) return [];

    const cleaned = parsed
      .filter((item) => item && item.slug)
      .map((item) => {
        const matchedTool = tools.find((tool) => tool.slug === item.slug);
        return {
          ...item,
          url: item.url || matchedTool?.url || '',
          name: formatRecentToolName(item)
        };
      });

    const before = JSON.stringify(parsed);
    const after = JSON.stringify(cleaned);
    if (before !== after) {
      localStorage.setItem(STORAGE_KEYS.recentViewed, after);
    }

    return cleaned;
  } catch {
    return [];
  }
}

function renderRecentViewed() {
  if (!recentToolsRow) return;
  const items = getRecentViewedItems();
  if (!items.length) {
    recentToolsRow.classList.add('hidden');
    recentToolsRow.innerHTML = '';
    return;
  }

  const title = currentLang === 'zh' ? '最近查看：' : (currentLang === 'ja' ? '最近表示：' : 'Recently viewed:');
  const links = items.slice(0, 5).map((item) => {
    const detailUrl = new URL('./tool.html', window.location.href);
    detailUrl.searchParams.set('lang', currentLang);
    detailUrl.hash = `/${encodeURIComponent(item.slug)}`;

    const normalizedSlug = (item.slug || '').toString().trim().toLowerCase();
    const matchedTool = tools.find((tool) => (tool.slug || '').toString().trim().toLowerCase() === normalizedSlug);
    const sourceUrl = item.url || matchedTool?.url || '';

    const text = formatRecentToolName(item);
    const icon = sourceUrl ? getToolIcon(sourceUrl) : './logo.png';
    const iconFallback = sourceUrl ? getToolIconFallback(sourceUrl) : './logo.png';
    const iconFallback2 = sourceUrl ? getToolIconFallback2(sourceUrl) : './logo.png';
    return `<a class="category-tag-btn" href="${detailUrl.toString()}" style="display:inline-flex;align-items:center;justify-content:center;gap:8px;text-decoration:none;"><img class="tool-icon" src="${icon}" data-fallback="${iconFallback}" data-fallback2="${iconFallback2}" alt="${text} icon" loading="lazy" referrerpolicy="no-referrer" onerror="if(!this.dataset.fallbackTried){this.dataset.fallbackTried='1';this.src=this.dataset.fallback||'./logo.png';return;}if(!this.dataset.fallback2Tried){this.dataset.fallback2Tried='1';this.src=this.dataset.fallback2||'./logo.png';return;}this.onerror=null;this.src='./logo.png';" />${text}</a>`;
  }).join('');

  recentToolsRow.style.display = 'flex';
  recentToolsRow.style.justifyContent = 'center';
  recentToolsRow.style.alignItems = 'center';
  recentToolsRow.style.flexWrap = 'wrap';
  recentToolsRow.style.gap = '16px';
  recentToolsRow.innerHTML = `<span class="category-tag-btn" aria-hidden="true">${title}</span>${links}`;
  recentToolsRow.classList.remove('hidden');
}

function updateLanguageDropdownCheck(dropdown) {
  if (!dropdown) return;
  const buttons = dropdown.querySelectorAll('[data-lang]');
  buttons.forEach((button) => {
    const code = button.dataset.lang || '';
    const label = LANGUAGE_LABELS[code] || code;
    button.textContent = code === currentLang ? `✓ ${label}` : label;
  });
}

function applyLanguage() {
  document.documentElement.lang = htmlLang(currentLang);
  const lang = I18N?.[currentLang] || I18N?.zh || I18N?.en;
  if (!lang) return;
  langToggle.textContent = LANGUAGE_LABELS[currentLang] || '中文';
  heroTitle.innerHTML = lang.heroAccent ? `${lang.heroLead} <span class="accent">${lang.heroAccent}</span>` : lang.heroLead;
  heroSub.textContent = lang.heroSub;
  searchInput.placeholder = lang.searchPlaceholder;
  emptyState.textContent = lang.empty;
  submitEntry.textContent = lang.submit;
  aboutEntry.textContent = lang.about;
  if (mTotalLabel) mTotalLabel.textContent = lang.totalLabel;
  if (mFreeLabel) mFreeLabel.textContent = lang.freeLabel;
  if (mCatsLabel) mCatsLabel.textContent = lang.catsLabel;
  if (clearSearchBtn) clearSearchBtn.textContent = lang.clear;
  if (firstVisitHint) firstVisitHint.textContent = lang.firstVisitHint;
  if (categoryTagRow && lang.tagLabels) {
    const buttons = categoryTagRow.querySelectorAll('.category-tag-btn');
    buttons.forEach(btn => {
      const key = btn.dataset.i18nKey;
      if (key && lang.tagLabels[key]) {
        btn.textContent = lang.tagLabels[key];
      }
    });
  }
  updateMoreButtonLabel();
  setSortOptions();
  setPriceFilterOptions();
  renderRecentViewed();
  filterTools();
}

function updateMoreButtonLabel() {
  if (!categoryTagRow) return;
  const btn = categoryTagRow.querySelector('[data-i18n-key="more"]');
  if (!btn) return;
  const lang = I18N?.[currentLang] || I18N?.zh || I18N?.en;
  if (!lang || !lang.tagLabels) return;
  if (moreExpanded) {
    const label = currentLang === 'zh' ? '收起' : (currentLang === 'ja' ? '閉じる' : 'Less');
    btn.innerHTML = `<span class="more-icon more-icon-minus" aria-hidden="true"></span><span class="more-label">${label}</span>`;
  } else {
    btn.innerHTML = `<span class="more-icon more-icon-plus" aria-hidden="true"></span><span class="more-label">${lang.tagLabels.more}</span>`;
  }
}

function getCollapsedCategoryTagRowHeight() {
  if (!categoryTagRow) return 0;
  const buttons = [...categoryTagRow.querySelectorAll('.category-tag-btn')]
    .filter((btn) => !btn.classList.contains('category-tag-extra'));
  if (!buttons.length) return 0;

  const rowTops = [];
  buttons.forEach((btn) => {
    const top = btn.offsetTop;
    if (!rowTops.includes(top)) rowTops.push(top);
  });
  rowTops.sort((a, b) => a - b);

  const thirdRowTop = rowTops[Math.min(2, rowTops.length - 1)];
  const thirdRowButtons = buttons.filter((btn) => btn.offsetTop === thirdRowTop);
  const maxBottom = Math.max(...thirdRowButtons.map((btn) => btn.offsetTop + btn.offsetHeight));
  return Math.ceil(maxBottom);
}

function getExtraCategoryButtons() {
  return categoryTagRow ? [...categoryTagRow.querySelectorAll('.category-tag-extra')] : [];
}

function setExtraButtonsDetached(buttons, detached) {
  buttons.forEach((btn) => {
    btn.style.position = detached ? 'absolute' : '';
    btn.style.visibility = detached ? 'hidden' : '';
    btn.style.pointerEvents = detached ? 'none' : '';
    btn.style.inset = detached ? '0 auto auto 0' : '';
  });
}

function setExtraButtonsState(buttons, expanded) {
  buttons.forEach((btn) => {
    btn.classList.toggle('hidden', !expanded);
    btn.classList.toggle('is-collapsed', !expanded);
  });
}

function getExpandedCategoryTagRowHeight() {
  if (!categoryTagRow) return 0;
  return Math.ceil(categoryTagRow.scrollHeight);
}

function syncCategoryTagRowHeight() {
  if (!categoryTagRow) return;
  categoryTagRow.style.height = 'auto';
  categoryTagRow.style.maxHeight = moreExpanded
    ? `${getExpandedCategoryTagRowHeight()}px`
    : `${getCollapsedCategoryTagRowHeight()}px`;
}

function placeMoreButton(expanded, moreBtn, extraButtons) {
  if (!categoryTagRow || !moreBtn) return;
  if (expanded) {
    categoryTagRow.appendChild(moreBtn);
    return;
  }
  if (extraButtons.length) {
    categoryTagRow.insertBefore(moreBtn, extraButtons[0]);
  }
}

function setMoreExpanded(expanded, animate = true) {
  moreExpanded = expanded;
  if (!categoryTagRow) return;

  const extraButtons = getExtraCategoryButtons();
  const moreBtn = categoryTagRow.querySelector('[data-i18n-key="more"]');
  if (!moreBtn) return;

  placeMoreButton(expanded, moreBtn, extraButtons);
  updateMoreButtonLabel();
  categoryTagRow.classList.toggle('is-expanded', expanded);

  if (!animate) {
    setExtraButtonsDetached(extraButtons, false);
    setExtraButtonsState(extraButtons, expanded);
    syncCategoryTagRowHeight();
    return;
  }

  const currentHeight = Math.ceil(categoryTagRow.getBoundingClientRect().height);
  categoryTagRow.style.height = 'auto';
  categoryTagRow.style.maxHeight = `${currentHeight}px`;

  if (expanded) {
    setExtraButtonsDetached(extraButtons, false);
    extraButtons.forEach((btn) => {
      btn.classList.remove('hidden');
      btn.classList.add('is-collapsed');
    });

    window.requestAnimationFrame(() => {
      extraButtons.forEach((btn) => btn.classList.remove('is-collapsed'));
      window.requestAnimationFrame(() => {
        categoryTagRow.style.maxHeight = `${getExpandedCategoryTagRowHeight()}px`;
      });
    });
  } else {
    extraButtons.forEach((btn) => btn.classList.add('is-collapsed'));
    window.requestAnimationFrame(() => {
      setExtraButtonsDetached(extraButtons, true);
      categoryTagRow.style.maxHeight = `${getCollapsedCategoryTagRowHeight()}px`;
    });
  }

  categoryTagRow.addEventListener('transitionend', (event) => {
    if (event.propertyName !== 'max-height') return;
    setExtraButtonsDetached(extraButtons, false);
    setExtraButtonsState(extraButtons, moreExpanded);
    syncCategoryTagRowHeight();
  }, { once: true });
}

function applyViewMode(mode) {
  const isList = mode === 'list';
  if (isList) {
    toolGrid.classList.add('list-mode');
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
  } else {
    toolGrid.classList.remove('list-mode');
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
  }
}

function toggleViewMode() {
  const nextMode = toolGrid.classList.contains('list-mode') ? 'grid' : 'list';
  applyViewMode(nextMode);
  localStorage.setItem(STORAGE_KEYS.viewMode, nextMode);
}

async function init() {
  renderSkeletonCards(8);
  try {
    const res = await fetch('./tools.json');
    if (!res.ok) {
      throw new Error(`fetch tools.json failed: HTTP ${res.status} ${res.statusText}`);
    }
    const rawTools = await res.json();
    if (!Array.isArray(rawTools)) {
      throw new Error(`tools.json format error: expected array, got ${typeof rawTools}`);
    }
    tools = attachToolIdentity(rawTools);
    updateMetrics(tools);
    setMoreExpanded(false, false);
    if (firstVisitHint) {
      firstVisitHint.classList.toggle('hidden', hasSeenHint);
      if (!hasSeenHint) localStorage.setItem('firstVisitHintSeen', '1');
    }

    const savedPriceMode = localStorage.getItem(STORAGE_KEYS.priceFilter);
    if (supportedPriceModes.has(savedPriceMode)) priceMode = savedPriceMode;

    const savedViewMode = localStorage.getItem(STORAGE_KEYS.viewMode);
    applyViewMode(supportedViewModes.has(savedViewMode) ? savedViewMode : 'grid');

    applyLanguage();
  } catch (err) {
    toolGrid.innerHTML = `<p>Data load failed: ${err?.message || err}</p>`;
    console.error(err);
  }
}

searchInput.addEventListener('input', () => {
  filterTools();
});
if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    activeTagKeys.clear();
    searchInput.value = '';
    filterTools();
    searchInput.focus();
  });
}
sortSelect.addEventListener('change', () => { sortInline.value = sortSelect.value; filterTools(); });
sortInline.addEventListener('change', () => { sortSelect.value = sortInline.value; filterTools(); });
viewGridBtn.addEventListener('click', toggleViewMode);
viewListBtn.addEventListener('click', toggleViewMode);

function initLanguageDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'lang-menu hidden';
  dropdown.innerHTML = `
    <button type="button" data-lang="zh">中文</button>
    <button type="button" data-lang="en">EN</button>
    <button type="button" data-lang="ja">日本語</button>
  `;
  updateLanguageDropdownCheck(dropdown);
  langToggle.classList.add('lang-toggle-dropdown');
  langToggle.insertAdjacentElement('afterend', dropdown);

  langToggle.addEventListener('click', (event) => {
    event.stopPropagation();
    updateLanguageDropdownCheck(dropdown);
    dropdown.classList.toggle('hidden');
  });

  dropdown.addEventListener('click', (event) => {
    const target = event.target.closest('[data-lang]');
    if (!target) return;
    const nextLang = resolveLang(target.dataset.lang || 'zh');
    if (nextLang !== currentLang) {
      currentLang = nextLang;
      localStorage.setItem(STORAGE_KEYS.language, currentLang);
      applyLanguage();
    }
    updateLanguageDropdownCheck(dropdown);
    dropdown.classList.add('hidden');
  });

  document.addEventListener('click', (event) => {
    if (event.target === langToggle || dropdown.contains(event.target)) return;
    dropdown.classList.add('hidden');
  });
}

initLanguageDropdown();

window.addEventListener('resize', () => {
  if (!categoryTagRow) return;
  syncCategoryTagRowHeight();
});

if (priceFilter) {
  priceFilter.addEventListener('change', () => {
    priceMode = priceFilter.value || 'all';
    localStorage.setItem(STORAGE_KEYS.priceFilter, priceMode);
    filterTools();
  });
}

if (emptyGuide) {
  emptyGuide.addEventListener('click', (event) => {
    const keywordBtn = event.target.closest('[data-keyword]');
    if (keywordBtn) {
      const keyword = (keywordBtn.dataset.keyword || '').trim();
      if (!keyword) return;
      activeTagKeys.clear();
      searchInput.value = keyword;
      filterTools();
      return;
    }

    const resetBtn = event.target.closest('[data-action="reset"]');
    if (resetBtn) {
      activeTagKeys.clear();
      searchInput.value = '';
      priceMode = 'all';
      localStorage.setItem(STORAGE_KEYS.priceFilter, priceMode);
      if (priceFilter) priceFilter.value = 'all';
      sortInline.value = 'default';
      sortSelect.value = 'default';
      filterTools();
    }
  });
}

if (categoryTagRow) {
  categoryTagRow.addEventListener('click', (event) => {
    const target = event.target.closest('button');
    if (!target) return;
    const i18nKey = target.dataset.i18nKey;
    if (i18nKey === 'more') {
      setMoreExpanded(!moreExpanded);
      return;
    }
    const rawKey = (target.dataset.key || '').trim();
    const displayText = (target.textContent || '').trim();
    const keyForMatch = (rawKey || displayText).toLowerCase();
    if (!keyForMatch) return;
    if (activeTagKeys.has(keyForMatch)) {
      activeTagKeys.delete(keyForMatch);
    } else {
      activeTagKeys.add(keyForMatch);
    }
    filterTools();
  });
}

if (pagination) {
  pagination.addEventListener('click', (event) => {
    const target = event.target.closest('[data-page]');
    if (!target) return;
    const action = target.dataset.page;
    if (action === 'first') currentPage = 1;
    if (action === 'prev') currentPage = Math.max(1, currentPage - 1);
    if (action === 'next') currentPage += 1;
    filterTools(true);
  });
}

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) toTopBtn.classList.add('show');
  else toTopBtn.classList.remove('show');

  if (window.scrollY > 56) document.body.classList.add('header-compact');
  else document.body.classList.remove('header-compact');
});
toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

init();
