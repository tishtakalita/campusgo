import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { 
  classesAPI, 
  assignmentsAPI, 
  resourcesAPI, 
  projectsAPI,
  Class as ApiClass, 
  Assignment as ApiAssignment,
  Resource as ApiResource,
  Project as ApiProject
} from '../services/api';

// Re-export API types for consistency
export type Class = ApiClass;
export type Assignment = ApiAssignment;

export interface Resource {
  id: string;
  title: string;
  type: 'notes' | 'video' | 'link' | 'document';
  url: string;
  description: string;
  classId: string;
  uploadedBy: string;
  uploadDate: string;
  tags: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  classId: string;
  assignedTo: string[];
  status: 'not-started' | 'in-progress' | 'completed';
  dueDate: string;
  progress: number;
}

interface DataContextType {
  classes: Class[];
  assignments: Assignment[];
  resources: Resource[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  addClass: (classData: Omit<Class, 'id'>) => void;
  addAssignment: (assignment: Omit<Assignment, 'id'>) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<Assignment>) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteAssignment: (id: string) => void;
  deleteResource: (id: string) => void;
  deleteProject: (id: string) => void;
  refreshData: () => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

interface DataProviderProps {
  children: ReactNode;
}

export const DataProvider: React.FC<DataProviderProps> = ({ children }) => {
  // Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Data states - start with mock data as fallback
  const [classes, setClasses] = useState<Class[]>([
    {
      id: '1',
      name: 'Machine Learning Fundamentals',
      code: 'CS501',
      instructor: 'Dr. Sarah Chen',
      room: 'Room 101',
      schedule: [
        { day: 'Monday', startTime: '09:00', endTime: '10:30' },
        { day: 'Wednesday', startTime: '09:00', endTime: '10:30' },
        { day: 'Friday', startTime: '09:00', endTime: '10:30' }
      ],
      students: ['student1', 'student2', 'student3']
    },
    {
      id: '2',
      name: 'Deep Learning',
      code: 'CS502',
      instructor: 'Dr. Michael Brown',
      room: 'Room 102',
      schedule: [
        { day: 'Tuesday', startTime: '14:00', endTime: '15:30' },
        { day: 'Thursday', startTime: '14:00', endTime: '15:30' }
      ],
      students: ['student1', 'student4', 'student5']
    },
    {
      id: '3',
      name: 'AI Ethics',
      code: 'CS503',
      instructor: 'Dr. Emily Davis',
      room: 'Room 103',
      schedule: [
        { day: 'Wednesday', startTime: '11:00', endTime: '12:30' }
      ],
      students: ['student1', 'student2', 'student6']
    }
  ]);

  const [assignments, setAssignments] = useState<Assignment[]>([
    {
      id: '1',
      title: 'Neural Network Implementation',
      description: 'Implement a basic neural network from scratch',
      subject: 'Deep Learning',
      classId: '2',
      dueDate: '2025-09-20',
      priority: 'high',
      submittedBy: []
    },
    {
      id: '2',
      title: 'Ethics in AI Essay',
      description: 'Write a 2000-word essay on AI ethics',
      subject: 'AI Ethics',
      classId: '3',
      dueDate: '2025-09-22',
      priority: 'medium',
      submittedBy: []
    },
    {
      id: '3',
      title: 'Database Design Project',
      description: 'Design a database schema for an e-commerce platform',
      subject: 'Database Systems',
      classId: '1',
      dueDate: '2025-09-25',
      priority: 'low',
      submittedBy: []
    }
  ]);

  // Load data from API on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Load classes and assignments in parallel
      const [classesResponse, assignmentsResponse] = await Promise.all([
        classesAPI.getAllClasses(),
        assignmentsAPI.getAllAssignments()
      ]);

      // Update classes if API call successful
      if (!classesResponse.error && classesResponse.data?.classes) {
        const transformedClasses = transformApiClasses(classesResponse.data.classes);
        setClasses(transformedClasses);
      }

      // Update assignments if API call successful
      if (!assignmentsResponse.error && assignmentsResponse.data?.assignments) {
        const transformedAssignments = transformApiAssignments(assignmentsResponse.data.assignments);
        setAssignments(transformedAssignments);
      }

      // Set error if both API calls failed
      if (classesResponse.error && assignmentsResponse.error) {
        setError('Failed to load data from server. Using cached data.');
      }
    } catch (err) {
      console.error('Error loading initial data:', err);
      setError('Network error. Using cached data.');
    }
    setIsLoading(false);
  };

  const transformApiClasses = (apiClasses: any[]) => {
    return apiClasses.map(apiClass => ({
      id: apiClass.id,
      name: apiClass.courses?.name || apiClass.name,
      code: apiClass.courses?.code || apiClass.code,
      instructor: apiClass.instructor,
      room: apiClass.room,
      schedule: [{
        day: apiClass.day_of_week,
        startTime: apiClass.start_time,
        endTime: apiClass.end_time
      }],
      students: [] // Mock for now
    }));
  };

  const transformApiAssignments = (apiAssignments: any[]) => {
    return apiAssignments.map(apiAssignment => ({
      id: apiAssignment.id,
      title: apiAssignment.title,
      description: apiAssignment.description,
      subject: apiAssignment.courses?.name || 'Unknown Subject',
      classId: apiAssignment.course_id || '1',
      dueDate: apiAssignment.due_date,
      priority: apiAssignment.priority || 'medium' as 'low' | 'medium' | 'high',
      submittedBy: []
    }));
  };

  const refreshData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetch all data from APIs
      const [classesResponse, assignmentsResponse, resourcesResponse, projectsResponse] = await Promise.all([
        classesAPI.getAllClasses(),
        assignmentsAPI.getAllAssignments(),
        resourcesAPI.getAllResources(),
        projectsAPI.getAllProjects()
      ]);

      // Handle classes
      if (classesResponse.error) {
        console.error('Error fetching classes:', classesResponse.error);
      } else if (classesResponse.data?.classes) {
        const transformedClasses = classesResponse.data.classes.map((apiClass: any) => {
          const dayNames = ['', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
          const dayName = typeof apiClass.day_of_week === 'number' ? 
            dayNames[apiClass.day_of_week] : 
            apiClass.day_of_week || 'Monday';
          
          // Extract time from ISO datetime
          const startTime = apiClass.start_time ? 
            new Date(apiClass.start_time).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            }) : '09:00';
          
          const endTime = apiClass.end_time ? 
            new Date(apiClass.end_time).toLocaleTimeString('en-US', { 
              hour: '2-digit', 
              minute: '2-digit', 
              hour12: false 
            }) : '10:30';

          return {
            id: apiClass.id,
            name: apiClass.courses?.name || apiClass.title || 'Unknown Course',
            code: apiClass.courses?.code || 'N/A',
            instructor: apiClass.instructor || 'TBA',
            room: apiClass.room || 'TBA',
            schedule: [{
              day: dayName,
              startTime: startTime,
              endTime: endTime
            }],
            students: [] // Will be populated from enrollments later
          };
        });
        setClasses(transformedClasses);
      }

      // Handle assignments
      if (assignmentsResponse.error) {
        console.error('Error fetching assignments:', assignmentsResponse.error);
      } else if (assignmentsResponse.data?.assignments) {
        const transformedAssignments = assignmentsResponse.data.assignments.map((apiAssignment: any) => ({
          id: apiAssignment.id,
          title: apiAssignment.title,
          description: apiAssignment.description,
          subject: apiAssignment.courses?.name || 'Unknown Subject',
          classId: apiAssignment.course_id || '1',
          dueDate: apiAssignment.due_date,
          priority: apiAssignment.priority || 'medium' as 'low' | 'medium' | 'high',
          submittedBy: []
        }));
        setAssignments(transformedAssignments);
      }

      // Handle resources
      if (resourcesResponse.error) {
        console.error('Error fetching resources:', resourcesResponse.error);
      } else if (resourcesResponse.data?.resources) {
        const transformedResources = resourcesResponse.data.resources.map((apiResource: any) => ({
          id: apiResource.id,
          title: apiResource.title,
          type: apiResource.resource_type === 'document' ? 'notes' : 
                apiResource.resource_type === 'video' ? 'video' :
                apiResource.resource_type === 'link' ? 'link' : 'document',
          url: apiResource.url || '#',
          description: apiResource.description || '',
          classId: apiResource.course_id || '1',
          uploadedBy: apiResource.uploaded_by || 'Unknown',
          uploadDate: apiResource.created_at ? apiResource.created_at.split('T')[0] : '2025-09-01',
          tags: []
        }));
        setResources(transformedResources);
      }

      // Handle projects
      if (projectsResponse.error) {
        console.error('Error fetching projects:', projectsResponse.error);
      } else if (projectsResponse.data?.projects) {
        const transformedProjects = projectsResponse.data.projects.map((apiProject: any) => ({
          id: apiProject.id,
          title: apiProject.title,
          description: apiProject.description || '',
          classId: apiProject.course_id || '1',
          assignedTo: [], // Will be populated from project members
          status: apiProject.status || 'not-started' as 'not-started' | 'in-progress' | 'completed',
          dueDate: apiProject.due_date || '2025-12-31',
          progress: apiProject.status === 'completed' ? 100 : 
                   apiProject.status === 'in-progress' ? 50 : 0
        }));
        setProjects(transformedProjects);
      }

    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const [resources, setResources] = useState<Resource[]>([
    {
      id: '1',
      title: 'Introduction to Neural Networks',
      type: 'notes',
      url: '/resources/neural-networks-intro.pdf',
      description: 'Basic concepts and fundamentals',
      classId: '1',
      uploadedBy: 'Dr. Sarah Chen',
      uploadDate: '2025-09-10',
      tags: ['neural networks', 'basics', 'fundamentals']
    },
    {
      id: '2',
      title: 'Deep Learning Lecture Series',
      type: 'video',
      url: 'https://youtube.com/watch?v=example',
      description: 'Complete video series on deep learning',
      classId: '2',
      uploadedBy: 'Dr. Michael Brown',
      uploadDate: '2025-09-12',
      tags: ['deep learning', 'video', 'lecture']
    },
    {
      id: '3',
      title: 'AI Ethics Guidelines',
      type: 'document',
      url: '/resources/ai-ethics-guidelines.pdf',
      description: 'Comprehensive guide to AI ethics',
      classId: '3',
      uploadedBy: 'Dr. Emily Davis',
      uploadDate: '2025-09-15',
      tags: ['ethics', 'guidelines', 'ai']
    }
  ]);

  const [projects, setProjects] = useState<Project[]>([
    {
      id: '1',
      title: 'Chatbot Development',
      description: 'Build an AI-powered chatbot for customer service',
      classId: '1',
      assignedTo: ['student1', 'student2'],
      status: 'in-progress',
      dueDate: '2025-10-15',
      progress: 45
    },
    {
      id: '2',
      title: 'Computer Vision App',
      description: 'Develop an image recognition mobile application',
      classId: '2',
      assignedTo: ['student3', 'student4'],
      status: 'not-started',
      dueDate: '2025-11-01',
      progress: 0
    }
  ]);

  const addClass = (classData: Omit<Class, 'id'>) => {
    const newClass: Class = {
      ...classData,
      id: Date.now().toString()
    };
    setClasses(prev => [...prev, newClass]);
  };

  const addAssignment = (assignment: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...assignment,
      id: Date.now().toString()
    };
    setAssignments(prev => [...prev, newAssignment]);
  };

  const addResource = (resource: Omit<Resource, 'id'>) => {
    const newResource: Resource = {
      ...resource,
      id: Date.now().toString()
    };
    setResources(prev => [...prev, newResource]);
  };

  const addProject = (project: Omit<Project, 'id'>) => {
    const newProject: Project = {
      ...project,
      id: Date.now().toString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateAssignment = (id: string, updates: Partial<Assignment>) => {
    setAssignments(prev => 
      prev.map(assignment => 
        assignment.id === id ? { ...assignment, ...updates } : assignment
      )
    );
  };

  const updateProject = (id: string, updates: Partial<Project>) => {
    setProjects(prev => 
      prev.map(project => 
        project.id === id ? { ...project, ...updates } : project
      )
    );
  };

  const deleteAssignment = (id: string) => {
    setAssignments(prev => prev.filter(assignment => assignment.id !== id));
  };

  const deleteResource = (id: string) => {
    setResources(prev => prev.filter(resource => resource.id !== id));
  };

  const deleteProject = (id: string) => {
    setProjects(prev => prev.filter(project => project.id !== id));
  };

  return (
    <DataContext.Provider value={{
      classes,
      assignments,
      resources,
      projects,
      isLoading,
      error,
      addClass,
      addAssignment,
      addResource,
      addProject,
      updateAssignment,
      updateProject,
      deleteAssignment,
      deleteResource,
      deleteProject,
      refreshData
    }}>
      {children}
    </DataContext.Provider>
  );
};