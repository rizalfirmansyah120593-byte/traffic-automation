import { FaGithub, FaHeart, FaShieldAlt, FaTelegramPlane } from 'react-icons/fa';
import { useLanguage } from '../i18n';

const copy = {
  id: { tagline: 'Platform otomasi browser modern untuk pengujian yang aman.', product: 'Produk', guide: 'Panduan penggunaan', status: 'Sistem berjalan normal', safety: 'Safety-first automation', contact: 'Kontak', made: 'Dibuat dengan', rights: 'Hak cipta dilindungi.' },
  en: { tagline: 'Modern browser automation for safe, authorized testing.', product: 'Product', guide: 'Usage guide', status: 'All systems operational', safety: 'Safety-first automation', contact: 'Contact', made: 'Made with', rights: 'All rights reserved.' },
  es: { tagline: 'Automatización moderna para pruebas seguras y autorizadas.', product: 'Producto', guide: 'Guía de uso', status: 'Todos los sistemas funcionan', safety: 'Automatización segura', contact: 'Contacto', made: 'Hecho con', rights: 'Todos los derechos reservados.' },
  fr: { tagline: 'Automatisation moderne pour des tests sûrs et autorisés.', product: 'Produit', guide: "Guide d'utilisation", status: 'Tous les systèmes fonctionnent', safety: 'Automatisation sécurisée', contact: 'Contact', made: 'Créé avec', rights: 'Tous droits réservés.' },
  de: { tagline: 'Moderne Browser-Automation für sichere, autorisierte Tests.', product: 'Produkt', guide: 'Bedienungsanleitung', status: 'Alle Systeme betriebsbereit', safety: 'Sichere Automation', contact: 'Kontakt', made: 'Erstellt mit', rights: 'Alle Rechte vorbehalten.' }
};

export default function Footer() {
  const { language } = useLanguage();
  const c = copy[language] || copy.en;
  return <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-slate-950/70 px-6 pb-8 pt-10 backdrop-blur-xl sm:px-10">
    <div className="absolute inset-x-0 -top-px mx-auto h-px max-w-5xl bg-gradient-to-r from-transparent via-violet-400 to-transparent" />
    <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
      <div><div className="mb-3 flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-lg font-black text-white shadow-lg shadow-violet-500/20">TA</div><div><h2 className="text-lg font-bold text-white">Traffic Automation</h2><p className="text-[10px] uppercase tracking-[.2em] text-violet-300">Safe testing platform</p></div></div><p className="max-w-sm text-sm leading-6 text-slate-400">{c.tagline}</p><div className="mt-5 flex flex-wrap gap-2"><span className="flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-xs text-emerald-300"><FaShieldAlt /> {c.safety}</span><span className="flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5 text-xs text-cyan-300"><span className="h-2 w-2 animate-pulse rounded-full bg-cyan-400" /> {c.status}</span></div></div>
      <div><h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-300">{c.product}</h3><a href="#top" className="mb-3 block text-sm text-slate-400 transition hover:text-violet-300">Traffic Automation</a><a href="#usage-guide" className="block text-sm text-slate-400 transition hover:text-violet-300">{c.guide}</a></div>
      <div><h3 className="mb-4 text-sm font-semibold uppercase tracking-widest text-slate-300">{c.contact}</h3><a href="https://t.me/SyntaxSouq" target="_blank" rel="noreferrer" className="mb-3 flex items-center gap-2 text-sm text-slate-400 transition hover:text-cyan-300"><FaTelegramPlane /> Telegram</a><a href="mailto:eaten-copy-pasty@duck.com" className="mb-3 block text-sm text-slate-400 transition hover:text-violet-300">eaten-copy-pasty@duck.com</a><div className="flex gap-3 text-slate-500"><FaGithub /><FaHeart className="text-rose-400" /></div></div>
    </div>
    <div className="mx-auto mt-10 flex max-w-6xl flex-col justify-between gap-2 border-t border-white/10 pt-5 text-xs text-slate-500 sm:flex-row"><span>© {new Date().getFullYear()} Traffic Automation. {c.rights}</span><span>{c.made} <FaHeart className="mx-1 inline text-rose-400" /> Rizal Firmansyah</span></div>
  </footer>;
}
