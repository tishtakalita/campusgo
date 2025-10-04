import { useState, useEffect } from "react";
import { ArrowLeft, Calendar, Clock, MapPin, Users } from "lucide-react";
import { useUser } from "../contexts/UserContext";
import { classesAPI, Class as ApiClass } from "../services/api";

interface TimetableProps {
  onBack: () => void;
}

export function Timetable({ onBack }: TimetableProps) {
  const { user } = useUser();
  const [activeView, setActiveView] = useState<'day' | 'week'>('day');
  const [apiClasses, setApiClasses] = useState<ApiClass[]>([]);
  const [todayApiClasses, setTodayApiClasses] = useState<ApiClass[]>([]);
  const [saturdayOverride, setSaturdayOverride] = useState<ApiClass[]>([]);
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
      // Fetch both: all classes for week view and today's classes for day view
      const [allRes, todayRes] = await Promise.all([
        classesAPI.getAllClasses(),
        classesAPI.getTodaysClasses(),
      ]);

      if (allRes.error) {
        console.error('Failed to load classes (all):', allRes.error);
        setError(allRes.error);
        setApiClasses([]);
      } else {
        setApiClasses(allRes.data?.classes || []);
      }

      if (todayRes.error) {
        console.error('Failed to load today classes:', todayRes.error);
        // Don't override existing error unless both fail
        if (!allRes.error) setError(todayRes.error);
        setTodayApiClasses([]);
      } else {
        setTodayApiClasses(todayRes.data?.classes || []);
      }

      // Also fetch this week's Saturday override so it's visible in Week view
      try {
        const now = new Date();
        // Compute upcoming Saturday in this calendar week (Mon..Sun)
        const day = now.getDay(); // 0=Sun..6=Sat
        // Determine Monday start
        const mondayOffset = ((day + 6) % 7); // days since Monday
        const monday = new Date(now);
        monday.setDate(now.getDate() - mondayOffset);
        const saturday = new Date(monday);
        saturday.setDate(monday.getDate() + 5); // Monday +5 = Saturday
        const saturdayStr = `${saturday.getFullYear()}-${String(saturday.getMonth()+1).padStart(2,'0')}-${String(saturday.getDate()).padStart(2,'0')}`;
        const satRes = await classesAPI.getClassesByDate(saturdayStr);
        if (!satRes.error) {
          setSaturdayOverride(satRes.data?.classes || []);
        } else {
          setSaturdayOverride([]);
        }
      } catch (e) {
        console.warn('Failed to load Saturday override:', e);
        setSaturdayOverride([]);
      }
    } catch (err) {
      console.error('Error loading classes:', err);
      setError('Network error - please check if backend is running');
      setApiClasses([]);
      setTodayApiClasses([]);
    }
    setIsLoading(false);
  };

  // Transform API classes to match frontend format
  const transformApiClasses = (apiClassesList: ApiClass[]) => {
    // Use ENUM day_of_week directly and parse "HH:MM:SS" time strings
    return apiClassesList.map(apiClass => {
      // Parse "HH:MM:SS" to "HH:MM" for display
      const startTime = apiClass.start_time ? apiClass.start_time.slice(0, 5) : '00:00';
      const endTime = apiClass.end_time ? apiClass.end_time.slice(0, 5) : '00:00';
      // Day name from either enum string or numeric (1..7)
      const rawDay: any = (apiClass as any).day_of_week;
      let dayName = 'Monday';
      if (typeof rawDay === 'string' && rawDay) {
        dayName = rawDay.charAt(0).toUpperCase() + rawDay.slice(1);
      } else if (typeof rawDay === 'number') {
        const names = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
        const idx = Math.max(0, Math.min(6, rawDay - 1));
        dayName = names[idx] || 'Monday';
      }
      return {
        id: apiClass.id,
        name: apiClass.courses?.name || apiClass.name || 'Untitled Class',
        code: apiClass.courses?.code || apiClass.code || '',
        instructor: apiClass.instructor || '',
        room: apiClass.room || '',
        schedule: [{
          day: dayName,
          startTime: startTime,
          endTime: endTime
        }],
        students: []
      };
    });
  };

  // Use ONLY API data - NO FALLBACKS
  const allClasses = transformApiClasses(apiClasses);
  const todayTransformed = (() => {
    // For day view we rely on backend's /api/classes/today which already accounts for Saturday overrides.
    // We'll transform and override the schedule day label to today's actual day name for display consistency.
    const todayName = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    return todayApiClasses.map(apiClass => {
      const startTime = apiClass.start_time ? apiClass.start_time.slice(0, 5) : '00:00';
      const endTime = apiClass.end_time ? apiClass.end_time.slice(0, 5) : '00:00';
      return {
        id: apiClass.id,
        name: (apiClass as any).courses?.name || (apiClass as any).name || 'Untitled Class',
        code: (apiClass as any).courses?.code || (apiClass as any).code || '',
        instructor: (apiClass as any).instructor || '',
        room: (apiClass as any).room || '',
        schedule: [{ day: todayName, startTime, endTime }],
        students: []
      } as any;
    });
  })();
  
  // Filter classes based on user role
  const userClasses = user?.role === 'faculty' 
    ? allClasses.filter((cls: any) => user.facultySubjects?.includes(cls.name))
    : allClasses; // Students see all classes

  // Prepare data for today's view from todayTransformed, and compute current/upcoming status
  const todayClasses = (() => {
    const base = (user?.role === 'faculty'
      ? todayTransformed.filter((cls: any) => user.facultySubjects?.includes(cls.name))
      : todayTransformed);
    const now = new Date();
    const currentTime = now.toTimeString().slice(0, 5);
    return base.map((cls: any) => {
      const s = cls.schedule; // [{day, startTime, endTime}]
      const start = s[0]?.startTime || '00:00';
      const end = s[0]?.endTime || '23:59';
      const isCurrent = currentTime >= start && currentTime <= end;
      return { ...cls, schedule: s[0], status: isCurrent ? 'current' : 'upcoming' };
    }).sort((a: any, b: any) => a.schedule.startTime.localeCompare(b.schedule.startTime));
  })();
  
  // Debug logging
  useEffect(() => {
    console.log('🔍 Timetable Debug:');
    console.log('- API classes loaded:', apiClasses.length);
    console.log('- Raw API data sample:', apiClasses.slice(0, 2));
    console.log('- Transformed classes:', allClasses.length);
    console.log('- Transformed sample:', allClasses.slice(0, 2));
    console.log('- Today API classes loaded:', todayApiClasses.length);
    console.log('- Today transformed sample:', todayTransformed.slice(0, 2));
    console.log('- User role:', user?.role);
    console.log('- Today is:', new Date().toLocaleDateString('en-US', { weekday: 'long' }));
    console.log('- Today classes found:', todayClasses.length);
    console.log('- Today classes sample:', todayClasses.slice(0, 2));
  }, [apiClasses, allClasses, user?.role, todayApiClasses, todayTransformed, todayClasses]);

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
  
  // Transform Saturday override into the same structure used in week view if present
  const saturdayOverrideTransformed = (() => {
    if (!saturdayOverride?.length) return [] as any[];
    const startEnd = (t?: string) => (t ? t.slice(0,5) : '00:00');
    return saturdayOverride.map((apiClass: any) => ({
      id: apiClass.id,
      name: apiClass.courses?.name || apiClass.name || 'Untitled Class',
      code: apiClass.courses?.code || apiClass.code || '',
      instructor: apiClass.instructor || '',
      room: apiClass.room || '',
      schedule: { day: 'Saturday', startTime: startEnd(apiClass.start_time), endTime: startEnd(apiClass.end_time) }
    }));
  })();

  // Replace Saturday in week view with override, if available
  const weekScheduleWithSaturday = (() => {
    if (!saturdayOverrideTransformed.length) return weekSchedule;
    const clone: { [key: string]: any[] } = { ...weekSchedule };
    clone['Saturday'] = [...saturdayOverrideTransformed].sort((a, b) => a.schedule.startTime.localeCompare(b.schedule.startTime));
    return clone;
  })();

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
          {(['day', 'week'] as const).map((view) => (
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
              <h2 className="text-white text-lg font-semibold">Today's Schedule</h2>
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
                        {classItem.instructor && <p className="text-gray-400 text-sm">{classItem.instructor}</p>}
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
                      {classItem.room && (
                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-gray-400" />
                          <span className="text-gray-300">{classItem.room}</span>
                        </div>
                      )}
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
              {Object.entries(weekScheduleWithSaturday).map(([day, dayClasses]) => (
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
                              {classItem.instructor && (
                                <p className="text-gray-400 text-sm">{classItem.instructor}</p>
                              )}
                            </div>
                            <div className="text-right">
                              <p className="text-gray-300 text-sm">
                                {formatTime(classItem.schedule.startTime)} - {formatTime(classItem.schedule.endTime)}
                              </p>
                              {classItem.room && (
                                <p className="text-gray-500 text-xs">{classItem.room}</p>
                              )}
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


        </>
        )}
      </div>
    </div>
  );
}