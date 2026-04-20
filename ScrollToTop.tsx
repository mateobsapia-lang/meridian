import { useState, useRef, useEffect } from 'react';
import { Bell } from 'lucide-react';
import { useAppContext } from '../AppContext';
import { useNavigate } from 'react-router-dom';

const TYPE_ICON: Record<string, string> = {
  nda_request: '📋', nda_signed: '✅', dataroom_access: '🔓',
  ioi_received: '💼', deal_published: '🚀', deal_rejected: '❌'
};

export function NotificationBell() {
  const { notifications, unreadCount, markRead } = useAppContext();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleClick = async (n: typeof notifications[0]) => {
    await markRead(n.id);
    if (n.dealId) navigate(`/deal/${n.dealId}`);
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button onClick={() => setOpen(o => !o)} className="relative p-2 hover:bg-paper-mid rounded transition-colors">
        <Bell size={18} className="text-ink-soft" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 bg-accent text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-paper border border-border-strong shadow-2xl z-50">
          <div className="px-4 py-3 border-b border-border-subtle flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-ink-mute">Notificaciones</span>
            {unreadCount > 0 && <span className="text-[10px] text-accent font-mono">{unreadCount} nuevas</span>}
          </div>
          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-ink-mute text-sm">Sin notificaciones</div>
            ) : notifications.map(n => (
              <button key={n.id} onClick={() => handleClick(n)}
                className={`w-full text-left px-4 py-3 border-b border-border-subtle hover:bg-paper-mid transition-colors ${!n.read ? 'bg-accent-light/30' : ''}`}>
                <div className="flex items-start gap-2">
                  <span className="text-base">{TYPE_ICON[n.type] ?? '📌'}</span>
                  <div>
                    <div className="text-[12px] font-medium text-ink">{n.title}</div>
                    <div className="text-[11px] text-ink-mute mt-0.5">{n.message}</div>
                    <div className="text-[10px] text-ink-mute/60 font-mono mt-1">
                      {n.createdAt?.toDate?.()?.toLocaleString('es-AR', { dateStyle: 'short', timeStyle: 'short' }) ?? ''}
                    </div>
                  </div>
                  {!n.read && <span className="ml-auto w-2 h-2 rounded-full bg-accent shrink-0 mt-1"></span>}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
