import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { Send, Loader2, Sparkles, RefreshCw, Ticket, AlertCircle, Zap, MapPin } from 'lucide-react';
import MessageBubble from '@/components/admin/AssistantMessage';

const AGENT_NAME = 'crm_helper';

const SUGGESTED_PROMPTS = [
  'Какие кандидаты сейчас без пункта сбора?',
  'Как добавить нового кандидата в CRM?',
  'Какие условия программы по зарплате и выплатам?',
  'Покажи открытые тикеты от менеджеров',
  'Есть ли города кандидатов, которых нет в справочнике?',
  'Как отправить анкету кандидату?',
];

export default function Assistant() {
  const [conversation, setConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const initConversation = useCallback(async () => {
    setLoading(true);
    setError(null);
    setFallbackMode(false);
    try {
      const existing = await base44.agents.listConversations({ agent_name: AGENT_NAME });
      let conv = existing && existing.length > 0 ? existing[0] : null;
      if (!conv) {
        conv = await base44.agents.createConversation({
          agent_name: AGENT_NAME,
          metadata: { name: 'CRM Helper Chat' },
        });
      }
      setConversation(conv);
      setMessages(conv.messages || []);

      const unsubscribe = base44.agents.subscribeToConversation(conv.id, (data) => {
        setMessages(data.messages || []);
        setSending(false);
      });

      return () => unsubscribe();
    } catch (e) {
      setError(e.message || 'Не удалось инициализировать диалог');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let cleanup;
    initConversation().then(fn => { cleanup = fn; });
    base44.auth.me().then(u => setUserRole(u.role)).catch(() => {});
    return () => { if (cleanup) cleanup(); };
  }, [initConversation]);

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
    const content = text || input.trim();
    if (!content || sending) return;

    setMessages(prev => [...prev, { role: 'user', content }]);
    setSending(true);
    setInput('');

    if (conversation && !fallbackMode) {
      try {
        await base44.agents.addMessage(conversation, { role: 'user', content });
        return;
      } catch (e) {
        setFallbackMode(true);
      }
    }

    try {
      const response = await sendViaLLM(content);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (e) {
      setError(e.message || 'Ошибка отправки');
      setMessages(prev => [...prev, { role: 'assistant', content: '⚠️ ИИ временно недоступен. Попробуйте обновить страницу.' }]);
    }
    setSending(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
      <Loader2 size={28} className="animate-spin text-[#7B3FBF]" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
        <h1 className="text-lg font-bold text-white mb-2">Ошибка</h1>
        <p className="text-[#F8FAFC]/50 text-sm mb-4">{error}</p>
        <button onClick={initConversation} className="px-5 py-2.5 rounded-lg bg-[#7B3FBF] text-white text-sm font-bold hover:bg-[#8B4FCF]">
          Повторить
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC] flex flex-col">
      {/* Header */}
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors">
              <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png" className="w-7 h-7 object-contain" alt="logo" />
            </Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-[#7B3FBF]/20 border border-[#7B3FBF]/40 flex items-center justify-center">
                <Sparkles size={14} className="text-[#7B3FBF]" />
              </div>
              <h1 className="text-sm font-bold text-[#F8FAFC]">ИИ-помощник CRM</h1>
              {fallbackMode && <span className="text-[10px] px-2 py-0.5 rounded bg-[#C9A84C]/15 text-[#C9A84C] border border-[#C9A84C]/30 flex items-center gap-1"><Zap size={9} /> Запасной режим</span>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/admin/tickets" className="flex items-center gap-2 px-3 py-2 text-xs rounded border border-[rgba(123,63,191,0.25)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <Ticket size={13}/> Тикеты
            </Link>
            <button onClick={initConversation} title="Новый диалог"
              className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <RefreshCw size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/50">
        <div className="max-w-4xl mx-auto px-6 py-2 flex gap-2 overflow-x-auto">
          <button onClick={() => handleSend('Обнови список точек сбора: найди новые города кандидатов, добавь в справочник и покажи актуальный список городов-точек сбора')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#C9A84C]/25 bg-[#C9A84C]/5 text-xs text-[#C9A84C] whitespace-nowrap hover:bg-[#C9A84C]/12 transition-all flex-shrink-0">
            <MapPin size={12} /> Обновить точки сбора
          </button>
          <button onClick={() => handleSend('Какие кандидаты сейчас без пункта сбора?')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-xs text-[#F8FAFC]/60 whitespace-nowrap hover:bg-[rgba(123,63,191,0.08)] transition-all flex-shrink-0">
            Без пункта сбора
          </button>
          <button onClick={() => handleSend('Есть ли города кандидатов, которых нет в справочнике?')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-xs text-[#F8FAFC]/60 whitespace-nowrap hover:bg-[rgba(123,63,191,0.08)] transition-all flex-shrink-0">
            Новые города
          </button>
          <button onClick={() => handleSend('Покажи открытые тикеты от менеджеров')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-xs text-[#F8FAFC]/60 whitespace-nowrap hover:bg-[rgba(123,63,191,0.08)] transition-all flex-shrink-0">
            Открытые тикеты
          </button>
          <button onClick={() => handleSend('Какие кандидаты без обязательных документов?')}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-xs text-[#F8FAFC]/60 whitespace-nowrap hover:bg-[rgba(123,63,191,0.08)] transition-all flex-shrink-0">
            Без документов
          </button>
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-6 py-6">
          {messages.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-[#7B3FBF]/15 border border-[#7B3FBF]/30 flex items-center justify-center mx-auto mb-5">
                <Sparkles size={28} className="text-[#7B3FBF]" />
              </div>
              <h2 className="text-lg font-bold text-[#F8FAFC] mb-2">CRM-помощник готов к работе</h2>
              <p className="text-sm text-[#F8FAFC]/40 max-w-md mx-auto mb-8">
                Задайте вопрос о работе CRM, условиях программы, кандидатах или логистике. Агент имеет доступ к актуальным данным системы.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-xl mx-auto">
                {SUGGESTED_PROMPTS.map((prompt, i) => (
                  <button key={i} onClick={() => handleSend(prompt)}
                    className="text-left px-4 py-3 rounded-xl border border-[rgba(123,63,191,0.2)] bg-[rgba(123,63,191,0.04)] text-sm text-[#F8FAFC]/70 hover:border-[#7B3FBF]/40 hover:bg-[rgba(123,63,191,0.08)] hover:text-[#F8FAFC] transition-all">
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-4 pb-4">
              {messages.map((msg, i) => (
                <MessageBubble key={i} message={msg} />
              ))}
              {sending && (
                <div className="flex justify-start">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm bg-[#0D1B3E] border border-[rgba(123,63,191,0.2)]">
                    <div className="flex items-center gap-2">
                      <Loader2 size={14} className="animate-spin text-[#7B3FBF]" />
                      <span className="text-xs text-[#F8FAFC]/50">Помощник анализирует данные CRM...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky bottom-0 z-40">
        <div className="max-w-4xl mx-auto px-6 py-4">
          <div className="flex items-end gap-3">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Введите вопрос для ИИ-помощника..."
              rows={1}
              className="flex-1 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-xl px-4 py-3 text-sm text-[#F8FAFC] placeholder:text-[#F8FAFC]/25 focus:outline-none focus:border-[#7B3FBF] resize-none max-h-32 transition-all"
              style={{ minHeight: '46px' }}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || sending}
              className="flex items-center justify-center w-11 h-11 rounded-xl bg-[#7B3FBF] text-white hover:bg-[#8B4FCF] transition-all disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0">
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
            </button>
          </div>
          <p className="text-xs text-[#F8FAFC]/25 mt-2 text-center">
            Агент использует актуальные данные CRM и базы знаний. Enter — отправить, Shift+Enter — новая строка.
          </p>
        </div>
      </div>
    </div>
  );
}