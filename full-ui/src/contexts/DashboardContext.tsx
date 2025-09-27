import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { dashboardAPI, Assignment, Class, User } from '../services/api';

export interface DashboardStats {
  enrollments_count: number;
  submissions_count: number;
  upcoming_assignments: number;
  completed_assignments: number;
}

export interface TodayOverview {
  today_classes: Class[];
  due_today: Assignment[];
  current_class: Class | null;
  next_class: Class | null;
}

export interface DashboardData {
  current_session: any;
  recent_classes: Class[];
  recent_assignments: Assignment[];
  user_stats?: DashboardStats;
  today_overview?: TodayOverview;
  upcoming_deadlines: Assignment[];
}

interface DashboardContextType {
  dashboardData: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  refreshDashboard: () => Promise<void>;
  getTodayOverview: () => Promise<TodayOverview | null>;
  getUpcomingDeadlines: () => Promise<Assignment[]>;
  getUserStats: (userId: string) => Promise<DashboardStats | null>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

interface DashboardProviderProps {
  children: ReactNode;
}

export const DashboardProvider: React.FC<DashboardProviderProps> = ({ children }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load dashboard data on component mount
  useEffect(() => {
    refreshDashboard();
  }, []);

  const refreshDashboard = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔄 Loading dashboard data...');
      
      // Load main dashboard data
      const dashboardResponse = await dashboardAPI.getDashboard();
      
      if (dashboardResponse.error) {
        console.error('Dashboard API error:', dashboardResponse.error);
        setError(dashboardResponse.error);
        return;
      }

      // Load additional dashboard components in parallel
      const [todayOverviewResponse, upcomingDeadlinesResponse] = await Promise.all([
        dashboardAPI.getTodayOverview().catch(err => {
          console.warn('Today overview failed:', err);
          return { data: null, error: err.message };
        }),
        dashboardAPI.getUpcomingDeadlines().catch(err => {
          console.warn('Upcoming deadlines failed:', err);
          return { data: { assignments: [] }, error: err.message };
        })
      ]);

      const newDashboardData: DashboardData = {
        current_session: dashboardResponse.data?.current_session || null,
        recent_classes: dashboardResponse.data?.recent_classes || [],
        recent_assignments: dashboardResponse.data?.recent_assignments || [],
        user_stats: dashboardResponse.data?.user_stats,
        today_overview: todayOverviewResponse.data || undefined,
        upcoming_deadlines: upcomingDeadlinesResponse.data?.assignments || []
      };

      setDashboardData(newDashboardData);
      
      console.log('✅ Dashboard data loaded successfully');
      console.log('📊 Dashboard Summary:');
      console.log(`   - Recent Classes: ${newDashboardData.recent_classes.length}`);
      console.log(`   - Recent Assignments: ${newDashboardData.recent_assignments.length}`);
      console.log(`   - Upcoming Deadlines: ${newDashboardData.upcoming_deadlines.length}`);
      console.log(`   - Today's Classes: ${newDashboardData.today_overview?.today_classes.length || 0}`);
      console.log(`   - Due Today: ${newDashboardData.today_overview?.due_today.length || 0}`);
      
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  const getTodayOverview = async (): Promise<TodayOverview | null> => {
    try {
      const response = await dashboardAPI.getTodayOverview();
      if (response.error) {
        console.error('Today overview error:', response.error);
        return null;
      }
      return response.data || null;
    } catch (err) {
      console.error('Error getting today overview:', err);
      return null;
    }
  };

  const getUpcomingDeadlines = async (): Promise<Assignment[]> => {
    try {
      const response = await dashboardAPI.getUpcomingDeadlines();
      if (response.error) {
        console.error('Upcoming deadlines error:', response.error);
        return [];
      }
      return response.data?.assignments || [];
    } catch (err) {
      console.error('Error getting upcoming deadlines:', err);
      return [];
    }
  };

  const getUserStats = async (userId: string): Promise<DashboardStats | null> => {
    try {
      const response = await dashboardAPI.getStudentStats(userId);
      if (response.error) {
        console.error('User stats error:', response.error);
        return null;
      }
      return response.data || null;
    } catch (err) {
      console.error('Error getting user stats:', err);
      return null;
    }
  };

  const contextValue: DashboardContextType = {
    dashboardData,
    isLoading,
    error,
    refreshDashboard,
    getTodayOverview,
    getUpcomingDeadlines,
    getUserStats
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
};