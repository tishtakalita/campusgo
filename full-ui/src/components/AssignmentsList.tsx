import React, { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { assignmentsAPI, Assignment } from "../services/api";
import { AssignmentCard } from "./AssignmentCard";

interface AssignmentsListProps {
  onBack?: () => void;
}

export function AssignmentsList({ onBack }: AssignmentsListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await assignmentsAPI.getAllAssignments();

      if (response.error) {
        setError(response.error);
        setAssignments([]);
      } else {
        setAssignments(response.data?.assignments || []);
      }
    } catch (err) {
      setError('Failed to load assignments');
      console.error('Error loading assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    console.log('Assignment clicked:', assignment);
    // Here you would typically navigate to assignment details
    // or open a modal with more information
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-gray-400">Loading assignments...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-64">
        <div className="text-red-400">Error: {error}</div>
      </div>
    );
  }

  // Group assignments by status for better organization
  const groupedAssignments = assignments.reduce((groups, assignment) => {
    const status = assignment.status || 'upcoming';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(assignment);
    return groups;
  }, {} as Record<string, Assignment[]>);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => (onBack ? onBack() : window.history.back())}
            className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
            aria-label="Back"
          >
            <ArrowLeft size={20} className="text-white" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white">Assignments</h1>
            <p className="text-gray-400">
              {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} found
            </p>
          </div>
        </div>
      </div>

      {/* Assignment groups */}
      {Object.entries(groupedAssignments).map(([status, statusAssignments]) => (
        <div key={status} className="space-y-4">
          <h2 className="text-lg font-semibold text-white capitalize">
            {status.replace('_', ' ')} ({statusAssignments.length})
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statusAssignments.map((assignment) => (
              <AssignmentCard
                key={assignment.id}
                assignment={assignment}
                onClick={() => handleAssignmentClick(assignment)}
              />
            ))}
          </div>
        </div>
      ))}

      {assignments.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg">No assignments found</div>
          <div className="text-gray-500 text-sm mt-2">
            Try changing the filter or check back later
          </div>
        </div>
      )}

      {/* Debug info removed */}
    </div>
  );
}