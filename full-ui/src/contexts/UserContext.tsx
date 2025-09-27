import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  login: (user: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
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

  const login = (userData: User) => {
    setUser(userData);
  };

  const logout = () => {
    setUser(null);
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};