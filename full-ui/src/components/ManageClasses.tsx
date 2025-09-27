import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useData } from '../contexts/DataContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ArrowLeft, Users, Calendar, MapPin, Clock, Plus } from 'lucide-react';

interface ManageClassesProps {
  onBack: () => void;
}

export const ManageClasses: React.FC<ManageClassesProps> = ({ onBack }) => {
  const { user } = useUser();
  const { classes, assignments, projects } = useData();
  const [selectedClass, setSelectedClass] = useState<string | null>(null);

  // Filter classes for faculty
  const facultyClasses = classes.filter(cls => 
    user?.facultySubjects?.includes(cls.name)
  );

  const getClassStats = (classId: string) => {
    const classAssignments = assignments.filter(a => a.classId === classId);
    const classProjects = projects.filter(p => p.classId === classId);
    
    return {
      assignments: classAssignments.length,
      projects: classProjects.length,
      students: classes.find(c => c.id === classId)?.students.length || 0
    };
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getDayColor = (day: string) => {
    const colors: { [key: string]: string } = {
      'Monday': 'bg-blue-500',
      'Tuesday': 'bg-green-500',
      'Wednesday': 'bg-yellow-500',
      'Thursday': 'bg-purple-500',
      'Friday': 'bg-red-500',
      'Saturday': 'bg-orange-500',
      'Sunday': 'bg-pink-500'
    };
    return colors[day] || 'bg-gray-500';
  };

  const selectedClassData = facultyClasses.find(cls => cls.id === selectedClass);

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={selectedClass ? () => setSelectedClass(null) : onBack}
            className="text-white hover:bg-gray-800 mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">
            {selectedClass ? selectedClassData?.name : 'Manage Classes'}
          </h1>
        </div>

        {!selectedClass ? (
          <>
            {/* Classes Overview */}
            <div className="space-y-4">
              {facultyClasses.map((cls) => {
                const stats = getClassStats(cls.id);
                return (
                  <Card 
                    key={cls.id} 
                    className="bg-gray-800 border-gray-700 cursor-pointer hover:bg-gray-750 transition-colors"
                    onClick={() => setSelectedClass(cls.id)}
                  >
                    <div className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="text-white font-semibold">{cls.name}</h3>
                          <p className="text-gray-400 text-sm">{cls.code}</p>
                        </div>
                        <Badge variant="outline" className="text-blue-400 border-blue-400">
                          {stats.students} students
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-gray-400 text-sm mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span>{cls.room}</span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-3">
                        {cls.schedule.map((schedule, index) => (
                          <Badge 
                            key={index}
                            className={`${getDayColor(schedule.day)} text-white text-xs`}
                          >
                            {schedule.day.slice(0, 3)} {formatTime(schedule.startTime)}
                          </Badge>
                        ))}
                      </div>

                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400">
                          {stats.assignments} assignments
                        </span>
                        <span className="text-gray-400">
                          {stats.projects} projects
                        </span>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>

            {/* Add Class Button */}
            <Card className="bg-gray-800 border-gray-700 mt-4">
              <Button
                variant="ghost"
                className="w-full p-6 text-white hover:bg-gray-700 h-auto"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add New Class
              </Button>
            </Card>
          </>
        ) : (
          <>
            {/* Selected Class Details */}
            {selectedClassData && (
              <div className="space-y-6">
                {/* Class Info */}
                <Card className="bg-gray-800 border-gray-700">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h2 className="text-xl font-bold text-white">{selectedClassData.name}</h2>
                        <p className="text-gray-400">{selectedClassData.code}</p>
                      </div>
                      <Badge variant="outline" className="text-blue-400 border-blue-400">
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div className="flex items-center text-gray-300">
                        <MapPin className="w-4 h-4 mr-3" />
                        <span>{selectedClassData.room}</span>
                      </div>
                      <div className="flex items-center text-gray-300">
                        <Users className="w-4 h-4 mr-3" />
                        <span>{selectedClassData.students.length} students enrolled</span>
                      </div>
                    </div>
                  </div>
                </Card>

                {/* Schedule */}
                <Card className="bg-gray-800 border-gray-700">
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-4 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      Class Schedule
                    </h3>
                    <div className="space-y-3">
                      {selectedClassData.schedule.map((schedule, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
                          <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${getDayColor(schedule.day)} mr-3`}></div>
                            <span className="text-white font-medium">{schedule.day}</span>
                          </div>
                          <div className="flex items-center text-gray-300">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>{formatTime(schedule.startTime)} - {formatTime(schedule.endTime)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>

                {/* Quick Actions */}
                <Card className="bg-gray-800 border-gray-700">
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white justify-start">
                        <Plus className="w-4 h-4 mr-2" />
                        Create Assignment for this Class
                      </Button>
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white justify-start">
                        <Users className="w-4 h-4 mr-2" />
                        View Student List
                      </Button>
                      <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white justify-start">
                        <Calendar className="w-4 h-4 mr-2" />
                        Edit Schedule
                      </Button>
                    </div>
                  </div>
                </Card>

                {/* Class Statistics */}
                <Card className="bg-gray-800 border-gray-700">
                  <div className="p-6">
                    <h3 className="text-white font-semibold mb-4">Class Statistics</h3>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-2xl font-bold text-white">{getClassStats(selectedClassData.id).assignments}</p>
                        <p className="text-sm text-gray-400">Assignments</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{getClassStats(selectedClassData.id).projects}</p>
                        <p className="text-sm text-gray-400">Projects</p>
                      </div>
                      <div>
                        <p className="text-2xl font-bold text-white">{selectedClassData.students.length}</p>
                        <p className="text-sm text-gray-400">Students</p>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};