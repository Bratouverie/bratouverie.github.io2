import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Download, Search, Trash2, Edit2, X, MessageSquare, Shield, Stethoscope, Banknote, CheckCircle, MapPin, CalendarDays, RefreshCw } from 'lucide-react';
import CandidateModal from '../../components/admin/CandidateModal';

const POSITIONS = ['Разнорабочий','Строитель','Водитель B','Водитель C','Водитель CE','Водитель D','Автослесарь','Инженер связи','Оператор БПЛА','Взрывотехник','Медицинский работник','Охранник'];
const SB_COLORS  = { 'Не проверялся':'text-[#F8FAFC]/40', 'Согласован':'text-green-400', 'Не согласован':'text-red-400' };
const MED_COLORS = { 'Не проверялся':'text-[#F8FAFC]/40', 'Прошёл':'text-green-400', 'Не прошёл':'text-red-400' };
const PAY_COLORS = { 'Готовится к отправке':'text-green-400', 'Отказался от отправки':'text-red-400/70' };

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

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [agencies, setAgencies]     = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [filters, setFilters] = useState({ agency: '', position: '', sb_check: '', medical_check: '' });
  const [searchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    const [cand, ag] = await Promise.all([
      base44.entities.Candidate.list('-created_date', 500),
      base44.entities.Agency.list('-created_date', 200),
    ]);
    // Только активные агентства (без deleted_at)
    const activeAg = ag.filter(a => !a.deleted_at);
    const activeAgIds = new Set(activeAg.map(a => a.id));
    // Скрываем кандидатов удалённых агентств
    setCandidates(cand.filter(c => !c.agency_id || activeAgIds.has(c.agency_id)));
    setAgencies(activeAg);
    setLoading(false);
  };

  useEffect(() => {
    load();
    const agencyParam = searchParams.get('agency');
    if (agencyParam) setFilters(f => ({ ...f, agency: agencyParam }));
  }, []);

  const handleSave = async (data, id) => {
    if (id) await base44.entities.Candidate.update(id, data);
    else await base44.entities.Candidate.create(data);
    setModalOpen(false);
    setEditCandidate(null);
    load();
  };

  // При удалении — пересчитываем candidates_count у агентства
  const handleDelete = async (id) => {
    if (!confirm('Удалить кандидата?')) return;
    const cand = candidates.find(c => c.id === id);
    await base44.entities.Candidate.delete(id);
    if (cand?.agency_id) {
      const remaining = candidates.filter(c => c.id !== id && c.agency_id === cand.agency_id);
      await base44.entities.Agency.update(cand.agency_id, { candidates_count: remaining.length });
    }
    load();
  };

  const recalcAll = async () => {
    const all = await base44.entities.Candidate.list('-created_date', 1000);
    const agList = await base44.entities.Agency.list('-created_date', 200);
    for (const ag of agList) {
      const count = all.filter(c => c.agency_id === ag.id).length;
      await base44.entities.Agency.update(ag.id, { candidates_count: count });
    }
    load();
  };

  const exportCSV = () => {
    const headers = ['ФИО','Должность','Агентство','Город','Пункт сбора','Дата рождения','Проверка СБ','Медкомиссия','Основание выплаты','Выплачено','Дата прибытия','Комментарий'];
    const rows = filtered.map(c => [
      c.full_name, c.position, c.agency_name, c.city, c.assembly_point,
      c.birth_date, c.sb_check, c.medical_check,
      c.payment_basis, c.payment_made, c.arrival_date, c.comment
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'candidates.csv'; a.click();
  };

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q || c.full_name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q);
    const matchAgency = !filters.agency || c.agency_id === filters.agency;
    const matchPos    = !filters.position || c.position === filters.position;
    const matchSB     = !filters.sb_check || c.sb_check === filters.sb_check;
    const matchMed    = !filters.medical_check || c.medical_check === filters.medical_check;
    return matchSearch && matchAgency && matchPos && matchSB && matchMed;
  });

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const inp = "px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

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
            <Link to="/admin/agencies" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">База агентств</Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <h1 className="text-sm font-bold text-[#F8FAFC]">База кандидатов</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} title="Обновить данные"
              className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <RefreshCw size={14} />
            </button>
            <button onClick={exportCSV} className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
              <Download size={14} /> Экспорт CSV
            </button>
            <button onClick={() => { setEditCandidate(null); setModalOpen(true); }}
              className="flex items-center gap-2 px-4 py-2 text-xs rounded bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all">
              <Plus size={14} /> Добавить кандидата
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats */}
        {(() => {
          const readyCount = candidates.filter(c => c.payment_basis === 'Готовится к отправке').length;
          const paidCount  = candidates.filter(c => c.payment_made === 'Да').length;
          // СБ: только те, кто согласован, но НЕ готовится к отправке и НЕ выплачено
          const sbCount = candidates.filter(c =>
            c.sb_check === 'Согласован' &&
            c.payment_basis !== 'Готовится к отправке' &&
            c.payment_made !== 'Да'
          ).length;
          // Мед: только те, кто прошёл, но НЕ готовится к отправке и НЕ выплачено
          const medCount = candidates.filter(c =>
            c.medical_check === 'Прошёл' &&
            c.payment_basis !== 'Готовится к отправке' &&
            c.payment_made !== 'Да'
          ).length;
          const stats = [
            { label: 'Всего кандидатов', value: candidates.length },
            { label: 'Согласованы СБ', value: sbCount },
            { label: 'Прошли медкомиссию', value: medCount },
            { label: 'К отправке', value: readyCount },
            { label: 'Выплачено (чел.)', value: paidCount, sub: `${(paidCount * 100000).toLocaleString('ru-RU')} ₽` },
          ];
          return (
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              {stats.map(s => (
                <div key={s.label} className="glass-card rounded-xl p-4">
                  <div className="text-2xl font-black text-[#7B3FBF]">{s.value}</div>
                  <div className="text-xs text-[#F8FAFC]/45 mt-1">{s.label}</div>
                  {s.sub && <div className="text-xs text-[#C9A84C] font-bold mt-0.5">{s.sub}</div>}
                </div>
              ))}
            </div>
          );
        })()}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
            <input type="text" placeholder="Поиск по ФИО, должности, городу..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={inp + ' w-full pl-9'} />
          </div>
          <select value={filters.agency} onChange={e => setF('agency', e.target.value)} className={inp}>
            <option value="">Все агентства</option>
            {agencies.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
          </select>
          <select value={filters.position} onChange={e => setF('position', e.target.value)} className={inp}>
            <option value="">Все должности</option>
            {POSITIONS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <select value={filters.sb_check} onChange={e => setF('sb_check', e.target.value)} className={inp}>
            <option value="">Проверка СБ</option>
            {['Не проверялся','Согласован','Не согласован'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.medical_check} onChange={e => setF('medical_check', e.target.value)} className={inp}>
            <option value="">Медкомиссия</option>
            {['Не проверялся','Прошёл','Не прошёл'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({ agency:'', position:'', sb_check:'', medical_check:'' })}
              className="flex items-center gap-1 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              <X size={12} /> Сбросить
            </button>
          )}
        </div>

        <div className="text-xs text-[#F8FAFC]/30 mb-4">Показано: {filtered.length} из {candidates.length}</div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#7B3FBF]/30 border-t-[#7B3FBF] rounded-full animate-spin" /></div>
        ) : (
          <div className="glass-card rounded-xl overflow-visible">
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(123,63,191,0.15)]">
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">ФИО / Агентство</th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">Должность</th>
                    <th className="px-4 py-3">
                      <Tooltip text="Город проживания / Пункт сбора">
                        <MapPin size={13} className="text-[#F8FAFC]/35" />
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3">
                      <Tooltip text="Проверка СБ">
                        <Shield size={13} className="text-[#F8FAFC]/35" />
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3">
                      <Tooltip text="Медкомиссия">
                        <Stethoscope size={13} className="text-[#F8FAFC]/35" />
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3">
                      <Tooltip text="Дата прибытия">
                        <CalendarDays size={13} className="text-[#F8FAFC]/35" />
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3">
                      <Tooltip text="Основание для выплаты">
                        <Banknote size={13} className="text-[#F8FAFC]/35" />
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3">
                      <Tooltip text="Выплачено">
                        <CheckCircle size={13} className="text-[#F8FAFC]/35" />
                      </Tooltip>
                    </th>
                    <th className="px-4 py-3">
                      <Tooltip text="Комментарий">
                        <MessageSquare size={13} className="text-[#F8FAFC]/35" />
                      </Tooltip>
                    </th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.06)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#F8FAFC]">{c.full_name}</div>
                        <div className="text-xs text-[#F8FAFC]/35">{c.agency_name || '—'}</div>
                      </td>
                      <td className="px-4 py-3 text-[#F8FAFC]/60 text-xs whitespace-nowrap">{c.position || '—'}</td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/55">
                        {c.city && <div>{c.city}</div>}
                        {c.assembly_point && <div className="text-[#F8FAFC]/30">{c.assembly_point}</div>}
                        {!c.city && !c.assembly_point && '—'}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${SB_COLORS[c.sb_check] || 'text-[#F8FAFC]/40'}`}>
                          {c.sb_check === 'Согласован' ? '✓' : c.sb_check === 'Не согласован' ? '✗' : '—'}
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
                        <span className={`text-xs ${PAY_COLORS[c.payment_basis] || 'text-[#F8FAFC]/25'}`}>
                          {c.payment_basis || '—'}
                        </span>
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
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditCandidate(c); setModalOpen(true); }}
                            className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                            <Edit2 size={14}/>
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={10} className="text-center py-12 text-[#F8FAFC]/30">Кандидаты не найдены</td></tr>
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
          agencies={agencies}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditCandidate(null); }}
        />
      )}
    </div>
  );
}