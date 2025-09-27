"""
Simple FastAPI-Supabase Backend
Real authentication with Supabase users table
"""
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import os
from dotenv import load_dotenv
from supabase import create_client, Client
import bcrypt
from datetime import datetime

# Import extended routes
from extended_routes import add_extended_routes

# Load environment variables
load_dotenv()

# Supabase configuration
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_ANON_KEY in .env file")

# Create Supabase client
supabase: Client = create_client(supabase_url, supabase_key)

# Create FastAPI app
app = FastAPI(
    title="AIE Portal API - Supabase Simple",
    description="Simple FastAPI-Supabase connection for all endpoints",
    version="1.0.0"
)

# CORS middleware for network access
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://10.12.249.159:3000",
        "http://10.12.249.159:5173", 
        "http://localhost:3000",
        "http://localhost:5173",
        "*"  # Allow all for testing
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Health check endpoint
@app.get("/")
def root():
    return {"message": "AIE Portal API - Simple Supabase Connection", "status": "running"}

@app.get("/health")
def health_check():
    try:
        # Test Supabase connection
        result = supabase.table("users").select("count").execute()
        return {"status": "healthy", "supabase": "connected", "database": "accessible"}
    except Exception as e:
        return {"status": "error", "message": str(e)}

# ============================================================================
# AUTHENTICATION & USER MANAGEMENT (Real Supabase authentication)
# ============================================================================

@app.post("/api/auth/login")
def login(data: dict):
    """
    Real login against Supabase users table
    Expected data: {"email": "user@example.com", "password": "plaintext_password"}
    """
    try:
        email = data.get("email")
        password = data.get("password")
        
        if not email or not password:
            raise HTTPException(status_code=400, detail="Email and password required")
        
        # Query user by email
        result = supabase.table("users").select("*").eq("email", email).execute()
        
        if not result.data:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        user = result.data[0]
        
        # Verify password
        stored_hash = user.get("password_hash", "").encode('utf-8')
        if not bcrypt.checkpw(password.encode('utf-8'), stored_hash):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Update last_login
        supabase.table("users").update({
            "last_login": datetime.now().isoformat()
        }).eq("id", user["id"]).execute()
        
        # Remove password_hash from response
        user_data = {k: v for k, v in user.items() if k != "password_hash"}
        
        return {"user": user_data, "message": "Login successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/api/auth/register")
def register(data: dict):
    """
    Register new user in Supabase users table
    Required fields: email, password, first_name, last_name, role
    Optional: student_id, department_id, year_of_study, phone, bio
    """
    try:
        # Required fields
        required_fields = ["email", "password", "first_name", "last_name", "role"]
        for field in required_fields:
            if not data.get(field):
                raise HTTPException(status_code=400, detail=f"{field} is required")
        
        # Check if user already exists
        existing = supabase.table("users").select("id").eq("email", data["email"]).execute()
        if existing.data:
            raise HTTPException(status_code=409, detail="User with this email already exists")
        
        # Hash password
        password_hash = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        # Prepare user data
        user_data = {
            "email": data["email"],
            "password_hash": password_hash,
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "role": data["role"],  # 'student', 'faculty', or 'admin'
            "is_active": True,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        # Optional fields
        optional_fields = ["student_id", "phone", "department_id", "year_of_study", "bio"]
        for field in optional_fields:
            if data.get(field):
                user_data[field] = data[field]
        
        # Insert user
        result = supabase.table("users").insert(user_data).execute()
        
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")
        
        # Remove password_hash from response
        user_response = {k: v for k, v in result.data[0].items() if k != "password_hash"}
        
        return {"user": user_response, "message": "Registration successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.get("/api/auth/user/{user_id}")
def get_user_by_id(user_id: str):
    """Get user by ID (no password hash)"""
    try:
        result = supabase.table("users").select("id, email, first_name, last_name, role, avatar_url, phone, department_id, year_of_study, is_active, last_login, created_at, bio, gpa, total_credits, student_id").eq("id", user_id).execute()
        
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"user": result.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/auth/me")
def get_current_user():
    try:
        result = supabase.table("users").select("*").limit(1).execute()
        return {"user": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# USERS
# ============================================================================

@app.get("/api/users")
def get_all_users():
    try:
        result = supabase.table("users").select("*").execute()
        return {"users": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/me")
def get_my_profile():
    try:
        result = supabase.table("users").select("*").limit(1).execute()
        return {"user": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/{user_id}")
def get_user_by_id(user_id: str):
    try:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        return {"user": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/search")
def search_users(query: str = ""):
    try:
        if query:
            result = supabase.table("users").select("*").ilike("first_name", f"%{query}%").execute()
        else:
            result = supabase.table("users").select("*").limit(10).execute()
        return {"users": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/preferences")
def get_user_preferences():
    try:
        result = supabase.table("user_preferences").select("*").execute()
        return {"preferences": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/users/stats")
def get_user_stats():
    try:
        # Get user stats - simplified
        users_count = supabase.table("users").select("count").execute()
        return {"stats": {"total_users": len(users_count.data) if users_count.data else 0}}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DASHBOARD & CURRENT CLASS
# ============================================================================

@app.get("/api/dashboard")
def get_dashboard():
    try:
        # Get current class info
        current_session = supabase.table("current_sessions").select("*").limit(1).execute()
        classes = supabase.table("classes").select("*").limit(5).execute()
        assignments = supabase.table("assignments").select("*").limit(5).execute()
        
        return {
            "current_session": current_session.data[0] if current_session.data else None,
            "recent_classes": classes.data,
            "recent_assignments": assignments.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/current")
def get_current_class():
    try:
        result = supabase.table("current_sessions").select("*, classes(*)").limit(1).execute()
        return {"current_class": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/next")
def get_next_class():
    try:
        result = supabase.table("classes").select("*").order("start_time").limit(1).execute()
        return {"next_class": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/current")
def get_current_session():
    try:
        result = supabase.table("current_sessions").select("*").limit(1).execute()
        return {"session": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CLASSES & TIMETABLE
# ============================================================================

@app.get("/api/classes")
def get_all_classes():
    try:
        result = supabase.table("classes").select("*, courses(name, code)").execute()
        return {"classes": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/today")
def get_todays_classes():
    try:
        result = supabase.table("classes").select("*, courses(name, code)").execute()
        return {"classes": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/week")
def get_weekly_timetable():
    try:
        result = supabase.table("classes").select("*, courses(name, code)").execute()
        return {"weekly_classes": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/month")
def get_monthly_classes():
    try:
        result = supabase.table("classes").select("*, courses(name, code)").execute()
        return {"monthly_classes": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/{class_id}")
def get_class_by_id(class_id: str):
    try:
        result = supabase.table("classes").select("*, courses(*)").eq("id", class_id).execute()
        return {"class": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ASSIGNMENTS
# ============================================================================

@app.get("/api/assignments")
def get_all_assignments():
    try:
        result = supabase.table("assignments").select("*, courses(name, code)").execute()
        return {"assignments": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/upcoming")
def get_upcoming_assignments():
    try:
        result = supabase.table("assignments").select("*, courses(name, code)").order("due_date").execute()
        return {"assignments": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/overdue")
def get_overdue_assignments():
    try:
        result = supabase.table("assignments").select("*, courses(name, code)").execute()
        return {"assignments": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/{assignment_id}")
def get_assignment_by_id(assignment_id: str):
    try:
        result = supabase.table("assignments").select("*, courses(*)").eq("id", assignment_id).execute()
        return {"assignment": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/{assignment_id}/submission")
def get_assignment_submission(assignment_id: str):
    try:
        result = supabase.table("assignment_submissions").select("*").eq("assignment_id", assignment_id).execute()
        return {"submission": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# COURSES & ENROLLMENTS
# ============================================================================

@app.get("/api/courses")
def get_all_courses():
    try:
        result = supabase.table("courses").select("*, departments(name)").execute()
        return {"courses": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/courses/{course_id}")
def get_course_by_id(course_id: str):
    try:
        result = supabase.table("courses").select("*, departments(*)").eq("id", course_id).execute()
        return {"course": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/courses/{course_id}/overview")
def get_course_overview(course_id: str):
    try:
        course = supabase.table("courses").select("*").eq("id", course_id).execute()
        assignments = supabase.table("assignments").select("*").eq("course_id", course_id).execute()
        classes = supabase.table("classes").select("*").eq("course_id", course_id).execute()
        
        return {
            "course": course.data[0] if course.data else None,
            "assignments_count": len(assignments.data) if assignments.data else 0,
            "classes_count": len(classes.data) if classes.data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/courses/{course_id}/students")
def get_course_students(course_id: str):
    try:
        result = supabase.table("enrollments").select("*, users(*)").eq("course_id", course_id).execute()
        return {"students": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# RESOURCES
# ============================================================================

@app.get("/api/resources")
def get_all_resources():
    try:
        result = supabase.table("resources").select("""
            *,
            courses(name, code),
            uploader:users!uploaded_by(first_name, last_name)
        """).execute()
        return {"resources": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/search")
def search_resources(q: str = ""):
    try:
        if q:
            result = supabase.table("resources").select("*").ilike("title", f"%{q}%").execute()
        else:
            result = supabase.table("resources").select("*").limit(10).execute()
        return {"resources": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/{resource_id}")
def get_resource_by_id(resource_id: str):
    try:
        result = supabase.table("resources").select("*, courses(*)").eq("id", resource_id).execute()
        return {"resource": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/{resource_id}/stats")
def get_resource_stats(resource_id: str):
    try:
        downloads = supabase.table("resource_downloads").select("*").eq("resource_id", resource_id).execute()
        return {"download_count": len(downloads.data) if downloads.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# FILES & DOCUMENTS
# ============================================================================

@app.get("/api/files")
def get_all_files():
    try:
        result = supabase.table("files").select("*, courses(name)").execute()
        return {"files": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/search")
def search_files(q: str = ""):
    try:
        if q:
            result = supabase.table("files").select("*").ilike("name", f"%{q}%").execute()
        else:
            result = supabase.table("files").select("*").limit(10).execute()
        return {"files": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/{file_id}")
def get_file_by_id(file_id: str):
    try:
        result = supabase.table("files").select("*").eq("id", file_id).execute()
        return {"file": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PROJECTS
# ============================================================================

@app.get("/api/projects")
def get_all_projects():
    try:
        result = supabase.table("projects").select("*, courses(name, code)").execute()
        return {"projects": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}")
def get_project_by_id(project_id: str):
    try:
        result = supabase.table("projects").select("*, courses(*)").eq("id", project_id).execute()
        return {"project": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects/{project_id}/members")
def get_project_members(project_id: str):
    try:
        result = supabase.table("project_members").select("*, users(*)").eq("project_id", project_id).execute()
        return {"members": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# NOTIFICATIONS
# ============================================================================

@app.get("/api/notifications")
def get_all_notifications():
    try:
        result = supabase.table("notifications").select("*").execute()
        return {"notifications": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/notifications/unread")
def get_unread_notifications():
    try:
        result = supabase.table("notifications").select("*").eq("is_read", False).execute()
        return {"notifications": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# IDEAS & NOTES
# ============================================================================

@app.get("/api/ideas")
def get_all_ideas():
    try:
        result = supabase.table("ideas").select("*, courses(name), projects(title)").execute()
        return {"ideas": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ideas/search")
def search_ideas(q: str = ""):
    try:
        if q:
            result = supabase.table("ideas").select("*").ilike("title", f"%{q}%").execute()
        else:
            result = supabase.table("ideas").select("*").limit(10).execute()
        return {"ideas": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ideas/{idea_id}")
def get_idea_by_id(idea_id: str):
    try:
        result = supabase.table("ideas").select("*").eq("id", idea_id).execute()
        return {"idea": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# AI CHAT & CONVERSATIONS
# ============================================================================

@app.get("/api/chat/conversations")
def get_all_conversations():
    try:
        result = supabase.table("ai_conversations").select("*").execute()
        return {"conversations": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/conversations/{conversation_id}")
def get_conversation_by_id(conversation_id: str):
    try:
        result = supabase.table("ai_conversations").select("*").eq("id", conversation_id).execute()
        return {"conversation": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/conversations/{conversation_id}/messages")
def get_conversation_messages(conversation_id: str):
    try:
        result = supabase.table("ai_messages").select("*").eq("conversation_id", conversation_id).order("message_order").execute()
        return {"messages": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SEARCH & QUICK ACCESS
# ============================================================================

@app.get("/api/search/global")
def global_search(q: str = ""):
    try:
        if not q:
            return {"results": []}
            
        # Search across multiple tables
        courses = supabase.table("courses").select("*").ilike("name", f"%{q}%").limit(5).execute()
        assignments = supabase.table("assignments").select("*").ilike("title", f"%{q}%").limit(5).execute()
        resources = supabase.table("resources").select("*").ilike("title", f"%{q}%").limit(5).execute()
        
        return {
            "results": {
                "courses": courses.data,
                "assignments": assignments.data, 
                "resources": resources.data
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/quick-access")
def get_quick_access():
    try:
        result = supabase.table("quick_access_items").select("*").execute()
        return {"items": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DEPARTMENTS
# ============================================================================

@app.get("/api/departments")
def get_all_departments():
    try:
        result = supabase.table("departments").select("*").execute()
        return {"departments": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/departments/{department_id}")
def get_department_by_id(department_id: str):
    try:
        result = supabase.table("departments").select("*").eq("id", department_id).execute()
        return {"department": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/departments/{department_id}/courses")
def get_department_courses(department_id: str):
    try:
        result = supabase.table("courses").select("*").eq("department_id", department_id).execute()
        return {"courses": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# STATISTICS & ANALYTICS
# ============================================================================

@app.get("/api/stats/overview")
def get_overview_stats():
    try:
        users = supabase.table("users").select("count").execute()
        courses = supabase.table("courses").select("count").execute()
        assignments = supabase.table("assignments").select("count").execute()
        
        return {
            "stats": {
                "users": len(users.data) if users.data else 0,
                "courses": len(courses.data) if courses.data else 0,
                "assignments": len(assignments.data) if assignments.data else 0
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/stats/assignments")
def get_assignment_stats():
    try:
        assignments = supabase.table("assignments").select("*").execute()
        submissions = supabase.table("assignment_submissions").select("*").execute()
        
        return {
            "total_assignments": len(assignments.data) if assignments.data else 0,
            "total_submissions": len(submissions.data) if submissions.data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# BOOKMARKS
# ============================================================================

@app.get("/api/bookmarks")
def get_all_bookmarks():
    try:
        result = supabase.table("bookmarks").select("*").execute()
        return {"bookmarks": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# USER ACTIVITY
# ============================================================================

@app.get("/api/activity")
def get_user_activity():
    try:
        result = supabase.table("user_activity").select("*").order("created_at", desc=True).limit(50).execute()
        return {"activities": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SEARCH HISTORY
# ============================================================================

@app.get("/api/search/history")
def get_search_history():
    try:
        result = supabase.table("search_history").select("*").order("created_at", desc=True).limit(20).execute()
        return {"search_history": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Add all extended routes
add_extended_routes(app, supabase)

if __name__ == "__main__":
    # Run on localhost for development
    uvicorn.run(
        "simple_fastapi:app",
        host="0.0.0.0", 
        port=8000,
        reload=True
    )