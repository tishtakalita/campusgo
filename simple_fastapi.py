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
supabase_key = os.getenv("SUPABASE_SERVICE_ROLE_KEY") or os.getenv("SUPABASE_ANON_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing SUPABASE_URL or SUPABASE_*_KEY in .env file")

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

@app.get("/debug/saturday-classes")
def debug_saturday_classes():
    try:
        from datetime import datetime
        now = datetime.now()
        today = now.date().isoformat()
        
        # Get all Saturday class entries
        all_saturday_classes = supabase.table("saturday_class").select("*").execute()
        
        # Get today's Saturday classes
        todays_saturday_classes = supabase.table("saturday_class").select("*").eq("date", today).execute()
        
        return {
            "current_date": today,
            "all_saturday_classes": all_saturday_classes.data,
            "todays_saturday_classes": todays_saturday_classes.data,
            "day_of_week": now.strftime('%A').lower()
        }
    except Exception as e:
        return {"error": str(e)}

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
        
        # Remove password_hash from response and add compatibility fields
        user_data = {k: v for k, v in user.items() if k != "password_hash"}
        # Backward compatibility for older UI expecting student_id/gpa
        if "roll_no" in user_data and "student_id" not in user_data:
            user_data["student_id"] = user_data["roll_no"]
        if "cgpa" in user_data and "gpa" not in user_data:
            user_data["gpa"] = user_data["cgpa"]

        return {"user": user_data, "message": "Login successful"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Login error: {str(e)}")

@app.post("/api/auth/register")
def register(data: dict):
    """
    Register new user in Supabase users table
    Required fields: email, password, first_name, last_name, role, roll_no, dept
    Optional: class, cgpa, phone, bio
    """
    try:
        # Validate required fields for new schema
        required_fields = ["email", "password", "first_name", "last_name", "role", "roll_no", "dept"]
        missing = [f for f in required_fields if not data.get(f)]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

        # Normalize and validate role
        role = str(data.get("role", "")).strip().lower()
        allowed_roles = {"student", "faculty", "admin"}
        if role not in allowed_roles:
            raise HTTPException(status_code=400, detail=f"Invalid role '{data.get('role')}'. Must be one of {sorted(allowed_roles)}")

        # Unique constraints
        existing_email = supabase.table("users").select("id").eq("email", data["email"]).execute()
        if existing_email.data:
            raise HTTPException(status_code=409, detail="User with this email already exists")
        existing_roll = supabase.table("users").select("id").eq("roll_no", data["roll_no"]).execute()
        if existing_roll.data:
            raise HTTPException(status_code=409, detail="User with this roll number already exists")

        # Validate department code exists (supports possible table naming/column variations)
        provided_dept = str(data.get("dept", "")).strip()
        dept_code_match = None
        dept_row_id = None
        dept_rows = []
        try:
            res1 = supabase.table("departments").select("*").execute()
            dept_rows = res1.data or []
        except Exception:
            dept_rows = []
        if not dept_rows:
            try:
                res2 = supabase.table("department").select("*").execute()
                dept_rows = res2.data or []
            except Exception:
                dept_rows = []
        # Try to find a matching code case-insensitively among common keys
        for r in dept_rows:
            cand = r.get("code") or r.get("department_code") or r.get("dept") or r.get("id") or r.get("name")
            if cand and str(cand).strip().lower() == provided_dept.lower():
                dept_code_match = str(cand)
                dept_row_id = r.get("id")
                break
        if not dept_code_match:
            raise HTTPException(status_code=400, detail=f"Unknown department code '{provided_dept}'. Please choose a valid department.")

        # Hash password
        password_hash = bcrypt.hashpw(data["password"].encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        now_iso = datetime.now().isoformat()

        # Build insert object matching the provided schema
        user_data = {
            "email": data["email"],
            "roll_no": data["roll_no"],
            "password_hash": password_hash,
            "first_name": data["first_name"],
            "last_name": data["last_name"],
            "role": role,
            "dept": dept_code_match,
            "is_active": True,
            "last_login": now_iso,
            "created_at": now_iso,
            "updated_at": now_iso,
        }

        # Optional fields
        input_class_id = data.get("class") or data.get("class_id")
        if input_class_id:
            # Validate class exists; and if possible, ensure dept consistency
            try:
                cls_res = supabase.table("class").select("id, dept").eq("id", input_class_id).limit(1).execute()
                if not cls_res.data:
                    raise HTTPException(status_code=400, detail="Invalid class: no such class ID")
                cls_row = cls_res.data[0]
                cls_dept = (cls_row.get("dept") or "").strip()
                if cls_dept and dept_code_match and cls_dept.lower() != str(dept_code_match).lower():
                    # Enforce that selected class belongs to selected department
                    raise HTTPException(status_code=400, detail="Selected class does not belong to the chosen department")
                # Tentatively use column name 'class'; we'll fallback to 'class_id' on insert error
                user_data["class"] = input_class_id
            except HTTPException:
                raise
            except Exception:
                # If class table isn't available or other issue, don't block signup; omit class
                pass
        if data.get("cgpa") not in (None, ""):
            try:
                user_data["cgpa"] = float(data["cgpa"])
            except Exception:
                raise HTTPException(status_code=400, detail="Invalid cgpa value")
        for legacy in ["phone", "bio"]:
            if data.get(legacy):
                user_data[legacy] = data[legacy]

        # Insert user (with fallbacks for class/class_id, dept variants, role enum variants, and legacy student_id)
        result = None
        try:
            result = supabase.table("users").insert(user_data).execute()
        except Exception as ie:
            # Try a sequence of fallbacks adjusting class/dept/role/legacy column names
            last_err = ie
            # Build candidates
            candidates = []
            base = dict(user_data)
            # 1) Drop optional class entirely if present (most lenient)
            if "class" in base:
                v = base.pop("class")
                cand = dict(base)
                candidates.append(cand)
                # put back for other variants
                base["class"] = v
            # dept -> department_code
            if "dept" in base:
                v = base.pop("dept")
                cand = dict(base)
                cand["department_code"] = v
                candidates.append(cand)
                # dept -> department
                cand2 = dict(base)
                cand2["department"] = v
                candidates.append(cand2)
                # dept -> department_id (needs id)
                if dept_row_id:
                    cand3 = dict(base)
                    cand3["department_id"] = dept_row_id
                    candidates.append(cand3)
                # restore base
                base["dept"] = v
            # role casing variants
            if "role" in base:
                r = base["role"]
                if isinstance(r, str):
                    cand = dict(base)
                    cand["role"] = r.upper()
                    candidates.append(cand)
                    cand2 = dict(base)
                    cand2["role"] = r.capitalize()
                    candidates.append(cand2)
            # roll_no legacy alias
            if "roll_no" in base:
                rn = base.pop("roll_no")
                cand = dict(base)
                cand["student_id"] = rn
                candidates.append(cand)
                base["roll_no"] = rn
            # class -> class_id variant (try later to avoid class_id-missing errors)
            if "class" in base:
                v = base.pop("class")
                cand = dict(base)
                cand["class_id"] = v
                candidates.append(cand)
                # put back for combined variants
                base["class"] = v
            # Combine class_id with department variants too
            if "class" in user_data and "dept" in user_data:
                vclass = user_data["class"]
                vdept = user_data["dept"]
                # class_id + department_code
                cand4 = dict(user_data)
                cand4.pop("class", None)
                cand4["class_id"] = vclass
                cand4.pop("dept", None)
                cand4["department_code"] = vdept
                candidates.append(cand4)
                # class_id + department
                cand5 = dict(cand4)
                cand5.pop("department_code", None)
                cand5["department"] = vdept
                candidates.append(cand5)
                # class_id + department_id
                if dept_row_id:
                    cand6 = dict(cand4)
                    cand6.pop("department_code", None)
                    cand6["department_id"] = dept_row_id
                    candidates.append(cand6)
                # class_id + role variants
                r = user_data.get("role")
                if isinstance(r, str):
                    cand7 = dict(cand4)
                    cand7["role"] = r.upper()
                    candidates.append(cand7)
                    cand8 = dict(cand4)
                    cand8["role"] = r.capitalize()
                    candidates.append(cand8)

            # Try candidates one by one
            for cand in candidates:
                try:
                    result = supabase.table("users").insert(cand).execute()
                    if result and result.data:
                        break
                except Exception as e2:
                    last_err = e2
                    result = None
                    continue
            if not result or not result.data:
                # No fallback worked; raise the last error we saw
                raise last_err
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create user")

        # Shape response without password_hash and add compatibility fields
        user_response = {k: v for k, v in result.data[0].items() if k != "password_hash"}
        if "roll_no" in user_response and "student_id" not in user_response:
            user_response["student_id"] = user_response["roll_no"]
        if "cgpa" in user_response and "gpa" not in user_response:
            user_response["gpa"] = user_response["cgpa"]

        return {"user": user_response, "message": "Registration successful"}

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Registration error: {str(e)}")

@app.get("/api/auth/user/{user_id}")
def get_user_by_id(user_id: str):
    """Get user by ID (no password hash)"""
    try:
        result = supabase.table("users").select("*").eq("id", user_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="User not found")

        user_row = {k: v for k, v in result.data[0].items() if k != "password_hash"}
        if "roll_no" in user_row and "student_id" not in user_row:
            user_row["student_id"] = user_row["roll_no"]
        if "cgpa" in user_row and "gpa" not in user_row:
            user_row["gpa"] = user_row["cgpa"]

        return {"user": user_row}

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

@app.get("/api/users/search")
def search_users(query: str = ""):
    try:
        q = (query or "").strip()
        if not q:
            result = supabase.table("users").select("*").limit(20).execute()
            return {"users": result.data or []}

        # Robust multi-field search only on text columns to avoid DB errors
        pattern = f"%{q}%"
        combined_results = []
        seen_ids = set()
        text_fields = ["first_name", "last_name", "email", "roll_no", "dept"]  # include new signup fields

        for field in text_fields:
            try:
                res = (
                    supabase
                    .table("users")
                    .select("*")
                    .ilike(field, pattern)
                    .limit(50)
                    .execute()
                )
                for row in (res.data or []):
                    uid = row.get("id")
                    if uid and uid not in seen_ids:
                        combined_results.append(row)
                        seen_ids.add(uid)
            except Exception:
                # Continue to next field if any single search fails
                continue

        # As a last resort, if nothing matched, return a small sample to avoid empty UI
        if not combined_results:
            try:
                result = supabase.table("users").select("*").limit(20).execute()
                return {"users": result.data or []}
            except Exception:
                return {"users": []}

        return {"users": combined_results}
    except Exception as e:
        # Do not fail hard; return empty list so UI can handle gracefully
        return {"users": []}

from uuid import UUID

@app.get("/api/users/{user_id}")
def get_user_by_id(user_id: UUID):
    try:
        result = supabase.table("users").select("*").eq("id", str(user_id)).execute()
        return {"user": result.data[0] if result.data else None}
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
        # Presence/current_sessions removed: don't query missing table
        # Include course info to align with full assignments/classes views
        classes = (
            supabase
            .table("timetable")
            .select("*, courses(name, code)")
            .order("start_time")
            .limit(5)
            .execute()
        )
        assignments = (
            supabase
            .table("assignments")
            .select("*, courses(name, code)")
            .order("due_date")
            .limit(5)
            .execute()
        )
        return {
            "current_session": None,
            "recent_classes": classes.data,
            "recent_assignments": assignments.data
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/current")
def get_current_class():
    try:
        from datetime import datetime, timedelta
        import calendar
        now = datetime.now()
        current_day = now.strftime('%A').lower()  # Get day name: monday, tuesday, etc.
        current_time = now.time()
        # Get all classes for today (updated for ENUM day_of_week)
        result = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", current_day).execute()
        if not result.data:
            return {"current_class": None}
        # Find current class (if any)
        for class_item in result.data:
            start_time_str = class_item["start_time"]
            end_time_str = class_item["end_time"]
            if 'T' in start_time_str:
                start_time = datetime.fromisoformat(start_time_str.replace('Z', '')).time()
            else:
                try:
                    start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
                except ValueError:
                    start_time = datetime.strptime(start_time_str, "%H:%M").time()
            if 'T' in end_time_str:
                end_time = datetime.fromisoformat(end_time_str.replace('Z', '')).time()
            else:
                try:
                    end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()
                except ValueError:
                    end_time = datetime.strptime(end_time_str, "%H:%M").time()
            if start_time <= current_time <= end_time:
                start_datetime = datetime.combine(now.date(), start_time)
                end_datetime = datetime.combine(now.date(), end_time)
                total_duration = end_datetime - start_datetime
                elapsed_time = now - start_datetime
                time_remaining = end_datetime - now
                progress_percentage = min(100, max(0, (elapsed_time.total_seconds() / total_duration.total_seconds()) * 100))
                minutes_remaining = int(time_remaining.total_seconds() / 60)
                if minutes_remaining <= 1:
                    class_item["time_remaining"] = "Ending soon"
                elif minutes_remaining < 60:
                    class_item["time_remaining"] = f"{minutes_remaining} min left"
                else:
                    hours = minutes_remaining // 60
                    mins = minutes_remaining % 60
                    class_item["time_remaining"] = f"{hours}h {mins}m left"
                class_item["status"] = "ongoing"
                class_item["progress_percentage"] = round(progress_percentage, 1)
                return {"current_class": class_item}
        return {"current_class": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/next")
def get_next_class():
    try:
        from datetime import datetime, timedelta
        import calendar
        now = datetime.now()
        current_day = now.strftime('%A').lower()
        current_time = now.time()
        next_class = None
        min_time_diff = None
        today_result = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", current_day).execute()
        if today_result.data:
            for class_item in today_result.data:
                start_time_str = class_item["start_time"]
                if 'T' in start_time_str:
                    start_time = datetime.fromisoformat(start_time_str.replace('Z', '')).time()
                else:
                    try:
                        start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
                    except ValueError:
                        start_time = datetime.strptime(start_time_str, "%H:%M").time()
                if start_time > current_time:
                    start_datetime = datetime.combine(now.date(), start_time)
                    time_diff = start_datetime - now
                    if min_time_diff is None or time_diff < min_time_diff:
                        min_time_diff = time_diff
                        next_class = class_item
                        if time_diff.days == 0:
                            hours = int(time_diff.total_seconds() / 3600)
                            minutes = int((time_diff.total_seconds() % 3600) / 60)
                            if hours > 0:
                                next_class["time_until"] = f"Starts in {hours}h {minutes}m"
                            else:
                                if minutes <= 5:
                                    next_class["time_until"] = "Starting soon"
                                else:
                                    next_class["time_until"] = f"Starts in {minutes} min"
                        next_class["status"] = "upcoming"
        if not next_class:
            for day_offset in range(1, 8):
                check_date = now + timedelta(days=day_offset)
                check_day = check_date.strftime('%A').lower()
                day_result = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", check_day).execute()
                if day_result.data:
                    earliest_class = min(day_result.data, key=lambda x: x["start_time"])
                    start_time_str = earliest_class["start_time"]
                    if 'T' in start_time_str:
                        start_time = datetime.fromisoformat(start_time_str.replace('Z', '')).time()
                    else:
                        try:
                            start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
                        except ValueError:
                            start_time = datetime.strptime(start_time_str, "%H:%M").time()
                    start_datetime = datetime.combine(check_date.date(), start_time)
                    time_diff = start_datetime - now
                    if min_time_diff is None or time_diff < min_time_diff:
                        min_time_diff = time_diff
                        next_class = earliest_class
                        if time_diff.days == 0:
                            hours = int(time_diff.total_seconds() / 3600)
                            minutes = int((time_diff.total_seconds() % 3600) / 60)
                            next_class["time_until"] = f"Starts in {hours}h {minutes}m"
                        elif time_diff.days == 1:
                            next_class["time_until"] = f"Tomorrow at {start_time.strftime('%I:%M %p')}"
                        else:
                            day_name = calendar.day_name[check_date.weekday()]
                            next_class["time_until"] = f"{day_name} at {start_time.strftime('%I:%M %p')}"
                        next_class["status"] = "upcoming"
                    break
        return {"next_class": next_class}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/sessions/current")
def get_current_session():
    try:
        # Presence/current_sessions removed: always empty
        return {"session": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CLASSES & TIMETABLE
# ============================================================================

@app.get("/api/classes")
def get_all_classes():
    try:
        result = supabase.table("timetable").select("*, courses(name, code)").execute()
        return {"classes": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/classes")
def create_class(data: dict):
    """Create a class (timetable entry) in 'class' table"""
    try:
        required = ["course_id", "room", "section", "start_time", "end_time", "day_of_week"]
        missing = [f for f in required if f not in data or data.get(f) in (None, "")]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(missing)}")
        insert_data = {
            "course_id": data["course_id"],
            "room": data["room"],
            "section": data["section"],
            "start_time": data["start_time"],
            "end_time": data["end_time"],
            "day_of_week": str(data["day_of_week"]).lower()
        }
        res = supabase.table("timetable").insert(insert_data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create class")
        return {"message": "Class created", "class": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/classes/{class_id}")
def update_class(class_id: str, data: dict):
    """Update a class (timetable entry) by id"""
    try:
        allowed = {"course_id", "room", "section", "start_time", "end_time", "day_of_week"}
        update_data = {k: (v.lower() if k == "day_of_week" and isinstance(v, str) else v) for k, v in data.items() if k in allowed}
        if not update_data:
            raise HTTPException(status_code=400, detail="No updatable fields provided")
        res = supabase.table("timetable").update(update_data).eq("id", class_id).execute()
        return {"message": "Class updated", "class": res.data[0] if res.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/classes/{class_id}")
def delete_class(class_id: str):
    """Delete a class (timetable entry) by id"""
    try:
        supabase.table("timetable").delete().eq("id", class_id).execute()
        return {"message": "Class deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/today")
def get_todays_classes(section: str | None = None):
    try:
        from datetime import datetime
        now = datetime.now()
        current_day = now.strftime('%A').lower()
        current_time = now.time()
        classes: list[dict] = []

        # Handle Saturday differently by reading saturday_class mapping for today's date
        if current_day == "saturday":
            # Prefer exact date match, but gracefully fallback if 'date' column is missing or empty
            sat_mappings = []
            try:
                sat_rows = supabase.table("saturday_class").select("*").eq("date", now.date().isoformat()).execute()
                sat_mappings = sat_rows.data or []
            except Exception:
                # Column 'date' may not exist yet; fallback to latest rows
                try:
                    sat_rows = supabase.table("saturday_class").select("*").order("created_at", desc=True).limit(5).execute()
                    sat_mappings = sat_rows.data or []
                except Exception:
                    sat_mappings = []

            # Optionally filter by section if provided
            if section:
                sat_mappings = [r for r in sat_mappings if (r.get("section") or "").lower() == section.lower()]

            if not sat_mappings:
                return {"classes": []}

            aggregated: list[dict] = []
            for mapping in sat_mappings:
                followed_day = str(mapping.get("tt_followed", "")).lower()
                if not followed_day:
                    continue
                # First try with section filter (if provided)
                base_q = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", followed_day).order("start_time")
                day_classes = None
                if mapping.get("section"):
                    q = base_q.eq("section", mapping["section"])  # class table has section column
                    day_classes = q.execute()
                    # Fallback: if none found for that section, try without section filter
                    if not day_classes.data:
                        day_classes = base_q.execute()
                else:
                    day_classes = base_q.execute()
                for class_item in (day_classes.data or []):
                    # Annotate for UI clarity
                    class_item["info"] = f"Saturday • Section {mapping.get('section', '').upper()} • Follows {followed_day.capitalize()}"
                    aggregated.append(class_item)
            classes = aggregated
        else:
            # Mon-Fri: query regular class table
            result = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", current_day).order("start_time").execute()
            classes = result.data or []

        # Process class timings and status
        processed: list[dict] = []
        for class_item in classes:
            start_time_str = class_item["start_time"]
            end_time_str = class_item["end_time"]
            if 'T' in start_time_str:
                start_time = datetime.fromisoformat(start_time_str.replace('Z', '')).time()
            else:
                try:
                    start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
                except ValueError:
                    start_time = datetime.strptime(start_time_str, "%H:%M").time()
            if 'T' in end_time_str:
                end_time = datetime.fromisoformat(end_time_str.replace('Z', '')).time()
            else:
                try:
                    end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()
                except ValueError:
                    end_time = datetime.strptime(end_time_str, "%H:%M").time()

            if start_time <= current_time <= end_time:
                class_item["status"] = "ongoing"
            elif current_time < start_time:
                class_item["status"] = "upcoming"
            else:
                class_item["status"] = "completed"

            processed.append(class_item)

        return {"classes": processed}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Saturday override mapping CRUD (to maintain which weekday timetable is followed on a Saturday)
@app.post("/api/saturday-class")
def create_saturday_class(data: dict):
    try:
        required = ["date", "section", "tt_followed"]
        missing = [f for f in required if f not in data or data.get(f) in (None, "")]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(missing)}")
        to_insert = {
            "date": data["date"],
            "section": data["section"],
            "tt_followed": str(data["tt_followed"]).lower()
        }
        res = supabase.table("saturday_class").insert(to_insert).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create saturday mapping")
        return {"message": "Saturday mapping created", "saturday_class": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/saturday-class/{row_id}")
def update_saturday_class(row_id: str, data: dict):
    try:
        allowed = {"date", "section", "tt_followed"}
        update_data = {k: (v.lower() if k == "tt_followed" and isinstance(v, str) else v) for k, v in data.items() if k in allowed}
        if not update_data:
            raise HTTPException(status_code=400, detail="No updatable fields provided")
        res = supabase.table("saturday_class").update(update_data).eq("id", row_id).execute()
        return {"message": "Saturday mapping updated", "saturday_class": res.data[0] if res.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/saturday-class/{row_id}")
def delete_saturday_class(row_id: str):
    try:
        supabase.table("saturday_class").delete().eq("id", row_id).execute()
        return {"message": "Saturday mapping deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/week")
def get_weekly_timetable():
    try:
        result = supabase.table("timetable").select("*, courses(name, code)").execute()
        return {"weekly_classes": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/month")
def get_monthly_classes():
    try:
        result = supabase.table("timetable").select("*, courses(name, code)").execute()
        return {"monthly_classes": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/{class_id}")
def get_class_by_id(class_id: str):
    try:
        result = supabase.table("timetable").select("*, courses(*)").eq("id", class_id).execute()
        return {"class": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
@app.get("/api/classes/daily")
def get_daily_classes(section: str | None = None):
    """Get classes for the current day with special handling for Saturdays"""
    try:
        from datetime import datetime
        now = datetime.now()
        current_day = now.strftime('%A').lower()
        display_day = current_day.capitalize()
        current_time = now.time()

        # If today is Saturday, fetch from saturday_class table
        if current_day == "saturday":
            # Read saturday mapping rows for this date (optionally per section)
            mappings = []
            try:
                sat_rows = supabase.table("saturday_class").select("*").eq("date", now.date().isoformat()).execute()
                mappings = sat_rows.data or []
            except Exception:
                # Fallback to latest rows if 'date' missing
                try:
                    sat_rows = supabase.table("saturday_class").select("*").order("created_at", desc=True).limit(5).execute()
                    mappings = sat_rows.data or []
                except Exception:
                    mappings = []
            if section:
                mappings = [r for r in mappings if (r.get("section") or "").lower() == section.lower()]
            if not mappings:
                return {"classes": [], "display_day": display_day}

            # If there's a single mapping, set a clear display_day
            if len(mappings) == 1:
                display_day = f"Saturday (Follows {str(mappings[0].get('tt_followed','')).capitalize()})"
            else:
                display_day = "Saturday (Multiple sections)"

            # Collect classes based on followed day(s)
            collected: list[dict] = []
            for m in mappings:
                followed_day = str(m.get("tt_followed", "")).lower()
                if not followed_day:
                    continue
                # Build base query and attempt with section, then fallback without
                base_q = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", followed_day).order("start_time")
                day_classes = None
                if m.get("section"):
                    q = base_q.eq("section", m["section"])
                    day_classes = q.execute()
                    if not day_classes.data:
                        day_classes = base_q.execute()
                else:
                    day_classes = base_q.execute()
                for c in (day_classes.data or []):
                    c["info"] = f"Saturday • Section {m.get('section','').upper()} • Follows {followed_day.capitalize()}"
                    collected.append(c)
            result = type('obj', (object,), {'data': collected})()
        else:
            # Mon-Fri: fetch from class table
            result = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", current_day).order("start_time").execute()

        # Add status to each class
        for class_item in result.data or []:
            start_time_str = class_item["start_time"]
            end_time_str = class_item["end_time"]
            try:
                start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
            except ValueError:
                start_time = datetime.strptime(start_time_str, "%H:%M").time()
            try:
                end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()
            except ValueError:
                end_time = datetime.strptime(end_time_str, "%H:%M").time()

            if start_time <= current_time <= end_time:
                class_item["status"] = "ongoing"
            elif current_time < start_time:
                class_item["status"] = "upcoming"
            else:
                class_item["status"] = "completed"

        return {"classes": result.data or [], "display_day": display_day}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/by-date")
def get_classes_by_date(date: str, section: str | None = None):
    """Get classes for a specific date (YYYY-MM-DD), with Saturday mapping support.

    - If the date is a Saturday, look up saturday_class rows for that date and pull classes from 'class' using tt_followed.
    - Otherwise, pull classes from 'class' by the date's weekday.
    - Optional section filter narrows saturday mapping and class results.
    """
    try:
        from datetime import datetime
        # Parse date
        try:
            target_date = datetime.strptime(date, "%Y-%m-%d")
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date format. Use YYYY-MM-DD")

        weekday_name = target_date.strftime('%A').lower()
        current_time = datetime.now().time()

        classes: list[dict] = []

        if weekday_name == "saturday":
            mappings = []
            try:
                sat_rows = supabase.table("saturday_class").select("*").eq("date", date).execute()
                mappings = sat_rows.data or []
            except Exception:
                # Fallback to latest rows if 'date' column missing
                try:
                    sat_rows = supabase.table("saturday_class").select("*").order("created_at", desc=True).limit(5).execute()
                    mappings = sat_rows.data or []
                except Exception:
                    mappings = []
            if section:
                mappings = [r for r in mappings if (r.get("section") or "").lower() == section.lower()]
            if not mappings:
                return {"classes": []}

            collected: list[dict] = []
            for m in mappings:
                followed_day = str(m.get("tt_followed", "")).lower()
                if not followed_day:
                    continue
                base_q = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", followed_day).order("start_time")
                day_classes = None
                if m.get("section"):
                    q = base_q.eq("section", m["section"]) 
                    day_classes = q.execute()
                    if not day_classes.data:
                        day_classes = base_q.execute()
                else:
                    day_classes = base_q.execute()
                for c in (day_classes.data or []):
                    c["info"] = f"{date} • Section {m.get('section','').upper()} • Follows {followed_day.capitalize()}"
                    collected.append(c)
            classes = collected
        else:
            q = supabase.table("timetable").select("*, courses(name, code)").eq("day_of_week", weekday_name).order("start_time")
            if section:
                q = q.eq("section", section)
            res = q.execute()
            classes = res.data or []

        # Assign status based on current time of the request day (best-effort)
        processed: list[dict] = []
        for class_item in classes:
            start_time_str = class_item.get("start_time")
            end_time_str = class_item.get("end_time")
            if not start_time_str or not end_time_str:
                processed.append(class_item)
                continue
            try:
                start_time = datetime.strptime(start_time_str, "%H:%M:%S").time()
            except ValueError:
                start_time = datetime.strptime(start_time_str, "%H:%M").time()
            try:
                end_time = datetime.strptime(end_time_str, "%H:%M:%S").time()
            except ValueError:
                end_time = datetime.strptime(end_time_str, "%H:%M").time()

            if start_time <= current_time <= end_time:
                class_item["status"] = "ongoing"
            elif current_time < start_time:
                class_item["status"] = "upcoming"
            else:
                class_item["status"] = "completed"
            processed.append(class_item)

        return {"classes": processed}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/classes/date/{date}")
def get_classes_by_date_path(date: str, section: str | None = None):
    """Path-param variant to avoid conflicts with class_id routes.

    Example: /api/classes/date/2025-10-04?section=A
    """
    return get_classes_by_date(date=date, section=section)

# ============================================================================
# COURSES & ENROLLMENTS
# ============================================================================

@app.get("/api/courses")
def get_all_courses():
    try:
        # Select raw courses; joining departments may fail because FK is via code to 'department' table
        result = supabase.table("courses").select("*").execute()
        return {"courses": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/course-names")
def get_course_names():
    """Return a minimal list of courses for selection widgets: id and name only.

    Source: public.courses name column.
    """
    try:
        # Pull only id and name, order by name for better UX
        result = supabase.table("courses").select("id, name").order("name").execute()
        rows = result.data or []
        courses = []
        for r in rows:
            cid = r.get("id")
            name = r.get("name")
            if cid and name:
                courses.append({"id": cid, "name": name})
        return {"courses": courses}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/courses/{course_id}")
def get_course_by_id(course_id: str):
    try:
        result = supabase.table("courses").select("*").eq("id", course_id).execute()
        return {"course": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/courses/{course_id}/overview")
def get_course_overview(course_id: str):
    try:
        course = supabase.table("courses").select("*").eq("id", course_id).execute()
        assignments = supabase.table("assignments").select("*").eq("course_id", course_id).execute()
        classes = supabase.table("timetable").select("*").eq("course_id", course_id).execute()
        
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
        # Fetch raw resources
        result = supabase.table("resources").select("*").execute()
        rows = result.data or []

        # Enrich with uploader names and course info
        try:
            user_ids = list({r.get("uploaded_by") for r in rows if r.get("uploaded_by")})
            course_ids = list({r.get("course_id") for r in rows if r.get("course_id")})

            user_map = {}
            course_map = {}
            if user_ids:
                ures = supabase.table("users").select("id, first_name, last_name").in_("id", user_ids).execute()
                for u in (ures.data or []):
                    user_map[u["id"]] = {"first_name": u.get("first_name"), "last_name": u.get("last_name")}
            if course_ids:
                cres = supabase.table("courses").select("id, name, code").in_("id", course_ids).execute()
                for c in (cres.data or []):
                    course_map[c["id"]] = {"name": c.get("name"), "code": c.get("code")}

            for r in rows:
                uid = r.get("uploaded_by")
                cid = r.get("course_id")
                if uid and uid in user_map:
                    r["uploader"] = user_map[uid]
                if cid and cid in course_map:
                    r["courses"] = course_map[cid]
        except Exception:
            # Best-effort enrichment only
            pass

        return {"resources": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/search")
def search_resources(q: str = ""):
    try:
        # Base query
        if q:
            result = supabase.table("resources").select("*").ilike("title", f"%{q}%").execute()
        else:
            result = supabase.table("resources").select("*").limit(10).execute()
        rows = result.data or []

        # Enrich
        try:
            user_ids = list({r.get("uploaded_by") for r in rows if r.get("uploaded_by")})
            course_ids = list({r.get("course_id") for r in rows if r.get("course_id")})
            user_map = {}
            course_map = {}
            if user_ids:
                ures = supabase.table("users").select("id, first_name, last_name").in_("id", user_ids).execute()
                for u in (ures.data or []):
                    user_map[u["id"]] = {"first_name": u.get("first_name"), "last_name": u.get("last_name")}
            if course_ids:
                cres = supabase.table("courses").select("id, name, code").in_("id", course_ids).execute()
                for c in (cres.data or []):
                    course_map[c["id"]] = {"name": c.get("name"), "code": c.get("code")}
            for r in rows:
                uid = r.get("uploaded_by")
                cid = r.get("course_id")
                if uid and uid in user_map:
                    r["uploader"] = user_map[uid]
                if cid and cid in course_map:
                    r["courses"] = course_map[cid]
        except Exception:
            pass

        return {"resources": rows}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/{resource_id}")
def get_resource_by_id(resource_id: str):
    try:
        result = supabase.table("resources").select("*").eq("id", resource_id).execute()
        row = result.data[0] if result.data else None
        if not row:
            return {"resource": None}
        try:
            # Enrich single row
            uid = row.get("uploaded_by")
            cid = row.get("course_id")
            if uid:
                u = supabase.table("users").select("first_name, last_name").eq("id", uid).limit(1).execute()
                if u.data:
                    row["uploader"] = {"first_name": u.data[0].get("first_name"), "last_name": u.data[0].get("last_name")}
            if cid:
                c = supabase.table("courses").select("name, code").eq("id", cid).limit(1).execute()
                if c.data:
                    row["courses"] = {"name": c.data[0].get("name"), "code": c.data[0].get("code")}
        except Exception:
            pass
        return {"resource": row}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/resources/{resource_id}/stats")
def get_resource_stats(resource_id: str):
    try:
        try:
            downloads = supabase.table("resource_downloads").select("*").eq("resource_id", resource_id).execute()
            count = len(downloads.data) if downloads.data else 0
        except Exception:
            count = 0
        return {"download_count": count}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# FILES & DOCUMENTS
# ============================================================================

@app.get("/api/files")
def get_all_files():
    try:
        try:
            result = supabase.table("files").select("*, courses(name)").execute()
            return {"files": result.data}
        except Exception:
            return {"files": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/search")
def search_files(q: str = ""):
    try:
        try:
            if q:
                result = supabase.table("files").select("*").ilike("name", f"%{q}%").execute()
            else:
                result = supabase.table("files").select("*").limit(10).execute()
            return {"files": result.data}
        except Exception:
            return {"files": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/files/{file_id}")
def get_file_by_id(file_id: str):
    try:
        try:
            result = supabase.table("files").select("*").eq("id", file_id).execute()
            return {"file": result.data[0] if result.data else None}
        except Exception:
            return {"file": None}
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
        try:
            result = supabase.table("project_members").select("*, users(*)").eq("project_id", project_id).execute()
            return {"members": result.data}
        except Exception:
            # Fallback to embedded members in projects row
            project = supabase.table("projects").select("member_ids, member_names, creator_id").eq("id", project_id).limit(1).execute()
            if not project.data:
                return {"members": []}
            info = project.data[0]
            mids = info.get("member_ids", [])
            mnames = info.get("member_names", [])
            cid = info.get("creator_id")
            members = []
            for i, mid in enumerate(mids):
                members.append({
                    "project_id": project_id,
                    "user_id": mid,
                    "role": "owner" if mid == cid else "member",
                    "users": {"id": mid, "full_name": (mnames[i] if i < len(mnames) else None)}
                })
            return {"members": members}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# NOTIFICATIONS
# ============================================================================

@app.get("/api/notifications")
def get_all_notifications():
    try:
        try:
            result = supabase.table("notifications").select("*").execute()
            return {"notifications": result.data}
        except Exception:
            return {"notifications": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/notifications/unread")
def get_unread_notifications():
    try:
        try:
            result = supabase.table("notifications").select("*").eq("is_read", False).execute()
            return {"notifications": result.data}
        except Exception:
            return {"notifications": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# ASSIGNMENTS (list/upcoming/overdue/by-id)
# ============================================================================

@app.get("/api/assignments")
def get_all_assignments():
    try:
        result = supabase.table("assignments").select("*, courses(name, code)").order("due_date").execute()
        return {"assignments": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/upcoming")
def get_upcoming_assignments():
    try:
        from datetime import datetime
        today_iso = datetime.now().date().isoformat()
        result = (
            supabase
            .table("assignments")
            .select("*, courses(name, code)")
            .gte("due_date", today_iso)
            .order("due_date")
            .execute()
        )
        return {"assignments": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/overdue")
def get_overdue_assignments():
    try:
        from datetime import datetime
        today_iso = datetime.now().date().isoformat()
        result = (
            supabase
            .table("assignments")
            .select("*, courses(name, code)")
            .lt("due_date", today_iso)
            .order("due_date")
            .execute()
        )
        return {"assignments": result.data or []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/assignments/{assignment_id}")
def get_assignment_by_id_v2(assignment_id: str):
    try:
        result = supabase.table("assignments").select("*, courses(*)").eq("id", assignment_id).execute()
        return {"assignment": result.data[0] if result.data else None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/assignments")
def create_assignment(data: dict):
    """Create a new assignment. Requires course_id or class_id to derive course."""
    try:
        required = ["title", "due_date"]
        missing = [f for f in required if f not in data or data.get(f) in (None, "")]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing fields: {', '.join(missing)}")

        insert_data = {
            "title": data["title"],
            "description": data.get("description"),
            "due_date": data["due_date"],
            "total_points": data.get("total_points", 100),
            "assignment_type": data.get("assignment_type", "homework"),
            "priority": data.get("priority", "medium"),
            "is_published": data.get("is_published", True),
            "created_by": data.get("created_by")
        }

        # Resolve course_id
        course_id = data.get("course_id")
        if not course_id and data.get("class_id"):
            cls = supabase.table("timetable").select("course_id").eq("id", data["class_id"]).limit(1).execute()
            if not cls.data:
                raise HTTPException(status_code=400, detail="Invalid class_id; cannot derive course_id")
            course_id = cls.data[0].get("course_id")
        if not course_id:
            raise HTTPException(status_code=400, detail="course_id or class_id is required")
        insert_data["course_id"] = course_id

        res = supabase.table("assignments").insert(insert_data).execute()
        if not res.data:
            raise HTTPException(status_code=500, detail="Failed to create assignment")
        return {"message": "Assignment created", "assignment": res.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/assignments/{assignment_id}")
def update_assignment(assignment_id: str, data: dict):
    try:
        allowed = {"title", "description", "due_date", "total_points", "assignment_type", "priority", "is_published", "course_id"}
        update_data = {k: v for k, v in data.items() if k in allowed}
        if not update_data:
            raise HTTPException(status_code=400, detail="No updatable fields provided")
        res = supabase.table("assignments").update(update_data).eq("id", assignment_id).execute()
        return {"message": "Assignment updated", "assignment": res.data[0] if res.data else None}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/assignments/{assignment_id}")
def delete_assignment(assignment_id: str):
    try:
        supabase.table("assignments").delete().eq("id", assignment_id).execute()
        return {"message": "Assignment deleted"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# IDEAS & NOTES
# ============================================================================

@app.get("/api/ideas")
def get_all_ideas():
    try:
        try:
            result = supabase.table("ideas").select("*, courses(name), projects(title)").execute()
            return {"ideas": result.data}
        except Exception:
            return {"ideas": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ideas/search")
def search_ideas(q: str = ""):
    try:
        try:
            if q:
                result = supabase.table("ideas").select("*").ilike("title", f"%{q}%").execute()
            else:
                result = supabase.table("ideas").select("*").limit(10).execute()
            return {"ideas": result.data}
        except Exception:
            return {"ideas": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/ideas/{idea_id}")
def get_idea_by_id(idea_id: str):
    try:
        try:
            result = supabase.table("ideas").select("*").eq("id", idea_id).execute()
            return {"idea": result.data[0] if result.data else None}
        except Exception:
            return {"idea": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# AI CHAT & CONVERSATIONS
# ============================================================================

@app.get("/api/chat/conversations")
def get_all_conversations():
    try:
        try:
            result = supabase.table("ai_conversations").select("*").execute()
            return {"conversations": result.data}
        except Exception:
            return {"conversations": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/conversations/{conversation_id}")
def get_conversation_by_id(conversation_id: str):
    try:
        try:
            result = supabase.table("ai_conversations").select("*").eq("id", conversation_id).execute()
            return {"conversation": result.data[0] if result.data else None}
        except Exception:
            return {"conversation": None}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/chat/conversations/{conversation_id}/messages")
def get_conversation_messages(conversation_id: str):
    try:
        try:
            result = supabase.table("ai_messages").select("*").eq("conversation_id", conversation_id).order("message_order").execute()
            return {"messages": result.data}
        except Exception:
            return {"messages": []}
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
        try:
            result = supabase.table("quick_access_items").select("*").execute()
            return {"items": result.data}
        except Exception:
            return {"items": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# DEPARTMENTS
# ============================================================================

@app.get("/api/departments")
def get_all_departments():
    try:
        # Try primary table name
        try:
            result = supabase.table("departments").select("*").execute()
            rows = result.data or []
        except Exception:
            rows = []

        # Fallback to singular table name if needed
        if not rows:
            try:
                result2 = supabase.table("department").select("*").execute()
                rows = result2.data or []
            except Exception:
                rows = []

        # Normalize to consistent shape exposing 'code' and 'name'
        normalized = []
        for r in rows:
            code = r.get("code") or r.get("department_code") or r.get("dept") or r.get("id") or r.get("name")
            name = r.get("name") or r.get("full_name") or r.get("display_name") or code
            normalized.append({
                "id": r.get("id"),
                "code": code,
                "name": name
            })
        return {"departments": normalized}
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
        # Align with courses schema: 'dept' holds department code; accept id or code by looking up department code first
        dept_code = None
        try:
            d = supabase.table("departments").select("code").eq("id", department_id).limit(1).execute()
            if d.data:
                dept_code = d.data[0].get("code")
        except Exception:
            pass
        if not dept_code:
            # Assume caller provided the code directly
            dept_code = department_id
        result = supabase.table("courses").select("*").eq("dept", dept_code).execute()
        return {"courses": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CLASS LIST (for signup selection)
# ============================================================================

@app.get("/api/class-list")
def get_class_list(dept: str | None = None):
    """Return classes from 'class' table, optionally filtered by department code.

    Response shape: { classes: [ { id, academic_year, section, dept, class, created_at } ] }
    """
    try:
        q = supabase.table("class").select("*")
        res = None
        if dept:
            # Case-insensitive match for dept code
            try:
                res = q.ilike("dept", dept).order("dept").order("class").execute()
            except Exception:
                try:
                    res = q.ilike("dept", dept).order("dept").order("section").execute()
                except Exception:
                    res = None
            # Fallback: try exact match upper-cased
            if (not res) or (not res.data):
                try:
                    q2 = supabase.table("class").select("*")
                    res = q2.eq("dept", (dept or "").upper()).order("dept").order("class").execute()
                except Exception:
                    try:
                        q2 = supabase.table("class").select("*")
                        res = q2.eq("dept", (dept or "").upper()).order("dept").order("section").execute()
                    except Exception:
                        res = None
        # Final fallback: return all classes if filtering yields nothing
        if (not res) or (not res.data):
            try:
                res = supabase.table("class").select("*").order("dept").order("class").execute()
            except Exception:
                res = supabase.table("class").select("*").order("dept").order("section").execute()
        return {"classes": res.data or []}
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
        try:
            submissions = supabase.table("assignment_submissions").select("*").execute()
            total_submissions = len(submissions.data) if submissions.data else 0
        except Exception:
            total_submissions = 0

        return {
            "total_assignments": len(assignments.data) if assignments.data else 0,
            "total_submissions": total_submissions
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# BOOKMARKS
# ============================================================================

@app.get("/api/bookmarks")
def get_all_bookmarks():
    try:
        try:
            result = supabase.table("bookmarks").select("*").execute()
            return {"bookmarks": result.data}
        except Exception:
            return {"bookmarks": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# USER ACTIVITY
# ============================================================================

@app.get("/api/activity")
def get_user_activity():
    try:
        try:
            result = supabase.table("user_activity").select("*").order("created_at", desc=True).limit(50).execute()
            return {"activities": result.data}
        except Exception:
            return {"activities": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# SEARCH HISTORY
# ============================================================================

@app.get("/api/search/history")
def get_search_history():
    try:
        try:
            result = supabase.table("search_history").select("*").order("created_at", desc=True).limit(20).execute()
            return {"search_history": result.data}
        except Exception:
            return {"search_history": []}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CALENDAR / EVENTS
# ============================================================================

@app.get("/api/events")
def get_events(month: int = None, year: int = None, user_id: str = None):
    """Get events for calendar view, optionally filtered by month/year and/or user personal events.

    If user_id is provided, results include both global events (is_personal=false or null)
    and that user's personal events (is_personal=true AND created_by=user_id).
    Without user_id, returns all events (both personal and non-personal) in the time range.
    """
    try:
        from datetime import datetime, date

        base_select = "*, courses(name, code)"
        base_table = "events"
        base = supabase.table(base_table).select(base_select)
        
        # Filter by month and year if provided
        if month and year:
            start_date = date(year, month, 1)
            # Get last day of month
            if month == 12:
                end_date = date(year + 1, 1, 1)
            else:
                end_date = date(year, month + 1, 1)
            
            base = base.gte("start_date", start_date.isoformat()).lt("start_date", end_date.isoformat())

        events = []
        seen = set()

        if not user_id:
            # Without user filter, return all events in range (both personal and non-personal)
            allq = supabase.table(base_table).select(base_select)
            if month and year:
                allq = allq.gte("start_date", start_date.isoformat()).lt("start_date", end_date.isoformat())
            allq = allq.order("start_date", desc=False).execute()
            events = allq.data or []
        else:
            # Non-personal (or unspecified) events
            try:
                q1 = supabase.table(base_table).select(base_select)
                if month and year:
                    q1 = q1.gte("start_date", start_date.isoformat()).lt("start_date", end_date.isoformat())
                q1 = q1.eq("is_personal", False).execute()
                if q1.data:
                    for e in q1.data:
                        if e.get('id') not in seen:
                            events.append(e)
                            seen.add(e.get('id'))
            except Exception:
                # If is_personal column might be missing for older schemas, fall back to base query
                q1 = supabase.table(base_table).select(base_select)
                if month and year:
                    q1 = q1.gte("start_date", start_date.isoformat()).lt("start_date", end_date.isoformat())
                q1 = q1.execute()
                if q1.data:
                    for e in q1.data:
                        if e.get('id') not in seen:
                            events.append(e)
                            seen.add(e.get('id'))

            # Personal events for user
            try:
                q2 = supabase.table(base_table).select(base_select)
                if month and year:
                    q2 = q2.gte("start_date", start_date.isoformat()).lt("start_date", end_date.isoformat())
                q2 = q2.eq("is_personal", True).eq("created_by", user_id).execute()
                if q2.data:
                    for e in q2.data:
                        if e.get('id') not in seen:
                            events.append(e)
                            seen.add(e.get('id'))
            except Exception:
                # If schema lacks is_personal, skip
                pass

        # Sort by start_date
        events.sort(key=lambda x: (x.get('start_date') or '', x.get('start_time') or ''))

        result = type('obj', (object,), {'data': events})()
        return {"events": result.data}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/events/{event_id}")
def get_event(event_id: str):
    """Get a specific event by ID"""
    try:
        result = supabase.table("events").select("*, courses(name, code)").eq("id", event_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"event": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/events")
def create_event(event_data: dict):
    """Create a new event following the events table DDL schema"""
    try:
        from datetime import datetime, timezone
        
        # Required fields validation per DDL
        required = ["title", "start_date"]
        missing = [f for f in required if not event_data.get(f)]
        if missing:
            raise HTTPException(status_code=400, detail=f"Missing required fields: {', '.join(missing)}")

        # Initialize payload with DDL defaults
        payload = {}
        
        # Required fields
        payload["title"] = str(event_data["title"]).strip()[:255]  # varchar(255) limit
        payload["start_date"] = str(event_data["start_date"])
        
        # Fields with DDL defaults
        payload["event_type"] = str(event_data.get("event_type", "event")).strip()[:50]
        payload["priority"] = str(event_data.get("priority", "medium")).strip()[:10]
        payload["status"] = str(event_data.get("status", "scheduled")).strip()[:20]
        payload["color"] = str(event_data.get("color", "#3b82f6")).strip()[:7]
        payload["is_personal"] = bool(event_data.get("is_personal", False))
        payload["is_all_day"] = bool(event_data.get("is_all_day", False))
        payload["is_recurring"] = bool(event_data.get("is_recurring", False))
        
        # Optional text fields with length limits
        if event_data.get("description"):
            payload["description"] = str(event_data["description"])
        if event_data.get("location"):
            payload["location"] = str(event_data["location"]).strip()[:255]
        if event_data.get("recurrence_type"):
            payload["recurrence_type"] = str(event_data["recurrence_type"]).strip()[:20]
            
        # Optional date fields
        if event_data.get("end_date"):
            payload["end_date"] = str(event_data["end_date"])
        if event_data.get("recurrence_end_date"):
            payload["recurrence_end_date"] = str(event_data["recurrence_end_date"])
            
        # Time fields - normalize to HH:MM:SS format
        def normalize_time(time_val):
            if not time_val:
                return None
            time_str = str(time_val).strip()
            if len(time_str) == 5 and ":" in time_str:  # HH:MM format
                return time_str + ":00"
            elif len(time_str) == 8 and time_str.count(":") == 2:  # HH:MM:SS format
                return time_str
            else:
                # Try to parse and reformat
                try:
                    from datetime import datetime
                    parsed = datetime.strptime(time_str, "%H:%M")
                    return parsed.strftime("%H:%M:00")
                except:
                    return None
                    
        if event_data.get("start_time"):
            payload["start_time"] = normalize_time(event_data["start_time"])
        if event_data.get("end_time"):
            payload["end_time"] = normalize_time(event_data["end_time"])

        # Date constraint validation per DDL CHECK constraints
        try:
            from datetime import datetime as dt
            start_date = dt.strptime(payload["start_date"], "%Y-%m-%d").date()
            
            if payload.get("end_date"):
                end_date = dt.strptime(payload["end_date"], "%Y-%m-%d").date()
                if end_date < start_date:
                    raise HTTPException(status_code=400, detail="end_date must be >= start_date")
                    
            if payload.get("recurrence_end_date"):
                rec_end_date = dt.strptime(payload["recurrence_end_date"], "%Y-%m-%d").date()
                if rec_end_date < start_date:
                    raise HTTPException(status_code=400, detail="recurrence_end_date must be >= start_date")
        except ValueError as ve:
            raise HTTPException(status_code=400, detail=f"Invalid date format: {str(ve)}")
        except HTTPException:
            raise

        # Handle created_by - in real app this comes from auth
        if not event_data.get("created_by"):
            user_result = supabase.table("users").select("id").limit(1).execute()
            if user_result.data:
                payload["created_by"] = user_result.data[0]["id"]
        else:
            payload["created_by"] = str(event_data["created_by"])

        # Enforce student personal-only rule
        try:
            creator_id = payload.get("created_by")
            if creator_id:
                role_res = supabase.table("users").select("role").eq("id", creator_id).limit(1).execute()
                if role_res.data:
                    role = str(role_res.data[0].get("role", "")).lower()
                    if role == "student":
                        payload["is_personal"] = True
        except Exception:
            pass

        # Foreign key validation per DDL constraints
        if event_data.get("course_id"):
            try:
                course_check = supabase.table("courses").select("id").eq("id", event_data["course_id"]).limit(1).execute()
                if course_check.data:
                    payload["course_id"] = str(event_data["course_id"])
            except Exception:
                pass
                
        if event_data.get("assignment_id"):
            try:
                assignment_check = supabase.table("assignments").select("id").eq("id", event_data["assignment_id"]).limit(1).execute()
                if assignment_check.data:
                    payload["assignment_id"] = str(event_data["assignment_id"])
            except Exception:
                pass
                
        if event_data.get("class_id"):
            try:
                class_check = supabase.table("class").select("id").eq("id", event_data["class_id"]).limit(1).execute()
                if class_check.data:
                    payload["class_id"] = str(event_data["class_id"])
            except Exception:
                pass

        # Auto-timestamp fields (DDL has DEFAULT CURRENT_TIMESTAMP)
        current_time = datetime.now(timezone.utc).isoformat()
        payload["created_at"] = current_time
        payload["updated_at"] = current_time

        result = supabase.table("events").insert(payload).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Failed to create event")
            
        return {"message": "Event created successfully", "event": result.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating event: {str(e)}")

@app.put("/api/events/{event_id}")
def update_event(event_id: str, event_data: dict):
    """Update an existing event following the events table DDL schema"""
    try:
        from datetime import datetime, timezone
        
        # Remove internal fields that shouldn't be in the update payload
        update_payload = dict(event_data)
        for internal_field in ["user_id", "updated_by"]:
            if internal_field in update_payload:
                update_payload.pop(internal_field)
        
        # Check if event exists first
        existing_event = supabase.table("events").select("*").eq("id", event_id).limit(1).execute()
        if not existing_event.data:
            raise HTTPException(status_code=404, detail="Event not found")
        
        current_event = existing_event.data[0]
        
        # Enforce student restrictions if acting user is provided
        acting_user_id = event_data.get("user_id") or event_data.get("updated_by")
        if acting_user_id:
            try:
                role_res = supabase.table("users").select("role").eq("id", acting_user_id).limit(1).execute()
                if role_res.data:
                    role = str(role_res.data[0].get("role", "")).lower()
                    if role == "student":
                        # Students may only update their own personal events
                        if not current_event.get("is_personal") or str(current_event.get("created_by")) != str(acting_user_id):
                            raise HTTPException(status_code=403, detail="Students can only update their own personal events")
                        # Force personal flag to remain true
                        update_payload["is_personal"] = True
                        # Prevent changing created_by
                        if "created_by" in update_payload:
                            update_payload.pop("created_by")
            except HTTPException:
                raise
            except Exception:
                pass

        # Build validated payload with DDL constraints
        payload = {}
        
        # String fields with length limits
        if "title" in update_payload:
            payload["title"] = str(update_payload["title"]).strip()[:255]
        if "event_type" in update_payload:
            payload["event_type"] = str(update_payload["event_type"]).strip()[:50]
        if "priority" in update_payload:
            payload["priority"] = str(update_payload["priority"]).strip()[:10]
        if "status" in update_payload:
            payload["status"] = str(update_payload["status"]).strip()[:20]
        if "color" in update_payload:
            payload["color"] = str(update_payload["color"]).strip()[:7]
        if "location" in update_payload:
            payload["location"] = str(update_payload["location"]).strip()[:255] if update_payload["location"] else None
        if "recurrence_type" in update_payload:
            payload["recurrence_type"] = str(update_payload["recurrence_type"]).strip()[:20] if update_payload["recurrence_type"] else None
            
        # Text fields
        if "description" in update_payload:
            payload["description"] = str(update_payload["description"]) if update_payload["description"] else None
            
        # Boolean fields
        if "is_personal" in update_payload:
            payload["is_personal"] = bool(update_payload["is_personal"])
        if "is_all_day" in update_payload:
            payload["is_all_day"] = bool(update_payload["is_all_day"])
        if "is_recurring" in update_payload:
            payload["is_recurring"] = bool(update_payload["is_recurring"])
            
        # Date fields
        if "start_date" in update_payload:
            payload["start_date"] = str(update_payload["start_date"])
        if "end_date" in update_payload:
            payload["end_date"] = str(update_payload["end_date"]) if update_payload["end_date"] else None
        if "recurrence_end_date" in update_payload:
            payload["recurrence_end_date"] = str(update_payload["recurrence_end_date"]) if update_payload["recurrence_end_date"] else None
            
        # Time fields - normalize to HH:MM:SS
        def normalize_time(time_val):
            if not time_val:
                return None
            time_str = str(time_val).strip()
            if len(time_str) == 5 and ":" in time_str:  # HH:MM
                return time_str + ":00"
            elif len(time_str) == 8 and time_str.count(":") == 2:  # HH:MM:SS
                return time_str
            else:
                try:
                    from datetime import datetime
                    parsed = datetime.strptime(time_str, "%H:%M")
                    return parsed.strftime("%H:%M:00")
                except:
                    return None
                    
        if "start_time" in update_payload:
            payload["start_time"] = normalize_time(update_payload["start_time"])
        if "end_time" in update_payload:
            payload["end_time"] = normalize_time(update_payload["end_time"])

        # UUID fields
        if "created_by" in update_payload:
            payload["created_by"] = str(update_payload["created_by"]) if update_payload["created_by"] else None

        # Date constraint validation per DDL CHECK constraints
        # Get effective dates (new values or existing ones)
        effective_start_date = payload.get("start_date", current_event.get("start_date"))
        effective_end_date = payload.get("end_date", current_event.get("end_date"))
        effective_rec_end_date = payload.get("recurrence_end_date", current_event.get("recurrence_end_date"))
        
        if effective_start_date:
            try:
                from datetime import datetime as dt
                start_date = dt.strptime(str(effective_start_date), "%Y-%m-%d").date()
                
                if effective_end_date:
                    end_date = dt.strptime(str(effective_end_date), "%Y-%m-%d").date()
                    if end_date < start_date:
                        raise HTTPException(status_code=400, detail="end_date must be >= start_date")
                        
                if effective_rec_end_date:
                    rec_end_date = dt.strptime(str(effective_rec_end_date), "%Y-%m-%d").date()
                    if rec_end_date < start_date:
                        raise HTTPException(status_code=400, detail="recurrence_end_date must be >= start_date")
            except ValueError as ve:
                raise HTTPException(status_code=400, detail=f"Invalid date format: {str(ve)}")
            except HTTPException:
                raise

        # Foreign key validation per DDL constraints  
        if "course_id" in update_payload:
            if update_payload["course_id"]:
                try:
                    course_check = supabase.table("courses").select("id").eq("id", update_payload["course_id"]).limit(1).execute()
                    if course_check.data:
                        payload["course_id"] = str(update_payload["course_id"])
                    else:
                        payload["course_id"] = None
                except Exception:
                    payload["course_id"] = None
            else:
                payload["course_id"] = None
                
        if "assignment_id" in update_payload:
            if update_payload["assignment_id"]:
                try:
                    assignment_check = supabase.table("assignments").select("id").eq("id", update_payload["assignment_id"]).limit(1).execute()
                    if assignment_check.data:
                        payload["assignment_id"] = str(update_payload["assignment_id"])
                    else:
                        payload["assignment_id"] = None
                except Exception:
                    payload["assignment_id"] = None
            else:
                payload["assignment_id"] = None
                
        if "class_id" in update_payload:
            if update_payload["class_id"]:
                try:
                    class_check = supabase.table("class").select("id").eq("id", update_payload["class_id"]).limit(1).execute()
                    if class_check.data:
                        payload["class_id"] = str(update_payload["class_id"])
                    else:
                        payload["class_id"] = None
                except Exception:
                    payload["class_id"] = None
            else:
                payload["class_id"] = None

        # Auto-update timestamp per DDL trigger
        payload["updated_at"] = datetime.now(timezone.utc).isoformat()

        # Only proceed if there are fields to update
        if not payload:
            return {"message": "No changes to update", "event": current_event}

        result = supabase.table("events").update(payload).eq("id", event_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Event not found after update")
            
        return {"message": "Event updated successfully", "event": result.data[0]}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating event: {str(e)}")

@app.delete("/api/events/{event_id}")
def delete_event(event_id: str):
    """Delete an event"""
    try:
        result = supabase.table("events").delete().eq("id", event_id).execute()
        if not result.data:
            raise HTTPException(status_code=404, detail="Event not found")
        return {"message": "Event deleted successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/calendar/{year}/{month}")
def get_calendar_month(year: int, month: int, user_id: str | None = None):
    """Get all events for a specific month in calendar format.

    If user_id provided, include both global events and that user's personal events (is_personal=true, created_by=user_id).
    """
    try:
        from datetime import date, timedelta
        import calendar as cal
        
        # Validate month and year
        if month < 1 or month > 12:
            raise HTTPException(status_code=400, detail="Month must be between 1 and 12")
        if year < 1900 or year > 2100:
            raise HTTPException(status_code=400, detail="Year must be between 1900 and 2100")
        
        # Get first and last day of the month
        first_day = date(year, month, 1)
        last_day = date(year, month, cal.monthrange(year, month)[1])
        
        # Base params
        base_select = "*, courses(name, code)"
        base_table = "events"

        events = []
        seen = set()

        if not user_id:
            # No user filter => include everything in range
            fb = supabase.table(base_table).select(base_select).gte("start_date", first_day.isoformat()).lte("start_date", last_day.isoformat()).order("start_date").execute()
            events = fb.data or []
        else:
            # Non-personal first
            try:
                q1 = supabase.table(base_table).select(base_select).gte("start_date", first_day.isoformat()).lte("start_date", last_day.isoformat()).eq("is_personal", False).order("start_date").execute()
                if q1.data:
                    for e in q1.data:
                        if e.get('id') not in seen:
                            events.append(e)
                            seen.add(e.get('id'))
            except Exception:
                # If schema lacks is_personal, just get all
                q1 = supabase.table(base_table).select(base_select).gte("start_date", first_day.isoformat()).lte("start_date", last_day.isoformat()).order("start_date").execute()
                if q1.data:
                    for e in q1.data:
                        if e.get('id') not in seen:
                            events.append(e)
                            seen.add(e.get('id'))

            # Add personal events for the user
            try:
                q2 = supabase.table(base_table).select(base_select).gte("start_date", first_day.isoformat()).lte("start_date", last_day.isoformat()).eq("is_personal", True).eq("created_by", user_id).order("start_date").execute()
                if q2.data:
                    for e in q2.data:
                        if e.get('id') not in seen:
                            events.append(e)
                            seen.add(e.get('id'))
            except Exception:
                pass

        # Group events by date
        events_by_date = {}
        for event in events:
            event_date = event["start_date"]
            if event_date not in events_by_date:
                events_by_date[event_date] = []
            events_by_date[event_date].append(event)
        
        return {
            "year": year,
            "month": month,
            "month_name": cal.month_name[month],
            "events_by_date": events_by_date,
            "total_events": len(events)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# CHAT SYSTEM ENDPOINTS
# ============================================================================

@app.get("/api/search/users")
def search_users(q: str = "", limit: int = 20, current_user_id: str = ""):
    """Search for users by name, email, or student ID"""
    try:
        if not q or len(q.strip()) < 2:
            return {"users": [], "total": 0}
        
        search_term = f"%{q.strip().lower()}%"
        
        # Search users excluding current user
        base_query = supabase.table("users").select("id, first_name, last_name, email, roll_no, dept").limit(limit)
        
        if current_user_id:
            base_query = base_query.neq("id", current_user_id)
            
        # Search in first_name, last_name, email, and student_id using individual queries and combine results
        all_users = []
        seen_ids = set()
        
        # Search in first_name
        try:
            first_name_results = base_query.ilike("first_name", search_term).execute()
            if first_name_results.data:
                for user in first_name_results.data:
                    if user['id'] not in seen_ids:
                        # Combine first_name and last_name into name field
                        user['name'] = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                        # Backward compatibility
                        if 'roll_no' in user and 'student_id' not in user:
                            user['student_id'] = user['roll_no']
                        all_users.append(user)
                        seen_ids.add(user['id'])
        except Exception:
            pass
            
        # Search in last_name
        try:
            last_name_results = base_query.ilike("last_name", search_term).execute()
            if last_name_results.data:
                for user in last_name_results.data:
                    if user['id'] not in seen_ids:
                        user['name'] = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                        if 'roll_no' in user and 'student_id' not in user:
                            user['student_id'] = user['roll_no']
                        all_users.append(user)
                        seen_ids.add(user['id'])
        except Exception:
            pass
            
        # Search in email
        try:
            email_results = base_query.ilike("email", search_term).execute()
            if email_results.data:
                for user in email_results.data:
                    if user['id'] not in seen_ids:
                        user['name'] = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                        if 'roll_no' in user and 'student_id' not in user:
                            user['student_id'] = user['roll_no']
                        all_users.append(user)
                        seen_ids.add(user['id'])
        except Exception:
            pass
            
        # Search in student_id
        try:
            student_id_results = base_query.ilike("roll_no", search_term).execute()
            if student_id_results.data:
                for user in student_id_results.data:
                    if user['id'] not in seen_ids:
                        user['name'] = f"{user.get('first_name', '')} {user.get('last_name', '')}".strip()
                        if 'roll_no' in user and 'student_id' not in user:
                            user['student_id'] = user['roll_no']
                        all_users.append(user)
                        seen_ids.add(user['id'])
        except Exception:
            pass
            
        result = type('obj', (object,), {'data': all_users[:limit]})()
        
        return {
            "users": result.data or [],
            "total": len(result.data) if result.data else 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/friend-requests")
def send_friend_request(data: dict):
    """Send a friend request to another user"""
    try:
        sender_id = data.get("sender_id")
        receiver_id = data.get("receiver_id") 
        message = data.get("message", "")
        
        if not sender_id or not receiver_id:
            raise HTTPException(status_code=400, detail="sender_id and receiver_id are required")
            
        if sender_id == receiver_id:
            raise HTTPException(status_code=400, detail="Cannot send friend request to yourself")
            
        # Check if friendship already exists - using separate queries
        friendship_check1 = supabase.table("friendships").select("*").eq("user1_id", sender_id).eq("user2_id", receiver_id).execute()
        friendship_check2 = supabase.table("friendships").select("*").eq("user1_id", receiver_id).eq("user2_id", sender_id).execute()
        
        if (friendship_check1.data and len(friendship_check1.data) > 0) or (friendship_check2.data and len(friendship_check2.data) > 0):
            raise HTTPException(status_code=409, detail="Friendship already exists")
            
        # Check if request already exists - using separate queries
        existing_request1 = supabase.table("friend_requests").select("*").eq("sender_id", sender_id).eq("receiver_id", receiver_id).execute()
        existing_request2 = supabase.table("friend_requests").select("*").eq("sender_id", receiver_id).eq("receiver_id", sender_id).execute()
        
        if (existing_request1.data and len(existing_request1.data) > 0) or (existing_request2.data and len(existing_request2.data) > 0):
            raise HTTPException(status_code=409, detail="Friend request already exists")
            
        # Create friend request
        result = supabase.table("friend_requests").insert({
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "message": message,
            "status": "pending"
        }).execute()
        
        return {"message": "Friend request sent successfully", "data": result.data[0]}
    except Exception as e:
        if "409" in str(e):
            raise e
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/friend-requests/{user_id}")
def get_friend_requests(user_id: str, type: str = "received"):
    """Get friend requests for a user (received or sent)"""
    try:
        if type == "received":
            result = supabase.table("friend_requests").select("*").eq("receiver_id", user_id).eq("status", "pending").execute()
            requests = result.data or []
            # Enrich with sender details for display purposes
            enriched = []
            for req in requests:
                try:
                    sender_res = supabase.table("users").select("id, first_name, last_name, email").eq("id", req.get("sender_id")).execute()
                    if sender_res.data:
                        req["sender"] = sender_res.data[0]
                except Exception:
                    pass
                enriched.append(req)
            return {"requests": enriched, "total": len(enriched)}
        else:
            result = supabase.table("friend_requests").select("*").eq("sender_id", user_id).execute()
            requests = result.data or []
            # Enrich with receiver details for display in "sent" tab
            enriched = []
            for req in requests:
                try:
                    recv_res = supabase.table("users").select("id, first_name, last_name, email").eq("id", req.get("receiver_id")).execute()
                    if recv_res.data:
                        req["receiver"] = recv_res.data[0]
                except Exception:
                    pass
                enriched.append(req)
            return {"requests": enriched, "total": len(enriched)}
    except Exception as e:
        return {"requests": [], "total": 0}

@app.get("/api/friend-requests/sent/{user_id}")
def get_sent_friend_requests(user_id: str):
    """Get sent friend requests for a user"""
    try:
        result = supabase.table("friend_requests").select("*").eq("sender_id", user_id).execute()
        requests = result.data or []
        # Enrich with receiver details
        enriched = []
        for req in requests:
            try:
                recv_res = supabase.table("users").select("id, first_name, last_name, email").eq("id", req.get("receiver_id")).execute()
                if recv_res.data:
                    req["receiver"] = recv_res.data[0]
            except Exception:
                pass
            enriched.append(req)
        return {"requests": enriched, "total": len(enriched)}
    except Exception as e:
        return {"requests": [], "total": 0}

@app.put("/api/friend-requests/{request_id}")
def respond_to_friend_request(request_id: str, data: dict):
    """Accept or reject a friend request"""
    try:
        action = data.get("action")  # "accept" or "reject"
        user_id = data.get("user_id")
        
        if action not in ["accept", "reject"]:
            raise HTTPException(status_code=400, detail="Action must be 'accept' or 'reject'")
            
        # Get the friend request
        request_result = supabase.table("friend_requests").select("*").eq("id", request_id).eq("receiver_id", user_id).execute()
        
        if not request_result.data or len(request_result.data) == 0:
            raise HTTPException(status_code=404, detail="Friend request not found")
            
        friend_request = request_result.data[0]
        
        # Update request status
        supabase.table("friend_requests").update({"status": "accepted" if action == "accept" else "rejected"}).eq("id", request_id).execute()
        
        # If accepted, create friendship
        if action == "accept":
            user1_id = min(friend_request["sender_id"], friend_request["receiver_id"])
            user2_id = max(friend_request["sender_id"], friend_request["receiver_id"])
            
            supabase.table("friendships").insert({
                "user1_id": user1_id,
                "user2_id": user2_id
            }).execute()
            
        return {"message": f"Friend request {action}ed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/friends/{user_id}")
def get_user_friends(user_id: str):
    """Get all friends for a user"""
    try:
        # Get friendships where user is either user1 or user2
        friendships1 = supabase.table("friendships").select("*, user2_id").eq("user1_id", user_id).execute()
        friendships2 = supabase.table("friendships").select("*, user1_id").eq("user2_id", user_id).execute()
        
        friends = []
        
        # Process friendships where user is user1
        if friendships1.data:
            for friendship in friendships1.data:
                friend_id = friendship["user2_id"]
                # Get friend details
                user_result = supabase.table("users").select("id, first_name, last_name, email").eq("id", friend_id).execute()
                if user_result.data:
                    user_data = user_result.data[0]
                    friends.append({
                        "friend_id": friend_id,
                        "friend_name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
                        "friend_email": user_data.get('email', ''),
                        "friendship_created_at": friendship.get('created_at', '')
                    })
        
        # Process friendships where user is user2
        if friendships2.data:
            for friendship in friendships2.data:
                friend_id = friendship["user1_id"]
                # Get friend details
                user_result = supabase.table("users").select("id, first_name, last_name, email").eq("id", friend_id).execute()
                if user_result.data:
                    user_data = user_result.data[0]
                    friends.append({
                        "friend_id": friend_id,
                        "friend_name": f"{user_data.get('first_name', '')} {user_data.get('last_name', '')}".strip(),
                        "friend_email": user_data.get('email', ''),
                        "friendship_created_at": friendship.get('created_at', '')
                    })
        
        return {"friends": friends, "total": len(friends)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/messages")
def send_message(data: dict):
    """Send a message to another user"""
    try:
        sender_id = data.get("sender_id")
        receiver_id = data.get("receiver_id")
        content = data.get("content")
        message_type = data.get("message_type", "text")
        file_url = data.get("file_url")
        
        if not all([sender_id, receiver_id, content]):
            raise HTTPException(status_code=400, detail="sender_id, receiver_id, and content are required")
            
        # Check if users are friends - using separate queries
        friendship_check1 = supabase.table("friendships").select("*").eq("user1_id", sender_id).eq("user2_id", receiver_id).execute()
        friendship_check2 = supabase.table("friendships").select("*").eq("user1_id", receiver_id).eq("user2_id", sender_id).execute()
        
        if not ((friendship_check1.data and len(friendship_check1.data) > 0) or (friendship_check2.data and len(friendship_check2.data) > 0)):
            raise HTTPException(status_code=403, detail="Can only message friends")
            
        # Send message
        result = supabase.table("messages").insert({
            "sender_id": sender_id,
            "receiver_id": receiver_id,
            "content": content,
            "message_type": message_type,
            "file_url": file_url
        }).execute()
        
        return {"message": "Message sent successfully", "data": result.data[0]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/conversations/{user_id}")
def get_user_conversations(user_id: str):
    """Get all conversations for a user with last message preview"""
    try:
        # Get all friends first using the friends endpoint logic
        friends_response = get_user_friends(user_id)
        friends = friends_response["friends"]
        
        conversations = []
        
        for friend in friends:
            # Get last message in conversation - using separate queries and combining
            last_message1 = supabase.table("messages").select("*").eq("sender_id", user_id).eq("receiver_id", friend['friend_id']).order("created_at", desc=True).limit(1).execute()
            last_message2 = supabase.table("messages").select("*").eq("sender_id", friend['friend_id']).eq("receiver_id", user_id).order("created_at", desc=True).limit(1).execute()
            
            # Get the most recent message
            last_message_data = None
            if last_message1.data and last_message2.data:
                msg1_time = last_message1.data[0]['created_at']
                msg2_time = last_message2.data[0]['created_at']
                last_message_data = last_message1.data[0] if msg1_time > msg2_time else last_message2.data[0]
            elif last_message1.data:
                last_message_data = last_message1.data[0]
            elif last_message2.data:
                last_message_data = last_message2.data[0]
            
            # Count unread messages
            unread_count = supabase.table("messages").select("id", count="exact").eq("sender_id", friend['friend_id']).eq("receiver_id", user_id).eq("is_read", False).execute()
            
            conversations.append({
                "friend": friend,
                "last_message": last_message_data,
                "unread_count": unread_count.count or 0
            })
        
        # Sort by last message time
        conversations.sort(key=lambda x: x["last_message"]["created_at"] if x["last_message"] else "1970-01-01", reverse=True)
        
        return {"conversations": conversations, "total": len(conversations)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/messages/{user1_id}/{user2_id}")
def get_conversation_messages(user1_id: str, user2_id: str, limit: int = 50):
    """Get messages between two users"""
    try:
        # Check if users are friends - using separate queries
        friendship_check1 = supabase.table("friendships").select("*").eq("user1_id", user1_id).eq("user2_id", user2_id).execute()
        friendship_check2 = supabase.table("friendships").select("*").eq("user1_id", user2_id).eq("user2_id", user1_id).execute()
        
        if not ((friendship_check1.data and len(friendship_check1.data) > 0) or (friendship_check2.data and len(friendship_check2.data) > 0)):
            raise HTTPException(status_code=403, detail="Can only view messages with friends")
            
        # Get conversation messages directly from messages table
        # Get messages where (sender=user1 AND receiver=user2) OR (sender=user2 AND receiver=user1)
        messages_query1 = supabase.table("messages").select("*, sender:users!messages_sender_id_fkey(first_name, last_name, email)").eq("sender_id", user1_id).eq("receiver_id", user2_id).execute()
        messages_query2 = supabase.table("messages").select("*, sender:users!messages_sender_id_fkey(first_name, last_name, email)").eq("sender_id", user2_id).eq("receiver_id", user1_id).execute()
        
        # Combine and sort messages by timestamp
        all_messages = []
        if messages_query1.data:
            all_messages.extend(messages_query1.data)
        if messages_query2.data:
            all_messages.extend(messages_query2.data)
            
        # Sort by created_at timestamp
        all_messages.sort(key=lambda x: x['created_at'])
        
        # Transform to match expected format
        formatted_messages = []
        for msg in all_messages:
            sender_name = "Unknown User"
            if msg.get('sender') and isinstance(msg['sender'], dict):
                sender_data = msg['sender']
                if sender_data.get('first_name') and sender_data.get('last_name'):
                    sender_name = f"{sender_data['first_name']} {sender_data['last_name']}"
                elif sender_data.get('first_name'):
                    sender_name = sender_data['first_name']
                elif sender_data.get('email'):
                    sender_name = sender_data['email'].split('@')[0]
            
            formatted_messages.append({
                "message_id": msg['id'],
                "sender_id": msg['sender_id'],
                "sender_name": sender_name,
                "content": msg['content'],
                "message_type": msg['message_type'] or 'text',
                "is_read": msg['is_read'],
                "created_at": msg['created_at']
            })
        
        # Apply limit
        if limit and len(formatted_messages) > limit:
            formatted_messages = formatted_messages[-limit:]  # Get most recent messages
        
        return {"messages": formatted_messages, "total": len(formatted_messages)}
    except Exception as e:
        print(f"Error getting messages: {e}")  # Debug logging
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/messages/mark-read")
def mark_conversation_messages_read(data: dict):
    """Mark all messages in a conversation as read"""
    try:
        user_id = data.get("user_id")
        friend_id = data.get("friend_id")
        
        if not user_id or not friend_id:
            raise HTTPException(status_code=400, detail="user_id and friend_id are required")
        
        # Mark all messages from friend_id to user_id as read
        result = supabase.table("messages").update({"is_read": True}).eq("sender_id", friend_id).eq("receiver_id", user_id).execute()
        
        return {"message": "Conversation messages marked as read", "updated_count": len(result.data) if result.data else 0}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/api/messages/{message_id}/read")
def mark_message_read(message_id: str, data: dict):
    """Mark a message as read"""
    try:
        user_id = data.get("user_id")
        
        # Update message as read
        result = supabase.table("messages").update({"is_read": True}).eq("id", message_id).eq("receiver_id", user_id).execute()
        
        return {"message": "Message marked as read"}
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