import React, { useEffect, useState } from "react";
import { ArrowLeft, Bell, CheckCircle } from "lucide-react";
import { notificationsAPI, type Notification } from "../services/api";
import { useUser } from "../contexts/UserContext";

interface NotificationsProps {
  onBack: () => void;
}

export function Notifications({ onBack }: NotificationsProps) {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) { setNotifications([]); setLoading(false); return; }
      setLoading(true);
      const res = await notificationsAPI.list(user.id);
      if (!cancelled) {
        if (!res.error && res.data?.notifications) {
          setNotifications(res.data.notifications);
        } else {
          setNotifications([]);
        }
        setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [user?.id]);

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 mb-4"
        >
          <ArrowLeft size={20} className="text-white" />
          <h1 className="text-white text-xl font-bold">Notifications</h1>
        </button>
      </div>
      
      <div className="p-5 space-y-4">
        {loading && (
          <div className="text-gray-400 text-sm">Loading notifications…</div>
        )}
        {!loading && notifications.length === 0 && (
          <div className="text-gray-400 text-sm">No notifications yet.</div>
        )}
        {!loading && notifications.map((n) => (
          <div key={n.id} className="p-4 bg-gray-800 rounded-xl border border-gray-700 hover:bg-gray-750 transition-colors">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center text-white flex-shrink-0">
                <Bell size={16} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-white font-medium truncate">{n.title}</h3>
                  {!n.is_read && <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />}
                </div>
                {n.message && <p className="text-gray-300 text-sm mt-1 truncate">{n.message}</p>}
                <p className="text-gray-500 text-xs mt-1">{new Date(n.created_at || '').toLocaleString()}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}