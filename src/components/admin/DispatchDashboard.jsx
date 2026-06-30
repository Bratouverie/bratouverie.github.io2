import { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, AlertCircle, CheckCircle2, ChevronLeft, Check, X } from 'lucide-react';

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
    <div className="space-y-2 max-h-32 overflow-y-auto">
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

function ActionFlow({ action, onBack, onConfirm }) {
  const [step, setStep] = useState(1);
  const [selection, setSelection] = useState(null);
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState([]);
  const [error, setError] = useState(null);

  const log = (msg, status = 'pending') => {
    setLogs(prev => [...prev, { message: msg, status }]);
  };

  const updateLastLog = (status, newMsg = null) => {
    setLogs(prev => {
      const updated = [...prev];
      if (updated.length > 0) {
        updated[updated.length - 1].status = status;
        if (newMsg) updated[updated.length - 1].message = newMsg;
      }
      return updated;
    });
  };

  const handleActionExecution = async () => {
    setLoading(true);
    setError(null);
    setLogs([]);

    try {
      if (action.id === 'logistics') {
        log('Загрузка списка кандидатов без ПС...');
        const cands = await base44.entities.Candidate.filter({ assembly_point: '' });
        updateLastLog('success', `Найдено ${cands.length} кандидатов без ПС`);

        if (cands.length === 0) {
          setError('Все кандидаты имеют назначенный пункт сбора');
          setLoading(false);
          return;
        }

        log(`Выбран: ${selection.full_name}`);
        updateLastLog('success');

        log('Вызов getCandidateLogistics...');
        const logistics = await base44.functions.invoke('getCandidateLogistics', { candidate_id: selection.id });
        updateLastLog('success', `Найдено ${logistics.data.nearest_points?.length || 0} ближайших ПС`);
        
        log(`Обновление ПС для ${selection.full_name}...`);
        if (logistics.data.recommended_point) {
          await base44.entities.Candidate.update(selection.id, {
            assembly_point: logistics.data.recommended_point.name,
            assembly_distance: logistics.data.recommended_point.distance.toString(),
          });
          updateLastLog('success', `ПС обновлён: ${logistics.data.recommended_point.name} (${logistics.data.recommended_point.distance}км)`);
        }
      }

      if (action.id === 'documents') {
        log('Загрузка данных по документам...');
        const result = await base44.functions.invoke('checkCandidateDocuments', { candidate_id: selection?.id, agency_id: selection?.agency_id });
        updateLastLog('success', `Проверено документов: ${Object.keys(result.data).length}`);
        log('Анализ результатов...');
        updateLastLog('success', 'Готово');
      }

      if (action.id === 'analytics') {
        log('Загрузка аналитики CRM...');
        const analytics = await base44.functions.invoke('getCrmAnalytics', { period: selection || 'month', groupBy: 'agency' });
        updateLastLog('success', `Загружено ${analytics.data.total_candidates || 0} записей`);
      }

      onConfirm?.({ action: action.id, selection });
    } catch (err) {
      updateLastLog('error', err.message || 'Ошибка при выполнении');
      setError(err.message || 'Неизвестная ошибка');
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
          <p className="text-xs text-[#F8FAFC]/70">Выберите критерий:</p>
          {['Неделя', 'Месяц', 'Квартал'].map(opt => (
            <button key={opt} onClick={() => { setSelection(opt); setStep(2); }}
              className={`w-full text-left px-3 py-2 rounded border text-xs transition-all ${selection === opt ? 'border-[#7B3FBF] bg-[#7B3FBF]/10 text-[#7B3FBF]' : 'border-[#333] text-[#F8FAFC]/60 hover:border-[#555]'}`}>
              {opt}
            </button>
          ))}
        </div>
      )}

      {step === 2 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs text-[#F8FAFC]/50">
            <span className="text-[#7B3FBF] font-bold">✓ {selection}</span>
          </div>
          {!loading && logs.length === 0 && (
            <button onClick={handleActionExecution}
              className="w-full px-3 py-2 rounded bg-[#7B3FBF] text-white text-xs font-bold hover:bg-[#8B4FCF] transition-all">
              Начать выполнение
            </button>
          )}
          {logs.length > 0 && <ExecutionLog entries={logs} />}
          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#F8FAFC]/50">
              <Loader2 size={12} className="animate-spin" /> Выполнение...
            </div>
          )}
          {!loading && logs.length > 0 && !error && (
            <div className="flex items-center gap-2 p-2 rounded border border-green-500/30 bg-green-500/5 text-green-400 text-xs">
              <CheckCircle2 size={14} /> Выполнено успешно
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DispatchDashboard() {
  const [activeAction, setActiveAction] = useState(null);
  const [completedCount, setCompletedCount] = useState(0);

  const handleActionComplete = () => {
    setCompletedCount(prev => prev + 1);
    setActiveAction(null);
  };

  if (activeAction) {
    return (
      <ActionFlow
        action={DISPATCH_ACTIONS.find(a => a.id === activeAction)}
        onBack={() => setActiveAction(null)}
        onConfirm={handleActionComplete}
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-[#F8FAFC]">CRM Dispatch Panel</h3>
        {completedCount > 0 && (
          <span className="text-xs px-2 py-1 rounded bg-green-500/10 text-green-400 border border-green-500/25">
            ✓ Выполнено: {completedCount}
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DISPATCH_ACTIONS.map(action => (
          <button key={action.id} onClick={() => setActiveAction(action.id)}
            className={`flex flex-col items-center justify-center gap-1 px-2 py-3 rounded border text-xs font-semibold transition-all hover:scale-105 cursor-pointer ${action.color} text-[#F8FAFC] hover:text-[#7B3FBF]`}>
            <span className="text-lg">{action.icon}</span>
            <span className="line-clamp-2">{action.label}</span>
          </button>
        ))}
      </div>

      <div className="text-[10px] text-[#F8FAFC]/30 text-center pt-1">
        Выберите действие для начала workflow
      </div>
    </div>
  );
}