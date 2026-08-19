import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { FaCheckCircle, FaChevronRight, FaClock, FaGlobe, FaLayerGroup, FaNetworkWired, FaShieldAlt, FaStop } from 'react-icons/fa';

function LoadingScreen({ progress, onStop, url, options = {} }) {
  const [ip, setIp] = useState('Detecting...');
  const [elapsed, setElapsed] = useState(0);
  useEffect(() => {
    const started = Date.now();
    const timer = setInterval(() => setElapsed(Math.floor((Date.now() - started) / 1000)), 1000);
    fetch('/api/my-ip').then(res => res.json()).then(data => setIp(data.ip || 'Unavailable')).catch(() => setIp('Unavailable'));
    return () => clearInterval(timer);
  }, []);

  const completed = progress?.completed || 0;
  const failed = progress?.failed || 0;
  const remaining = progress?.remaining || 0;
  const total = Math.max(completed + failed + remaining, 1);
  const percentage = Math.min(100, Math.round(((completed + failed) / total) * 100));
  const step = remaining === 0 ? 'Finalizing report' : completed === 0 ? 'Preparing secure browser session' : 'Processing website visits';
  const formatTime = useMemo(() => `${String(Math.floor(elapsed / 60)).padStart(2, '0')}:${String(elapsed % 60).padStart(2, '0')}`, [elapsed]);
  const stats = [['Completed', completed, 'text-emerald-300', 'bg-emerald-400/10'], ['Remaining', remaining, 'text-amber-300', 'bg-amber-400/10'], ['Failed', failed, 'text-rose-300', 'bg-rose-400/10']];

  return <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="loading-overlay">
    <motion.div initial={{ y: 24, scale: .97 }} animate={{ y: 0, scale: 1 }} className="loading-panel">
      <div className="absolute -right-24 -top-24 h-48 w-48 rounded-full bg-fuchsia-500/20 blur-3xl" />
      <div className="relative">
        <div className="mb-7 flex items-start justify-between"><div className="flex items-center gap-3"><div className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 shadow-lg shadow-violet-500/30"><motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: 'linear' }} className="h-7 w-7 rounded-full border-2 border-white/30 border-t-white" /></div><div><p className="text-xs font-bold uppercase tracking-[.2em] text-violet-300">Live session</p><h2 className="text-2xl font-bold">Automation in progress</h2></div></div><div className="flex items-center gap-1.5 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-300"><span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> Active</div></div>
        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="mb-3 flex items-center justify-between text-xs"><span className="flex items-center gap-2 text-slate-300"><FaChevronRight className="text-violet-400" /> {step}</span><span className="font-bold text-violet-300">{percentage}%</span></div><div className="h-2 overflow-hidden rounded-full bg-slate-800"><motion.div initial={{ width: 0 }} animate={{ width: `${percentage}%` }} className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-violet-500 to-fuchsia-500" /></div><div className="mt-3 flex justify-between text-[11px] text-slate-500"><span>{completed + failed} of {total} processed</span><span className="flex items-center gap-1"><FaClock /> {formatTime}</span></div></div>
        <div className="mb-5 grid grid-cols-3 gap-2.5">{stats.map(([label, value, color, bg]) => <div key={label} className={`rounded-2xl border border-white/10 ${bg} p-3`}><div className={`text-2xl font-bold ${color}`}>{value}</div><div className="mt-1 text-[9px] font-bold uppercase tracking-widest text-slate-500">{label}</div></div>)}</div>
        <div className="mb-6 grid gap-3 sm:grid-cols-2"><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"><FaGlobe className="text-cyan-400" /> Target</div><p className="break-all font-mono text-xs text-slate-200">{url}</p></div><div className="rounded-2xl border border-white/10 bg-white/[.04] p-4"><div className="mb-2 flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-500"><FaNetworkWired className="text-blue-400" /> Client IP</div><p className="font-mono text-xs text-slate-200">{ip}</p></div></div>
        <div className="mb-6 flex flex-wrap gap-2 text-[10px] font-semibold text-slate-300"><span className="flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1.5"><FaShieldAlt className="text-violet-300" /> {options.trafficMode || 'stealth'} mode</span><span className="flex items-center gap-1.5 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-3 py-1.5"><FaLayerGroup className="text-cyan-300" /> Batch {options.maxBatchVisits || 1}</span>{progress?.totalLoops > 1 && <span className="flex items-center gap-1.5 rounded-full border border-fuchsia-400/20 bg-fuchsia-400/10 px-3 py-1.5"><FaCheckCircle className="text-fuchsia-300" /> Loop {progress.currentLoop || 1}/{progress.totalLoops}</span>}</div>
        <motion.button whileHover={{ scale: 1.01 }} whileTap={{ scale: .98 }} onClick={onStop} className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-rose-600 to-red-500 py-4 text-sm font-bold uppercase tracking-widest shadow-lg shadow-red-950/30"><FaStop className="text-xs" /> Stop automation</motion.button><p className="mt-3 text-center text-[10px] text-slate-600">You can safely stop the session at any time.</p>
      </div>
    </motion.div>
  </motion.div>;
}

export default LoadingScreen;
