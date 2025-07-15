'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Plus, 
  Video, 
  Upload, 
  Trash2, 
  Save, 
  X,
  Play,
  Clock,
  Target,
  BookOpen,
  Lightbulb,
  Users,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/hooks/use-toast';

interface CustomDrillCreatorProps {
  onDrillCreated?: (drill: any) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function CustomDrillCreator({ onDrillCreated, isOpen, onClose }: CustomDrillCreatorProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    skillLevel: '',
    duration: '',
    equipment: [] as string[],
    stepByStep: [] as string[],
    coachingTips: [] as string[],
    videoUrl: '',
    isPublic: false,
  });

  const [newEquipment, setNewEquipment] = useState('');
  const [newStep, setNewStep] = useState('');
  const [newTip, setNewTip] = useState('');
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoUploading, setVideoUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const categories = [
    { value: 'shooting', label: 'Shooting' },
    { value: 'dribbling', label: 'Dribbling & Ball Handling' },
    { value: 'passing', label: 'Passing' },
    { value: 'defense', label: 'Defense & Rebounding' },
    { value: 'footwork', label: 'Footwork & Movement' },
    { value: 'conditioning', label: 'Conditioning & Agility' },
    { value: 'fundamentals', label: 'Fundamentals & Fun Games' },
  ];

  const skillLevels = [
    { value: 'beginner', label: 'Beginner' },
    { value: 'intermediate', label: 'Intermediate' },
    { value: 'advanced', label: 'Advanced' },
  ];

  const durationOptions = [
    { value: '5 minutes', label: '5 minutes' },
    { value: '10 minutes', label: '10 minutes' },
    { value: '15 minutes', label: '15 minutes' },
    { value: '20 minutes', label: '20 minutes' },
    { value: '30 minutes', label: '30 minutes' },
    { value: '45 minutes', label: '45 minutes' },
    { value: '60 minutes', label: '60 minutes' },
  ];

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const addEquipment = () => {
    if (newEquipment.trim()) {
      setFormData(prev => ({
        ...prev,
        equipment: [...prev.equipment, newEquipment.trim()],
      }));
      setNewEquipment('');
    }
  };

  const removeEquipment = (index: number) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.filter((_, i) => i !== index),
    }));
  };

  const addStep = () => {
    if (newStep.trim()) {
      setFormData(prev => ({
        ...prev,
        stepByStep: [...prev.stepByStep, newStep.trim()],
      }));
      setNewStep('');
    }
  };

  const removeStep = (index: number) => {
    setFormData(prev => ({
      ...prev,
      stepByStep: prev.stepByStep.filter((_, i) => i !== index),
    }));
  };

  const addTip = () => {
    if (newTip.trim()) {
      setFormData(prev => ({
        ...prev,
        coachingTips: [...prev.coachingTips, newTip.trim()],
      }));
      setNewTip('');
    }
  };

  const removeTip = (index: number) => {
    setFormData(prev => ({
      ...prev,
      coachingTips: prev.coachingTips.filter((_, i) => i !== index),
    }));
  };

  const handleVideoUpload = async (file: File) => {
    setVideoUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('drillId', 'custom-drill-video');
      
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Video upload failed');
      }

      const result = await response.json();
      setFormData(prev => ({
        ...prev,
        videoUrl: result.fileUrl,
      }));
      
      toast({
        title: "Video uploaded successfully",
        description: "Your custom drill video has been uploaded.",
      });
    } catch (error) {
      console.error('Error uploading video:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your video. Please try again.",
        variant: "destructive",
      });
    } finally {
      setVideoUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.description || !formData.category || !formData.skillLevel || !formData.duration) {
      toast({
        title: "Missing required fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('/api/custom-drills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create custom drill');
      }

      const createdDrill = await response.json();
      
      toast({
        title: "Custom drill created!",
        description: "Your custom drill has been created successfully.",
      });

      if (onDrillCreated) {
        onDrillCreated(createdDrill);
      }

      // Reset form
      setFormData({
        name: '',
        description: '',
        category: '',
        skillLevel: '',
        duration: '',
        equipment: [],
        stepByStep: [],
        coachingTips: [],
        videoUrl: '',
        isPublic: false,
      });
      
      onClose();
    } catch (error) {
      console.error('Error creating custom drill:', error);
      toast({
        title: "Error creating drill",
        description: error instanceof Error ? error.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-orange-600" />
            Create Custom Drill
          </DialogTitle>
          <DialogDescription>
            Create your own basketball drill with custom video and instructions.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drill-name">Drill Name *</Label>
                  <Input
                    id="drill-name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    placeholder="Enter drill name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="drill-duration">Duration *</Label>
                  <Select value={formData.duration} onValueChange={(value) => handleInputChange('duration', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      {durationOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="drill-description">Description *</Label>
                <Textarea
                  id="drill-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Describe what this drill teaches and how it helps players improve"
                  rows={3}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="drill-category">Category *</Label>
                  <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category.value} value={category.value}>
                          {category.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="drill-skill-level">Skill Level *</Label>
                  <Select value={formData.skillLevel} onValueChange={(value) => handleInputChange('skillLevel', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select skill level" />
                    </SelectTrigger>
                    <SelectContent>
                      {skillLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Video Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Video className="h-5 w-5" />
                Video Upload
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="video-upload">Upload Drill Video</Label>
                <div className="mt-2">
                  <input
                    id="video-upload"
                    type="file"
                    accept="video/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setVideoFile(file);
                        handleVideoUpload(file);
                      }
                    }}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-orange-50 file:text-orange-700 hover:file:bg-orange-100"
                    disabled={videoUploading}
                  />
                  {videoUploading && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-gray-600">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-600"></div>
                      Uploading video...
                    </div>
                  )}
                  {formData.videoUrl && (
                    <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                      <Check className="h-4 w-4" />
                      Video uploaded successfully!
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Equipment */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Equipment Needed
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newEquipment}
                  onChange={(e) => setNewEquipment(e.target.value)}
                  placeholder="Add equipment (e.g., basketball, cones)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEquipment())}
                />
                <Button type="button" onClick={addEquipment} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.equipment.map((item, index) => (
                  <Badge key={index} variant="secondary" className="flex items-center gap-1">
                    {item}
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0"
                      onClick={() => removeEquipment(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Step-by-Step Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Step-by-Step Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Add a step (e.g., Stand with feet shoulder-width apart)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addStep())}
                />
                <Button type="button" onClick={addStep} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.stepByStep.map((step, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-gray-50 rounded-lg">
                    <span className="text-sm font-medium text-gray-500 mt-0.5">
                      {index + 1}.
                    </span>
                    <span className="text-sm flex-1">{step}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeStep(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Coaching Tips */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Coaching Tips
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTip}
                  onChange={(e) => setNewTip(e.target.value)}
                  placeholder="Add a coaching tip (e.g., Focus on proper form over speed)"
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTip())}
                />
                <Button type="button" onClick={addTip} variant="outline" size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                {formData.coachingTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                    <Lightbulb className="h-4 w-4 text-blue-600 mt-0.5" />
                    <span className="text-sm flex-1">{tip}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => removeTip(index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sharing Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Sharing Settings
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="is-public"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => handleInputChange('isPublic', checked as boolean)}
                />
                <Label htmlFor="is-public">
                  Make this drill public for other users to discover
                </Label>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                Public drills can be found and used by other players in the community.
              </p>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Drill
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 