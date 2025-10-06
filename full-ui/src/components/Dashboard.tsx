import { useEffect, useState } from 'react';
import { useDashboard } from '../contexts/DashboardContext';
import { AssignmentCard } from './AssignmentCard';
import { CurrentClass } from './CurrentClass';
import { Calendar, AlertCircle } from 'lucide-react';
import api from '../services/api';
import { useUser } from '../contexts/UserContext';

interface DashboardProps {
  onNavigate: (view: string) => void;
}

export function Dashboard({ onNavigate }: DashboardProps) {
  const { dashboardData, isLoading, error, refreshDashboard } = useDashboard();
  const { user } = useUser();
  const [upcomingCalendarEvents, setUpcomingCalendarEvents] = useState<Array<{ title: string; subtitle?: string; date: string }>>([]);

  // Helper: format YYYY-MM-DD to 'DD Mon YYYY' (e.g., 05 Oct 2025)
  const formatEventDate = (dateStr: string) => {
    try {
      const d = new Date(`${dateStr}T00:00:00`);
      const day = String(d.getDate()).padStart(2, '0');
      const mon = d.toLocaleString('en-US', { month: 'short' });
      const year = d.getFullYear();
      return `${day} ${mon} ${year}`;
    } catch {
      return dateStr;
    }
  };


  // Auto-refresh dashboard data every 5 minutes
  useEffect(() => {
    const interval = setInterval(() => {
      refreshDashboard();
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [refreshDashboard]);

  // Build Upcoming Events from calendar API only (including personal events)
  useEffect(() => {
    const loadCalendarPreview = async () => {
      try {
        const now = new Date();
        const month = now.getMonth() + 1;
        const year = now.getFullYear();
        const userId = user?.id;
        // Fetch current month and next month to ensure we have at least two items
        const [resThis, resNext] = await Promise.all([
          api.calendar.getMonth(year, month, userId),
          api.calendar.getMonth(month === 12 ? year + 1 : year, month === 12 ? 1 : month + 1, userId)
        ]);
        const byDate = {
          ...(resThis.data?.events_by_date || {}),
          ...(resNext.data?.events_by_date || {})
        } as Record<string, any[]>;
        const todayStr = now.toISOString().split('T')[0];

        // Flatten and sort only today and upcoming dates
        const items: Array<{ date: string; title: string; subtitle?: string; start?: string }>= [];
        Object.keys(byDate).forEach(dateStr => {
          const list = byDate[dateStr] || [];
          list.forEach(evt => {
            items.push({
              date: dateStr,
              title: evt.title,
              subtitle: evt.location || undefined,
              start: evt.start_time
            });
          });
        });
        const filtered = items
          .filter(i => i.date >= todayStr)
          .sort((a, b) => (a.date + (a.start || '')) .localeCompare(b.date + (b.start || '')))
          .slice(0, 2)
          .map(i => ({ title: i.title, subtitle: i.subtitle, date: i.date }));
        setUpcomingCalendarEvents(filtered);
      } catch (e) {
        console.warn('Failed to load calendar preview', e);
        setUpcomingCalendarEvents([]);
      }
    };
    loadCalendarPreview();
  }, [user?.id]);

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

  // Get all assignments combined from both sources
  const getFilteredAssignments = () => {
    // Combine assignments from both sources to show all assignments
    const recentAssignments = dashboardData.recent_assignments || [];
    const upcomingDeadlines = dashboardData.upcoming_deadlines || [];
    
    // Merge and deduplicate assignments by ID
    const allAssignments = [...recentAssignments];
    upcomingDeadlines.forEach(deadline => {
      if (!allAssignments.some(assignment => assignment.id === deadline.id)) {
        allAssignments.push(deadline);
      }
    });
    
    // Sort by due date (earliest first)
    return allAssignments.sort((a, b) => 
      new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
    );
  };

  const filteredAssignments = getFilteredAssignments();


  return (
    <div className="space-y-6">
      {/* Timetable action placed above the class block */}
      <div className="px-5 flex justify-end">
        <button 
          onClick={() => onNavigate('timetable')}
          className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
        >
          View Full Timetable
        </button>
      </div>

      {/* Ongoing/Upcoming Classes Block */}
      {currentClass && (
        <CurrentClass 
          className={currentClass.courses?.name || currentClass.name || 'Current Class'}
          room={currentClass.room || ''}
          instructor={currentClass.instructor || ''}
          timeRemaining={(currentClass as any).time_remaining || 'Live now'}
          status="ongoing"
          progressPercentage={(currentClass as any).progress_percentage || 0}
          startTime={currentClass.start_time}
          endTime={currentClass.end_time}
          autoProgress={true}
        />
      )}

      {nextClass && !currentClass && (
        <CurrentClass 
          className={nextClass.courses?.name || nextClass.name || 'Next Class'}
          room={nextClass.room || ''}
          instructor={nextClass.instructor || ''}
          timeRemaining={(nextClass as any).time_until || `Starts at ${new Date(nextClass.start_time).toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}`}
          status="upcoming"
          startTime={nextClass.start_time}
          endTime={nextClass.end_time}
          autoProgress={true}
        />
      )}



      {/* Assignment Timeframe Filter */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Upcoming Assignments</h2>
          
          <button 
            onClick={() => onNavigate('assignments')}
            className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            View Full Assignments
          </button>
        </div>

        {filteredAssignments.length > 0 ? (
          <div className="space-y-3">
            {filteredAssignments.slice(0, 2).map((assignment) => (
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
              No assignments available
            </div>
          </div>
        )}
      </div>

      {/* Upcoming Events Preview (calendar events only) */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-xl font-bold">Upcoming Events</h2>
          <button 
            onClick={() => onNavigate('calendar')}
            className="text-blue-400 text-sm hover:text-blue-300 transition-colors"
          >
            View Full Calendar
          </button>
        </div>
        
        <div className="bg-gray-800 rounded-2xl p-4">
          <div className="space-y-3">
            {/* Show only two calendar events (includes personal) */}
            {upcomingCalendarEvents.length > 0 ? (
              upcomingCalendarEvents.map((evt, idx) => (
                <div key={idx} className="flex items-center gap-3 py-2 bg-gray-700 rounded-lg px-3">
                  <div className={`w-2 h-2 rounded-full bg-green-400`}></div>
                  <div className="flex-1">
                    <div className="text-white text-sm font-medium">{evt.title}</div>
                    {evt.subtitle && (<div className="text-gray-400 text-xs">{evt.subtitle}</div>)}
                  </div>
                  <div className="text-gray-300 text-xs whitespace-nowrap ml-auto">
                    {formatEventDate(evt.date)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-6">
                <Calendar className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                <div className="text-gray-400 text-sm">No upcoming events</div>
                <div className="text-gray-500 text-xs mt-1">Check your full calendar for future events</div>
              </div>
            )}
          </div>
        </div>
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

      {/* Debug info removed */}
    </div>
  );
}