import { useState, useEffect, useCallback, useMemo } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Download, Search, Trash2, Edit2, X, MessageSquare, Shield, Stethoscope, Banknote, CheckCircle, MapPin, CalendarDays, RefreshCw, Archive, ArchiveRestore, ClipboardList, FileText, Send } from 'lucide-react';
import CandidateModal from '../../components/admin/CandidateModal';
import CandidateFormModal from '../../components/admin/CandidateFormModal';
import InlineCommentCell from '@/components/admin/InlineCommentCell';

const POSITIONS = ['Разнорабочий','Строитель','Водитель B','Водитель C','Водитель CE','Водитель D','Автослесарь','Инженер связи','Оператор БПЛА','Взрывотехник','Медицинский работник','Охранник'];
const SB_COLORS  = { 'Не проверялся':'text-[#F8FAFC]/40', 'На проверке':'text-yellow-400', 'Согласован':'text-green-400', 'Не согласован':'text-red-400' };
const MED_COLORS = { 'Не проверялся':'text-[#F8FAFC]/40', 'Прошёл':'text-green-400', 'Не прошёл':'text-red-400' };
const PAY_COLORS = { 'Готовится к отправке':'text-green-400', 'Отказался от отправки':'text-red-400/70' };

const isArchivable = (c) =>
  c.payment_made === 'Да' || c.payment_basis === 'Отказался от отправки';

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
  const [showArchive, setShowArchive] = useState(false);
  const [cityCache, setCityCache] = useState({});
  const [formModalCandidate, setFormModalCandidate] = useState(null);
  const [searchParams] = useSearchParams();

  const load = useCallback(async () => {
    setLoading(true);
    const [cand, ag] = await Promise.all([
      base44.entities.Candidate.list('-created_date', 500),
      base44.entities.Agency.list('-created_date', 200),
    ]);
    const cities = await base44.entities.City.list('-created_date', 500);
    const cityMap = {};
    cities.forEach(c => { if (c.name) cityMap[c.name.toLowerCase()] = c; });
    const activeAg = ag.filter(a => !a.deleted_at);
    const activeAgIds = new Set(activeAg.map(a => a.id));
    const filtered = cand
      .filter(c => !c.deleted_at)
      .filter(c => !c.agency_id || activeAgIds.has(c.agency_id));
    setCandidates(filtered);
    setAgencies(activeAg);
    setCityCache(cityMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const agencyParam = searchParams.get('agency');
    if (agencyParam) setFilters(f => ({ ...f, agency: agencyParam }));
  }, []);

  const handleSave = async (data, id) => {
    try {
      if (id) {
        await base44.entities.Candidate.update(id, data);
        setCandidates(prev => prev.map(x => x.id === id ? { ...x, ...data } : x));
      } else {
        const formToken = crypto.randomUUID();
        const newCandidate = await base44.entities.Candidate.create({ ...data, form_token: formToken, form_status: 'not_sent' });
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

  const handleSendFormLink = async (c) => {
    if (!c.form_token) { alert('У кандидата нет токена анкеты'); return; }
    if (!c.email && !c.phone) { alert('У кандидата нет email для отправки ссылки'); return; }
    const url = `${window.location.origin}/form/${c.form_token}`;
    try {
      if (c.email) {
        await base44.integrations.Core.SendEmail({
          to: c.email,
          subject: 'Ссылка на заполнение анкеты',
          body: `Здравствуйте, ${c.full_name}!\n\nПросим вас заполнить анкету по ссылке:\n${url}\n\nООО «Братоуверие-СНБ»`,
          from_name: 'Bratouveriye SNB',
        });
      }
      await base44.entities.Candidate.update(c.id, { form_status: 'pending' });
      setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, form_status: 'pending' } : x));
      alert(c.email ? `Ссылка отправлена на ${c.email}` : `Ссылка: ${url}`);
    } catch (err) {
      alert('Ошибка отправки: ' + err.message);
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
    const src = showArchive ? filteredArchived : filteredActive;
    const headers = ['ФИО','Телефон','Должность','Агентство','Город','Пункт сбора','Дата рождения','Проверка СБ','Медкомиссия','Основание выплаты','Выплачено','Дата прибытия','Дата добавления','Комментарий'];
    const rows = src.map(c => [
      c.full_name, c.phone, c.position, c.agency_name, c.city, c.assembly_point,
      c.birth_date, c.sb_check, c.medical_check,
      c.payment_basis, c.payment_made, c.arrival_date,
      c.created_date ? new Date(c.created_date).toLocaleString('ru-RU') : '',
      c.comment
    ]);
    const csv = [headers, ...rows].map(r => r.map(v => `"${v || ''}"`).join(',')).join('\n');
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = showArchive ? 'candidates_archive.csv' : 'candidates.csv'; a.click();
  };

  const active   = useMemo(() => candidates.filter(c => !c.is_archived), [candidates]);
  const archived = useMemo(() => candidates.filter(c => c.is_archived), [candidates]);

  const applyFilters = useCallback((list) => {
    const q = search.toLowerCase();
    return list.filter(c => {
      const matchSearch = !q || c.full_name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.phone?.includes(q);
      const matchAgency = !filters.agency || c.agency_id === filters.agency;
      const matchPos    = !filters.position || c.position === filters.position;
      const matchSB     = !filters.sb_check || c.sb_check === filters.sb_check;
      const matchMed    = !filters.medical_check || c.medical_check === filters.medical_check;
      return matchSearch && matchAgency && matchPos && matchSB && matchMed;
    });
  }, [search, filters]);

  const filteredActive   = useMemo(() => applyFilters(active), [applyFilters, active]);
  const filteredArchived = useMemo(() => applyFilters(archived), [applyFilters, archived]);
  const displayed = showArchive ? filteredArchived : filteredActive;

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const inp = "px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

  const stats = useMemo(() => {
    let readyCount = 0, paidCount = 0, sbCount = 0, medCount = 0;
    for (const c of active) {
      if (c.payment_basis === 'Готовится к отправке') readyCount++;
      if (c.payment_made === 'Да') paidCount++;
      if (c.sb_check === 'Согласован' && c.medical_check !== 'Прошёл' && c.payment_basis !== 'Готовится к отправке' && c.payment_made !== 'Да') sbCount++;
      if (c.medical_check === 'Прошёл' && c.payment_basis !== 'Готовится к отправке' && c.payment_made !== 'Да') medCount++;
    }
    return { readyCount, paidCount, sbCount, medCount };
  }, [active]);

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
            <Link to="/admin/assembly-points"
              className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
              <MapPin size={13}/> Точки сбора
            </Link>
            <Link to="/admin/candidate-logs"
              className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(123,63,191,0.25)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <ClipboardList size={13}/> Журнал
            </Link>
            <Link to="/admin/trash"
              className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/40 hover:text-red-400 hover:border-red-500/30 transition-all">
              <Trash2 size={13}/> Корзина
            </Link>
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
              <Download size={14} /> Экспорт CSV
            </button>
            {!showArchive && (
              <button onClick={() => { setEditCandidate(null); setModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2 text-xs rounded bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all">
                <Plus size={14} /> Добавить кандидата
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Stats */}
        {!showArchive && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Всего активных', value: active.length },
              { label: 'Согласованы СБ', value: stats.sbCount },
              { label: 'Прошли медкомиссию', value: stats.medCount },
              { label: 'К отправке', value: stats.readyCount },
              { label: 'Выплачено (чел.)', value: stats.paidCount, sub: `${(stats.paidCount * 100000).toLocaleString('ru-RU')} ₽` },
            ].map(s => (
              <div key={s.label} className="glass-card rounded-xl p-4">
                <div className="text-2xl font-black text-[#7B3FBF]">{s.value}</div>
                <div className="text-xs text-[#F8FAFC]/45 mt-1">{s.label}</div>
                {s.sub && <div className="text-xs text-[#C9A84C] font-bold mt-0.5">{s.sub}</div>}
              </div>
            ))}
          </div>
        )}

        {showArchive && (
          <div className="mb-4 px-4 py-2.5 rounded-xl bg-[#C9A84C]/8 border border-[#C9A84C]/20 text-xs text-[#C9A84C]/80 flex items-center gap-2">
            <Archive size={13} /> Архив: кандидаты с закрытыми контрактами или отказавшиеся от участия. Можно восстановить в основную таблицу.
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
            <input type="text" placeholder="Поиск по ФИО, должности, городу, телефону..."
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
            {['Не проверялся','На проверке','Согласован','Не согласован'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.medical_check} onChange={e => setF('medical_check', e.target.value)} className={inp}>
            <option value="">Медкомиссия</option>
            {['Не проверялся','Прошёл','Не прошёл'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({ agency:'', position:'', sb_check:'', medical_check: '' })}
              className="flex items-center gap-1 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              <X size={12} /> Сбросить
            </button>
          )}
        </div>

        <div className="text-xs text-[#F8FAFC]/30 mb-4">
          {showArchive ? `Архив: ${filteredArchived.length} из ${archived.length}` : `Показано: ${filteredActive.length} из ${active.length}`}
        </div>

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
                    <th className="px-4 py-3"><Tooltip text="Город / Пункт сбора"><MapPin size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Проверка СБ"><Shield size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Медкомиссия"><Stethoscope size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Дата прибытия"><CalendarDays size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Основание для выплаты"><Banknote size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Выплачено"><CheckCircle size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="px-4 py-3"><Tooltip text="Статус анкеты"><FileText size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">Добавлен</th>
                    <th className="px-4 py-3"><Tooltip text="Комментарий"><MessageSquare size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((c) => (
                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.06)] transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-bold text-[#F8FAFC]">{c.full_name}</div>
                          <div className="text-xs text-[#F8FAFC]/35">{c.agency_name || '—'}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-[#F8FAFC]/60 text-xs whitespace-nowrap">{c.position || '—'}</td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/55">
                        {c.city ? (
                          <div className="group/city relative inline-block">
                            <span className="cursor-help underline decoration-dotted underline-offset-2 hover:text-[#7B3FBF] transition-colors">{c.city}</span>
                            <div className="absolute bottom-full left-0 mb-2 hidden group-hover/city:block w-72 bg-[#0D1B3E] border border-[rgba(123,63,191,0.3)] rounded-lg p-3 text-xs text-[#F8FAFC] shadow-xl z-50">
                              <div className="font-bold text-[#F8FAFC]">{c.city}</div>
                              {cityCache[c.city.toLowerCase()]?.region && <div className="text-[#F8FAFC]/60 mt-1">Регион: {cityCache[c.city.toLowerCase()].region}</div>}
                              {c.assembly_point && (
                                <div className="pt-2 mt-2 border-t border-[rgba(123,63,191,0.15)]">
                                  <div className="text-[#F8FAFC]/50">Пункт сбора:</div>
                                  <div className="text-[#7B3FBF] font-bold">{c.assembly_point}</div>
                                  {c.assembly_distance && <div className="text-[#C9A84C] mt-1">Расстояние: {c.assembly_distance} км</div>}
                                </div>
                              )}
                            </div>
                          </div>
                        ) : '—'}
                        {c.assembly_point && <div className="text-[#F8FAFC]/30 mt-0.5">{c.assembly_point}</div>}
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
                        <span className={`text-xs font-medium ${c.form_status === 'completed' ? 'text-green-400' : c.form_status === 'pending' ? 'text-yellow-400' : 'text-[#F8FAFC]/30'}`}>
                          {c.form_status === 'completed' ? '✓ Заполнена' : c.form_status === 'pending' ? '⏳ Отправлена' : '—'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/40 whitespace-nowrap">
                        {c.created_date
                          ? new Date(c.created_date).toLocaleDateString('ru-RU') + ' ' + new Date(c.created_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                          : '—'}
                      </td>
                      <td className="px-4 py-3">
                        <InlineCommentCell candidate={c} onUpdate={(id, data) => setCandidates(prev => prev.map(x => x.id === id ? { ...x, ...data } : x))} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {showArchive ? (
                            <button onClick={() => handleUnarchive(c)} title="Вернуть из архива"
                              className="p-1.5 rounded hover:bg-green-500/20 text-[#F8FAFC]/50 hover:text-green-400 transition-all">
                              <ArchiveRestore size={14}/>
                            </button>
                          ) : (
                            <>
                              <button onClick={() => { setEditCandidate(c); setModalOpen(true); }}
                                className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                                <Edit2 size={14}/>
                              </button>
                              <button onClick={() => setFormModalCandidate(c)} title="Анкета"
                                className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                                <FileText size={14}/>
                              </button>
                              <button onClick={() => handleSendFormLink(c)} title="Отправить ссылку на анкету"
                                className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                                <Send size={14}/>
                              </button>
                              {isArchivable(c) && (
                                <button onClick={() => handleArchive(c)} title="Переместить в архив"
                                  className="p-1.5 rounded hover:bg-[#C9A84C]/20 text-[#F8FAFC]/50 hover:text-[#C9A84C] transition-all">
                                  <Archive size={14}/>
                                </button>
                              )}
                            </>
                          )}
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                            <Trash2 size={14}/>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {displayed.length === 0 && (
                    <tr><td colSpan={12} className="text-center py-12 text-[#F8FAFC]/30">
                      {showArchive ? 'Архив пуст' : 'Кандидаты не найдены'}
                    </td></tr>
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

      {formModalCandidate && (
        <CandidateFormModal
          candidate={formModalCandidate}
          onClose={() => setFormModalCandidate(null)}
        />
      )}
    </div>
  );
}