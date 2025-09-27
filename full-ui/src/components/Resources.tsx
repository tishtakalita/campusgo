import React, { useState, useEffect } from "react";
import { ArrowLeft, Search, Book, PlayCircle, FileText, Link, Filter, Plus, Download, ExternalLink, Eye, Calendar, User } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useUser } from "../contexts/UserContext";
import { resourcesAPI, Resource } from "../services/api";

interface ResourcesProps {
  onBack: () => void;
  onUploadResource?: () => void;
}

export function Resources({ onBack, onUploadResource }: ResourcesProps) {
  const { resources, classes, courses } = useData();
  const { user } = useUser();
  const [activeFilter, setActiveFilter] = useState<'all' | 'document' | 'video' | 'link' | 'image' | 'other'>('all');
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResources, setApiResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(false);

  // Load resources from API on component mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      setLoading(true);
      const response = await resourcesAPI.getAllResources();
      if (response.success && response.data?.resources) {
        setApiResources(response.data.resources);
      }
    } catch (error) {
      console.error("Error loading resources:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (resource: Resource) => {
    try {
      // Track download
      await resourcesAPI.trackDownload(resource.id);
      
      // Open file URL
      if (resource.file_url) {
        window.open(resource.file_url, '_blank');
      } else if (resource.external_url) {
        window.open(resource.external_url, '_blank');
      }
    } catch (error) {
      console.error("Error tracking download:", error);
    }
  };

  // Use API resources or fallback to context data
  const allResources = apiResources.length > 0 ? apiResources : resources;
  
  // Filter resources based on user role
  const userResources = user?.role === 'faculty' 
    ? allResources.filter(resource => {
        if (resource.course_id) {
          // For API resources, check course_id
          return courses?.some(course => course.id === resource.course_id);
        } else {
          // For legacy resources, check classId
          const resourceClass = classes.find(cls => cls.id === resource.classId);
          return resourceClass && user.facultySubjects?.includes(resourceClass.name);
        }
      })
    : allResources; // Students see all resources

  const getIcon = (type: string) => {
    switch (type) {
      case "notes": return FileText;
      case "video": return PlayCircle;
      case "link": return Link;
      case "document": return Book;
      default: return Book;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "notes": return "text-blue-500";
      case "video": return "text-red-500";
      case "link": return "text-green-500";
      case "document": return "text-purple-500";
      default: return "text-gray-500";
    }
  };

  const getClassName = (classId: string) => {
    return classes.find(cls => cls.id === classId)?.name || 'Unknown Class';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const filteredResources = userResources.filter(resource => 
    (activeFilter === 'all' || resource.type === activeFilter) &&
    (searchQuery === '' || 
     resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
     resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  );

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-3"
          >
            <ArrowLeft size={20} className="text-white" />
            <h1 className="text-white text-xl font-bold">Resources ({allResources.length})</h1>
          </button>
          
          {user?.role === 'faculty' && onUploadResource && (
            <button
              onClick={onUploadResource}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Upload
            </button>
          )}
        </div>
        
        <div className="relative mb-4">
          <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search resources..."
            className="w-full bg-gray-800 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
        </div>
        
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'All' },
            { key: 'notes', label: 'Notes' },
            { key: 'video', label: 'Videos' },
            { key: 'link', label: 'Links' },
            { key: 'document', label: 'Documents' }
          ].map((filter) => (
            <button
              key={filter.key}
              onClick={() => setActiveFilter(filter.key as any)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
                activeFilter === filter.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-5 space-y-3">
        {filteredResources.length === 0 ? (
          <div className="text-center py-12">
            <Book className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Resources Found</h3>
            <p className="text-gray-400 text-sm">
              {searchQuery ? 'Try adjusting your search terms' : 'No resources available yet'}
            </p>
          </div>
        ) : (
          filteredResources.map((resource) => {
            const IconComponent = getIcon(resource.type);
            const iconColor = getIconColor(resource.type);
            
            return (
              <div key={resource.id} className="p-4 bg-gray-800 rounded-2xl border border-white/10">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <IconComponent size={18} className={iconColor} />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="text-white font-semibold mb-1">{resource.title}</h3>
                        <p className="text-gray-400 text-sm mb-2">{getClassName(resource.classId)}</p>
                      </div>
                      <button
                        onClick={() => handleDownload(resource)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                        <span>Download</span>
                      </button>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{resource.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      <span>By {resource.uploadedBy}</span>
                      <span>•</span>
                      <span>{formatDate(resource.uploadDate)}</span>
                    </div>
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}