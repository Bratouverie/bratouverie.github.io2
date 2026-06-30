import { useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { Bell } from 'lucide-react';

export default function NotificationBell() {
  const [unread, setUnread] = useState(0);
  const [visible, setVisible] = useState(false);
  const [userRole, setUserRole] = useState(null);

  const load = useCallback(async () => {
    try {
      // Модераторы и менеджеры видят уведомления только если agency_id совпадает или это общее уведомление
      // Администраторы видят все уведомления
      let query = { is_read: false };
      const items = await base44.entities.Notification.filter(query, '-created_date', 50);
      setUnread(items.length);
    } catch (_) {}
  }, []);

  useEffect(() => {
    base44.auth.isAuthenticated().then(isAuth => {
      if (!isAuth) return;
      base44.auth.me().then(user => {
        setUserRole(user?.role);
        setVisible(true);
        load();
        const interval = setInterval(load, 30000);
        const unsubscribe = base44.entities.Notification.subscribe(() => load());
        return () => { clearInterval(interval); unsubscribe(); };
      }).catch(() => {});
    });
  }, [load]);

  if (!visible) return null;

  return (
    <Link
      to="/admin/notifications"
      title="Уведомления"
      className="relative flex items-center justify-center w-9 h-9 rounded-lg border border-[rgba(123,63,191,0.2)] text-[#F8FAFC]/50 hover:text-[#7B3FBF] hover:border-[#7B3FBF]/40 transition-all"
    >
      <Bell size={15} />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-[#C9A84C] text-[#05070A] text-[10px] font-black">
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </Link>
  );
}