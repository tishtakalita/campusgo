/**
 * API Service Layer
 * Centralized API configuration and request handling
 * Industry-standard error handling and response management
 */

// API Configuration
const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: 'student' | 'faculty' | 'admin';
  // New schema fields
  roll_no?: string;
  dept?: string; // department code
  class?: string | null; // class UUID
  cgpa?: number | null;
  avatar_url?: string;
  phone?: string;
  department_id?: string; // legacy
  year_of_study?: string; // legacy
  bio?: string;
  gpa?: number;
  total_credits?: number;
  student_id?: string;
  is_active?: boolean;
  last_login?: string;
  created_at?: string;
  updated_at?: string;
  // Computed fields for backward compatibility
  name?: string;
  avatar?: string;
  studentClass?: string;
  facultySubjects?: string[];
}

export interface Class {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  room: string;
  start_time: string; // ISO datetime string
  end_time: string;   // ISO datetime string
  day_of_week: number; // 1-7 (Monday = 1)
  is_recurring?: boolean;
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled';
  created_at?: string;
  instructor_images?: any;
  courses?: {
    name: string;
    code: string;
  };
  // Backward compatibility fields
  name?: string;     // computed from courses.name or title
  code?: string;     // computed from courses.code
  instructor?: string; // to be populated from instructor data
}

export interface Assignment {
  id: string;
  course_id: string;
  class?: string; // class code string (FK to class.class)
  title: string;
  description: string;
  due_date: string; // ISO datetime string
  // The following legacy fields may not exist in the minimal schema; keep optional for compatibility
  total_points?: number;
  assignment_type?: 'homework' | 'lab' | 'project' | 'quiz' | 'exam';
  priority?: 'high' | 'medium' | 'low';
  is_published?: boolean;
  created_by: string;
  created_at: string; // ISO datetime string
  courses?: {
    name: string;
    code: string;
  };
  // Computed fields for convenience
  course_name?: string; // computed from courses.name
  course_code?: string; // computed from courses.code
  days_until_due?: number; // computed field
  status?: 'upcoming' | 'due_soon' | 'overdue' | 'completed';
}

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  student_id: string;
  submission_text?: string;
  file_url?: string;
  submitted_at: string; // ISO datetime string
  grade?: number;
  feedback?: string;
  status: 'submitted' | 'graded' | 'late' | 'draft';
  created_at: string;
  updated_at?: string;
}

// Generic API request handler with proper error handling
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`;
    
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    console.log(`API Request: ${defaultOptions.method || 'GET'} ${url}`);

    const response = await fetch(url, defaultOptions);
    
    if (!response.ok) {
      let errMsg = `API Error: ${response.status} ${response.statusText}`;
      try {
        const errBody = await response.json();
        const detail = (errBody && (errBody.detail || errBody.message || errBody.error)) as string | undefined;
        if (detail) errMsg = detail;
      } catch {}
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return {
        error: errMsg,
        status: response.status,
      };
    }

    const data = await response.json();
    console.log(`API Response:`, data);
    
    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('Network error:', error);
    return {
      error: `Network error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      status: 0,
    };
  }
}

// Authentication API calls
export const authAPI = {
  async login(email: string, password: string): Promise<ApiResponse<{ user: User; message: string }>> {
    const response = await apiRequest<{ user: User; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Add computed fields for backward compatibility
    if (response.data?.user) {
      const user = response.data.user;
      user.name = `${user.first_name} ${user.last_name}`;
      user.avatar = user.avatar_url;
    }

    return response;
  },

  async getCurrentUser(): Promise<ApiResponse<{ user: User }>> {
    const response = await apiRequest<{ user: User }>('/api/auth/me');

    // Add computed fields for backward compatibility
    if (response.data?.user) {
      const user = response.data.user;
      user.name = `${user.first_name} ${user.last_name}`;
      user.avatar = user.avatar_url;
    }

    return response;
  },

  async register(userData: {
    email: string;
    password: string;
    first_name: string;
    last_name: string;
    role: string;
    // New schema
    roll_no: string;
    dept: string; // department code
    class?: string; // UUID
    cgpa?: number;
    // Legacy optional
    student_id?: string;
    department_id?: string;
    year_of_study?: string;
    phone?: string;
    bio?: string;
  }): Promise<ApiResponse<{ user: User; message: string }>> {
    const response = await apiRequest<{ user: User; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });

    // Add computed fields for backward compatibility
    if (response.data?.user) {
      const user = response.data.user;
      user.name = `${user.first_name} ${user.last_name}`;
      user.avatar = user.avatar_url;
      // Compatibility mappings
      if (!user.student_id && user.roll_no) user.student_id = user.roll_no;
      if (!user.gpa && user.cgpa != null) user.gpa = user.cgpa as any;
    }

    return response;
  },

  async getUserById(userId: string): Promise<ApiResponse<{ user: User }>> {
    const response = await apiRequest<{ user: User }>(`/api/auth/user/${userId}`);

    // Add computed fields for backward compatibility
    if (response.data?.user) {
      const user = response.data.user;
      user.name = `${user.first_name} ${user.last_name}`;
      user.avatar = user.avatar_url;
    }

    return response;
  },
};

// Helper function to transform class data for backward compatibility
function transformClass(apiClass: any): Class {
  const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  return {
    ...apiClass,
    // Backward compatibility fields
    name: apiClass.courses?.name || apiClass.title || 'Unknown Course',
    code: apiClass.courses?.code || 'N/A',
  instructor: apiClass.instructor || '', // Empty when instructor not available
    day_of_week: typeof apiClass.day_of_week === 'number' ? dayNames[apiClass.day_of_week] : apiClass.day_of_week,
  };
}

// Helper function to transform multiple classes
function transformClasses(classes: any[]): Class[] {
  return classes.map(transformClass);
}

// Classes/Timetable API calls
export const classesAPI = {
  async getAllClasses(): Promise<ApiResponse<{ classes: Class[] }>> {
    // If current user is faculty, filter by their courses; if student, by their class via student_id
    let endpoint = '/api/classes';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.role === 'faculty' && u.id) {
          const qs = new URLSearchParams({ faculty_id: u.id });
          endpoint = `/api/classes?${qs.toString()}`;
        } else if (u?.role === 'student' && u.id) {
          const qs = new URLSearchParams({ student_id: u.id });
          endpoint = `/api/classes?${qs.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ classes: any[] }>(endpoint);
    
    if (response.data?.classes) {
      response.data.classes = transformClasses(response.data.classes);
    }
    
    return response as ApiResponse<{ classes: Class[] }>;
  },

  async getTodaysClasses(): Promise<ApiResponse<{ classes: Class[] }>> {
    // If current user is faculty, filter by their courses; if student, by their class via student_id
    let endpoint = '/api/classes/today';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.role === 'faculty' && u.id) {
          const qs = new URLSearchParams({ faculty_id: u.id });
          endpoint = `/api/classes/today?${qs.toString()}`;
        } else if (u?.role === 'student' && u.id) {
          const qs = new URLSearchParams({ student_id: u.id });
          endpoint = `/api/classes/today?${qs.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ classes: any[] }>(endpoint);
    
    if (response.data?.classes) {
      response.data.classes = transformClasses(response.data.classes);
    }
    
    return response as ApiResponse<{ classes: Class[] }>;
  },

  async getWeeklyTimetable(): Promise<ApiResponse<{ weekly_classes: Class[] }>> {
    const response = await apiRequest<{ weekly_classes: any[] }>('/api/classes/week');
    
    if (response.data?.weekly_classes) {
      response.data.weekly_classes = transformClasses(response.data.weekly_classes);
    }
    
    return response as ApiResponse<{ weekly_classes: Class[] }>;
  },

  async getMonthlyClasses(): Promise<ApiResponse<{ monthly_classes: Class[] }>> {
    const response = await apiRequest<{ monthly_classes: any[] }>('/api/classes/month');
    
    if (response.data?.monthly_classes) {
      response.data.monthly_classes = transformClasses(response.data.monthly_classes);
    }
    
    return response as ApiResponse<{ monthly_classes: Class[] }>;
  },

  async getCurrentClass(): Promise<ApiResponse<{ current_class: Class | null }>> {
    let endpoint = '/api/classes/current';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.role === 'faculty' && u.id) {
          const qs = new URLSearchParams({ faculty_id: u.id });
          endpoint = `/api/classes/current?${qs.toString()}`;
        } else if (u?.role === 'student' && u.id) {
          const qs = new URLSearchParams({ student_id: u.id });
          endpoint = `/api/classes/current?${qs.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ current_class: any }>(endpoint);
    
    if (response.data?.current_class) {
      response.data.current_class = transformClass(response.data.current_class);
    }
    
    return response as ApiResponse<{ current_class: Class | null }>;
  },

  async getNextClass(): Promise<ApiResponse<{ next_class: Class | null }>> {
    let endpoint = '/api/classes/next';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.role === 'faculty' && u.id) {
          const qs = new URLSearchParams({ faculty_id: u.id });
          endpoint = `/api/classes/next?${qs.toString()}`;
        } else if (u?.role === 'student' && u.id) {
          const qs = new URLSearchParams({ student_id: u.id });
          endpoint = `/api/classes/next?${qs.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ next_class: any }>(endpoint);
    
    if (response.data?.next_class) {
      response.data.next_class = transformClass(response.data.next_class);
    }
    
    return response as ApiResponse<{ next_class: Class | null }>;
  },

  async getClassById(classId: string): Promise<ApiResponse<{ class: Class | null }>> {
    const response = await apiRequest<{ class: any }>(`/api/classes/${classId}`);
    
    if (response.data?.class) {
      response.data.class = transformClass(response.data.class);
    }
    
    return response as ApiResponse<{ class: Class | null }>;
  },

  async getClassesByDate(date: string, section?: string): Promise<ApiResponse<{ classes: Class[] }>> {
    // Use path-param endpoint to avoid conflict with /api/classes/{class_id}
    const qs = new URLSearchParams();
    if (section) qs.set('section', section);
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.role === 'faculty' && u.id) qs.set('faculty_id', u.id);
        else if (u?.role === 'student' && u.id) qs.set('student_id', u.id);
      }
    } catch {}
    const suffix = qs.toString() ? `?${qs.toString()}` : '';
    const response = await apiRequest<{ classes: any[] }>(`/api/classes/date/${encodeURIComponent(date)}${suffix}`);
    if (response.data?.classes) {
      response.data.classes = transformClasses(response.data.classes);
    }
    return response as ApiResponse<{ classes: Class[] }>;
  },

  // Faculty: Create a class (timetable entry)
  async createClass(payload: {
    course_id: string;
    room: string;
    section: string;
    start_time: string; // "HH:MM" or full ISO
    end_time: string;   // "HH:MM" or full ISO
    day_of_week: string; // monday..saturday
  }): Promise<ApiResponse<{ message: string; class: Class }>> {
    return apiRequest('/api/classes', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // Faculty: Update a class
  async updateClass(classId: string, payload: Partial<{
    course_id: string;
    room: string;
    section: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
  }>): Promise<ApiResponse<{ message: string; class: Class }>> {
    return apiRequest(`/api/classes/${classId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },

  // Faculty: Delete a class
  async deleteClass(classId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/classes/${classId}`, {
      method: 'DELETE',
    });
  },

  // Saturday mapping maintenance
  async createSaturdayMapping(payload: { date: string; section: string; tt_followed: string }): Promise<ApiResponse<{ message: string; saturday_class: any }>> {
    return apiRequest('/api/saturday-class', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async updateSaturdayMapping(rowId: string, payload: Partial<{ date: string; section: string; tt_followed: string }>): Promise<ApiResponse<{ message: string; saturday_class: any }>> {
    return apiRequest(`/api/saturday-class/${rowId}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    });
  },
  async deleteSaturdayMapping(rowId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/saturday-class/${rowId}`, {
      method: 'DELETE',
    });
  },
};

// Helper function to transform assignment data for backward compatibility
function transformAssignment(apiAssignment: any): Assignment {
  const dueDate = new Date(apiAssignment.due_date);
  const now = new Date();
  const daysDiff = Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  let status: 'upcoming' | 'due_soon' | 'overdue' | 'completed' = 'upcoming';
  if (daysDiff < 0) {
    status = 'overdue';
  } else if (daysDiff <= 3) {
    status = 'due_soon';
  }
  
  return {
    ...apiAssignment,
    // Computed fields for convenience
    course_name: apiAssignment.courses?.name || '',
    course_code: apiAssignment.courses?.code || '',
    days_until_due: daysDiff,
    status: status,
  };
}

// Helper function to transform multiple assignments
function transformAssignments(assignments: any[]): Assignment[] {
  return assignments.map(transformAssignment);
}

// Assignments API calls
export const assignmentsAPI = {
  async getAllAssignments(): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    let endpoint = '/api/assignments';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) {
          const params = new URLSearchParams();
          if (u.role === 'faculty') params.set('faculty_id', u.id);
          if (u.role === 'student') params.set('student_id', u.id);
          if (Array.from(params.keys()).length) endpoint = `/api/assignments?${params.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ assignments: any[] }>(endpoint);
    
    if (response.data?.assignments) {
      response.data.assignments = transformAssignments(response.data.assignments);
    }
    
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },

  async getUpcomingAssignments(): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    let endpoint = '/api/assignments/upcoming';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) {
          const params = new URLSearchParams();
          if (u.role === 'faculty') params.set('faculty_id', u.id);
          if (u.role === 'student') params.set('student_id', u.id);
          if (Array.from(params.keys()).length) endpoint = `/api/assignments/upcoming?${params.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ assignments: any[] }>(endpoint);
    
    if (response.data?.assignments) {
      response.data.assignments = transformAssignments(response.data.assignments);
    }
    
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },

  async getOverdueAssignments(): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    let endpoint = '/api/assignments/overdue';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) {
          const params = new URLSearchParams();
          if (u.role === 'faculty') params.set('faculty_id', u.id);
          if (u.role === 'student') params.set('student_id', u.id);
          if (Array.from(params.keys()).length) endpoint = `/api/assignments/overdue?${params.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ assignments: any[] }>(endpoint);
    
    if (response.data?.assignments) {
      response.data.assignments = transformAssignments(response.data.assignments);
    }
    
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },

  async getAssignmentById(assignmentId: string): Promise<ApiResponse<{ assignment: Assignment }>> {
    const response = await apiRequest<{ assignment: any }>(`/api/assignments/${assignmentId}`);
    
    if (response.data?.assignment) {
      response.data.assignment = transformAssignment(response.data.assignment);
    }
    
    return response as ApiResponse<{ assignment: Assignment }>;
  },

  async getAssignmentsByCourse(courseId: string): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    const response = await apiRequest<{ assignments: any[] }>(`/api/assignments/course/${courseId}`);
    
    if (response.data?.assignments) {
      response.data.assignments = transformAssignments(response.data.assignments);
    }
    
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },

  async submitAssignment(assignmentId: string, submissionData: {
    submission_text?: string;
    file_url?: string;
    student_id: string;
  }): Promise<ApiResponse<{ message: string; submission: AssignmentSubmission }>> {
    return apiRequest(`/api/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify(submissionData),
    });
  },

  async updateAssignmentSubmission(assignmentId: string, submissionData: {
    submission_text?: string;
    file_url?: string;
  }): Promise<ApiResponse<{ message: string; submission: AssignmentSubmission }>> {
    return apiRequest(`/api/assignments/${assignmentId}/submission`, {
      method: 'PUT',
      body: JSON.stringify(submissionData),
    });
  },

  async deleteAssignmentSubmission(assignmentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/assignments/${assignmentId}/submission`, {
      method: 'DELETE',
    });
  },

  // For faculty: Create new assignment
  async createAssignment(assignmentData: {
    course_id: string;
    class?: string;
    title: string;
    description: string;
    due_date: string;
    created_by?: string;
  }): Promise<ApiResponse<{ message: string; assignment: Assignment }>> {
    return apiRequest('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  // For faculty: Update assignment
  async updateAssignment(assignmentId: string, assignmentData: Partial<Assignment> & { user_id?: string }): Promise<ApiResponse<{ message: string; assignment: Assignment }>> {
    // Attach user_id for ownership checks if not provided
    try {
      if (!assignmentData.user_id) {
        const storedUser = localStorage.getItem('campusgo_user');
        if (storedUser) {
          const u = JSON.parse(storedUser) as User;
          if (u?.id) (assignmentData as any).user_id = u.id;
        }
      }
    } catch {}
    return apiRequest(`/api/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  // For faculty: Delete assignment
  async deleteAssignment(assignmentId: string): Promise<ApiResponse<{ message: string }>> {
    // Pass user_id as query param for backend enforcement
    const params = new URLSearchParams();
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) params.set('user_id', u.id);
      }
    } catch {}
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/assignments/${assignmentId}${suffix}`, { method: 'DELETE' });
  },

  async getMyAssignments(userId: string): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    const qs = new URLSearchParams({ user_id: userId });
    const response = await apiRequest<{ assignments: any[] }>(`/api/assignments/my?${qs.toString()}`);
    if (response.data?.assignments) response.data.assignments = transformAssignments(response.data.assignments);
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },
};

// Dashboard API calls with enhanced data flow
export const dashboardAPI = {
  async getDashboard(): Promise<ApiResponse<{
    current_session: any;
    recent_classes: Class[];
    recent_assignments: Assignment[];
    user_stats?: {
      enrollments_count: number;
      submissions_count: number;
      upcoming_assignments: number;
      completed_assignments: number;
    };
  }>> {
    // Pass role-based filters to get scoped assignments in dashboard when needed
    let endpoint = '/api/dashboard';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) {
          const params = new URLSearchParams();
          if (u.role === 'faculty') params.set('faculty_id', u.id);
          if (u.role === 'student') params.set('student_id', u.id);
          if (Array.from(params.keys()).length) endpoint = `/api/dashboard?${params.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{
      current_session: any;
      recent_classes: any[];
      recent_assignments: any[];
      user_stats?: any;
    }>(endpoint);

    // Transform the data for better frontend consumption
    if (response.data) {
      if (response.data.recent_classes) {
        response.data.recent_classes = transformClasses(response.data.recent_classes);
      }
      if (response.data.recent_assignments) {
        response.data.recent_assignments = transformAssignments(response.data.recent_assignments);
      }
    }

    return response as ApiResponse<{
      current_session: any;
      recent_classes: Class[];
      recent_assignments: Assignment[];
      user_stats?: {
        enrollments_count: number;
        submissions_count: number;
        upcoming_assignments: number;
        completed_assignments: number;
      };
    }>;
  },

  async getCurrentSession(): Promise<ApiResponse<{ session: any }>> {
    return apiRequest('/api/sessions/current');
  },

  async getStudentStats(studentId: string): Promise<ApiResponse<{
    enrollments_count: number;
    submissions_count: number;
    upcoming_assignments: number;
    completed_assignments: number;
  }>> {
    return apiRequest(`/api/users/${studentId}/stats`);
  },

  async getUpcomingDeadlines(): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    // Include role-based scoping so faculty see only their course assignments
    let endpoint = '/api/assignments/upcoming';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) {
          const params = new URLSearchParams();
          if (u.role === 'faculty') params.set('faculty_id', u.id);
          if (u.role === 'student') params.set('student_id', u.id);
          if (Array.from(params.keys()).length) endpoint = `/api/assignments/upcoming?${params.toString()}`;
        }
      }
    } catch {}
    const response = await apiRequest<{ assignments: any[] }>(endpoint);
    
    if (response.data?.assignments) {
      // Filter to only next 7 days and transform
      const weekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
      const upcomingAssignments = response.data.assignments
        .filter(assignment => new Date(assignment.due_date) <= weekFromNow)
        .slice(0, 5); // Limit to 5 most urgent
      
  response.data.assignments = transformAssignments(upcomingAssignments);
    }
    
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },

  async getTodayOverview(): Promise<ApiResponse<{
    today_classes: Class[];
    due_today: Assignment[];
    current_class: Class | null;
    next_class: Class | null;
  }>> {
    const [todayClassesRes, currentClassRes, nextClassRes] = await Promise.all([
      classesAPI.getTodaysClasses(),
      classesAPI.getCurrentClass(),
      classesAPI.getNextClass()
    ]);

    // Get assignments due today
    const assignmentsRes = await assignmentsAPI.getAllAssignments();
    const today = new Date().toISOString().split('T')[0];
    const dueToday = assignmentsRes.data?.assignments?.filter(
      assignment => assignment.due_date.startsWith(today)
    ) || [];

    return {
      data: {
        today_classes: todayClassesRes.data?.classes || [],
        due_today: dueToday,
        current_class: currentClassRes.data?.current_class || null,
        next_class: nextClassRes.data?.next_class || null,
      },
      status: 200
    };
  },
};

// Users API calls
export const usersAPI = {
  async getAllUsers(): Promise<ApiResponse<{ users: User[] }>> {
    return apiRequest('/api/users');
  },

  async getUserProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest('/api/users/me');
  },

  async getUserById(userId: string): Promise<ApiResponse<{ user: User }>> {
    return apiRequest(`/api/users/${userId}`);
  },

  async searchUsers(query?: string): Promise<ApiResponse<{ users: User[] }>> {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    // Optionally attach current user id if you have it in localStorage
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const { id } = JSON.parse(storedUser);
        if (id) params.set('current_user_id', id);
      }
    } catch {}
    const endpoint = `/api/search/users${params.toString() ? `?${params.toString()}` : ''}`;
    return apiRequest(endpoint);
  },
};

// Health check
export const healthAPI = {
  async checkHealth(): Promise<ApiResponse<{ status: string; supabase: string; database: string }>> {
    return apiRequest('/health');
  },

  async getRoot(): Promise<ApiResponse<{ message: string; status: string }>> {
    return apiRequest('/');
  },
};

// Additional interfaces for new endpoints
export interface Resource {
  id: string;
  title: string;
  description: string;
  resource_type: 'document' | 'video' | 'link' | 'image' | 'slides' | 'other';
  category?: 'syllabus' | 'announcements' | 'materials';
  class?: string | null; // class code string
  url?: string;
  file_url?: string; // S3 bucket URL
  file_name?: string;
  file_size?: number;
  file_type?: string;
  course_id?: string;
  uploaded_by?: string;
  download_count?: number;
  is_external?: boolean;
  external_url?: string;
  tags?: string[];
  created_at?: string;
  courses?: {
    name: string;
    code: string;
  };
  uploader?: {
    first_name: string;
    last_name: string;
  };
}

export interface Project {
  id: string;
  title: string;
  description: string;
  course_id?: string;
  created_by?: string;
  due_date?: string;
  created_at?: string;
  courses?: {
    name: string;
    code: string;
  };
  members_needed?: number;
  current_members?: number;
  project_type?: string;
  skills_needed?: string[];
}

export interface ProjectTypeOption {
  value: string;
  label: string;
}

export interface FileItem {
  id: string;
  name: string;
  file_type: 'document' | 'image' | 'video' | 'audio' | 'archive' | 'other';
  file_path: string;
  file_size?: number;
  uploaded_by?: string;
  created_at?: string;
  course_id?: string;
}

export interface Notification {
  id: string;
  title: string;
  message?: string | null;
  notif_type: 'assignment' | 'event' | 'resource' | 'timetable' | 'saturday_class' | 'chat' | 'friend_request' | 'system';
  recipient_id?: string;
  actor_id?: string;
  is_read?: boolean;
  created_at?: string;
  // optional navigation/context fields
  resource_id?: string;
  assignment_id?: string;
  event_id?: string;
  timetable_id?: string;
  saturday_row_id?: string;
  meta?: Record<string, any>;
}

export interface Idea {
  id: string;
  title: string;
  content: string;
  course_id?: string;
  project_id?: string;
  created_by?: string;
  created_at?: string;
  courses?: {
    name: string;
  };
  projects?: {
    title: string;
  };
}

// Events interfaces
export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  start_date: string; // YYYY-MM-DD
  start_time?: string; // HH:MM:SS
  end_time?: string; // HH:MM:SS
  is_all_day?: boolean;
  priority?: string;
  color?: string; // '#RRGGBB'
  course_id?: string;
  assignment_id?: string;
  class?: string; // class code string
  created_by?: string; // user id
  location?: string;
  is_personal?: boolean;
}

// Resources API calls
export const resourcesAPI = {
  async getAllResources(): Promise<ApiResponse<{ resources: Resource[] }>> {
    // If current user is faculty, ask backend to return union of their uploads and their courses' resources
    let endpoint = '/api/resources';
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.role === 'faculty' && u.id) {
          const qs = new URLSearchParams({ faculty_id: u.id });
          endpoint = `/api/resources?${qs.toString()}`;
        } else if (u?.role === 'student' && u.id) {
          const qs = new URLSearchParams({ student_id: u.id });
          endpoint = `/api/resources?${qs.toString()}`;
        }
      }
    } catch {}
    return apiRequest(endpoint);
  },

  async getMyResources(userId: string): Promise<ApiResponse<{ resources: Resource[] }>> {
    const qs = new URLSearchParams({ user_id: userId });
    return apiRequest(`/api/resources/my?${qs.toString()}`);
  },

  async searchResources(query?: string): Promise<ApiResponse<{ resources: Resource[] }>> {
    const endpoint = query ? `/api/resources/search?q=${encodeURIComponent(query)}` : '/api/resources/search';
    return apiRequest(endpoint);
  },

  async getResourceById(resourceId: string): Promise<ApiResponse<{ resource: Resource }>> {
    return apiRequest(`/api/resources/${resourceId}`);
  },

  async getResourceStats(resourceId: string): Promise<ApiResponse<{ download_count: number }>> {
    return apiRequest(`/api/resources/${resourceId}/stats`);
  },

  async createResource(resourceData: {
    title: string;
    description: string;
    resource_type: string;
    category?: 'syllabus' | 'announcements' | 'materials';
    class?: string;
    file_url?: string;
    file_name?: string;
    file_size?: number;
    file_type?: string;
    course_id?: string;
    is_external?: boolean;
    external_url?: string;
    tags?: string[];
  }): Promise<ApiResponse<{ resource: Resource; message: string }>> {
    return apiRequest('/api/resources', {
      method: 'POST',
      body: JSON.stringify(resourceData),
    });
  },

  async updateResource(resourceId: string, resourceData: Partial<Resource> & { user_id?: string }): Promise<ApiResponse<{ resource: Resource; message: string }>> {
    // Attach user_id for backend ownership enforcement if not provided
    try {
      if (!resourceData.user_id) {
        const storedUser = localStorage.getItem('campusgo_user');
        if (storedUser) {
          const u = JSON.parse(storedUser) as User;
          if (u?.id) (resourceData as any).user_id = u.id;
        }
      }
    } catch {}
    return apiRequest(`/api/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  },

  async deleteResource(resourceId: string): Promise<ApiResponse<{ message: string }>> {
    // Append user_id as query param for backend enforcement
    const params = new URLSearchParams();
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) params.set('user_id', u.id);
      }
    } catch {}
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/resources/${resourceId}${suffix}`, { method: 'DELETE' });
  },

  async trackDownload(resourceId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/resources/${resourceId}/download`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async getResourcesByType(type: string, category?: 'syllabus' | 'announcements' | 'materials'): Promise<ApiResponse<{ resources: Resource[] }>> {
    const params = new URLSearchParams({ type });
    if (category) params.set('category', category);
    return apiRequest(`/api/resources/filter?${params.toString()}`);
  },

  async getResourcesByCourse(courseId: string, category?: 'syllabus' | 'announcements' | 'materials'): Promise<ApiResponse<{ resources: Resource[] }>> {
    if (category) {
      // Leverage filter endpoint when category is specified
      const params = new URLSearchParams({ category, courseId });
      return apiRequest(`/api/resources/filter?${params.toString()}`);
    }
    return apiRequest(`/api/resources/course/${courseId}`);
  },
};

// Projects API calls
export const projectsAPI = {
  async getAllProjects(): Promise<ApiResponse<{ projects: Project[] }>> {
    return apiRequest('/api/projects');
  },

  async getProjectById(projectId: string): Promise<ApiResponse<{ project: Project }>> {
    return apiRequest(`/api/projects/${projectId}`);
  },

  async getProjectMembers(projectId: string): Promise<ApiResponse<{ members: any[] }>> {
    return apiRequest(`/api/projects/${projectId}/members`);
  },

  async getProjectTypes(): Promise<ApiResponse<{ types: ProjectTypeOption[] }>> {
    return apiRequest('/api/project-types');
  },
};

// Files API calls
export const filesAPI = {
  async getAllFiles(): Promise<ApiResponse<{ files: FileItem[] }>> {
    return apiRequest('/api/files');
  },

  async searchFiles(query?: string): Promise<ApiResponse<{ files: FileItem[] }>> {
    const endpoint = query ? `/api/files/search?q=${encodeURIComponent(query)}` : '/api/files/search';
    return apiRequest(endpoint);
  },

  async getFileById(fileId: string): Promise<ApiResponse<{ file: FileItem }>> {
    return apiRequest(`/api/files/${fileId}`);
  },
};

// Notifications API calls
export const notificationsAPI = {
  async list(userId: string, unreadOnly?: boolean): Promise<ApiResponse<{ notifications: Notification[] }>> {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    if (unreadOnly) params.set('unread_only', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/notifications${qs}`);
  },

  async markRead(notificationId: string, userId?: string): Promise<ApiResponse<{ message: string; updated?: number }>> {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/notifications/${notificationId}/read${qs}`, { method: 'PUT' });
  },

  async markAllRead(userId: string): Promise<ApiResponse<{ message: string; updated?: number }>> {
    return apiRequest(`/api/notifications/read-all`, { method: 'PUT', body: JSON.stringify({ user_id: userId }) });
  },

  async delete(notificationId: string, userId?: string): Promise<ApiResponse<{ message: string }>> {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/notifications/${notificationId}${qs}`, { method: 'DELETE' });
  },

  async getUnreadCount(userId: string): Promise<number> {
    const res = await notificationsAPI.list(userId, true);
    if (res.error) return 0;
    return res.data?.notifications?.length ?? 0;
  }
};

// Ideas API calls
export const ideasAPI = {
  async getAllIdeas(): Promise<ApiResponse<{ ideas: Idea[] }>> {
    return apiRequest('/api/ideas');
  },

  async searchIdeas(query?: string): Promise<ApiResponse<{ ideas: Idea[] }>> {
    const endpoint = query ? `/api/ideas/search?q=${encodeURIComponent(query)}` : '/api/ideas/search';
    return apiRequest(endpoint);
  },

  async getIdeaById(ideaId: string): Promise<ApiResponse<{ idea: Idea }>> {
    return apiRequest(`/api/ideas/${ideaId}`);
  },
};

// AI Chat API calls
export const chatAPI = {
  async getAllConversations(): Promise<ApiResponse<{ conversations: any[] }>> {
    return apiRequest('/api/chat/conversations');
  },

  async getConversationById(conversationId: string): Promise<ApiResponse<{ conversation: any }>> {
    return apiRequest(`/api/chat/conversations/${conversationId}`);
  },

  async getConversationMessages(conversationId: string): Promise<ApiResponse<{ messages: any[] }>> {
    return apiRequest(`/api/chat/conversations/${conversationId}/messages`);
  },
};

// Search API calls
export const searchAPI = {
  async globalSearch(query: string): Promise<ApiResponse<{ results: any }>> {
    return apiRequest(`/api/search/global?q=${encodeURIComponent(query)}`);
  },

  async getQuickAccess(): Promise<ApiResponse<{ items: any[] }>> {
    return apiRequest('/api/quick-access');
  },

  async getSearchHistory(): Promise<ApiResponse<{ search_history: any[] }>> {
    return apiRequest('/api/search/history');
  },
};

// Courses API calls
export const coursesAPI = {
  async getAllCourses(): Promise<ApiResponse<{ courses: any[] }>> {
    return apiRequest('/api/courses');
  },

  async getCourseById(courseId: string): Promise<ApiResponse<{ course: any }>> {
    return apiRequest(`/api/courses/${courseId}`);
  },

  async getCourseOverview(courseId: string): Promise<ApiResponse<{ course: any; assignments_count: number; classes_count: number }>> {
    return apiRequest(`/api/courses/${courseId}/overview`);
  },

  async getCourseStudents(courseId: string): Promise<ApiResponse<{ students: any[] }>> {
    return apiRequest(`/api/courses/${courseId}/students`);
  },
};

// Stats API calls
export const statsAPI = {
  async getOverviewStats(): Promise<ApiResponse<{ stats: any }>> {
    return apiRequest('/api/stats/overview');
  },

  async getAssignmentStats(): Promise<ApiResponse<{ total_assignments: number; total_submissions: number }>> {
    return apiRequest('/api/stats/assignments');
  },

  async getUserStats(): Promise<ApiResponse<{ stats: any }>> {
    return apiRequest('/api/users/stats');
  },
};

// Activity API calls
export const activityAPI = {
  async getUserActivity(): Promise<ApiResponse<{ activities: any[] }>> {
    return apiRequest('/api/activity');
  },

  async getBookmarks(): Promise<ApiResponse<{ bookmarks: any[] }>> {
    return apiRequest('/api/bookmarks');
  },
};

// Enhanced Search and Filtering Utilities
export const searchUtils = {
  // Multi-category search across all content types
  async globalSearch(query: string): Promise<ApiResponse<{
    assignments: Assignment[];
    classes: Class[];
    resources: Resource[];
    projects: Project[];
    files: FileItem[];
    ideas: Idea[];
    total_results: number;
  }>> {
    try {
      const [assignmentsRes, classesRes, resourcesRes, projectsRes, filesRes, ideasRes] = await Promise.all([
        assignmentsAPI.getAllAssignments(),
        classesAPI.getAllClasses(),
        resourcesAPI.searchResources(query),
        projectsAPI.getAllProjects(),
        filesAPI.searchFiles(query),
        ideasAPI.searchIdeas(query)
      ]);

      // Filter results by query
      const lowerQuery = query.toLowerCase();
      
      const filteredAssignments = (assignmentsRes.data?.assignments || []).filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      );

      const filteredClasses = (classesRes.data?.classes || []).filter(item =>
        item.name?.toLowerCase().includes(lowerQuery) ||
        item.code?.toLowerCase().includes(lowerQuery)
      );

      const filteredProjects = (projectsRes.data?.projects || []).filter(item =>
        item.title.toLowerCase().includes(lowerQuery) ||
        item.description.toLowerCase().includes(lowerQuery)
      );

      const results = {
        assignments: filteredAssignments,
        classes: filteredClasses,
        resources: resourcesRes.data?.resources || [],
        projects: filteredProjects,
        files: filesRes.data?.files || [],
        ideas: ideasRes.data?.ideas || [],
        total_results: 0
      };

      results.total_results = 
        results.assignments.length +
        results.classes.length +
        results.resources.length +
        results.projects.length +
        results.files.length +
        results.ideas.length;

      return { data: results, status: 200 };
    } catch (error) {
      return { error: 'Search failed', status: 500 };
    }
  },

  // Advanced assignment filtering
  filterAssignments: {
    byPriority: (assignments: Assignment[], priority: 'high' | 'medium' | 'low') =>
      assignments.filter(a => a.priority === priority),
    
    byStatus: (assignments: Assignment[], status: 'upcoming' | 'due_soon' | 'overdue' | 'completed') =>
      assignments.filter(a => a.status === status),
    
    byType: (assignments: Assignment[], type: 'homework' | 'lab' | 'project' | 'quiz' | 'exam') =>
      assignments.filter(a => a.assignment_type === type),
    
    byCourse: (assignments: Assignment[], courseId: string) =>
      assignments.filter(a => a.course_id === courseId),
    
    byDateRange: (assignments: Assignment[], startDate: Date, endDate: Date) =>
      assignments.filter(a => {
        const dueDate = new Date(a.due_date);
        return dueDate >= startDate && dueDate <= endDate;
      }),
    
    dueSoon: (assignments: Assignment[], days: number = 7) =>
      assignments.filter(a => {
        const daysDiff = a.days_until_due || 0;
        return daysDiff >= 0 && daysDiff <= days;
      })
  },

  // Advanced class filtering
  filterClasses: {
    byDay: (classes: Class[], day: string) =>
      classes.filter(c => {
        if (typeof c.day_of_week === 'number') {
          const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          return dayNames[c.day_of_week] === day;
        }
        return c.day_of_week === day;
      }),
    
    byTimeRange: (classes: Class[], startTime: string, endTime: string) =>
      classes.filter(c => {
        if (!c.start_time) return false;
        const classTime = new Date(c.start_time).toTimeString().slice(0, 5);
        return classTime >= startTime && classTime <= endTime;
      }),
    
    byInstructor: (classes: Class[], instructor: string) =>
      classes.filter(c => c.instructor?.toLowerCase().includes(instructor.toLowerCase())),
    
    byRoom: (classes: Class[], room: string) =>
      classes.filter(c => c.room?.toLowerCase().includes(room.toLowerCase()))
  },

  // Sorting utilities
  sortUtils: {
    assignments: {
      byDueDate: (assignments: Assignment[], ascending = true) =>
        [...assignments].sort((a, b) => {
          const dateA = new Date(a.due_date).getTime();
          const dateB = new Date(b.due_date).getTime();
          return ascending ? dateA - dateB : dateB - dateA;
        }),
      
      byPriority: (assignments: Assignment[]) =>
        [...assignments].sort((a, b) => {
          const priorityOrder: Record<string, number> = { high: 3, medium: 2, low: 1 };
          const pa = a.priority ? priorityOrder[a.priority] : 0;
          const pb = b.priority ? priorityOrder[b.priority] : 0;
          return pb - pa;
        }),
      
      byPoints: (assignments: Assignment[], ascending = false) =>
        [...assignments].sort((a, b) => {
          const ap = a.total_points ?? 0;
          const bp = b.total_points ?? 0;
          return ascending ? ap - bp : bp - ap;
        })
    },

    classes: {
      byTime: (classes: Class[], ascending = true) =>
        [...classes].sort((a, b) => {
          if (!a.start_time || !b.start_time) return 0;
          const timeA = new Date(a.start_time).getTime();
          const timeB = new Date(b.start_time).getTime();
          return ascending ? timeA - timeB : timeB - timeA;
        }),
      
      byName: (classes: Class[], ascending = true) =>
        [...classes].sort((a, b) => {
          const nameA = (a.name || '').toLowerCase();
          const nameB = (b.name || '').toLowerCase();
          return ascending ? nameA.localeCompare(nameB) : nameB.localeCompare(nameA);
        })
    }
  }
};

// Calendar & Events API calls
export const calendarAPI = {
  async getMonth(year: number, month: number, userId?: string): Promise<ApiResponse<{ events_by_date: Record<string, CalendarEvent[]>; total_events: number }>> {
    const params = new URLSearchParams();
    if (userId) params.set('user_id', userId);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/calendar/${year}/${month}${suffix}`);
  },

  async listEvents(month?: number, year?: number, userId?: string): Promise<ApiResponse<{ events: CalendarEvent[] }>> {
    const params = new URLSearchParams();
    if (month) params.set('month', String(month));
    if (year) params.set('year', String(year));
    if (userId) params.set('user_id', userId);
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/events${suffix}`);
  },

  async createEvent(event: CalendarEvent): Promise<ApiResponse<{ event: CalendarEvent; message: string }>> {
    // Client-side schema defaults to align with DB
    if (event.priority == null) event.priority = 'medium' as any;
    if (!event.color) event.color = '#3b82f6';
    const normTime = (v?: string) => (v && v.length === 5 && v.includes(':') ? `${v}:00` : v);
    if (event.start_time) event.start_time = normTime(event.start_time);
    if (event.end_time) event.end_time = normTime(event.end_time);

    // If current user is a student, force personal events client-side too
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.role === 'student') {
          event.is_personal = true;
          if (!event.created_by && u.id) event.created_by = u.id;
        }
      }
    } catch {}
    return apiRequest('/api/events', {
      method: 'POST',
      body: JSON.stringify(event),
    });
  },

  async updateEvent(eventId: string, event: Partial<CalendarEvent>): Promise<ApiResponse<{ event: CalendarEvent; message: string }>> {
    // Client-side normalization to match DB
    if (event.priority !== undefined && !event.priority) event.priority = 'medium' as any;
    if (event.color !== undefined && !event.color) event.color = '#3b82f6';
    const normTime = (v?: string) => (v && v.length === 5 && v.includes(':') ? `${v}:00` : v);
    if (event.start_time !== undefined && event.start_time) event.start_time = normTime(event.start_time);
    if (event.end_time !== undefined && event.end_time) event.end_time = normTime(event.end_time);

    // Ensure backend knows acting user for ownership enforcement
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        // Always pass user_id for backend checks
        (event as any).user_id = u?.id;
        if (u?.role === 'student') {
          // Students can only manage personal events
          event.is_personal = true;
          if ('created_by' in event) delete (event as any).created_by;
        }
      }
    } catch {}
    return apiRequest(`/api/events/${eventId}`, {
      method: 'PUT',
      body: JSON.stringify(event),
    });
  },

  async deleteEvent(eventId: string): Promise<ApiResponse<{ message: string }>> {
    // Append user_id for backend ownership enforcement
    const params = new URLSearchParams();
    try {
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const u = JSON.parse(storedUser) as User;
        if (u?.id) params.set('user_id', u.id);
      }
    } catch {}
    const suffix = params.toString() ? `?${params.toString()}` : '';
    return apiRequest(`/api/events/${eventId}${suffix}`, { method: 'DELETE' });
  },

  async getMyEvents(userId: string): Promise<ApiResponse<{ events: CalendarEvent[] }>> {
    const qs = new URLSearchParams({ user_id: userId });
    return apiRequest(`/api/events/my?${qs.toString()}`);
  },
};

export const adminAPI = {
  async listTimetable(): Promise<ApiResponse<{ classes: any[] }>> {
    return apiRequest('/api/classes');
  },
  async createTimetable(payload: {
    course_id: string;
    room: string;
    class: string; // class code
    start_time: string; // HH:MM[:SS]
    end_time: string;   // HH:MM[:SS]
    day_of_week: string; // monday..saturday
  }): Promise<ApiResponse<{ timetable: any; message: string }>> {
    return apiRequest('/api/admin/timetable', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateTimetable(classId: string, payload: Partial<{ room: string; class: string; start_time: string; end_time: string; day_of_week: string }>): Promise<ApiResponse<{ message: string; class: any }>> {
    return apiRequest(`/api/classes/${classId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteTimetable(classId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/classes/${classId}`, { method: 'DELETE' });
  },
  async listSaturday(): Promise<ApiResponse<{ saturday_class: any[] }>> {
    return apiRequest('/api/saturday-class');
  },
  async createSaturdayClass(payload: {
    date: string; // YYYY-MM-DD
    class: string; // class code
    tt_followed: string; // monday..saturday
  }): Promise<ApiResponse<{ saturday_class: any; message: string }>> {
    return apiRequest('/api/admin/saturday-class', { method: 'POST', body: JSON.stringify(payload) });
  },
  async updateSaturdayClass(rowId: string, payload: Partial<{ date: string; class: string; tt_followed: string }>): Promise<ApiResponse<{ message: string; saturday_class: any }>> {
    return apiRequest(`/api/saturday-class/${rowId}`, { method: 'PUT', body: JSON.stringify(payload) });
  },
  async deleteSaturdayClass(rowId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/saturday-class/${rowId}`, { method: 'DELETE' });
  },
};

export default {
  auth: authAPI,
  classes: classesAPI,
  assignments: assignmentsAPI,
  dashboard: dashboardAPI,
  users: usersAPI,
  health: healthAPI,
  resources: resourcesAPI,
  projects: projectsAPI,
  files: filesAPI,
  notifications: notificationsAPI,
  ideas: ideasAPI,
  chat: chatAPI,
  search: searchAPI,
  courses: coursesAPI,
  stats: statsAPI,
  activity: activityAPI,
  searchUtils: searchUtils,
  calendar: calendarAPI,
  admin: adminAPI,
};

// Directory data for signup dropdowns
export const directoryAPI = {
  async listDepartments(): Promise<ApiResponse<{ departments: Array<{ id?: string; code?: string; name?: string }> }>> {
    return apiRequest('/api/departments');
  },
  async listClasses(dept?: string): Promise<ApiResponse<{ classes: Array<{ id: string; academic_year: string; section: string; dept: string; class?: string }> }>> {
    const qs = dept ? `?dept=${encodeURIComponent(dept)}` : '';
    return apiRequest(`/api/class-list${qs}`);
  }
};