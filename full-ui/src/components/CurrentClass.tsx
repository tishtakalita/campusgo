import React from "react";
import { MapPin, User, Clock } from "lucide-react";

interface CurrentClassProps {
  className: string;
  room: string;
  instructor: string;
  timeRemaining: string;
}

export function CurrentClass({ className, room, instructor, timeRemaining }: CurrentClassProps) {
  return (
    <div className="px-5 mb-6">
      <div className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-2xl p-5 shadow-xl shadow-blue-500/20">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider mb-1">Current Class</p>
            <h2 className="text-white text-lg font-bold leading-tight">{className}</h2>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-4 h-4 bg-white rounded-full opacity-30 animate-pulse"></div>
              <div className="absolute inset-0 w-2 h-2 bg-white rounded-full m-1"></div>
            </div>
            <span className="text-white text-xs font-bold tracking-wider">LIVE</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <MapPin size={12} className="text-blue-100" />
            </div>
            <span className="text-blue-100 text-sm font-medium">{room}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <User size={12} className="text-blue-100" />
            </div>
            <span className="text-blue-100 text-sm font-medium">{instructor}</span>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center">
              <Clock size={12} className="text-blue-100" />
            </div>
            <span className="text-white text-sm font-semibold">{timeRemaining}</span>
          </div>
        </div>
        
        <div className="mt-4">
          <div className="h-1 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full w-[65%] bg-white rounded-full"></div>
          </div>
        </div>
      </div>
    </div>
  );
}