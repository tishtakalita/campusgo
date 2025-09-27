#!/usr/bin/env python3
"""
Generate enrollment records for all 60 AIE C section students
Each student enrolled in all 8 courses (480 total enrollments)
Uses proper PostgreSQL UUID format
"""

import uuid

def generate_proper_uuid():
    """Generate a proper PostgreSQL UUID"""
    return str(uuid.uuid4())

def generate_enrollments():
    """Generate enrollment SQL for all 60 students across 8 courses"""
    
    # Student UUIDs (IDs from cb.sc.u4aie23201 to cb.sc.u4aie23260)
    student_uuids = []
    for i in range(201, 261):  # 201 to 260
        student_uuids.append(f'44444444-4444-4444-4444-444444444{i:03d}')
    
    # Course UUIDs (8 courses)
    course_uuids = [
        '33333333-3333-3333-3333-333333333001',  # Probabilistic Reasoning
        '33333333-3333-3333-3333-333333333002',  # Formal Language and Automata
        '33333333-3333-3333-3333-333333333003',  # Database Management Systems
        '33333333-3333-3333-3333-333333333004',  # Deep Learning
        '33333333-3333-3333-3333-333333333005',  # Introduction to Cloud Computing
        '33333333-3333-3333-3333-333333333006',  # Biomedical Signal Processing
        '33333333-3333-3333-3333-333333333007',  # Data Driven Material Modelling
        '33333333-3333-3333-3333-333333333008',  # Soft Skills II
    ]
    
    enrollments = []
    enrollment_counter = 1
    
    # Generate enrollments for each student in each course
    for student_uuid in student_uuids:
        for course_uuid in course_uuids:
            enrollment_id = generate_proper_uuid()
            enrollment_sql = f"('{enrollment_id}', '{student_uuid}', '{course_uuid}', CURRENT_TIMESTAMP, 'active')"
            enrollments.append(enrollment_sql)
            enrollment_counter += 1
    
    # Generate the complete SQL file
    sql_content = f"""-- =====================================================================
-- AMRITA UNIVERSITY - AIE C SECTION ENROLLMENTS (CORRECTED UUIDs)
-- All 60 students enrolled in all 8 AIE courses (480 total enrollments)
-- Generated automatically with proper PostgreSQL UUIDs
-- =====================================================================

-- Clear existing enrollments first (if running again)
-- DELETE FROM enrollments;

-- Insert all 480 enrollments
INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES
{','.join(enrollments)};

-- =====================================================================
-- VERIFICATION QUERIES
-- =====================================================================

-- Check total enrollment count (should be 480)
-- SELECT COUNT(*) as total_enrollments FROM enrollments;

-- Check enrollments per student (should be 8 for each)
-- SELECT student_id, COUNT(*) as course_count 
-- FROM enrollments 
-- GROUP BY student_id 
-- ORDER BY student_id;

-- Check enrollments per course (should be 60 for each)
-- SELECT c.name, c.code, COUNT(e.id) as student_count
-- FROM courses c
-- LEFT JOIN enrollments e ON c.id = e.course_id
-- GROUP BY c.id, c.name, c.code
-- ORDER BY c.code;

-- Check specific student's enrollments
-- SELECT u.student_id, u.first_name, u.last_name, c.name as course_name, c.code
-- FROM enrollments e
-- JOIN users u ON e.student_id = u.id
-- JOIN courses c ON e.course_id = c.id
-- WHERE u.student_id = 'cb.sc.u4aie23201'
-- ORDER BY c.code;

-- Summary statistics
-- SELECT 
--     (SELECT COUNT(*) FROM users WHERE role = 'student') as total_students,
--     (SELECT COUNT(*) FROM courses WHERE is_active = true) as total_courses,
--     (SELECT COUNT(*) FROM enrollments) as total_enrollments,
--     (SELECT COUNT(*) FROM enrollments) / (SELECT COUNT(*) FROM users WHERE role = 'student') as avg_courses_per_student;

-- =====================================================================
-- NOTES:
-- 1. Total enrollments: {len(enrollments)}
-- 2. Each student enrolled in all 8 courses
-- 3. All UUIDs are properly formatted for PostgreSQL
-- 4. Can be run after main student data insertion
-- =====================================================================
"""
    
    return sql_content

if __name__ == "__main__":
    sql_content = generate_enrollments()
    
    # Write to file
    with open('complete_enrollments_fixed.sql', 'w', encoding='utf-8') as f:
        f.write(sql_content)
    
    print("✅ Generated complete_enrollments_fixed.sql")
    print("📊 Created 480 enrollment records (60 students × 8 courses)")
    print("🔧 All UUIDs are properly formatted for PostgreSQL")
    print("\nTo use:")
    print("1. Run the main amrita_fixed_uuids.sql first")
    print("2. Run remaining_students_fixed.sql to add remaining 40 students")
    print("3. Run complete_enrollments_fixed.sql to enroll all students")