import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Upload, Tag, X } from 'lucide-react';
import { resourcesAPI, coursesAPI, directoryAPI } from '../services/api';

interface UploadResourceProps {
  onBack: () => void;
}

export const UploadResource: React.FC<UploadResourceProps> = ({ onBack }) => {
  const { user } = useUser();
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Array<{ id: string; code?: string; name?: string }>>([]);
  const [classesList, setClassesList] = useState<Array<{ id: string; academic_year: string; section: string; dept: string; class?: string }>>([]);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "document" as "document" | "video" | "link" | "image" | "slides" | "other",
    category: "materials" as "syllabus" | "announcements" | "materials",
    course_id: "",
    class: "",
    file_url: "",
    file_name: "",
    file_size: 0,
    file_type: "",
    is_external: false,
    external_url: "",
    tags: [] as string[],
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load courses and classes for selection
  useEffect(() => {
    (async () => {
      try {
        const res = await coursesAPI.getAllCourses();
        if (!res.error && res.data?.courses) setCourses(res.data.courses as any);
      } catch {}
      try {
        const cls = await directoryAPI.listClasses();
        if (!cls.error && (cls.data as any)?.classes) setClassesList((cls.data as any).classes);
      } catch {}
    })();
  }, []);

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: "" }));
  };

  const addTag = () => {
    const t = newTag.trim();
    if (t && !formData.tags.includes(t)) {
      setFormData(prev => ({ ...prev, tags: [...prev.tags, t] }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const handleS3UrlInput = (u: string) => {
    setFormData(prev => ({
      ...prev,
      file_url: u,
      file_name: u.split('/').pop() || "",
      file_type: u.split('.').pop() || "",
      is_external: false,
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.category) {
      newErrors.category = "Category is required";
    }
    if (!formData.resource_type) {
      newErrors.resource_type = "Resource type is required";
    }

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    // course_id and class are optional per schema (nullable)

    if (!formData.is_external && !formData.file_url.trim()) {
      newErrors.file_url = "File URL is required";
    }

    if (formData.is_external && !formData.external_url.trim()) {
      newErrors.external_url = "External URL is required";
    }

    if (formData.is_external && !formData.external_url.match(/^https?:\/\/.+/)) {
      newErrors.external_url = "Please enter a valid URL";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      // Normalize payload to match DB table columns exactly
      const fileUrl = formData.is_external ? formData.external_url : formData.file_url;
      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        file_url: fileUrl,
        resource_type: formData.resource_type,
        course_id: formData.course_id || null,
        uploaded_by: user?.id as string,
        tags: formData.tags,
        category: formData.category,
        class: formData.class && formData.class.trim() ? formData.class.trim() : null,
      };

      const response = await resourcesAPI.createResource(payload as any);

      if (!response.error) {
        // Navigate back immediately on success
        onBack();
        return;
      } else {
        throw new Error(response.error || "Failed to create resource");
      }
    } catch (error) {
      console.error("Error creating resource:", error);
      setErrors({ submit: error instanceof Error ? error.message : "Failed to create resource" });
    } finally {
      setLoading(false);
    }
  };
  // No success screen; return to resources immediately on success

  return (
    <div className="min-h-screen bg-gray-900 p-5">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-white/10 text-white"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-white">Upload Resource</h1>
            <p className="text-white">Share files and links with your students</p>
          </div>
        </div>

        {/* Upload Form */}
        <Card className="p-6 bg-gray-800 border border-white/10 rounded-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-white mb-2">
                Title *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full bg-gray-900 border-white/10 text-white placeholder:text-white/40 ${errors.title ? 'border-red-500' : ''}`}
                placeholder="Enter resource title"
              />
              {errors.title && <p className="text-sm text-red-400 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-white mb-2">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className={`w-full bg-gray-900 border-white/10 text-white placeholder:text-white/40 ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe the resource and its purpose"
              />
              {errors.description && <p className="text-sm text-red-400 mt-1">{errors.description}</p>}
            </div>

            {/* Course Selection */}
            <div>
              <Label htmlFor="course" className="text-sm font-medium text-white mb-2">
                Course (optional)
              </Label>
              <Select value={formData.course_id} onValueChange={(value: string) => handleInputChange("course_id", value)}>
                <SelectTrigger className={`w-full bg-gray-900 border-white/10 text-white ${errors.course_id ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map((course: any) => (
                    <SelectItem key={course.id} value={course.id}>
                      {(course.code || 'COURSE')} - {(course.name || 'Untitled')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course_id && <p className="text-sm text-red-400 mt-1">{errors.course_id}</p>}
            </div>

            {/* Class (code) */}
            <div>
              <Label htmlFor="class" className="text-sm font-medium text-white mb-2">
                Class (code) (optional)
              </Label>
              <Select value={formData.class} onValueChange={(value: string) => handleInputChange('class', value)}>
                <SelectTrigger className={`w-full bg-gray-900 border-white/10 text-white ${errors.class ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a class" />
                </SelectTrigger>
                <SelectContent>
                  {classesList.map((c) => {
                    const code = c.class || `${c.academic_year}_${c.dept}_${c.section}`;
                    const label = `${c.dept}-${c.section} • Year ${c.academic_year}`;
                    return (
                      <SelectItem key={c.id} value={code}>{label}</SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              {errors.class && <p className="text-sm text-red-400 mt-1">{errors.class}</p>}
            </div>

            {/* Category Selection */}
            <div>
              <Label htmlFor="category" className="text-sm font-medium text-white mb-2">
                Category *
              </Label>
              <Select value={formData.category} onValueChange={(value: 'syllabus' | 'announcements' | 'materials') => handleInputChange('category', value)}>
                <SelectTrigger className={`w-full bg-gray-900 border-white/10 text-white ${errors.category ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="syllabus">Syllabus</SelectItem>
                  <SelectItem value="announcements">Announcements</SelectItem>
                  <SelectItem value="materials">Class Materials</SelectItem>
                </SelectContent>
              </Select>
              {errors.category && <p className="text-sm text-red-400 mt-1">{errors.category}</p>}
            </div>

            {/* Resource Type Selection */}
            <div>
              <Label htmlFor="resource_type" className="text-sm font-medium text-white mb-2">
                Resource Type *
              </Label>
              <Select value={formData.resource_type} onValueChange={(value: 'document' | 'video' | 'link' | 'image' | 'slides' | 'other') => handleInputChange('resource_type', value)}>
                <SelectTrigger className={`w-full bg-gray-900 border-white/10 text-white ${errors.resource_type ? 'border-red-500' : ''}`}>
                  <SelectValue placeholder="Select a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="document">Document</SelectItem>
                  <SelectItem value="slides">Slides</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="link">Link</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
              {errors.resource_type && <p className="text-sm text-red-400 mt-1">{errors.resource_type}</p>}
            </div>

            {/* External Resource Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_external"
                checked={formData.is_external}
                onChange={(e) => handleInputChange("is_external", e.target.checked)}
                className="w-4 h-4 accent-blue-500"
              />
              <Label htmlFor="is_external" className="text-sm font-medium text-white">
                This is an external link (not a file upload)
              </Label>
            </div>

            {/* File URL or External URL */}
            {formData.is_external ? (
              <div>
                <Label htmlFor="external_url" className="text-sm font-medium text-white mb-2">
                  External URL *
                </Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => handleInputChange("external_url", e.target.value)}
                  className={`w-full bg-gray-900 border-white/10 text-white placeholder:text-white/40 ${errors.external_url ? 'border-red-500' : ''}`}
                  placeholder="https://example.com/resource"
                />
                {errors.external_url && <p className="text-sm text-red-400 mt-1">{errors.external_url}</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="file_url" className="text-sm font-medium text-white mb-2">
                  S3 Bucket URL *
                </Label>
                <Input
                  id="file_url"
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => handleS3UrlInput(e.target.value)}
                  className={`w-full bg-gray-900 border-white/10 text-white placeholder:text-white/40 ${errors.file_url ? 'border-red-500' : ''}`}
                  placeholder="https://your-bucket.supabase.co/storage/v1/object/sign/resources/filename.pdf?token=..."
                />
                {errors.file_url && <p className="text-sm text-red-400 mt-1">{errors.file_url}</p>}
                
                <div className="mt-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <p className="text-sm text-white">
                    <strong className="font-semibold text-white">Upload files to your S3 bucket first,</strong> then paste the signed URL here.
                  </p>
                </div>

                {/* Example link removed per request */}
              </div>
            )}

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium text-white mb-2">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1 bg-gray-900 border-white/10 text-white placeholder:text-white/40"
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag} variant="outline" className="border-white/20 text-white bg-white/10 hover:bg-white/15">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 text-white rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-white hover:text-white/80"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t border-white/10">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1 border-white/20 text-gray-200 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading}
                className="flex-1"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </div>
                ) : (
                  <>
                    <Upload className="w-4 h-4 mr-2" />
                    Create Resource
                  </>
                )}
              </Button>
            </div>

            {errors.submit && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-sm text-red-400">{errors.submit}</p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};