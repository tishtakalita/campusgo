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
        
  <div className="flex flex-nowrap gap-4 w-full overflow-x-auto">
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
                className={`flex-1 basis-0 min-w-[200px] h-full p-4 rounded-2xl border border-white/10 flex items-center gap-4 transition-colors min-h-[88px] ${
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

        {/* Profile Details from Users table */}
        <div className="mt-8 p-4 bg-gray-800 rounded-2xl border border-white/10">
          <h3 className="text-white font-semibold mb-3">Profile Details</h3>
          <div className="divide-y divide-white/10">
            {user?.roll_no && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Roll No</span>
                <span className="text-sm text-white">{user.roll_no}</span>
              </div>
            )}
            {user?.student_id && !user?.roll_no && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Student ID</span>
                <span className="text-sm text-white">{user.student_id}</span>
              </div>
            )}
            {user?.dept && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Department</span>
                <span className="text-sm text-white">{user.dept}</span>
              </div>
            )}
            {user?.class && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Class</span>
                <span className="text-sm text-white">{String((user as any).class)}</span>
              </div>
            )}
            {!user?.class && user?.studentClass && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Class</span>
                <span className="text-sm text-white">{user.studentClass}</span>
              </div>
            )}
            {user?.phone && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Phone</span>
                <span className="text-sm text-white">{user.phone}</span>
              </div>
            )}
            {(user as any)?.cgpa && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">CGPA</span>
                <span className="text-sm text-white">{(user as any).cgpa}</span>
              </div>
            )}
            {!((user as any)?.cgpa) && user?.gpa !== undefined && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">GPA</span>
                <span className="text-sm text-white">{user.gpa}</span>
              </div>
            )}
            {user?.bio && (
              <div className="py-3">
                <div className="text-sm text-gray-400 mb-1">Bio</div>
                <div className="text-sm text-white">{user.bio}</div>
              </div>
            )}
            {user?.last_login && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Last Login</span>
                <span className="text-sm text-white">{new Date(user.last_login).toLocaleString()}</span>
              </div>
            )}
            {user?.created_at && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Created</span>
                <span className="text-sm text-white">{new Date(user.created_at).toLocaleDateString()}</span>
              </div>
            )}
            {user?.updated_at && (
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Updated</span>
                <span className="text-sm text-white">{new Date(user.updated_at).toLocaleDateString()}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}