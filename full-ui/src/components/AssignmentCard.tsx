import React from "react";
import { Book, Calendar, AlertTriangle, AlertCircle, CheckCircle, Clock, FileText, Trophy } from "lucide-react";
import { Assignment } from "../services/api";

interface AssignmentCardProps {
  assignment: Assignment;
  onClick?: () => void;
}

export function AssignmentCard({ assignment, onClick }: AssignmentCardProps) {
  const getPriorityConfig = () => {
    switch (assignment.priority) {
      case 'high':
        return {
          colors: 'from-red-600 to-red-500',
          borderColor: 'border-red-600',
          icon: AlertTriangle,
          label: 'High Priority'
        };
      case 'medium':
        return {
          colors: 'from-orange-600 to-yellow-500',
          borderColor: 'border-orange-600',
          icon: AlertCircle,
          label: 'Medium Priority'
        };
      case 'low':
        return {
          colors: 'from-green-600 to-emerald-500',
          borderColor: 'border-green-600',
          icon: CheckCircle,
          label: 'Low Priority'
        };
      default:
        return {
          colors: 'from-gray-600 to-gray-500',
          borderColor: 'border-gray-600',
          icon: AlertCircle,
          label: 'Priority'
        };
    }
  };

  const getStatusConfig = () => {
    switch (assignment.status) {
      case 'overdue':
        return {
          text: 'Overdue',
          className: 'text-red-400 bg-red-400/10',
          icon: AlertTriangle
        };
      case 'due_soon':
        return {
          text: 'Due Soon',
          className: 'text-yellow-400 bg-yellow-400/10',
          icon: Clock
        };
      case 'upcoming':
        return {
          text: 'Upcoming',
          className: 'text-blue-400 bg-blue-400/10',
          icon: Calendar
        };
      case 'completed':
        return {
          text: 'Completed',
          className: 'text-green-400 bg-green-400/10',
          icon: CheckCircle
        };
      default:
        return {
          text: 'Unknown',
          className: 'text-gray-400 bg-gray-400/10',
          icon: AlertCircle
        };
    }
  };

  const getTypeIcon = () => {
    switch (assignment.assignment_type) {
      case 'project':
        return Trophy;
      case 'lab':
        return FileText;
      case 'homework':
        return Book;
      default:
        return Book;
    }
  };

  const config = getPriorityConfig();
  const statusConfig = getStatusConfig();
  const IconComponent = config.icon;
  const StatusIcon = statusConfig.icon;
  const TypeIcon = getTypeIcon();

  // Format due date
  const formatDueDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    const isTomorrow = date.toDateString() === new Date(now.getTime() + 24 * 60 * 60 * 1000).toDateString();
    
    if (isToday) return 'Today';
    if (isTomorrow) return 'Tomorrow';
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  return (
    <button className="w-full text-left group" onClick={onClick}>
      <div className="bg-gray-800 rounded-2xl border border-white/10 overflow-hidden shadow-lg hover:shadow-xl transition-all duration-200 group-hover:border-white/20 relative">
        <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${config.colors}`}></div>
        
        <div className="p-4">
          {/* Header with title, type, and status */}
          <div className="flex items-start mb-3 gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <TypeIcon size={14} className="text-gray-400" />
                <span className="text-gray-400 text-xs uppercase tracking-wide font-semibold">
                  {assignment.assignment_type}
                </span>
                <div className={`px-2 py-1 rounded-full text-xs font-medium ${statusConfig.className}`}>
                  {statusConfig.text}
                </div>
              </div>
              <h3 className="text-white font-semibold text-base leading-snug mb-2">{assignment.title}</h3>
              {(assignment.course_name || assignment.course_code) && (
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <Book size={11} className="text-gray-500" />
                  </div>
                  <span className="text-gray-400 text-sm font-medium">
                    {[assignment.course_name, assignment.course_code].filter(Boolean).join(' ')}
                  </span>
                </div>
              )}
            </div>
          </div>
          
          {/* Footer with due date and points */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gray-700/50 flex items-center justify-center">
                  <Calendar size={12} className="text-gray-500" />
                </div>
                <span className="text-gray-300 text-sm font-medium">
                  Due {formatDueDate(assignment.due_date)}
                  {assignment.days_until_due !== undefined && assignment.days_until_due >= 0 && (
                    <span className="text-gray-500 ml-1">
                      ({assignment.days_until_due} day{assignment.days_until_due !== 1 ? 's' : ''})
                    </span>
                  )}
                </span>
              </div>
              
              <div className="flex items-center gap-1">
                <Trophy size={12} className="text-yellow-500" />
                <span className="text-gray-300 text-sm font-medium">{assignment.total_points} pts</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}