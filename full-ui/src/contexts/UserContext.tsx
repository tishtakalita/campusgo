import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authAPI } from '../services/api';

export type UserRole = 'student' | 'faculty' | 'admin';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
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

interface UserContextType {
  user: User | null;
  isLoading: boolean;
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
  checkAuthStatus: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for stored user on app startup
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      
      // Check if user data is stored locally
      const storedUser = localStorage.getItem('campusgo_user');
      if (storedUser) {
        const userData = JSON.parse(storedUser);
        
        // Verify with backend that user is still valid
        const response = await authAPI.getUserById(userData.id);
        if (!response.error && response.data?.user) {
          // Add computed fields
          const user = response.data.user;
          user.name = `${user.first_name} ${user.last_name}`;
          user.avatar = user.avatar_url;
          
          setUser(user);
        } else {
          // Clear invalid stored data
          localStorage.removeItem('campusgo_user');
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('campusgo_user');
    } finally {
      setIsLoading(false);
    }
  };

  const login = (userData: User) => {
    // Add computed fields
    userData.name = `${userData.first_name} ${userData.last_name}`;
    userData.avatar = userData.avatar_url;
    
    setUser(userData);
    localStorage.setItem('campusgo_user', JSON.stringify(userData));
    console.log('✅ User logged in and stored:', userData.email);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('campusgo_user');
    console.log('✅ User logged out');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      updatedUser.name = `${updatedUser.first_name} ${updatedUser.last_name}`;
      updatedUser.avatar = updatedUser.avatar_url;
      
      setUser(updatedUser);
      localStorage.setItem('campusgo_user', JSON.stringify(updatedUser));
    }
  };

  return (
    <UserContext.Provider value={{ user, isLoading, login, logout, updateUser, checkAuthStatus }}>
      {children}
    </UserContext.Provider>
  );
};