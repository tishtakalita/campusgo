import React, { useState, useEffect } from "react";
import { ArrowLeft, Users, Calendar, Plus, Search, UserPlus, Trophy, Briefcase, Code, Zap } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { projectsAPI } from "../services/api";

// Use the same API base URL configuration as the API service
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

interface ProjectsProps {
  onBack: () => void;
}

export function Projects({ onBack }: ProjectsProps) {
  const { user } = useUser();
  const [view, setView] = useState<'all' | 'my-projects' | 'create'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'hackathon' | 'academic' | 'research'>('all');
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Load projects from API
  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const response = await projectsAPI.getAllProjects();
      if (!response.error && response.data?.projects) {
        const projectsData = response.data.projects;
        setProjects(projectsData);
        console.log('✅ Loaded projects:', projectsData.length);
      }
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinProject = async (projectId: string) => {
    if (!user?.id) {
      alert('Please login to join a project');
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/${projectId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: user.id
        })
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Successfully joined the project!');
        loadProjects(); // Refresh projects to show updated member count
      } else {
        alert(result.detail || 'Failed to join project');
      }
    } catch (error) {
      console.error('Error joining project:', error);
      alert('Failed to join project. Please try again.');
    }
  };

  const handleCreateProject = () => {
    setView('create');
  };

  const getProjectTypeIcon = (title: string, description: string) => {
    const content = (title + ' ' + description).toLowerCase();
    if (content.includes('hackathon') || content.includes('hack')) return Trophy;
    if (content.includes('research') || content.includes('ml') || content.includes('ai')) return Zap;
    if (content.includes('web') || content.includes('app') || content.includes('code')) return Code;
    return Briefcase;
  };

  const getProjectTypeColor = (title: string, description: string) => {
    const content = (title + ' ' + description).toLowerCase();
    if (content.includes('hackathon') || content.includes('hack')) return 'text-yellow-500';
    if (content.includes('research') || content.includes('ml') || content.includes('ai')) return 'text-purple-500';
    if (content.includes('web') || content.includes('app') || content.includes('code')) return 'text-blue-500';
    return 'text-green-500';
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No deadline';
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Due today';
    if (diffDays === 1) return 'Due tomorrow';
    if (diffDays < 7) return `Due in ${diffDays} days`;
    if (diffDays < 30) return `Due in ${Math.ceil(diffDays / 7)} weeks`;
    return date.toLocaleDateString();
  };

  // status color helper not used currently; remove to keep linter clean

  const getAvailableSpots = (project: any) => {
    const currentMembers = project.current_members || 1;
    const membersNeeded = project.members_needed || project.team_size || 1;
    return Math.max(0, membersNeeded - currentMembers);
  };

  const getCurrentMemberCount = (project: any) => {
    return project.current_members || 1;
  };

  const getMembersNeeded = (project: any) => {
    return project.members_needed || project.team_size || 1;
  };

  // Filter projects based on view and search
  const filteredProjects = projects.filter(project => {
    const matchesSearch = searchQuery === '' || 
      project.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      project.courses?.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = filterType === 'all' || 
      (filterType === 'hackathon' && (project.title + ' ' + project.description).toLowerCase().includes('hackathon')) ||
      (filterType === 'academic' && project.courses?.name) ||
      (filterType === 'research' && (project.title + ' ' + project.description).toLowerCase().includes('research'));

    if (view === 'my-projects') {
      return matchesSearch && matchesFilter && project.creator_id === user?.id;
    }
    
    return matchesSearch && matchesFilter;
  });

  if (view === 'create') {
    return <CreateProjectForm onBack={() => setView('all')} onProjectCreated={loadProjects} />;
  }

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="px-5 py-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-4">
          <button onClick={onBack} className="flex items-center gap-3">
            <ArrowLeft size={20} className="text-white" />
            <h1 className="text-white text-xl font-bold">Project Hub</h1>
          </button>
          <button
            onClick={handleCreateProject}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Project
          </button>
        </div>

        {/* Search and Filter */}
        <div className="space-y-3">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search projects, hackathons, research..."
              className="w-full bg-gray-800 border border-white/10 rounded-2xl pl-12 pr-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* View Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setView('all')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              All Projects ({filteredProjects.length})
            </button>
            <button
              onClick={() => setView('my-projects')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                view === 'my-projects' ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
              }`}
            >
              My Projects
            </button>
          </div>

          {/* Filter Tags */}
          <div className="flex gap-2 overflow-x-auto">
            {['all', 'hackathon', 'academic', 'research'].map((filter) => (
              <button
                key={filter}
                onClick={() => setFilterType(filter as any)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                  filterType === filter ? 'bg-purple-600 text-white' : 'bg-gray-800 text-gray-400 hover:text-white'
                }`}
              >
                {filter.charAt(0).toUpperCase() + filter.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Projects Grid */}
      <div className="p-5 space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-300 text-sm">No projects yet</p>
          </div>
        ) : (
          filteredProjects.map((project) => {
            const IconComponent = getProjectTypeIcon(project.title, project.description);
            const iconColor = getProjectTypeColor(project.title, project.description);
            const availableSpots = getAvailableSpots(project);
            const isMyProject = project.creator_id === user?.id;
            
            return (
              <div key={project.id} className="p-5 bg-gray-800 rounded-2xl border border-white/10 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                      <IconComponent size={18} className={iconColor} />
                    </div>
                    <div>
                      <h3 className="text-white font-bold text-lg">{project.title}</h3>
                      <div className="flex items-center gap-2 mb-1">
                        {project.courses?.name && (
                          <p className="text-gray-400 text-sm">{project.courses.name}</p>
                        )}
                        {isMyProject && (
                          <span className="px-2 py-0.5 bg-blue-600/20 text-blue-400 text-xs rounded-full">
                            Owner
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {availableSpots > 0 && !isMyProject && project.is_open_for_members !== false && (
                      <button
                        onClick={() => handleJoinProject(project.id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition-colors"
                      >
                        <UserPlus className="w-4 h-4" />
                        Join Team ({availableSpots} spot{availableSpots > 1 ? 's' : ''} left)
                      </button>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users size={16} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">
                        {getCurrentMemberCount(project)}/{getMembersNeeded(project)} members
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-1.5">
                      <Calendar size={16} className="text-gray-400" />
                      <span className="text-gray-400 text-sm">{formatDate(project.due_date)}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {availableSpots > 0 ? (
                      <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded-full">
                        {availableSpots} spot{availableSpots > 1 ? 's' : ''} open
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-600/20 text-red-400 text-xs rounded-full">
                        Team Full
                      </span>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end items-center">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
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

// Create Project Form Component
function CreateProjectForm({ onBack, onProjectCreated }: { onBack: () => void; onProjectCreated: () => void }) {
  const { user } = useUser();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    members_needed: 4,
    due_date: '',
    project_type: 'academic',
    skills_needed: [] as string[],
    course_id: ''
  });
  const [courses, setCourses] = useState<any[]>([]);
  const [projectTypes, setProjectTypes] = useState<Array<{ value: string; label: string }>>([
    { value: 'academic', label: 'Academic Project' },
    { value: 'hackathon', label: 'Hackathon' },
    { value: 'research', label: 'Research Project' },
  ]);

  useEffect(() => {
    // Load courses for academic projects
    const loadCourses = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/course-names`);
        const data = await res.json();
        setCourses(data.courses || []);
      } catch (e) {
        console.error('Failed to load courses', e);
      }
    };
    // Load project types dynamically
    const loadProjectTypes = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/project-types`);
        if (res.ok) {
          const data = await res.json();
          if (data?.types?.length) setProjectTypes(data.types);
        }
      } catch (e) {
        console.warn('Using default project types, failed to load from API');
      }
    };
    loadCourses();
    loadProjectTypes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id) {
      alert('Please login to create a project');
      return;
    }

    try {
      const projectData: any = {
        title: formData.title,
        description: formData.description,
        creator_id: user.id,
        members_needed: formData.members_needed,
        due_date: formData.due_date || null,
        project_type: formData.project_type,
        skills_needed: formData.skills_needed,
      };
      if (formData.project_type === 'academic' && formData.course_id) {
        projectData.course_id = formData.course_id;
      }

      const response = await fetch(`${API_BASE_URL}/api/projects`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(projectData)
      });

      const result = await response.json();
      
      if (response.ok) {
        alert('Project created successfully!');
        await onProjectCreated(); // Refresh the projects list
        onBack(); // Go back to projects view
      } else {
        alert(result.detail || 'Failed to create project');
      }
    } catch (error) {
      console.error('Error creating project:', error);
      alert('Failed to create project. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <button onClick={onBack} className="flex items-center gap-3 mb-4">
          <ArrowLeft size={20} className="text-white" />
          <h1 className="text-white text-xl font-bold">Create New Project</h1>
        </button>
      </div>

      <div className="p-5">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-sm font-medium mb-2">Project Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="e.g., AI-Powered Healthcare App, Blockchain Hackathon..."
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              placeholder="Describe your project, what you're building, and what skills you're looking for..."
              rows={4}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">How many members do you need?</label>
            <input
              type="number"
              min={2}
              step={1}
              value={formData.members_needed}
              onChange={(e) => {
                const v = parseInt(e.target.value || '0', 10);
                setFormData({ ...formData, members_needed: isNaN(v) ? 2 : Math.max(2, v) });
              }}
              placeholder="Enter total team size (including you)"
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
              required
            />
            <p className="text-gray-400 text-xs mt-1">
              Enter the total team size including you (minimum 2). Others can join to fill the remaining spots.
            </p>
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Project Type</label>
            <select
              value={formData.project_type}
              onChange={(e) => setFormData({
                ...formData,
                project_type: e.target.value,
                course_id: e.target.value === 'academic' ? formData.course_id : ''
              })}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            >
              {projectTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {formData.project_type === 'academic' && (
            <div>
              <label className="block text-white text-sm font-medium mb-2">Course (Required for Academic Projects)</label>
              <select
                value={formData.course_id}
                onChange={(e) => setFormData({...formData, course_id: e.target.value})}
                className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Select a course</option>
                {courses.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-white text-sm font-medium mb-2">Skills Needed</label>
            <input
              type="text"
              placeholder="Comma separated skills e.g., React, Python, UI/UX"
              value={formData.skills_needed.join(', ')}
              onChange={(e) => setFormData({
                ...formData,
                skills_needed: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-white text-sm font-medium mb-2">Deadline (Optional)</label>
            <input
              type="date"
              value={formData.due_date}
              onChange={(e) => setFormData({...formData, due_date: e.target.value})}
              className="w-full bg-gray-800 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onBack}
              className="flex-1 py-3 px-4 bg-gray-700 text-white rounded-lg font-medium hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-3 px-4 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}