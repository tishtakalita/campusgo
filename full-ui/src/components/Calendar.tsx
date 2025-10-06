import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Calendar as CalendarIcon, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import api, { CalendarEvent, coursesAPI, directoryAPI } from '../services/api';
import { useUser } from '../contexts/UserContext';

interface CalendarProps {
  onNavigate?: (view: string) => void;
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function Calendar({ onNavigate }: CalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showCreateEventModal, setShowCreateEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);
  const [courses, setCourses] = useState<Array<{ id: string; name?: string; code?: string }>>([]);
  const [classes, setClasses] = useState<Array<{ id: string; academic_year?: string; section?: string; dept?: string; class?: string }>>([]);
  const { user } = useUser();

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth() + 1;

  // TODO: Replace with actual authenticated user id once auth is wired here
  const getCurrentUserId = () => {
    // Try to read cached user from localStorage (if any), else undefined
    try {
      // Primary key used by app
      const storedPrimary = localStorage.getItem('campusgo_user');
      if (storedPrimary) {
        const parsed = JSON.parse(storedPrimary);
        return parsed?.id;
      }
      // Fallback legacy key names
      const storedLegacy = localStorage.getItem('currentUser');
      if (storedLegacy) {
        const parsed = JSON.parse(storedLegacy);
        return parsed?.id || parsed?.user?.id;
      }
    } catch {}
    return undefined;
  };

  // Fetch events for the current month
  const fetchEvents = async (year: number, month: number) => {
    setLoading(true);
    try {
      const userId = getCurrentUserId();
      const res = await api.calendar.getMonth(year, month, userId);
      if (res.data) {
        setEvents(res.data.events_by_date || {});
      } else {
        // Backend returned no data structure
        setEvents({});
      }
    } catch (error) {
      console.error('Error fetching events:', error);
      setEvents({});
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents(currentYear, currentMonth);
  }, [currentYear, currentMonth]);

  useEffect(() => {
    // Preload courses for faculty event creation
    (async () => {
      try {
        const res = await coursesAPI.getAllCourses();
        if (!res.error && res.data?.courses) setCourses(res.data.courses as any);
      } catch {}
    })();
    // Preload classes for class_id selection (filter by dept when available)
    (async () => {
      try {
        const res = await directoryAPI.listClasses();
        if (!res.error && res.data?.classes) setClasses(res.data.classes as any);
      } catch {}
    })();
  }, []);

  // Helper: format Date as local YYYY-MM-DD (avoid UTC shifts from toISOString)
  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Save handler for unified form (create or update)
  const saveEvent = async (payload: Omit<CalendarEvent, 'id'>) => {
    const userId = getCurrentUserId();
    const toSend: CalendarEvent = {
      ...payload,
      created_by: payload.created_by || userId,
    };

    try {
      if (editingEvent?.id) {
        const updateRes = await api.calendar.updateEvent(editingEvent.id, toSend);
        if (updateRes.error) throw new Error(updateRes.error);
      } else {
        const res = await api.calendar.createEvent(toSend);
        if (res.error) throw new Error(res.error);
      }
      await fetchEvents(currentYear, currentMonth);
      setShowCreateEventModal(false);
      setEditingEvent(null);
    } catch (err) {
      alert('Failed to save event. Please try again.');
    }
  };

  // Delete event (personal or faculty-owned)
  const deleteEvent = async (eventId: string) => {
    try {
      await api.calendar.deleteEvent(eventId);
      await fetchEvents(currentYear, currentMonth);
      setSelectedEvent(null);
    } catch (e) {
      alert('Failed to delete event');
    }
  };

  // Navigation functions
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 2, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth, 1));
  };


  // Generate calendar days (exactly 42 days for 6 weeks)
  const generateCalendarDays = () => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const startDate = new Date(firstDay);
    
    // Start from the Sunday of the week containing the first day
    startDate.setDate(startDate.getDate() - firstDay.getDay());

    const days = [];
    const currentDateObj = new Date();
    
    // Generate exactly 42 days (6 weeks * 7 days)
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
  // Use local date string for indexing to match server-side YYYY-MM-DD keys
  const dateStr = toLocalYMD(date);
      const isCurrentMonth = date.getMonth() === currentMonth - 1;
      const isToday = date.toDateString() === currentDateObj.toDateString();
      const dayEvents = events[dateStr] || [];

      days.push({
        date,
        dateStr,
        isCurrentMonth,
        isToday,
        events: dayEvents,
        dayNumber: date.getDate()
      });
    }

    return days;
  };

  const calendarDays = generateCalendarDays();

  // Determine display color for an event
  const getEventColor = (color?: string) => color || '#6b7280';

  return (
    <div className="flex flex-col h-full bg-gray-900 text-white">
      {/* Header */}
      <div className="p-5 border-b border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => (onNavigate ? onNavigate('dashboard') : window.history.back())}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              aria-label="Back"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
            <CalendarIcon size={24} className="text-blue-400" />
            <h1 className="text-2xl font-bold">Calendar</h1>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              onClick={() => { setEditingEvent(null); setShowCreateEventModal(true); }}
            >
              <Plus size={16} />
              Create Event
            </button>
          </div>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={goToPreviousMonth}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronLeft size={20} />
            </button>
            
            <h2 className="text-xl font-semibold min-w-[200px] text-center">
              {MONTH_NAMES[currentMonth - 1]} {currentYear}
            </h2>
            
            <button
              onClick={goToNextMonth}
              className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            >
              <ChevronRight size={20} />
            </button>
          </div>

          <div className="flex items-center gap-3"></div>
        </div>
      </div>

      {/* Calendar Grid */}
      <div className="flex-1 p-5">
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <div className="text-gray-400">Loading calendar...</div>
            </div>
          </div>
        ) : (
          <div className="bg-gray-800 rounded-2xl overflow-hidden w-full" style={{ maxWidth: '100%' }}>
            {/* Day Headers */}
            <div 
              className="border-b border-gray-700"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(7, 1fr)',
                width: '100%'
              }}
            >
              {DAY_NAMES.map((day) => (
                <div key={day} className="p-3 text-center font-medium text-gray-300 bg-gray-700 border-r border-gray-600 last:border-r-0">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days - Monthly Grid Layout */}
            <div className="w-full" style={{ display: 'block' }}>
              {/* Create 6 weeks (rows) */}
              {Array.from({ length: 6 }, (_, weekIndex) => (
                <div 
                  key={weekIndex} 
                  className="border-b border-gray-700 last:border-b-0"
                  style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    width: '100%'
                  }}
                >
                  {Array.from({ length: 7 }, (_, dayIndex) => {
                    const dayNumber = weekIndex * 7 + dayIndex;
                    const day = calendarDays[dayNumber];
                    
                    if (!day) return null;
                    
                    return (
                      <div
                        key={dayNumber}
                        className={`border-r border-gray-700 last:border-r-0 flex flex-col ${
                          !day.isCurrentMonth ? 'bg-gray-850 text-gray-500' : 'bg-gray-800'
                        } ${day.isToday ? 'bg-blue-900/30 border-blue-500' : ''}`}
                        style={{
                          height: '80px',
                          padding: '8px',
                          minWidth: '0',
                          display: 'flex',
                          flexDirection: 'column'
                        }}
                      >
                        {/* Day Number */}
                        <div className={`text-sm font-medium mb-1 ${
                          day.isToday ? 'text-blue-400 bg-blue-500 w-6 h-6 rounded-full flex items-center justify-center text-xs' : 
                          day.isCurrentMonth ? 'text-white' : 'text-gray-500'
                        }`}>
                          {day.dayNumber}
                        </div>

                        {/* Events */}
                        <div className="flex-1 space-y-1 overflow-hidden">
                          {/* Render events from Supabase only */}
                          {day.events.slice(0, 2).map((event: any) => (
                            <div
                              key={event.id}
                              className="text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity truncate"
                              style={{ backgroundColor: getEventColor(event.color) + '30' }}
                              onClick={() => setSelectedEvent(event)}
                              title={event.title}
                            >
                              <div 
                                className="font-medium truncate" 
                                style={{ color: getEventColor(event.color) }}
                              >
                                {event.title}
                              </div>
                              {event.start_time && !event.is_all_day && (
                                <div className="text-gray-400 text-xs">
                                  {new Date(`2000-01-01T${event.start_time}`).toLocaleTimeString('en-US', { 
                                    hour: 'numeric', 
                                    minute: '2-digit',
                                    hour12: true 
                                  })}
                                </div>
                              )}
                            </div>
                          ))}
                          
                          {day.events.length > 2 && (
                            <div className="text-xs text-gray-400 cursor-pointer hover:text-blue-400 pl-1">
                              +{day.events.length - 2} more
                            </div>
                          )}

                          {day.events.length === 0 && day.isCurrentMonth && (
                            <div className="text-xs text-gray-600 pl-1 pt-2">
                              No events
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-md w-full">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedEvent.title}</h3>
                {/* Badge can be reintroduced later for categories; for now rely on color */}
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-gray-400 hover:text-white text-xl"
              >
                ×
              </button>
            </div>

            <div className="space-y-3 text-sm">
              {selectedEvent.description && (
                <p className="text-gray-300">{selectedEvent.description}</p>
              )}
              
              <div className="flex items-center gap-2 text-gray-400">
                <CalendarIcon size={16} />
                <span>{new Date(selectedEvent.start_date).toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}</span>
              </div>

              {selectedEvent.start_time && !selectedEvent.is_all_day && (
                <div className="flex items-center gap-2 text-gray-400">
                  <Clock size={16} />
                  <span>
                    {new Date(`2000-01-01T${selectedEvent.start_time}`).toLocaleTimeString('en-US', { 
                      hour: 'numeric', 
                      minute: '2-digit',
                      hour12: true 
                    })}
                    {selectedEvent.end_time && (
                      ` - ${new Date(`2000-01-01T${selectedEvent.end_time}`).toLocaleTimeString('en-US', { 
                        hour: 'numeric', 
                        minute: '2-digit',
                        hour12: true 
                      })}`
                    )}
                  </span>
                </div>
              )}

              {selectedEvent.location && (
                <div className="flex items-center gap-2 text-gray-400">
                  <MapPin size={16} />
                  <span>{selectedEvent.location}</span>
                </div>
              )}

              {/* Course details not available on CalendarEvent; can be extended if backend includes it */}

              {selectedEvent.is_personal && (
                <div className="flex items-center gap-2 text-blue-400 text-xs">
                  <span className="px-2 py-1 bg-blue-500/20 rounded">Personal Event</span>
                </div>
              )}
            </div>

            {/* Owner actions: allow edit/delete if current user created this event */}
            {(() => {
              const uid = getCurrentUserId();
              const isOwner = uid && selectedEvent.created_by && String(selectedEvent.created_by) === String(uid);
              return isOwner;
            })() && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setEditingEvent(selectedEvent);
                    setShowCreateEventModal(true);
                    setSelectedEvent(null);
                  }}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Edit size={16} />
                  Edit
                </button>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete this event?')) {
                      if (selectedEvent.id) deleteEvent(selectedEvent.id);
                      else setSelectedEvent(null);
                    }
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Trash2 size={16} />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Create/Edit Event Modal */}
      {showCreateEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">{editingEvent ? 'Edit Event' : 'Create Event'}</h3>
              <button
                onClick={() => {
                  setShowCreateEventModal(false);
                  setEditingEvent(null);
                }}
                className="text-gray-400 hover:text-white text-xl"
              >
                <X size={24} />
              </button>
            </div>

            <CreateEventForm
              event={editingEvent}
              onSave={saveEvent}
              onCancel={() => {
                setShowCreateEventModal(false);
                setEditingEvent(null);
              }}
              courses={courses}
              classes={classes}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Unified Create/Edit Event Form
function CreateEventForm({ event, onSave, onCancel, courses, classes }: { event?: CalendarEvent | null; onSave: (e: Omit<CalendarEvent,'id'>) => void; onCancel: () => void; courses: Array<{ id: string; name?: string; code?: string }>; classes: Array<{ id: string; academic_year?: string; section?: string; dept?: string; class?: string }> }) {
  const { user } = useUser();
  const isStudent = user?.role === 'student';
  const [formData, setFormData] = useState({
    is_personal: isStudent ? true : (event?.is_personal ?? false),
    title: event?.title || '',
    description: event?.description || '',
  // no event_type in new schema
    course_id: event?.course_id || '',
    assignment_id: event?.assignment_id || '',
  class: (event as any)?.class || '',
    start_date: event?.start_date || (() => { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; })(),
    is_all_day: event?.is_all_day || false,
    start_time: event?.start_time?.slice(0,5) || '',
    end_time: event?.end_time?.slice(0,5) || '',
    priority: event?.priority || 'medium',
  // status removed from schema
    color: event?.color || '#3b82f6',
    location: event?.location || ''
  });

  const [assignments, setAssignments] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    const loadAssignments = async () => {
      if (!formData.course_id) { setAssignments([]); return; }
      try {
        const res = await api.assignments.getAssignmentsByCourse(formData.course_id);
        if (!res.error && res.data?.assignments) {
          const simplified = res.data.assignments.map(a => ({ id: a.id, title: a.title }));
          setAssignments(simplified);
        } else {
          setAssignments([]);
        }
      } catch {
        setAssignments([]);
      }
    };
    loadAssignments();
  }, [formData.course_id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) { alert('Title is required'); return; }
    if (!formData.start_date) { alert('Start date is required'); return; }
    // Class requirements: required only for non-personal events
    if (!formData.is_personal) {
      if (!formData.class || formData.class.trim() === '') { alert('Please choose a class.'); return; }
    }
    if (!formData.is_personal) {
      // For general events, require a course for logical scoping
      if (!formData.course_id) { alert('Please choose a course for non-personal events.'); return; }
    }
    // end_date removed from schema

    const norm = (t?: string) => (t && t.length === 5 ? `${t}:00` : t);
    onSave({
      is_personal: formData.is_personal,
      title: formData.title,
      description: formData.description || undefined,
  // no event_type in new schema
      start_date: formData.start_date,
  // end_date removed from schema
      is_all_day: formData.is_all_day,
      start_time: formData.is_all_day ? undefined : norm(formData.start_time) as any,
      end_time: formData.is_all_day ? undefined : norm(formData.end_time) as any,
      priority: formData.priority as any,
  // status removed from schema
      color: formData.color,
      location: formData.location || undefined,
      course_id: formData.course_id || undefined,
      assignment_id: formData.assignment_id || undefined,
      class: formData.class ? formData.class : undefined,
      created_by: user?.id
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="flex items-center gap-2">
        <input type="checkbox" id="is-personal" checked={formData.is_personal} onChange={e => setFormData({ ...formData, is_personal: e.target.checked })} disabled={isStudent} />
        <label htmlFor="is-personal" className="text-sm text-gray-300">Personal event</label>
        {isStudent && <span className="text-xs text-gray-400">(Students can create only personal events)</span>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Title *</label>
          <input className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})} />
        </div>
        {/* event_type removed from schema */}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Description</label>
        <textarea className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" rows={3} value={formData.description} onChange={e=>setFormData({...formData, description: e.target.value})} />
      </div>

      {!formData.is_personal && (
        <>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Course *</label>
            <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.course_id} onChange={e=>setFormData({...formData, course_id: e.target.value, assignment_id: ''})}>
              <option value="">Select a course</option>
              {courses.map(c => (
                <option key={c.id} value={c.id}>{(c.code || 'COURSE')} - {(c.name || 'Untitled')}</option>
              ))}
            </select>
          </div>

          {assignments.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Linked Assignment</label>
              <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.assignment_id} onChange={e=>setFormData({...formData, assignment_id: e.target.value})}>
                <option value="">None</option>
                {assignments.map(a => (
                  <option key={a.id} value={a.id}>{a.title}</option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Class *</label>
            <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.class} onChange={e=>setFormData({...formData, class: e.target.value})}>
              <option value="">Select a class</option>
              {classes.map(cls => (
                <option key={cls.id} value={cls.class || ''}>{cls.class || `${cls.dept || ''} ${cls.academic_year || ''} ${cls.section || ''}`}</option>
              ))}
            </select>
          </div>
        </>
      )}

      {/* For personal events (any role), class is optional */}
      {formData.is_personal && (
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Class (optional)</label>
          <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.class} onChange={e=>setFormData({...formData, class: e.target.value})}>
            <option value="">None</option>
            {classes.map(cls => (
              <option key={cls.id} value={cls.class || ''}>{cls.class || `${cls.dept || ''} ${cls.academic_year || ''} ${cls.section || ''}`}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Start Date *</label>
        <input type="date" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.start_date} onChange={e=>setFormData({...formData, start_date: e.target.value})} />
      </div>

      <div className="flex items-center gap-2">
        <input type="checkbox" id="all-day" checked={formData.is_all_day} onChange={e=>setFormData({...formData, is_all_day: e.target.checked})} />
        <label htmlFor="all-day" className="text-sm text-gray-300">All Day</label>
      </div>

      {!formData.is_all_day && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Start Time</label>
            <input type="time" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.start_time} onChange={e=>setFormData({...formData, start_time: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">End Time</label>
            <input type="time" className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.end_time} onChange={e=>setFormData({...formData, end_time: e.target.value})} />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
        <select className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.priority} onChange={e=>setFormData({...formData, priority: e.target.value})}>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Color</label>
        <div className="flex gap-2">
          {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-full border-2 ${formData.color === color ? 'border-white' : 'border-gray-600'}`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
        <input className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" value={formData.location} onChange={e=>setFormData({...formData, location: e.target.value})} />
      </div>

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel} className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg">Cancel</button>
        <button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg">{event ? 'Update Event' : 'Create Event'}</button>
      </div>
    </form>
  );
}