import { motion } from 'framer-motion';
import { FaCheckCircle, FaExclamationTriangle, FaTimesCircle } from 'react-icons/fa';
import { useLanguage } from '../i18n';

const copy = {
  id: {
    title: 'Audit SEO selesai', failed: 'Audit SEO gagal', signals: 'Sinyal indeksasi teknis',
    indexable: 'Tidak ditemukan penghalang indeksasi umum', blocked: 'Ada penghalang indeksasi',
    unknown: 'Sinyal indeksasi belum lengkap', caveat: 'Audit ini tidak mengirim query atau klik ke mesin pencari. Sinyal teknis bukan konfirmasi bahwa halaman sudah terindeks; verifikasi status aktual melalui Search Console atau Bing Webmaster Tools.',
    page: 'Halaman', http: 'Status HTTP', pageTitle: 'Title', description: 'Meta description', canonical: 'Canonical', robotsMeta: 'Robots meta', xRobots: 'X-Robots-Tag', robotsTxt: 'robots.txt', sitemap: 'Sitemap', status: 'Status', rules: 'Aturan robots', blockedAll: 'Disallow / untuk semua bot', yes: 'Ya', no: 'Tidak', unknownValue: 'Tidak diketahui', none: 'Tidak ditemukan', urls: 'URL di sitemap', index: 'Sitemap index', warnings: 'Temuan', noWarnings: 'Tidak ada temuan umum.', open: 'URL final'
  },
  en: {
    title: 'SEO audit complete', failed: 'SEO audit failed', signals: 'Technical indexability signals',
    indexable: 'No common indexing blockers found', blocked: 'Potential indexing blockers found',
    unknown: 'Indexability signals are incomplete', caveat: 'This audit does not send search queries or clicks. Technical signals do not confirm actual indexation; check Search Console or Bing Webmaster Tools for that.',
    page: 'Page', http: 'HTTP status', pageTitle: 'Title', description: 'Meta description', canonical: 'Canonical', robotsMeta: 'Robots meta', xRobots: 'X-Robots-Tag', robotsTxt: 'robots.txt', sitemap: 'Sitemap', status: 'Status', rules: 'Robots rules', blockedAll: 'Disallow / for all bots', yes: 'Yes', no: 'No', unknownValue: 'Unknown', none: 'Not found', urls: 'Sitemap URLs', index: 'Sitemap index', warnings: 'Findings', noWarnings: 'No common issues found.', open: 'Final URL'
  },
  es: {
    title: 'Auditoría SEO completada', failed: 'Falló la auditoría SEO', signals: 'Señales técnicas de indexabilidad',
    indexable: 'No se encontraron bloqueos comunes', blocked: 'Se encontraron posibles bloqueos',
    unknown: 'Señales incompletas', caveat: 'La auditoría no envía búsquedas ni clics. Las señales técnicas no confirman la indexación real; compruébala en Search Console o Bing Webmaster Tools.',
    page: 'Página', http: 'Estado HTTP', pageTitle: 'Título', description: 'Meta description', canonical: 'Canonical', robotsMeta: 'Robots meta', xRobots: 'X-Robots-Tag', robotsTxt: 'robots.txt', sitemap: 'Sitemap', status: 'Estado', rules: 'Reglas robots', blockedAll: 'Disallow / para todos los bots', yes: 'Sí', no: 'No', unknownValue: 'Desconocido', none: 'No encontrado', urls: 'URL del sitemap', index: 'Índice sitemap', warnings: 'Hallazgos', noWarnings: 'No se encontraron problemas comunes.', open: 'URL final'
  },
  fr: {
    title: 'Audit SEO terminé', failed: 'Échec de l’audit SEO', signals: 'Signaux techniques d’indexabilité',
    indexable: 'Aucun blocage courant détecté', blocked: 'Des blocages potentiels ont été détectés',
    unknown: 'Signaux incomplets', caveat: 'Cet audit n’envoie ni requête ni clic aux moteurs de recherche. Ces signaux ne confirment pas l’indexation réelle; vérifiez Search Console ou Bing Webmaster Tools.',
    page: 'Page', http: 'Statut HTTP', pageTitle: 'Titre', description: 'Meta description', canonical: 'Canonical', robotsMeta: 'Robots meta', xRobots: 'X-Robots-Tag', robotsTxt: 'robots.txt', sitemap: 'Sitemap', status: 'Statut', rules: 'Règles robots', blockedAll: 'Disallow / pour tous les robots', yes: 'Oui', no: 'Non', unknownValue: 'Inconnu', none: 'Introuvable', urls: 'URL du sitemap', index: 'Index sitemap', warnings: 'Constats', noWarnings: 'Aucun problème courant détecté.', open: 'URL finale'
  },
  de: {
    title: 'SEO-Audit abgeschlossen', failed: 'SEO-Audit fehlgeschlagen', signals: 'Technische Indexierungssignale',
    indexable: 'Keine üblichen Indexierungshindernisse gefunden', blocked: 'Mögliche Indexierungshindernisse gefunden',
    unknown: 'Indexierungssignale unvollständig', caveat: 'Dieses Audit sendet keine Suchanfragen oder Klicks. Technische Signale bestätigen keine tatsächliche Indexierung; prüfen Sie dazu Search Console oder Bing Webmaster Tools.',
    page: 'Seite', http: 'HTTP-Status', pageTitle: 'Titel', description: 'Meta description', canonical: 'Canonical', robotsMeta: 'Robots meta', xRobots: 'X-Robots-Tag', robotsTxt: 'robots.txt', sitemap: 'Sitemap', status: 'Status', rules: 'Robots-Regeln', blockedAll: 'Disallow / für alle Bots', yes: 'Ja', no: 'Nein', unknownValue: 'Unbekannt', none: 'Nicht gefunden', urls: 'Sitemap-URLs', index: 'Sitemap-Index', warnings: 'Befunde', noWarnings: 'Keine üblichen Probleme gefunden.', open: 'Endgültige URL'
  }
};

function StatusValue({ value, success }) {
  return <span className={success ? 'text-emerald-300' : 'text-amber-300'}>{value}</span>;
}

function SeoAuditResult({ data }) {
  const { language } = useLanguage();
  const t = copy[language] || copy.en;
  if (!data.success) {
    return <section className="mb-8 rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-white">
      <div className="mb-3 flex items-center gap-3"><FaTimesCircle className="text-red-400" /><h3 className="text-xl font-bold">{t.failed}</h3></div>
      <p className="text-slate-200">{data.error}</p>
      {data.url && <p className="mt-3 break-all font-mono text-xs text-slate-400">{data.url}</p>}
    </section>;
  }

  const signals = data.indexingSignals || {};
  const signalLabel = signals.likelyIndexable === null || signals.likelyIndexable === undefined
    ? t.unknown
    : signals.likelyIndexable ? t.indexable : t.blocked;
  const robots = data.robots || {};
  const sitemaps = data.sitemaps || [];

  return <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8 rounded-2xl border border-cyan-400/20 bg-slate-900/70 p-6 text-white shadow-xl">
    <div className="mb-5 flex items-center gap-3"><FaCheckCircle className="text-2xl text-emerald-400" /><h3 className="text-2xl font-bold">{t.title}</h3></div>
    <div className="mb-5 rounded-xl border border-cyan-400/20 bg-cyan-400/5 p-4">
      <h4 className="mb-2 font-semibold text-cyan-200">{t.signals}: <StatusValue value={signalLabel} success={Boolean(signals.likelyIndexable)} /></h4>
      <p className="text-sm text-slate-300">{t.caveat}</p>
    </div>

    <div className="mb-5 grid gap-3 sm:grid-cols-2">
      <div className="rounded-xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t.http}</p><p className="mt-1 font-semibold">{data.httpStatus}</p></div>
      <div className="rounded-xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t.pageTitle}</p><p className="mt-1 break-words font-semibold">{data.title || t.none}</p></div>
      <div className="rounded-xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t.description}</p><p className="mt-1 break-words text-sm">{data.description || t.none}</p></div>
      <div className="rounded-xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t.canonical}</p><p className="mt-1 break-all text-sm">{data.canonicalUrl || t.none}</p>{data.canonicalUrl && <StatusValue value={data.canonicalMatchesPage ? t.yes : t.no} success={Boolean(data.canonicalMatchesPage)} />}</div>
      <div className="rounded-xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t.robotsMeta}</p><p className="mt-1 break-words text-sm">{data.metaRobots?.join(', ') || t.none}</p><p className="mt-2 text-xs text-slate-400">{t.xRobots}: {data.xRobotsTag || t.none}</p></div>
      <div className="rounded-xl bg-white/5 p-4"><p className="text-xs uppercase text-slate-400">{t.robotsTxt}</p><p className="mt-1">{t.status}: {robots.status ?? t.unknownValue}</p><p className="mt-1 text-sm">{t.rules}: {robots.ruleCount ?? 0}</p><p className="mt-1 text-sm">{t.blockedAll}: {robots.wildcardDisallowRoot === null ? t.unknownValue : robots.wildcardDisallowRoot ? t.yes : t.no}</p></div>
    </div>

    <div className="mb-5 rounded-xl bg-white/5 p-4">
      <h4 className="mb-3 font-semibold">{t.sitemap}</h4>
      {sitemaps.length ? <ul className="space-y-3">{sitemaps.map((sitemap, index) => <li key={`${sitemap.url}-${index}`} className="border-t border-white/10 pt-3 first:border-0 first:pt-0">
        <p className="break-all font-mono text-xs text-slate-300">{sitemap.url}</p>
        <p className="mt-1 text-sm">{t.status}: {sitemap.status ?? t.unknownValue} · {t.urls}: {sitemap.locationCount} · {t.index}: {sitemap.isIndex ? t.yes : t.no}</p>
        {sitemap.error && <p className="mt-1 text-sm text-amber-300">{sitemap.error}</p>}
      </li>)}</ul> : <p className="text-sm text-slate-400">{t.none}</p>}
    </div>

    <div className="rounded-xl border border-amber-400/20 bg-amber-400/5 p-4">
      <h4 className="mb-2 flex items-center gap-2 font-semibold text-amber-200"><FaExclamationTriangle /> {t.warnings}</h4>
      {data.warnings?.length ? <ul className="list-inside list-disc space-y-1 text-sm text-slate-300">{data.warnings.map((warning, index) => <li key={`${warning}-${index}`}>{warning}</li>)}</ul> : <p className="text-sm text-slate-300">{t.noWarnings}</p>}
    </div>
    <p className="mt-4 break-all text-xs text-slate-500">{t.open}: {data.finalUrl}</p>
  </motion.section>;
}

export default SeoAuditResult;
