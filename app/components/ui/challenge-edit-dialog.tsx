'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Save, X, Trophy, Target, Clock, Award, Plus, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT';
  duration: string;
  points: number;
  progress: number;
  target: number;
  color: string;
  requirements: string[];
  rewards: string[];
  createdAt: string;
  isCustom?: boolean;
}

interface ChallengeEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  challenge: Challenge | null;
  onSave: (challengeData: Partial<Challenge>) => Promise<void>;
}

const ChallengeEditDialog: React.FC<ChallengeEditDialogProps> = ({
  open,
  onOpenChange,
  challenge,
  onSave,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    difficulty: 'MEDIUM' as 'EASY' | 'MEDIUM' | 'HARD' | 'EXPERT',
    duration: '1 Week',
    points: 0,
    progress: 0,
    target: 1,
    color: 'blue',
    requirements: [''],
    rewards: [''],
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (challenge) {
      setFormData({
        title: challenge.title || '',
        description: challenge.description || '',
        difficulty: challenge.difficulty || 'MEDIUM',
        duration: challenge.duration || '1 Week',
        points: challenge.points || 0,
        progress: challenge.progress || 0,
        target: challenge.target || 1,
        color: challenge.color || 'blue',
        requirements: challenge.requirements.length > 0 ? challenge.requirements : [''],
        rewards: challenge.rewards.length > 0 ? challenge.rewards : [''],
      });
    }
  }, [challenge]);

  const handleSave = async () => {
    if (!challenge) return;
    
    setLoading(true);
    try {
      await onSave({
        id: challenge.id,
        ...formData,
        requirements: formData.requirements.filter(req => req.trim() !== ''),
        rewards: formData.rewards.filter(reward => reward.trim() !== ''),
      });
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to save challenge');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleArrayChange = (field: 'requirements' | 'rewards', index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? value : item),
    }));
  };

  const addArrayItem = (field: 'requirements' | 'rewards') => {
    setFormData(prev => ({
      ...prev,
      [field]: [...prev[field], ''],
    }));
  };

  const removeArrayItem = (field: 'requirements' | 'rewards', index: number) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index),
    }));
  };

  const difficultyOptions = [
    { value: 'EASY', label: 'Easy', color: 'bg-green-50 text-green-700' },
    { value: 'MEDIUM', label: 'Medium', color: 'bg-yellow-50 text-yellow-700' },
    { value: 'HARD', label: 'Hard', color: 'bg-orange-50 text-orange-700' },
    { value: 'EXPERT', label: 'Expert', color: 'bg-red-50 text-red-700' },
  ];

  const colorOptions = [
    { value: 'blue', label: 'Blue' },
    { value: 'green', label: 'Green' },
    { value: 'purple', label: 'Purple' },
    { value: 'orange', label: 'Orange' },
    { value: 'red', label: 'Red' },
    { value: 'yellow', label: 'Yellow' },
    { value: 'indigo', label: 'Indigo' },
    { value: 'pink', label: 'Pink' },
    { value: 'gold', label: 'Gold' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {challenge?.title ? 'Edit Challenge' : 'Create New Challenge'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Trophy className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="title">Challenge Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                  placeholder="Enter challenge title"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Enter challenge description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={formData.difficulty} onValueChange={(value) => handleInputChange('difficulty', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                    <SelectContent>
                      {difficultyOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className={`text-xs ${option.color}`}>
                              {option.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="duration">Duration</Label>
                  <Input
                    id="duration"
                    value={formData.duration}
                    onChange={(e) => handleInputChange('duration', e.target.value)}
                    placeholder="e.g., 1 Week, 1 Game"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="points">Points Reward</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.points}
                    onChange={(e) => handleInputChange('points', parseInt(e.target.value) || 0)}
                    placeholder="Points"
                  />
                </div>

                <div>
                  <Label htmlFor="color">Color Theme</Label>
                  <Select value={formData.color} onValueChange={(value) => handleInputChange('color', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select color" />
                    </SelectTrigger>
                    <SelectContent>
                      {colorOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: option.value }}
                            />
                            {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Requirements */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="h-5 w-5" />
                Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.requirements.map((requirement, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={requirement}
                    onChange={(e) => handleArrayChange('requirements', index, e.target.value)}
                    placeholder="Enter requirement"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('requirements', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('requirements')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Requirement
              </Button>
            </CardContent>
          </Card>

          {/* Rewards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Award className="h-5 w-5" />
                Rewards
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {formData.rewards.map((reward, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Input
                    value={reward}
                    onChange={(e) => handleArrayChange('rewards', index, e.target.value)}
                    placeholder="Enter reward"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeArrayItem('rewards', index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => addArrayItem('rewards')}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Reward
              </Button>
            </CardContent>
          </Card>

          {/* Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5" />
                Progress Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="progress">Current Progress</Label>
                  <Input
                    id="progress"
                    type="number"
                    value={formData.progress}
                    onChange={(e) => handleInputChange('progress', parseInt(e.target.value) || 0)}
                    placeholder="Current"
                  />
                </div>

                <div>
                  <Label htmlFor="target">Target</Label>
                  <Input
                    id="target"
                    type="number"
                    value={formData.target}
                    onChange={(e) => handleInputChange('target', parseInt(e.target.value) || 1)}
                    placeholder="Target"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between text-sm mb-2">
                  <span>Progress</span>
                  <span>{formData.progress}/{formData.target}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${formData.target > 0 ? (formData.progress / formData.target) * 100 : 0}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            <X className="h-4 w-4 mr-2" />
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            {loading ? 'Saving...' : (challenge?.title ? 'Save Changes' : 'Create Challenge')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ChallengeEditDialog; 