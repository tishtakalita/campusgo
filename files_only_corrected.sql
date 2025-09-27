-- =====================================================================
-- FILES SECTION ONLY - CORRECTED UUIDs
-- CampusGo Database - Files with properly formatted UUIDs
-- =====================================================================

-- =====================================================================
-- FILES (Student and faculty uploaded files) - CORRECTED
-- =====================================================================
INSERT INTO files (id, name, original_name, file_type, file_size, mime_type, file_path, owner_id, course_id, project_id, assignment_id, is_public, upload_date) VALUES
-- Assignment submission files
('fa111111-1111-1111-1111-111111111001', 'er_diagram_aarav', 'University_ER_Diagram.pdf', 'document', 1200000, 'application/pdf', '/uploads/assignments/er_diagram_aarav.pdf', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333003', NULL, 'aa111111-1111-1111-1111-111111111001', false, '2025-10-14 18:30:00'),
('fa111111-1111-1111-1111-111111111002', 'neural_network_impl', 'MLP_Implementation.py', 'other', 45000, 'text/x-python', '/uploads/assignments/neural_network_impl.py', '44444444-4444-4444-4444-444444444204', '33333333-3333-3333-3333-333333333004', NULL, 'aa111111-1111-1111-1111-111111111004', false, '2025-10-30 19:20:00'),

-- Project files
('fa111111-1111-1111-1111-111111111003', 'healthcare_ai_prototype', 'Medical_Diagnosis_System.zip', 'archive', 8500000, 'application/zip', '/uploads/projects/healthcare_ai_prototype.zip', '44444444-4444-4444-4444-444444444201', '33333333-3333-3333-3333-333333333004', 'cc111111-1111-1111-1111-111111111001', NULL, false, '2025-09-15 16:45:00'),
('fa111111-1111-1111-1111-111111111004', 'smart_campus_docs', 'System_Architecture.pdf', 'document', 2100000, 'application/pdf', '/uploads/projects/smart_campus_docs.pdf', '44444444-4444-4444-4444-444444444206', '33333333-3333-3333-3333-333333333005', 'cc111111-1111-1111-1111-111111111002', NULL, false, '2025-09-20 14:20:00'),

-- Shared course materials including real Supabase resource
('fa111111-1111-1111-1111-111111111005', 'lecture_notes_week1', 'DL_Week1_Notes.pdf', 'document', 1800000, 'application/pdf', '/uploads/courses/lecture_notes_week1.pdf', '22222222-2222-2222-2222-222222222004', '33333333-3333-3333-3333-333333333004', NULL, NULL, true, '2025-09-01 09:00:00'),
('fa111111-1111-1111-1111-111111111006', 'sql_practice_problems', 'SQL_Practice_Set.sql', 'other', 25000, 'application/sql', '/uploads/courses/sql_practice_problems.sql', '22222222-2222-2222-2222-222222222003', '33333333-3333-3333-3333-333333333003', NULL, NULL, true, '2025-09-05 10:30:00'),
('fa111111-1111-1111-1111-111111111007', 'batch_c_212_resource', '212_BatchC_.pdf', 'document', 2800000, 'application/pdf', 'https://zhwaokrkcmjoywflhtle.supabase.co/storage/v1/object/sign/resources/212_BatchC_.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85MWVmYTMzZi1jZjJkLTQ3MWUtOGRiMC1iMzBlYTM1YmQ3OWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXNvdXJjZXMvMjEyX0JhdGNoQ18ucGRmIiwiaWF0IjoxNzU4ODg4MjEwLCJleHAiOjE3NTk0OTMwMTB9.zBJTw2kSTInXsp4XlyqA93a5FBDZ-tCIYbgtDXXI5xQ', '22222222-2222-2222-2222-222222222003', '33333333-3333-3333-3333-333333333003', NULL, NULL, true, '2025-09-26 12:00:00');

-- =====================================================================
-- VERIFICATION
-- =====================================================================
-- Check that files were inserted correctly
SELECT 'files' as table_name, COUNT(*) as row_count FROM files;

-- =====================================================================
-- NOTES:
-- 1. Fixed UUIDs to proper PostgreSQL format (8-4-4-4-12 hex digits)
-- 2. Used valid file_type enum values: document, archive, other
-- 3. All foreign key references maintained properly
-- =====================================================================