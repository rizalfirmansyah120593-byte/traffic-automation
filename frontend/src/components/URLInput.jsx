import { useState } from 'react';
import { motion } from 'framer-motion';
import { FaRocket, FaChevronDown } from 'react-icons/fa';
import { useLanguage } from '../i18n';

const QA_MAX_VISITS = 5;
const QA_MAX_LOOPS = 1;

function URLInput({ onSubmit }) {
  const { t, language } = useLanguage();
  const seoAuditLabel = language === 'id' ? 'Mulai Audit SEO' : 'Start SEO Audit';
  const seoHint = language === 'id'
    ? 'Audit SEO pasif; hanya satu URL dan tidak mengirim klik ke mesin pencari.'
    : 'Passive SEO audit; one URL only, with no search-engine clicks.';
  const seoUrlError = language === 'id' ? 'SEO audit hanya memproses satu URL setiap kali' : 'SEO audit accepts one URL at a time';
  const qaLabel = language === 'id' ? 'Durasi per visit (menit)' : 'Visit duration (minutes)';
  const qaHint = language === 'id'
    ? `QA eksplisit: ${QA_MAX_VISITS} visit berurutan, ${QA_MAX_LOOPS} loop, browser standar tanpa stealth. Domain harus ada di ALLOWED_DOMAINS.`
    : `Explicit QA: ${QA_MAX_VISITS} sequential visits, ${QA_MAX_LOOPS} loop, standard browser without stealth. Domain must be in ALLOWED_DOMAINS.`;
  const qaUrlError = language === 'id' ? 'Mode QA hanya memproses satu URL setiap kali' : 'QA mode accepts one URL at a time';
  const [visitDurationMinutes, setVisitDurationMinutes] = useState('5');
  const [durationError, setDurationError] = useState('');
  const [url, setUrl] = useState('');
  const [error, setError] = useState('');
  const [visitCount, setVisitCount] = useState('1');
  const [visitCountError, setVisitCountError] = useState('');
  const [loopCount, setLoopCount] = useState('1');
  const [loopError, setLoopError] = useState('');
  const [maxBatch, setMaxBatch] = useState('20');
  const [batchError, setBatchError] = useState('');
  const [trafficMode, setTrafficMode] = useState('seo');
  const isSeoAudit = trafficMode === 'seo';
  const isQaMode = trafficMode === 'qa';
  const singleUrlMode = isSeoAudit || isQaMode;
  const MAX_VISITS = 1000;

  const validateUrl = (input) => {
    try {
      new URL(input);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const rawUrls = url.split(/[\n,]+/).map(item => item.trim()).filter(Boolean);
    if (rawUrls.length > 3 || (singleUrlMode && rawUrls.length > 1)) {
      setError(isSeoAudit ? seoUrlError : isQaMode ? qaUrlError : 'Maksimal 3 URL yang dapat diproses sekaligus');
      return;
    }
    const processedUrls = rawUrls.map(item => /^https?:\/\//i.test(item) ? item : `https://${item}`);
    let processedUrl = processedUrls[0] || '';
    
    if (!processedUrl) {
      setError('Please enter a URL');
      return;
    }

    const parsedVisitCount = Number(visitCount);
    if (!singleUrlMode && (!Number.isInteger(parsedVisitCount) || parsedVisitCount < 1 || parsedVisitCount > MAX_VISITS)) {
      setVisitCountError(`Visit count must be an integer between 1 and ${MAX_VISITS}`);
      return;
    }

    const parsedLoopCount = Number(loopCount);
    if (!singleUrlMode && (!Number.isInteger(parsedLoopCount) || parsedLoopCount < 1 || parsedLoopCount > 100)) {
      setLoopError(`Loops must be between 1 and 100`);
      return;
    }

    const maxBatchLimit = 20; // FIXED: Consistent limit of 20
    const parsedBatch = Number(maxBatch);
    if (!singleUrlMode && (!Number.isInteger(parsedBatch) || parsedBatch < 1 || parsedBatch > maxBatchLimit)) {
      setBatchError(`Batch size must be between 1 and ${maxBatchLimit}`);
      return;
    }

    const parsedDuration = Number(visitDurationMinutes);
    if (isQaMode && (!Number.isInteger(parsedDuration) || parsedDuration < 1 || parsedDuration > 10)) {
      setDurationError(language === 'id' ? 'Durasi harus bilangan bulat 1–10 menit' : 'Duration must be a whole number from 1–10 minutes');
      return;
    }
    
    if (!processedUrl.startsWith('http://') && !processedUrl.startsWith('https://')) {
      processedUrl = 'https://' + processedUrl;
    }
    
    if (!validateUrl(processedUrl)) {
      setError('Please enter a valid URL');
      return;
    }
    
    setError('');
    setVisitCountError('');
    setLoopError('');
    setBatchError('');
    setDurationError('');
    onSubmit(processedUrl, { 
      batchUrls: singleUrlMode ? [processedUrl] : processedUrls,
      visitCount: isQaMode ? QA_MAX_VISITS : isSeoAudit ? 1 : parsedVisitCount,
      loopCount: isQaMode ? QA_MAX_LOOPS : isSeoAudit ? 1 : parsedLoopCount,
      maxBatchVisits: singleUrlMode ? 1 : parsedBatch,
      ...(isQaMode ? { visitDurationMinutes: parsedDuration } : {}),
      trafficMode: trafficMode
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="max-w-6xl mx-auto mb-8"
    >
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 min-w-[300px] relative">
            <textarea
              type="text"
              value={url}
              rows="1"
              onChange={(e) => {
                setUrl(e.target.value);
                if (error) setError('');
              }}
              placeholder={singleUrlMode ? t('placeholder') : `${t('placeholder')} — max. 3 URL (satu per baris)`}
              className={`w-full px-6 py-4 rounded-xl bg-white/10 backdrop-blur-md border ${
                error ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
            />
            <p className="text-gray-400 text-xs mt-2">{isSeoAudit ? seoHint : isQaMode ? qaHint : 'Masukkan hingga 3 URL, satu URL per baris. Diproses berurutan untuk menjaga stabilitas RAM.'}</p>
            {error && (
              <p className="text-red-400 text-sm mt-2">{error}</p>
            )}
          </div>
          {!singleUrlMode && <div className="md:w-36 relative">
            <input
              type="number"
              min="1"
              max={MAX_VISITS}
              step="1"
              value={visitCount}
              onChange={(e) => {
                setVisitCount(e.target.value);
                if (visitCountError) setVisitCountError('');
              }}
              className={`w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border ${
                visitCountError ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
              placeholder={t('visitCount')}
            />
            <p className="text-gray-400 text-xs mt-2">Visits (1–{MAX_VISITS})</p>
            {visitCountError && (
              <p className="text-red-400 text-sm mt-2">{visitCountError}</p>
            )}
          </div>}
          {!singleUrlMode && <div className="md:w-32 relative">
            <input
              type="number"
              min="1"
              max="100"
              step="1"
              value={loopCount}
              onChange={(e) => {
                setLoopCount(e.target.value);
                if (loopError) setLoopError('');
              }}
              className={`w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border ${
                loopError ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
              placeholder="Loops"
            />
            <p className="text-gray-400 text-xs mt-2">Loops (1–100)</p>
            {loopError && (
              <p className="text-red-400 text-sm mt-2">{loopError}</p>
            )}
          </div>}
          <div className="md:w-56 relative group">
            <select
              value={trafficMode}
              onChange={(e) => {
                const newMode = e.target.value;
                setTrafficMode(newMode);
                if (batchError) setBatchError('');
              }}
              className="w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all appearance-none cursor-pointer group-hover:bg-white/20 pr-10"
            >
              <option value="stealth" className="bg-gray-800">🛡️ Stealth Anti-Bot</option>
              <option value="storm" className="bg-gray-800">⚡ Storm Traffic</option>
              <option value="qa" className="bg-gray-800">🧪 QA (durasi eksplisit)</option>
              <option value="seo" className="bg-gray-800">🔍 SEO Audit (pasif)</option>
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 group-hover:text-white transition-colors">
              <FaChevronDown size={14} />
            </div>
            <p className="text-gray-400 text-xs mt-2">{t('trafficMode')}</p>
          </div>
          {isQaMode && <div className="md:w-44 relative">
            <input
              type="number"
              min="1"
              max="10"
              step="1"
              value={visitDurationMinutes}
              onChange={(e) => {
                setVisitDurationMinutes(e.target.value);
                if (durationError) setDurationError('');
              }}
              className={`w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border ${durationError ? 'border-red-500' : 'border-white/20'} text-white focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
              aria-label={qaLabel}
            />
            <p className="text-gray-400 text-xs mt-2">{qaLabel} (1–10)</p>
            {durationError && <p className="text-red-400 text-sm mt-2">{durationError}</p>}
          </div>}
          {!singleUrlMode && <div className="md:w-36 relative">
            <input
              type="number"
              min="1"
              max="20"
              step="1"
              value={maxBatch}
              onChange={(e) => {
                setMaxBatch(e.target.value);
                if (batchError) setBatchError('');
              }}
              className={`w-full px-4 py-4 rounded-xl bg-white/10 backdrop-blur-md border ${
                batchError ? 'border-red-500' : 'border-white/20'
              } text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all`}
              placeholder="Batch"
            />
            <p className="text-gray-400 text-xs mt-2">Batch (1–20)</p>
            {batchError && (
              <p className="text-red-400 text-sm mt-2">{batchError}</p>
            )}
          </div>}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-2xl hover:shadow-purple-500/50 transition-all flex items-center justify-center gap-2"
          >
            <FaRocket />
            <span>{isSeoAudit ? seoAuditLabel : isQaMode ? (language === 'id' ? 'Mulai QA' : 'Start QA') : t('automate')}</span>
          </motion.button>
        </div>
      </form>
      
      <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
        <p className="text-sm text-blue-300 mb-2">
          <strong>🎯 Active Mode: {trafficMode === 'stealth' ? '🛡️ Stealth Anti-Bot' : trafficMode === 'storm' ? '⚡ Storm Traffic' : isQaMode ? '🧪 QA Visit' : '🔍 SEO Audit'}</strong>
        </p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-2 text-xs text-gray-300">
          {trafficMode === 'stealth' && (
            <>
              <div>✓ Random User Agents</div>
              <div>✓ Device Spoofing</div>
              <div>✓ Mouse Simulation</div>
              <div>✓ Scroll Behavior</div>
              <div>✓ Random Delays</div>
              <div>✓ Fingerprint Masking</div>
              <div>✓ Chrome Runtime Mock</div>
              <div>✓ Human Interactions</div>
              <div>✓ Batch Processing</div>
              <div>✓ Anti-Detection</div>
            </>
          )}
          {trafficMode === 'storm' && (
            <>
              <div>⚡ Maximum Speed</div>
              <div>⚡ High Concurrency</div>
              <div>⚡ Fast Page Loads</div>
              <div>⚡ Minimal Delays</div>
              <div>⚡ Volume Focus</div>
              <div>✓ User Agent Rotation</div>
              <div>✓ Batch Processing</div>
              <div>⚠️ Reduced Stealth</div>
              <div>⚠️ No Human Sim</div>
              <div>⚠️ Higher Detection Risk</div>
            </>
          )}
          {isQaMode && (
            <>
              <div>✓ Browser standar tanpa stealth</div>
              <div>✓ {QA_MAX_VISITS} visit berurutan / {QA_MAX_LOOPS} loop</div>
              <div>✓ Durasi tunggu {visitDurationMinutes} menit</div>
              <div>✓ Hanya domain allowlist</div>
            </>
          )}
          {isSeoAudit && (
            <>
              <div>✓ Indeksasi: cek sinyal noindex</div>
              <div>✓ robots.txt</div>
              <div>✓ Sitemap</div>
              <div>✓ Canonical</div>
              <div>✓ Status HTTP &amp; meta</div>
              <div>✓ Tanpa query mesin pencari</div>
              <div>✓ Tanpa klik atau kunjungan berulang</div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export default URLInput;
