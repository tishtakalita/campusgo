import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Plus, Clock, MapPin, Calendar as CalendarIcon, Edit, Trash2, X, ArrowLeft } from 'lucide-react';
import api, { CalendarEvent } from '../services/api';

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
  const [showAddEventModal, setShowAddEventModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null);

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

  // Helper: format Date as local YYYY-MM-DD (avoid UTC shifts from toISOString)
  const toLocalYMD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  // Add or update personal event
  const savePersonalEvent = async (event: Omit<CalendarEvent, 'id'>) => {
    // Try to persist to backend; fallback to localStorage on failure
    const userId = getCurrentUserId();
    const toSend: CalendarEvent = {
      title: event.title,
      description: event.description,
      event_type: event.event_type || 'personal',
      start_date: event.start_date,
      end_date: event.end_date,
      start_time: event.start_time,
      end_time: event.end_time,
      is_all_day: event.is_all_day,
      color: event.color,
      priority: event.priority,
      location: event.location,
      is_personal: true,
      created_by: userId,
    };

    try {
      // If editing an existing server event (uuid-like), update instead of create
      if (editingEvent && editingEvent.id && !editingEvent.id.startsWith('personal-')) {
        const updateRes = await api.calendar.updateEvent(editingEvent.id, toSend);
        if (updateRes.data?.event) {
          await fetchEvents(currentYear, currentMonth);
          setShowAddEventModal(false);
          setEditingEvent(null);
          return;
        }
      }

      const res = await api.calendar.createEvent(toSend);
      if (res.data?.event) {
        // Refresh month data to include the new event
        await fetchEvents(currentYear, currentMonth);
        setShowAddEventModal(false);
        setEditingEvent(null);
        return;
      }
      // If API returned an error, fall back to local
      throw new Error(res.error || 'Failed to create event');
    } catch (err) {
      alert('Failed to create event. Please try again.');
    }
  };

  // Delete personal event
  const deletePersonalEvent = async (eventId: string) => {
    // If this looks like a server event (uuid-like) try API delete first
    const isLocal = eventId.startsWith('personal-');
    if (!isLocal) {
      try {
        await api.calendar.deleteEvent(eventId);
        await fetchEvents(currentYear, currentMonth);
        setSelectedEvent(null);
        return;
      } catch (e) {
        console.warn('Failed to delete server event, falling back to local cleanup', e);
      }
    }
    // No local fallback anymore
    setSelectedEvent(null);
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

    console.log(`Generated ${days.length} calendar days for ${MONTH_NAMES[currentMonth - 1]} ${currentYear}`);
    return days;
  };

  const calendarDays = generateCalendarDays();

  // Get event type color
  const getEventTypeColor = (eventType: string, color?: string) => {
    if (color) return color;
    
    const colors = {
      'assignment': '#f59e0b',
      'exam': '#ef4444',
      'class': '#3b82f6',
      'meeting': '#10b981',
      'deadline': '#f59e0b',
      'event': '#8b5cf6'
    };
    
    return colors[eventType as keyof typeof colors] || '#6b7280';
  };

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
          
          <button 
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            onClick={() => setShowAddEventModal(true)}
          >
            <Plus size={16} />
            Add Personal Event
          </button>
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
                              style={{ backgroundColor: getEventTypeColor(event.event_type, event.color) + '30' }}
                              onClick={() => setSelectedEvent(event)}
                              title={event.title}
                            >
                              <div 
                                className="font-medium truncate" 
                                style={{ color: getEventTypeColor(event.event_type, event.color) }}
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
                <span 
                  className="inline-block px-2 py-1 rounded text-xs font-medium mt-2"
                  style={{
                    backgroundColor: getEventTypeColor(selectedEvent.event_type, selectedEvent.color) + '40',
                    color: getEventTypeColor(selectedEvent.event_type, selectedEvent.color)
                  }}
                >
                  {selectedEvent.event_type.charAt(0).toUpperCase() + selectedEvent.event_type.slice(1)}
                </span>
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

            {/* Personal event actions */}
            {selectedEvent.is_personal && (
              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-700">
                <button
                  onClick={() => {
                    setEditingEvent(selectedEvent);
                    setShowAddEventModal(true);
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
                      if (selectedEvent.id) {
                        deletePersonalEvent(selectedEvent.id);
                      } else {
                        setSelectedEvent(null);
                      }
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

      {/* Add/Edit Event Modal */}
      {showAddEventModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-2xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">
                {editingEvent ? 'Edit Personal Event' : 'Add Personal Event'}
              </h3>
              <button
                onClick={() => {
                  setShowAddEventModal(false);
                  setEditingEvent(null);
                }}
                className="text-gray-400 hover:text-white text-xl"
              >
                <X size={24} />
              </button>
            </div>

            <PersonalEventForm
              event={editingEvent}
              onSave={savePersonalEvent}
              onCancel={() => {
                setShowAddEventModal(false);
                setEditingEvent(null);
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Personal Event Form Component
interface PersonalEventFormProps {
  event?: CalendarEvent | null;
  onSave: (event: Omit<CalendarEvent, 'id'>) => void;
  onCancel: () => void;
}

function PersonalEventForm({ event, onSave, onCancel }: PersonalEventFormProps) {
  const [formData, setFormData] = useState({
    title: event?.title || '',
    description: event?.description || '',
    start_date: event?.start_date || (() => {
      const d = new Date();
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${y}-${m}-${day}`;
    })(),
    start_time: event?.start_time?.slice(0, 5) || '',
    end_time: event?.end_time?.slice(0, 5) || '',
    location: event?.location || '',
    priority: event?.priority || 'medium',
    color: event?.color || '#3b82f6',
    is_all_day: event?.is_all_day || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      alert('Please enter a title for the event.');
      return;
    }

    // Only include time fields if provided and not all-day
    const start_time = formData.is_all_day || !formData.start_time
      ? undefined
      : `${formData.start_time}:00`;
    const end_time = formData.is_all_day || !formData.end_time
      ? undefined
      : `${formData.end_time}:00`;

    onSave({
      title: formData.title,
      description: formData.description,
      event_type: 'event',
      start_date: formData.start_date,
      start_time,
      end_time,
      is_all_day: formData.is_all_day,
      color: formData.color,
      priority: formData.priority,
      location: formData.location,
      // Align with events table and policy: personal event
      is_personal: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Event Title *
        </label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event title"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter event description (optional)"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Date *
        </label>
        <input
          type="date"
          value={formData.start_date}
          onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="all-day"
          checked={formData.is_all_day}
          onChange={(e) => setFormData({ ...formData, is_all_day: e.target.checked })}
          className="rounded bg-gray-700 border-gray-600 text-blue-600 focus:ring-blue-500"
        />
        <label htmlFor="all-day" className="text-sm text-gray-300">
          All Day Event
        </label>
      </div>

      {!formData.is_all_day && (
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Start Time
            </label>
            <input
              type="time"
              value={formData.start_time}
              onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              End Time
            </label>
            <input
              type="time"
              value={formData.end_time}
              onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Location
        </label>
        <input
          type="text"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Enter location (optional)"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Priority
        </label>
        <select
          value={formData.priority}
          onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
          className="w-full bg-gray-700 text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Color
        </label>
        <div className="flex gap-2">
          {['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16'].map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => setFormData({ ...formData, color })}
              className={`w-8 h-8 rounded-full border-2 ${
                formData.color === color ? 'border-white' : 'border-gray-600'
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>

      <div className="flex gap-3 pt-4">
        <button
          type="submit"
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          {event ? 'Update Event' : 'Add Event'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}