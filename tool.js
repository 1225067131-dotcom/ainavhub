const detailCard = document.getElementById('detailCard');
const detailLangToggle = document.getElementById('detailLangToggle');
const backListTop = document.getElementById('backListTop');

const query = new URLSearchParams(window.location.search);
const toolId = Number(query.get('id'));

function getSlugFromHash() {
  const hash = (window.location.hash || '').replace(/^#/, '').trim();
  if (!hash) return '';
  return decodeURIComponent(hash.replace(/^\//, '')).trim().toLowerCase();
}

function getSlugFromPathname() {
  const parts = window.location.pathname.split('/').filter(Boolean);
  const toolIndex = parts.lastIndexOf('tool');
  if (toolIndex >= 0 && parts[toolIndex + 1]) {
    return decodeURIComponent(parts[toolIndex + 1]).trim().toLowerCase();
  }
  return '';
}

const { resolveLang, isNonZhLang, htmlLang, CATEGORY_MAP } = window.I18NUtils;

const toolSlug = getSlugFromHash() || getSlugFromPathname() || (query.get('slug') || '').trim().toLowerCase();
let currentLang = resolveLang(query.get('lang'));

const I18N = window.AppLocales.detail;

const categoryMap = CATEGORY_MAP;
const LANGUAGE_LABELS = { zh: '中文', en: 'EN', ja: '日本語' };
const RECENT_VIEWED_KEY = 'recentViewedTools';
const RECENT_VIEWED_LIMIT = 8;

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

const localizedDescription = (tool) => isNonZhLang(currentLang) ? (tool.descriptionEn || tool.description) : tool.description;
const localizedTags = (tool) => isNonZhLang(currentLang) ? (tool.tagsEn || tool.tags || []) : (tool.tags || []);
const localizedField = (tool, field) => {
  const key = isNonZhLang(currentLang) ? `${field}En` : field;
  const fallbackKey = isNonZhLang(currentLang) ? field : `${field}En`;
  return tool[key] ?? tool[fallbackKey] ?? '';
};
const localizedListField = (tool, field) => {
  const value = localizedField(tool, field);
  return Array.isArray(value) ? value.filter(Boolean) : [];
};
const localizedCategory = (tool) => {
  if (currentLang === 'zh') return tool.category || '';
  return categoryMap[tool.category] || tool.category || '';
};
const localizedFreeType = (freeType) => {
  if (currentLang === 'zh') return freeType || '';
  if (currentLang === 'ja') {
    if (freeType === '免费') return '無料';
    if (freeType === '免费试用' || freeType === '部分免费') return 'フリーミアム';
    return '有料';
  }
  if (freeType === '免费') return 'Free';
  if (freeType === '免费试用' || freeType === '部分免费') return 'Freemium';
  return 'Paid';
};

const getToolScreenshot = (url) => {
  try {
    const u = new URL(url);
    return `https://image.thum.io/get/width/1200/noanimate/${u.origin}`;
  } catch {
    return '';
  }
};

const getToolScreenshotFallback = (url) => {
  try {
    const u = new URL(url);
    return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(u.origin)}?w=1200`;
  } catch {
    return '';
  }
};

function updateLanguageDropdownCheck(dropdown) {
  if (!dropdown) return;
  const buttons = dropdown.querySelectorAll('[data-lang]');
  buttons.forEach((button) => {
    const code = button.dataset.lang || '';
    const label = LANGUAGE_LABELS[code] || code;
    button.textContent = code === currentLang ? `✓ ${label}` : label;
  });
}

function updateStaticText() {
  const lang = I18N[currentLang];
  document.documentElement.lang = htmlLang(currentLang);
  document.title = lang.pageTitle;
  detailLangToggle.textContent = LANGUAGE_LABELS[currentLang] || '中文';
  backListTop.textContent = lang.back;
  backListTop.href = `./index.html?lang=${encodeURIComponent(currentLang)}`;
}

function updateDocumentMeta(tool) {
  const lang = I18N[currentLang];
  const desc = localizedDescription(tool) || '';
  const shortDesc = desc.length > 120 ? `${desc.slice(0, 117)}...` : desc;
  document.title = `${tool.name} - ${lang.pageTitle}`;
  const meta = document.querySelector('meta[name="description"]');
  if (meta) {
    meta.setAttribute('content', shortDesc || lang.pageTitle);
  }
}

function renderError(message) {
  detailCard.innerHTML = `<p class="detail-loading">${message}</p>`;
}

function rememberRecentlyViewed(tool) {
  if (!tool || !tool.slug) return;
  const nextItem = { slug: tool.slug, name: tool.name, url: tool.url };
  let prev = [];
  try {
    const raw = localStorage.getItem(RECENT_VIEWED_KEY);
    prev = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(prev)) prev = [];
  } catch {
    prev = [];
  }

  const merged = [nextItem, ...prev.filter((item) => item && item.slug && item.slug !== tool.slug)];
  localStorage.setItem(RECENT_VIEWED_KEY, JSON.stringify(merged.slice(0, RECENT_VIEWED_LIMIT)));
}

function renderTool(tool) {
  const lang = I18N[currentLang];
  rememberRecentlyViewed(tool);
  updateDocumentMeta(tool);
  const tags = localizedTags(tool).map((tag) => `<span class="tag">${tag}</span>`).join('');
  const screenshot = getToolScreenshot(tool.url);
  const screenshotFallback = getToolScreenshotFallback(tool.url);

  const bestFor = localizedField(tool, 'bestFor');
  const pricingNote = localizedField(tool, 'pricingNote');
  const updatedAt = localizedField(tool, 'updatedAt');
  const platforms = localizedListField(tool, 'platforms').join(' · ');
  const features = localizedListField(tool, 'features').map((item) => `<li>${item}</li>`).join('');
  const pros = localizedListField(tool, 'pros').map((item) => `<li>${item}</li>`).join('');
  const cons = localizedListField(tool, 'cons').map((item) => `<li>${item}</li>`).join('');
  const alternatives = localizedListField(tool, 'alternatives').join(' · ');

  detailCard.innerHTML = `
    <div class="detail-media">
      <img class="detail-shot" src="${screenshot}" data-fallback="${screenshotFallback}" alt="${tool.name} screenshot" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.fallbackTried || !this.dataset.fallback){ this.style.display='none'; } else { this.dataset.fallbackTried='1'; this.src=this.dataset.fallback; }" />
    </div>
    <div class="detail-body">
      <h2 class="detail-title">${tool.name}</h2>
      <p class="detail-desc">${localizedDescription(tool)}</p>
      <div class="detail-meta-row"><strong>${lang.category}:</strong><span>${localizedCategory(tool)}</span></div>
      <div class="detail-meta-row"><strong>${lang.price}:</strong><span>${localizedFreeType(tool.freeType)}</span></div>
      <div class="detail-meta-row"><strong>${lang.tags}:</strong><span class="detail-tags">${tags}</span></div>
      ${bestFor ? `<div class="detail-meta-row"><strong>${lang.bestFor}:</strong><span>${bestFor}</span></div>` : ''}
      ${pricingNote ? `<div class="detail-meta-row"><strong>${lang.pricingNote}:</strong><span>${pricingNote}</span></div>` : ''}
      ${updatedAt ? `<div class="detail-meta-row"><strong>${lang.updatedAt}:</strong><span>${updatedAt}</span></div>` : ''}
      ${platforms ? `<div class="detail-meta-row"><strong>${lang.platforms}:</strong><span>${platforms}</span></div>` : ''}
      ${features ? `<div class="detail-meta-row"><strong>${lang.features}:</strong><span><ul>${features}</ul></span></div>` : ''}
      ${pros ? `<div class="detail-meta-row"><strong>${lang.pros}:</strong><span><ul>${pros}</ul></span></div>` : ''}
      ${cons ? `<div class="detail-meta-row"><strong>${lang.cons}:</strong><span><ul>${cons}</ul></span></div>` : ''}
      ${alternatives ? `<div class="detail-meta-row"><strong>${lang.alternatives}:</strong><span>${alternatives}</span></div>` : ''}
      <div class="detail-actions">
        <a class="btn btn-primary" href="${tool.url}" target="_blank" rel="noopener noreferrer">${lang.visit}</a>
        <a class="btn btn-ghost" href="./index.html?lang=${encodeURIComponent(currentLang)}">${lang.back}</a>
      </div>
    </div>
  `;
}

async function loadTool() {
  updateStaticText();

  try {
    const res = await fetch('./tools.json');
    const rawTools = await res.json();
    const tools = attachToolIdentity(rawTools);

    let tool = null;
    if (toolSlug) {
      tool = tools.find((item) => item.slug === toolSlug) || null;
    }
    if (!tool && Number.isInteger(toolId) && toolId >= 0) {
      tool = tools.find((item) => item.id === toolId) || null;
    }

    if (!tool) {
      renderError(I18N[currentLang].notFound);
      return;
    }
    renderTool(tool);
  } catch (err) {
    console.error(err);
    renderError(I18N[currentLang].loadError);
  }
}

function initDetailLanguageDropdown() {
  const dropdown = document.createElement('div');
  dropdown.className = 'lang-menu hidden';
  dropdown.innerHTML = `
    <button type="button" data-lang="zh">中文</button>
    <button type="button" data-lang="en">EN</button>
    <button type="button" data-lang="ja">日本語</button>
  `;
  updateLanguageDropdownCheck(dropdown);
  detailLangToggle.classList.add('lang-toggle-dropdown');
  detailLangToggle.insertAdjacentElement('afterend', dropdown);

  detailLangToggle.addEventListener('click', (event) => {
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
      updateLanguageDropdownCheck(dropdown);
      const next = new URL(window.location.href);
      next.searchParams.set('lang', currentLang);
      window.location.href = next.toString();
      return;
    }
    updateLanguageDropdownCheck(dropdown);
    dropdown.classList.add('hidden');
  });

  document.addEventListener('click', (event) => {
    if (event.target === detailLangToggle || dropdown.contains(event.target)) return;
    dropdown.classList.add('hidden');
  });
}

initDetailLanguageDropdown();
loadTool();