import React, { useEffect, useMemo, useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useData } from '../contexts/DataContext';
import { assignmentsAPI, classesAPI, directoryAPI } from '../services/api';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Plus } from 'lucide-react';

interface CreateAssignmentProps {
  onBack: () => void;
}

export const CreateAssignment: React.FC<CreateAssignmentProps> = ({ onBack }) => {
  const { user } = useUser();
  const { addAssignment, refreshData } = useData();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  // Selected Supabase class-group (from 'class' table)
  const [classGroupId, setClassGroupId] = useState('');
  const [dueDate, setDueDate] = useState('');
  // Priority removed from schema; keep internal default for local context compatibility only
  const [priority] = useState<'high' | 'medium' | 'low'>('medium');
  const [submitting, setSubmitting] = useState(false);

  // Class groups fetched from backend /api/class-list
  const [classGroups, setClassGroups] = useState<Array<{ id: string; academic_year?: string; section?: string; dept?: string; class?: string }>>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [deriveError, setDeriveError] = useState<string | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Derived course for the selected class section taught by this faculty
  const [derivedCourseId, setDerivedCourseId] = useState<string | null>(null);
  const [derivedCourseLabel, setDerivedCourseLabel] = useState<string | null>(null);
  const [manualCourseId, setManualCourseId] = useState<string | null>(null);
  const [availableCourses, setAvailableCourses] = useState<Array<{ id: string; label: string }>>([]);

  useEffect(() => {
    // Load class groups from Supabase 'class' table
    const loadClassGroups = async () => {
      setLoadingGroups(true);
      try {
        const res = await directoryAPI.listClasses();
        if (!res.error && res.data?.classes) {
          setClassGroups(res.data.classes as any);
        }
      } finally {
        setLoadingGroups(false);
      }
    };
    loadClassGroups();
  }, []);

  const selectedGroup = useMemo(() => classGroups.find((g) => g.id === classGroupId), [classGroups, classGroupId]);
  const selectedClassCode = selectedGroup?.class || undefined;

  // Whenever classGroup changes, try to derive the course this faculty teaches for that section
  useEffect(() => {
    const deriveCourse = async () => {
  setDeriveError(null);
      setDerivedCourseId(null);
      setDerivedCourseLabel(null);
      setManualCourseId(null);
      setAvailableCourses([]);
      if (!selectedGroup) return;
      const section = (selectedGroup as any).section;
      if (!section) return;
      try {
        // Get all classes for this faculty, then filter by section
        const res = await classesAPI.getAllClasses();
        const all = res.data?.classes || [];
        const norm = (v: any) => String(v ?? '').trim().toLowerCase();
        const target = norm(section);
        const bySection = all.filter((c: any) => norm((c as any).section) === target);
        // Unique courses taught by this faculty to this section
        const uniqueCourses = new Map<string, any>();
        for (const c of bySection) {
          const cid = (c as any).course_id || c.course_id;
          if (cid && !uniqueCourses.has(cid)) {
            uniqueCourses.set(cid, c);
          }
        }
        // Build available courses for manual selection (across all classes this faculty teaches)
        const seen = new Set<string>();
        const coursesForPicker: Array<{ id: string; label: string }> = [];
        for (const c of all) {
          const cid = (c as any).course_id || c.course_id;
          if (cid && !seen.has(cid)) {
            seen.add(cid);
            const label = `${(c as any)?.courses?.name || (c as any)?.name || 'Course'}${(c as any)?.courses?.code ? ` (${(c as any).courses.code})` : ''}`;
            coursesForPicker.push({ id: cid, label });
          }
        }
        setAvailableCourses(coursesForPicker);

        if (uniqueCourses.size === 1) {
          const [cid, cval] = Array.from(uniqueCourses.entries())[0];
          setDerivedCourseId(cid);
          const label = `${(cval as any)?.courses?.name || (cval as any)?.name || 'Course'}${(cval as any)?.courses?.code ? ` (${(cval as any).courses.code})` : ''}`;
          setDerivedCourseLabel(label);
          // Preselect the course in the visible dropdown
          setManualCourseId(cid);
        } else if (uniqueCourses.size === 0) {
          setDeriveError(null); // We will rely on manual selection without showing red text
        } else {
          setDeriveError(null); // Multiple courses: user will pick from dropdown
        }
      } catch (e) {
        setDeriveError(null); // Quiet failure; user will pick manually
      }
    };
    deriveCourse();
  }, [selectedGroup]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !classGroupId || !dueDate) {
      return;
    }
  setSubmitError(null);
  const courseIdToUse = manualCourseId || derivedCourseId;
  if (!courseIdToUse) return;

    try {
      setSubmitting(true);
      // Create assignment via backend API
      const payload = {
        // Use derived course_id for the selected class-group section
        course_id: courseIdToUse,
        class: selectedClassCode,
        title,
        description,
        due_date: dueDate,
  // optional columns (points/type/priority) omitted to match schema
        created_by: user?.id,
      };
      const res = await assignmentsAPI.createAssignment(payload as any);
      if (res.error) {
        console.error('Failed to create assignment:', res.error);
        setSubmitError(res.error);
        setSubmitting(false);
        return;
      }
      // Optionally reflect in local context list
      if (res.data?.assignment) {
        addAssignment({
          id: res.data.assignment.id,
          title,
          description,
          subject: derivedCourseLabel || 'Course',
          classId: classGroupId,
          dueDate,
          priority,
          submittedBy: []
        } as any);
        // Refresh global data for dashboards
        try { await refreshData(); } catch {}
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      setSubmitError(err instanceof Error ? err.message : 'Failed to create assignment');
      setSubmitting(false);
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
  setClassGroupId('');
    setDueDate('');

    // Go back to dashboard
    onBack();
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-md mx-auto">
        {/* Header */}
        <div className="flex items-center mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="text-white hover:bg-gray-800 mr-3"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-xl font-bold text-white">Create Assignment</h1>
        </div>

        <Card className="bg-gray-800 border-gray-700">
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Assignment Title */}
            <div className="space-y-2">
              <Label htmlFor="title" className="text-white">Assignment Title</Label>
              <Input
                id="title"
                type="text"
                placeholder="Enter assignment title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400"
                required
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="text-white">Description</Label>
              <Textarea
                id="description"
                placeholder="Enter assignment description and requirements"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 min-h-[100px]"
                required
              />
            </div>

            {/* Class Selection from Supabase 'class' table */}
            <div className="space-y-2">
              <Label htmlFor="class" className="text-white">Class</Label>
              <Select value={classGroupId} onValueChange={setClassGroupId} required>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {loadingGroups && <div className="px-3 py-2 text-gray-400">Loading...</div>}
                  {!loadingGroups && classGroups.map((cg) => {
                    const label = `${cg.dept || ''} ${cg.class || ''}${cg.section ? ` - ${cg.section}` : ''}`.trim();
                    return (
                      <SelectItem key={cg.id} value={cg.id}>
                        {label}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {/* Always show Course selection */}
              <div className="mt-2">
                <Label htmlFor="course" className="text-white text-xs">Course</Label>
                <Select value={manualCourseId || ''} onValueChange={(v: string) => setManualCourseId(v)}>
                  <SelectTrigger className="bg-gray-700 border-gray-600 text-white h-8">
                    <SelectValue placeholder={availableCourses.length ? 'Select a course' : 'No courses available'} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCourses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="dueDate" className="text-white">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                required
              />
            </div>

            {/* Priority field removed to align with new schema */}

            {/* Submit Button */}
            {submitError && (
              <div className="text-red-400 text-sm">{submitError}</div>
            )}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={submitting || !title || !description || !classGroupId || !dueDate || !manualCourseId}
            >
              <Plus className="w-4 h-4 mr-2" />
              {submitting ? 'Creating…' : 'Create Assignment'}
            </Button>
          </form>
        </Card>

        {/* Tips section removed as requested */}
      </div>
    </div>
  );
};