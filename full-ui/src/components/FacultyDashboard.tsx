import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useData } from '../contexts/DataContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { CalendarDays, Users, BookOpen, Plus, BarChart3, Clock } from 'lucide-react';

interface FacultyDashboardProps {
  onNavigate: (view: string) => void;
}

export const FacultyDashboard: React.FC<FacultyDashboardProps> = ({ onNavigate }) => {
  const { user } = useUser();
  const { classes, assignments, resources, projects } = useData();

  // Filter data for faculty's classes
  const facultyClasses = classes.filter(cls => 
    user?.facultySubjects?.includes(cls.name)
  );

  const facultyAssignments = assignments.filter(assignment =>
    facultyClasses.some(cls => cls.id === assignment.classId)
  );

  const facultyResources = resources.filter(resource =>
    facultyClasses.some(cls => cls.id === resource.classId)
  );

  const facultyProjects = projects.filter(project =>
    facultyClasses.some(cls => cls.id === project.classId)
  );

  // Get current class
  const getCurrentClass = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);

    return facultyClasses.find(cls =>
      cls.schedule.some(schedule => 
        schedule.day === currentDay &&
        schedule.startTime <= currentTime &&
        schedule.endTime >= currentTime
      )
    );
  };

  const currentClass = getCurrentClass();

  // Get next class
  const getNextClass = () => {
    const now = new Date();
    const currentDay = now.toLocaleDateString('en-US', { weekday: 'long' });
    const currentTime = now.toTimeString().slice(0, 5);

    const allSchedules = facultyClasses.flatMap(cls =>
      cls.schedule.map(schedule => ({ ...schedule, class: cls }))
    );

    return allSchedules.find(schedule =>
      schedule.day === currentDay && schedule.startTime > currentTime
    );
  };

  const nextClass = getNextClass();

  const stats = [
    {
      title: 'Total Classes',
      value: facultyClasses.length,
      icon: BookOpen,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Assignments',
      value: facultyAssignments.length,
      icon: BarChart3,
      color: 'bg-green-500'
    },
    {
      title: 'Resources Uploaded',
      value: facultyResources.length,
      icon: Users,
      color: 'bg-purple-500'
    },
    {
      title: 'Projects Monitoring',
      value: facultyProjects.length,
      icon: CalendarDays,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Current/Next Class Status */}
      {currentClass ? (
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">Currently Teaching</p>
                <h3 className="text-xl font-bold">{currentClass.name}</h3>
                <p className="text-blue-100">{currentClass.room}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-blue-100">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">Ongoing</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : nextClass ? (
        <Card className="bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 text-white">
          <div className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">Next Class</p>
                <h3 className="text-xl font-bold">{nextClass.class.name}</h3>
                <p className="text-gray-300">{nextClass.class.room}</p>
              </div>
              <div className="text-right">
                <div className="flex items-center text-gray-300">
                  <Clock className="w-4 h-4 mr-1" />
                  <span className="text-sm">{nextClass.startTime}</span>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-gray-700 to-gray-800 border-gray-600 text-white">
          <div className="p-6 text-center">
            <p className="text-gray-300">No upcoming classes today</p>
          </div>
        </Card>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <Card key={index} className="bg-gray-800 border-gray-700">
            <div className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${stat.color}`}>
                  <stat.icon className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-white">{stat.value}</p>
                  <p className="text-sm text-gray-400">{stat.title}</p>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-3">
            <Button
              onClick={() => onNavigate('create-assignment')}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 h-auto flex-col space-y-2"
            >
              <Plus className="w-5 h-5" />
              <span className="text-sm">Create Assignment</span>
            </Button>
            <Button
              onClick={() => onNavigate('upload-resource')}
              className="bg-green-600 hover:bg-green-700 text-white p-4 h-auto flex-col space-y-2"
            >
              <BookOpen className="w-5 h-5" />
              <span className="text-sm">Upload Resource</span>
            </Button>
            <Button
              onClick={() => onNavigate('manage-classes')}
              className="bg-purple-600 hover:bg-purple-700 text-white p-4 h-auto flex-col space-y-2"
            >
              <Users className="w-5 h-5" />
              <span className="text-sm">Manage Classes</span>
            </Button>
            <Button
              onClick={() => onNavigate('monitor-projects')}
              className="bg-orange-600 hover:bg-orange-700 text-white p-4 h-auto flex-col space-y-2"
            >
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm">Monitor Projects</span>
            </Button>
          </div>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-800 border-gray-700">
        <div className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {facultyAssignments.slice(0, 3).map((assignment) => (
              <div key={assignment.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                <div>
                  <p className="text-white font-medium">{assignment.title}</p>
                  <p className="text-sm text-gray-400">{assignment.subject}</p>
                </div>
                <Badge 
                  variant={assignment.priority === 'high' ? 'destructive' : 
                          assignment.priority === 'medium' ? 'default' : 'secondary'}
                >
                  {assignment.priority}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
};