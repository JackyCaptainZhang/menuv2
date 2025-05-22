import React, { createContext, useContext, useState, ReactNode } from 'react';

// 定义类型
interface LanguageContextType {
  lang: 'en' | 'zh';
  setLang: (lang: 'en' | 'zh') => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'zh',
  setLang: () => {},
});

export const useLanguage = () => useContext(LanguageContext);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [lang, setLang] = useState<'en' | 'zh'>('zh');
  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
}; 