import React, { useState } from "react";
import { UserProvider, useUser } from "./contexts/UserContext";
import { DataProvider, useData } from "./contexts/DataContext";
import { DashboardProvider } from "./contexts/DashboardContext";
import { Auth } from "./components/Auth";
import { Header } from "./components/Header";
import { CurrentClass } from "./components/CurrentClass";
import { AssignmentCard } from "./components/AssignmentCard";
import { Dashboard } from "./components/Dashboard";
import { QuickAccess } from "./components/QuickAccess";
import { BottomNav } from "./components/BottomNav";
import { Timetable } from "./components/Timetable";
import { Resources } from "./components/Resources";
import { AIChat } from "./components/AIChat";
import { Profile } from "./components/Profile";
import { Notifications } from "./components/Notifications";
import { Search } from "./components/Search";
import { Projects } from "./components/Projects";
import { Files } from "./components/Files";
import { Ideas } from "./components/Ideas";
import { FacultyDashboard } from "./components/FacultyDashboard";
import { CreateAssignment } from "./components/CreateAssignment";
import { UploadResource } from "./components/UploadResource";
import { ManageClasses } from "./components/ManageClasses";
import { MonitorProjects } from "./components/MonitorProjects";

type ViewType = 'dashboard' | 'timetable' | 'resources' | 'profile' | 'notifications' | 'search' | 'projects' | 'files' | 'ideas' | 'create-assignment' | 'upload-resource' | 'manage-classes' | 'monitor-projects';

function AppContent() {
  const { user, login } = useUser();
  const { assignments } = useData();
  const [currentView, setCurrentView] = useState<ViewType>('dashboard');
  const [showChat, setShowChat] = useState(false);

  // If no user is logged in, show auth screen
  if (!user) {
    return <Auth onLogin={login} />;
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
        <div className="min-h-screen bg-gray-900">
          <Profile onBack={() => setCurrentView('dashboard')} />
          {showChat && <AIChat onClose={() => setShowChat(false)} />}
        </div>
      );
    }

    if (currentView === 'notifications') {
      return (
        <div className="min-h-screen bg-gray-900">
          <Notifications onBack={() => setCurrentView('dashboard')} />
          {showChat && <AIChat onClose={() => setShowChat(false)} />}
        </div>
      );
    }

    if (currentView === 'timetable') {
      return (
        <div className="min-h-screen bg-gray-900 pb-20">
          <Timetable onBack={() => setCurrentView('dashboard')} />
          <BottomNav 
            onChatClick={() => setShowChat(true)}
            onHomeClick={() => setCurrentView('dashboard')}
            onTimetableClick={() => setCurrentView('timetable')}
            onFilesClick={() => setCurrentView('files')}
            onIdeasClick={() => setCurrentView('ideas')}
            currentView={currentView}
          />
          {showChat && <AIChat onClose={() => setShowChat(false)} />}
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
            onChatClick={() => setShowChat(true)}
            onHomeClick={() => setCurrentView('dashboard')}
            onTimetableClick={() => setCurrentView('timetable')}
            onFilesClick={() => setCurrentView('files')}
            onIdeasClick={() => setCurrentView('ideas')}
            currentView={currentView}
          />
          {showChat && <AIChat onClose={() => setShowChat(false)} />}
        </div>
      );
    }

    // Faculty Dashboard
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Header 
          userName={user.name}
          userAvatar={user.avatar}
          onSearchClick={() => setCurrentView('search')}
          onNotificationsClick={() => setCurrentView('notifications')}
          onProfileClick={() => setCurrentView('profile')}
        />
        
        <div className="px-5 mb-6">
          <FacultyDashboard onNavigate={setCurrentView} />
        </div>
        
        <BottomNav 
          onChatClick={() => setShowChat(true)}
          onHomeClick={() => setCurrentView('dashboard')}
          onTimetableClick={() => setCurrentView('timetable')}
          onFilesClick={() => setCurrentView('files')}
          onIdeasClick={() => setCurrentView('ideas')}
          currentView={currentView}
        />
        
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  // Student views (using real assignment data from DataContext)

  // Handle different views for students
  if (currentView === 'profile') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Profile onBack={() => setCurrentView('dashboard')} />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  if (currentView === 'notifications') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Notifications onBack={() => setCurrentView('dashboard')} />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  if (currentView === 'search') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Search onBack={() => setCurrentView('dashboard')} />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  if (currentView === 'projects') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Projects onBack={() => setCurrentView('dashboard')} />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  if (currentView === 'files') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Files onBack={() => setCurrentView('dashboard')} />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  if (currentView === 'ideas') {
    return (
      <div className="min-h-screen bg-gray-900">
        <Ideas onBack={() => setCurrentView('dashboard')} />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  if (currentView === 'timetable') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Timetable onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onChatClick={() => setShowChat(true)}
          onHomeClick={() => setCurrentView('dashboard')}
          onTimetableClick={() => setCurrentView('timetable')}
          onFilesClick={() => setCurrentView('files')}
          onIdeasClick={() => setCurrentView('ideas')}
          currentView={currentView}
        />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  if (currentView === 'resources') {
    return (
      <div className="min-h-screen bg-gray-900 pb-20">
        <Resources onBack={() => setCurrentView('dashboard')} />
        <BottomNav 
          onChatClick={() => setShowChat(true)}
          onHomeClick={() => setCurrentView('dashboard')}
          onTimetableClick={() => setCurrentView('timetable')}
          onFilesClick={() => setCurrentView('files')}
          onIdeasClick={() => setCurrentView('ideas')}
          currentView={currentView}
        />
        {showChat && <AIChat onClose={() => setShowChat(false)} />}
      </div>
    );
  }

  // Student Dashboard with Enhanced Data Flow
  return (
    <div className="min-h-screen bg-gray-900 pb-20">
      <Header 
        userName={user.name}
        userAvatar={user.avatar}
        onSearchClick={() => setCurrentView('search')}
        onNotificationsClick={() => setCurrentView('notifications')}
        onProfileClick={() => setCurrentView('profile')}
      />
      
      <Dashboard onNavigate={setCurrentView} />
      
      <QuickAccess 
        onTimetableClick={() => setCurrentView('timetable')} 
        onResourcesClick={() => setCurrentView('resources')}
        onChatClick={() => setShowChat(true)}
        onProjectsClick={() => setCurrentView('projects')}
      />
      
      <BottomNav 
        onChatClick={() => setShowChat(true)}
        onHomeClick={() => setCurrentView('dashboard')}
        onTimetableClick={() => setCurrentView('timetable')}
        onFilesClick={() => setCurrentView('files')}
        onIdeasClick={() => setCurrentView('ideas')}
        currentView={currentView}
      />
      
      {showChat && <AIChat onClose={() => setShowChat(false)} />}
    </div>
  );
}

export default function App() {
  return (
    <UserProvider>
      <DataProvider>
        <DashboardProvider>
          <AppContent />
        </DashboardProvider>
      </DataProvider>
    </UserProvider>
  );
}