'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { 
  Plus, 
  Trash2, 
  Edit, 
  Save, 
  GripVertical,
  Crown,
  Medal,
  Star,
  Trophy,
  Award,
  Target,
  Gift,
  Lock,
  Unlock,
  AlertCircle
} from 'lucide-react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { motion } from 'framer-motion';
import { LevelTier, LevelGoal } from '@/lib/level-progression';

interface LevelFormData {
  name: string;
  description: string;
  pointsRequired: number;
  color: string;
  icon: string;
  goals: LevelGoal[];
  rewards: string[];
}

const LEVEL_ICONS = [
  { value: '🏀', label: 'Basketball' },
  { value: '🏆', label: 'Trophy' },
  { value: '⭐', label: 'Star' },
  { value: '👑', label: 'Crown' },
  { value: '🥇', label: 'Gold Medal' },
  { value: '🥈', label: 'Silver Medal' },
  { value: '🥉', label: 'Bronze Medal' },
  { value: '🎯', label: 'Target' },
  { value: '🔥', label: 'Fire' },
  { value: '💎', label: 'Diamond' },
  { value: '🌟', label: 'Glowing Star' },
  { value: '🏅', label: 'Sports Medal' },
];

const LEVEL_COLORS = [
  { value: 'bg-gray-100 text-gray-800', label: 'Gray' },
  { value: 'bg-blue-100 text-blue-800', label: 'Blue' },
  { value: 'bg-green-100 text-green-800', label: 'Green' },
  { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow' },
  { value: 'bg-red-100 text-red-800', label: 'Red' },
  { value: 'bg-purple-100 text-purple-800', label: 'Purple' },
  { value: 'bg-orange-100 text-orange-800', label: 'Orange' },
  { value: 'bg-pink-100 text-pink-800', label: 'Pink' },
];

export default function LevelManagement() {
  const [levels, setLevels] = useState<LevelTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<LevelTier | null>(null);
  const [formData, setFormData] = useState<LevelFormData>({
    name: '',
    description: '',
    pointsRequired: 0,
    color: 'bg-gray-100 text-gray-800',
    icon: '🏀',
    goals: [],
    rewards: []
  });
  const [newGoal, setNewGoal] = useState({
    description: '',
    target: 1,
    icon: '🎯',
    category: 'drills' as const
  });
  const [newReward, setNewReward] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchLevels();
  }, []);

  const fetchLevels = async () => {
    try {
      const response = await fetch('/api/level-management');
      if (response.ok) {
        const data = await response.json();
        setLevels(data);
      } else {
        throw new Error('Failed to fetch levels');
      }
    } catch (error) {
      console.error('Error fetching levels:', error);
      toast({
        title: "Error",
        description: "Failed to load levels",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(levels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setLevels(items);

    try {
      const response = await fetch('/api/level-management', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ levels: items }),
      });

      if (!response.ok) {
        throw new Error('Failed to update level order');
      }

      toast({
        title: "Success",
        description: "Level order updated successfully",
      });
    } catch (error) {
      console.error('Error updating level order:', error);
      toast({
        title: "Error",
        description: "Failed to update level order",
        variant: "destructive",
      });
      // Revert the change
      fetchLevels();
    }
  };

  const handleCreateLevel = async () => {
    if (!formData.name || !formData.description) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    try {
      const newLevel: LevelTier = {
        level: levels.length + 1,
        name: formData.name,
        description: formData.description,
        pointsRequired: formData.pointsRequired,
        nextLevelPoints: null,
        color: formData.color,
        icon: formData.icon,
        goals: formData.goals,
        rewards: formData.rewards
      };

      const response = await fetch('/api/level-management', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newLevel),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Level created successfully",
        });
        setShowCreateDialog(false);
        resetForm();
        fetchLevels();
      } else {
        throw new Error('Failed to create level');
      }
    } catch (error) {
      console.error('Error creating level:', error);
      toast({
        title: "Error",
        description: "Failed to create level",
        variant: "destructive",
      });
    }
  };

  const handleDeleteLevel = async (levelId: number) => {
    try {
      const response = await fetch(`/api/level-management?level=${levelId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Level deleted successfully",
        });
        fetchLevels();
      } else {
        throw new Error('Failed to delete level');
      }
    } catch (error) {
      console.error('Error deleting level:', error);
      toast({
        title: "Error",
        description: "Failed to delete level",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pointsRequired: 0,
      color: 'bg-gray-100 text-gray-800',
      icon: '🏀',
      goals: [],
      rewards: []
    });
    setEditingLevel(null);
  };

  const addGoal = () => {
    if (!newGoal.description) return;

    const goal: LevelGoal = {
      id: `goal-${Date.now()}`,
      description: newGoal.description,
      target: newGoal.target,
      icon: newGoal.icon,
      category: newGoal.category
    };

    setFormData(prev => ({
      ...prev,
      goals: [...prev.goals, goal]
    }));

    setNewGoal({
      description: '',
      target: 1,
      icon: '🎯',
      category: 'drills'
    });
  };

  const removeGoal = (goalId: string) => {
    setFormData(prev => ({
      ...prev,
      goals: prev.goals.filter(goal => goal.id !== goalId)
    }));
  };

  const addReward = () => {
    if (!newReward.trim()) return;

    setFormData(prev => ({
      ...prev,
      rewards: [...prev.rewards, newReward.trim()]
    }));

    setNewReward('');
  };

  const removeReward = (index: number) => {
    setFormData(prev => ({
      ...prev,
      rewards: prev.rewards.filter((_, i) => i !== index)
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Level Management</h2>
          <p className="text-gray-600">Create, edit, and reorder reward levels</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
              Create Level
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingLevel ? 'Edit Level' : 'Create New Level'}
              </DialogTitle>
              <DialogDescription>
                {editingLevel ? 'Update level details' : 'Create a new reward level for players'}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Level Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Rookie, Pro, Legend"
                  />
                </div>
                <div>
                  <Label htmlFor="points">Points Required</Label>
                  <Input
                    id="points"
                    type="number"
                    value={formData.pointsRequired}
                    onChange={(e) => setFormData(prev => ({ ...prev, pointsRequired: parseInt(e.target.value) || 0 }))}
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe what this level represents..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="icon">Icon</Label>
                  <Select value={formData.icon} onValueChange={(value) => setFormData(prev => ({ ...prev, icon: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_ICONS.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{icon.value}</span>
                            <span>{icon.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="color">Color Theme</Label>
                  <Select value={formData.color} onValueChange={(value) => setFormData(prev => ({ ...prev, color: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {LEVEL_COLORS.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.value}`}></div>
                            <span>{color.label}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goals Section */}
              <div>
                <Label>Goals</Label>
                <div className="space-y-2">
                  {formData.goals.map((goal) => (
                    <div key={goal.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <span className="text-lg">{goal.icon}</span>
                      <span className="flex-1">{goal.description}</span>
                      <Badge variant="outline">{goal.target}</Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeGoal(goal.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Goal description..."
                      value={newGoal.description}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    />
                    <Input
                      type="number"
                      placeholder="Target"
                      value={newGoal.target}
                      onChange={(e) => setNewGoal(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                      className="w-20"
                    />
                    <Button onClick={addGoal} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Rewards Section */}
              <div>
                <Label>Rewards</Label>
                <div className="space-y-2">
                  {formData.rewards.map((reward, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                      <Gift className="h-4 w-4 text-orange-600" />
                      <span className="flex-1">{reward}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeReward(index)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      placeholder="Reward description..."
                      value={newReward}
                      onChange={(e) => setNewReward(e.target.value)}
                    />
                    <Button onClick={addReward} variant="outline">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateLevel}>
                <Save className="h-4 w-4 mr-2" />
                {editingLevel ? 'Update Level' : 'Create Level'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-orange-600" />
            Level Progression System
          </CardTitle>
          <CardDescription>
            Drag and drop to reorder levels. Click the delete button to remove levels.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="levels">
              {(provided) => (
                <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                  {levels.map((level, index) => (
                    <Draggable key={level.level} draggableId={level.level.toString()} index={index}>
                      {(provided, snapshot) => (
                        <motion.div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`border rounded-lg p-4 ${
                            snapshot.isDragging ? 'shadow-lg bg-white' : 'bg-white'
                          }`}
                          whileHover={{ scale: 1.01 }}
                          transition={{ duration: 0.2 }}
                        >
                          <div className="flex items-center gap-4">
                            <div {...provided.dragHandleProps} className="cursor-move">
                              <GripVertical className="h-5 w-5 text-gray-400" />
                            </div>
                            
                            <div className="text-2xl">{level.icon}</div>
                            
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-semibold text-gray-900">
                                  Level {level.level}: {level.name}
                                </h3>
                                <Badge className={level.color}>
                                  {level.pointsRequired} points
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{level.description}</p>
                              
                              <div className="flex items-center gap-4 text-xs text-gray-500">
                                <div className="flex items-center gap-1">
                                  <Target className="h-3 w-3" />
                                  <span>{level.goals.length} goals</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Gift className="h-3 w-3" />
                                  <span>{level.rewards.length} rewards</span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setEditingLevel(level);
                                  setFormData({
                                    name: level.name,
                                    description: level.description,
                                    pointsRequired: level.pointsRequired,
                                    color: level.color,
                                    icon: level.icon,
                                    goals: level.goals,
                                    rewards: level.rewards
                                  });
                                  setShowCreateDialog(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button variant="outline" size="sm">
                                    <Trash2 className="h-4 w-4 text-red-600" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Level</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete "{level.name}"? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={() => handleDeleteLevel(level.level)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </CardContent>
      </Card>
    </div>
  );
} 