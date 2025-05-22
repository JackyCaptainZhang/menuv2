import React from 'react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import uiText from './i18n';

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  return (
    <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} style={{ position: 'absolute', top: 10, right: 10 }}>
      {uiText[lang].switchLang}
    </button>
  );
};

const Home = () => {
  const { lang } = useLanguage();
  return (
    <div style={{ padding: 32 }}>
      <h1>{lang === 'en' ? 'Jacky & Yuan\'s Menu 😋' : '乐乐&袁宝の美味Menu😋'}</h1>
      <p>{lang === 'en' ? 'Welcome! Please select a menu item.' : '欢迎！请选择一个菜单项。'}</p>
      {/* 这里后续会放菜单/食谱/酱料的列表和详情 */}
    </div>
  );
};

function App() {
  return (
    <LanguageProvider>
      <LanguageSwitcher />
      <Home />
    </LanguageProvider>
  );
}

export default App;
