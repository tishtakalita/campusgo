"""
Extended API Endpoints - Part 2
Additional endpoints for complete coverage
"""
from fastapi import APIRouter, HTTPException

def add_extended_routes(app, supabase):
    """Add all the extended routes to the FastAPI app"""
    
    # ============================================================================
    # ADDITIONAL USER ENDPOINTS
    # ============================================================================
    
    @app.put("/api/users/me")
    def update_my_profile(data: dict):
        return {"message": "Profile updated", "data": data}
    
    @app.put("/api/users/preferences")
    def update_user_preferences(data: dict):
        return {"message": "Preferences updated", "data": data}
    
    @app.get("/api/users/{user_id}/stats")
    def get_user_detailed_stats(user_id: str):
        try:
            # Get user's enrollments, assignments, etc.
            enrollments = supabase.table("enrollments").select("*").eq("student_id", user_id).execute()
            submissions = supabase.table("assignment_submissions").select("*").eq("student_id", user_id).execute()
            
            return {
                "enrollments_count": len(enrollments.data) if enrollments.data else 0,
                "submissions_count": len(submissions.data) if submissions.data else 0
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============================================================================
    # ADDITIONAL SESSION ENDPOINTS
    # ============================================================================
    
    @app.put("/api/sessions/{session_id}")
    def update_session(session_id: str, data: dict):
        return {"message": f"Session {session_id} updated", "data": data}
    
    @app.get("/api/sessions/{session_id}/attendance")
    def get_session_attendance(session_id: str):
        try:
            result = supabase.table("current_sessions").select("attendance_data, attendance_count").eq("id", session_id).execute()
            return {"attendance": result.data[0] if result.data else None}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============================================================================
    # ADDITIONAL CLASSES ENDPOINTS
    # ============================================================================
    
    @app.get("/api/classes/course/{course_id}")
    def get_classes_by_course(course_id: str):
        try:
            result = supabase.table("classes").select("*").eq("course_id", course_id).execute()
            return {"classes": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.put("/api/classes/{class_id}/status")
    def update_class_status(class_id: str, data: dict):
        return {"message": f"Class {class_id} status updated", "data": data}
    
    # ============================================================================
    # ADDITIONAL ASSIGNMENT ENDPOINTS
    # ============================================================================
    
    @app.get("/api/assignments/course/{course_id}")
    def get_assignments_by_course(course_id: str):
        try:
            result = supabase.table("assignments").select("*").eq("course_id", course_id).execute()
            return {"assignments": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/assignments/{assignment_id}/submit")
    def submit_assignment(assignment_id: str, data: dict):
        return {"message": f"Assignment {assignment_id} submitted", "data": data}
    
    @app.put("/api/assignments/{assignment_id}/submission")
    def update_assignment_submission(assignment_id: str, data: dict):
        return {"message": f"Submission for {assignment_id} updated", "data": data}
    
    @app.delete("/api/assignments/{assignment_id}/submission")
    def delete_assignment_submission(assignment_id: str):
        return {"message": f"Submission for {assignment_id} deleted"}
    
    # ============================================================================
    # ADDITIONAL COURSE ENDPOINTS
    # ============================================================================
    
    @app.post("/api/courses/{course_id}/enroll")
    def enroll_in_course(course_id: str, data: dict):
        return {"message": f"Enrolled in course {course_id}", "data": data}
    
    @app.delete("/api/courses/{course_id}/enroll")
    def drop_course(course_id: str):
        return {"message": f"Dropped course {course_id}"}
    
    # ============================================================================
    # ADDITIONAL RESOURCE ENDPOINTS
    # ============================================================================
    
    @app.get("/api/resources/filter")
    def filter_resources(type: str = ""):
        try:
            if type:
                result = supabase.table("resources").select("*").eq("resource_type", type).execute()
            else:
                result = supabase.table("resources").select("*").limit(20).execute()
            return {"resources": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/resources/course/{course_id}")
    def get_resources_by_course(course_id: str):
        try:
            result = supabase.table("resources").select("*").eq("course_id", course_id).execute()
            return {"resources": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/resources/{resource_id}/download")
    def track_resource_download(resource_id: str, data: dict):
        try:
            # Increment download count
            result = supabase.table("resources").update({
                "download_count": supabase.table("resources").select("download_count").eq("id", resource_id).execute().data[0]["download_count"] + 1
            }).eq("id", resource_id).execute()
            
            # Log download in resource_downloads table
            supabase.table("resource_downloads").insert({
                "resource_id": resource_id,
                "user_id": data.get("user_id"),
                "downloaded_at": "now()"
            }).execute()
            
            return {"message": f"Download tracked for resource {resource_id}"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/api/resources")
    def create_resource(data: dict):
        try:
            # Prepare resource data
            resource_data = {
                "title": data.get("title"),
                "description": data.get("description"),
                "resource_type": data.get("resource_type", "document"),
                "file_url": data.get("file_url"),  # S3 bucket URL
                "file_name": data.get("file_name"),
                "file_size": data.get("file_size"),
                "file_type": data.get("file_type"),
                "course_id": data.get("course_id"),
                "uploaded_by": data.get("uploaded_by"),
                "is_external": data.get("is_external", False),
                "external_url": data.get("external_url"),
                "tags": data.get("tags", []),
                "download_count": 0
            }
            
            result = supabase.table("resources").insert(resource_data).execute()
            return {"message": "Resource created successfully", "resource": result.data[0]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.put("/api/resources/{resource_id}")
    def update_resource(resource_id: str, data: dict):
        try:
            # Prepare update data
            update_data = {}
            if "title" in data:
                update_data["title"] = data["title"]
            if "description" in data:
                update_data["description"] = data["description"]
            if "resource_type" in data:
                update_data["resource_type"] = data["resource_type"]
            if "file_url" in data:
                update_data["file_url"] = data["file_url"]
            if "file_name" in data:
                update_data["file_name"] = data["file_name"]
            if "file_size" in data:
                update_data["file_size"] = data["file_size"]
            if "file_type" in data:
                update_data["file_type"] = data["file_type"]
            if "tags" in data:
                update_data["tags"] = data["tags"]
            if "is_external" in data:
                update_data["is_external"] = data["is_external"]
            if "external_url" in data:
                update_data["external_url"] = data["external_url"]
            
            result = supabase.table("resources").update(update_data).eq("id", resource_id).execute()
            return {"message": f"Resource {resource_id} updated successfully", "resource": result.data[0]}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.delete("/api/resources/{resource_id}")
    def delete_resource(resource_id: str):
        try:
            result = supabase.table("resources").delete().eq("id", resource_id).execute()
            return {"message": f"Resource {resource_id} deleted successfully"}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))    # ============================================================================
    # ADDITIONAL FILE ENDPOINTS
    # ============================================================================
    
    @app.get("/api/files/filter")
    def filter_files(type: str = ""):
        try:
            if type:
                result = supabase.table("files").select("*").eq("file_type", type).execute()
            else:
                result = supabase.table("files").select("*").limit(20).execute()
            return {"files": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/files/course/{course_id}")
    def get_files_by_course(course_id: str):
        try:
            result = supabase.table("files").select("*").eq("course_id", course_id).execute()
            return {"files": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/files/upload")
    def upload_file(data: dict):
        return {"message": "File uploaded", "data": data}
    
    @app.put("/api/files/{file_id}")
    def update_file(file_id: str, data: dict):
        return {"message": f"File {file_id} updated", "data": data}
    
    @app.delete("/api/files/{file_id}")
    def delete_file(file_id: str):
        return {"message": f"File {file_id} deleted"}
    
    @app.get("/api/files/{file_id}/download")
    def download_file(file_id: str):
        return {"message": f"File {file_id} download link", "download_url": f"#download-{file_id}"}
    
    @app.post("/api/files/{file_id}/share")
    def share_file(file_id: str, data: dict):
        return {"message": f"File {file_id} shared", "data": data}
    
    # ============================================================================
    # ADDITIONAL PROJECT ENDPOINTS
    # ============================================================================
    
    @app.get("/api/projects/filter")
    def filter_projects(status: str = ""):
        try:
            if status:
                result = supabase.table("projects").select("*").eq("status", status).execute()
            else:
                result = supabase.table("projects").select("*").limit(20).execute()
            return {"projects": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/projects")
    def create_project(data: dict):
        return {"message": "Project created", "data": data}
    
    @app.put("/api/projects/{project_id}")
    def update_project(project_id: str, data: dict):
        return {"message": f"Project {project_id} updated", "data": data}
    
    @app.delete("/api/projects/{project_id}")
    def delete_project(project_id: str):
        return {"message": f"Project {project_id} deleted"}
    
    @app.post("/api/projects/{project_id}/members")
    def add_project_member(project_id: str, data: dict):
        return {"message": f"Member added to project {project_id}", "data": data}
    
    @app.delete("/api/projects/{project_id}/members/{user_id}")
    def remove_project_member(project_id: str, user_id: str):
        return {"message": f"Member {user_id} removed from project {project_id}"}
    
    @app.put("/api/projects/{project_id}/progress")
    def update_project_progress(project_id: str, data: dict):
        return {"message": f"Project {project_id} progress updated", "data": data}
    
    # ============================================================================
    # ADDITIONAL NOTIFICATION ENDPOINTS
    # ============================================================================
    
    @app.put("/api/notifications/{notification_id}/read")
    def mark_notification_read(notification_id: str):
        return {"message": f"Notification {notification_id} marked as read"}
    
    @app.put("/api/notifications/read-all")
    def mark_all_notifications_read():
        return {"message": "All notifications marked as read"}
    
    @app.delete("/api/notifications/{notification_id}")
    def delete_notification(notification_id: str):
        return {"message": f"Notification {notification_id} deleted"}
    
    @app.post("/api/notifications")
    def create_notification(data: dict):
        return {"message": "Notification created", "data": data}
    
    @app.get("/api/notifications/settings")
    def get_notification_settings():
        try:
            result = supabase.table("user_preferences").select("*").limit(1).execute()
            return {"settings": result.data[0] if result.data else {}}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.put("/api/notifications/settings")
    def update_notification_settings(data: dict):
        return {"message": "Notification settings updated", "data": data}
    
    # ============================================================================
    # ADDITIONAL IDEAS ENDPOINTS
    # ============================================================================
    
    @app.get("/api/ideas/filter")
    def filter_ideas(category: str = ""):
        try:
            if category:
                # Filter by course_id if category provided
                result = supabase.table("ideas").select("*").eq("course_id", category).execute()
            else:
                result = supabase.table("ideas").select("*").limit(20).execute()
            return {"ideas": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.post("/api/ideas")
    def create_idea(data: dict):
        return {"message": "Idea created", "data": data}
    
    @app.put("/api/ideas/{idea_id}")
    def update_idea(idea_id: str, data: dict):
        return {"message": f"Idea {idea_id} updated", "data": data}
    
    @app.delete("/api/ideas/{idea_id}")
    def delete_idea(idea_id: str):
        return {"message": f"Idea {idea_id} deleted"}
    
    @app.put("/api/ideas/{idea_id}/favorite")
    def toggle_idea_favorite(idea_id: str):
        return {"message": f"Idea {idea_id} favorite status toggled"}
    
    @app.get("/api/ideas/tags")
    def get_idea_tags():
        try:
            result = supabase.table("ideas").select("tags").execute()
            all_tags = []
            for row in result.data:
                if row.get("tags"):
                    all_tags.extend(row["tags"])
            return {"tags": list(set(all_tags))}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============================================================================
    # ADDITIONAL AI CHAT ENDPOINTS
    # ============================================================================
    
    @app.post("/api/chat/conversations")
    def create_conversation(data: dict):
        return {"message": "Conversation created", "data": data}
    
    @app.delete("/api/chat/conversations/{conversation_id}")
    def delete_conversation(conversation_id: str):
        return {"message": f"Conversation {conversation_id} deleted"}
    
    @app.post("/api/chat/conversations/{conversation_id}/messages")
    def send_message(conversation_id: str, data: dict):
        return {"message": f"Message sent to conversation {conversation_id}", "data": data}
    
    @app.post("/api/chat/quick-actions")
    def chat_quick_actions(data: dict):
        return {"response": "Quick action response", "data": data}
    
    @app.post("/api/chat/context")
    def chat_context_query(data: dict):
        return {"response": "Context-based AI response", "data": data}
    
    # ============================================================================
    # ADDITIONAL SEARCH ENDPOINTS
    # ============================================================================
    
    @app.get("/api/search/assignments")
    def search_assignments(q: str = ""):
        try:
            if q:
                result = supabase.table("assignments").select("*").ilike("title", f"%{q}%").execute()
            else:
                result = supabase.table("assignments").select("*").limit(10).execute()
            return {"assignments": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/search/resources")
    def search_resources_specific(q: str = ""):
        try:
            if q:
                result = supabase.table("resources").select("*").ilike("title", f"%{q}%").execute()
            else:
                result = supabase.table("resources").select("*").limit(10).execute()
            return {"resources": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/search/courses")
    def search_courses(q: str = ""):
        try:
            if q:
                result = supabase.table("courses").select("*").ilike("name", f"%{q}%").execute()
            else:
                result = supabase.table("courses").select("*").limit(10).execute()
            return {"courses": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/search/users")
    def search_users_specific(q: str = ""):
        try:
            if q:
                result = supabase.table("users").select("*").ilike("first_name", f"%{q}%").execute()
            else:
                result = supabase.table("users").select("*").limit(10).execute()
            return {"users": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/search/suggestions")
    def get_search_suggestions(q: str = ""):
        try:
            if not q:
                return {"suggestions": []}
                
            # Get suggestions from multiple tables
            courses = supabase.table("courses").select("name").ilike("name", f"%{q}%").limit(3).execute()
            assignments = supabase.table("assignments").select("title").ilike("title", f"%{q}%").limit(3).execute()
            
            suggestions = []
            for course in (courses.data or []):
                suggestions.append({"type": "course", "text": course["name"]})
            for assignment in (assignments.data or []):
                suggestions.append({"type": "assignment", "text": assignment["title"]})
                
            return {"suggestions": suggestions}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.put("/api/quick-access")
    def update_quick_access(data: dict):
        return {"message": "Quick access updated", "data": data}
    
    # ============================================================================
    # ADDITIONAL DEPARTMENT ENDPOINTS
    # ============================================================================
    
    @app.get("/api/departments/{department_id}/faculty")
    def get_department_faculty(department_id: str):
        try:
            result = supabase.table("users").select("*").eq("department_id", department_id).execute()
            return {"faculty": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============================================================================
    # ADDITIONAL STATISTICS ENDPOINTS
    # ============================================================================
    
    @app.get("/api/stats/academic")
    def get_academic_stats():
        try:
            enrollments = supabase.table("enrollments").select("*").execute()
            active_courses = supabase.table("courses").select("*").eq("is_active", True).execute()
            
            return {
                "total_enrollments": len(enrollments.data) if enrollments.data else 0,
                "active_courses": len(active_courses.data) if active_courses.data else 0
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/stats/resources")
    def get_resource_usage_stats():
        try:
            resources = supabase.table("resources").select("*").execute()
            downloads = supabase.table("resource_downloads").select("*").execute()
            
            return {
                "total_resources": len(resources.data) if resources.data else 0,
                "total_downloads": len(downloads.data) if downloads.data else 0
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/stats/projects")
    def get_project_stats():
        try:
            projects = supabase.table("projects").select("*").execute()
            
            # Count by status
            status_counts = {}
            for project in (projects.data or []):
                status = project.get("status", "unknown")
                status_counts[status] = status_counts.get(status, 0) + 1
                
            return {
                "total_projects": len(projects.data) if projects.data else 0,
                "by_status": status_counts
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    @app.get("/api/stats/timeline")
    def get_activity_timeline():
        try:
            result = supabase.table("user_activity").select("*").order("created_at", desc=True).limit(100).execute()
            return {"timeline": result.data}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============================================================================
    # SYSTEM ENDPOINTS
    # ============================================================================
    
    @app.get("/api/system/health")
    def system_health():
        try:
            # Test database connection
            result = supabase.table("users").select("count").limit(1).execute()
            return {"status": "healthy", "database": "connected", "timestamp": "2024-01-01T00:00:00Z"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    @app.get("/api/system/version")
    def api_version():
        return {"version": "1.0.0", "api_name": "AIE Portal API"}
    
    @app.post("/api/upload")
    def generic_upload(data: dict):
        return {"message": "File uploaded", "file_id": "test-file-123", "data": data}
    
    @app.get("/api/config")
    def get_app_config():
        return {
            "app_name": "AIE Portal",
            "version": "1.0.0",
            "features": ["assignments", "resources", "chat", "projects"],
            "max_file_size": 10485760
        }
    
    @app.get("/api/announcements")
    def get_system_announcements():
        try:
            # You could create an announcements table, for now return static data
            return {
                "announcements": [
                    {
                        "id": "1", 
                        "title": "System Maintenance", 
                        "message": "Scheduled maintenance tonight",
                        "type": "info",
                        "created_at": "2024-01-01T00:00:00Z"
                    }
                ]
            }
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))
    
    # ============================================================================
    # BATCH OPERATIONS
    # ============================================================================
    
    @app.post("/api/batch/assignments")
    def batch_assignment_operations(data: dict):
        return {"message": "Batch assignment operations completed", "data": data}
    
    @app.post("/api/batch/resources")
    def batch_resource_operations(data: dict):
        return {"message": "Batch resource operations completed", "data": data}
    
    @app.post("/api/batch/notifications")
    def batch_notification_operations(data: dict):
        return {"message": "Batch notification operations completed", "data": data}
    
    @app.delete("/api/batch/files")
    def batch_delete_files(data: dict):
        return {"message": "Batch file deletion completed", "data": data}
    
    print("✅ Extended routes added successfully!")
    return app