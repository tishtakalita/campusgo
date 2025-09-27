import React from "react";
import { ArrowLeft, FileText, Image, Film, Download } from "lucide-react";

interface FilesProps {
  onBack: () => void;
}

export function Files({ onBack }: FilesProps) {
  const files = [
    { id: 1, name: "ML_Assignment_Final.pdf", type: "pdf", size: "2.4 MB", date: "Today" },
    { id: 2, name: "Neural_Network_Code.py", type: "code", size: "156 KB", date: "Yesterday" },
    { id: 3, name: "Lecture_Notes_Week5.pdf", type: "pdf", size: "8.2 MB", date: "3 days ago" },
    { id: 4, name: "Dataset_Analysis.xlsx", type: "excel", size: "4.1 MB", date: "1 week ago" }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "pdf": return FileText;
      case "image": return Image;
      case "video": return Film;
      default: return FileText;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "pdf": return "text-red-500";
      case "image": return "text-green-500";
      case "video": return "text-purple-500";
      default: return "text-blue-500";
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
          <h1 className="text-white text-xl font-bold">Files</h1>
        </button>
      </div>
      
      <div className="p-5 space-y-3">
        {files.map((file) => {
          const IconComponent = getIcon(file.type);
          const iconColor = getIconColor(file.type);
          
          return (
            <div key={file.id} className="p-4 bg-gray-800 rounded-2xl border border-white/10 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                <IconComponent size={18} className={iconColor} />
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-sm">{file.name}</h3>
                <div className="flex items-center gap-3 mt-1">
                  <span className="text-gray-400 text-xs">{file.size}</span>
                  <span className="text-gray-500 text-xs">•</span>
                  <span className="text-gray-400 text-xs">{file.date}</span>
                </div>
              </div>
              <button className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center hover:bg-gray-600 transition-colors">
                <Download size={14} className="text-gray-300" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}