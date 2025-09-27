#!/usr/bin/env python3
"""
Generate complete enrollment SQL for all 60 AIE C section students
This script creates all missing enrollment records for students 203-260
"""

def generate_enrollments():
    """Generate enrollment SQL for all AIE C section students"""
    
    # Course mappings
    courses = [
        ('course-22aie301-uuid-001-001-001-000000001', '301'),
        ('course-22aie302-uuid-002-002-002-000000002', '302'),
        ('course-22aie303-uuid-003-003-003-000000003', '303'),
        ('course-22aie304-uuid-004-004-004-000000004', '304'),
        ('course-22aie305-uuid-005-005-005-000000005', '305'),
        ('course-22aie438-uuid-006-006-006-000000006', '438'),
        ('course-22aie452-uuid-007-007-007-000000007', '452'),
        ('course-19ssk301-uuid-008-008-008-000000008', 'ssk')
    ]
    
    sql_statements = []
    enrollment_counter = 229  # Starting from where we left off
    
    # Generate enrollments for students 203-260 (we already have 201-202 in main script)
    for student_num in range(203, 261):  # 203 to 260 inclusive
        student_id = f'student-aie23{student_num}-uuid-{student_num-200:03d}-{student_num-200:03d}-{student_num-200:03d}-{student_num-200:012d}'
        
        student_enrollments = []
        for course_id, course_code in courses:
            enrollment_id = f'enrollment-{student_num}-{course_code}-uuid-{enrollment_counter:012d}'
            enrollment_sql = f"('{enrollment_id}', '{student_id}', '{course_id}', CURRENT_TIMESTAMP, 'active')"
            student_enrollments.append(enrollment_sql)
            enrollment_counter += 1
        
        # Add INSERT statement for this student's enrollments
        if student_enrollments:
            sql_statements.append(f"-- Student cb.sc.u4aie23{student_num} enrollments")
            sql_statements.append("INSERT INTO enrollments (id, student_id, course_id, enrollment_date, status) VALUES")
            sql_statements.append(",\n".join(student_enrollments) + ";")
            sql_statements.append("")  # Empty line for readability
    
    return "\n".join(sql_statements)

def generate_user_preferences():
    """Generate user preferences for all remaining students"""
    
    sql_statements = []
    themes = ['dark', 'light']
    
    for student_num in range(206, 261):  # 206-260 (we already have 201-205)
        theme = themes[student_num % 2]  # Alternate between dark and light
        student_id = f'student-aie23{student_num}-uuid-{student_num-200:03d}-{student_num-200:03d}-{student_num-200:03d}-{student_num-200:012d}'
        pref_id = f'pref-aie23{student_num}-uuid-{student_num-200:012d}'
        
        pref_sql = f"('{pref_id}', '{student_id}', '{theme}', true, true, 'en', 'Asia/Kolkata', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)"
        sql_statements.append(pref_sql)
    
    if sql_statements:
        result = ["-- User preferences for remaining students (206-260)"]
        result.append("INSERT INTO user_preferences (id, user_id, theme, notifications_enabled, email_notifications, language, timezone, created_at, updated_at) VALUES")
        result.append(",\n".join(sql_statements) + ";")
        return "\n".join(result)
    
    return ""

def main():
    """Generate complete SQL file"""
    
    print("-- =====================================================================")
    print("-- COMPLETE ENROLLMENTS FOR ALL AIE C SECTION STUDENTS")
    print("-- Generated automatically for students cb.sc.u4aie23203 to cb.sc.u4aie23260")
    print("-- Run this after the complete_60_students.sql script")
    print("-- =====================================================================")
    print()
    
    # Generate enrollments
    enrollments_sql = generate_enrollments()
    print(enrollments_sql)
    
    print("-- =====================================================================")
    print("-- USER PREFERENCES FOR REMAINING STUDENTS")
    print("-- =====================================================================")
    print()
    
    # Generate user preferences
    preferences_sql = generate_user_preferences()
    print(preferences_sql)
    
    print()
    print("-- =====================================================================")
    print("-- VERIFICATION QUERIES")
    print("-- =====================================================================")
    print("-- Check total students: SELECT COUNT(*) as total_students FROM users WHERE role = 'student';")
    print("-- Check total enrollments: SELECT COUNT(*) as total_enrollments FROM enrollments;")
    print("-- Check students per course: SELECT c.name, COUNT(e.id) as student_count FROM courses c LEFT JOIN enrollments e ON c.id = e.course_id GROUP BY c.id, c.name;")
    print("-- Expected: 60 students, 480 enrollments (60 students × 8 courses)")

if __name__ == "__main__":
    main()