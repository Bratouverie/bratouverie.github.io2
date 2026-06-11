import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Plus, Edit2, Trash2, LogOut, Building2, Users, Search, MessageSquare, Shield, Stethoscope, Banknote, CheckCircle, MapPin, CalendarDays } from 'lucide-react';
import CandidateModal from '../components/admin/CandidateModal';

const SB_COLORS  = { 'Не проверялся': 'text-[#F8FAFC]/40', 'Согласован': 'text-green-400', 'Не согласован': 'text-red-400' };
const MED_COLORS = { 'Не проверялся': 'text-[#F8FAFC]/40', 'Прошёл': 'text-green-400', 'Не прошёл': 'text-red-400' };
const PAY_COLORS = { 'Готовится к отправке': 'text-green-400', 'Отказался от отправки': 'text-red-400/70' };

function Tooltip({ text, children }) {
  return (
    <div className="relative group/tip inline-flex items-center">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded bg-[#0D1B3E] border border-[rgba(123,63,191,0.3)] text-xs text-[#F8FAFC]/80 whitespace-nowrap opacity-0 pointer-events-none group-hover/tip:opacity-100 transition-opacity z-[9999] shadow-lg">
        {text}
      </div>
    </div>
  );
}

export default function AgencyWorkspace() {
  const navigate = useNavigate();

  // Читаем сессию агентства
  const session = (() => {
    try { return JSON.parse(sessionStorage.getItem('agency_session')); } catch { return null; }
  })();

  const [agency, setAgency]       = useState(null);
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCandidate, setEditCandidate] = useState(null);

  // Если нет сессии — редирект на вход
  useEffect(() => {
    if (!session?.id) {
      navigate('/agency-login', { replace: true });
      return;
    }
    load();
  }, []);

  const load = async () => {
    if (!session?.id) return;
    setLoading(true);
    const [agencyList, cands] = await Promise.all([
      base44.entities.Agency.filter({ id: session.id }),
      base44.entities.Candidate.filter({ agency_id: session.id }, '-created_date', 500),
    ]);
    setAgency(agencyList[0] || null);
    setCandidates(cands);
    setLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('agency_session');
    navigate('/agency-login', { replace: true });
  };

  const handleSave = async (data, id) => {
    const dataWithAgency = {
      ...data,
      agency_id: session.id,
      agency_name: session.name,
    };
    if (id) await base44.entities.Candidate.update(id, dataWithAgency);
    else await base44.entities.Candidate.create(dataWithAgency);
    setModalOpen(false);
    setEditCandidate(null);
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Удалить кандидата?')) return;
    await base44.entities.Candidate.delete(id);
    load();
  };

  const filtered = candidates.filter(c => {
    const q = search.toLowerCase();
    return !q || c.full_name?.toLowerCase().includes(q) || c.position?.toLowerCase().includes(q) || c.city?.toLowerCase().includes(q);
  });

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
          </div>
          <button onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 text-xs rounded-lg border border-[rgba(255,255,255,0.12)] text-[#F8FAFC]/50 hover:text-red-400 hover:border-red-500/30 transition-all">
            <LogOut size={13} /> Выйти из агентства
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        {/* Agency info card — compact */}
        {agency && (
          <div className="glass-card-gold rounded-xl px-5 py-3 mb-4">
            {/* Row 1: name + total */}
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
            {/* Row 2: stats badges */}
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
                  {/* Должности */}
                  {Object.entries(byPos).map(([pos, cnt]) => (
                    <span key={pos} className="text-xs text-[#F8FAFC]/55">{pos}: <span className="text-[#7B3FBF] font-bold">{cnt}</span></span>
                  ))}
                  <span className="text-[rgba(123,63,191,0.25)] text-xs">|</span>
                  {/* СБ */}
                  <span className="text-xs text-[#F8FAFC]/50">СБ ✓: <span className="text-green-400 font-bold">{sbOk}</span></span>
                  {/* Мед */}
                  <span className="text-xs text-[#F8FAFC]/50">Мед ✓: <span className="text-green-400 font-bold">{medOk}</span></span>
                  {/* Оба */}
                  <span className="text-xs text-[#F8FAFC]/50">СБ+Мед: <span className="text-[#C9A84C] font-bold">{both}</span></span>
                  <span className="text-[rgba(123,63,191,0.25)] text-xs">|</span>
                  {/* Отправка */}
                  {ready > 0 && <span className="text-xs text-green-400/80">К отправке: <span className="font-bold">{ready}</span></span>}
                  {refused > 0 && <span className="text-xs text-red-400/70">Отказ: <span className="font-bold">{refused}</span></span>}
                </div>
              );
            })()}
          </div>
        )}

        {/* Actions bar */}
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
            <input type="text" placeholder="Поиск по ФИО, должности, городу..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={inp + ' w-full pl-9'} />
          </div>
          <button
            onClick={() => { setEditCandidate(null); setModalOpen(true); }}
            className="flex items-center gap-2 px-5 py-2.5 text-sm rounded-lg bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all font-bold">
            <Plus size={15} /> Добавить кандидата
          </button>
        </div>

        <div className="text-xs text-[#F8FAFC]/30 mb-4">Кандидатов: {filtered.length}</div>

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
                  {filtered.map(c => (
                    <tr key={c.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.06)] transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-bold text-[#F8FAFC]">{c.full_name}</div>
                        <div className="text-xs text-[#F8FAFC]/35">{c.city || ''}</div>
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
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/45 whitespace-nowrap">{c.arrival_date || '—'}</td>
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
                        <div className="flex items-center gap-2">
                          <button onClick={() => { setEditCandidate(c); setModalOpen(true); }}
                            className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                            <Edit2 size={14} />
                          </button>
                          <button onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-16 text-[#F8FAFC]/30">
                        <div className="flex flex-col items-center gap-3">
                          <Users size={32} className="text-[#F8FAFC]/15" />
                          <p>Кандидатов пока нет. Добавьте первого!</p>
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