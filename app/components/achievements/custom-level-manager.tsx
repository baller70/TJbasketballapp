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
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Edit, Trash2, GripVertical, Save, X } from 'lucide-react';
import { LevelTier, LEVEL_PROGRESSION } from '@/lib/level-progression';

interface CustomLevelManagerProps {
  onLevelsChange?: () => void;
  onLevelsUpdate?: () => Promise<void>;
}

interface LevelGoal {
  id: string;
  description: string;
  target: number;
  icon: string;
  category: 'drills' | 'points' | 'streak' | 'skills' | 'teamwork' | 'consistency';
}

interface EditableLevelTier extends LevelTier {
  isCustom: boolean;
}

const colorOptions = [
  { value: 'bg-gray-100 text-gray-800', label: 'Gray', preview: 'bg-gray-100' },
  { value: 'bg-blue-100 text-blue-800', label: 'Blue', preview: 'bg-blue-100' },
  { value: 'bg-green-100 text-green-800', label: 'Green', preview: 'bg-green-100' },
  { value: 'bg-yellow-100 text-yellow-800', label: 'Yellow', preview: 'bg-yellow-100' },
  { value: 'bg-red-100 text-red-800', label: 'Red', preview: 'bg-red-100' },
  { value: 'bg-purple-100 text-purple-800', label: 'Purple', preview: 'bg-purple-100' },
  { value: 'bg-indigo-100 text-indigo-800', label: 'Indigo', preview: 'bg-indigo-100' },
  { value: 'bg-pink-100 text-pink-800', label: 'Pink', preview: 'bg-pink-100' },
];

const iconOptions = ['🏀', '⭐', '🎯', '🏆', '🔥', '💎', '👑', '🚀', '⚡', '🌟'];

const categoryOptions = [
  { value: 'drills', label: 'Drills' },
  { value: 'points', label: 'Points' },
  { value: 'streak', label: 'Streak' },
  { value: 'skills', label: 'Skills' },
  { value: 'teamwork', label: 'Teamwork' },
  { value: 'consistency', label: 'Consistency' },
];

export default function CustomLevelManager({ onLevelsChange, onLevelsUpdate }: CustomLevelManagerProps) {
  const [levels, setLevels] = useState<EditableLevelTier[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingLevel, setEditingLevel] = useState<EditableLevelTier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    pointsRequired: 0,
    color: 'bg-blue-100 text-blue-800',
    icon: '🏀',
    rewards: [''],
    goals: Array(10).fill(null).map((_, index) => ({
      id: `goal-${index + 1}`,
      description: index === 9 ? 'Complete Level Assessment Test' : '',
      target: 1,
      icon: index === 9 ? '🏆' : '🎯',
      category: 'skills' as LevelGoal['category'],
    })) as LevelGoal[],
  });

  useEffect(() => {
    loadLevels();
  }, []);

  const loadLevels = async () => {
    try {
      const response = await fetch('/api/custom-levels');
      if (response.ok) {
        const data = await response.json();
        setLevels(data.levels);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const items = Array.from(levels);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update level numbers based on new order
    const updatedItems = items.map((item, index) => ({
      ...item,
      level: index + 1,
    }));

    setLevels(updatedItems);

    try {
      await fetch('/api/custom-levels', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reorder', levels: updatedItems }),
      });
      onLevelsChange?.();
      onLevelsUpdate?.();
    } catch (error) {
      loadLevels();
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('/api/custom-levels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        loadLevels();
        setShowCreateDialog(false);
        resetForm();
        onLevelsChange?.();
        onLevelsUpdate?.();
      }
    } catch (error) {
    }
  };

  const handleEdit = async () => {
    if (!editingLevel) return;

    try {
      const response = await fetch('/api/custom-levels', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'edit',
          level: editingLevel.level,
          ...formData,
        }),
      });

      if (response.ok) {
        loadLevels();
        setShowEditDialog(false);
        setEditingLevel(null);
        resetForm();
        onLevelsChange?.();
        onLevelsUpdate?.();
      }
    } catch (error) {
    }
  };

  const handleDelete = async (level: EditableLevelTier) => {
    if (!level.isCustom) {
      alert('Cannot delete default levels');
      return;
    }

    try {
      const response = await fetch('/api/custom-levels', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ level: level.level }),
      });

      if (response.ok) {
        loadLevels();
        onLevelsChange?.();
        onLevelsUpdate?.();
      }
    } catch (error) {
    }
  };

  const openEditDialog = (level: EditableLevelTier) => {
    setEditingLevel(level);
    setFormData({
      name: level.name,
      description: level.description,
      pointsRequired: level.pointsRequired,
      color: level.color,
      icon: level.icon,
      rewards: level.rewards.length > 0 ? level.rewards : [''],
      goals: level.goals.length === 10 ? level.goals : [
        ...level.goals,
        ...Array(10 - level.goals.length).fill(null).map((_, index) => ({
          id: `goal-${level.goals.length + index + 1}`,
          description: level.goals.length + index === 9 ? 'Complete Level Assessment Test' : '',
          target: 1,
          icon: level.goals.length + index === 9 ? '🏆' : '🎯',
          category: 'skills' as LevelGoal['category'],
        })),
      ],
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      pointsRequired: 0,
      color: 'bg-blue-100 text-blue-800',
      icon: '🏀',
      rewards: [''],
      goals: Array(10).fill(null).map((_, index) => ({
        id: `goal-${index + 1}`,
        description: index === 9 ? 'Complete Level Assessment Test' : '',
        target: 1,
        icon: index === 9 ? '🏆' : '🎯',
        category: 'skills' as LevelGoal['category'],
      })) as LevelGoal[],
    });
  };

  const updateGoal = (index: number, field: keyof LevelGoal, value: any) => {
    const newGoals = [...formData.goals];
    newGoals[index] = { ...newGoals[index], [field]: value };
    setFormData({ ...formData, goals: newGoals });
  };

  const updateReward = (index: number, value: string) => {
    const newRewards = [...formData.rewards];
    newRewards[index] = value;
    setFormData({ ...formData, rewards: newRewards });
  };

  const addReward = () => {
    setFormData({ ...formData, rewards: [...formData.rewards, ''] });
  };

  const removeReward = (index: number) => {
    const newRewards = formData.rewards.filter((_, i) => i !== index);
    setFormData({ ...formData, rewards: newRewards });
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
          <p className="text-gray-600">Create, edit, and manage progression levels</p>
        </div>
        <Button
          onClick={() => setShowCreateDialog(true)}
          className="bg-orange-600 hover:bg-orange-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Level
        </Button>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="levels">
          {(provided) => (
            <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
              {levels.map((level, index) => (
                <Draggable key={level.level} draggableId={level.level.toString()} index={index}>
                  {(provided, snapshot) => (
                    <Card
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      className={`${snapshot.isDragging ? 'shadow-lg' : ''} border-orange-100`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div {...provided.dragHandleProps}>
                              <GripVertical className="h-5 w-5 text-gray-400 cursor-move" />
                            </div>
                            <Badge className={level.color}>
                              {level.icon} Level {level.level}
                            </Badge>
                            <div>
                              <CardTitle className="text-lg">{level.name}</CardTitle>
                              <CardDescription>{level.description}</CardDescription>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditDialog(level)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {level.isCustom && (
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
                                    <AlertDialogAction onClick={() => handleDelete(level)}>
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            )}
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-600 mb-2">Points Required: {level.pointsRequired}</p>
                            <div className="space-y-1">
                              <p className="text-sm font-medium">Goals ({level.goals.length}/10):</p>
                              {level.goals.slice(0, 3).map((goal, i) => (
                                <p key={i} className="text-xs text-gray-600">
                                  {goal.icon} {goal.description}
                                </p>
                              ))}
                              {level.goals.length > 3 && (
                                <p className="text-xs text-gray-500">... and {level.goals.length - 3} more</p>
                              )}
                            </div>
                          </div>
                          <div>
                            <p className="text-sm font-medium mb-2">Rewards:</p>
                            <div className="space-y-1">
                              {level.rewards.slice(0, 2).map((reward, i) => (
                                <p key={i} className="text-xs text-gray-600">• {reward}</p>
                              ))}
                              {level.rewards.length > 2 && (
                                <p className="text-xs text-gray-500">... and {level.rewards.length - 2} more</p>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      {/* Create Level Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Level</DialogTitle>
            <DialogDescription>
              Create a custom level with 10 goals. The last goal will automatically be a test.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Level Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Advanced Player"
                />
              </div>
              <div>
                <Label htmlFor="points">Points Required</Label>
                <Input
                  id="points"
                  type="number"
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this level..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Color Theme</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.preview}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Goals (10 required)</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded">
                    <div className="col-span-1 text-center font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder={index === 9 ? "Test description (required)" : "Goal description"}
                        value={goal.description}
                        onChange={(e) => updateGoal(index, 'description', e.target.value)}
                        disabled={index === 9}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Target"
                        value={goal.target}
                        onChange={(e) => updateGoal(index, 'target', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={goal.icon} 
                        onValueChange={(value) => updateGoal(index, 'icon', value)}
                        disabled={index === 9}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={goal.category} 
                        onValueChange={(value) => updateGoal(index, 'category', value)}
                        disabled={index === 9}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Rewards</Label>
              <div className="space-y-2">
                {formData.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Reward description"
                      value={reward}
                      onChange={(e) => updateReward(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeReward(index)}
                      disabled={formData.rewards.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReward}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreate}>
              <Save className="h-4 w-4 mr-2" />
              Create Level
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Level Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Level: {editingLevel?.name}</DialogTitle>
            <DialogDescription>
              {editingLevel?.isCustom ? 'Edit this custom level' : 'Edit this default level'}. Each level must have exactly 10 goals with the last one being a test.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-name">Level Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Advanced Player"
                />
              </div>
              <div>
                <Label htmlFor="edit-points">Points Required</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={formData.pointsRequired}
                  onChange={(e) => setFormData({ ...formData, pointsRequired: parseInt(e.target.value) || 0 })}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe this level..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label>Color Theme</Label>
                <Select value={formData.color} onValueChange={(value) => setFormData({ ...formData, color: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {colorOptions.map((color) => (
                      <SelectItem key={color.value} value={color.value}>
                        <div className="flex items-center gap-2">
                          <div className={`w-4 h-4 rounded ${color.preview}`} />
                          {color.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Icon</Label>
                <Select value={formData.icon} onValueChange={(value) => setFormData({ ...formData, icon: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {iconOptions.map((icon) => (
                      <SelectItem key={icon} value={icon}>
                        {icon}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Goals (10 required)</Label>
              <div className="space-y-3 max-h-60 overflow-y-auto">
                {formData.goals.map((goal, index) => (
                  <div key={index} className="grid grid-cols-12 gap-2 items-center p-3 border rounded">
                    <div className="col-span-1 text-center font-medium text-sm">
                      {index + 1}
                    </div>
                    <div className="col-span-5">
                      <Input
                        placeholder={index === 9 ? "Test description (required)" : "Goal description"}
                        value={goal.description}
                        onChange={(e) => updateGoal(index, 'description', e.target.value)}
                        disabled={index === 9}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Target"
                        value={goal.target}
                        onChange={(e) => updateGoal(index, 'target', parseInt(e.target.value) || 1)}
                        min="1"
                      />
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={goal.icon} 
                        onValueChange={(value) => updateGoal(index, 'icon', value)}
                        disabled={index === 9}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {iconOptions.map((icon) => (
                            <SelectItem key={icon} value={icon}>
                              {icon}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-2">
                      <Select 
                        value={goal.category} 
                        onValueChange={(value) => updateGoal(index, 'category', value)}
                        disabled={index === 9}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categoryOptions.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label>Rewards</Label>
              <div className="space-y-2">
                {formData.rewards.map((reward, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      placeholder="Reward description"
                      value={reward}
                      onChange={(e) => updateReward(index, e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => removeReward(index)}
                      disabled={formData.rewards.length === 1}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addReward}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Reward
                </Button>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}  