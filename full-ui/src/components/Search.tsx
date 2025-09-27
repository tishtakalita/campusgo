import React, { useState } from "react";
import { ArrowLeft, Search as SearchIcon, Book, Calendar, User } from "lucide-react";

interface SearchProps {
  onBack: () => void;
}

export function Search({ onBack }: SearchProps) {
  const [query, setQuery] = useState("");

  const searchResults = [
    { id: 1, type: "assignment", title: "Neural Network Implementation", subtitle: "Deep Learning Course" },
    { id: 2, type: "class", title: "Machine Learning Fundamentals", subtitle: "Today 2:00 PM" },
    { id: 3, type: "instructor", title: "Dr. Sarah Chen", subtitle: "Computer Science Department" }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "assignment": return Book;
      case "class": return Calendar;
      case "instructor": return User;
      default: return SearchIcon;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 mb-4"
        >
          <ArrowLeft size={20} className="text-white" />
          <h1 className="text-white text-xl font-bold">Search</h1>
        </button>
        
        <div className="relative">
          <SearchIcon size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search assignments, classes, instructors..."
            className="w-full bg-gray-800 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        {searchResults.map((result) => {
          const IconComponent = getIcon(result.type);
          return (
            <button key={result.id} className="w-full p-4 bg-gray-800 rounded-2xl border border-white/10 flex items-center gap-4 hover:bg-gray-700 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <IconComponent size={18} className="text-gray-300" />
              </div>
              <div className="flex-1 text-left">
                <h3 className="text-white font-semibold">{result.title}</h3>
                <p className="text-gray-400 text-sm">{result.subtitle}</p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}