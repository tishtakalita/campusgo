# Classes Table Update - Complete Implementation Guide

## Overview
This document outlines the complete update to the `classes` table structure to support more flexible scheduling with time-only fields, multiple days per class, and Saturday timetable options.

## Database Schema Changes

### Old Structure
```sql
create table public.classes (
  id uuid not null default gen_random_uuid (),
  course_id uuid not null,
  title character varying(200) not null,
  description text null,
  room character varying(100) null,
  start_time timestamp without time zone not null,
  end_time timestamp without time zone not null,
  day_of_week integer null,
  is_recurring boolean null default true,
  status public.class_status null default 'scheduled'::class_status,
  created_at timestamp without time zone null default CURRENT_TIMESTAMP,
  instructor_images text[] null,
  constraint classes_pkey primary key (id),
  constraint classes_course_id_fkey foreign KEY (course_id) references courses (id)
);
```

### New Structure
```sql
CREATE TABLE public.classes (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  course_id uuid NOT NULL,
  room character varying(100) NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  day_of_week text[] NOT NULL, -- Array of days: ['monday', 'tuesday', etc.]
  timetable_type character varying(50) NOT NULL DEFAULT 'regular',
  created_at timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT classes_pkey PRIMARY KEY (id),
  CONSTRAINT classes_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses (id),
  CONSTRAINT classes_day_of_week_check CHECK (
    day_of_week <@ ARRAY['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
  ),
  CONSTRAINT classes_timetable_type_check CHECK (
    timetable_type IN ('regular', 'saturday_alt1', 'saturday_alt2')
  )
);
```

### Key Changes Made
1. **Data Type Changes**:
   - `start_time`: `timestamp` → `time`
   - `end_time`: `timestamp` → `time`
   - `day_of_week`: `integer` → `text[]` (array of day names)

2. **Removed Fields**:
   - `title`
   - `description` 
   - `status`
   - `instructor_images`
   - `is_recurring`

3. **Made Required (NOT NULL)**:
   - `room`
   - `day_of_week`
   - `created_at`

4. **New Fields**:
   - `timetable_type`: Supports 'regular', 'saturday_alt1', 'saturday_alt2'

## Implementation Files Created

### 1. Database Migration Script
**File**: `sql_commands/update_classes_table.sql`
- Complete migration script with data transformation
- Backup creation before changes
- Index updates for performance
- Sample data insertion

### 2. TypeScript Types
**File**: `full-ui/src/types/classes.ts`
- Updated interfaces for the new structure
- Helper functions for day management
- Utility functions for time formatting
- Timetable management types

### 3. API Service Layer
**File**: `full-ui/src/services/classesAPI.ts`
- Complete API service class
- All CRUD operations
- Specialized queries (by day, by timetable type, etc.)
- Search and filtering capabilities

### 4. Backend API Endpoints
**File**: `updated_classes_api.py`
- New FastAPI endpoints for the updated structure
- Validation for days and timetable types
- Bulk operations support
- Enhanced search functionality

## Timetable Type System

### Regular Schedule (`regular`)
- Monday to Friday classes
- Standard weekly recurring schedule
- Used for most classes

### Saturday Alternatives (`saturday_alt1`, `saturday_alt2`)
- Two different Saturday timetable options
- Allows flexibility in Saturday scheduling
- Students can choose which Saturday schedule to follow

## Usage Examples

### Creating a Regular Weekday Class
```typescript
const newClass = await classesAPI.createClass({
  course_id: "course-uuid",
  room: "Room 101",
  start_time: "09:00",
  end_time: "10:30",
  day_of_week: ["monday", "wednesday", "friday"],
  timetable_type: "regular"
});
```

### Creating a Saturday Alternative Class
```typescript
const saturdayClass = await classesAPI.createClass({
  course_id: "course-uuid", 
  room: "Room 201",
  start_time: "09:00",
  end_time: "11:00",
  day_of_week: ["saturday"],
  timetable_type: "saturday_alt1"
});
```

### Getting Weekly Timetable
```typescript
// Get regular Monday-Friday schedule
const regularTimetable = await classesAPI.getWeeklyTimetable("regular");

// Get Saturday alternative schedule
const saturdayTimetable = await classesAPI.getWeeklyTimetable("saturday_alt1");
```

### Getting Classes for a Specific Day
```typescript
// Get Monday classes for regular schedule
const mondayClasses = await classesAPI.getClassesForDay("monday", "regular");

// Get Saturday classes for alternative schedule
const saturdayClasses = await classesAPI.getClassesForDay("saturday", "saturday_alt1");
```

## Migration Steps

1. **Backup Current Data**:
   ```sql
   CREATE TABLE classes_backup AS SELECT * FROM public.classes;
   ```

2. **Run Migration Script**:
   ```bash
   psql -d your_database -f sql_commands/update_classes_table.sql
   ```

3. **Update Frontend Types**:
   - Replace old class interfaces with new ones
   - Update components to use new structure

4. **Update API Endpoints**:
   - Add new endpoints to your FastAPI application
   - Test all CRUD operations

5. **Update Frontend Services**:
   - Replace API calls with new service methods
   - Update components to handle new data structure

## Benefits of New Structure

1. **Flexible Scheduling**: Classes can occur on multiple days
2. **Time-Only Storage**: More efficient for recurring weekly schedules
3. **Saturday Options**: Multiple Saturday timetable choices
4. **Simplified Schema**: Removed unused fields
5. **Better Validation**: Constraints ensure data integrity
6. **Enhanced Queries**: Better performance with proper indexing

## Testing Checklist

- [ ] Database migration completes successfully
- [ ] All existing data is properly transformed
- [ ] New API endpoints respond correctly
- [ ] Frontend components display schedules properly
- [ ] Current class detection works with time-only format
- [ ] Saturday timetable switching functions correctly
- [ ] Search and filtering work as expected
- [ ] Bulk operations complete successfully

## Next Steps

1. Run the database migration script
2. Update your backend to include the new API endpoints
3. Update frontend components to use the new TypeScript types
4. Test the Saturday timetable switching functionality
5. Verify all existing functionality still works with the new structure

This implementation provides a more flexible and maintainable scheduling system while preserving all existing functionality.