import { useLang } from '../../context/LangContext.jsx';

export function LangToggle() {
  const { lang, toggle } = useLang();
  const isEn = lang === 'en';

  return (
    <button
      onClick={toggle}
      aria-label="Toggle language"
      className="relative flex items-center h-7 w-16 rounded-full bg-zinc-800 border border-zinc-700 p-0.5 transition-colors hover:border-zinc-500"
    >
      <span className="absolute left-1 text-xs font-mono font-medium text-zinc-500">BM</span>
      <span className="absolute right-1 text-xs font-mono font-medium text-zinc-500">EN</span>
      <span
        className={`relative z-10 flex items-center justify-center h-6 w-7 rounded-full bg-emerald-500 text-white text-xs font-mono font-medium transition-transform duration-200 ${isEn ? 'translate-x-9' : 'translate-x-0'}`}
      >
        {isEn ? 'EN' : 'BM'}
      </span>
    </button>
  );
}
