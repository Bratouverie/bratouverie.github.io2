import { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Download, Search, Filter, Upload, Eye, Trash2, Edit2, X, FileText, ChevronDown } from 'lucide-react';
import CandidateModal from '../../components/admin/CandidateModal';

const POSITIONS = ['Разнорабочий','Строитель','Водитель B','Водитель C','Водитель CE','Водитель D','Автослесарь','Инженер связи','Оператор БПЛА','Взрывотехник','Медицинский работник','Охранник'];
const SB_COLORS = { 'Не проверялся':'text-[#F8FAFC]/40', 'Согласован':'text-green-400', 'Не согласован':'text-red-400' };
const MED_COLORS = { 'Не проверялся':'text-[#F8FAFC]/40', 'Прошёл':'text-green-400', 'Не прошёл':'text-red-400' };

export default function Candidates() {
  const [candidates, setCandidates] = useState([]);
  const [agencies, setAgencies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);
  const [filters, setFilters] = useState({ agency: '', position: '', citizenship: '', sb_check: '', medical_check: '' });
  const [searchParams] = useSearchParams();

  const load = async () => {
    setLoading(true);
    const [cand, ag] = await Promise.all([
      base44.entities.Candidate.list('-created_date', 500),
      base44.entities.Agency.list('-created_date', 200),
    ]);
    setCandidates(cand);
    setAgencies(ag);
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

  const handleDelete = async (id) => {
    if (!confirm('Удалить кандидата?')) return;
    await base44.entities.Candidate.delete(id);
    load();
  };

  const exportCSV = () => {
    const headers = ['ФИО','Должность','Агентство','Гражданство','Город','Дата рождения','Состояние здоровья','Проверка СБ','Медкомиссия','Основание выплаты','Выплачено','Дата прибытия','Комментарий'];
    const rows = filtered.map(c => [
      c.full_name, c.position, c.agency_name, c.citizenship, c.city,
      c.birth_date, c.health_status, c.sb_check, c.medical_check,
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
    const matchPos = !filters.position || c.position === filters.position;
    const matchCit = !filters.citizenship || c.citizenship?.toLowerCase().includes(filters.citizenship.toLowerCase());
    const matchSB = !filters.sb_check || c.sb_check === filters.sb_check;
    const matchMed = !filters.medical_check || c.medical_check === filters.medical_check;
    return matchSearch && matchAgency && matchPos && matchCit && matchSB && matchMed;
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
          <div className="flex items-center gap-3">
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
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          {[
            { label: 'Всего кандидатов', value: candidates.length },
            { label: 'Согласованы СБ', value: candidates.filter(c => c.sb_check === 'Согласован').length },
            { label: 'Прошли медкомиссию', value: candidates.filter(c => c.medical_check === 'Прошёл').length },
            { label: 'Готовятся к отправке', value: candidates.filter(c => c.payment_basis === 'Готовится к отправке').length },
            { label: 'Выплачено (100 тыс.)', value: candidates.filter(c => c.payment_made === 'Да').length },
          ].map(s => (
            <div key={s.label} className="glass-card rounded-xl p-4">
              <div className="text-2xl font-black text-[#7B3FBF]">{s.value}</div>
              <div className="text-xs text-[#F8FAFC]/45 mt-1">{s.label}</div>
            </div>
          ))}
        </div>

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
            <button onClick={() => setFilters({ agency:'', position:'', citizenship:'', sb_check:'', medical_check:'' })}
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
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(123,63,191,0.15)]">
                    {['ФИО','Должность','Агентство','Гражданство','СБ','Медкомиссия','Выплата','Дата прибытия','Действия'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => (
                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.06)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#F8FAFC]">{c.full_name}</div>
                        {c.city && <div className="text-xs text-[#F8FAFC]/35">{c.city}</div>}
                      </td>
                      <td className="px-4 py-3 text-[#F8FAFC]/60 text-xs whitespace-nowrap">{c.position || '—'}</td>
                      <td className="px-4 py-3 text-[#F8FAFC]/55 text-xs">{c.agency_name || '—'}</td>
                      <td className="px-4 py-3 text-[#F8FAFC]/55 text-xs">{c.citizenship || '—'}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${SB_COLORS[c.sb_check] || 'text-[#F8FAFC]/40'}`}>{c.sb_check || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium ${MED_COLORS[c.medical_check] || 'text-[#F8FAFC]/40'}`}>{c.medical_check || '—'}</span>
                      </td>
                      <td className="px-4 py-3">
                        {c.payment_basis === 'Готовится к отправке' ? (
                          <div>
                            <div className="text-xs text-green-400 font-medium">100 000 ₽</div>
                            <div className={`text-xs ${c.payment_made === 'Да' ? 'text-green-400' : 'text-[#F8FAFC]/35'}`}>
                              {c.payment_made === 'Да' ? '✓ Выплачено' : 'Не выплачено'}
                            </div>
                          </div>
                        ) : c.payment_basis === 'Отказался от отправки' ? (
                          <span className="text-xs text-red-400/70">Не предусмотрена</span>
                        ) : (
                          <span className="text-xs text-[#F8FAFC]/25">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/45">{c.arrival_date || '—'}</td>
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
                    <tr><td colSpan={9} className="text-center py-12 text-[#F8FAFC]/30">Кандидаты не найдены</td></tr>
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