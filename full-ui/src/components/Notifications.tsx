import React from "react";
import { ArrowLeft, Bell, CheckCircle } from "lucide-react";

interface NotificationsProps {
  onBack: () => void;
}

export function Notifications({ onBack }: NotificationsProps) {
  const notifications = [
    {
      id: 1,
      title: "Assignment Due Tomorrow",
      message: "Neural Network Implementation is due tomorrow",
      time: "2 hours ago",
      unread: true
    },
    {
      id: 2,
      title: "Class Starting Soon",
      message: "Machine Learning Fundamentals starts in 30 minutes",
      time: "25 minutes ago",
      unread: true
    },
    {
      id: 3,
      title: "Grade Posted",
      message: "Your Computer Vision assignment has been graded",
      time: "1 day ago",
      unread: false
    }
  ];

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
        {notifications.map((notification) => (
          <div key={notification.id} className="p-4 bg-gray-800 rounded-2xl border border-white/10">
            <div className="flex items-start gap-3">
              <div className={`w-2 h-2 rounded-full mt-2 ${notification.unread ? 'bg-blue-500' : 'bg-gray-600'}`}></div>
              <div className="flex-1">
                <h3 className="text-white font-semibold mb-1">{notification.title}</h3>
                <p className="text-gray-400 text-sm mb-2">{notification.message}</p>
                <p className="text-gray-500 text-xs">{notification.time}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}