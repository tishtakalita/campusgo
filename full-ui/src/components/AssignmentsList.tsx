import React, { useState, useEffect } from "react";
import { ArrowLeft, Plus, Pencil, Trash2, X } from "lucide-react";
import { assignmentsAPI, Assignment, directoryAPI } from "../services/api";
import { useUser } from "../contexts/UserContext";
import { AssignmentCard } from "./AssignmentCard";

interface AssignmentsListProps {
  onBack?: () => void;
  onCreate?: () => void;
}

export function AssignmentsList({ onBack, onCreate }: AssignmentsListProps) {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<Assignment | null>(null);
  // Keep edit data aligned to minimal schema: title, description, due_date, class (and optionally course_id)
  const [editData, setEditData] = useState<Partial<Pick<Assignment, 'title' | 'description' | 'due_date' | 'course_id' | 'class'>>>({});
  // Class list for picker
  const [classGroups, setClassGroups] = useState<Array<{ id: string; academic_year?: string; section?: string; dept?: string; class?: string }>>([]);
  const [loadingClasses, setLoadingClasses] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    loadAssignments();
    // Preload class list for the edit modal
    const loadClasses = async () => {
      setLoadingClasses(true);
      try {
        const res = await directoryAPI.listClasses();
        if (!res.error && res.data?.classes) {
          setClassGroups(res.data.classes as any);
        }
      } finally {
        setLoadingClasses(false);
      }
    };
    loadClasses();
  }, []);

  const loadAssignments = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Always load consolidated assignments list; backend scopes for faculty by courses
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
            <div className="text-gray-400 flex items-center gap-3">
              <span>
                {assignments.length} assignment{assignments.length !== 1 ? 's' : ''} found
              </span>
              {/* Removed My assignments toggle for faculty */}
            </div>
          </div>
        </div>
        {user?.role === 'faculty' && (
          <button
            onClick={() => {
              if (onCreate) onCreate();
              else alert('Use the Create Assignment screen from Dashboard quick actions.');
            }}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Create
          </button>
        )}
      </div>

      {/* Assignment groups */}
      {Object.entries(groupedAssignments).map(([status, statusAssignments]) => (
        <div key={status} className="space-y-4">
          <h2 className="text-lg font-semibold text-white capitalize">
            {status.replace('_', ' ')} ({statusAssignments.length})
          </h2>
          
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {statusAssignments.map((assignment) => {
              const isOwner = user?.id && assignment.created_by === user.id;
              return (
                <div key={assignment.id} className="relative">
                  <AssignmentCard
                    assignment={assignment}
                    onClick={() => handleAssignmentClick(assignment)}
                  />
                  {isOwner && (
                    <div className="absolute top-2 right-2 flex gap-2">
                      <button
                        onClick={() => {
                          setEditing(assignment);
                          setEditData({
                            title: assignment.title,
                            description: assignment.description,
                            due_date: assignment.due_date,
                            class: assignment.class,
                          });
                        }}
                        className="px-2 py-1 bg-gray-800/80 hover:bg-gray-700 text-gray-200 rounded-lg text-xs backdrop-blur"
                        title="Edit"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={async () => {
                          if (!confirm('Delete this assignment?')) return;
                          const resp = await assignmentsAPI.deleteAssignment(assignment.id);
                          if (resp.error) { alert(resp.error); return; }
                          setAssignments(prev => prev.filter(a => a.id !== assignment.id));
                        }}
                        className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs"
                        title="Delete"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
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

      {editing && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 w-full max-w-xl rounded-2xl border border-white/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Edit Assignment</h3>
              <button onClick={() => setEditing(null)} className="text-gray-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-300 mb-1">Title</label>
                <input value={editData.title || ''} onChange={e=>setEditData({...editData, title: e.target.value})} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm text-gray-300 mb-1">Description</label>
                <textarea value={editData.description || ''} onChange={e=>setEditData({...editData, description: e.target.value})} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" rows={3} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Due Date</label>
                  <input type="date" value={(editData.due_date || '').slice(0,10)} onChange={e=>setEditData({...editData, due_date: e.target.value})} className="w-full bg-gray-700 text-white rounded-lg px-3 py-2" />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Class</label>
                  <select
                    value={editData.class || ''}
                    onChange={e => setEditData({ ...editData, class: e.target.value || undefined })}
                    className="w-full bg-gray-700 text-white rounded-lg px-3 py-2"
                  >
                    {loadingClasses && <option value="" disabled>Loading…</option>}
                    {!loadingClasses && classGroups.map((cg) => {
                      const label = `${cg.dept || ''} ${cg.class || ''}${cg.section ? ` - ${cg.section}` : ''}`.trim();
                      const code = cg.class || '';
                      return (
                        <option key={cg.id} value={code}>{label}</option>
                      );
                    })}
                  </select>
                </div>
              </div>
              {/* Removed Type and Priority fields to align with minimal schema */}
              <div className="flex justify-end gap-2 pt-2">
                <button onClick={()=>setEditing(null)} className="px-4 py-2 bg-gray-700 rounded-lg text-gray-200">Cancel</button>
                <button
                  onClick={async ()=>{
                    if (!editing) return;
                    // Only send allowed fields per minimal schema
                    const payload: any = {
                      ...(editData.title !== undefined ? { title: editData.title } : {}),
                      ...(editData.description !== undefined ? { description: editData.description } : {}),
                      ...(editData.due_date !== undefined ? { due_date: editData.due_date } : {}),
                      ...(editData.class !== undefined ? { class: editData.class } : {}),
                    };
                    const resp = await assignmentsAPI.updateAssignment(editing.id, payload);
                    if (resp.error) { alert(resp.error); return; }
                    setAssignments(prev => prev.map(a => a.id === editing.id ? { ...a, ...payload } : a));
                    setEditing(null);
                  }}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}