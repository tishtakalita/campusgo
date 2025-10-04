// Updated TypeScript interfaces for the new classes table structure
// File: src/types/classes.ts

// ENUM types matching the database ENUM values
export type DayOfWeek = 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';

export type TimetableType = 
  | 'regular' 
  | 'saturday_follows_monday' 
  | 'saturday_follows_tuesday' 
  | 'saturday_follows_wednesday' 
  | 'saturday_follows_thursday' 
  | 'saturday_follows_friday';

// Available day options for UI dropdowns/selects
export const DAY_OF_WEEK_OPTIONS: { value: DayOfWeek; label: string }[] = [
  { value: 'monday', label: 'Monday' },
  { value: 'tuesday', label: 'Tuesday' },
  { value: 'wednesday', label: 'Wednesday' },
  { value: 'thursday', label: 'Thursday' },
  { value: 'friday', label: 'Friday' },
  { value: 'saturday', label: 'Saturday' },
  { value: 'sunday', label: 'Sunday' }
];

export const TIMETABLE_TYPE_OPTIONS: { value: TimetableType; label: string; description: string }[] = [
  { value: 'regular', label: 'Regular Schedule', description: 'Monday to Friday normal timetable' },
  { value: 'saturday_follows_monday', label: 'Saturday → Monday', description: 'Saturday follows Monday timetable' },
  { value: 'saturday_follows_tuesday', label: 'Saturday → Tuesday', description: 'Saturday follows Tuesday timetable' },
  { value: 'saturday_follows_wednesday', label: 'Saturday → Wednesday', description: 'Saturday follows Wednesday timetable' },
  { value: 'saturday_follows_thursday', label: 'Saturday → Thursday', description: 'Saturday follows Thursday timetable' },
  { value: 'saturday_follows_friday', label: 'Saturday → Friday', description: 'Saturday follows Friday timetable' }
];

export interface Class {
  id: string;
  course_id: string;
  room: string;
  start_time: string; // Time format: "HH:MM:SS"
  end_time: string;   // Time format: "HH:MM:SS"
  day_of_week: DayOfWeek; // Single day (ENUM value)
  timetable_type: TimetableType;
  created_at: string;
  
  // Related data (from joins)
  courses?: {
    id: string;
    name: string;
    code: string;
    credits?: number;
  };
}

// For creating classes that occur on multiple days
export interface ClassTemplate {
  course_id: string;
  room: string;
  start_time: string;
  end_time: string;
  days: DayOfWeek[]; // Multiple days - will create separate Class records
  timetable_type?: TimetableType;
}

export interface CreateClassRequest {
  course_id: string;
  room: string;
  start_time: string; // "HH:MM" format
  end_time: string;   // "HH:MM" format
  day_of_week: DayOfWeek; // Single day
  timetable_type?: TimetableType;
}

export interface UpdateClassRequest extends Partial<CreateClassRequest> {
  id: string;
}

// For creating multiple class sessions at once (same time, different days)
export interface CreateMultipleClassesRequest {
  course_id: string;
  room: string;
  start_time: string;
  end_time: string;
  days: DayOfWeek[]; // Will create separate records for each day
  timetable_type?: TimetableType;
}

// Helper types for timetable management
export interface TimetableSlot {
  time: string;
  classes: Class[];
}

export interface DaySchedule {
  day: DayOfWeek;
  date?: string; // For specific date scheduling
  slots: TimetableSlot[];
}

export interface WeeklyTimetable {
  week_start: string; // ISO date string
  timetable_type: TimetableType;
  days: DaySchedule[];
}

// Utility functions for day management
export const WEEKDAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
export const ALL_DAYS: DayOfWeek[] = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const DAY_NAMES: Record<DayOfWeek, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday', 
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday'
};

export const TIMETABLE_TYPE_NAMES: Record<TimetableType, string> = {
  regular: 'Regular Schedule (Mon-Fri)',
  saturday_follows_monday: 'Saturday → Monday Schedule',
  saturday_follows_tuesday: 'Saturday → Tuesday Schedule',
  saturday_follows_wednesday: 'Saturday → Wednesday Schedule',
  saturday_follows_thursday: 'Saturday → Thursday Schedule',
  saturday_follows_friday: 'Saturday → Friday Schedule'
};

// Helper functions
export function getDayNumber(day: DayOfWeek): number {
  const dayMap: Record<DayOfWeek, number> = {
    monday: 1, tuesday: 2, wednesday: 3, thursday: 4, 
    friday: 5, saturday: 6, sunday: 0
  };
  return dayMap[day];
}

export function getCurrentDay(): DayOfWeek {
  const days: DayOfWeek[] = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  return days[new Date().getDay()];
}

export function isWeekday(day: DayOfWeek): boolean {
  return WEEKDAYS.includes(day);
}

export function formatTimeSlot(startTime: string, endTime: string): string {
  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };
  
  return `${formatTime(startTime)} - ${formatTime(endTime)}`;
}

export function getClassesForDay(classes: Class[], day: DayOfWeek, timetableType: TimetableType = 'regular'): Class[] {
  return classes.filter(cls => 
    cls.day_of_week.includes(day) && 
    cls.timetable_type === timetableType
  );
}

export function groupClassesByTime(classes: Class[]): TimetableSlot[] {
  const timeSlots = new Map<string, Class[]>();
  
  classes.forEach(cls => {
    const timeKey = `${cls.start_time}-${cls.end_time}`;
    if (!timeSlots.has(timeKey)) {
      timeSlots.set(timeKey, []);
    }
    timeSlots.get(timeKey)!.push(cls);
  });
  
  return Array.from(timeSlots.entries())
    .map(([timeKey, classes]) => ({
      time: timeKey,
      classes: classes.sort((a, b) => a.room.localeCompare(b.room))
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
}