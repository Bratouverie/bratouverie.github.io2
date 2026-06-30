import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useSearchParams } from 'react-router-dom';
import { Plus, Download, Search, Trash2, Edit2, X, MessageSquare, Shield, Stethoscope, Banknote, CheckCircle, MapPin, CalendarDays, RefreshCw, Archive, ArchiveRestore, AlertTriangle, ClipboardList, ClipboardCopy, Link2, Sparkles } from 'lucide-react';
import CandidateModal from '../../components/admin/CandidateModal';
import InlineCommentCell from '@/components/admin/InlineCommentCell';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { findDuplicateIds } from '@/lib/candidateDuplicates';
import { hasMissingRequiredDocs, getMissingRequiredDocs } from '@/lib/docUtils';
import { logCandidateAction } from '@/lib/candidateLogger';
import { notifyStatusChange } from '@/lib/notifyStatusChange';

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
  const [filters, setFilters] = useState({ agency: '', position: '', sb_check: '', medical_check: '', form_status: '', incomplete_docs: false });
  const [showArchive, setShowArchive] = useState(false);
  const [duplicateIds, setDuplicateIds] = useState(new Set());
  const [currentUser, setCurrentUser] = useState(null);
  const [copiedId, setCopiedId] = useState(null);
  const [cityCache, setCityCache] = useState({});
  const [searchParams] = useSearchParams();

  const load = useCallback(async () => {
    setLoading(true);
    const [cand, ag] = await Promise.all([
      base44.entities.Candidate.list('-created_date', 500),
      base44.entities.Agency.list('-created_date', 200),
    ]);
    // Параллельно загружаем пункты сбора, справочник городов и анкеты
    const [cities, forms] = await Promise.all([
      base44.entities.City.list('-created_date', 500),
      base44.entities.CandidateForm.filter({ status: 'completed' }, '-created_date', 500),
    ]);
    // Мёрджим документы из завершённых анкет в карточки кандидатов
    const formDocsByCandidate = {};
    forms.forEach(f => {
      if (f.candidate_id && f.uploaded_docs?.length) {
        formDocsByCandidate[f.candidate_id] = f.uploaded_docs;
      }
    });
    const cityMap = {};
    cities.forEach(c => { if (c.name) cityMap[c.name.toLowerCase()] = c; });
    const activeAg = ag.filter(a => !a.deleted_at);
    const activeAgIds = new Set(activeAg.map(a => a.id));
    const filtered = cand
      .filter(c => !c.agency_id || activeAgIds.has(c.agency_id))
      .map(c => {
        const formDocs = formDocsByCandidate[c.id];
        if (formDocs?.length) {
          const existingUrls = new Set((c.documents || []).map(d => d.url).filter(Boolean));
          const newDocs = formDocs.filter(fd => !existingUrls.has(fd.url));
          return { ...c, documents: [...(c.documents || []), ...newDocs] };
        }
        return c;
      });
    setCandidates(filtered);
    setDuplicateIds(findDuplicateIds(filtered));
    setAgencies(activeAg);
    setCityCache(cityMap);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    // Загружаем текущего пользователя для логов
    base44.auth.me().then(u => setCurrentUser(u)).catch(() => {});
    const agencyParam = searchParams.get('agency');
    if (agencyParam) setFilters(f => ({ ...f, agency: agencyParam }));

    // Периодическая проверка дублей каждые 2 минуты
    const interval = setInterval(async () => {
      const cand = await base44.entities.Candidate.list('-created_date', 500);
      setDuplicateIds(findDuplicateIds(cand));
      setCandidates(prev => {
        // Обновляем только если появились/исчезли записи
        if (prev.length !== cand.length) return cand;
        return prev;
      });
    }, 120000);
    return () => clearInterval(interval);
  }, []);

  const getActor = () => ({
    name: currentUser?.full_name || currentUser?.email || 'Администратор',
    role: 'admin',
  });

  const handleSave = async (data, id) => {
    if (id) {
      const old = candidates.find(c => c.id === id);
      await base44.entities.Candidate.update(id, data);
      await logCandidateAction({ action: 'update', candidate: { ...data, id }, oldData: old, actor: getActor() });
      await notifyStatusChange({ ...data, id }, old);
    } else {
      const response = await base44.functions.invoke('createCandidateSafe', {
        candidate_data: data,
        actor: getActor(),
      });
      if (response.data?.error === 'duplicate') {
        const ex = response.data.existing_candidate;
        alert(`Дубль: кандидат «${ex.full_name}» с датой рождения ${ex.birth_date} уже существует${ex.agency_name ? ` (агентство: ${ex.agency_name})` : ''}.\nСоздание заблокировано.`);
        return;
      }
    }
    setModalOpen(false);
    setEditCandidate(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить кандидата?')) return;
    const cand = candidates.find(c => c.id === id);
    await base44.entities.Candidate.delete(id);
    await logCandidateAction({ action: 'delete', candidate: { ...cand }, actor: getActor() });
    if (cand?.agency_id) {
      const remaining = candidates.filter(c => c.id !== id && c.agency_id === cand.agency_id);
      await base44.entities.Agency.update(cand.agency_id, { candidates_count: remaining.length });
    }
    load();
  };

  const handleArchive = async (c) => {
    await base44.entities.Candidate.update(c.id, { is_archived: true });
    await logCandidateAction({ action: 'update', candidate: { ...c, is_archived: true }, oldData: c, actor: getActor() });
    setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, is_archived: true } : x));
  };

  const handleUnarchive = async (c) => {
    await base44.entities.Candidate.update(c.id, { is_archived: false });
    await logCandidateAction({ action: 'update', candidate: { ...c, is_archived: false }, oldData: c, actor: getActor() });
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

  const active   = candidates.filter(c => !c.is_archived);
  const archived = candidates.filter(c => c.is_archived);

  const applyFilters = (list) => {
    const q = search.toLowerCase();
    return list.filter(c => {
      const matchSearch = !q || c.full_name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q) || c.phone?.includes(q);
      const matchAgency = !filters.agency || c.agency_id === filters.agency;
      const matchPos    = !filters.position || c.position === filters.position;
      const matchSB     = !filters.sb_check || c.sb_check === filters.sb_check;
      const matchMed    = !filters.medical_check || c.medical_check === filters.medical_check;
      const matchForm   = !filters.form_status || c.form_status === filters.form_status;
      const matchDocs   = !filters.incomplete_docs || hasMissingRequiredDocs(c);
      return matchSearch && matchAgency && matchPos && matchSB && matchMed && matchForm && matchDocs;
    });
  };

  const filteredActive   = applyFilters(active);
  const filteredArchived = applyFilters(archived);
  const displayed = showArchive ? filteredArchived : filteredActive;

  const handleAutoAssembly = async (c) => {
    if (!c.city) { alert('У кандидата не указан город проживания'); return; }
    try {
      const res = await base44.functions.invoke('findNearestCity', { city_name: c.city });
      const data = res.data;
      if (!data?.found || !data.nearest_cities?.length) {
        alert('Не удалось найти ближайшую точку сбора. Город кандидата может отсутствовать в справочнике.');
        return;
      }
      const nearest = data.nearest_cities[0];
      const autoComment = `🤖 Точка сбора определена автоматически: ${nearest.name} (${nearest.distance_km} км). Уточните возможность прибытия кандидата на медкомиссию и дату прибытия.`;
      const newComment = c.comment ? `${c.comment}\n\n${autoComment}` : autoComment;
      const updated = { assembly_point: nearest.name, comment: newComment };
      await base44.entities.Candidate.update(c.id, updated);
      await logCandidateAction({ action: 'update', candidate: { ...c, ...updated }, oldData: c, actor: getActor() });
      setCandidates(prev => prev.map(x => x.id === c.id ? { ...x, ...updated } : x));
    } catch (e) {
      alert('Ошибка при определении точки сбора: ' + e.message);
    }
  };

  const generateFormToken = async (c) => {
    const token = 'cf-' + Math.random().toString(36).substring(2, 10) + '-' + Math.random().toString(36).substring(2, 10);
    await base44.entities.Candidate.update(c.id, { form_token: token, form_status: 'pending' });
    await base44.entities.CandidateForm.create({ candidate_id: c.id, form_token: token, status: 'pending' });
    load();
  };

  const copyFormLink = (c) => {
    if (!c.form_token) return;
    const url = `${window.location.origin}/form/${c.form_token}`;
    navigator.clipboard.writeText(url);
    setCopiedId(c.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const setF = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const inp = "px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

  const readyCount = active.filter(c => c.payment_basis === 'Готовится к отправке').length;
  const paidCount  = active.filter(c => c.payment_made === 'Да').length;
  const sbCount = active.filter(c =>
    c.sb_check === 'Согласован' &&
    c.medical_check !== 'Прошёл' &&
    c.payment_basis !== 'Готовится к отправке' &&
    c.payment_made !== 'Да'
  ).length;
  const medCount = active.filter(c =>
    c.medical_check === 'Прошёл' &&
    c.payment_basis !== 'Готовится к отправке' &&
    c.payment_made !== 'Да'
  ).length;

  const dupCount = [...duplicateIds].filter(id => active.some(c => c.id === id)).length;

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
            <Link to="/admin/assistant"
              className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(201,168,76,0.3)] text-[#C9A84C] hover:bg-[#C9A84C]/10 transition-all">
              <Sparkles size={13}/> ИИ-помощник
            </Link>
            <Link to="/admin/candidate-logs"
              className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(123,63,191,0.25)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <ClipboardList size={13}/> Журнал
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
        {/* Предупреждение о дублях */}
        {dupCount > 0 && !showArchive && (
          <div className="mb-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-sm">
            <AlertTriangle size={15} className="flex-shrink-0"/>
            <span>Обнаружено <strong>{dupCount}</strong> дублирующих записей — выделены красным в таблице</span>
          </div>
        )}

        {/* Stats */}
        {!showArchive && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {[
              { label: 'Всего активных', value: active.length },
              { label: 'Согласованы СБ', value: sbCount },
              { label: 'Прошли медкомиссию', value: medCount },
              { label: 'К отправке', value: readyCount },
              { label: 'Выплачено (чел.)', value: paidCount, sub: `${(paidCount * 100000).toLocaleString('ru-RU')} ₽` },
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
          <select value={filters.form_status} onChange={e => setF('form_status', e.target.value)} className={inp}>
            <option value="">Анкета: все</option>
            <option value="completed">Анкета заполнена</option>
            <option value="pending">Анкета не заполнена</option>
          </select>
          <button
            onClick={() => setF('incomplete_docs', !filters.incomplete_docs)}
            className={`flex items-center gap-2 px-4 py-2 text-xs rounded border transition-all whitespace-nowrap ${filters.incomplete_docs ? 'border-red-500/50 text-red-400 bg-red-500/10' : 'border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/40 hover:text-red-400'}`}>
            <AlertTriangle size={13} /> Без обяз. документов
          </button>
          {Object.values(filters).some(Boolean) && (
            <button onClick={() => setFilters({ agency:'', position:'', sb_check:'', medical_check:'', form_status:'', incomplete_docs: false })}
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
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">Добавлен</th>
                    <th className="px-4 py-3"><Tooltip text="Комментарий"><MessageSquare size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap"><Tooltip text="Онлайн-анкета"><Link2 size={13} className="text-[#F8FAFC]/35" /></Tooltip></th>
                    <th className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider">Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((c) => {
                    const isDuplicate = duplicateIds.has(c.id);
                    const rowClass = isDuplicate
                      ? 'border-b border-red-500/30 bg-red-500/8 hover:bg-red-500/12 transition-colors'
                      : 'border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.06)] transition-colors';
                    return (
                      <tr key={c.id} className={rowClass}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {isDuplicate && (
                              <Tooltip text="Дубль: кандидат с таким ФИО и датой рождения уже есть в базе">
                                <AlertTriangle size={13} className="text-red-400 flex-shrink-0"/>
                              </Tooltip>
                            )}
                            {hasMissingRequiredDocs(c) && (
                              <HoverCard>
                                <HoverCardTrigger asChild>
                                  <span className="cursor-help flex-shrink-0">
                                    <AlertTriangle size={13} className="text-red-400"/>
                                  </span>
                                </HoverCardTrigger>
                                <HoverCardContent className="w-64 bg-[#0D1B3E] border-red-500/30 text-[#F8FAFC]">
                                  <div className="space-y-1.5 text-xs">
                                    <div className="font-bold text-red-400">Не хватает обязательных документов:</div>
                                    {getMissingRequiredDocs(c.documents || []).map(m => (
                                      <div key={m.id} className="text-[#F8FAFC]/60 flex items-center gap-1.5">
                                        <span className="text-red-400">•</span> {m.label}
                                      </div>
                                    ))}
                                  </div>
                                </HoverCardContent>
                              </HoverCard>
                            )}
                            <div>
                              <div className={`font-bold ${isDuplicate ? 'text-red-300' : 'text-[#F8FAFC]'}`}>{c.full_name}</div>
                              <div className="text-xs text-[#F8FAFC]/35">{c.agency_name || '—'}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-[#F8FAFC]/60 text-xs whitespace-nowrap">{c.position || '—'}</td>
                        <td className="px-4 py-3 text-xs text-[#F8FAFC]/55">
                          {c.city ? (
                            <HoverCard>
                              <HoverCardTrigger asChild>
                                <span className="cursor-help underline decoration-dotted underline-offset-2 hover:text-[#7B3FBF] transition-colors">{c.city}</span>
                              </HoverCardTrigger>
                              <HoverCardContent className="w-72 bg-[#0D1B3E] border-[rgba(123,63,191,0.3)] text-[#F8FAFC]">
                                {(() => {
                                  const cityInfo = cityCache[c.city.toLowerCase()];
                                  return (
                                    <div className="space-y-2 text-xs">
                                      <div className="font-bold text-[#F8FAFC]">{c.city}</div>
                                      {cityInfo?.region && <div className="text-[#F8FAFC]/60">Регион: {cityInfo.region}</div>}
                                      {c.assembly_point && (
                                        <div className="pt-2 border-t border-[rgba(123,63,191,0.15)]">
                                          <div className="text-[#F8FAFC]/50">Пункт сбора:</div>
                                          <div className="text-[#7B3FBF] font-bold">{c.assembly_point}</div>
                                        </div>
                                      )}
                                    </div>
                                  );
                                })()}
                              </HoverCardContent>
                            </HoverCard>
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
                        <td className="px-4 py-3 text-xs text-[#F8FAFC]/40 whitespace-nowrap">
                          {c.created_date
                            ? new Date(c.created_date).toLocaleDateString('ru-RU') + ' ' + new Date(c.created_date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
                            : '—'}
                        </td>
                        <td className="px-4 py-3">
                          <InlineCommentCell candidate={c} onUpdate={(id, data) => setCandidates(prev => prev.map(x => x.id === id ? { ...x, ...data } : x))} />
                        </td>
                        <td className="px-4 py-3">
                          {c.form_status === 'completed'
                            ? <a href={`/form/${c.form_token}?edit=1`} target="_blank" rel="noreferrer"
                                className="text-xs px-1.5 py-0.5 rounded bg-green-500/15 text-green-400 border border-green-500/25 whitespace-nowrap hover:bg-green-500/25 transition-all cursor-pointer">✓ Заполнена</a>
                            : c.form_token
                              ? <button onClick={() => copyFormLink(c)} title="Скопировать ссылку"
                                  className="flex items-center gap-1 text-xs text-[#7B3FBF]/70 hover:text-[#7B3FBF] transition-all">
                                  {copiedId === c.id ? <CheckCircle size={12} className="text-green-400" /> : <ClipboardCopy size={12} />}
                                  <span>{copiedId === c.id ? 'Скопировано' : 'Ссылка'}</span>
                                </button>
                              : <button onClick={() => generateFormToken(c)} title="Создать анкету"
                                  className="text-xs text-white/30 hover:text-[#7B3FBF] transition-all">+ Создать</button>}
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
                                {c.form_status === 'completed' && c.city && (
                                  <button onClick={() => handleAutoAssembly(c)} title="Авто-подбор точки сбора"
                                    className="p-1.5 rounded hover:bg-[#C9A84C]/20 text-[#F8FAFC]/50 hover:text-[#C9A84C] transition-all">
                                    <MapPin size={14}/>
                                  </button>
                                )}
                                <button onClick={() => { setEditCandidate(c); setModalOpen(true); }}
                                  className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                                  <Edit2 size={14}/>
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
                    );
                  })}
                  {displayed.length === 0 && (
                    <tr><td colSpan={11} className="text-center py-12 text-[#F8FAFC]/30">
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
    </div>
  );
}