-- =====================================================================
-- COMPREHENSIVE SEED DATA FOR AIE C SECTION
-- CampusGo Database - All Tables with Realistic Data
-- =====================================================================

-- =====================================================================
-- ASSIGNMENTS (Sample assignments for AIE courses)
-- =====================================================================
INSERT INTO assignments (id, course_id, title, description, due_date, total_points, assignment_type, priority, is_published, created_by, created_at) VALUES
-- Database Management Systems assignments
('aa111111-1111-1111-1111-111111111001', '33333333-3333-3333-3333-333333333003', 'ER Diagram Design', 'Design an Entity-Relationship diagram for a university management system', '2025-10-15 23:59:00', 100, 'homework', 'high', true, '22222222-2222-2222-2222-222222222003', CURRENT_TIMESTAMP),
('aa111111-1111-1111-1111-111111111002', '33333333-3333-3333-3333-333333333003', 'SQL Queries Lab', 'Write complex SQL queries for data retrieval and manipulation', '2025-10-20 23:59:00', 75, 'lab', 'medium', true, '22222222-2222-2222-2222-222222222003', CURRENT_TIMESTAMP),
('aa111111-1111-1111-1111-111111111003', '33333333-3333-3333-3333-333333333003', 'Database Normalization', 'Normalize given database schemas up to 3NF', '2025-10-25 23:59:00', 50, 'homework', 'medium', true, '22222222-2222-2222-2222-222222222003', CURRENT_TIMESTAMP),

-- Deep Learning assignments
('aa111111-1111-1111-1111-111111111004', '33333333-3333-3333-3333-333333333004', 'Neural Network Implementation', 'Implement a multi-layer perceptron from scratch using Python', '2025-11-01 23:59:00', 120, 'project', 'high', true, '22222222-2222-2222-2222-222222222004', CURRENT_TIMESTAMP),
('aa111111-1111-1111-1111-111111111005', '33333333-3333-3333-3333-333333333004', 'CNN for Image Classification', 'Build a convolutional neural network for CIFAR-10 dataset', '2025-11-10 23:59:00', 100, 'project', 'high', true, '22222222-2222-2222-2222-222222222004', CURRENT_TIMESTAMP),

-- Probabilistic Reasoning assignments
('aa111111-1111-1111-1111-111111111006', '33333333-3333-3333-3333-333333333001', 'Bayesian Networks', 'Construct and analyze Bayesian networks for medical diagnosis', '2025-10-18 23:59:00', 80, 'homework', 'medium', true, '22222222-2222-2222-2222-222222222001', CURRENT_TIMESTAMP),
('aa111111-1111-1111-1111-111111111007', '33333333-3333-3333-3333-333333333001', 'Monte Carlo Simulation', 'Implement Monte Carlo methods for probability estimation', '2025-11-05 23:59:00', 90, 'project', 'high', true, '22222222-2222-2222-2222-222222222001', CURRENT_TIMESTAMP),

-- Cloud Computing assignments
('aa111111-1111-1111-1111-111111111008', '33333333-3333-3333-3333-333333333005', 'AWS Deployment Project', 'Deploy a web application on AWS using EC2 and RDS', '2025-11-15 23:59:00', 100, 'project', 'high', true, '22222222-2222-2222-2222-222222222005', CURRENT_TIMESTAMP);

-- =====================================================================
-- ASSIGNMENT SUBMISSIONS (Sample submissions from students)
-- =====================================================================
INSERT INTO assignment_submissions (id, assignment_id, student_id, submission_text, submitted_at, grade, feedback, graded_by, graded_at, status) VALUES
-- ER Diagram submissions
('bb111111-1111-1111-1111-111111111001', 'aa111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'Submitted ER diagram with proper entities, attributes, and relationships. Used crow''s foot notation.', '2025-10-14 18:30:00', 85, 'Good work on entity identification. Minor issues with cardinality representation.', '22222222-2222-2222-2222-222222222003', '2025-10-16 10:00:00', 'graded'),
('bb111111-1111-1111-1111-111111111002', 'aa111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444202', 'Comprehensive ER diagram with detailed documentation of assumptions and constraints.', '2025-10-13 20:15:00', 92, 'Excellent work! Clear documentation and proper use of notation.', '22222222-2222-2222-2222-222222222003', '2025-10-16 10:15:00', 'graded'),
('bb111111-1111-1111-1111-111111111003', 'aa111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444203', 'ER diagram with some complex relationships and proper attribute classification.', '2025-10-15 22:45:00', 78, 'Good effort. Some relationships could be simplified for better clarity.', '22222222-2222-2222-2222-222222222003', '2025-10-16 10:30:00', 'graded'),

-- Neural Network submissions
('bb111111-1111-1111-1111-111111111004', 'aa111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444204', 'Implemented MLP with backpropagation. Achieved 89% accuracy on test dataset.', '2025-10-30 19:20:00', 95, 'Outstanding implementation! Clean code and excellent results.', '22222222-2222-2222-2222-222222222004', '2025-11-02 14:00:00', 'graded'),
('bb111111-1111-1111-1111-111111111005', 'aa111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444205', 'MLP implementation with detailed mathematical derivations and code comments.', '2025-10-31 16:45:00', 88, 'Good theoretical understanding. Implementation works well.', '22222222-2222-2222-2222-222222222004', '2025-11-02 14:15:00', 'graded');

-- =====================================================================
-- PROJECTS (Group and individual projects for AIE students)
-- =====================================================================
INSERT INTO projects (id, title, description, course_id, creator_id, status, due_date, start_date, progress_percentage, team_size, is_group_project, created_at) VALUES
-- AI Healthcare Project
('pp111111-1111-1111-1111-111111111001', 'AI-Powered Medical Diagnosis System', 'Develop a machine learning system for preliminary medical diagnosis using symptom analysis and patient history', '33333333-3333-3333-3333-333333333004', '44444444-4444-4444-4444-444444444201', 'in_progress', '2025-12-15 23:59:00', '2025-09-01 00:00:00', 65, 4, true, CURRENT_TIMESTAMP),

-- Smart Campus Project
('pp111111-1111-1111-1111-111111111002', 'Smart Campus Management System', 'IoT-based campus management system with real-time monitoring of facilities and resources', '33333333-3333-3333-3333-333333333005', '44444444-4444-4444-4444-444444444206', 'in_progress', '2025-11-30 23:59:00', '2025-09-15 00:00:00', 45, 3, true, CURRENT_TIMESTAMP),

-- Database Optimization Project
('pp111111-1111-1111-1111-111111111003', 'University Database Optimization', 'Performance optimization of university management database using indexing and query optimization', '33333333-3333-3333-3333-333333333003', '44444444-4444-4444-4444-444444444211', 'in_progress', '2025-11-20 23:59:00', '2025-10-01 00:00:00', 30, 2, true, CURRENT_TIMESTAMP),

-- Individual Research Projects
('pp111111-1111-1111-1111-111111111004', 'Reinforcement Learning for Game AI', 'Individual research project on applying RL algorithms to create intelligent game agents', '33333333-3333-3333-3333-333333333004', '44444444-4444-4444-4444-444444444217', 'in_progress', '2025-12-01 23:59:00', '2025-09-20 00:00:00', 55, 1, false, CURRENT_TIMESTAMP),

('pp111111-1111-1111-1111-111111111005', 'Blockchain in Supply Chain', 'Research and prototype development for blockchain-based supply chain management', '33333333-3333-3333-3333-333333333005', '44444444-4444-4444-4444-444444444222', 'completed', '2025-10-31 23:59:00', '2025-08-15 00:00:00', 100, 1, false, CURRENT_TIMESTAMP);

-- =====================================================================
-- PROJECT MEMBERS (Team assignments for group projects)
-- =====================================================================
INSERT INTO project_members (id, project_id, user_id, role, joined_at) VALUES
-- AI Healthcare Project Team
('pm111111-1111-1111-1111-111111111001', 'pp111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'leader', CURRENT_TIMESTAMP),
('pm111111-1111-1111-1111-111111111002', 'pp111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444202', 'member', CURRENT_TIMESTAMP),
('pm111111-1111-1111-1111-111111111003', 'pp111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444203', 'member', CURRENT_TIMESTAMP),
('pm111111-1111-1111-1111-111111111004', 'pp111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444204', 'member', CURRENT_TIMESTAMP),

-- Smart Campus Project Team
('pm111111-1111-1111-1111-111111111005', 'pp111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444206', 'leader', CURRENT_TIMESTAMP),
('pm111111-1111-1111-1111-111111111006', 'pp111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444207', 'member', CURRENT_TIMESTAMP),
('pm111111-1111-1111-1111-111111111007', 'pp111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444208', 'member', CURRENT_TIMESTAMP),

-- Database Optimization Team
('pm111111-1111-1111-1111-111111111008', 'pp111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444211', 'leader', CURRENT_TIMESTAMP),
('pm111111-1111-1111-1111-111111111009', 'pp111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444212', 'member', CURRENT_TIMESTAMP);

-- =====================================================================
-- RESOURCES (Course materials and learning resources)
-- =====================================================================
INSERT INTO resources (id, title, description, file_name, file_size, file_type, resource_type, course_id, uploaded_by, download_count, tags, created_at) VALUES
-- Database Management Systems resources
('rr111111-1111-1111-1111-111111111001', 'Database Design Fundamentals', 'Comprehensive guide to database design principles and normalization', 'db_design_guide.pdf', 2500000, 'pdf', 'notes', '33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222003', 45, ARRAY['database', 'design', 'normalization'], CURRENT_TIMESTAMP),
('rr111111-1111-1111-1111-111111111002', 'SQL Query Examples', 'Collection of advanced SQL queries with explanations', 'sql_examples.sql', 150000, 'sql', 'code', '33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222003', 67, ARRAY['SQL', 'queries', 'examples'], CURRENT_TIMESTAMP),
('rr111111-1111-1111-1111-111111111003', 'Database Optimization Techniques', 'Performance tuning and optimization strategies for databases', 'db_optimization.pdf', 1800000, 'pdf', 'notes', '33333333-3333-3333-3333-333333333003', '22222222-2222-2222-2222-222222222003', 34, ARRAY['optimization', 'performance', 'indexing'], CURRENT_TIMESTAMP),

-- Deep Learning resources
('rr111111-1111-1111-1111-111111111004', 'Introduction to Neural Networks', 'Basic concepts and mathematics behind neural networks', 'neural_networks_intro.pdf', 3200000, 'pdf', 'notes', '33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222004', 78, ARRAY['neural networks', 'deep learning', 'AI'], CURRENT_TIMESTAMP),
('rr111111-1111-1111-1111-111111111005', 'CNN Implementation Guide', 'Step-by-step guide to implementing convolutional neural networks', 'cnn_implementation.py', 85000, 'py', 'code', '33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222004', 92, ARRAY['CNN', 'implementation', 'python'], CURRENT_TIMESTAMP),
('rr111111-1111-1111-1111-111111111006', 'Deep Learning Research Papers', 'Collection of seminal papers in deep learning', 'dl_papers_collection.zip', 15000000, 'zip', 'reference', '33333333-3333-3333-3333-333333333004', '22222222-2222-2222-2222-222222222004', 56, ARRAY['research', 'papers', 'references'], CURRENT_TIMESTAMP),

-- Probabilistic Reasoning resources
('rr111111-1111-1111-1111-111111111007', 'Bayesian Networks Tutorial', 'Comprehensive tutorial on Bayesian networks and probabilistic inference', 'bayesian_networks.pdf', 2100000, 'pdf', 'notes', '33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222001', 41, ARRAY['bayesian', 'probability', 'inference'], CURRENT_TIMESTAMP),
('rr111111-1111-1111-1111-111111111008', 'Monte Carlo Methods', 'Practical guide to Monte Carlo simulation techniques', 'monte_carlo_guide.pdf', 1900000, 'pdf', 'notes', '33333333-3333-3333-3333-333333333001', '22222222-2222-2222-2222-222222222001', 29, ARRAY['monte carlo', 'simulation', 'probability'], CURRENT_TIMESTAMP),

-- Cloud Computing resources
('rr111111-1111-1111-1111-111111111009', 'AWS Getting Started Guide', 'Beginner''s guide to Amazon Web Services', 'aws_getting_started.pdf', 2800000, 'pdf', 'tutorial', '33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222005', 73, ARRAY['AWS', 'cloud', 'tutorial'], CURRENT_TIMESTAMP),
('rr111111-1111-1111-1111-111111111010', 'Docker Container Examples', 'Sample Docker configurations for common applications', 'docker_examples.tar.gz', 5000000, 'tar.gz', 'code', '33333333-3333-3333-3333-333333333005', '22222222-2222-2222-2222-222222222005', 48, ARRAY['docker', 'containers', 'deployment'], CURRENT_TIMESTAMP);

-- =====================================================================
-- RESOURCE DOWNLOADS (Track who downloaded what)
-- =====================================================================
INSERT INTO resource_downloads (id, resource_id, user_id, downloaded_at) VALUES
-- Recent downloads by students
('rd111111-1111-1111-1111-111111111001', 'rr111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', '2025-09-25 14:30:00'),
('rd111111-1111-1111-1111-111111111002', 'rr111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444201', '2025-09-25 14:35:00'),
('rd111111-1111-1111-1111-111111111003', 'rr111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444202', '2025-09-24 16:20:00'),
('rd111111-1111-1111-1111-111111111004', 'rr111111-1111-1111-1111-111111111005', '44444444-4444-4444-4444-444444444203', '2025-09-23 10:15:00'),
('rd111111-1111-1111-1111-111111111005', 'rr111111-1111-1111-1111-111111111007', '44444444-4444-4444-4444-444444444204', '2025-09-22 18:45:00'),
('rd111111-1111-1111-1111-111111111006', 'rr111111-1111-1111-1111-111111111009', '44444444-4444-4444-4444-444444444205', '2025-09-21 13:20:00'),
('rd111111-1111-1111-1111-111111111007', 'rr111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444206', '2025-09-20 11:30:00'),
('rd111111-1111-1111-1111-111111111008', 'rr111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444207', '2025-09-19 15:10:00');

-- =====================================================================
-- FILES (Student and faculty uploaded files)
-- =====================================================================
INSERT INTO files (id, name, original_name, file_type, file_size, mime_type, file_path, owner_id, course_id, project_id, assignment_id, is_public, upload_date) VALUES
-- Assignment submission files
('ff111111-1111-1111-1111-111111111001', 'er_diagram_aarav', 'University_ER_Diagram.pdf', 'document', 1200000, 'application/pdf', '/uploads/assignments/er_diagram_aarav.pdf', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333003', NULL, 'aa111111-1111-1111-1111-111111111001', false, '2025-10-14 18:30:00'),
('ff111111-1111-1111-1111-111111111002', 'neural_network_impl', 'MLP_Implementation.py', 'code', 45000, 'text/x-python', '/uploads/assignments/neural_network_impl.py', '44444444-4444-4444-4444-444444444204', '33333333-3333-3333-3333-333333333004', NULL, 'aa111111-1111-1111-1111-111111111004', false, '2025-10-30 19:20:00'),

-- Project files
('ff111111-1111-1111-1111-111111111003', 'healthcare_ai_prototype', 'Medical_Diagnosis_System.zip', 'archive', 8500000, 'application/zip', '/uploads/projects/healthcare_ai_prototype.zip', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333004', 'pp111111-1111-1111-1111-111111111001', NULL, false, '2025-09-15 16:45:00'),
('ff111111-1111-1111-1111-111111111004', 'smart_campus_docs', 'System_Architecture.pdf', 'document', 2100000, 'application/pdf', '/uploads/projects/smart_campus_docs.pdf', '44444444-4444-4444-4444-444444444206', '33333333-3333-3333-3333-333333333005', 'pp111111-1111-1111-1111-111111111002', NULL, false, '2025-09-20 14:20:00'),

-- Shared course materials
('ff111111-1111-1111-1111-111111111005', 'lecture_notes_week1', 'DL_Week1_Notes.pdf', 'document', 1800000, 'application/pdf', '/uploads/courses/lecture_notes_week1.pdf', '22222222-2222-2222-2222-222222222004', '33333333-3333-3333-3333-333333333004', NULL, NULL, true, '2025-09-01 09:00:00'),
('ff111111-1111-1111-1111-111111111006', 'sql_practice_problems', 'SQL_Practice_Set.sql', 'code', 25000, 'application/sql', '/uploads/courses/sql_practice_problems.sql', '22222222-2222-2222-2222-222222222003', '33333333-3333-3333-3333-333333333003', NULL, NULL, true, '2025-09-05 10:30:00');

-- =====================================================================
-- IDEAS (Student notes and brainstorming)
-- =====================================================================
INSERT INTO ideas (id, title, content, user_id, course_id, project_id, tags, is_favorite, color, created_at) VALUES
('ii111111-1111-1111-1111-111111111001', 'AI Ethics in Healthcare', 'Need to consider bias in medical AI systems. How to ensure fair treatment across different demographics?', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333004', 'pp111111-1111-1111-1111-111111111001', ARRAY['AI', 'ethics', 'healthcare', 'bias'], true, '#ff6b6b', CURRENT_TIMESTAMP),
('ii111111-1111-1111-1111-111111111002', 'Database Indexing Strategy', 'Research different indexing strategies for large datasets. Compare B-tree vs Hash vs Bitmap indexes.', '44444444-4444-4444-4444-444444444211', '33333333-3333-3333-3333-333333333003', 'pp111111-1111-1111-1111-111111111003', ARRAY['database', 'indexing', 'performance'], false, '#4ecdc4', CURRENT_TIMESTAMP),
('ii111111-1111-1111-1111-111111111003', 'IoT Sensor Integration', 'Ideas for integrating various IoT sensors in campus management system. Temperature, occupancy, air quality sensors.', '44444444-4444-4444-4444-444444444206', '33333333-3333-3333-3333-333333333005', 'pp111111-1111-1111-1111-111111111002', ARRAY['IoT', 'sensors', 'campus', 'integration'], true, '#45b7d1', CURRENT_TIMESTAMP),
('ii111111-1111-1111-1111-111111111004', 'CNN Architecture Variations', 'Exploring different CNN architectures: ResNet, DenseNet, EfficientNet. Which works best for our use case?', '44444444-4444-4444-4444-444444444204', '33333333-3333-3333-3333-333333333004', NULL, ARRAY['CNN', 'architecture', 'deep learning'], false, '#f9ca24', CURRENT_TIMESTAMP),
('ii111111-1111-1111-1111-111111111005', 'Bayesian Network Applications', 'Real-world applications of Bayesian networks beyond medical diagnosis: fraud detection, spam filtering, recommendation systems.', '44444444-4444-4444-4444-444444444215', '33333333-3333-3333-3333-333333333001', NULL, ARRAY['bayesian', 'applications', 'probability'], false, '#6c5ce7', CURRENT_TIMESTAMP);

-- =====================================================================
-- NOTIFICATIONS (System and course notifications)
-- =====================================================================
INSERT INTO notifications (id, user_id, title, message, type, is_read, related_id, created_at, priority_level) VALUES
-- Assignment notifications
('nn111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'Assignment Graded', 'Your ER Diagram Design assignment has been graded. Score: 85/100', 'assignment', true, 'aa111111-1111-1111-1111-111111111001', '2025-10-16 10:00:00', 2),
('nn111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444202', 'Assignment Graded', 'Your ER Diagram Design assignment has been graded. Score: 92/100', 'assignment', false, 'aa111111-1111-1111-1111-111111111001', '2025-10-16 10:15:00', 2),
('nn111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444204', 'Assignment Graded', 'Your Neural Network Implementation has been graded. Score: 95/120', 'assignment', false, 'aa111111-1111-1111-1111-111111111004', '2025-11-02 14:00:00', 2),

-- Upcoming deadlines
('nn111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444201', 'Assignment Due Soon', 'SQL Queries Lab assignment is due in 2 days (Oct 20, 2025)', 'deadline', false, 'aa111111-1111-1111-1111-111111111002', CURRENT_TIMESTAMP, 3),
('nn111111-1111-1111-1111-111111111005', '44444444-4444-4444-4444-444444444206', 'Project Update', 'Smart Campus Management System project milestone due next week', 'project', false, 'pp111111-1111-1111-1111-111111111002', CURRENT_TIMESTAMP, 2),

-- Course announcements
('nn111111-1111-1111-1111-111111111006', '44444444-4444-4444-4444-444444444201', 'Class Rescheduled', 'Tomorrow''s Deep Learning class has been moved to 2:00 PM', 'announcement', false, '33333333-3333-3333-3333-333333333004', CURRENT_TIMESTAMP, 3),
('nn111111-1111-1111-1111-111111111007', '44444444-4444-4444-4444-444444444202', 'New Resource Available', 'CNN Implementation Guide has been uploaded to the course resources', 'resource', false, 'rr111111-1111-1111-1111-111111111005', CURRENT_TIMESTAMP, 1);

-- =====================================================================
-- BOOKMARKS (Student bookmarked content)
-- =====================================================================
INSERT INTO bookmarks (id, user_id, bookmarkable_type, bookmarkable_id, title, created_at) VALUES
('bb111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'resource', 'rr111111-1111-1111-1111-111111111004', 'Introduction to Neural Networks', CURRENT_TIMESTAMP),
('bb111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444201', 'assignment', 'aa111111-1111-1111-1111-111111111004', 'Neural Network Implementation', CURRENT_TIMESTAMP),
('bb111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444206', 'project', 'pp111111-1111-1111-1111-111111111002', 'Smart Campus Management System', CURRENT_TIMESTAMP),
('bb111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444211', 'resource', 'rr111111-1111-1111-1111-111111111003', 'Database Optimization Techniques', CURRENT_TIMESTAMP),
('bb111111-1111-1111-1111-111111111005', '44444444-4444-4444-4444-444444444204', 'resource', 'rr111111-1111-1111-1111-111111111006', 'Deep Learning Research Papers', CURRENT_TIMESTAMP);

-- =====================================================================
-- QUICK ACCESS ITEMS (Frequently accessed items)
-- =====================================================================
INSERT INTO quick_access_items (id, user_id, item_type, item_id, display_order, created_at) VALUES
('qa111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'course', '33333333-3333-3333-3333-333333333004', 1, CURRENT_TIMESTAMP),
('qa111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444201', 'project', 'pp111111-1111-1111-1111-111111111001', 2, CURRENT_TIMESTAMP),
('qa111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444201', 'assignment', 'aa111111-1111-1111-1111-111111111002', 3, CURRENT_TIMESTAMP),
('qa111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444206', 'course', '33333333-3333-3333-3333-333333333005', 1, CURRENT_TIMESTAMP),
('qa111111-1111-1111-1111-111111111005', '44444444-4444-4444-4444-444444444206', 'project', 'pp111111-1111-1111-1111-111111111002', 2, CURRENT_TIMESTAMP);

-- =====================================================================
-- SEARCH HISTORY (Student search patterns)
-- =====================================================================
INSERT INTO search_history (id, user_id, query, search_type, results_count, created_at) VALUES
('sh111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'neural network implementation', 'resources', 12, '2025-09-25 14:20:00'),
('sh111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444201', 'machine learning algorithms', 'general', 28, '2025-09-24 16:35:00'),
('sh111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444206', 'IoT sensors campus', 'projects', 7, '2025-09-23 11:15:00'),
('sh111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444211', 'database optimization indexing', 'resources', 15, '2025-09-22 13:40:00'),
('sh111111-1111-1111-1111-111111111005', '44444444-4444-4444-4444-444444444204', 'CNN architecture comparison', 'general', 34, '2025-09-21 17:25:00');

-- =====================================================================
-- USER ACTIVITY (Activity tracking)
-- =====================================================================
INSERT INTO user_activity (id, user_id, activity_type, related_type, related_id, metadata, created_at) VALUES
('ua111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'assignment_submit', 'assignment', 'aa111111-1111-1111-1111-111111111001', '{"submission_time": "2025-10-14T18:30:00", "file_count": 1}', '2025-10-14 18:30:00'),
('ua111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444201', 'resource_download', 'resource', 'rr111111-1111-1111-1111-111111111004', '{"file_name": "neural_networks_intro.pdf", "file_size": 3200000}', '2025-09-25 14:30:00'),
('ua111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444206', 'project_update', 'project', 'pp111111-1111-1111-1111-111111111002', '{"progress_change": 5, "new_progress": 45}', '2025-09-20 16:15:00'),
('ua111111-1111-1111-1111-111111111004', '44444444-4444-4444-4444-444444444204', 'file_upload', 'assignment', 'aa111111-1111-1111-1111-111111111004', '{"file_name": "MLP_Implementation.py", "file_size": 45000}', '2025-10-30 19:20:00'),
('ua111111-1111-1111-1111-111111111005', '44444444-4444-4444-4444-444444444211', 'idea_create', 'idea', 'ii111111-1111-1111-1111-111111111002', '{"title": "Database Indexing Strategy", "tags": ["database", "indexing", "performance"]}', CURRENT_TIMESTAMP);

-- =====================================================================
-- AI CONVERSATIONS (AI chat history)
-- =====================================================================
INSERT INTO ai_conversations (id, user_id, title, context_data, created_at) VALUES
('ac111111-1111-1111-1111-111111111001', '44444444-4444-4444-4444-444444444201', 'Neural Network Help', '{"course": "Deep Learning", "topic": "backpropagation"}', '2025-09-20 15:30:00'),
('ac111111-1111-1111-1111-111111111002', '44444444-4444-4444-4444-444444444206', 'IoT Project Discussion', '{"project": "Smart Campus", "focus": "sensor integration"}', '2025-09-18 14:45:00'),
('ac111111-1111-1111-1111-111111111003', '44444444-4444-4444-4444-444444444211', 'Database Query Optimization', '{"course": "DBMS", "topic": "query performance"}', '2025-09-15 11:20:00');

-- =====================================================================
-- AI MESSAGES (Conversation details)
-- =====================================================================
INSERT INTO ai_messages (id, conversation_id, user_message, ai_response, message_order, response_time, created_at) VALUES
('am111111-1111-1111-1111-111111111001', 'ac111111-1111-1111-1111-111111111001', 'Can you explain backpropagation in simple terms?', 'Backpropagation is like learning from mistakes backwards. When a neural network makes a wrong prediction, it calculates how much each connection (weight) contributed to the error, starting from the output and working backwards through the layers. It then adjusts these weights to reduce the error for future predictions.', 1, 1200, '2025-09-20 15:30:00'),
('am111111-1111-1111-1111-111111111002', 'ac111111-1111-1111-1111-111111111001', 'How does gradient descent work with backpropagation?', 'Gradient descent is the optimization algorithm that uses the gradients calculated by backpropagation. Think of it as rolling a ball down a hill to find the lowest point (minimum error). The gradients tell us which direction is "downhill" for each weight, and gradient descent takes small steps in that direction to minimize the loss function.', 2, 1800, '2025-09-20 15:32:00'),
('am111111-1111-1111-1111-111111111003', 'ac111111-1111-1111-1111-111111111002', 'What sensors would be best for monitoring classroom occupancy?', 'For classroom occupancy monitoring, I''d recommend: 1) PIR (Passive Infrared) sensors for motion detection, 2) CO2 sensors as higher CO2 levels indicate more people, 3) Ultrasonic sensors for counting people entering/exiting, 4) Camera-based people counting systems for accuracy. PIR sensors are cost-effective for basic occupancy, while camera systems provide the most detailed data.', 1, 2100, '2025-09-18 14:45:00');

-- =====================================================================
-- CURRENT SESSIONS (Active/recent class sessions)
-- =====================================================================
INSERT INTO current_sessions (id, class_id, actual_start_time, actual_end_time, attendance_count, status, notes, attendance_taken, attendance_data, created_at) VALUES
('cs111111-1111-1111-1111-111111111001', '55555555-5555-5555-5555-555555555001', '2025-09-26 08:52:00', '2025-09-26 09:38:00', 58, 'completed', 'Covered ER diagram fundamentals and normalization basics', true, '[{"student_id": "44444444-4444-4444-4444-444444444201", "status": "present"}, {"student_id": "44444444-4444-4444-4444-444444444202", "status": "present"}, {"student_id": "44444444-4444-4444-4444-444444444203", "status": "late"}]', '2025-09-26 08:50:00'),
('cs111111-1111-1111-1111-111111111002', '55555555-5555-5555-5555-555555555003', '2025-09-26 10:47:00', '2025-09-26 11:33:00', 57, 'completed', 'Introduction to Bayesian inference and probability distributions', true, '[{"student_id": "44444444-4444-4444-4444-444444444201", "status": "present"}, {"student_id": "44444444-4444-4444-4444-444444444202", "status": "present"}]', '2025-09-26 10:45:00'),
('cs111111-1111-1111-1111-111111111003', '55555555-5555-5555-5555-555555555005', '2025-09-26 13:17:00', NULL, 60, 'in_progress', 'Communication skills and presentation techniques', false, '[]', '2025-09-26 13:15:00');

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================
-- Check data counts across all tables
-- SELECT 'assignments' as table_name, COUNT(*) as row_count FROM assignments
-- UNION ALL SELECT 'projects', COUNT(*) FROM projects
-- UNION ALL SELECT 'resources', COUNT(*) FROM resources
-- UNION ALL SELECT 'ideas', COUNT(*) FROM ideas
-- UNION ALL SELECT 'notifications', COUNT(*) FROM notifications
-- UNION ALL SELECT 'ai_conversations', COUNT(*) FROM ai_conversations
-- UNION ALL SELECT 'current_sessions', COUNT(*) FROM current_sessions;

-- =====================================================================
-- NOTES:
-- 1. All data is specifically created for AIE C section students
-- 2. Realistic academic content and scenarios
-- 3. Proper relationships maintained across all tables
-- 4. Activity data reflects typical student engagement patterns
-- 5. All UUIDs follow PostgreSQL format
-- 6. Timestamps are realistic and chronologically consistent
-- =====================================================================