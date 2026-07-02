import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, LogOut, Building2, Users, Search, MessageSquare, Shield, Stethoscope, Banknote, CheckCircle, MapPin, CalendarDays, RefreshCw, X, Download, Archive, ArchiveRestore, BookOpen, AlertTriangle } from 'lucide-react';
import CandidateModal from '../components/admin/CandidateModal';
import AgencyNotificationBell from '../components/admin/AgencyNotificationBell';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { notifyStatusChange } from '@/lib/notifyStatusChange';

const POSITIONS = ['Разнорабочий','Строитель','Водитель B','Водитель C','Водитель CE','Водитель D','Автослесарь','Инженер связи','Оператор БПЛА','Взрывотехник','Медицинский работник','Охранник'];
const SB_COLORS  = { 'Не проверялся': 'text-[#F8FAFC]/40', 'На проверке': 'text-yellow-400', 'Согласован': 'text-green-400', 'Не согласован': 'text-red-400' };
const MED_COLORS = { 'Не проверялся': 'text-[#F8FAFC]/40', 'Прошёл': 'text-green-400', 'Не прошёл': 'text-red-400' };
const PAY_COLORS = { 'Готовится к отправке': 'text-green-400', 'Отказался от отправки': 'text-red-400/70' };

function Tooltip({ text, children }) {
  return (
    <div className="relative group/tip inline-flex items-center">
      {children}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 px-2 py-1 rounded bg-[#0D1B3E] border border-[rgba(123,63,191,0.3)] text-xs text-[#F8FAFC]/80 whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-50 shadow-lg">
        {text}
      </div>
    </div>
  );
}

export default function AgencyWorkspace() {
  const navigate = useNavigate();

  const session = (() => {
    try { return JSON.parse(sessionStorage.getItem('agency_session')); } catch { return null; }
  })();

  const [agency, setAgency]       = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [filters, setFilters] = useState({ position: '', sb_check: '', medical_check: '' });
  const [modalOpen, setModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [showArchive, setShowArchive] = useState(false);
  const [cityCache, setCityCache] = useState({});

  useEffect(() => {
    if (!session?.id) { navigate('/agency-login', { replace: true }); return; }
    load();
  }, []);

  const load = async () => {
    if (!session?.id) return;
    setLoading(true);
    const [agencyList, cands] = await Promise.all([
      base44.entities.Agency.filter({ id: session.id }),
      base44.entities.Candidate.filter({ agency_id: session.id }, '-created_date', 500),
    ]);
    const cities = await base44.entities.City.list('-created_date', 500);
    const cityMap = {};
    cities.forEach(c => { if (c.name) cityMap[c.name.toLowerCase()] = c; });
    const activeCands = cands.filter(c => !c.deleted_at);
    setAgency(agencyList[0] || null);
    setCandidates(activeCands);
    setCityCache(cityMap);
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('agency_session');
    navigate('/agency-login', { replace: true });
  };

  const handleSave = async (data, id) => {
    const dataWithAgency = { ...data, agency_id: session.id, agency_name: session.name };
    try {
      if (id) {
        const old = candidates.find(c => c.id === id);
        await base44.entities.Candidate.update(id, dataWithAgency);
        await notifyStatusChange({ ...dataWithAgency, id }, old);
        setCandidates(prev => prev.map(x => x.id === id ? { ...x, ...dataWithAgency } : x));
      } else {
        const newCandidate = await base44.entities.Candidate.create(dataWithAgency);
        setCandidates(prev => [newCandidate, ...prev]);
      }
      setModalOpen(false);
      setEditCandidate(null);
    } catch (err) {
      console.error('❌ Ошибка сохранения:', err);
      const msg = err?.response?.data?.message || err?.message || 'Неизвестная ошибка';
      alert(`Ошибка: ${msg}`);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Удалить кандидата? Запись будет перемещена в корзину.')) return;
    try {
      const ts = new Date().toISOString();
      await base44.entities.Candidate.update(id, { deleted_at: ts });
      setCandidates(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Ошибка удаления: ' + err.message);
    }
  };

  const handleArchive = async (c) => {
    await base44.entities.Candidate.update(c.id, { is_archived: true });
    setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, is_archived: true } : x));
  };

  const handleUnarchive = async (c) => {
    await base44.entities.Candidate.update(c.id, { is_archived: false });
    setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, is_archived: false } : x));
  };

  const exportCSV = () => {
    const src = displayed;
    const headers = ['ФИО','Телефон','Должность','Город','Дата рождения','Проверка СБ','Медкомиссия','Дата прибытия','Комментарий'];
    const rows = src.map(c => [c.full_name, c.phone, c.position, c.city, c.birth_date, c.sb_check, c.medical_check, c.arrival_date, c.comment]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'candidates.csv'; a.click();
  };

  const isArchivable = (c) => c.payment_made === 'Да' || c.payment_basis === 'Отказался от отправки';

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const hasFilters = Object.values(filters).some(Boolean) || search;

  const active = candidates.filter(c => !c.is_archived);
  const archived = candidates.filter(c => c.is_archived);

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(c => {
      const matchSearch = !q || c.full_name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q);
      const matchPos = !filters.position || c.position === filters.position;
      const matchSB  = !filters.sb_check || c.sb_check === filters.sb_check;
      const matchMed = !filters.medical_check || c.medical_check === filters.medical_check;
      return matchSearch && matchPos && matchSB && matchMed;
    });
  };

  const filtered = applyFilters(active);
  const filteredArchived = applyFilters(archived);
  const displayed = showArchive ? filteredArchived : filtered;

  const inp = "px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

  if (!session?.id) return null;

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC]">
      {/* Header */}
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png" className="w-7 h-7 object-contain" alt="logo" />
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <div className="flex items-center gap-2">
              <Building2 size={15} className="text-[#7B3FBF]" />
              <span className="text-sm font-bold text-[#F8FAFC]">{session.name}</span>
            </div>
            <span className="text-xs px-2.5 py-1 rounded bg-[#7B3FBF]/15 text-[#7B3FBF] border border-[#7B3FBF]/25">Рабочая область</span>
            <a href="/handbook" target="_blank" rel="noreferrer"
              className="flex items-center gap-1.5 text-xs text-[#F8FAFC]/40 hover:text-[#C9A84C] transition-colors border-l border-[rgba(255,255,255,0.08)] pl-3 ml-1">
              <BookOpen size={13} /> Руководство
            </a>
          </div>
          <div className="flex items-center gap-2">
            <AgencyNotificationBell agencyId={session?.id} />
            <button onClick={load} title="Обновить данные"
              className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <RefreshCw size={14} />
            </button>
            {archived.length > 0 && (
              <button onClick={() => setShowArchive(v => !v)}
                className={`flex items-center gap-2 px-4 py-2 text-xs rounded border transition-all ${showArchive ? 'border-[#C9A84C]/50 text-[#C9A84C] bg-[#C9A84C]/10' : 'border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/40 hover:text-[#C9A84C]'}`}>
                <Archive size={13} /> Архив ({archived.length})
              </button>
            )}
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
              <Download size={14} /> CSV
            </button>
            <button onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg border border-[rgba(255,255,255,0.12)] text-[#F8FAFC]/50 hover:text-red-400 hover:border-red-500/30 transition-all">
              <LogOut size={13} /> Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Agency info card */}
        {agency && (
          <div className="glass-card-gold rounded-xl px-5 py-3 mb-4">
            <div className="flex items-center justify-between gap-4 mb-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h2 className="text-base font-black text-[#F8FAFC]">{agency.name}</h2>
                {agency.city && <span className="text-xs text-[#F8FAFC]/40">📍 {agency.city}</span>}
                {agency.email && <span className="text-xs text-[#F8FAFC]/40">✉ {agency.email}</span>}
                {agency.phone && <span className="text-xs text-[#F8FAFC]/40">📞 {agency.phone}</span>}
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-xl font-black text-[#7B3FBF]">{candidates.length}</span>
                {agency.planned_candidates > 0 && <span className="text-xs text-[#F8FAFC]/30">/ {agency.planned_candidates}</span>}
                <span className="text-xs text-[#F8FAFC]/35 ml-1">канд.</span>
              </div>
            </div>
            {candidates.length > 0 && (() => {
              const byPos   = {};
              candidates.forEach(c => { if (c.position) byPos[c.position] = (byPos[c.position] || 0) + 1; });
              const sbOk    = candidates.filter(c => c.sb_check === 'Согласован').length;
              const medOk   = candidates.filter(c => c.medical_check === 'Прошёл').length;
              const both    = candidates.filter(c => c.sb_check === 'Согласован' && c.medical_check === 'Прошёл').length;
              const ready   = candidates.filter(c => c.payment_basis === 'Готовится к отправке').length;
              const refused = candidates.filter(c => c.payment_basis === 'Отказался от отправки').length;
              return (
                <div className="border-t border-[rgba(201,168,76,0.12)] pt-2 flex flex-wrap gap-x-4 gap-y-1.5">
                  {Object.entries(byPos).map(([pos, cnt]) => (
                    <span key={pos} className="text-xs text-[#F8FAFC]/55">{pos}: <span className="text-[#7B3FBF] font-bold">{cnt}</span></span>
                  ))}
                  <span className="text-[rgba(123,63,191,0.25)] text-xs">|</span>
                  <span className="text-xs text-[#F8FAFC]/50">СБ ✓: <span className="text-green-400 font-bold">{sbOk}</span></span>
                  <span className="text-xs text-[#F8FAFC]/50">Мед ✓: <span className="text-green-400 font-bold">{medOk}</span></span>
                  <span className="text-xs text-[#F8FAFC]/50">СБ+Мед: <span className="text-[#C9A84C] font-bold">{both}</span></span>
                  <span className="text-[rgba(123,63,191,0.25)] text-xs">|</span>
                  {ready > 0 && <span className="text-xs text-green-400/80">К отправке: <span className="font-bold">{ready}</span></span>}
                  {refused > 0 && <span className="text-xs text-red-400/70">Отказ: <span className="font-bold">{refused}</span></span>}
                </div>
              );
            })()}
          </div>
        )}

        {/* Actions bar + filters */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
            <input type="text" placeholder="Поиск по ФИО, должности, городу..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={inp + ' w-full pl-9'} />
          </div>
          <select value={filters.position} onChange={e => setF('position', e.target.value)} className={inp}>
            <option value="">Все должности</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.sb_check} onChange={e => setF('sb_check', e.target.value)} className={inp}>
            <option value="">Проверка СБ</option>
            {['Не проверялся','На проверке','Согласован','Не согласован'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.medical_check} onChange={e => setF('medical_check', e.target.value)} className={inp}>
            <option value="">Медкомиссия</option>
            {['Не проверялся','Прошёл','Не прошёл'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {hasFilters && (
            <button onClick={() => { setFilters({ position: '', sb_check: '', medical_check: '' }); setSearch(''); }}
              className="flex items-center gap-1 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              <X size={12} /> Сбросить
            </button>
          )}
          {!showArchive && (
            <button
              onClick={() => { setEditCandidate(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all font-bold ml-auto">
              <Plus size={15} /> Добавить кандидата
            </button>
          )}
        </div>

        <div className="text-xs text-[#F8FAFC]/30 mb-4">
          {showArchive ? `Архив: ${filteredArchived.length} из ${archived.length}` : `Кандидатов: ${filtered.length} из ${active.length}`}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#7B3FBF]/30 border-t-[#7B3FBF] rounded-full animate-spin" />
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(123,63,191,0.15)]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">ФИО</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">Должность</th>
                    <th className="px-4 py-3"><Tooltip text="Город / Пункт сбора"><MapPin size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Проверка СБ"><Shield size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Медкомиссия"><Stethoscope size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Дата прибытия"><CalendarDays size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Основание для выплаты"><Banknote size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Выплачено"><CheckCircle size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Комментарий"><MessageSquare size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map(c => (
                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.06)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#F8FAFC]">{c.full_name}</div>
                      </td>
                      <td className="px-4 py-3 text-[#F8FAFC]/60 text-xs whitespace-nowrap">{c.position || '—'}</td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/55">
                        {c.city ? (
                          <HoverCard>
                            <HoverCardTrigger asChild>
                              <span className="cursor-help underline decoration-dotted underline-offset-2 hover:text-[#7B3FBF] transition-colors">{c.city}</span>
                            </HoverCardTrigger>
                            <HoverCardContent className="w-72 bg-[#0D1B3E] border-[rgba(123,63,191,0.3)] text-[#F8FAFC]">
                              <div className="space-y-2 text-xs">
                                <div className="font-bold text-[#F8FAFC]">{c.city}</div>
                                {cityCache[c.city.toLowerCase()]?.region && <div className="text-[#F8FAFC]/60">Регион: {cityCache[c.city.toLowerCase()].region}</div>}
                                {c.assembly_point && (
                                  <div className="pt-2 border-t border-[rgba(123,63,191,0.15)]">
                                    <div className="text-[#F8FAFC]/50">Пункт сбора:</div>
                                    <div className="text-[#7B3FBF] font-bold">{c.assembly_point}</div>
                                  </div>
                                )}
                              </div>
                            </HoverCardContent>
                          </HoverCard>
                        ) : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${SB_COLORS[c.sb_check] || 'text-[#F8FAFC]/40'}`}>
                          {c.sb_check === 'Согласован' ? '✓' : c.sb_check === 'Не согласован' ? '✗' : c.sb_check === 'На проверке' ? '⏳' : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${MED_COLORS[c.medical_check] || 'text-[#F8FAFC]/40'}`}>
                          {c.medical_check === 'Прошёл' ? '✓' : c.medical_check === 'Не прошёл' ? '✗' : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/45 whitespace-nowrap">
                        {c.arrival_date ? c.arrival_date.split('-').reverse().join('.') : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs ${PAY_COLORS[c.payment_basis] || 'text-[#F8FAFC]/25'}`}>{c.payment_basis || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${c.payment_made === 'Да' ? 'text-green-400' : 'text-[#F8FAFC]/30'}`}>
                          {c.payment_made === 'Да' ? '✓ Да' : 'Нет'}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {c.comment ? (
                          <Tooltip text={c.comment}>
                            <MessageSquare size={14} className="text-[#7B3FBF] cursor-help" />
                          </Tooltip>
                        ) : <span className="text-[#F8FAFC]/20">—</span>}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {showArchive ? (
                            <button onClick={() => handleUnarchive(c)} title="Вернуть из архива"
                              className="p-1.5 rounded hover:bg-green-500/20 text-[#F8FAFC]/50 hover:text-green-400 transition-all">
                              <ArchiveRestore size={14} />
                            </button>
                          ) : (
                            <>
                              <button onClick={() => { setEditCandidate(c); setModalOpen(true); }}
                                className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                                <Edit2 size={14} />
                              </button>
                              {isArchivable(c) && (
                                <button onClick={() => handleArchive(c)} title="В архив"
                                  className="p-1.5 rounded hover:bg-[#C9A84C]/20 text-[#F8FAFC]/50 hover:text-[#C9A84C] transition-all">
                                  <Archive size={14} />
                                </button>
                              )}
                            </>
                          )}
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayed.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-16 text-[#F8FAFC]/30">
                        <div className="flex flex-col items-center gap-3">
                          <Users size={32} className="text-[#F8FAFC]/15" />
                          <p>{showArchive ? 'Архив пуст' : candidates.length > 0 ? 'Нет кандидатов по фильтрам' : 'Кандидатов пока нет. Добавьте первого!'}</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <CandidateModal
          candidate={editCandidate}
          agencies={agency ? [agency] : []}
          lockedAgencyId={session.id}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditCandidate(null); }}
        />
      )}
    </div>
  );
}