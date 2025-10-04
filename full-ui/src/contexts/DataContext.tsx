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

// Legacy interfaces for backward compatibility
export interface LegacyClass {
  id: string;
  name: string;
  code: string;
  instructor: string;
  room: string;
  schedule: {
    day: string;
    startTime: string;
    endTime: string;
  }[];
  students: string[];
}

export interface LegacyAssignment {
  id: string;
  title: string;
  description: string;
  subject: string;
  classId: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  submittedBy: string[];
}

interface DataContextType {
  classes: LegacyClass[];
  assignments: LegacyAssignment[];
  resources: Resource[];
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  addClass: (classData: Omit<LegacyClass, 'id'>) => void;
  addAssignment: (assignment: Omit<LegacyAssignment, 'id'>) => void;
  addResource: (resource: Omit<Resource, 'id'>) => void;
  addProject: (project: Omit<Project, 'id'>) => void;
  updateAssignment: (id: string, updates: Partial<LegacyAssignment>) => void;
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

  // Data states - initialize empty, will be populated from API  
  const [classes, setClasses] = useState<LegacyClass[]>([]);
  const [assignments, setAssignments] = useState<LegacyAssignment[]>([]);

  // Load data from API on component mount
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading initial data from API...');
      
      // Load all data in parallel
      const [classesResponse, assignmentsResponse, resourcesResponse, projectsResponse] = await Promise.all([
        classesAPI.getAllClasses().catch(err => ({ error: err.message, data: null })),
        assignmentsAPI.getAllAssignments().catch(err => ({ error: err.message, data: null })),
        resourcesAPI.getAllResources().catch(err => ({ error: err.message, data: null })),
        projectsAPI.getAllProjects().catch(err => ({ error: err.message, data: null }))
      ]);

      let hasErrors = false;
      let loadedCount = 0;

      // Handle classes
      if (!classesResponse.error && classesResponse.data?.classes) {
        const transformedClasses = transformApiClasses(classesResponse.data.classes);
        setClasses(transformedClasses);
        loadedCount++;
        console.log(`✅ Loaded ${transformedClasses.length} classes`);
      } else {
        console.warn('❌ Failed to load classes:', classesResponse.error);
        hasErrors = true;
      }

      // Handle assignments
      if (!assignmentsResponse.error && assignmentsResponse.data?.assignments) {
        const transformedAssignments = transformApiAssignments(assignmentsResponse.data.assignments);
        setAssignments(transformedAssignments);
        loadedCount++;
        console.log(`✅ Loaded ${transformedAssignments.length} assignments`);
      } else {
        console.warn('❌ Failed to load assignments:', assignmentsResponse.error);
        hasErrors = true;
      }

      // Handle resources
      if (!resourcesResponse.error && resourcesResponse.data?.resources) {
        const transformedResources = transformApiResources(resourcesResponse.data.resources);
        setResources(transformedResources);
        loadedCount++;
        console.log(`✅ Loaded ${transformedResources.length} resources`);
      } else {
        console.warn('❌ Failed to load resources:', resourcesResponse.error);
        hasErrors = true;
      }

      // Handle projects
      if (!projectsResponse.error && projectsResponse.data?.projects) {
        const transformedProjects = transformApiProjects(projectsResponse.data.projects);
        setProjects(transformedProjects);
        loadedCount++;
        console.log(`✅ Loaded ${transformedProjects.length} projects`);
      } else {
        console.warn('❌ Failed to load projects:', projectsResponse.error);
        hasErrors = true;
      }

      if (hasErrors && loadedCount === 0) {
        setError('Failed to load data from server. Please check your connection.');
      } else if (hasErrors) {
        setError(`Partially loaded: ${loadedCount}/4 data types loaded successfully.`);
      }

      console.log(`📊 Data loading complete: ${loadedCount}/4 successful`);
      
    } catch (err) {
      console.error('💥 Critical error loading initial data:', err);
      setError('Network error. Please check if the backend server is running.');
    } finally {
      setIsLoading(false);
    }
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
      students: [] // Student list not included in classes API response
    }));
  };

  const transformApiAssignments = (apiAssignments: any[]): LegacyAssignment[] => {
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

  const transformApiResources = (apiResources: any[]): Resource[] => {
    return apiResources.map(apiResource => {
      let resourceType: 'notes' | 'video' | 'link' | 'document' = 'document';
      
      switch (apiResource.resource_type) {
        case 'video':
          resourceType = 'video';
          break;
        case 'link':
          resourceType = 'link';
          break;
        case 'document':
        case 'pdf':
          resourceType = 'notes';
          break;
        default:
          resourceType = 'document';
      }
      
      return {
        id: apiResource.id,
        title: apiResource.title,
        type: resourceType,
        url: apiResource.file_url || apiResource.external_url || '#',
        description: apiResource.description || '',
        classId: apiResource.course_id || '1',
        uploadedBy: apiResource.uploader?.first_name ? 
          `${apiResource.uploader.first_name} ${apiResource.uploader.last_name}` : 
          'Unknown',
        uploadDate: apiResource.created_at ? apiResource.created_at.split('T')[0] : '2025-09-01',
        tags: apiResource.tags || []
      };
    });
  };

  const transformApiProjects = (apiProjects: any[]): Project[] => {
    return apiProjects.map(apiProject => ({
      id: apiProject.id,
      title: apiProject.title,
      description: apiProject.description || '',
      classId: apiProject.course_id || '1',
      assignedTo: [], // Will be populated from project members API
      status: apiProject.status || 'not-started' as 'not-started' | 'in-progress' | 'completed',
      dueDate: apiProject.due_date || '2025-12-31',
      progress: apiProject.status === 'completed' ? 100 : 
                apiProject.status === 'in-progress' ? 50 : 0
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
        const transformedClasses = transformApiClasses(classesResponse.data.classes);
        setClasses(transformedClasses);
      }

      // Handle assignments
      if (assignmentsResponse.error) {
        console.error('Error fetching assignments:', assignmentsResponse.error);
      } else if (assignmentsResponse.data?.assignments) {
        const transformedAssignments = transformApiAssignments(assignmentsResponse.data.assignments);
        setAssignments(transformedAssignments);
      }

      // Handle resources
      if (resourcesResponse.error) {
        console.error('Error fetching resources:', resourcesResponse.error);
      } else if (resourcesResponse.data?.resources) {
        const transformedResources = transformApiResources(resourcesResponse.data.resources);
        setResources(transformedResources);
      }

      // Handle projects
      if (projectsResponse.error) {
        console.error('Error fetching projects:', projectsResponse.error);
      } else if (projectsResponse.data?.projects) {
        const transformedProjects = transformApiProjects(projectsResponse.data.projects);
        setProjects(transformedProjects);
      }

    } catch (err: any) {
      console.error('Error refreshing data:', err);
      setError(err.message || 'Failed to load data');
    } finally {
      setIsLoading(false);
    }
  };

  const [resources, setResources] = useState<Resource[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);

  const addClass = (classData: Omit<LegacyClass, 'id'>) => {
    const newClass: LegacyClass = {
      ...classData,
      id: Date.now().toString()
    };
    setClasses(prev => [...prev, newClass]);
  };

  const addAssignment = (assignment: Omit<LegacyAssignment, 'id'>) => {
    const newAssignment: LegacyAssignment = {
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

  const updateAssignment = (id: string, updates: Partial<LegacyAssignment>) => {
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