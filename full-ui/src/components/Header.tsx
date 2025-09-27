import React from "react";
import { Search, Bell, User } from "lucide-react";

interface HeaderProps {
  userName: string;
  userAvatar: string;
  onSearchClick: () => void;
  onNotificationsClick: () => void;
  onProfileClick: () => void;
}

export function Header({ userName, userAvatar, onSearchClick, onNotificationsClick, onProfileClick }: HeaderProps) {
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
              onClick={onSearchClick}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
            >
              <Search size={18} className="text-gray-300" />
            </button>
            
            <button 
              onClick={onNotificationsClick}
              className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors relative"
            >
              <Bell size={18} className="text-gray-300" />
              <div className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-blue-900"></div>
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