-- Quick Fix: Add Friday classes to the database
-- This will make Friday show classes for testing

-- Insert Friday classes (day_of_week = 5 for Friday)
INSERT INTO classes (id, course_id, title, description, room, start_time, end_time, day_of_week, is_recurring, status, created_at) VALUES
('55555555-5555-5555-5555-555555555101', '33333333-3333-3333-3333-333333333003', 'Database Management Systems - Lab', 'Practical session for Database Management Systems', 'Computer Lab 1', '2025-09-27T10:00:00', '2025-09-27T11:30:00', 5, true, 'scheduled', NOW()),
('55555555-5555-5555-5555-555555555102', '33333333-3333-3333-3333-333333333001', 'Probabilistic Reasoning - Tutorial', 'Tutorial session for Probabilistic Reasoning', 'Tutorial Room 2', '2025-09-27T13:00:00', '2025-09-27T14:30:00', 5, true, 'scheduled', NOW()),
('55555555-5555-5555-5555-555555555103', '33333333-3333-3333-3333-333333333007', 'Soft Skills II - Workshop', 'Interactive workshop for Soft Skills II', 'Seminar Hall A', '2025-09-27T14:30:00', '2025-09-27T16:00:00', 5, true, 'scheduled', NOW());

-- Note: This adds 3 Friday classes so the user will see classes on Friday