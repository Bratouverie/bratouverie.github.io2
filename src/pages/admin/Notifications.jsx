import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Bell, Check, Trash2, RefreshCw, CheckCheck } from 'lucide-react';

const CATEGORY_LABELS = {
  card: 'Карточка',
  form: 'Анкета',
  status: 'Статус',
};

const CATEGORY_COLORS = {
  card: 'border-[#7B3FBF]/30 text-[#7B3FBF]',
  form: 'border-[#C9A84C]/30 text-[#C9A84C]',
  status: 'border-green-500/30 text-green-400',
};

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [userRole, setUserRole] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const items = await base44.entities.Notification.list('-created_date', 200);
      // Фильтруем уведомления для модератора/менеджера: видны только кандидаты из их агентства
      const user = await base44.auth.me();
      if (user?.role !== 'admin' && user?.agency_id) {
        const filtered = items.filter(n => !n.agency_id || n.agency_id === user.agency_id || n.category === 'form');
        setNotifications(filtered);
      } else {
        setNotifications(items);
      }
      setUserRole(user?.role);
    } catch (_) {}
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
    const unsubscribe = base44.entities.Notification.subscribe(() => load());
    return unsubscribe;
  }, [load]);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.is_read);
    if (!unread.length) return;
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { is_read: true })));
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  const deleteNotification = async (id) => {
    await base44.entities.Notification.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const filtered = filter === 'unread' ? notifications.filter(n => !n.is_read) : notifications;
  const unreadCount = notifications.filter(n => !n.is_read).length;

  const fmtDate = (d) => {
    if (!d) return '';
    const date = new Date(d);
    return date.toLocaleDateString('ru-RU') + ' ' + date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
  };

  const inp = "px-3 py-2 bg-[rgba(255,255,255,0.04)] border border-[rgba(123,63,191,0.2)] rounded-lg text-sm text-[#F8FAFC] focus:outline-none focus:border-[#7B3FBF]";

  return (
    <div className="min-h-screen bg-[#05070A] text-[#F8FAFC]">
      {/* Header */}
      <div className="border-b border-[rgba(123,63,191,0.15)] bg-[#05070A]/90 backdrop-blur-xl sticky top-0 z-40">
        <div className="max-w-[1000px] mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center gap-2 text-[#F8FAFC]/50 hover:text-[#F8FAFC] transition-colors">
              <img src="https://media.base44.com/images/public/user_69f4a60c5f6a1719d380566c/86d4247bb_2_2.png" className="w-7 h-7 object-contain" alt="logo" />
            </Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <Link to="/admin/candidates" className="text-sm text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-colors">CRM</Link>
            <span className="text-[rgba(123,63,191,0.4)]">/</span>
            <h1 className="text-sm font-bold text-[#F8FAFC]">Уведомления</h1>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-[#C9A84C]/20 text-[#C9A84C] text-xs font-bold">{unreadCount} новых</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={load} title="Обновить"
              className="p-2 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all">
              <RefreshCw size={14} />
            </button>
            {unreadCount > 0 && (
              <button onClick={markAllRead}
                className="flex items-center gap-2 px-4 py-2 text-xs rounded border border-[rgba(123,63,191,0.25)] text-[#7B3FBF] hover:bg-[#7B3FBF]/10 transition-all">
                <CheckCheck size={13} /> Прочитать все
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-6 py-6">
        {/* Filter */}
        <div className="flex gap-3 mb-4">
          <button onClick={() => setFilter('all')}
            className={`px-4 py-2 text-xs rounded border transition-all ${filter === 'all' ? 'border-[#7B3FBF]/50 text-[#7B3FBF] bg-[#7B3FBF]/10' : 'border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/40 hover:text-[#F8FAFC]'}`}>
            Все ({notifications.length})
          </button>
          <button onClick={() => setFilter('unread')}
            className={`px-4 py-2 text-xs rounded border transition-all ${filter === 'unread' ? 'border-[#C9A84C]/50 text-[#C9A84C] bg-[#C9A84C]/10' : 'border-[rgba(255,255,255,0.1)] text-[#F8FAFC]/40 hover:text-[#F8FAFC]'}`}>
            Непрочитанные ({unreadCount})
          </button>
        </div>

        {/* List */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-8 h-8 border-4 border-[#7B3FBF]/30 border-t-[#7B3FBF] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <Bell size={32} className="text-[#F8FAFC]/15 mx-auto mb-3" />
            <p className="text-[#F8FAFC]/30 text-sm">Нет уведомлений</p>
          </div>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => (
              <div key={n.id}
                className={`glass-card rounded-xl p-4 transition-all ${n.is_read ? 'opacity-50' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold border ${CATEGORY_COLORS[n.category] || 'border-[#F8FAFC]/20 text-[#F8FAFC]/40'}`}>
                    {CATEGORY_LABELS[n.category] || n.category || '—'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-bold text-[#F8FAFC]">{n.candidate_name || '—'}</span>
                      {n.agency_name && <span className="text-xs text-[#F8FAFC]/35">· {n.agency_name}</span>}
                    </div>
                    <div className="text-xs text-[#F8FAFC]/55 whitespace-pre-wrap">{n.message}</div>
                    <div className="text-xs text-[#F8FAFC]/25 mt-1.5">{fmtDate(n.created_date)}</div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {n.link && (
                      <Link to={n.link} title="Открыть"
                        className="p-1.5 rounded hover:bg-[#7B3FBF]/20 text-[#F8FAFC]/50 hover:text-[#7B3FBF] transition-all">
                        <Bell size={13} />
                      </Link>
                    )}
                    {!n.is_read && (
                      <button onClick={() => markRead(n.id)} title="Отметить прочитанным"
                        className="p-1.5 rounded hover:bg-green-500/20 text-[#F8FAFC]/50 hover:text-green-400 transition-all">
                        <Check size={13} />
                      </button>
                    )}
                    <button onClick={() => deleteNotification(n.id)} title="Удалить"
                      className="p-1.5 rounded hover:bg-red-500/20 text-[#F8FAFC]/50 hover:text-red-400 transition-all">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}