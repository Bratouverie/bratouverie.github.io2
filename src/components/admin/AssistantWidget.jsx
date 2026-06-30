import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Sparkles, X, AlertCircle, RefreshCw, Zap, MapPin } from 'lucide-react';
import MessageBubble from '@/components/admin/AssistantMessage';
import DispatchDashboard from '@/components/admin/DispatchDashboard';

const AGENT_NAME = 'crm_helper';
const SUGGESTED_PROMPTS = [
  'Какие кандидаты без пункта сбора?',
  'Условия по зарплате и выплатам?',
  'Как отправить анкету кандидату?',
  'Открытые тикеты менеджеров',
];

export default function AssistantWidget() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [initState, setInitState] = useState('idle');
  const [sending, setSending] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isAuthed, setIsAuthed] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const messagesEndRef = useRef(null);
  const unsubscribeRef = useRef(null);
  const initStartedRef = useRef(false);

  const isAgencyWorkspace = location.pathname.startsWith('/agency/workspace');
  const isCRMPage = location.pathname.startsWith('/admin/') || isAgencyWorkspace;
  const isFullAssistantPage = location.pathname === '/admin/assistant';
  const shouldShow = isCRMPage && !isFullAssistantPage && (isAgencyWorkspace || (isAuthed && (userRole === 'admin' || userRole === 'moderator')));

  useEffect(() => {
    base44.auth.isAuthenticated().then(async (authed) => {
      setIsAuthed(authed);
      if (authed) {
        try { const u = await base44.auth.me(); setUserRole(u.role); } catch (_) {}
      }
    }).catch(() => setIsAuthed(false));
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, sending]);

  const initConversation = useCallback(async () => {
    setInitState('initializing');
    setErrorMsg(null);
    setFallbackMode(false);
    try {
      let conv = null;
      try {
        const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
        if (existing && existing.length > 0) conv = existing[0];
      } catch (_) {}
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: 'CRM Widget' },
        });
      }
      if (unsubscribeRef.current) unsubscribeRef.current();
      unsubscribeRef.current = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
        setSending(false);
      });
      setConversation(conv);
      setMessages(conv.messages || []);
      setInitState('ready');
    } catch (e) {
      setErrorMsg(e.message || 'Не удалось подключиться к ИИ-агенту. Работаю в запасном режиме.');
      setInitState('error');
      setFallbackMode(true);
    }
  }, []);

  useEffect(() => {
    if (isOpen && !initStartedRef.current) {
      initStartedRef.current = true;
      if (isAgencyWorkspace && !isAuthed) {
        setFallbackMode(true);
        setInitState('ready');
      } else {
        initConversation();
      }
    }
  }, [isOpen]);

  useEffect(() => {
    return () => { if (unsubscribeRef.current) unsubscribeRef.current(); };
  }, []);

  const sendViaLLM = async (content) => {
    const res = await base44.integrations.Core.InvokeLLM({
      prompt: `Ты — ИИ-помощник CRM-системы "Братоуверие-СНБ" (программа восстановления ЛНР/ДНР). Отвечай кратко и по-делу на русском языке.\n\nВопрос пользователя: ${content}`,
      add_context_from_internet: false,
    });
    if (typeof res === 'string') return res;
    if (res?.data && typeof res.data === 'string') return res.data;
    return typeof res === 'object' ? JSON.stringify(res) : String(res);
  };

  const handleSend = async (text) => {
    const content = (text || input).trim();
    if (!content || sending) return;

    setMessages(prev => [...prev, { role: 'user', content }]);
    setSending(true);
    setInput('');

    if (initState === 'ready' && conversation && !fallbackMode) {
      try {
        await base44.agents.addMessage(conversation, { role: 'user', content });
        return;
      } catch (_) {
        setFallbackMode(true);
      }
    }

    try {
      const response = await sendViaLLM(content);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (_) {
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ИИ временно недоступен. Нажмите кнопку обновления и попробуйте снова.' }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const handleRetry = () => {
    initStartedRef.current = false;
    setMessages([]);
    setConversation(null);
    setFallbackMode(false);
    initConversation();
  };

  if (!shouldShow) return null;

  return (
    <>
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-[#7B3FBF] hover:bg-[#8B4FCF] text-white shadow-2xl glow-purple flex items-center justify-center transition-all hover:scale-105"
          title="ИИ-помощник"
        >
          <Sparkles size={22} />
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[540px] max-h-[calc(100vh-3rem)] bg-[#0D1B3E] border border-[rgba(123,63,191,0.3)] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-[rgba(123,63,191,0.2)] bg-[#05070A]/50">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7B3FBF]/20 border border-[#7B3FBF]/40 flex items-center justify-center">
                <Sparkles size={13} className="text-[#7B3FBF]" />
              </div>
              <div>
                <div className="text-sm font-bold text-[#F8FAFC]">ИИ-помощник</div>
                {fallbackMode
                  ? <div className="text-[10px] text-[#C9A84C] flex items-center gap-1"><Zap size={9} /> Запасной режим (LLM)</div>
                  : <div className="text-[10px] text-[#F8FAFC]/35">{initState === 'ready' ? 'Онлайн' : initState === 'initializing' ? 'Подключение...' : ''}</div>}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleRetry} title="Обновить"
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                <RefreshCw size={13} />
              </button>
              <button onClick={() => setIsOpen(false)} title="Закрыть"
                className="p-1.5 rounded-lg hover:bg-white/10 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-all">
                <X size={15} />
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex gap-1.5 px-3 py-2 border-b border-[rgba(123,63,191,0.15)] overflow-x-auto flex-shrink-0">
            <button onClick={() => handleSend('Обнови список точек сбора: найди новые города кандидатов, добавь в справочник и покажи актуальный список городов-точек сбора')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[#C9A84C]/25 bg-[#C9A84C]/5 text-[10px] text-[#C9A84C] whitespace-nowrap hover:bg-[#C9A84C]/12 transition-all flex-shrink-0">
              <MapPin size={10} /> Точки сбора
            </button>
            <button onClick={() => handleSend('Какие кандидаты сейчас без пункта сбора?')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-[10px] text-[#F8FAFC]/60 whitespace-nowrap hover:bg-[rgba(123,63,191,0.08)] transition-all flex-shrink-0">
              Без ПС
            </button>
            <button onClick={() => handleSend('Есть ли города кандидатов, которых нет в справочнике?')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-[10px] text-[#F8FAFC]/60 whitespace-nowrap hover:bg-[rgba(123,63,191,0.08)] transition-all flex-shrink-0">
              Новые города
            </button>
            <button onClick={() => handleSend('Покажи открытые тикеты от менеджеров')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-[10px] text-[#F8FAFC]/60 whitespace-nowrap hover:bg-[rgba(123,63,191,0.08)] transition-all flex-shrink-0">
              Тикеты
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-3">
            {initState !== 'ready' ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <Loader2 size={20} className="animate-spin text-[#7B3FBF] mx-auto mb-2" />
                  <p className="text-xs text-[#F8FAFC]/40">Подключение к диспетчеру...</p>
                </div>
              </div>
            ) : (
              <DispatchDashboard />
            )}
          </div>

          <div className="border-t border-[rgba(123,63,191,0.15)] p-3">
            <div className="flex items-end gap-2">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Вопрос..."
                rows={1}
                className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-xl px-3 py-2 text-xs text-[#F8FAFC] placeholder:text-[#F8FAFC]/25 focus:outline-none focus:border-[#7B3FBF] resize-none max-h-24"
                style={{ minHeight: '36px' }}
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim() || sending}
                className="flex items-center justify-center w-9 h-9 rounded-xl bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
                {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}