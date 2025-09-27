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
  avatar_url?: string;
  phone?: string;
  department_id?: string;
  year_of_study?: string;
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
  title: string;
  description: string;
  due_date: string; // ISO datetime string
  total_points: number;
  assignment_type: 'homework' | 'lab' | 'project' | 'quiz' | 'exam';
  priority: 'high' | 'medium' | 'low';
  is_published: boolean;
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
      console.error(`API Error: ${response.status} ${response.statusText}`);
      return {
        error: `API Error: ${response.status} ${response.statusText}`,
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
    instructor: apiClass.instructor || 'TBA', // Will be populated when instructor data is available
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
    const response = await apiRequest<{ classes: any[] }>('/api/classes');
    
    if (response.data?.classes) {
      response.data.classes = transformClasses(response.data.classes);
    }
    
    return response as ApiResponse<{ classes: Class[] }>;
  },

  async getTodaysClasses(): Promise<ApiResponse<{ classes: Class[] }>> {
    const response = await apiRequest<{ classes: any[] }>('/api/classes/today');
    
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
    const response = await apiRequest<{ current_class: any }>('/api/classes/current');
    
    if (response.data?.current_class) {
      response.data.current_class = transformClass(response.data.current_class);
    }
    
    return response as ApiResponse<{ current_class: Class | null }>;
  },

  async getNextClass(): Promise<ApiResponse<{ next_class: Class | null }>> {
    const response = await apiRequest<{ next_class: any }>('/api/classes/next');
    
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
    course_name: apiAssignment.courses?.name || 'Unknown Course',
    course_code: apiAssignment.courses?.code || 'N/A',
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
    const response = await apiRequest<{ assignments: any[] }>('/api/assignments');
    
    if (response.data?.assignments) {
      response.data.assignments = transformAssignments(response.data.assignments);
    }
    
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },

  async getUpcomingAssignments(): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    const response = await apiRequest<{ assignments: any[] }>('/api/assignments/upcoming');
    
    if (response.data?.assignments) {
      response.data.assignments = transformAssignments(response.data.assignments);
    }
    
    return response as ApiResponse<{ assignments: Assignment[] }>;
  },

  async getOverdueAssignments(): Promise<ApiResponse<{ assignments: Assignment[] }>> {
    const response = await apiRequest<{ assignments: any[] }>('/api/assignments/overdue');
    
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
    title: string;
    description: string;
    due_date: string;
    total_points: number;
    assignment_type: string;
    priority: string;
  }): Promise<ApiResponse<{ message: string; assignment: Assignment }>> {
    return apiRequest('/api/assignments', {
      method: 'POST',
      body: JSON.stringify(assignmentData),
    });
  },

  // For faculty: Update assignment
  async updateAssignment(assignmentId: string, assignmentData: Partial<Assignment>): Promise<ApiResponse<{ message: string; assignment: Assignment }>> {
    return apiRequest(`/api/assignments/${assignmentId}`, {
      method: 'PUT',
      body: JSON.stringify(assignmentData),
    });
  },

  // For faculty: Delete assignment
  async deleteAssignment(assignmentId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/assignments/${assignmentId}`, {
      method: 'DELETE',
    });
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
    const response = await apiRequest<{
      current_session: any;
      recent_classes: any[];
      recent_assignments: any[];
      user_stats?: any;
    }>('/api/dashboard');

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
    const response = await apiRequest<{ assignments: any[] }>('/api/assignments/upcoming');
    
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
    const endpoint = query ? `/api/users/search?query=${encodeURIComponent(query)}` : '/api/users/search';
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
  resource_type: 'document' | 'video' | 'link' | 'image' | 'other';
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
  status?: 'not-started' | 'in-progress' | 'completed';
  created_at?: string;
  courses?: {
    name: string;
    code: string;
  };
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
  message: string;
  notification_type: 'assignment' | 'class' | 'announcement' | 'system';
  recipient_id?: string;
  is_read?: boolean;
  created_at?: string;
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

// Resources API calls
export const resourcesAPI = {
  async getAllResources(): Promise<ApiResponse<{ resources: Resource[] }>> {
    return apiRequest('/api/resources');
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

  async updateResource(resourceId: string, resourceData: Partial<Resource>): Promise<ApiResponse<{ resource: Resource; message: string }>> {
    return apiRequest(`/api/resources/${resourceId}`, {
      method: 'PUT',
      body: JSON.stringify(resourceData),
    });
  },

  async deleteResource(resourceId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/resources/${resourceId}`, {
      method: 'DELETE',
    });
  },

  async trackDownload(resourceId: string): Promise<ApiResponse<{ message: string }>> {
    return apiRequest(`/api/resources/${resourceId}/download`, {
      method: 'POST',
      body: JSON.stringify({}),
    });
  },

  async getResourcesByType(type: string): Promise<ApiResponse<{ resources: Resource[] }>> {
    return apiRequest(`/api/resources/filter?type=${encodeURIComponent(type)}`);
  },

  async getResourcesByCourse(courseId: string): Promise<ApiResponse<{ resources: Resource[] }>> {
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
  async getAllNotifications(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return apiRequest('/api/notifications');
  },

  async getUnreadNotifications(): Promise<ApiResponse<{ notifications: Notification[] }>> {
    return apiRequest('/api/notifications/unread');
  },
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
          const priorityOrder = { high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        }),
      
      byPoints: (assignments: Assignment[], ascending = false) =>
        [...assignments].sort((a, b) => 
          ascending ? a.total_points - b.total_points : b.total_points - a.total_points)
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
};