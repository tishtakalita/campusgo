import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { useData } from '../contexts/DataContext';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, Upload, FileText, Video, Link, File, CheckCircle, Tag, X } from 'lucide-react';
import { resourcesAPI } from '../services/api';

interface UploadResourceProps {
  onBack: () => void;
}

export const UploadResource: React.FC<UploadResourceProps> = ({ onBack }) => {
  const { user } = useUser();
  const { classes, courses } = useData();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    resource_type: "document" as "document" | "video" | "link" | "image" | "other",
    course_id: "",
    file_url: "", // S3 bucket URL
    file_name: "",
    file_size: 0,
    file_type: "",
    is_external: false,
    external_url: "",
    tags: [] as string[]
  });

  const [newTag, setNewTag] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleS3UrlInput = (url: string) => {
    setFormData(prev => ({
      ...prev,
      file_url: url,
      file_name: url.split('/').pop() || "",
      file_type: url.split('.').pop() || "",
      is_external: false
    }));
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.course_id) {
      newErrors.course_id = "Course selection is required";
    }

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
      const resourceData = {
        ...formData,
        uploaded_by: user?.id
      };

      const response = await resourcesAPI.createResource(resourceData);
      
      if (response.success) {
        setSuccess(true);
        
        // Auto-navigate back after success
        setTimeout(() => {
          onBack();
        }, 2000);
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

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <CheckCircle className="w-16 h-16 text-green-500" />
        <h2 className="text-2xl font-bold text-gray-900">Resource Created Successfully!</h2>
        <p className="text-gray-600 text-center">Your resource has been uploaded and is now available.</p>
        <Button onClick={onBack} className="px-6 py-2">
          View Resources
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="hover:bg-gray-100"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Upload Resource</h1>
            <p className="text-gray-600">Share files and links with your students</p>
          </div>
        </div>

        {/* Upload Form */}
        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-sm font-medium text-gray-700 mb-2">
                Title *
              </Label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange("title", e.target.value)}
                className={`w-full ${errors.title ? 'border-red-300' : ''}`}
                placeholder="Enter resource title"
              />
              {errors.title && <p className="text-sm text-red-600 mt-1">{errors.title}</p>}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-sm font-medium text-gray-700 mb-2">
                Description *
              </Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange("description", e.target.value)}
                rows={3}
                className={`w-full ${errors.description ? 'border-red-300' : ''}`}
                placeholder="Describe the resource and its purpose"
              />
              {errors.description && <p className="text-sm text-red-600 mt-1">{errors.description}</p>}
            </div>

            {/* Course Selection */}
            <div>
              <Label htmlFor="course" className="text-sm font-medium text-gray-700 mb-2">
                Course *
              </Label>
              <Select value={formData.course_id} onValueChange={(value) => handleInputChange("course_id", value)}>
                <SelectTrigger className={`w-full ${errors.course_id ? 'border-red-300' : ''}`}>
                  <SelectValue placeholder="Select a course" />
                </SelectTrigger>
                <SelectContent>
                  {courses?.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.code} - {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.course_id && <p className="text-sm text-red-600 mt-1">{errors.course_id}</p>}
            </div>

            {/* External Resource Toggle */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="is_external"
                checked={formData.is_external}
                onChange={(e) => handleInputChange("is_external", e.target.checked)}
                className="w-4 h-4"
              />
              <Label htmlFor="is_external" className="text-sm font-medium text-gray-700">
                This is an external link (not a file upload)
              </Label>
            </div>

            {/* File URL or External URL */}
            {formData.is_external ? (
              <div>
                <Label htmlFor="external_url" className="text-sm font-medium text-gray-700 mb-2">
                  External URL *
                </Label>
                <Input
                  id="external_url"
                  type="url"
                  value={formData.external_url}
                  onChange={(e) => handleInputChange("external_url", e.target.value)}
                  className={`w-full ${errors.external_url ? 'border-red-300' : ''}`}
                  placeholder="https://example.com/resource"
                />
                {errors.external_url && <p className="text-sm text-red-600 mt-1">{errors.external_url}</p>}
              </div>
            ) : (
              <div>
                <Label htmlFor="file_url" className="text-sm font-medium text-gray-700 mb-2">
                  S3 Bucket URL *
                </Label>
                <Input
                  id="file_url"
                  type="url"
                  value={formData.file_url}
                  onChange={(e) => handleS3UrlInput(e.target.value)}
                  className={`w-full ${errors.file_url ? 'border-red-300' : ''}`}
                  placeholder="https://your-bucket.supabase.co/storage/v1/object/sign/resources/filename.pdf?token=..."
                />
                {errors.file_url && <p className="text-sm text-red-600 mt-1">{errors.file_url}</p>}
                
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <strong>Upload files to your S3 bucket first,</strong> then paste the signed URL here.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleS3UrlInput("https://zhwaokrkcmjoywflhtle.supabase.co/storage/v1/object/sign/resources/212_BatchC_.pdf?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV85MWVmYTMzZi1jZjJkLTQ3MWUtOGRiMC1iMzBlYTM1YmQ3OWYiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJyZXNvdXJjZXMvMjEyX0JhdGNoQ18ucGRmIiwiaWF0IjoxNzU4OTUyNjg2LCJleHAiOjE3NjE1NDQ2ODZ9.zhPv1TopqF9Zzlp9gyx8K9oU9emVeNoD6e7ISeUmkZo")}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-800 underline"
                >
                  Use example PDF URL for testing
                </button>
              </div>
            )}

            {/* Tags */}
            <div>
              <Label className="text-sm font-medium text-gray-700 mb-2">Tags (Optional)</Label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                  className="flex-1"
                  placeholder="Add a tag"
                />
                <Button type="button" onClick={addTag} variant="outline">
                  <Tag className="w-4 h-4" />
                </Button>
              </div>

              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.tags.map(tag => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex gap-4 pt-6 border-t">
              <Button
                type="button"
                onClick={onBack}
                variant="outline"
                className="flex-1"
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
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{errors.submit}</p>
              </div>
            )}
          </form>
        </Card>
      </div>
    </div>
  );
};