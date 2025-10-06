import { useState, useEffect } from "react";
import { ArrowLeft, Search, Book, PlayCircle, FileText, Link, Image as ImageIcon, SlidersHorizontal, Plus, Eye, BookOpen, Megaphone, FolderOpen, Pencil, Trash2, X } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useUser } from "../contexts/UserContext";
import { resourcesAPI, Resource } from "../services/api";

interface ResourcesProps {
  onBack: () => void;
  onUploadResource?: () => void;
}

export function Resources({ onBack, onUploadResource }: ResourcesProps) {
  const { resources, classes } = useData();
  const { user } = useUser();
  const [activeCategory, setActiveCategory] = useState<'syllabus' | 'announcements' | 'materials'>('materials');
  const [searchQuery, setSearchQuery] = useState("");
  const [apiResources, setApiResources] = useState<Resource[]>([]);
  const [typeFilter, setTypeFilter] = useState<'all' | 'video' | 'image' | 'link' | 'document' | 'slides'>('all');
  // Show all relevant resources without a toggle; backend handles scoping for faculty
  const [busyId, setBusyId] = useState<string | null>(null);
  const [editing, setEditing] = useState<any | null>(null);
  const [editData, setEditData] = useState<{ title: string; description: string; resource_type: 'document'|'video'|'link'|'image'|'slides'|'other'; category: 'syllabus'|'announcements'|'materials'; class?: string; external_url?: string; file_url?: string; tags: string[] }>({
    title: '',
    description: '',
    resource_type: 'document',
    category: 'materials',
    class: '',
    external_url: '',
    file_url: '',
    tags: []
  });
  const [newTag, setNewTag] = useState("");

  // Load resources from API on component mount
  useEffect(() => {
    loadResources();
  }, []);

  const loadResources = async () => {
    try {
      console.log('Loading resources from API...');
      const response = await resourcesAPI.getAllResources();
      
      if (!response.error && response.data?.resources) {
        console.log('✅ Resources loaded:', response.data.resources.length);
        setApiResources(response.data.resources);
      } else {
        console.error('❌ Failed to load resources:', response.error);
      }
    } catch (error) {
      console.error("Error loading resources:", error);
    }
  };

  const handleDownload = async (resource: any) => {
    try {
      // Track download
      await resourcesAPI.trackDownload(resource.id);
      
      // Open file URL - handle both API structure and legacy structure
      const fileUrl = resource.file_url || resource.url;
      const externalUrl = resource.external_url;
      
      if (fileUrl && fileUrl !== null) {
        console.log('Opening file URL:', fileUrl);
        window.open(fileUrl, '_blank');
      } else if (externalUrl && externalUrl !== null) {
        console.log('Opening external URL:', externalUrl);
        window.open(externalUrl, '_blank');
      } else {
        alert('No download link available for this resource');
        console.warn('No download URL found for resource:', resource);
      }
    } catch (error) {
      console.error("Error downloading resource:", error);
      alert('Download failed. Please try again.');
    }
  };

  // Transform API resources to match expected structure; now category is explicit from backend
  const transformApiResource = (apiResource: any) => {
    const explicitCategory = apiResource.category || 'materials';
    const uploadedBy = apiResource.uploader?.first_name
      ? `${apiResource.uploader.first_name}${apiResource.uploader.last_name ? ' ' + apiResource.uploader.last_name : ''}`
      : (apiResource.uploaded_by || apiResource.uploaded_by_name || '');
    const courseName = apiResource.courses?.name || '';
    const courseCode = apiResource.courses?.code || '';
    return {
      id: apiResource.id,
      uploaded_by: apiResource.uploaded_by,
      class: apiResource.class,
      title: apiResource.title,
      // normalize to a simple type key we use for icons and filters
      type: apiResource.resource_type === 'video' ? 'video' :
            apiResource.resource_type === 'link' ? 'link' :
            apiResource.resource_type === 'image' ? 'image' :
            apiResource.resource_type === 'slides' ? 'slides' : 'document',
      category: explicitCategory,
      url: apiResource.file_url || apiResource.external_url || '#',
      description: apiResource.description || '',
      classId: apiResource.course_id || '1',
      course_id: apiResource.course_id,
      uploadedBy,
      course_name: courseName,
      course_code: courseCode,
      uploadDate: apiResource.created_at ? apiResource.created_at.split('T')[0] : '2025-09-01',
      tags: apiResource.tags || [],
      file_url: apiResource.file_url,
      external_url: apiResource.external_url,
      download_count: apiResource.download_count || 0
    };
  };

  // Add category to legacy resources from context (fallback only)
  const addCategoryToResource = (resource: any) => {
    const title = resource.title.toLowerCase();
    const tags = (resource.tags || []).map((tag: string) => tag.toLowerCase());
    
    let category = 'materials'; // default
    if (title.includes('syllabus') || title.includes('curriculum') || tags.includes('syllabus')) {
      category = 'syllabus';
    } else if (title.includes('announcement') || title.includes('notice') || tags.includes('announcement') || tags.includes('notice')) {
      category = 'announcements';
    }
    
    return { ...resource, category };
  };

  // Use API resources or fallback to context data
  const transformedApiResources = apiResources.map(transformApiResource);
  const contextResourcesWithCategory = resources.map(addCategoryToResource);
  const allResources = transformedApiResources.length > 0 ? transformedApiResources : contextResourcesWithCategory;
  
  // Always show the unified list from backend (which for faculty already includes their uploads and their courses' resources)
  const userResources = allResources;

  const getIcon = (type: string) => {
    switch (type) {
      case "document": return FileText;
      case "video": return PlayCircle;
      case "link": return Link;
      case "image": return ImageIcon;
      case "slides": return FileText;
      case "notes": return FileText; // legacy type maps to document icon
      default: return Book;
    }
  };

  const getIconColor = (type: string) => {
    switch (type) {
      case "document": return "text-blue-500";
      case "video": return "text-red-500";
      case "link": return "text-green-500";
      case "image": return "text-purple-500";
      case "slides": return "text-yellow-500";
      case "notes": return "text-blue-500"; // legacy type
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

  const filteredResources = userResources.filter((resource: any) => {
    const matchesCategory = resource.category === activeCategory;
    const matchesSearch = (searchQuery === '' ||
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.tags && resource.tags.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase())))
    );
    const matchesType = typeFilter === 'all' || resource.type === typeFilter || (typeFilter === 'document' && resource.type === 'notes');
    return matchesCategory && matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <button 
            onClick={onBack}
            className="flex items-center gap-3"
          >
            <ArrowLeft size={20} className="text-white" />
            <h1 className="text-white text-xl font-bold">
              {activeCategory === 'syllabus' ? 'Syllabus' :
               activeCategory === 'announcements' ? 'Announcements' :
               'Class Materials'} ({filteredResources.length})
            </h1>
          </button>
          
          {user?.role === 'faculty' && onUploadResource && (
            <button
              onClick={onUploadResource}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors shadow"
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
          {/* Removed My uploads toggle: faculty see both their uploads and their courses' resources */}
        </div>
        
  <div className="flex bg-gray-800 rounded-2xl p-1 mb-4">
          {[
            { key: 'syllabus', label: 'Syllabus', icon: BookOpen },
            { key: 'announcements', label: 'Announcements', icon: Megaphone },
            { key: 'materials', label: 'Class Materials', icon: FolderOpen }
          ].map((category) => {
            const IconComponent = category.icon;
            return (
              <button
                key={category.key}
                onClick={() => setActiveCategory(category.key as any)}
                className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-medium transition-colors ${
                  activeCategory === category.key
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <IconComponent size={16} />
                {category.label}
              </button>
            );
          })}
        </div>

        {/* Type filter row */}
  <div className="mt-6 mb-2 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-gray-300 mr-2">
            <SlidersHorizontal className="w-4 h-4" />
            <span className="text-sm">Type:</span>
          </div>
          {[ 
            { key: 'all', label: 'All' },
            { key: 'document', label: 'Document' },
            { key: 'slides', label: 'Slides' },
            { key: 'video', label: 'Video' },
            { key: 'image', label: 'Image' },
            { key: 'link', label: 'Link' }
          ].map(opt => (
            <button
              key={opt.key}
              onClick={() => setTypeFilter(opt.key as any)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border ${typeFilter === opt.key ? 'bg-blue-600 border-blue-500 text-white' : 'border-white/10 text-gray-300 hover:text-white'} mr-1`}
            >
              {opt.label}
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
            const courseLine = (resource.course_name || resource.course_code)
              ? `${resource.course_name || ''}${resource.course_code ? ` (${resource.course_code})` : ''}`
              : '';
            
            const isOwner = user?.id && (resource as any).uploaded_by === user.id;
            const isFaculty = user?.role === 'faculty';
            const isGlobal = !resource.course_id && (!resource.class || String(resource.class).trim() === '' || String(resource.class).toLowerCase() === 'null' || String(resource.class).toLowerCase() === 'none');
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
                        {courseLine && (
                          <p className="text-gray-400 text-sm mb-2">{courseLine}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {(isOwner || (isFaculty && isGlobal)) && (
                          <>
                            <button
                              onClick={() => {
                                setEditing(resource);
                                setEditData({
                                  title: resource.title,
                                  description: resource.description,
                                  resource_type: resource.type as any,
                                  category: resource.category,
                                  class: (resource as any).class,
                                  external_url: resource.external_url,
                                  file_url: resource.file_url,
                                  tags: resource.tags || []
                                });
                              }}
                              title="Edit"
                              className="p-2 rounded-md text-white hover:bg-white/10"
                            >
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button
                              disabled={busyId === resource.id}
                              onClick={async () => {
                                if (!confirm('Delete this resource?')) return;
                                try {
                                  setBusyId(resource.id);
                                  const resp = await resourcesAPI.deleteResource(resource.id);
                                  if (!resp.error) {
                                    setApiResources(prev => prev.filter(r => r.id !== resource.id));
                                  } else {
                                    alert(resp.error);
                                  }
                                } finally {
                                  setBusyId(null);
                                }
                              }}
                              title="Delete"
                              className={`p-2 rounded-md hover:bg-white/10 ${busyId === resource.id ? 'text-red-300' : 'text-white'}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDownload(resource)}
                          className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700 transition-colors shadow"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                          <span>View</span>
                        </button>
                      </div>
                    </div>
                    <p className="text-gray-300 text-sm mb-2">{resource.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-2">
                      {resource.uploadedBy ? <span>By {resource.uploadedBy}</span> : null}
                      {resource.uploadedBy ? <span>•</span> : null}
                      <span>{formatDate(resource.uploadDate)}</span>
                    </div>
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.map((tag: string, index: number) => (
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
      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 w-full max-w-xl rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Resource</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-white mb-1">Title</label>
                <input value={editData.title} onChange={e=>setEditData({...editData, title: e.target.value})} className="w-full bg-gray-700 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Description</label>
                <textarea value={editData.description} onChange={e=>setEditData({...editData, description: e.target.value})} className="w-full bg-gray-700 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-white mb-1">Type</label>
                  <select value={editData.resource_type} onChange={e=>setEditData({...editData, resource_type: e.target.value as any})} className="w-full bg-gray-700 border border-white/10 text-white rounded-lg px-3 py-2">
                    <option value="document">Document</option>
                    <option value="slides">Slides</option>
                    <option value="video">Video</option>
                    <option value="image">Image</option>
                    <option value="link">Link</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-white mb-1">Category</label>
                  <select value={editData.category} onChange={e=>setEditData({...editData, category: e.target.value as any})} className="w-full bg-gray-700 border border-white/10 text-white rounded-lg px-3 py-2">
                    <option value="syllabus">Syllabus</option>
                    <option value="announcements">Announcements</option>
                    <option value="materials">Class Materials</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm text-white mb-1">Class (code)</label>
                <input value={editData.class || ''} onChange={e=>setEditData({...editData, class: e.target.value})} className="w-full bg-gray-700 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-3 py-2" placeholder="e.g., CSE-A" />
              </div>
              {editData.resource_type === 'link' ? (
                <div>
                  <label className="block text-sm text-white mb-1">External URL</label>
                  <input value={editData.external_url || ''} onChange={e=>setEditData({...editData, external_url: e.target.value})} className="w-full bg-gray-700 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-3 py-2" placeholder="https://..." />
                </div>
              ) : (
                <div>
                  <label className="block text-sm text-white mb-1">File URL</label>
                  <input value={editData.file_url || ''} onChange={e=>setEditData({...editData, file_url: e.target.value})} className="w-full bg-gray-700 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-3 py-2" placeholder="https://..." />
                </div>
              )}
              <div>
                <label className="block text-sm text-white mb-1">Tags</label>
                <div className="flex gap-2 mb-2">
                  <input value={newTag} onChange={e=>setNewTag(e.target.value)} onKeyDown={e=>{ if(e.key==='Enter'){ e.preventDefault(); if(newTag.trim()){ setEditData({...editData, tags: [...(editData.tags||[]), newTag.trim()]}); setNewTag(''); } } }} className="flex-1 bg-gray-700 border border-white/10 text-white placeholder:text-white/40 rounded-lg px-3 py-2" placeholder="Add tag" />
                  <button className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-sm text-white hover:bg-white/15" onClick={(e)=>{ e.preventDefault(); if(newTag.trim()){ setEditData({...editData, tags: [...(editData.tags||[]), newTag.trim()]}); setNewTag(''); } }}>Add</button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(editData.tags||[]).map((t,idx)=> (
                    <span key={idx} className="px-2 py-1 bg-blue-600/20 text-blue-300 rounded-full text-xs inline-flex items-center gap-2">
                      {t}
                      <button onClick={(e)=>{ e.preventDefault(); setEditData({...editData, tags: (editData.tags||[]).filter(x=>x!==t)}); }} className="text-blue-300 hover:text-white">
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setEditing(null)} className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200">Cancel</button>
                <button
                  onClick={async ()=>{
                    try {
                      if (!editing) return;
                      const payload: any = {
                        title: editData.title,
                        description: editData.description,
                        resource_type: editData.resource_type,
                        category: editData.category,
                        class: editData.class,
                        tags: editData.tags,
                      };
                      // Map external link to file_url per new schema (no external_url column)
                      const url = editData.resource_type === 'link' ? (editData.external_url || '') : (editData.file_url || '');
                      if (url) {
                        payload.file_url = url;
                      }
                      const resp = await resourcesAPI.updateResource(editing.id, payload);
                      if (resp.error) {
                        alert(resp.error);
                        return;
                      }
                      // Update list locally
                      setApiResources(prev => prev.map(r => r.id === editing.id ? { ...r, ...payload } as any : r));
                      setEditing(null);
                    } catch (e:any) {
                      alert(e?.message || 'Failed to update');
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}