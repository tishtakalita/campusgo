import React from "react";
import { ArrowLeft, Users, Clock, Star, Calendar, BookOpen } from "lucide-react";
import { useData } from "../contexts/DataContext";
import { useUser } from "../contexts/UserContext";

interface ProjectsProps {
  onBack: () => void;
}

export function Projects({ onBack }: ProjectsProps) {
  const { projects, classes } = useData();
  const { user } = useUser();

  // Filter projects based on user role
  const userProjects = user?.role === 'faculty' 
    ? projects.filter(project => {
        const projectClass = classes.find(cls => cls.id === project.classId);
        return projectClass && user.facultySubjects?.includes(projectClass.name);
      })
    : projects.filter(project => project.assignedTo.includes(user?.id || ''));

  const getClassName = (classId: string) => {
    return classes.find(cls => cls.id === classId)?.name || 'Unknown Class';
  };

  const formatDate = (dateString: string) => {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      case 'not-started':
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Star size={18} className="text-green-500" />;
      case 'in-progress':
        return <Clock size={18} className="text-blue-500" />;
      case 'not-started':
        return <Clock size={18} className="text-gray-500" />;
      default:
        return <Clock size={18} className="text-gray-500" />;
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
          <h1 className="text-white text-xl font-bold">Projects</h1>
        </button>
      </div>
      
      <div className="p-5 space-y-4">
        {userProjects.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">No Projects Found</h3>
            <p className="text-gray-400 text-sm">
              {user?.role === 'faculty' 
                ? 'No projects have been assigned to your classes yet'
                : 'You are not assigned to any projects yet'
              }
            </p>
          </div>
        ) : (
          userProjects.map((project) => (
            <div key={project.id} className="p-5 bg-gray-800 rounded-2xl border border-white/10">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-white font-bold text-lg">{project.title}</h3>
                  <p className="text-gray-400 text-sm">{getClassName(project.classId)}</p>
                </div>
                {getStatusIcon(project.status)}
              </div>
              
              <p className="text-gray-300 text-sm mb-3">{project.description}</p>
              
              <div className="flex items-center gap-2 mb-3">
                <Users size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">
                  {project.assignedTo.length} {project.assignedTo.length === 1 ? 'member' : 'members'}
                </span>
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <Calendar size={16} className="text-gray-400" />
                <span className="text-gray-400 text-sm">{formatDate(project.dueDate)}</span>
              </div>
              
              <div className="mb-2">
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-400">Progress</span>
                  <span className="text-white font-semibold">{project.progress}%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${getStatusColor(project.status)}`}
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
              </div>

              <div className="flex justify-between items-center mt-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  project.status === 'completed' ? 'bg-green-600/20 text-green-400' :
                  project.status === 'in-progress' ? 'bg-blue-600/20 text-blue-400' :
                  'bg-gray-600/20 text-gray-400'
                }`}>
                  {project.status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                </span>
                
                {user?.role === 'faculty' && (
                  <button className="text-blue-400 text-sm hover:text-blue-300">
                    Manage Project
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}