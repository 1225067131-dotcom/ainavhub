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

const toolSlug = getSlugFromHash() || getSlugFromPathname() || (query.get('slug') || '').trim().toLowerCase();
let currentLang = query.get('lang') === 'en' ? 'en' : 'zh';

const I18N = {
  zh: {
    pageTitle: '工具详情 - Navify AI',
    back: '返回列表',
    visit: '访问官网',
    notFound: '未找到该工具，请返回列表重试。',
    loadError: '加载失败，请稍后再试。',
    category: '分类',
    price: '价格类型',
    tags: '标签'
  },
  en: {
    pageTitle: 'Tool Detail - Navify AI',
    back: 'Back to List',
    visit: 'Visit Official Site',
    notFound: 'Tool not found. Please return to the list.',
    loadError: 'Failed to load data. Please try again later.',
    category: 'Category',
    price: 'Pricing',
    tags: 'Tags'
  }
};

const categoryMap = { 对话: 'Chat', 作图: 'Image', 绘图: 'Image', 视频: 'Video', 编程: 'Coding', 办公: 'Office', 学习: 'Learning' };

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

const localizedDescription = (tool) => currentLang === 'en' ? (tool.descriptionEn || tool.description) : tool.description;
const localizedTags = (tool) => currentLang === 'en' ? (tool.tagsEn || tool.tags || []) : (tool.tags || []);
const localizedCategory = (tool) => {
  if (currentLang === 'zh') return tool.category || '';
  return categoryMap[tool.category] || tool.category || '';
};
const localizedFreeType = (freeType) => {
  if (currentLang === 'zh') return freeType || '';
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

function updateStaticText() {
  const lang = I18N[currentLang];
  document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';
  document.title = lang.pageTitle;
  detailLangToggle.textContent = currentLang === 'zh' ? 'EN' : '中';
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

function renderTool(tool) {
  const lang = I18N[currentLang];
  updateDocumentMeta(tool);
  const tags = localizedTags(tool).map((tag) => `<span class="tag">${tag}</span>`).join('');
  const screenshot = getToolScreenshot(tool.url);
  const screenshotFallback = getToolScreenshotFallback(tool.url);

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

detailLangToggle.addEventListener('click', () => {
  currentLang = currentLang === 'zh' ? 'en' : 'zh';
  const next = new URL(window.location.href);
  next.searchParams.set('lang', currentLang);
  window.location.href = next.toString();
});

loadTool();
