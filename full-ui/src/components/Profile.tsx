import React from "react";
import { ArrowLeft, User, Settings, Bell, HelpCircle, LogOut, GraduationCap, Users, Shield } from "lucide-react";
import { useUser } from "../contexts/UserContext";

interface ProfileProps {
  onBack: () => void;
}

export function Profile({ onBack }: ProfileProps) {
  const { user, logout } = useUser();

  const handleLogout = () => {
    logout();
  };

  const getRoleIcon = () => {
    switch (user?.role) {
      case 'student':
        return GraduationCap;
      case 'faculty':
        return Users;
      case 'admin':
        return Shield;
      default:
        return User;
    }
  };

  const getRoleLabel = () => {
    switch (user?.role) {
      case 'student':
        return 'Student';
      case 'faculty':
        return 'Faculty';
      case 'admin':
        return 'Administrator';
      default:
        return 'User';
    }
  };

  const RoleIcon = getRoleIcon();

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="px-5 py-4 border-b border-white/10">
        <button 
          onClick={onBack}
          className="flex items-center gap-3 mb-4"
        >
          <ArrowLeft size={20} className="text-white" />
          <h1 className="text-white text-xl font-bold">Profile</h1>
        </button>
      </div>
      
      <div className="p-5">
        <div className="text-center mb-8">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-gradient-to-r from-blue-600 to-blue-500 mx-auto mb-4 flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <User size={32} className="text-white" />
            )}
          </div>
          <h2 className="text-white text-2xl font-bold mb-1">{user?.name || 'User'}</h2>
          <div className="flex items-center justify-center gap-2 mb-2">
            <RoleIcon size={16} className="text-gray-400" />
            <p className="text-gray-400">{getRoleLabel()}</p>
          </div>
          <p className="text-gray-500 text-sm">{user?.email}</p>
          {user?.role === 'student' && user?.studentClass && (
            <p className="text-gray-500 text-sm">{user.studentClass}</p>
          )}
          {user?.role === 'faculty' && user?.facultySubjects && (
            <p className="text-gray-500 text-sm">{user.facultySubjects.length} subjects</p>
          )}
        </div>
        
        <div className="space-y-4">
          {[
            { icon: Settings, label: "Settings", desc: "Manage your preferences", action: () => {} },
            { icon: Bell, label: "Notifications", desc: "Customize alerts", action: () => {} },
            { icon: HelpCircle, label: "Help & Support", desc: "Get assistance", action: () => {} },
            { icon: LogOut, label: "Sign Out", desc: "Logout from app", action: handleLogout, isLogout: true }
          ].map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button 
                key={index} 
                onClick={item.action}
                className={`w-full p-4 rounded-2xl border border-white/10 flex items-center gap-4 transition-colors ${
                  item.isLogout 
                    ? 'bg-red-600/10 hover:bg-red-600/20' 
                    : 'bg-gray-800 hover:bg-gray-700'
                }`}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.isLogout ? 'bg-red-600/20' : 'bg-gray-700'
                }`}>
                  <IconComponent size={18} className={item.isLogout ? 'text-red-400' : 'text-gray-300'} />
                </div>
                <div className="flex-1 text-left">
                  <h3 className={`font-semibold ${item.isLogout ? 'text-red-400' : 'text-white'}`}>
                    {item.label}
                  </h3>
                  <p className="text-gray-400 text-sm">{item.desc}</p>
                </div>
              </button>
            );
          })}
        </div>

        {/* User Statistics */}
        {user?.role === 'faculty' && (
          <div className="mt-8 p-4 bg-gray-800 rounded-2xl border border-white/10">
            <h3 className="text-white font-semibold mb-3">Teaching Statistics</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">{user?.facultySubjects?.length || 0}</p>
                <p className="text-sm text-gray-400">Subjects</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-green-400">25</p>
                <p className="text-sm text-gray-400">Students</p>
              </div>
            </div>
          </div>
        )}

        {user?.role === 'student' && (
          <div className="mt-8 p-4 bg-gray-800 rounded-2xl border border-white/10">
            <h3 className="text-white font-semibold mb-3">Academic Progress</h3>
            <div className="grid grid-cols-2 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-blue-400">6</p>
                <p className="text-sm text-gray-400">Courses</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-400">85%</p>
                <p className="text-sm text-gray-400">Avg. Grade</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}