import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Download, Mail, Phone, Edit2, Trash2, Search, RefreshCw, RotateCcw } from 'lucide-react';
import AgencyModal from '../../components/admin/AgencyModal';

export default function Agencies() {
  const [agencies, setAgencies]     = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [filterCity, setFilterCity] = useState('');
  const [showDeleted, setShowDeleted] = useState(false);
  const [modalOpen, setModalOpen]   = useState(false);
  const [editAgency, setEditAgency] = useState(null);
  const navigate = useNavigate();

  const load = async () => {
    setLoading(true);
    const [ag, cand] = await Promise.all([
      base44.entities.Agency.list('-created_date', 200),
      base44.entities.Candidate.list('-created_date', 500),
    ]);
    setAgencies(ag);
    setCandidates(cand);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const getCandidatesForAgency = (agencyId) => candidates.filter(c => c.agency_id === agencyId);

  // Soft-delete: помечаем deleted_at, кандидатов не трогаем
  const handleDelete = async (agency) => {
    if (!confirm(`Удалить агентство "${agency.name}"?\nКандидаты будут скрыты из статистики. Восстановление возможно в течение 3 дней.`)) return;
    await base44.entities.Agency.update(agency.id, { deleted_at: new Date().toISOString() });
    load();
  };

  // Восстановление
  const handleRestore = async (agency) => {
    await base44.entities.Agency.update(agency.id, { deleted_at: null });
    load();
  };

  const handleSave = async (data, id) => {
    if (id) {
      await base44.entities.Agency.update(id, data);
    } else {
      // При создании: если дата договора не указана — ставим сегодня
      const today = new Date().toISOString().split('T')[0];
      await base44.entities.Agency.create(data);
    }
    setModalOpen(false);
    setEditAgency(null);
    load();
  };

  const exportCSV = () => {
    const headers = ['Агентство', 'Город', 'Email', 'Телефон', 'Кандидатов', 'Дата договора', 'Активно'];
    const rows = activeAgencies.map(a => [
      a.name, a.city, a.email, a.phone,
      getCandidatesForAgency(a.id).length, a.contract_date, a.is_active ? 'Да' : 'Нет'
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'agencies.csv'; a.click();
  };

  // Разделяем на активные и удалённые (не старше 3 дней)
  const now = Date.now();
  const THREE_DAYS = 3 * 24 * 60 * 60 * 1000;
  const activeAgencies  = agencies.filter(a => !a.deleted_at);
  const deletedAgencies = agencies.filter(a => {
    if (!a.deleted_at) return false;
    return now - new Date(a.deleted_at).getTime() < THREE_DAYS;
  });

  // Кандидаты только активных агентств (для статистики)
  const activeAgencyIds = new Set(activeAgencies.map(a => a.id));
  const activeCandidates = candidates.filter(c => activeAgencyIds.has(c.agency_id));

  const cities = [...new Set(activeAgencies.map(a => a.city).filter(Boolean))].sort();

  const filtered = (showDeleted ? deletedAgencies : activeAgencies).filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name?.toLowerCase().includes(q) || a.city?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q);
    const matchCity = !filterCity || a.city === filterCity;
    return matchSearch && matchCity;
  });

  const inp = "px-3 py-2.5 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC]">
      {/* Header */}
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors">
              <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png" className="w-7 h-7 object-contain" alt="logo" />
            </Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <h1 className="text-sm font-bold text-[#F8FAFC]">База агентств</h1>
            <Link to="/admin/candidates" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">База кандидатов</Link>
            <Link to="/admin/users" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">Пользователи</Link>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} title="Обновить данные"
              className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <RefreshCw size={14} />
            </button>
            {deletedAgencies.length > 0 && (
              <button onClick={() => setShowDeleted(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 text-xs rounded border transition-all ${showDeleted ? 'border-[#C9A84C]/50 text-[#C9A84C] bg-[#C9A84C]/10' : 'border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/40 hover:text-[#C9A84C]'}`}>
                <RotateCcw size={13} /> Удалённые ({deletedAgencies.length})
              </button>
            )}
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
              <Download size={14} /> Экспорт CSV
            </button>
            <button onClick={() => { setEditAgency(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all">
              <Plus size={14} /> Добавить агентство
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
            <input type="text" placeholder="Поиск по названию, городу, email..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={inp + ' w-full pl-9'} />
          </div>
          {!showDeleted && (
            <select value={filterCity} onChange={e => setFilterCity(e.target.value)} className={inp}>
              <option value="">Все города</option>
              {cities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
          {filterCity && (
            <button onClick={() => setFilterCity('')} className="px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">✕ Сбросить</button>
          )}
        </div>

        {/* Stats — только по активным */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Всего агентств', value: activeAgencies.length },
            { label: 'Активных', value: activeAgencies.filter(a => a.is_active !== false).length },
            { label: 'Всего кандидатов', value: activeCandidates.length },
            { label: 'Готовы к отправке', value: activeCandidates.filter(c => c.payment_basis === 'Готовится к отправке').length },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4">
              <div className="text-2xl font-black text-[#7B3FBF]">{s.value}</div>
              <div className="text-xs text-[#F8FAFC]/45 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {showDeleted && deletedAgencies.length > 0 && (
          <div className="mb-4 px-4 py-2 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/20 text-xs text-[#C9A84C]/80">
            Удалённые агентства восстановимы в течение 3 дней с момента удаления. Кандидаты сохранены.
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#7B3FBF]/30 border-t-[#7B3FBF] rounded-full animate-spin" /></div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(123,63,191,0.15)]">
                    {['Агентство', 'Город', 'Контакты', 'Кандидатов', 'Дата договора', 'Статус', 'Действия'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((agency) => {
                    const cands = getCandidatesForAgency(agency.id);
                    const isDeleted = !!agency.deleted_at;
                    const daysLeft = isDeleted
                      ? Math.ceil((THREE_DAYS - (now - new Date(agency.deleted_at).getTime())) / 86400000)
                      : null;
                    return (
                      <tr key={agency.id}
                        className={`border-b border-[rgba(255,255,255,0.04)] transition-colors ${isDeleted ? 'opacity-60' : 'hover:bg-[rgba(123,63,191,0.06)] cursor-pointer'}`}
                        onClick={() => !isDeleted && navigate(`/admin/candidates?agency=${agency.id}`)}>
                        <td className="px-4 py-3">
                          <div className="font-bold text-[#F8FAFC]">{agency.name}</div>
                          {isDeleted && <div className="text-xs text-[#C9A84C]/70 mt-0.5">Удалено · восстановить можно ещё {daysLeft} дн.</div>}
                          {!isDeleted && agency.comment && <div className="text-xs text-[#F8FAFC]/35 mt-0.5 truncate max-w-[160px]">{agency.comment}</div>}
                        </td>
                        <td className="px-4 py-3 text-[#F8FAFC]/60">{agency.city || '—'}</td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          {agency.email && <a href={`mailto:${agency.email}`} className="flex items-center gap-1.5 text-[#F8FAFC]/60 hover:text-[#C9A84C] text-xs mb-1"><Mail size={11}/>{agency.email}</a>}
                          {agency.phone && <a href={`tel:${agency.phone}`} className="flex items-center gap-1.5 text-[#F8FAFC]/60 hover:text-[#C9A84C] text-xs"><Phone size={11}/>{agency.phone}</a>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[#7B3FBF] font-bold">{cands.length}</span>
                          {agency.planned_candidates > 0 && <span className="text-[#F8FAFC]/30 text-xs"> / {agency.planned_candidates}</span>}
                        </td>
                        <td className="px-4 py-3 text-xs text-[#F8FAFC]/60">
                          {agency.contract_date
                            ? <div>
                                <div>{agency.contract_date.split('-').reverse().join('.')}</div>
                                {agency.contract_url && (
                                  <a href={agency.contract_url} target="_blank" rel="noreferrer"
                                    onClick={e => e.stopPropagation()}
                                    className="flex items-center gap-1 text-[#7B3FBF] hover:text-[#C9A84C] mt-0.5">
                                    <Download size={11}/> Скачать
                                  </a>
                                )}
                              </div>
                            : <span className="text-[#F8FAFC]/25">—</span>}
                        </td>
                        <td className="px-4 py-3">
                          {isDeleted
                            ? <span className="text-xs px-2 py-0.5 rounded font-medium bg-red-500/10 text-red-400/70 border border-red-500/20">Удалено</span>
                            : <span className={`text-xs px-2 py-0.5 rounded font-medium ${agency.is_active !== false ? 'bg-green-500/15 text-green-400 border border-green-500/25' : 'bg-red-500/10 text-red-400/70 border border-red-500/20'}`}>
                                {agency.is_active !== false ? 'Активно' : 'Откл.'}
                              </span>}
                        </td>
                        <td className="px-4 py-3" onClick={e => e.stopPropagation()}>
                          <div className="flex items-center gap-2">
                            {isDeleted ? (
                              <button onClick={() => handleRestore(agency)}
                                className="p-1.5 rounded hover:bg-green-500/20 text-[#F8FAFC]/50 hover:text-green-400 transition-all" title="Восстановить">
                                <RotateCcw size={14}/>
                              </button>
                            ) : (
                              <>
                                <button onClick={() => { setEditAgency(agency); setModalOpen(true); }}
                                  className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                                  <Edit2 size={14}/>
                                </button>
                                <button onClick={() => handleDelete(agency)}
                                  className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                                  <Trash2 size={14}/>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="text-center py-12 text-[#F8FAFC]/30">
                      {showDeleted ? 'Удалённых агентств нет' : 'Агентства не найдены'}
                    </td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <AgencyModal
          agency={editAgency}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditAgency(null); }}
        />
      )}
    </div>
  );
}