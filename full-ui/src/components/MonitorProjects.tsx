import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useData } from '../contexts/DataContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ArrowLeft, Calendar, Users, BarChart3, AlertCircle, CheckCircle, Clock } from 'lucide-react';

interface MonitorProjectsProps {
  onBack: () => void;
}

export const MonitorProjects: React.FC<MonitorProjectsProps> = ({ onBack }) => {
  const { user } = useUser();
  const { classes, projects, updateProject } = useData();
  const [filter, setFilter] = useState<'all' | 'not-started' | 'in-progress' | 'completed'>('all');

  // Filter projects for faculty's classes
  const facultyClasses = classes.filter(cls => 
    user?.facultySubjects?.includes(cls.name)
  );

  const facultyProjects = projects.filter(project =>
    facultyClasses.some(cls => cls.id === project.classId)
  );

  const filteredProjects = filter === 'all' 
    ? facultyProjects 
    : facultyProjects.filter(project => project.status === filter);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'not-started':
        return <AlertCircle className="w-4 h-4" />;
      case 'in-progress':
        return <Clock className="w-4 h-4" />;
      case 'completed':
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return 'bg-red-500 text-white';
      case 'in-progress':
        return 'bg-yellow-500 text-black';
      case 'completed':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const getClassName = (classId: string) => {
    return classes.find(cls => cls.id === classId)?.name || 'Unknown Class';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handleUpdateProgress = (projectId: string, newProgress: number) => {
    let newStatus = 'not-started';
    if (newProgress > 0 && newProgress < 100) {
      newStatus = 'in-progress';
    } else if (newProgress === 100) {
      newStatus = 'completed';
    }

    updateProject(projectId, { 
      progress: newProgress, 
      status: newStatus as 'not-started' | 'in-progress' | 'completed'
    });
  };

  const projectStats = {
    total: facultyProjects.length,
    notStarted: facultyProjects.filter(p => p.status === 'not-started').length,
    inProgress: facultyProjects.filter(p => p.status === 'in-progress').length,
    completed: facultyProjects.filter(p => p.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-gray-800 mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">Monitor Projects</h1>
        </div>

        {/* Statistics */}
        <Card className="bg-gray-800 border-gray-700 mb-6">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2" />
              Project Overview
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-white">{projectStats.total}</p>
                <p className="text-sm text-gray-400">Total Projects</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{projectStats.completed}</p>
                <p className="text-sm text-gray-400">Completed</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{projectStats.inProgress}</p>
                <p className="text-sm text-gray-400">In Progress</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-400">{projectStats.notStarted}</p>
                <p className="text-sm text-gray-400">Not Started</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Filter Buttons */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {['all', 'not-started', 'in-progress', 'completed'].map((status) => (
            <Button
              key={status}
              variant={filter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(status as any)}
              className="whitespace-nowrap"
            >
              {status === 'all' ? 'All' : status.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </Button>
          ))}
        </div>

        {/* Projects List */}
        <div className="space-y-4">
          {filteredProjects.map((project) => {
            const daysUntilDue = getDaysUntilDue(project.dueDate);
            const isOverdue = daysUntilDue < 0;
            const isDueSoon = daysUntilDue <= 3 && daysUntilDue >= 0;

            return (
              <Card key={project.id} className="bg-gray-800 border-gray-700">
                <div className="p-4">
                  {/* Project Header */}
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex-1">
                      <h3 className="text-white font-semibold">{project.title}</h3>
                      <p className="text-gray-400 text-sm">{getClassName(project.classId)}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {getStatusIcon(project.status)}
                      <span className="ml-1 capitalize">{project.status.replace('-', ' ')}</span>
                    </Badge>
                  </div>

                  {/* Project Description */}
                  <p className="text-gray-300 text-sm mb-3 line-clamp-2">{project.description}</p>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-400">Progress</span>
                      <span className="text-sm text-white">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-2" />
                  </div>

                  {/* Project Details */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center text-gray-400">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{project.assignedTo.length} students</span>
                      </div>
                      <div className="flex items-center text-gray-400">
                        <Calendar className="w-4 h-4 mr-1" />
                        <span>{formatDate(project.dueDate)}</span>
                      </div>
                    </div>
                    
                    {/* Due Date Warning */}
                    {isOverdue && (
                      <div className="flex items-center text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span>Overdue by {Math.abs(daysUntilDue)} days</span>
                      </div>
                    )}
                    {isDueSoon && !isOverdue && (
                      <div className="flex items-center text-yellow-400 text-sm">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        <span>Due in {daysUntilDue} days</span>
                      </div>
                    )}
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-white border-gray-600 hover:bg-gray-700"
                      onClick={() => {
                        const newProgress = Math.min(project.progress + 25, 100);
                        handleUpdateProgress(project.id, newProgress);
                      }}
                    >
                      Update Progress
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-white border-gray-600 hover:bg-gray-700"
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}

          {filteredProjects.length === 0 && (
            <Card className="bg-gray-800 border-gray-700">
              <div className="p-8 text-center">
                <BarChart3 className="w-12 h-12 text-gray-500 mx-auto mb-4" />
                <h3 className="text-white font-semibold mb-2">No Projects Found</h3>
                <p className="text-gray-400 text-sm">
                  {filter === 'all' 
                    ? 'No projects have been created yet.'
                    : `No projects with status "${filter.replace('-', ' ')}" found.`}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};