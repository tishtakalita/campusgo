import React from "react";
import { Calendar, Library, Users, MessageCircle, ArrowRight, CalendarDays, MessagesSquare } from "lucide-react";

interface QuickAccessProps {
  onTimetableClick: () => void;
  onResourcesClick: () => void;
  onChatClick: () => void;
  onProjectsClick: () => void;
  onCalendarClick: () => void;
  onMessagesClick: () => void;
}

export function QuickAccess({ onTimetableClick, onResourcesClick, onChatClick, onProjectsClick, onCalendarClick, onMessagesClick }: QuickAccessProps) {
  const quickAccessItems = [
    { 
      icon: Calendar, 
      label: "Timetable", 
      colors: "from-blue-700 to-blue-500", 
      onPress: onTimetableClick,
      description: "View schedule"
    },
    { 
      icon: CalendarDays, 
      label: "Calendar", 
      colors: "from-indigo-700 to-indigo-500", 
      onPress: onCalendarClick,
      description: "Events & dates"
    },
    { 
      icon: Library, 
      label: "Resources", 
      colors: "from-emerald-700 to-emerald-500", 
      onPress: onResourcesClick,
      description: "Study materials"
    },
    { 
      icon: Users, 
      label: "Projects", 
      colors: "from-purple-700 to-purple-500", 
      onPress: onProjectsClick,
      description: "Collaborate"
    },
    { 
      icon: MessagesSquare, 
      label: "Chat", 
      colors: "from-orange-700 to-orange-500", 
      onPress: onMessagesClick,
      description: "Message friends"
    },
    { 
      icon: MessageCircle, 
      label: "AI Chat", 
      colors: "from-red-700 to-red-500", 
      onPress: onChatClick,
      description: "Get help"
    }
  ];

  return (
    <div className="px-5 mb-6">
      <h2 className="text-white text-xl font-bold mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 gap-4">
        {quickAccessItems.slice(0, 4).map((item, index) => {
          const IconComponent = item.icon;
          return (
            <button 
              key={index}
              onClick={item.onPress}
              className="group"
            >
              <div className={`bg-gradient-to-br ${item.colors} rounded-2xl p-5 h-30 flex flex-col justify-between shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mb-3">
                  <IconComponent size={24} className="text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white font-bold text-base mb-1">{item.label}</h3>
                  <p className="text-white/80 text-xs font-medium">{item.description}</p>
                </div>
                <div className="flex justify-end mt-2">
                  <ArrowRight size={14} className="text-white/70" />
                </div>
              </div>
            </button>
          );
        })}
      </div>
      
      {/* Calendar as a separate full-width item */}
      {quickAccessItems.length > 4 && (
        <div className="mt-4">
          <button 
            onClick={quickAccessItems[4].onPress}
            className="group w-full"
          >
            <div className={`bg-gradient-to-br ${quickAccessItems[4].colors} rounded-2xl p-4 flex items-center justify-between shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105`}>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
                  {React.createElement(quickAccessItems[4].icon, { size: 24, className: "text-white" })}
                </div>
                <div className="text-left">
                  <h3 className="text-white font-bold text-base">{quickAccessItems[4].label}</h3>
                  <p className="text-white/80 text-xs font-medium">{quickAccessItems[4].description}</p>
                </div>
              </div>
              <ArrowRight size={16} className="text-white/70" />
            </div>
          </button>
        </div>
      )}
    </div>
  );
}