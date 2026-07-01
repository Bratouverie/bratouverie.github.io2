import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Trash2, RotateCcw, RefreshCw, AlertTriangle, ArrowLeft, Loader2 } from 'lucide-react';
import { logCandidateAction } from '@/lib/candidateLogger';

export default function Trash() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [restoring, setRestoring] = useState(null);
  const [permaDeleting, setPermaDeleting] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const all = await base44.entities.Candidate.list('-created_date', 500);
      setCandidates(all.filter(c => c.deleted_at).sort((a, b) => new Date(b.deleted_at) - new Date(a.deleted_at)));
    } catch (e) {
      console.error('Trash load error:', e);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    base44.auth.me().then(setCurrentUser).catch(() => {});
  }, [load]);

  const getActor = () => ({
    name: currentUser?.full_name || currentUser?.email || 'Администратор',
    role: 'admin',
  });

  const handleRestore = async (c) => {
    setRestoring(c.id);
    try {
      await base44.entities.Candidate.update(c.id, { deleted_at: null });
      await logCandidateAction({ action: 'update', candidate: { ...c, deleted_at: null }, oldData: c, actor: getActor() });
      setCandidates(prev => prev.filter(x => x.id !== c.id));
    } catch (e) {
      alert('Ошибка восстановления: ' + e.message);
    }
    setRestoring(null);
  };

  const handlePermanentDelete = async (c) => {
    if (!confirm(`НАВСЕГДА удалить «${c.full_name}»? Это действие НЕОБРАТИМО.`)) return;
    if (!confirm('Последнее подтверждение: запись будет удалена безвозвратно. Продолжить?')) return;
    setPermaDeleting(c.id);
    try {
      await base44.entities.Candidate.delete(c.id);
      await logCandidateAction({ action: 'delete', candidate: { ...c }, actor: getActor() });
      setCandidates(prev => prev.filter(x => x.id !== c.id));
    } catch (e) {
      alert('Ошибка удаления: ' + e.message);
    }
    setPermaDeleting(null);
  };

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return !q || c.full_name?.toLowerCase().includes(q) || c.agency_name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q);
  });

  const inp = "px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC]">
      {/* Header */}
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/admin/candidates" className="flex items-center gap-2 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors">
              <ArrowLeft size={16} />
              <span className="text-sm">Назад к кандидатам</span>
            </Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <h1 className="text-sm font-bold text-[#F8FAFC] flex items-center gap-2">
              <Trash2 size={15} className="text-red-400" />
              Корзина
            </h1>
          </div>
          <button onClick={load} title="Обновить"
            className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Info banner */}
        <div className="mb-4 flex items-start gap-3 px-4 py-3 rounded-xl bg-red-500/8 border border-red-500/20 text-sm text-red-300/80">
          <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-red-400">Записи в корзине скрыты из основного интерфейса</p>
            <p className="text-xs mt-0.5">Кандидаты перемещены в корзину и не учитываются в статистике. Восстановление возвращает их в активную базу. Безвозвратное удаление — необратимо.</p>
          </div>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 mb-4">
          <input
            type="text"
            placeholder="Поиск по ФИО, агентству, должности..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className={inp + ' flex-1 max-w-md'}
          />
          <span className="text-xs text-[#F8FAFC]/30">
            Всего в корзине: {candidates.length}
          </span>
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#7B3FBF]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-[#F8FAFC]/30">
            <Trash2 size={32} className="mb-3 text-[#F8FAFC]/15" />
            <p>Корзина пуста</p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-visible">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(123,63,191,0.15)]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">ФИО</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">Агентство</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Должность</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">Удалён</th>
                    <th className="text-right px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                      <td className="px-4 py-3 font-bold text-[#F8FAFC]/80">{c.full_name}</td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/45">{c.agency_name || '—'}</td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/55">{c.position || '—'}</td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/45 whitespace-nowrap">
                        {c.deleted_at ? new Date(c.deleted_at).toLocaleString('ru-RU') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => handleRestore(c)}
                            disabled={restoring === c.id}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-green-500/15 text-green-400 border border-green-500/25 hover:bg-green-500/25 transition-all disabled:opacity-40"
                          >
                            {restoring === c.id ? <Loader2 size={12} className="animate-spin" /> : <RotateCcw size={12} />}
                            Восстановить
                          </button>
                          <button
                            onClick={() => handlePermanentDelete(c)}
                            disabled={permaDeleting === c.id}
                            title="Удалить безвозвратно"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-all disabled:opacity-40"
                          >
                            {permaDeleting === c.id ? <Loader2 size={12} className="animate-spin" /> : <Trash2 size={12} />}
                            Удалить навсегда
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}