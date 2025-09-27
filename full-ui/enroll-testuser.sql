-- Option 2: Enroll testuser in courses so they have proper class access
-- This ensures the user has legitimate access to classes

-- Get testuser ID: 9c657459-0529-4ea8-94a2-7ea5f4413ba9

-- Enroll testuser in Database Management Systems
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES
('77777777-7777-7777-7777-777777777001', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333003', NOW(), 'active');

-- Enroll testuser in Probabilistic Reasoning  
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES
('77777777-7777-7777-7777-777777777002', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333001', NOW(), 'active');

-- Enroll testuser in Soft Skills II
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES
('77777777-7777-7777-7777-777777777003', '9c657459-0529-4ea8-94a2-7ea5f4413ba9', '33333333-3333-3333-3333-333333333007', NOW(), 'active');

-- Note: This gives testuser legitimate access to courses and their classes