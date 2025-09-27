import React, { useState } from "react";
import { X, Send, Sparkles } from "lucide-react";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: string;
}

interface AIChatProps {
  onClose: () => void;
}

export function AIChat({ onClose }: AIChatProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "Hello! I'm your AI study assistant. How can I help you today? I can assist with assignments, schedule questions, study tips, and more!",
      sender: "ai",
      timestamp: "Just now"
    }
  ]);
  const [inputText, setInputText] = useState("");

  const sendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: "user", 
      timestamp: "Just now"
    };

    setMessages(prev => [...prev, userMessage]);
    const currentInput = inputText;
    setInputText("");

    // Simulate AI response
    setTimeout(() => {
      let responseText = "I understand you're asking about \"" + currentInput + "\". ";
      
      if (currentInput.toLowerCase().includes('assignment')) {
        responseText += "I can see you have several upcoming assignments. Would you like me to help you prioritize them or provide study tips for any specific subject?";
      } else if (currentInput.toLowerCase().includes('schedule') || currentInput.toLowerCase().includes('class')) {
        responseText += "Based on your timetable, your next class is Machine Learning Fundamentals. Would you like me to show you the details or help you prepare?";
      } else if (currentInput.toLowerCase().includes('help') || currentInput.toLowerCase().includes('study')) {
        responseText += "I'm here to help! I can assist with study planning, assignment organization, concept explanations, and answering questions about your courses.";
      } else {
        responseText += "Let me help you with that. Feel free to ask me about your assignments, schedule, study materials, or any course-related questions!";
      }

      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: "ai",
        timestamp: "Just now"
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end">
      <div className="w-full h-[90vh] bg-gradient-to-b from-blue-900/20 to-gray-900 rounded-t-3xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-red-600 to-red-500 flex items-center justify-center">
                <Sparkles size={16} className="text-white" />
              </div>
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900"></div>
            </div>
            <div>
              <h2 className="text-white font-bold text-lg">AI Study Assistant</h2>
              <p className="text-gray-400 text-sm">Online • Ready to help</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
          >
            <X size={18} className="text-gray-300" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                  message.sender === 'user' 
                    ? 'bg-blue-600 text-white rounded-br-lg' 
                    : 'bg-gray-800 text-white border border-white/10 rounded-bl-lg'
                }`}
              >
                <p className="text-sm leading-relaxed mb-1">{message.text}</p>
                <p className="text-xs opacity-60 text-right">{message.timestamp}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
        <div className="p-5 border-t border-white/10">
          <div className="flex items-end gap-3 bg-gray-800 rounded-3xl px-4 py-2 border border-white/10">
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Ask me anything about your studies..."
              className="flex-1 bg-transparent text-white placeholder-gray-500 resize-none min-h-[40px] max-h-24 outline-none"
              rows={1}
            />
            <button 
              onClick={sendMessage}
              disabled={!inputText.trim()}
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                inputText.trim() 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400' 
                  : 'bg-gray-700'
              }`}
            >
              <Send size={16} className="text-white" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}