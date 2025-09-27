import React, { useState } from "react";
import { ArrowLeft, Lightbulb, Plus, Star } from "lucide-react";

interface IdeasProps {
  onBack: () => void;
}

export function Ideas({ onBack }: IdeasProps) {
  const [ideas] = useState([
    {
      id: 1,
      title: "AI-Powered Study Scheduler",
      description: "Create an app that uses AI to optimize study schedules based on learning patterns",
      category: "AI/ML",
      starred: true
    },
    {
      id: 2,
      title: "Virtual Reality Classroom",
      description: "Immersive VR experience for remote learning and virtual lab experiments",
      category: "VR/AR",
      starred: false
    },
    {
      id: 3,
      title: "Blockchain Academic Records",
      description: "Secure, verifiable academic credentials using blockchain technology",
      category: "Blockchain",
      starred: true
    },
    {
      id: 4,
      title: "Smart Campus Navigation",
      description: "IoT-enabled campus navigation with real-time room availability",
      category: "IoT",
      starred: false
    }
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "AI/ML": return "bg-blue-600";
      case "VR/AR": return "bg-purple-600";
      case "Blockchain": return "bg-green-600";
      case "IoT": return "bg-orange-600";
      default: return "bg-gray-600";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-3"
          >
            <ArrowLeft size={20} className="text-white" />
            <h1 className="text-white text-xl font-bold">Ideas</h1>
          </button>
          <button className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <Plus size={18} className="text-white" />
          </button>
        </div>
      </div>
      
      <div className="p-5 space-y-4">
        {ideas.map((idea) => (
          <div key={idea.id} className="p-5 bg-gray-800 rounded-2xl border border-white/10">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <Lightbulb size={20} className="text-yellow-500 mt-1" />
                <div className="flex-1">
                  <h3 className="text-white font-bold text-lg mb-2">{idea.title}</h3>
                  <p className="text-gray-400 text-sm leading-relaxed">{idea.description}</p>
                </div>
              </div>
              <button>
                <Star 
                  size={18} 
                  className={idea.starred ? "text-yellow-500 fill-current" : "text-gray-400"} 
                />
              </button>
            </div>
            
            <div className="flex justify-between items-center mt-4">
              <span className={`px-3 py-1 rounded-full text-xs font-semibold text-white ${getCategoryColor(idea.category)}`}>
                {idea.category}
              </span>
              <button className="text-blue-500 text-sm font-medium hover:text-blue-400">
                Develop →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}