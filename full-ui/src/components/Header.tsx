import { Bell } from "lucide-react";
import { useEffect, useState } from "react";
import { notificationsAPI } from "../services/api";
import { useUser } from "../contexts/UserContext";
import type { Notification } from "../services/api";

interface HeaderProps {
  userName: string;
  userAvatar: string;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
}

export function Header({ userName, userAvatar, onNotificationsClick, onProfileClick }: HeaderProps) {
  const { user } = useUser();
  const [unreadCount, setUnreadCount] = useState<number>(0);
  // Page-only UX: no dropdown. Keep just a red badge count.

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user?.id) { setUnreadCount(0); return; }
      const count = await notificationsAPI.getUnreadCount(user.id);
      if (!cancelled) setUnreadCount(count);
    }
    load();
    // Basic polling every 60s; can be replaced with realtime later
    const t = setInterval(load, 60000);
    return () => { cancelled = true; clearInterval(t); };
  }, [user?.id]);

  // No dropdown handlers needed for page-only flow

  return (
    <div className="bg-gradient-to-r from-blue-900/50 to-gray-900 border-b border-white/10">
      <div className="px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-gray-400 text-sm mb-1">Good Evening,</p>
            <h1 className="text-white text-xl font-bold">{userName}</h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={onNotificationsClick}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell size={18} className="text-gray-300" />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </div>
              )}
            </button>
            
            <button 
              onClick={onProfileClick}
              className="relative"
            >
              <img 
                src={userAvatar}
                alt="User avatar"
                className="w-11 h-11 rounded-full object-cover"
              />
              <div className="absolute -inset-0.5 rounded-full border-2 border-blue-500"></div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}