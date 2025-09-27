-- Add Missing Classes for Complete Weekly Timetable
-- This script adds Tuesday through Friday classes without deleting existing data

-- All courses should already exist from the original seed data
-- Using the correct course IDs from amrita_fixed_uuids.sql:
-- '33333333-3333-3333-3333-333333333001' = 22AIE301 (Probabilistic Reasoning)
-- '33333333-3333-3333-3333-333333333002' = 22AIE302 (Formal Language and Automata) 
-- '33333333-3333-3333-3333-333333333003' = 22AIE303 (Database Management Systems)
-- '33333333-3333-3333-3333-333333333004' = 22AIE304 (Deep Learning)
-- '33333333-3333-3333-3333-333333333005' = 22AIE305 (Introduction to Cloud Computing)
-- '33333333-3333-3333-3333-333333333006' = 22AIE438 (Biomedical Signal Processing)
-- '33333333-3333-3333-3333-333333333007' = 22AIE452 (Data Driven Material Modelling)
-- '33333333-3333-3333-3333-333333333008' = 19SSK301 (Soft Skills II)

-- Add Tuesday through Friday classes (Monday classes with IDs 55555555-5555-5555-5555-555555555001-007 already exist)
-- Using correct course IDs from the original seed data and matching the database structure
INSERT INTO classes (id, course_id, title, description, room, start_time, end_time, day_of_week, is_recurring, status, created_at, instructor_images) VALUES

-- TUESDAY CLASSES
('55555555-5555-5555-5555-555555555008', '33333333-3333-3333-3333-333333333002', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4 (specific room not specified)', '2025-09-26 08:50:00', '2025-09-26 09:40:00', 2, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555009', '33333333-3333-3333-3333-333333333002', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4 (specific room not specified)', '2025-09-26 09:40:00', '2025-09-26 10:30:00', 2, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555010', '33333333-3333-3333-3333-333333333005', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4 (specific room not specified)', '2025-09-26 10:45:00', '2025-09-26 11:35:00', 2, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555011', '33333333-3333-3333-3333-333333333005', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4 (specific room not specified)', '2025-09-26 11:35:00', '2025-09-26 12:25:00', 2, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555012', '33333333-3333-3333-3333-333333333004', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4 (specific room not specified)', '2025-09-26 13:15:00', '2025-09-26 14:05:00', 2, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555013', '33333333-3333-3333-3333-333333333004', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4 (specific room not specified)', '2025-09-26 14:05:00', '2025-09-26 14:55:00', 2, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555014', '33333333-3333-3333-3333-333333333004', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4 (specific room not specified)', '2025-09-26 14:55:00', '2025-09-26 15:45:00', 2, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),

-- WEDNESDAY CLASSES
('55555555-5555-5555-5555-555555555015', '33333333-3333-3333-3333-333333333001', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4 (specific room not specified)', '2025-09-27 08:50:00', '2025-09-27 09:40:00', 3, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555016', '33333333-3333-3333-3333-333333333001', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4 (specific room not specified)', '2025-09-27 09:40:00', '2025-09-27 10:30:00', 3, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555017', '33333333-3333-3333-3333-333333333006', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4 (specific room not specified)', '2025-09-27 10:45:00', '2025-09-27 11:35:00', 3, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555018', '33333333-3333-3333-3333-333333333006', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4 (specific room not specified)', '2025-09-27 11:35:00', '2025-09-27 12:25:00', 3, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555019', '33333333-3333-3333-3333-333333333005', 'Introduction to Cloud Computing Lab', 'Lab session for Introduction to Cloud Computing', 'Academic Block 4 (specific room not specified)', '2025-09-27 13:15:00', '2025-09-27 14:05:00', 3, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555020', '33333333-3333-3333-3333-333333333001', 'Probabilistic Reasoning Lab', 'Lab session for Probabilistic Reasoning', 'Academic Block 4 (specific room not specified)', '2025-09-27 14:05:00', '2025-09-27 14:55:00', 3, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555021', '33333333-3333-3333-3333-333333333004', 'Deep Learning Lab', 'Lab session for Deep Learning', 'Academic Block 4 (specific room not specified)', '2025-09-27 14:55:00', '2025-09-27 15:45:00', 3, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),

-- THURSDAY CLASSES
('55555555-5555-5555-5555-555555555022', '33333333-3333-3333-3333-333333333004', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4 (specific room not specified)', '2025-09-28 08:50:00', '2025-09-28 09:40:00', 4, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555023', '33333333-3333-3333-3333-333333333004', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4 (specific room not specified)', '2025-09-28 09:40:00', '2025-09-28 10:30:00', 4, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555024', '33333333-3333-3333-3333-333333333003', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4 (specific room not specified)', '2025-09-28 10:45:00', '2025-09-28 11:35:00', 4, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555025', '33333333-3333-3333-3333-333333333003', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4 (specific room not specified)', '2025-09-28 11:35:00', '2025-09-28 12:25:00', 4, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555026', '33333333-3333-3333-3333-333333333002', 'Formal Language and Automata Lab', 'Lab session for Formal Language and Automata', 'Academic Block 4 (specific room not specified)', '2025-09-28 13:15:00', '2025-09-28 14:05:00', 4, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555027', '33333333-3333-3333-3333-333333333003', 'Database Management Systems Lab', 'Lab session for Database Management Systems', 'Academic Block 4 (specific room not specified)', '2025-09-28 14:05:00', '2025-09-28 14:55:00', 4, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),

-- FRIDAY CLASSES  
('55555555-5555-5555-5555-555555555028', '33333333-3333-3333-3333-333333333006', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4 (specific room not specified)', '2025-09-29 08:50:00', '2025-09-29 09:40:00', 5, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555029', '33333333-3333-3333-3333-333333333006', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4 (specific room not specified)', '2025-09-29 09:40:00', '2025-09-29 10:30:00', 5, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555030', '33333333-3333-3333-3333-333333333002', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4 (specific room not specified)', '2025-09-29 10:45:00', '2025-09-29 11:35:00', 5, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555031', '33333333-3333-3333-3333-333333333002', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4 (specific room not specified)', '2025-09-29 11:35:00', '2025-09-29 12:25:00', 5, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555032', '33333333-3333-3333-3333-333333333005', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4 (specific room not specified)', '2025-09-29 13:15:00', '2025-09-29 14:05:00', 5, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555033', '33333333-3333-3333-3333-333333333005', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4 (specific room not specified)', '2025-09-29 14:05:00', '2025-09-29 14:55:00', 5, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555034', '33333333-3333-3333-3333-333333333006', 'Biomedical Signal Processing Lab', 'Lab session for Biomedical Signal Processing', 'Academic Block 4 (specific room not specified)', '2025-09-29 14:55:00', '2025-09-29 15:45:00', 5, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[])

ON CONFLICT (id) DO NOTHING;

-- Ensure testuser is enrolled in all courses using correct course IDs and enrollment table structure
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES
('88888888-8888-8888-8888-888888888001', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333001', CURRENT_TIMESTAMP, 'active'),
('88888888-8888-8888-8888-888888888002', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333002', CURRENT_TIMESTAMP, 'active'),
('88888888-8888-8888-8888-888888888003', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333003', CURRENT_TIMESTAMP, 'active'),
('88888888-8888-8888-8888-888888888004', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333004', CURRENT_TIMESTAMP, 'active'),
('88888888-8888-8888-8888-888888888005', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333005', CURRENT_TIMESTAMP, 'active'),
('88888888-8888-8888-8888-888888888006', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333008', CURRENT_TIMESTAMP, 'active'),
('88888888-8888-8888-8888-888888888007', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333006', CURRENT_TIMESTAMP, 'active'),
('88888888-8888-8888-8888-888888888008', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333007', CURRENT_TIMESTAMP, 'active')
ON CONFLICT (student_id, course_id) DO NOTHING;

-- Verify the result
SELECT 
  c.title,
  CASE c.day_of_week
    WHEN 1 THEN 'Monday'
    WHEN 2 THEN 'Tuesday' 
    WHEN 3 THEN 'Wednesday'
    WHEN 4 THEN 'Thursday'
    WHEN 5 THEN 'Friday'
    WHEN 6 THEN 'Saturday'
    WHEN 7 THEN 'Sunday'
  END as day_name,
  TO_CHAR(c.start_time, 'HH24:MI') as start_time,
  TO_CHAR(c.end_time, 'HH24:MI') as end_time,
  c.instructor
FROM classes c
ORDER BY c.day_of_week, c.start_time;