import { createContext, useContext, useState } from 'react';
import { t as translate } from '../i18n/index.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('kacip_lang') || 'bm');

  function toggle() {
    const next = lang === 'bm' ? 'en' : 'bm';
    setLang(next);
    localStorage.setItem('kacip_lang', next);
  }

  const t = (key, ...args) => translate(lang, key, ...args);

  return (
    <LangContext.Provider value={{ lang, toggle, t }}>
      {children}
    </LangContext.Provider>
  );
}

export const useLang = () => useContext(LangContext);
