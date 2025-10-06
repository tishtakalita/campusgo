import { useState } from "react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { DataProvider } from "./contexts/DataContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { Auth } from "./components/Auth";
import { Header } from "./components/Header";
import { Dashboard } from "./components/Dashboard";
import { BottomNav } from "./components/BottomNav";
import { Timetable } from "./components/Timetable";
import { Resources } from "./components/Resources";
import { Profile } from "./components/Profile";
import { Notifications } from "./components/Notifications";
import { Search } from "./components/Search";
import { Projects } from "./components/Projects";
import { Files } from "./components/Files";
import { AssignmentsList } from "./components/AssignmentsList";
import { Ideas } from "./components/Ideas";
import { CreateAssignment } from "./components/CreateAssignment";
import { UploadResource } from "./components/UploadResource";
import { ManageClasses } from "./components/ManageClasses";
import { MonitorProjects } from "./components/MonitorProjects";
import { Calendar } from "./components/Calendar";
import AdminDashboard from "./components/AdminDashboard";
import { Toaster } from "./components/ui/sonner";
import Chat from "./components/Chat";

type ViewType = 'dashboard' | 'timetable' | 'resources' | 'profile' | 'notifications' | 'search' | 'projects' | 'files' | 'ideas' | 'calendar' | 'chat' | 'assignments' | 'create-assignment' | 'upload-resource' | 'manage-classes' | 'monitor-projects';

function AppContent() {
  const { user, isLoading, login } = useUser();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');

  // Show loading screen while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading CampusGo...</p>
        </div>
      </div>
    );
  }

  // If no user is logged in, show auth screen
  if (!user) {
    return <Auth onLogin={login} />;
  }

  // Admin-only: show AdminDashboard and allow navigating to profile/notifications without bottom nav
  if (user.role === 'admin') {
    if (currentView === 'profile') {
      return (
        <div className="min-h-screen bg-gray-900">
          <Profile onBack={() => setCurrentView('dashboard')} />
        </div>
      );
    }
    if (currentView === 'notifications') {
      return (
        <div className="min-h-screen bg-gray-900">
          <Notifications onBack={() => setCurrentView('dashboard')} />
        </div>
      );
    }
    return <AdminDashboard onBack={() => { /* no-op for admin root */ }} onNavigate={(v: string) => setCurrentView(v as ViewType)} />;
  }

  // Faculty-specific views
  if (user.role === 'faculty') {
    if (currentView === 'create-assignment') {
      return <CreateAssignment onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'upload-resource') {
      return <UploadResource onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'manage-classes') {
      return <ManageClasses onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'monitor-projects') {
      return <MonitorProjects onBack={() => setCurrentView('dashboard')} />;
    }

    if (currentView === 'profile') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <Profile onBack={() => setCurrentView('dashboard')} />
          <BottomNav 
            onHomeClick={() => setCurrentView('dashboard')}
            onResourcesClick={() => setCurrentView('resources')}
            onChatClick={() => setCurrentView('chat')}
            onProjectsClick={() => setCurrentView('projects')}
            showProjects={false}
            currentView={currentView}
          />
        </div>
      );
    }

    if (currentView === 'notifications') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <Notifications onBack={() => setCurrentView('dashboard')} />
          <BottomNav 
            onHomeClick={() => setCurrentView('dashboard')}
            onResourcesClick={() => setCurrentView('resources')}
            onChatClick={() => setCurrentView('chat')}
            onProjectsClick={() => setCurrentView('projects')}
            showProjects={false}
            currentView={currentView}
          />
        </div>
      );
    }

    if (currentView === 'timetable') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <Timetable onBack={() => setCurrentView('dashboard')} />
          <BottomNav 
            onHomeClick={() => setCurrentView('dashboard')}
            onResourcesClick={() => setCurrentView('resources')}
            onChatClick={() => setCurrentView('chat')}
            onProjectsClick={() => setCurrentView('projects')}
            showProjects={false}
            currentView={currentView}
          />
        </div>
      );
    }

    if (currentView === 'resources') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <Resources 
            onBack={() => setCurrentView('dashboard')} 
            onUploadResource={() => setCurrentView('upload-resource')}
          />
          <BottomNav 
            onHomeClick={() => setCurrentView('dashboard')}
            onResourcesClick={() => setCurrentView('resources')}
            onChatClick={() => setCurrentView('chat')}
            onProjectsClick={() => setCurrentView('projects')}
            showProjects={false}
            currentView={currentView}
          />
        </div>
      );
    }

    // NEW: Faculty - Assignments list
    if (currentView === 'assignments') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <AssignmentsList 
            onBack={() => setCurrentView('dashboard')} 
            onCreate={() => setCurrentView('create-assignment')} 
          />
          <BottomNav 
            onHomeClick={() => setCurrentView('dashboard')}
            onResourcesClick={() => setCurrentView('resources')}
            onChatClick={() => setCurrentView('chat')}
            onProjectsClick={() => setCurrentView('projects')}
            showProjects={false}
            currentView={currentView}
          />
        </div>
      );
    }

    // NEW: Faculty - Calendar (Events)
    if (currentView === 'calendar') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <Calendar onNavigate={(view: string) => setCurrentView(view as ViewType)} />
          <BottomNav 
            onHomeClick={() => setCurrentView('dashboard')}
            onResourcesClick={() => setCurrentView('resources')}
            onChatClick={() => setCurrentView('chat')}
            onProjectsClick={() => setCurrentView('projects')}
            showProjects={false}
            currentView={currentView}
          />
        </div>
      );
    }

    if (currentView === 'chat') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <Chat />
          <BottomNav 
            onHomeClick={() => setCurrentView('dashboard')}
            onResourcesClick={() => setCurrentView('resources')}
            onChatClick={() => setCurrentView('chat')}
            onProjectsClick={() => setCurrentView('projects')}
            showProjects={false}
            currentView={currentView}
          />
        </div>
      );
    }

    // Faculty Dashboard should mirror Student Dashboard (Projects tab hidden)
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Header 
          userName={user.name || 'Faculty'}
          userAvatar={user.avatar || ''}
          onNotificationsClick={() => setCurrentView('notifications')}
          onProfileClick={() => setCurrentView('profile')}
        />

        <Dashboard onNavigate={(view: string) => setCurrentView(view as ViewType)} />

        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          showProjects={false}
          currentView={currentView}
        />
      </div>
    );
  }

  // Student views

  // Handle different views for students
  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Profile onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'notifications') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Notifications onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Search onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'projects') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Projects onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'files') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Files onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'ideas') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Ideas onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'calendar') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Calendar onNavigate={(view: string) => setCurrentView(view as ViewType)} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'assignments') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <AssignmentsList onBack={() => setCurrentView('dashboard')} onCreate={() => setCurrentView('create-assignment')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'chat') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Chat />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'timetable') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Timetable onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  if (currentView === 'resources') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Resources onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onHomeClick={() => setCurrentView('dashboard')}
          onResourcesClick={() => setCurrentView('resources')}
          onChatClick={() => setCurrentView('chat')}
          onProjectsClick={() => setCurrentView('projects')}
          currentView={currentView}
        />
      </div>
    );
  }

  // Student Dashboard with Enhanced Data Flow
  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header 
        userName={user.name || 'Student'}
        userAvatar={user.avatar || ''}
        onNotificationsClick={() => setCurrentView('notifications')}
        onProfileClick={() => setCurrentView('profile')}
      />
      
      <Dashboard onNavigate={(view: string) => setCurrentView(view as ViewType)} />
      
      <BottomNav 
        onHomeClick={() => setCurrentView('dashboard')}
        onResourcesClick={() => setCurrentView('resources')}
        onChatClick={() => setCurrentView('chat')}
        onProjectsClick={() => setCurrentView('projects')}
        currentView={currentView}
      />
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <DataProvider>
        <DashboardProvider>
          <AppContent />
          <Toaster position="top-right" richColors />
        </DashboardProvider>
      </DataProvider>
    </UserProvider>
  );
}