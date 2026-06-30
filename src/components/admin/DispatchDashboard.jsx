import { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft } from 'lucide-react';

const DISPATCH_ACTIONS = [
  { id: 'logistics', label: '1. Логистика', icon: '📍', color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'task', label: '2. Постановка задачи', icon: '📋', color: 'border-yellow-500/30 bg-yellow-500/5' },
  { id: 'documents', label: '3. Контроль документов', icon: '📄', color: 'border-purple-500/30 bg-purple-500/5' },
  { id: 'archive', label: '4. Архивация отказников', icon: '📦', color: 'border-red-500/30 bg-red-500/5' },
  { id: 'analytics', label: '5. Аналитика', icon: '📊', color: 'border-green-500/30 bg-green-500/5' },
  { id: 'eventlog', label: '6. Мониторинг событий', icon: '📜', color: 'border-cyan-500/30 bg-cyan-500/5' },
  { id: 'callscript', label: '7. Скрипт звонка', icon: '☎️', color: 'border-orange-500/30 bg-orange-500/5' },
  { id: 'ticket', label: '8. Ответ на тикет', icon: '🎟️', color: 'border-pink-500/30 bg-pink-500/5' },
];

function ExecutionLog({ entries = [] }) {
  return (
    <div className="space-y-2 max-h-40 overflow-y-auto">
      {entries.map((entry, i) => (
        <div key={i} className="flex items-start gap-2 text-xs p-2 rounded bg-[#0D1B3E]/50 border border-[rgba(123,63,191,0.1)]">
          <span className={`flex-shrink-0 ${entry.status === 'pending' ? 'text-[#C9A84C]' : entry.status === 'success' ? 'text-green-500' : 'text-red-500'}`}>
            {entry.status === 'pending' && '⏳'}
            {entry.status === 'success' && '✓'}
            {entry.status === 'error' && '✗'}
          </span>
          <span className="text-[#F8FAFC]/70 flex-1">{entry.message}</span>
        </div>
      ))}
    </div>
  );
}

// 1. ЛОГИСТИКА
function LogisticsFlow({ onBack, onComplete }) {
  const [step, setStep] = useState(1);
  const [candidates, setCandidates] = useState([]);
  const [selected, setSelected] = useState(null);
  const [addressMode, setAddressMode] = useState('current');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  useEffect(() => {
    const loadCandidates = async () => {
      try {
        const cands = await base44.entities.Candidate.filter({ assembly_point: '' }, '-created_date', 50);
        setCandidates(cands);
        if (cands.length === 0) setError('Нет кандидатов без пункта сбора');
      } catch (e) {
        setError(e.message);
      }
    };
    if (step === 1) loadCandidates();
  }, [step]);

  const handleExecute = async () => {
    if (!selected) return;
    setLoading(true);
    setLogs([]);
    try {
      log('Вызов функции getCandidateLogistics...');
      const result = await base44.functions.invoke('getCandidateLogistics', { candidate_id: selected.id });
      updateLog('success', `Найдено ${result.data.nearest_points?.length || 0} ближайших пунктов`);

      if (result.data.nearest_points?.length > 0) {
        log('Обновление данных кандидата...');
        const nearest = result.data.nearest_points[0];
        await base44.entities.Candidate.update(selected.id, {
          assembly_point: nearest.name,
          assembly_distance: nearest.distance.toString(),
        });
        updateLog('success', `Назначен ПС: ${nearest.name} (${nearest.distance}км)`);
      }
      onComplete();
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <p className="text-xs text-[#F8FAFC]/70">Выберите кандидата:</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {candidates.slice(0, 5).map(cand => (
              <button key={cand.id} onClick={() => { setSelected(cand); setStep(2); }}
                className={`w-full text-left px-2 py-1.5 rounded border text-xs transition-all ${selected?.id === cand.id ? 'border-[#7B3FBF] bg-[#7B3FBF]/10' : 'border-[#333] hover:border-[#555]'}`}>
                <div className="font-bold text-[#F8FAFC]">{cand.full_name}</div>
                <div className="text-[#F8FAFC]/50">{cand.position} • {cand.city}</div>
              </button>
            ))}
          </div>
          {candidates.length > 5 && <p className="text-[10px] text-[#F8FAFC]/30">Показаны первые 5 из {candidates.length}</p>}
        </div>
      )}

      {step === 2 && selected && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#F8FAFC]/50">
            <span className="text-[#7B3FBF] font-bold">✓ {selected.full_name}</span>
          </div>
          <div className="border border-[#333] rounded p-2 text-xs space-y-1">
            <p className="text-[#F8FAFC]/70"><strong>Должность:</strong> {selected.position}</p>
            <p className="text-[#F8FAFC]/70"><strong>Город:</strong> {selected.city}</p>
            <p className="text-[#F8FAFC]/70"><strong>Режим расчёта:</strong> {addressMode === 'current' ? 'Текущий адрес' : 'Адрес регистрации'}</p>
          </div>
          {!loading && logs.length === 0 && (
            <button onClick={handleExecute}
              className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
              Расчитать ближайшие ПС
            </button>
          )}
          {logs.length > 0 && <ExecutionLog entries={logs} />}
          {!loading && logs.length > 0 && !error && (
            <div className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/5 text-green-400 text-xs">
              <CheckCircle2 size={14} /> Пункт сбора назначен
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 2. ПОСТАНОВКА ЗАДАЧИ
function TaskFlow({ onBack, onComplete }) {
  const [step, setStep] = useState(1);
  const [agencies, setAgencies] = useState([]);
  const [selectedAgency, setSelectedAgency] = useState(null);
  const [taskType, setTaskType] = useState(null);
  const [priority, setPriority] = useState('medium');
  const [note, setNote] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const TASK_TYPES = ['Дослать сканы', 'Срочно связаться', 'Уточнить анкету', 'Дослать диплом', 'Встреча'];

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  useEffect(() => {
    if (step === 1) {
      base44.entities.Agency.filter({ is_active: true }, '-created_date', 50)
        .then(setAgencies)
        .catch(e => setError(e.message));
    }
  }, [step]);

  const handleCreate = async () => {
    if (!selectedAgency || !taskType) return;
    setLoading(true);
    setLogs([]);
    try {
      log('Создание уведомления для агентства...');
      const result = await base44.functions.invoke('createTaskNotification', {
        agency_id: selectedAgency.id,
        message: `${taskType}${note ? ': ' + note : ''}`,
      });
      updateLog('success', `Задача создана (ID: ${result.data.notification_id})`);
      onComplete();
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-2">
          <p className="text-xs text-[#F8FAFC]/70 font-bold">Шаг 1/3: Выберите агентство</p>
          <div className="max-h-32 overflow-y-auto space-y-1">
            {agencies.slice(0, 8).map(ag => (
              <button key={ag.id} onClick={() => { setSelectedAgency(ag); setStep(2); }}
                className={`w-full text-left px-2 py-1.5 rounded border text-xs transition-all ${selectedAgency?.id === ag.id ? 'border-[#7B3FBF] bg-[#7B3FBF]/10' : 'border-[#333]'}`}>
                <div className="font-bold text-[#F8FAFC]">{ag.name}</div>
                <div className="text-[#F8FAFC]/50">{ag.city} • {ag.candidates_count} канд.</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-2">
          <p className="text-xs text-[#F8FAFC]/70 font-bold">Шаг 2/3: Выберите тип задачи</p>
          <div className="space-y-1">
            {TASK_TYPES.map(t => (
              <button key={t} onClick={() => { setTaskType(t); setStep(3); }}
                className={`w-full text-left px-2 py-1.5 rounded border text-xs transition-all ${taskType === t ? 'border-[#7B3FBF] bg-[#7B3FBF]/10' : 'border-[#333]'}`}>
                {t}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-3">
          <p className="text-xs text-[#F8FAFC]/70 font-bold">Шаг 3/3: Приоритет и примечание</p>
          <div className="space-y-2">
            <select value={priority} onChange={e => setPriority(e.target.value)}
              className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
              <option value="low">Низкий</option>
              <option value="medium">Средний</option>
              <option value="high">Срочный</option>
            </select>
            <textarea value={note} onChange={e => setNote(e.target.value)} placeholder="Примечание (опционально)"
              className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC] placeholder:text-[#F8FAFC]/25 resize-none h-12" />
          </div>
          {!loading && logs.length === 0 && (
            <button onClick={handleCreate}
              className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
              Создать задачу
            </button>
          )}
          {logs.length > 0 && <ExecutionLog entries={logs} />}
          {!loading && logs.length > 0 && !error && (
            <div className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/5 text-green-400 text-xs">
              <CheckCircle2 size={14} /> Задача создана для {selectedAgency.name}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// 3. КОНТРОЛЬ ДОКУМЕНТОВ
function DocumentsFlow({ onBack, onComplete }) {
  const [filterType, setFilterType] = useState('all');
  const [candidateId, setCandidateId] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  const handleCheck = async () => {
    setLoading(true);
    setLogs([]);
    try {
      log('Проверка документов...');
      const result = await base44.functions.invoke('checkCandidateDocuments', { candidate_id: candidateId || undefined });
      updateLog('success', `Проверено ${result.data.forms?.length || 0} анкет`);
      setResults(result.data);
      onComplete();
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Фильтр</label>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="all">Все документы</option>
          <option value="incomplete">Только некомплект</option>
          <option value="expired">Просроченные</option>
        </select>
      </div>

      {!loading && logs.length === 0 && (
        <button onClick={handleCheck}
          className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
          Проверить документы
        </button>
      )}

      {logs.length > 0 && <ExecutionLog entries={logs} />}

      {results && (
        <div className="border border-green-500/30 rounded p-2 text-xs text-[#F8FAFC]/70 space-y-1">
          <p><strong>Всего форм:</strong> {results.forms?.length || 0}</p>
          <p><strong>Статус:</strong> {results.message}</p>
        </div>
      )}
    </div>
  );
}

// 4. АРХИВАЦИЯ ОТКАЗНИКОВ
function ArchiveFlow({ onBack, onComplete }) {
  const [criteria, setCriteria] = useState('sb_refused');
  const [dryRun, setDryRun] = useState(true);
  const [candidates, setCandidates] = useState([]);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  const handleArchive = async () => {
    setLoading(true);
    setLogs([]);
    try {
      log(`Поиск кандидатов (критерий: ${criteria}, dry_run: ${dryRun})...`);
      const result = await base44.functions.invoke('archiveRefusedCandidates', {
        criteria,
        dry_run: dryRun,
      });
      updateLog('success', `Найдено ${result.data.total_would_archive || result.data.archived_count || 0} кандидатов`);
      
      if (result.data.candidates?.length > 0) {
        setCandidates(result.data.candidates.slice(0, 3));
        log(`Показаны первые 3 из ${result.data.candidates.length}`);
        updateLog('success');
      }

      if (!dryRun) {
        log('Архивирование выполнено');
        updateLog('success');
        onComplete();
      }
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Критерий архивации</label>
        <select value={criteria} onChange={e => setCriteria(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="sb_refused">Отказ СБ</option>
          <option value="med_refused">Мед-отказ</option>
          <option value="personal_refused">Личный отказ</option>
        </select>
      </div>

      <label className="flex items-center gap-2 text-xs text-[#F8FAFC]/70">
        <input type="checkbox" checked={dryRun} onChange={e => setDryRun(e.target.checked)} className="rounded" />
        Dry-run (показать, не архивировать)
      </label>

      {!loading && logs.length === 0 && (
        <button onClick={handleArchive}
          className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
          {dryRun ? 'Показать кандидатов' : 'Архивировать'}
        </button>
      )}

      {logs.length > 0 && <ExecutionLog entries={logs} />}

      {candidates.length > 0 && (
        <div className="border border-[#333] rounded p-2 space-y-1">
          {candidates.map((c, i) => (
            <div key={i} className="text-xs text-[#F8FAFC]/70">
              <p className="font-bold">{c.full_name}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// 5. АНАЛИТИКА
function AnalyticsFlow({ onBack, onComplete }) {
  const [period, setPeriod] = useState('month');
  const [groupBy, setGroupBy] = useState('agency');
  const [results, setResults] = useState(null);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setLogs([]);
    try {
      log(`Загрузка аналитики (период: ${period}, разрез: ${groupBy})...`);
      const result = await base44.functions.invoke('getCrmAnalytics', { period, groupBy });
      updateLog('success', `Загружено ${result.data.total_candidates || 0} кандидатов`);
      setResults(result.data);
      onComplete();
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Период</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="week">Неделя</option>
          <option value="month">Месяц</option>
          <option value="quarter">Квартал</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Разрез</label>
        <select value={groupBy} onChange={e => setGroupBy(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="agency">По агентствам</option>
          <option value="position">По должностям</option>
        </select>
      </div>

      {!loading && logs.length === 0 && (
        <button onClick={handleAnalyze}
          className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
          Загрузить аналитику
        </button>
      )}

      {logs.length > 0 && <ExecutionLog entries={logs} />}

      {results && (
        <div className="border border-green-500/30 rounded p-2 text-xs text-[#F8FAFC]/70 space-y-1">
          <p><strong>Всего кандидатов:</strong> {results.total_candidates}</p>
          <p><strong>Разрез:</strong> {groupBy}</p>
        </div>
      )}
    </div>
  );
}

// 6. МОНИТОРИНГ
function EventLogFlow({ onBack, onComplete }) {
  const [eventType, setEventType] = useState('all');
  const [period, setPeriod] = useState('today');
  const [logs, setLogs] = useState([]);
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  const handleFetch = async () => {
    setLoading(true);
    setLogs([]);
    try {
      log(`Загрузка логов (тип: ${eventType}, период: ${period})...`);
      const result = await base44.functions.invoke('getCandidateEventLog', { event_type: eventType, period });
      updateLog('success', `Загружено ${result.data.total_events || 0} событий`);
      setResults(result.data);
      onComplete();
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Тип события</label>
        <select value={eventType} onChange={e => setEventType(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="all">Все события</option>
          <option value="sb">СБ-события</option>
          <option value="documents">Документы</option>
          <option value="logistics">Логистика</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Период</label>
        <select value={period} onChange={e => setPeriod(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="today">Сегодня</option>
          <option value="yesterday">Вчера</option>
          <option value="week">Неделя</option>
        </select>
      </div>

      {!loading && logs.length === 0 && (
        <button onClick={handleFetch}
          className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
          Загрузить логи
        </button>
      )}

      {logs.length > 0 && <ExecutionLog entries={logs} />}

      {results && (
        <div className="border border-green-500/30 rounded p-2 text-xs text-[#F8FAFC]/70 space-y-1">
          <p><strong>Всего событий:</strong> {results.total_events || 0}</p>
        </div>
      )}
    </div>
  );
}

// 7. СКРИПТ ЗВОНКА
function CallScriptFlow({ onBack, onComplete }) {
  const [agencyId, setAgencyId] = useState('');
  const [purpose, setPurpose] = useState('check');
  const [script, setScript] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  const handleGenerate = async () => {
    if (!agencyId) { setError('Выберите агентство'); return; }
    setLoading(true);
    setLogs([]);
    try {
      log('Генерация скрипта звонка...');
      const result = await base44.functions.invoke('generateCallScript', { agency_id: agencyId, call_purpose: purpose });
      updateLog('success', 'Скрипт готов');
      setScript(result.data.script || '');
      onComplete();
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">ID агентства</label>
        <input type="text" value={agencyId} onChange={e => setAgencyId(e.target.value)} placeholder="Вставьте ID"
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC] placeholder:text-[#F8FAFC]/25" />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Цель звонка</label>
        <select value={purpose} onChange={e => setPurpose(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="check">Проверка статуса</option>
          <option value="training">Обучение CRM</option>
          <option value="payment">Выплаты</option>
        </select>
      </div>

      {!loading && logs.length === 0 && (
        <button onClick={handleGenerate}
          className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
          Сгенерировать скрипт
        </button>
      )}

      {logs.length > 0 && <ExecutionLog entries={logs} />}

      {script && (
        <div className="border border-green-500/30 rounded p-2 text-xs text-[#F8FAFC]/70 max-h-20 overflow-y-auto">
          <p className="whitespace-pre-wrap">{script}</p>
        </div>
      )}
    </div>
  );
}

// 8. ОТВЕТ НА ТИКЕТ
function TicketFlow({ onBack, onComplete }) {
  const [ticketId, setTicketId] = useState('');
  const [action, setAction] = useState('answered');
  const [answer, setAnswer] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => setLogs(prev => [...prev, { message: msg, status }]);
  const updateLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  const handleRespond = async () => {
    if (!ticketId || !answer) { setError('Заполните все поля'); return; }
    setLoading(true);
    setLogs([]);
    try {
      log('Отправка ответа на тикет...');
      const result = await base44.functions.invoke('respondToTicket', { ticket_id: ticketId, answer, status: action });
      updateLog('success', 'Ответ отправлен');
      onComplete();
    } catch (e) {
      updateLog('error', e.message);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="flex items-center gap-1 px-2 py-1 text-xs text-[#F8FAFC]/50 hover:text-[#7B3FBF]">
        <ChevronLeft size={12} /> Вернуться
      </button>

      {error && (
        <div className="flex gap-2 p-2 rounded border border-red-500/30 bg-red-500/5 text-xs text-red-400">
          <AlertCircle size={14} className="flex-shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">ID тикета</label>
        <input type="text" value={ticketId} onChange={e => setTicketId(e.target.value)} placeholder="Вставьте ID"
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC] placeholder:text-[#F8FAFC]/25" />
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Действие</label>
        <select value={action} onChange={e => setAction(e.target.value)}
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC]">
          <option value="answered">Ответ</option>
          <option value="rejected">Отказ</option>
          <option value="pending">В работе</option>
        </select>
      </div>

      <div className="space-y-2">
        <label className="text-xs text-[#F8FAFC]/70 font-bold">Ответ</label>
        <textarea value={answer} onChange={e => setAnswer(e.target.value)} placeholder="Напишите ответ"
          className="w-full px-2 py-1.5 bg-[#0D1B3E] border border-[#333] rounded text-xs text-[#F8FAFC] placeholder:text-[#F8FAFC]/25 resize-none h-16" />
      </div>

      {!loading && logs.length === 0 && (
        <button onClick={handleRespond}
          className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
          Отправить ответ
        </button>
      )}

      {logs.length > 0 && <ExecutionLog entries={logs} />}

      {!loading && logs.length > 0 && !error && (
        <div className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/5 text-green-400 text-xs">
          <CheckCircle2 size={14} /> Тикет обновлён
        </div>
      )}
    </div>
  );
}

// ГЛАВНЫЙ КОМПОНЕНТ
export default function DispatchDashboard() {
  const [activeAction, setActiveAction] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  const handleActionComplete = () => {
    setCompletedCount(prev => prev + 1);
    setActiveAction(null);
  };

  if (activeAction) {
    const flows = {
      logistics: LogisticsFlow,
      task: TaskFlow,
      documents: DocumentsFlow,
      archive: ArchiveFlow,
      analytics: AnalyticsFlow,
      eventlog: EventLogFlow,
      callscript: CallScriptFlow,
      ticket: TicketFlow,
    };

    const Flow = flows[activeAction];
    return <Flow onBack={() => setActiveAction(null)} onComplete={handleActionComplete} />;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#F8FAFC]">Dispatcher v2</h3>
        {completedCount > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/25">
            ✓ {completedCount}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DISPATCH_ACTIONS.map(action => (
          <button key={action.id} onClick={() => setActiveAction(action.id)}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded border text-xs font-semibold transition-all hover:scale-105 cursor-pointer ${action.color} text-[#F8FAFC] hover:text-[#7B3FBF]`}>
            <span className="text-lg">{action.icon}</span>
            <span className="line-clamp-2 text-center">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="text-[10px] text-[#F8FAFC]/30 text-center">
        8 действий • Полный workflow для каждого
      </div>
    </div>
  );
}