-- =====================================================================
-- COMPREHENSIVE DATABASE POPULATION SCRIPT
-- AIE Portal - Student Management System
-- =====================================================================
-- This script populates all tables with realistic sample data
-- Run this script after your schema is set up
-- =====================================================================

-- Clear existing data (optional - uncomment if you want to reset)
/*
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
*/

-- =====================================================================
-- 1. DEPARTMENTS
-- =====================================================================
INSERT INTO departments (id, name, code, description) VALUES
('11111111-1111-1111-1111-111111111111', 'Computer Science', 'CS', 'Department of Computer Science and Software Engineering'),
('11111111-1111-1111-1111-111111111112', 'Information Technology', 'IT', 'Department of Information Technology and Systems'),
('11111111-1111-1111-1111-111111111113', 'Data Science', 'DS', 'Department of Data Science and Analytics'),
('11111111-1111-1111-1111-111111111114', 'Artificial Intelligence', 'AI', 'Department of Artificial Intelligence and Machine Learning'),
('11111111-1111-1111-1111-111111111115', 'Cybersecurity', 'CYB', 'Department of Cybersecurity and Network Security'),
('11111111-1111-1111-1111-111111111116', 'Software Engineering', 'SE', 'Department of Software Engineering and Development'),
('11111111-1111-1111-1111-111111111117', 'Database Systems', 'DBS', 'Department of Database Systems and Management'),
('11111111-1111-1111-1111-111111111118', 'Web Development', 'WEB', 'Department of Web Technologies and Development');

-- =====================================================================
-- 2. USERS (Students, Faculty, Admin)
-- =====================================================================

-- ADMIN USERS
INSERT INTO users (id, email, student_id, password_hash, first_name, last_name, role, department_id, bio, is_active) VALUES
('22222222-2222-2222-2222-222222222201', 'admin@aieportal.edu', 'ADM001', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Sarah', 'Johnson', 'admin', '11111111-1111-1111-1111-111111111111', 'System Administrator and IT Manager', true),
('22222222-2222-2222-2222-222222222202', 'superadmin@aieportal.edu', 'SUP001', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Michael', 'Chen', 'admin', '11111111-1111-1111-1111-111111111112', 'Super Administrator and Platform Manager', true);

-- FACULTY USERS (Professors and Instructors)
INSERT INTO users (id, email, student_id, password_hash, first_name, last_name, role, department_id, bio, is_active) VALUES
('22222222-2222-2222-2222-222222222301', 'dr.smith@aieportal.edu', 'FAC001', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Robert', 'Smith', 'faculty', '11111111-1111-1111-1111-111111111111', 'Professor of Computer Science, PhD in AI, 15+ years experience', true),
('22222222-2222-2222-2222-222222222302', 'dr.wilson@aieportal.edu', 'FAC002', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Emily', 'Wilson', 'faculty', '11111111-1111-1111-1111-111111111114', 'Associate Professor of Machine Learning and AI', true),
('22222222-2222-2222-2222-222222222303', 'dr.garcia@aieportal.edu', 'FAC003', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Carlos', 'Garcia', 'faculty', '11111111-1111-1111-1111-111111111113', 'Professor of Data Science and Analytics', true),
('22222222-2222-2222-2222-222222222304', 'dr.lee@aieportal.edu', 'FAC004', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Jennifer', 'Lee', 'faculty', '11111111-1111-1111-1111-111111111116', 'Assistant Professor of Software Engineering', true),
('22222222-2222-2222-2222-222222222305', 'dr.brown@aieportal.edu', 'FAC005', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'David', 'Brown', 'faculty', '11111111-1111-1111-1111-111111111115', 'Professor of Cybersecurity and Network Security', true),
('22222222-2222-2222-2222-222222222306', 'dr.davis@aieportal.edu', 'FAC006', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Lisa', 'Davis', 'faculty', '11111111-1111-1111-1111-111111111117', 'Associate Professor of Database Systems', true),
('22222222-2222-2222-2222-222222222307', 'dr.miller@aieportal.edu', 'FAC007', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'James', 'Miller', 'faculty', '11111111-1111-1111-1111-111111111118', 'Assistant Professor of Web Development', true),
('22222222-2222-2222-2222-222222222308', 'dr.anderson@aieportal.edu', 'FAC008', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Maria', 'Anderson', 'faculty', '11111111-1111-1111-1111-111111111112', 'Professor of Information Technology', true);

-- STUDENT USERS (Multiple years and departments)
INSERT INTO users (id, email, student_id, password_hash, first_name, last_name, role, department_id, year_of_study, bio, gpa, total_credits, is_active) VALUES
-- First Year Students
('22222222-2222-2222-2222-222222222101', 'alice.johnson@student.aie.edu', 'STU001', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Alice', 'Johnson', 'student', '11111111-1111-1111-1111-111111111111', 1, 'First-year Computer Science student passionate about programming', 3.8, 30, true),
('22222222-2222-2222-2222-222222222102', 'bob.williams@student.aie.edu', 'STU002', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Bob', 'Williams', 'student', '11111111-1111-1111-1111-111111111114', 1, 'Aspiring AI researcher and machine learning enthusiast', 3.9, 28, true),
('22222222-2222-2222-2222-222222222103', 'carol.brown@student.aie.edu', 'STU003', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Carol', 'Brown', 'student', '11111111-1111-1111-1111-111111111113', 1, 'Data Science student interested in statistical analysis', 3.7, 32, true),
('22222222-2222-2222-2222-222222222104', 'david.davis@student.aie.edu', 'STU004', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'David', 'Davis', 'student', '11111111-1111-1111-1111-111111111116', 1, 'Software Engineering student with focus on web development', 3.6, 29, true),
('22222222-2222-2222-2222-222222222105', 'emma.wilson@student.aie.edu', 'STU005', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Emma', 'Wilson', 'student', '11111111-1111-1111-1111-111111111115', 1, 'Cybersecurity student interested in ethical hacking', 3.85, 31, true),

-- Second Year Students
('22222222-2222-2222-2222-222222222106', 'frank.garcia@student.aie.edu', 'STU006', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Frank', 'Garcia', 'student', '11111111-1111-1111-1111-111111111111', 2, 'Second-year CS student specializing in algorithms', 3.72, 62, true),
('22222222-2222-2222-2222-222222222107', 'grace.lee@student.aie.edu', 'STU007', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Grace', 'Lee', 'student', '11111111-1111-1111-1111-111111111117', 2, 'Database Systems student with interest in big data', 3.91, 58, true),
('22222222-2222-2222-2222-222222222108', 'henry.martinez@student.aie.edu', 'STU008', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Henry', 'Martinez', 'student', '11111111-1111-1111-1111-111111111118', 2, 'Web Development student creating innovative user interfaces', 3.68, 60, true),
('22222222-2222-2222-2222-222222222109', 'ivy.taylor@student.aie.edu', 'STU009', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Ivy', 'Taylor', 'student', '11111111-1111-1111-1111-111111111112', 2, 'IT student focused on system administration', 3.74, 59, true),
('22222222-2222-2222-2222-222222222110', 'jack.anderson@student.aie.edu', 'STU010', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Jack', 'Anderson', 'student', '11111111-1111-1111-1111-111111111114', 2, 'AI student working on neural networks and deep learning', 3.87, 61, true),

-- Third Year Students
('22222222-2222-2222-2222-222222222111', 'kate.thomas@student.aie.edu', 'STU011', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Kate', 'Thomas', 'student', '11111111-1111-1111-1111-111111111111', 3, 'Senior CS student preparing for software engineering career', 3.79, 95, true),
('22222222-2222-2222-2222-222222222112', 'liam.jackson@student.aie.edu', 'STU012', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Liam', 'Jackson', 'student', '11111111-1111-1111-1111-111111111113', 3, 'Data Science student specializing in machine learning applications', 3.88, 92, true),
('22222222-2222-2222-2222-222222222113', 'mia.white@student.aie.edu', 'STU013', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Mia', 'White', 'student', '11111111-1111-1111-1111-111111111115', 3, 'Cybersecurity student with expertise in penetration testing', 3.93, 89, true),
('22222222-2222-2222-2222-222222222114', 'noah.harris@student.aie.edu', 'STU014', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Noah', 'Harris', 'student', '11111111-1111-1111-1111-111111111116', 3, 'Software Engineering student leading multiple development projects', 3.76, 94, true),
('22222222-2222-2222-2222-222222222115', 'olivia.clark@student.aie.edu', 'STU015', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Olivia', 'Clark', 'student', '11111111-1111-1111-1111-111111111117', 3, 'Database Systems student working on distributed systems', 3.84, 91, true),

-- Fourth Year Students
('22222222-2222-2222-2222-222222222116', 'peter.lewis@student.aie.edu', 'STU016', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Peter', 'Lewis', 'student', '11111111-1111-1111-1111-111111111111', 4, 'Final year CS student completing capstone project in AI', 3.82, 118, true),
('22222222-2222-2222-2222-222222222117', 'quinn.walker@student.aie.edu', 'STU017', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Quinn', 'Walker', 'student', '11111111-1111-1111-1111-111111111118', 4, 'Web Development senior creating full-stack applications', 3.71, 115, true),
('22222222-2222-2222-2222-222222222118', 'riley.hall@student.aie.edu', 'STU018', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Riley', 'Hall', 'student', '11111111-1111-1111-1111-111111111114', 4, 'AI senior researching natural language processing', 3.95, 120, true),
('22222222-2222-2222-2222-222222222119', 'sophia.young@student.aie.edu', 'STU019', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Sophia', 'Young', 'student', '11111111-1111-1111-1111-111111111112', 4, 'IT senior specializing in cloud computing and DevOps', 3.89, 117, true),
('22222222-2222-2222-2222-222222222120', 'tyler.king@student.aie.edu', 'STU020', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Tyler', 'King', 'student', '11111111-1111-1111-1111-111111111113', 4, 'Data Science senior working on predictive analytics models', 3.86, 119, true),

-- Additional Students for more diversity
('22222222-2222-2222-2222-222222222121', 'uma.wright@student.aie.edu', 'STU021', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Uma', 'Wright', 'student', '11111111-1111-1111-1111-111111111115', 2, 'Cybersecurity student interested in digital forensics', 3.77, 55, true),
('22222222-2222-2222-2222-222222222122', 'victor.lopez@student.aie.edu', 'STU022', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Victor', 'Lopez', 'student', '11111111-1111-1111-1111-111111111116', 3, 'Software Engineering student with mobile app development focus', 3.81, 88, true),
('22222222-2222-2222-2222-222222222123', 'wendy.hill@student.aie.edu', 'STU023', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Wendy', 'Hill', 'student', '11111111-1111-1111-1111-111111111117', 1, 'First-year Database Systems student', 3.65, 27, true),
('22222222-2222-2222-2222-222222222124', 'xavier.green@student.aie.edu', 'STU024', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Xavier', 'Green', 'student', '11111111-1111-1111-1111-111111111118', 4, 'Web Development senior with expertise in React and Node.js', 3.90, 116, true),
('22222222-2222-2222-2222-222222222125', 'yara.adams@student.aie.edu', 'STU025', '$2b$12$LQv3c1yqBwuvhi8LFGPv.Oupoj/a5sqqUAhkZBgZRv0yKw84r2l2K', 'Yara', 'Adams', 'student', '11111111-1111-1111-1111-111111111112', 3, 'IT student specializing in network security', 3.83, 93, true);

-- Update department heads
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222301' WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222308' WHERE id = '11111111-1111-1111-1111-111111111112';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222303' WHERE id = '11111111-1111-1111-1111-111111111113';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222302' WHERE id = '11111111-1111-1111-1111-111111111114';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222305' WHERE id = '11111111-1111-1111-1111-111111111115';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222304' WHERE id = '11111111-1111-1111-1111-111111111116';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222306' WHERE id = '11111111-1111-1111-1111-111111111117';
UPDATE departments SET head_id = '22222222-2222-2222-2222-222222222307' WHERE id = '11111111-1111-1111-1111-111111111118';

-- =====================================================================
-- 3. COURSES
-- =====================================================================
INSERT INTO courses (id, name, code, description, credits, department_id, faculty_id, semester, academic_year, is_active) VALUES
-- Computer Science Courses
('33333333-3333-3333-3333-333333333301', 'Introduction to Programming', 'CS101', 'Fundamental concepts of programming using Python and Java', 4, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222301', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333302', 'Data Structures and Algorithms', 'CS201', 'Advanced data structures, algorithm design and analysis', 4, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222301', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333303', 'Object-Oriented Programming', 'CS202', 'OOP principles using Java and C++', 3, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222301', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333304', 'Computer Architecture', 'CS301', 'Computer organization, assembly language, and system design', 3, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222301', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333305', 'Operating Systems', 'CS302', 'OS design, processes, memory management, and file systems', 4, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222301', 1, '2024-2025', true),

-- AI and Machine Learning Courses
('33333333-3333-3333-3333-333333333306', 'Introduction to Artificial Intelligence', 'AI101', 'Fundamentals of AI, search algorithms, and knowledge representation', 3, '11111111-1111-1111-1111-111111111114', '22222222-2222-2222-2222-222222222302', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333307', 'Machine Learning Fundamentals', 'AI201', 'Supervised and unsupervised learning, neural networks', 4, '11111111-1111-1111-1111-111111111114', '22222222-2222-2222-2222-222222222302', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333308', 'Deep Learning', 'AI301', 'Advanced neural networks, CNNs, RNNs, and transformers', 4, '11111111-1111-1111-1111-111111111114', '22222222-2222-2222-2222-222222222302', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333309', 'Natural Language Processing', 'AI302', 'Text processing, language models, and NLP applications', 3, '11111111-1111-1111-1111-111111111114', '22222222-2222-2222-2222-222222222302', 2, '2024-2025', true),

-- Data Science Courses
('33333333-3333-3333-3333-333333333310', 'Statistics for Data Science', 'DS101', 'Statistical methods and probability for data analysis', 3, '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222303', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333311', 'Data Mining and Analytics', 'DS201', 'Data preprocessing, mining techniques, and visualization', 4, '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222303', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333312', 'Big Data Technologies', 'DS301', 'Hadoop, Spark, and distributed computing for big data', 4, '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222303', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333313', 'Business Intelligence', 'DS302', 'BI tools, data warehousing, and business analytics', 3, '11111111-1111-1111-1111-111111111113', '22222222-2222-2222-2222-222222222303', 2, '2024-2025', true),

-- Software Engineering Courses
('33333333-3333-3333-3333-333333333314', 'Software Engineering Principles', 'SE101', 'SDLC, requirements analysis, and project management', 3, '11111111-1111-1111-1111-111111111116', '22222222-2222-2222-2222-222222222304', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333315', 'Agile Development', 'SE201', 'Scrum, Kanban, and modern development methodologies', 3, '11111111-1111-1111-1111-111111111116', '22222222-2222-2222-2222-222222222304', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333316', 'Software Testing and Quality Assurance', 'SE301', 'Testing strategies, automation, and quality metrics', 3, '11111111-1111-1111-1111-111111111116', '22222222-2222-2222-2222-222222222304', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333317', 'DevOps and Deployment', 'SE302', 'CI/CD, containerization, and cloud deployment', 4, '11111111-1111-1111-1111-111111111116', '22222222-2222-2222-2222-222222222304', 2, '2024-2025', true),

-- Cybersecurity Courses
('33333333-3333-3333-3333-333333333318', 'Introduction to Cybersecurity', 'CYB101', 'Security fundamentals, threats, and defense mechanisms', 3, '11111111-1111-1111-1111-111111111115', '22222222-2222-2222-2222-222222222305', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333319', 'Network Security', 'CYB201', 'Network protocols, firewalls, and intrusion detection', 4, '11111111-1111-1111-1111-111111111115', '22222222-2222-2222-2222-222222222305', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333320', 'Ethical Hacking and Penetration Testing', 'CYB301', 'Penetration testing methodologies and security assessment', 4, '11111111-1111-1111-1111-111111111115', '22222222-2222-2222-2222-222222222305', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333321', 'Digital Forensics', 'CYB302', 'Computer forensics, evidence collection, and analysis', 3, '11111111-1111-1111-1111-111111111115', '22222222-2222-2222-2222-222222222305', 2, '2024-2025', true),

-- Database Systems Courses
('33333333-3333-3333-3333-333333333322', 'Database Design and Implementation', 'DBS101', 'Relational databases, SQL, and database design principles', 4, '11111111-1111-1111-1111-111111111117', '22222222-2222-2222-2222-222222222306', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333323', 'Advanced Database Systems', 'DBS201', 'NoSQL databases, distributed systems, and performance optimization', 4, '11111111-1111-1111-1111-111111111117', '22222222-2222-2222-2222-222222222306', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333324', 'Data Warehousing', 'DBS301', 'Data warehouse design, ETL processes, and OLAP', 3, '11111111-1111-1111-1111-111111111117', '22222222-2222-2222-2222-222222222306', 1, '2024-2025', true),

-- Web Development Courses
('33333333-3333-3333-3333-333333333325', 'Web Development Fundamentals', 'WEB101', 'HTML, CSS, JavaScript, and responsive design', 3, '11111111-1111-1111-1111-111111111118', '22222222-2222-2222-2222-222222222307', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333326', 'Frontend Frameworks', 'WEB201', 'React, Vue.js, and modern frontend development', 4, '11111111-1111-1111-1111-111111111118', '22222222-2222-2222-2222-222222222307', 2, '2024-2025', true),
('33333333-3333-3333-3333-333333333327', 'Backend Development', 'WEB301', 'Node.js, Express, APIs, and server-side programming', 4, '11111111-1111-1111-1111-111111111118', '22222222-2222-2222-2222-222222222307', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333328', 'Full-Stack Development', 'WEB302', 'Complete web application development and deployment', 4, '11111111-1111-1111-1111-111111111118', '22222222-2222-2222-2222-222222222307', 2, '2024-2025', true),

-- IT Courses
('33333333-3333-3333-3333-333333333329', 'System Administration', 'IT101', 'Linux/Windows administration, networking, and server management', 3, '11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222308', 1, '2024-2025', true),
('33333333-3333-3333-3333-333333333330', 'Cloud Computing', 'IT201', 'AWS, Azure, cloud services, and distributed computing', 4, '11111111-1111-1111-1111-111111111112', '22222222-2222-2222-2222-222222222308', 2, '2024-2025', true);

-- =====================================================================
-- 4. ENROLLMENTS
-- =====================================================================
-- Enroll students in appropriate courses based on their year and department
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status, final_grade) VALUES
-- First Year Students Enrollments
('44444444-4444-4444-4444-444444444401', '22222222-2222-2222-2222-222222222101', '33333333-3333-3333-3333-333333333301', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444402', '22222222-2222-2222-2222-222222222101', '33333333-3333-3333-3333-333333333310', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444403', '22222222-2222-2222-2222-222222222102', '33333333-3333-3333-3333-333333333306', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444404', '22222222-2222-2222-2222-222222222102', '33333333-3333-3333-3333-333333333301', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444405', '22222222-2222-2222-2222-222222222103', '33333333-3333-3333-3333-333333333310', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444406', '22222222-2222-2222-2222-222222222104', '33333333-3333-3333-3333-333333333314', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444407', '22222222-2222-2222-2222-222222222105', '33333333-3333-3333-3333-333333333318', '2024-08-15', 'active', NULL),

-- Second Year Students Enrollments
('44444444-4444-4444-4444-444444444408', '22222222-2222-2222-2222-222222222106', '33333333-3333-3333-3333-333333333302', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444409', '22222222-2222-2222-2222-222222222106', '33333333-3333-3333-3333-333333333303', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444410', '22222222-2222-2222-2222-222222222107', '33333333-3333-3333-3333-333333333322', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444411', '22222222-2222-2222-2222-222222222107', '33333333-3333-3333-3333-333333333323', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444412', '22222222-2222-2222-2222-222222222108', '33333333-3333-3333-3333-333333333325', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444413', '22222222-2222-2222-2222-222222222108', '33333333-3333-3333-3333-333333333326', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444414', '22222222-2222-2222-2222-222222222109', '33333333-3333-3333-3333-333333333329', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444415', '22222222-2222-2222-2222-222222222110', '33333333-3333-3333-3333-333333333307', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444416', '22222222-2222-2222-2222-222222222121', '33333333-3333-3333-3333-333333333319', '2024-08-15', 'active', NULL),

-- Third Year Students Enrollments
('44444444-4444-4444-4444-444444444417', '22222222-2222-2222-2222-222222222111', '33333333-3333-3333-3333-333333333304', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444418', '22222222-2222-2222-2222-222222222111', '33333333-3333-3333-3333-333333333305', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444419', '22222222-2222-2222-2222-222222222112', '33333333-3333-3333-3333-333333333311', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444420', '22222222-2222-2222-2222-222222222112', '33333333-3333-3333-3333-333333333312', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444421', '22222222-2222-2222-2222-222222222113', '33333333-3333-3333-3333-333333333320', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444422', '22222222-2222-2222-2222-222222222114', '33333333-3333-3333-3333-333333333315', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444423', '22222222-2222-2222-2222-222222222114', '33333333-3333-3333-3333-333333333316', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444424', '22222222-2222-2222-2222-222222222115', '33333333-3333-3333-3333-333333333324', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444425', '22222222-2222-2222-2222-222222222122', '33333333-3333-3333-3333-333333333317', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444426', '22222222-2222-2222-2222-222222222125', '33333333-3333-3333-3333-333333333330', '2024-08-15', 'active', NULL),

-- Fourth Year Students Enrollments
('44444444-4444-4444-4444-444444444427', '22222222-2222-2222-2222-222222222116', '33333333-3333-3333-3333-333333333308', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444428', '22222222-2222-2222-2222-222222222117', '33333333-3333-3333-3333-333333333327', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444429', '22222222-2222-2222-2222-222222222117', '33333333-3333-3333-3333-333333333328', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444430', '22222222-2222-2222-2222-222222222118', '33333333-3333-3333-3333-333333333309', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444431', '22222222-2222-2222-2222-222222222119', '33333333-3333-3333-3333-333333333330', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444432', '22222222-2222-2222-2222-222222222120', '33333333-3333-3333-3333-333333333312', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444433', '22222222-2222-2222-2222-222222222120', '33333333-3333-3333-3333-333333333313', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444434', '22222222-2222-2222-2222-222222222124', '33333333-3333-3333-3333-333333333327', '2024-08-15', 'active', NULL),
('44444444-4444-4444-4444-444444444435', '22222222-2222-2222-2222-222222222124', '33333333-3333-3333-3333-333333333328', '2024-08-15', 'active', NULL),

-- Additional enrollments for more comprehensive data
('44444444-4444-4444-4444-444444444436', '22222222-2222-2222-2222-222222222123', '33333333-3333-3333-3333-333333333322', '2024-08-15', 'active', NULL);

-- Completed courses with grades (previous semester)
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status, final_grade) VALUES
('44444444-4444-4444-4444-444444444501', '22222222-2222-2222-2222-222222222106', '33333333-3333-3333-3333-333333333301', '2024-01-15', 'completed', 'A-'),
('44444444-4444-4444-4444-444444444502', '22222222-2222-2222-2222-222222222107', '33333333-3333-3333-3333-333333333301', '2024-01-15', 'completed', 'A'),
('44444444-4444-4444-4444-444444444503', '22222222-2222-2222-2222-222222222111', '33333333-3333-3333-3333-333333333302', '2024-01-15', 'completed', 'B+'),
('44444444-4444-4444-4444-444444444504', '22222222-2222-2222-2222-222222222112', '33333333-3333-3333-3333-333333333310', '2024-01-15', 'completed', 'A'),
('44444444-4444-4444-4444-444444444505', '22222222-2222-2222-2222-222222222116', '33333333-3333-3333-3333-333333333307', '2024-01-15', 'completed', 'A-');

-- Continue with Part 2...