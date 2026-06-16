import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, X, ChevronDown, ChevronRight } from 'lucide-react';

const ACTION_LABELS = { create: 'Создание', update: 'Изменение', delete: 'Удаление' };
const ACTION_COLORS = { create: 'text-green-400 bg-green-400/10 border-green-400/20', update: 'text-blue-400 bg-blue-400/10 border-blue-400/20', delete: 'text-red-400 bg-red-400/10 border-red-400/20' };

const FIELD_LABELS = {
  full_name: 'ФИО', position: 'Должность', phone: 'Телефон', birth_date: 'Дата рождения',
  citizenship: 'Гражданство', birth_place: 'Место рождения', health_status: 'Здоровье',
  city: 'Город', assembly_point: 'Пункт сбора', arrival_date: 'Дата прибытия',
  sb_check: 'Проверка СБ', medical_check: 'Медкомиссия', comment: 'Комментарий',
  payment_basis: 'Основание выплаты', payment_made: 'Выплачено', is_archived: 'Архив'
};

function formatDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('ru-RU') + ' ' + d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
}

function ChangesRow({ changesJson }) {
  const [open, setOpen] = useState(false);
  if (!changesJson) return null;
  let diff = {};
  try { diff = JSON.parse(changesJson); } catch { return null; }
  const keys = Object.keys(diff);
  if (keys.length === 0) return null;
  return (
    <div className="mt-1">
      <button onClick={() => setOpen(v => !v)} className="flex items-center gap-1 text-xs text-[#7B3FBF] hover:text-[#C9A84C] transition-colors">
        {open ? <ChevronDown size={11}/> : <ChevronRight size={11}/>}
        {keys.length} изм. {keys.map(k => FIELD_LABELS[k] || k).join(', ')}
      </button>
      {open && (
        <div className="mt-1.5 space-y-1">
          {keys.map(k => (
            <div key={k} className="flex items-start gap-2 text-xs">
              <span className="text-[#F8FAFC]/40 min-w-[120px]">{FIELD_LABELS[k] || k}:</span>
              <span className="text-red-400/70 line-through truncate max-w-[120px]">{String(diff[k].from || '—')}</span>
              <span className="text-[#F8FAFC]/30">→</span>
              <span className="text-green-400 truncate max-w-[120px]">{String(diff[k].to || '—')}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CandidateLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');

  const load = async () => {
    setLoading(true);
    const data = await base44.entities.CandidateLog.list('-timestamp', 500);
    setLogs(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const filtered = logs.filter(l => {
    const q = search.toLowerCase();
    const matchSearch = !q || l.candidate_name?.toLowerCase().includes(q) || l.changed_by_name?.toLowerCase().includes(q);
    const matchAction = !filterAction || l.action === filterAction;
    return matchSearch && matchAction;
  });

  const inp = "px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC]">
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1400px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors">
              <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png" className="w-7 h-7 object-contain" alt="logo" />
            </Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <Link to="/admin/agencies" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">Агентства</Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <Link to="/admin/candidates" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">Кандидаты</Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <h1 className="text-sm font-bold text-[#F8FAFC]">Журнал изменений</h1>
          </div>
          <button onClick={load} className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-6 py-6">
        <div className="flex flex-wrap gap-3 mb-6">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#F8FAFC]/30" />
            <input type="text" placeholder="Поиск по ФИО кандидата или имени пользователя..."
              value={search} onChange={e => setSearch(e.target.value)}
              className={inp + ' w-full pl-9'} />
          </div>
          <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className={inp}>
            <option value="">Все действия</option>
            <option value="create">Создание</option>
            <option value="update">Изменение</option>
            <option value="delete">Удаление</option>
          </select>
          {(search || filterAction) && (
            <button onClick={() => { setSearch(''); setFilterAction(''); }}
              className="flex items-center gap-1 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
              <X size={12}/> Сбросить
            </button>
          )}
        </div>

        <div className="text-xs text-[#F8FAFC]/30 mb-4">Записей: {filtered.length}</div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-8 h-8 border-4 border-[#7B3FBF]/30 border-t-[#7B3FBF] rounded-full animate-spin" /></div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[rgba(123,63,191,0.15)]">
                    {['Дата и время', 'Действие', 'Кандидат', 'Кто изменил', 'Детали'].map(h => (
                      <th key={h} className="text-left px-4 py-3 text-xs font-bold text-[#F8FAFC]/35 uppercase tracking-wider whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id} className="border-b border-[rgba(255,255,255,0.04)] hover:bg-[rgba(123,63,191,0.04)] transition-colors">
                      <td className="px-4 py-3 text-xs text-[#F8FAFC]/50 whitespace-nowrap">{formatDate(l.timestamp)}</td>
                      <td className="px-4 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded border font-medium ${ACTION_COLORS[l.action] || 'text-[#F8FAFC]/40'}`}>
                          {ACTION_LABELS[l.action] || l.action}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-[#F8FAFC]">{l.candidate_name || '—'}</div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="text-sm text-[#F8FAFC]/80">{l.changed_by_name || '—'}</div>
                        <div className="text-xs text-[#F8FAFC]/30">
                          {l.changed_by_role === 'agency' ? `Агентство: ${l.agency_name || ''}` : 'Администратор'}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {l.action === 'create' && <span className="text-xs text-green-400/70">Новая запись</span>}
                        {l.action === 'delete' && <span className="text-xs text-red-400/70">Запись удалена</span>}
                        {l.action === 'update' && <ChangesRow changesJson={l.changes} />}
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-12 text-[#F8FAFC]/30">Записей не найдено</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}