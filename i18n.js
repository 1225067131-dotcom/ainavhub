const SUPPORTED_LANGS = ['zh', 'en', 'ja'];

window.I18NUtils = {
  SUPPORTED_LANGS,
  resolveLang(lang) {
    return SUPPORTED_LANGS.includes(lang) ? lang : 'zh';
  },
  getNextLang(lang) {
    const currentIndex = SUPPORTED_LANGS.indexOf((SUPPORTED_LANGS.includes(lang) ? lang : 'zh'));
    const nextIndex = (currentIndex + 1) % SUPPORTED_LANGS.length;
    return SUPPORTED_LANGS[nextIndex];
  },
  isNonZhLang(lang) {
    return lang !== 'zh';
  },
  htmlLang(lang) {
    if (lang === 'zh') return 'zh-CN';
    if (lang === 'ja') return 'ja';
    return 'en';
  },
  CATEGORY_MAP: {
    对话: 'Chat',
    作图: 'Image',
    绘图: 'Image',
    视频: 'Video',
    编程: 'Coding',
    办公: 'Office',
    学习: 'Learning'
  }
};
