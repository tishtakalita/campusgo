-- =====================================================================
-- AMRITA UNIVERSITY - AIE C SECTION DATA REPLACEMENT (CORRECTED UUIDs)
-- CampusGo Database - Complete Data Reset for AIE C Section
-- =====================================================================
-- This script replaces all existing data with Amrita University AIE C section specific data
-- Format: cb.sc.u4aie23XXX where XXX = 2(C section) + roll number (01-60)
-- =====================================================================

-- =====================================================================
-- STEP 1: CLEAR ALL EXISTING DATA
-- =====================================================================
TRUNCATE TABLE user_activity CASCADE;
TRUNCATE TABLE search_history CASCADE;
TRUNCATE TABLE resource_downloads CASCADE;
TRUNCATE TABLE quick_access_items CASCADE;
TRUNCATE TABLE project_members CASCADE;
TRUNCATE TABLE notifications CASCADE;
TRUNCATE TABLE ideas CASCADE;
TRUNCATE TABLE files CASCADE;
TRUNCATE TABLE assignment_submissions CASCADE;
TRUNCATE TABLE current_sessions CASCADE;
TRUNCATE TABLE bookmarks CASCADE;
TRUNCATE TABLE ai_messages CASCADE;
TRUNCATE TABLE ai_conversations CASCADE;
TRUNCATE TABLE user_preferences CASCADE;
TRUNCATE TABLE enrollments CASCADE;
TRUNCATE TABLE classes CASCADE;
TRUNCATE TABLE assignments CASCADE;
TRUNCATE TABLE resources CASCADE;
TRUNCATE TABLE projects CASCADE;
TRUNCATE TABLE courses CASCADE;
TRUNCATE TABLE users CASCADE;
TRUNCATE TABLE departments CASCADE;

-- =====================================================================
-- STEP 2: CREATE DEPARTMENTS (Amrita University Structure)
-- =====================================================================
INSERT INTO departments (id, name, code, description, created_at) VALUES
('11111111-1111-1111-1111-111111111001', 'Artificial Intelligence and Engineering', 'AIE', 'Department of Artificial Intelligence and Engineering - Amrita School of Computing, Coimbatore', CURRENT_TIMESTAMP),
('11111111-1111-1111-1111-111111111002', 'Computer Science and Engineering', 'CSE', 'Department of Computer Science and Engineering - Amrita School of Computing, Coimbatore', CURRENT_TIMESTAMP),
('11111111-1111-1111-1111-111111111003', 'Artificial Intelligence and Data Science', 'AID', 'Department of Artificial Intelligence and Data Science - Amrita School of Computing, Coimbatore', CURRENT_TIMESTAMP);

-- =====================================================================
-- STEP 3: CREATE FACULTY USERS (Amrita University Faculty)
-- =====================================================================
INSERT INTO users (id, email, student_id, password_hash, first_name, last_name, role, department_id, bio, is_active, created_at, updated_at) VALUES
-- AIE Faculty based on the timetable
('22222222-2222-2222-2222-222222222001', 'a_milton@cb.amrita.edu', 'FAC_MILTON', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Milton', 'Mondal', 'faculty', '11111111-1111-1111-1111-111111111001', 'Dr. Milton Mondal - Professor, Probabilistic Reasoning', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222002', 'a_soman@cb.amrita.edu', 'FAC_SOMAN', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Soman', 'K P', 'faculty', '11111111-1111-1111-1111-111111111001', 'Prof. Soman K P - Professor, Formal Language and Automata', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222003', 'a_archuda@cb.amrita.edu', 'FAC_ARCHUDA', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Archuda', 'Dr', 'faculty', '11111111-1111-1111-1111-111111111001', 'Dr. Archuda - Professor, Database Management Systems', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222004', 'a_prem@cb.amrita.edu', 'FAC_PREM', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Prem', 'Jagadeesan', 'faculty', '11111111-1111-1111-1111-111111111001', 'Dr. Prem Jagadeesan - Professor, Deep Learning', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222005', 'a_prajisha@cb.amrita.edu', 'FAC_PRAJISHA', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Prajisha', 'C', 'faculty', '11111111-1111-1111-1111-111111111001', 'Ms. Prajisha C - Assistant Professor, Introduction to Cloud Computing', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222006', 'a_amrutha@cb.amrita.edu', 'FAC_AMRUTHA', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Amrutha', 'V', 'faculty', '11111111-1111-1111-1111-111111111001', 'Dr. Amrutha V - Professor, Biomedical Signal Processing', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222007', 'a_krithesh@cb.amrita.edu', 'FAC_KRITHESH', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Krithesh', 'K Gupta', 'faculty', '11111111-1111-1111-1111-111111111001', 'Dr. Krithesh K Gupta - Professor, Data Driven Material Modelling', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('22222222-2222-2222-2222-222222222008', 'a_ssk_instructor@cb.amrita.edu', 'FAC_SSK', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Soft Skills', 'Instructor', 'faculty', '11111111-1111-1111-1111-111111111001', 'Soft Skills II Instructor', true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Update department head
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222001' WHERE id = '11111111-1111-1111-1111-111111111001';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222002' WHERE id = '11111111-1111-1111-1111-111111111002';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222003' WHERE id = '11111111-1111-1111-1111-111111111003';

-- =====================================================================
-- STEP 4: CREATE COURSES (AIE C Section Courses)
-- =====================================================================
INSERT INTO courses (id, name, code, description, credits, department_id, faculty_id, semester, academic_year, is_active, created_at) VALUES
('33333333-3333-3333-3333-333333333001', 'Probabilistic Reasoning', '22AIE301', 'Core engineering course in probabilistic reasoning for AI students', 3, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222001', 5, '2025-2026', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333002', 'Formal Language and Automata', '22AIE302', 'Core engineering course in formal language and automata for AI students', 3, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222002', 5, '2025-2026', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333003', 'Database Management Systems', '22AIE303', 'Core engineering course in database management systems for AI students', 4, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222003', 5, '2025-2026', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333004', 'Deep Learning', '22AIE304', 'Core engineering course in deep learning for AI students', 3, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222004', 5, '2025-2026', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333005', 'Introduction to Cloud Computing', '22AIE305', 'Core engineering course in introduction to cloud computing for AI students', 3, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222005', 5, '2025-2026', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333006', 'Biomedical Signal Processing', '22AIE438', 'Professional elective course covering biomedical signal processing concepts and applications', 3, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222006', 5, '2025-2026', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333007', 'Data Driven Material Modelling', '22AIE452', 'Professional elective course covering data driven material modelling concepts and applications', 3, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222007', 5, '2025-2026', true, CURRENT_TIMESTAMP),
('33333333-3333-3333-3333-333333333008', 'Soft Skills II', '19SSK301', 'Humanities course focusing on soft skills development', 2, '11111111-1111-1111-1111-111111111001', '22222222-2222-2222-2222-222222222008', 5, '2025-2026', true, CURRENT_TIMESTAMP);

-- =====================================================================
-- STEP 5: CREATE STUDENT USERS (AIE C Section - First 20 Students)
-- Format: cb.sc.u4aie23201 to cb.sc.u4aie23220 (C section = 2, roll numbers 01-20)
-- =====================================================================
INSERT INTO users (id, email, student_id, password_hash, first_name, last_name, role, department_id, year_of_study, bio, gpa, total_credits, is_active, created_at, updated_at) VALUES
-- AIE C Section Students (Roll Numbers 201-220)
('44444444-4444-4444-4444-444444444201', 'cb.sc.u4aie23201@cb.students.amrita.edu', 'cb.sc.u4aie23201', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Aarav', 'Sharma', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student specializing in machine learning', 3.75, 85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444202', 'cb.sc.u4aie23202@cb.students.amrita.edu', 'cb.sc.u4aie23202', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Vivaan', 'Patel', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student interested in deep learning', 3.82, 87, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444203', 'cb.sc.u4aie23203@cb.students.amrita.edu', 'cb.sc.u4aie23203', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Aditya', 'Kumar', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student focusing on neural networks', 3.68, 84, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444204', 'cb.sc.u4aie23204@cb.students.amrita.edu', 'cb.sc.u4aie23204', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Vihaan', 'Singh', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student passionate about AI ethics', 3.91, 89, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444205', 'cb.sc.u4aie23205@cb.students.amrita.edu', 'cb.sc.u4aie23205', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Arjun', 'Gupta', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student working on computer vision', 3.79, 86, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444206', 'cb.sc.u4aie23206@cb.students.amrita.edu', 'cb.sc.u4aie23206', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Sai', 'Reddy', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student interested in NLP', 3.85, 88, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444207', 'cb.sc.u4aie23207@cb.students.amrita.edu', 'cb.sc.u4aie23207', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Reyansh', 'Jain', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student specializing in robotics', 3.73, 85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444208', 'cb.sc.u4aie23208@cb.students.amrita.edu', 'cb.sc.u4aie23208', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Ayaan', 'Agarwal', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student working on AI algorithms', 3.88, 89, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444209', 'cb.sc.u4aie23209@cb.students.amrita.edu', 'cb.sc.u4aie23209', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Krishna', 'Iyer', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student focusing on data mining', 3.76, 86, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444210', 'cb.sc.u4aie23210@cb.students.amrita.edu', 'cb.sc.u4aie23210', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Ishaan', 'Nair', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student interested in reinforcement learning', 3.83, 87, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444211', 'cb.sc.u4aie23211@cb.students.amrita.edu', 'cb.sc.u4aie23211', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Ananya', 'Krishnan', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student working on AI applications in healthcare', 3.92, 90, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444212', 'cb.sc.u4aie23212@cb.students.amrita.edu', 'cb.sc.u4aie23212', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Diya', 'Menon', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student specializing in predictive analytics', 3.77, 85, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444213', 'cb.sc.u4aie23213@cb.students.amrita.edu', 'cb.sc.u4aie23213', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Ira', 'Pillai', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student interested in AI for social good', 3.89, 88, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444214', 'cb.sc.u4aie23214@cb.students.amrita.edu', 'cb.sc.u4aie23214', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Kavya', 'Rao', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student focusing on pattern recognition', 3.81, 87, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444215', 'cb.sc.u4aie23215@cb.students.amrita.edu', 'cb.sc.u4aie23215', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Myra', 'Bhat', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student working on intelligent systems', 3.86, 88, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444216', 'cb.sc.u4aie23216@cb.students.amrita.edu', 'cb.sc.u4aie23216', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Saanvi', 'Varma', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student interested in machine perception', 3.74, 86, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444217', 'cb.sc.u4aie23217@cb.students.amrita.edu', 'cb.sc.u4aie23217', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Aanya', 'Shetty', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student specializing in cognitive computing', 3.90, 89, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444218', 'cb.sc.u4aie23218@cb.students.amrita.edu', 'cb.sc.u4aie23218', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Navya', 'Das', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student working on AI optimization', 3.78, 86, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444219', 'cb.sc.u4aie23219@cb.students.amrita.edu', 'cb.sc.u4aie23219', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Pari', 'Hegde', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student focusing on automated reasoning', 3.84, 87, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('44444444-4444-4444-4444-444444444220', 'cb.sc.u4aie23220@cb.students.amrita.edu', 'cb.sc.u4aie23220', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Tara', 'Gowda', 'student', '11111111-1111-1111-1111-111111111001', 3, 'Third-year AIE student interested in AI research methodologies', 3.87, 88, true, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================================
-- STEP 6: CREATE CLASSES BASED ON TIMETABLE (Sample - Monday)
-- =====================================================================
INSERT INTO classes (id, course_id, title, description, room, start_time, end_time, day_of_week, is_recurring, status, created_at, instructor_images) VALUES
-- Monday Classes
('55555555-5555-5555-5555-555555555001', '33333333-3333-3333-3333-333333333003', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4 (specific room not specified)', '2025-09-26 08:50:00', '2025-09-26 09:40:00', 1, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555002', '33333333-3333-3333-3333-333333333003', 'Database Management Systems', 'Theory class for Database Management Systems', 'Academic Block 4 (specific room not specified)', '2025-09-26 09:40:00', '2025-09-26 10:30:00', 1, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555003', '33333333-3333-3333-3333-333333333001', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4 (specific room not specified)', '2025-09-26 10:45:00', '2025-09-26 11:35:00', 1, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555004', '33333333-3333-3333-3333-333333333001', 'Probabilistic Reasoning', 'Theory class for Probabilistic Reasoning', 'Academic Block 4 (specific room not specified)', '2025-09-26 11:35:00', '2025-09-26 12:25:00', 1, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555005', '33333333-3333-3333-3333-333333333008', 'Soft Skills II', 'Theory class for Soft Skills II', 'Academic Block 4 (specific room not specified)', '2025-09-26 13:15:00', '2025-09-26 14:05:00', 1, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555006', '33333333-3333-3333-3333-333333333008', 'Soft Skills II', 'Theory class for Soft Skills II', 'Academic Block 4 (specific room not specified)', '2025-09-26 14:05:00', '2025-09-26 14:55:00', 1, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]),
('55555555-5555-5555-5555-555555555007', '33333333-3333-3333-3333-333333333008', 'Soft Skills II', 'Theory class for Soft Skills II', 'Academic Block 4 (specific room not specified)', '2025-09-26 14:55:00', '2025-09-26 15:45:00', 1, true, 'scheduled', CURRENT_TIMESTAMP, ARRAY[]::text[]);

-- =====================================================================
-- STEP 7: CREATE ENROLLMENTS (First 20 students enrolled in all AIE courses)
-- =====================================================================
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES
-- Student cb.sc.u4aie23201 enrollments
('66666666-6666-6666-6666-666666666001', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333001', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666002', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333002', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666003', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333003', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666004', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333004', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666005', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333005', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666006', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333006', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666007', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333007', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666008', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333008', CURRENT_TIMESTAMP, 'active');

-- Continue for other students (showing pattern for first few students)
-- Student cb.sc.u4aie23202 enrollments
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES
('66666666-6666-6666-6666-666666666009', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333001', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666010', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333002', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666011', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333003', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666012', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333004', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666013', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333005', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666014', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333006', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666015', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333007', CURRENT_TIMESTAMP, 'active'),
('66666666-6666-6666-6666-666666666016', '44444444-4444-4444-4444-444444444202', '33333333-3333-3333-3333-333333333008', CURRENT_TIMESTAMP, 'active');

-- =====================================================================
-- STEP 8: CREATE USER PREFERENCES FOR STUDENTS
-- =====================================================================
INSERT INTO user_preferences (id, user_id, theme, notifications_enabled, email_notifications, language, timezone, created_at, updated_at) VALUES
('77777777-7777-7777-7777-777777777201', '44444444-4444-4444-4444-444444444201', 'dark', true, true, 'en', 'Asia/Kolkata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777202', '44444444-4444-4444-4444-444444444202', 'dark', true, true, 'en', 'Asia/Kolkata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777203', '44444444-4444-4444-4444-444444444203', 'light', true, true, 'en', 'Asia/Kolkata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777204', '44444444-4444-4444-4444-444444444204', 'dark', true, true, 'en', 'Asia/Kolkata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
('77777777-7777-7777-7777-777777777205', '44444444-4444-4444-4444-444444444205', 'light', true, true, 'en', 'Asia/Kolkata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================
-- Run these to verify the data has been inserted correctly

-- Check departments
-- SELECT * FROM departments;

-- Check courses
-- SELECT c.name, c.code, c.credits, d.name as department, CONCAT(u.first_name, ' ', u.last_name) as faculty 
-- FROM courses c 
-- JOIN departments d ON c.department_id = d.id 
-- JOIN users u ON c.faculty_id = u.id;

-- Check students count
-- SELECT COUNT(*) as student_count FROM users WHERE role = 'student';

-- Check faculty count  
-- SELECT COUNT(*) as faculty_count FROM users WHERE role = 'faculty';

-- Check enrollments
-- SELECT COUNT(*) as total_enrollments FROM enrollments;

-- Check classes
-- SELECT COUNT(*) as total_classes FROM classes;

-- =====================================================================
-- NOTES:
-- 1. This script creates 20 sample students with proper UUIDs
-- 2. All students follow the format: cb.sc.u4aie23[2XX] where XX is 01-20
-- 3. All emails follow: cb.sc.u4aie23[2XX]@cb.students.amrita.edu
-- 4. Faculty emails follow: a_[name]@cb.amrita.edu
-- 5. All students are in 3rd year (year_of_study = 3) for 2023 batch
-- 6. UUIDs now follow proper PostgreSQL format
-- 7. Additional students can be added using the same pattern
-- =====================================================================