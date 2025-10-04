import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useData } from '../contexts/DataContext';
import { assignmentsAPI } from '../services/api';
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
  const { classes, addAssignment } = useData();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [classId, setClassId] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');

  // Filter classes for faculty
  const facultyClasses = classes.filter(cls => 
    user?.facultySubjects?.includes(cls.name)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !description || !classId || !dueDate) {
      return;
    }

    const selectedClass = facultyClasses.find(cls => cls.id === classId);
    if (!selectedClass) return;

    try {
      // Create assignment via backend API
      const payload = {
        // Prefer course_id if available, else pass class_id for backend to resolve
        course_id: (selectedClass as any).course_id,
        class_id: selectedClass.id,
        title,
        description,
        due_date: dueDate,
        total_points: 100,
        assignment_type: 'homework',
        priority,
        created_by: user?.id,
        is_published: true,
      };
      const res = await assignmentsAPI.createAssignment(payload as any);
      if (res.error) {
        console.error('Failed to create assignment:', res.error);
        return;
      }
      // Optionally reflect in local context list
      if (res.data?.assignment) {
        addAssignment({
          id: res.data.assignment.id,
          title,
          description,
          subject: selectedClass.name,
          classId,
          dueDate,
          priority,
          submittedBy: []
        } as any);
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      return;
    }

    // Reset form
    setTitle('');
    setDescription('');
    setClassId('');
    setDueDate('');
    setPriority('medium');

    // Go back to dashboard
    onBack();
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

            {/* Class Selection */}
            <div className="space-y-2">
              <Label htmlFor="class" className="text-white">Class</Label>
              <Select value={classId} onValueChange={setClassId} required>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {facultyClasses.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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

            {/* Priority */}
            <div className="space-y-2">
              <Label htmlFor="priority" className="text-white">Priority</Label>
              <Select value={priority} onValueChange={(value: 'high' | 'medium' | 'low') => setPriority(value)}>
                <SelectTrigger className="bg-gray-700 border-gray-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">High Priority</SelectItem>
                  <SelectItem value="medium">Medium Priority</SelectItem>
                  <SelectItem value="low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
              disabled={!title || !description || !classId || !dueDate}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Assignment
            </Button>
          </form>
        </Card>

        {/* Tips */}
        <Card className="bg-gray-800 border-gray-700 mt-4">
          <div className="p-4">
            <h3 className="text-white font-semibold mb-2">Tips for Creating Assignments</h3>
            <ul className="text-sm text-gray-400 space-y-1">
              <li>• Be clear and specific about requirements</li>
              <li>• Set realistic deadlines</li>
              <li>• Include grading criteria when possible</li>
              <li>• Consider the workload of other classes</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
};