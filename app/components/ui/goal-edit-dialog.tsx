'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, X, Plus, Trash2, Clock, Target, Award, BookOpen, Video, Users } from 'lucide-react';
import { toast } from 'sonner';

interface GoalEditDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: Goal | null;
  onSave: (goalData: Partial<Goal>) => Promise<void>;
}

interface Goal {
  id: string;
  name: string;
  description: string;
  detailedDescription: string;
  instructions: string[];
  skillRequirements: string[];
  tips: string[];
  commonMistakes: string[];
  relatedDrills: string[];
  videoReferences: string[];
  estimatedTime: number; // in minutes
  difficulty: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT';
  type: string;
  targetValue: number;
  targetUnit: string;
  points: number;
  isLevelTest?: boolean;
  personalNotes: string;
  customCriteria: string;
  userProgress: {
    status: 'LOCKED' | 'AVAILABLE' | 'IN_PROGRESS' | 'COMPLETED';
    progress: number;
    currentValue: number;
    personalBest?: number;
    attempts: number;
    lastAttempt?: string;
  };
}

export default function GoalEditDialog({ open, onOpenChange, goal, onSave }: GoalEditDialogProps) {
  const [editedGoal, setEditedGoal] = useState<Goal | null>(null);
  const [activeTab, setActiveTab] = useState('basic');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (goal) {
      setEditedGoal({ ...goal });
    }
  }, [goal]);

  const handleSave = async () => {
    if (!editedGoal) return;

    setIsSaving(true);
    try {
      await onSave(editedGoal);
      toast.success('Goal updated successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to update goal');
    } finally {
      setIsSaving(false);
    }
  };

  const addArrayItem = (field: keyof Goal, value: string) => {
    if (!editedGoal || !value.trim()) return;
    
    const currentArray = editedGoal[field] as string[];
    setEditedGoal({
      ...editedGoal,
      [field]: [...currentArray, value.trim()]
    });
  };

  const removeArrayItem = (field: keyof Goal, index: number) => {
    if (!editedGoal) return;
    
    const currentArray = editedGoal[field] as string[];
    setEditedGoal({
      ...editedGoal,
      [field]: currentArray.filter((_, i) => i !== index)
    });
  };

  const updateArrayItem = (field: keyof Goal, index: number, value: string) => {
    if (!editedGoal) return;
    
    const currentArray = editedGoal[field] as string[];
    const newArray = [...currentArray];
    newArray[index] = value;
    setEditedGoal({
      ...editedGoal,
      [field]: newArray
    });
  };

  if (!editedGoal) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Edit Goal: {editedGoal.name}
            {editedGoal.isLevelTest && (
              <Badge variant="outline" className="ml-2">Level Test</Badge>
            )}
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="basic">Basic Info</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="instructions">Instructions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
            <TabsTrigger value="personal">Personal</TabsTrigger>
          </TabsList>

          {/* Basic Information Tab */}
          <TabsContent value="basic" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Goal Name</Label>
                <Input
                  id="name"
                  value={editedGoal.name}
                  onChange={(e) => setEditedGoal({ ...editedGoal, name: e.target.value })}
                  placeholder="Enter goal name"
                />
              </div>
              <div>
                <Label htmlFor="difficulty">Difficulty Level</Label>
                <Select
                  value={editedGoal.difficulty}
                  onValueChange={(value) => setEditedGoal({ ...editedGoal, difficulty: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BEGINNER">Beginner</SelectItem>
                    <SelectItem value="INTERMEDIATE">Intermediate</SelectItem>
                    <SelectItem value="ADVANCED">Advanced</SelectItem>
                    <SelectItem value="EXPERT">Expert</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Short Description</Label>
              <Textarea
                id="description"
                value={editedGoal.description}
                onChange={(e) => setEditedGoal({ ...editedGoal, description: e.target.value })}
                placeholder="Brief description of the goal"
                rows={2}
              />
            </div>

            <div>
              <Label htmlFor="detailedDescription">Detailed Description</Label>
              <Textarea
                id="detailedDescription"
                value={editedGoal.detailedDescription}
                onChange={(e) => setEditedGoal({ ...editedGoal, detailedDescription: e.target.value })}
                placeholder="Comprehensive explanation of what this goal involves"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="points">Points Reward</Label>
                <Input
                  id="points"
                  type="number"
                  value={editedGoal.points}
                  onChange={(e) => setEditedGoal({ ...editedGoal, points: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="targetValue">Target Value</Label>
                <Input
                  id="targetValue"
                  type="number"
                  value={editedGoal.targetValue}
                  onChange={(e) => setEditedGoal({ ...editedGoal, targetValue: parseInt(e.target.value) || 0 })}
                />
              </div>
              <div>
                <Label htmlFor="estimatedTime">Estimated Time (minutes)</Label>
                <Input
                  id="estimatedTime"
                  type="number"
                  value={editedGoal.estimatedTime}
                  onChange={(e) => setEditedGoal({ ...editedGoal, estimatedTime: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>
          </TabsContent>

          {/* Details Tab */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Skill Requirements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedGoal.skillRequirements.map((skill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={skill}
                        onChange={(e) => updateArrayItem('skillRequirements', index, e.target.value)}
                        placeholder="Enter skill requirement"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('skillRequirements', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem('skillRequirements', 'New skill requirement')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Skill Requirement
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  Tips & Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedGoal.tips.map((tip, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Textarea
                        value={tip}
                        onChange={(e) => updateArrayItem('tips', index, e.target.value)}
                        placeholder="Enter helpful tip"
                        rows={2}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('tips', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem('tips', 'New tip')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Tip
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <X className="h-4 w-4" />
                  Common Mistakes to Avoid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedGoal.commonMistakes.map((mistake, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Textarea
                        value={mistake}
                        onChange={(e) => updateArrayItem('commonMistakes', index, e.target.value)}
                        placeholder="Enter common mistake"
                        rows={2}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('commonMistakes', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem('commonMistakes', 'New common mistake')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Common Mistake
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Instructions Tab */}
          <TabsContent value="instructions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Step-by-Step Instructions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedGoal.instructions.map((instruction, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <div className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm font-medium mt-1">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <Textarea
                          value={instruction}
                          onChange={(e) => updateArrayItem('instructions', index, e.target.value)}
                          placeholder={`Step ${index + 1} instructions`}
                          rows={2}
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('instructions', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem('instructions', 'New instruction step')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Step
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Resources Tab */}
          <TabsContent value="resources" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Related Drills
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedGoal.relatedDrills.map((drill, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={drill}
                        onChange={(e) => updateArrayItem('relatedDrills', index, e.target.value)}
                        placeholder="Enter related drill name"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('relatedDrills', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem('relatedDrills', 'New drill')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Drill
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="h-4 w-4" />
                  Video References
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {editedGoal.videoReferences.map((video, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={video}
                        onChange={(e) => updateArrayItem('videoReferences', index, e.target.value)}
                        placeholder="Enter video title or URL"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => removeArrayItem('videoReferences', index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => addArrayItem('videoReferences', 'New video reference')}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Video Reference
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Personal Tab */}
          <TabsContent value="personal" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Personal Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editedGoal.personalNotes}
                  onChange={(e) => setEditedGoal({ ...editedGoal, personalNotes: e.target.value })}
                  placeholder="Add your personal notes, thoughts, or reminders about this goal"
                  rows={4}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Custom Success Criteria</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={editedGoal.customCriteria}
                  onChange={(e) => setEditedGoal({ ...editedGoal, customCriteria: e.target.value })}
                  placeholder="Define your own success criteria for this goal"
                  rows={3}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Progress Tracking</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Current Value</Label>
                    <Input
                      type="number"
                      value={editedGoal.userProgress.currentValue}
                      onChange={(e) => setEditedGoal({
                        ...editedGoal,
                        userProgress: {
                          ...editedGoal.userProgress,
                          currentValue: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                  <div>
                    <Label>Personal Best</Label>
                    <Input
                      type="number"
                      value={editedGoal.userProgress.personalBest || 0}
                      onChange={(e) => setEditedGoal({
                        ...editedGoal,
                        userProgress: {
                          ...editedGoal.userProgress,
                          personalBest: parseInt(e.target.value) || 0
                        }
                      })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
} 