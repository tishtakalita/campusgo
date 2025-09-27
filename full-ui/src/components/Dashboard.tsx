import React, { useState, useEffect } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { useUser } from '../contexts/UserContext';
import { Assignment, Class } from '../services/api';
import { AssignmentCard } from './AssignmentCard';
import { CurrentClass } from './CurrentClass';
import { Calendar, Clock, Trophy, BookOpen, Users, TrendingUp, AlertCircle } from 'lucide-react';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { user } = useUser();
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();
  const [selectedTimeframe, setSelectedTimeframe] = useState<'today' | 'week' | 'month'>('today');

  // Auto-refresh dashboard data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDashboard();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshDashboard]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <div className="text-gray-400">Loading dashboard...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-center">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto mb-4" />
          <div className="text-red-400 mb-2">Dashboard Error</div>
          <div className="text-gray-500 text-sm mb-4">{error}</div>
          <button 
            onClick={refreshDashboard}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-400">No dashboard data available</div>
      </div>
    );
  }

  // Get current and next class from today's overview
  const currentClass = dashboardData.today_overview?.current_class;
  const nextClass = dashboardData.today_overview?.next_class;
  const todayClasses = dashboardData.today_overview?.today_classes || [];
  const dueToday = dashboardData.today_overview?.due_today || [];

  // Filter assignments based on selected timeframe
  const getFilteredAssignments = () => {
    const now = new Date();
    const assignments = dashboardData.recent_assignments || [];
    
    switch (selectedTimeframe) {
      case 'today':
        return assignments.filter(assignment => {
          const dueDate = new Date(assignment.due_date);
          return dueDate.toDateString() === now.toDateString();
        });
      case 'week':
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        return assignments.filter(assignment => {
          const dueDate = new Date(assignment.due_date);
          return dueDate >= now && dueDate <= weekFromNow;
        });
      case 'month':
        const monthFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
        return assignments.filter(assignment => {
          const dueDate = new Date(assignment.due_date);
          return dueDate >= now && dueDate <= monthFromNow;
        });
      default:
        return assignments;
    }
  };

  const filteredAssignments = getFilteredAssignments();

  return (
    <div className="space-y-6">
      {/* Dashboard Stats Cards */}
      {dashboardData.user_stats && (
        <div className="grid grid-cols-2 gap-4 px-5">
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <BookOpen size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white text-2xl font-bold">
                  {dashboardData.user_stats.enrollments_count}
                </div>
                <div className="text-blue-100 text-sm">Enrolled Courses</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-600 to-green-500 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                <Trophy size={20} className="text-white" />
              </div>
              <div>
                <div className="text-white text-2xl font-bold">
                  {dashboardData.user_stats.completed_assignments}
                </div>
                <div className="text-green-100 text-sm">Completed</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Current Class */}
      {currentClass && (
        <div className="px-5">
          <h2 className="text-white text-xl font-bold mb-4">Current Class</h2>
          <CurrentClass 
            className={currentClass.courses?.name || currentClass.name || 'Current Class'}
            room={currentClass.room || 'Room TBA'}
            instructor={currentClass.instructor || 'Instructor TBA'}
            timeRemaining="Live now"
          />
        </div>
      )}

      {/* Next Class */}
      {nextClass && !currentClass && (
        <div className="px-5">
          <h2 className="text-white text-xl font-bold mb-4">Next Class</h2>
          <CurrentClass 
            className={nextClass.courses?.name || nextClass.name || 'Next Class'}
            room={nextClass.room || 'Room TBA'}
            instructor={nextClass.instructor || 'Instructor TBA'}
            timeRemaining={`Starts at ${new Date(nextClass.start_time).toLocaleTimeString('en-US', { 
              hour: 'numeric', 
              minute: '2-digit',
              hour12: true 
            })}`}
          />
        </div>
      )}

      {/* Today's Schedule Overview */}
      {todayClasses.length > 0 && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-xl font-bold">Today's Schedule</h2>
            <button 
              onClick={() => onNavigate('timetable')}
              className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
            >
              View Full Timetable
            </button>
          </div>
          
          <div className="bg-gray-800 rounded-2xl p-4 space-y-3">
            {todayClasses.slice(0, 3).map((classItem, index) => (
              <div key={classItem.id || index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                  <div>
                    <div className="text-white font-medium text-sm">
                      {classItem.courses?.name || classItem.name}
                    </div>
                    <div className="text-gray-400 text-xs">{classItem.room}</div>
                  </div>
                </div>
                <div className="text-gray-300 text-sm">
                  {new Date(classItem.start_time).toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
              </div>
            ))}
            
            {todayClasses.length > 3 && (
              <div className="text-center pt-2">
                <button 
                  onClick={() => onNavigate('timetable')}
                  className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
                >
                  +{todayClasses.length - 3} more classes
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Urgent Assignments */}
      {dashboardData.upcoming_deadlines.length > 0 && (
        <div className="px-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <AlertCircle size={20} className="text-yellow-500" />
              <h2 className="text-white text-xl font-bold">Urgent Deadlines</h2>
            </div>
            <span className="text-yellow-400 text-sm">Next 7 days</span>
          </div>
          
          <div className="space-y-3">
            {dashboardData.upcoming_deadlines.slice(0, 2).map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => onNavigate('assignments')}
              />
            ))}
          </div>
        </div>
      )}

      {/* Assignment Timeframe Filter */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Assignments</h2>
          
          <div className="flex bg-gray-800 rounded-lg p-1">
            {(['today', 'week', 'month'] as const).map((timeframe) => (
              <button
                key={timeframe}
                onClick={() => setSelectedTimeframe(timeframe)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedTimeframe === timeframe
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                {timeframe.charAt(0).toUpperCase() + timeframe.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAssignments.length > 0 ? (
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => onNavigate('assignments')}
              />
            ))}
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl p-6 text-center">
            <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-3" />
            <div className="text-gray-400 text-sm">
              No assignments due {selectedTimeframe === 'today' ? 'today' : `this ${selectedTimeframe}`}
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {dashboardData.user_stats && (
        <div className="px-5">
          <h2 className="text-white text-xl font-bold mb-4">Quick Stats</h2>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-400 mb-1">
                {dashboardData.user_stats.upcoming_assignments}
              </div>
              <div className="text-gray-400 text-sm">Upcoming</div>
            </div>
            
            <div className="bg-gray-800 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-orange-400 mb-1">
                {dashboardData.user_stats.submissions_count}
              </div>
              <div className="text-gray-400 text-sm">Submitted</div>
            </div>
          </div>
        </div>
      )}

      {/* Debug Information (Development only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="px-5">
          <div className="bg-gray-800 rounded-xl p-4">
            <h3 className="text-white font-semibold mb-2">Dashboard Debug Info</h3>
            <div className="text-gray-400 text-xs space-y-1">
              <div>Recent Classes: {dashboardData.recent_classes.length}</div>
              <div>Recent Assignments: {dashboardData.recent_assignments.length}</div>
              <div>Today's Classes: {todayClasses.length}</div>
              <div>Due Today: {dueToday.length}</div>
              <div>Upcoming Deadlines: {dashboardData.upcoming_deadlines.length}</div>
              <div>Current Session: {dashboardData.current_session ? 'Yes' : 'No'}</div>
              <div>User Stats: {dashboardData.user_stats ? 'Available' : 'Not Available'}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}