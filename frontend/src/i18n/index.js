import bm from './bm.js';
import en from './en.js';

export const translations = { bm, en };

export function t(lang, key, ...args) {
  const str = translations[lang]?.[key] ?? translations.en[key] ?? key;
  return typeof str === 'function' ? str(...args) : str;
}
