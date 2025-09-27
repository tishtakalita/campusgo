-- Complete AIE C Timetable Update
-- This script adds all the classes from Monday to Friday based on the provided CSV

-- First, let's clear the existing data and start fresh
-- Delete in correct order to respect foreign key constraints
DELETE FROM current_sessions;
DELETE FROM assignment_submissions; 
DELETE FROM files WHERE assignment_id IS NOT NULL;  -- Delete files linked to assignments
DELETE FROM assignments;
DELETE FROM files WHERE project_id IS NOT NULL;     -- Delete files linked to projects
DELETE FROM project_members;  -- Delete project members before projects
DELETE FROM projects;
DELETE FROM notifications;
DELETE FROM classes;
DELETE FROM enrollments;  -- Delete enrollments before courses
DELETE FROM courses WHERE code NOT IN ('22AIE301', '22AIE302', '22AIE303', '22AIE304', '22AIE305', '19SSK301', '22AIE438', '22AIE452');

-- Insert all courses first
INSERT INTO courses (id, code, name, description, credits, semester, year, department_id, created_at) VALUES
-- Core courses
('11111111-1111-1111-1111-111111111301', '22AIE301', 'Probabilistic Reasoning', 'Theory and applications of probabilistic reasoning in AI', 4, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW()),
('11111111-1111-1111-1111-111111111302', '22AIE302', 'Formal Language and Automata', 'Theory of formal languages and finite automata', 4, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW()),
('11111111-1111-1111-1111-111111111303', '22AIE303', 'Database Management Systems', 'Design and implementation of database systems', 4, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW()),
('11111111-1111-1111-1111-111111111304', '22AIE304', 'Deep Learning', 'Neural networks and deep learning architectures', 4, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW()),
('11111111-1111-1111-1111-111111111305', '22AIE305', 'Introduction to Cloud Computing', 'Cloud computing concepts and technologies', 4, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW()),
-- Soft skills
('11111111-1111-1111-1111-111111111306', '19SSK301', 'Soft Skills II', 'Communication and interpersonal skills development', 2, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW()),
-- Electives
('11111111-1111-1111-1111-111111111438', '22AIE438', 'Biomedical Signal Processing', 'Processing and analysis of biomedical signals', 3, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW()),
('11111111-1111-1111-1111-111111111452', '22AIE452', 'Data Driven Material Modelling', 'Computational modeling of materials using data', 3, 5, 2023, '77777777-7777-7777-7777-777777777001', NOW())
ON CONFLICT (code) DO NOTHING;

-- Now insert all classes for the complete week schedule
INSERT INTO classes (id, course_id, title, description, room, start_time, end_time, day_of_week, is_recurring, status, created_at, instructor) VALUES

-- MONDAY CLASSES
('55555555-5555-5555-5555-555555555001', '11111111-1111-1111-1111-111111111303', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4', '2023-09-25 08:50:00+00:00', '2023-09-25 09:40:00+00:00', 1, true, 'active', NOW(), 'Dr. Archuda'),
('55555555-5555-5555-5555-555555555002', '11111111-1111-1111-1111-111111111303', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4', '2023-09-25 09:40:00+00:00', '2023-09-25 10:30:00+00:00', 1, true, 'active', NOW(), 'Dr. Archuda'),
('55555555-5555-5555-5555-555555555003', '11111111-1111-1111-1111-111111111301', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4', '2023-09-25 10:45:00+00:00', '2023-09-25 11:35:00+00:00', 1, true, 'active', NOW(), 'Dr. Milton Mondal'),
('55555555-5555-5555-5555-555555555004', '11111111-1111-1111-1111-111111111301', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4', '2023-09-25 11:35:00+00:00', '2023-09-25 12:25:00+00:00', 1, true, 'active', NOW(), 'Dr. Milton Mondal'),
('55555555-5555-5555-5555-555555555005', '11111111-1111-1111-1111-111111111306', 'Soft Skills II', 'Theory class for Soft Skills II', 'Academic Block 4', '2023-09-25 13:15:00+00:00', '2023-09-25 14:05:00+00:00', 1, true, 'active', NOW(), 'TBA'),
('55555555-5555-5555-5555-555555555006', '11111111-1111-1111-1111-111111111306', 'Soft Skills II', 'Theory class for Soft Skills II', 'Academic Block 4', '2023-09-25 14:05:00+00:00', '2023-09-25 14:55:00+00:00', 1, true, 'active', NOW(), 'TBA'),
('55555555-5555-5555-5555-555555555007', '11111111-1111-1111-1111-111111111306', 'Soft Skills II', 'Theory class for Soft Skills II', 'Academic Block 4', '2023-09-25 14:55:00+00:00', '2023-09-25 15:45:00+00:00', 1, true, 'active', NOW(), 'TBA'),

-- TUESDAY CLASSES
('55555555-5555-5555-5555-555555555008', '11111111-1111-1111-1111-111111111302', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4', '2023-09-26 08:50:00+00:00', '2023-09-26 09:40:00+00:00', 2, true, 'active', NOW(), 'Prof. Soman K P'),
('55555555-5555-5555-5555-555555555009', '11111111-1111-1111-1111-111111111302', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4', '2023-09-26 09:40:00+00:00', '2023-09-26 10:30:00+00:00', 2, true, 'active', NOW(), 'Prof. Soman K P'),
('55555555-5555-5555-5555-555555555010', '11111111-1111-1111-1111-111111111305', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4', '2023-09-26 10:45:00+00:00', '2023-09-26 11:35:00+00:00', 2, true, 'active', NOW(), 'Ms. Prajisha C'),
('55555555-5555-5555-5555-555555555011', '11111111-1111-1111-1111-111111111305', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4', '2023-09-26 11:35:00+00:00', '2023-09-26 12:25:00+00:00', 2, true, 'active', NOW(), 'Ms. Prajisha C'),
('55555555-5555-5555-5555-555555555012', '11111111-1111-1111-1111-111111111304', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4', '2023-09-26 13:15:00+00:00', '2023-09-26 14:05:00+00:00', 2, true, 'active', NOW(), 'Dr. Prem Jagadeesan'),
('55555555-5555-5555-5555-555555555013', '11111111-1111-1111-1111-111111111304', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4', '2023-09-26 14:05:00+00:00', '2023-09-26 14:55:00+00:00', 2, true, 'active', NOW(), 'Dr. Prem Jagadeesan'),
('55555555-5555-5555-5555-555555555014', '11111111-1111-1111-1111-111111111304', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4', '2023-09-26 14:55:00+00:00', '2023-09-26 15:45:00+00:00', 2, true, 'active', NOW(), 'Dr. Prem Jagadeesan'),

-- WEDNESDAY CLASSES
('55555555-5555-5555-5555-555555555015', '11111111-1111-1111-1111-111111111301', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4', '2023-09-27 08:50:00+00:00', '2023-09-27 09:40:00+00:00', 3, true, 'active', NOW(), 'Dr. Milton Mondal'),
('55555555-5555-5555-5555-555555555016', '11111111-1111-1111-1111-111111111301', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4', '2023-09-27 09:40:00+00:00', '2023-09-27 10:30:00+00:00', 3, true, 'active', NOW(), 'Dr. Milton Mondal'),
('55555555-5555-5555-5555-555555555017', '11111111-1111-1111-1111-111111111438', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4', '2023-09-27 10:45:00+00:00', '2023-09-27 11:35:00+00:00', 3, true, 'active', NOW(), 'Dr. Amrutha V'),
('55555555-5555-5555-5555-555555555018', '11111111-1111-1111-1111-111111111438', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4', '2023-09-27 11:35:00+00:00', '2023-09-27 12:25:00+00:00', 3, true, 'active', NOW(), 'Dr. Amrutha V'),
('55555555-5555-5555-5555-555555555019', '11111111-1111-1111-1111-111111111305', 'Introduction to Cloud Computing Lab', 'Lab session for Introduction to Cloud Computing', 'Academic Block 4', '2023-09-27 13:15:00+00:00', '2023-09-27 14:05:00+00:00', 3, true, 'active', NOW(), 'Ms. Prajisha C'),
('55555555-5555-5555-5555-555555555020', '11111111-1111-1111-1111-111111111301', 'Probabilistic Reasoning Lab', 'Lab session for Probabilistic Reasoning', 'Academic Block 4', '2023-09-27 14:05:00+00:00', '2023-09-27 14:55:00+00:00', 3, true, 'active', NOW(), 'Dr. Milton Mondal'),
('55555555-5555-5555-5555-555555555021', '11111111-1111-1111-1111-111111111304', 'Deep Learning Lab', 'Lab session for Deep Learning', 'Academic Block 4', '2023-09-27 14:55:00+00:00', '2023-09-27 15:45:00+00:00', 3, true, 'active', NOW(), 'Dr. Prem Jagadeesan'),

-- THURSDAY CLASSES
('55555555-5555-5555-5555-555555555022', '11111111-1111-1111-1111-111111111304', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4', '2023-09-28 08:50:00+00:00', '2023-09-28 09:40:00+00:00', 4, true, 'active', NOW(), 'Dr. Prem Jagadeesan'),
('55555555-5555-5555-5555-555555555023', '11111111-1111-1111-1111-111111111304', 'Deep Learning', 'Theory class for Deep Learning', 'Academic Block 4', '2023-09-28 09:40:00+00:00', '2023-09-28 10:30:00+00:00', 4, true, 'active', NOW(), 'Dr. Prem Jagadeesan'),
('55555555-5555-5555-5555-555555555024', '11111111-1111-1111-1111-111111111303', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4', '2023-09-28 10:45:00+00:00', '2023-09-28 11:35:00+00:00', 4, true, 'active', NOW(), 'Dr. Archuda'),
('55555555-5555-5555-5555-555555555025', '11111111-1111-1111-1111-111111111303', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4', '2023-09-28 11:35:00+00:00', '2023-09-28 12:25:00+00:00', 4, true, 'active', NOW(), 'Dr. Archuda'),
('55555555-5555-5555-5555-555555555026', '11111111-1111-1111-1111-111111111302', 'Formal Language and Automata Lab', 'Lab session for Formal Language and Automata', 'Academic Block 4', '2023-09-28 13:15:00+00:00', '2023-09-28 14:05:00+00:00', 4, true, 'active', NOW(), 'Prof. Soman K P'),
('55555555-5555-5555-5555-555555555027', '11111111-1111-1111-1111-111111111303', 'Database Management Systems Lab', 'Lab session for Database Management Systems', 'Academic Block 4', '2023-09-28 14:05:00+00:00', '2023-09-28 14:55:00+00:00', 4, true, 'active', NOW(), 'Dr. Archuda'),

-- FRIDAY CLASSES
('55555555-5555-5555-5555-555555555028', '11111111-1111-1111-1111-111111111438', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4', '2023-09-29 08:50:00+00:00', '2023-09-29 09:40:00+00:00', 5, true, 'active', NOW(), 'Dr. Amrutha V'),
('55555555-5555-5555-5555-555555555029', '11111111-1111-1111-1111-111111111438', 'Biomedical Signal Processing', 'Theory class for Biomedical Signal Processing', 'Academic Block 4', '2023-09-29 09:40:00+00:00', '2023-09-29 10:30:00+00:00', 5, true, 'active', NOW(), 'Dr. Amrutha V'),
('55555555-5555-5555-5555-555555555030', '11111111-1111-1111-1111-111111111302', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4', '2023-09-29 10:45:00+00:00', '2023-09-29 11:35:00+00:00', 5, true, 'active', NOW(), 'Prof. Soman K P'),
('55555555-5555-5555-5555-555555555031', '11111111-1111-1111-1111-111111111302', 'Formal Language and Automata', 'Theory class for Formal Language and Automata', 'Academic Block 4', '2023-09-29 11:35:00+00:00', '2023-09-29 12:25:00+00:00', 5, true, 'active', NOW(), 'Prof. Soman K P'),
('55555555-5555-5555-5555-555555555032', '11111111-1111-1111-1111-111111111305', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4', '2023-09-29 13:15:00+00:00', '2023-09-29 14:05:00+00:00', 5, true, 'active', NOW(), 'Ms. Prajisha C'),
('55555555-5555-5555-5555-555555555033', '11111111-1111-1111-1111-111111111305', 'Introduction to Cloud Computing', 'Theory class for Introduction to Cloud Computing', 'Academic Block 4', '2023-09-29 14:05:00+00:00', '2023-09-29 14:55:00+00:00', 5, true, 'active', NOW(), 'Ms. Prajisha C'),
('55555555-5555-5555-5555-555555555034', '11111111-1111-1111-1111-111111111438', 'Biomedical Signal Processing Lab', 'Lab session for Biomedical Signal Processing', 'Academic Block 4', '2023-09-29 14:55:00+00:00', '2023-09-29 15:45:00+00:00', 5, true, 'active', NOW(), 'Dr. Amrutha V');

-- Also enroll our test user in some courses so they can see classes
INSERT INTO enrollments (id, user_id, course_id, enrollment_date, status, grade, semester, year) VALUES
('88888888-8888-8888-8888-888888888001', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '11111111-1111-1111-1111-111111111301', NOW(), 'active', NULL, 5, 2023),
('88888888-8888-8888-8888-888888888002', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '11111111-1111-1111-1111-111111111302', NOW(), 'active', NULL, 5, 2023),
('88888888-8888-8888-8888-888888888003', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '11111111-1111-1111-1111-111111111303', NOW(), 'active', NULL, 5, 2023),
('88888888-8888-8888-8888-888888888004', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '11111111-1111-1111-1111-111111111304', NOW(), 'active', NULL, 5, 2023),
('88888888-8888-8888-8888-888888888005', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '11111111-1111-1111-1111-111111111305', NOW(), 'active', NULL, 5, 2023),
('88888888-8888-8888-8888-888888888006', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '11111111-1111-1111-1111-111111111306', NOW(), 'active', NULL, 5, 2023),
('88888888-8888-8888-8888-888888888007', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '11111111-1111-1111-1111-111111111438', NOW(), 'active', NULL, 5, 2023)
ON CONFLICT (user_id, course_id) DO NOTHING;

-- Verify the update
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