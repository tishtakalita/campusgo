import React from "react";
import { Calendar, Library, Users, MessageCircle, ArrowRight } from "lucide-react";

interface QuickAccessProps {
  onTimetableClick: () => void;
  onResourcesClick: () => void;
  onChatClick: () => void;
  onProjectsClick: () => void;
}

export function QuickAccess({ onTimetableClick, onResourcesClick, onChatClick, onProjectsClick }: QuickAccessProps) {
  const quickAccessItems = [
    { 
      icon: Calendar, 
      label: "Timetable", 
      colors: "from-blue-700 to-blue-500", 
      onPress: onTimetableClick,
      description: "View schedule"
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
        {quickAccessItems.map((item, index) => {
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
    </div>
  );
}