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
const toTopBtn = document.getElementById('toTopBtn');
const viewGridBtn = document.getElementById('viewGridBtn');
const viewListBtn = document.getElementById('viewListBtn');
const categoryTagRow = document.getElementById('categoryTagRow');

const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

const I18N = {
  zh: {
    langBtn: 'EN',
    heroLead: '让想法找到<span class="slogan-accent">方向</span>', heroAccent: '', heroSub: '',
    searchPlaceholder: '按名称、描述、标签搜索...',
    categories: ['全部', '对话', '作图', '视频', '编程', '办公', '学习'],
    sortLabel: ['默认排序', '最新添加', '名称排序'],
    chips: ['全部', '仅免费', '免费优先', '重置筛选'],
    emptyHints: '试试：chat / image / free',
    stats: (n) => `共找到 ${n} 个工具`,
    clear: '清除',
    empty: '没有找到匹配工具，请尝试其它关键词。',
    submit: '提交工具', about: '关于',
    totalLabel: '总工具', freeLabel: '免费/免费试用', catsLabel: '分类数',
    free: '免费', freemium: '免费试用', paid: '付费',
    priceFilterLabels: {
      all: '全部价格',
      free: '免费',
      freemium: '部分免费',
      opensource: '开源',
      paid: '付费'
    },
    priceFilterIcons: {
      all: '📚',
      free: '🟢',
      freemium: '🌓',
      opensource: '🧩',
      paid: '💳'
    },
    tagLabels: {
      art: '艺术',
      browserExtensions: '浏览器扩展',
      data: '数据',
      design: '设计',
      development: '开发',
      education: '教育',
      entertainment: '娱乐',
      finance: '金融',
      games: '游戏',
      generativeArt: '生成艺术',
      more: '更多',
      marketing: '营销',
      messaging: '消息',
      music: '音乐',
      news: '资讯',
      other: '其它',
      research: '研究',
      seo: 'SEO',
      shopping: '购物',
      social: '社交',
      softwareDevelopment: '软件开发',
      tasks: '任务',
      text: '文本',
      travel: '旅行',
      userExperience: '用户体验',
      wireframing: '线框图',
      writing: '写作'
    }
  },
  en: {
    langBtn: '中',
    heroLead: 'Where Ideas Find Their <span class="slogan-accent">Way</span>', heroAccent: '', heroSub: '',
    searchPlaceholder: 'Search by name, description, or tags...',
    categories: ['All', 'Chat', 'Image', 'Video', 'Coding', 'Office', 'Learning'],
    sortLabel: ['Default', 'Latest Added', 'Name A-Z'],
    chips: ['All', 'Free Only', 'Free First', 'Reset Filters'],
    emptyHints: 'Try: chat / image / free',
    stats: (n) => `${n} Tools Found`,
    clear: 'Clear',
    empty: 'No tools found. Try another keyword.',
    submit: 'Submit Tool', about: 'About',
    totalLabel: 'Total Tools', freeLabel: 'Free/Freemium', catsLabel: 'Categories',
    free: 'Free', freemium: 'Freemium', paid: 'Paid',
    priceFilterLabels: {
      all: 'All Prices',
      free: 'Free',
      freemium: 'Freemium',
      opensource: 'Open Source',
      paid: 'Paid'
    },
    priceFilterIcons: {
      all: '📚',
      free: '🟢',
      freemium: '🌓',
      opensource: '🧩',
      paid: '💳'
    },
    tagLabels: {
      art: 'Art',
      browserExtensions: 'Browser Extensions',
      data: 'Data',
      design: 'Design',
      development: 'Development',
      education: 'Education',
      entertainment: 'Entertainment',
      finance: 'Finance',
      games: 'Games',
      generativeArt: 'Generative Art',
      more: 'More',
      marketing: 'Marketing',
      messaging: 'Messaging',
      music: 'Music',
      news: 'News',
      other: 'Other',
      research: 'Research',
      seo: 'SEO',
      shopping: 'Shopping',
      social: 'Social',
      softwareDevelopment: 'Software Development',
      tasks: 'Tasks',
      text: 'Text',
      travel: 'Travel',
      userExperience: 'User Experience',
      wireframing: 'Wireframing',
      writing: 'Writing'
    }
  }
};

const categoryMap = { 对话: 'Chat', 作图: 'Image', 绘图: 'Image', 视频: 'Video', 编程: 'Coding', 办公: 'Office', 学习: 'Learning' };
const reverseCategoryMap = Object.fromEntries(Object.entries(categoryMap).map(([k, v]) => [v, k]));
const categoryIcons = { 对话: '💬', 作图: '🖼️', 绘图: '🖼️', 视频: '🎬', 编程: '💻', 办公: '🧾', 学习: '📚' };

let tools = [];
let currentLang = 'zh';
let moreExpanded = false;
let activeTagKey = '';
let priceMode = 'all';

const queryLang = new URLSearchParams(window.location.search).get('lang');
if (queryLang === 'zh' || queryLang === 'en') {
  currentLang = queryLang;
}

const localizedCategory = (zh) => currentLang === 'zh' ? zh : (categoryMap[zh] || zh);
const badgeClass = (f) => (f === '免费' ? 'badge free' : ((f === '免费试用' || f === '部分免费') ? 'badge freemium' : 'badge paid'));
const categoryClass = (c) => ({ 对话: 'cat-chat', 作图: 'cat-image', 绘图: 'cat-image', 视频: 'cat-video', 编程: 'cat-code', 办公: 'cat-write' }[c] || 'cat-default');
const localizedTags = (tool) => currentLang === 'en' ? (tool.tagsEn || tool.tags || []) : (tool.tags || []);
const localizedDescription = (tool) => currentLang === 'en' ? (tool.descriptionEn || tool.description) : tool.description;
const localizedFreeType = (f) => currentLang === 'zh' ? f : (f === '免费' ? I18N.en.free : ((f === '免费试用' || f === '部分免费') ? I18N.en.freemium : I18N.en.paid));
const getToolScreenshot = (url) => { try { const u = new URL(url); return `https://image.thum.io/get/width/800/noanimate/${u.origin}`; } catch { return ''; } };
const getToolScreenshotFallback = (url) => { try { const u = new URL(url); return `https://s.wordpress.com/mshots/v1/${encodeURIComponent(u.origin)}?w=800`; } catch { return ''; } };
const getToolLogo = (url) => { try { const u = new URL(url); return `${u.origin}/favicon.ico`; } catch { return './logo.png'; } };
const getToolLogoFallback = (url) => { try { const u = new URL(url); return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`; } catch { return './logo.png'; } };
const getToolIcon = (url) => { try { const u = new URL(url); return `${u.origin}/favicon.ico`; } catch { return './logo.png'; } };
const getToolIconFallback = (url) => { try { const u = new URL(url); return `https://icons.duckduckgo.com/ip3/${u.hostname}.ico`; } catch { return './logo.png'; } };
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
  mTotal.textContent = allTools.length;
  mFree.textContent = allTools.filter(t => t.freeType === '免费' || t.freeType === '免费试用' || t.freeType === '部分免费').length;
  mCats.textContent = new Set(allTools.map(t => t.category)).size;
}

function setSortOptions() {
  const labels = I18N[currentLang].sortLabel;
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

function render(list) {
  toolGrid.innerHTML = '';
  if (!list.length) {
    emptyState.classList.remove('hidden');
    emptyGuide.classList.remove('hidden');
    emptyGuide.textContent = I18N[currentLang].emptyHints;
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
        <img class="tool-shot" src="${getToolScreenshot(tool.url)}" data-fallback="${getToolScreenshotFallback(tool.url)}" alt="${tool.name} screenshot" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.fallbackTried || !this.dataset.fallback){ this.style.display='none'; this.nextElementSibling.style.display='flex'; } else { this.dataset.fallbackTried='1'; this.src=this.dataset.fallback; }" onload="if(!this.naturalWidth || !this.naturalHeight){ this.style.display='none'; this.nextElementSibling.style.display='flex'; }" />
        <div class="tool-shot-fallback" style="display:none;"><img class="tool-logo-large" src="${getToolLogo(tool.url)}" data-fallback="${getToolLogoFallback(tool.url)}" alt="${tool.name} logo" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.fallbackTried){this.onerror=null;this.src='./logo.png';}else{this.dataset.fallbackTried='1';this.src=this.dataset.fallback||'./logo.png';}" /></div>
      </div>
      <div class="card-top">
        <div class="tool-head"><img class="tool-icon" src="${getToolIcon(tool.url)}" data-fallback="${getToolIconFallback(tool.url)}" alt="${tool.name} icon" loading="lazy" referrerpolicy="no-referrer" onerror="if(this.dataset.fallbackTried){this.onerror=null;this.src='./logo.png';}else{this.dataset.fallbackTried='1';this.src=this.dataset.fallback||'./logo.png';}" /><h3>${tool.name}</h3></div>
        <span class="${badgeClass(tool.freeType)}">${localizedFreeType(tool.freeType)}</span>
      </div>
      <p class="desc">${localizedDescription(tool)}</p>
      <div class="tags">${tags}</div>`;

    toolGrid.appendChild(card);
  });
  stats.textContent = I18N[currentLang].stats(list.length);
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
    btn.classList.toggle('is-active', !!activeTagKey && rawKey === activeTagKey);
  });
}

function updateClearButtonVisibility() {
  if (!clearSearchBtn) return;
  const shouldShow = !!activeTagKey || !!searchInput.value.trim();
  clearSearchBtn.classList.toggle('hidden', !shouldShow);
}

function filterTools() {
  const rawKeyword = searchInput.value.trim().toLowerCase();
  // 有激活的分类标签时，优先按标签筛选，不强制关键字匹配
  const keyword = activeTagKey ? '' : rawKeyword;

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
    const matchTag = !activeTagKey || allTagsText.includes(activeTagKey);
    const matchPrice = matchesPriceFilter(tool);
    return matchKeyword && matchTag && matchPrice;
  });

  render(applySort(filtered));
  updateActiveTagUI();
  updateClearButtonVisibility();
}

function applyLanguage() {
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  const lang = I18N[currentLang];
  langToggle.textContent = lang.langBtn;
  heroTitle.innerHTML = lang.heroAccent ? `${lang.heroLead} <span class="accent">${lang.heroAccent}</span>` : lang.heroLead;
  heroSub.textContent = lang.heroSub;
  searchInput.placeholder = lang.searchPlaceholder;
  emptyState.textContent = lang.empty;
  submitEntry.textContent = lang.submit;
  aboutEntry.textContent = lang.about;
  mTotalLabel.textContent = lang.totalLabel;
  mFreeLabel.textContent = lang.freeLabel;
  mCatsLabel.textContent = lang.catsLabel;
  if (clearSearchBtn) clearSearchBtn.textContent = lang.clear;
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
  filterTools();
}

function updateMoreButtonLabel() {
  if (!categoryTagRow) return;
  const btn = categoryTagRow.querySelector('[data-i18n-key="more"]');
  if (!btn) return;
  const lang = I18N[currentLang];
  if (!lang || !lang.tagLabels) return;
  if (moreExpanded) {
    const label = currentLang === 'zh' ? '收起' : 'Less';
    btn.innerHTML = `<span class="more-icon more-icon-minus" aria-hidden="true"></span><span class="more-label">${label}</span>`;
  } else {
    btn.innerHTML = `<span class="more-icon more-icon-plus" aria-hidden="true"></span><span class="more-label">${lang.tagLabels.more}</span>`;
  }
}

function setMoreExpanded(expanded) {
  moreExpanded = expanded;
  if (!categoryTagRow) return;
  const extraButtons = categoryTagRow.querySelectorAll('.category-tag-extra');
  extraButtons.forEach(btn => {
    btn.classList.toggle('hidden', !expanded);
  });
  updateMoreButtonLabel();
  const moreBtn = categoryTagRow.querySelector('[data-i18n-key="more"]');
  if (!moreBtn) return;
  if (expanded) {
    categoryTagRow.appendChild(moreBtn);
  } else {
    const extras = categoryTagRow.querySelectorAll('.category-tag-extra');
    if (extras.length) {
      categoryTagRow.insertBefore(moreBtn, extras[0]);
    }
  }
}

function toggleViewMode() {
  const isList = toolGrid.classList.contains('list-mode');
  if (isList) {
    toolGrid.classList.remove('list-mode');
    viewGridBtn.classList.add('active');
    viewListBtn.classList.remove('active');
  } else {
    toolGrid.classList.add('list-mode');
    viewListBtn.classList.add('active');
    viewGridBtn.classList.remove('active');
  }
}

async function init() {
  try {
    const res = await fetch('./tools.json');
    const rawTools = await res.json();
    tools = attachToolIdentity(rawTools);
    updateMetrics(tools);
    applyLanguage();
  } catch (err) {
    toolGrid.innerHTML = `<p>Data load failed: ${err?.message || err}</p>`;
    console.error(err);
  }
}

searchInput.addEventListener('input', () => {
  activeTagKey = '';
  filterTools();
});
if (clearSearchBtn) {
  clearSearchBtn.addEventListener('click', () => {
    activeTagKey = '';
    searchInput.value = '';
    filterTools();
    searchInput.focus();
  });
}
sortSelect.addEventListener('change', () => { sortInline.value = sortSelect.value; filterTools(); });
sortInline.addEventListener('change', () => { sortSelect.value = sortInline.value; filterTools(); });
viewGridBtn.addEventListener('click', toggleViewMode);
viewListBtn.addEventListener('click', toggleViewMode);
langToggle.addEventListener('click', () => { currentLang = currentLang === 'zh' ? 'en' : 'zh'; applyLanguage(); });

if (priceFilter) {
  priceFilter.addEventListener('change', () => {
    priceMode = priceFilter.value || 'all';
    filterTools();
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
    // 再次点击同一个标签则清空筛选
    if (activeTagKey === keyForMatch) {
      activeTagKey = '';
      searchInput.value = '';
    } else {
      activeTagKey = keyForMatch;
      // 搜索框始终显示当前语言下的标签文本
      searchInput.value = displayText;
    }
    filterTools();
  });
}

window.addEventListener('scroll', () => {
  if (window.scrollY > 300) toTopBtn.classList.add('show');
  else toTopBtn.classList.remove('show');
});
toTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

init();
