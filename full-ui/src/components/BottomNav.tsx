import React from "react";
import { Home, Calendar, MessageCircle, Folder, Lightbulb } from "lucide-react";

interface BottomNavProps {
  onChatClick: () => void;
  onHomeClick: () => void;
  onTimetableClick: () => void;
  onFilesClick: () => void;
  onIdeasClick: () => void;
  currentView: string;
}

export function BottomNav({ onChatClick, onHomeClick, onTimetableClick, onFilesClick, onIdeasClick, currentView }: BottomNavProps) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-t from-gray-900 to-gray-900/95 border-t border-white/10 pb-6 pt-3">
      <div className="flex items-center justify-around px-5">
        <button 
          onClick={onHomeClick}
          className="flex flex-col items-center p-2"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            currentView === 'dashboard' ? 'bg-blue-500/20' : ''
          }`}>
            <Home 
              size={20} 
              className={currentView === 'dashboard' ? 'text-blue-500' : 'text-gray-500'} 
            />
          </div>
        </button>
        
        <button 
          onClick={onTimetableClick}
          className="flex flex-col items-center p-2"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            currentView === 'timetable' ? 'bg-blue-500/20' : ''
          }`}>
            <Calendar 
              size={20} 
              className={currentView === 'timetable' ? 'text-blue-500' : 'text-gray-500'} 
            />
          </div>
        </button>
        
        <button 
          onClick={onChatClick}
          className="relative"
        >
          <div className="w-14 h-14 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center shadow-lg shadow-red-500/25 hover:shadow-red-500/40 transition-shadow">
            <MessageCircle size={22} className="text-white" />
          </div>
        </button>
        
        <button 
          onClick={onFilesClick}
          className="flex flex-col items-center p-2"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            currentView === 'files' ? 'bg-blue-500/20' : ''
          }`}>
            <Folder 
              size={20} 
              className={currentView === 'files' ? 'text-blue-500' : 'text-gray-500'} 
            />
          </div>
        </button>
        
        <button 
          onClick={onIdeasClick}
          className="flex flex-col items-center p-2"
        >
          <div className={`w-11 h-11 rounded-full flex items-center justify-center ${
            currentView === 'ideas' ? 'bg-blue-500/20' : ''
          }`}>
            <Lightbulb 
              size={20} 
              className={currentView === 'ideas' ? 'text-blue-500' : 'text-gray-500'} 
            />
          </div>
        </button>
      </div>
      
      <div className="w-32 h-1 bg-white/30 rounded-full mx-auto mt-2"></div>
    </div>
  );
}