import React, { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { classesAPI, Class as ApiClass } from "../services/api";

interface TimetableProps {
  onBack: () => void;
}

export function Timetable({ onBack }: TimetableProps) {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month'>('day');
  const [apiClasses, setApiClasses] = useState<ApiClass[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load classes from API - NO FALLBACKS
  useEffect(() => {
    loadClasses();
  }, []);

  const loadClasses = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await classesAPI.getAllClasses();
      if (response.error) {
        console.error('Failed to load classes:', response.error);
        setError(response.error);
        setApiClasses([]); // Clear data on error
      } else {
        setApiClasses(response.data?.classes || []);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Network error - please check if backend is running');
      setApiClasses([]); // Clear data on error
    }
    setIsLoading(false);
  };

  // Transform API classes to match frontend format
  const transformApiClasses = (apiClassesList: ApiClass[]) => {
    // Map day numbers to day names (1=Monday, 2=Tuesday, etc.)
    const dayMap: Record<number, string> = {
      1: 'Monday',
      2: 'Tuesday', 
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
      7: 'Sunday'
    };

    return apiClassesList.map(apiClass => {
      // Extract time from datetime string (e.g., "2024-09-16T14:00:00" -> "14:00")
      const startTime = apiClass.start_time ? new Date(apiClass.start_time).toTimeString().slice(0, 5) : '00:00';
      const endTime = apiClass.end_time ? new Date(apiClass.end_time).toTimeString().slice(0, 5) : '00:00';
      
      // Handle day_of_week as either number or string
      let dayName = 'Monday'; // default
      if (typeof apiClass.day_of_week === 'number') {
        dayName = dayMap[apiClass.day_of_week] || 'Monday';
      } else if (typeof apiClass.day_of_week === 'string') {
        const dayNum = parseInt(apiClass.day_of_week);
        dayName = dayMap[dayNum] || apiClass.day_of_week;
      }
      
      return {
        id: apiClass.id,
        name: apiClass.courses?.name || apiClass.name || 'Untitled Class',
        code: apiClass.courses?.code || apiClass.code || '',
        instructor: apiClass.instructor || 'TBA',
        room: apiClass.room || 'TBA',
        schedule: [{
          day: dayName,
          startTime: startTime,
          endTime: endTime
        }],
        students: [] // Mock for now since API doesn't return student list
      };
    });
  };

  // Use ONLY API data - NO FALLBACKS
  const allClasses = transformApiClasses(apiClasses);
  
  // Filter classes based on user role
  const userClasses = user?.role === 'faculty' 
    ? allClasses.filter((cls: any) => user.facultySubjects?.includes(cls.name))
    : allClasses; // Students see all classes

  // Get today's day name
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
  
    // Use actual day - development mode disabled now that we have full timetable
  const displayDay = today;
  
  // Get today's classes (match by day name, not specific date)
  const todayClasses = userClasses.filter((cls: any) =>
    cls.schedule.some((schedule: any) => schedule.day === displayDay)
  ).map((cls: any) => {
    const todaySchedule = cls.schedule.find((schedule: any) => schedule.day === displayDay)!;
    
    // Check if class is currently ongoing
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    const isCurrentClass = currentTime >= todaySchedule.startTime && currentTime <= todaySchedule.endTime;
    
    return {
      ...cls,
      schedule: todaySchedule,
      status: isCurrentClass ? 'current' : 'upcoming'
    };
  }).sort((a: any, b: any) => a.schedule.startTime.localeCompare(b.schedule.startTime));
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Timetable Debug:');
    console.log('- API classes loaded:', apiClasses.length);
    console.log('- Raw API data sample:', apiClasses.slice(0, 2));
    console.log('- Transformed classes:', allClasses.length);
    console.log('- Transformed sample:', allClasses.slice(0, 2));
    console.log('- User role:', user?.role);
    console.log('- Today is:', today);
    console.log('- Today classes found:', todayClasses.length);
    console.log('- Today classes sample:', todayClasses.slice(0, 2));
  }, [apiClasses, allClasses, user?.role, today, todayClasses]);

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  const getWeekView = () => {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const weekSchedule: { [key: string]: any[] } = {};
    
    days.forEach(day => {
      weekSchedule[day] = userClasses.filter((cls: any) =>
        cls.schedule.some((schedule: any) => schedule.day === day)
      ).flatMap((cls: any) => 
        cls.schedule
          .filter((schedule: any) => schedule.day === day)
          .map((schedule: any) => ({ ...cls, schedule }))
      ).sort((a: any, b: any) => a.schedule.startTime.localeCompare(b.schedule.startTime));
    });
    
    return weekSchedule;
  };

  const weekSchedule = getWeekView();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 mb-4"
        >
          <ArrowLeft size={20} className="text-white" />
          <h1 className="text-white text-xl font-bold">Timetable</h1>
        </button>
        
        <div className="flex bg-gray-800 rounded-2xl p-1">
          {(['day', 'week', 'month'] as const).map((view) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`flex-1 py-2 px-4 rounded-xl text-sm font-medium transition-colors ${
                activeView === view
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              {view.charAt(0).toUpperCase() + view.slice(1)}
            </button>
          ))}
        </div>
      </div>
      
      <div className="p-5">
        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-white font-semibold mb-2">Loading Timetable...</p>
            <p className="text-gray-400 text-sm">Fetching your class schedule</p>
          </div>
        )}

        {error && !isLoading && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-white font-semibold mb-2">Failed to Load Classes</h3>
            <p className="text-gray-400 text-sm mb-4">{error}</p>
            <button
              onClick={loadClasses}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium"
            >
              Retry
            </button>
          </div>
        )}

        {!isLoading && (
          <>
            {activeView === 'day' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={20} className="text-gray-400" />
              <h2 className="text-white text-lg font-semibold">
                Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
              </h2>
            </div>
            
            <div className="space-y-4">
              {todayClasses.length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
                  <h3 className="text-white font-semibold mb-2">
                    {apiClasses.length === 0 ? 'No Data Available' : 'No Classes Today'}
                  </h3>
                  <p className="text-gray-400 text-sm">
                    {apiClasses.length === 0 ? 'Please check your connection and try again' : 'Enjoy your free day!'}
                  </p>
                </div>
              ) : (
                todayClasses.map((classItem) => (
                  <div 
                    key={classItem.id} 
                    className={`p-4 rounded-2xl border ${
                      classItem.status === 'current'
                        ? 'bg-blue-600/20 border-blue-500'
                        : 'bg-gray-800 border-white/10'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-white font-semibold text-lg mb-1">{classItem.name}</h3>
                        <p className="text-gray-400 text-sm">{classItem.instructor}</p>
                        <p className="text-gray-500 text-xs">{classItem.code}</p>
                      </div>
                      {classItem.status === 'current' && (
                        <span className="px-2 py-1 bg-blue-600 text-white text-xs font-semibold rounded-full">
                          LIVE
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Clock size={14} className="text-gray-400" />
                        <span className="text-gray-300">
                          {formatTime(classItem.schedule.startTime)} - {formatTime(classItem.schedule.endTime)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-gray-300">{classItem.room}</span>
                      </div>
                      {user?.role === 'faculty' && (
                        <div className="flex items-center gap-2">
                          <Users size={14} className="text-gray-400" />
                          <span className="text-gray-300">{classItem.students.length}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {activeView === 'week' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={20} className="text-gray-400" />
              <h2 className="text-white text-lg font-semibold">This Week</h2>
            </div>
            
            <div className="space-y-6">
              {Object.entries(weekSchedule).map(([day, dayClasses]) => (
                <div key={day}>
                  <h3 className="text-white font-semibold mb-3">{day}</h3>
                  {dayClasses.length === 0 ? (
                    <p className="text-gray-500 text-sm mb-4">No classes</p>
                  ) : (
                    <div className="space-y-3 mb-4">
                      {dayClasses.map((classItem, index) => (
                        <div key={`${classItem.id}-${index}`} className="p-3 bg-gray-800 rounded-xl border border-white/10">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="text-white font-medium">{classItem.name}</h4>
                              <p className="text-gray-400 text-sm">{classItem.instructor}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-gray-300 text-sm">
                                {formatTime(classItem.schedule.startTime)} - {formatTime(classItem.schedule.endTime)}
                              </p>
                              <p className="text-gray-500 text-xs">{classItem.room}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {activeView === 'month' && (
          <>
            <div className="flex items-center gap-3 mb-6">
              <Calendar size={20} className="text-gray-400" />
              <h2 className="text-white text-lg font-semibold">
                {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h2>
            </div>
            
            <div className="text-center py-12">
              <Calendar className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-white font-semibold mb-2">Month View</h3>
              <p className="text-gray-400 text-sm">Calendar view coming soon</p>
            </div>
          </>
        )}
        </>
        )}
      </div>
    </div>
  );
}